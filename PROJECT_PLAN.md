# Project Plan – Handmade Marketplace (Arbeitstitel „Häkelwelt")

Stand: 2026-05-19
Branch: `claude/setup-marketplace-project-B7oXh`

> Dieses Dokument ist der Vorab-Plan vor der Implementierung. Es wird im Verlauf
> der Phasen weiter ergänzt (Architektur-Entscheidungen mit Begründung, offene
> Fragen, Auftragsverarbeitung-Übersicht).

---

## 0. Antworten aus Briefing-Runde 1 (2026-05-19)

| Frage           | Antwort                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Q4 Domain       | „Häkelwelt" als Markenname, Platzhalter-Domain `haekelwelt.de` in Configs. Vor Go-Live ersetzen.                            |
| Q5 Lieferländer | **EU-weit.** Implikation: VAT-Logik beachtet OSS-Schwelle (siehe ADR-001).                                                  |
| Q6 Versand      | DE pauschal **4,90 €**, gratis ab **50 €**. EU pauschal **9,90 €**, gratis ab **80 €**.                                     |
| Q7 Steuer       | **Regelbesteuerung** (19 % / 7 %).                                                                                          |
| Q10 Rechtstexte | **Bestätigt:** Anwaltliche Prüfung vor Go-Live wird vom Inhaber veranlasst.                                                 |
| Q15 DB          | **Neon** (Postgres-only).                                                                                                   |
| Q16 Stripe      | Account existiert noch nicht – wird im README Schritt-für-Schritt erklärt (kostenlos, Test-Mode ohne Verifikation nutzbar). |
| Q17 Resend      | Account existiert noch nicht – README-Setup. Bis dahin: Mailversand-Code ist vorhanden, schlägt nur ohne Key fehl.          |

**Defaults, die ich selbst setze** (jederzeit änderbar, nur dokumentiert):

- **Q1 Markenname:** „Häkelwelt".
- **Q2 Logo:** Reine Fraunces-Wortmarke „Häkelwelt" – kein eigener Icon-Entwurf.
- **Q3 Claim:** „Handgehäkelt mit Liebe."
- **Q8 USt-ID:** Platzhalter `DE000000000` in Impressum/Footer – **muss vor Go-Live durch reale USt-ID ersetzt werden**, sonst rechtswidrig.
- **Q9 Impressum:** Template-Stub mit eckigen Klammern `[Vorname Nachname]`, `[Straße Hausnr]`, `[PLZ Ort]`, `[Telefon]`, `[E-Mail]` – wird von dir gefüllt.
- **Q11 Kategorien:** „Amigurumi", „Heimdeko", „Accessoires", „Babys & Kinder".
- **Q12 Bilder:** Unsplash-/Pexels-Bilder mit Quellangabe im Seed-Script. Für Produktion zu ersetzen.
- **Q13 Stock:** Mischung: ein Teil Unikate (`stock = 1`), Rest 2–5 Stück.
- **Q14 Personalisierung:** erst Phase 2+.
- **Q18 Google OAuth:** Phase 1 nur Credentials. Google-Konfiguration ist im Code vorbereitet (kommentiert) und in 5 min aktivierbar, sobald Client-ID vorliegt.
- **Q21 Theme:** Light + Dark mit System-Default und Toggle im Footer.
- **Q22 Gast-Checkout:** Erlaubt. Account-Anlage ist freiwilliger Bonus.
- **Q23 Test-Accounts im Seed:** `admin@haekelwelt.local` / `Admin123!Admin` und `kunde@haekelwelt.local` / `Kunde123!Kunde`. Seed-Script verweigert Ausführung in Production (`NODE_ENV=production` → abort).

### ADR-001: VAT-Strategie für EU-weiten Versand

**Kontext:** Lieferung in alle EU-Länder, Verkäuferin in DE mit Regelbesteuerung.

