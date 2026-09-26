# Häkelwelt – Design-Konzept & Befund-Analyse (Phase 0)

> Stand: 26.09.2026 · Status: **Entwurf, wartet auf Freigabe**
> Grundlage: Code-Analyse des Repos (Branch `claude/pensive-shannon-15c9xh`) und
> automatisierter Live-Test von https://haekelwelt-production.up.railway.app
> (Playwright, 375 px und 1440 px, Light Mode).

---

## 0. Kurzfassung

Der Shop ist technisch in einem ordentlichen Zustand (Server Actions, Zod, Security-Header,
Double-Opt-in, Warenkorb in der DB). Er **wirkt** aber leer und blass, und dafür gibt es
drei Hauptursachen:

1. **Die Produktions-DB ist leer.** Es gibt keine Kategorien und keine Produkte, und die
   Seiten fangen diesen Zustand nicht ab. Daraus folgen direkt die Befunde 1, 2, 4 und 8.
2. **Die Farbpalette ist ein einziges, entsättigtes Rosé** (`345 35% 65%`) auf Beige. Als
   Textfarbe fällt es durch AA, und Kategorien, Motive und Illustrationen fehlen völlig.
3. **Einige Stellen sind nie fertig verdrahtet worden:** Der Menü-Button hat keinen Handler,
   die Sitemap hat keine Site-URL, und es fehlen Routen-Aliasse.

Das Konzept bringt eine **Wollfarben-Palette mit 6 Tönen** auf warmem Creme. Jede Kategorie
bekommt eine eigene Farbe, für Text und Buttons nutzen wir nur die dunklen Stufen. Dazu kommt
ein kleines System **handgemachter SVG-Motive** und **sanfte, reduzierbare
CSS-Animationen**. Alle Farbpaare unten sind nachgemessen und erfüllen WCAG AA in Light und
Dark.

---

## 1. Ist-Analyse

### 1.1 Stack & Struktur

| Bereich        | Stand                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework      | Next.js 15 (App Router), React 18, TypeScript                                                                                                                                                    |
| Route-Groups   | `app/(storefront)` (Header/Footer/Cookie-Banner), `app/(auth)` (Login, Register)                                                                                                                 |
| Styling        | Tailwind 3.4, `tailwindcss-animate` **vorhanden**, shadcn/ui (Button, Badge, Card, Sheet, Select, Checkbox, Input, Label, Separator)                                                             |
| Animation-Libs | **kein** `framer-motion`/`motion` → Animationen über CSS-Keyframes plus eine kleine IntersectionObserver-Hilfe und die Web Animations API (native, keine Dependency)                             |
| ORM / DB       | Prisma 5, PostgreSQL. Kein `prisma/migrations`-Ordner (Schema kam vermutlich per `db push`). Volltextsuche über eine separate SQL-Datei (`prisma/sql/01-init-search.sql`, `npm run db:fts:init`) |
| Auth           | NextAuth v5 (Credentials, optional Google), Middleware-Gate für `/konto`, `/admin`                                                                                                               |
| Fonts          | `next/font/google` (self-hosted beim Build → kein CDN-Request zur Laufzeit): Fraunces (opsz), Inter                                                                                              |
| Nebenprojekt   | `dotnet/` – parallele Blazor-App, **nicht** Teil dieses Deployments, wird nicht angefasst                                                                                                        |

### 1.2 Datenmodell (relevant fürs Redesign)

- `Category { slug, name, description, sortOrder }`: Es gibt **kein Farbfeld**. Die
  Kategoriefarbe kommt deshalb aus einer statischen Zuordnung `slug → Farbtoken` im Code
  (`lib/category-theme.ts`). **Das Schema bleibt unverändert.**
- `Product { slug, title, description, priceCents, stock, weightGrams, isActive, … }`: Es gibt
  **keine Felder** für Material, Maße und Pflegehinweis. Im Seed kommen diese Angaben deshalb
  als strukturierter Absatz in `description` (Format `Material: …`, `Maße: …`, `Pflege: …`),
  den die PDP als Liste rendert. Ein eigenes Feld wäre eine Schema-Änderung, die ich ohne dein
  OK nicht anfasse.
- `ProductImage { url, alt, sortOrder, blurDataUrl, width, height }` passt für die
  SVG-Demo-Bilder (`/demo/*.svg`).

### 1.3 Routen-Inventar

| Route                                             | Datei                      | Live-Status                              |
| ------------------------------------------------- | -------------------------- | ---------------------------------------- |
| `/`                                               | `(storefront)/page.tsx`    | 200, aber leere Sektionen                |
| `/produkte`, `/produkte/[slug]`                   | ✓                          | 200 („Keine Treffer“)                    |
| `/produkte?q=…`                                   | ✓                          | **500** (siehe Zusatzbefund Z1)          |
| `/kategorie/[slug]`                               | ✓ (existiert!)             | **404**, weil `notFound()` bei leerer DB |
| `/ueber-uns`, `/kontakt`, `/faq`, `/versand`      | ✓                          | 200                                      |
| `/impressum`, `/datenschutz`, `/agb`, `/widerruf` | ✓                          | 200 (Stubs)                              |
| `/warenkorb`                                      | ✓                          | 200                                      |
| `/checkout`                                       | ✓                          | 307 → `/warenkorb` (leerer Warenkorb)    |
| `/konto`, `/konto/wunschliste`                    | ✓                          | 307 → `/login?next=…`                    |
| `/konto/adressen`                                 | **fehlt**                  | 307 (ohne Login), eingeloggt **404**     |
| `/admin`                                          | **fehlt** (nur Middleware) | 307 → `/login?next=/admin`               |
| `/login`, `/register`                             | `(auth)`                   | 200                                      |
| `/registrieren`, `/kasse`                         | **fehlen**                 | 404                                      |
| `/sitemap.xml`, `/robots.txt`                     | ✓                          | 200, Host `http://localhost:3000`        |

---

## 2. Design-Critique Ist-Zustand

> Hinweis: Der Skill `/design:design-critique` ist in dieser Umgebung **nicht installiert**
> (geprüft über die Skill-Liste). Die Kritik folgt deshalb dessen üblicher Struktur
> (erster Eindruck → Usability → Hierarchie → Konsistenz → Accessibility → Prioritäten) und
> stützt sich auf echte Screenshots der Live-Seite. Die UX-Kriterien stammen aus
> `/ui-ux-pro-max`, die Marken-Kriterien aus `/ckmbrand`. In Phase 5 wiederhole ich sie auf
> dieselbe Weise.

