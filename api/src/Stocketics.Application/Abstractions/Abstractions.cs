using Stocketics.Application.Common;
using Stocketics.Application.Dtos;

namespace Stocketics.Application.Abstractions;

/// <summary>The authenticated caller, resolved from the request cookie.</summary>
public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid UserId { get; }
    string? Email { get; }
    string? Role { get; }
    string? IpAddress { get; }
}

public interface IAuditService
{
    /// <summary>
    /// Adds an audit row to the current unit of work. The caller commits it together with the change it
    /// describes, so an audit entry never exists for a change that was rolled back (and vice versa).
    /// </summary>
    void Record(string action, string entityType, string? entityId = null, object? detail = null);

    /// <summary>For events with no other change to commit (login success/failure).</summary>
    Task RecordAndSaveAsync(string action, string entityType, string? entityId = null, object? detail = null,
        Guid? actorId = null, string? actorEmail = null, CancellationToken ct = default);
}

public interface IPermissionService
{
    Task<IReadOnlySet<string>> GetForRoleAsync(string role, CancellationToken ct = default);
    Task<bool> HasAsync(string role, string permission, CancellationToken ct = default);
    Task<IReadOnlyDictionary<string, IReadOnlyList<string>>> GetMatrixAsync(CancellationToken ct = default);
    Task SetForRoleAsync(string role, IReadOnlyCollection<string> permissions, CancellationToken ct = default);
}

public interface IAuthService
{
    Task<CurrentUserDto> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task LogoutAsync(CancellationToken ct = default);
    Task<CurrentUserDto> GetCurrentAsync(CancellationToken ct = default);
    Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken ct = default);
}

public interface IEmployeeService
{
    Task<PagedResult<EmployeeDto>> ListAsync(EmployeeQuery query, CancellationToken ct = default);
    Task<EmployeeDto> GetAsync(Guid id, CancellationToken ct = default);
    Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, CancellationToken ct = default);
    Task<EmployeeDto> UpdateAsync(Guid id, UpdateEmployeeRequest request, CancellationToken ct = default);
    Task<EmployeeDto> SetActiveAsync(Guid id, bool active, CancellationToken ct = default);
    Task<EmployeeDto> ChangeRoleAsync(Guid id, string role, CancellationToken ct = default);
    Task ResetPasswordAsync(Guid id, string newPassword, CancellationToken ct = default);
}
