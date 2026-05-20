using System.Security.Cryptography;

namespace Haekelwelt.Blazor.Services;

/// <summary>
/// Liest und schreibt das Gast-Cart-Cookie. Cacht den Token im Service-Lifetime
/// (Scoped = 1 Circuit), weil HttpContext.Response nach der initialen SSR-Phase
/// in Blazor Server nicht mehr beschreibbar ist. Damit funktioniert der
/// Gast-Cart auch nach der Hydration.
/// </summary>
public class CartCookieProvider(IHttpContextAccessor accessor)
{
    public const string CookieName = "hw_cart";
    public const int MaxAgeSeconds = 30 * 24 * 60 * 60;

    private string? _cachedToken;
    private bool _cacheLoaded;

    public string? Read()
    {
        if (!_cacheLoaded)
        {
            _cachedToken = accessor.HttpContext?.Request.Cookies[CookieName];
            _cacheLoaded = true;
        }
        return _cachedToken;
    }

    public void Write(string token)
    {
        _cachedToken = token;
        _cacheLoaded = true;

        var ctx = accessor.HttpContext;
        if (ctx is not null && !ctx.Response.HasStarted)
        {
            ctx.Response.Cookies.Append(CookieName, token, new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Secure = ctx.Request.IsHttps,
                MaxAge = TimeSpan.FromSeconds(MaxAgeSeconds),
                Path = "/",
            });
        }
    }

    public void Clear()
    {
        _cachedToken = null;
        _cacheLoaded = true;
        var ctx = accessor.HttpContext;
        if (ctx is not null && !ctx.Response.HasStarted)
        {
            ctx.Response.Cookies.Delete(CookieName);
        }
    }

    public static string NewToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(24);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}
