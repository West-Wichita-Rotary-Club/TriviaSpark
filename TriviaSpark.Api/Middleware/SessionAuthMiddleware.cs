using TriviaSpark.Api.Services;
using TriviaSpark.Api.Utils;

namespace TriviaSpark.Api.Middleware;

/// <summary>
/// Middleware that reads the session cookie, validates the session, slides expiration,
/// and sets HttpContext.Items["User"] with the authenticated user.
/// Placed after UseStaticFiles() to avoid unnecessary DB queries on static assets.
/// </summary>
public class SessionAuthMiddleware
{
    private readonly RequestDelegate _next;

    public SessionAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sessionId = context.Request.Cookies[AuthConstants.CookieName];

        if (!string.IsNullOrEmpty(sessionId))
        {
            var sessionService = context.RequestServices.GetRequiredService<ISessionService>();
            var session = await sessionService.ValidateSessionAsync(sessionId);

            if (session?.User != null)
            {
                context.Items["User"] = session.User;
                await sessionService.SlideExpirationAsync(session);
            }
        }

        await _next(context);
    }
}
