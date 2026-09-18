import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E4DF] bg-white py-12 text-[#4B4B4B]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1A1A2E] text-[#C9A84C] flex items-center justify-center font-serif font-bold text-sm">
                V
              </div>
              <span className="font-serif font-bold text-base text-[#1A1A2E]">
                Vibe by Swaniki
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-[#4B4B4B]">
              A lightweight, premium, AI-powered whitelabel event platform. Designed for India&apos;s
              most discerning hosts, founders, and cultural gatherers.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E] mb-3">
              Top Cities
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/#bengaluru" className="hover:text-[#E8621A] transition-colors">
                  Bengaluru Salons
                </Link>
              </li>
              <li>
                <Link href="/#mumbai" className="hover:text-[#E8621A] transition-colors">
                  Mumbai Sundowners
                </Link>
              </li>
              <li>
                <Link href="/#delhi" className="hover:text-[#E8621A] transition-colors">
                  Delhi NCR Heritage
                </Link>
              </li>
              <li>
                <Link href="/#goa" className="hover:text-[#E8621A] transition-colors">
                  Goa Founders Mixers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E] mb-3">
              Whitelabel Themes
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#14382A]" /> Grove (Botanical &amp; Brass)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E1B4B]" /> Sprint (Tech &amp; Lime)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4C1D24]" /> Bloom (Art &amp; Terracotta)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B0F19]" /> Vertex (Executive Amber)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3F1A0B]" /> Ember (Twilight Ochre)
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E8E4DF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8A8A]">
          <p>© 2026 Vibe by Swaniki. Crafted with precision for India.</p>
          <div className="flex items-center gap-4">
            <Link href="/create" className="hover:text-[#1A1A2E]">
              Create an Event
            </Link>
            <span>·</span>
            <span>Default Timezone: Asia/Kolkata</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
