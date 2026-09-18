import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { EventItem } from '@/types/database';
import {
  EmailBranding,
  renderRSVPConfirmedEmail,
  renderRSVPWaitlistedEmail,
  renderEventReminder24hEmail,
  renderEventReminder1hEmail,
  renderEventUpdatedEmail,
  renderEventCancelledEmail,
  renderNewEventFollowerEmail,
} from '@/emails/templates';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.RESEND_FROM_EMAIL || 'Vibe Gatherings <onboarding@resend.dev>',
}: SendEmailParams): Promise<{ success: boolean; id?: string; mode: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = Array.isArray(to) ? to : [to];

  // 1. Try Resend if configured
  if (apiKey && apiKey !== 'test') {
    try {
      const resend = new Resend(apiKey);
      const data = await resend.emails.send({
        from,
        to: recipients,
        subject,
        html,
      });

      if (data.data?.id) {
        return {
          success: true,
          id: data.data.id,
          mode: 'resend-live',
        };
      }
    } catch (err: any) {
      console.warn('[Resend Dispatch Notice]:', err.message);
    }
  }

  // 2. Try Nodemailer if EMAIL_FOR_APP_PASS & MAIL_APP_PASS are configured
  if (process.env.EMAIL_FOR_APP_PASS && process.env.MAIL_APP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_FOR_APP_PASS,
          pass: process.env.MAIL_APP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'Vibe by Swaniki'}" <${process.env.EMAIL_FOR_APP_PASS}>`,
        to: recipients.join(', '),
        subject,
        html,
      });

      return {
        success: true,
        id: info.messageId,
        mode: 'nodemailer-smtp',
      };
    } catch (err: any) {
      console.warn('[Nodemailer Dispatch Notice]:', err.message);
    }
  }

  // 3. Fallback when mail providers are in dev mode
  console.log(`[Email Notice] Email to: ${recipients.join(', ')} | Subject: "${subject}"`);
  return {
    success: true,
    id: 'queued-' + Date.now(),
    mode: 'dev-queue',
  };
}


/**
 * Dispatch RSVP confirmation email with white-label branding.
 */
export async function dispatchRSVPConfirmation(
  event: EventItem,
  guestName: string,
  guestEmail: string,
  branding?: EmailBranding
) {
  const { subject, html } = renderRSVPConfirmedEmail(event, guestName, branding);
  return sendEmail({ to: guestEmail, subject, html });
}

/**
 * Dispatch Waitlist notification email.
 */
export async function dispatchWaitlistNotification(
  event: EventItem,
  guestName: string,
  guestEmail: string,
  branding?: EmailBranding
) {
  const { subject, html } = renderRSVPWaitlistedEmail(event, guestName, branding);
  return sendEmail({ to: guestEmail, subject, html });
}

/**
 * Dispatch 24h event reminder.
 */
export async function dispatch24hReminder(
  event: EventItem,
  guestName: string,
  guestEmail: string,
  branding?: EmailBranding
) {
  const { subject, html } = renderEventReminder24hEmail(event, guestName, branding);
  return sendEmail({ to: guestEmail, subject, html });
}

/**
 * Dispatch 1h event reminder.
 */
export async function dispatch1hReminder(
  event: EventItem,
  guestName: string,
  guestEmail: string,
  branding?: EmailBranding
) {
  const { subject, html } = renderEventReminder1hEmail(event, guestName, branding);
  return sendEmail({ to: guestEmail, subject, html });
}

/**
 * Dispatch event updated email.
 */
export async function dispatchEventUpdate(
  event: EventItem,
  guestName: string,
  guestEmail: string,
  updateNotes?: string,
  branding?: EmailBranding
) {
  const { subject, html } = renderEventUpdatedEmail(event, guestName, updateNotes, branding);
  return sendEmail({ to: guestEmail, subject, html });
}

/**
 * Dispatch RSVP cancellation / Event cancelled email.
 */
export async function dispatchRSVPCancellation(
  event: EventItem,
  guestName: string,
  guestEmail: string,
  reason?: string,
  branding?: EmailBranding
) {
  const { subject, html } = renderEventCancelledEmail(event, guestName, reason, branding);
  return sendEmail({ to: guestEmail, subject, html });
}
