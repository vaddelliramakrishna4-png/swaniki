'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import JSZip from 'jszip';
import {
  Download,
  Share2,
  Check,
  Copy,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { EventItem } from '@/types/database';
import { fetchEventById } from '@/lib/events';
import { formatEventDateIST, extractCity } from '@/lib/date';

type BannerFormat = 'whatsapp' | 'story' | 'post';

export default function EventShareStudioPage() {
  const params = useParams();
  const eventIdOrSlug = (params?.id || '') as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BannerFormat>('whatsapp');
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  useEffect(() => {
    if (eventIdOrSlug) {
      fetchEventById(eventIdOrSlug).then(async (data) => {
        if (data) {
          setEvent(data);
          setLoading(false);
        } else {
          try {
            const res = await fetch('/api/events/sync');
            const json = await res.json();
            if (json?.events) {
              const found = json.events.find(
                (e: EventItem) =>
                  e.id === eventIdOrSlug ||
                  e.slug === eventIdOrSlug ||
                  (e.slug && e.slug.toLowerCase() === eventIdOrSlug.toLowerCase())
              );
              if (found) setEvent(found);
            }
          } catch {}
          setLoading(false);
        }
      });
    }
  }, [eventIdOrSlug]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center parchment-bg">
        <div className="w-8 h-8 border-3 border-[#E8621A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center parchment-bg p-4 text-center">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Event Not Found</h2>
        <Link href="/" className="mt-3 text-sm text-[#E8621A] font-semibold underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const slug = event.slug || event.id;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const publicEventUrl = `${baseUrl}/${slug}`;
  const city = event.city || extractCity(event.location);
  const dateFormatted = formatEventDateIST(event.start_time);

  const bannerUrls = {
    whatsapp: `/api/og/${slug}?format=whatsapp`,
    story: `/api/og/${slug}?format=story`,
    post: `/api/og/${slug}?format=post`,
  };

  // WhatsApp caption: use AI generated whatsapp_caption or authentic fallback
  const whatsappCaption =
    (event as any).whatsapp_caption ||
    `✨ You're invited to "${event.title}"!\n📍 ${event.venue_name || event.location || city}\n🗓 ${dateFormatted}\n\nRSVP & details here: ${publicEventUrl}`;

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappCaption)}`;

  const handleDownloadSingle = async (fmt: BannerFormat) => {
    try {
      const response = await fetch(bannerUrls[fmt]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-${fmt}-banner.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDownloadAllZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      const formats: BannerFormat[] = ['whatsapp', 'story', 'post'];

      await Promise.all(
        formats.map(async (fmt) => {
          const res = await fetch(bannerUrls[fmt]);
          const blob = await res.blob();
          zip.file(`${slug}-${fmt}.png`, blob);
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-social-banners.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicEventUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(whatsappCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-[#0F0F0F]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E4DF]">
          <div>
            <Link
              href={`/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#1A1A2E] mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Event Page
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1A1A2E]">
              Share Studio &amp; Social Banners
            </h1>
            <p className="text-xs sm:text-sm text-[#4B4B4B] mt-1">
              High-resolution promotional creatives generated via Satori for WhatsApp, Instagram &amp; Facebook.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllZip}
              disabled={downloadingZip}
              className="px-4 py-2.5 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingZip ? 'Packaging ZIP...' : 'Download All (ZIP)'}</span>
            </button>

            <Link
              href={`/${slug}`}
              className="px-3.5 py-2.5 rounded-[10px] bg-white border border-[#E8E4DF] hover:bg-[#F9F7F4] text-xs font-semibold text-[#1A1A2E] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E8621A]" />
              <span>View Live</span>
            </Link>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-[#E8E4DF] shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
            }`}
          >
            <span>WhatsApp (16:9)</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'story'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
            }`}
          >
            <span>Story (9:16)</span>
          </button>

          <button
            onClick={() => setActiveTab('post')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'post'
                ? 'bg-[#1A1A2E] text-white shadow-sm'
                : 'text-[#4B4B4B] hover:text-[#1A1A2E]'
            }`}
          >
            <span>Post (1:1)</span>
          </button>
        </div>

        {/* Banner Preview Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Banner Display */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-between w-full pb-2 border-b border-[#E8E4DF]">
              <span className="text-xs font-mono font-bold text-[#8A8A8A] uppercase">
                {activeTab === 'whatsapp' && 'WhatsApp Landscape · 1280 × 720'}
                {activeTab === 'story' && 'Instagram Story · 1080 × 1920'}
                {activeTab === 'post' && 'Square Post · 1080 × 1080'}
              </span>

              <button
                onClick={() => handleDownloadSingle(activeTab)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8621A] hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
            </div>

            {/* Visual Image Render */}
            <div
              className={`rounded-xl overflow-hidden border border-[#E8E4DF] shadow-md bg-[#1A1A2E] flex items-center justify-center transition-all ${
                activeTab === 'story'
                  ? 'max-h-[540px] aspect-[9/16]'
                  : activeTab === 'post'
                  ? 'max-h-[480px] aspect-square'
                  : 'w-full aspect-[16/9]'
              }`}
            >
              <img
                src={bannerUrls[activeTab]}
                alt={`${event.title} Banner`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Quick Share Actions Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* India-First WhatsApp Broadcast Box */}
            <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  Instant WhatsApp Blast
                </h3>
                <span className="text-[10px] uppercase font-bold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full">
                  1-Click
                </span>
              </div>

              <p className="text-xs text-[#4B4B4B] leading-relaxed">
                Pre-formatted with event title, city, IST schedule, and direct RSVP link.
              </p>

              <div className="p-3 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] text-xs text-[#4B4B4B] whitespace-pre-line font-mono max-h-36 overflow-y-auto">
                {whatsappCaption}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={waShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-[10px] bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Send via WhatsApp</span>
                </a>

                <button
                  onClick={handleCopyCaption}
                  className="p-2.5 rounded-[10px] border border-[#C8C4BF] hover:bg-[#F9F7F4] text-[#1A1A2E] transition-colors"
                  title="Copy caption"
                >
                  {copiedCaption ? (
                    <Check className="w-4 h-4 text-[#1A7A4A]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Copy Link & Social Sharing */}
            <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#E8621A]" />
                Event Landing Link
              </h3>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicEventUrl}
                  className="flex-1 bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] font-mono outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-lg bg-[#1A1A2E] text-white text-xs font-bold hover:bg-[#16213E] transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick 3-Banner Download Cards */}
            <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#C9A84C]" />
                Direct Downloads
              </h3>

              <div className="divide-y divide-[#E8E4DF]">
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1A1A2E] block">WhatsApp / Web</span>
                    <span className="text-[10px] text-[#8A8A8A]">1280 × 720 · PNG</span>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle('whatsapp')}
                    className="p-1.5 rounded-lg border border-[#E8E4DF] hover:bg-[#F9F7F4] text-[#E8621A]"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1A1A2E] block">Instagram Story</span>
                    <span className="text-[10px] text-[#8A8A8A]">1080 × 1920 · PNG</span>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle('story')}
                    className="p-1.5 rounded-lg border border-[#E8E4DF] hover:bg-[#F9F7F4] text-[#E8621A]"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1A1A2E] block">Instagram Post</span>
                    <span className="text-[10px] text-[#8A8A8A]">1080 × 1080 · PNG</span>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle('post')}
                    className="p-1.5 rounded-lg border border-[#E8E4DF] hover:bg-[#F9F7F4] text-[#E8621A]"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
