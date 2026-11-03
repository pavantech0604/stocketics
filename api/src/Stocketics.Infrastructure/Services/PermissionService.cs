using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

/// <summary>
/// Role → permission grants live in the database (editable by holders of admin.roles) and are cached
/// per role. The cache is process-local, which is correct for the single-instance VPS deployment;
/// scaling out would need a distributed cache or short TTL.
/// </summary>
public sealed class PermissionService(AppDbContext db, IMemoryCache cache, IAuditService audit) : IPermissionService
{
    private static string Key(string role) => $"perm:{role}";

    public async Task<IReadOnlySet<string>> GetForRoleAsync(string role, CancellationToken ct = default)
    {
        if (cache.TryGetValue(Key(role), out IReadOnlySet<string>? hit) && hit is not null) return hit;

        var set = (await db.RolePermissions.AsNoTracking()
                .Where(x => x.Role == role).Select(x => x.Permission).ToListAsync(ct))
            .ToHashSet(StringComparer.Ordinal);
        cache.Set(Key(role), (IReadOnlySet<string>)set, TimeSpan.FromMinutes(5));
        return set;
    }

    public async Task<bool> HasAsync(string role, string permission, CancellationToken ct = default)
        => (await GetForRoleAsync(role, ct)).Contains(permission);

    public async Task<IReadOnlyDictionary<string, IReadOnlyList<string>>> GetMatrixAsync(CancellationToken ct = default)
    {
        var rows = await db.RolePermissions.AsNoTracking().ToListAsync(ct);
        return Roles.All.ToDictionary(
            r => r,
            r => (IReadOnlyList<string>)rows.Where(x => x.Role == r).Select(x => x.Permission).Order().ToList());
    }

    public async Task SetForRoleAsync(string role, IReadOnlyCollection<string> permissions, CancellationToken ct = default)
    {
        if (!Roles.IsValid(role)) throw new ValidationFailedException("role", $"Unknown role '{role}'.");
        var unknown = permissions.Where(p => !Permissions.All.Contains(p)).Distinct().ToArray();
        if (unknown.Length > 0)
            throw new ValidationFailedException("permissions", $"Unknown permissions: {string.Join(", ", unknown)}.");

        var wanted = permissions.ToHashSet(StringComparer.Ordinal);

        // Guard against locking everyone out: the admin role must keep the ability to manage roles.
        if (role == Roles.Admin && !wanted.Contains(Permissions.AdminRoles))
            throw new ValidationFailedException("permissions", "The admin role must keep 'admin.roles'.");

        var existing = await db.RolePermissions.Where(x => x.Role == role).ToListAsync(ct);
        var before = existing.Select(x => x.Permission).Order().ToArray();
        db.RolePermissions.RemoveRange(existing.Where(x => !wanted.Contains(x.Permission)));
        var have = existing.Select(x => x.Permission).ToHashSet();
        db.RolePermissions.AddRange(wanted.Where(p => !have.Contains(p))
            .Select(p => new RolePermission { Role = role, Permission = p }));

        audit.Record("permissions.updated", "role", role, new { before, after = wanted.Order().ToArray() });
        await db.SaveChangesAsync(ct);
        cache.Remove(Key(role));
    }
}
