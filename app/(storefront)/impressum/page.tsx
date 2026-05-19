import type { Metadata } from 'next';
import { LegalReviewNote, LegalShell } from '@/components/legal/legal-shell';

export const metadata: Metadata = { title: 'Impressum' };

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum" updated="19. Mai 2026">
      <LegalReviewNote />

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        [Vorname Nachname]
        <br />
        [Straße Hausnr.]
        <br />
        [PLZ] [Ort]
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: [+49 …]
        <br />
        E-Mail: kontakt@haekelwelt.de
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        <br />
        [USt-IdNr. eintragen, z. B. DE000000000]
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>[Vorname Nachname], Anschrift wie oben.</p>

      <h2>EU-Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
          https://ec.europa.eu/consumers/odr/
        </a>
        . Unsere E-Mail-Adresse findest du oben.
      </p>

      <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalShell>
  );
}
