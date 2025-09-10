using TriviaSpark.Api.Services;
using TriviaSpark.Api.Services.EfCore;

namespace TriviaSpark.Api.Middleware;

public class AdminAuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AdminAuthorizationMiddleware> _logger;

    public AdminAuthorizationMiddleware(RequestDelegate next, ILogger<AdminAuthorizationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ISessionService sessionService, IEfCoreUserService userService)
    {
        // Check if this is an admin route
        var path = context.Request.Path.Value?.ToLower();
        if (path?.Contains("/admin") == true)
        {
            _logger.LogInformation("Admin route accessed: {Path}", path);
            
            // Get session ID from cookie
            context.Request.Cookies.TryGetValue("sessionId", out var sessionId);
            _logger.LogInformation("Session ID from cookie: {SessionId}", sessionId ?? "null");
            
            var (isValid, userId) = sessionService.Validate(sessionId);
            _logger.LogInformation("Session validation result: Valid={IsValid}, UserId={UserId}", isValid, userId ?? "null");
            
            if (!isValid || string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Authentication failed for admin route: {Path}", path);
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Authentication required");
                return;
            }

            var user = await userService.GetUserByIdAsync(userId);
            _logger.LogInformation("User details: Id={UserId}, RoleName={RoleName}", user?.Id ?? "null", user?.RoleName ?? "null");
            
            if (user?.RoleName != "Admin")
            {
                _logger.LogWarning("User {UserId} with role {RoleName} attempted to access admin route", userId, user?.RoleName ?? "null");
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("Admin access required");
                return;
            }

            _logger.LogInformation("Admin access granted to user {UserId}", userId);
        }

        await _next(context);
    }
}

public static class AdminAuthorizationMiddlewareExtensions
{
    public static IApplicationBuilder UseAdminAuthorization(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AdminAuthorizationMiddleware>();
    }
}
