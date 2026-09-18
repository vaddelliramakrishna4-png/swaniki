import { EventTemplate } from '@/types/database';

export interface TemplateConfig {
  id: EventTemplate;
  name: string;
  tagline: string;
  bestFor: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    cardBg: string;
    badgeBg: string;
    border: string;
  };
  fontPairing: {
    headline: string;
    body: string;
  };
  sampleCover: string;
}

export const TEMPLATES: Record<EventTemplate, TemplateConfig> = {
  Grove: {
    id: 'Grove',
    name: 'Grove',
    tagline: 'Emerald Forest & Warm Brass',
    bestFor: 'Intimate dinners, garden parties, retreats & mindful gatherings',
    colors: {
      primary: '#14382A',
      secondary: '#0B231A',
      accent: '#C9A84C',
      bg: '#F5F7F4',
      text: '#12261C',
      cardBg: '#FFFFFF',
      badgeBg: '#E7EFEA',
      border: '#D3DDD6',
    },
    fontPairing: {
      headline: 'var(--font-playfair)',
      body: 'var(--font-inter)',
    },
    sampleCover:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
  },
  Sprint: {
    id: 'Sprint',
    name: 'Sprint',
    tagline: 'Electric Indigo & High-Energy Lime',
    bestFor: 'Hackathons, demo days, dev meetups & founder mixers',
    colors: {
      primary: '#1E1B4B',
      secondary: '#0F0C2E',
      accent: '#10B981',
      bg: '#F3F4F8',
      text: '#0F172A',
      cardBg: '#FFFFFF',
      badgeBg: '#EEF2FF',
      border: '#E0E7FF',
    },
    fontPairing: {
      headline: 'var(--font-inter)',
      body: 'var(--font-inter)',
    },
    sampleCover:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  Bloom: {
    id: 'Bloom',
    name: 'Bloom',
    tagline: 'Rose Terracotta & Champagne',
    bestFor: 'Creative salons, art showcases, design popups & book launches',
    colors: {
      primary: '#4C1D24',
      secondary: '#361218',
      accent: '#E8621A',
      bg: '#FAF6F4',
      text: '#2D1518',
      cardBg: '#FFFFFF',
      badgeBg: '#FDF0EC',
      border: '#F2E4DE',
    },
    fontPairing: {
      headline: 'var(--font-fraunces)',
      body: 'var(--font-inter)',
    },
    sampleCover:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  },
  Vertex: {
    id: 'Vertex',
    name: 'Vertex',
    tagline: 'Obsidian Black & Luminescent Amber',
    bestFor: 'VC summits, executive roundtables & keynote conferences',
    colors: {
      primary: '#0B0F19',
      secondary: '#020617',
      accent: '#F59E0B',
      bg: '#F8FAFC',
      text: '#0F172A',
      cardBg: '#FFFFFF',
      badgeBg: '#FEF3C7',
      border: '#E2E8F0',
    },
    fontPairing: {
      headline: 'var(--font-inter)',
      body: 'var(--font-inter)',
    },
    sampleCover:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
  Ember: {
    id: 'Ember',
    name: 'Ember',
    tagline: 'Burnt Ochre & Warm Twilight',
    bestFor: 'Acoustic sundowners, live jam nights & rooftop storytelling',
    colors: {
      primary: '#3F1A0B',
      secondary: '#271007',
      accent: '#EA580C',
      bg: '#FAF6F2',
      text: '#2B1207',
      cardBg: '#FFFFFF',
      badgeBg: '#FFEDD5',
      border: '#FED7AA',
    },
    fontPairing: {
      headline: 'var(--font-playfair)',
      body: 'var(--font-inter)',
    },
    sampleCover:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  },
};

export function getTemplateConfig(templateName?: string | null): TemplateConfig {
  if (!templateName) return TEMPLATES.Grove;
  const match = Object.keys(TEMPLATES).find(
    (key) => key.toLowerCase() === templateName.toLowerCase()
  );
  return match ? TEMPLATES[match as EventTemplate] : TEMPLATES.Grove;
}
