import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey && typeof window === 'undefined') {
  // Loadingzeit-Hinweis: env-Fehler erscheinen erst beim ersten Stripe-Aufruf,
  // damit der Build ohne Keys möglich bleibt.
  // Reale Aufrufe (createCheckoutSession, Webhook) prüfen vorher serverEnv.
}

export const stripe = new Stripe(apiKey ?? 'sk_test_placeholder_for_build_only', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  appInfo: {
    name: 'Haekelwelt',
    version: '0.1.0',
  },
});
