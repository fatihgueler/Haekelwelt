using Haekelwelt.Blazor.Data;
using Haekelwelt.Blazor.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Haekelwelt.Blazor.Services;

public class ProductService(ApplicationDbContext db)
{
    public enum SortOption
    {
        Newest,
        PriceAsc,
        PriceDesc,
        TitleAsc,
    }

    public record ListInput(
        string? Query = null,
        IReadOnlyList<string>? CategorySlugs = null,
        int? MinCents = null,
        int? MaxCents = null,
        bool InStockOnly = false,
        SortOption Sort = SortOption.Newest,
        int Page = 1,
        int PerPage = 24);

    public record ListResult(
        IReadOnlyList<Product> Items,
        int Total,
        int Page,
        int PerPage,
        int PageCount);

    public async Task<ListResult> ListAsync(ListInput input, CancellationToken ct = default)
    {
        var page = Math.Max(1, input.Page);
        var perPage = Math.Clamp(input.PerPage, 1, 60);

        IQueryable<Product> q = db.Products
            .Include(p => p.Images.OrderBy(i => i.SortOrder).Take(1))
            .Include(p => p.Category)
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(input.Query))
        {
            var like = $"%{input.Query.Trim()}%";
            q = q.Where(p => EF.Functions.Like(p.Title, like) || EF.Functions.Like(p.Description, like));
        }
        if (input.CategorySlugs is { Count: > 0 })
        {
            q = q.Where(p => input.CategorySlugs.Contains(p.Category.Slug));
        }
        if (input.MinCents.HasValue) q = q.Where(p => p.PriceCents >= input.MinCents);
        if (input.MaxCents.HasValue) q = q.Where(p => p.PriceCents <= input.MaxCents);
        if (input.InStockOnly) q = q.Where(p => p.Stock > 0);

        q = input.Sort switch
        {
            SortOption.PriceAsc => q.OrderBy(p => p.PriceCents),
            SortOption.PriceDesc => q.OrderByDescending(p => p.PriceCents),
            SortOption.TitleAsc => q.OrderBy(p => p.Title),
            _ => q.OrderByDescending(p => p.CreatedAt),
        };

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * perPage).Take(perPage).ToListAsync(ct);
        var pageCount = Math.Max(1, (int)Math.Ceiling(total / (double)perPage));
        return new ListResult(items, total, page, perPage, pageCount);
    }

    public Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        db.Products
            .Include(p => p.Images.OrderBy(i => i.SortOrder))
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive, ct);

    public Task<Category?> GetCategoryBySlugAsync(string slug, CancellationToken ct = default) =>
        db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public Task<List<Category>> ListCategoriesAsync(CancellationToken ct = default) =>
        db.Categories.OrderBy(c => c.SortOrder).ToListAsync(ct);

    public Task<List<Product>> ListFeaturedAsync(int take = 8, CancellationToken ct = default) =>
        db.Products
            .Include(p => p.Images.OrderBy(i => i.SortOrder).Take(1))
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Take(take)
            .ToListAsync(ct);

    // ---------- Admin-CRUD ----------

    public Task<List<Product>> ListAllForAdminAsync(CancellationToken ct = default) =>
        db.Products
            .Include(p => p.Images.OrderBy(i => i.SortOrder).Take(1))
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public Task<Product?> GetByIdAsync(string id, CancellationToken ct = default) =>
        db.Products
            .Include(p => p.Images.OrderBy(i => i.SortOrder))
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Product> CreateAsync(
        Product product,
        string? imageUrl,
        string? imageAlt,
        CancellationToken ct = default)
    {
        product.Slug = CategoryService.NormalizeSlug(product.Slug);
        if (await db.Products.AnyAsync(p => p.Slug == product.Slug, ct))
        {
            throw new InvalidOperationException($"Slug \"{product.Slug}\" ist bereits vergeben.");
        }
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        product.Images.Clear();
        if (!string.IsNullOrWhiteSpace(imageUrl))
        {
            product.Images.Add(new ProductImage
            {
                Url = imageUrl.Trim(),
                Alt = string.IsNullOrWhiteSpace(imageAlt) ? product.Title : imageAlt.Trim(),
                SortOrder = 0,
            });
        }
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);
        return product;
    }

    public async Task<Product> UpdateAsync(
        string id,
        Action<Product> mutate,
        string? imageUrl,
        string? imageAlt,
        CancellationToken ct = default)
    {
        var existing = await db.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new InvalidOperationException("Produkt nicht gefunden.");

        mutate(existing);
        existing.Slug = CategoryService.NormalizeSlug(existing.Slug);
        existing.UpdatedAt = DateTime.UtcNow;

        if (await db.Products.AnyAsync(p => p.Slug == existing.Slug && p.Id != id, ct))
        {
            throw new InvalidOperationException($"Slug \"{existing.Slug}\" ist bereits vergeben.");
        }

        // Bild updaten: einfaches Modell – immer das erste Bild ersetzen.
        if (!string.IsNullOrWhiteSpace(imageUrl))
        {
            var first = existing.Images.OrderBy(i => i.SortOrder).FirstOrDefault();
            if (first is null)
            {
                existing.Images.Add(new ProductImage
                {
                    Url = imageUrl.Trim(),
                    Alt = string.IsNullOrWhiteSpace(imageAlt) ? existing.Title : imageAlt.Trim(),
                    SortOrder = 0,
                });
            }
            else
            {
                first.Url = imageUrl.Trim();
                first.Alt = string.IsNullOrWhiteSpace(imageAlt) ? existing.Title : imageAlt.Trim();
            }
        }

        await db.SaveChangesAsync(ct);
        return existing;
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var existing = await db.Products
            .Include(p => p.OrderItems)
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new InvalidOperationException("Produkt nicht gefunden.");

        // Wenn das Produkt bereits in Bestellungen referenziert ist, lieber
        // deaktivieren statt löschen (Order-Snapshot bleibt erhalten,
        // Position taucht aber nicht mehr im Shop auf).
        if (existing.OrderItems.Count > 0)
        {
            existing.IsActive = false;
            existing.Stock = 0;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            db.Products.Remove(existing);
        }
        await db.SaveChangesAsync(ct);
    }
}
