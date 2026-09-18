'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  role: 'organizer' | 'guest';
  phone?: string;
  avatar_url?: string;
  bio?: string;
}

// Backward compatibility alias
export type OrganizerProfile = UserProfile;

interface SignUpParams {
  email: string;
  name: string;
  role: 'organizer' | 'guest';
  handle?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, role?: 'organizer' | 'guest') => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (
    email: string,
    token: string,
    meta?: { role?: 'organizer' | 'guest'; name?: string; handle?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: 'organizer' | 'guest') => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_PROFILE = 'vibe_auth_profile';
const STORAGE_KEY_ROLE = 'vibe_user_role';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            id: parsed.id,
            email: parsed.email,
            app_metadata: {},
            user_metadata: {
              full_name: parsed.name,
              name: parsed.name,
              role: parsed.role,
              handle: parsed.handle,
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as any;
        }
      } catch {}
    }
    return null;
  });

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync profile state with local persistence and user state
  const saveProfileLocally = (prof: UserProfile | null) => {
    setProfile(prof);
    if (prof) {
      setUser({
        id: prof.id,
        email: prof.email,
        app_metadata: {},
        user_metadata: {
          full_name: prof.name,
          name: prof.name,
          role: prof.role,
          handle: prof.handle,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(prof));
        localStorage.setItem(STORAGE_KEY_ROLE, prof.role);
        localStorage.setItem('vibe_viewer_email', prof.email);
        if (prof.role === 'guest') {
          localStorage.setItem('vibe_guest_email', prof.email);
        }
      }
    } else {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_PROFILE);
        localStorage.removeItem(STORAGE_KEY_ROLE);
        localStorage.removeItem('vibe_viewer_email');
        localStorage.removeItem('vibe_guest_email');
      }
    }
  };

  useEffect(() => {
    // 1. Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        setUser(session.user);
        const email = session.user.email || '';
        const meta = session.user.user_metadata || {};
        const determinedRole = meta.role || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ROLE) : 'organizer') || 'organizer';

        const newProfile: UserProfile = {
          id: session.user.id,
          name: meta.full_name || meta.name || email.split('@')[0] || (determinedRole === 'guest' ? 'Guest Attendee' : 'Gathering Host'),
          email,
          handle: meta.handle || email.split('@')[0] || 'member',
          role: (determinedRole as 'organizer' | 'guest'),
          phone: meta.phone || '',
          avatar_url: meta.avatar_url || '',
        };
        saveProfileLocally(newProfile);
      } else if (typeof window !== 'undefined') {
        // Fallback to locally stored active profile
        const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setProfile(parsed);
            setUser({
              id: parsed.id,
              email: parsed.email,
              app_metadata: {},
              user_metadata: {
                full_name: parsed.name,
                name: parsed.name,
                role: parsed.role,
                handle: parsed.handle,
              },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as any);
          } catch (e) {
            console.error('Failed to parse cached profile', e);
          }
        }
      }
      setLoading(false);
    });

    // 2. Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (session?.user) {
        setUser(session.user);
        const email = session.user.email || '';
        const meta = session.user.user_metadata || {};
        const cachedRole = (typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY_ROLE) as 'organizer' | 'guest') : null);
        const determinedRole = meta.role || cachedRole || 'organizer';

        const newProfile: UserProfile = {
          id: session.user.id,
          name: meta.full_name || meta.name || email.split('@')[0] || (determinedRole === 'guest' ? 'Guest Attendee' : 'Gathering Host'),
          email,
          handle: meta.handle || email.split('@')[0] || 'member',
          role: determinedRole,
          phone: meta.phone || '',
          avatar_url: meta.avatar_url || '',
        };
        saveProfileLocally(newProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY_PROFILE);
          localStorage.removeItem(STORAGE_KEY_ROLE);
        }
      } else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setProfile(parsed);
            setUser({
              id: parsed.id,
              email: parsed.email,
              app_metadata: {},
              user_metadata: {
                full_name: parsed.name,
                name: parsed.name,
                role: parsed.role,
                handle: parsed.handle,
              },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as any);
          } catch {
            // Keep existing state
          }
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Passwordless OTP sign in
  const signInWithEmail = async (email: string, role: 'organizer' | 'guest' = 'organizer') => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ROLE, role);
      }

      // 1. Dispatch custom 6-digit code to shared store & Resend/Nodemailer
      let customSent = false;
      try {
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, role }),
        });
        const resData = await res.json();
        customSent = !!resData?.success;
      } catch (e) {
        console.warn('Pre-dispatch custom OTP error:', e);
      }

      // 2. Also trigger Supabase Auth OTP
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
          data: {
            role,
          },
        },
      });

      if (error && !customSent) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch verification code' };
    }
  };

  // Sign up with full details
  const signUpWithEmail = async ({ email, name, role, handle, phone }: SignUpParams) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ROLE, role);
      }

      // 1. Dispatch custom 6-digit code to shared store & Resend/Nodemailer
      let customSent = false;
      try {
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, role }),
        });
        const resData = await res.json();
        customSent = !!resData?.success;
      } catch (e) {
        console.warn('Pre-dispatch custom OTP error on signup:', e);
      }

      // 2. Also trigger Supabase Auth OTP
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            role,
            handle: handle || normalizedEmail.split('@')[0],
            phone: phone || '',
          },
        },
      });

      if (error && !customSent) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  // Verify OTP
  const verifyEmailOtp = async (
    email: string,
    token: string,
    meta?: { role?: 'organizer' | 'guest'; name?: string; handle?: string }
  ) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const cleanToken = token.trim();

      // 1. First attempt standard Supabase OTP verification
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanToken,
        type: 'email',
      });

      let verifiedUserId: string | null = data?.user?.id || null;
      const finalRole: 'organizer' | 'guest' = 'organizer'; // Ensure organizer role on login

      if (error) {
        // 2. If Supabase verify failed, try custom server verification endpoint (Resend/Nodemailer codes)
        try {
          const customRes = await fetch('/api/auth/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: normalizedEmail,
              token: cleanToken,
              role: finalRole,
              name: meta?.name,
              handle: meta?.handle,
            }),
          });
          const customData = await customRes.json();
          if (customData.success && customData.user) {
            verifiedUserId = customData.user.id;
          } else {
            return {
              success: false,
              error: customData.error || error.message || 'Invalid verification code',
            };
          }
        } catch {
          return { success: false, error: error.message || 'Failed to verify verification code' };
        }
      }

      if (verifiedUserId) {
        // Create or update the record in public.profiles (id, email, role: 'organizer')
        try {
          await supabase.from('profiles').upsert(
            {
              id: verifiedUserId,
              email: normalizedEmail,
              role: 'organizer',
              name: meta?.name || data?.user?.user_metadata?.full_name || normalizedEmail.split('@')[0],
              handle: meta?.handle || data?.user?.user_metadata?.handle || normalizedEmail.split('@')[0],
              created_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profErr) {
          console.warn('Profile sync notice:', profErr);
        }

        const newProf: UserProfile = {
          id: verifiedUserId,
          name: meta?.name || data?.user?.user_metadata?.full_name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          handle: meta?.handle || data?.user?.user_metadata?.handle || normalizedEmail.split('@')[0],
          role: 'organizer',
          phone: data?.user?.user_metadata?.phone || '',
        };
        saveProfileLocally(newProf);
        setUser({
          id: verifiedUserId,
          email: normalizedEmail,
          app_metadata: {},
          user_metadata: {
            full_name: newProf.name,
            name: newProf.name,
            role: 'organizer',
            handle: newProf.handle,
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as any);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to verify OTP code' };
    }
  };

  // Switch role between Organizer and Guest easily
  const switchRole = (newRole: 'organizer' | 'guest') => {
    if (!profile) return;
    const updated = { ...profile, role: newRole };
    saveProfileLocally(updated);
  };

  // Update profile attributes
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    saveProfileLocally(updated);
  };

  // Sign out cleanly
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored if offline
    }
    setUser(null);
    setSession(null);
    saveProfileLocally(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        verifyEmailOtp,
        switchRole,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
