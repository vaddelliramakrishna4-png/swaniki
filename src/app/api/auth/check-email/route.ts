import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { hasCredential } from '@/lib/credentials-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 * Returns: { exists: boolean }
 *
 * Checks all credential stores (file store → Supabase table → Supabase Auth)
 * so the signup form can show "Email already exists" before wasting an OTP send.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check file-backed credential store (fastest, primary)
    if (hasCredential(normalizedEmail)) {
      return NextResponse.json({ exists: true });
    }

    // 2. Check Supabase user_credentials table (secondary)
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: credRow } = await supabase
        .from('user_credentials')
        .select('email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (credRow) {
        return NextResponse.json({ exists: true });
      }
    } catch {
      // Table doesn't exist — continue
    }

    // 3. Check Supabase Auth (for OAuth/magic-link users)
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existsInSupabase = listData?.users?.some(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );
      if (existsInSupabase) {
        return NextResponse.json({ exists: true });
      }
    } catch {
      // Admin API not available
    }

    return NextResponse.json({ exists: false });
  } catch (err: any) {
    console.error('Check email error:', err);
    return NextResponse.json({ exists: false });
  }
}
