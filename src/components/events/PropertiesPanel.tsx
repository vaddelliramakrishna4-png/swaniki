'use client';

import React from 'react';
import { Settings, Users, ShieldCheck, MapPin, Globe, Plus, Trash2, HelpCircle } from 'lucide-react';
import { CustomQuestion } from '@/types/database';

interface PropertiesPanelProps {
  capacity: number;
  onCapacityChange: (val: number) => void;
  approvalRequired: boolean;
  onApprovalRequiredChange: (val: boolean) => void;
  isVirtual: boolean;
  onIsVirtualChange: (val: boolean) => void;
  location: string;
  onLocationChange: (val: string) => void;
  venueName: string;
  onVenueNameChange: (val: string) => void;
  startTime: string;
  onStartTimeChange: (val: string) => void;
  endTime: string;
  onEndTimeChange: (val: string) => void;
  customQuestions: CustomQuestion[];
  onCustomQuestionsChange: (questions: CustomQuestion[]) => void;
}

export function PropertiesPanel({
  capacity,
  onCapacityChange,
  approvalRequired,
  onApprovalRequiredChange,
  isVirtual,
  onIsVirtualChange,
  location,
  onLocationChange,
  venueName,
  onVenueNameChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  customQuestions,
  onCustomQuestionsChange,
}: PropertiesPanelProps) {
  const addQuestion = () => {
    const newQ: CustomQuestion = {
      id: 'q_' + Date.now(),
      label: 'New Question',
      type: 'text',
      required: false,
    };
    onCustomQuestionsChange([...customQuestions, newQ]);
  };

  const removeQuestion = (id: string) => {
    onCustomQuestionsChange(customQuestions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    onCustomQuestionsChange(
      customQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-[#E8E4DF]">
        <Settings className="w-5 h-5 text-[#1A1A2E]" />
        <h3 className="font-bold text-base text-[#1A1A2E] font-['Inter']">
          Event Settings &amp; Access Controls
        </h3>
      </div>

      {/* Date & Time Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
            Start Time (IST) <span className="text-[#E8621A]">*</span>
          </label>
          <input
            type="datetime-local"
            value={startTime ? startTime.slice(0, 16) : ''}
            onChange={(e) => onStartTimeChange(new Date(e.target.value).toISOString())}
            className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
            End Time (IST)
          </label>
          <input
            type="datetime-local"
            value={endTime ? endTime.slice(0, 16) : ''}
            onChange={(e) => onEndTimeChange(new Date(e.target.value).toISOString())}
            className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
          />
        </div>
      </div>

      {/* Location / Virtual Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#1A1A2E]">
            Format &amp; Venue
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onIsVirtualChange(false)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                !isVirtual
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#F9F7F4] border border-[#E8E4DF] text-[#4B4B4B]'
              }`}
            >
              <MapPin className="w-3 h-3" /> In-Person
            </button>
            <button
              type="button"
              onClick={() => onIsVirtualChange(true)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                isVirtual
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#F9F7F4] border border-[#E8E4DF] text-[#4B4B4B]'
              }`}
            >
              <Globe className="w-3 h-3" /> Virtual
            </button>
          </div>
        </div>

        {!isVirtual ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={venueName}
                onChange={(e) => onVenueNameChange(e.target.value)}
                placeholder="Venue Name (e.g. Olive Beach, Indiranagar)"
                className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
              />
            </div>
            <div>
              <input
                type="text"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="City / Address (e.g. Bengaluru, Karnataka)"
                className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
              />
            </div>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Meeting URL (Google Meet / Zoom - sent to confirmed guests)"
              className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
            />
          </div>
        )}
      </div>

      {/* Capacity & Approval */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8E4DF]">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#8A8A8A]" />
            Guest Capacity (Max Spots)
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={capacity}
            onChange={(e) => onCapacityChange(parseInt(e.target.value) || 50)}
            className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
          />
          <span className="text-[10px] text-[#8A8A8A] mt-0.5 block">
            Set to cap admissions and generate FOMO countdowns.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
            Curated Approval Flow
          </label>
          <div className="mt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#4B4B4B]">
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(e) => onApprovalRequiredChange(e.target.checked)}
                className="rounded text-[#1A1A2E] focus:ring-[#1A1A2E]"
              />
              <span>Require organizer review before confirming RSVP</span>
            </label>
          </div>
          <span className="text-[10px] text-[#8A8A8A] mt-0.5 block">
            Ideal for private dinners, VC salons, and invite-only summits.
          </span>
        </div>
      </div>

      {/* Custom RSVP Questions Builder */}
      <div className="pt-2 border-t border-[#E8E4DF] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#E8621A]" />
              Custom RSVP Questions ({customQuestions.length})
            </h4>
            <span className="text-[10px] text-[#8A8A8A]">
              Ask attendees about their work, diet, or social profiles
            </span>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="py-1 px-2.5 rounded-lg bg-[#F9F7F4] border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Question
          </button>
        </div>

        {customQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="p-3 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF] space-y-2 text-left"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={q.label}
                onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                placeholder="Question text..."
                className="flex-1 bg-white border border-[#E8E4DF] rounded-lg px-2.5 py-1 text-xs text-[#0F0F0F] outline-none"
              />

              <label className="inline-flex items-center gap-1 text-[11px] text-[#4B4B4B] shrink-0">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                  className="rounded text-[#E8621A]"
                />
                Required
              </label>

              <button
                type="button"
                onClick={() => removeQuestion(q.id)}
                className="text-[#8A8A8A] hover:text-[#D45510] p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
