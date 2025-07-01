import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { runStartupMigrations } from '@/lib/migrations/startup';

// Track if migrations have been run in this instance
let migrationsRun = false;
let migrationPromise: Promise<void> | null = null;

export async function middleware(request: NextRequest) {
  // Only run migrations once per application instance
  if (!migrationsRun && !migrationPromise) {
    migrationPromise = runMigrations();
  }
  
  // Wait for migrations to complete if they're still running
  if (migrationPromise) {
    try {
      await migrationPromise;
      migrationsRun = true;
      migrationPromise = null;
    } catch (error) {
      console.error('Migration failed in middleware:', error);
      // Continue with the request even if migrations fail
      // This prevents the app from being completely broken
    }
  }

  return NextResponse.next();
}

async function runMigrations(): Promise<void> {
  try {
    await runStartupMigrations();
  } catch (error) {
    console.error('Startup migrations failed:', error);
    // Don't throw here to prevent breaking the entire app
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/migrations (avoid infinite loops)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/migrations|_next/static|_next/image|favicon.ico).*)',
  ],
};