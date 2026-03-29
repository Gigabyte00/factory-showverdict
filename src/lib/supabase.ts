import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// ============================================================================
// Environment Validation
// ============================================================================

function getEnvVar(name: string, required = true): string {
  const value = process.env[name];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || '';
}

// ============================================================================
// Supabase Client Factory
// ============================================================================

let browserClient: SupabaseClient<Database> | null = null;
let serverClient: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client for browser/client-side usage
 * Uses anon key with RLS enforcement
 */
export function createBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

/**
 * Get Supabase client for server-side usage
 * Uses service role key - bypasses RLS (use carefully!)
 */
export function createServerClient(): SupabaseClient<Database> {
  if (serverClient) return serverClient;

  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  serverClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}

// ============================================================================
// Type-safe Query Helpers
// ============================================================================

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Helper to get typed table reference
 */
export function getTable<T extends keyof Database['public']['Tables']>(
  client: TypedSupabaseClient,
  table: T
) {
  return client.from(table);
}
