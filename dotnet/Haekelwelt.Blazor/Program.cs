using Haekelwelt.Blazor.Components;
using Haekelwelt.Blazor.Data;
using Haekelwelt.Blazor.Data.Entities;
using Haekelwelt.Blazor.Services;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// SQLite-Datei liegt neben der Executable. Kein Setup nötig –
// EF Core erstellt + migriert sie beim Start automatisch.
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "haekelwelt.db");
var connectionString =
    builder.Configuration.GetConnectionString("Default")
    ?? $"Data Source={dbPath};Cache=Shared";

builder.Services.AddDbContext<ApplicationDbContext>(opt =>
    opt.UseSqlite(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = false;
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireDigit = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services
    .AddAuthentication(IdentityConstants.ApplicationScheme)
    .AddIdentityCookies();

builder.Services.ConfigureApplicationCookie(opt =>
{
    opt.LoginPath = "/login";
    opt.LogoutPath = "/logout";
    opt.AccessDeniedPath = "/login";
    opt.ExpireTimeSpan = TimeSpan.FromDays(30);
    opt.SlidingExpiration = true;
});

builder.Services.AddAuthorization();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider>();

builder.Services.AddHttpContextAccessor();

// Razor Components mit beiden Render-Modi (Server + WebAssembly = Auto).
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

// App-Services
builder.Services.AddScoped<PricingService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<WishlistService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<CurrentUserService>();
builder.Services.AddScoped<CartCookieProvider>();

var app = builder.Build();

// SQLite-Schema beim Start sicherstellen + seeden. EnsureCreatedAsync ist
// idempotent und braucht keine Migrationen – perfekt für lokale Demo. Bei
// Schema-Änderungen: `haekelwelt.db` löschen oder auf EF-Migrationen umstellen
// (siehe README).
using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    var db = sp.GetRequiredService<ApplicationDbContext>();
    await db.Database.EnsureCreatedAsync();
    await SeedData.RunAsync(sp);
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery();
app.UseAuthentication();
app.UseAuthorization();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(Haekelwelt.Blazor.Client.AssemblyMarker).Assembly);

// Endpoint für Logout (HTTP POST). Antiforgery wird deaktiviert, weil das
// schlichte HTML-Form keinen Blazor-Antiforgery-Token mitschickt; SignOut
// ist idempotent und an die Session gebunden.
app.MapPost("/logout", async (
    HttpContext http,
    SignInManager<ApplicationUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    return Results.LocalRedirect("/");
}).DisableAntiforgery();

app.Run();
