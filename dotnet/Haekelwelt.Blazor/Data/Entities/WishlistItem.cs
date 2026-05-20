using System.ComponentModel.DataAnnotations;

namespace Haekelwelt.Blazor.Data.Entities;

public class WishlistItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    [Required]
    public string ProductId { get; set; } = string.Empty;
    public Product Product { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
