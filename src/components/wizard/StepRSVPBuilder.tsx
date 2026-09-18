'use client';

import React from 'react';
import { ShieldCheck, Plus, Trash2, HelpCircle, Check, Users, Clock } from 'lucide-react';
import { CustomQuestion } from '@/types/database';

export interface RSVPExtrasConfig {
  allowPlusOne: boolean;
  collectDietary: boolean;
  collectTshirt: boolean;
}

interface StepRSVPBuilderProps {
  extras: RSVPExtrasConfig;
  onExtrasChange: (extras: RSVPExtrasConfig) => void;
  customQuestions: CustomQuestion[];
  onCustomQuestionsChange: (questions: CustomQuestion[]) => void;
  capacity: number;
  isUnlimitedCapacity: boolean;
}

export function StepRSVPBuilder({
  extras,
  onExtrasChange,
  customQuestions,
  onCustomQuestionsChange,
  capacity,
  isUnlimitedCapacity,
}: StepRSVPBuilderProps) {
  const toggleExtra = (key: keyof RSVPExtrasConfig) => {
    onExtrasChange({ ...extras, [key]: !extras[key] });
  };

  const addCustomQuestion = () => {
    if (customQuestions.length >= 3) return;
    const newQ: CustomQuestion = {
      id: 'q_' + Date.now(),
      label: '',
      type: 'text',
      required: false,
      options: ['Option 1', 'Option 2'],
    };
    onCustomQuestionsChange([...customQuestions, newQ]);
  };

  const removeCustomQuestion = (id: string) => {
    onCustomQuestionsChange(customQuestions.filter((q) => q.id !== id));
  };

  const updateCustomQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    onCustomQuestionsChange(
      customQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#E8E4DF]">
        <h3 className="font-serif text-xl font-bold text-[#1A1A2E]">
          Step 5: RSVP Form Builder &amp; Guest Questions
        </h3>
        <p className="text-xs text-[#4B4B4B] mt-0.5">
          Configure guest data collection. Core fields (Name, Email, WhatsApp +91) are automatically required.
        </p>
      </div>

      {/* Auto Waitlist Banner */}
      {!isUnlimitedCapacity && capacity > 0 && (
        <div className="p-4 rounded-xl bg-[#E8F5EE] border border-[#1A7A4A]/20 text-xs text-[#1A7A4A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              <strong>Auto-Waitlist Enabled:</strong> Once {capacity} spots are filled, subsequent RSVPs will automatically be placed on the waitlist.
            </span>
          </div>
          <span className="font-mono font-bold">{capacity} Max Spots</span>
        </div>
      )}

      {/* Mandatory Default Fields (Locked ON) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
            Mandatory Standard Fields (Permanently Locked ON)
          </h4>
          <span className="text-[11px] font-semibold text-[#1A7A4A] bg-[#E8F5EE] px-2.5 py-0.5 rounded-full">
            Locked ON
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#1A7A4A] shrink-0" />
            <div>
              <strong className="text-[#1A1A2E] block">Full Name</strong>
              <span className="text-[10px] text-[#8A8A8A]">Required · Permanent default</span>
            </div>
          </div>

          <div className="p-3 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#1A7A4A] shrink-0" />
            <div>
              <strong className="text-[#1A1A2E] block">Email Address</strong>
              <span className="text-[10px] text-[#8A8A8A]">Required · Used for confirmation ticket</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggleable Common Extras */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
          Toggleable Event Extras
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Plus One */}
          <div
            onClick={() => toggleExtra('allowPlusOne')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              extras.allowPlusOne
                ? 'border-[#1A1A2E] bg-[#FDFCFB] shadow-sm'
                : 'border-[#E8E4DF] bg-[#F9F7F4] opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#1A1A2E]">+1 Guest Registration</span>
              <input
                type="checkbox"
                checked={extras.allowPlusOne}
                onChange={() => {}}
                className="rounded text-[#1A1A2E]"
              />
            </div>
            <p className="text-[11px] text-[#4B4B4B]">
              Allow attendees to bring a named guest with their RSVP.
            </p>
          </div>

          {/* Dietary */}
          <div
            onClick={() => toggleExtra('collectDietary')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              extras.collectDietary
                ? 'border-[#1A1A2E] bg-[#FDFCFB] shadow-sm'
                : 'border-[#E8E4DF] bg-[#F9F7F4] opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#1A1A2E]">Dietary Preferences</span>
              <input
                type="checkbox"
                checked={extras.collectDietary}
                onChange={() => {}}
                className="rounded text-[#1A1A2E]"
              />
            </div>
            <p className="text-[11px] text-[#4B4B4B]">
              Veg, Non-Veg, Vegan, Jain, or allergen dietary options.
            </p>
          </div>

          {/* T-Shirt */}
          <div
            onClick={() => toggleExtra('collectTshirt')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              extras.collectTshirt
                ? 'border-[#1A1A2E] bg-[#FDFCFB] shadow-sm'
                : 'border-[#E8E4DF] bg-[#F9F7F4] opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#1A1A2E]">T-Shirt Size Swag</span>
              <input
                type="checkbox"
                checked={extras.collectTshirt}
                onChange={() => {}}
                className="rounded text-[#1A1A2E]"
              />
            </div>
            <p className="text-[11px] text-[#4B4B4B]">
              Collect sizing (S, M, L, XL, XXL) for custom event merch.
            </p>
          </div>
        </div>
      </div>

      {/* Up to 3 Custom Questions */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#E8621A]" />
              Custom Questions ({customQuestions.length}/3)
            </h4>
            <span className="text-[10px] text-[#8A8A8A]">
              Ask attendees about their work, links, or expectations.
            </span>
          </div>

          <button
            type="button"
            onClick={addCustomQuestion}
            disabled={customQuestions.length >= 3}
            className="py-1.5 px-3 rounded-lg bg-[#1A1A2E] hover:bg-[#16213E] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-sm"
          >
            <Plus className="w-3 h-3" /> Add Question
          </button>
        </div>

        {customQuestions.length === 0 && (
          <p className="text-xs text-[#8A8A8A] italic py-2">
            No custom questions added. Click &ldquo;Add Question&rdquo; to add up to 3 tailored questions.
          </p>
        )}

        <div className="space-y-3">
          {customQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF] space-y-3 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-[#8A8A8A]">Q{idx + 1}:</span>
                  <input
                    type="text"
                    required
                    value={q.label}
                    onChange={(e) => updateCustomQuestion(q.id, { label: e.target.value })}
                    placeholder="e.g. What are you currently building?"
                    className="flex-1 bg-white border border-[#E8E4DF] rounded-lg px-3 py-1.5 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Question Type Selector */}
                  <select
                    value={q.type}
                    onChange={(e) => updateCustomQuestion(q.id, { type: e.target.value as any })}
                    className="bg-white border border-[#E8E4DF] rounded-lg px-2.5 py-1.5 text-xs text-[#0F0F0F] outline-none"
                  >
                    <option value="text">Short Text</option>
                    <option value="select">Dropdown</option>
                    <option value="checkbox">Yes / No</option>
                  </select>

                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B4B4B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateCustomQuestion(q.id, { required: e.target.checked })}
                      className="rounded text-[#E8621A]"
                    />
                    <span>Required</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeCustomQuestion(q.id)}
                    className="text-[#8A8A8A] hover:text-[#D45510] p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* If Dropdown, display options builder */}
              {q.type === 'select' && (
                <div className="pt-2 border-t border-[#E8E4DF] text-xs">
                  <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-1">
                    Dropdown Options (comma separated):
                  </label>
                  <input
                    type="text"
                    value={(q.options || []).join(', ')}
                    onChange={(e) =>
                      updateCustomQuestion(q.id, {
                        options: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    placeholder="Founder, Operator, Investor, Designer"
                    className="w-full bg-white border border-[#E8E4DF] rounded-lg px-3 py-1 text-xs text-[#0F0F0F] outline-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
