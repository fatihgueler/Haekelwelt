# Häkelwelt – Abschlussbericht Redesign

> Stand: 26.09.2026 · Branch `claude/pensive-shannon-15c9xh`
> Grundlage: `docs/design-konzept.md` (Phase 0). Alle Entscheidungen aus Abschnitt 11 wurden
> mit den dort empfohlenen Optionen umgesetzt (Freigabe: „zieh alles durch alle Phasen“).

## 1. Commits

| Commit     | Phase | Inhalt                                                                                        |
| ---------- | ----- | --------------------------------------------------------------------------------------------- |
| `0707fec`  | 0     | Design-Konzept und Befund-Analyse                                                             |
| `d976aba`  | 1     | Mobiles Menü, Kategorie-Fallback, Site-URL, Redirects, Empty States, H-Hierarchie, Korb-Fokus |
| `09305be`  | 2     | Idempotenter Seed, 24 SVG-Illustrationen, Hero-Komposition, Fix `db:fts:init`                 |
| `ec10870`  | 3     | Design-System: Wollfarben-Tokens (Light/Dark), Button/Badge/Card-Varianten                    |
| `bb48439`  | 4     | Seiten-Redesign aller Seiten, Mikro-Animationen                                               |
| _(dieser)_ | 5     | Verifikation: Kontrast- und Link-Skripte, Lighthouse-Fixes, Tailwind-Content-Fix, Bericht     |

## 2. Vorher / Nachher je Befund

| #   | Befund                                   | Vorher                                                  | Nachher                                                                                                                                                                                                           | Status                 |
| --- | ---------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Keine Produkte/Kategorien, leere Flächen | leere DB, Sektionen ohne Inhalt                         | Idempotentes Demo-Seed (4 Kategorien, 12 Produkte). Ohne Daten: Kategorien kommen aus der Fallback-Konfiguration, Neuheiten zeigen einen freundlichen Empty State. **Prod-DB ist weiterhin leer (siehe To-dos).** | ✅ Code / ⏳ Prod-Seed |
| 2   | `/kategorie/*` → 404                     | `notFound()` bei leerer DB                              | 200 für die 4 Kern-Slugs (auch ohne DB-Eintrag, dann mit Empty State). Unbekannte Slugs bleiben 404.                                                                                                              | ✅                     |
| 3   | Mobiles Menü tot                         | nackter Button ohne Handler                             | shadcn-Sheet: Fokus-Trap, Esc, `aria-expanded`/`aria-controls`, Suche, Kategorien, Service, Konto (per Playwright geprüft)                                                                                        | ✅                     |
| 4   | Hero grau, 0 × `<img>`                   | `bg-muted`-Platzhalter                                  | Inline-SVG-Komposition (Knäuel, Häkelnadel, Hase, Wal) + 24 eigene Produkt-SVGs                                                                                                                                   | ✅                     |
| 5   | Sitemap mit `localhost`                  | Build-Zeit-Fallback                                     | `lib/site-url.ts` (SITE_URL → NEXT_PUBLIC_SITE_URL → RAILWAY_PUBLIC_DOMAIN → AUTH_URL/NEXTAUTH_URL), Sitemap/robots zur Laufzeit. Behebt auch Stripe-Rücksprung- und Newsletter-Links                             | ✅                     |
| 6   | Rechtstexte = Stubs                      | Vorlagen                                                | Nur Layout/Typo neu (`.legal-content`), **Inhalt unverändert**                                                                                                                                                    | ⏳ begründet offen     |
| 7   | Kontrast 2,77 / 2,72:1                   | Rosé L65 %                                              | Primary Himbeere-700 **7,09:1** (Dark 7,89:1). `npm run check:contrast`: 96 Paare, 0 Fehler                                                                                                                       | ✅                     |
| 8   | Desktop-Nav nur „Shop“                   | DB-abhängig, kein „Über uns“                            | Shop · 4 Kategorien mit Farbpunkt · Über uns (md–xl als Dropdown)                                                                                                                                                 | ✅                     |
| 9   | `/registrieren`, `/kasse` 404            | fehlende Aliasse, toter Link `/konto/adressen`          | 308-Redirects auf `/register` bzw. `/checkout`, toter Link entfernt. `npm run check:links`: 23 Links, 0 Fehler                                                                                                    | ✅                     |
| 10  | Dauer-Ring am Korb-Icon                  | Radix gibt Fokus nach Link-Navigation an Trigger zurück | `onCloseAutoFocus` unterdrückt die Rückgabe bei Navigation (Esc behält sie). Drawer schließt bei Routenwechsel                                                                                                    | ✅                     |
| 11  | H1 → H3                                  | Feature-Cards/Footer/Filter als h3                      | Durchgängige Hierarchie (H1 → H2 → H3), Footer-Titel h2, versteckte Sektions-h2 wo nötig                                                                                                                          | ✅                     |
| 12  | Kaum Bewegung                            | 1 Animation                                             | Scroll-Reveal, wippende/rollende Knäuel, Karten-Wackeln, Herz-Pop, Knäuel-Flug in den Korb + Bounce, Menü-Staffelung, 404-Pendel – nur `transform`/`opacity`, `prefers-reduced-motion` respektiert                | ✅                     |
| Z1  | Suche → HTTP 500                         | FTS-Spalte fehlt; `db:fts:init` führte 0 Statements aus | Skript repariert (Kommentar-Filter), ILIKE-Fallback statt 500                                                                                                                                                     | ✅ Code / ⏳ Prod-Init |

