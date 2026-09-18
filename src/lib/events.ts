import { supabase, isSupabaseConfigured } from './supabase/client';
import { EventItem, RSVPItem, CommentItem } from '@/types/database';
import { nanoid } from 'nanoid';

export const LOCAL_CREATED_EVENTS: EventItem[] = [];

export function getLocalEvents(): EventItem[] {
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-events.json');
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch {}
  } else {
    try {
      const stored = localStorage.getItem('vibe_local_events');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return LOCAL_CREATED_EVENTS;
}

export function persistLocalEvent(event: EventItem) {
  LOCAL_CREATED_EVENTS.unshift(event);
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-events.json');
      let existing: EventItem[] = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      existing = existing.filter((e) => e.id !== event.id && e.slug !== event.slug);
      existing.unshift(event);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch {}
  } else {
    try {
      let existing: EventItem[] = [];
      const stored = localStorage.getItem('vibe_local_events');
      if (stored) {
        existing = JSON.parse(stored);
      }
      existing = existing.filter((e) => e.id !== event.id && e.slug !== event.slug);
      existing.unshift(event);
      localStorage.setItem('vibe_local_events', JSON.stringify(existing));

      // Asynchronously sync to the server local-events.json
      fetch('/api/events/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {});
    } catch {}
  }
}

export const INITIAL_CURATED_EVENTS: EventItem[] = [
  {
    id: 'bengaluru-ai-founders-salon',
    title: 'Bengaluru AI Founders & Builders Salon',
    tagline: 'An intimate evening of deep-tech demos and fireside discussions in Indiranagar',
    description:
      'Join 40 of Bengaluru’s top AI engineers, researchers, and founders for a private dinner and lightning demo salon. We will explore frontier multimodal models, agentic workflows, and the next wave of Indian AI startups building for global scale. Filter coffee, craft cocktails, and curated dinner included.',
    category: 'Technology',
    theme_template: 'Sprint',
    start_time: '2026-09-18T19:00:00+05:30',
    end_time: '2026-09-18T22:30:00+05:30',
    location: '12th Main Rd, Indiranagar, Bengaluru, Karnataka',
    venue_name: 'The Greenhouse Terrace, Indiranagar',
    is_virtual: false,
    capacity: 45,
    approval_required: true,
    status: 'published',
    cover_url:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    custom_questions: [
      {
        id: 'q1',
        label: 'What AI project or company are you currently building?',
        type: 'text',
        required: true,
      },
      {
        id: 'q2',
        label: 'LinkedIn or Twitter/X profile link',
        type: 'text',
        required: true,
      },
    ],
    sections: {
      speakers: [
        {
          name: 'Arjun Nambiar',
          role: 'Co-founder & CTO',
          company: 'Kavach AI',
          bio: 'Building open-weights agent frameworks for enterprise autonomy.',
        },
        {
          name: 'Pooja Sundaram',
          role: 'Principal Partner',
          company: 'Parampara Ventures',
          bio: 'Investing in seed-stage Indian deep tech and robotics.',
        },
      ],
      agenda: [
        { time: '7:00 PM', title: 'Welcome Drinks & Filter Coffee Mingling' },
        { time: '7:45 PM', title: 'Curated 5-Minute Lightning Demos (3 Founders)' },
        { time: '8:30 PM', title: 'Fireside: The Next 3 Years of Enterprise AI' },
        { time: '9:15 PM', title: 'Family-Style Rooftop Dinner' },
      ],
      faq: [
        {
          question: 'Is approval required?',
          answer: 'Yes, this is an intimate dinner capped at 45 attendees. We review applications daily.',
        },
        {
          question: 'Where can I park?',
          answer: 'Valet parking is available at the entrance on 12th Main Road.',
        },
      ],
    },
    organizer_name: 'Swaniki Studio & Builders Collective',
    city: 'Bengaluru',
  },
  {
    id: 'mumbai-sunset-acoustic-sundowner',
    title: 'Bandra Sunset Acoustic & Poetry Sundowner',
    tagline: 'Warm golden hour chords overlooking the Arabian Sea',
    description:
      'An unplugged twilight gathering featuring 4 independent singer-songwriters from Mumbai, spoken word poets, and woodfired sourdough pizzas on a private Bandra seafront terrace. Bring your warmest vibe and stories.',
    category: 'Music & Arts',
    theme_template: 'Ember',
    start_time: '2026-09-20T17:30:00+05:30',
    end_time: '2026-09-20T21:00:00+05:30',
    location: 'Carter Road, Bandra West, Mumbai, Maharashtra',
    venue_name: 'Sea Breeze Rooftop Salon',
    is_virtual: false,
    capacity: 60,
    approval_required: false,
    status: 'published',
    cover_url:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    custom_questions: [
      {
        id: 'q1',
        label: 'Favorite independent artist or poet?',
        type: 'text',
        required: false,
      },
    ],
    sections: {
      speakers: [
        {
          name: 'Kabir Varma',
          role: 'Folk-Acoustic Singer',
          company: 'Independent Artist',
          bio: 'Trained in Hindustani classical guitar & fingerstyle melodies.',
        },
      ],
      agenda: [
        { time: '5:30 PM', title: 'Sunset Arrival & Welcome Spiced Chai' },
        { time: '6:15 PM', title: 'Acoustic Set 1: Kabir Varma' },
        { time: '7:15 PM', title: 'Spoken Word Interlude' },
        { time: '8:00 PM', title: 'Community Jam & Woodfired Pizzas' },
      ],
      faq: [
        {
          question: 'Can I bring a plus one?',
          answer: 'Yes! Please indicate in the RSVP form so we can plan catering.',
        },
      ],
    },
    organizer_name: 'Bandra Collective & Swaniki Vibe',
    city: 'Mumbai',
  },
  {
    id: 'delhi-design-craft-dinner',
    title: 'Old Delhi Heritage & Modern Typography Dinner',
    tagline: 'Preserving Urdu calligraphy and reimagining Indian digital design',
    description:
      'A culinary and visual journey inside a restored Haveli in Old Delhi. Master calligraphers meet contemporary product designers to bridge centuries of Indian lettering with modern web aesthetics. Multi-course Mughlai & vegan tasting menu included.',
    category: 'Design & Culture',
    theme_template: 'Grove',
    start_time: '2026-09-25T19:00:00+05:30',
    end_time: '2026-09-25T23:00:00+05:30',
    location: 'Chandni Chowk, Old Delhi, Delhi NCR',
    venue_name: 'Haveli Dharampura, Old Delhi',
    is_virtual: false,
    capacity: 35,
    approval_required: true,
    status: 'published',
    cover_url:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    custom_questions: [
      {
        id: 'q1',
        label: 'Dietary preferences (Vegetarian / Non-Veg / Vegan)?',
        type: 'text',
        required: true,
      },
    ],
    sections: {
      agenda: [
        { time: '7:00 PM', title: 'Haveli Rooftop Sherbet & Welcome' },
        { time: '7:45 PM', title: 'Live Demonstration: Calligraphy on Rice Paper' },
        { time: '8:30 PM', title: 'Seven-Course Tasting Dinner' },
      ],
      faq: [],
    },
    organizer_name: 'Dharampura Cultural Guild',
    city: 'Delhi NCR',
  },
  {
    id: 'goa-founders-workation-mixer',
    title: 'Goa Twilight Oceanfront Founders Mixer',
    tagline: 'Barefoot strategy and cold brews by the Mandovi backwaters',
    description:
      'A casual weekend kickoff for founders, operators, and remote creators spending the season in Goa. High-signal conversations, artisanal kombuchas, and acoustic vinyl records as the sun dips into the sea.',
    category: 'Networking',
    theme_template: 'Bloom',
    start_time: '2026-09-27T18:00:00+05:30',
    end_time: '2026-09-27T22:00:00+05:30',
    location: 'Ashvem Beach Rd, Mandrem, North Goa',
    venue_name: 'Palm Grove Beach Sanctuary, Ashvem',
    is_virtual: false,
    capacity: 50,
    approval_required: false,
    status: 'published',
    cover_url:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    custom_questions: [],
    organizer_name: 'Goa Remote Tech Syndicate',
    city: 'Goa',
  },
];

export function mapDbRowToEvent(item: any, curatedFallback?: any): EventItem {
  return {
    id: item.id,
    organizer_id: item.organizer_id,
    title: item.title,
    description: item.description,
    category: item.category,
    theme_template: item.theme_template || 'Grove',
    start_time: item.start_time,
    end_time: item.end_time,
    start_at: item.start_time,
    end_at: item.end_time,
    location: item.location,
    venue_name: item.venue_name,
    location_name: item.venue_name,
    location_address: item.location,
    is_virtual: item.is_virtual ?? false,
    capacity: item.capacity || 50,
    approval_required: item.approval_required ?? false,
    status: item.status || 'published',
    created_at: item.created_at,
    cover_url: item.cover_url,
    custom_questions: item.custom_questions || [],
    slug: item.id,
    tagline: item.description ? item.description.slice(0, 80) : null,
    sections: curatedFallback?.sections ?? (item.custom_questions ? { faq: [] } : {}),
    organizer_name: curatedFallback?.organizer_name || 'Event Host',
    city: item.location ? item.location.split(',')[0].trim() : 'Bengaluru',
  };
}

export async function fetchEvents(): Promise<EventItem[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.warn('Supabase fetchEvents error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map database items to EventItem interface
    return data.map((item: any) => mapDbRowToEvent(item));
  } catch (err) {
    console.error('Error in fetchEvents:', err);
    return [];
  }
}

export async function fetchEventById(idOrSlug: string): Promise<EventItem | null> {
  try {
    if (!idOrSlug) return null;
    const cleanId = idOrSlug.trim();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    // 1. Direct Supabase query by UUID
    if (isUUID) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (data) {
        return mapDbRowToEvent(data);
      }
    }

    // 2. Direct Supabase query by slug
    try {
      const { data: bySlug } = await supabase
        .from('events')
        .select('*')
        .eq('slug', cleanId)
        .maybeSingle();

      if (bySlug) {
        return mapDbRowToEvent(bySlug);
      }
    } catch {}

    return null;
  } catch (err) {
    console.error('Error fetching event by ID from Supabase:', err);
    return null;
  }
}