**Regel:** Bis zur EU-weiten B2C-Fernverkaufs-Schwelle (10.000 € Netto/Jahr,
Summe über alle EU-Länder) gilt **deutsche** Umsatzsteuer (19 % / 7 %) auch
für EU-Käufer:innen. Ab Überschreitung greift die Steuer des Bestimmungs-
landes; korrekt abgewickelt via OSS-Verfahren beim BZSt.

**Entscheidung für Phase 1–3:**

- Wir berechnen immer **deutsche MwSt** (kein OSS).
- Auf der Rechnung wird das Bestimmungsland gespeichert (Audit-Trail).
- Im Admin-Panel (Phase 3) erscheint eine **Warnung**, sobald der laufende
  EU-Auslands-Umsatz 80 % der Schwelle erreicht.
- Der OSS-Umstieg ist ein bewusstes Phase-4-Thema und braucht eine
  steuerberatende Begleitung – nicht von der Engine allein lösbar.

**Begründung:** OSS einbauen, bevor es nötig ist, kostet viel Komplexität
(Pro-Land-VAT-Tabelle, Round-Trips zu Tax-APIs, Reporting-Export). Die
80 %-Warnschwelle schützt vor Versehentlich-Übersehen.

---

## 1. Tech-Stack-Bestätigung

Der vom Briefing fixierte Stack ist tragfähig und wird **wie spezifiziert
übernommen**. Keine Abweichungen vorgeschlagen.

| Schicht      | Wahl                            | Anmerkung                                                                                                       |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Framework    | Next.js 14+ (App Router)        | Server Components als Default, Client Components nur bei Interaktivitäts-Bedarf (Cart-Drawer, Search-Input, …). |
| Sprache      | TypeScript strict               | `strict: true`, `noUncheckedIndexedAccess: true`, kein `any`.                                                   |
| Styling      | Tailwind v3 + shadcn/ui         | Eigene Variants im Theme-Layer, keine Naked Defaults.                                                           |
| DB           | PostgreSQL 16 + Prisma 5        | Versionierte Migrationen via `prisma migrate dev`, kein `db push` in produktiven Workflows.                     |
| Auth         | NextAuth v5 (Auth.js)           | Database Session Strategy, Credentials + Google.                                                                |
| Payments     | Stripe Checkout (P1)            | PayPal als optionales P2-Add-on.                                                                                |
| E-Mail       | Resend + React Email            | Transaktional (Order Confirmation, Double-Opt-In, Password Reset).                                              |
| Validation   | Zod                             | An jeder Server-Action- und Route-Handler-Grenze.                                                               |
| Rate-Limit   | Upstash Ratelimit               | Für Login, Register, Reset, Newsletter-Subscribe, Kontaktformular.                                              |
| File Uploads | UploadThing (ab Phase 2)        | Mit Sharp-Re-Encoding serverseitig.                                                                             |
| Hosting      | Vercel + Neon **oder** Supabase | Entscheidung offen → siehe Frage 4.1.                                                                           |
| Lint/Format  | ESLint + Prettier + Husky       | `lint-staged` Pre-Commit; CI-Job in Phase 1 nur optional.                                                       |
| i18n         | `next-intl` (ab Phase 3)        | Auslieferung in Phase 1–2 ausschließlich DE.                                                                    |

**Bewusst nicht im Stack:**

- Keine zweite UI-Library (kein MUI/Chakra/Mantine).
- Kein Redux/Zustand für Cart in Phase 1 – Server Actions + Cookies + DB reichen.
- Kein ORM neben Prisma.
- Kein eigenes Auth – NextAuth deckt alle Anforderungen ab.

---

## 2. Offene Fragen (bitte beantworten, bevor Phase 1 startet)

Die mit **★** markierten Fragen sind blockierend – ohne Antwort kann Phase 1
nicht produktionsnah abgeschlossen werden. Der Rest kann mit dokumentierten
Default-Annahmen vorläufig gefüllt und später korrigiert werden.

### 2.1 Marke & Identität

1. **Markenname** – Repo heißt `Haekelwelt`. Soll das auch der öffentliche
   Produktname sein, oder ist „Häkelwelt" ein Arbeitstitel?
