import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

import { getCredential, hasCredential } from '@/lib/credentials-store';

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
        { success: false, error: 'Email and password are required', errorType: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Path 1: Check our file-backed credential store (primary, always reliable) ──
    const localCred = getCredential(normalizedEmail);

    if (localCred) {
      const expectedHash = hashPassword(password, normalizedEmail);

      if (localCred.pwd_hash === expectedHash) {
        // ✅ Password matches — authenticate from local store
        console.log('[Login] File store auth success for:', normalizedEmail);

        // Try Supabase Auth for a real session (best-effort)
        let supaSession = null;
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: siData } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          supaSession = siData?.session || null;
        } catch {}

        return NextResponse.json({
          success: true,
          user: {
            id: 'usr_local_' + Buffer.from(normalizedEmail).toString('hex').slice(0, 12),
            email: normalizedEmail,
            role: localCred.role || 'organizer',
            name: localCred.name || normalizedEmail.split('@')[0],
            handle: localCred.handle || normalizedEmail.split('@')[0],
            phone: localCred.phone || '',
          },
          session: supaSession,
        });
      } else {
        // Email found but password is wrong
        console.warn('[Login] Incorrect password for:', normalizedEmail);
        return NextResponse.json(
          {
            success: false,
            error: 'Incorrect password. Please try again.',
            errorType: 'WRONG_PASSWORD',
          },
          { status: 401 }
        );
      }
    }

    // ── Path 2: Not in file store — try Supabase user_credentials table ──
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: credRow } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (credRow) {
        const expectedHash = hashPassword(password, normalizedEmail);

        if (credRow.pwd_hash === expectedHash) {
          console.log('[Login] Supabase user_credentials match for:', normalizedEmail);
          return NextResponse.json({
            success: true,
            user: {
              id: credRow.id || 'usr_' + Date.now(),
              email: normalizedEmail,
              role: credRow.role || 'organizer',
              name: credRow.name || normalizedEmail.split('@')[0],
              handle: credRow.handle || normalizedEmail.split('@')[0],
              phone: credRow.phone || '',
            },
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Incorrect password. Please try again.',
              errorType: 'WRONG_PASSWORD',
            },
            { status: 401 }
          );
        }
      }
    } catch {
      // user_credentials table doesn't exist — that's fine
    }

    // ── Path 3: Try Supabase Auth directly (for OAuth / magic-link users) ──
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (!error && data?.user) {
        const userMeta = data.user.user_metadata || {};
        console.log('[Login] Supabase Auth direct success for:', normalizedEmail);
        return NextResponse.json({
          success: true,
          user: {
            id: data.user.id,
            email: normalizedEmail,
            role: userMeta.role || 'organizer',
            name: userMeta.full_name || userMeta.name || normalizedEmail.split('@')[0],
            handle: userMeta.handle || normalizedEmail.split('@')[0],
          },
          session: data.session,
        });
      }
    } catch {}

    // ── No account found in any storage ──
    console.warn('[Login] No account found for:', normalizedEmail);
    return NextResponse.json(
      {
        success: false,
        error: 'No account found with this email. Would you like to create one?',
        errorType: 'NOT_FOUND',
      },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('Password login route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
