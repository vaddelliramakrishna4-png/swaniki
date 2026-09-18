'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { fetchEventRSVPs } from '@/lib/events';

interface LiveCounterProps {
  eventId: string;
  initialCount?: number;
  capacity?: number;
}

export function LiveCounter({
  eventId,
  initialCount = 0,
  capacity = 50,
}: LiveCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [isPopping, setIsPopping] = useState(false);

  const fetchExactConfirmedCount = async () => {
    try {
      const { count: exactCount, error } = await supabase
        .from('rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (!error && typeof exactCount === 'number') {
        setCount(exactCount);
      } else {
        const list = await fetchEventRSVPs(eventId);
        setCount(list.filter((r) => r.status === 'confirmed').length);
      }
    } catch {
      // Retain existing count
    }
  };

  // Sync with initialCount prop immediately on update
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    // Query exact confirmed count on mount
    fetchExactConfirmedCount();

    // Subscribe to supabase.channel('public:rsvps') with filter event_id=eq.${eventId}
    const channel = supabase
      .channel(`public:rsvps:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIsPopping(true);
            setTimeout(() => setIsPopping(false), 300);
          }
          fetchExactConfirmedCount();
        }
      )
      .subscribe();

    // Cross-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`vibe-event-sync-${eventId}`);
      bc.onmessage = () => {
        fetchExactConfirmedCount();
      };
    } catch {}

    // Same-window custom event
    const handleLocalRsvp = () => {
      fetchExactConfirmedCount();
    };
    window.addEventListener('vibe-rsvp-created', handleLocalRsvp);
    window.addEventListener('vibe-rsvp-cancelled', handleLocalRsvp);

    return () => {
      supabase.removeChannel(channel);
      if (bc) bc.close();
      window.removeEventListener('vibe-rsvp-created', handleLocalRsvp);
      window.removeEventListener('vibe-rsvp-cancelled', handleLocalRsvp);
    };
  }, [eventId]);

  const percentage = capacity > 0 ? Math.min(100, Math.round((count / capacity) * 100)) : 0;
  const isHot = percentage >= 70;

  return (
    <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E8E4DF] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-1.5">
        {isHot ? (
          <Flame className="w-3.5 h-3.5 text-[#E8621A] animate-pulse" />
        ) : (
          <Users className="w-3.5 h-3.5 text-[#1A1A2E]" />
        )}

        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ scale: 1.25, color: '#E8621A' }}
            animate={{ scale: 1, color: '#1A1A2E' }}
            transition={{ duration: 0.2 }}
            className="text-xs font-bold font-mono"
          >
            {count}
          </motion.span>
        </AnimatePresence>

        <span className="text-xs text-[#4B4B4B]">
          {capacity > 0 ? `/ ${capacity} attending` : 'attending'}
        </span>
      </div>

      {isHot && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8621A] bg-[#FEF0E7] px-2 py-0.5 rounded-full">
          Filling Fast
        </span>
      )}
    </div>
  );
}

