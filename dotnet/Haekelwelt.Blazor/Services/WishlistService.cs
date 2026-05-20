using Haekelwelt.Blazor.Data;
using Haekelwelt.Blazor.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Haekelwelt.Blazor.Services;

public class WishlistService(ApplicationDbContext db, CurrentUserService currentUser)
{
    public async Task<HashSet<string>> GetProductIdsAsync(CancellationToken ct = default)
    {
        var userId = await currentUser.GetIdAsync();
        if (userId is null) return new HashSet<string>();
        var rows = await db.WishlistItems
            .Where(w => w.UserId == userId)
            .Select(w => w.ProductId)
            .ToListAsync(ct);
        return new HashSet<string>(rows);
    }

    public async Task<List<WishlistItem>> ListAsync(CancellationToken ct = default)
    {
        var userId = await currentUser.GetIdAsync();
        if (userId is null) return new List<WishlistItem>();
        return await db.WishlistItems
            .Include(w => w.Product)
                .ThenInclude(p => p.Images)
            .Include(w => w.Product)
                .ThenInclude(p => p.Category)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(ct);
    }

    /// <summary>true = jetzt auf Wunschliste, false = entfernt.</summary>
    public async Task<bool> ToggleAsync(string productId, CancellationToken ct = default)
    {
        var userId = await currentUser.GetIdAsync()
            ?? throw new InvalidOperationException("Bitte zuerst anmelden.");

        var existing = await db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId, ct);
        if (existing is not null)
        {
            db.WishlistItems.Remove(existing);
            await db.SaveChangesAsync(ct);
            return false;
        }
        db.WishlistItems.Add(new WishlistItem { UserId = userId, ProductId = productId });
        await db.SaveChangesAsync(ct);
        return true;
    }
}
