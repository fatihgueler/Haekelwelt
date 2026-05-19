import type { Metadata } from 'next';
import { LegalReviewNote, LegalShell } from '@/components/legal/legal-shell';

export const metadata: Metadata = { title: 'AGB' };

export default function AgbPage() {
  return (
    <LegalShell title="Allgemeine Geschäftsbedingungen" updated="19. Mai 2026">
      <LegalReviewNote />

      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über den
        Online-Shop Häkelwelt, betrieben durch die im Impressum genannte Anbieter:in
        („Verkäufer:in"), gegenüber Verbrauchern und Unternehmern im Sinne von §§ 13, 14 BGB.
      </p>

      <h2>§ 2 Vertragsschluss</h2>
      <p>
        Die Darstellung der Produkte im Shop stellt kein bindendes Angebot dar. Mit dem Klick auf
        „Kostenpflichtig bestellen" gibst du ein verbindliches Angebot ab. Die Bestellbestätigung
        per E-Mail stellt die Annahme dar.
      </p>

      <h2>§ 3 Preise und Versandkosten</h2>
      <p>
        Alle Preise verstehen sich inkl. der gesetzlichen deutschen Umsatzsteuer. Versandkosten
        werden im Checkout ausgewiesen: 4,90 € pauschal innerhalb Deutschlands (gratis ab einem
        Bestellwert von 50 €), 9,90 € pauschal in andere EU-Länder (gratis ab 80 €).
      </p>

      <h2>§ 4 Zahlung</h2>
      <p>
        Die Zahlung erfolgt über den Zahlungsdienstleister Stripe mit den dort jeweils angebotenen
        Methoden (u. a. Kreditkarte, SEPA, Sofortüberweisung). Die Belastung erfolgt mit Abschluss
        der Bestellung.
      </p>

      <h2>§ 5 Lieferung</h2>
      <p>
        Die Lieferung erfolgt innerhalb von 2–4 Werktagen innerhalb Deutschlands, 4–8 Werktagen
        innerhalb der EU. Bei Lagerbestand „0" ist eine Bestellung nicht möglich.
      </p>

      <h2>§ 6 Eigentumsvorbehalt</h2>
      <p>Bis zur vollständigen Bezahlung bleibt die Ware unser Eigentum.</p>

      <h2>§ 7 Widerrufsrecht</h2>
      <p>
        Verbraucher haben ein 14-tägiges Widerrufsrecht nach Maßgabe unserer{' '}
        <a href="/widerruf">Widerrufsbelehrung</a>.
      </p>

      <h2>§ 8 Gewährleistung</h2>
      <p>
        Es gelten die gesetzlichen Gewährleistungsregelungen. Bei handgefertigten Unikaten sind
        kleinere Unterschiede zum Produktbild material- und fertigungsbedingt möglich und stellen
        keinen Mangel dar.
      </p>

      <h2>§ 9 Anwendbares Recht / Gerichtsstand</h2>
      <p>
        Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Bei Verträgen mit Verbrauchern
        gilt diese Rechtswahl nur, soweit dem Verbraucher nicht der Schutz zwingender Vorschriften
        des Rechts seines gewöhnlichen Aufenthaltsstaats entzogen wird.
      </p>
    </LegalShell>
  );
}
