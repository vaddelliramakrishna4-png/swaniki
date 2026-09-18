'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, QrCode, MessageCircle, ExternalLink } from 'lucide-react';
import { EventItem } from '@/types/database';
import { formatEventDateIST, extractCity } from '@/lib/date';

interface ShareBannerProps {
  event: EventItem;
}

export function ShareBanner({ event }: ShareBannerProps) {
  const [copied, setCopied] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Derive current absolute or relative event URL
  const eventUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${event.slug || event.id}`
      : `https://vibe-by-swaniki.vercel.app/${event.slug || event.id}`;

  const city = event.city || extractCity(event.location);
  const formattedDate = formatEventDateIST(event.start_time);

  const shareText = `Join me at "${event.title}" in ${city} on ${formattedDate}! Check it out and RSVP here:`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n${eventUrl}`
  )}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    eventUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagramShare = () => {
    const igText = `${event.title} · ${city} · ${formattedDate}\nRSVP via link: ${eventUrl}\n#VibeBySwaniki #Gatherings`;
    navigator.clipboard.writeText(igText);
    setInstagramCopied(true);
    setTimeout(() => setInstagramCopied(false), 3000);
    window.open('https://instagram.com', '_blank');
  };

  // QR Code generator URL via standard public API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    eventUrl
  )}`;

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E4DF] rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1.5 font-['Inter']">
          <Share2 className="w-4 h-4 text-[#E8621A]" />
          Spread the Word
        </h4>
        <span className="text-[11px] text-[#8A8A8A]">Invite friends &amp; colleagues</span>
      </div>

      {/* India-First: WhatsApp is ALWAYS the first and largest share CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-4 rounded-[10px] bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 hover:shadow-md active:scale-[0.99]"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span>Share via WhatsApp</span>
      </a>

      {/* Secondary CTAs: Instagram, Facebook, Copy Link, QR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Instagram */}
        <button
          type="button"
          onClick={handleInstagramShare}
          className="py-2 px-2 rounded-lg border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center justify-center gap-1 transition-colors"
          title="Copies caption & opens Instagram"
        >
          <svg className="w-3.5 h-3.5 fill-current text-[#E1306C]" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span>{instagramCopied ? 'Copied!' : 'Instagram'}</span>
        </button>

        {/* Facebook */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-2 rounded-lg border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center justify-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </a>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="py-2 px-2 rounded-lg border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center justify-center gap-1 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#1A7A4A]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#4B4B4B]" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* QR Code */}
        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="py-2 px-2 rounded-lg border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center justify-center gap-1 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-[#4B4B4B]" />
          <span>QR</span>
        </button>
      </div>

      {/* QR Code Pop-down */}
      {showQR && (
        <div className="pt-3 border-t border-[#E8E4DF] flex flex-col items-center animate-modal">
          <p className="text-[11px] text-[#4B4B4B] mb-2 font-medium">
            Scan to open gathering on your phone
          </p>
          <div className="p-3 bg-white rounded-xl border border-[#E8E4DF] shadow-sm">
            <img src={qrApiUrl} alt="Event QR Code" className="w-32 h-32" />
          </div>
          <p className="text-[10px] text-[#8A8A8A] mt-1 font-mono truncate max-w-xs">{eventUrl}</p>
        </div>
      )}
    </div>
  );
}

