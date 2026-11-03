using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Stocketics.Application.Common;

namespace Stocketics.Api.Infrastructure;

/// <summary>
/// Single place where exceptions become RFC 9457 ProblemDetails. Anything unrecognised is logged in full
/// but returned as a generic 500, so stack traces and SQL never reach the client.
/// </summary>
public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger, IProblemDetailsService problems)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception ex, CancellationToken ct)
    {
        ProblemDetails body;
        switch (ex)
        {
            case ValidationFailedException v:
                body = new ValidationProblemDetails(v.Errors.ToDictionary(k => k.Key, k => k.Value))
                {
                    Status = 400, Title = "Validation failed",
                };
                break;
            case AppException app:
                body = new ProblemDetails { Status = app.StatusCode, Title = Title(app.StatusCode), Detail = app.Message };
                break;
            case UnauthorizedAccessException u:
                body = new ProblemDetails { Status = 401, Title = "Unauthorized", Detail = u.Message };
                break;
            case BadHttpRequestException b:
                body = new ProblemDetails { Status = 400, Title = "Bad request", Detail = b.Message };
                break;
            default:
                logger.LogError(ex, "Unhandled exception for {Method} {Path}", http.Request.Method, http.Request.Path);
                body = new ProblemDetails { Status = 500, Title = "Server error", Detail = "An unexpected error occurred." };
                break;
        }

        body.Extensions["traceId"] = http.TraceIdentifier;
        http.Response.StatusCode = body.Status!.Value;
        return await problems.TryWriteAsync(new ProblemDetailsContext { HttpContext = http, ProblemDetails = body, Exception = ex });
    }

    private static string Title(int status) => status switch
    {
        403 => "Forbidden", 404 => "Not found", 409 => "Conflict", 423 => "Locked", _ => "Request failed",
    };
}
