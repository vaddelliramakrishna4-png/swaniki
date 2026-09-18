'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  Utensils,
  Leaf,
  Users,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function GroveTemplate() {
  const config = TEMPLATES.Grove;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] text-[#12261C] selection:bg-[#C9A84C]/20"
      style={{ backgroundColor: config.colors.bg }}
    >
      {/* Decorative Botanical Ambient Glow */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-[#14382A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-[#C9A84C]/8 rounded-full blur-2xl pointer-events-none" />

      {/* Hero Header with Playfair Display & Warm Brass */}
      <section className="relative w-full pt-12 pb-20 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        {/* Template & Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#D3DDD6] text-xs font-semibold text-[#14382A]">
          <Leaf className="w-3.5 h-3.5 text-[#14382A]" />
          <span>Grove Aesthetic · Botanical &amp; Brass</span>
          <span className="text-[#C9A84C]">✦</span>
          <span className="text-[#14382A]/70">Intimate Gathering</span>
        </div>

        {/* Title: Mix Playfair (italic, gold) + Inter headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#14382A] tracking-tight leading-[1.15]">
          A Candlelit Feast Under the{' '}
          <span className="italic text-[#C9A84C] underline decoration-[#C9A84C]/30 underline-offset-8">
            Indiranagar Palms
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#14382A]/80 max-w-2xl mx-auto font-sans leading-relaxed">
          An unhurried seven-course dinner and acoustic twilight salon for 35 founders, writers,
          and artists. Farm-to-table culinary creations, botanical sherbets, and candid conversations.
        </p>

        {/* Key Logistics Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#14382A] pt-2">
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#D3DDD6] shadow-sm">
            <Calendar className="w-4 h-4 text-[#C9A84C]" />
            <span>Sat, 14 Sep · 7:00 PM IST</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#D3DDD6] shadow-sm">
            <MapPin className="w-4 h-4 text-[#E8621A]" />
            <span>The Greenhouse Sanctuary, Indiranagar, Bengaluru</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#D3DDD6] shadow-sm">
            <Users className="w-4 h-4 text-[#14382A]" />
            <span>35 Spots · Curated Invitation</span>
          </div>
        </div>
      </section>

      {/* Main Narrative & Real Content Placeholders */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        {/* Cover Photo */}
        <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(20,56,42,0.12)] border border-[#D3DDD6] relative">
          <img
            src={config.sampleCover}
            alt="Grove Candlelit Gathering"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white text-xs font-medium">
            Photo: Olive Beach Courtyard, Bengaluru
          </div>
        </div>

        {/* Two-Column Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Story, Tasting Menu, Ambiance */}
          <div className="md:col-span-2 space-y-6">
            {/* The Experience */}
            <div className="bg-white rounded-2xl p-6 border border-[#D3DDD6] shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#14382A] flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#C9A84C]" />
                The Experience
              </h3>
              <p className="text-xs sm:text-sm text-[#14382A]/80 leading-relaxed">
                Step off the bustle of 12th Main into a secluded open-air courtyard draped in bougainvillea
                and warm brass lanterns. Tonight is intentionally unhurried — no slide decks or pitches.
                Just high-signal individuals sharing reflections over slow-cooked regional dishes and cold botanical infusions.
              </p>
            </div>

            {/* Farm-to-Table Menu */}
            <div className="bg-white rounded-2xl p-6 border border-[#D3DDD6] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[#14382A] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#C9A84C]" />
                  Seven-Course Tasting Menu
                </h3>
                <span className="text-[11px] font-semibold text-[#C9A84C] bg-[#FDF6E7] px-2.5 py-0.5 rounded-full border border-[#C9A84C]/20">
                  By Chef Tara Sen
                </span>
              </div>

              <div className="space-y-3 text-xs divide-y divide-[#D3DDD6]/60">
                <div className="pt-2">
                  <h4 className="font-bold text-[#14382A]">Course I · Raw Jackfruit &amp; Curry Leaf Tartlets</h4>
                  <p className="text-[#14382A]/70 mt-0.5">Fermented rice flour base, toasted Coorg peppercorn dust.</p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-[#14382A]">Course II · Smoked Gondhoraj Lime Sherbet</h4>
                  <p className="text-[#14382A]/70 mt-0.5">Palate cleanser with wild honey and Himalayan pink salt.</p>
                </div>
                <div className="pt-3">
                  <h4 className="font-bold text-[#14382A]">Course III · Claypot Morel Mushroom Pulao</h4>
                  <p className="text-[#14382A]/70 mt-0.5">Sealed with dough and baked over tamarind wood embers.</p>
                </div>
              </div>
            </div>

            {/* Ambiance & Schedule */}
            <div className="bg-white rounded-2xl p-6 border border-[#D3DDD6] shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#14382A] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#14382A]" />
                Evening Flow
              </h3>
              <ul className="space-y-2 text-xs text-[#14382A]/80">
                <li className="flex items-center gap-2">
                  <strong className="text-[#C9A84C]">7:00 PM</strong> · Welcome Spiced Kombuchas &amp; Courtyard Acoustic Strings
                </li>
                <li className="flex items-center gap-2">
                  <strong className="text-[#C9A84C]">8:00 PM</strong> · Seated Family-Style Dinner Begins
                </li>
                <li className="flex items-center gap-2">
                  <strong className="text-[#C9A84C]">9:30 PM</strong> · Lantern Reflections &amp; Filter Coffee Digestifs
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: RSVP Box */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#D3DDD6] shadow-md space-y-4 text-center">
              <span className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-wider block">
                Exclusive Invitation
              </span>
              <h4 className="font-serif text-lg font-bold text-[#14382A]">
                Reserve Your Place
              </h4>
              <p className="text-xs text-[#14382A]/70 leading-relaxed">
                Admission is curated by host Tara Sen to ensure a balanced, thoughtful room.
              </p>

              <div className="p-3 rounded-xl bg-[#E7EFEA] border border-[#D3DDD6] text-xs font-bold text-[#14382A]">
                Only 8 seats remaining
              </div>

              {/* Accent Button: Reserved strictly for primary CTA */}
              <button className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-xs shadow-md transition-all">
                Request an Invitation
              </button>

              <p className="text-[10px] text-[#14382A]/60">
                Confirmed guests receive precise venue gate code via WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-[#D3DDD6] text-xs text-center text-[#14382A]/80">
              Hosted with pride on <strong className="text-[#14382A]">Vibe by Swaniki</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
