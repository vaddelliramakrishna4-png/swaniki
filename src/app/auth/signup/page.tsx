'use client';

import React, { Suspense } from 'react';
import AuthPage from '../login/page';

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center parchment-bg">
          <div className="w-8 h-8 rounded-full border-2 border-[#1A1A2E] border-t-[#C9A84C] animate-spin" />
        </div>
      }
    >
      <AuthPage />
    </Suspense>
  );
}