### 2.1 Erster Eindruck (5-Sekunden-Test)

- **1440 px:** Eine große, graue Fläche nimmt 40 % des Heros ein. Der einzige Farbakzent ist
  ein blasses Rosé. Unter dem Hero folgen zwei Überschriften ohne Inhalt. Das wirkt eher wie
  eine Baustelle als wie ein Shop.
- **375 px:** Das Cookie-Banner (fixed, ~150 px) verdeckt den Platzhalter. Danach kommen drei
  gestapelte, fast gleiche Karten und zwei leere Sektionen. Navigation gibt es nur im Footer.
- **Marke:** Die Texte sind warm und in Du-Form (gut!). Visuell kommt davon nichts an: keine
  Wolle, keine Handarbeit, keine Farbe, keine Bewegung.

### 2.2 Screens im Detail

| Screen     | 375 px                                                                                                                   | 1440 px                                                                                                              | Priorität   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| Startseite | Menü tot; grauer Platzhalter; H1 → H3; leere Sektionen „Welten“ und „Frisch eingetroffen“; Banner verdeckt 20 % Viewport | Nav nur „Shop“; Hero-Platzhalter 540 × 650 px grau; keine Bilder (0 × `<img>`); „Alle Produkte“-Link zeigt ins Leere | Hoch        |
| /produkte  | Filter „Kategorien“ ohne Einträge; Preisfilter „0 – 0“; Empty State nur Text                                             | wie mobil; H1 → H3 (Filterüberschriften); Empty State ohne Illustration oder Weg zurück                              | Hoch        |
| /ueber-uns | Textwand, 3 gleich aussehende Icon-Karten; kein Foto, keine Person                                                       | sehr schmal (max-w-3xl) auf großer Fläche; H1 → H3                                                                   | Mittel      |
| /kontakt   | Formular okay; H1 → Footer-H3                                                                                            | viel Leerraum rechts; keine Kontakt-Infos oder Antwortzeit neben dem Formular                                        | Mittel      |
| /warenkorb | Empty State vorhanden (gut), aber ohne Bild und Empfehlungen                                                             | dito                                                                                                                 | Niedrig     |
| /login     | Primary-Button 2,77:1 (AA-Fail); Link „Jetzt registrieren“ 2,72:1; Karte ohne Markenbezug                                | dito; leerer Hintergrund                                                                                             | Hoch (A11y) |

### 2.3 Usability & Interaktion

- **Mobile Navigation fehlt praktisch** (Befund 3). Ohne Scrollen bis zum Footer kommt man
  nicht zu den Kategorien, zu Über uns oder zum Kontakt.
- **Leere Zustände** sind uneinheitlich: Der Warenkorb hat einen guten Empty State, die
  Startseite hat gar keinen, /produkte nur einen Satz.
- **Preisfilter** zeigt bei leerer DB `0` / `0` als Wert statt Platzhaltern.
- **Cookie-Banner** liegt als fixierte Leiste über dem Inhalt. Das ist in Ordnung, weil es
  DSGVO-seitig gewollt ist, auf Mobil aber sehr hoch. Das Banner selbst (inkl. Logik)
  entwerfe ich nicht neu, nur Tokens und Abstände.

### 2.4 Visuelle Hierarchie & Konsistenz

- **Eyebrow-Labels** (Rosé, Uppercase, 14 px) sind zu hell, um Orientierung zu geben.
- Alle Karten haben dieselbe Weiß-auf-Creme-Optik. Ohne Farbcodierung fehlt der Rhythmus.
- Header-Navigation und Footer arbeiten mit **unterschiedlichen Kategorie-Quellen**: Der
  Header lädt dynamisch aus der DB, der Footer ist hart codiert. Ist die DB leer, zeigt der
  Footer Links auf 404-Seiten.
- `LegalShell` nutzt `prose`-Klassen, aber `@tailwindcss/typography` ist nicht installiert. Die
  Klassen bewirken also nichts, die Formatierung kommt nur aus den Arbitrary-Selectors.

### 2.5 Accessibility (gemessen)

| Element                                 | Vorder-/Hintergrund | Kontrast   | Soll  |
| --------------------------------------- | ------------------- | ---------- | ----- |
| Primary-Button-Text                     | #FCFAF8 auf #C58796 | **2,78:1** | 4,5:1 |
| Eyebrow / Link `text-primary` auf Creme | #C58796 auf #FAF8F5 | **2,73:1** | 4,5:1 |
| `muted-foreground` auf `secondary`      | #6E6259 auf #EFEBE5 | 4,46:1     | 4,5:1 |
| Dark: Primary-Button (dunkler Text)     | #231E1A auf #C58796 | 5,71:1 ✓   | 4,5:1 |

Dazu: H-Sprünge (H1 → H3) auf fast allen Seiten, weil Footer-Spaltentitel `h3` sind. Das
Mobile-Menü hat kein `aria-expanded`/`aria-controls`. Die Input-Rahmen haben nur ~1,3:1 zum
Hintergrund (für Formularfelder verlangt WCAG 1.4.11 3:1).

### 2.6 Was gut ist und bleibt

Du-Ansprache und Microcopy-Ansätze („Diese Masche ist verloren gegangen.“), der Warenkorb-Drawer
mit Gratisversand-Hinweis, der Dark-Mode-Toggle, Security-Header, Honeypot, `lang="de"`, die
Meta-Description und die Fraunces/Inter-Kombination. Die Critique ergibt **keinen Grund, die
Fonts zu wechseln**: Fraunces trägt die Handwerk-Wärme sehr gut, Inter bleibt gut lesbar.

---

## 3. Ursachen der Befunde 1–12

