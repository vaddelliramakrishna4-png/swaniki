'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Palette,
  Copy,
  Plus,
  Search,
  Download,
  ExternalLink,
  Share2,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Building2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { EventItem, RSVPItem } from '@/types/database';
import { fetchEvents, fetchEventRSVPs, duplicateEventRecord, updateEventRecord } from '@/lib/events';
import { formatEventTimeRangeIST } from '@/lib/date';
import { useAuth } from '@/lib/auth-context';

const BRAND_PALETTES = [
  { name: 'Heritage Navy', color: '#1A1A2E', bgMood: 'parchment' },
  { name: 'Botanical Emerald', color: '#14382A', bgMood: 'clean' },
  { name: 'Terracotta Rose', color: '#4C1D24', bgMood: 'parchment' },
  { name: 'Burnt Ochre', color: '#3F1A0B', bgMood: 'deep' },
  { name: 'Obsidian Slate', color: '#0B0F19', bgMood: 'deep' },
];

type NavSection = 'events' | 'guests' | 'brand_kit';
type StatusFilter = 'all' | 'live' | 'draft' | 'past' | 'cancelled';

export default function OrganizerDashboardPage() {
  const { profile, switchRole } = useAuth();
  const [activeSection, setActiveSection] = useState<NavSection>('events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected event for guest list deep-dive
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventRsvps, setEventRsvps] = useState<RSVPItem[]>([]);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [guestStatusFilter, setGuestStatusFilter] = useState<string>('all');

  // Brand Kit State
  const [brandColor, setBrandColor] = useState<string>('#1A1A2E');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [brandFont, setBrandFont] = useState<string>('Playfair + Inter');
  const [brandAppliedNotice, setBrandAppliedNotice] = useState<string | null>(null);

  // General Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    const list = await fetchEvents();
    setEvents(list);
    if (list.length > 0 && !selectedEventId) {
      setSelectedEventId(list[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('vibe_brand_color');
      const savedLogo = localStorage.getItem('vibe_brand_logo');
      if (savedColor) setBrandColor(savedColor);
      if (savedLogo) setLogoUrl(savedLogo);
    }
  }, []);

  // Fetch RSVPs for selected event
  useEffect(() => {
    if (selectedEventId) {
      fetchEventRSVPs(selectedEventId).then((rsvps) => {
        setEventRsvps(rsvps);
      });
    }
  }, [selectedEventId]);

  // Handle Event Duplication
  const handleDuplicate = async (eventId: string) => {
    const res = await duplicateEventRecord(eventId);
    if (res.success && res.event) {
      showToast(`Gathering duplicated as draft: "${res.event.title}"`);
      await loadData();
    } else {
      showToast(`Error duplicating gathering: ${res.error || 'Unknown error'}`);
    }
  };

  // Handle Brand Kit Save & Apply
  const handleSaveBrand = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibe_brand_color', brandColor);
      localStorage.setItem('vibe_brand_logo', logoUrl);
      localStorage.setItem('vibe_brand_font', brandFont);
    }
    setBrandAppliedNotice('Brand kit saved! Default styling applied to all upcoming event drafts.');
    setTimeout(() => setBrandAppliedNotice(null), 4000);
  };

  // CSV Export for Selected Event
  const handleExportCSV = () => {
    const currentEvent = events.find((e) => e.id === selectedEventId);
    if (!currentEvent || eventRsvps.length === 0) {
      showToast('No attendee records available to export.');
      return;
    }

    const headers = ['Name', 'Email', 'Status', 'Phone', 'Plus One', 'Plus One Name', 'RSVP Date'];
    const rows = eventRsvps.map((r) => [
      `"${r.guest_name}"`,
      `"${r.guest_email}"`,
      `"${r.status}"`,
      `"${r.answers?.phone || ''}"`,
      `"${r.answers?.plus_one ? 'Yes' : 'No'}"`,
      `"${r.answers?.plus_one_name || ''}"`,
      `"${r.created_at || ''}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentEvent.slug || currentEvent.id)}-attendees.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showToast(`Attendee CSV exported for "${currentEvent.title}"`);
  };

  // Compute Stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => new Date(e.start_time).getTime() >= Date.now() && e.status !== 'cancelled'
  ).length;

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (statusFilter === 'live' && e.status !== 'published' && e.status !== 'live') return false;
    if (statusFilter === 'draft' && e.status !== 'draft') return false;
    if (statusFilter === 'cancelled' && e.status !== 'cancelled') return false;
    if (statusFilter === 'past') {
      const isPastTime = new Date(e.start_time).getTime() < Date.now();
      if (!isPastTime && e.status !== 'past') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchCity = (e.city || '').toLowerCase().includes(q);
      const matchLocation = (e.location || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchLocation) return false;
    }

    return true;
  });

  // Filtered Guests
  const filteredGuests = eventRsvps.filter((r) => {
    if (guestStatusFilter !== 'all' && r.status !== guestStatusFilter) return false;
    if (guestSearchQuery.trim()) {
      const q = guestSearchQuery.toLowerCase();
      const matchName = r.guest_name.toLowerCase().includes(q);
      const matchEmail = r.guest_email.toLowerCase().includes(q);
      const matchPhone = (r.answers?.phone || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          {/* Host Profile Header */}
          <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'SW'}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-[#1A1A2E] truncate">
                  {profile?.name || 'Swaniki Collective'}
                </h2>
                <span className="text-[11px] text-[#C9A84C] font-semibold flex items-center gap-1">
                  ✦ {profile?.role === 'organizer' ? 'Verified Host' : 'Host Portal'}
                </span>
              </div>
            </div>

            {(!profile || profile.role !== 'organizer') && (
              <div className="p-2.5 bg-[#FDF6E7] border border-[#C9A84C]/30 rounded-xl space-y-1.5">
                <p className="text-[11px] text-[#4B4B4B]">
                  Sign in as Host to manage gatherings
                </p>
                <Link
                  href="/auth/login?redirect=/manage"
                  className="w-full py-1.5 px-2.5 rounded-lg bg-[#1A1A2E] text-[#C9A84C] text-xs font-bold hover:bg-[#16213E] transition-all flex items-center justify-center gap-1"
                >
                  Sign In with OTP
                </Link>
              </div>
            )}

            <Link
              href="/create"
              className="w-full py-2.5 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Gathering</span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="bg-white rounded-2xl border border-[#E8E4DF] p-2 shadow-sm space-y-1">
            <button
              onClick={() => setActiveSection('events')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'events'
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'text-[#4B4B4B] hover:bg-[#F9F7F4] hover:text-[#1A1A2E]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Gatherings &amp; Events</span>
            </button>

            <button
              onClick={() => setActiveSection('guests')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'guests'
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'text-[#4B4B4B] hover:bg-[#F9F7F4] hover:text-[#1A1A2E]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Guest Lists &amp; CSV</span>
            </button>

            <button
              onClick={() => setActiveSection('brand_kit')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'brand_kit'
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'text-[#4B4B4B] hover:bg-[#F9F7F4] hover:text-[#1A1A2E]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Brand Kit Preset</span>
            </button>
          </nav>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-[#1A1A2E] text-white text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
              <Sparkles className="w-4 h-4 text-[#C9A84C]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Section 1: Events Overview */}
          {activeSection === 'events' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-[#E8E4DF] p-4 shadow-sm">
                  <div className="text-[11px] font-bold text-[#8A8A8A] uppercase">Total Gatherings</div>
                  <div className="text-2xl font-bold font-serif text-[#1A1A2E] mt-1">{totalEvents}</div>
                  <div className="text-[10px] text-[#1A7A4A] font-semibold mt-1">Live &amp; Past Archive</div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E4DF] p-4 shadow-sm">
                  <div className="text-[11px] font-bold text-[#8A8A8A] uppercase">Upcoming Salons</div>
                  <div className="text-2xl font-bold font-serif text-[#1A1A2E] mt-1">{upcomingEvents}</div>
                  <div className="text-[10px] text-[#C9A84C] font-semibold mt-1">Next 30 Days</div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E4DF] p-4 shadow-sm">
                  <div className="text-[11px] font-bold text-[#8A8A8A] uppercase">Total RSVPs</div>
                  <div className="text-2xl font-bold font-serif text-[#1A1A2E] mt-1">148</div>
                  <div className="text-[10px] text-[#1A7A4A] font-semibold mt-1">+24 this week</div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E4DF] p-4 shadow-sm">
                  <div className="text-[11px] font-bold text-[#8A8A8A] uppercase">Avg Capacity</div>
                  <div className="text-2xl font-bold font-serif text-[#1A1A2E] mt-1">84%</div>
                  <div className="text-[10px] text-[#E8621A] font-semibold mt-1">High Signal Fill</div>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="bg-white rounded-2xl border border-[#E8E4DF] p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, neighborhood or city..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-xs outline-none focus:border-[#1A1A2E]"
                  />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'live', 'draft', 'past', 'cancelled'] as StatusFilter[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                        statusFilter === st
                          ? 'bg-[#1A1A2E] text-white'
                          : 'text-[#4B4B4B] hover:bg-[#F0EDE8]'
                      }`}
                    >
                      {st === 'live' ? 'Live / Upcoming' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Events Grid */}
              <div className="space-y-4">
                {filteredEvents.map((evt) => {
                  const timeStr = formatEventTimeRangeIST(evt.start_time, evt.end_time);

                  return (
                    <div
                      key={evt.id}
                      className="bg-white rounded-2xl border border-[#E8E4DF] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C8C4BF] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            evt.cover_url ||
                            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={evt.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-[#1A1A2E]"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">
                              {evt.theme_template}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                evt.status === 'published' || evt.status === 'live'
                                  ? 'bg-[#E8F5EE] text-[#1A7A4A]'
                                  : evt.status === 'draft'
                                  ? 'bg-[#FEF3C7] text-[#B45309]'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {evt.status}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-[#1A1A2E]">
                            {evt.title}
                          </h3>

                          <p className="text-xs text-[#8A8A8A] flex items-center gap-2">
                            <span>{timeStr}</span>
                            <span>•</span>
                            <span>{evt.venue_name || evt.location || 'India'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Duplicate Event Action */}
                        <button
                          onClick={() => handleDuplicate(evt.id)}
                          title="Copy & Duplicate Event"
                          className="px-3 py-2 rounded-lg bg-white border border-[#E8E4DF] hover:bg-[#F9F7F4] text-[#4B4B4B] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#8A8A8A]" />
                          <span>Duplicate</span>
                        </button>

                        {/* Share Studio */}
                        <Link
                          href={`/events/${evt.id}/share`}
                          title="Social Banners & Share Studio"
                          className="px-3 py-2 rounded-lg bg-white border border-[#E8E4DF] hover:bg-[#F9F7F4] text-[#4B4B4B] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#E8621A]" />
                          <span>Share Studio</span>
                        </Link>

                        {/* View Live */}
                        <Link
                          href={`/${evt.slug || evt.id}`}
                          title="View Live Gathering"
                          className="p-2 rounded-lg bg-[#1A1A2E] hover:bg-[#16213E] text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Guest Lists & CSV Export */}
          {activeSection === 'guests' && (
            <div className="bg-white rounded-3xl border border-[#E8E4DF] p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#1A1A2E]">
                    Guest List Management
                  </h2>
                  <p className="text-xs text-[#4B4B4B] mt-0.5">
                    Inspect attendee RSVPs, manage capacity status, and export CSV spreadsheets.
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Event Selector Dropdown */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-[#8A8A8A] uppercase">
                    Select Gathering:
                  </label>
                  <select
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-xs font-semibold text-[#1A1A2E] outline-none"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.city || 'India'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guest Search */}
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-[#8A8A8A] uppercase">
                    Filter Guests:
                  </label>
                  <div className="relative mt-1">
                    <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={guestSearchQuery}
                      onChange={(e) => setGuestSearchQuery(e.target.value)}
                      placeholder="Search by name, email, or phone..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Table of Guests */}
              <div className="overflow-x-auto rounded-xl border border-[#E8E4DF]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F9F7F4] border-b border-[#E8E4DF] text-[#8A8A8A] font-bold uppercase text-[10px]">
                      <th className="p-3">Guest Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Plus One</th>
                      <th className="p-3">RSVP Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DF]">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#8A8A8A]">
                          No attendee records match the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((r) => (
                        <tr key={r.id || r.guest_email} className="hover:bg-[#F9F7F4]/50">
                          <td className="p-3 font-semibold text-[#1A1A2E]">{r.guest_name}</td>
                          <td className="p-3 text-[#4B4B4B]">{r.guest_email}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                r.status === 'confirmed'
                                  ? 'bg-[#E8F5EE] text-[#1A7A4A]'
                                  : r.status === 'waitlisted'
                                  ? 'bg-[#FEF3C7] text-[#B45309]'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 text-[#4B4B4B] font-mono">{r.answers?.phone || '—'}</td>
                          <td className="p-3 text-[#4B4B4B]">
                            {r.answers?.plus_one ? `Yes (${r.answers?.plus_one_name || '1'})` : 'No'}
                          </td>
                          <td className="p-3 text-[#8A8A8A]">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'Recent'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Brand Kit Preset */}
          {activeSection === 'brand_kit' && (
            <div className="bg-white rounded-3xl border border-[#E8E4DF] p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#1A1A2E]">
                  Organizer Brand Kit Preset
                </h2>
                <p className="text-xs text-[#4B4B4B] mt-1">
                  Configure your signature aesthetic. When creating new events, this logo and brand color
                  will be automatically stamped onto pages and transactional emails.
                </p>
              </div>

              {brandAppliedNotice && (
                <div className="p-4 rounded-xl bg-[#E8F5EE] border border-[#1A7A4A]/30 text-[#1A7A4A] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{brandAppliedNotice}</span>
                </div>
              )}

              {/* Color Swatch Picker */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                  Signature Brand Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {BRAND_PALETTES.map((palette) => {
                    const isSelected = brandColor === palette.color;
                    return (
                      <button
                        key={palette.color}
                        onClick={() => setBrandColor(palette.color)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-[#E8621A] bg-[#FEF0E7]/30 ring-2 ring-[#E8621A]'
                            : 'border-[#E8E4DF] hover:border-[#C8C4BF]'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full shadow-inner border border-white/20 flex items-center justify-center text-white"
                          style={{ backgroundColor: palette.color }}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] font-bold text-[#1A1A2E] text-center">
                          {palette.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logo URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                  Host Logo Image URL
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://your-domain.com/logo.png"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-xs outline-none focus:border-[#1A1A2E]"
                />
                <p className="text-[11px] text-[#8A8A8A]">
                  Leave empty to automatically use your host monogram badge.
                </p>
              </div>

              {/* Brand Typography Preset */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                  Typography Pairing
                </label>
                <div className="p-4 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1A1A2E]">Playfair Display + Inter</span>
                    <p className="text-[11px] text-[#8A8A8A]">
                      Editorial serif headlines with clean contemporary sans-serif body.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#1A7A4A] bg-[#E8F5EE] px-2.5 py-1 rounded-full">
                    Active System Font
                  </span>
                </div>
              </div>

              {/* Save / Apply Button */}
              <div className="pt-4 border-t border-[#E8E4DF] flex items-center justify-end">
                <button
                  onClick={handleSaveBrand}
                  className="px-6 py-2.5 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply My Brand Preset</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
