'use client';

import React from 'react';
import { MapPin, Globe, Laptop, Users, Calendar, Lock, Globe2, Building2, Navigation } from 'lucide-react';

interface StepBasicDetailsProps {
  name: string;
  onNameChange: (val: string) => void;
  eventType: 'in-person' | 'online' | 'hybrid';
  onEventTypeChange: (val: 'in-person' | 'online' | 'hybrid') => void;

  // Controlled Separate Date/Time Inputs (IST)
  startDate: string; // YYYY-MM-DD
  onStartDateChange: (val: string) => void;
  startTime: string; // HH:MM
  onStartTimeChange: (val: string) => void;
  endDate: string; // YYYY-MM-DD
  onEndDateChange: (val: string) => void;
  endTime: string; // HH:MM
  onEndTimeChange: (val: string) => void;

  // Controlled Explicit Location Inputs
  locationName: string; // Venue Name e.g. "WeWork Galaxy"
  onLocationNameChange: (val: string) => void;
  streetAddress: string; // Street Address e.g. "43 Residency Road"
  onStreetAddressChange: (val: string) => void;
  city: string; // City e.g. "Bengaluru"
  onCityChange: (val: string) => void;

  onlineLink: string;
  onOnlineLinkChange: (val: string) => void;
  capacity: number;
  onCapacityChange: (val: number) => void;
  isUnlimitedCapacity: boolean;
  onIsUnlimitedCapacityChange: (val: boolean) => void;
  isPublic: boolean;
  onIsPublicChange: (val: boolean) => void;
}

