'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Palette,
  Users,
  Feather,
} from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';

export function BloomTemplate() {
  const config = TEMPLATES.Bloom;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] text-[#2D1518] selection:bg-[#E8621A]/20"
      style={{ backgroundColor: config.colors.bg }}
    >
      {/* Decorative Warm Terracotta Petal Ambient */}
      <div className="fixed top-12 left-10 w-96 h-96 bg-[#4C1D24]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-[#E8621A]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <section className="relative w-full pt-14 pb-18 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF0EC] border border-[#F2E4DE] text-xs font-semibold text-[#4C1D24]">
          <Palette className="w-3.5 h-3.5 text-[#E8621A]" />
          <span>Bloom Aesthetic · Editorial Terracotta &amp; Rose</span>
          <span className="text-[#E8621A]">✦</span>
          <span className="text-[#4C1D24]/70">Cultural Salon</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#4C1D24] tracking-tight leading-[1.15]">
          Kala Ghoda Heritage &amp;{' '}
          <span className="italic text-[#E8621A] underline decoration-[#E8621A]/30 underline-offset-8">
            Type Design
          </span>{' '}
          Salon
        </h1>

        <p className="text-sm sm:text-base text-[#2D1518]/80 max-w-2xl mx-auto leading-relaxed">
          An intimate gathering inside a restored colonial printing press in South Mumbai.
          Master calligraphers and independent type foundries meet to celebrate centuries of
          Devanagari and Urdu lettering reimagined for modern digital interfaces.
        </p>

        {/* Logistics Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#4C1D24] pt-2">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#F2E4DE] shadow-sm">
            <Calendar className="w-4 h-4 text-[#E8621A]" />
            <span>Sat, 21 Sep · 5:00 PM IST</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#F2E4DE] shadow-sm">
            <MapPin className="w-4 h-4 text-[#4C1D24]" />
            <span>Kala Ghoda Art District, Fort, Mumbai</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#F2E4DE] shadow-sm">
            <Users className="w-4 h-4 text-[#4C1D24]" />
            <span>35 Invitations · RSVP Protected</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        {/* Cover Photo */}
        <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(76,29,36,0.08)] border border-[#F2E4DE] relative">
          <img
            src={config.sampleCover}
            alt="Bloom Cultural Salon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D24]/75 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white text-xs font-medium">
            Location: The Heritage Press Courtyard, Kala Ghoda, Mumbai
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#F2E4DE] shadow-sm space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#4C1D24] flex items-center gap-2">
                <Feather className="w-5 h-5 text-[#E8621A]" />
                The Cultural Showcase
              </h3>
              <p className="text-xs sm:text-sm text-[#2D1518]/80 leading-relaxed">
                Experience hand-cut movable metal types from 1890, live brush calligraphy on handmade rice paper,
                and keynote showcases by contemporary Indian designers releasing variable fonts for regional Indian languages.
                Artisanal monsoon teas, organic natural wines, and Parsi bakery treats served throughout.
              </p>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl p-6 border border-[#F2E4DE] shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#4C1D24] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E8621A]" />
                Salon Itinerary (IST)
              </h3>
              <div className="divide-y divide-[#F2E4DE]">
                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#E8621A] w-20">5:00 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#4C1D24]">Twilight Courtyard Arrival &amp; Spiced Chai</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Letterpress broadside viewing</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#E8621A] w-20">5:45 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#4C1D24]">Live Calligraphy Performance</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Ustad Ghulam Nabi on Urdu Nasta&apos;liq</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#E8621A] w-20">6:45 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#4C1D24]">Modern Typography Panel</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Variable font design for 22 Indian languages</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#E8621A] w-20">8:00 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#4C1D24]">Wine, Cheese &amp; Parsi Savouries</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Community conversation and print swaps</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: RSVP Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#F2E4DE] shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase text-[#E8621A] tracking-wider">
                Invitation Only
              </span>
              <h4 className="font-serif text-base font-bold text-[#4C1D24]">Reserve Your Place</h4>
              <p className="text-xs text-[#4B4B4B] leading-relaxed">
                Space is limited to 35 guests in the restored pressroom. Host approval required.
              </p>
              <button className="w-full py-3 px-4 rounded-xl bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-xs tracking-wide shadow-sm transition-all">
                Request Invitation
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