export async function createEventRecord(
  eventData: Partial<EventItem>
): Promise<{ success: boolean; data?: EventItem; error?: string }> {
  try {
    let organizerId = eventData.organizer_id;
    if (!organizerId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          organizerId = user.id;
        }
      } catch {}
    }

    const startTime = eventData.start_time || eventData.start_at || new Date(Date.now() + 86400000).toISOString();
    const endTime = eventData.end_time || eventData.end_at || null;
    const location = eventData.location || (eventData as any).location_address || 'Bengaluru, Karnataka';
    const venueName = eventData.venue_name || (eventData as any).location_name || null;
    const coverUrl = eventData.cover_url || (eventData as any).cover_image_url || null;
    const themeTemplate = eventData.theme_template || (eventData as any).template || 'Grove';
    const status = eventData.status === 'live' ? 'published' : (eventData.status || 'published');

    // Strict payload matching actual PostgreSQL public.events table columns:
    const payload: any = {
      title: eventData.title || 'Untitled Gathering',
      description: eventData.description || null,
      category: eventData.category || 'Gathering',
      theme_template: themeTemplate,
      start_time: startTime,
      end_time: endTime,
      location: location,
      venue_name: venueName,
      is_virtual: eventData.is_virtual ?? false,
      capacity: eventData.capacity ?? 50,
      approval_required: eventData.approval_required ?? false,
      status: status,
      cover_url: coverUrl,
      custom_questions: eventData.custom_questions || [],
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organizerId || '');
    if (organizerId && isUUID) {
      payload.organizer_id = organizerId;
    }

    // 1. Try server-side publish API endpoint first (runs in server Supabase environment)
    if (typeof window !== 'undefined') {
      try {
        const apiRes = await fetch('/api/events/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const apiJson = await apiRes.json();
        if (apiJson.success && apiJson.event) {
          return { success: true, data: mapDbRowToEvent(apiJson.event) };
        }
        if (!apiJson.success && apiJson.error) {
          return { success: false, error: apiJson.error };
        }
      } catch (err) {
        console.warn('API publish route notice:', err);
      }
    }

    // 2. Try direct Supabase client insert
    const res = await supabase.from('events').insert([payload]).select().single();

    if (res.error) {
      console.error('Supabase event insert error:', res.error.message);
      return { success: false, error: res.error.message };
    }

    return { success: true, data: mapDbRowToEvent(res.data) };
  } catch (err: any) {
    console.error('Error in createEventRecord:', err);
    return { success: false, error: err.message };
  }
}



