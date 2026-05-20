using System.ComponentModel.DataAnnotations;

namespace Haekelwelt.Blazor.Data.Entities;

public class Cart
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    // Genau eines von beiden muss gesetzt sein.
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    [MaxLength(64)]
    public string? Token { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string CartId { get; set; } = string.Empty;
    public Cart Cart { get; set; } = null!;

    [Required]
    public string ProductId { get; set; } = string.Empty;
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
