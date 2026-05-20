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
}
