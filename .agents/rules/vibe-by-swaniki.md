# Vibe by Swaniki — Standing Rules

You are building "Vibe by Swaniki," a lightweight, premium, AI-powered
whitelabel event platform (competitor to Luma/Partiful, India-first, free
in v1). These rules apply to EVERY task in this workspace, regardless of
which phase prompt you were given.

## Stack (do not substitute)
- Next.js 14, App Router, TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion for animation
- Supabase: Postgres + Auth (email magic link + OTP) + Storage + Realtime
- Google Gemini 1.5 Flash (`@google/generative-ai`) for AI content, streamed
- Satori + `@vercel/og` for banner image generation
- Resend + React Email for transactional email
- Google Maps Embed API (no key needed for embed) for location
- Unsplash API for cover image suggestions
- ICS file generation + Google Calendar URL params for "add to calendar"
- nanoid for slug generation
- Deploy target: Vercel hobby tier

No payments, no complex RBAC, no CMS. Two roles only: organizer, guest.
No super-admin panel.

## Explicitly out of scope for v1 — never build these unless told otherwise
Payments/ticketing, QR check-in, super admin panel, custom domain/CNAME,
a bespoke analytics dashboard (Vercel Analytics plugin is enough), SMS
notifications, a native mobile app, public API/webhooks, a drag-and-drop
page editor, multi-language support.

## Design system — apply exactly, don't improvise new tokens
Fonts: Playfair Display (hero titles, Display XL/L), Fraunces (taglines,
Heading 1), Inter (everything else — UI, body, labels).
Key rule: mix Playfair (italic, gold) + Inter within hero headlines for
contrast, e.g. "Nights in" (Playfair white) + "Mumbai" (Playfair italic,
gold #C9A84C).

Colors (Tailwind config custom tokens, warm parchment — never pure white bg):
- brand: #1A1A2E, brand-mid: #16213E, brand-deep: #0F3460
- accent: #E8621A, accent-dark: #D45510, accent-light: #FEF0E7
- gold: #C9A84C, gold-light: #FDF6E7
- ink: #0F0F0F, ink-secondary: #4B4B4B, ink-muted: #8A8A8A
- surface: #FFFFFF, surface-2: #F9F7F4 (page bg), surface-3: #F0EDE8
- border: #E8E4DF, border-strong: #C8C4BF
- success: #1A7A4A / #E8F5EE, warning: #B45309 / #FEF3C7

Spacing scale (4px base): xs 4, sm 8, md 16, lg 24, xl 32, 2xl 48, 3xl 64,
4xl 96. Radius: inputs 8px, cards 12–16px, pills 999px, buttons 10px.
Shadows: card `0 1px 4px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)`,
elevated `0 8px 24px rgba(0,0,0,.10)`, hover `0 12px 32px rgba(26,26,46,.18)`.
Motion: 200ms ease-out default, hover lift translateY(-1px)+shadow bloom,
page transitions fade+slide-up, live counter pop scale(1.12)/150ms, modals
fade+scale(0.96→1)/180ms. AI text streams word-by-word like a chat response.

Buttons: primary = brand bg/white text; accent = accent bg/white text,
reserved ONLY for the single primary CTA per screen (RSVP, Share, Publish);
outline = transparent + border-strong, hover surface-3; ghost = transparent
+ ink-secondary text, hover surface-3.
Status pills: confirmed=green, waitlisted=amber, live/hot=accent,
draft=neutral/muted.
Cards: white bg, border in --border, rounded-2xl, cover image 160–200px
object-cover on top, 16px/20px padding, hover translateY(-2px)+shadow.

## Database schema — use exactly this shape (Supabase Postgres)
Tables: `profiles` (extends auth.users; role organizer|guest, name, handle
unique, bio, logo_url, brand_color, brand_font, phone, email, created_at),
`events` (organizer_id, slug unique, title, tagline, description,
cover_image_url, template enum grove|sprint|bloom|vertex|ember, theme jsonb,
sections jsonb {speakers,agenda,gallery,faq}, event_type in-person|online|
hybrid, location fields + lat/lng, online_link, start_at, end_at, timezone
default Asia/Kolkata, capacity, is_public, status draft|live|past|cancelled,
ai_generated bool, faq jsonb, rsvp_form_config jsonb, timestamps),
`rsvps` (event_id, name, email, phone, status confirmed|waitlisted|
cancelled, plus_one_name, custom_responses jsonb, created_at), `comments`
(event_id, author_name, author_email, body, created_at), `follows`
(follower_id, organizer_id composite PK), `date_polls` (organizer_id, title,
options jsonb [{date, votes:[email]}], slug unique).
Write RLS policies so organizers can only edit their own events/profile,
and public read access matches `is_public`/`status='live'`.

## India-first requirements — apply everywhere
Default timezone Asia/Kolkata; render all times as "Sat, 14 Sep · 7:00 PM
IST"; WhatsApp is always the first and largest share CTA (before Instagram/
Facebook/copy-link); phone inputs default to +91 with Indian flag; event
cards show city, not a generic "Location" label; architect payment fields
for future Razorpay (not Stripe) but don't build billing now.

## Working conventions
- Reusable UI first: build the components in the checklist below before
  wiring full pages, so later phases compose instead of duplicating.
- Never invent scope beyond what a phase prompt asks for — flag it in the
  Implementation Plan artifact as a suggestion instead of building it.
- After implementing each phase, use the browser agent to actually click
  through the new flow (sign up, create an event, RSVP, etc.) before
  marking the task done, and note what you verified in your summary.
- Keep secrets (Supabase keys, Gemini key, Resend key, Unsplash key) in
  `.env.local`, never hardcoded, and add a `.env.example`.

## Core reusable components (build early, reuse everywhere)
EventCard, TemplatePicker, PropertiesPanel, AIGeneratePanel, RSVPForm,
ShareBanner, WhoIsGoing, LiveCounter, GuestComments, StatusBanner,
UnsplashPicker, DatePoll, OrganizerCard, EmailTemplate (React Email).
