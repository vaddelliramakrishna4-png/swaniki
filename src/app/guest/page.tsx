'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  CalendarCheck,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  User,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { EventItem, RSVPItem } from '@/types/database';
import { fetchGuestRSVPs, cancelRSVP } from '@/lib/events';
import { formatEventDateIST, formatEventTimeRangeIST } from '@/lib/date';
import { getGoogleCalendarUrl, downloadICSFile } from '@/lib/calendar';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type TabType = 'upcoming' | 'past' | 'waitlist_cancelled';

export default function GuestDashboardPage() {
  const { profile, switchRole } = useAuth();
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [rsvpsWithEvents, setRsvpsWithEvents] = useState<{ rsvp: RSVPItem; event: EventItem }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [cancellingEventId, setCancellingEventId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Initialize email from auth profile or localStorage
  useEffect(() => {
    if (profile?.email) {
      setGuestEmail(profile.email);
      setInputEmail(profile.email);
    } else if (typeof window !== 'undefined') {
      const stored =
        localStorage.getItem('vibe_guest_email') ||
        localStorage.getItem('vibe_viewer_email') ||
        '';
      setGuestEmail(stored);
      setInputEmail(stored);
    }
  }, [profile]);

  // Fetch RSVPs when guestEmail or profile changes
  useEffect(() => {
    if (guestEmail || profile?.id) {
      setLoading(true);
      fetchGuestRSVPs({ userId: profile?.id, email: guestEmail }).then((data) => {
        setRsvpsWithEvents(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [guestEmail, profile?.id]);

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmail.trim()) {
      const clean = inputEmail.trim().toLowerCase();
      setGuestEmail(clean);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vibe_guest_email', clean);
      }
      setIsEditingEmail(false);
    }
  };

  const handleConfirmCancel = async (eventId: string) => {
    setLoading(true);
    const res = await cancelRSVP(eventId, guestEmail);
    setCancellingEventId(null);

    if (res.success) {
      toast.success('Your RSVP has been cancelled and spot released.');
      setActionSuccessMessage('Your RSVP has been cancelled and your spot released.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
      const updated = await fetchGuestRSVPs({ userId: profile?.id, email: guestEmail });
      setRsvpsWithEvents(updated);
    } else {
      toast.error(res.error || 'Failed to cancel RSVP.');
    }
    setLoading(false);
  };

  const now = new Date();

  const upcomingList = rsvpsWithEvents.filter(
    ({ rsvp, event }) =>
      Boolean(event) &&
      rsvp.status === 'confirmed' &&
      new Date(event.start_time).getTime() >= now.getTime()
  );

  const pastList = rsvpsWithEvents.filter(
    ({ rsvp, event }) =>
      Boolean(event) &&
      rsvp.status === 'confirmed' &&
      new Date(event.start_time).getTime() < now.getTime()
  );

  const waitlistOrCancelledList = rsvpsWithEvents.filter(
    ({ rsvp, event }) =>
      Boolean(event) && (rsvp.status === 'waitlisted' || rsvp.status === 'cancelled')
  );

  const currentList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'past'
      ? pastList
      : waitlistOrCancelledList;

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-[#E8E4DF] p-6 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EDE8] text-[#1A1A2E] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" /> Guest Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1A1A2E]">
              My Gatherings &amp; Passes
            </h1>
            <p className="text-xs sm:text-sm text-[#4B4B4B]">
              Manage your confirmed entries, export calendar invites, and browse newly curated salons.
            </p>
          </div>

          {/* Email Chip & Switcher */}
          <div className="bg-[#F9F7F4] border border-[#E8E4DF] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
            {!isEditingEmail ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#8A8A8A]">Active Guest Account</div>
                    <div className="text-xs font-semibold text-[#1A1A2E] truncate max-w-[180px]">
                      {guestEmail || 'No email set'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-xs font-bold text-[#E8621A] hover:underline whitespace-nowrap self-start sm:self-auto"
                >
                  Switch Email
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdateEmail} className="flex items-center gap-2 w-full">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter guest email..."
                  required
                  className="px-3 py-1.5 rounded-lg border border-[#C8C4BF] text-xs outline-none focus:border-[#1A1A2E] bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#1A1A2E] text-white text-xs font-bold whitespace-nowrap"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className="text-xs text-[#8A8A8A] hover:text-[#1A1A2E]"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-xl bg-[#E8F5EE] border border-[#1A7A4A]/30 text-[#1A7A4A] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[#E8E4DF] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:bg-white hover:text-[#1A1A2E]'
            }`}
          >
            <span>Upcoming Gatherings</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-[#E8E4DF] text-[#1A1A2E]'
              }`}
            >
              {upcomingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'past'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:bg-white hover:text-[#1A1A2E]'
            }`}
          >
            <span>Past Events</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'past' ? 'bg-white/20 text-white' : 'bg-[#E8E4DF] text-[#1A1A2E]'
              }`}
            >
              {pastList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('waitlist_cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'waitlist_cancelled'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:bg-white hover:text-[#1A1A2E]'
            }`}
          >
            <span>Waitlist &amp; Cancelled</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'waitlist_cancelled'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E8E4DF] text-[#1A1A2E]'
              }`}
            >
              {waitlistOrCancelledList.length}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#E8621A] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#8A8A8A]">Fetching your confirmed passes...</p>
          </div>
        ) : currentList.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-[#E8E4DF] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EDE8] text-[#8A8A8A] mx-auto flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A2E]">
              {activeTab === 'upcoming'
                ? 'No upcoming gatherings found'
                : activeTab === 'past'
                ? 'No past events found'
                : 'No waitlisted or cancelled events'}
            </h3>
            <p className="text-xs text-[#4B4B4B] max-w-md mx-auto">
              {activeTab === 'upcoming'
                ? `You haven't RSVP'd to any upcoming gatherings under ${guestEmail}. Explore our curated feed to discover high-signal tech salons, rooftop dinners, and cultural evenings.`
                : 'Your history will appear here once you attend or manage gathering entries.'}
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>Discover More Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentList.map(({ rsvp, event }) => {
              if (!event) return null;
              const timeStr = formatEventTimeRangeIST(event.start_time, event.end_time);
              const isCancelled = rsvp.status === 'cancelled';
              const isWaitlisted = rsvp.status === 'waitlisted';

              return (
                <div
                  key={rsvp.id || event.id}
                  className="bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div>
                    {/* Cover Thumbnail */}
                    <div className="relative h-44 w-full bg-[#1A1A2E] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          event.cover_url ||
                          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isCancelled
                              ? 'bg-gray-800 text-gray-300'
                              : isWaitlisted
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#E8F5EE] text-[#1A7A4A]'
                          }`}
                        >
                          {isCancelled ? (
                            <>
                              <XCircle className="w-3 h-3" /> Cancelled
                            </>
                          ) : isWaitlisted ? (
                            <>
                              <Clock className="w-3 h-3" /> Waitlisted
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Confirmed
                            </>
                          )}
                        </span>
                      </div>

                      {/* City Badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold">
                        📍 {event.city || 'India'}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">
                          {event.theme_template} · {event.category || 'Gathering'}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#1A1A2E] line-clamp-1 mt-0.5">
                          {event.title}
                        </h3>
                        {event.tagline && (
                          <p className="text-xs text-[#8A8A8A] italic line-clamp-1 mt-0.5">
                            &ldquo;{event.tagline}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Date & Location */}
                      <div className="space-y-1.5 text-xs text-[#4B4B4B] pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#E8621A] shrink-0" />
                          <span className="font-medium">{timeStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                          <span className="truncate">
                            {event.venue_name || event.location || 'India'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Strip */}
                  <div className="p-4 bg-[#F9F7F4] border-t border-[#E8E4DF] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${event.slug || event.id}`}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E4DF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center gap-1 transition-colors"
                      >
                        <span>View Page</span>
                        <ExternalLink className="w-3 h-3 text-[#8A8A8A]" />
                      </Link>

                      {/* Calendar Actions (if confirmed) */}
                      {!isCancelled && (
                        <div className="flex items-center gap-1">
                          <a
                            href={getGoogleCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Add to Google Calendar"
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E8E4DF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center gap-1 transition-colors"
                          >
                            <span>+ GCal</span>
                          </a>

                          <button
                            onClick={() => downloadICSFile(event)}
                            title="Download .ICS file"
                            className="p-1.5 rounded-lg bg-white border border-[#E8E4DF] hover:bg-[#F0EDE8] text-[#1A1A2E] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cancel Action */}
                    {!isCancelled && (
                      <button
                        onClick={() => setCancellingEventId(event.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline px-2 py-1"
                      >
                        Cancel RSVP
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Discover More Events Promotion Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1A1A2E] to-[#16213E] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-serif font-bold text-white">Looking for your next gathering?</h3>
            <p className="text-xs text-[#C8C4BF]">
              Explore curated dinners, tech salons, and cultural mixers across Bengaluru, Mumbai, Delhi NCR, and Goa.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap flex items-center gap-2"
          >
            <span>Explore Discovery Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {cancellingEventId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E8E4DF] shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">Cancel Your RSVP?</h3>
              <p className="text-xs text-[#4B4B4B] mt-1">
                Are you sure you want to cancel your attendance? Your spot will be released immediately to waitlisted guests and a cancellation confirmation will be sent to your email.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingEventId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B4B4B] hover:bg-[#F0EDE8]"
              >
                Keep My Spot
              </button>
              <button
                onClick={() => handleConfirmCancel(cancellingEventId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                Yes, Cancel RSVP
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
