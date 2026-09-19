'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  ArrowLeft,
  Crown,
  Ticket,
  User,
  ShieldCheck,
  Phone,
  AtSign,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/lib/auth-context';
import { Suspense } from 'react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const redirectTo = searchParams.get('redirect') || '';

  const {
    signInWithPassword,
    signInWithEmail,
    signUpWithEmail,
    verifyEmailOtp,
    profile,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  // signin sub-mode: 'password' (default) or 'otp'
  const [signinMode, setSigninMode] = useState<'password' | 'otp'>('password');

  // ── DO NOT initialize any field from localStorage in useState — it causes a hydration
  // mismatch (server sees '' but client sees localStorage value) which triggers a full
  // component remount, clearing all the other fields like name/password. Use useEffect instead.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [handle, setHandle] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'reset' | 'signin'>('signup');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResetLink, setShowResetLink] = useState(false);

  // ── Restore persisted form data after mount (avoids hydration mismatch) ──
  useEffect(() => {
    const savedEmail = localStorage.getItem('vibe_pending_auth_email') || '';
    const savedName = localStorage.getItem('vibe_pending_name') || '';
    const savedHandle = localStorage.getItem('vibe_pending_handle') || '';
    const savedPhone = localStorage.getItem('vibe_pending_phone') || '';
    if (savedEmail) setEmail(savedEmail);
    if (savedName) setName(savedName);
    if (savedHandle) setHandle(savedHandle);
    if (savedPhone) setPhone(savedPhone);
  }, []);

  // ── Redirect already-authenticated users away from the auth page ──
  // Without this, a logged-in user visiting /auth/login would go through signup
  // again and accidentally overwrite their profile with empty data.
  useEffect(() => {
    if (profile && step === 'form') {
      router.replace(redirectTo || '/dashboard');
    }
  }, [profile, step, redirectTo, router]);

  const getPendingEmail = () =>
    (
      email.trim() ||
      (typeof window !== 'undefined' ? localStorage.getItem('vibe_pending_auth_email') || '' : '')
    )
      .trim()
      .toLowerCase();

  const handleResendCode = async () => {
    const targetEmail = getPendingEmail();
    if (!targetEmail || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await signInWithEmail(targetEmail, 'organizer');
      if (res.success) {
        setMessage(`A fresh 6-digit code has been dispatched to ${targetEmail}`);
      } else {
        setError(res.error || 'Failed to resend code');
      }
    } catch {
      setError('Unable to resend code right now');
    } finally {
      setResending(false);
    }
  };

  /* ─── Sign In with Password ─── */
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return;

    setLoading(true);
    setError(null);
    setShowResetLink(false);

    const res = await signInWithPassword(cleanEmail, password);
    setLoading(false);

    if (res.success) {
      setStep('success');
      setTimeout(() => router.push(redirectTo || '/dashboard'), 900);
    } else if ((res as any).errorType === 'NOT_FOUND') {
      // Email not registered — auto-switch to signup with email pre-filled
      setError(null);
      setMessage(`No account found for ${cleanEmail}. Create one below!`);
      setMode('signup');
    } else if ((res as any).errorType === 'WRONG_PASSWORD') {
      setError('Incorrect password. Please try again.');
      setShowResetLink(true);
    } else {
      setError(res.error || 'Sign in failed. Please check your details.');
      setShowResetLink(true);
    }
  };

  /* ─── Reset password via OTP ─── */
  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address first.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter the new password you want to use (min. 6 characters) in the password field, then click Reset.');
      return;
    }

    setLoading(true);
    setError(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('vibe_pending_auth_email', cleanEmail);
      // Stash the new password so verifyEmailOtp can store the correct hash
      sessionStorage.setItem('vibe_pending_password', password);
      localStorage.setItem('vibe_pending_name', name || cleanEmail.split('@')[0]);
    }

    const res = await signInWithEmail(cleanEmail, 'organizer');
    setLoading(false);

    if (res.success) {
      setOtpPurpose('reset');
      setStep('otp');
      setMessage(`A 6-digit reset code has been sent to ${cleanEmail}. Enter it to set your new password.`);
    } else {
      setError(res.error || 'Failed to send reset code. Check your email address.');
    }
  };

  /* ─── Send OTP (Sign In via code) ─── */
  const handleOtpSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    setError(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('vibe_pending_auth_email', cleanEmail);
    }

    const res = await signInWithEmail(cleanEmail, 'organizer');
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setMessage(`We've sent a 6-digit login code to ${cleanEmail}`);
    } else {
      setError(res.error || 'Failed to dispatch login code. Please check your email address.');
    }
  };

  /* ─── Sign Up (Register with password + OTP email verify) ─── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('vibe_pending_auth_email', cleanEmail);
    }

    const res = await signUpWithEmail({
      email: cleanEmail,
      name: name.trim(),
      role: 'organizer',
      password: password,
      handle: handle.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      setOtpPurpose('signup');
      setStep('otp');
      setMessage(`Verification code sent to ${cleanEmail}. Enter it below to activate your account.`);
    } else if ((res as any).errorType === 'EMAIL_EXISTS') {
      // Account already exists — auto-switch to sign-in with email pre-filled
      setError(null);
      setMessage(`An account already exists for ${cleanEmail}. Sign in below!`);
      setMode('signin');
    } else {
      setError(res.error || 'Failed to create account. Please try again.');
    }
  };

  /* ─── Verify OTP (after send) ─── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = getPendingEmail();
    const cleanToken = otpCode.trim().replace(/\D/g, '');

    if (!targetEmail) {
      setError('Email address is missing. Please click "Change email" and try again.');
      return;
    }
    if (!cleanToken || cleanToken.length < 6) {
      setError('Please enter the full 6-digit code from your email.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await verifyEmailOtp(targetEmail, cleanToken, {
      role: 'organizer',
      name: name.trim() || undefined,
      handle: handle.trim() || undefined,
      // Pass password explicitly so the register API always gets it,
      // even if sessionStorage was cleared between navigations
      password: password || undefined,
    });
    setLoading(false);

    if (res.success) {
      // Clean up pending signup data — no longer needed after successful verification
      localStorage.removeItem('vibe_pending_auth_email');
      localStorage.removeItem('vibe_pending_name');
      localStorage.removeItem('vibe_pending_handle');
      localStorage.removeItem('vibe_pending_phone');
      setStep('success');
      setTimeout(() => router.push(redirectTo || '/dashboard'), 900);
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

          {/* Mode Switcher */}
          {step === 'form' && (
            <div className="flex p-1 bg-[#F0EDE8] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'signin' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#8A8A8A] hover:text-[#1A1A2E]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#8A8A8A] hover:text-[#1A1A2E]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error / Message banners */}
          {error && (
            <div className="p-3 bg-[#FEF0E7] border border-[#E8621A]/30 text-xs text-[#D45510] rounded-xl flex items-start gap-2">
              <span className="font-bold shrink-0">Notice:</span> {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-[#E8F5EE] border border-[#1A7A4A]/20 text-xs text-[#1A7A4A] rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1A7A4A] shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── SIGN IN FORM ── */}
            {step === 'form' && mode === 'signin' && (
              <motion.div
                key="signin-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Sub-mode toggle */}
                <div className="flex items-center gap-2 p-1 bg-[#F9F7F4] rounded-xl text-[11px] font-semibold border border-[#E8E4DF]">
                  <button
                    type="button"
                    onClick={() => { setSigninMode('password'); setError(null); }}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      signinMode === 'password' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#8A8A8A]'
                    }`}
                  >
                    <Lock className="w-3 h-3" /> Password
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSigninMode('otp'); setError(null); }}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      signinMode === 'otp' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#8A8A8A]'
                    }`}
                  >
                    <KeyRound className="w-3 h-3" /> One-Time Code
                  </button>
                </div>

                {/* Password login */}
                {signinMode === 'password' && (
                  <form onSubmit={handlePasswordSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="signin-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your password"
                          className="w-full pl-10 pr-10 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A2E]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      id="signin-password-submit"
                      disabled={loading || !email.trim() || !password}
                      className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></> : <><Lock className="w-4 h-4" /><span>Sign In</span></>}
                    </button>
                    <p className="text-[11px] text-center text-[#8A8A8A]">
                      Don't have a password yet?{' '}
                      <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-[#E8621A] font-semibold hover:underline">
                        Create account
                      </button>
                    </p>
                    {/* Reset password helper — only shown after a failed login */}
                    {showResetLink && (
                      <div className="p-3 bg-[#F4F1EC] border border-[#C9A84C]/30 rounded-xl text-[11px] text-[#4B4B4B] space-y-2">
                        <p className="font-semibold text-[#1A1A2E]">🔑 Forgot or reset password?</p>
                        <p>Type your new password in the field above, then click the button below to verify via email code.</p>
                        <button
                          type="button"
                          id="reset-password-btn"
                          disabled={loading || !email.trim() || !password || password.length < 6}
                          onClick={handleResetPassword}
                          className="w-full py-2 px-3 rounded-lg bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {loading ? <><Loader2 className="w-3 h-3 animate-spin" /><span>Sending code...</span></> : <><KeyRound className="w-3 h-3" /><span>Reset Password via Email Code</span></>}
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {/* OTP login */}
                {signinMode === 'otp' && (
                  <form onSubmit={handleOtpSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="otp-signin-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      id="otp-signin-submit"
                      disabled={loading || !email.trim()}
                      className="w-full py-3 px-4 rounded-[10px] bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending code...</span></> : <><KeyRound className="w-4 h-4" /><span>Send 6-Digit Code</span></>}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* ── SIGN UP FORM ── */}
            {step === 'form' && mode === 'signup' && (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        localStorage.setItem('vibe_pending_name', e.target.value);
                      }}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        localStorage.setItem('vibe_pending_auth_email', e.target.value.trim().toLowerCase());
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A2E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full pl-10 pr-10 py-2.5 bg-[#F9F7F4] border rounded-xl text-sm text-[#0F0F0F] outline-none focus:bg-white transition-colors ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-[#E8621A] focus:border-[#E8621A]'
                          : confirmPassword && password === confirmPassword
                          ? 'border-[#1A7A4A] focus:border-[#1A7A4A]'
                          : 'border-[#E8E4DF] focus:border-[#1A1A2E]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A2E]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-[#E8621A] mt-1">Passwords don't match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[10px] text-[#1A7A4A] mt-1">✓ Passwords match</p>
                  )}
                  <p className="text-[10px] text-[#8A8A8A] mt-1">You'll use this to log in instantly after email verification</p>
                </div>

                {/* Optional: Phone + Handle */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Phone <span className="font-normal text-[#8A8A8A]">(optional)</span></label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          localStorage.setItem('vibe_pending_phone', e.target.value);
                        }}
                        placeholder="+91..."
                        className="w-full pl-8 pr-3 py-2 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Handle <span className="font-normal text-[#8A8A8A]">(optional)</span></label>
                    <div className="relative">
                      <AtSign className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => {
                          const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                          setHandle(cleaned);
                          localStorage.setItem('vibe_pending_handle', cleaned);
                        }}
                        placeholder="yourname"
                        className="w-full pl-8 pr-3 py-2 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="signup-submit"
                  disabled={loading || !email.trim() || !name.trim() || !password}
                  className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating account...</span></>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /><span>Create Account & Verify Email</span></>
                  )}
                </button>
                <p className="text-[11px] text-center text-[#8A8A8A]">
                  A 6-digit code will be sent to verify your email.
                </p>
              </motion.form>
            )}

            {/* ── OTP ENTRY STEP ── */}
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
                      onClick={() => { setStep('form'); setError(null); setMessage(null); }}
                      className="text-xs text-[#8A8A8A] hover:text-[#1A1A2E] flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change email
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-3 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl text-center tracking-[0.4em] font-mono text-lg font-bold text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#8A8A8A]">
                    <span>
                      Sent to: <strong className="text-[#1A1A2E]">{getPendingEmail() || email}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={resending}
                      onClick={handleResendCode}
                      className="text-[#E8621A] font-semibold hover:underline disabled:opacity-50 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                      {resending ? 'Sending...' : 'Resend code'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="otp-verify-submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying...</span></>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /><span>Verify Code & Continue</span></>
                  )}
                </button>
              </motion.form>
            )}

            {/* ── SUCCESS ── */}
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
                <h3 className="text-xl font-bold font-serif text-[#1A1A2E]">Authentication Successful</h3>
                <p className="text-xs text-[#4B4B4B]">
                  Signed in as <span className="font-semibold text-[#1A1A2E]">Gathering Host</span>. Loading your portal...
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
