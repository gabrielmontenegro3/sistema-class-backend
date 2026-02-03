import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabaseUrl = env.SUPABASE_URL;

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  // prefer service role se existir
  const key = env.SUPABASE_KEY;
  if (!key) throw new Error('Missing SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY in environment');

  cached = createClient(supabaseUrl, key, {
    auth: { persistSession: false }
  });
  return cached;
}

