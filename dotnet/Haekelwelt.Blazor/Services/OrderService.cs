using System.Security.Cryptography;
using Haekelwelt.Blazor.Data;
using Haekelwelt.Blazor.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Haekelwelt.Blazor.Services;

public class OrderService(
    ApplicationDbContext db,
    CartService cartService,
    PricingService pricing,
    CurrentUserService currentUser)
{
    public record CheckoutInput(
        string Email,
        string FirstName,
        string LastName,
        string Line1,
        string? Line2,
        string PostalCode,
        string City,
        string Country);

    public async Task<Order> PlaceAsync(CheckoutInput input, CancellationToken ct = default)
    {
        var cart = await cartService.GetCurrentAsync(ct)
            ?? throw new InvalidOperationException("Dein Warenkorb ist leer.");

        if (cart.Items.Count == 0)
            throw new InvalidOperationException("Dein Warenkorb ist leer.");

        foreach (var item in cart.Items)
        {
            if (!item.Product.IsActive)
                throw new InvalidOperationException(
                    $"\"{item.Product.Title}\" ist nicht mehr verfügbar.");
            if (item.Quantity > item.Product.Stock)
                throw new InvalidOperationException(
                    $"\"{item.Product.Title}\" ist nur noch {item.Product.Stock} mal verfügbar.");
        }

        var breakdown = pricing.PriceCart(
            cart.Items.Select(i => new PricingService.Line(i.Product.PriceCents, i.Quantity, i.Product.TaxRate)),
            input.Country);

        var userId = await currentUser.GetIdAsync();

        var order = new Order
        {
            Number = BuildOrderNumber(),
            Status = OrderStatus.Paid, // Demo: ohne Stripe direkt als bezahlt markieren.
            UserId = userId,
            Email = input.Email,
            SubtotalCents = breakdown.SubtotalCents,
            TaxCents = breakdown.TaxCents,
            ShippingCents = breakdown.ShippingCents,
            TotalCents = breakdown.TotalCents,
            Currency = "EUR",
            ShippingMethod = input.Country.ToUpperInvariant() == "DE" ? "DHL Paket Deutschland" : "DHL Paket EU",
            ShippingFirstName = input.FirstName,
            ShippingLastName = input.LastName,
            ShippingLine1 = input.Line1,
            ShippingLine2 = input.Line2,
            ShippingPostalCode = input.PostalCode,
            ShippingCity = input.City,
            ShippingCountry = input.Country.ToUpperInvariant(),
            PaidAt = DateTime.UtcNow,
            Items = cart.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                TitleSnapshot = i.Product.Title,
                PriceCentsSnapshot = i.Product.PriceCents,
                TaxRateSnapshot = i.Product.TaxRate,
                Quantity = i.Quantity,
                LineSubtotalCents = i.Product.PriceCents * i.Quantity,
                LineTaxCents = PricingService.LineTaxFromGross(i.Product.PriceCents * i.Quantity, i.Product.TaxRate),
                ImageUrlSnapshot = i.Product.Images.OrderBy(im => im.SortOrder).FirstOrDefault()?.Url,
            }).ToList(),
        };

        // Bestand reduzieren
        foreach (var item in cart.Items)
        {
            item.Product.Stock -= item.Quantity;
        }

        db.Orders.Add(order);
        await cartService.ClearAsync(cart.Id, ct);
        await db.SaveChangesAsync(ct);
        return order;
    }

    public Task<Order?> GetByIdAsync(string id, CancellationToken ct = default) =>
        db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<List<Order>> ListForUserAsync(int take = 5, CancellationToken ct = default)
    {
        var userId = await currentUser.GetIdAsync();
        if (userId is null) return new List<Order>();
        return await db.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Take(take)
            .ToListAsync(ct);
    }

    private static string BuildOrderNumber()
    {
        var year = DateTime.UtcNow.Year;
        var rand = RandomNumberGenerator.GetInt32(0, 100000);
        return $"HW-{year}-{rand:D5}";
    }
}
