# Häkelwelt – Handmade Marketplace

Ein Online-Shop für handgehäkelte Unikate. Das Repo enthält **zwei
parallele Stack-Varianten**:

| Stack                                 | Pfad                  | Setup-Aufwand                           | Beschreibung                                                                                 |
| ------------------------------------- | --------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Next.js 14 + Prisma + Postgres**    | Repo-Root (`/`)       | Höher (Neon/Stripe/Resend)              | Produktiv ausgerichtet, mit Stripe-Checkout, Resend-Mails, Postgres-FTS, Phase 1+2 komplett. |
| **Blazor Web App + EF Core + SQLite** | [`/dotnet`](./dotnet) | „Läuft sofort" – nur .NET 8 SDK + Rider | Rider-freundliche Alternative ohne externe Services, ohne npm, ohne Docker.                  |

Diese README beschreibt die Next.js-Variante. Für die .NET-Variante siehe
[`dotnet/README.md`](./dotnet/README.md).

**Next.js · Phase 1 (MVP):** Storefront, Cart, Checkout (Stripe), Auth (NextAuth v5),
Versand DE + EU mit deutscher MwSt.

**Next.js · Phase 2 (Storefront-Erweiterung):** Postgres-Volltextsuche, Filter (Kategorie /
Preis / Verfügbarkeit), Sortierung, Pagination, Wunschliste, Produktbewertungen
mit verifiziertem-Kauf-Badge, Newsletter mit Double-Opt-In, prozentuale + fixe
Rabattcodes, Inhaltsseiten (Über uns, FAQ, Versand, Kontakt mit Honeypot +
Rate-Limit).

> **Status:** Phase 2 (Next.js) abgeschlossen. Blazor-Variante mit Storefront,
> Cart, Wunschliste, Account und Demo-Checkout vorhanden – Stripe/Email-Anbindung
> Phase 2 für Blazor. Phase 3 (Admin-Panel, Mini-Analytics,
> Lager­reservierung mit Timeout, i18n) ist im
> [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) skizziert, aber noch nicht
> implementiert.

---

## Inhaltsverzeichnis

