import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

/**
 * Same deterministic hash used in register/route.ts.
 * MUST stay in sync with that file.
 */
function hashPassword(password: string, email: string): string {
  const salt = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'vibe-salt-2024') + email.toLowerCase();
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Path 1: Supabase Auth signInWithPassword (works when email is confirmed) ──
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    if (!error && data?.user) {
      const userMeta = data.user.user_metadata || {};
      const displayName = userMeta.full_name || userMeta.name || normalizedEmail.split('@')[0];
      const userHandle = userMeta.handle || normalizedEmail.split('@')[0];
      const userRole = userMeta.role || 'organizer';

      console.log('[Password Login] Supabase Auth success');
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: normalizedEmail,
          role: userRole,
          name: displayName,
          handle: userHandle,
        },
        session: data.session,
      });
    }

    console.warn('[Password Login] Supabase Auth failed, falling back to user_credentials table:', error?.message);

    // ── Path 2: Fallback – verify against our own hashed credential table ──
    const expectedHash = hashPassword(password, normalizedEmail);

    const { data: credRow, error: credError } = await supabase
      .from('user_credentials')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (credError || !credRow) {
      // No record found in either system
      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please check your credentials.' },
        { status: 401 }
      );
    }

    if (credRow.pwd_hash !== expectedHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password. Please check your credentials.' },
        { status: 401 }
      );
    }

    // ✅ Hash matched — user is authenticated
    console.log('[Password Login] user_credentials table match for:', normalizedEmail);
    return NextResponse.json({
      success: true,
      user: {
        id: 'usr_cred_' + Date.now(),
        email: normalizedEmail,
        role: credRow.role || 'organizer',
        name: credRow.name || normalizedEmail.split('@')[0],
        handle: credRow.handle || normalizedEmail.split('@')[0],
        phone: credRow.phone || '',
      },
    });
  } catch (err: any) {
    console.error('Password login route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