export const LOCAL_RSVPS: RSVPItem[] = [];
export const LOCAL_COMMENTS: CommentItem[] = [];

export function getLocalRSVPs(eventId?: string): RSVPItem[] {
  let all: RSVPItem[] = LOCAL_RSVPS;
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-rsvps.json');
      if (fs.existsSync(filePath)) {
        all = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch {}
  } else {
    try {
      const stored = localStorage.getItem('vibe_local_rsvps');
      if (stored) {
        all = JSON.parse(stored);
      }
    } catch {}
  }
  if (eventId) {
    return all.filter((r) => r.event_id === eventId);
  }
  return all;
}

export function persistLocalRSVP(rsvp: RSVPItem) {
  LOCAL_RSVPS.unshift(rsvp);
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-rsvps.json');
      let existing: RSVPItem[] = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      existing = existing.filter((r) => r.id !== rsvp.id && !(r.event_id === rsvp.event_id && r.guest_email === rsvp.guest_email));
      existing.unshift(rsvp);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch {}
  } else {
    try {
      const existing = getLocalRSVPs();
      const updated = [rsvp, ...existing.filter((r) => r.id !== rsvp.id && !(r.event_id === rsvp.event_id && r.guest_email === rsvp.guest_email))];
      localStorage.setItem('vibe_local_rsvps', JSON.stringify(updated));
    } catch {}
  }
}

