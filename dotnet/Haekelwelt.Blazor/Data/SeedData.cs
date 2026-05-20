using Haekelwelt.Blazor.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Haekelwelt.Blazor.Data;

public static class SeedData
{
    public static async Task RunAsync(IServiceProvider sp)
    {
        var db = sp.GetRequiredService<ApplicationDbContext>();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole>>();

        await SeedRolesAsync(roleManager);
        await SeedUsersAsync(userManager);
        await SeedCatalogAsync(db);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        foreach (var role in new[] { "Admin", "Customer" })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        var users = new[]
        {
            (Email: "admin@haekelwelt.local", Name: "Häkelwelt Admin", Password: "Admin123!", Role: "Admin"),
            (Email: "kunde@haekelwelt.local", Name: "Mira Mustermann", Password: "Kunde123!", Role: "Customer"),
        };

        foreach (var u in users)
        {
            if (await userManager.FindByEmailAsync(u.Email) is not null) continue;
            var user = new ApplicationUser
            {
                UserName = u.Email,
                Email = u.Email,
                EmailConfirmed = true,
                DisplayName = u.Name,
            };
            var result = await userManager.CreateAsync(user, u.Password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, u.Role);
            }
        }
    }

    private static async Task SeedCatalogAsync(ApplicationDbContext db)
    {
        if (await db.Categories.AnyAsync()) return;

        var categories = new[]
        {
            new Category { Slug = "amigurumi", Name = "Amigurumi", Description = "Liebevoll gehäkelte Tiere, Figuren und Freunde fürs Leben.", SortOrder = 1 },
            new Category { Slug = "heimdeko", Name = "Heimdeko", Description = "Decken, Kissen und Wandobjekte für ein warmes Zuhause.", SortOrder = 2 },
            new Category { Slug = "accessoires", Name = "Accessoires", Description = "Mützen, Schals und Taschen aus weichen Naturfasern.", SortOrder = 3 },
            new Category { Slug = "babys-und-kinder", Name = "Babys & Kinder", Description = "Sanfte Begleiter und kuschelige Kleinigkeiten für die Kleinsten.", SortOrder = 4 },
        };
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();

        var bySlug = categories.ToDictionary(c => c.Slug, c => c.Id);

        string Img(string id) => $"https://images.unsplash.com/{id}?auto=format&fit=crop&w=1200&q=80";

        var products = new (string Slug, string Title, string Description, int PriceCents, int Stock, string CategorySlug, string ImageId, string Alt)[]
        {
            ("kuschelhase-luna", "Kuschelhase Luna",
             "Ein zarter Häschen-Freund aus weicher Baumwolle. Jeder Hase wird einzeln gehäkelt und mit antiallergener Füllung bestückt – perfekt zum Schmusen, Spielen oder Verschenken.\n\nHöhe: ca. 22 cm.",
             4900, 3, "amigurumi", "photo-1602250916380-2c8bf94b96fc", "Kuschelhase aus Baumwolle in Rosé"),

            ("amigurumi-fuchs-finja", "Amigurumi Fuchs Finja",
             "Finja, die kleine Häkelfüchsin, mit buschigem Schwanz und freundlichem Lächeln.",
             5400, 1, "amigurumi", "photo-1582719471384-894fbb16e074", "Fuchs Amigurumi in Orange und Weiß"),

            ("baeren-paar-pino-pina", "Bären-Paar Pino & Pina",
             "Zwei kleine Bären, die zusammengehören – aber auch einzeln erhältlich sind.",
             6900, 2, "amigurumi", "photo-1564466809058-bf4114d55352", "Häkelbären in Beige"),

            ("granny-square-decke-herbst", "Granny-Square-Decke „Herbst\"",
             "Eine Patchwork-Decke aus 100 Granny Squares in Tönen von Senf, Terracotta und Salbei. Maße: ca. 150 × 180 cm.",
             24900, 1, "heimdeko", "photo-1583845112203-29329902332e", "Granny-Square-Decke in Herbstfarben"),

            ("kissenhuelle-rippenstrick", "Kissenhülle Rippenstrick",
             "Strukturierte Häkelhülle mit Rippenmuster und Holzknöpfen, passt auf jedes 40×40-cm-Kissen.",
             6900, 4, "heimdeko", "photo-1493663284031-b7e3aefcae8e", "Beige Kissenhülle aus Wolle"),

            ("wandbehang-sonnenaufgang", "Wandbehang „Sonnenaufgang\"",
             "Boho-Wandbehang aus Naturbaumwolle mit gehäkeltem Sonnenmotiv und Treibholz-Stab.",
             7900, 2, "heimdeko", "photo-1616627988032-21b2cdc8f06b", "Boho-Wandbehang in Beige"),

            ("wollmuetze-cosima", "Wollmütze „Cosima\"",
             "Weiche Mütze aus Alpaka-Mischgarn, Innenfutter aus Baumwolle.",
             3900, 5, "accessoires", "photo-1576566588028-4147f3842f27", "Beige Wollmütze"),

            ("umhaengetasche-mira", "Umhängetasche „Mira\"",
             "Stylische Häkeltasche mit Leder-Trageriemen. Maße: ca. 28 × 22 cm.",
             8900, 2, "accessoires", "photo-1591561954557-26941169b49e", "Häkeltasche in Naturweiß"),

            ("schal-waldspaziergang", "Schal „Waldspaziergang\"",
             "Langer Schal in Moos- und Erdtönen, gehäkelt mit lockerem Stäbchen-Muster.",
             5900, 3, "accessoires", "photo-1520903920243-00d872a2d1c9", "Grüner Wollschal"),

            ("baby-mobile-mond-und-sterne", "Baby-Mobile „Mond & Sterne\"",
             "Sanft schaukelndes Mobile mit Mond, Wolken und kleinen Sternen aus Baumwolle.",
             6900, 2, "babys-und-kinder", "photo-1519689680058-324335c77eba", "Baby-Mobile aus Häkelfiguren"),

            ("babyschuhe-erste-schritte", "Babyschuhe „Erste Schritte\"",
             "Weiche Babyschuhe für die ersten Krabbelversuche. 100 % Baumwolle.",
             2900, 5, "babys-und-kinder", "photo-1522771739844-6a9f6d5f14af", "Babyschuhe in Pastellfarben"),

            ("kuscheltier-elefant-emil", "Kuscheltier Elefant „Emil\"",
             "Großer Häkelelefant für lange Freundschaften.",
             5900, 3, "babys-und-kinder", "photo-1620207418302-439b387441b0", "Häkelelefant Emil in Grau"),
        };

        foreach (var p in products)
        {
            var product = new Product
            {
                Slug = p.Slug,
                Title = p.Title,
                Description = p.Description,
                PriceCents = p.PriceCents,
                Stock = p.Stock,
                TaxRate = TaxRate.Standard,
                CategoryId = bySlug[p.CategorySlug],
                Images = new List<ProductImage>
                {
                    new() { Url = Img(p.ImageId), Alt = p.Alt, SortOrder = 0 },
                },
            };
            db.Products.Add(product);
        }
        await db.SaveChangesAsync();
    }
}
