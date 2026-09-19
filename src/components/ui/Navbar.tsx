'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Plus,
  Sparkles,
  MapPin,
  User,
  LogOut,
  Ticket,
  Crown,
  LayoutDashboard,
  ChevronDown,
  Compass,
  Menu,
  X,
  CalendarDays,
  Users,
  Settings,
  TreePine,
  Zap,
  Flower2,
  Building2,
  Flame,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// ─── Data ──────────────────────────────────────────────────────────────────

const CITIES = [
  { label: 'Bengaluru', href: '/?city=Bengaluru' },
  { label: 'Mumbai', href: '/?city=Mumbai' },
  { label: 'Delhi NCR', href: '/?city=Delhi%20NCR' },
  { label: 'Goa', href: '/?city=Goa' },
];

const THEMES = [
  { label: 'Grove', sub: 'Community & Networking', icon: TreePine, color: '#1A7A4A', href: '/templates?theme=grove' },
  { label: 'Sprint', sub: 'Sports & Fitness', icon: Zap, color: '#E8621A', href: '/templates?theme=sprint' },
  { label: 'Bloom', sub: 'Celebrations & Social', icon: Flower2, color: '#C9A84C', href: '/templates?theme=bloom' },
  { label: 'Vertex', sub: 'Corporate & Professional', icon: Building2, color: '#1A1A2E', href: '/templates?theme=vertex' },
  { label: 'Ember', sub: 'Culture & Community', icon: Flame, color: '#D45510', href: '/templates?theme=ember' },
];

// ─── Types ─────────────────────────────────────────────────────────────────

type DropdownId = 'cities' | 'themes' | 'profile' | null;

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Sub-components ────────────────────────────────────────────────────────

interface DropdownButtonProps {
  id: DropdownId;
  label: string;
  open: boolean;
  onToggle: (id: DropdownId) => void;
}

