'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import { EventItem, RSVPItem } from '@/types/database';
import { ManagePageView } from '@/components/events/ManagePageView';
import { getLocalEvents, persistLocalEvent, fetchEventRSVPs } from '@/lib/events';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

interface ManagePageContainerProps {
  initialEvent?: EventItem | null;
  idOrSlug: string;
  initialRsvps?: RSVPItem[];
}

export function ManagePageContainer({
  initialEvent,
  idOrSlug,
  initialRsvps = [],
}: ManagePageContainerProps) {
  const [event, setEvent] = useState<EventItem | null>(initialEvent || null);
  const [rsvps, setRsvps] = useState<RSVPItem[]>(initialRsvps);
  const [loading, setLoading] = useState<boolean>(!initialEvent);

  useEffect(() => {
    if (initialEvent) {
      setEvent(initialEvent);
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        const localList = getLocalEvents();
        const found = localList.find(
          (e) =>
            e.id === idOrSlug ||
            e.slug === idOrSlug ||
            (e.slug && e.slug.toLowerCase() === idOrSlug.toLowerCase()) ||
            (e.id && e.id.toLowerCase() === idOrSlug.toLowerCase())
        );

        if (found) {
          setEvent(found);
          fetchEventRSVPs(found.id).then((r) => setRsvps(r));
          setLoading(false);

          fetch('/api/events/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(found),
          }).catch(() => {});
          return;
        }
      } catch (err) {
        console.warn('Local storage manage lookup notice:', err);
      }

      fetch('/api/events/sync')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.events)) {
            const serverFound = data.events.find(
              (e: EventItem) =>
                e.id === idOrSlug ||
                e.slug === idOrSlug ||
                (e.slug && e.slug.toLowerCase() === idOrSlug.toLowerCase()) ||
                (e.id && e.id.toLowerCase() === idOrSlug.toLowerCase())
            );
            if (serverFound) {
              setEvent(serverFound);
              persistLocalEvent(serverFound);
              fetchEventRSVPs(serverFound.id).then((r) => setRsvps(r));
            }
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [initialEvent, idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen parchment-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] text-[#C9A84C] font-serif font-bold text-2xl flex items-center justify-center mx-auto shadow-sm mb-4">
          V
        </div>
        <div className="flex items-center gap-2 text-sm text-[#4B4B4B] font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#E8621A]" />
          <span>Opening host dashboard...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen parchment-bg flex flex-col justify-between">
        <Navbar />
        <main className="max-w-xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF8F5] border border-[#E8E4DF] flex items-center justify-center mx-auto shadow-sm">
            <span className="text-2xl">📋</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1A1A2E]">
              Gathering Not Found
            </h1>
            <p className="text-sm text-[#4B4B4B] leading-relaxed">
              We couldn&apos;t find this gathering in your active host records.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/manage"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A1A2E] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#16213E] transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Gatherings</span>
            </Link>
            <Link
              href="/create"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E8E4DF] bg-white text-[#1A1A2E] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#FAF8F5] transition-colors"
            >
              <Plus className="w-4 h-4 text-[#E8621A]" />
              <span>Host a Gathering</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <ManagePageView event={event} initialRsvps={rsvps} />;
}
