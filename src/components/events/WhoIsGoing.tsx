'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck, Users, Sparkles } from 'lucide-react';
import { RSVPItem } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { fetchEventRSVPs } from '@/lib/events';

interface WhoIsGoingProps {
  eventId?: string;
  rsvps?: RSVPItem[];
  totalCount?: number;
  showAttendees?: boolean;
}

// 6 curated theme hex colors specified in Fix 5
const CURATED_THEME_COLORS = [
  '#1A1A2E',
  '#E8621A',
  '#1A7A4A',
  '#C9A84C',
  '#3D2B1F',
  '#0F3460',
];

export function WhoIsGoing({
  eventId,
  rsvps: initialRsvps = [],
  totalCount,
  showAttendees = true,
}: WhoIsGoingProps) {
  const [confirmedGuests, setConfirmedGuests] = useState<RSVPItem[]>(
    initialRsvps.filter((r) => r.status === 'confirmed')
  );
  const [totalConfirmed, setTotalConfirmed] = useState<number>(
    totalCount !== undefined ? totalCount : initialRsvps.filter((r) => r.status === 'confirmed').length
  );
  const [loading, setLoading] = useState(false);

  // Sync immediately when parent updates props
  useEffect(() => {
    setConfirmedGuests(initialRsvps.filter((r) => r.status === 'confirmed').slice(0, 12));
    if (totalCount !== undefined) {
      setTotalConfirmed(totalCount);
    }
  }, [initialRsvps, totalCount]);

  const fetchConfirmedRsvps = async () => {
    if (!eventId) return;
    try {
      // Query first 12 confirmed guests:
      // SELECT guest_name FROM rsvps WHERE event_id = :id AND status = 'confirmed' LIMIT 12
      const { data, count, error } = await supabase
        .from('rsvps')
        .select('id, guest_name, status', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: true })
        .limit(12);

      if (!error && data) {
        setConfirmedGuests(data as RSVPItem[]);
        if (typeof count === 'number') {
          setTotalConfirmed(count);
        }
      } else {
        const list = await fetchEventRSVPs(eventId);
        const filtered = list.filter((r) => r.status === 'confirmed');
        setConfirmedGuests(filtered.slice(0, 12));
        setTotalConfirmed(filtered.length);
      }
    } catch {
      // Retain state
    }
  };

  useEffect(() => {
    fetchConfirmedRsvps();

    if (!eventId) return;

    // Realtime postgres subscription
    const channel = supabase
      .channel(`who-is-going:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchConfirmedRsvps();
        }
      )
      .subscribe();

    // Cross-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`vibe-event-sync-${eventId}`);
      bc.onmessage = (e) => {
        if (e.data?.type === 'RSVP_CREATED') {
          fetchConfirmedRsvps();
        }
      };
    } catch {}

    const handleLocal = () => {
      fetchConfirmedRsvps();
    };
    window.addEventListener('vibe-rsvp-created', handleLocal);

    return () => {
      supabase.removeChannel(channel);
      if (bc) bc.close();
      window.removeEventListener('vibe-rsvp-created', handleLocal);
    };
  }, [eventId]);

  // If organizer hid attendee list
  if (!showAttendees) {
    return null;
  }

  const remainingOthers = totalConfirmed > 12 ? totalConfirmed - 12 : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#1A7A4A]" />
          <h4 className="text-sm font-bold text-[#1A1A2E] font-['Inter']">
            Who&apos;s Going {totalConfirmed > 0 ? `(${totalConfirmed})` : ''}
          </h4>
        </div>
        <span className="text-[11px] text-[#8A8A8A]">Confirmed Guests</span>
      </div>

      {/* Zero state: "Be the first to RSVP" with an open ring placeholder */}
      {totalConfirmed === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F9F7F4] border border-dashed border-[#C8C4BF]">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#C8C4BF] flex items-center justify-center text-[#8A8A8A] shrink-0">
            <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1A1A2E]">Be the first to RSVP</p>
            <p className="text-[11px] text-[#4B4B4B] mt-0.5">
              Secure your spot and kickstart the guest list.
            </p>
          </div>
        </div>
      ) : (
        /* Confirmed Guests Avatar Grid */
        <div className="flex flex-wrap gap-2 pt-1 items-center">
          {confirmedGuests.map((guest, idx) => {
            const rawName = (guest.guest_name || 'Guest').trim();
            const parts = rawName.split(/\s+/);
            const initials =
              parts.length > 1
                ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
                : rawName.slice(0, 2).toUpperCase();

            const hexColor = CURATED_THEME_COLORS[idx % CURATED_THEME_COLORS.length];

            return (
              <div
                key={guest.id || idx}
                className="relative group flex items-center justify-center"
              >
                {/* Privacy-first: strictly initials avatar, no full names */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 border-2 border-white"
                  style={{ backgroundColor: hexColor }}
                  title="Confirmed Guest"
                >
                  {initials}
                </div>
              </div>
            );
          })}

          {/* +N others badge */}
          {remainingOthers > 0 && (
            <div className="flex items-center justify-center">
              <div className="h-10 px-3 rounded-full border border-[#D4D0CA] bg-[#F9F7F4] flex items-center justify-center text-xs font-bold text-[#1A1A2E] shadow-sm">
                +{remainingOthers} others
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

