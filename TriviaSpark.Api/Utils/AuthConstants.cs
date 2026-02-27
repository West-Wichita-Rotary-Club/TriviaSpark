namespace TriviaSpark.Api.Utils;

/// <summary>
/// Centralized authentication and session configuration constants.
/// Single source of truth for cookie names, session durations, and cookie options.
/// </summary>
public static class AuthConstants
{
    /// <summary>Name of the session cookie.</summary>
    public const string CookieName = "triviaspark_session";

    /// <summary>Session duration (sliding expiration window).</summary>
    public static readonly TimeSpan SessionDuration = TimeSpan.FromHours(2);

    /// <summary>
    /// Only update LastAccessAt/ExpiresAt in the database if the last access was more than
    /// this many minutes ago. Reduces SQLite write contention.
    /// </summary>
    public const int SlidingExpirationDebounceMinutes = 5;

    /// <summary>Default admin password for first-run seeding.</summary>
    public const string DefaultAdminPassword = "ChangeMe123!";

    /// <summary>
    /// Pre-computed BCrypt hash used for constant-time comparison when the user is not found.
    /// Prevents timing-based user enumeration attacks.
    /// </summary>
    public static readonly string DummyBCryptHash = BCrypt.Net.BCrypt.HashPassword("dummy-password-for-timing");

    /// <summary>
    /// Creates cookie options with appropriate security settings for the current environment.
    /// </summary>
    public static CookieOptions CreateCookieOptions(bool isProduction)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = isProduction,
            Path = "/",
            MaxAge = SessionDuration
        };
    }

    /// <summary>
    /// Creates cookie options for clearing (deleting) the session cookie.
    /// </summary>
    public static CookieOptions CreateExpiredCookieOptions(bool isProduction)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = isProduction,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(-1)
        };
    }
}
