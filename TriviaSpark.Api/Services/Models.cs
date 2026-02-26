namespace TriviaSpark.Api.Services;

/// <summary>
/// DTO model representing a user for API compatibility with legacy Dapper-based code.
/// </summary>
public class User
{
    /// <summary>Unique user identifier.</summary>
    public string Id { get; set; } = string.Empty;
    /// <summary>User's login name.</summary>
    public string Username { get; set; } = string.Empty;
    /// <summary>User's email address.</summary>
    public string Email { get; set; } = string.Empty;
    /// <summary>User's hashed password.</summary>
    public string Password { get; set; } = string.Empty;
    /// <summary>User's display name.</summary>
    public string FullName { get; set; } = string.Empty;
    /// <summary>Foreign key to the user's role.</summary>
    public string RoleId { get; set; } = string.Empty;
    /// <summary>Name of the user's assigned role.</summary>
    public string? RoleName { get; set; }
    /// <summary>When the user account was created.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Legacy storage interface for backward compatibility during migration from Dapper to EF Core.
/// </summary>
public interface IStorage
{
    Task<User?> GetUserByUsername(string username);
    Task<User?> GetUserByIdAsync(string userId);
    // Placeholder methods for compilation compatibility
    Task<object?> GetQuestion(string questionId) => Task.FromResult<object?>(null);
    Task<object?> CreateResponse(object response) => Task.FromResult<object?>(null);
}

/// <summary>
/// Legacy database interface for compilation compatibility during migration.
/// </summary>
public interface IDb
{
    // Empty interface for compilation compatibility
}

/// <summary>
/// DTO model representing a participant's response to a trivia question.
/// </summary>
public class ResponseRow
{
    public string Id { get; set; } = string.Empty;
    public string ParticipantId { get; set; } = string.Empty;
    public string QuestionId { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int Points { get; set; }
    public double ResponseTime { get; set; }
}
