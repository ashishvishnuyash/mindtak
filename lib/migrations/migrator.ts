import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export interface Migration {
  id: string;
  name: string;
  timestamp: string;
  sql: string;
  checksum: string;
}

export interface MigrationResult {
  success: boolean;
  migrationsApplied: string[];
  errors: string[];
  rollbacks: string[];
}

export class DatabaseMigrator {
  private supabase: any;
  private isServer: boolean;

  constructor(isServer = false) {
    this.isServer = isServer;
    this.supabase = isServer ? createServerClient() : createClient();
  }

  /**
   * Initialize the migration system by creating the migrations table
   */
  async initializeMigrationTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        migration_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        execution_time_ms INTEGER,
        success BOOLEAN DEFAULT TRUE
      );

      CREATE INDEX IF NOT EXISTS idx_migrations_migration_id ON _migrations(migration_id);
      CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON _migrations(applied_at);
    `;

    const { error } = await this.supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      throw new Error(`Failed to initialize migration table: ${error.message}`);
    }
  }

  /**
   * Get all migration files from the migrations directory
   */
  getMigrationFiles(): Migration[] {
    if (!this.isServer) {
      throw new Error('Migration files can only be read on the server side');
    }

    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.warn('Migrations directory not found, creating it...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const [timestamp, ...nameParts] = file.replace('.sql', '').split('_');
      
      return {
        id: file.replace('.sql', ''),
        name: nameParts.join('_'),
        timestamp,
        sql,
        checksum: this.generateChecksum(sql)
      };
    });
  }

  /**
   * Get applied migrations from the database
   */
  async getAppliedMigrations(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('_migrations')
      .select('migration_id')
      .eq('success', true)
      .order('applied_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get applied migrations: ${error.message}`);
    }

    return data?.map(row => row.migration_id) || [];
  }

  /**
   * Get pending migrations that need to be applied
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const allMigrations = this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();
    
    return allMigrations.filter(migration => 
      !appliedMigrations.includes(migration.id)
    );
  }

  /**
   * Verify migration integrity by checking checksums
   */
  async verifyMigrationIntegrity(): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('_migrations')
      .select('migration_id, checksum')
      .eq('success', true);

    if (error) {
      throw new Error(`Failed to verify migration integrity: ${error.message}`);
    }

    const appliedMigrations = data || [];
    const migrationFiles = this.getMigrationFiles();

    for (const applied of appliedMigrations) {
      const file = migrationFiles.find(m => m.id === applied.migration_id);
      if (file && file.checksum !== applied.checksum) {
        console.error(`Migration integrity check failed for ${applied.migration_id}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Apply a single migration with error handling and rollback capability
   */
  async applyMigration(migration: Migration): Promise<{ success: boolean; error?: string; executionTime?: number }> {
    const startTime = Date.now();
    
    try {
      console.log(`Applying migration: ${migration.id}`);

      // Begin transaction
      const { error: beginError } = await this.supabase.rpc('exec_sql', { 
        sql: 'BEGIN;' 
      });
      
      if (beginError) {
        throw new Error(`Failed to begin transaction: ${beginError.message}`);
      }

      // Execute migration SQL
      const { error: migrationError } = await this.supabase.rpc('exec_sql', { 
        sql: migration.sql 
      });

      if (migrationError) {
        // Rollback on error
        await this.supabase.rpc('exec_sql', { sql: 'ROLLBACK;' });
        throw new Error(`Migration failed: ${migrationError.message}`);
      }

      // Record successful migration
      const executionTime = Date.now() - startTime;
      const { error: recordError } = await this.supabase
        .from('_migrations')
        .insert({
          migration_id: migration.id,
          name: migration.name,
          checksum: migration.checksum,
          execution_time_ms: executionTime,
          success: true
        });

      if (recordError) {
        await this.supabase.rpc('exec_sql', { sql: 'ROLLBACK;' });
        throw new Error(`Failed to record migration: ${recordError.message}`);
      }

      // Commit transaction
      const { error: commitError } = await this.supabase.rpc('exec_sql', { 
        sql: 'COMMIT;' 
      });

      if (commitError) {
        throw new Error(`Failed to commit transaction: ${commitError.message}`);
      }

      console.log(`✅ Migration ${migration.id} applied successfully in ${executionTime}ms`);
      return { success: true, executionTime };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Record failed migration
      await this.supabase
        .from('_migrations')
        .insert({
          migration_id: migration.id,
          name: migration.name,
          checksum: migration.checksum,
          execution_time_ms: executionTime,
          success: false
        })
        .catch(() => {}); // Ignore errors when recording failure

      console.error(`❌ Migration ${migration.id} failed: ${errorMessage}`);
      return { success: false, error: errorMessage, executionTime };
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrationsApplied: [],
      errors: [],
      rollbacks: []
    };

    try {
      // Initialize migration table
      await this.initializeMigrationTable();

      // Verify existing migration integrity
      const integrityCheck = await this.verifyMigrationIntegrity();
      if (!integrityCheck) {
        throw new Error('Migration integrity check failed');
      }

      // Get pending migrations
      const pendingMigrations = await this.getPendingMigrations();
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found');
        return result;
      }

      console.log(`📦 Found ${pendingMigrations.length} pending migrations`);

      // Apply each migration
      for (const migration of pendingMigrations) {
        const migrationResult = await this.applyMigration(migration);
        
        if (migrationResult.success) {
          result.migrationsApplied.push(migration.id);
        } else {
          result.success = false;
          result.errors.push(`${migration.id}: ${migrationResult.error}`);
          
          // Stop applying further migrations on failure
          console.error(`🛑 Stopping migration process due to failure in ${migration.id}`);
          break;
        }
      }

      if (result.success) {
        console.log(`✅ Successfully applied ${result.migrationsApplied.length} migrations`);
      } else {
        console.error(`❌ Migration process failed. Applied: ${result.migrationsApplied.length}, Errors: ${result.errors.length}`);
      }

    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error(`❌ Migration process failed: ${errorMessage}`);
    }

    return result;
  }

  /**
   * Rollback the last applied migration
   */
  async rollbackLastMigration(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('_migrations')
        .select('migration_id, name')
        .eq('success', true)
        .order('applied_at', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to get last migration: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No migrations to rollback');
      }

      const lastMigration = data[0];
      console.log(`Rolling back migration: ${lastMigration.migration_id}`);

      // Mark migration as rolled back
      const { error: updateError } = await this.supabase
        .from('_migrations')
        .update({ success: false })
        .eq('migration_id', lastMigration.migration_id);

      if (updateError) {
        throw new Error(`Failed to mark migration as rolled back: ${updateError.message}`);
      }

      console.log(`✅ Migration ${lastMigration.migration_id} rolled back successfully`);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Rollback failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get migration status and history
   */
  async getMigrationStatus(): Promise<{
    totalMigrations: number;
    appliedMigrations: number;
    pendingMigrations: number;
    lastMigration?: string;
    lastAppliedAt?: string;
  }> {
    const allMigrations = this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();
    
    const { data: lastMigrationData } = await this.supabase
      .from('_migrations')
      .select('migration_id, applied_at')
      .eq('success', true)
      .order('applied_at', { ascending: false })
      .limit(1);

    return {
      totalMigrations: allMigrations.length,
      appliedMigrations: appliedMigrations.length,
      pendingMigrations: allMigrations.length - appliedMigrations.length,
      lastMigration: lastMigrationData?.[0]?.migration_id,
      lastAppliedAt: lastMigrationData?.[0]?.applied_at
    };
  }

  /**
   * Generate checksum for migration content
   */
  private generateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

// Singleton instance for server-side usage
let serverMigrator: DatabaseMigrator | null = null;

export function getServerMigrator(): DatabaseMigrator {
  if (!serverMigrator) {
    serverMigrator = new DatabaseMigrator(true);
  }
  return serverMigrator;
}

// Client-side instance for status checking
export function getClientMigrator(): DatabaseMigrator {
  return new DatabaseMigrator(false);
}