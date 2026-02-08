/**
 * Custom Supabase client wrapper that uses dynamic storage
 * based on "remember me" preference
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { customAuthStorage } from '@/lib/authStorage';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client with custom storage that respects "remember me" preference
 * - When remember_me = true: uses localStorage (persistent across browser restarts)
 * - When remember_me = false: uses sessionStorage (cleared on browser close)
 */
let _customClient: ReturnType<typeof createClient<Database>> | null = null;

function getCustomClient() {
  if (!_customClient) {
    _customClient = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: customAuthStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
  }
  return _customClient;
}

// Proxy that lazily initializes the client only when accessed
// This prevents SSR issues with sessionStorage
export const supabaseWithCustomStorage = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getCustomClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
