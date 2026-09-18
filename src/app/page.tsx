'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Search,
  Plus,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  MessageCircle,
  LayoutGrid,
  Map as MapIcon,
  CheckCircle2,
  Check,
  Wand2,
  Share2,
  ShieldCheck,
  Zap,
  Users,
  Compass,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { EventCard } from '@/components/events/EventCard';
import { EventItem, EventTemplate } from '@/types/database';
import { fetchEvents } from '@/lib/events';
import { extractCity } from '@/lib/date';
import { TEMPLATES } from '@/lib/templates';

const TEMPLATE_PREVIEWS: {
  key: EventTemplate;
  name: string;
  theme: string;
  palette: string;
  headline: string;
  tagline: string;
  cover: string;
  bgGradient: string;
}[] = [
  {
    key: 'Grove',
    name: 'Grove',
    theme: 'Warm Botanical & Brass',
    palette: '#14382A / #C9A84C',
    headline: 'Old Delhi Heritage & Modern Typography Dinner',
    tagline: 'Preserving Urdu calligraphy and reimagining Indian digital design',
    cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#14382A] via-[#0D241B] to-[#1A1A2E]',
  },
  {
    key: 'Sprint',
    name: 'Sprint',
    theme: 'Kinetic Tech & Electric Lime',
    palette: '#1E1B4B / #10B981',
    headline: 'Bengaluru AI Founders & Builders Salon',
    tagline: 'An intimate evening of deep-tech demos and fireside discussions in Indiranagar',
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#1E1B4B] via-[#0F172A] to-[#1A1A2E]',
  },
  {
    key: 'Bloom',
    name: 'Bloom',
    theme: 'Editorial Terracotta & Rose',
    palette: '#4C1D24 / #E8621A',
    headline: 'Vagator Sunset Natural Wine & Vinyl Salon',
    tagline: 'Low-intervention Indian pet-nats, coastal tapas, and rare disco records',
    cover: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#4C1D24] via-[#2A0F14] to-[#1A1A2E]',
  },
  {
    key: 'Vertex',
    name: 'Vertex',
    theme: 'Sharp Obsidian & Amber Gold',
    palette: '#0B0F19 / #F59E0B',
    headline: 'Frontier Biotech & Longevity Supper Club',
    tagline: 'Connecting computational biology researchers with venture builders',
    cover: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#0B0F19] via-[#111827] to-[#1A1A2E]',
  },
  {
    key: 'Ember',
    name: 'Ember',
    theme: 'Burnt Ochre & Warm Twilight',
    palette: '#3F1A0B / #EA580C',
    headline: 'Bandra Sunset Acoustic & Poetry Sundowner',
    tagline: 'Warm golden hour chords overlooking the Arabian Sea',
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    bgGradient: 'from-[#3F1A0B] via-[#240F07] to-[#1A1A2E]',
  },
];

