'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Check, Sparkles, RefreshCw } from 'lucide-react';
import { UnsplashPicker } from '@/components/media/UnsplashPicker';

interface StepCoverImageProps {
  coverUrl: string;
  onCoverUrlChange: (url: string) => void;
  eventName: string;
  eventType: string;
}

export function StepCoverImage({
  coverUrl,
  onCoverUrlChange,
  eventName,
  eventType,
}: StepCoverImageProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // File upload simulation or storage upload with 16:9 aspect ratio preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Convert local image to Object URL for instant preview & crop
    const objectUrl = URL.createObjectURL(file);
    setTimeout(() => {
      onCoverUrlChange(objectUrl);
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#E8E4DF]">
        <h3 className="font-serif text-xl font-bold text-[#1A1A2E]">
          Step 3: Cover Banner (16:9)
        </h3>
        <p className="text-xs text-[#4B4B4B] mt-0.5">
          Curated Unsplash imagery suggested for &ldquo;{eventName || 'your gathering'}&rdquo; ({eventType}), or upload your own 16:9 visual.
        </p>
      </div>

      {/* Active Cover Preview (16:9 Banner) */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
            Selected Cover Preview
          </label>
          <span className="text-[11px] font-mono text-[#8A8A8A]">16:9 Ratio</span>
        </div>

        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#1A1A2E] border border-[#E8E4DF] shadow-inner">
          <img
            src={coverUrl}
            alt="Event Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow-md">
            {eventName || 'Event Title Preview'}
          </div>
        </div>
      </div>

      {/* Upload Option (Supabase Storage / File) */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E4DF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5 justify-center sm:justify-start">
            <Upload className="w-3.5 h-3.5 text-[#E8621A]" />
            Upload Custom High-Res Banner
          </h4>
          <p className="text-[11px] text-[#8A8A8A]">
            PNG, JPG, WebP up to 5MB. Auto-cropped to 16:9.
          </p>
        </div>

        <label className="py-2 px-4 rounded-xl bg-[#1A1A2E] hover:bg-[#16213E] text-white text-xs font-semibold cursor-pointer shadow-sm transition-all flex items-center gap-2 shrink-0">
          {uploading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10B981]" /> Uploaded!
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" /> Choose Image File
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Unsplash Suggestion Grid */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DF] shadow-sm space-y-4">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">
            Suggested Images Keyed to &ldquo;{eventName || eventType}&rdquo;
          </h4>
        </div>

        <UnsplashPicker selectedUrl={coverUrl} onSelect={onCoverUrlChange} />
      </div>
    </div>
  );
}