export function getLocalComments(eventId?: string): CommentItem[] {
  let all: CommentItem[] = LOCAL_COMMENTS;
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-comments.json');
      if (fs.existsSync(filePath)) {
        all = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch {}
  } else {
    try {
      const stored = localStorage.getItem('vibe_local_comments');
      if (stored) {
        all = JSON.parse(stored);
      }
    } catch {}
  }
  if (eventId) {
    return all.filter((c) => c.event_id === eventId);
  }
  return all;
}

export function persistLocalComment(comment: CommentItem) {
  LOCAL_COMMENTS.unshift(comment);
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'local-comments.json');
      let existing: CommentItem[] = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      existing = existing.filter((c) => c.id !== comment.id);
      existing.unshift(comment);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch {}
  } else {
    try {
      const existing = getLocalComments();
      const updated = [comment, ...existing.filter((c) => c.id !== comment.id)];
      localStorage.setItem('vibe_local_comments', JSON.stringify(updated));
    } catch {}
  }
}

export async function submitRSVPRecord(
  rsvpData: {
    event_id: string;
    guest_name: string;
    guest_email: string;
    phone?: string;
    status?: 'confirmed' | 'waitlisted' | 'cancelled';
    answers?: any;
    user_id?: string | null;
  }
): Promise<{ success: boolean; error?: string; status?: string; rsvp?: RSVPItem }> {
  try {
    const finalStatus = rsvpData.status || 'confirmed';
    const email = rsvpData.guest_email.trim().toLowerCase();

    // Resolve user_id from auth user if not passed
    let resolvedUserId = rsvpData.user_id;
    if (!resolvedUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        resolvedUserId = user?.id ?? null;
      } catch {}
    }

    const isUUID = (v?: string | null) =>
      !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

    const validUserId = isUUID(resolvedUserId) ? resolvedUserId : null;
    const isEventUUID = isUUID(rsvpData.event_id);

    if (!isEventUUID) {
      return { success: false, error: 'Invalid event UUID' };
    }

    // 1. Check if RSVP already exists for this event and guest email
    const { data: existingRSVP } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', rsvpData.event_id)
      .eq('guest_email', email)
      .maybeSingle();

    if (existingRSVP) {
      let activeRSVP = existingRSVP;
      // If previously cancelled, re-activate the spot
      if (existingRSVP.status === 'cancelled') {
        const { data: updated } = await supabase
          .from('rsvps')
          .update({
            status: finalStatus,
            guest_name: rsvpData.guest_name.trim(),
            answers: {
              ...(rsvpData.answers || {}),
              phone: rsvpData.phone || '',
            },
          })
          .eq('id', existingRSVP.id)
          .select()
          .single();
        if (updated) {
          activeRSVP = updated;
        }
      }

      // Notify cross-tab BroadcastChannel and window
      if (typeof window !== 'undefined') {
        try {
          const bc = new BroadcastChannel(`vibe-event-sync-${rsvpData.event_id}`);
          bc.postMessage({ type: 'RSVP_CREATED', rsvp: activeRSVP });
          bc.close();
          window.dispatchEvent(new CustomEvent('vibe-rsvp-created', { detail: activeRSVP }));
          localStorage.setItem(`vibe_rsvped_${rsvpData.event_id}`, JSON.stringify(activeRSVP));
          localStorage.setItem('vibe_guest_email', email);
        } catch {}
      }
      return { success: true, status: activeRSVP.status || finalStatus, rsvp: activeRSVP };
    }

    // 2. Insert new RSVP into Supabase
    const payload: any = {
      event_id: rsvpData.event_id,
      guest_name: rsvpData.guest_name.trim(),
      guest_email: email,
      status: finalStatus,
      answers: {
        ...(rsvpData.answers || {}),
        phone: rsvpData.phone || '',
      },
    };
    if (validUserId) {
      payload.user_id = validUserId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('rsvps')
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      // If unique constraint hit concurrently, fetch existing
      if (insertError.code === '23505') {
        const { data: fetched } = await supabase
          .from('rsvps')
          .select('*')
          .eq('event_id', rsvpData.event_id)
          .eq('guest_email', email)
          .maybeSingle();
        if (fetched) {
          return { success: true, status: fetched.status, rsvp: fetched };
        }
      }
      console.error('Supabase RSVP insert error:', insertError.message);
      return { success: false, error: insertError.message };
    }

    const saved = inserted as RSVPItem;

    // Notify window and BroadcastChannel
    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel(`vibe-event-sync-${rsvpData.event_id}`);
        bc.postMessage({ type: 'RSVP_CREATED', rsvp: saved });
        bc.close();
        window.dispatchEvent(new CustomEvent('vibe-rsvp-created', { detail: saved }));
        localStorage.setItem(`vibe_rsvped_${rsvpData.event_id}`, JSON.stringify(saved));
        localStorage.setItem('vibe_guest_email', email);
      } catch {}
    }

    return { success: true, status: saved.status || finalStatus, rsvp: saved };
  } catch (err: any) {
    console.error('Error submitting RSVP to Supabase:', err);
    return { success: false, error: err.message || 'Failed to submit RSVP' };
  }
}

