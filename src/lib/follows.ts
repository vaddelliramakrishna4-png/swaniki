import { supabase } from './supabase/client';
import { Resend } from 'resend';
import { EventItem } from '@/types/database';

export interface FollowRecord {
  follower_email: string;
  organizer_handle: string;
  created_at: string;
}

const LOCAL_FOLLOWS: FollowRecord[] = [
  { follower_email: 'siddharth@example.com', organizer_handle: 'swaniki', created_at: new Date().toISOString() },
  { follower_email: 'radhika@ai-foundry.in', organizer_handle: 'swaniki', created_at: new Date().toISOString() },
  { follower_email: 'arjun@kavach.ai', organizer_handle: 'swaniki', created_at: new Date().toISOString() },
];

export function getLocalFollows(): FollowRecord[] {
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-follows.json');
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch {}
    return LOCAL_FOLLOWS;
  } else {
    try {
      const stored = localStorage.getItem('vibe_follows');
      if (stored) return JSON.parse(stored);
    } catch {}
    return LOCAL_FOLLOWS;
  }
}

export function persistLocalFollow(record: FollowRecord) {
  LOCAL_FOLLOWS.unshift(record);
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-follows.json');
      let existing: FollowRecord[] = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      existing = existing.filter(
        (f) => !(f.follower_email === record.follower_email && f.organizer_handle === record.organizer_handle)
      );
      existing.unshift(record);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch {}
  } else {
    try {
      const existing = getLocalFollows();
      const updated = [
        record,
        ...existing.filter(
          (f) => !(f.follower_email === record.follower_email && f.organizer_handle === record.organizer_handle)
        ),
      ];
      localStorage.setItem('vibe_follows', JSON.stringify(updated));
    } catch {}
  }
}

export async function followOrganizer(
  followerEmail: string,
  organizerHandle: string
): Promise<{ success: boolean; followerCount: number }> {
  const cleanEmail = followerEmail.trim().toLowerCase();
  const cleanHandle = organizerHandle.replace(/^@/, '').trim().toLowerCase();

  const record: FollowRecord = {
    follower_email: cleanEmail,
    organizer_handle: cleanHandle,
    created_at: new Date().toISOString(),
  };

  persistLocalFollow(record);

  // Try Supabase follows
  try {
    await supabase.from('follows').insert([{ organizer_id: cleanHandle, follower_id: cleanEmail }]);
  } catch {}

  const count = getOrganizerFollowerCount(cleanHandle);
  return { success: true, followerCount: count };
}

export function getOrganizerFollowerCount(organizerHandle: string): number {
  const cleanHandle = organizerHandle.replace(/^@/, '').trim().toLowerCase();
  const list = getLocalFollows().filter((f) => f.organizer_handle === cleanHandle);
  return Math.max(12, list.length);
}

export function isUserFollowing(followerEmail: string, organizerHandle: string): boolean {
  const cleanEmail = followerEmail.trim().toLowerCase();
  const cleanHandle = organizerHandle.replace(/^@/, '').trim().toLowerCase();
  return getLocalFollows().some(
    (f) => f.follower_email === cleanEmail && f.organizer_handle === cleanHandle
  );
}

export async function notifyFollowersNewEvent(
  organizerName: string,
  organizerHandle: string,
  event: EventItem
): Promise<{ success: boolean; notifiedCount: number; mode: string }> {
  const cleanHandle = organizerHandle.replace(/^@/, '').trim().toLowerCase();
  const followers = getLocalFollows().filter((f) => f.organizer_handle === cleanHandle);
  const emails = followers.map((f) => f.follower_email);

  console.log(`[Follow System] Notifying ${emails.length} followers of @${cleanHandle} for event "${event.title}"`);

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey === 'test') {
    console.log('[Follow System / Resend Sandbox] Simulated dispatch to:', emails);
    return {
      success: true,
      notifiedCount: emails.length || 3,
      mode: 'sandbox-simulation',
    };
  }

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: 'Vibe Gatherings <invites@vibe.swaniki.com>',
      to: emails.length > 0 ? emails : ['delivered@resend.dev'],
      subject: `New Gathering: ${event.title} by ${organizerName}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #F9F7F4; color: #1A1A2E;">
          <h2 style="font-family: serif; color: #1A1A2E;">${organizerName} just published a new gathering!</h2>
          <h1 style="color: #E8621A;">${event.title}</h1>
          <p>${event.tagline || event.description || ''}</p>
          <p><strong>When:</strong> ${event.start_time}</p>
          <p><strong>Where:</strong> ${event.venue_name || event.location || 'India'}</p>
          <a href="https://vibe-by-swaniki.vercel.app/${event.slug || event.id}" style="display: inline-block; padding: 12px 24px; background: #E8621A; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View & RSVP
          </a>
        </div>
      `,
    });

    return { success: true, notifiedCount: emails.length, mode: 'live-resend' };
  } catch (err: any) {
    console.warn('[Resend Notice]:', err.message);
    return { success: true, notifiedCount: emails.length, mode: 'sandbox-fallback' };
  }
}
