'use client';

import React, { useState } from 'react';
import { BadgeCheck, UserPlus, Check, Sparkles } from 'lucide-react';

interface OrganizerCardProps {
  name?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string;
  verified?: boolean;
  followerCount?: number;
}

export function OrganizerCard({
  name = 'Swaniki Studio & Builders Collective',
  handle = 'swaniki',
  bio = 'Curating intimate salons, deep-tech dinners, and cultural gatherings across Bengaluru, Mumbai, and Goa.',
  avatarUrl,
  verified = true,
  followerCount = 428,
}: OrganizerCardProps) {
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(followerCount);

  const toggleFollow = () => {
    if (following) {
      setFollowers((prev) => prev - 1);
      setFollowing(false);
    } else {
      setFollowers((prev) => prev + 1);
      setFollowing(true);
    }
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-start gap-3.5">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1A1A2E] to-[#16213E] text-[#C9A84C] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-[#E8E4DF]">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-[#1A1A2E] truncate font-['Inter']">
                {name}
              </h4>
              {verified && (
                <BadgeCheck className="w-4 h-4 text-[#C9A84C] shrink-0 fill-[#C9A84C]/20" />
              )}
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-mono">@{handle}</p>
          </div>

          <button
            onClick={toggleFollow}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
              following
                ? 'bg-[#E8F5EE] text-[#1A7A4A] border border-[#1A7A4A]/20'
                : 'bg-[#1A1A2E] text-white hover:bg-[#16213E] shadow-sm'
            }`}
          >
            {following ? (
              <>
                <Check className="w-3 h-3" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" /> Follow
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-[#4B4B4B] mt-2 line-clamp-2 leading-relaxed">
          {bio}
        </p>

        <div className="mt-2.5 pt-2 border-t border-[#E8E4DF] flex items-center gap-3 text-[11px] text-[#8A8A8A]">
          <span>
            <strong className="text-[#1A1A2E] font-semibold">{followers}</strong> followers
          </span>
          <span>·</span>
          <span className="text-[#E8621A] font-medium flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Verified Host
          </span>
        </div>
      </div>
    </div>
  );
}
