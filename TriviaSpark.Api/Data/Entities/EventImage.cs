using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TriviaSpark.Api.Data.Entities;

/// <summary>
/// Represents an image from Unsplash that has been selected and stored for a specific question
/// Provides caching and metadata storage for Unsplash images used in trivia events
/// </summary>
public class EventImage
{
    [Key]
    public string Id { get; set; } = null!;

    /// <summary>
    /// Foreign key reference to the question this image is associated with
    /// </summary>
    [Required]
    [ForeignKey(nameof(Question))]
    public string QuestionId { get; set; } = null!;

    /// <summary>
    /// Original Unsplash image ID for reference and API compliance
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string UnsplashImageId { get; set; } = null!;

    /// <summary>
    /// Direct URL to the image in the desired size for quick access
    /// </summary>
    [Required]
    [MaxLength(1000)]
    public string ImageUrl { get; set; } = null!;

    /// <summary>
    /// Thumbnail URL for preview purposes
    /// </summary>
    [Required]
    [MaxLength(1000)]
    public string ThumbnailUrl { get; set; } = null!;

    /// <summary>
    /// Image description from Unsplash (alt text)
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Required attribution text for Unsplash compliance
    /// Format: "Photo by [Photographer Name] on Unsplash"
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string AttributionText { get; set; } = null!;

    /// <summary>
    /// Attribution URL linking to the photographer's Unsplash profile
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string AttributionUrl { get; set; } = null!;

    /// <summary>
    /// Unsplash download tracking URL for API compliance
    /// Must be called when image is actually displayed
    /// </summary>
    [Required]
    [MaxLength(1000)]
    public string DownloadTrackingUrl { get; set; } = null!;

    /// <summary>
    /// Image width in pixels
    /// </summary>
    public int Width { get; set; }

    /// <summary>
    /// Image height in pixels
    /// </summary>
    public int Height { get; set; }

    /// <summary>
    /// Dominant color of the image (hex format)
    /// Useful for UI theming and loading states
    /// </summary>
    [MaxLength(7)]
    public string? Color { get; set; }

    /// <summary>
    /// Image size variant stored (thumb, small, regular, full)
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string SizeVariant { get; set; } = "regular";

    /// <summary>
    /// Usage context for analytics and optimization
    /// (background, question_image, category_header, etc.)
    /// </summary>
    [MaxLength(50)]
    public string? UsageContext { get; set; }

    /// <summary>
    /// Indicates if download tracking has been completed
    /// Required for Unsplash API compliance
    /// </summary>
    public bool DownloadTracked { get; set; } = false;

    /// <summary>
    /// Timestamp when the image was first selected and stored
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the image was last accessed/used
    /// Useful for cleanup and analytics
    /// </summary>
    public DateTime LastUsedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Cache expiration timestamp for periodic refresh of Unsplash data
    /// Helps ensure attribution and metadata remain current
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// User who selected this image for the question
    /// </summary>
    [ForeignKey(nameof(SelectedBy))]
    public string? SelectedByUserId { get; set; }

    /// <summary>
    /// Search query or category that was used to find this image
    /// Useful for analytics and improving recommendations
    /// </summary>
    [MaxLength(200)]
    public string? SearchContext { get; set; }

    // Navigation properties
    
    /// <summary>
    /// The question this image is associated with
    /// </summary>
    public virtual Question Question { get; set; } = null!;

    /// <summary>
    /// User who selected this image (optional)
    /// </summary>
    public virtual User? SelectedBy { get; set; }
}

/// <summary>
/// DTO for creating new EventImage records
/// </summary>
public class CreateEventImageRequest
{
    public string QuestionId { get; set; } = null!;
    public string UnsplashImageId { get; set; } = null!;
    public string SizeVariant { get; set; } = "regular";
    public string? UsageContext { get; set; }
    public string? SelectedByUserId { get; set; }
    public string? SearchContext { get; set; }
}

/// <summary>
/// DTO for EventImage responses
/// </summary>
public class EventImageResponse
{
    public string Id { get; set; } = null!;
    public string QuestionId { get; set; } = null!;
    public string UnsplashImageId { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public string ThumbnailUrl { get; set; } = null!;
    public string? Description { get; set; }
    public string AttributionText { get; set; } = null!;
    public string AttributionUrl { get; set; } = null!;
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Color { get; set; }
    public string SizeVariant { get; set; } = null!;
    public string? UsageContext { get; set; }
    public bool DownloadTracked { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastUsedAt { get; set; }
    public string? SearchContext { get; set; }
}
