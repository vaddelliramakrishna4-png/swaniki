'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  ArrowLeft,
  UserCheck,
  Crown,
  Ticket,
  User,
  ShieldCheck,
  Phone,
  AtSign,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/lib/auth-context';
import { Suspense } from 'react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialRole = (searchParams.get('role') as 'organizer' | 'guest') || 'organizer';
  const redirectTo = searchParams.get('redirect') || '';

  const {
    signInWithEmail,
    signUpWithEmail,
    verifyEmailOtp,
    profile,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<'organizer' | 'guest'>('organizer');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [handle, setHandle] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, show existing status
  useEffect(() => {
    if (profile && step !== 'success') {
      // Allow staying or redirect
    }
  }, [profile, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      const res = await signUpWithEmail({
        email: email.trim(),
        name: name.trim(),
        role: 'organizer',
        handle: handle.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setLoading(false);

      if (res.success) {
        setStep('otp');
        setMessage(`Verification code dispatched to ${email.trim()}. Please check your inbox.`);
      } else {
        setError(res.error || 'Failed to create account. Please try again.');
      }
    } else {
      // Sign in
      const res = await signInWithEmail(email.trim(), 'organizer');
      setLoading(false);

      if (res.success) {
        setStep('otp');
        setMessage(`We've sent a 6-digit login verification code to ${email.trim()}`);
      } else {
        setError(res.error || 'Failed to dispatch login code. Please check your email address.');
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setLoading(true);
    setError(null);

    const res = await verifyEmailOtp(email.trim(), otpCode.trim(), {
      role: 'organizer',
      name: name.trim() || undefined,
      handle: handle.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      setStep('success');
      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    } else {
      setError(res.error || 'Invalid verification code. Please check the 6-digit code sent to your email.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col parchment-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8E4DF] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
          {/* Logo Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-11 h-11 rounded-xl bg-[#1A1A2E] text-[#C9A84C] font-serif font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
              V
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1A1A2E]">
              {step === 'success'
                ? 'Welcome to Vibe'
                : mode === 'signup'
                ? 'Create Your Vibe Account'
                : 'Sign In to Vibe'}
            </h1>
            <p className="text-xs text-[#4B4B4B]">
              {step === 'success'
                ? 'Redirecting to your dashboard...'
                : mode === 'signup'
                ? 'Join curated gatherings or host bespoke salons across India'
                : 'Access your event passes, guest tickets, or host portal'}
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Sign Up */}
          {step === 'form' && (
            <div className="flex p-1 bg-[#F0EDE8] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#1A1A2E] shadow-xs'
                    : 'text-[#8A8A8A] hover:text-[#1A1A2E]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#1A1A2E] shadow-xs'
                    : 'text-[#8A8A8A] hover:text-[#1A1A2E]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Role Switcher */}
          {step === 'form' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A]">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    role === 'organizer'
                      ? 'border-[#1A1A2E] bg-[#1A1A2E]/5 ring-1 ring-[#1A1A2E]'
                      : 'border-[#E8E4DF] bg-[#F9F7F4] hover:border-[#C8C4BF]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Crown className={`w-3.5 h-3.5 ${role === 'organizer' ? 'text-[#C9A84C]' : 'text-[#8A8A8A]'}`} />
                    <span className="text-xs font-bold text-[#1A1A2E]">Host Events</span>
                  </div>
                  <span className="text-[10px] text-[#8A8A8A] leading-tight">
                    Create salons &amp; manage guests
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('guest')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    role === 'guest'
                      ? 'border-[#1A1A2E] bg-[#1A1A2E]/5 ring-1 ring-[#1A1A2E]'
                      : 'border-[#E8E4DF] bg-[#F9F7F4] hover:border-[#C8C4BF]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Ticket className={`w-3.5 h-3.5 ${role === 'guest' ? 'text-[#1A7A4A]' : 'text-[#8A8A8A]'}`} />
                    <span className="text-xs font-bold text-[#1A1A2E]">Attend as Guest</span>
                  </div>
                  <span className="text-[10px] text-[#8A8A8A] leading-tight">
                    View passes &amp; sync calendars
                  </span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[#FEF0E7] border border-[#E8621A]/30 text-xs text-[#D45510] rounded-xl flex items-start gap-2">
              <span className="font-bold">Notice:</span> {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-[#E8F5EE] border border-[#1A7A4A]/20 text-xs text-[#1A7A4A] rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1A7A4A] shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.form
                key="form-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Full Name for Sign Up */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={role === 'guest' ? 'Priya Sharma' : 'Swaniki Founder'}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'guest' ? 'guest@techfest.in' : 'host@swaniki.com'}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Additional Details for Sign Up */}
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91..."
                          className="w-full pl-8 pr-3 py-2 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                        Handle (Optional)
                      </label>
                      <div className="relative">
                        <AtSign className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder={role === 'guest' ? 'priya' : 'swaniki'}
                          className="w-full pl-8 pr-3 py-2 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Accent Button: Reserved strictly for primary CTA */}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Send Magic Link &amp; OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#8A8A8A]">
                  Passwordless authentication with secure Supabase magic link and OTP.
                </p>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1A1A2E]">
                      6-Digit Security Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="text-xs text-[#8A8A8A] hover:text-[#1A1A2E] flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change email
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-3 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-center tracking-[0.4em] font-mono text-lg font-bold text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#8A8A8A] mt-1.5 flex items-center gap-1">
                    <span>Check your email inbox for the 6-digit security code.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Code &amp; Continue</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-[#E8F5EE] border border-[#1A7A4A]/30 text-[#1A7A4A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#1A1A2E]">
                  Authentication Successful
                </h3>
                <p className="text-xs text-[#4B4B4B]">
                  Signed in as <span className="font-semibold text-[#1A1A2E]">{role === 'guest' ? 'Guest Attendee' : 'Gathering Host'}</span>. Loading your portal...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center parchment-bg">
          <div className="w-8 h-8 rounded-full border-2 border-[#1A1A2E] border-t-[#C9A84C] animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}

