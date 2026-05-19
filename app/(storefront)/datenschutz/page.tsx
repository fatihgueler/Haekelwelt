import type { Metadata } from 'next';
import { LegalReviewNote, LegalShell } from '@/components/legal/legal-shell';

export const metadata: Metadata = { title: 'Datenschutz' };

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutzerklärung" updated="19. Mai 2026">
      <LegalReviewNote />

      <h2>1. Verantwortliche Stelle</h2>
      <p>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist der oder die im{' '}
        <a href="/impressum">Impressum</a> genannte Anbieter:in.
      </p>

      <h2>2. Verarbeitung beim Besuch der Website</h2>
      <p>
        Beim Aufruf der Seiten werden technisch erforderliche Daten verarbeitet (IP-Adresse,
        Zeitstempel, Browser-Typ, aufgerufene URL). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an Betrieb und Sicherheit). Die Daten werden nach 14 Tagen gelöscht.
      </p>

      <h2>3. Bestellungen und Kundenkonto</h2>
      <p>
        Für Bestellungen verarbeiten wir Name, Anschrift, E-Mail, Bestellpositionen und
        Zahlungsdaten auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Aufbewahrungspflichten nach
        HGB/AO bleiben unberührt.
      </p>

      <h2>4. Zahlungsabwicklung (Stripe)</h2>
      <p>
        Zahlungen werden über die Stripe Payments Europe Ltd., Irland, abgewickelt. Bei der
        Bezahlung werden die zur Zahlungsabwicklung notwendigen Daten direkt an Stripe übermittelt.
        Stripe ist eigenständig Verantwortlicher; Details unter{' '}
        <a href="https://stripe.com/de/privacy" target="_blank" rel="noreferrer">
          stripe.com/de/privacy
        </a>
        .
      </p>

      <h2>5. Versand transaktionaler E-Mails (Resend)</h2>
      <p>
        Für Bestellbestätigungen und Service-Mails nutzen wir Resend (Resend, Inc., USA). Wir haben
        einen Auftragsverarbeitungsvertrag abgeschlossen und stützen die Übermittlung auf die
        EU-Standardvertragsklauseln.
      </p>

      <h2>6. Hosting (Vercel, Neon)</h2>
      <p>
        Die Website wird bei Vercel (Vercel Inc., USA) gehostet. Die Datenbank läuft bei Neon (Neon
        Inc., USA) in einer Region innerhalb der EU. Auftragsverarbeitungsverträge liegen vor.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Wir setzen ausschließlich technisch notwendige Cookies (Warenkorb, Session,
        Sicherheits-Token). Analyse- oder Marketing-Cookies werden nur nach ausdrücklicher
        Einwilligung über unser Consent-Banner geladen.
      </p>

      <h2>8. Deine Rechte</h2>
      <p>
        Du hast jederzeit das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art.
        17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) sowie auf Widerspruch (Art. 21
        DSGVO). Außerdem kannst du dich bei einer Aufsichtsbehörde beschweren.
      </p>

      <h2>9. Kontakt</h2>
      <p>Anfragen zum Datenschutz bitte an: kontakt@haekelwelt.de</p>
    </LegalShell>
  );
}
