using System.ComponentModel.DataAnnotations;

namespace Haekelwelt.Blazor.Data.Entities;

public enum TaxRate
{
    Standard = 19,
    Reduced = 7,
}

public class Product
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required, MaxLength(120)]
    public string Slug { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public int PriceCents { get; set; }
    public TaxRate TaxRate { get; set; } = TaxRate.Standard;
    public int Stock { get; set; }
    public int? WeightGrams { get; set; }
    public bool IsActive { get; set; } = true;

    [Required]
    public string CategoryId { get; set; } = string.Empty;
    public Category Category { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class ProductImage
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string ProductId { get; set; } = string.Empty;
    public Product Product { get; set; } = null!;

    [Required, MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Alt { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
