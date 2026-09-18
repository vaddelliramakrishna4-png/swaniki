'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Leaf, Shield, Zap, Palette, Flame, Check } from 'lucide-react';
import { GroveTemplate } from '@/components/templates/GroveTemplate';
import { VertexTemplate } from '@/components/templates/VertexTemplate';
import { SprintTemplate } from '@/components/templates/SprintTemplate';
import { BloomTemplate } from '@/components/templates/BloomTemplate';
import { EmberTemplate } from '@/components/templates/EmberTemplate';
import { EventTemplate } from '@/types/database';

export default function TemplatesShowcasePage() {
  const [activeTemplate, setActiveTemplate] = useState<EventTemplate>('Grove');

  const templatesList: { id: EventTemplate; label: string; icon: any; color: string; activeColor: string }[] = [
    { id: 'Grove', label: 'Grove', icon: Leaf, color: '#14382A', activeColor: '#C9A84C' },
    { id: 'Sprint', label: 'Sprint', icon: Zap, color: '#1E1B4B', activeColor: '#10B981' },
    { id: 'Bloom', label: 'Bloom', icon: Palette, color: '#4C1D24', activeColor: '#E8621A' },
    { id: 'Vertex', label: 'Vertex', icon: Shield, color: '#0B0F19', activeColor: '#F59E0B' },
    { id: 'Ember', label: 'Ember', icon: Flame, color: '#3F1A0B', activeColor: '#EA580C' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Floating Template Switcher Bar */}
      <header className="sticky top-0 z-50 bg-[#1A1A2E]/95 backdrop-blur-md border-b border-[#C9A84C]/20 px-4 py-3 text-white shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C9A84C]">
                5 Live Event Templates
              </span>
              <h1 className="text-sm font-bold text-white leading-tight">
                Vibe Aesthetic Showcase · All Themes Live
              </h1>
            </div>
          </div>

          {/* Switcher Tabs for 5 templates */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
            {templatesList.map((t) => {
              const Icon = t.icon;
              const isActive = activeTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm border border-white/30 font-bold'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: t.activeColor }} />
                  <span>{t.label}</span>
                  {isActive && <Check className="w-3 h-3 text-[#C9A84C]" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Render Selected Template */}
      <main className="flex-1">
        {activeTemplate === 'Grove' && <GroveTemplate />}
        {activeTemplate === 'Sprint' && <SprintTemplate />}
        {activeTemplate === 'Bloom' && <BloomTemplate />}
        {activeTemplate === 'Vertex' && <VertexTemplate />}
        {activeTemplate === 'Ember' && <EmberTemplate />}
      </main>
    </div>
  );
}

