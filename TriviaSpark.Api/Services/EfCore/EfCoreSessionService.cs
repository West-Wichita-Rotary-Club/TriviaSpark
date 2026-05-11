using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Utils;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// EF Core implementation of session management with CSPRNG tokens and debounced sliding expiration.
/// </summary>
public class EfCoreSessionService : ISessionService
{
    private readonly TriviaSparkDbContext _context;
    private readonly ILogger<EfCoreSessionService> _logger;

    public EfCoreSessionService(TriviaSparkDbContext context, ILogger<EfCoreSessionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<string> CreateSessionAsync(string userId, string? ipAddress, string? userAgent)
    {
        var sessionId = RandomNumberGenerator.GetHexString(32);
        var now = DateTime.UtcNow;

        var session = new UserSession
        {
            Id = sessionId,
            UserId = userId,
            CreatedAt = now,
            ExpiresAt = now.Add(AuthConstants.SessionDuration),
            LastAccessAt = now,
            IpAddress = ipAddress,
            UserAgent = userAgent?.Length > 500 ? userAgent[..500] : userAgent
        };

        _context.UserSessions.Add(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Session created for user {UserId}", userId);
        return sessionId;
    }

    public async Task<UserSession?> ValidateSessionAsync(string sessionId)
    {
        var session = await _context.UserSessions
            .Include(s => s.User)
            .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null)
            return null;

        if (session.ExpiresAt < DateTime.UtcNow)
        {
            // Session expired — clean it up
            _context.UserSessions.Remove(session);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Expired session removed: {SessionId}", sessionId);
            return null;
        }

        return session;
    }

    public async Task DeleteSessionAsync(string sessionId)
    {
        var session = await _context.UserSessions.FindAsync(sessionId);
        if (session != null)
        {
            _context.UserSessions.Remove(session);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Session deleted: {SessionId}", sessionId);
        }
    }

    public async Task DeleteUserSessionsAsync(string userId)
    {
        var sessions = await _context.UserSessions
            .Where(s => s.UserId == userId)
            .ToListAsync();

        if (sessions.Count > 0)
        {
            _context.UserSessions.RemoveRange(sessions);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted {Count} sessions for user {UserId}", sessions.Count, userId);
        }
    }

    public async Task SlideExpirationAsync(UserSession session)
    {
        var now = DateTime.UtcNow;
        var minutesSinceLastAccess = (now - session.LastAccessAt).TotalMinutes;

        // Only update DB if debounce threshold has passed
        if (minutesSinceLastAccess < AuthConstants.SlidingExpirationDebounceMinutes)
            return;

        session.LastAccessAt = now;
        session.ExpiresAt = now.Add(AuthConstants.SessionDuration);
        await _context.SaveChangesAsync();
    }
}
