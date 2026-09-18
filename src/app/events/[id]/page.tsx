import React from 'react';
import { Metadata } from 'next';
import { EventPageContainer } from '@/components/events/EventPageContainer';
import { fetchEventById, fetchEventRSVPs } from '@/lib/events';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = 'then' in params ? await params : params;
  const event = await fetchEventById(resolved.id);

  if (!event) {
    return {
      title: 'Curated Gathering — Vibe by Swaniki',
    };
  }

  return {
    title: `${event.title} — Vibe by Swaniki`,
    description: event.tagline || event.description || 'Exclusive curated gathering.',
    openGraph: {
      title: event.title,
      description: event.tagline || event.description || undefined,
      images: event.cover_url ? [event.cover_url] : [],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const resolved = 'then' in params ? await params : params;
  const event = await fetchEventById(resolved.id);
  const rsvps = event ? await fetchEventRSVPs(event.id) : [];

  return (
    <EventPageContainer
      initialEvent={event}
      idOrSlug={resolved.id}
      initialRsvps={rsvps}
    />
  );
}
