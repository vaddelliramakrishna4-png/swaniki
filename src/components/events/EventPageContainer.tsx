'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Loader2, Sparkles, Plus } from 'lucide-react';
import { EventItem, RSVPItem } from '@/types/database';
import { EventPageView } from '@/components/events/EventPageView';
import { getLocalEvents, persistLocalEvent } from '@/lib/events';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

interface EventPageContainerProps {
  initialEvent?: EventItem | null;
  idOrSlug: string;
  initialRsvps?: RSVPItem[];
}

export function EventPageContainer({
  initialEvent,
  idOrSlug,
  initialRsvps = [],
}: EventPageContainerProps) {
  const [event, setEvent] = useState<EventItem | null>(initialEvent || null);
  const [loading, setLoading] = useState<boolean>(!initialEvent);

  useEffect(() => {
    if (initialEvent) {
      setEvent(initialEvent);
      setLoading(false);
      return;
    }

    // 1. Check client-side localStorage
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
          setLoading(false);

          // Proactively sync this event to the server so subsequent reloads are fast
          fetch('/api/events/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(found),
          }).catch(() => {});
          return;
        }
      } catch (err) {
        console.warn('Local storage event lookup notice:', err);
      }

      // 2. Query the server sync endpoint in case it was stored there
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
          <span>Locating your gathering...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen parchment-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E4DF] p-8 text-center shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5EE] border border-[#E8621A]/20 flex items-center justify-center mx-auto text-[#E8621A]">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">
                Gathering Not Found
              </h1>
              <p className="text-xs text-[#4B4B4B] leading-relaxed">
                This gathering link might be expired or the address is incorrect. Explore upcoming salons or create your own curated gathering.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#1A1A2E] hover:bg-[#16213E] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Explore Gatherings
              </Link>
              <Link
                href="/create"
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-[#C8C4BF] hover:bg-[#F9F7F4] text-xs font-bold text-[#1A1A2E] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-[#E8621A]" />
                Host a Gathering
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <EventPageView initialEvent={event} initialRsvps={initialRsvps} />;
}
