import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { verifyOtp } from '@/lib/otp-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

export async function POST(req: NextRequest) {
  try {
    const { email, token, role = 'organizer', name, handle } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ success: false, error: 'Email and 6-digit code are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    // Verify token using shared cross-worker file store
    const check = verifyOtp(normalizedEmail, cleanToken);
    if (!check.valid) {
      return NextResponse.json({ success: false, error: check.error || 'Invalid verification code.' }, { status: 400 });
    }

    // Initialize Supabase admin/server client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert or create user / profile in public.profiles
    const displayName = name || normalizedEmail.split('@')[0];
    const userHandle = handle || normalizedEmail.split('@')[0];

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    let profileId = existingProfile?.id;

    if (!profileId) {
      // Try to insert new profile
      const { data: inserted, error: insertError } = await supabase
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

      if (inserted) {
        profileId = inserted.id;
      } else if (insertError) {
        console.warn('Profile insert warning:', insertError.message);
      }
    } else {
      // Update role to organizer as requested
      await supabase
        .from('profiles')
        .update({ role: 'organizer' })
        .eq('id', profileId);
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
