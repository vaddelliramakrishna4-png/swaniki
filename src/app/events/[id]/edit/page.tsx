import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { EditEventForm } from '@/components/events/EditEventForm';
import { fetchEventById } from '@/lib/events';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = 'then' in params ? await params : params;
  const event = await fetchEventById(id);
  return {
    title: event ? `Edit: ${event.title} — Vibe by Swaniki` : 'Edit Event — Vibe by Swaniki',
    description: 'Update your event details and notify registered guests.',
  };
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = 'then' in params ? await params : params;
  const event = await fetchEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A8A8A] hover:text-[#1A1A2E] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8621A] flex items-center justify-center shrink-0 shadow-sm">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-[#1A1A2E] leading-tight">
                Edit Gathering
              </h1>
              <p className="text-sm text-[#4B4B4B] mt-1">
                <span className="font-semibold text-[#1A1A2E]">{event.title}</span>
                {' '}— Update details and optionally notify your confirmed guests.
              </p>
            </div>
          </div>
        </div>

        {/* ── Edit Form (Client Component) ────────────────────────────── */}
        <EditEventForm event={event} />
      </main>

      <Footer />
    </div>
  );
}
