'use client';

import React, { useState } from 'react';
import { CalendarCheck, Check, Vote } from 'lucide-react';
import { DatePollOption } from '@/types/database';

interface DatePollProps {
  title?: string;
  initialOptions?: DatePollOption[];
}

export function DatePoll({
  title = 'When are you free for this gathering?',
  initialOptions = [
    { date: 'Fri, 25 Sep · 7:00 PM IST', votes: ['aarav@swaniki.com', 'meera@gmail.com'] },
    { date: 'Sat, 26 Sep · 6:30 PM IST', votes: ['siddharth@gmail.com', 'karan@tech.in', 'ananya@design.org'] },
    { date: 'Sun, 27 Sep · 5:00 PM IST', votes: ['priya@startup.co'] },
  ],
}: DatePollProps) {
  const [options, setOptions] = useState<DatePollOption[]>(initialOptions);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [voterEmail, setVoterEmail] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes.length, 0);

  const handleVote = (index: number) => {
    if (!voterEmail.trim()) {
      alert('Please enter your email to cast your vote');
      return;
    }

    const updated = [...options];
    if (!updated[index].votes.includes(voterEmail.trim())) {
      updated[index].votes.push(voterEmail.trim());
    }
    setOptions(updated);
    setUserVote(index);
    setHasVoted(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-[#E8621A]" />
          <h4 className="text-sm font-bold text-[#1A1A2E] font-['Inter']">
            {title}
          </h4>
        </div>
        <span className="text-[11px] text-[#8A8A8A] font-medium">
          {totalVotes} vote{totalVotes === 1 ? '' : 's'} recorded
        </span>
      </div>

      {!hasVoted && (
        <div className="flex items-center gap-2">
          <input
            type="email"
            required
            value={voterEmail}
            onChange={(e) => setVoterEmail(e.target.value)}
            placeholder="Enter your email to vote..."
            className="flex-1 bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-1.5 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
          />
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const voteCount = opt.votes.length;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isUserPick = userVote === idx;

          return (
            <div
              key={idx}
              onClick={() => !hasVoted && handleVote(idx)}
              className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                !hasVoted ? 'cursor-pointer hover:border-[#C8C4BF]' : ''
              } ${
                isUserPick
                  ? 'border-[#E8621A] bg-[#FEF0E7]/20 ring-1 ring-[#E8621A]'
                  : 'border-[#E8E4DF] bg-white'
              }`}
            >
              {/* Progress Bar Background */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#C9A84C]/10 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />

              <div className="relative z-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      isUserPick
                        ? 'border-[#E8621A] bg-[#E8621A] text-white'
                        : 'border-[#C8C4BF] bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold text-[#1A1A2E]">{opt.date}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[#4B4B4B]">
                  <span>{voteCount} votes</span>
                  <span className="font-bold text-[#1A1A2E]">{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <p className="text-[11px] text-[#1A7A4A] font-semibold text-center pt-1">
          ✓ Your vote has been recorded! The host will finalize the date based on responses.
        </p>
      )}
    </div>
  );
}