| #   | Befund                                     | Ursache (Datei/Mechanismus)                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Lösung (Phase)                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Keine Produkte/Kategorien, leere Sektionen | Die **Produktions-DB ist leer**. `prisma/seed.ts` bricht bei `NODE_ENV=production` bewusst ab, der Blazor-Commit „leere Datenbank“ hat das Muster übernommen. `(storefront)/page.tsx` rendert `categories.map` / `featured.map` ohne Leer-Prüfung, die Section-Rahmen bleiben also stehen.                                                                                                                                                                                                 | P1: Sektionen bekommen Empty States oder werden ausgeblendet. P2: Demo-Seed (lokal).                                                                                                                                                                                           |
| 2   | `/kategorie/*` → 404                       | Die Route **existiert** (`kategorie/[slug]/page.tsx`), aber `loadCategory()` liefert `null` → `notFound()`. Der Footer verlinkt die 4 Slugs hart codiert, die DB kennt sie nicht.                                                                                                                                                                                                                                                                                                          | P1: Die 4 Kern-Kategorien gibt es als Fallback-Konfiguration (`lib/category-theme.ts`). Fehlt der DB-Eintrag, zeigt die Seite 200 mit freundlichem Empty State statt 404. Unbekannte Slugs bleiben 404. P2: Seed legt die Kategorien an.                                       |
| 3   | Mobiles Menü tot                           | `header.tsx`: `<Button … aria-label="Menü">` ist ein **nackter Button in einer Server-Komponente** ohne `onClick`, Sheet oder State. Es gab nie eine Implementierung.                                                                                                                                                                                                                                                                                                                      | P1: Client-Komponente `MobileNav` mit shadcn `Sheet` (Radix Dialog → Fokus-Trap, Esc, Fokus-Rückgabe, `aria-expanded`/`aria-controls` automatisch am Trigger).                                                                                                                 |
| 4   | Hero = grauer Platzhalter, 0 × `<img>`     | Der Hero zeigt `featured[0].images[0]`. Bei leerer DB bleibt nur `aspect-[4/5] bg-muted`. Es gibt kein eigenes Hero-Motiv, und alle Seed-Bilder sind externe Unsplash-URLs.                                                                                                                                                                                                                                                                                                                | P2: Eigene SVG-Hero-Komposition (inline, damit die Knäuel animierbar sind). Demo-Produktbilder als SVG unter `/public/demo/`.                                                                                                                                                  |
| 5   | `sitemap.xml` mit `localhost`              | `app/sitemap.ts` und `app/robots.ts` lesen `NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`. Auf Railway ist die Variable **nicht gesetzt**. Weil `NEXT_PUBLIC_*` zur **Build-Zeit** eingebettet wird und `sitemap.xml`/`robots.txt` laut Build-Output statisch vorgerendert werden (`○`), greift der Fallback.                                                                                                                                                                           | P1: `lib/site-url.ts`: Reihenfolge `NEXT_PUBLIC_SITE_URL` → `SITE_URL` → `https://${RAILWAY_PUBLIC_DOMAIN}` (setzt Railway automatisch) → `NEXTAUTH_URL` → localhost. Sitemap und robots werden `dynamic` (Laufzeit statt Build). Layout-`metadataBase` nutzt dieselbe Quelle. |
| 6   | Rechtstexte sind Stubs                     | `LegalReviewNote` plus Vorlagentexte. Das ist **gewollt** und muss anwaltlich ersetzt werden.                                                                                                                                                                                                                                                                                                                                                                                              | Bleibt **begründet offen**. Nur Layout/Typo (P4); Auflistung im Abschlussbericht.                                                                                                                                                                                              |
| 7   | Kontrast 2,77:1 / 2,72:1                   | `--primary: 345 35% 65%` (L = 65 %) wird zugleich als Buttonfläche **und** als Textfarbe genutzt (Eyebrows, Links, Hover). Helle Pastelltöne erreichen mit hellem Text nie 4,5:1.                                                                                                                                                                                                                                                                                                          | P3: Primary wird zu Himbeere-700 (`340 62% 38%`, 7,09:1). Pastelltöne nur noch als Flächen.                                                                                                                                                                                    |
| 8   | Desktop-Nav nur „Shop“                     | `header.tsx` rendert `categories.slice(0, 3)` aus der DB, die leer ist. Einen Link „Über uns“ gibt es im Code nicht.                                                                                                                                                                                                                                                                                                                                                                       | P1 (funktional) / P4 (Design): Nav = Shop · 4 Kategorien · Über uns, mit Fallback-Konfiguration statt DB-Abhängigkeit.                                                                                                                                                         |
| 9   | `/registrieren`, `/kasse` 404              | Routen heißen `/register` und `/checkout`. Die Sprache ist uneinheitlich (restliche Routen deutsch). Zusätzlich verlinkt `/konto` auf **`/konto/adressen`, das nicht existiert**.                                                                                                                                                                                                                                                                                                          | P1: 308-Redirects `/registrieren → /register` und `/kasse → /checkout` in `next.config.mjs` (`redirects()`; **keine** Änderung an `headers()`/CSP). Link auf `/konto/adressen` entfernen oder auf `/konto` zeigen lassen. Skript prüft alle Header-/Footer-Links.              |
| 10  | Warenkorb-Button mit Dauer-Ring            | Radix `Dialog` gibt beim Schließen den Fokus programmatisch an den Trigger zurück (`onCloseAutoFocus`). Da der Header über Client-Navigationen bestehen bleibt, **behält der Button den Fokus** auch nach „Zum Shop“/„Zur Kasse“ (headless nachgemessen: `document.activeElement === cartButton`). Firefox und Safari werten diesen Fokus als `:focus-visible`, und der globale Ring `*:focus-visible { ring-2 ring-offset-2 }` bleibt stehen. In Chromium headless ist er nicht sichtbar. | P1: `onCloseAutoFocus` → `preventDefault()`, wenn per Link/Navigation geschlossen wird (Tastatur-Esc behält die Fokus-Rückgabe, A11y!). Nur noch eine Fokus-Definition (Button-Variante statt globaler Plus Komponenten-Ring).                                                 |
| 11  | H1 → H3                                    | Feature-Cards nutzen `h3` vor dem ersten `h2`, Footer-Spalten sind `h3`, die Filter auf /produkte sind `h3`, das Cookie-Banner ist `h2` nach dem Footer.                                                                                                                                                                                                                                                                                                                                   | P1: Feature-Sektion bekommt ein (visuell verstecktes oder sichtbares) `h2`. Footer-Spaltentitel werden `h2` (optisch klein), Filterüberschriften `h2` im `aside` mit `aria-label`, Cookie-Titel wird `p` mit `aria-labelledby`.                                                |
| 12  | Kaum Bewegung                              | Es gibt nur `animate-fade-in-up` am Cookie-Banner und Hover-Scale an den Produktbildern. Keine Motive, keine Scroll-Reveals.                                                                                                                                                                                                                                                                                                                                                               | P3/P4: Animationssystem aus Abschnitt 8 (nur `transform`/`opacity`, `prefers-reduced-motion`).                                                                                                                                                                                 |

### 3.1 Zusatzbefunde (außerhalb der 12, beim Test aufgefallen)

