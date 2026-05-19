import { z } from 'zod';

const optionalNonEmpty = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal('').transform(() => undefined));

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 chars (openssl rand -base64 32)'),
  NEXTAUTH_URL: z.string().url(),

  AUTH_GOOGLE_ID: optionalNonEmpty,
  AUTH_GOOGLE_SECRET: optionalNonEmpty,

  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.string().min(1),
  EMAIL_REPLY_TO: z.string().email().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default('Häkelwelt'),
});

function format(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
}

function loadServer() {
  if (typeof window !== 'undefined') {
    throw new Error('Server env accessed in the browser');
  }
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server env variables. Copy .env.example to .env and fill them.\n${format(
        parsed.error,
      )}`,
    );
  }
  return parsed.data;
}

function loadClient() {
  const raw = {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  };
  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid public env variables:\n${format(parsed.error)}`);
  }
  return parsed.data;
}

export const serverEnv = typeof window === 'undefined' ? loadServer() : (undefined as never);
export const publicEnv = loadClient();

export const isGoogleAuthEnabled = () =>
  typeof window === 'undefined' &&
  Boolean(serverEnv.AUTH_GOOGLE_ID && serverEnv.AUTH_GOOGLE_SECRET);
