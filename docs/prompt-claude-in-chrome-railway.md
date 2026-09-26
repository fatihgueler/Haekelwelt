# Prompt für Claude in Chrome – Railway-Nacharbeiten nach dem Redesign

> Kopiere alles unterhalb der Linie in Claude in Chrome. Vorher bei railway.app einloggen.

---

Du hilfst mir, meinen Online-Shop „Häkelwelt“ auf **Railway** (https://railway.app) nach einem Code-Update fertig einzurichten. Ich bin eingeloggt. Arbeite Schritt für Schritt, beschreibe kurz, was du siehst, und halte dich an die Regeln.

## Regeln (wichtig)

- **Lösche nichts** – keine Services, Variablen, Deployments, Tabellen oder Daten.
- Ändere **nur** die unten genannten Variablen. Stripe-, Resend-, Auth- und Datenbank-Variablen (`DATABASE_URL`, `AUTH_SECRET`, `STRIPE_*`, `RESEND_*`, `EMAIL_*`) **nicht anfassen** und ihre Werte nicht in den Chat schreiben.
- **Frag mich vor jedem SQL-Befehl** gegen die Datenbank und zeig mir den Befehl vorher.
- Wenn etwas anders aussieht als beschrieben (andere Menüs, mehrere Projekte, Fehler), **stopp und frag mich**, statt zu raten.
- Gib keine Passwörter oder Tokens ein, die ich dir nicht nenne.

## Kontext

- GitHub-Repo: `fatihgueler/Haekelwelt`
- Der neue Code liegt auf Branch **`claude/setup-marketplace-project-B7oXh`** (Commit `6b49c86`, „chore(phase-5): Verifikation …“).
- Live-URL bisher: **https://haekelwelt-production.up.railway.app** – falls im Service eine eigene Domain eingetragen ist, nimm stattdessen die (mit `https://`, ohne Slash am Ende).
- Der Shop ist eine Next.js-App; dazu gibt es vermutlich einen Postgres-Service im selben Projekt.

## Schritt 1 – Projekt und Branch prüfen

1. Öffne das Railway-Projekt des Shops (Name enthält vermutlich „haekelwelt“).
2. Öffne den **App-Service** (nicht die Datenbank) → **Settings** → Bereich **Source**.
3. Sag mir, welcher **Branch** dort verbunden ist.
   - Ist es `claude/setup-marketplace-project-B7oXh`: weiter.
   - Ist es ein anderer Branch: **stopp und melde mir den Namen** (ich spule den Branch dann selbst vor). Nicht selbst umstellen.
4. Notiere unter **Settings → Networking / Domains** die öffentliche Domain des Services.

## Schritt 2 – Env-Variablen setzen

Im App-Service → Tab **Variables**. Setze bzw. aktualisiere genau diese drei (Wert = Live-URL aus Schritt 1, z. B. `https://haekelwelt-production.up.railway.app`):

| Variable               | Wert     |
| ---------------------- | -------- |
| `SITE_URL`             | Live-URL |
| `NEXT_PUBLIC_SITE_URL` | Live-URL |
| `NEXTAUTH_URL`         | Live-URL |

- Existiert eine Variable schon mit genau diesem Wert: nicht ändern.
- Existiert sie mit anderem Wert (z. B. `http://localhost:3000`): auf die Live-URL ändern und mir alten und neuen Wert nennen.
- Danach die Änderungen übernehmen (Railway zeigt dafür meist „Deploy“ bzw. „Apply changes“). Das löst einen neuen Deploy aus – das ist gewollt, weil `NEXT_PUBLIC_SITE_URL` beim Build eingebettet wird.

## Schritt 3 – Deploy abwarten

1. Tab **Deployments** öffnen. Warte, bis der neueste Deploy **„Success“/„Active“** ist (Build dauert ein paar Minuten, ggf. Seite neu laden).
2. Prüfe, dass der aktive Deploy den Commit **`6b49c86`** bzw. die Nachricht „chore(phase-5): Verifikation …“ zeigt.
3. Schlägt der Build fehl: öffne die Build-Logs, kopiere mir die **letzten ~40 Zeilen mit der Fehlermeldung** und stopp.

## Schritt 4 – Volltextsuche in der Datenbank aktivieren (erst nach meinem OK)

1. Öffne den **Postgres-Service** → Tab **Data** und suche die Möglichkeit, SQL auszuführen (z. B. „Query“). Gibt es keine SQL-Konsole: stopp und sag es mir.
2. Zeig mir den folgenden Befehl und führe ihn **erst nach meinem OK** aus. Er ist idempotent (mehrfach ausführbar, löscht nichts):

```sql
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('german', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('german', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS "Product_searchVector_idx"
  ON "Product"
  USING GIN ("searchVector");
```

3. Melde mir die Antwort der Datenbank (Erfolg oder Fehlermeldung wörtlich).

## Schritt 5 – Kategorien anlegen (optional, erst nach meinem OK)

Frag mich, ob du die vier Shop-Kategorien anlegen sollst. Nur bei „ja“, und nur diesen Befehl – er legt nichts doppelt an und überschreibt nichts:

```sql
INSERT INTO "Category" ("id", "slug", "name", "description", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('cat_amigurumi', 'amigurumi', 'Amigurumi', 'Kleine gehäkelte Freunde – Tiere und Figuren zum Liebhaben.', 1, now(), now()),
  ('cat_heimdeko', 'heimdeko', 'Heimdeko', 'Decken, Kissen und Körbe, die dein Zuhause gemütlich machen.', 2, now(), now()),
  ('cat_accessoires', 'accessoires', 'Accessoires', 'Mützen, Schals und Taschen aus weichen Naturfasern.', 3, now(), now()),
  ('cat_babys_und_kinder', 'babys-und-kinder', 'Babys & Kinder', 'Sanfte Begleiter und Kuscheliges für die Kleinsten.', 4, now(), now())
ON CONFLICT ("slug") DO NOTHING;
```

Keine Produkte, Nutzer oder Rabattcodes anlegen.

## Schritt 6 – Live-Seite prüfen

Öffne die Live-URL in einem neuen Tab und prüfe. Melde mir je Punkt ✅ oder ❌ mit kurzer Beschreibung:

1. **Startseite** lädt, ist farbig (Himbeer-/Pastelltöne), im Hero eine Illustration mit Wollknäueln, Hase und Wal – **kein grauer Kasten**.
2. **Navigation** (Desktop): Shop · Amigurumi · Heimdeko · Accessoires · Babys & Kinder · Über uns.
3. **`/kategorie/amigurumi`**, **`/kategorie/heimdeko`**, **`/kategorie/accessoires`**, **`/kategorie/babys-und-kinder`**: jeweils eine Seite mit farbigem Kopfbereich (kein 404).
4. **`/produkte?q=hase`**: Seite lädt (kein Fehler 500).
5. **`/sitemap.xml`**: alle `<loc>`-Einträge beginnen mit der Live-URL – **nicht** mit `http://localhost`.
6. **`/robots.txt`**: Zeile `Sitemap:` zeigt auf die Live-URL.
7. **`/registrieren`** leitet auf `/register` weiter, **`/kasse`** auf `/checkout` bzw. `/warenkorb`.
8. **`/eine-seite-die-es-nicht-gibt`**: 404-Seite „Da hat sich eine Masche gelöst.“
9. **Mobil**: Fenster schmal ziehen (ca. 375 px) oder DevTools-Gerätemodus → Menü-Button oben links antippen → Menü öffnet sich mit Kategorien; mit Esc schließt es.
10. **Dark Mode**: Mond-Symbol im Header klicken → Seite wird dunkel und bleibt gut lesbar.

## Abschluss

Gib mir eine kurze Zusammenfassung:

- verbundener Branch und aktiver Commit
- welche Variablen du geändert hast (alt → neu, ohne geheime Werte)
- Ergebnis der SQL-Befehle (falls ausgeführt)
- Ergebnis der 10 Prüfpunkte
- alles, was ungewöhnlich war oder wo du gestoppt hast