| #   | Befund                                                                                                                                                                                                       | Vorschlag                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Z1  | **Suche auf Produktion → HTTP 500** (`/produkte?q=hase`). `searchProducts()` fragt die Spalte `Product."searchVector"` ab, die nur `npm run db:fts:init` anlegt. Auf Prod wurde das offenbar nie ausgeführt. | a) **Produktion (dein OK nötig):** `npm run db:fts:init` einmalig gegen die Prod-DB. b) **Code (klein, in P1):** Fällt die FTS-Query aus, wird auf eine `ILIKE`-Suche über Titel und Beschreibung zurückgefallen. Die Suche geht dann nie mehr mit 500 kaputt. |
| Z2  | `/konto/adressen` verlinkt, aber nicht vorhanden                                                                                                                                                             | Unter Befund 9 behandelt (Link entfernen, keine neue Adressverwaltung → kein neues Feature).                                                                                                                                                                   |
| Z3  | Preisfilter zeigt `0` / `0` bei leerer DB                                                                                                                                                                    | P4: Placeholder statt Value, wenn kein Bereich bekannt ist.                                                                                                                                                                                                    |
| Z4  | `prose`-Klassen ohne Typography-Plugin                                                                                                                                                                       | P4: Legal-Layout per eigener Utility-Klasse `.legal-content` (keine neue Dependency).                                                                                                                                                                          |
| Z5  | Seed nutzt Unsplash-URLs und `next.config` erlaubt `images.unsplash.com`/`pexels`                                                                                                                            | P2: Seed nutzt nur `/demo/*.svg`. Die `remotePatterns` lasse ich stehen (sie betreffen keine Security-Header). Entfernen erst auf dein Wort.                                                                                                                   |
| Z6  | `/checkout` ist **kein** Auth-Gate (Gast-Checkout ist so gebaut; leerer Korb → `/warenkorb`)                                                                                                                 | Bleibt so, wie es ist. Ich erwähne es nur, weil der Auftrag „Auth-Redirect für /checkout“ nennt. Live leitet `/checkout` auf `/warenkorb` um, nicht auf `/login`.                                                                                              |

---

## 4. Markenstimme & Microcopy (`/ckmbrand`)

### 4.1 Persönlichkeit

| Eigenschaft     | Heißt                                                   | So klingen wir                                                      | So nicht                                      |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| **Warm**        | Wir reden wie eine Freundin, die häkelt                 | „Schön, dass du da bist.“                                           | „Herzlich willkommen in unserem Online-Shop.“ |
| **Verspielt**   | Häkel-Wortspiele, sparsam (max. 1 pro Screen)           | „Da hat sich eine Masche gelöst.“                                   | Wortspiel in jeder Überschrift                |
| **Handgemacht** | Konkrete Zahlen und Details statt Superlativen          | „Rund 6 Stunden, 212 Maschen, ein Knopf aus Olivenholz.“            | „Premium-Qualität der Extraklasse“            |
| **Persönlich**  | Ich/wir aus der Werkstatt, Du-Ansprache, keine Floskeln | „Ich packe jedes Paket selbst – mit einer handgeschriebenen Karte.“ | „Unser Team kümmert sich um Ihre Bestellung.“ |
| **Verlässlich** | Bei Geld, Versand und Recht klar und nüchtern           | „Versand in 2–4 Werktagen. Ab 50 € kostenlos.“                      | „Blitzschnell bei dir!!“                      |

**Tonwechsel:** Bei Deko- und Entdecken-Texten darf es verspielt sein. Bei Warenkorb,
Checkout und Formularen wird der Ton klar und beruhigend. Rechtstexte bleiben unverändert.

### 4.2 Microcopy-Leitlinien

- **Buttons = Verb + Objekt**, maximal 3 Wörter: „In den Korb“, „Zur Kasse“, „Merken“,
  „Kollektion entdecken“.
- **Empty States = Gefühl + Grund + Weg:** „Noch ganz leer hier. Dein Korb wartet auf sein
  erstes Lieblingsstück. → Kollektion entdecken“.
- **Fehler = was passiert ist + was jetzt hilft**, ohne Schuld: „Das hat nicht geklappt.
  Bitte versuch es gleich noch einmal.“
- **Erfolg = kurz + herzlich:** „Liegt im Korb ♥“, „Gemerkt!“
- **Unikat-Hinweis:** „Jedes Stück ist ein Unikat – kleine Abweichungen in Farbe und Form
  sind Handarbeit, kein Fehler.“
- **Zahlen:** `29,00 €`, `2–4 Werktage` (Halbgeviertstrich), `ca. 22 cm`.
- **Keine** Ausrufezeichen-Ketten, keine Emojis im UI (Ausnahme: ♥ als Glyphe im Toast).
- Fehlende echte Daten → Platzhalter `{{…}}` (Liste in Abschnitt 11).

### 4.3 Kern-Botschaften

- Tagline (Hero): **„Kleine Schätze, Masche für Masche.“** Die bestehende H1 bleibt als
  Alternative erhalten.
- Wertversprechen: _handgemacht in einer kleinen Werkstatt · Unikate · plastikfrei verpackt
  · Gratisversand ab 50 €_.

---

## 5. Farbsystem (`/ckmdesign` → Primitive → Semantic → Component)

### 5.1 Primitive: Wollfarben (HSL, ohne `hsl()`, wie im Projekt üblich)

Jede Wolle hat **Flächenstufen** (50/100/200), eine **Deko-Stufe** (400, nur für Grafik),
**Tintenstufen** (700/800, für Text und Buttons im Light Mode) und **Dark-Stufen** (300d =
Text/Buttons im Dark Mode, 900d = Flächen im Dark Mode).

