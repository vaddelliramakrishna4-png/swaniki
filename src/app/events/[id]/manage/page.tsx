import React from 'react';
import { Metadata } from 'next';
import { ManagePageContainer } from '@/components/events/ManagePageContainer';
import { fetchEventById, fetchEventRSVPs } from '@/lib/events';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = 'then' in params ? await params : params;
  const event = await fetchEventById(resolved.id);

  return {
    title: event ? `Host Dashboard: ${event.title} — Vibe by Swaniki` : 'Host Dashboard — Vibe by Swaniki',
  };
}

export default async function ManageEventPage({ params }: PageProps) {
  const resolved = 'then' in params ? await params : params;
  const event = await fetchEventById(resolved.id);
  const rsvps = event ? await fetchEventRSVPs(event.id) : [];

  return (
    <ManagePageContainer
      initialEvent={event}
      idOrSlug={resolved.id}
      initialRsvps={rsvps}
    />
  );
}

