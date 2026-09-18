'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Sparkles,
  MapPin,
  Search,
  User,
  LogOut,
  Ticket,
  Crown,
  LayoutDashboard,
  Calendar,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const router = useRouter();
  const { profile, signOut, switchRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push('/');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F4]/90 backdrop-blur-md border-b border-[#E8E4DF] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo with Playfair / Inter Contrast */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-[#1A1A2E] text-[#C9A84C] flex items-center justify-center font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg tracking-tight text-[#1A1A2E] leading-none">
              Vibe <span className="font-sans text-xs font-normal text-[#C9A84C] italic">by Swaniki</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#8A8A8A] font-semibold">
              India · Curated
            </span>
          </div>
        </Link>

        {/* Center Quick City Links */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#4B4B4B]">
          <Link
            href="/#bengaluru"
            className="px-2.5 py-1 rounded-full hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors"
          >
            Bengaluru
          </Link>
          <Link
            href="/#mumbai"
            className="px-2.5 py-1 rounded-full hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors"
          >
            Mumbai
          </Link>
          <Link
            href="/#delhi"
            className="px-2.5 py-1 rounded-full hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors"
          >
            Delhi NCR
          </Link>
          <Link
            href="/#goa"
            className="px-2.5 py-1 rounded-full hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors"
          >
            Goa
          </Link>
          <Link
            href="/templates"
            className="px-2.5 py-1 rounded-full hover:bg-[#F0EDE8] hover:text-[#1A1A2E] transition-colors flex items-center gap-1 text-[#8A8A8A]"
          >
            <Sparkles className="w-3 h-3 text-[#C9A84C]" />
            Themes
          </Link>
        </div>

        {/* Action Buttons & Auth State */}
        <div className="flex items-center gap-2.5">
          {/* Guest Pass Shortcut */}
          <Link
            href="/guest"
            className="py-1.5 px-3 rounded-lg border border-[#E8E4DF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-[#1A7A4A]" />
            <span>My RSVPs</span>
          </Link>

          {/* If Logged In: Show User Profile Avatar & Dropdown */}
          {profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-[#E8E4DF] hover:border-[#1A1A2E] bg-white transition-all shadow-2xs group cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-xs ${
                    profile.role === 'organizer'
                      ? 'bg-[#1A1A2E] text-[#C9A84C]'
                      : 'bg-[#14382A] text-white'
                  }`}
                >
                  {getInitials(profile.name)}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1A1A2E] leading-tight truncate max-w-[100px]">
                    {profile.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider leading-none flex items-center gap-0.5 ${
                      profile.role === 'organizer' ? 'text-[#C9A84C]' : 'text-[#1A7A4A]'
                    }`}
                  >
                    {profile.role === 'organizer' ? (
                      <>
                        <Crown className="w-2.5 h-2.5" /> Host
                      </>
                    ) : (
                      <>
                        <Ticket className="w-2.5 h-2.5" /> Guest
                      </>
                    )}
                  </span>
                </div>

                <ChevronDown className="w-3 h-3 text-[#8A8A8A] group-hover:text-[#1A1A2E] transition-transform" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E4DF] p-2 shadow-[0_12px_32px_rgba(26,26,46,0.12)] z-50 animate-modal text-left space-y-1">
                  {/* User info banner */}
                  <div className="p-2.5 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF]/60 space-y-0.5">
                    <p className="text-xs font-bold text-[#1A1A2E] truncate">{profile.name}</p>
                    <p className="text-[10px] text-[#8A8A8A] truncate">{profile.email}</p>
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        profile.role === 'organizer'
                          ? 'bg-[#1A1A2E] text-[#C9A84C]'
                          : 'bg-[#E8F5EE] text-[#1A7A4A]'
                      }`}
                    >
                      {profile.role === 'organizer' ? 'Gathering Host' : 'Guest Attendee'}
                    </span>
                  </div>

                  {/* Contextual navigation links */}
                  {profile.role === 'organizer' ? (
                    <>
                      <Link
                        href="/manage"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#1A1A2E]" />
                        <span>Host Dashboard</span>
                      </Link>
                      <Link
                        href="/create"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#E8621A]" />
                        <span>Create New Event</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('guest');
                          setDropdownOpen(false);
                          router.push('/guest');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#4B4B4B] hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#1A7A4A]" />
                        <span>Switch to Guest View</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/guest"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#1A7A4A]" />
                        <span>My Gathering Passes</span>
                      </Link>
                      <Link
                        href="/#explore"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#8A8A8A]" />
                        <span>Discover Gatherings</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          switchRole('organizer');
                          setDropdownOpen(false);
                          router.push('/create');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#4B4B4B] hover:bg-[#F0EDE8] transition-colors cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span>Switch to Host View</span>
                      </button>
                    </>
                  )}

                  <div className="border-t border-[#E8E4DF] my-1" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#D45510] hover:bg-[#FEF0E7] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Show Sign In */
            <Link
              href="/auth/login"
              className="py-1.5 px-3 rounded-lg border border-[#E8E4DF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] transition-colors inline-flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#8A8A8A]" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Primary CTA: Host an Event */}
          <Link
            href="/create"
            className="py-2 px-3.5 rounded-[10px] bg-[#1A1A2E] hover:bg-[#16213E] active:scale-95 text-white text-xs font-bold tracking-wide shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Host an Event</span>
            <span className="sm:hidden">Host</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
