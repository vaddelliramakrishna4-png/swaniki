'use client';

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Download,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  MapPin,
  Ticket,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react';
import { EventItem, RSVPItem } from '@/types/database';
import { submitRSVPRecord, cancelRSVP } from '@/lib/events';
import { supabase } from '@/lib/supabase/client';
import { getGoogleCalendarUrl, downloadICSFile } from '@/lib/calendar';
import { formatEventTimeRangeIST } from '@/lib/date';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface RSVPFormProps {
  event: EventItem;
  confirmedCount?: number;
  rsvps?: RSVPItem[];
  onSuccess?: (newRsvp?: RSVPItem) => void;
  onCancel?: () => void;
}

export function RSVPForm({
  event,
  confirmedCount = 0,
  rsvps = [],
  onSuccess,
  onCancel,
}: RSVPFormProps) {
  const { user, profile } = useAuth();

  // Synchronous detection of an existing RSVP on initial render to prevent form flicker
  const initialDetection = useMemo(() => {
    if (typeof window === 'undefined') {
      return { isRsvped: false, record: null as RSVPItem | null };
    }
    try {
      // 1. Direct local storage key for this specific event
      const saved = localStorage.getItem(`vibe_rsvped_${event.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.status !== 'cancelled') {
          return { isRsvped: true, record: parsed };
        }
      }

      // 2. Candidate emails for the viewer
      const candidates: string[] = [];
      const guestEmail = localStorage.getItem('vibe_guest_email');
      if (guestEmail) candidates.push(guestEmail.trim().toLowerCase());
      const viewerEmail = localStorage.getItem('vibe_viewer_email');
      if (viewerEmail) candidates.push(viewerEmail.trim().toLowerCase());
      const authProfile = localStorage.getItem('vibe_auth_profile');
      if (authProfile) {
        try {
          const p = JSON.parse(authProfile);
          if (p?.email) candidates.push(p.email.trim().toLowerCase());
        } catch {}
      }

      // 3. Match against server-provided rsvps prop
      if (rsvps && rsvps.length > 0 && candidates.length > 0) {
        const match = rsvps.find(
          (r) =>
            r.status !== 'cancelled' &&
            candidates.includes((r.guest_email || '').trim().toLowerCase())
        );
        if (match) {
          return { isRsvped: true, record: match };
        }
      }
    } catch {}
    return { isRsvped: false, record: null as RSVPItem | null };
  }, [event.id, rsvps]);

  const [submitted, setSubmitted] = useState<boolean>(initialDetection.isRsvped);
  const [confirmedRSVP, setConfirmedRSVP] = useState<RSVPItem | null>(initialDetection.record);
  const [name, setName] = useState(initialDetection.record?.guest_name || '');
  const [email, setEmail] = useState(initialDetection.record?.guest_email || '');
  const [phone, setPhone] = useState(
    (initialDetection.record?.answers as any)?.phone || '+91 '
  );
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState('');
  const [dietary, setDietary] = useState('none');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isWaitlistedSubmission, setIsWaitlistedSubmission] = useState(
    initialDetection.record?.status === 'waitlisted'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill from authenticated user profile & live query Supabase for confirmation
  useEffect(() => {
    let active = true;

    if (profile?.email && !email) {
      setEmail(profile.email);
    }
    if (profile?.name && !name) {
      setName(profile.name);
    }

    const checkExistingRSVP = async () => {
      const viewerEmail = (
        profile?.email ||
        user?.email ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('vibe_guest_email') ||
            localStorage.getItem('vibe_viewer_email') ||
            ''
          : '')
      )
        .trim()
        .toLowerCase();

      // Query live Supabase table for definitive confirmation
      if (viewerEmail || user?.id) {
        try {
          let query = supabase
            .from('rsvps')
            .select('*')
            .eq('event_id', event.id);

          if (viewerEmail) {
            query = query.eq('guest_email', viewerEmail);
          } else if (user?.id) {
            query = query.eq('user_id', user.id);
          }

          const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data && active) {
            if (data.status !== 'cancelled') {
              setSubmitted(true);
              setConfirmedRSVP(data);
              if (data.guest_name) setName(data.guest_name);
              if (data.guest_email) setEmail(data.guest_email);
              if ((data.answers as any)?.phone) setPhone((data.answers as any).phone);
              setIsWaitlistedSubmission(data.status === 'waitlisted');
              if (typeof window !== 'undefined') {
                localStorage.setItem(`vibe_rsvped_${event.id}`, JSON.stringify(data));
                localStorage.setItem('vibe_guest_email', data.guest_email || viewerEmail);
              }
            } else {
              // Explicitly cancelled in Supabase
              setSubmitted(false);
              setConfirmedRSVP(null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem(`vibe_rsvped_${event.id}`);
              }
            }
          }
        } catch (err) {
          console.warn('Notice checking existing RSVP in Supabase:', err);
        }
      }
    };

    checkExistingRSVP();
    return () => {
      active = false;
    };
  }, [event.id, profile?.email, profile?.name, user?.email, user?.id]);

  // Determine capacity & waitlist status
  const capacity = event.capacity || 0;
  const isCapped = capacity > 0;
  const spotsLeft = isCapped ? Math.max(0, capacity - confirmedCount) : null;
  const isWaitlistActive = isCapped && spotsLeft !== null && spotsLeft <= 0;

  // Determine configuration from event.rsvp_form_config
  const rsvpConfig = (event.rsvp_form_config || {}) as any;
  const allowPlusOne = Boolean(rsvpConfig.allow_plus_one || rsvpConfig.enable_plus_one);
  const collectDietary = Boolean(rsvpConfig.collect_dietary || rsvpConfig.enable_dietary);
  const customQuestions = (rsvpConfig.custom_questions || event.custom_questions || []) as any[];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+91')) {
      val = '+91 ' + val.replace(/^\+?91?/, '').trim();
    }
    setPhone(val);
  };

  const handleCustomAnswerChange = (qId: string, val: string) => {
    setCustomAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Validate required custom questions
    for (const q of event.custom_questions || []) {
      if (q.required && !customAnswers[q.id]?.trim()) {
        setErrorMessage(`Please answer: "${q.label}"`);
        return;
      }
    }

    setSubmitting(true);
    setErrorMessage(null);

    const answersPayload = {
      ...customAnswers,
      phone: phone.trim(),
      plus_one: hasPlusOne,
      plus_one_name: hasPlusOne ? plusOneName : undefined,
      dietary: dietary !== 'none' ? dietary : undefined,
      tshirt_size: tshirtSize,
    };

    const targetStatus: 'confirmed' | 'waitlisted' = isWaitlistActive ? 'waitlisted' : 'confirmed';

    const res = await submitRSVPRecord({
      event_id: event.id,
      user_id: user?.id ?? null,
      guest_name: name.trim(),
      guest_email: email.trim(),
      phone: phone.trim(),
      status: targetStatus,
      answers: answersPayload,
    });

    setSubmitting(false);

    if (res.success && res.rsvp) {
      const savedRSVP = res.rsvp;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`vibe_rsvped_${event.id}`, JSON.stringify(savedRSVP));
        localStorage.setItem('vibe_guest_email', email.trim().toLowerCase());
        localStorage.setItem('vibe_viewer_email', email.trim().toLowerCase());
      }
      setSubmitted(true);
      setConfirmedRSVP(savedRSVP);
      setIsWaitlistedSubmission(savedRSVP.status === 'waitlisted');

      // Instant optimistic count increment in parent view
      if (onSuccess) {
        onSuccess(savedRSVP);
      }

      toast.success(
        targetStatus === 'waitlisted'
          ? 'You have been added to the waitlist!'
          : 'RSVP confirmed! See you there.'
      );

      // Launch cheerful celebratory confetti (if confirmed)
      if (targetStatus === 'confirmed') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#C9A84C', '#E8621A', '#1A7A4A', '#1A1A2E'],
          });
        } catch {}
      }
    } else {
      const err = res.error || 'Unable to confirm RSVP. Please try again.';
      toast.error(err);
      setErrorMessage(err);
    }
  };

  const handleCancel = async () => {
    const targetEmail = confirmedRSVP?.guest_email || email;
    if (!targetEmail) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your RSVP? This will immediately release your spot for another guest.'
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      const res = await cancelRSVP(event.id, targetEmail);
      if (res.success) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`vibe_rsvped_${event.id}`);
        }
        setSubmitted(false);
        setConfirmedRSVP(null);
        toast.info('Your RSVP has been cancelled.');
        if (onCancel) {
          onCancel();
        }
      } else {
        toast.error(res.error || 'Failed to cancel RSVP');
      }
    } catch {
      toast.error('Unable to cancel RSVP right now');
    } finally {
      setCancelling(false);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('rsvp-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const googleCalUrl = getGoogleCalendarUrl(event);
  const formattedTime = formatEventTimeRangeIST(event.start_time, event.end_time);

  return (
    <>
      {/* Sticky Bottom Bar for Mobile Viewports (strictly responsive) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E4DF] px-4 py-3 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
            {submitted ? (
              <span className="text-[#1A7A4A] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#1A7A4A] animate-pulse" />
                <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" />
                {isWaitlistedSubmission ? 'Waitlist Confirmed' : "You're Going!"}
              </span>
            ) : isWaitlistActive ? (
              'Waitlist Open'
            ) : spotsLeft !== null ? (
              `${spotsLeft} spots remaining`
            ) : (
              'Free Admission'
            )}
          </span>
          <span className="text-[10px] text-[#8A8A8A] block">
            {submitted
              ? confirmedRSVP?.guest_name || name || 'Spot Reserved'
              : event.approval_required
              ? 'Host Approval Required'
              : 'Instant Confirmation'}
          </span>
        </div>

        {submitted ? (
          <button
            type="button"
            onClick={scrollToForm}
            className="px-4 py-2 rounded-xl bg-[#E8F5EE] border border-[#1A7A4A]/30 text-[#1A7A4A] text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>View Pass 🎫</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={scrollToForm}
            className="px-5 py-2.5 rounded-xl bg-[#E8621A] hover:bg-[#D45510] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            {isWaitlistActive ? 'Join Waitlist' : 'RSVP Now'}
          </button>
        )}
      </div>

      <div
        id="rsvp-section"
        className="bg-white rounded-2xl border border-[#E8E4DF] p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] relative scroll-mt-24"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-[#1A1A2E] font-['Inter']">
                    {isWaitlistActive
                      ? 'Join the Waitlist'
                      : event.approval_required
                      ? 'Request an Invitation'
                      : 'RSVP for this Gathering'}
                  </h3>
                  {isWaitlistActive ? (
                    <span className="text-[11px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                      Waitlist
                    </span>
                  ) : event.approval_required ? (
                    <span className="text-[11px] font-semibold text-[#C9A84C] bg-[#FDF6E7] px-2 py-0.5 rounded-full border border-[#C9A84C]/20">
                      Host Review
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-[#4B4B4B] leading-relaxed">
                  {isWaitlistActive
                    ? 'This event is currently at full capacity. Join the waitlist to receive priority access if seats open.'
                    : event.approval_required
                    ? 'The organizer reviews all guests to ensure a curated experience.'
                    : 'Instant confirmation. One RSVP per person.'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#FEF0E7] border border-[#E8621A]/30 text-xs text-[#D45510] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Guest Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                  Your Full Name <span className="text-[#E8621A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Siddharth Rao"
                  className="w-full bg-[#F9F7F4] border border-[#E8E4DF] focus:border-[#1A1A2E] focus:bg-white rounded-lg px-3.5 py-2 text-sm text-[#0F0F0F] placeholder-[#8A8A8A] outline-none transition-all"
                />
              </div>

              {/* Guest Email */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                  Email Address <span className="text-[#E8621A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. siddharth@example.com"
                  className="w-full bg-[#F9F7F4] border border-[#E8E4DF] focus:border-[#1A1A2E] focus:bg-white rounded-lg px-3.5 py-2 text-sm text-[#0F0F0F] placeholder-[#8A8A8A] outline-none transition-all"
                />
              </div>

              {/* India-First Phone (+91 Default with Indian Flag) */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                  WhatsApp Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-xs text-[#4B4B4B] font-medium">
                    <span role="img" aria-label="India Flag">
                      🇮🇳
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F9F7F4] border border-[#E8E4DF] focus:border-[#1A1A2E] focus:bg-white rounded-lg pl-10 pr-3.5 py-2 text-sm text-[#0F0F0F] placeholder-[#8A8A8A] outline-none transition-all font-mono"
                  />
                </div>
                <span className="text-[10px] text-[#8A8A8A] mt-0.5 block">
                  For calendar updates &amp; venue details via WhatsApp
                </span>
              </div>

              {/* Dynamic Custom Questions strictly from rsvp_form_config */}
              {customQuestions &&
                customQuestions.length > 0 &&
                customQuestions.map((q: any) => (
                  <div key={q.id}>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                      {q.label} {q.required && <span className="text-[#E8621A]">*</span>}
                    </label>
                    <input
                      type="text"
                      required={q.required}
                      value={customAnswers[q.id] || ''}
                      onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                      placeholder="Your response..."
                      className="w-full bg-[#F9F7F4] border border-[#E8E4DF] focus:border-[#1A1A2E] focus:bg-white rounded-lg px-3.5 py-2 text-sm text-[#0F0F0F] placeholder-[#8A8A8A] outline-none transition-all"
                    />
                  </div>
                ))}

              {/* Optional Extras: Dietary Preferences */}
              {collectDietary && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1 flex items-center gap-1">
                    <UtensilsCrossed className="w-3 h-3 text-[#C9A84C]" />
                    <span>Dietary Preference</span>
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-2.5 py-1.5 text-xs text-[#0F0F0F] outline-none"
                  >
                    <option value="none">Standard</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain Friendly</option>
                  </select>
                </div>
              )}

              {/* Plus One Toggle */}
              {allowPlusOne && (
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#4B4B4B]">
                    <input
                      type="checkbox"
                      checked={hasPlusOne}
                      onChange={(e) => setHasPlusOne(e.target.checked)}
                      className="rounded text-[#E8621A] focus:ring-[#E8621A]"
                    />
                    <span>I would like to bring a +1 (guest)</span>
                  </label>

                  {hasPlusOne && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <input
                        type="text"
                        value={plusOneName}
                        onChange={(e) => setPlusOneName(e.target.value)}
                        placeholder="+1 Guest's Full Name"
                        className="w-full bg-[#F9F7F4] border border-[#E8E4DF] focus:border-[#1A1A2E] focus:bg-white rounded-lg px-3.5 py-2 text-xs text-[#0F0F0F] outline-none"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Accent Primary CTA Button strictly reserved */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming Reservation...
                  </>
                ) : isWaitlistActive ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Join Waitlist
                  </>
                ) : event.approval_required ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Request Invitation
                  </>
                ) : (
                  'Confirm RSVP'
                )}
              </button>
            </motion.form>
          ) : (
            /* Confirmed Digital Ticket Pass State */
            <motion.div
              key="confirmed-pass"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center"
            >
              {/* Status Header Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5EE] border border-[#1A7A4A]/20 text-[#1A7A4A] text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" />
                <span>
                  {isWaitlistedSubmission ? 'Waitlist Priority Reserved' : 'Spot Confirmed & Guaranteed'}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A2E]">
                  {isWaitlistedSubmission
                    ? "You're on the Waitlist!"
                    : event.approval_required
                    ? 'Invitation Request Received!'
                    : "You're on the Guest List!"}
                </h3>
                <p className="text-xs text-[#4B4B4B] mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {isWaitlistedSubmission
                    ? `We have queued your spot, ${confirmedRSVP?.guest_name || name}. You will receive a WhatsApp message if a seat opens.`
                    : `See you there, ${confirmedRSVP?.guest_name || name}! Your admission pass has been registered.`}
                </p>
              </div>

              {/* Digital Boarding Pass / Ticket Card */}
              <div className="relative bg-[#F9F7F4] border border-[#E8E4DF] rounded-2xl p-4 text-left space-y-3 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#E8621A]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
                      Digital Pass
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#8A8A8A] bg-white px-2 py-0.5 rounded border border-[#E8E4DF]">
                    #PASS-{(confirmedRSVP?.id || event.id).slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A8A] block">
                      Guest Name
                    </span>
                    <span className="font-bold text-[#1A1A2E] text-sm">
                      {confirmedRSVP?.guest_name || name || 'Confirmed Guest'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A8A] block">
                        Email &amp; Updates
                      </span>
                      <span className="font-medium text-[#4B4B4B]">
                        {confirmedRSVP?.guest_email || email}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A8A] block">
                        Admission Status
                      </span>
                      <span className="font-bold text-[#1A7A4A] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmed
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E4DF]/70 text-[11px] text-[#4B4B4B] space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#1A1A2E]">
                      <Calendar className="w-3.5 h-3.5 text-[#E8621A] shrink-0" />
                      <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1A7A4A] shrink-0" />
                      <span className="truncate">
                        {event.venue_name || event.location || 'Bengaluru, India'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Calendar Section */}
              {!isWaitlistedSubmission && (
                <div className="bg-white border border-[#E8E4DF] rounded-xl p-3 text-left space-y-2">
                  <span className="text-[11px] font-bold text-[#1A1A2E] block">
                    Add Gathering to Calendar
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={googleCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-[#F9F7F4] border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#E8621A]" />
                      Google Calendar
                    </a>

                    <button
                      type="button"
                      onClick={() => downloadICSFile(event)}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#F9F7F4] border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
                      Apple / .ics
                    </button>
                  </div>
                </div>
              )}

              {/* Guest Dashboard Link */}
              <div className="pt-1">
                <a
                  href="/guest"
                  className="text-xs text-[#E8621A] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>View in Guest Dashboard</span>
                  <span>&rarr;</span>
                </a>
              </div>

              {/* Cancel RSVP Option */}
              <div className="pt-2 border-t border-[#E8E4DF]">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2 flex items-center justify-center gap-1.5 mx-auto transition-colors disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling RSVP...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Can&apos;t make it? Cancel your RSVP</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
