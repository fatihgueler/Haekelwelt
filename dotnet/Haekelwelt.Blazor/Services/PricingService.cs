using Haekelwelt.Blazor.Data.Entities;

namespace Haekelwelt.Blazor.Services;

public class PricingService
{
    public const int ShippingDeCents = 490;
    public const int ShippingDeFreeFromCents = 5000;
    public const int ShippingEuCents = 990;
    public const int ShippingEuFreeFromCents = 8000;

    public static readonly HashSet<string> EuCountries = new()
    {
        "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR",
        "HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK",
    };

    public record Line(int PriceCents, int Quantity, TaxRate TaxRate);

    public record Breakdown(
        int SubtotalCents,
        int TaxCents,
        int ShippingCents,
        int TotalCents,
        int? FreeShippingMissingCents);

    public int CalculateShippingCents(string countryCode, int subtotalCents)
    {
        var cc = countryCode.ToUpperInvariant();
        if (!EuCountries.Contains(cc))
        {
            throw new InvalidOperationException(
                $"Versand nach \"{countryCode}\" wird derzeit nicht angeboten.");
        }
        if (cc == "DE")
        {
            return subtotalCents >= ShippingDeFreeFromCents ? 0 : ShippingDeCents;
        }
        return subtotalCents >= ShippingEuFreeFromCents ? 0 : ShippingEuCents;
    }

    public Breakdown PriceCart(IEnumerable<Line> lines, string countryCode = "DE")
    {
        var subtotal = 0;
        var tax = 0;
        foreach (var l in lines)
        {
            var lineGross = l.PriceCents * l.Quantity;
            subtotal += lineGross;
            tax += LineTaxFromGross(lineGross, l.TaxRate);
        }

        var shipping = 0;
        int? missing = null;
        if (subtotal > 0)
        {
            shipping = EuCountries.Contains(countryCode.ToUpperInvariant())
                ? CalculateShippingCents(countryCode, subtotal)
                : ShippingEuCents;
            var threshold = countryCode.ToUpperInvariant() == "DE"
                ? ShippingDeFreeFromCents
                : ShippingEuFreeFromCents;
            if (shipping > 0 && subtotal < threshold)
            {
                missing = threshold - subtotal;
            }
        }

        return new Breakdown(subtotal, tax, shipping, subtotal + shipping, missing);
    }

    public static int LineTaxFromGross(int grossCents, TaxRate taxRate)
    {
        var rate = (int)taxRate;
        var net = (int)Math.Round(grossCents * 100.0 / (100 + rate), MidpointRounding.AwayFromZero);
        return grossCents - net;
    }

    public static string FormatPrice(int cents)
    {
        return (cents / 100m).ToString("C", new System.Globalization.CultureInfo("de-DE"));
    }
}