| Wolle          | 50          | 100         | 200         | 400 (Deko)  | 700 (Tinte) | 800         | 300d (Dark-Tinte) | 900d (Dark-Fläche) |
| -------------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------------- | ------------------ |
| **Himbeere**   | 340 70% 96% | 340 75% 91% | 340 72% 82% | 340 68% 62% | 340 62% 38% | 340 58% 30% | 340 80% 76%       | 340 35% 17%        |
| hex            | #FCEEF2     | #F9D7E2     | #F2B0C6     | #E05C88     | #9D254D     | #79203E     | #F391B1           | #3B1C26            |
| **Senfgelb**   | 40 85% 94%  | 40 85% 86%  | 40 82% 72%  | 40 78% 52%  | 40 80% 26%  | 40 75% 21%  | 40 85% 66%        | 40 35% 14%         |
| hex            | #FDF4E3     | #FAE5BD     | #F2CB7D     | #E4A425     | #77540D     | #5E430D     | #F2C15F           | #302817            |
| **Mint**       | 162 45% 94% | 162 45% 86% | 162 42% 74% | 162 40% 48% | 162 65% 22% | 162 60% 17% | 162 45% 62%       | 162 30% 13%        |
| hex            | #E9F7F2     | #CBEBE2     | #A1D9C8     | #49AB8E     | #145D47     | #114536     | #72CAB0           | #172B25            |
| **Lavendel**   | 262 60% 96% | 262 60% 91% | 262 55% 82% | 262 45% 64% | 262 40% 42% | 262 40% 33% | 262 70% 80%       | 262 25% 17%        |
| hex            | #F3EFFB     | #E4DAF6     | #CAB8EA     | #987ACD     | #604096     | #4B3276     | #C2A8F0           | #282136            |
| **Pfirsich**   | 18 90% 95%  | 18 90% 89%  | 18 85% 79%  | 18 80% 64%  | 18 70% 33%  | 18 65% 26%  | 18 90% 74%        | 18 35% 15%         |
| hex            | #FEEEE7     | #FCD9CA     | #F7B79C     | #ED865A     | #8F3D19     | #6D3117     | #F8A581           | #342119            |
| **Himmelblau** | 202 70% 95% | 202 70% 89% | 202 65% 78% | 202 60% 56% | 202 70% 29% | 202 65% 23% | 202 75% 70%       | 202 35% 15%        |
| hex            | #E9F5FB     | #CFE8F7     | #A2D1EB     | #4BA1D2     | #16587E     | #154561     | #79C2EC           | #192A34            |

**Neutrale (warmes Creme / warmes Dunkelbraun):**

| Token (primitive)  | Light      | hex     | Dark       | hex     |
| ------------------ | ---------- | ------- | ---------- | ------- |
| creme / nacht-bg   | 38 50% 97% | #FBF8F4 | 24 18% 10% | #1E1915 |
| card               | 38 60% 99% | #FEFDFB | 24 16% 14% | #29231E |
| ink (foreground)   | 20 25% 14% | #2D211B | 36 30% 92% | #F1ECE4 |
| ink-muted          | 22 14% 36% | #69584F | 34 16% 72% | #C3B9AC |
| sand (secondary)   | 36 40% 92% | #F3ECE2 | 24 14% 19% | #372F2A |
| sand-muted         | 36 30% 93% | #F3EEE8 | 24 14% 18% | #342D27 |
| border (dekorativ) | 32 25% 85% | #E2D9CF | 24 12% 24% | #453C36 |
| input-border (UI)  | 26 14% 56% | #9F8D7F | 28 10% 44% | #7B6F65 |
| destructive        | 4 68% 40%  | #AB2A21 | 6 85% 72%  | #F4877B |

### 5.2 Rollen der Farben

| Rolle                             | Farbe                                          |
| --------------------------------- | ---------------------------------------------- |
| **Marke / Primary / CTA / Fokus** | Himbeere                                       |
| **Kategorie Amigurumi**           | Pfirsich                                       |
| **Kategorie Heimdeko**            | Senfgelb                                       |
| **Kategorie Accessoires**         | Lavendel                                       |
| **Kategorie Babys & Kinder**      | Himmelblau                                     |
| **Vertrauen / Erfolg**            | Mint (Gratisversand, „Unikat“, Erfolgs-Toasts) |
| **Accent (shadcn)**               | Lavendel-Fläche (Hover-/Highlight-Flächen)     |

Regel: **Pastell (50–200) nur als Fläche. 400 nur für Illustration und Deko, nie für Text
oder als einzige UI-Grenze. Text und Buttons nutzen 700/800 (Light) bzw. 300d (Dark).**

### 5.3 Semantic Tokens (`globals.css`, shadcn-kompatibel)

| Token                               | Light                      | Dark                        |
| ----------------------------------- | -------------------------- | --------------------------- |
| `--background`                      | 38 50% 97%                 | 24 18% 10%                  |
| `--foreground`                      | 20 25% 14%                 | 36 30% 92%                  |
| `--card` / `--popover`              | 38 60% 99%                 | 24 16% 14%                  |
| `--primary`                         | 340 62% 38% (Himbeere-700) | 340 80% 76% (Himbeere-300d) |
| `--primary-foreground`              | 38 50% 97%                 | 24 18% 10%                  |
| `--primary-soft` _(neu)_            | 340 75% 91%                | 340 35% 17%                 |
| `--secondary`                       | 36 40% 92%                 | 24 14% 19%                  |
| `--secondary-foreground`            | 20 25% 14%                 | 36 30% 92%                  |
| `--muted`                           | 36 30% 93%                 | 24 14% 18%                  |
| `--muted-foreground`                | 22 14% 36%                 | 34 16% 72%                  |
| `--accent`                          | 262 60% 91%                | 262 25% 17%                 |
| `--accent-foreground`               | 262 40% 33%                | 262 70% 80%                 |
| `--success` / `-foreground` _(neu)_ | 162 65% 22% / 38 50% 97%   | 162 45% 62% / 24 18% 10%    |
| `--success-soft` _(neu)_            | 162 45% 86%                | 162 30% 13%                 |
| `--destructive` / `-foreground`     | 4 68% 40% / 38 50% 97%     | 6 85% 72% / 24 18% 10%      |
| `--border`                          | 32 25% 85%                 | 24 12% 24%                  |
| `--input`                           | 26 14% 56%                 | 28 10% 44%                  |
| `--ring`                            | 340 62% 38%                | 340 80% 76%                 |
| `--radius`                          | 1rem _(bisher 0.75rem)_    | –                           |

**Kategorie-Tokens** _(neu, je Kategorie `x ∈ {amigurumi, heimdeko, accessoires, kinder}`)_:

| Token             | Light (Beispiel Amigurumi = Pfirsich) | Dark              |
| ----------------- | ------------------------------------- | ----------------- |
| `--cat-x-surface` | 18 90% 89% (100)                      | 18 35% 15% (900d) |
| `--cat-x-ink`     | 18 65% 26% (800)                      | 18 90% 74% (300d) |
| `--cat-x-deco`    | 18 80% 64% (400)                      | 18 90% 74% (300d) |

