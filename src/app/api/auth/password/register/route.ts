import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

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

    // 1. Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
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

    let userId = data?.user?.id;

    if (error) {
      // If user already exists, attempt to update credentials or check
      if (error.message.toLowerCase().includes('already registered')) {
        // Sign in to verify password if already registered
        const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });
        if (signData?.user) {
          userId = signData.user.id;
        } else {
          return NextResponse.json(
            { success: false, error: 'An account with this email already exists. Please sign in with your password.' },
            { status: 400 }
          );
        }
      } else {
        console.warn('[Supabase SignUp Warning]:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    const finalUserId = userId || 'usr_' + Date.now();

    // 2. Optionally upsert public.profiles
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
      session: data?.session || null,
    });
  } catch (err: any) {
    console.error('Password register route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
