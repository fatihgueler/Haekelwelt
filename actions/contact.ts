'use server';

import { headers } from 'next/headers';

import { db } from '@/lib/db';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { contactSchema } from '@/lib/validators/contact';

export type ContactActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

async function clientMeta() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  return { ip, userAgent: h.get('user-agent') ?? null };
}

export async function submitContactAction(
  _prev: ContactActionResult | undefined,
  formData: FormData,
): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    body: formData.get('body'),
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

  // Honeypot: bei Eingabe so tun, als wäre alles fein.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return { ok: true, message: 'Danke, wir melden uns bald.' };
  }

  const meta = await clientMeta();
  const rate = checkRateLimit(`contact:${meta.ip}`, RATE_LIMITS.contact);
  if (!rate.success) {
    return {
      ok: false,
      message: 'Zu viele Nachrichten von dieser IP. Bitte später erneut versuchen.',
    };
  }

  await db.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      body: parsed.data.body,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });

  return {
    ok: true,
    message: 'Danke für deine Nachricht. Wir antworten in der Regel innerhalb 1–2 Werktagen.',
  };
}
