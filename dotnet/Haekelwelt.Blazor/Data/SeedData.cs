using Haekelwelt.Blazor.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace Haekelwelt.Blazor.Data;

/// <summary>
/// Stellt nur das Allernötigste sicher: die zwei Rollen und einen einzigen
/// Admin-Login. Es werden bewusst KEINE Beispiel-Produkte, Beispiel-Kategorien
/// oder Testkund:innen angelegt – die Shop-Inhaber:in pflegt das selbst über
/// den /admin-Bereich.
/// </summary>
public static class SeedData
{
    private const string DefaultAdminEmail = "admin@haekelwelt.local";
    private const string DefaultAdminPassword = "Admin123!";

    public static async Task RunAsync(IServiceProvider sp)
    {
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole>>();
        var config = sp.GetRequiredService<IConfiguration>();

        foreach (var role in new[] { "Admin", "Customer" })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Admin-Daten lassen sich per appsettings / Umgebungsvariablen
        // überschreiben, damit die echte Inhaberin nicht den Default-Login
        // verwenden muss. Bsp. in appsettings.json:
        //   "Admin": { "Email": "...", "Password": "..." }
        var adminEmail = config["Admin:Email"] ?? DefaultAdminEmail;
        var adminPassword = config["Admin:Password"] ?? DefaultAdminPassword;

        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                DisplayName = "Häkelwelt Admin",
            };
            var result = await userManager.CreateAsync(admin, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}
