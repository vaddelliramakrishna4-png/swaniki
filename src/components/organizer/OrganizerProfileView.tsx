'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Sparkles,
  Share2,
  Check,
  UserPlus,
  ArrowLeft,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { EventCard } from '@/components/events/EventCard';
import { EventItem } from '@/types/database';
import { followOrganizer, getOrganizerFollowerCount, isUserFollowing } from '@/lib/follows';

interface OrganizerProfileViewProps {
  handle: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  events?: EventItem[];
}

export function OrganizerProfileView({
  handle,
  name = 'Swaniki Collective',
  bio = 'Curating intimate founder salons, acoustic sundowners, and deep-tech demo nights across Bengaluru & Mumbai.',
  avatarUrl,
  events = [],
}: OrganizerProfileViewProps) {
  const cleanHandle = handle.replace(/^@/, '');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [followerCount, setFollowerCount] = useState(24);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowInput, setShowFollowInput] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [submittingFollow, setSubmittingFollow] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setFollowerCount(getOrganizerFollowerCount(cleanHandle));
    try {
      const viewerEmail = localStorage.getItem('vibe_viewer_email') || '';
      if (viewerEmail) {
        setIsFollowing(isUserFollowing(viewerEmail, cleanHandle));
      }
    } catch {}
  }, [cleanHandle]);

  const handleFollowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSubmittingFollow(true);
    const res = await followOrganizer(emailInput, cleanHandle);
    setFollowerCount(res.followerCount);
    setIsFollowing(true);
    setShowFollowInput(false);
    try {
      localStorage.setItem('vibe_viewer_email', emailInput.trim());
    } catch {}
    setSubmittingFollow(false);
  };

  const handleCopyProfile = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const now = new Date().getTime();
  const upcomingEvents = events.filter((e) => new Date(e.start_time).getTime() >= now - 86400000);
  const pastEvents = events.filter((e) => new Date(e.start_time).getTime() < now - 86400000);

  const displayedList = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        {/* Breadcrumb Navigation */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#1A1A2E] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover Feed
          </Link>
        </div>

        {/* Organizer Header Card */}
        <div className="bg-white rounded-3xl border border-[#E8E4DF] p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A84C]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            {/* Avatar & Identity */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#1A1A2E] text-[#C9A84C] flex items-center justify-center text-2xl font-bold font-serif shadow-md border-2 border-[#C9A84C]/30 shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.slice(0, 2).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1A1A2E]">
                    {name}
                  </h1>
                  <span className="text-xs text-[#E8621A] bg-[#FEF0E7] px-2.5 py-0.5 rounded-full font-bold border border-[#E8621A]/20">
                    Verified Host
                  </span>
                </div>
                <p className="text-xs text-[#8A8A8A] font-mono mt-0.5">@{cleanHandle}</p>
                <div className="flex items-center gap-4 text-xs text-[#4B4B4B] mt-2">
                  <span className="font-semibold text-[#1A1A2E]">
                    <strong>{followerCount}</strong> Followers
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-[#1A1A2E]">
                    <strong>{events.length}</strong> Gatherings Hosted
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Follow Host & Share */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              {!isFollowing ? (
                <button
                  onClick={() => setShowFollowInput(!showFollowInput)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Follow Host</span>
                </button>
              ) : (
                <div className="flex-1 sm:flex-none px-4 py-2 rounded-[10px] bg-[#E8F5EE] border border-[#1A7A4A]/30 text-[#1A7A4A] text-xs font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Following</span>
                </div>
              )}

              <button
                onClick={handleCopyProfile}
                className="p-2.5 rounded-[10px] border border-[#C8C4BF] bg-white hover:bg-[#F9F7F4] text-[#1A1A2E] shadow-sm transition-colors"
                title="Share Organizer Profile"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Follow Input Modal Drawer */}
          {showFollowInput && !isFollowing && (
            <form
              onSubmit={handleFollowSubmit}
              className="p-4 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] flex flex-col sm:flex-row items-center gap-2 max-w-md animate-modal"
            >
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email for new gathering alerts..."
                className="w-full sm:flex-1 bg-white border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
              />
              <button
                type="submit"
                disabled={submittingFollow}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1A1A2E] text-white text-xs font-bold shrink-0 hover:bg-[#16213E] transition-colors"
              >
                {submittingFollow ? 'Saving...' : 'Get Email Alerts'}
              </button>
            </form>
          )}

          {/* Bio Narrative */}
          <div className="pt-4 border-t border-[#E8E4DF] text-xs sm:text-sm text-[#4B4B4B] leading-relaxed max-w-3xl">
            {bio}
          </div>
        </div>

        {/* Gatherings Tabs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`text-sm font-bold pb-2 transition-colors relative ${
                  activeTab === 'upcoming'
                    ? 'text-[#1A1A2E]'
                    : 'text-[#8A8A8A] hover:text-[#1A1A2E]'
                }`}
              >
                Upcoming Gatherings ({upcomingEvents.length})
                {activeTab === 'upcoming' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('past')}
                className={`text-sm font-bold pb-2 transition-colors relative ${
                  activeTab === 'past'
                    ? 'text-[#1A1A2E]'
                    : 'text-[#8A8A8A] hover:text-[#1A1A2E]'
                }`}
              >
                Past Gatherings ({pastEvents.length})
                {activeTab === 'past' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8621A] rounded-full" />
                )}
              </button>
            </div>

            <span className="text-xs text-[#8A8A8A]">Curated by @{cleanHandle}</span>
          </div>

          {/* Events Grid */}
          {displayedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedList.map((ev, idx) => (
                <EventCard key={ev.id || idx} event={ev} rsvpCount={18 + idx * 6} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E4DF] p-12 text-center space-y-2">
              <p className="text-sm font-bold text-[#1A1A2E]">
                No {activeTab} gatherings found for this organizer.
              </p>
              <p className="text-xs text-[#8A8A8A]">
                Follow @{cleanHandle} to be the first to know when tickets &amp; invitations drop.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
