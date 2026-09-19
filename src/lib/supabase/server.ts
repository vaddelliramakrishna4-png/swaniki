import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

/** Standard server client (respects RLS, uses anon/publishable key) */
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Admin client using the Service Role Key — bypasses RLS.
 * Use ONLY in server-side API routes for privileged operations
 * (fetching all RSVPs, deleting events on behalf of organizer, etc.).
 * Falls back to anon key if SUPABASE_SERVICE_ROLE_KEY is not set.
 */
export function createAdminSupabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