Tailwind: `bg-cat-amigurumi-surface`, `text-cat-amigurumi-ink` usw. (in
`tailwind.config.ts`). Die Zuordnung `slug → x` liegt in `lib/category-theme.ts`. Unbekannte
Slugs fallen auf Himbeere zurück.

### 5.4 Component Tokens (Auszug)

| Komponente         | Tokens                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Button `default`   | bg `--primary`, text `--primary-foreground`, hover `--primary/90` + `translateY(-1px)`, active `scale(.97)`, Fokus 2 px `--ring` + 2 px Offset |
| Button `secondary` | bg `--primary-soft`, text `--primary` (Light 6,4:1 auf Sand, 7,6:1 auf Soft)                                                                   |
| Button `outline`   | Rahmen `--input` (3:1), text `--foreground`                                                                                                    |
| Button `cat-*`     | _(neu)_ bg `--cat-x-ink`, text `--background`                                                                                                  |
| Badge              | `default` = `primary-soft`/`primary`; `success` = `success-soft`/`success`; `cat` = `cat-x-surface`/`cat-x-ink`; `outline`                     |
| Card               | `--card`, Radius `1.25rem`, Rahmen `--border`, Schatten `soft`; Variante `tinted` = `cat-x-surface`                                            |
| Input              | Rahmen `--input` (3:1), Fokus-Ring `--ring`                                                                                                    |
| Kategorie-Kachel   | Fläche `cat-x-surface`, Titel `foreground`, Link-Text `cat-x-ink`, Motiv in `cat-x-deco`                                                       |

### 5.5 Gemessene Kontraste (WCAG 2.1, relative Luminanz)

Gerechnet mit dem sRGB-Luminanz-Verfahren nach WCAG 2.1. In Phase 5 kommt dasselbe als
Skript `scripts/check-contrast.ts` ins Repo. **Alle 99 geprüften Text- und UI-Paare bestehen** (zzgl. 6 reiner Deko-Messungen).

**Neutrale Paare**

| Paar                                  | Light | Dark  | Soll |
| ------------------------------------- | ----- | ----- | ---- |
| foreground / background               | 14,84 | 14,84 | 4,5  |
| foreground / card                     | 15,40 | 13,21 | 4,5  |
| muted-foreground / background         | 6,38  | 9,04  | 4,5  |
| muted-foreground / card               | 6,62  | 8,05  | 4,5  |
| muted-foreground / secondary          | 5,75  | 6,77  | 4,5  |
| muted-foreground / muted              | 5,84  | 7,02  | 4,5  |
| primary (Text) / background           | 7,09  | 7,89  | 4,5  |
| primary-foreground / primary (Button) | 7,09  | 7,89  | 4,5  |
| primary / secondary                   | 6,40  | –     | 4,5  |
| destructive / background              | 6,43  | 7,17  | 4,5  |
| input-border / background (UI)        | 3,03  | 3,60  | 3,0  |
| input-border / card (UI)              | 3,14  | 3,21  | 3,0  |
| ring / background (UI)                | 7,09  | 7,89  | 3,0  |

**Wollfarben (Light)**

| Wolle      | 700-Text / bg | bg-Text / 700-Button | 800 / 50 | 800 / 100 | fg / 100 | fg / 200 | muted-fg / 100 |
| ---------- | ------------- | -------------------- | -------- | --------- | -------- | -------- | -------------- |
| Himbeere   | 7,09          | 7,09                 | 8,91     | 7,59      | 11,82    | 8,81     | 5,08           |
| Senfgelb   | 6,49          | 6,49                 | 8,43     | 7,47      | 12,72    | 10,17    | 5,47           |
| Mint       | 7,45          | 7,45                 | 9,81     | 8,55      | 12,36    | 9,87     | 5,31           |
| Lavendel   | 7,44          | 7,44                 | 9,14     | 7,75      | 11,71    | 8,63     | 5,04           |
| Pfirsich   | 7,00          | 7,00                 | 8,80     | 7,55      | 11,87    | 9,12     | 5,10           |
| Himmelblau | 7,30          | 7,30                 | 9,22     | 8,08      | 12,36    | 9,58     | 5,31           |

**Wollfarben (Dark)**

| Wolle      | 300d / bg | 300d / card | bg-Text / 300d-Button | 300d / 900d | fg / 900d |
| ---------- | --------- | ----------- | --------------------- | ----------- | --------- |
| Himbeere   | 7,89      | 7,02        | 7,89                  | 6,87        | 12,93     |
| Senfgelb   | 10,45     | 9,30        | 10,45                 | 8,71        | 12,38     |
| Mint       | 8,96      | 7,98        | 8,96                  | 7,63        | 12,64     |
| Lavendel   | 8,47      | 7,54        | 8,47                  | 7,50        | 13,13     |
| Pfirsich   | 8,90      | 7,92        | 8,90                  | 7,78        | 12,98     |
| Himmelblau | 8,92      | 7,94        | 8,92                  | 7,56        | 12,57     |

**Deko-Stufe 400 auf Creme** (nur Grafik, kein Informationsträger): Himbeere 3,28 ·
Lavendel 3,32 · Himmelblau 2,72 · Mint 2,64 · Pfirsich 2,44 · Senf 2,06. Deshalb **nie für
Text oder als einzige UI-Grenze**.

---

## 6. Typografie

| Stufe                  | Font                                                                                  | Größe (mobil → desktop)                  | Zeilenhöhe | Gewicht / Stil                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Display (H1 Hero)      | Fraunces (opsz auto, SOFT-Achse wenn verfügbar)                                       | `clamp(2.5rem, 1.6rem + 4vw, 4.5rem)`    | 1.05       | 600, `letter-spacing: -0.02em`                                                                                         |
| H1 (Seiten)            | Fraunces                                                                              | `clamp(2.25rem, 1.8rem + 2vw, 3.25rem)`  | 1.1        | 600                                                                                                                    |
| H2                     | Fraunces                                                                              | `clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)` | 1.15       | 600                                                                                                                    |
| H3                     | Fraunces                                                                              | 1.25rem → 1.5rem                         | 1.25       | 600                                                                                                                    |
| Eyebrow                | Inter                                                                                 | 0.8125rem                                | 1.4        | 600, Uppercase, `tracking 0.12em`, `text-primary` (7,09:1)                                                             |
| Body L                 | Inter                                                                                 | 1.125rem                                 | 1.65       | 400                                                                                                                    |
| Body                   | Inter                                                                                 | 1rem                                     | 1.65       | 400                                                                                                                    |
| Small / Meta           | Inter                                                                                 | 0.875rem                                 | 1.5        | 400/500                                                                                                                |
| Preis                  | Inter, `tabular-nums`                                                                 | 1rem (Karte) / 1.5rem (PDP)              | 1.2        | 600                                                                                                                    |
| **Handschrift-Akzent** | **Caveat** (`next/font/google`, self-hosted, `display: swap`, nur Latin, Gewicht 600) | 1.5 → 2rem                               | 1.1        | nur **2 Deko-Stellen**: Hero-Notiz „von Hand gemacht ♥“ und Werkstatt-Signatur. Mit `aria-hidden`, wenn rein dekorativ |