export async function fetchEventRSVPs(eventId: string): Promise<RSVPItem[]> {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId);
    if (!isUUID) {
      return [];
    }

    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    // Strictly deduplicate by guest_email so each person is only ever counted ONCE
    const seen = new Set<string>();
    const unique: RSVPItem[] = [];

    for (const r of data as RSVPItem[]) {
      const cleanEmail = (r.guest_email || '').trim().toLowerCase();
      if (cleanEmail && !seen.has(cleanEmail)) {
        seen.add(cleanEmail);
        unique.push(r);
      }
    }

    return unique;
  } catch (err) {
    console.error('Error fetching RSVPs from Supabase:', err);
    return [];
  }
}

export async function fetchEventComments(eventId: string): Promise<CommentItem[]> {
  try {
    const local = getLocalComments(eventId);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId);

    if (!isUUID) {
      return local;
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      return local;
    }

    const remote = (data as CommentItem[]) || [];
    const seen = new Set<string>();
    const merged: CommentItem[] = [];

    for (const c of [...remote, ...local]) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        merged.push(c);
      }
    }

    return merged;
  } catch {
    return getLocalComments(eventId);
  }
}

export async function addEventComment(
  commentData: { event_id: string; author_name: string; author_email?: string; body: string }
): Promise<{ success: boolean; error?: string; comment?: CommentItem }> {
  try {
    const fallbackComment: CommentItem = {
      id: 'comment-' + Date.now(),
      event_id: commentData.event_id,
      author_name: commentData.author_name.trim(),
      author_email: commentData.author_email?.trim() || undefined,
      body: commentData.body.trim(),
      created_at: new Date().toISOString(),
    };

    persistLocalComment(fallbackComment);

    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel(`vibe-event-comments-${commentData.event_id}`);
        bc.postMessage({ type: 'COMMENT_ADDED', comment: fallbackComment });
        bc.close();
      } catch {}
    }

    const { data, error } = await supabase.from('comments').insert([commentData]).select().single();
    if (error) {
      console.warn('Supabase comment insert notice (saved locally):', error.message);
      return { success: true, comment: fallbackComment };
    }
    return { success: true, comment: (data as CommentItem) || fallbackComment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Cancel an RSVP, update capacity, and dispatch cancellation email.
 */
export async function cancelRSVP(
  eventId: string,
  guestEmail: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = guestEmail.trim().toLowerCase();

    // 1. Update in local storage / local file
    const local = getLocalRSVPs(eventId);
    let cancelledRSVP: RSVPItem | null = null;
    for (const r of local) {
      if (r.event_id === eventId && r.guest_email.toLowerCase() === cleanEmail) {
        r.status = 'cancelled';
        cancelledRSVP = r;
      }
    }
    if (cancelledRSVP) {
      persistLocalRSVP(cancelledRSVP);
    }

    // 2. Update in Supabase
    try {
      await supabase
        .from('rsvps')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('guest_email', cleanEmail);
    } catch (err) {
      console.warn('Supabase cancel RSVP notice:', err);
    }

    // 3. Broadcast across tabs & clean up local confirmation tag
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`vibe_rsvped_${eventId}`);
        const bc = new BroadcastChannel(`vibe-event-sync-${eventId}`);
        bc.postMessage({ type: 'RSVP_CANCELLED', email: cleanEmail, eventId });
        bc.close();
        window.dispatchEvent(
          new CustomEvent('vibe-rsvp-cancelled', { detail: { email: cleanEmail, eventId } })
        );
      } catch {}
    }

    // 4. Dispatch white-labeled cancellation email
    try {
      if (typeof window !== 'undefined') {
        fetch('/api/emails/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cancellation',
            eventId,
            guestName: cancelledRSVP?.guest_name || 'Guest',
            guestEmail: cleanEmail,
            reason: reason || 'Your RSVP has been cancelled at your request and your spot released.',
          }),
        }).catch(() => {});
      }
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all RSVPs for a given guest email or user ID across all gatherings.
 * Uses a single joined query to Supabase: rsvps joined with events.
 */