const ACCESS_FILTERS = ['All Access', 'Free Only', 'Curated Review'];
const FORMAT_FILTERS = ['All Formats', 'In-Person', 'Online', 'Hybrid'];
const TIMING_FILTERS = ['All Dates', 'This Weekend'];

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);

  // Discover Feed State: Dynamic Locations with zero restriction to 4 cities
  const [selectedCity, setSelectedCity] = useState('All Locations');
  const [selectedAccess, setSelectedAccess] = useState('All Access');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [selectedTiming, setSelectedTiming] = useState('All Dates');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetchEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  // Compute all active cities dynamically from live events in database
  const dynamicCities = React.useMemo(() => {
    const citySet = new Set<string>();
    events.forEach((ev) => {
      const c = (ev.city || extractCity(ev.location) || '').trim();
      if (
        c &&
        c.toLowerCase() !== 'all locations' &&
        c.toLowerCase() !== 'all cities'
      ) {
        citySet.add(c);
      }
    });
    const sorted = Array.from(citySet).sort((a, b) => a.localeCompare(b));
    return ['All Locations', ...sorted];
  }, [events]);

  // Auto-cycle through template previews every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTemplateIdx((prev) => (prev + 1) % TEMPLATE_PREVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const isDateThisWeekend = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const day = d.getDay();
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return (day === 5 || day === 6 || day === 0) && diffDays >= 0 && diffDays <= 7;
  };

  const filteredEvents = events.filter((ev) => {
    const city = (ev.city || extractCity(ev.location) || '').trim();
    if (
      selectedCity !== 'All Locations' &&
      selectedCity !== 'All Cities' &&
      city.toLowerCase() !== selectedCity.toLowerCase() &&
      !ev.location?.toLowerCase().includes(selectedCity.toLowerCase())
    ) {
      return false;
    }
    if (selectedAccess === 'Free Only' && ev.approval_required) {
      return false;
    }
    if (selectedAccess === 'Curated Review' && !ev.approval_required) {
      return false;
    }
    if (selectedFormat === 'In-Person' && ev.is_virtual) {
      return false;
    }
    if (selectedFormat === 'Online' && !ev.is_virtual) {
      return false;
    }
    if (selectedFormat === 'Hybrid' && (!ev.location || !ev.venue_name)) {
      return false;
    }
    if (selectedTiming === 'This Weekend' && !isDateThisWeekend(ev.start_time)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      const matchCity = city.toLowerCase().includes(q);
      const matchLoc = ev.location?.toLowerCase().includes(q);
      const matchVenue = ev.venue_name?.toLowerCase().includes(q);
      const matchCategory = ev.category?.toLowerCase().includes(q);
      if (
        !matchTitle &&
        !matchDesc &&
        !matchCity &&
        !matchLoc &&
        !matchVenue &&
        !matchCategory
      ) {
        return false;
      }
    }
    return true;
  });

  const displayedEvents = filteredEvents.slice(0, visibleCount);
  const mapCenterQuery =
    selectedCity !== 'All Locations' && selectedCity !== 'All Cities'
      ? `${selectedCity}, India`
      : 'Bengaluru, India';
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapCenterQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`;

  const currentTemplate = TEMPLATE_PREVIEWS[activeTemplateIdx];

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      {/* 1. Full-Viewport Hero with Template Cycler */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between pt-8 sm:pt-12 pb-12 px-4 sm:px-6 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Subtle Background Ambience */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A84C]/8 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Header & 72px Headline */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-4 sm:pt-8">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E4DF] shadow-sm text-xs font-semibold text-[#1A1A2E]">
            <span className="w-2 h-2 rounded-full bg-[#1A7A4A] animate-pulse" />
            <span>India&apos;s Whitelabel Gathering Engine</span>
            <span className="text-[#C9A84C]">✦</span>
            <span className="text-[#8A8A8A] font-normal">Free in v1</span>
          </div>

          {/* 72px Headline: Bold Inter + Italic Gold Playfair Display */}
          <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-extrabold text-[#1A1A2E] tracking-tight leading-[1.08] font-sans">
            Craft Extraordinary Salons &amp; Evenings{' '}
            <span className="font-serif italic text-[#C9A84C] font-normal underline decoration-[#C9A84C]/30 underline-offset-8">
              Across Any City.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-[#4B4B4B] max-w-2xl mx-auto font-sans leading-relaxed">
            The lightweight, AI-powered platform tailored for private founder dinners, acoustic sundowners, and deep tech salons. WhatsApp-first invites, IST timekeeping, and bespoke aesthetic templates.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/create"
              className="w-full sm:w-auto py-3.5 px-7 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] active:scale-95 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Host Your Next Vibe</span>
            </Link>

            <a
              href="#explore"
              className="w-full sm:w-auto py-3.5 px-6 rounded-[10px] bg-white border border-[#C8C4BF] hover:bg-[#F0EDE8] text-[#1A1A2E] font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#8A8A8A]" />
              <span>Explore Gatherings</span>
            </a>
          </div>
        </div>

        {/* Live Template Cycler Card */}
        <div className="relative z-10 max-w-4xl mx-auto w-full pt-10">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E8E4DF] bg-[#1A1A2E] transition-all duration-700">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTemplate.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="relative h-72 sm:h-96 w-full flex flex-col justify-end p-6 sm:p-10 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTemplate.cover}
                  alt={currentTemplate.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${currentTemplate.bgGradient} opacity-90`}
                />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-2 text-white max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>
                      Template: {currentTemplate.name} · {currentTemplate.theme}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-white leading-tight">
                    {currentTemplate.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#C9A84C] italic font-serif">
                    &ldquo;{currentTemplate.tagline}&rdquo;
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Template Selector Thumbnails / Bar */}
            <div className="bg-[#1A1A2E]/95 backdrop-blur-md p-3 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {TEMPLATE_PREVIEWS.map((tmpl, idx) => (
                  <button
                    key={tmpl.key}
                    onClick={() => setActiveTemplateIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      activeTemplateIdx === idx
                        ? 'bg-[#E8621A] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{tmpl.name}</span>
                    <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
                      ({tmpl.palette})
                    </span>
                  </button>
                ))}
              </div>

              <Link
                href="/templates"
                className="text-xs text-[#C9A84C] font-semibold hover:underline whitespace-nowrap px-2"
              >
                View All 5 Themes &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Platform Stat Bar */}
      <section className="bg-[#1A1A2E] text-white py-6 border-y border-[#16213E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-around gap-6 text-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C9A84C]">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-bold font-serif text-white">
                {events.length > 0 ? `${events.length} Curated Salon${events.length > 1 ? 's' : ''}` : 'Curated Salons'}
              </div>
              <div className="text-xs text-[#8A8A8A]">Active gatherings across India</div>
            </div>
          </div>

          <div className="h-8 w-px bg-white/15 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#1A7A4A]">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-bold font-serif text-white">
                {(() => {
                  const totalRsvps = events.reduce((acc, ev) => acc + (ev.rsvp_count || 0), 0);
                  return totalRsvps > 0 ? `${totalRsvps} Confirmed RSVP${totalRsvps > 1 ? 's' : ''}` : 'Live Real-time RSVPs';
                })()}
              </div>
              <div className="text-xs text-[#8A8A8A]">High-signal founders, artists &amp; guests</div>
            </div>
          </div>

          <div className="h-8 w-px bg-white/15 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E8621A]">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-bold font-serif text-white">
                {(() => {
                  const cities = Array.from(
                    new Set(
                      events
                        .map((ev) => ev.city || extractCity(ev.location))
                        .filter(Boolean)
                        .map((c) => c.trim())
                    )
                  );
                  return cities.length > 0
                    ? `${cities.length} Active Hub${cities.length > 1 ? 's' : ''}`
                    : 'Pan-India & Global';
                })()}
              </div>
              <div className="text-xs text-[#8A8A8A] max-w-xs truncate">
                {(() => {
                  const cities = Array.from(
                    new Set(
                      events
                        .map((ev) => ev.city || extractCity(ev.location))
                        .filter(Boolean)
                        .map((c) => c.trim())
                    )
                  );
                  return cities.length > 0
                    ? cities.join(' · ')
                    : 'Open across all cities & neighborhoods';
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3-Column Feature Section */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-[#E8621A]">
            Built for Modern Hosts
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#1A1A2E]">
            Everything You Need for High-Signal Events
          </h2>
          <p className="text-sm text-[#4B4B4B] leading-relaxed">
            Eliminate generic event forms. Vibe gives you editorial polish, automated AI writing, and instant WhatsApp creatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Templates */}
          <div className="bg-white rounded-3xl border border-[#E8E4DF] p-7 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#14382A]/10 text-[#14382A] flex items-center justify-center">
              <Layers className="w-6 h-6 text-[#14382A]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A2E]">5 Signature Aesthetics</h3>
            <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed">
              Designed with bespoke typography, curated color palettes, and parchment tones. Switch between Grove, Sprint, Bloom, Vertex, and Ember with 1 click.
            </p>
            <ul className="text-xs text-[#1A1A2E] space-y-2 pt-2 border-t border-[#E8E4DF]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> Custom brand colors &amp; fonts
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> Responsive sticky mobile bar
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> Realtime live counter &amp; roster
              </li>
            </ul>
          </div>

          {/* Feature 2: Gemini AI Content */}
          <div className="bg-white rounded-3xl border border-[#E8E4DF] p-7 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A84C]/15 text-[#C9A84C] flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-[#C9A84C]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A2E]">Gemini 1.5 Flash AI Copy</h3>
            <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed">
              Stream word-by-word descriptions, punchy taglines, Indian-context FAQs, and WhatsApp broadcast captions in seconds.
            </p>
            <ul className="text-xs text-[#1A1A2E] space-y-2 pt-2 border-t border-[#E8E4DF]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> WhatsApp-ready copy with emojis
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> Auto-generated agenda &amp; FAQs
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> Full editorial control before publish
              </li>
            </ul>
          </div>

          {/* Feature 3: Social Banners */}
          <div className="bg-white rounded-3xl border border-[#E8E4DF] p-7 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E8621A]/10 text-[#E8621A] flex items-center justify-center">
              <Share2 className="w-6 h-6 text-[#E8621A]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A2E]">1-Click Social Banners</h3>
            <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed">
              Automated Satori image engine generates promotional graphics with your cover image, host branding, and IST date strip.
            </p>
            <ul className="text-xs text-[#1A1A2E] space-y-2 pt-2 border-t border-[#E8E4DF]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> WhatsApp 16:9 banner (1280x720)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> Instagram Story 9:16 (1080x1920)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> Download all as 1-click ZIP
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Single Honest Pricing Card */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-[#E8E4DF] p-8 sm:p-12 shadow-sm text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF0E7] text-[#E8621A] text-xs font-bold uppercase tracking-wider">
            Honest Pricing
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#1A1A2E]">
              Free forever, for now.
            </h2>
            <p className="text-xs sm:text-sm text-[#4B4B4B] max-w-lg mx-auto leading-relaxed">
              No hidden fees, no ticketing platform cuts, and no credit card required. Free in v1 while we build the future of Indian gatherings.
            </p>
          </div>

          <div className="py-4 border-y border-[#E8E4DF] flex flex-wrap items-center justify-center gap-6 text-xs text-[#1A1A2E] font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" /> Unlimited Gatherings
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" /> Gemini AI Copywriter
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" /> Resend White-Labeled Emails
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" /> CSV Attendee Exports
            </div>
          </div>

          <div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[10px] bg-[#1A1A2E] hover:bg-[#16213E] active:scale-95 text-white font-bold text-sm tracking-wide shadow-md transition-all"
            >
              <span>Get Started in 60 Seconds</span>
              <ArrowRight className="w-4 h-4 text-[#C9A84C]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Embedded Discovery Feed Section */}
      <section id="explore" className="max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-6 pt-12 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DF]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1A1A2E]">
              Explore Curated Gatherings
            </h2>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Find private dinners, tech salons, and intimate cultural experiences across India.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E8E4DF] self-start sm:self-auto shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#1A1A2E] text-white'
                  : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-[#1A1A2E] text-white'
                  : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Discovery Filtering Controls */}
        <div className="bg-white rounded-2xl border border-[#E8E4DF] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, neighborhood, venue, or title..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-xs sm:text-sm text-[#0F0F0F] placeholder-[#8A8A8A] outline-none focus:border-[#1A1A2E] focus:bg-white transition-all"
              />
            </div>

            {/* Dynamic Location Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {dynamicCities.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                    selectedCity === c
                      ? 'bg-[#1A1A2E] text-white shadow-sm'
                      : 'bg-[#F9F7F4] border border-[#E8E4DF] text-[#4B4B4B] hover:bg-[#F0EDE8]'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Pills */}
          <div className="pt-3 border-t border-[#E8E4DF] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#8A8A8A] font-semibold flex items-center gap-1">
                Filters:
              </span>

              {/* Access Pills */}
              <div className="flex items-center gap-1 bg-[#F9F7F4] p-1 rounded-lg border border-[#E8E4DF]">
                {ACCESS_FILTERS.map((acc) => (
                  <button
                    key={acc}
                    onClick={() => setSelectedAccess(acc)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      selectedAccess === acc
                        ? 'bg-[#1A1A2E] text-white shadow-sm'
                        : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>

              {/* Format Pills */}
              <div className="flex items-center gap-1 bg-[#F9F7F4] p-1 rounded-lg border border-[#E8E4DF]">
                {FORMAT_FILTERS.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      selectedFormat === fmt
                        ? 'bg-[#1A1A2E] text-white shadow-sm'
                        : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {/* Timing Pills */}
              <div className="flex items-center gap-1 bg-[#F9F7F4] p-1 rounded-lg border border-[#E8E4DF]">
                {TIMING_FILTERS.map((tim) => (
                  <button
                    key={tim}
                    onClick={() => setSelectedTiming(tim)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      selectedTiming === tim
                        ? 'bg-[#1A1A2E] text-white shadow-sm'
                        : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
                    }`}
                  >
                    {tim}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-[#8A8A8A] font-medium">
              Showing {displayedEvents.length} of {filteredEvents.length} events
            </span>
          </div>
        </div>

        {/* View Mode: Map vs Grid */}
        {viewMode === 'map' ? (
          <div className="space-y-6">
            <div className="w-full h-96 rounded-3xl overflow-hidden border border-[#E8E4DF] shadow-sm relative bg-[#1A1A2E]">
              <iframe
                title="Events Map View"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={mapEmbedUrl}
              />
            </div>

            {/* Compact Card Strip Under Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </div>
        ) : (
          /* View Mode: Grid */
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-2xl bg-white border border-[#E8E4DF] animate-pulse"
                  />
                ))}
              </div>
            ) : displayedEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E4DF] p-8 space-y-3">
                <p className="text-sm font-semibold text-[#1A1A2E]">No gatherings match your filters</p>
                <p className="text-xs text-[#8A8A8A]">
                  Try resetting your search query or selecting &quot;All Locations&quot;.
                </p>
                <button
                  onClick={() => {
                    setSelectedCity('All Locations');
                    setSelectedAccess('All Access');
                    setSelectedFormat('All Formats');
                    setSelectedTiming('All Dates');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-bold text-[#E8621A] hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedEvents.map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            )}

            {/* "Load More" Pagination (no numbered pagination per design rules) */}
            {visibleCount < filteredEvents.length && (
              <div className="pt-10 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-6 py-2.5 rounded-[10px] bg-white border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-bold text-[#1A1A2E] shadow-sm transition-colors"
                >
                  Load More Gatherings (+6)
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