2. **Logo & Wortmarke** – Vorhanden? Falls nein: in Phase 1 setze ich eine
   schlichte Wortmarke mit Fraunces als Platzhalter (kein eigener Icon-Entwurf
   ohne Auftrag).
3. **Claim/Tagline** – z. B. „Handgehäkelt mit Liebe" – soll ich vorschlagen
   oder kommt er von dir?
4. **Domain** ★ – Für `NEXTAUTH_URL`, canonical URLs, OG-Meta, Sitemap und
   Stripe-Redirects gebraucht. Vorläufig: `haekelwelt.example`.

### 2.2 Geschäftliches & Rechtliches

5. **Lieferländer** ★ – Nur DE, oder DE+AT+CH, oder EU-weit? Das beeinflusst
   Versandkosten-Logik, MwSt-Berechnung (OSS-Verfahren ab EU-weit), Adress-
   Validierung und Stripe-Konfiguration.
6. **Versanddienstleister & -kosten** ★ – DHL? Hermes? Pauschal (z. B.
   4,90 € unter 50 € Bestellwert, danach gratis) oder gewichtsabhängig?
   In Phase 1 schlage ich pauschal vor, gewichtsabhängig wäre Phase 3.
7. **Steuerstatus der Verkäuferin** ★ – Regelbesteuerung (19 % / 7 %) oder
   Kleinunternehmerregelung (§19 UStG, keine MwSt-Ausweisung)? Wirkt auf
   Preisanzeige, Rechnungstexte und Cart-Berechnung.
8. **USt-ID** – Vorhanden? (Pflicht auf Rechnung bei Regelbesteuerung.)
9. **Impressums-Pflichtangaben** – Name, Anschrift, Telefon, E-Mail, ggf.
   Handelsregister, Streitbeilegungs-Plattform-Hinweis. Soll ich einen
   Template-Stub anlegen, den du selbst füllst?
10. **Anwalts-Review der Rechtstexte** – Bestätige bitte, dass du die generierten
    Templates (Impressum, Datenschutz, AGB, Widerruf) **vor Live-Schaltung**
    durch eine:n Anwält:in prüfen lässt (z. B. eRecht24-Generator als Basis +
    Review). Dieser Hinweis kommt prominent in die README.

### 2.3 Produktdaten für den Seed

11. **Kategorien** – Vorschlag für Phase 1 (4 Stück): „Amigurumi",
    „Heimdeko", „Accessoires", „Babys & Kinder". Passt das, oder andere?
12. **Echte Produktbilder** – Liegen welche vor? Falls nein: ich nutze für den
    Seed lizenzfreie Unsplash-/Pexels-Bilder mit Quellnachweis im Seed-Script.
    Im Produktiv-Betrieb müssen sie ersetzt werden.
