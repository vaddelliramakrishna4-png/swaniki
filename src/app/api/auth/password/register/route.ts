import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

import { saveCredential, hasCredential } from '@/lib/credentials-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

/**
 * Deterministic password hash using scrypt.
 * The email acts as a per-user salt.
 * MUST stay in sync with login/route.ts
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
        { success: false, error: 'Full name, email, and password are required', errorType: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters', errorType: 'WEAK_PASSWORD' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name.trim();
    const userHandle = handle ? handle.trim() : normalizedEmail.split('@')[0];

    // ── 0. Check if account already exists (file store) ──
    if (hasCredential(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
          errorType: 'EMAIL_EXISTS',
        },
        { status: 409 }
      );
    }

    // ── 1. ALWAYS save to local file-backed credential store first ──
    // This is the primary, reliable storage that works without any Supabase table.
    const pwdHash = hashPassword(password, normalizedEmail);

    saveCredential(normalizedEmail, {
      pwd_hash: pwdHash,
      name: displayName,
      handle: userHandle,
      phone: phone || '',
      role: role || 'organizer',
    });

    // ── 2. Also try Supabase — best-effort secondary storage ──
    let userId: string | null = null;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to upsert into user_credentials table (may not exist — that's OK)
    try {
      await supabase
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
    } catch (e) {
      // Table doesn't exist — file store is sufficient
      console.warn('[Register] Supabase user_credentials not available (using file store only)');
    }

    // Try Supabase Auth signUp so real JWT sessions work
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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

      if (!signUpError && signUpData?.user) {
        userId = signUpData.user.id;

        // Confirm email immediately if using service role key
        const isUnconfirmed =
          !signUpData.user.email_confirmed_at ||
          (signUpData.user.identities && signUpData.user.identities.length === 0);

        if (isUnconfirmed && userId) {
          try {
            await supabase.auth.admin.updateUserById(userId, {
              email_confirm: true,
              password: password,
            });
            console.log('[Register] Email auto-confirmed for:', normalizedEmail);
          } catch {
            // No service role key — that's fine, file store auth works
          }
        }
      } else if (
        signUpError?.message?.toLowerCase().includes('already registered') ||
        signUpError?.message?.toLowerCase().includes('user already registered')
      ) {
        // Update password for existing Supabase user
        try {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existingUser = listData?.users?.find(
            (u) => u.email?.toLowerCase() === normalizedEmail
          );
          if (existingUser?.id) {
            userId = existingUser.id;
            await supabase.auth.admin.updateUserById(userId, {
              password: password,
              email_confirm: true,
            });
          }
        } catch {
          // Admin API not available — file store auth is sufficient
        }
      }
    } catch (e) {
      console.warn('[Register] Supabase Auth notice:', e);
    }

    const finalUserId = userId || 'usr_' + Date.now();

    // Sync public.profiles (best effort)
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
