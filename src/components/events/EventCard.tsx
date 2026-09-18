'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Users, Calendar, Sparkles } from 'lucide-react';
import { EventItem } from '@/types/database';
import { formatEventDateIST, extractCity } from '@/lib/date';
import { getTemplateConfig } from '@/lib/templates';

interface EventCardProps {
  event: EventItem;
  rsvpCount?: number;
}

export function EventCard({ event, rsvpCount = 18 }: EventCardProps) {
  const city = event.city || extractCity(event.location);
  const formattedDate = formatEventDateIST(event.start_time);
  const templateConfig = getTemplateConfig(event.theme_template);
  const isCapped = event.capacity && event.capacity > 0;
  const spotsLeft = isCapped ? Math.max(0, event.capacity - rsvpCount) : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(26,26,46,0.12)] flex flex-col transition-all"
    >
      <Link href={`/events/${event.slug || event.id}`} className="block relative">
        {/* Cover Image */}
        <div className="relative h-48 w-full overflow-hidden bg-[#16213E]">
          <img
            src={event.cover_url || templateConfig.sampleCover}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* City Badge & Template Pill */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-[#1A1A2E] backdrop-blur-md shadow-sm">
              <MapPin className="w-3 h-3 text-[#E8621A]" />
              {city}
            </span>
            {event.approval_required && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#C9A84C]/90 text-white backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5" />
                Curated
              </span>
            )}
          </div>

          {/* Template Badge on Top Right */}
          <div className="absolute top-3 right-3">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm"
              style={{
                backgroundColor: templateConfig.colors.badgeBg,
                color: templateConfig.colors.primary,
              }}
            >
              {templateConfig.name}
            </span>
          </div>

          {/* Category on bottom left of image */}
          {event.category && (
            <div className="absolute bottom-2.5 left-3">
              <span className="text-[11px] font-medium tracking-wide uppercase text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                {event.category}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Formatted Date strictly in IST */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8621A] mb-2 tracking-tight">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          {/* Title with Playfair / Inter blend */}
          <Link href={`/events/${event.slug || event.id}`}>
            <h3 className="text-lg font-bold text-[#1A1A2E] line-clamp-2 leading-snug group-hover:text-[#E8621A] transition-colors mb-2 font-['Inter']">
              {event.title}
            </h3>
          </Link>

          {/* Tagline or Description preview */}
          <p className="text-xs text-[#4B4B4B] line-clamp-2 leading-relaxed mb-4">
            {event.tagline || event.description || 'An exclusive gathering in ' + city}
          </p>
        </div>

        {/* Footer info: Capacity & Host */}
        <div className="pt-3 border-t border-[#E8E4DF] flex items-center justify-between text-xs text-[#4B4B4B]">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#8A8A8A]" />
            <span>
              {rsvpCount} going
              {isCapped && spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
                <span className="ml-1 text-[#E8621A] font-semibold">
                  · {spotsLeft} left!
                </span>
              )}
            </span>
          </div>

          <Link
            href={`/events/${event.slug || event.id}`}
            className="inline-flex items-center text-xs font-semibold text-[#1A1A2E] hover:text-[#E8621A] transition-colors"
          >
            RSVP & Details →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