## 3. Verifikation (Phase 5)

- `npm run build` ✅ · `npm run lint` ✅ (0 Warnungen) · `tsc --noEmit` ✅
- **Kontrast** (`npm run check:contrast`): 96 Token-Paare (Light + Dark), 0 Fehler
- **Links** (`BASE_URL=… npm run check:links`): 23 Header/Footer/Menü-Links → 200 bzw. gewollter Redirect (`/konto`, `/konto/wunschliste`, `/admin` → `/login`; `/checkout` → `/warenkorb` bei leerem Korb)
- **Lighthouse mobil** (lokaler Prod-Build):

  | Seite                            | Performance | Accessibility | Best Practices | SEO                      |
  | -------------------------------- | ----------- | ------------- | -------------- | ------------------------ |
  | `/`                              | 90          | 100           | 100            | 100                      |
  | `/produkte`                      | 89          | 100           | 100            | 100                      |
  | `/produkte/kuschelhase-luna`     | 87          | 100           | 100            | 100                      |
  | `/kategorie/…`                   | 88–89       | 100           | 100            | 100                      |
  | `/ueber-uns`, `/kontakt`, `/faq` | 88–91       | 100           | 100            | 100                      |
  | `/warenkorb`, `/login`           | 89–92       | 100           | 96–100         | 63 (gewolltes `noindex`) |

- **Tastatur**: Skip-Link, Tab-Reihenfolge Header, Mobile-Menü, Warenkorb-Drawer, Kategorien-Dropdown, Filter-Sheet (Fokus-Trap, Esc, Fokus-Rückgabe); Login-/Kontaktformular mit `aria-describedby` + `role="alert"`
- **Layout**: kein horizontales Scrollen bei 375 / 768 / 1440 px auf allen Kernseiten; Light und Dark Mode gesichtet

### Design-Critique Soll-Zustand (Kurzfassung)

Hohe Priorität – behoben in Phase 5:

1. Kategorie-Farbpunkte und Picot-Kanten fehlten (Tailwind scannte `lib/` nicht) → Content-Pfad ergänzt
2. LCP durch Scroll-Reveal im Hero verzögert (Performance 82) → Hero ohne Reveal (jetzt 88–90)
3. Link im Fließtext ohne Unterstreichung (Bewertungen) → unterstrichen
4. Toasts verdeckten den Kasse-Button im Drawer → oben mittig, im Theme

