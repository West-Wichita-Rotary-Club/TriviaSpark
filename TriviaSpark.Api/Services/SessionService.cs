namespace TriviaSpark.Api.Services;

public interface ISessionService
{
    string Create(string userId);
    (bool valid, string? userId) Validate(string? sessionId);
    void Delete(string sessionId);
}

public class SessionService : ISessionService
{
    private readonly Dictionary<string, (string userId, DateTimeOffset expires)> _map = new();

    public string Create(string userId)
    {
        var id = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("/", "_").Replace("+", "-");
        _map[id] = (userId, DateTimeOffset.UtcNow.AddDays(1));
        return id;
    }

    public (bool valid, string? userId) Validate(string? sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId)) return (false, null);
        if (!_map.TryGetValue(sessionId!, out var entry)) return (false, null);
        if (entry.expires < DateTimeOffset.UtcNow)
        {
            _map.Remove(sessionId!);
            return (false, null);
        }
        return (true, entry.userId);
    }

    public void Delete(string sessionId) => _map.Remove(sessionId);
}
