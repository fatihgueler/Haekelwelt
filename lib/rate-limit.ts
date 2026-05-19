// Minimaler In-Memory-Rate-Limiter für Phase 1 (single-instance Dev/SSR).
// Wird in Phase 2 durch @upstash/ratelimit ersetzt – dann werkstückgleich
// mehrere Instanzen + Persistenz. Die exportierte API bleibt stabil.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export type RateLimitConfig = {
  /** Anzahl erlaubter Requests im Fenster. */
  limit: number;
  /** Fenstergröße in Sekunden. */
  windowSec: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: Date;
};

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSec * 1000;
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: config.limit - 1, resetAt: new Date(now + windowMs) };
  }

  if (existing.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: new Date(existing.resetAt) };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: config.limit - existing.count,
    resetAt: new Date(existing.resetAt),
  };
}

// Vorkonfigurierte Limits für die Stellen, an denen sie laut Briefing zwingend
// sind: Login, Register, Password-Reset (Phase 2), Newsletter (Phase 2),
// Kontaktformular (Phase 2).
export const RATE_LIMITS = {
  login: { limit: 5, windowSec: 60 } satisfies RateLimitConfig,
  register: { limit: 5, windowSec: 600 } satisfies RateLimitConfig,
  passwordReset: { limit: 3, windowSec: 900 } satisfies RateLimitConfig,
  contact: { limit: 3, windowSec: 900 } satisfies RateLimitConfig,
  newsletter: { limit: 3, windowSec: 3600 } satisfies RateLimitConfig,
};