Warum Caveat: Die Schrift ist gut lesbar, hat einen warmen Strich und bleibt nicht kitschig.
Über `next/font` liegt sie im eigenen Bundle, `font-src 'self'` genügt, und es gibt keinen
Google-Request zur Laufzeit (CSP und DSGVO bleiben unverändert).

---

## 7. Motive & Illustration

**Stil:** Flache, handgezeichnet wirkende SVGs mit `stroke-linecap: round`, leicht
unregelmäßigen Konturen und 2–3 Wollfarben pro Motiv. Keine Verläufe außer weichen Radialen
im Hero, keine Schatten in den Motiven. Icons bleiben **Lucide** (1,75 px Strich,
abgerundet), passend zum Linienstil der Motive.

| #   | Motiv                               | Einsatz                                                    | Umsetzung                                                             |
| --- | ----------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| M1  | **Wollknäuel** (3 Größen, 6 Farben) | Hero, Kategorie-Kacheln, Empty States, Warenkorb-Flug      | Inline-React-SVG `<YarnBall color="senf" />`, `currentColor`-fähig    |
| M2  | **Häkelnadel**                      | Hero (quer über Knäuel), „So entsteht ein Stück“ Schritt 2 | Inline-SVG                                                            |
| M3  | **Granny-Square-Textur**            | dezenter Hintergrund (Opacity 4–6 %) in Hero und Footer    | CSS-`background-image` mit Data-URI-SVG (CSP erlaubt `data:` für img) |
| M4  | **Picot-Bordüre**                   | Section-Divider zwischen Sektionen (Wellen plus Pünktchen) | Inline-SVG, `preserveAspectRatio="none"`, Farbe der Folgesektion      |
| M5  | **Fadenlinie**                      | verbindet Hero → Kategorien → Prozess (geschwungener Pfad) | Inline-SVG, absolut positioniert, `aria-hidden`                       |
| M6  | **Amigurumi-Silhouetten**           | Hero-Komposition (Hase, Bär, Wal) und 404                  | Inline-SVG                                                            |
| M7  | **Maschen-Stich** (kleines „V“)     | Aufzählungszeichen, Trenner im Footer                      | CSS-Maske oder Inline-SVG                                             |
| M8  | **Produkt-Illustrationen**          | 12 Demo-Produkte, je 1 Hauptbild (4:5)                     | Dateien `/public/demo/<slug>.svg`, Hintergrund in Kategoriefarbe      |

Alle Motive sind rein dekorativ (`aria-hidden="true"`, `focusable="false"`). Die
Produkt-SVGs bekommen echte `alt`-Texte aus dem Seed. SVGs via `next/image` nur mit
`unoptimized`, damit `dangerouslyAllowSVG` in `next.config` **nicht** nötig ist.

---

## 8. Animationen

Grundregeln: **nur `transform` und `opacity`**, kein Layout-Shift. Standardmäßig ist die
Seite **statisch**, Bewegung kommt nur unter `@media (prefers-reduced-motion:
no-preference)` dazu. Die vorhandene globale Reduce-Regel bleibt als zweites Netz. Keine neue
Dependency (`tailwindcss-animate` ist vorhanden, dazu eigene Keyframes).

| #   | Animation                         | Auslöser                                                       | Keyframes / Dauer                                                                                                                                                                       | Reduced Motion                                  |
| --- | --------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| A1  | **Scroll-Reveal**                 | Element kommt in den Viewport (IntersectionObserver, einmalig) | `opacity 0→1`, `translateY(16px→0)`, 600 ms `cubic-bezier(.22,1,.36,1)`, Stagger 80 ms                                                                                                  | Inhalt sofort sichtbar, kein Observer           |
| A2  | **Wippende Knäuel** (Hero)        | dauerhaft                                                      | `translateY(0 ↔ -8px)` + `rotate(-3° ↔ 3°)`, 5–7 s ease-in-out, versetzt je Knäuel                                                                                                      | statisch                                        |
| A3  | **Rollendes Knäuel** (Hero, groß) | dauerhaft                                                      | `rotate(360deg)` 40 s linear (sehr langsam)                                                                                                                                             | statisch                                        |
| A4  | **Karten-Wackeln**                | Hover/Fokus Produktkarte                                       | `rotate(0 → -1.2° → 1° → 0)` + `translateY(-4px)`, 450 ms, einmal                                                                                                                       | nur Schatten-/Rahmenwechsel                     |
| A5  | **Herz-Pop** (Wunschliste)        | Klick „Merken“                                                 | `scale(1 → 1.35 → .9 → 1)` 380 ms + 3 Mini-Herzen `translate` + `opacity`                                                                                                               | Farbwechsel ohne Bewegung                       |
| A6  | **Knäuel-Flug in den Warenkorb**  | erfolgreiches „In den Korb“                                    | Klon-Knäuel fliegt per Web Animations API vom Button zum Korb-Icon: X linear, Y mit Bogen-Easing (zwei verschachtelte Elemente), 700 ms; danach **Korb-Bounce** `scale(1→1.2→1)` 300 ms | kein Flug, Badge-Zahl aktualisiert sich, Toast  |
| A7  | **Kategorie-Kachel**              | Hover/Fokus                                                    | Knäuel `rotate(25deg)` + `translateY(-4px)`, Kachel `translateY(-4px)`                                                                                                                  | nur Farbwechsel des Links                       |
| A8  | **Mobile-Menü-Einträge**          | Menü öffnen                                                    | Sheet-Slide (vorhanden), Einträge `opacity/translateX(-8px)` gestaffelt 40 ms                                                                                                           | ohne Staffelung                                 |
| A9  | **404-Faden**                     | dauerhaft                                                      | loser Faden pendelt `rotate(±5°)`, `transform-origin: top`, 3 s                                                                                                                         | statisch                                        |
| A10 | **Button-Press**                  | `:active`                                                      | `scale(.97)` 120 ms                                                                                                                                                                     | bleibt (keine Bewegung im Sinne von WCAG 2.3.3) |

