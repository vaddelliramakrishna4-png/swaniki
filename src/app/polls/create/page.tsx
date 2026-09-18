'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import {
  CalendarCheck,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { createDatePoll } from '@/lib/polls';

export default function CreateDatePollPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState<string[]>([
    'Fri, 02 Oct · 7:00 PM IST',
    'Sat, 03 Oct · 6:30 PM IST',
    'Sun, 04 Oct · 11:30 AM IST',
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddDate = () => {
    setDates((prev) => [...prev, 'Sat, 10 Oct · 6:30 PM IST']);
  };

  const handleRemoveDate = (idx: number) => {
    setDates((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDateChange = (idx: number, val: string) => {
    setDates((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || dates.length < 2) return;

    setSubmitting(true);
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      nanoid(4);

    await createDatePoll({
      title: title.trim(),
      slug,
      options: dates.filter((d) => d.trim().length > 0),
    });

    router.push(`/polls/${slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#1A1A2E] font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
        </Link>

        <div className="bg-white rounded-3xl border border-[#E8E4DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF0E7] text-[#E8621A] text-xs font-bold mb-2">
              <CalendarCheck className="w-3.5 h-3.5" /> Pre-Event Availability
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1A1A2E]">
              Create a Date Poll
            </h1>
            <p className="text-xs sm:text-sm text-[#4B4B4B] mt-1">
              Find out when your guests and co-hosts are free before locking in a venue or sending invitations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Poll Title */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
                Gathering Title / Idea <span className="text-[#E8621A]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bandra Sunset Terrace Dinner & Poetry"
                className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
              />
            </div>

            {/* Proposed Dates List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1A2E]">
                  Proposed Date Options (in IST)
                </label>
                <button
                  type="button"
                  onClick={handleAddDate}
                  className="text-xs font-bold text-[#E8621A] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Date
                </button>
              </div>

              {dates.map((dateStr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={dateStr}
                    onChange={(e) => handleDateChange(idx, e.target.value)}
                    placeholder="e.g. Sat, 14 Sep · 7:00 PM IST"
                    className="flex-1 bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-4 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                  />
                  {dates.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(idx)}
                      className="p-2 text-[#8A8A8A] hover:text-[#E8621A] transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{submitting ? 'Creating Poll...' : 'Publish & Share Poll'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
