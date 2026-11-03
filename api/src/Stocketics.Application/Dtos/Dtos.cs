using System.ComponentModel.DataAnnotations;

namespace Stocketics.Application.Dtos;

public sealed record LoginRequest(
    [Required, EmailAddress, MaxLength(254)] string Email,
    [Required, MaxLength(128)] string Password);

public sealed record ChangePasswordRequest(
    [Required, MaxLength(128)] string CurrentPassword,
    [Required, MaxLength(128)] string NewPassword);

public sealed record CurrentUserDto(
    Guid Id, string Email, string Name, string Role, string? Department, string? Title,
    IReadOnlyList<string> Permissions);

public sealed record EmployeeDto(
    Guid Id,
    string Name,
    string Email,
    string Phone,
    string Role,
    string Department,
    string Title,
    string Status,
    bool IsActive,
    DateOnly? JoinDate,
    DateOnly? DateOfBirth,
    Guid? ManagerId,
    LeaveBalanceDto LeaveBalance,
    /// <summary>Only populated for callers holding admin.payroll; otherwise null.</summary>
    decimal? Salary,
    int Version);

public sealed record LeaveBalanceDto(decimal Paid, decimal Sick, decimal Comp);

public sealed record EmployeeQuery(
    string? Q = null,
    string? Role = null,
    string? Department = null,
    string? Status = null,
    bool? Active = null,
    int Page = 1,
    int PageSize = 25);

public sealed record CreateEmployeeRequest(
    [Required, MinLength(2), MaxLength(120)] string Name,
    [Required, EmailAddress, MaxLength(254)] string Email,
    [Required, MaxLength(128)] string Password,
    [Required] string Role,
    [MaxLength(20)] string? Phone,
    [Required] string Department,
    [MaxLength(120)] string? Title,
    string? Status,
    DateOnly? JoinDate,
    DateOnly? DateOfBirth,
    [Range(0, 100_000_000)] decimal? Salary,
    Guid? ManagerId);

public sealed record UpdateEmployeeRequest(
    [Required, MinLength(2), MaxLength(120)] string Name,
    [MaxLength(20)] string? Phone,
    [Required] string Department,
    [MaxLength(120)] string? Title,
    [Required] string Status,
    DateOnly? JoinDate,
    DateOnly? DateOfBirth,
    [Range(0, 100_000_000)] decimal? Salary,
    Guid? ManagerId,
    /// <summary>Optimistic-concurrency token from the last read. A mismatch returns 409.</summary>
    [Required] int? Version);

public sealed record ChangeRoleRequest([Required] string Role);

public sealed record ResetPasswordRequest([Required, MaxLength(128)] string NewPassword);

public sealed record SetPermissionsRequest([Required] IReadOnlyList<string> Permissions);
