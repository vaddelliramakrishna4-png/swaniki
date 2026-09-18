'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Settings,
  Download,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { RSVPForm } from '@/components/rsvp/RSVPForm';
import { ShareBanner } from '@/components/share/ShareBanner';
import { WhoIsGoing } from '@/components/events/WhoIsGoing';
import { LiveCounter } from '@/components/events/LiveCounter';
import { GuestComments } from '@/components/events/GuestComments';
import { StatusBanner } from '@/components/events/StatusBanner';
import { DatePoll } from '@/components/events/DatePoll';
import { OrganizerCard } from '@/components/organizer/OrganizerCard';
import { EventItem, RSVPItem } from '@/types/database';
import { fetchEventRSVPs } from '@/lib/events';
import { formatEventTimeRangeIST, extractCity } from '@/lib/date';
import { getTemplateConfig } from '@/lib/templates';
import { getGoogleCalendarUrl, downloadICSFile } from '@/lib/calendar';

interface EventPageViewProps {
  initialEvent: EventItem;
  initialRsvps?: RSVPItem[];
}

export function EventPageView({ initialEvent, initialRsvps = [] }: EventPageViewProps) {
  const [event] = useState<EventItem>(initialEvent);
  const [rsvps, setRsvps] = useState<RSVPItem[]>(initialRsvps);

  // Sync RSVPs live across tabs and custom events
  React.useEffect(() => {
    let active = true;

    const syncLatestRsvps = () => {
      fetchEventRSVPs(event.id).then((fresh) => {
        if (active) setRsvps(fresh);
      });
    };

    window.addEventListener('vibe-rsvp-created', syncLatestRsvps);
    window.addEventListener('vibe-rsvp-cancelled', syncLatestRsvps);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`vibe-event-sync-${event.id}`);
      bc.onmessage = () => syncLatestRsvps();
    } catch {}

    return () => {
      active = false;
      window.removeEventListener('vibe-rsvp-created', syncLatestRsvps);
      window.removeEventListener('vibe-rsvp-cancelled', syncLatestRsvps);
      if (bc) bc.close();
    };
  }, [event.id]);

  const template = getTemplateConfig(event.theme_template);
  const city = event.city || extractCity(event.location);
  const formattedTimeRange = formatEventTimeRangeIST(event.start_time, event.end_time);
  const googleCalUrl = getGoogleCalendarUrl(event);

  const streetAddress = event.location_address || event.location || '';
  const venueCity = event.city || extractCity(event.location);
  const mapAddressQuery = streetAddress
    ? streetAddress.toLowerCase().includes(venueCity.toLowerCase())
      ? streetAddress
      : `${streetAddress}, ${venueCity}`
    : venueCity;

  // Dynamic Google Maps Embed Query
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapAddressQuery
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: template.colors.bg }}
    >
      <Navbar />

      {/* Hero Cover Image & Back Navigation */}
      <div className="relative w-full h-72 sm:h-96 overflow-hidden bg-[#1A1A2E]">
        <img
          src={event.cover_url || template.sampleCover}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 right-4 max-w-6xl mx-auto flex items-center justify-between z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-medium border border-white/20 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Gatherings
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20"
              style={{
                backgroundColor: template.colors.badgeBg,
                color: template.colors.primary,
              }}
            >
              {template.name} Vibe
            </span>

            <Link
              href={`/events/${event.id}/manage`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#1A1A2E] text-xs font-bold shadow-md transition-colors"
            >
              <Settings className="w-3.5 h-3.5" /> Host Controls
            </Link>
          </div>
        </div>

        {/* Hero Title & City Overlay */}
        <div className="absolute bottom-6 left-4 right-4 max-w-6xl mx-auto z-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
              <MapPin className="w-3 h-3 text-[#E8621A]" />
              {city}
            </span>
            {event.category && (
              <span className="text-xs uppercase tracking-wider font-semibold text-[#C9A84C] bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                {event.category}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight leading-tight max-w-3xl drop-shadow-md">
            {event.title}
          </h1>

          {event.tagline && (
            <p className="text-sm sm:text-base text-white/90 italic font-serif mt-1.5 max-w-2xl">
              {event.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-8 w-full flex-1">
        {/* Status Notice Banner if applicable */}
        <div className="mb-6">
          <StatusBanner
            status={event.status}
            approvalRequired={event.approval_required}
            isCapped={event.capacity > 0}
            capacity={event.capacity}
            confirmedCount={rsvps.length}
            startTime={event.start_time}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Logistics, Narrative, Speakers, Agenda, Gallery, FAQ, Comments */}
          <div className="lg:col-span-7 space-y-6">
            {/* Essential Logistics Card */}
            <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4DF]">
                {/* Date & Time formatted strictly in IST */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEF0E7] text-[#E8621A] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-[#8A8A8A]">
                      Date &amp; Time (IST)
                    </h3>
                    <p className="text-sm font-bold text-[#1A1A2E]">{formattedTimeRange}</p>
                    <span className="text-[11px] text-[#8A8A8A]">Asia/Kolkata timezone</span>
                  </div>
                </div>

                {/* Add to Calendar quick links */}
                <div className="flex items-center gap-1.5">
                  <a
                    href={googleCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#F9F7F4] hover:bg-[#F0EDE8] border border-[#E8E4DF] text-xs font-semibold text-[#1A1A2E] flex items-center gap-1 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#E8621A]" />
                    Google Cal
                  </a>
                  <button
                    onClick={() => downloadICSFile(event)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F9F7F4] hover:bg-[#F0EDE8] border border-[#E8E4DF] text-xs font-semibold text-[#1A1A2E] flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
                    .ics
                  </button>
                </div>
              </div>

              {/* Venue & Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#1A7A4A] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-[#8A8A8A]">
                    Location &amp; Venue
                  </h3>
                  <p className="text-sm font-bold text-[#1A1A2E]">
                    {event.venue_name || event.location || 'Bengaluru, Karnataka'}
                  </p>
                  {event.venue_name && event.location && (
                    <p className="text-xs text-[#4B4B4B]">{event.location}</p>
                  )}
                  {event.is_virtual && (
                    <span className="inline-block text-[11px] text-[#0F3460] font-semibold mt-0.5">
                      Virtual Gathering · Meeting link provided upon confirmed RSVP
                    </span>
                  )}
                </div>
              </div>

              {/* Embedded Google Map */}
              {!event.is_virtual && (
                <div className="h-44 w-full rounded-xl overflow-hidden border border-[#E8E4DF] mt-2">
                  <iframe
                    title="Event Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={mapEmbedUrl}
                  />
                </div>
              )}
            </div>

            {/* About / Description */}
            <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1A1A2E]">
                About this Gathering
              </h3>
              <div className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed whitespace-pre-line">
                {event.description || 'Join us for an exclusive gathering with great minds.'}
              </div>
            </div>

            {/* Toggleable Section 1: Speakers & Hosts */}
            {event.sections?.speakers && event.sections.speakers.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-[#1A1A2E]">
                    Featured Hosts &amp; Speakers
                  </h3>
                  <span className="text-[11px] font-semibold text-[#8A8A8A]">
                    {event.sections.speakers.length} Featured
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.sections.speakers.map((speaker, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] space-y-2 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#1A1A2E] text-[#C9A84C] flex items-center justify-center text-sm font-bold shadow-sm shrink-0 overflow-hidden">
                          {speaker.avatar_url ? (
                            <img
                              src={speaker.avatar_url}
                              alt={speaker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            speaker.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1A1A2E]">{speaker.name}</h4>
                          <p className="text-xs text-[#E8621A] font-medium">
                            {speaker.role} {speaker.company ? `· ${speaker.company}` : ''}
                          </p>
                        </div>
                      </div>
                      {speaker.bio && (
                        <p className="text-xs text-[#4B4B4B] leading-relaxed">{speaker.bio}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggleable Section 2: Curated Agenda */}
            {event.sections?.agenda && event.sections.agenda.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E8621A]" />
                  Evening Schedule
                </h3>
                <div className="divide-y divide-[#E8E4DF]">
                  {event.sections.agenda.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-start gap-4 text-left">
                      <span className="text-xs font-bold text-[#E8621A] font-mono shrink-0 w-20">
                        {item.time}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1A2E]">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-[#4B4B4B] mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggleable Section 3: Photo Gallery */}
            {event.sections?.gallery && event.sections.gallery.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A2E]">
                  Past Moments &amp; Ambiance
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.sections.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="h-28 rounded-xl overflow-hidden border border-[#E8E4DF] shadow-sm hover:scale-102 transition-transform"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggleable Section 4: AI FAQ Accordion */}
            {event.sections?.faq && event.sections.faq.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A2E]">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {event.sections.faq.map((item, idx) => (
                    <details
                      key={idx}
                      className="group p-3.5 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-left transition-all"
                    >
                      <summary className="text-xs sm:text-sm font-bold text-[#1A1A2E] cursor-pointer flex items-center justify-between list-none">
                        <span>{item.question}</span>
                        <span className="text-xs text-[#8A8A8A] group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <p className="text-xs text-[#4B4B4B] pt-2 mt-2 border-t border-[#E8E4DF]/60 leading-relaxed">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Date Poll */}
            <DatePoll />

            {/* Gated Community Board / Guest Comments */}
            <GuestComments eventId={event.id} />
          </div>

          {/* Right Column: RSVP Box, LiveCounter, WhoIsGoing, Share, Organizer */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Counter Pill */}
            <div className="flex items-center justify-between">
              <LiveCounter
                eventId={event.id}
                initialCount={rsvps.filter((r) => r.status === 'confirmed').length}
                capacity={event.capacity || 50}
              />
              <span className="text-[11px] font-semibold text-[#8A8A8A]">
                {event.approval_required ? 'Curated Admission' : 'Open RSVP'}
              </span>
            </div>

            {/* Primary RSVP Form */}
            <RSVPForm
              event={event}
              confirmedCount={rsvps.filter((r) => r.status === 'confirmed').length}
              rsvps={rsvps}
              onSuccess={(newRsvp) => {
                if (newRsvp) {
                  setRsvps((prev) => {
                    const cleanEmail = (newRsvp.guest_email || '').trim().toLowerCase();
                    const filtered = prev.filter(
                      (r) => (r.guest_email || '').trim().toLowerCase() !== cleanEmail
                    );
                    return [...filtered, newRsvp];
                  });
                }
                fetchEventRSVPs(event.id).then(setRsvps);
              }}
              onCancel={() => {
                fetchEventRSVPs(event.id).then(setRsvps);
              }}
            />

            {/* Who is Going Roster */}
            <WhoIsGoing
              eventId={event.id}
              rsvps={rsvps}
              totalCount={rsvps.filter((r) => r.status === 'confirmed').length}
              showAttendees={true}
            />

            {/* India-First WhatsApp Share Banner */}
            <ShareBanner event={event} />

            {/* Host Profile */}
            <OrganizerCard name={event.organizer_name || 'Swaniki Collective'} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