export async function fetchGuestRSVPs(
  param: string | { userId?: string | null; email?: string | null }
): Promise<{ rsvp: RSVPItem; event: EventItem }[]> {
  let userId: string | undefined;
  let userEmail: string | undefined;

  if (typeof param === 'string') {
    if (param.includes('@')) {
      userEmail = param.trim().toLowerCase();
    } else {
      userId = param.trim();
    }
  } else if (param) {
    userId = param.userId || undefined;
    userEmail = param.email ? param.email.trim().toLowerCase() : undefined;
  }

  if (!userId && !userEmail) {
    return [];
  }

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('rsvps')
        .select(`
          *,
          event:events(
            id,
            organizer_id,
            title,
            description,
            category,
            theme_template,
            start_time,
            end_time,
            location,
            venue_name,
            is_virtual,
            capacity,
            approval_required,
            status,
            cover_url,
            custom_questions,
            created_at
          )
        `);

      if (userId && userEmail) {
        query = query.or(`user_id.eq.${userId},guest_email.eq.${userEmail}`);
      } else if (userId) {
        query = query.eq('user_id', userId);
      } else if (userEmail) {
        query = query.eq('guest_email', userEmail);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('fetchGuestRSVPs query error:', error);
      } else if (data) {
        const results: { rsvp: RSVPItem; event: EventItem }[] = [];

        for (const row of data as any[]) {
          const rawEvent = Array.isArray(row.event) ? row.event[0] : row.event;
          if (!rawEvent) continue;

          const mappedEvent = mapDbRowToEvent(rawEvent);
          const mappedRsvp: RSVPItem = {
            id: row.id,
            event_id: row.event_id,
            user_id: row.user_id,
            guest_name: row.guest_name,
            guest_email: row.guest_email,
            status: row.status || 'confirmed',
            answers: row.answers || {},
            created_at: row.created_at,
            event: mappedEvent,
          };

          results.push({ rsvp: mappedRsvp, event: mappedEvent });
        }

        return results;
      }
    } catch (e) {
      console.error('fetchGuestRSVPs exception:', e);
    }
  }

  // Fallback for offline / demo events
  const cleanEmail = userEmail || '';
  if (!cleanEmail) return [];
  const allEvents = await fetchEvents();
  const results: { rsvp: RSVPItem; event: EventItem }[] = [];

  for (const event of allEvents) {
    const rsvps = await fetchEventRSVPs(event.id);
    const userRsvp = rsvps.find((r) => r.guest_email.toLowerCase() === cleanEmail);
    if (userRsvp) {
      results.push({ rsvp: userRsvp, event });
    }
  }

  return results;
}

