using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Stocketics.Api.Security;

/// <summary>
/// Global CSRF guard for the cookie-authenticated API: every request that is not a safe method must present
/// a valid anti-forgery token in the X-CSRF-TOKEN header (fetched from GET /api/v1/auth/csrf).
/// A cross-site form or fetch cannot read that token, so it cannot forge a state-changing request even
/// though the browser would attach the auth cookie.
/// </summary>
public sealed class CsrfFilter(IAntiforgery antiforgery) : IAsyncAuthorizationFilter
{
    private static readonly HashSet<string> SafeMethods =
        new(StringComparer.OrdinalIgnoreCase) { "GET", "HEAD", "OPTIONS", "TRACE" };

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (SafeMethods.Contains(context.HttpContext.Request.Method)) return;

        try
        {
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        }
        catch (AntiforgeryValidationException)
        {
            context.Result = new ObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid or missing CSRF token",
                Detail = "Send the token from GET /api/v1/auth/csrf in the X-CSRF-TOKEN header.",
            })
            { StatusCode = StatusCodes.Status400BadRequest };
        }
    }
}