export function StepBasicDetails({
  name,
  onNameChange,
  eventType,
  onEventTypeChange,
  startDate,
  onStartDateChange,
  startTime,
  onStartTimeChange,
  endDate,
  onEndDateChange,
  endTime,
  onEndTimeChange,
  locationName,
  onLocationNameChange,
  streetAddress,
  onStreetAddressChange,
  city,
  onCityChange,
  onlineLink,
  onOnlineLinkChange,
  capacity,
  onCapacityChange,
  isUnlimitedCapacity,
  onIsUnlimitedCapacityChange,
  isPublic,
  onIsPublicChange,
}: StepBasicDetailsProps) {
  const mapSearchQuery = [streetAddress, city].filter(Boolean).join(', ') || city || 'Bengaluru';
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&output=embed`;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="pb-3 border-b border-[#E8E4DF]">
        <h3 className="font-serif text-xl font-bold text-[#1A1A2E]">
          Step 2: Basic Logistics, Timing &amp; Venue
        </h3>
        <p className="text-xs text-[#4B4B4B] mt-0.5">
          Define how, when, and where your guests will gather. All dates and times strictly operate in Indian Standard Time (IST).
        </p>
      </div>

      {/* Event Name */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
            Event Name / Title <span className="text-[#E8621A]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Indiranagar Founders Dinner &amp; Demo Salon"
            className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white font-medium"
          />
        </div>

        {/* Event Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-2">
            Event Format
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onEventTypeChange('in-person')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                eventType === 'in-person'
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF] hover:bg-[#F0EDE8]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#E8621A]" />
              In-Person
            </button>

            <button
              type="button"
              onClick={() => onEventTypeChange('online')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                eventType === 'online'
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF] hover:bg-[#F0EDE8]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#10B981]" />
              Online / Virtual
            </button>

            <button
              type="button"
              onClick={() => onEventTypeChange('hybrid')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                eventType === 'hybrid'
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF] hover:bg-[#F0EDE8]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-[#C9A84C]" />
              Hybrid
            </button>
          </div>
        </div>

        {/* Dynamic Location Inputs */}
        {(eventType === 'in-person' || eventType === 'hybrid') && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Venue Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Venue / Location Name</span>
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => onLocationNameChange(e.target.value)}
                  placeholder="e.g. WeWork Galaxy"
                  className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3.5 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#E8621A]" />
                  <span>Street Address</span>
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => onStreetAddressChange(e.target.value)}
                  placeholder="e.g. 43 Residency Road"
                  className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3.5 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1A7A4A]" />
                  <span>City</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3.5 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
                />
              </div>
            </div>

            {/* Live Preview Map Iframe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#8A8A8A]">
                <span>Live Google Maps Preview</span>
                <span className="text-[#1A7A4A] font-semibold">● Updates in real-time</span>
              </div>
              <div className="w-full h-60 rounded-xl overflow-hidden border border-[#E8E4DF] bg-[#F9F7F4]">
                <iframe
                  width="100%"
                  height="240"
                  style={{ border: 0, borderRadius: '12px' }}
                  loading="lazy"
                  src={mapEmbedUrl}
                  title="Google Maps Venue Preview"
                />
              </div>
            </div>
          </div>
        )}

        {(eventType === 'online' || eventType === 'hybrid') && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
              Virtual Meeting Link (Google Meet / Zoom)
            </label>
            <input
              type="url"
              value={onlineLink}
              onChange={(e) => onOnlineLinkChange(e.target.value)}
              placeholder="https://meet.google.com/xyz-abcd-efg"
              className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3.5 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white"
            />
            <span className="text-[10px] text-[#8A8A8A] mt-0.5 block">
              Meeting link is private and dispatched only to confirmed guests.
            </span>
          </div>
        )}
      </div>

      {/* Schedule & Timing (Separate Controlled Inputs in IST) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#1A1A2E]">
            <Calendar className="w-4 h-4 text-[#E8621A]" />
            <span>Event Timing Window (Asia/Kolkata IST)</span>
          </div>
          <span className="text-[11px] font-semibold text-[#C9A84C] bg-[#FDF6E7] px-2.5 py-0.5 rounded-full">
            IST (+05:30)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date & Time */}
          <div className="p-4 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF] space-y-3">
            <span className="text-xs font-bold text-[#1A1A2E] block">
              Event Starts (IST) <span className="text-[#E8621A]">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full bg-white border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="w-full bg-white border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
                />
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          <div className="p-4 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF] space-y-3">
            <span className="text-xs font-bold text-[#1A1A2E] block">
              Event Ends (IST) <span className="text-[#E8621A]">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full bg-white border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  className="w-full bg-white border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity & Public/Private Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Capacity */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#1A1A2E] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#C9A84C]" />
              Guest Capacity
            </label>
            <label className="inline-flex items-center gap-1 text-[11px] text-[#4B4B4B] cursor-pointer">
              <input
                type="checkbox"
                checked={isUnlimitedCapacity}
                onChange={(e) => onIsUnlimitedCapacityChange(e.target.checked)}
                className="rounded text-[#1A1A2E]"
              />
              <span>Unlimited</span>
            </label>
          </div>

          {!isUnlimitedCapacity ? (
            <div>
              <input
                type="number"
                min="1"
                max="1000"
                value={capacity}
                onChange={(e) => onCapacityChange(parseInt(e.target.value) || 50)}
                className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#1A1A2E]"
              />
              <span className="text-[10px] text-[#8A8A8A] mt-1 block">
                Once capacity is reached, guests will be automatically waitlisted.
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#8A8A8A] italic py-2">
              No attendee cap. Open admission until registration closes.
            </p>
          )}
        </div>

        {/* Public vs Private */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-3">
          <label className="text-xs font-semibold text-[#1A1A2E] flex items-center gap-1.5">
            {isPublic ? <Globe2 className="w-4 h-4 text-[#1A7A4A]" /> : <Lock className="w-4 h-4 text-[#B45309]" />}
            Discovery Visibility
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onIsPublicChange(true)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isPublic
                  ? 'bg-[#E8F5EE] text-[#1A7A4A] border border-[#1A7A4A]/30'
                  : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
              }`}
            >
              Public (Listed on Vibe)
            </button>

            <button
              type="button"
              onClick={() => onIsPublicChange(false)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isPublic
                  ? 'bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/30'
                  : 'bg-[#F9F7F4] text-[#4B4B4B] border border-[#E8E4DF]'
              }`}
            >
              Private (Unlisted link only)
            </button>
          </div>

          <span className="text-[10px] text-[#8A8A8A] block">
            {isPublic
              ? 'Featured in city discovery feeds across all locations.'
              : 'Only people with the private link can view and RSVP.'}
          </span>
        </div>
      </div>
    </div>
  );
}
