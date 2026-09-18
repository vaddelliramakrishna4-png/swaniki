'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Flame,
  Music,
  Users,
  Moon,
} from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';

export function EmberTemplate() {
  const config = TEMPLATES.Ember;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] text-[#2B1207] selection:bg-[#EA580C]/20"
      style={{ backgroundColor: config.colors.bg }}
    >
      {/* Decorative Warm Firelight Glow */}
      <div className="fixed top-6 right-10 w-[500px] h-[500px] bg-[#EA580C]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-[#3F1A0B]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Hero Header */}
      <section className="relative w-full pt-14 pb-18 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEDD5] border border-[#FED7AA] text-xs font-semibold text-[#3F1A0B]">
          <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Ember Aesthetic · Burnt Ochre &amp; Twilight</span>
          <span className="text-[#EA580C]">✦</span>
          <span className="text-[#3F1A0B]/70">Acoustic Jam</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#3F1A0B] tracking-tight leading-[1.15]">
          Bandra Seafront Twilight{' '}
          <span className="italic text-[#EA580C] underline decoration-[#EA580C]/30 underline-offset-8">
            Acoustic &amp; Poetry
          </span>{' '}
          Sundowner
        </h1>

        <p className="text-sm sm:text-base text-[#2B1207]/80 max-w-2xl mx-auto leading-relaxed font-sans">
          A candlelit rooftop gathering overlooking the Arabian Sea in Bandra West.
          Unplugged fingerstyle guitars, Hindustani classical sitar, spoken word verses,
          and freshly baked sourdough pizzas under the evening stars.
        </p>

        {/* Logistics Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3F1A0B] pt-2">
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#FED7AA] shadow-sm">
            <Calendar className="w-4 h-4 text-[#EA580C]" />
            <span>Sun, 22 Sep · 5:30 PM IST</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#FED7AA] shadow-sm">
            <MapPin className="w-4 h-4 text-[#EA580C]" />
            <span>Carter Road Rooftop, Bandra West, Mumbai</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#FED7AA] shadow-sm">
            <Users className="w-4 h-4 text-[#3F1A0B]" />
            <span>50 Guests · Open RSVP</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        {/* Cover Photo */}
        <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(63,26,11,0.08)] border border-[#FED7AA] relative">
          <img
            src={config.sampleCover}
            alt="Ember Acoustic Gathering"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3F1A0B]/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white text-xs font-medium">
            Location: Sea Breeze Terrace, Carter Road, Mumbai
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#FED7AA] shadow-sm space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#3F1A0B] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#EA580C]" />
                The Gathering Vibe
              </h3>
              <p className="text-xs sm:text-sm text-[#2B1207]/80 leading-relaxed">
                As the golden hour sun sinks into the horizon, we gather on the open terrace with warm rugs,
                brass lanterns, and acoustic sets from 3 independent singer-songwriters.
                Bring an open mind, your warmest stories, and an acoustic instrument if you wish to join the post-sunset jam.
              </p>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl p-6 border border-[#FED7AA] shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#3F1A0B] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#EA580C]" />
                Twilight Schedule (IST)
              </h3>
              <div className="divide-y divide-[#FED7AA]">
                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#EA580C] w-20">5:30 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#3F1A0B]">Sunset Arrival &amp; Spiced Kulhad Chai</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Rooftop sea breeze &amp; ambient chords</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#EA580C] w-20">6:15 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#3F1A0B]">Acoustic Set: Kabir Varma &amp; Sitar</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Ragas woven with folk melodies</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#EA580C] w-20">7:15 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#3F1A0B]">Spoken Word &amp; Rooftop Poetry</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Stories of Bombay and longing</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#EA580C] w-20">8:15 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#3F1A0B]">Woodfired Pizzas &amp; Community Jam</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Fresh sourdough slices under fairy lights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: RSVP Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#FED7AA] shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase text-[#EA580C] tracking-wider">
                Open Community RSVP
              </span>
              <h4 className="font-serif text-base font-bold text-[#3F1A0B]">Reserve Your Spot</h4>
              <p className="text-xs text-[#4B4B4B] leading-relaxed">
                Free admission. 50 terrace cushions available on first-confirmed basis.
              </p>
              <button className="w-full py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs tracking-wide shadow-sm transition-all">
                Confirm RSVP
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
