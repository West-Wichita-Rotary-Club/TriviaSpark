using System.Text;
using System.Text.RegularExpressions;

namespace TriviaSpark.Api.Utils;

public static class SlugGenerator
{
    /// <summary>
    /// Generates a URL-friendly slug from a title string
    /// </summary>
    /// <param name="title">The event title to convert to a slug</param>
    /// <param name="maxLength">Maximum length of the generated slug (default: 60)</param>
    /// <returns>A URL-friendly slug</returns>
    public static string GenerateSlug(string title, int maxLength = 60)
    {
        if (string.IsNullOrWhiteSpace(title))
            return "untitled-event";

        // Convert to lowercase
        var slug = title.ToLowerInvariant();

        // Replace spaces and common separators with hyphens
        slug = Regex.Replace(slug, @"[\s\-_]+", "-");

        // Remove special characters, keep only letters, numbers, and hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remove multiple consecutive hyphens
        slug = Regex.Replace(slug, @"-{2,}", "-");

        // Trim hyphens from start and end
        slug = slug.Trim('-');

        // Ensure it's not empty after cleaning
        if (string.IsNullOrWhiteSpace(slug))
            slug = "event";

        // Truncate if too long, but try to break at word boundaries
        if (slug.Length > maxLength)
        {
            slug = slug.Substring(0, maxLength);
            var lastHyphen = slug.LastIndexOf('-');
            if (lastHyphen > maxLength * 0.75) // If we can trim at a word boundary without losing too much
            {
                slug = slug.Substring(0, lastHyphen);
            }
            slug = slug.TrimEnd('-');
        }

        return slug;
    }

    /// <summary>
    /// Generates a unique slug by appending incremental numbers if needed
    /// </summary>
    /// <param name="baseSlug">The base slug to make unique</param>
    /// <param name="existingSlugs">Collection of existing slugs to check against</param>
    /// <param name="maxAttempts">Maximum number of attempts to find a unique slug</param>
    /// <returns>A unique slug</returns>
    public static string MakeUniqueSlug(string baseSlug, IEnumerable<string> existingSlugs, int maxAttempts = 100)
    {
        var existingSet = existingSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);
        
        // If the base slug is already unique, return it
        if (!existingSet.Contains(baseSlug))
            return baseSlug;

        // Try appending numbers until we find a unique one
        for (int i = 2; i <= maxAttempts + 1; i++)
        {
            var candidateSlug = $"{baseSlug}-{i}";
            if (!existingSet.Contains(candidateSlug))
                return candidateSlug;
        }

        // If we couldn't find a unique slug, fall back to GUID suffix
        var guidSuffix = Guid.NewGuid().ToString("N")[..8];
        return $"{baseSlug}-{guidSuffix}";
    }

    /// <summary>
    /// Validates that a slug meets our requirements
    /// </summary>
    /// <param name="slug">The slug to validate</param>
    /// <returns>True if the slug is valid</returns>
    public static bool IsValidSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return false;

        // Check length
        if (slug.Length < 1 || slug.Length > 60)
            return false;

        // Check format - only lowercase letters, numbers, and hyphens
        if (!Regex.IsMatch(slug, @"^[a-z0-9\-]+$"))
            return false;

        // Can't start or end with hyphen
        if (slug.StartsWith('-') || slug.EndsWith('-'))
            return false;

        // Can't have consecutive hyphens
        if (slug.Contains("--"))
            return false;

        return true;
    }
}
