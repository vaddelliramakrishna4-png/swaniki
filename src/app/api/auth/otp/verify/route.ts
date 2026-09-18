import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { verifyOtp } from '@/lib/otp-store';
import { verifyStatelessTokens } from '@/lib/serverless-otp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, verificationToken, role = 'organizer', name, handle } = body;

    if (!email || !token) {
      return NextResponse.json({ success: false, error: 'Email and 6-digit code are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanToken = token.trim().replace(/\D/g, '');

    // Collect candidate verification tokens from body and HTTP cookie (for Vercel serverless functions)
    const cookieToken = req.cookies.get('vibe_otp_token')?.value;
    const tokensToCheck = [
      ...(Array.isArray(verificationToken) ? verificationToken : [verificationToken]),
      cookieToken,
    ].filter(Boolean) as string[];

    let isValid = false;
    let checkError: string | undefined = undefined;

    // 1. Primary: Verify stateless HMAC token (instant, stateless, 100% reliable on Vercel)
    if (tokensToCheck.length > 0) {
      const statelessCheck = verifyStatelessTokens(normalizedEmail, cleanToken, tokensToCheck);
      if (statelessCheck.valid) {
        isValid = true;
      } else {
        checkError = statelessCheck.error;
      }
    }

    // 2. Secondary: Fallback to local memory / file store (for Localhost)
    if (!isValid) {
      const storeCheck = verifyOtp(normalizedEmail, cleanToken);
      if (storeCheck.valid) {
        isValid = true;
      } else if (!checkError) {
        checkError = storeCheck.error;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            checkError ||
            'Invalid 6-digit verification code. Please check the code in your email or click "Resend code".',
        },
        { status: 400 }
      );
    }

    // Upsert or create user / profile in public.profiles (if table exists)
    const displayName = name || normalizedEmail.split('@')[0];
    const userHandle = handle || normalizedEmail.split('@')[0];
    let profileId: string | undefined = undefined;

    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingProfile?.id) {
        profileId = existingProfile.id;
        await supabase
          .from('profiles')
          .update({ role: 'organizer' })
          .eq('id', profileId);
      } else {
        const { data: inserted } = await supabase
          .from('profiles')
          .insert([
            {
              email: normalizedEmail,
              role: 'organizer',
              name: displayName,
              handle: userHandle,
            },
          ])
          .select()
          .maybeSingle();

        if (inserted?.id) {
          profileId = inserted.id;
        }
      }
    } catch (profErr) {
      console.warn('[Profile lookup notice]:', profErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profileId || 'usr_' + Date.now(),
        email: normalizedEmail,
        role: 'organizer',
        name: displayName,
        handle: userHandle,
      },
    });
  } catch (err: any) {
    console.error('OTP Verify Route Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
