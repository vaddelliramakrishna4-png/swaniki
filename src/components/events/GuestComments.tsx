'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Lock, Sparkles, UserCheck } from 'lucide-react';
import { CommentItem } from '@/types/database';
import { fetchEventComments, addEventComment } from '@/lib/events';

interface GuestCommentsProps {
  eventId: string;
  isViewerRsvped?: boolean;
}

export function GuestComments({ eventId, isViewerRsvped }: GuestCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasRsvped, setHasRsvped] = useState(isViewerRsvped ?? false);

  // Check localStorage and listen for local RSVP events
  useEffect(() => {
    if (isViewerRsvped) {
      setHasRsvped(true);
      return;
    }

    try {
      const stored = localStorage.getItem(`vibe_viewer_rsvped_${eventId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHasRsvped(true);
        if (parsed.name && !authorName) setAuthorName(parsed.name);
      }
    } catch {}

    const handleRsvpEvent = (e: any) => {
      setHasRsvped(true);
      if (e.detail?.guest_name) {
        setAuthorName(e.detail.guest_name);
      }
    };
    window.addEventListener('vibe-rsvp-created', handleRsvpEvent);

    return () => {
      window.removeEventListener('vibe-rsvp-created', handleRsvpEvent);
    };
  }, [eventId, isViewerRsvped]);

  // Fetch comments and listen to realtime comment channel
  useEffect(() => {
    fetchEventComments(eventId).then((data) => {
      setComments(data || []);
    });

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(`vibe-event-comments-${eventId}`);
      bc.onmessage = (e) => {
        if (e.data?.type === 'COMMENT_ADDED' && e.data.comment) {
          setComments((prev) => {
            if (prev.some((c) => c.id === e.data.comment.id)) return prev;
            return [...prev, e.data.comment];
          });
        }
      };
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !body.trim()) return;

    setSubmitting(true);
    const newComment: CommentItem = {
      id: 'local-' + Date.now(),
      event_id: eventId,
      author_name: authorName.trim(),
      body: body.trim(),
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setBody('');

    await addEventComment({
      event_id: eventId,
      author_name: newComment.author_name,
      body: newComment.body,
    });

    setSubmitting(false);
  };

  const scrollToRSVP = () => {
    const rsvpElement = document.getElementById('rsvp-section');
    if (rsvpElement) {
      rsvpElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Locked Gate State if viewer has NOT yet RSVPed
  if (!hasRsvped) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDF6E7] rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-[#8A8A8A]" />
          <h4 className="text-base font-bold text-[#1A1A2E] font-['Inter']">
            Attendee Community Board
          </h4>
          <span className="text-[10px] uppercase font-bold text-[#C9A84C] bg-[#FDF6E7] px-2 py-0.5 rounded-full border border-[#C9A84C]/30">
            RSVP Protected
          </span>
        </div>

        <div className="bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl p-5 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-white text-[#C9A84C] flex items-center justify-center mx-auto shadow-sm border border-[#E8E4DF]">
            <Lock className="w-4 h-4" />
          </div>

          <div>
            <h5 className="text-sm font-bold text-[#1A1A2E]">
              Guest Conversations &amp; Questions Locked
            </h5>
            <p className="text-xs text-[#4B4B4B] max-w-md mx-auto mt-1 leading-relaxed">
              This discussion thread is reserved for confirmed attendees to introduce themselves, coordinate carpools, and ask the host questions.
            </p>
          </div>

          <button
            onClick={scrollToRSVP}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A1A2E] hover:bg-[#16213E] text-white text-xs font-bold shadow-sm transition-all hover:shadow-md"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
            RSVP to Unlock Conversation
          </button>
        </div>
      </div>
    );
  }

  // Unlocked State (Confirmed Guests)
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#E8621A]" />
          <h4 className="text-base font-bold text-[#1A1A2E] font-['Inter']">
            Attendee Community Board ({comments.length})
          </h4>
        </div>
        <span className="text-xs text-[#1A7A4A] font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#1A7A4A]" /> Unlocked
        </span>
      </div>

      {/* Comments Thread */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#F9F7F4] border border-dashed border-[#E8E4DF] text-center text-xs text-[#8A8A8A]">
            No notes posted yet. Be the first attendee to start the conversation!
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl bg-[#F9F7F4] border border-[#E8E4DF] space-y-1 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#1A1A2E] text-[#C9A84C] flex items-center justify-center text-[10px] font-bold">
                    {c.author_name[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className="text-xs font-bold text-[#1A1A2E]">
                    {c.author_name}
                  </span>
                </div>
                <span className="text-[10px] text-[#8A8A8A]">
                  {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
              </div>
              <p className="text-xs text-[#4B4B4B] pl-7.5 leading-relaxed">{c.body}</p>
            </div>
          ))
        )}
      </div>

      {/* Post Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-[#E8E4DF]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
          />
          <input
            type="text"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Drop a note or question for the group..."
            className="sm:col-span-2 w-full bg-[#F9F7F4] border border-[#E8E4DF] rounded-lg px-3 py-2 text-xs text-[#0F0F0F] outline-none focus:border-[#1A1A2E] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !authorName.trim() || !body.trim()}
            className="px-4 py-2 rounded-lg bg-[#1A1A2E] hover:bg-[#16213E] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Post Note
          </button>
        </div>
      </form>
    </div>
  );
}

