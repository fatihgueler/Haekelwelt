import type { Metadata } from 'next';
import { LegalReviewNote, LegalShell } from '@/components/legal/legal-shell';

export const metadata: Metadata = { title: 'Widerrufsbelehrung' };

export default function WiderrufPage() {
  return (
    <LegalShell title="Widerrufsbelehrung" updated="19. Mai 2026">
      <LegalReviewNote />

      <h2>Widerrufsrecht</h2>
      <p>
        Du hast das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
        Widerrufsfrist beträgt 14 Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der
        nicht der Beförderer ist, die Waren in Besitz genommen hat bzw. hat.
      </p>
      <p>Um dein Widerrufsrecht auszuüben, musst du uns</p>
      <p>
        [Vorname Nachname]
        <br />
        [Straße Hausnr.]
        <br />
        [PLZ] [Ort]
        <br />
        E-Mail: kontakt@haekelwelt.de
      </p>
      <p>
        mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine
        E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten
        haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich
        daraus ergeben, dass du eine andere Art der Lieferung als die von uns angebotene, günstigste
        Standardlieferung gewählt hast), unverzüglich und spätestens binnen 14 Tagen ab dem Tag
        zurückzuzahlen, an dem die Mitteilung über deinen Widerruf dieses Vertrags bei uns
        eingegangen ist.
      </p>
      <p>
        Du hast die Waren unverzüglich und in jedem Fall spätestens binnen 14 Tagen ab dem Tag, an
        dem du uns über den Widerruf dieses Vertrags unterrichtest, an uns zurückzusenden. Du trägst
        die unmittelbaren Kosten der Rücksendung.
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>
        (Wenn du den Vertrag widerrufen willst, kannst du dieses Formular ausfüllen und an uns
        zurücksenden.)
      </p>
      <p>
        An [Vorname Nachname], [Straße Hausnr.], [PLZ] [Ort], kontakt@haekelwelt.de
        <br />
        — Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf
        der folgenden Waren (*):
        <br />
        — Bestellt am (*) / erhalten am (*):
        <br />
        — Name des/der Verbraucher(s):
        <br />
        — Anschrift des/der Verbraucher(s):
        <br />
        — Unterschrift (nur bei Mitteilung auf Papier):
        <br />
        — Datum:
        <br />
        (*) Unzutreffendes streichen.
      </p>
    </LegalShell>
  );
}