Performance: `will-change` nur während laufender Animationen (A6). Dauer-Animationen (A2,
A3, A9) laufen nur, solange das Element sichtbar ist (`animation-play-state` über den
Observer). Alles läuft auf dem Compositor, das Ziel ist CLS = 0.

---

## 9. Layout & Komponenten-Skizze (für Phase 4)

- **Header:** Logo (mit kleinem Knäuel-Signet) · Nav: _Shop · Amigurumi · Heimdeko ·
  Accessoires · Babys & Kinder · Über uns_. Bei `lg` die Kategorien als farbige Punkt-Links,
  bei `md` → `lg` Kategorien im Dropdown „Kategorien“. Suche, Theme-Toggle, Merkliste, Konto,
  Korb. Mobil: Korb und Menü-Sheet (Kategorien mit Farbpunkt, Service-Links, Suche).
- **Startseite:** Hero (Text links, SVG-Komposition rechts, Granny-Textur, Caveat-Notiz) →
  Vertrauensleiste (Mint, 3 Punkte als `h2`-Sektion „Warum Häkelwelt“) → Picot → Kategorien
  (4 farbige Kacheln) → Fadenlinie → Neuheiten (Karten oder freundlicher Empty State) → „So
  entsteht ein Stück“ (3 Schritte: Wolle wählen · Masche für Masche · Mit Liebe verpackt) →
  Werkstatt-Teaser (Foto-Platzhalter `{{WERKSTATT_FOTO}}` als illustrierte Fläche, Caveat-Signatur)
  → Newsletter im Footer.
- **/produkte & /kategorie/[slug]:** Kategorie-Header in Kategoriefarbe mit Motiv, Filter als
  Chips (Kategorien mit Farbpunkt), mobil im Sheet „Filter“, Sortierung, Karten mit Wackeln.
- **PDP:** Galerie (Hauptbild und Thumbnails), Kategorie-Badge, Preis, **Unikat-Hinweis**,
  Lieferzeit „2–4 Werktage“, Vertrauenselemente (Gratisversand ab 50 €, 14 Tage Widerruf,
  plastikfrei), Details (Material · Maße · Pflege), Reviews (vorhanden).
- **Warenkorb (Drawer und Seite):** Fortschrittsbalken bis Gratisversand (Mint,
  `transform: scaleX`), Knäuel-Empty-State.
- **404:** „Da hat sich eine Masche gelöst.“ mit hängendem Faden (A9) und Links zu Shop und
  Kategorien.

---

## 10. Umsetzungsplan & Grenzen

| Phase | Inhalt                                                                                                                                     | Berührt                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1     | Mobile-Menü, Kategorie-Fallback, Redirects `/registrieren` `/kasse`, Site-URL, Empty States, H-Hierarchie, Korb-Fokus, (Z1-Fallback-Suche) | `components/storefront/*`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `next.config.mjs` (**nur `redirects()`**) |
| 2     | Idempotenter Seed (4 Kategorien und 12 Produkte, SVG-Bilder), Hero-SVG. Seed läuft **nur lokal**                                           | `prisma/seed.ts`, `public/demo/*`, `components/illustrations/*`                                                           |
| 3     | Tokens (Light und Dark), Tailwind-Mapping, Button/Badge/Card-Varianten, harte Farben entfernen                                             | `globals.css`, `tailwind.config.ts`, `components/ui/*`                                                                    |
| 4     | Seiten-Redesign in der beauftragten Reihenfolge, Caveat-Font                                                                               | Seiten und Komponenten                                                                                                    |
| 5     | Critique erneut, Kontrast-Skript, Link-Check-Skript, Lighthouse, Tastaturtest                                                              | `scripts/check-contrast.ts`, `scripts/check-links.ts`                                                                     |

**Nicht Teil des Plans:** Schema-Änderungen, CSP/Header, neue Dependencies, Adressverwaltung,
Admin-Bereich, Payment, Rechtstext-Inhalte.

---

## 11. Offene Entscheidungen (brauchen dein OK)

1. **Palette und Kategorie-Zuordnung** wie in 5.1/5.2 (Himbeere = Marke, Pfirsich = Amigurumi,
   Senf = Heimdeko, Lavendel = Accessoires, Himmelblau = Babys & Kinder, Mint = Vertrauen).
2. **Caveat** als Handschrift-Akzent (2 Stellen), über `next/font`. Das ist keine neue
   npm-Dependency.
3. **Z1 Suche:** a) Darf ich später (nach deinem ausdrücklichen OK) `npm run db:fts:init`
   gegen Prod ausführen, oder machst du das selbst? b) Soll der ILIKE-Fallback in Phase 1 rein?
4. **Material/Maße/Pflege** als strukturierter Text in `description` (keine Schema-Änderung).
   Alternativ neue Felder, was eine Schema-Änderung und Migration bedeuten würde.
5. **Redirects** `/registrieren → /register`, `/kasse → /checkout` über `next.config.mjs
redirects()`. Security-Header und CSP bleiben unverändert. Alternativ: Links nur auf
   bestehende Routen, ohne Aliasse.
6. **Radius** von `0.75rem` auf `1rem` (weicher, „wolliger“).

### Platzhalter, die im Verlauf entstehen (vorläufig)

`{{INHABERIN_NAME}}` · `{{WERKSTATT_ORT}}` · `{{WERKSTATT_FOTO}}` · `{{KONTAKT_EMAIL}}` (die Seiten
nennen aktuell `kontakt@haekelwelt.de` – bestätigen oder ersetzen) · `{{INSTAGRAM_URL}}` ·
`{{PINTEREST_URL}}` · `{{TELEFON}}`

### Env-Variablen für Railway (vorläufig)

- `NEXT_PUBLIC_SITE_URL=https://haekelwelt-production.up.railway.app` (bzw. die spätere
  Domain). Wichtig: `NEXT_PUBLIC_*` wird beim **Build** eingebettet, danach ist ein Redeploy
  nötig.
- `NEXTAUTH_URL` mit derselben URL.
- Fallback: `RAILWAY_PUBLIC_DOMAIN` setzt Railway automatisch. Die neue Site-URL-Logik nutzt
  sie zur Laufzeit, wenn nichts anderes gesetzt ist.
