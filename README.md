# Vibe by Swaniki ✦

> **A lightweight, premium, AI-powered whitelabel event platform crafted for India's best gatherings, dinners, summits, and salons.**  
> Built as an India-first alternative to Luma/Partiful with bespoke aesthetics, streaming Gemini 1.5 Flash AI copy, WhatsApp-first sharing, and realtime RSVP sync.

---

## 🌟 Core Features

- **5 Signature Aesthetic Templates**:
  - **Grove**: Warm Botanical & Brass (`#14382A`, `#C9A84C`)
  - **Sprint**: Kinetic Deep Tech & Electric Lime (`#1E1B4B`, `#10B981`)
  - **Bloom**: Editorial Terracotta & Rose (`#4C1D24`, `#E8621A`)
  - **Vertex**: Sharp Obsidian Keynote & Amber Gold (`#0B0F19`, `#F59E0B`)
  - **Ember**: Burnt Ochre & Warm Twilight (`#3F1A0B`, `#EA580C`)
- **Gemini 1.5 Flash AI Copywriter**:
  - Word-by-word streaming generation for event narratives, punchy taglines, WhatsApp broadcast copy, Instagram captions, and Indian-context FAQs.
- **Root Vanity URLs (`/[slug]`)**:
  - Direct root URL rendering for events (e.g. `/bandra-sunset-terrace`) and organizer profiles (e.g. `/swaniki`).
- **Realtime RSVP Engine**:
  - Dual sync architecture combining **Supabase Realtime** with client-side **BroadcastChannel** for zero-latency counter ticks and live Who's Going roster updates.
- **Satori Dynamic Banner Engine (`/api/og/[slug]`)**:
  - High-resolution on-the-fly banners generated with dark gradient overlays, host monogram avatars, and logistics strips:
    - **WhatsApp 16:9 Banner** (`1280x720`)
    - **Instagram Story 9:16** (`1080x1920`)
    - **Instagram Post 1:1** (`1080x1080`)
- **Post-Publish Share Studio (`/events/[id]/share`)**:
  - 1-click **"Download All as ZIP"** (`jszip`), WhatsApp deep-link blast (`wa.me`), and clipboard copy.
- **Guest Dashboard (`/guest`)**:
  - View upcoming and past passes, 1-click Google Calendar integration, RFC 5545 `.ics` download, and cancellation workflow.
- **White-Labeled Email Suite via Resend**:
  - 7 responsive email templates white-labeled with host logo and `brand_color`: RSVP confirmed, waitlisted, 24h reminder, 1h reminder, event updated, event cancelled, new event follower notification.
- **Date Polls (`/polls/create`, `/polls/[slug]`)**:
  - Coordinate candidate dates with live vote bar charts and 1-click "Convert to Event" wizard pre-fill.
- **Organizer Dashboard (`/manage`)**:
  - Sidebar navigation, live stats row, events grid with status filters, "Apply My Brand" preset studio, per-event guest list search, CSV export, and event duplication.
- **India-First UX Everywhere**:
  - Asia/Kolkata timezone default, strict `IST` time strings, +91 phone default with Indian flag, city-first metadata (`Bengaluru`, `Mumbai`, `Delhi NCR`, `Goa`), and prominent WhatsApp actions.

---

## 🎨 Design System

- **Warm Parchment Surface**: `#F9F7F4` (Never pure stark white background)
- **Primary Brand Navy**: `#1A1A2E`
- **Antique Gold Accent**: `#C9A84C`
- **Action Accent**: `#E8621A` (Reserved exclusively for the primary CTA button per view)
- **Typography Tokens**:
  - **Hero & Display Headlines**: `Playfair Display` (mixing italic gold Playfair with bold Inter for contrast)
  - **Taglines & Subheadings**: `Fraunces`
  - **UI & Body Text**: `Inter`

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Styling & Animation**: Tailwind CSS + Framer Motion + Canvas Confetti
- **Database, Auth & Storage**: Supabase (Postgres with RLS, Magic Links, Realtime, Storage)
- **AI Content**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Social Banner Generation**: Satori + `@vercel/og`
- **Transactional Email**: Resend + React Email (with sandbox simulation fallback)
- **Calendar Synchronization**: RFC 5545 `.ics` generator + Google Calendar template URLs
- **Metrics**: `@vercel/analytics` plugin

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm or pnpm

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-org/vibe-by-swaniki.git
cd vibe-by-swaniki
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials, Gemini API Key, and Resend API Key.

### 4. Database Setup
Run the SQL migration script located at `supabase/schema.sql` in your Supabase SQL Editor to set up:
- `events` table with template enums, capacity, and custom questions.
- `rsvps` table with confirmed/waitlisted status.
- `follows`, `date_polls`, and `comments` tables.
- Row-level security (RLS) policies for organizer ownership and public read access.

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing

Automated verification test suites verify every layer end-to-end:

```bash
# Verify Phase 4 (OG image generation, share studio, polls, follow system)
npx tsx scripts/verify-phase4.mjs

# Verify Phase 5 (Calendar sync, Guest portal, cancellation, 7 white-labeled emails, organizer polish)
npx tsx scripts/verify-phase5.mjs

# Verify Phase 6 (Marketing page, Vercel analytics, out-of-scope compliance, production build)
npx tsx scripts/verify-launch.mjs
```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Add the environment variables from `.env.local` to your Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY`
4. Click **Deploy**. Vercel will automatically build the Next.js App Router application with edge OG image rendering and Vercel Analytics tracking.

---

## 📜 License
MIT License © 2026 Swaniki.
