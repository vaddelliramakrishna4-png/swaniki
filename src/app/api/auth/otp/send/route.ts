import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

import { saveOtp } from '@/lib/otp-store';

export async function POST(req: NextRequest) {
  try {
    const { email, role = 'organizer' } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate a random 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to shared file-backed store (15 minutes expiry)
    saveOtp(normalizedEmail, code, role, 15 * 60 * 1000);

    let sent = false;
    let deliveryMethod = 'none';

    // 1. Try Resend if RESEND_API_KEY is available
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== 'test') {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Vibe by Swaniki <onboarding@resend.dev>',
          to: normalizedEmail,
          subject: `Your Vibe Login Security Code: ${code}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; background: #FAF8F5; padding: 32px; border-radius: 16px; border: 1px solid #E8E4DF;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: #1A1A2E; color: #C9A84C; font-size: 24px; font-weight: bold;">V</div>
                <h1 style="color: #1A1A2E; font-size: 22px; margin-top: 12px; margin-bottom: 4px;">Sign in to Vibe by Swaniki</h1>
                <p style="color: #666; font-size: 13px; margin: 0;">India's Curated Salon & Gathering Platform</p>
              </div>
              <div style="background: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #E8E4DF; text-align: center;">
                <p style="font-size: 14px; color: #333; margin-bottom: 16px;">Use the 6-digit verification code below to complete your sign in:</p>
                <div style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1A1A2E; background: #F4F1EC; padding: 14px 20px; border-radius: 8px; display: inline-block; border: 1px dashed #C9A84C;">
                  ${code}
                </div>
                <p style="font-size: 12px; color: #888; margin-top: 16px; margin-bottom: 0;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
              </div>
            </div>
          `,
        });
        sent = true;
        deliveryMethod = 'resend';
      } catch (err: any) {
        console.warn('[Resend OTP Send Warning]:', err.message);
      }
    }

    // 2. Try Nodemailer if EMAIL_FOR_APP_PASS & MAIL_APP_PASS are configured
    if (!sent && process.env.EMAIL_FOR_APP_PASS && process.env.MAIL_APP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_FOR_APP_PASS,
            pass: process.env.MAIL_APP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Vibe by Swaniki" <${process.env.EMAIL_FOR_APP_PASS}>`,
          to: normalizedEmail,
          subject: `Your Vibe Login Security Code: ${code}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; background: #FAF8F5; padding: 32px; border-radius: 16px; border: 1px solid #E8E4DF;">
              <h2 style="color: #1A1A2E; text-align: center;">Vibe by Swaniki</h2>
              <p style="font-size: 14px; color: #333;">Your single-use sign in verification code is:</p>
              <div style="font-family: monospace; font-size: 30px; font-weight: bold; letter-spacing: 6px; text-align: center; color: #1A1A2E; padding: 12px; background: #FFF; border-radius: 8px; border: 1px solid #E8E4DF;">
                ${code}
              </div>
              <p style="font-size: 12px; color: #777; margin-top: 16px;">This code will expire in 10 minutes.</p>
            </div>
          `,
        });
        sent = true;
        deliveryMethod = 'nodemailer-smtp';
      } catch (err: any) {
        console.warn('[Nodemailer OTP Send Warning]:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      deliveryMethod,
      message: `Verification code dispatched to ${normalizedEmail}`,
    });
  } catch (err: any) {
    console.error('OTP Send Route Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
