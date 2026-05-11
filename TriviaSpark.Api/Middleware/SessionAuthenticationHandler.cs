using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using TriviaSpark.Api.Services;
using TriviaSpark.Api.Utils;

using EntityUser = TriviaSpark.Api.Data.Entities.User;

namespace TriviaSpark.Api.Middleware;

/// <summary>
/// ASP.NET Core AuthenticationHandler that integrates session-based auth with the native
/// authentication pipeline, enabling [Authorize] attribute and role-based policies.
/// </summary>
public class SessionAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IServiceScopeFactory _scopeFactory;

    public SessionAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IServiceScopeFactory scopeFactory)
        : base(options, logger, encoder)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check if user was already resolved by SessionAuthMiddleware
        if (Context.Items.TryGetValue("User", out var userObj) && userObj is EntityUser user)
        {
            var claims = BuildClaims(user);
            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return AuthenticateResult.Success(ticket);
        }

        // Fallback: try reading cookie directly (for cases where middleware might not have run)
        var sessionId = Request.Cookies[AuthConstants.CookieName];
        if (string.IsNullOrEmpty(sessionId))
            return AuthenticateResult.NoResult();

        using var scope = _scopeFactory.CreateScope();
        var sessionService = scope.ServiceProvider.GetRequiredService<ISessionService>();
        var session = await sessionService.ValidateSessionAsync(sessionId);

        if (session?.User == null)
            return AuthenticateResult.Fail("Invalid or expired session");

        Context.Items["User"] = session.User;

        var fallbackClaims = BuildClaims(session.User);
        var fallbackIdentity = new ClaimsIdentity(fallbackClaims, Scheme.Name);
        var fallbackPrincipal = new ClaimsPrincipal(fallbackIdentity);
        var fallbackTicket = new AuthenticationTicket(fallbackPrincipal, Scheme.Name);
        return AuthenticateResult.Success(fallbackTicket);
    }

    private static List<Claim> BuildClaims(EntityUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Username),
        };

        if (user.Role != null)
        {
            claims.Add(new Claim(ClaimTypes.Role, user.Role.Name));
        }

        return claims;
    }
}
