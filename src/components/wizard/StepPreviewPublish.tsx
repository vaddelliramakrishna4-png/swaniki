'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  Users,
  Shield,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { EventItem, EventTemplate } from '@/types/database';
import { getTemplateConfig } from '@/lib/templates';
import { formatEventDateIST, formatEventTimeRangeIST, extractCity } from '@/lib/date';
import { RSVPExtrasConfig } from './StepRSVPBuilder';

interface StepPreviewPublishProps {
  eventData: {
    name: string;
    tagline: string;
    description: string;
    template: EventTemplate | string;
    coverUrl: string;
    eventType: 'in-person' | 'online' | 'hybrid';
    startTime: string;
    endTime: string;
    location: string;
    venueName: string;
    onlineLink: string;
    capacity: number;
    isUnlimitedCapacity: boolean;
    isPublic: boolean;
    extras: RSVPExtrasConfig;
    customQuestions: any[];
    faq: { question: string; answer: string }[];
  };
  onPublish: () => void;
  publishing: boolean;
  publishingStatus?: string;
}

export function StepPreviewPublish({
  eventData,
  onPublish,
  publishing,
  publishingStatus = 'Publishing to Vibe by Swaniki...',
}: StepPreviewPublishProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  const templateConfig = getTemplateConfig(eventData.template);
  const city = extractCity(eventData.location);
  const formattedTime = formatEventDateIST(eventData.startTime);

  return (
    <div className="space-y-6">
      {/* Header & Device Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4DF]">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1A1A2E]">
            Step 6: Live Preview &amp; Publish
          </h3>
          <p className="text-xs text-[#4B4B4B] mt-0.5">
            Preview how your gathering appears to guests on mobile and desktop before launching live.
          </p>
        </div>

        {/* Viewport Toggle */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E8E4DF] shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              deviceMode === 'desktop'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              deviceMode === 'mobile'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>
      </div>

      {/* Preview Frame Container */}
      <div className="flex justify-center p-2 sm:p-6 bg-[#E8E4DF]/40 rounded-3xl border border-[#E8E4DF] overflow-x-auto">
        <div
          className={`transition-all duration-300 bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E8E4DF] ${
            deviceMode === 'mobile'
              ? 'w-[375px] my-4 ring-8 ring-[#1A1A2E]/80 rounded-[40px]'
              : 'w-full max-w-4xl'
          }`}
          style={{ backgroundColor: templateConfig.colors.bg }}
        >
          {/* Mobile Notch Indicator */}
          {deviceMode === 'mobile' && (
            <div className="h-6 bg-[#1A1A2E] w-full flex items-center justify-center">
              <div className="w-20 h-3 bg-black rounded-b-xl" />
            </div>
          )}

          {/* Event Cover Image Header */}
          <div className="relative w-full h-48 sm:h-72 overflow-hidden bg-[#1A1A2E]">
            <img
              src={eventData.coverUrl || templateConfig.sampleCover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute top-3 right-3">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm"
                style={{
                  backgroundColor: templateConfig.colors.badgeBg,
                  color: templateConfig.colors.primary,
                }}
              >
                {templateConfig.name} Aesthetic
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-semibold">
                  {city}
                </span>
                <span className="text-[#C9A84C] font-semibold uppercase text-[10px]">
                  {eventData.eventType}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-white leading-tight">
                {eventData.name || 'Untitled Event'}
              </h2>
            </div>
          </div>

          {/* Body Content Preview */}
          <div className="p-4 sm:p-6 space-y-6 text-[#0F0F0F]">
            {/* Tagline */}
            {eventData.tagline && (
              <p className="text-xs sm:text-sm font-serif italic text-[#C9A84C] font-medium leading-relaxed">
                &ldquo;{eventData.tagline}&rdquo;
              </p>
            )}

            {/* Logistics Card */}
            <div className="bg-white rounded-xl p-4 border border-[#E8E4DF] shadow-sm space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E8621A]" />
                <span className="font-bold text-[#1A1A2E]">{formattedTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1A7A4A]" />
                <span className="text-[#4B4B4B]">
                  {eventData.venueName ? `${eventData.venueName}, ${eventData.location}` : eventData.location}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-[#4B4B4B]">
                  {eventData.isUnlimitedCapacity ? 'Open capacity' : `Capacity: ${eventData.capacity} spots`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-4 border border-[#E8E4DF] shadow-sm space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
                About the Gathering
              </h4>
              <p className="text-xs text-[#4B4B4B] leading-relaxed whitespace-pre-line">
                {eventData.description || 'Event narrative details...'}
              </p>
            </div>

            {/* RSVP Form Preview */}
            <div className="bg-white rounded-xl p-4 border border-[#E8E4DF] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1A1A2E]">
                  Guest Registration Preview
                </h4>
                <span className="text-[10px] text-[#1A7A4A] font-semibold bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                  Instant RSVP
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 bg-[#F9F7F4] rounded-lg border border-[#E8E4DF] text-[#8A8A8A]">
                  Full Name *
                </div>
                <div className="p-2 bg-[#F9F7F4] rounded-lg border border-[#E8E4DF] text-[#8A8A8A]">
                  Email Address *
                </div>
                <div className="p-2 bg-[#F9F7F4] rounded-lg border border-[#E8E4DF] text-[#8A8A8A] font-mono">
                  🇮🇳 +91 WhatsApp Phone *
                </div>

                {eventData.extras.allowPlusOne && (
                  <div className="p-2 bg-[#F9F7F4] rounded-lg border border-[#E8E4DF] text-[#4B4B4B]">
                    ✓ +1 Guest RSVP enabled
                  </div>
                )}

                {eventData.extras.collectDietary && (
                  <div className="p-2 bg-[#F9F7F4] rounded-lg border border-[#E8E4DF] text-[#4B4B4B]">
                    ✓ Dietary preferences (Veg, Jain, Non-Veg)
                  </div>
                )}
              </div>

              {/* Accent Button strictly reserved for primary CTA */}
              <button
                type="button"
                className="w-full py-2.5 rounded-[10px] bg-[#E8621A] text-white font-bold text-xs shadow-md"
              >
                Confirm RSVP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Action Floating Bar */}
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E8E4DF] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.14)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            Ready to Launch on Vibe by Swaniki
          </span>
          <p className="text-[11px] text-[#8A8A8A]">
            Generates live public URL, WhatsApp share card, and calendar deep links.
          </p>
        </div>

        {/* Accent Button: Reserved strictly for single primary CTA */}
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing || !eventData.name.trim()}
          className="w-full sm:w-auto py-3 px-8 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] active:scale-95 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {publishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing Event...
            </>
          ) : (
            <>
              Publish Event Live <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Animated Publishing Modal Overlay */}
      {publishing && (
        <div className="fixed inset-0 z-50 bg-[#1A1A2E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-[#E8E4DF] space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-[#FFF5EE] border border-[#E8621A]/20 flex items-center justify-center mx-auto text-[#E8621A]">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1A1A2E]">
                Launching Your Gathering
              </h3>
              <p className="text-sm text-[#4B4B4B] mt-1.5 font-medium transition-all duration-300">
                {publishingStatus}
              </p>
            </div>

            {/* 3 Steps indicator */}
            <div className="space-y-2.5 text-left bg-[#F9F7F4] p-4 rounded-xl border border-[#E8E4DF] text-xs">
              <div
                className={`flex items-center gap-2.5 transition-colors ${
                  publishingStatus.includes('Saving')
                    ? 'text-[#E8621A] font-bold'
                    : publishingStatus.includes('Generating') || publishingStatus.includes('Publishing')
                    ? 'text-[#1A7A4A]'
                    : 'text-[#8A8A8A]'
                }`}
              >
                {publishingStatus.includes('Generating') || publishingStatus.includes('Publishing') ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1A7A4A] shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[#E8621A] animate-spin shrink-0" />
                )}
                <span>1. Saving your event...</span>
              </div>

              <div
                className={`flex items-center gap-2.5 transition-colors ${
                  publishingStatus.includes('Generating')
                    ? 'text-[#E8621A] font-bold'
                    : publishingStatus.includes('Publishing')
                    ? 'text-[#1A7A4A]'
                    : 'text-[#8A8A8A]'
                }`}
              >
                {publishingStatus.includes('Publishing') ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1A7A4A] shrink-0" />
                ) : publishingStatus.includes('Generating') ? (
                  <Loader2 className="w-4 h-4 text-[#E8621A] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#D4D0CA] shrink-0" />
                )}
                <span>2. Generating social share cards...</span>
              </div>

              <div
                className={`flex items-center gap-2.5 transition-colors ${
                  publishingStatus.includes('Publishing')
                    ? 'text-[#E8621A] font-bold'
                    : 'text-[#8A8A8A]'
                }`}
              >
                {publishingStatus.includes('Publishing') ? (
                  <Loader2 className="w-4 h-4 text-[#E8621A] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#D4D0CA] shrink-0" />
                )}
                <span>3. Publishing to Vibe by Swaniki...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
