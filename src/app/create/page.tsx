'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sliders,
  Layers,
  Calendar,
  Image as ImageIcon,
  Wand2,
  HelpCircle,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { TemplatePicker } from '@/components/events/TemplatePicker';
import { StepBasicDetails } from '@/components/wizard/StepBasicDetails';
import { StepCoverImage } from '@/components/wizard/StepCoverImage';
import { AIGeneratePanel } from '@/components/ai/AIGeneratePanel';
import { StepRSVPBuilder, RSVPExtrasConfig } from '@/components/wizard/StepRSVPBuilder';
import { StepPreviewPublish } from '@/components/wizard/StepPreviewPublish';
import { EventTemplate, CustomQuestion, EventItem } from '@/types/database';
import { createEventRecord } from '@/lib/events';
import { TEMPLATES } from '@/lib/templates';
import { nanoid } from 'nanoid';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const WIZARD_STEPS = [
  { step: 1, title: 'Template', icon: Layers },
  { step: 2, title: 'Basics', icon: Calendar },
  { step: 3, title: 'Cover', icon: ImageIcon },
  { step: 4, title: 'AI Copy', icon: Wand2 },
  { step: 5, title: 'RSVP Form', icon: HelpCircle },
  { step: 6, title: 'Preview', icon: Eye },
];

