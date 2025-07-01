import { getServerMigrator } from './migrator';

/**
 * Run database migrations during application startup
 */
export async function runStartupMigrations(): Promise<void> {
  console.log('🚀 Starting database migration check...');
  
  try {
    const migrator = getServerMigrator();
    const result = await migrator.runMigrations();
    
    if (!result.success) {
      console.error('❌ Database migrations failed:', result.errors);
      throw new Error(`Migration failed: ${result.errors.join(', ')}`);
    }
    
    if (result.migrationsApplied.length > 0) {
      console.log(`✅ Applied ${result.migrationsApplied.length} database migrations`);
    } else {
      console.log('✅ Database is up to date');
    }
    
  } catch (error) {
    console.error('❌ Migration startup failed:', error);
    throw error;
  }
}

/**
 * Check if migrations are needed without applying them
 */
export async function checkMigrationStatus(): Promise<{
  needsMigration: boolean;
  pendingCount: number;
  status: any;
}> {
  try {
    const migrator = getServerMigrator();
    const status = await migrator.getMigrationStatus();
    
    return {
      needsMigration: status.pendingMigrations > 0,
      pendingCount: status.pendingMigrations,
      status
    };
  } catch (error) {
    console.error('Failed to check migration status:', error);
    throw error;
  }
}