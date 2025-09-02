using System.Text.Json.Serialization;

namespace TriviaSpark.Api.Services.Models;

/// <summary>
/// Unsplash API response models for image search and selection
/// </summary>
public class UnsplashSearchResponse
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("total_pages")]
    public int TotalPages { get; set; }

    [JsonPropertyName("results")]
    public List<UnsplashImage> Results { get; set; } = new();
}

public class UnsplashImage
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("alt_description")]
    public string? AltDescription { get; set; }

    [JsonPropertyName("urls")]
    public UnsplashImageUrls Urls { get; set; } = new();

    [JsonPropertyName("links")]
    public UnsplashImageLinks Links { get; set; } = new();

    [JsonPropertyName("user")]
    public UnsplashUser User { get; set; } = new();

    [JsonPropertyName("width")]
    public int Width { get; set; }

    [JsonPropertyName("height")]
    public int Height { get; set; }

    [JsonPropertyName("color")]
    public string? Color { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("likes")]
    public int Likes { get; set; }

    [JsonPropertyName("downloads")]
    public int Downloads { get; set; }
}

public class UnsplashImageUrls
{
    [JsonPropertyName("raw")]
    public string Raw { get; set; } = string.Empty;

    [JsonPropertyName("full")]
    public string Full { get; set; } = string.Empty;

    [JsonPropertyName("regular")]
    public string Regular { get; set; } = string.Empty;

    [JsonPropertyName("small")]
    public string Small { get; set; } = string.Empty;

    [JsonPropertyName("thumb")]
    public string Thumb { get; set; } = string.Empty;

    [JsonPropertyName("small_s3")]
    public string SmallS3 { get; set; } = string.Empty;
}

public class UnsplashImageLinks
{
    [JsonPropertyName("self")]
    public string Self { get; set; } = string.Empty;

    [JsonPropertyName("html")]
    public string Html { get; set; } = string.Empty;

    [JsonPropertyName("download")]
    public string Download { get; set; } = string.Empty;

    [JsonPropertyName("download_location")]
    public string DownloadLocation { get; set; } = string.Empty;
}

public class UnsplashUser
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("portfolio_url")]
    public string? PortfolioUrl { get; set; }

    [JsonPropertyName("bio")]
    public string? Bio { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("links")]
    public UnsplashUserLinks Links { get; set; } = new();

    [JsonPropertyName("profile_image")]
    public UnsplashUserProfileImage ProfileImage { get; set; } = new();
}

public class UnsplashUserLinks
{
    [JsonPropertyName("self")]
    public string Self { get; set; } = string.Empty;

    [JsonPropertyName("html")]
    public string Html { get; set; } = string.Empty;

    [JsonPropertyName("photos")]
    public string Photos { get; set; } = string.Empty;

    [JsonPropertyName("likes")]
    public string Likes { get; set; } = string.Empty;
}

public class UnsplashUserProfileImage
{
    [JsonPropertyName("small")]
    public string Small { get; set; } = string.Empty;

    [JsonPropertyName("medium")]
    public string Medium { get; set; } = string.Empty;

    [JsonPropertyName("large")]
    public string Large { get; set; } = string.Empty;
}

/// <summary>
/// DTO for simplified image selection in the frontend
/// </summary>
public class ImageSelection
{
    public string Id { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string AttributionText { get; set; } = string.Empty;
    public string AttributionUrl { get; set; } = string.Empty;
    public string PhotographerName { get; set; } = string.Empty;
    public string PhotographerUrl { get; set; } = string.Empty;
    public int Width { get; set; }
    public int Height { get; set; }
    public string Color { get; set; } = string.Empty;
}

/// <summary>
/// Configuration options for Unsplash API
/// </summary>
public class UnsplashOptions
{
    public const string SectionName = "Unsplash";
    
    public string AccessKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.unsplash.com";
    public int DefaultPerPage { get; set; } = 20;
    public int MaxPerPage { get; set; } = 30;
    public string ApplicationName { get; set; } = "TriviaSpark";
}

/// <summary>
/// Search parameters for Unsplash API
/// </summary>
public class UnsplashSearchParams
{
    public string Query { get; set; } = string.Empty;
    public int Page { get; set; } = 1;
    public int PerPage { get; set; } = 20;
    public string OrderBy { get; set; } = "relevant"; // relevant, latest
    public string Color { get; set; } = string.Empty; // black_and_white, black, white, yellow, orange, red, purple, magenta, green, teal, blue
    public string Orientation { get; set; } = string.Empty; // landscape, portrait, squarish
    public string ContentFilter { get; set; } = "high"; // low, high
}