Mittel/niedrig – bewusst offen:

- Sticky „In den Warenkorb“ auf Mobil-PDP wäre ein Plus (neues Feature, nicht im Plan)
- Foto-Platzhalter in Werkstatt-Teaser und Über uns bis echte Fotos vorliegen
- Demo-Produktbilder sind Illustrationen; für Conversion echte Produktfotos nötig
- `/checkout` bleibt Gast-fähig (kein Login-Zwang)

## 4. Offene Platzhalter `{{…}}`

Zentral in `lib/site-config.ts` – einmal ersetzen, dann überall aktiv:

| Platzhalter                              | Wo sichtbar                                      |
| ---------------------------------------- | ------------------------------------------------ |
| `{{INHABERIN_NAME}}`                     | Werkstatt-Teaser (Signatur) auf der Startseite   |
| `{{WERKSTATT_ORT}}`                      | Startseite, Kontakt                              |
| `{{WERKSTATT_FOTO}}`                     | Startseite, Über uns (Foto-Platzhalter)          |
| `{{INSTAGRAM_URL}}`, `{{PINTEREST_URL}}` | Footer – Links erscheinen erst nach dem Ersetzen |
| `{{TELEFON}}`                            | noch nicht angezeigt (für spätere Nutzung)       |
| E-Mail                                   | `kontakt@haekelwelt.de` – bitte bestätigen       |

## 5. Env-Variablen für Railway

| Variable                      | Wert / Hinweis                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `SITE_URL` _(neu, empfohlen)_ | `https://haekelwelt-production.up.railway.app` bzw. spätere Domain – wird zur Laufzeit gelesen |
| `NEXT_PUBLIC_SITE_URL`        | dieselbe URL (wird beim Build eingebettet → nach Änderung neu deployen)                        |
| `NEXTAUTH_URL`                | dieselbe URL                                                                                   |
| `RAILWAY_PUBLIC_DOMAIN`       | setzt Railway automatisch – dient als Fallback                                                 |
| übrige                        | unverändert laut `.env.example` (DB, Auth, Stripe, Resend)                                     |

## 6. To-dos für dich

1. **Produktions-DB befüllen** – ich habe nichts gegen Produktion ausgeführt. Optionen:
   echte Produkte über den geplanten Admin-Bereich anlegen **oder** einmalig die Kategorien
   anlegen. `prisma/seed.ts` verweigert bewusst `NODE_ENV=production` (es legt auch
   Test-Accounts an) – für Prod bitte nicht einfach umgehen.
2. **Volltextsuche auf Prod aktivieren**: `DATABASE_URL=<prod> npm run db:fts:init`
   (jetzt repariert, idempotent). Bis dahin greift der ILIKE-Fallback.
3. **Echte Produktfotos** statt der SVG-Illustrationen hochladen (4:5, ≥ 1200 px); danach
   können die Unsplash/Pexels-`remotePatterns` in `next.config.mjs` entfallen.
4. **Anwaltliche Prüfung der Rechtstexte**: Impressum, Datenschutz, AGB, Widerruf sind
   weiterhin Vorlagen-Stubs (inhaltlich nicht angefasst).
5. Platzhalter aus Abschnitt 4 in `lib/site-config.ts` ersetzen.
6. Env-Variablen aus Abschnitt 5 in Railway setzen und neu deployen.

## 7. Neue Werkzeuge im Repo

- `npm run check:contrast` – WCAG-Kontraste aller Token-Paare (Light/Dark)
- `npm run check:links` – Header/Footer/Menü-Links gegen einen laufenden Server
- `python3 scripts/generate-demo-art.py` – erzeugt die Demo-Illustrationen neu
- `lib/site-config.ts` – Platzhalter/Shop-Angaben, `lib/category-theme.ts` – Kategorien & Farben
