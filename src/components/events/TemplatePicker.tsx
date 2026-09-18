'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Sliders, Type, Palette, Eye } from 'lucide-react';
import { EventTemplate } from '@/types/database';
import { TEMPLATES } from '@/lib/templates';

interface TemplatePickerProps {
  selectedTemplate: EventTemplate | string;
  onSelect: (template: EventTemplate) => void;
  customFont?: string;
  onCustomFontChange?: (font: string) => void;
  backgroundMood?: 'parchment' | 'clean' | 'deep';
  onBackgroundMoodChange?: (mood: 'parchment' | 'clean' | 'deep') => void;
}

export function TemplatePicker({
  selectedTemplate,
  onSelect,
  customFont = 'serif',
  onCustomFontChange,
  backgroundMood = 'parchment',
  onBackgroundMoodChange,
}: TemplatePickerProps) {
  const templateKeys = Object.keys(TEMPLATES) as EventTemplate[];
  const currentConfig = TEMPLATES[selectedTemplate as EventTemplate] || TEMPLATES.Grove;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E4DF]">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1A1A2E]">
            Step 1: Choose Whitelabel Aesthetic
          </h3>
          <p className="text-xs text-[#4B4B4B] mt-0.5">
            Select one of the 5 bespoke moods. Each defines tailored typography, colors, and atmosphere.
          </p>
        </div>

        <span className="text-xs font-semibold text-[#E8621A] bg-[#FEF0E7] px-3 py-1 rounded-full border border-[#E8621A]/20 self-start sm:self-auto">
          Active: {currentConfig.name}
        </span>
      </div>

      {/* 5 Templates Wide Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {templateKeys.map((key) => {
          const t = TEMPLATES[key];
          const isSelected = selectedTemplate.toLowerCase() === key.toLowerCase();

          return (
            <motion.div
              key={key}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(key)}
              className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#1A1A2E] ring-4 ring-[#1A1A2E]/10 bg-white shadow-lg'
                  : 'border-[#E8E4DF] bg-[#F9F7F4] hover:bg-white hover:border-[#C8C4BF]'
              }`}
            >
              {/* Template Cover Image Preview */}
              <div className="relative h-32 w-full overflow-hidden bg-[#1A1A2E]">
                <img
                  src={t.sampleCover}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#E8621A] text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Badge on Image */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                  <span className="font-serif font-bold text-sm drop-shadow-md">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: t.colors.primary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: t.colors.accent }}
                    />
                  </div>
                </div>
              </div>

              {/* Template Details Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider block">
                    {t.tagline}
                  </span>
                  <p className="text-[11px] text-[#4B4B4B] leading-snug mt-1">
                    {t.bestFor}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E4DF] flex items-center justify-between text-[10px] text-[#8A8A8A]">
                  <span className="font-mono">Palette</span>
                  <span className="font-semibold text-[#1A1A2E]">{t.id} Mood</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Properties Customizer Panel for Active Template */}
      <div className="bg-[#F9F7F4] rounded-2xl border border-[#E8E4DF] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#1A1A2E]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
              Customize {currentConfig.name} Aesthetic Properties
            </h4>
          </div>
          <span className="text-[11px] text-[#8A8A8A]">Fine-tune fonts &amp; page mood</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Headline Typography Option */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DF] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[#1A1A2E]">
              <Type className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Headline Typography</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onCustomFontChange && onCustomFontChange('serif')}
                className={`py-1.5 px-2 rounded-lg text-center font-serif text-xs transition-all ${
                  customFont === 'serif'
                    ? 'bg-[#1A1A2E] text-white font-bold'
                    : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
                }`}
              >
                Playfair
              </button>
              <button
                type="button"
                onClick={() => onCustomFontChange && onCustomFontChange('fraunces')}
                className={`py-1.5 px-2 rounded-lg text-center font-serif italic text-xs transition-all ${
                  customFont === 'fraunces'
                    ? 'bg-[#1A1A2E] text-white font-bold'
                    : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
                }`}
              >
                Fraunces
              </button>
              <button
                type="button"
                onClick={() => onCustomFontChange && onCustomFontChange('sans')}
                className={`py-1.5 px-2 rounded-lg text-center font-sans text-xs transition-all ${
                  customFont === 'sans'
                    ? 'bg-[#1A1A2E] text-white font-bold'
                    : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
                }`}
              >
                Inter Bold
              </button>
            </div>
          </div>

          {/* Background Mood Option */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DF] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[#1A1A2E]">
              <Palette className="w-3.5 h-3.5 text-[#E8621A]" />
              <span>Background Atmosphere</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onBackgroundMoodChange && onBackgroundMoodChange('parchment')}
                className={`py-1.5 px-2 rounded-lg text-center text-xs transition-all ${
                  backgroundMood === 'parchment'
                    ? 'bg-[#1A1A2E] text-white font-bold'
                    : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
                }`}
              >
                Warm Parchment
              </button>
              <button
                type="button"
                onClick={() => onBackgroundMoodChange && onBackgroundMoodChange('clean')}
                className={`py-1.5 px-2 rounded-lg text-center text-xs transition-all ${
                  backgroundMood === 'clean'
                    ? 'bg-[#1A1A2E] text-white font-bold'
                    : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
                }`}
              >
                Pure Minimal
              </button>
              <button
                type="button"
                onClick={() => onBackgroundMoodChange && onBackgroundMoodChange('deep')}
                className={`py-1.5 px-2 rounded-lg text-center text-xs transition-all ${
                  backgroundMood === 'deep'
                    ? 'bg-[#1A1A2E] text-white font-bold'
                    : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
                }`}
              >
                Deep Twilight
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
