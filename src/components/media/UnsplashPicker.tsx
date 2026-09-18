'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Search, Check, Sparkles } from 'lucide-react';

interface UnsplashPickerProps {
  selectedUrl?: string | null;
  onSelect: (url: string) => void;
}

const CURATED_COVERS = [
  {
    category: 'Tech & AI',
    title: 'Indiranagar Tech Salon',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Dinner & Social',
    title: 'Warm Candlelit Dining',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Music & Twilight',
    title: 'Bandra Sunset Acoustic',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Art & Design',
    title: 'Creative Salon & Gallery',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Executive Summit',
    title: 'CyberCity Keynote Stage',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Goa & Outdoor',
    title: 'Tropical Oceanfront Vibes',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Heritage & Culture',
    title: 'Courtyard Haveli Lanterns',
    url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'Founders Mixer',
    title: 'Craft Brewery Rooftop',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
];

export function UnsplashPicker({ selectedUrl, onSelect }: UnsplashPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [customUrl, setCustomUrl] = useState('');

  const categories = ['All', 'Tech & AI', 'Dinner & Social', 'Music & Twilight', 'Art & Design'];

  const filteredCovers = CURATED_COVERS.filter((c) => {
    if (filter !== 'All' && c.category !== filter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#1A1A2E]">
          Cover Image
        </label>
        <span className="text-xs text-[#8A8A8A]">
          Select from curated high-res galleries or paste custom URL
        </span>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === cat
                ? 'bg-[#1A1A2E] text-white'
                : 'bg-white border border-[#E8E4DF] text-[#4B4B4B] hover:border-[#C8C4BF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredCovers.map((cover, idx) => {
          const isSelected = selectedUrl === cover.url;
          return (
            <div
              key={idx}
              onClick={() => onSelect(cover.url)}
              className={`group relative h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                isSelected
                  ? 'border-[#E8621A] ring-2 ring-[#E8621A]/30 scale-[1.02]'
                  : 'border-transparent hover:opacity-90'
              }`}
            >
              <img
                src={cover.url}
                alt={cover.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white line-clamp-1">
                {cover.title}
              </span>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E8621A] text-white flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom URL Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="url"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="Or paste any image URL (Unsplash, CDN, etc.)..."
          className="flex-1 bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-1.5 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
        />
        <button
          type="button"
          onClick={() => customUrl.trim() && onSelect(customUrl.trim())}
          className="px-3 py-1.5 rounded-lg bg-white border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E]"
        >
          Set Custom
        </button>
      </div>
    </div>
  );
}
