import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

/**
 * Deterministic password hash using scrypt.
 * The email acts as a per-user salt so identical passwords for different users
 * produce different hashes.
 */
function hashPassword(password: string, email: string): string {
  const salt = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'vibe-salt-2024') + email.toLowerCase();
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role = 'organizer', handle, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name.trim();
    const userHandle = handle ? handle.trim() : normalizedEmail.split('@')[0];

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── 1. Store password hash in our own table (bypasses Supabase email confirmation) ──
    const pwdHash = hashPassword(password, normalizedEmail);

    const { error: credError } = await supabase
      .from('user_credentials')
      .upsert(
        {
          email: normalizedEmail,
          pwd_hash: pwdHash,
          name: displayName,
          handle: userHandle,
          phone: phone || '',
          role: role || 'organizer',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (credError) {
      console.warn('[Register] user_credentials upsert warning:', credError.message);
      // Don't fail hard – table might not exist yet. Fall through to Supabase signUp.
    }

    // ── 2. Also try Supabase Auth signUp so real sessions work when possible ──
    let userId: string | null = null;
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            full_name: displayName,
            name: displayName,
            role: role || 'organizer',
            handle: userHandle,
            phone: phone || '',
          },
        },
      });

      if (!signUpError && data?.user) {
        userId = data.user.id;
      } else if (signUpError?.message?.toLowerCase().includes('already registered')) {
        // Existing Supabase user – try to sign in to get their ID
        const { data: siData } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        userId = siData?.user?.id || null;
      }
    } catch (e) {
      console.warn('[Register] Supabase Auth signup notice:', e);
    }

    const finalUserId = userId || 'usr_' + Date.now();

    // ── 3. Optionally sync public.profiles ──
    try {
      await supabase.from('profiles').upsert(
        {
          id: finalUserId,
          email: normalizedEmail,
          role: role || 'organizer',
          name: displayName,
          handle: userHandle,
          phone: phone || '',
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: finalUserId,
        email: normalizedEmail,
        role: role || 'organizer',
        name: displayName,
        handle: userHandle,
      },
    });
  } catch (err: any) {
    console.error('Password register route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
