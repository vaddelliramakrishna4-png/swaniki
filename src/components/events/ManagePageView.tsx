'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { EventItem, RSVPItem } from '@/types/database';
import { formatEventDateIST } from '@/lib/date';
import { supabase } from '@/lib/supabase/client';
import { fetchEventRSVPs } from '@/lib/events';

interface ManagePageViewProps {
  event: EventItem;
  initialRsvps?: RSVPItem[];
}

export function ManagePageView({ event, initialRsvps = [] }: ManagePageViewProps) {
  const [rsvps, setRsvps] = useState<RSVPItem[]>(initialRsvps);

  useEffect(() => {
    fetchEventRSVPs(event.id).then((data) => {
      if (data) setRsvps(data);
    });
  }, [event.id]);

  const [search, setSearch] = useState('');

  const handleStatusChange = async (rsvpId: string, newStatus: 'confirmed' | 'waitlisted') => {
    setRsvps((prev) =>
      prev.map((r) => (r.id === rsvpId ? { ...r, status: newStatus } : r))
    );

    await supabase.from('rsvps').update({ status: newStatus }).eq('id', rsvpId);
  };

  const handleExportCSV = () => {
    if (rsvps.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Plus One', 'Plus One Name', 'Created At'];
    const rows = rsvps.map((r) => [
      `"${r.guest_name}"`,
      `"${r.guest_email}"`,
      `"${r.answers?.phone || ''}"`,
      `"${r.status}"`,
      `"${r.answers?.plus_one ? 'Yes' : 'No'}"`,
      `"${r.answers?.plus_one_name || ''}"`,
      `"${r.created_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${(event?.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '-')}-guests.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmedGuests = rsvps.filter((r) => r.status === 'confirmed');
  const waitlistedGuests = rsvps.filter((r) => r.status === 'waitlisted');

  const filteredGuests = rsvps.filter(
    (r) =>
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      r.guest_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col parchment-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
          <div>
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#1A1A2E] mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Page
            </Link>
            <h1 className="text-2xl font-bold font-serif text-[#1A1A2E]">
              {event.title} — Host Dashboard
            </h1>
            <p className="text-xs text-[#4B4B4B] mt-0.5">
              {formatEventDateIST(event.start_time)} · {event.venue_name || event.location}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/events/${event.id}`}
              target="_blank"
              className="px-3.5 py-2 rounded-lg bg-white border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Page
            </Link>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-[#1A1A2E] hover:bg-[#16213E] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-[#E8E4DF] shadow-sm">
            <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1">
              Confirmed Guests
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1A7A4A] font-mono">
                {confirmedGuests.length}
              </span>
              <span className="text-xs text-[#4B4B4B]">
                / {event.capacity} maximum capacity
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E8E4DF] shadow-sm">
            <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1">
              Waitlisted / Under Review
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#B45309] font-mono">
                {waitlistedGuests.length}
              </span>
              <span className="text-xs text-[#4B4B4B]">requiring review</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E8E4DF] shadow-sm">
            <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1">
              Admission Type
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  event.approval_required ? 'bg-[#C9A84C]' : 'bg-[#1A7A4A]'
                }`}
              />
              <span className="text-sm font-bold text-[#1A1A2E]">
                {event.approval_required ? 'Curated (Host Review)' : 'Instant RSVP'}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Roster Table */}
        <div className="bg-white rounded-2xl border border-[#E8E4DF] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E8E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1A1A2E]" />
              <h3 className="font-bold text-sm text-[#1A1A2E]">
                Guest List ({rsvps.length})
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guests by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg outline-none focus:border-[#1A1A2E]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F7F4] text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider border-b border-[#E8E4DF]">
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">WhatsApp / Phone</th>
                  <th className="py-3 px-4">+1 Guest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF] text-xs text-[#0F0F0F]">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#8A8A8A]">
                      No RSVPs found. Share your gathering link to start receiving guest registrations.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => {
                  const isConfirmed = guest.status === 'confirmed';
                  return (
                    <tr key={guest.id} className="hover:bg-[#FDFCFB] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1A1A2E]">
                          {guest.guest_name}
                        </div>
                        <div className="text-[11px] text-[#8A8A8A]">
                          {guest.guest_email}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#4B4B4B]">
                        {guest.answers?.phone || '—'}
                      </td>
                      <td className="py-3 px-4 text-[#4B4B4B]">
                        {guest.answers?.plus_one ? (
                          <span className="text-[11px] font-semibold text-[#1A1A2E]">
                            Yes ({guest.answers?.plus_one_name || '+1'})
                          </span>
                        ) : (
                          <span className="text-[#8A8A8A]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            isConfirmed
                              ? 'bg-[#E8F5EE] text-[#1A7A4A]'
                              : 'bg-[#FEF3C7] text-[#B45309]'
                          }`}
                        >
                          {guest.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isConfirmed ? (
                          <button
                            onClick={() => handleStatusChange(guest.id, 'waitlisted')}
                            className="text-[11px] font-semibold text-[#8A8A8A] hover:text-[#B45309]"
                          >
                            Move to Waitlist
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(guest.id, 'confirmed')}
                            className="text-[11px] font-semibold text-[#1A7A4A] hover:underline"
                          >
                            Approve RSVP
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
