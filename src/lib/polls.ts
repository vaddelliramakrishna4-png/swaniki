import { supabase } from './supabase/client';
import { DatePollItem, DatePollOption } from '@/types/database';

export const LOCAL_POLLS: DatePollItem[] = [
  {
    id: 'poll-bangalore-founder-brunch',
    slug: 'bangalore-founder-brunch',
    title: 'Indiranagar Rooftop Founders Brunch & Coffee',
    organizer_id: 'swaniki',
    options: [
      { date: 'Sat, 26 Sep · 11:00 AM IST', votes: ['arjun@kavach.ai', 'meera@gmail.com', 'rohan@tech.co'] },
      { date: 'Sun, 27 Sep · 11:30 AM IST', votes: ['radhika@frontier-bio.in', 'ananya@design.org', 'vikram@fund.in', 'karan@cloud.in'] },
      { date: 'Sat, 03 Oct · 11:00 AM IST', votes: ['pooja@parampara.vc'] },
    ],
    created_at: new Date().toISOString(),
  },
];

export function getLocalPolls(): DatePollItem[] {
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-polls.json');
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch {}
    return LOCAL_POLLS;
  } else {
    try {
      const stored = localStorage.getItem('vibe_local_polls');
      if (stored) return JSON.parse(stored);
    } catch {}
    return LOCAL_POLLS;
  }
}

export function persistLocalPoll(poll: DatePollItem) {
  LOCAL_POLLS.unshift(poll);
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-polls.json');
      let existing: DatePollItem[] = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      existing = existing.filter((p) => p.id !== poll.id && p.slug !== poll.slug);
      existing.unshift(poll);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch {}
  } else {
    try {
      const existing = getLocalPolls();
      const updated = [poll, ...existing.filter((p) => p.id !== poll.id && p.slug !== poll.slug)];
      localStorage.setItem('vibe_local_polls', JSON.stringify(updated));
    } catch {}
  }
}

export async function fetchPollBySlug(slug: string): Promise<DatePollItem | null> {
  const local = getLocalPolls().find((p) => p.slug === slug || p.id === slug);
  if (local) return local;

  try {
    const { data, error } = await supabase
      .from('date_polls')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return data as DatePollItem;
  } catch {
    return null;
  }
}

export async function createDatePoll(pollData: {
  title: string;
  slug: string;
  options: string[];
  organizer_id?: string;
}): Promise<DatePollItem> {
  const newPoll: DatePollItem = {
    id: 'poll-' + Date.now(),
    slug: pollData.slug,
    title: pollData.title,
    organizer_id: pollData.organizer_id || 'organizer',
    options: pollData.options.map((opt) => ({ date: opt, votes: [] })),
    created_at: new Date().toISOString(),
  };

  persistLocalPoll(newPoll);

  try {
    await supabase.from('date_polls').insert([
      {
        id: newPoll.id,
        slug: newPoll.slug,
        title: newPoll.title,
        options: newPoll.options,
      },
    ]);
  } catch {}

  return newPoll;
}

export async function voteOnDatePoll(
  pollSlug: string,
  optionIndex: number,
  voterEmail: string
): Promise<{ success: boolean; poll?: DatePollItem }> {
  const poll = await fetchPollBySlug(pollSlug);
  if (!poll || !poll.options[optionIndex]) {
    return { success: false };
  }

  const cleanEmail = voterEmail.trim().toLowerCase();
  const option = poll.options[optionIndex];

  if (!option.votes.includes(cleanEmail)) {
    option.votes.push(cleanEmail);
  }

  persistLocalPoll(poll);

  try {
    await supabase.from('date_polls').update({ options: poll.options }).eq('slug', pollSlug);
  } catch {}

  return { success: true, poll };
}
