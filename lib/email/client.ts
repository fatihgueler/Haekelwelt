import { Resend } from 'resend';

let cached: Resend | null = null;

export function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY ist nicht gesetzt. Siehe .env.example.');
  }
  cached = new Resend(key);
  return cached;
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? 'Häkelwelt <bestellungen@haekelwelt.de>';
}

export function emailReplyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO || undefined;
}
