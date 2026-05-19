'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

import { signIn, signOut } from '@/auth';
import { db } from '@/lib/db';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { loginSchema, registerSchema } from '@/lib/validators/auth';

export type AuthState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const GENERIC_LOGIN_ERROR = 'E-Mail oder Passwort ist falsch.';

async function clientKey(prefix: string) {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  return `${prefix}:${ip}`;
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const rate = checkRateLimit(await clientKey('login'), RATE_LIMITS.login);
  if (!rate.success) {
    return { ok: false, message: 'Zu viele Versuche. Bitte später erneut versuchen.' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }

  redirect('/konto');
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const rate = checkRateLimit(await clientKey('register'), RATE_LIMITS.register);
  if (!rate.success) {
    return { ok: false, message: 'Zu viele Versuche. Bitte später erneut versuchen.' };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  // Generische Antwort, um User-Enumeration zu erschweren.
  if (existing) {
    return {
      ok: true,
      message:
        'Falls die E-Mail noch nicht registriert war, kannst du dich jetzt einloggen. Bei Problemen prüfe bitte dein Postfach.',
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    },
  });

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { ok: true, message: 'Konto angelegt. Bitte einloggen.' };
  }

  redirect('/konto');
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}
