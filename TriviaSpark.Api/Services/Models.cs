namespace TriviaSpark.Api.Services;

// DTO Models for maintaining API compatibility
public class User
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RoleId { get; set; } = string.Empty;
    public string? RoleName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Legacy interfaces for backward compatibility
public interface IStorage
{
    Task<User?> GetUserByUsername(string username);
    Task<User?> GetUserByIdAsync(string userId);
    // Placeholder methods for compilation compatibility
    Task<object?> GetQuestion(string questionId) => Task.FromResult<object?>(null);
    Task<object?> CreateResponse(object response) => Task.FromResult<object?>(null);
}

public interface IDb
{
    // Empty interface for compilation compatibility
}

// Legacy classes for compilation compatibility  
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