/**
 * Duplicate an existing event for fast replication.
 */
export async function duplicateEventRecord(
  eventId: string
): Promise<{ success: boolean; event?: EventItem; error?: string }> {
  const source = await fetchEventById(eventId);
  if (!source) return { success: false, error: 'Event not found' };

  const newSlug = `${source.slug || source.id}-copy-${nanoid(4)}`;
  const cloned: Partial<EventItem> = {
    ...source,
    title: `${source.title} (Copy)`,
    slug: newSlug,
    status: 'draft',
    created_at: new Date().toISOString(),
  };
  delete cloned.id;

  const res = await createEventRecord(cloned);
  return { success: res.success, event: res.data, error: res.error };
}

/**
 * Update an existing event record.
 */
export async function updateEventRecord(
  eventId: string,
  partial: Partial<EventItem>
): Promise<{ success: boolean; event?: EventItem; error?: string }> {
  const existing = await fetchEventById(eventId);
  if (!existing) return { success: false, error: 'Event not found' };

  const updated: EventItem = {
    ...existing,
    ...partial,
  };

  persistLocalEvent(updated);

  if (isSupabaseConfigured()) {
    try {
      const dbPayload: any = {};
      if (partial.title !== undefined) dbPayload.title = partial.title;
      if (partial.description !== undefined) dbPayload.description = partial.description;
      if (partial.category !== undefined) dbPayload.category = partial.category;
      if (partial.theme_template !== undefined) dbPayload.theme_template = partial.theme_template;
      if (partial.start_time !== undefined || partial.start_at !== undefined) {
        dbPayload.start_time = partial.start_time || partial.start_at;
      }
      if (partial.end_time !== undefined || partial.end_at !== undefined) {
        dbPayload.end_time = partial.end_time || partial.end_at;
      }
      if (partial.location !== undefined || partial.location_address !== undefined) {
        dbPayload.location = partial.location || partial.location_address;
      }
      if (partial.venue_name !== undefined || partial.location_name !== undefined) {
        dbPayload.venue_name = partial.venue_name || partial.location_name;
      }
      if (partial.is_virtual !== undefined) dbPayload.is_virtual = partial.is_virtual;
      if (partial.capacity !== undefined) dbPayload.capacity = partial.capacity;
      if (partial.approval_required !== undefined) dbPayload.approval_required = partial.approval_required;
      if (partial.status !== undefined) dbPayload.status = partial.status;
      if (partial.cover_url !== undefined || (partial as any).cover_image_url !== undefined) {
        dbPayload.cover_url = partial.cover_url || (partial as any).cover_image_url;
      }
      if (partial.custom_questions !== undefined || (partial as any).rsvp_form_config !== undefined) {
        dbPayload.custom_questions = partial.custom_questions || (partial as any).rsvp_form_config;
      }

      if (Object.keys(dbPayload).length > 0) {
        const { error } = await supabase.from('events').update(dbPayload).eq('id', eventId);
        if (error) {
          console.error('updateEventRecord database error:', error);
          return { success: false, error: error.message };
        }
      }
    } catch (err: any) {
      console.error('updateEventRecord exception:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true, event: updated };
}


