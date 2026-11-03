using Microsoft.AspNetCore.Identity;
using Stocketics.Domain.Constants;

namespace Stocketics.Domain.Entities;

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Optimistic-concurrency token, incremented on every update. Replaces the legacy PocketBase
    /// <c>version</c> check and, being a plain integer, behaves identically on PostgreSQL and SQLite.
    /// </summary>
    public int Version { get; set; } = 1;
}

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }

    public Employee? Employee { get; set; }
}

public class ApplicationRole : IdentityRole<Guid>
{
    public ApplicationRole() { }
    public ApplicationRole(string name) : base(name) { }
}

/// <summary>HR profile, 1:1 with <see cref="ApplicationUser"/>. Soft-deleted via <see cref="DeletedAt"/>.</summary>
public class Employee : Entity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    /// <summary>Normalised 10-digit Indian mobile, or empty.</summary>
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = EmployeeStatuses.Active;
    public DateOnly? JoinDate { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public decimal Salary { get; set; }

    public Guid? ManagerId { get; set; }
    public Employee? Manager { get; set; }

    public decimal LeavePaid { get; set; }
    public decimal LeaveSick { get; set; }
    public decimal LeaveComp { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}

public class RolePermission
{
    public string Role { get; set; } = string.Empty;
    public string Permission { get; set; } = string.Empty;
}

public class AuditLog
{
    public long Id { get; set; }
    public DateTimeOffset At { get; set; }
    public Guid? ActorId { get; set; }
    public string? ActorEmail { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    /// <summary>JSON detail. Never contains secrets or passwords.</summary>
    public string? Detail { get; set; }
    public string? IpAddress { get; set; }
}

public class AppSetting
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTimeOffset UpdatedAt { get; set; }
}
