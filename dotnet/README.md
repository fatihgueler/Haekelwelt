# Häkelwelt – Blazor Web App (.NET 8)

Zweite Stack-Variante neben der Next.js-Hauptversion (`/` im Repo-Root).
**Läuft sofort** in JetBrains Rider oder Visual Studio mit `dotnet run`,
ohne Docker, ohne Postgres, ohne npm. SQLite-Datei wird beim Start automatisch
angelegt + geseedet.

## In 60 Sekunden starten

### JetBrains Rider

1. **File → Open** → `dotnet/Haekelwelt.Blazor.sln` öffnen.
2. Rider lädt NuGet-Pakete automatisch (Status unten rechts „Restoring…").
3. Run-Config oben rechts auf **„Haekelwelt.Blazor: http"** stellen.
4. **Play** drücken (oder Shift+F10).

Beim ersten Start passiert:
- SQLite-Datei `Haekelwelt.Blazor/haekelwelt.db` wird angelegt.
- Schema via `EnsureCreated` erstellt.
- 4 Kategorien, 12 Produkte, 2 Test-User werden geseedet.
- Browser öffnet `http://localhost:5234`.

### Kommandozeile (falls Rider mal nicht mag)

```bash
cd dotnet
dotnet restore
dotnet run --project Haekelwelt.Blazor
# → http://localhost:5234
```

Erfordert **.NET 8 SDK** (`dotnet --version` zeigt `8.x`).
Download: https://dotnet.microsoft.com/download/dotnet/8.0

## Was nach dem ersten Start passiert

Beim Start sind die DB **leer** – nur eine einzelne Admin-Anmeldung wird angelegt,
damit du dich einloggen und Inhalte pflegen kannst. **Keine Beispiel-Produkte,
keine Kategorien, keine Testkund:innen.**

| Standard-Admin-Login (bitte sofort ändern!)  |                 |
| -------------------------------------------- | --------------- |
| E-Mail                                       | `admin@haekelwelt.local` |
| Passwort                                     | `Admin123!`     |

Eigene Admin-Daten überschreiben (empfohlen für Production), in
`appsettings.Development.json` oder als Environment-Variable:

```json
{
  "Admin": {
    "Email": "deine@email.de",
    "Password": "DeinSicheresPasswort1!"
  }
}
```

Bestandskund:innen registrieren sich selbst über `/register`.

## Workflow für die Shop-Inhaber:in

1. Mit dem Admin-Login einloggen → oben rechts erscheint **„Admin"**.
2. Unter **/admin/kategorien** mindestens eine Kategorie anlegen (z. B. „Amigurumi",
   „Heimdeko"). Slug wird automatisch aus dem Namen erzeugt.
3. Unter **/admin/produkte** Produkte anlegen: Titel, Beschreibung, Preis in €,
   Bestand, Kategorie, Bild-URL.
4. Sobald **„Im Shop anzeigen"** angehakt ist und Bestand > 0, erscheint
   das Produkt im Storefront unter `/produkte` und auf der Startseite.

Produkte mit bereits getätigten Bestellungen werden beim Löschen automatisch
nur deaktiviert (`IsActive = false`) – die Bestell-Historie bleibt intakt.

## Architektur

```
dotnet/
├── Haekelwelt.Blazor.sln                Solution
├── Haekelwelt.Blazor/                   Server-Projekt (Microsoft.NET.Sdk.Web)
│   ├── Program.cs                       App-Bootstrap + DI + Pipeline
│   ├── Components/                      Razor-Komponenten
│   │   ├── App.razor                    HTML-Shell
│   │   ├── Routes.razor                 Router
│   │   ├── Layout/                      Header, Footer, MainLayout
│   │   ├── Pages/                       Home, ProductList, ProductDetail,
│   │   │                                Cart, Checkout, Account, Wishlist,
│   │   │                                Ueber, Faq, Versand, Kontakt + Legal
│   │   ├── Account/                     Login, Register, AuthLayout
│   │   └── Shared/                      ProductCard, RedirectToLogin
│   ├── Data/                            EF Core
│   │   ├── ApplicationDbContext.cs      DbContext + Indizes
│   │   ├── Entities/                    User, Category, Product, Cart,
│   │   │                                Order, WishlistItem, Review
│   │   └── SeedData.cs                  Init-Daten
│   ├── Services/                        ProductService, CartService,
│   │                                    WishlistService, OrderService,
│   │                                    PricingService, CurrentUserService
│   ├── wwwroot/app.css                  Eigenständiges CSS (kein Tailwind)
│   └── appsettings.json                 Connection-String, Site-Config
└── Haekelwelt.Blazor.Client/            WebAssembly-Projekt (Stub für
                                         späteres Auto-Rendering)
```

## Render-Modi

Aktuell:
- Alle Pages mit Interaktivität (Cart, Wishlist, Detail) sind als
  `@rendermode InteractiveServer` markiert → läuft über SignalR.
- Login/Register/Kontakt sind reine SSR-Forms mit `method="post"` und
  `EditForm OnValidSubmit` – Form-Posts werden vom Blazor-Form-Handler
  abgearbeitet.
- Statische Inhaltsseiten (Über, FAQ, Legal) sind reines SSR.

**Auto-Rendering aktivieren** (WebAssembly-Hydration als Add-on):

1. Interaktive Komponenten in `Haekelwelt.Blazor.Client/Components/`
   verschieben (oder dort neu anlegen).
2. Datenzugriff über Minimal-APIs in `Program.cs` ausliefern
   (statt direkt `DbContext` zu nutzen – WASM hat keinen DB-Zugriff).
3. In den Pages `@rendermode InteractiveAuto` setzen.

Dieser Schritt ist absichtlich nicht im aktuellen Stand enthalten,
um „läuft sofort" zu garantieren.

## Datenbank

- **SQLite** in `Haekelwelt.Blazor/haekelwelt.db` (relativ zur EXE-Location).
- Bei jedem Start: `EnsureCreatedAsync()` + `SeedData.RunAsync()`.
- **Schema-Änderung** in den Entity-Klassen → Datei löschen und neu starten.
  Für richtige EF-Migrationen:
  ```bash
  cd dotnet/Haekelwelt.Blazor
  dotnet ef migrations add InitialCreate
  dotnet ef database update
  ```
  Dann in `Program.cs` `EnsureCreatedAsync()` durch `MigrateAsync()` ersetzen.

DB-Browser in Rider: **View → Tool Windows → Database → + → SQLite
Data Source → File** → `dotnet/Haekelwelt.Blazor/haekelwelt.db`.

## Feature-Status

✅ Storefront: Home, Produktliste mit Suche/Sortierung/Pagination,
  Produktdetail, Kategorieseiten
✅ Cart (Gast via Cookie-Token, User via DB, Merge bei Login)
✅ Checkout (Order wird in Demo direkt als bezahlt verbucht –
  Stripe-Integration ist Phase 2 für Blazor)
✅ Auth (ASP.NET Core Identity, Cookie-Auth, Login/Register/Logout)
✅ Wunschliste (toggle-Button auf Card + Detail-Seite)
✅ Inhaltsseiten (Über uns, FAQ, Versand, Kontakt mit Honeypot)
✅ Rechtstexte (Stubs mit Anwalt-Hinweis)

⏳ Phase 2 für Blazor:
- Stripe.NET-Integration für echte Zahlung
- MailKit / Resend.NET für Bestätigungsmails
- Reviews-UI (Entity existiert, UI fehlt)
- Discount-Codes
- Newsletter Double-Opt-In
- Admin-Panel
- Volltextsuche via SQLite FTS5

## Bekannte Einschränkungen

- **Stripe-Checkout**: Demo bucht Orders direkt als `Paid` – kein
  Provider-Roundtrip. Für Production `Stripe.net` einbinden und
  `OrderService.PlaceAsync` so umbauen, dass es eine
  `Stripe.Checkout.Session` erstellt und die Order auf `Pending` lässt
  (genau wie in der Next.js-Variante).
- **E-Mail**: Es werden keine Bestätigungsmails versendet. Für Production
  `MailKit` oder `Resend.NET` in einen `EmailService` einbauen und
  in `OrderService.PlaceAsync` aufrufen.
- **Rate-Limiting**: Aktuell keins. Bei öffentlicher Auslieferung
  `Microsoft.AspNetCore.RateLimiting` aktivieren.
- **Volltextsuche**: nutzt aktuell `LIKE %query%` – ausreichend für
  wenige hundert Produkte. Upgrade auf SQLite FTS5 ist möglich.
- **Auto-Rendering** ist nicht aktiv (siehe oben).
- **Bilder**: Unsplash-URLs im Seed – vor Live-Schaltung durch eigene
  Produktfotos ersetzen.

## Verhältnis zur Next.js-Hauptversion

Beide Stacks teilen Produktdaten-Konventionen (Brutto-Preise in Cents,
deutsche MwSt, 4 Kategorien, gleiches Brand-Design), aber sie sind
**unabhängig**:

- Next.js-Branch (`/`): production-track mit Stripe, Resend, Postgres,
  Phase 1+2-Features (Search, Reviews, Newsletter, Rabatt).
- Blazor-Variante (`/dotnet`): Rider-freundliche zweite Implementierung,
  läuft offline, ohne externe Services.

Die README im Repo-Root bezieht sich auf die Next.js-Variante.
