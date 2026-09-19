'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  Bell,
  BellOff,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Sparkles,
} from 'lucide-react';
import { EventItem } from '@/types/database';
import { useAuth } from '@/lib/auth-context';

interface EditEventFormProps {
  event: EventItem;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // ── Form state (pre-filled from event) ──────────────────────────────────
  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  const [startTime, setStartTime] = useState(
    event.start_time ? toLocalDateTimeInput(event.start_time) : ''
  );
  const [endTime, setEndTime] = useState(
    event.end_time ? toLocalDateTimeInput(event.end_time) : ''
  );
  const [venueName, setVenueName] = useState(event.venue_name || '');
  const [location, setLocation] = useState(event.location || '');
  const [coverUrl, setCoverUrl] = useState(event.cover_url || '');
  const [themeTemplate, setThemeTemplate] = useState(event.theme_template || 'Grove');

  // ── Notification toggles ─────────────────────────────────────────────────
  const [notifyGuests, setNotifyGuests] = useState(true);
  const [updateNote, setUpdateNote] = useState('');

  // ── Submit state ─────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get access token from supabase session for Authorization header
      let accessToken: string | null = null;
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { data } = await supabase.auth.getSession();
        accessToken = data.session?.access_token || null;
      } catch {}

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          start_time: startTime ? new Date(startTime).toISOString() : undefined,
          end_time: endTime ? new Date(endTime).toISOString() : undefined,
          venue_name: venueName.trim() || null,
          location: location.trim() || null,
          cover_url: coverUrl.trim() || null,
          theme_template: themeTemplate,
          notify_guests: notifyGuests,
          update_note: updateNote.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update event.');
      }

      setSuccess(true);
      // Short delay to show success state before redirecting
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error. Please try again.');
      setSubmitting(false);
    }
  }

  const TEMPLATES = ['Grove', 'Sprint', 'Bloom', 'Vertex', 'Ember'] as const;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ── Success Banner ───────────────────────────────────────────────── */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 bg-[#E8F5EE] border border-[#1A7A4A]/30 rounded-2xl text-[#1A7A4A] text-sm font-semibold"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Event updated! Redirecting to dashboard…</span>
        </motion.div>
      )}

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Section 1: Core Details ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DF] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-center gap-2">
          <Type className="w-4 h-4 text-[#E8621A]" />
          <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Core Details</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:ring-2 focus:ring-[#1A1A2E]/10 disabled:opacity-50 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[#8A8A8A]" />
              Description
            </label>
            <textarea
              id="edit-event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the gathering for guests"
              rows={4}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:ring-2 focus:ring-[#1A1A2E]/10 disabled:opacity-50 resize-none transition-all"
            />
          </div>

          {/* Theme Template */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
              Theme Template
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() => setThemeTemplate(tmpl)}
                  disabled={submitting}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    themeTemplate === tmpl
                      ? 'bg-[#1A1A2E] text-[#C9A84C] border-[#1A1A2E]'
                      : 'bg-white text-[#4B4B4B] border-[#E8E4DF] hover:border-[#1A1A2E]/40'
                  } disabled:opacity-50`}
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Date & Time ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DF] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#E8621A]" />
          <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Date & Time</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
              Start Date & Time
            </label>
            <input
              id="edit-event-start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:ring-2 focus:ring-[#1A1A2E]/10 disabled:opacity-50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
              End Date & Time
            </label>
            <input
              id="edit-event-end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:ring-2 focus:ring-[#1A1A2E]/10 disabled:opacity-50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Venue & Location ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DF] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E8621A]" />
          <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Venue & Location</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">Venue Name</label>
            <input
              id="edit-event-venue"
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g. The Greenhouse Terrace"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:ring-2 focus:ring-[#1A1A2E]/10 disabled:opacity-50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">Full Address</label>
            <input
              id="edit-event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 12th Main Rd, Indiranagar, Bengaluru"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:ring-2 focus:ring-[#1A1A2E]/10 disabled:opacity-50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Cover Image ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DF] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#E8621A]" />
          <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Cover Image</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">Cover Image URL</label>
            <input
              id="edit-event-cover-url"
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/…"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#1A1A2E] focus:ring-2 focus:ring-[#1A1A2E]/10 disabled:opacity-50 transition-all"
            />
          </div>
          {coverUrl && (
            <div className="relative h-40 rounded-xl overflow-hidden border border-[#E8E4DF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Section 5: Guest Notification ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DF] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C9A84C]" />
            <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">
              Guest Notification
            </h2>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            id="edit-event-notify-toggle"
            onClick={() => setNotifyGuests((v) => !v)}
            disabled={submitting}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
              notifyGuests ? 'bg-[#1A1A2E]' : 'bg-[#D1CCC5]'
            }`}
            aria-pressed={notifyGuests}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                notifyGuests ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#4B4B4B] leading-relaxed">
            {notifyGuests
              ? 'All confirmed RSVP guests will receive an email with the updated event details.'
              : 'Guests will not be notified of this update.'}
          </p>

          {notifyGuests && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                What changed? <span className="text-[#8A8A8A] font-normal normal-case">(optional message for guests)</span>
              </label>
              <textarea
                id="edit-event-update-note"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="e.g. Venue has changed to Sea Breeze Rooftop. Timing remains the same."
                rows={3}
                disabled={submitting}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-sm text-[#1A1A2E] outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/10 disabled:opacity-50 resize-none transition-all"
              />
              <p className="text-[11px] text-[#8A8A8A]">
                This message appears verbatim in the guest notification email.
              </p>
            </div>
          )}

          {!notifyGuests && (
            <div className="flex items-center gap-2 p-3 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF]">
              <BellOff className="w-4 h-4 text-[#8A8A8A] shrink-0" />
              <p className="text-xs text-[#8A8A8A]">Silent update — guests won't receive an email.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer Action Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-2 pb-8">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl border border-[#E8E4DF] bg-white text-xs font-bold text-[#4B4B4B] hover:bg-[#F9F7F4] hover:text-[#1A1A2E] transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </Link>

        <motion.button
          type="submit"
          id="edit-event-submit"
          disabled={submitting || success}
          whileHover={{ scale: submitting || success ? 1 : 1.02 }}
          whileTap={{ scale: submitting || success ? 1 : 0.98 }}
          className="px-6 py-2.5 rounded-xl bg-[#E8621A] hover:bg-[#D45510] disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving changes…
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}

// ── Utility: convert ISO string → datetime-local input value ──────────────────
function toLocalDateTimeInput(isoString: string): string {
  try {
    const date = new Date(isoString);
    // Format: YYYY-MM-DDTHH:mm (local time, no seconds)
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
  } catch {
    return '';
  }
}