13. **Unikat oder Stückzahl** – Sind die Produkte typischerweise Unikate
    (`stock = 1`) oder gibt es Wiederholungen? Beeinflusst UX (z. B.
    „nur noch 1 verfügbar"-Hinweis) und Lager-Logik.
14. **Personalisierung** (z. B. Wunschfarbe, Wunschname) – schon in Phase 1
    nötig oder Phase 2+? Default: erst Phase 2.

### 2.4 Externe Accounts & Secrets

15. **DB-Hosting** ★ – Neon oder Supabase? Default-Empfehlung: **Neon**
    (reiner Postgres, einfacher mit Prisma, gutes Free-Tier, kein
    Feature-Overhead). Supabase nur, falls du später Auth/Storage/Realtime
    nutzen willst (das kollidiert dann mit NextAuth).
16. **Stripe-Account** ★ – Vorhanden + verifiziert (Identifikation
    abgeschlossen) für Live-Betrieb? Test-Mode-Keys reichen für Phase 1.
17. **Resend-Account** ★ – Vorhanden? Falls nein: Account anlegen,
    Sender-Domain verifizieren (SPF/DKIM-Setup nötig). Ohne verifizierte
    Domain landen Mails im Spam.
18. **Google OAuth Credentials** – Google Cloud Console Project + OAuth-
    Consent-Screen + Client-ID/Secret. Optional – falls nicht vorhanden,
    starten wir Phase 1 mit Credentials-only und ergänzen Google später.
19. **Vercel-Account & Team** – Schon vorhanden? Mit welchem GitHub-User
    verbunden?
20. **Upstash, UploadThing** – erst Phase 2 relevant, kein Blocker für
    Phase 1.

### 2.5 Sonstiges

21. **Light-/Dark-Mode** – Beide ausliefern oder Phase 1 nur Light? Das
    Briefing nennt Dark-Mode-Tokens, daher gehe ich von „beide" aus, mit
    System-Default + Toggle im Footer.
22. **Account-Pflicht für Bestellung** – Gast-Checkout erlauben (DSGVO-
    freundlicher, weniger Friction), oder Account-Zwang? Default-Empfehlung:
    Gast-Checkout erlauben.
23. **Test-Account-Daten** – Soll der Seed einen Admin-User mit fester
    Test-E-Mail/-Passwort anlegen (z. B. `admin@haekelwelt.local` /
    `Admin123!`)? Nur zur lokalen Entwicklung, niemals in Produktion.

---

## 3. Architektur-Skizze

### 3.1 Ordnerstruktur (Phase 1 final, Phase 2–4 ergänzt)

```
.
├── app/
│   ├── (storefront)/                  # Route-Group: öffentlicher Shop
│   │   ├── layout.tsx                 # Header, Footer, Cart-Drawer, Toaster
│   │   ├── page.tsx                   # Startseite
│   │   ├── produkte/
│   │   │   ├── page.tsx               # Produktliste (Server, mit Filtern)
│   │   │   └── [slug]/page.tsx        # Produktdetail
│   │   ├── kategorie/[slug]/page.tsx
│   │   ├── warenkorb/page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx               # Adress-Form
│   │   │   ├── success/page.tsx       # Read-only Bestätigung aus DB
│   │   │   └── cancel/page.tsx
│   │   └── konto/
│   │       ├── page.tsx               # Dashboard
│   │       ├── bestellungen/page.tsx
│   │       └── adressen/page.tsx
│   ├── (auth)/                        # eigener Layout ohne Header-Cart
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset/page.tsx
│   ├── (legal)/                       # Footer-Links
│   │   ├── impressum/page.tsx
│   │   ├── agb/page.tsx
│   │   ├── widerruf/page.tsx
│   │   └── datenschutz/page.tsx
│   ├── admin/                         # Phase 3, per Middleware geschützt
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts        # raw body + sig verify
│   ├── layout.tsx                     # Root: Fonts, Theme-Provider, JSON-LD Org
│   ├── globals.css                    # CSS-Variablen (Tokens)
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                            # shadcn primitives (Button, Input, …)
│   ├── storefront/                    # ProductCard, CategoryNav, CartDrawer, …
│   ├── checkout/
│   └── shared/                        # Logo, ThemeToggle, …
├── lib/
│   ├── auth.ts                        # NextAuth-Konfiguration + Helpers
│   ├── db.ts                          # PrismaClient (singleton, Edge-aware)
│   ├── stripe.ts                      # Stripe-Client + Helpers
│   ├── email/                         # Resend-Client + send-helpers
│   ├── rate-limit.ts                  # Upstash (Phase 2; Phase 1 Memory-Fallback)
│   ├── validators/                    # Zod-Schemas (auth, address, product, …)
│   ├── cart/                          # Cart-Logik (cookie+db, merge-on-login)
│   ├── pricing.ts                     # MwSt-Rechnung, Brutto/Netto-Helpers
│   └── utils.ts
├── actions/                           # Server Actions („use server")
│   ├── auth.ts                        # register, requestReset, …
│   ├── cart.ts                        # add, update, remove, merge
│   ├── checkout.ts                    # create-stripe-session
│   ├── account.ts                     # update-address, change-password
│   └── newsletter.ts                  # subscribe-doi (Phase 2)
├── emails/                            # React Email
│   ├── order-confirmation.tsx
│   ├── reset-password.tsx
│   └── newsletter-doi.tsx             # Phase 2
├── prisma/
│   ├── schema.prisma
│   ├── migrations/                    # versioniert, im Repo
│   └── seed.ts
├── public/
│   ├── fonts/                         # Fraunces + Inter (lokal, self-hosted)
│   └── og/                            # Default OG-Image
├── styles/                            # bei Bedarf, sonst nur globals.css
├── .env.example
├── README.md
├── PROJECT_PLAN.md
├── next.config.js                     # Headers (CSP), Image-Domains
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 3.2 Datenfluss Checkout

```
User klickt „Zur Kasse"
        │
        ▼
[/checkout]  Server-Komponente lädt Cart (User → DB | Gast → Cookie)
        │   prüft Verfügbarkeit, berechnet Brutto/MwSt/Versand
        │   rendert Adress-Form (Client Component, react-hook-form + Zod)
        │
        ▼
Submit → Server Action `createCheckoutSession`
        │   1. Zod-Validierung der Adresse
        │   2. Re-Read Cart + Re-Check Stock (Race-Schutz)
        │   3. Order in DB anlegen, Status = PENDING
        │   4. Stripe Checkout Session erstellen mit:
        │        - line_items aus Order
        │        - metadata.orderId
        │        - success_url, cancel_url
        │   5. Redirect zur Stripe-URL
        │
        ▼
Stripe → User bezahlt → Stripe sendet Webhook
        │
        ▼
[/api/webhooks/stripe]  POST
        │   1. Raw Body lesen (kein JSON-Parsing davor)
        │   2. Signatur via STRIPE_WEBHOOK_SECRET verifizieren
        │   3. Event-Type prüfen (checkout.session.completed)
        │   4. Order anhand metadata.orderId laden
        │   5. Idempotenz: bereits PAID? → 200 ohne Aktion
        │   6. Status auf PAID, Stock dekrementieren in Transaction
        │   7. Cart leeren
        │   8. Bestätigungsmail via Resend (best-effort, Fehler loggen,
        │      Webhook trotzdem 200, da Mail-Resend nachholbar)
        │   9. 200 zurück
        │
        ▼
User wird zu [/checkout/success?orderId=…] redirected
        │   liest Order aus DB (zeigt nur PAID-Orders)
        │   keine Stripe-Daten im URL/Client
```

**Wichtig:** Order-State ist Quelle der Wahrheit aus DB, niemals aus
Stripe-URL-Parametern. Success-Page zeigt nichts, bevor Webhook die Order
auf PAID gesetzt hat – falls Webhook noch nicht durch ist, zeigt sie einen
„Wird verarbeitet…"-Hinweis mit automatischem Refresh.

### 3.3 Auth-Flow

```
Registrierung (Credentials)
  POST → action `register`
    1. Rate-Limit-Check (IP)
    2. Zod-Validierung (Email RFC, Passwort min 12 Zeichen + Komplexität)
    3. Existiert Email bereits? → generischer Fehler (kein User-Enumeration)
    4. Passwort hashen (argon2id, Cost konservativ)
    5. User in DB anlegen
    6. (Optional Phase 2) E-Mail-Verifikation, Phase 1 ohne
    7. Auto-Login via NextAuth `signIn("credentials")`
    8. Cart-Merge: Cookie-Cart-Items → DB-Cart des neuen Users

Login (Credentials)
  POST → NextAuth Credentials Provider `authorize`
    1. Rate-Limit-Check (IP + Email-Bucket)
    2. Zod-Validierung
    3. User lookup, Passwort-Verify (argon2id)
    4. Bei Erfolg: Session in DB (DatabaseAdapter)
    5. Cart-Merge

Login (Google OAuth, falls aktiviert)
  Redirect → Google → Callback
    1. NextAuth callback: User upsert (E-Mail als Key)
    2. Account-Tabelle (Provider-Verknüpfung)
    3. Session in DB
    4. Cart-Merge

Session-Lesen (jeder Request)
  Server-Komponente / Server Action → `auth()` (NextAuth v5)
    → liest Session-Cookie → DB-Lookup → User-Objekt

Logout
  POST → NextAuth `signOut` → Session aus DB löschen + Cookie clear
```

**Schutzmechanismen:**

- Argon2id mit konservativen Parametern (alternativ bcrypt cost ≥ 12, falls
  argon2-Native-Module auf Vercel/Neon-Edge zicken – Entscheidung beim Setup).
- Rate-Limit pro IP **und** pro Email-Bucket, damit gezielte Angriffe auf
  einen Account nicht durch IP-Rotation funktionieren.
- Konstante Antwortzeiten / generische Fehlermeldungen bei Login + Reset
  (keine User-Enumeration).
- Session-Cookies: `HttpOnly`, `Secure`, `SameSite=Lax`.
- CSRF: NextAuth handhabt das für Auth-Routen; eigene Server Actions sind
  durch Same-Origin-Policy + Next-Mechanismus geschützt.

### 3.4 Cart-Strategie

| User-Status        | Speicher                                  | Identifikation   |
| ------------------ | ----------------------------------------- | ---------------- |
| Gast               | DB-Row `CartItem` mit `cartToken`         | Cookie `cart_id` |
| Eingeloggt         | DB-Row `CartItem` mit `userId`            | Session          |
| Login während Cart | Merge: Gast-Items → User-Items (Mengen +) | Cookie wird leer |

Gründe für DB-Cart auch bei Gästen statt nur Cookie:

- Items-Liste kann groß werden – Cookies haben 4 KB Limit.
- Stock-Check und Preis-Aktualität sind Server-side trivial.
- Migrations-Pfad zu „Reservierung beim Checkout" in Phase 3 ist trivial.
- DSGVO: Gast-Cart-Rows mit `expiresAt` (z. B. 30 Tage) automatisch löschen
  via Cron-Job.

### 3.5 Daten-Modell (Phase-1-Entwurf)

Tabellen (Prisma-Modelle):

- `User` – id, email (unique), passwordHash?, name?, role (USER|ADMIN),
  createdAt, updatedAt.
- `Account`, `Session`, `VerificationToken` – NextAuth-Standard.
- `Address` – id, userId, line1, line2?, city, postalCode, country,
  isDefaultShipping, isDefaultBilling.
- `Category` – id, slug (unique), name, description?, sortOrder.
- `Product` – id, slug (unique), title, description, priceCents,
  taxRate (Enum REDUCED|STANDARD), stock, weightGrams?, isActive,
  categoryId, createdAt, updatedAt.
- `ProductImage` – id, productId, url, alt, sortOrder, blurDataUrl?.
- `CartItem` – id, productId, quantity, userId? **oder** cartToken?
  (genau eines per Check-Constraint), createdAt, updatedAt.
- `Order` – id, userId? (Gast-Checkout!), email, status (PENDING|PAID|
  SHIPPED|COMPLETED|CANCELLED|REFUNDED), totalCents, taxCents,
  shippingCents, currency (default „EUR"), shippingAddressId,
  billingAddressId, stripeSessionId?, stripePaymentIntentId?, createdAt.
- `OrderItem` – id, orderId, productId, titleSnapshot, priceCentsSnapshot,
  quantity, taxRateSnapshot. (Snapshots, damit historische Bestellungen
  unabhängig von späteren Produkt-Änderungen sind.)
- `Review` – Phase 2.

Indexe: `Product.slug`, `Product.categoryId`, `Order.userId`,
`Order.stripeSessionId`, `CartItem.userId`, `CartItem.cartToken`.

---

## 4. Erste Aufwandsschätzung Phase 1

Annahme: eine erfahrene Person, fokussiert, keine größeren Blocker.

| Block                                                    | Aufwand    |
| -------------------------------------------------------- | ---------- |
| Setup (Next, TS strict, Tailwind, shadcn, ESLint, Husky) | 0.5 d      |
| Design-Tokens + Fonts self-hosted + Base-Components      | 1.0 d      |
| Prisma-Schema + Migrationen + Seed (12 Produkte)         | 1.0 d      |
| NextAuth v5 (Credentials + Google) + Rate-Limit          | 1.0 d      |
| Storefront-Layout (Header, Footer, Nav, Cart-Drawer)     | 1.0 d      |
| Produktliste + Produktdetail (SSR, JSON-LD)              | 1.0 d      |
| Cart (DB + Cookie + Merge, Server Actions)               | 1.0 d      |
| Checkout-Form + Stripe-Session + Webhook                 | 1.5 d      |
| Bestätigungsmail (Resend + React Email)                  | 0.5 d      |
| Legal-Stubs + Cookie-Banner (Basis)                      | 0.5 d      |
| README, `.env.example`, Deployment-Doku                  | 0.5 d      |
| Lighthouse-Tuning, A11y-Pass, Bugfixing                  | 1.0 d      |
| **Summe**                                                | **10.5 d** |

Real-time bei normaler Arbeitszeit: **ca. 2 Wochen** bis Phase-1-Abschluss
inkl. Review-Loops mit dir.

Risiken / mögliche Verzögerungen:

- Stripe-Webhook lokal testen erfordert Stripe CLI – wenn nicht installiert,
  +0.5 d.
- Resend-Domain-Verifikation kann je nach DNS-Provider 0.5 d Wartezeit
  bedeuten.
- Google OAuth Consent-Screen-Setup, falls externer Type, ist 1–2 h
  Klickerei in der Google Cloud Console.

---

## 5. Vorgehen nach Beantwortung der Fragen

1. Ich aktualisiere diesen Plan mit deinen Antworten (Diff-fähig im PR).
2. Ich lege die Repo-Skelett-Struktur, `package.json`, Config-Files und
   `.env.example` an – ein erster Commit, der noch nichts „kann", aber
   sauber buildet und lintet (leerer App-Router, leere Prisma-DB).
3. Danach gehe ich die Phase-1-Blöcke in der Reihenfolge der Tabelle in
   Abschnitt 4 ab, jeweils mit Commits pro Block.
4. Am Ende von Phase 1: Abschlussbericht in diesem Dokument unter neuem
   Abschnitt „Phase-1-Abschluss".

### Phase-1-Abschluss (2026-05-19)

**Status:** Build grün, TypeScript strict ohne Fehler, ESLint 0 Warnings.

**Gebaut:**

- Setup: Next.js 14.2.35, TypeScript strict, Tailwind, shadcn-Stil-
  Komponenten (Button, Input, Label, Card, Sheet, Badge, Separator,
  Checkbox, Select, Sonner-Toaster), ESLint, Prettier, Husky-Hook,
  CSP-Header in `next.config.mjs`.
- Datenbank: Prisma-Schema mit 11 Modellen (User/Account/Session/
  VerificationToken, Category, Product, ProductImage, Cart/CartItem,
  Address, Order/OrderItem, Review). Geld in Cents, Steuer-/Adress-
  Snapshots auf Order-Ebene.
- Auth: NextAuth v5 (Database-Session) mit Credentials, Google
  vorbereitet (aktiviert sich automatisch, wenn `AUTH_GOOGLE_ID/SECRET`
  gesetzt). Rate-Limit (in-memory) auf Login + Register, konstante
  Antwortzeit gegen User-Enumeration, bcrypt (cost 12).
- Storefront: Home (Hero + Feature-Stripe + Kategorien + neue Produkte),
  Produktliste, Produktdetail (mit Product- + Breadcrumb-JSON-LD),
  Kategorieseiten, Warenkorb-Page + Cart-Drawer im Header.
- Cart-Strategie wie in Abschnitt 3.4: DB-Cart für Gäste und User mit
  Cookie-Token, Merge on Login, TTL 30 Tage.
- Checkout: Adressformular (DE + 26 weitere EU-Länder), Server Action
  erstellt PENDING-Order + Stripe-Session, Webhook setzt auf PAID,
  dekrementiert Stock, leert Cart, schickt Bestätigungsmail via Resend.
- Email-Template (React Email): Bestellbestätigung in DE mit
  Adress-Snapshot, Items, Steuer, Gesamtsumme.
- Cookie-Banner mit Opt-In, ohne Pre-Selection, Kategorien-Wahl,
  localStorage-Persistenz.
- Rechtstexte: Impressum, Datenschutz, AGB, Widerruf als Templates
  mit deutlichem Anwalt-Hinweis.
- SEO: Sitemap, robots.txt, OG-Tags, JSON-LD Organization +
  Product + BreadcrumbList.
- Theme: Light + Dark mit System-Default und Toggle im Header.
- Seed: 12 Produkte über 4 Kategorien (Amigurumi, Heimdeko,
  Accessoires, Babys & Kinder), Admin + Test-Kunde. Seed-Script
  verweigert Ausführung in `NODE_ENV=production`.
- Deployment-Ready: `.env.example` mit Anleitung pro Variable,
  README mit Schritt-für-Schritt für Neon, Stripe, Resend, Vercel.

**Bewusst ausgespart (siehe Roadmap in README):** Suche/Filter,
Wunschliste, Reviews-UI (Modell existiert), Newsletter, Rabattcodes,
Über-uns/FAQ/Kontakt, Admin-Panel, Lagerreservierung mit Timeout,
Mini-Analytics, i18n, Framer-Motion-Polish, Quick-View-Modal.

**Bekannte Limitierungen:**

- Rate-Limiter in-memory – auf Vercel Serverless erst mit Upstash
  (Phase 2) zuverlässig.
- Lager wird erst beim Webhook dekrementiert, nicht bei Checkout-Start.
  Theoretisch kann der letzte Artikel doppelt verkauft werden; eine
  Phase-3-Lösung mit Reservierung + TTL ist in der Roadmap.
- Cart-Cleanup (abgelaufene Gast-Carts) braucht einen Cron-Job
  (Vercel Cron in Phase 3).

**Nächste Phase:** Phase 2 (Storefront-Erweiterung) – Search, Filter,
Wunschliste, Reviews-UI, Newsletter, Inhaltsseiten.

---

## 6. Architektur-Entscheidungen (wird kontinuierlich gepflegt)

_Wird ab dem ersten Code-Commit gefüllt. Format: kurzes ADR-Light pro Eintrag
(Kontext / Optionen / Entscheidung / Begründung)._

---

## 7. Auftragsverarbeitung (DSGVO Art. 28) – Übersicht

_Wird mit jedem hinzukommenden Drittdienst fortgeschrieben. Pflicht vor
Go-Live: AV-Verträge mit allen Anbietern abschließen._

| Dienst        | Verarbeitete Daten                        | Sitz / Server-Region        | AV-Vertrag    |
| ------------- | ----------------------------------------- | --------------------------- | ------------- |
| Neon/Supabase | Alle Kunden-, Bestell-, Produktdaten      | EU-Region wählen (zwingend) | offen         |
| Vercel        | Logs, IP-Adressen (Edge), Build-Artefakte | EU + US (Edge global)       | offen         |
| Stripe        | Zahlungs- und Adressdaten der Käufer      | Irland / USA (DPF)          | offen         |
| Resend        | Empfänger-E-Mails, Mail-Inhalte           | USA                         | offen         |
| Google OAuth  | Nur falls aktiv: Name, E-Mail, Profilbild | USA (DPF)                   | n/a (Consent) |
| Upstash       | Rate-Limit-Counter (IP-Hashes)            | EU-Region wählen            | offen         |
| UploadThing   | Bild-Uploads (Phase 2+)                   | USA                         | offen         |

---

**Nächster Schritt:** Bitte beantworte die mit ★ markierten Fragen in
Abschnitt 2. Sobald die da sind, lege ich los.