1. [Architektur-Übersicht](#1-architektur-übersicht)
2. [Setup für lokale Entwicklung](#2-setup-für-lokale-entwicklung)
3. [Externe Dienste einrichten](#3-externe-dienste-einrichten)
4. [npm-Scripts](#4-npm-scripts)
5. [Stripe-Webhooks lokal testen](#5-stripe-webhooks-lokal-testen)
6. [Deployment auf Vercel](#6-deployment-auf-vercel)
7. [Rechtliche Hinweise](#7-rechtliche-hinweise)
8. [Roadmap & bekannte Einschränkungen](#8-roadmap--bekannte-einschränkungen)

---

## 1. Architektur-Übersicht

```
Next.js 14 (App Router, Server Components)
       │
       ├── app/(storefront)/   – öffentlicher Shop (Home, Liste, Detail, Cart, Checkout)
       ├── app/(auth)/         – Login & Registrierung
       ├── app/api/            – NextAuth-Routen + Stripe-Webhook
       ├── components/         – ui/ (shadcn), storefront/, shared/
       ├── lib/                – db, auth, stripe, email, pricing, cart, validators
       ├── actions/            – Server Actions (cart, auth, checkout)
       ├── emails/             – React-Email-Templates
       └── prisma/             – Schema, Migrationen, Seed

Datenbank: PostgreSQL (Neon)
Zahlungen: Stripe Checkout (Test- oder Live-Modus)
E-Mails:   Resend (Bestätigung, später Reset/Newsletter)
Hosting:   Vercel (empfohlen) – läuft auch auf jedem Node-Host
```

Details (Datenfluss Checkout, Auth-Flow, Cart-Strategie, ADRs) im
[`PROJECT_PLAN.md`](./PROJECT_PLAN.md).

---

## 2. Setup für lokale Entwicklung

### Voraussetzungen

- **Node.js ≥ 20** (LTS empfohlen)
- **npm 10+** (oder pnpm/yarn, wird aber nicht offiziell getestet)
- **PostgreSQL 14+** lokal **oder** ein Neon-Cloud-Projekt (kostenlos)
- **Stripe CLI** für Webhook-Tests:
  [Installation](https://stripe.com/docs/stripe-cli)

### Schritte

```bash
# 1. Dependencies installieren
npm install

# 2. .env aus Vorlage anlegen und ausfüllen
cp .env.example .env
# … nun in .env die echten Werte eintragen (siehe Abschnitt 3)

# 3. Datenbank-Schema anwenden
npx prisma migrate dev --name init

# 4. Postgres-Full-Text-Setup (einmalig, idempotent)
npm run db:fts:init

# 5. Beispieldaten einspielen
npm run db:seed

# 6. Entwicklungsserver starten
npm run dev
# → http://localhost:3000
```

Standard-Test-Accounts nach `db:seed` (nur Development!):

| Rolle | E-Mail                 | Passwort         |
| ----- | ---------------------- | ---------------- |
| Admin | admin@haekelwelt.local | `Admin123!Admin` |
| Kunde | kunde@haekelwelt.local | `Kunde123!Kunde` |

---

## 3. Externe Dienste einrichten

Du brauchst **vier** kostenlose Accounts. Plane ca. 30–60 min für das erste
Setup ein.

### 3.1 PostgreSQL via Neon (Empfehlung)

1. Account auf [neon.tech](https://neon.tech) anlegen.
2. **WICHTIG:** Region **Frankfurt** oder **Amsterdam** wählen (DSGVO).
3. Projekt anlegen → „Connection details" öffnen.
4. **Pooled connection string** kopieren → in `.env` als `DATABASE_URL`
   (endet auf `-pooler.neon.tech`, wichtig für Serverless-Performance).
5. **Direct connection** kopieren → `DIRECT_URL` (Prisma braucht das für
   Migrationen).

### 3.2 Stripe (Payments)

1. Account auf [stripe.com](https://stripe.com) anlegen (kostenlos,
   **Test-Modus** funktioniert sofort ohne Identitätsprüfung).
2. Dashboard → Entwickler → API-Keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_…`
   - `STRIPE_SECRET_KEY` = `sk_test_…`
3. Webhook-Secret:
   - **Lokal:** siehe [Abschnitt 5](#5-stripe-webhooks-lokal-testen).
   - **Production:** Webhook-Endpoint im Stripe-Dashboard anlegen,
     URL = `https://DEINE-DOMAIN/api/webhooks/stripe`, Events:
     `checkout.session.completed` + `checkout.session.expired`. Das
     dabei generierte `whsec_…` kommt als `STRIPE_WEBHOOK_SECRET` in
     die Vercel-Env.

### 3.3 Resend (Transaktions-Mails)

1. Account auf [resend.com](https://resend.com) anlegen.
2. **Sender-Domain hinzufügen und DNS-Records (SPF, DKIM, ggf. DMARC)
   beim Domain-Provider setzen.** Ohne verifizierte Domain landen
   E-Mails im Spam und können nur an die Account-E-Mail gesendet werden.
3. API-Key generieren (`re_…`) → `.env` als `RESEND_API_KEY`.
4. `EMAIL_FROM` muss eine Adresse der verifizierten Domain sein, z. B.
   `Häkelwelt <bestellungen@haekelwelt.de>`.

### 3.4 NextAuth-Secret generieren

```bash
openssl rand -base64 32
```

Ergebnis in `.env` als `AUTH_SECRET`. Niemals den gleichen Wert in Dev und
Production verwenden.

### 3.5 Google OAuth (optional)

Phase 1 funktioniert ohne. Wenn du Google-Login aktivieren willst:

1. [Google Cloud Console](https://console.cloud.google.com) → Projekt anlegen.
2. „APIs & Services" → „OAuth consent screen" konfigurieren.
3. „Credentials" → „Create OAuth client ID" → Web Application.
4. **Authorized redirect URI:** `https://DEINE-DOMAIN/api/auth/callback/google`
   (für lokal: `http://localhost:3000/api/auth/callback/google`).
5. `AUTH_GOOGLE_ID` und `AUTH_GOOGLE_SECRET` in `.env` setzen. Der
   Google-Login-Button wird dann automatisch aktiv.

---

## 4. npm-Scripts

| Script                      | Was es tut                                           |
| --------------------------- | ---------------------------------------------------- |
| `npm run dev`               | Dev-Server auf Port 3000                             |
| `npm run build`             | Produktions-Build (inkl. `prisma generate`)          |
| `npm start`                 | Produktions-Server (nach `build`)                    |
| `npm run lint`              | ESLint, **0 Warnungen** Pflicht                      |
| `npm run typecheck`         | `tsc --noEmit`, strict                               |
| `npm run format`            | Prettier auf alle Dateien anwenden                   |
| `npm run db:migrate`        | Neue Migration anlegen + ausführen (dev)             |
| `npm run db:migrate:deploy` | Migrationen in Produktion ausführen                  |
| `npm run db:seed`           | Beispiel-Daten einspielen (nicht in Production!)     |
| `npm run db:fts:init`       | Postgres-FTS-Spalte + GIN-Index anlegen (idempotent) |
| `npm run db:reset`          | DB löschen + neu migrieren + seeden (dev)            |
| `npm run db:studio`         | Prisma Studio (DB-Browser auf Port 5555)             |
| `npm run email:dev`         | React-Email-Preview auf Port 3001                    |

Pre-Commit: Husky + lint-staged formatieren und linten geänderte
Dateien automatisch.

---

## 5. Stripe-Webhooks lokal testen

```bash
# In einem zweiten Terminal:
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Die CLI gibt ein `whsec_…` aus – dieses als `STRIPE_WEBHOOK_SECRET` in
`.env` eintragen und den Dev-Server neu starten.

**Test-Karte (Stripe Test-Modus):** `4242 4242 4242 4242`, beliebiges
Ablaufdatum in der Zukunft, beliebige CVC und PLZ.

Nach einer erfolgreichen Test-Zahlung sollte:

- Der Stripe-CLI `200 OK` für `checkout.session.completed` zeigen.
- Die Order in `prisma studio` von `PENDING` auf `PAID` springen.
- Der Lagerbestand der bestellten Produkte sinken.
- Eine Bestätigungs-Mail über Resend rausgehen (nur wenn
  `RESEND_API_KEY` echt ist und die Sender-Domain verifiziert wurde).

---

## 6. Deployment auf Vercel

1. Repository auf GitHub/GitLab pushen (siehe Branch-Konvention im Header).
2. Auf [vercel.com](https://vercel.com) „New Project" → Repo importieren.
3. **Environment Variables** aus `.env.example` setzen
   (für Production andere Werte als Dev nutzen!).
   - `NEXTAUTH_URL` = `https://DEINE-DOMAIN`
   - `NEXT_PUBLIC_SITE_URL` = `https://DEINE-DOMAIN`
   - Stripe **Live**-Keys statt Test-Keys.
4. **Build Command:** `npm run build` (Standard).
5. **Production Branch:** `main` (oder dein Wahl).
6. **Erstes Deployment** durchführen. Danach:
   ```bash
   # Migrationen einmalig auf Produktion ausführen (mit echter DATABASE_URL gesetzt):
   npx prisma migrate deploy
   ```
   (z. B. via `vercel env pull .env.production.local` und dann lokal
   `npx prisma migrate deploy` ausführen.)
7. **Stripe-Webhook-Endpoint** im Stripe-Dashboard hinzufügen:
   `https://DEINE-DOMAIN/api/webhooks/stripe`, Events
   `checkout.session.completed` + `checkout.session.expired`. Das daraus
   generierte `whsec_…` als Vercel-Env-Variable `STRIPE_WEBHOOK_SECRET`
   setzen → Redeploy.
8. **Resend-Sender-Domain** verifizieren (DNS-Records). Erst danach
   kommen Bestätigungs-Mails zuverlässig an.

---

## 7. Rechtliche Hinweise

> **Pflichtlektüre vor Go-Live.**

- Die Templates für **Impressum, Datenschutz, AGB und Widerrufsbelehrung**
  in `app/(storefront)/impressum`, `…/datenschutz`, `…/agb`, `…/widerruf`
  sind **Vorlagen-Stubs** mit Platzhaltern. Sie ersetzen keine
  Rechtsberatung. Vor der Live-Schaltung **anwaltlich prüfen lassen**
  (eRecht24, IT-Recht Kanzlei, lokale Anwält:in deines Vertrauens).
- USt-ID, Inhaberdaten und Telefonnummer in den Templates ersetzen
  (Platzhalter in eckigen Klammern).
- Cookie-Banner ist DSGVO-konform implementiert (Opt-In, keine
  Pre-Selection, Kategorien einzeln wählbar). Tracking-Scripts erst
  nach Consent dynamisch nachladen – Hooks dafür im
  `components/storefront/cookie-banner.tsx`.
- VAT-Strategie (deutsche MwSt bis 10 000 € EU-Umsatz, danach OSS):
  siehe [ADR-001 im PROJECT_PLAN](./PROJECT_PLAN.md#adr-001-vat-strategie-für-eu-weiten-versand).
  Steuerberatung empfohlen, bevor die Schwelle erreicht wird.

---

## 8. Roadmap & bekannte Einschränkungen

### Phase 2 (jetzt enthalten)

- Postgres-Volltextsuche (FTS) mit `german`-Dictionary, GIN-Index,
  Relevanz-Sortierung. Setup über `npm run db:fts:init`.
- Produktliste mit Filter (Kategorie / Preis / Verfügbarkeit), Sortierung
  (Neu / Preis ↑↓ / Name) und Pagination via URL-Parameter.
- Wunschliste pro User mit Heart-Button auf Card + Detail-Seite.
- Bewertungen mit Verified-Kauf-Badge, Sterne-Verteilung,
  AggregateRating-JSON-LD. Foto-URLs sind im Schema und im Schema-Validator
  vorgesehen; die Upload-UI selbst (UploadThing) ist als Phase-2.5-Erweiterung
  ausgelassen, weil sie einen weiteren Drittdienst braucht.
- Newsletter mit Double-Opt-In via Resend (`/newsletter/bestaetigen`,
  `/newsletter/abmelden`), Consent-Tracking (IP, UA, Zeit).
- Rabattcodes (prozentual + fix), Mindestbestellwert, Max-Redemptions,
  Gültigkeitsfenster. Wird im Cart und Checkout angezeigt, beim
  Stripe-Checkout proportional auf die Line-Items verteilt.
- Inhaltsseiten: `/ueber-uns`, `/faq` (mit FAQPage-JSON-LD), `/versand`,
  `/kontakt` (mit Honeypot + Rate-Limit, Speicherung in `ContactMessage`).

### Bewusst nicht in Phase 2

- **UploadThing-Integration für Review-Fotos** → Phase 2.5. Schema und
  Validator sind bereits darauf vorbereitet (`ReviewImage`, `imageUrls`).
- **Admin-Panel** (Produkt-CRUD, Bestell-Workflow, Kundenliste,
  Rabattcode-Verwaltung, Newsletter-Empfänger-Liste, Kontakt-Inbox)
  → Phase 3.
- **Lagerreservierung beim Checkout-Start mit Timeout-Release** → Phase 3.
- **Mini-Analytics** (Umsatz/Monat, Top-Produkte) → Phase 3.
- **Mehrsprachigkeit, Framer-Motion-Polish, Pinterest-Galerie,
  Quick-View-Modal** → Phase 4.

### Bekannte Einschränkungen

- **Rate-Limiter** läuft in-memory – funktioniert nur sauber bei einer
  Server-Instanz. Auf Vercel Serverless empfiehlt sich Upstash Ratelimit
  (vorgesehen für Phase 3-Hardening).
- **Bilder im Seed** stammen von Unsplash – **dürfen nicht im Shop als
  „eigene Produkte" verkauft werden**. Vor Go-Live durch echte
  Produktfotos ersetzen.
- **Google OAuth** ist im Code vorbereitet, aber nur aktiv, wenn
  `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` gesetzt sind.
- **EU-Versand** rechnet aktuell pauschal deutsche MwSt (siehe ADR-001).
  Sobald 10 000 € EU-Umsatz/Jahr erreicht, ist OSS-Pflicht.
- **Gast-Cart-Cleanup** erfolgt noch nicht automatisch – TTL ist im
  Schema, ein Cron-Job (z. B. via Vercel Cron in Phase 3) löscht
  abgelaufene Carts.
- **Stripe-Rabattdarstellung:** Da Stripe keine negativen Line-Items
  zulässt und Coupons globale Objekte sind, verteilen wir den
  Rabatt-Betrag proportional auf die Line-Items, bevor wir sie an die
  Checkout Session übergeben. Die `Order` im eigenen DB-Schema enthält
  die ursprünglichen Beträge plus `discountCents`-Snapshot – die
  Buchhaltung ist also korrekt; der Stripe-Beleg zeigt aber bereits
  reduzierte Stückpreise.

---

## Lizenz

Privates Projekt, keine Open-Source-Lizenz vergeben. Wende dich an die
Eigentümerin, wenn du Teile wiederverwenden möchtest.
