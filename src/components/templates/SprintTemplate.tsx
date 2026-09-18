'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Terminal,
  Zap,
  Users,
} from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';

export function SprintTemplate() {
  const config = TEMPLATES.Sprint;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] text-[#0F172A] selection:bg-[#10B981]/20"
      style={{ backgroundColor: config.colors.bg }}
    >
      {/* Dynamic Grid Background Accent */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#E0E7FF22_1px,transparent_1px),linear-gradient(to_bottom,#E0E7FF22_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Hero Header */}
      <section className="relative w-full pt-12 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#E0E7FF] text-xs font-bold text-[#1E1B4B]">
          <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Sprint Aesthetic · Kinetic Dev &amp; High Energy</span>
          <span className="text-[#10B981]">●</span>
          <span className="text-[#1E1B4B]/70">Builders Salon</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E1B4B] tracking-tight leading-[1.12]">
          Autonomous Agents &amp;{' '}
          <span className="text-[#10B981] font-mono underline decoration-[#10B981]/40 underline-offset-8">
            Local Inference
          </span>{' '}
          Demo Night
        </h1>

        <p className="text-sm sm:text-base text-[#0F172A]/80 max-w-2xl mx-auto leading-relaxed">
          40 engineers, researchers, and systems architects building with quantized models, WebGPU,
          and tool autonomy. 5-minute unscripted terminal demos, filter coffee, and rooftop craft brews.
        </p>

        {/* Logistics Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#1E1B4B] pt-2">
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#E0E7FF] shadow-sm">
            <Calendar className="w-4 h-4 text-[#10B981]" />
            <span>Thu, 19 Sep · 6:30 PM IST</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#E0E7FF] shadow-sm">
            <MapPin className="w-4 h-4 text-[#E8621A]" />
            <span>Koramangala 4th Block, Bengaluru</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#E0E7FF] shadow-sm">
            <Users className="w-4 h-4 text-[#1E1B4B]" />
            <span>40 Seats · Strict Approval</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        {/* Cover Photo */}
        <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(30,27,75,0.08)] border border-[#E0E7FF] relative">
          <img
            src={config.sampleCover}
            alt="Sprint Demo Night"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white text-xs font-mono">
            Location: Indiranagar Tech Hub Terrace, Bengaluru
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E0E7FF] shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#10B981]" />
                The Protocol
              </h3>
              <p className="text-xs sm:text-sm text-[#0F172A]/80 leading-relaxed">
                No slide decks. Only terminal windows, repo walk-throughs, and benchmark charts.
                Each builder receives 5 minutes on the 4K projector followed by open peer grilling.
                Local models running on Mac Studio M3 Max and private GPU pods provided on-site.
              </p>
            </div>

            {/* Terminal Schedule */}
            <div className="bg-white rounded-2xl p-6 border border-[#E0E7FF] shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#10B981]" />
                Sprint Schedule (IST)
              </h3>
              <div className="divide-y divide-[#E0E7FF]">
                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#10B981] w-20">6:30 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E1B4B]">Doors Open &amp; Cold Brews</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">WiFi setup &amp; test displays</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#10B981] w-20">7:15 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E1B4B]">Demo Track 1: Multimodal Tool Use</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">3 live demos (5 min + Q&amp;A)</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#10B981] w-20">8:30 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E1B4B]">Demo Track 2: On-Device Quantization</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Running 70B models on edge laptops</p>
                  </div>
                </div>

                <div className="py-3 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[#10B981] w-20">9:30 PM</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E1B4B]">Sourdough Pizzas &amp; Hacker Mixer</h4>
                    <p className="text-xs text-[#4B4B4B] mt-0.5">Rooftop conversations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: RSVP Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#E0E7FF] shadow-sm space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase text-[#10B981] tracking-wider">
                Admission Protocol
              </span>
              <h4 className="text-base font-bold text-[#1E1B4B]">Apply for a Demo Seat</h4>
              <p className="text-xs text-[#4B4B4B] leading-relaxed">
                Admission requires submitting a GitHub repo or live project link. We approve 40 seats.
              </p>
              <button className="w-full py-3 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs tracking-wide shadow-sm transition-all">
                Submit Builder Application
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
