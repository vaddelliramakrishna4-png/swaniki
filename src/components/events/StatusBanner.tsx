import React from 'react';
import { Sparkles, Clock, AlertTriangle, CheckCircle2, Flame, Users2 } from 'lucide-react';
import { EventStatus } from '@/types/database';

interface StatusBannerProps {
  status: EventStatus | string;
  approvalRequired?: boolean;
  isCapped?: boolean;
  spotsLeft?: number | null;
  capacity?: number;
  confirmedCount?: number;
  startTime?: string;
}

export function StatusBanner({
  status,
  approvalRequired,
  isCapped,
  spotsLeft: customSpotsLeft,
  capacity = 0,
  confirmedCount = 0,
  startTime,
}: StatusBannerProps) {
  // 1. Draft Notice
  if (status === 'draft') {
    return (
      <div className="bg-[#F0EDE8] border border-[#C8C4BF] text-[#4B4B4B] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8A8A8A]" />
          <span>This event is currently in <strong>Draft</strong> mode. Only organizers can view it.</span>
        </div>
        <span className="text-[10px] bg-[#C8C4BF] text-[#1A1A2E] font-bold uppercase px-2 py-0.5 rounded-full">
          Private Preview
        </span>
      </div>
    );
  }

  // 2. Cancelled Notice
  if (status === 'cancelled') {
    return (
      <div className="bg-[#FEF0E7] border border-[#E8621A]/40 text-[#D45510] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-[#E8621A] shrink-0" />
        <span>This event has been cancelled by the host. Any RSVPs have been notified.</span>
      </div>
    );
  }

  // Compute timing countdown in IST
  let timingLabel: string | null = null;
  let isPast = status === 'past';

  if (startTime) {
    const eventDate = new Date(startTime).getTime();
    const now = Date.now();
    const diffMs = eventDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffMs < -1000 * 60 * 60 * 6) {
      isPast = true;
    } else if (diffMs < 0) {
      timingLabel = 'Happening Now';
    } else if (diffHours <= 12) {
      timingLabel = 'Starts Tonight';
    } else if (diffDays === 1) {
      timingLabel = 'Starts Tomorrow';
    } else if (diffDays > 1 && diffDays <= 30) {
      timingLabel = `Starts in ${diffDays} days`;
    }
  }

  // 3. Past Event Notice
  if (isPast) {
    return (
      <div className="bg-[#F0EDE8] border border-[#E8E4DF] text-[#4B4B4B] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" />
          <span>This gathering has concluded. Explore upcoming gatherings on Vibe.</span>
        </div>
        <span className="text-[10px] bg-[#E8E4DF] text-[#4B4B4B] font-bold uppercase px-2 py-0.5 rounded-full">
          Past Vibe
        </span>
      </div>
    );
  }

  // Real spots calculation
  const calculatedSpots =
    customSpotsLeft !== undefined && customSpotsLeft !== null
      ? customSpotsLeft
      : capacity > 0
      ? Math.max(0, capacity - confirmedCount)
      : null;

  const isWaitlisted = capacity > 0 && calculatedSpots !== null && calculatedSpots <= 0;

  // 4. Waitlist State (Capacity Filled)
  if (isWaitlisted) {
    return (
      <div className="bg-[#FEF3C7] border border-[#B45309]/30 text-[#B45309] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Users2 className="w-4 h-4 text-[#B45309]" />
          <span>Capacity Reached! New RSVPs will be added to the <strong>Waitlist</strong>.</span>
        </div>
        <span className="text-[10px] bg-[#B45309] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Waitlist Active
        </span>
      </div>
    );
  }

  // 5. High Demand / Spots Left Notice (< 6 remaining)
  if (calculatedSpots !== null && calculatedSpots <= 5 && calculatedSpots > 0) {
    return (
      <div className="bg-[#FEF0E7] border border-[#E8621A]/30 text-[#D45510] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#E8621A] animate-pulse" />
          <span>
            Filling fast! Only <strong>{calculatedSpots} spot{calculatedSpots === 1 ? '' : 's'}</strong> left.
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {timingLabel && (
            <span className="text-[10px] bg-white border border-[#E8621A]/30 text-[#D45510] font-semibold px-2 py-0.5 rounded-full">
              {timingLabel}
            </span>
          )}
          <span className="text-[10px] bg-[#E8621A] text-white px-2 py-0.5 rounded-full uppercase">
            Limited Seats
          </span>
        </div>
      </div>
    );
  }

  // 6. Host Review / Curated Event
  if (approvalRequired) {
    return (
      <div className="bg-[#FDF6E7] border border-[#C9A84C]/40 text-[#855B14] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          <span><strong>Curated Gathering:</strong> The host reviews applications to ensure a high-signal room.</span>
        </div>
        {timingLabel && (
          <span className="text-[10px] bg-white border border-[#C9A84C]/40 text-[#855B14] font-bold px-2 py-0.5 rounded-full">
            {timingLabel}
          </span>
        )}
      </div>
    );
  }

  // 7. Standard timing pill if starting soon
  if (timingLabel) {
    return (
      <div className="bg-white border border-[#E8E4DF] text-[#1A1A2E] px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#E8621A]" />
          <span>{timingLabel}</span>
        </div>
        <span className="text-[11px] text-[#8A8A8A] font-normal">
          {capacity > 0 ? `${capacity} Total Capacity` : 'Open Gathering'}
        </span>
      </div>
    );
  }

  return null;
}

