import React from 'react';
import { EventItem } from '@/types/database';
import { formatEventDateIST, extractCity } from '@/lib/date';

interface EmailTemplateProps {
  event: EventItem;
  guestName: string;
  isApproval?: boolean;
}

export function EmailTemplate({ event, guestName, isApproval = false }: EmailTemplateProps) {
  const formattedDate = formatEventDateIST(event.start_time);
  const city = event.city || extractCity(event.location);

  return (
    <div className="max-w-xl mx-auto bg-[#F9F7F4] p-8 rounded-2xl border border-[#E8E4DF] font-['Inter',sans-serif] text-[#0F0F0F]">
      {/* Brand Header */}
      <div className="text-center pb-6 border-b border-[#E8E4DF]">
        <span className="text-xs uppercase tracking-widest text-[#C9A84C] font-semibold">
          Vibe by Swaniki
        </span>
        <h2 className="text-2xl font-serif font-bold text-[#1A1A2E] mt-1">
          {isApproval ? 'Your Request is Under Review' : 'Your RSVP is Confirmed!'}
        </h2>
      </div>

      {/* Greeting */}
      <div className="py-6 space-y-4 text-sm leading-relaxed text-[#4B4B4B]">
        <p>
          Hello <strong className="text-[#0F0F0F]">{guestName}</strong>,
        </p>

        {isApproval ? (
          <p>
            Thank you for requesting an invitation to{' '}
            <strong className="text-[#0F0F0F]">{event.title}</strong>. The host is reviewing
            attendees to ensure a high-signal, intimate gathering. You will receive an update shortly.
          </p>
        ) : (
          <p>
            We are thrilled to welcome you to{' '}
            <strong className="text-[#0F0F0F]">{event.title}</strong>. Your spot has been reserved.
          </p>
        )}

        {/* Event Details Card */}
        <div className="bg-white rounded-xl p-5 border border-[#E8E4DF] shadow-sm space-y-2">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#8A8A8A] font-semibold">
              Date &amp; Time (IST)
            </span>
            <p className="text-sm font-bold text-[#E8621A]">{formattedDate}</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#8A8A8A] font-semibold">
              Venue &amp; City
            </span>
            <p className="text-sm font-medium text-[#1A1A2E]">
              {event.venue_name ? `${event.venue_name}, ${city}` : event.location || city}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#8A8A8A] pt-4 border-t border-[#E8E4DF]">
          Have questions? Reply directly to this email or visit the event page for directions and live updates.
        </p>
      </div>

      <div className="text-center pt-4 text-[11px] text-[#8A8A8A]">
        © 2026 Vibe by Swaniki. India-first curated gatherings.
      </div>
    </div>
  );
}
