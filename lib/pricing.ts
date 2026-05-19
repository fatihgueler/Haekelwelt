import type { TaxRate } from '@prisma/client';

export const TAX_RATE_PERCENT: Record<TaxRate, number> = {
  STANDARD: 19,
  REDUCED: 7,
};

export const EU_COUNTRIES = new Set([
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
]);

export const SHIPPING_DE_CENTS = 490;
export const SHIPPING_DE_FREE_FROM_CENTS = 5000;
export const SHIPPING_EU_CENTS = 990;
export const SHIPPING_EU_FREE_FROM_CENTS = 8000;

export function isSupportedCountry(country: string) {
  return EU_COUNTRIES.has(country.toUpperCase());
}

export function calculateShippingCents(countryCode: string, subtotalCents: number) {
  const cc = countryCode.toUpperCase();
  if (!EU_COUNTRIES.has(cc)) {
    throw new Error(`Versand nach "${countryCode}" wird derzeit nicht angeboten.`);
  }
  if (cc === 'DE') {
    return subtotalCents >= SHIPPING_DE_FREE_FROM_CENTS ? 0 : SHIPPING_DE_CENTS;
  }
  return subtotalCents >= SHIPPING_EU_FREE_FROM_CENTS ? 0 : SHIPPING_EU_CENTS;
}

/**
 * Brutto-Preise (Endkunden-Preise inkl. MwSt) sind die Quelle der Wahrheit
 * im Shop. MwSt wird aus dem Brutto rückgerechnet ("inkl. MwSt"-Logik).
 *
 *   tax = brutto - (brutto / (1 + rate/100))
 *
 * Rundung pro Position auf Cent (Bankers nicht nötig, Standard-Rundung reicht
 * laut §14 Abs. 4 UStG bei kaufmännischer Rundung).
 */
function lineTaxFromGrossCents(grossCents: number, taxRate: TaxRate) {
  const rate = TAX_RATE_PERCENT[taxRate];
  const net = Math.round((grossCents * 100) / (100 + rate));
  return grossCents - net;
}

export type CartLineForPricing = {
  priceCents: number;
  quantity: number;
  taxRate: TaxRate;
};

export type PricingBreakdown = {
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingMissingCents: number | null;
};

export function priceCart(
  lines: CartLineForPricing[],
  options: { countryCode?: string } = {},
): PricingBreakdown {
  let subtotalCents = 0;
  let taxCents = 0;

  for (const line of lines) {
    const lineGross = line.priceCents * line.quantity;
    subtotalCents += lineGross;
    taxCents += lineTaxFromGrossCents(lineGross, line.taxRate);
  }

  const country = options.countryCode?.toUpperCase() ?? 'DE';
  let shippingCents = 0;
  let freeShippingMissingCents: number | null = null;

  if (subtotalCents > 0) {
    if (EU_COUNTRIES.has(country)) {
      shippingCents = calculateShippingCents(country, subtotalCents);
    } else {
      // Außerhalb der EU: Versand erst auf Checkout-Page geblockt;
      // hier dennoch Brutto-Anzeige mit höchstem EU-Tarif.
      shippingCents = SHIPPING_EU_CENTS;
    }
    const threshold = country === 'DE' ? SHIPPING_DE_FREE_FROM_CENTS : SHIPPING_EU_FREE_FROM_CENTS;
    if (shippingCents > 0 && subtotalCents < threshold) {
      freeShippingMissingCents = threshold - subtotalCents;
    }
  }

  return {
    subtotalCents,
    taxCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShippingMissingCents,
  };
}

export function priceLineTax(grossCents: number, taxRate: TaxRate) {
  return lineTaxFromGrossCents(grossCents, taxRate);
}
