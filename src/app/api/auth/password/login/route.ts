import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fccdvpgcgvmekbfsfnfn.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xvaLdscmFdNyY08rdO2kHA_lI37QwpN';

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

    // 1. Authenticate with Supabase Auth
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    if (error) {
      console.warn('[Password Login Notice]:', error.message);
      return NextResponse.json(
        {
          success: false,
          error:
            error.message.toLowerCase().includes('invalid login credentials')
              ? 'Invalid email or password. Please check your credentials.'
              : error.message,
        },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate user.' },
        { status: 401 }
      );
    }

    const userMeta = data.user.user_metadata || {};
    const displayName = userMeta.full_name || userMeta.name || normalizedEmail.split('@')[0];
    const userHandle = userMeta.handle || normalizedEmail.split('@')[0];
    const userRole = userMeta.role || 'organizer';

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
  } catch (err: any) {
    console.error('Password login route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
