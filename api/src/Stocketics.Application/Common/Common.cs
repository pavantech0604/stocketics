using System.Text.RegularExpressions;

namespace Stocketics.Application.Common;

/// <summary>Base for errors the API turns into a ProblemDetails response with a specific status.</summary>
public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public sealed class NotFoundException(string message) : AppException(message, 404);

public sealed class ForbiddenException(string message = "You do not have access to this resource.")
    : AppException(message, 403);

public sealed class ConflictException(string message) : AppException(message, 409);

public sealed class ValidationFailedException : AppException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationFailedException(string field, string message)
        : base(message, 400) => Errors = new Dictionary<string, string[]> { [field] = [message] };

    public ValidationFailedException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.", 400) => Errors = errors;
}

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

/// <summary>
/// Ports of the normalisation rules in <c>backend/pb_hooks/crm.js</c> so that the .NET services
/// accept and reject exactly the same input as the legacy hooks.
/// </summary>
public static partial class Normalizer
{
    /// <summary>
    /// Strips non-digits, drops a +91 / 91 prefix (12 digits) or a leading 0 (11 digits), then requires
    /// a valid Indian mobile (<c>^[6-9]\d{9}$</c>). Returns null when the input is not valid.
    /// </summary>
    public static string? TryNormalizePhone(string? value)
    {
        var digits = NonDigits().Replace(value ?? string.Empty, string.Empty);
        if (digits.Length == 12 && digits.StartsWith("91", StringComparison.Ordinal)) digits = digits[2..];
        if (digits.Length == 11 && digits[0] == '0') digits = digits[1..];
        return IndianMobile().IsMatch(digits) ? digits : null;
    }

    /// <summary>Trims and lower-cases. Returns null when non-empty input is not a plausible address.</summary>
    public static string? TryNormalizeEmail(string? value, bool required = true)
    {
        var email = (value ?? string.Empty).Trim().ToLowerInvariant();
        if (email.Length == 0) return required ? null : string.Empty;
        return email.Length <= 254 && EmailShape().IsMatch(email) ? email : null;
    }

    [GeneratedRegex(@"\D")] private static partial Regex NonDigits();
    [GeneratedRegex(@"^[6-9]\d{9}$")] private static partial Regex IndianMobile();
    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")] private static partial Regex EmailShape();
}
