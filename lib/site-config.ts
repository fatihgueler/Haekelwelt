/**
 * Zentrale Shop-Angaben. Werte in {{…}} sind Platzhalter und müssen durch
 * echte Daten ersetzt werden (siehe Abschlussbericht / docs/design-konzept.md).
 * Links werden erst angezeigt, wenn der Platzhalter ersetzt wurde.
 */
export const SITE = {
  name: 'Häkelwelt',
  ownerName: '{{INHABERIN_NAME}}',
  workshopCity: '{{WERKSTATT_ORT}}',
  email: 'kontakt@haekelwelt.de',
  phone: '{{TELEFON}}',
  instagramUrl: '{{INSTAGRAM_URL}}',
  pinterestUrl: '{{PINTEREST_URL}}',
  workshopPhoto: '{{WERKSTATT_FOTO}}',
  responseTime: '1–2 Werktagen',
} as const;

export function isPlaceholder(value: string) {
  return value.startsWith('{{') && value.endsWith('}}');
}
