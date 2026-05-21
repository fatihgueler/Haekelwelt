using Haekelwelt.Blazor.Data;
using Haekelwelt.Blazor.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Haekelwelt.Blazor.Services;

public class CategoryService(ApplicationDbContext db)
{
    public Task<List<Category>> ListAllAsync(CancellationToken ct = default) =>
        db.Categories.OrderBy(c => c.SortOrder).ThenBy(c => c.Name).ToListAsync(ct);

    public async Task<List<(Category Category, int ProductCount)>> ListAllWithCountsAsync(CancellationToken ct = default)
    {
        var rows = await db.Categories
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new { Cat = c, Count = c.Products.Count })
            .ToListAsync(ct);
        return rows.Select(r => (r.Cat, r.Count)).ToList();
    }

    public Task<Category?> GetByIdAsync(string id, CancellationToken ct = default) =>
        db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public async Task<Category> CreateAsync(Category input, CancellationToken ct = default)
    {
        input.Slug = NormalizeSlug(input.Slug);
        if (await db.Categories.AnyAsync(c => c.Slug == input.Slug, ct))
        {
            throw new InvalidOperationException($"Slug \"{input.Slug}\" ist bereits vergeben.");
        }
        input.CreatedAt = DateTime.UtcNow;
        input.UpdatedAt = DateTime.UtcNow;
        db.Categories.Add(input);
        await db.SaveChangesAsync(ct);
        return input;
    }

    public async Task<Category> UpdateAsync(string id, Action<Category> mutate, CancellationToken ct = default)
    {
        var existing = await db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new InvalidOperationException("Kategorie nicht gefunden.");

        mutate(existing);
        existing.Slug = NormalizeSlug(existing.Slug);
        existing.UpdatedAt = DateTime.UtcNow;

        if (await db.Categories.AnyAsync(c => c.Slug == existing.Slug && c.Id != id, ct))
        {
            throw new InvalidOperationException($"Slug \"{existing.Slug}\" ist bereits vergeben.");
        }

        await db.SaveChangesAsync(ct);
        return existing;
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var existing = await db.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new InvalidOperationException("Kategorie nicht gefunden.");
        if (existing.Products.Count > 0)
        {
            throw new InvalidOperationException(
                $"Kategorie \"{existing.Name}\" enthält noch {existing.Products.Count} Produkt(e). " +
                "Bitte erst die Produkte löschen oder in eine andere Kategorie verschieben.");
        }
        db.Categories.Remove(existing);
        await db.SaveChangesAsync(ct);
    }

    public static string NormalizeSlug(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        var s = raw.Trim().ToLowerInvariant()
            .Replace("ä", "ae", StringComparison.Ordinal)
            .Replace("ö", "oe", StringComparison.Ordinal)
            .Replace("ü", "ue", StringComparison.Ordinal)
            .Replace("ß", "ss", StringComparison.Ordinal);
        var sb = new System.Text.StringBuilder(s.Length);
        var lastDash = false;
        foreach (var ch in s)
        {
            if ((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9'))
            {
                sb.Append(ch);
                lastDash = false;
            }
            else if (!lastDash)
            {
                sb.Append('-');
                lastDash = true;
            }
        }
        return sb.ToString().Trim('-');
    }
}
