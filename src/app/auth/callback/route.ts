import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const error = requestUrl.searchParams.get('error');

  if (error) {
    console.warn('[auth/callback] Auth error param received:', error);
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}`, requestUrl.origin));
  }

  if (code) {
    try {
      const supabase = createServerSupabaseClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
      console.warn('[auth/callback] exchangeCodeForSession error:', exchangeError.message);
    } catch (err) {
      console.error('[auth/callback] Error exchanging code for session:', err);
    }
  }

  // Fallback cleanly to next destination or home
  return NextResponse.redirect(new URL(next || '/', requestUrl.origin));
}

