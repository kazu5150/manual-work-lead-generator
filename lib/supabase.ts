import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
  }
  return key;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey());
    }
    return (supabaseInstance as unknown as Record<string, unknown>)[prop as string];
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!supabaseAdminInstance) {
      const url = getSupabaseUrl();
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey();
      supabaseAdminInstance = createClient(url, key);
    }
    return (supabaseAdminInstance as unknown as Record<string, unknown>)[prop as string];
  },
});
