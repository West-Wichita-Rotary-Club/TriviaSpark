using System.ComponentModel.DataAnnotations;

namespace TriviaSpark.Api.Data.Entities;

/// <summary>
/// Represents an authenticated user session. Stored server-side with session ID in HTTP-only cookie.
/// </summary>
public class UserSession
{
    [Key]
    public string Id { get; set; } = null!;

    [Required]
    public string UserId { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public DateTime LastAccessAt { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
}