function DropdownButton({ id, label, open, onToggle }: DropdownButtonProps) {
  return (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={open}
      onClick={() => onToggle(open ? null : id)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onToggle(null);
      }}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#4B4B4B] hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-all duration-200 cursor-pointer select-none"
    >
      {label}
      <ChevronDown
        className={`w-3 h-3 text-[#8A8A8A] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

interface DropdownPanelProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

function DropdownPanel({ open, children, className = '' }: DropdownPanelProps) {
  if (!open) return null;
  return (
    <div
      className={`absolute top-full mt-2 bg-white rounded-2xl border border-[#E8E4DF] shadow-[0_16px_40px_rgba(26,26,46,0.14)] z-50 animate-dropdown ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut, switchRole } = useAuth();

  // Prevent hydration mismatch — auth state only renders after client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Dropdown state — only one open at a time
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  // Mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);
  // Mobile accordion for city/theme/profile sections
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);

  const toggleDropdown = useCallback((id: DropdownId) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }, []);

  // Close everything on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const handleSignOut = async () => {
    setOpenDropdown(null);
    setMobileOpen(false);
    await signOut();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  // ── Profile dropdown items ───────────────────────────────────────────────
  const profileItems = profile?.role === 'organizer'
    ? [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'My Events', icon: CalendarDays, href: '/manage' },
        { label: 'Date Polls', icon: CalendarDays, href: '/polls/create' },
        { label: 'Guest Lists & CSV', icon: Users, href: '/manage' },
        { label: 'Profile & Brand', icon: Settings, href: '/dashboard' },
      ]
    : [
        { label: 'My RSVPs', icon: Ticket, href: '/guest' },
        { label: 'Discover Events', icon: Compass, href: '/' },
        { label: 'Profile & Brand', icon: Settings, href: '/dashboard' },
      ];

  return (
    <>
      {/* Dropdown animation styles */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .animate-dropdown { animation: dropdownIn 160ms cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 600px; }
        }
        .animate-slide-down { animation: slideDown 220ms ease both; overflow: hidden; }

        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-mobile-menu { animation: mobileMenuIn 220ms cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <header
        ref={navRef}
        className="sticky top-0 z-40 bg-[#F9F7F4]/95 backdrop-blur-md border-b border-[#E8E4DF]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A2E] text-[#C9A84C] flex items-center justify-center font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tight text-[#1A1A2E] leading-none">
                Vibe{' '}
                <span className="font-sans text-xs font-normal text-[#C9A84C] italic">by Swaniki</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-[#8A8A8A] font-semibold">
                India · Curated
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center" aria-label="Main navigation">

            {/* Explore */}
            <Link
              href="/"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive('/')
                  ? 'bg-[#F0EDE8] text-[#1A1A2E]'
                  : 'text-[#4B4B4B] hover:bg-[#F0EDE8] hover:text-[#1A1A2E]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore
            </Link>

            {/* Cities dropdown */}
            <div className="relative">
              <DropdownButton
                id="cities"
                label="Cities"
                open={openDropdown === 'cities'}
                onToggle={toggleDropdown}
              />
              <DropdownPanel open={openDropdown === 'cities'} className="left-0 w-48 p-1.5">
                {CITIES.map((city) => (
                  <Link
                    key={city.label}
                    href={city.href}
                    role="menuitem"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#E8621A] shrink-0" />
                    {city.label}
                  </Link>
                ))}
                <div className="border-t border-[#E8E4DF] my-1" />
                <Link
                  href="/"
                  role="menuitem"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#8A8A8A] hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  View all cities
                </Link>
              </DropdownPanel>
            </div>

            {/* Themes dropdown */}
            <div className="relative">
              <DropdownButton
                id="themes"
                label="Themes"
                open={openDropdown === 'themes'}
                onToggle={toggleDropdown}
              />
              <DropdownPanel open={openDropdown === 'themes'} className="left-0 w-60 p-1.5">
                {THEMES.map(({ label, sub, icon: Icon, color, href }) => (
                  <Link
                    key={label}
                    href={href}
                    role="menuitem"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F0EDE8] transition-colors group"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: color + '18' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1A2E]">{label}</span>
                      <span className="text-[10px] text-[#8A8A8A]">{sub}</span>
                    </div>
                  </Link>
                ))}
                <div className="border-t border-[#E8E4DF] my-1" />
                <Link
                  href="/templates"
                  role="menuitem"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#8A8A8A] hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  Browse all themes
                </Link>
              </DropdownPanel>
            </div>

            {/* My RSVPs */}
            <Link
              href="/guest"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive('/guest')
                  ? 'bg-[#F0EDE8] text-[#1A1A2E]'
                  : 'text-[#4B4B4B] hover:bg-[#F0EDE8] hover:text-[#1A1A2E]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-[#1A7A4A]" />
              My RSVPs
            </Link>
          </nav>

          {/* ── Desktop Right Actions ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">

            {/* Host an Event CTA */}
            <Link
              href="/create"
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-[10px] bg-[#1A1A2E] hover:bg-[#16213E] hover:shadow-md active:scale-95 text-white text-xs font-bold tracking-wide shadow-sm transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Host an Event
            </Link>

            {/* Auth section — hidden until mounted to prevent hydration mismatch */}
            {!mounted ? (
              <div className="w-24 h-8" aria-hidden="true" />
            ) : profile ? (
              /* Profile dropdown */
              <div className="relative">
                <button
                  type="button"
                  id="profile-menu-btn"
                  aria-haspopup="true"
                  aria-expanded={openDropdown === 'profile'}
                  onClick={() => toggleDropdown('profile')}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-[#E8E4DF] hover:border-[#1A1A2E] bg-white transition-all shadow-sm group cursor-pointer"
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      profile.role === 'organizer'
                        ? 'bg-[#1A1A2E] text-[#C9A84C]'
                        : 'bg-[#14382A] text-white'
                    }`}
                  >
                    {getInitials(profile.name)}
                  </div>
                  {/* Name + role badge */}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#1A1A2E] leading-tight truncate max-w-[90px]">
                      {profile.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider leading-none flex items-center gap-0.5 ${
                        profile.role === 'organizer' ? 'text-[#C9A84C]' : 'text-[#1A7A4A]'
                      }`}
                    >
                      {profile.role === 'organizer' ? (
                        <><Crown className="w-2.5 h-2.5" /> Host</>
                      ) : (
                        <><Ticket className="w-2.5 h-2.5" /> Guest</>
                      )}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 text-[#8A8A8A] transition-transform duration-200 ${
                      openDropdown === 'profile' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile dropdown panel */}
                <DropdownPanel open={openDropdown === 'profile'} className="right-0 w-60 p-2">
                  {/* User info */}
                  <div className="px-3 py-2.5 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF]/60 mb-1.5 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          profile.role === 'organizer'
                            ? 'bg-[#1A1A2E] text-[#C9A84C]'
                            : 'bg-[#14382A] text-white'
                        }`}
                      >
                        {getInitials(profile.name)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1A2E] truncate max-w-[150px]">
                          {profile.name}
                        </p>
                        <p className="text-[10px] text-[#8A8A8A] truncate max-w-[150px]">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        profile.role === 'organizer'
                          ? 'bg-[#1A1A2E] text-[#C9A84C]'
                          : 'bg-[#E8F5EE] text-[#1A7A4A]'
                      }`}
                    >
                      {profile.role === 'organizer' ? (
                        <><Crown className="w-2.5 h-2.5" /> Verified Host</>
                      ) : (
                        <><Ticket className="w-2.5 h-2.5" /> Guest Attendee</>
                      )}
                    </span>
                  </div>

                  {/* Nav items */}
                  <div className="space-y-0.5">
                    {profileItems.map(({ label, icon: Icon, href }) => (
                      <Link
                        key={label}
                        href={href}
                        role="menuitem"
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#4B4B4B] shrink-0" />
                        {label}
                      </Link>
                    ))}

                    {/* Switch role */}
                    {profile.role === 'organizer' && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { switchRole('guest'); setOpenDropdown(null); router.push('/guest'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4B4B4B] hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#1A7A4A] shrink-0" />
                        Switch to Guest
                      </button>
                    )}
                    {profile.role === 'guest' && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { switchRole('organizer'); setOpenDropdown(null); router.push('/create'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4B4B4B] hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                        Switch to Host
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#E8E4DF] my-1.5" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D45510] hover:bg-[#FEF0E7] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    Log out
                  </button>
                </DropdownPanel>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#E8E4DF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#8A8A8A]" />
                Sign In
              </Link>
            )}
          </div>

          {/* ── Mobile: Hamburger ───────────────────────────────────────── */}
          <button
            type="button"
            id="mobile-menu-toggle"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg border border-[#E8E4DF] hover:bg-[#F0EDE8] text-[#1A1A2E] transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Mobile Menu Panel ─────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E8E4DF] bg-[#F9F7F4] animate-mobile-menu max-h-[85vh] overflow-y-auto">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1" aria-label="Mobile navigation">

              {/* Explore */}
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
              >
                <Compass className="w-4 h-4 text-[#E8621A]" />
                Explore
              </Link>

              {/* Cities accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileSection(mobileSection === 'cities' ? null : 'cities')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#E8621A]" />
                    Cities
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8A8A8A] transition-transform duration-200 ${
                      mobileSection === 'cities' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {mobileSection === 'cities' && (
                  <div className="pl-8 mt-1 space-y-0.5 animate-slide-down">
                    {CITIES.map((city) => (
                      <Link
                        key={city.label}
                        href={city.href}
                        className="block px-3 py-2 rounded-lg text-sm text-[#4B4B4B] hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors font-medium"
                      >
                        {city.label}
                      </Link>
                    ))}
                    <Link
                      href="/"
                      className="block px-3 py-2 rounded-lg text-sm text-[#8A8A8A] hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors font-medium"
                    >
                      View all cities
                    </Link>
                  </div>
                )}
              </div>

              {/* Themes accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileSection(mobileSection === 'themes' ? null : 'themes')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                    Themes
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8A8A8A] transition-transform duration-200 ${
                      mobileSection === 'themes' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {mobileSection === 'themes' && (
                  <div className="pl-8 mt-1 space-y-0.5 animate-slide-down">
                    {THEMES.map(({ label, sub, href, icon: Icon, color }) => (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F0EDE8] transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A2E]">{label}</p>
                          <p className="text-[11px] text-[#8A8A8A]">{sub}</p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href="/templates"
                      className="block px-3 py-2 rounded-lg text-sm text-[#8A8A8A] hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors font-medium"
                    >
                      Browse all themes
                    </Link>
                  </div>
                )}
              </div>

              {/* My RSVPs */}
              <Link
                href="/guest"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
              >
                <Ticket className="w-4 h-4 text-[#1A7A4A]" />
                My RSVPs
              </Link>

              {/* Host an Event */}
              <Link
                href="/create"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
              >
                <Plus className="w-4 h-4 text-[#E8621A]" />
                Host an Event
              </Link>

              {/* Profile section */}
              {mounted && (
                profile ? (
                  <div>
                    <div className="border-t border-[#E8E4DF] my-2" />
                    <button
                      type="button"
                      onClick={() => setMobileSection(mobileSection === 'profile' ? null : 'profile')}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            profile.role === 'organizer'
                              ? 'bg-[#1A1A2E] text-[#C9A84C]'
                              : 'bg-[#14382A] text-white'
                          }`}
                        >
                          {getInitials(profile.name)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-[#1A1A2E]">{profile.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]">
                            {profile.role === 'organizer' ? '✦ Verified Host' : 'Guest'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#8A8A8A] transition-transform duration-200 ${
                          mobileSection === 'profile' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {mobileSection === 'profile' && (
                      <div className="pl-11 mt-1 space-y-0.5 animate-slide-down">
                        {profileItems.map(({ label, icon: Icon, href }) => (
                          <Link
                            key={label}
                            href={href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#4B4B4B]" />
                            {label}
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#D45510] hover:bg-[#FEF0E7] transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="border-t border-[#E8E4DF] my-2" />
                    <Link
                      href="/auth/login"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#8A8A8A]" />
                      Sign In
                    </Link>
                  </>
                )
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
