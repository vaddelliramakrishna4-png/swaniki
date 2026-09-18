'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, ArrowRight, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';

interface GuestOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneOrEmail: string;
  onVerified: () => void;
}

export function GuestOTPModal({
  isOpen,
  onClose,
  phoneOrEmail,
  onVerified,
}: GuestOTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) return;

    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1000);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E8E4DF] p-6 shadow-2xl relative space-y-5"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A8A8A] hover:text-[#1A1A2E] p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-[#FEF0E7] text-[#E8621A] flex items-center justify-center mx-auto shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1A1A2E] font-['Inter']">
            Verify Your RSVP
          </h3>
          <p className="text-xs text-[#4B4B4B]">
            We sent a 6-digit code to{' '}
            <strong className="text-[#0F0F0F]">{phoneOrEmail}</strong>
          </p>
        </div>

        {/* 6 Digit Inputs */}
        <div className="flex items-center justify-center gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-digit-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-10 h-12 text-center text-lg font-bold font-mono bg-[#F9F7F4] border border-[#E8E4DF] rounded-xl outline-none focus:border-[#1A1A2E] focus:bg-white transition-all shadow-inner"
            />
          ))}
        </div>

        {/* Action Button: Reserved Accent CTA */}
        <button
          onClick={handleVerify}
          disabled={verifying || otp.join('').length < 6}
          className="w-full py-2.5 px-4 rounded-[10px] bg-[#E8621A] hover:bg-[#D45510] active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              Confirmed!
            </>
          ) : verifying ? (
            'Verifying...'
          ) : (
            'Verify & Confirm RSVP'
          )}
        </button>

        {/* Resend Timer */}
        <div className="text-center">
          {timer > 0 ? (
            <span className="text-[11px] text-[#8A8A8A]">
              Resend code in <strong className="text-[#1A1A2E]">{timer}s</strong>
            </span>
          ) : (
            <button
              onClick={() => setTimer(30)}
              className="text-[11px] text-[#E8621A] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Resend Code
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
