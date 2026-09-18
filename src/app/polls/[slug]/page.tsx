'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Check,
  ArrowLeft,
  Share2,
  Sparkles,
  ArrowRight,
  Vote,
  Trophy,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { DatePollItem } from '@/types/database';
import { fetchPollBySlug, voteOnDatePoll } from '@/lib/polls';

export default function DatePollPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug || '') as string;

  const [poll, setPoll] = useState<DatePollItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [voterEmail, setVoterEmail] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPollBySlug(slug).then((data) => {
        setPoll(data);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center parchment-bg">
        <div className="w-8 h-8 border-3 border-[#E8621A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center parchment-bg p-4 text-center">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Poll Not Found</h2>
        <Link href="/" className="mt-3 text-sm text-[#E8621A] font-semibold underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

  // Find current winning option
  let winningIdx = 0;
  let maxVotes = -1;
  poll.options.forEach((opt, idx) => {
    if (opt.votes.length > maxVotes) {
      maxVotes = opt.votes.length;
      winningIdx = idx;
    }
  });

  const winningOption = poll.options[winningIdx];

  const handleCastVote = async (idx: number) => {
    if (!voterEmail.trim()) {
      alert('Please enter your email to cast your vote.');
      return;
    }

    const res = await voteOnDatePoll(slug, idx, voterEmail);
    if (res.success && res.poll) {
      setPoll(res.poll);
      setSelectedIdx(idx);
      setHasVoted(true);
    }
  };

  const handleConvertToEvent = () => {
    const winningDateStr = winningOption ? winningOption.date : '';
    router.push(
      `/create?title=${encodeURIComponent(poll.title)}&preferred_date=${encodeURIComponent(
        winningDateStr
      )}`
    );
  };

  const handleSharePoll = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#1A1A2E] font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Gatherings
        </Link>

        {/* Poll Header Card */}
        <div className="bg-white rounded-3xl border border-[#E8E4DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF0E7] text-[#E8621A] text-xs font-bold border border-[#E8621A]/20">
              <CalendarCheck className="w-3.5 h-3.5" /> Date Availability Poll
            </span>

            <button
              onClick={handleSharePoll}
              className="p-2 rounded-lg border border-[#E8E4DF] hover:bg-[#F9F7F4] text-xs text-[#1A1A2E] flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1A7A4A]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Share Poll'}</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1A1A2E] leading-tight">
              {poll.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#4B4B4B] mt-1.5">
              Vote on the dates that work best for your calendar. The host will lock in the winning date.
            </p>
          </div>

          {/* Email input if not voted */}
          {!hasVoted && (
            <div className="p-4 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] space-y-2">
              <label className="block text-xs font-bold text-[#1A1A2E]">
                Your Email Address <span className="text-[#E8621A]">*</span>
              </label>
              <input
                type="email"
                required
                value={voterEmail}
                onChange={(e) => setVoterEmail(e.target.value)}
                placeholder="Enter your email to unlock voting (e.g. you@company.com)"
                className="w-full bg-white border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
              />
            </div>
          )}

          {/* Date Options Bar Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8A8A8A] font-semibold pb-1">
              <span>Proposed Dates (IST)</span>
              <span>{totalVotes} Total Votes</span>
            </div>

            {poll.options.map((opt, idx) => {
              const count = opt.votes.length;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isWinner = totalVotes > 0 && idx === winningIdx;
              const isUserPick = selectedIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => !hasVoted && handleCastVote(idx)}
                  className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
                    !hasVoted ? 'cursor-pointer hover:border-[#C8C4BF]' : ''
                  } ${
                    isUserPick
                      ? 'border-[#E8621A] bg-[#FEF0E7]/20 ring-1 ring-[#E8621A]'
                      : 'border-[#E8E4DF] bg-white'
                  }`}
                >
                  {/* Visual Vote Bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#C9A84C]/15 transition-all duration-500 pointer-events-none"
                    style={{ width: `${pct}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                          isUserPick
                            ? 'border-[#E8621A] bg-[#E8621A] text-white'
                            : 'border-[#C8C4BF] bg-white text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>

                      <span className="font-bold text-[#1A1A2E]">{opt.date}</span>

                      {isWinner && totalVotes > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                          <Trophy className="w-3 h-3 text-[#B45309]" /> Leading
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono shrink-0">
                      <span className="text-xs text-[#4B4B4B]">{count} votes</span>
                      <span className="text-sm font-bold text-[#1A1A2E] w-12 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasVoted && (
            <div className="p-3.5 rounded-xl bg-[#E8F5EE] border border-[#1A7A4A]/30 text-xs text-[#1A7A4A] font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Your vote has been counted! The organizer will notify you once the date is finalized.</span>
            </div>
          )}

          {/* Convert to Event Action (Host controls) */}
          <div className="pt-4 border-t border-[#E8E4DF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#1A1A2E]">Ready to schedule this gathering?</h4>
              <p className="text-xs text-[#8A8A8A]">
                Convert this poll directly into a live event using the winning date.
              </p>
            </div>

            <button
              onClick={handleConvertToEvent}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Convert to Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
