'use server';

import { randomBytes } from 'node:crypto';
import { headers } from 'next/headers';

import { db } from '@/lib/db';
import { sendNewsletterDoi } from '@/lib/email/send-newsletter-doi';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { absoluteUrl } from '@/lib/utils';
import { newsletterSubscribeSchema } from '@/lib/validators/newsletter';

export type NewsletterActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const TOKEN_TTL_HOURS = 48;

function newToken() {
  return randomBytes(24).toString('base64url');
}

async function clientMeta() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  return { ip, userAgent: h.get('user-agent') ?? null };
}

const GENERIC_OK_MESSAGE =
  'Wenn die E-Mail noch nicht eingetragen ist, schicken wir gleich eine Bestätigung. Bitte prüfe dein Postfach.';

export async function subscribeNewsletterAction(
  _prev: NewsletterActionResult | undefined,
  formData: FormData,
): Promise<NewsletterActionResult> {
  const parsed = newsletterSubscribeSchema.safeParse({
    email: formData.get('email'),
    acceptPrivacy: formData.get('acceptPrivacy') === 'on',
    website: formData.get('website'),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Bitte prüfe deine Eingaben.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Honeypot triggered → silent OK (Bots dürfen denken, sie wären erfolgreich).
  if (parsed.data.website && parsed.data.website.length > 0) {
    return { ok: true, message: GENERIC_OK_MESSAGE };
  }

  const meta = await clientMeta();
  const rate = checkRateLimit(`newsletter:${meta.ip}`, RATE_LIMITS.newsletter);
  if (!rate.success) {
    return {
      ok: false,
      message: 'Zu viele Versuche von dieser IP. Bitte später erneut versuchen.',
    };
  }

  const email = parsed.data.email;

  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });

  if (existing && existing.status === 'CONFIRMED') {
    return { ok: true, message: GENERIC_OK_MESSAGE };
  }

  const confirmToken = newToken();
  const unsubscribeToken = existing?.unsubscribeToken ?? newToken();
  const confirmTokenExp = new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000);

  await db.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      status: 'PENDING_CONFIRMATION',
      confirmToken,
      confirmTokenExp,
      unsubscribeToken,
      consentIp: meta.ip,
      consentUserAgent: meta.userAgent,
      consentAt: new Date(),
    },
    update: {
      status: existing?.status === 'UNSUBSCRIBED' ? 'PENDING_CONFIRMATION' : existing?.status,
      confirmToken,
      confirmTokenExp,
      consentIp: meta.ip,
      consentUserAgent: meta.userAgent,
      consentAt: new Date(),
    },
  });

  try {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Häkelwelt';
    await sendNewsletterDoi(email, {
      confirmUrl: absoluteUrl(`/newsletter/bestaetigen?token=${confirmToken}`),
      siteName,
    });
  } catch (e) {
    console.error('Newsletter DOI mail failed', e);
    // Generische Antwort, keine Detail-Preisgabe (kein Enumeration-Hint).
  }

  return { ok: true, message: GENERIC_OK_MESSAGE };
}

export async function confirmNewsletterByToken(
  token: string,
): Promise<{ ok: true; alreadyConfirmed: boolean } | { ok: false; reason: 'unknown' | 'expired' }> {
  const sub = await db.newsletterSubscriber.findUnique({ where: { confirmToken: token } });
  if (!sub) return { ok: false, reason: 'unknown' };
  if (sub.status === 'CONFIRMED') return { ok: true, alreadyConfirmed: true };
  if (sub.confirmTokenExp < new Date()) return { ok: false, reason: 'expired' };

  await db.newsletterSubscriber.update({
    where: { id: sub.id },
    data: { status: 'CONFIRMED', confirmedAt: new Date() },
  });
  return { ok: true, alreadyConfirmed: false };
}

export async function unsubscribeNewsletterByToken(
  token: string,
): Promise<{ ok: true } | { ok: false }> {
  const sub = await db.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!sub) return { ok: false };
  await db.newsletterSubscriber.update({
    where: { id: sub.id },
    data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
  });
  return { ok: true };
}
