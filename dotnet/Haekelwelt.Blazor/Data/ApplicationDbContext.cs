using Haekelwelt.Blazor.Data.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Haekelwelt.Blazor.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Category>(c =>
        {
            c.HasIndex(x => x.Slug).IsUnique();
            c.HasIndex(x => x.SortOrder);
        });

        builder.Entity<Product>(p =>
        {
            p.HasIndex(x => x.Slug).IsUnique();
            p.HasIndex(x => x.CategoryId);
            p.HasIndex(x => x.IsActive);
            p.HasIndex(x => x.CreatedAt);
            p.HasOne(x => x.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ProductImage>(i =>
        {
            i.HasOne(x => x.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            i.HasIndex(x => new { x.ProductId, x.SortOrder });
        });

        builder.Entity<Cart>(c =>
        {
            c.HasIndex(x => x.UserId).IsUnique();
            c.HasIndex(x => x.Token).IsUnique();
            c.HasIndex(x => x.ExpiresAt);
            c.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<CartItem>(i =>
        {
            i.HasIndex(x => new { x.CartId, x.ProductId }).IsUnique();
            i.HasOne(x => x.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);
            i.HasOne(x => x.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Order>(o =>
        {
            o.HasIndex(x => x.Number).IsUnique();
            o.HasIndex(x => x.UserId);
            o.HasIndex(x => x.Status);
            o.HasIndex(x => x.CreatedAt);
            o.HasOne(x => x.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<OrderItem>(i =>
        {
            i.HasOne(x => x.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            i.HasOne(x => x.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<WishlistItem>(w =>
        {
            w.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
            w.HasOne(x => x.User)
                .WithMany(u => u.WishlistItems)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            w.HasOne(x => x.Product)
                .WithMany(p => p.WishlistItems)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Review>(r =>
        {
            r.HasIndex(x => new { x.ProductId, x.UserId }).IsUnique();
            r.HasOne(x => x.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            r.HasOne(x => x.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
