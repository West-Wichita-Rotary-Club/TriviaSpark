using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services;

/// <summary>
/// Interface for session management operations (create, validate, delete, slide expiration).
/// </summary>
public interface ISessionService
{
    /// <summary>Creates a new session for the specified user and returns the session ID (token).</summary>
    Task<string> CreateSessionAsync(string userId, string? ipAddress, string? userAgent);

    /// <summary>Validates a session by ID. Returns the session with User if valid, null if expired or not found.</summary>
    Task<UserSession?> ValidateSessionAsync(string sessionId);

    /// <summary>Deletes a specific session by ID.</summary>
    Task DeleteSessionAsync(string sessionId);

    /// <summary>Deletes all sessions for a specific user.</summary>
    Task DeleteUserSessionsAsync(string userId);

    /// <summary>Slides the session expiration if the debounce threshold has passed.</summary>
    Task SlideExpirationAsync(UserSession session);
}
