import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventPageContainer } from '@/components/events/EventPageContainer';
import { OrganizerProfileView } from '@/components/organizer/OrganizerProfileView';
import { fetchEventById, fetchEventRSVPs, fetchEvents } from '@/lib/events';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

const RESERVED_SLUGS = new Set([
  'api',
  'auth',
  'create',
  'templates',
  'events',
  'polls',
  'guest',
  'manage',
  'emails',
  '_next',
  'favicon.ico',
]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = 'then' in params ? await params : params;
  if (RESERVED_SLUGS.has(resolved.slug)) {
    return {};
  }

  const event = await fetchEventById(resolved.slug);
  if (event) {
    const title = `${event.title} — Vibe by Swaniki`;
    const description =
      event.tagline || event.description || 'Exclusive curated gathering on Vibe by Swaniki.';
    const coverImage =
      event.cover_url ||
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80';

    return {
      title,
      description,
      openGraph: {
        title: event.title,
        description,
        url: `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`,
        siteName: 'Vibe by Swaniki',
        images: [
          {
            url: coverImage,
            width: 1200,
            height: 630,
            alt: event.title,
          },
        ],
        locale: 'en_IN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description,
        images: [coverImage],
      },
    };
  }

  // Check if organizer profile handle
  const cleanHandle = resolved.slug.replace(/^@/, '').toLowerCase();
  return {
    title: `@${cleanHandle} — Organizer Profile on Vibe by Swaniki`,
    description: `Browse upcoming and past curated gatherings hosted by @${cleanHandle}.`,
  };
}

export default async function PublicSlugPage({ params }: PageProps) {
  const resolved = 'then' in params ? await params : params;
  if (RESERVED_SLUGS.has(resolved.slug)) {
    notFound();
  }

  // 1. Check if Event
  const event = await fetchEventById(resolved.slug);
  if (event) {
    const rsvps = await fetchEventRSVPs(event.id);
    return <EventPageContainer initialEvent={event} idOrSlug={resolved.slug} initialRsvps={rsvps} />;
  }

  // 2. Check if explicitly an Organizer Profile handle (@username or known handle)
  if (resolved.slug.startsWith('@')) {
    const cleanHandle = resolved.slug.replace(/^@/, '').toLowerCase();
    const allEvents = await fetchEvents();
    const organizerEvents = allEvents.filter((e) => {
      const orgName = (e.organizer_name || '').toLowerCase();
      return orgName.includes(cleanHandle) || cleanHandle === 'swaniki';
    });

    const organizerName =
      organizerEvents[0]?.organizer_name ||
      cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1) + ' Collective';

    return (
      <OrganizerProfileView
        handle={cleanHandle}
        name={organizerName}
        events={organizerEvents.length > 0 ? organizerEvents : allEvents.slice(0, 3)}
      />
    );
  }

  // 3. Render EventPageContainer to check browser local persistence before showing 404
  return <EventPageContainer initialEvent={null} idOrSlug={resolved.slug} />;
}

