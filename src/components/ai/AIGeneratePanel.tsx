'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Lock,
  Unlock,
  Check,
  Copy,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AIGenerationResponse } from '@/app/api/ai/generate/route';

interface AIGeneratePanelProps {
  eventName: string;
  eventType: string;
  location: string;
  dateTime?: string;
  brief?: string;
  onApplyAll: (data: any) => void;
  initialData?: Partial<AIGenerationResponse>;
}

export function AIGeneratePanel({
  eventName,
  eventType,
  location,
  dateTime = '',
  brief = '',
  onApplyAll,
  initialData = {},
}: AIGeneratePanelProps) {
  const [tone, setTone] = useState<'Warm' | 'Professional' | 'Casual' | 'Exciting'>('Warm');
  const [generating, setGenerating] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Content Fields
  const [tagline, setTagline] = useState(initialData.tagline || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [whatsappCaption, setWhatsappCaption] = useState(initialData.whatsapp_caption || '');
  const [instagramCaption, setInstagramCaption] = useState(initialData.instagram_caption || '');
  const [rsvpConfirmation, setRsvpConfirmation] = useState(initialData.rsvp_confirmation || '');
  const [faq, setFaq] = useState<{ q: string; a: string; question?: string; answer?: string }[]>(
    (initialData.faq as any) || [
      { q: 'What is the dress code?', a: 'Smart casual and comfortable.', question: 'What is the dress code?', answer: 'Smart casual and comfortable.' },
      { q: 'Is parking available on-site?', a: 'Valet and dedicated parking is available at the venue.', question: 'Is parking available on-site?', answer: 'Valet and dedicated parking is available at the venue.' },
    ]
  );

  // Locked Fields Map (Lock on manual edit)
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});

  // Streaming visual indicator
  const [streamActive, setStreamActive] = useState(false);

  // Copy status indicators
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleLock = (field: string) => {
    setLockedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleManualEdit = (field: string) => {
    if (!lockedFields[field]) {
      setLockedFields((prev) => ({ ...prev, [field]: true }));
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Generate All (skips locked fields)
  const handleGenerateAll = async () => {
    setGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventName || 'Intimate Gathering',
          eventType,
          location,
          dateTime,
          brief,
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'AI Generation failed');
      }

      // Update only unlocked fields
      const newTagline = !lockedFields.tagline && data.tagline ? data.tagline : tagline;
      const newDescription = !lockedFields.description && data.description ? data.description : description;
      const newWhatsapp = !lockedFields.whatsapp_caption && data.whatsapp_caption ? data.whatsapp_caption : whatsappCaption;
      const newInstagram = !lockedFields.instagram_caption && data.instagram_caption ? data.instagram_caption : instagramCaption;
      const newRsvpConfirm = !lockedFields.rsvp_confirmation && data.rsvp_confirmation ? data.rsvp_confirmation : rsvpConfirmation;
      const newFaq = !lockedFields.faq && data.faq ? data.faq : faq;

      if (!lockedFields.tagline && data.tagline) setTagline(data.tagline);
      if (!lockedFields.description && data.description) setDescription(data.description);
      if (!lockedFields.whatsapp_caption && data.whatsapp_caption) setWhatsappCaption(data.whatsapp_caption);
      if (!lockedFields.instagram_caption && data.instagram_caption) setInstagramCaption(data.instagram_caption);
      if (!lockedFields.rsvp_confirmation && data.rsvp_confirmation) setRsvpConfirmation(data.rsvp_confirmation);
      if (!lockedFields.faq && data.faq) setFaq(data.faq);

      onApplyAll({
        tagline: newTagline,
        description: newDescription,
        whatsapp_caption: newWhatsapp,
        instagram_caption: newInstagram,
        rsvp_confirmation: newRsvpConfirm,
        faq: newFaq,
      });

      setStreamActive(true);
      setTimeout(() => setStreamActive(false), 800);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate copy with Gemini Flash.');
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate Single Field
  const handleRegenerateField = async (field: keyof AIGenerationResponse) => {
    setRegeneratingField(field);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventName || 'Curated Gathering',
          eventType,
          location,
          dateTime,
          brief,
          tone,
          field,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Field generation failed');
      }

      if (field === 'tagline' && data.tagline) setTagline(data.tagline);
      if (field === 'description' && data.description) setDescription(data.description);
      if (field === 'whatsapp_caption' && data.whatsapp_caption) setWhatsappCaption(data.whatsapp_caption);
      if (field === 'instagram_caption' && data.instagram_caption) setInstagramCaption(data.instagram_caption);
      if (field === 'rsvp_confirmation' && data.rsvp_confirmation) setRsvpConfirmation(data.rsvp_confirmation);
      if (field === 'faq' && data.faq) setFaq(data.faq);

      // Unlock upon deliberate single-field regeneration
      setLockedFields((prev) => ({ ...prev, [field]: false }));
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || `Failed to regenerate ${field}`);
    } finally {
      setRegeneratingField(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4DF]">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" />
            <span>Step 4: Gemini Flash AI Content Engine</span>
          </h3>
          <p className="text-xs text-[#4B4B4B] mt-0.5">
            Real-time copy generation. Manually editing any field shows a lock icon (🔒) and preserves it during &ldquo;Regenerate All&rdquo;.
          </p>
        </div>

        {/* Tone Selector & Regenerate All */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
            className="bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1A1A2E] outline-none focus:border-[#1A1A2E]"
          >
            <option value="Warm">Warm &amp; Intimate</option>
            <option value="Professional">Professional &amp; Executive</option>
            <option value="Exciting">Exciting &amp; High-Energy</option>
            <option value="Casual">Casual &amp; Unhurried</option>
          </select>

          <button
            type="button"
            onClick={handleGenerateAll}
            disabled={generating}
            className="py-2 px-4 rounded-xl bg-[#E8621A] hover:bg-[#D45510] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                Regenerate All
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#FEF0E7] border border-[#E8621A]/30 text-xs text-[#D45510] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Field 1: Tagline */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A2E]">Tagline (8-12 words)</span>
            {lockedFields.tagline ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#8A8A8A]">
                <Unlock className="w-2.5 h-2.5" /> AI Sync
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleLock('tagline')}
              title={lockedFields.tagline ? 'Unlock to regenerate' : 'Lock to preserve'}
              className="text-[#8A8A8A] hover:text-[#1A1A2E] p-1"
            >
              {lockedFields.tagline ? <Lock className="w-3.5 h-3.5 text-[#B45309]" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => handleRegenerateField('tagline')}
              disabled={regeneratingField === 'tagline'}
              className="text-xs font-semibold text-[#E8621A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${regeneratingField === 'tagline' ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>

        <input
          type="text"
          value={tagline}
          onChange={(e) => {
            setTagline(e.target.value);
            handleManualEdit('tagline');
          }}
          placeholder="An evocative 8-12 word hook..."
          className={`w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-all ${
            streamActive ? 'animate-pulse' : ''
          }`}
        />
      </div>

      {/* Field 2: Description */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A2E]">Event Narrative / Description (150-200 words)</span>
            {lockedFields.description ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#8A8A8A]">
                <Unlock className="w-2.5 h-2.5" /> AI Sync
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleLock('description')}
              title={lockedFields.description ? 'Unlock to regenerate' : 'Lock to preserve'}
              className="text-[#8A8A8A] hover:text-[#1A1A2E] p-1"
            >
              {lockedFields.description ? <Lock className="w-3.5 h-3.5 text-[#B45309]" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => handleRegenerateField('description')}
              disabled={regeneratingField === 'description'}
              className="text-xs font-semibold text-[#E8621A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${regeneratingField === 'description' ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>

        <textarea
          rows={5}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            handleManualEdit('description');
          }}
          placeholder="Why guests must attend, who is gathering, hospitality included..."
          className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white leading-relaxed"
        />
      </div>

      {/* Field 3 & 4: WhatsApp Caption & Instagram Caption */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp Forward Caption */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A7A4A] flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 fill-current" />
                WhatsApp Forward
              </span>
              {lockedFields.whatsapp_caption && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleLock('whatsapp_caption')}
                title={lockedFields.whatsapp_caption ? 'Unlock to regenerate' : 'Lock to preserve'}
                className="text-[#8A8A8A] hover:text-[#1A1A2E] p-1"
              >
                {lockedFields.whatsapp_caption ? <Lock className="w-3.5 h-3.5 text-[#B45309]" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(whatsappCaption, 'whatsapp')}
                className="text-xs font-semibold text-[#4B4B4B] hover:text-[#1A1A2E] flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'whatsapp' ? <Check className="w-3 h-3 text-[#1A7A4A]" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'whatsapp' ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => handleRegenerateField('whatsapp_caption')}
                className="text-xs font-semibold text-[#E8621A] hover:underline cursor-pointer"
              >
                Regen
              </button>
            </div>
          </div>

          <textarea
            rows={4}
            value={whatsappCaption}
            onChange={(e) => {
              setWhatsappCaption(e.target.value);
              handleManualEdit('whatsapp_caption');
            }}
            placeholder="50-word WhatsApp message with emojis..."
            className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl p-3 text-xs text-[#0F0F0F] font-mono outline-none focus:border-[#1A1A2E] leading-relaxed"
          />
        </div>

        {/* Instagram Caption */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#E1306C] flex items-center gap-1.5">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram Post
              </span>
              {lockedFields.instagram_caption && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleLock('instagram_caption')}
                title={lockedFields.instagram_caption ? 'Unlock to regenerate' : 'Lock to preserve'}
                className="text-[#8A8A8A] hover:text-[#1A1A2E] p-1"
              >
                {lockedFields.instagram_caption ? <Lock className="w-3.5 h-3.5 text-[#B45309]" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(instagramCaption, 'instagram')}
                className="text-xs font-semibold text-[#4B4B4B] hover:text-[#1A1A2E] flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'instagram' ? <Check className="w-3 h-3 text-[#1A7A4A]" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'instagram' ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => handleRegenerateField('instagram_caption')}
                className="text-xs font-semibold text-[#E8621A] hover:underline cursor-pointer"
              >
                Regen
              </button>
            </div>
          </div>

          <textarea
            rows={4}
            value={instagramCaption}
            onChange={(e) => {
              setInstagramCaption(e.target.value);
              handleManualEdit('instagram_caption');
            }}
            placeholder="60-word Instagram caption with 5 hashtags..."
            className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl p-3 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] leading-relaxed"
          />
        </div>
      </div>

      {/* Field 5: RSVP Confirmation Message */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" />
              RSVP Confirmation Message (40 words)
            </span>
            {lockedFields.rsvp_confirmation && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleLock('rsvp_confirmation')}
              title={lockedFields.rsvp_confirmation ? 'Unlock to regenerate' : 'Lock to preserve'}
              className="text-[#8A8A8A] hover:text-[#1A1A2E] p-1"
            >
              {lockedFields.rsvp_confirmation ? <Lock className="w-3.5 h-3.5 text-[#B45309]" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => handleRegenerateField('rsvp_confirmation')}
              className="text-xs font-semibold text-[#E8621A] hover:underline cursor-pointer"
            >
              Regenerate
            </button>
          </div>
        </div>

        <input
          type="text"
          value={rsvpConfirmation}
          onChange={(e) => {
            setRsvpConfirmation(e.target.value);
            handleManualEdit('rsvp_confirmation');
          }}
          placeholder="40-word confirmation message thanking guest..."
          className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl px-3.5 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E]"
        />
      </div>

      {/* Field 6: FAQs */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#C9A84C]" />
              Frequently Asked Questions ({faq.length})
            </span>
            {lockedFields.faq && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleLock('faq')}
              title={lockedFields.faq ? 'Unlock to regenerate' : 'Lock to preserve'}
              className="text-[#8A8A8A] hover:text-[#1A1A2E] p-1"
            >
              {lockedFields.faq ? <Lock className="w-3.5 h-3.5 text-[#B45309]" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => handleRegenerateField('faq')}
              className="text-xs font-semibold text-[#E8621A] hover:underline cursor-pointer"
            >
              Regenerate FAQs
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {faq.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#F9F7F4] rounded-xl border border-[#E8E4DF] text-xs space-y-1"
            >
              <input
                type="text"
                value={item.q || item.question || ''}
                onChange={(e) => {
                  const updated = [...faq];
                  updated[idx] = {
                    ...updated[idx],
                    q: e.target.value,
                    question: e.target.value,
                  };
                  setFaq(updated);
                  handleManualEdit('faq');
                }}
                className="w-full font-bold text-[#1A1A2E] bg-transparent outline-none"
              />
              <textarea
                rows={2}
                value={item.a || item.answer || ''}
                onChange={(e) => {
                  const updated = [...faq];
                  updated[idx] = {
                    ...updated[idx],
                    a: e.target.value,
                    answer: e.target.value,
                  };
                  setFaq(updated);
                  handleManualEdit('faq');
                }}
                className="w-full text-[#4B4B4B] bg-transparent outline-none leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
