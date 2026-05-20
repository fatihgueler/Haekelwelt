using Haekelwelt.Blazor.Data;
using Haekelwelt.Blazor.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Haekelwelt.Blazor.Services;

public class CartService(
    ApplicationDbContext db,
    CartCookieProvider cookies,
    CurrentUserService currentUser)
{
    private const int CartTtlDays = 30;

    public async Task<Cart?> GetCurrentAsync(CancellationToken ct = default)
    {
        var userId = await currentUser.GetIdAsync();

        if (userId is not null)
        {
            var userCart = await LoadAsync(c => c.UserId == userId, ct);
            if (userCart is not null) return userCart;

            // Falls Gast-Cart vorhanden: zusammenführen.
            var guestToken = cookies.Read();
            if (!string.IsNullOrEmpty(guestToken))
            {
                return await MergeGuestIntoUserAsync(guestToken, userId, ct);
            }
            return null;
        }

        var token = cookies.Read();
        if (string.IsNullOrEmpty(token)) return null;
        return await LoadAsync(c => c.Token == token, ct);
    }

    public async Task<Cart> GetOrCreateAsync(CancellationToken ct = default)
    {
        var existing = await GetCurrentAsync(ct);
        if (existing is not null) return existing;

        var userId = await currentUser.GetIdAsync();
        if (userId is not null)
        {
            var created = new Cart
            {
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(CartTtlDays),
            };
            db.Carts.Add(created);
            await db.SaveChangesAsync(ct);
            return await LoadAsync(c => c.Id == created.Id, ct) ?? created;
        }

        var token = CartCookieProvider.NewToken();
        var cart = new Cart
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(CartTtlDays),
        };
        db.Carts.Add(cart);
        await db.SaveChangesAsync(ct);
        cookies.Write(token);
        return await LoadAsync(c => c.Id == cart.Id, ct) ?? cart;
    }

    public async Task<Cart> AddAsync(string productId, int quantity = 1, CancellationToken ct = default)
    {
        if (quantity < 1) throw new ArgumentException("Menge muss mindestens 1 sein.");
        var product = await db.Products.FindAsync(new object?[] { productId }, ct);
        if (product is null || !product.IsActive)
            throw new InvalidOperationException("Produkt nicht verfügbar.");

        var cart = await GetOrCreateAsync(ct);
        var existing = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        var wanted = (existing?.Quantity ?? 0) + quantity;
        if (wanted > product.Stock)
        {
            throw new InvalidOperationException(
                $"\"{product.Title}\" ist nur noch {product.Stock} mal verfügbar.");
        }

        if (existing is null)
        {
            db.CartItems.Add(new CartItem { CartId = cart.Id, ProductId = productId, Quantity = quantity });
        }
        else
        {
            existing.Quantity = wanted;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        cart.ExpiresAt = DateTime.UtcNow.AddDays(CartTtlDays);
        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return await LoadAsync(c => c.Id == cart.Id, ct) ?? cart;
    }

    public async Task SetQuantityAsync(string itemId, int quantity, CancellationToken ct = default)
    {
        if (quantity < 0) throw new ArgumentException("Menge darf nicht negativ sein.");
        var item = await db.CartItems.Include(i => i.Product).FirstOrDefaultAsync(i => i.Id == itemId, ct);
        if (item is null) throw new InvalidOperationException("Position nicht gefunden.");

        if (quantity == 0)
        {
            db.CartItems.Remove(item);
        }
        else
        {
            if (quantity > item.Product.Stock)
                throw new InvalidOperationException(
                    $"Nur {item.Product.Stock} Stück von \"{item.Product.Title}\" verfügbar.");
            item.Quantity = quantity;
            item.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveAsync(string itemId, CancellationToken ct = default)
    {
        var item = await db.CartItems.FindAsync(new object?[] { itemId }, ct);
        if (item is null) return;
        db.CartItems.Remove(item);
        await db.SaveChangesAsync(ct);
    }

    public async Task ClearAsync(string cartId, CancellationToken ct = default)
    {
        var items = await db.CartItems.Where(i => i.CartId == cartId).ToListAsync(ct);
        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync(ct);
    }

    public async Task<int> CountAsync(CancellationToken ct = default)
    {
        var cart = await GetCurrentAsync(ct);
        return cart?.Items.Sum(i => i.Quantity) ?? 0;
    }

    private Task<Cart?> LoadAsync(System.Linq.Expressions.Expression<Func<Cart, bool>> predicate, CancellationToken ct)
        => db.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .OrderBy(c => c.CreatedAt)
            .FirstOrDefaultAsync(predicate, ct);

    private async Task<Cart?> MergeGuestIntoUserAsync(string guestToken, string userId, CancellationToken ct)
    {
        var guest = await db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.Token == guestToken, ct);
        if (guest is null)
        {
            cookies.Clear();
            return await LoadAsync(c => c.UserId == userId, ct);
        }

        var userCart = await db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.UserId == userId, ct);
        if (userCart is null)
        {
            userCart = new Cart
            {
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(CartTtlDays),
            };
            db.Carts.Add(userCart);
            await db.SaveChangesAsync(ct);
        }

        foreach (var guestItem in guest.Items)
        {
            var product = await db.Products.FindAsync(new object?[] { guestItem.ProductId }, ct);
            if (product is null) continue;
            var existing = userCart.Items.FirstOrDefault(i => i.ProductId == guestItem.ProductId);
            var target = Math.Min((existing?.Quantity ?? 0) + guestItem.Quantity, product.Stock);
            if (target == 0) continue;

            if (existing is null)
            {
                db.CartItems.Add(new CartItem { CartId = userCart.Id, ProductId = guestItem.ProductId, Quantity = target });
            }
            else
            {
                existing.Quantity = target;
                existing.UpdatedAt = DateTime.UtcNow;
            }
        }

        db.Carts.Remove(guest);
        await db.SaveChangesAsync(ct);
        cookies.Clear();
        return await LoadAsync(c => c.Id == userCart.Id, ct);
    }
}
