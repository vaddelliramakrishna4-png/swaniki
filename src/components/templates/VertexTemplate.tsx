'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Shield,
  Briefcase,
  Terminal,
  Users,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function VertexTemplate() {
  const config = TEMPLATES.Vertex;

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] text-[#0F172A] selection:bg-[#F59E0B]/20"
      style={{ backgroundColor: config.colors.bg }}
    >
      {/* Sharp High-Contrast Hero Banner */}
      <section className="relative w-full bg-[#0B0F19] text-white pt-16 pb-20 px-4 sm:px-6 overflow-hidden border-b border-white/10">
        {/* Sleek Grid Lines & Neon Amber Accents */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Executive Protocol Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FEF3C7] text-[#92400E] text-xs font-bold font-mono uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> Chatham House Rule
            </span>
            <span className="text-xs font-mono text-[#F59E0B] tracking-wider uppercase">
              // Vertex Executive Summit 2026
            </span>
          </div>

          {/* Sharp Modern Sans Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Sovereign Compute &amp; India&apos;s Agentic Horizon
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl font-normal leading-relaxed">
            A closed-door executive roundtable bringing together 40 Managing Partners, enterprise
            CTOs, and infrastructure founders. Off-the-record discussions on silicon independence,
            data center power grid dynamics, and enterprise agent deployments.
          </p>

          {/* Logistics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-[#F59E0B] block mb-1">DATE &amp; TIME</span>
              <strong className="text-white">Thu, 26 Sep · 6:30 PM IST</strong>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-[#F59E0B] block mb-1">LOCATION</span>
              <strong className="text-white">The Oberoi Executive Lounge, CyberCity, Gurgaon</strong>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-[#F59E0B] block mb-1">DELEGATION</span>
              <strong className="text-white">40 C-Level &amp; General Partners</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Summit Agenda & Keynotes */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Keynote Speakers Lineup */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="font-bold text-lg text-[#0F172A] tracking-tight">
              Confirmed Keynote &amp; Discussion Leaders
            </h3>
            <span className="text-xs font-mono text-[#64748B]">All 4 Keynotes On-Site</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-base font-mono shrink-0">
                RN
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">Raghav Narayanan</h4>
                <p className="text-xs text-[#F59E0B] font-semibold">General Partner, Bharat Seed Capital</p>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Leading investments in compute clusters, custom ASICs, and foundational Indian language models.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-base font-mono shrink-0">
                DK
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">Dr. Divya Krishnan</h4>
                <p className="text-xs text-[#F59E0B] font-semibold">Chief Scientist, Vayu Robotics Labs</p>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Former Director of Autonomy at DARPA; currently architecting low-latency edge inference nodes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Executive Agenda */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#F59E0B]" />
            Closed-Door Summit Schedule
          </h3>

          <div className="divide-y divide-[#E2E8F0]">
            <div className="py-3.5 flex items-start gap-6 text-xs">
              <span className="font-mono font-bold text-[#0F172A] w-20 shrink-0">6:30 PM</span>
              <div>
                <h5 className="font-bold text-[#0F172A]">Executive Briefing &amp; Private Reception</h5>
                <p className="text-[#64748B] mt-0.5">Signature single malts &amp; networking in the Presidential Suite.</p>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-6 text-xs">
              <span className="font-mono font-bold text-[#0F172A] w-20 shrink-0">7:15 PM</span>
              <div>
                <h5 className="font-bold text-[#0F172A]">Roundtable: GPU Cluster Allocation &amp; Sovereign Cloud</h5>
                <p className="text-[#64748B] mt-0.5">Off-the-record panel moderated by Raghav Narayanan.</p>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-6 text-xs">
              <span className="font-mono font-bold text-[#0F172A] w-20 shrink-0">8:30 PM</span>
              <div>
                <h5 className="font-bold text-[#0F172A]">Curated 4-Course Dinner &amp; Unstructured Syndicate Talks</h5>
                <p className="text-[#64748B] mt-0.5">Closed-door dinner hosted by the Bharat AI Alliance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="p-6 bg-[#0B0F19] rounded-xl border border-white/10 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base text-white">Delegation Request</h4>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              C-Suite credentials and company affiliation required for badge clearance.
            </p>
          </div>

          <button className="py-2.5 px-6 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0F19] font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0">
            Apply for Delegation
          </button>
        </div>
      </main>
    </div>
  );
}
