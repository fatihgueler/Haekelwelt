using System.ComponentModel.DataAnnotations;

namespace Haekelwelt.Blazor.Data.Entities;

public enum OrderStatus
{
    Pending,
    Paid,
    Shipped,
    Completed,
    Cancelled,
    Refunded,
}

public class Order
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required, MaxLength(40)]
    public string Number { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    [Required, MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    public int SubtotalCents { get; set; }
    public int TaxCents { get; set; }
    public int ShippingCents { get; set; }
    public int TotalCents { get; set; }

    [MaxLength(8)]
    public string Currency { get; set; } = "EUR";

    [MaxLength(80)]
    public string ShippingMethod { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string ShippingFirstName { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string ShippingLastName { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string ShippingLine1 { get; set; } = string.Empty;

    [MaxLength(160)]
    public string? ShippingLine2 { get; set; }

    [Required, MaxLength(20)]
    public string ShippingPostalCode { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string ShippingCity { get; set; } = string.Empty;

    [Required, MaxLength(2)]
    public string ShippingCountry { get; set; } = "DE";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? ShippedAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string OrderId { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;

    public string? ProductId { get; set; }
    public Product? Product { get; set; }

    [Required, MaxLength(160)]
    public string TitleSnapshot { get; set; } = string.Empty;

    public int PriceCentsSnapshot { get; set; }
    public TaxRate TaxRateSnapshot { get; set; }
    public int Quantity { get; set; }
    public int LineSubtotalCents { get; set; }
    public int LineTaxCents { get; set; }

    [MaxLength(500)]
    public string? ImageUrlSnapshot { get; set; }
}