export default function CreateEventWizardPage() {
  const router = useRouter();
  const { user, profile, signInWithEmail, verifyEmailOtp } = useAuth();

  // Helper to reliably retrieve the active logged in host from state or storage
  const getActiveOrganizer = () => {
    if (profile?.id) {
      return { id: profile.id, name: profile.name, email: profile.email };
    }
    if (user?.id) {
      return {
        id: user.id,
        name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || user.email?.split('@')[0] || 'Host',
        email: user.email || '',
      };
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vibe_auth_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.id) return parsed;
        }
        const cachedEmail = localStorage.getItem('vibe_viewer_email') || localStorage.getItem('vibe_guest_email');
        if (cachedEmail) {
          return {
            id: 'usr_' + cachedEmail.replace(/[^a-zA-Z0-9]/g, '_'),
            name: cachedEmail.split('@')[0],
            email: cachedEmail,
            role: 'organizer',
          };
        }
      } catch {}
    }
    return null;
  };

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Template & Theme
  const [template, setTemplate] = useState<EventTemplate>('Grove');
  const [customFont, setCustomFont] = useState('serif');
  const [backgroundMood, setBackgroundMood] = useState<'parchment' | 'clean' | 'deep'>('parchment');

  // Step 2: Basic Details (IST controlled date, time, and location)
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<'in-person' | 'online' | 'hybrid'>('in-person');

  const defaultDateStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('19:00');
  const [endDate, setEndDate] = useState(defaultDateStr);
  const [endTime, setEndTime] = useState('22:00');

  const [locationName, setLocationName] = useState('WeWork Galaxy');
  const [streetAddress, setStreetAddress] = useState('43 Residency Road, Shanthala Nagar');
  const [city, setCity] = useState('Bengaluru');
  const [onlineLink, setOnlineLink] = useState('');
  const [capacity, setCapacity] = useState(40);
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Step 3: Cover Image
  const [coverUrl, setCoverUrl] = useState<string>(TEMPLATES.Grove.sampleCover);

  // Step 4: AI Content
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappCaption, setWhatsappCaption] = useState('');
  const [instagramCaption, setInstagramCaption] = useState('');
  const [rsvpConfirmation, setRsvpConfirmation] = useState('');
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>([
    { question: 'What is the dress code?', answer: 'Smart casual and comfortable.' },
    { question: 'Is parking available?', answer: 'Valet and street parking on-site.' },
  ]);

  // Step 5: RSVP Builder
  const [extras, setExtras] = useState<RSVPExtrasConfig>({
    allowPlusOne: false,
    collectDietary: false,
    collectTshirt: false,
  });
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Publishing State & 3-stage progress messages
  const [publishing, setPublishing] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState('Saving your event...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-Wizard Quick Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Save current wizard state into localStorage
  const saveDraftLocally = () => {
    if (typeof window === 'undefined') return;
    try {
      const draft = {
        template,
        name,
        eventType,
        startDate,
        startTime,
        endDate,
        endTime,
        locationName,
        streetAddress,
        city,
        onlineLink,
        capacity,
        isUnlimitedCapacity,
        isPublic,
        coverUrl,
        tagline,
        description,
        whatsappCaption,
        instagramCaption,
        rsvpConfirmation,
        faq,
        extras,
        customQuestions,
        currentStep,
      };
      localStorage.setItem('vibe_create_draft', JSON.stringify(draft));
    } catch {}
  };

  // Restore draft and handle query parameters
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibe_create_draft');
      if (saved) {
        try {
          const d = JSON.parse(saved);
          if (d.template) setTemplate(d.template);
          if (d.name) setName(d.name);
          if (d.eventType) setEventType(d.eventType);
          if (d.startDate) setStartDate(d.startDate);
          if (d.startTime) setStartTime(d.startTime);
          if (d.endDate) setEndDate(d.endDate);
          if (d.endTime) setEndTime(d.endTime);
          if (d.locationName) setLocationName(d.locationName);
          if (d.streetAddress) setStreetAddress(d.streetAddress);
          if (d.city) setCity(d.city);
          if (d.capacity !== undefined) setCapacity(d.capacity);
          if (d.coverUrl) setCoverUrl(d.coverUrl);
          if (d.tagline) setTagline(d.tagline);
          if (d.description) setDescription(d.description);
          if (d.whatsappCaption) setWhatsappCaption(d.whatsappCaption);
          if (d.instagramCaption) setInstagramCaption(d.instagramCaption);
          if (d.rsvpConfirmation) setRsvpConfirmation(d.rsvpConfirmation);
          if (d.faq) setFaq(d.faq);
          if (d.extras) setExtras(d.extras);
          if (d.customQuestions) setCustomQuestions(d.customQuestions);
          if (d.currentStep) setCurrentStep(d.currentStep);
        } catch {}
      }

      const params = new URLSearchParams(window.location.search);
      const titleParam = params.get('title');
      const dateParam = params.get('preferred_date');

      if (titleParam) {
        setName(titleParam);
      }
      if (dateParam) {
        const parsed = new Date(dateParam);
        if (!isNaN(parsed.getTime())) {
          setStartTime(parsed.toISOString());
          setEndTime(new Date(parsed.getTime() + 3600000 * 3).toISOString());
        }
      }
      if (titleParam || dateParam) {
        setCurrentStep(2);
      }
    }
  }, []);

  // Auto-save draft on state updates
  React.useEffect(() => {
    saveDraftLocally();
  }, [
    template,
    name,
    eventType,
    startDate,
    startTime,
    endDate,
    endTime,
    locationName,
    streetAddress,
    city,
    capacity,
    coverUrl,
    tagline,
    description,
    currentStep,
  ]);

  // Handle AI apply callback
  const handleAIApplyAll = (data: any) => {
    if (data.tagline) setTagline(data.tagline);
    if (data.description) setDescription(data.description);
    if (data.whatsapp_caption) setWhatsappCaption(data.whatsapp_caption);
    if (data.instagram_caption) setInstagramCaption(data.instagram_caption);
    if (data.rsvp_confirmation) setRsvpConfirmation(data.rsvp_confirmation);
    if (data.faq) setFaq(data.faq);
  };

  // Dispatch OTP to host email
  const handleSendAuthOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;

    setAuthLoading(true);
    setAuthError(null);

    const res = await signInWithEmail(authEmail.trim(), 'organizer');
    setAuthLoading(false);

    if (res.success) {
      setAuthStep('otp');
      toast.success(`Verification code sent to ${authEmail.trim()}`);
    } else {
      setAuthError(res.error || 'Failed to dispatch verification code. Please check your email.');
      toast.error(res.error || 'Failed to dispatch verification code.');
    }
  };

  // Verify OTP and seamlessly publish
  const handleVerifyAuthOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authOtp.trim().length < 6) return;

    setAuthLoading(true);
    setAuthError(null);

    const res = await verifyEmailOtp(authEmail.trim(), authOtp.trim(), { role: 'organizer' });
    setAuthLoading(false);

    if (res.success) {
      toast.success('Signed in as Host! Publishing event now...');
      setShowAuthModal(false);

      setTimeout(async () => {
        const activeHost = getActiveOrganizer();
        let authId = activeHost?.id;
        if (!authId) {
          try {
            const { data } = await supabase.auth.getUser();
            authId = data?.user?.id;
          } catch {}
        }
        executePublish(authId);
      }, 300);
    } else {
      const err = res.error || 'Invalid 6-digit code. Please verify the code sent to your email.';
      setAuthError(err);
      toast.error(err);
    }
  };

  // Perform database insert & publish
  const executePublish = async (resolvedOrganizerId?: string) => {
    const activeHost = getActiveOrganizer();
    let organizerId = resolvedOrganizerId || activeHost?.id;
    if (!organizerId) {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        organizerId = authUser?.id;
      } catch {}
    }

    if (!organizerId) {
      saveDraftLocally();
      setShowAuthModal(true);
      toast.error('Please sign in to publish your gathering live.');
      return;
    }

    setPublishing(true);
    setErrorMessage(null);
    setPublishingStatus('Saving your event to database...');

    const startAtIso = new Date(`${startDate}T${startTime}:00+05:30`).toISOString();
    const endAtIso = new Date(`${endDate}T${endTime}:00+05:30`).toISOString();
    const fullLocation = eventType === 'online' ? 'Online' : `${streetAddress.trim()}, ${city.trim()}`;
    const fullVenue = eventType === 'online' ? 'Virtual Gathering' : locationName.trim();

    const eventPayload: Partial<EventItem> = {
      title: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      theme_template: template,
      cover_url: coverUrl,
      start_at: startAtIso,
      end_at: endAtIso,
      start_time: startAtIso,
      end_time: endAtIso,
      location_name: fullVenue,
      location_address: streetAddress.trim(),
      city: city.trim(),
      location: fullLocation,
      venue_name: fullVenue,
      is_virtual: eventType === 'online',
      capacity: isUnlimitedCapacity ? 9999 : capacity,
      approval_required: false,
      status: 'published',
      custom_questions: customQuestions,
      organizer_id: organizerId,
      sections: {
        faq,
        agenda: [
          { time: '7:00 PM', title: 'Arrival & Welcome Drinks' },
          { time: '7:45 PM', title: 'Curated Discussion' },
          { time: '8:45 PM', title: 'Family-Style Dinner & Mingling' },
        ],
      },
    };

    const res = await createEventRecord(eventPayload);

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vibe_create_draft');
      }
      setPublishingStatus('Generating social share cards...');
      await new Promise((r) => setTimeout(r, 400));

      setPublishingStatus('Publishing to Vibe by Swaniki...');
      await new Promise((r) => setTimeout(r, 400));

      toast.success('Gathering published live!');
      const eventTarget = res.data.id || res.data.slug;
      router.push('/events/' + eventTarget);
    } else {
      setPublishing(false);
      const errMsg = res.error || 'Failed to publish event. Please check your connection and try again.';
      toast.error(errMsg);
      setErrorMessage(`Publish notice: ${errMsg}`);
    }
  };

  // Publish Event trigger
  const handlePublish = async () => {
    if (!name.trim()) {
      toast.error('Please provide an event name in Step 2.');
      setErrorMessage('Please provide an event name in Step 2.');
      setCurrentStep(2);
      return;
    }

    // Verify authenticated user - check active logged in profile first
    const activeHost = getActiveOrganizer();
    let organizerId = activeHost?.id;
    if (!organizerId) {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        organizerId = authUser?.id;
      } catch {}
    }

    // Only prompt sign-in if completely unauthenticated with no session anywhere
    if (!organizerId) {
      saveDraftLocally();
      setShowAuthModal(true);
      toast.error('Please sign in to publish your gathering live.');
      return;
    }

    // Already logged in! Publish directly without asking for any token!
    await executePublish(organizerId);
  };

  const nextStep = () => {
    if (currentStep === 2 && !name.trim()) {
      setErrorMessage('Please enter an event name before proceeding.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const prevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen flex flex-col parchment-bg">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        {/* Wizard Stepper Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E4DF] shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto pb-1 sm:pb-0 gap-2">
            {WIZARD_STEPS.map((s) => {
              const isCurrent = currentStep === s.step;
              const isDone = currentStep > s.step;
              const Icon = s.icon;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-[#1A1A2E] text-white shadow-sm'
                      : isDone
                      ? 'bg-[#E8F5EE] text-[#1A7A4A]'
                      : 'text-[#8A8A8A] hover:text-[#1A1A2E]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#C9A84C] text-[#1A1A2E]'
                        : isDone
                        ? 'bg-[#1A7A4A] text-white'
                        : 'bg-[#F0EDE8] text-[#8A8A8A]'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                  </div>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#F0EDE8] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C9A84C] to-[#E8621A] h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FEF0E7] border border-[#E8621A]/30 text-xs text-[#D45510] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step Content Container */}
        <div className="min-h-[480px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TemplatePicker
                  selectedTemplate={template}
                  onSelect={(tpl) => {
                    setTemplate(tpl);
                    setCoverUrl(TEMPLATES[tpl].sampleCover);
                  }}
                  customFont={customFont}
                  onCustomFontChange={setCustomFont}
                  backgroundMood={backgroundMood}
                  onBackgroundMoodChange={setBackgroundMood}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StepBasicDetails
                  name={name}
                  onNameChange={setName}
                  eventType={eventType}
                  onEventTypeChange={setEventType}
                  startDate={startDate}
                  onStartDateChange={setStartDate}
                  startTime={startTime}
                  onStartTimeChange={setStartTime}
                  endDate={endDate}
                  onEndDateChange={setEndDate}
                  endTime={endTime}
                  onEndTimeChange={setEndTime}
                  locationName={locationName}
                  onLocationNameChange={setLocationName}
                  streetAddress={streetAddress}
                  onStreetAddressChange={setStreetAddress}
                  city={city}
                  onCityChange={setCity}
                  onlineLink={onlineLink}
                  onOnlineLinkChange={setOnlineLink}
                  capacity={capacity}
                  onCapacityChange={setCapacity}
                  isUnlimitedCapacity={isUnlimitedCapacity}
                  onIsUnlimitedCapacityChange={setIsUnlimitedCapacity}
                  isPublic={isPublic}
                  onIsPublicChange={setIsPublic}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StepCoverImage
                  coverUrl={coverUrl}
                  onCoverUrlChange={setCoverUrl}
                  eventName={name}
                  eventType={eventType}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AIGeneratePanel
                  eventName={name}
                  eventType={eventType}
                  location={city || locationName || 'Bengaluru'}
                  onApplyAll={handleAIApplyAll}
                  initialData={{
                    tagline,
                    description,
                    whatsapp_caption: whatsappCaption,
                    instagram_caption: instagramCaption,
                    rsvp_confirmation: rsvpConfirmation,
                    faq,
                  }}
                />
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StepRSVPBuilder
                  extras={extras}
                  onExtrasChange={setExtras}
                  customQuestions={customQuestions}
                  onCustomQuestionsChange={setCustomQuestions}
                  capacity={capacity}
                  isUnlimitedCapacity={isUnlimitedCapacity}
                />
              </motion.div>
            )}

            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {getActiveOrganizer() && (
                  <div className="mb-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-3 sm:p-4 flex items-center justify-between text-xs text-[#166534] shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-4 ring-[#DCFCE7] shrink-0" />
                      <div>
                        <span className="font-semibold text-[#14532D]">Host Session Active:</span>{' '}
                        <span>{getActiveOrganizer()?.name}</span>{' '}
                        <span className="text-[#15803D] opacity-75 hidden sm:inline">({getActiveOrganizer()?.email})</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full border border-[#86EFAC]/50 shrink-0">
                      Logged In · Instant Publish
                    </span>
                  </div>
                )}
                <StepPreviewPublish
                  eventData={{
                    name,
                    tagline,
                    description,
                    template,
                    coverUrl,
                    eventType,
                    startTime: `${startDate}T${startTime}:00+05:30`,
                    endTime: `${endDate}T${endTime}:00+05:30`,
                    location: `${streetAddress}, ${city}`,
                    venueName: locationName,
                    onlineLink,
                    capacity,
                    isUnlimitedCapacity,
                    isPublic,
                    extras,
                    customQuestions,
                    faq,
                  }}
                  onPublish={handlePublish}
                  publishing={publishing}
                  publishingStatus={publishingStatus}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Bottom Navigation Controls */}
        <div className="pt-4 border-t border-[#E8E4DF] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="py-2.5 px-4 rounded-xl border border-[#C8C4BF] hover:bg-[#F0EDE8] text-xs font-semibold text-[#1A1A2E] disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="py-2.5 px-6 rounded-xl bg-[#1A1A2E] hover:bg-[#16213E] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs font-semibold text-[#1A7A4A]">
              Step 6 of 6 · Ready to publish
            </span>
          )}
        </div>

        {/* Quick In-Wizard Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8E4DF] p-6 sm:p-8 shadow-2xl space-y-5 text-left">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F0EDE8] text-[#8A8A8A] hover:text-[#1A1A2E] transition-colors cursor-pointer"
                >
                  ✕
                </button>

                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] text-[#C9A84C] font-serif font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
                    V
                  </div>
                  <h3 className="text-xl font-serif font-extrabold text-[#1A1A2E]">
                    Sign in to Publish
                  </h3>
                  <p className="text-xs text-[#4B4B4B]">
                    {authStep === 'email'
                      ? 'An organizer account is required so you can manage RSVPs, view guest passes, and edit your event.'
                      : `Enter the 6-digit verification code sent to ${authEmail}`}
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-[#FEF0E7] border border-[#E8621A]/30 text-[#E8621A] text-xs font-semibold">
                    {authError}
                  </div>
                )}

                {authStep === 'email' ? (
                  <form onSubmit={handleSendAuthOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                        Host Email Address
                      </label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#C8C4BF] text-sm outline-none focus:border-[#1A1A2E] bg-[#F9F7F4] focus:bg-white transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 rounded-xl bg-[#1A1A2E] hover:bg-[#16213E] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyAuthOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={authOtp}
                        onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[#C8C4BF] text-center tracking-[0.4em] text-lg font-mono font-bold outline-none focus:border-[#1A1A2E] bg-[#F9F7F4] focus:bg-white transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading || authOtp.length < 6}
                      className="w-full py-3 rounded-xl bg-[#E8621A] hover:bg-[#D45510] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying &amp; Publishing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify &amp; Publish Event</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthStep('email')}
                      className="w-full text-center text-xs text-[#8A8A8A] hover:text-[#1A1A2E] underline cursor-pointer"
                    >
                      Change email address
                    </button>
                  </form>
                )}

                <div className="pt-2 border-t border-[#E8E4DF] text-center">
                  <Link
                    href="/auth/login?redirect=/create"
                    onClick={() => {
                      saveDraftLocally();
                    }}
                    className="text-xs font-bold text-[#E8621A] hover:underline"
                  >
                    Or open full sign in page &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
