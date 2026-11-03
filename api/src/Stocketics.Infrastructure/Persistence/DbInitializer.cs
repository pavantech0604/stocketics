using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;

namespace Stocketics.Infrastructure.Persistence;

public static class DbInitializer
{
    /// <summary>
    /// Brings the schema up to date and seeds roles, default permissions and (once, on an empty database)
    /// the first administrator. There is deliberately NO default password: the first admin is only created
    /// when <c>Seed:AdminEmail</c> and <c>Seed:AdminPassword</c> are supplied by the operator.
    /// </summary>
    public static async Task InitializeAsync(IServiceProvider sp, CancellationToken ct = default)
    {
        using var scope = sp.CreateScope();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (db.Database.IsSqlite()) await db.Database.EnsureCreatedAsync(ct);
        else if (config.GetValue("Database:AutoMigrate", true)) await db.Database.MigrateAsync(ct);

        var roles = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        foreach (var roleName in Roles.All)
            if (!await roles.RoleExistsAsync(roleName))
                (await roles.CreateAsync(new ApplicationRole(roleName))).ThrowIfFailed($"create role {roleName}");

        if (!await db.RolePermissions.AnyAsync(ct))
        {
            foreach (var (role, perms) in Permissions.Defaults)
                db.RolePermissions.AddRange(perms.Select(p => new RolePermission { Role = role, Permission = p }));
            await db.SaveChangesAsync(ct);
            log.LogInformation("Seeded default role permissions.");
        }

        if (await db.Users.AnyAsync(ct)) return;

        var email = config["Seed:AdminEmail"];
        var password = config["Seed:AdminPassword"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            log.LogWarning("No users exist and Seed:AdminEmail / Seed:AdminPassword are not set. " +
                           "Nobody can log in until the first administrator is seeded.");
            return;
        }

        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var name = config["Seed:AdminName"] ?? "System Administrator";
        email = email.Trim().ToLowerInvariant();
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(), UserName = email, Email = email, EmailConfirmed = true,
            FullName = name, IsActive = true, CreatedAt = DateTimeOffset.UtcNow,
        };
        (await users.CreateAsync(user, password)).ThrowIfFailed("create the first administrator");
        (await users.AddToRoleAsync(user, Roles.Admin)).ThrowIfFailed("assign the admin role");
        db.Employees.Add(new Employee
        {
            Id = user.Id, UserId = user.Id, Name = name, Email = email, Department = "IT",
            Title = "Administrator", Status = EmployeeStatuses.Active,
        });
        await db.SaveChangesAsync(ct);
        log.LogInformation("Seeded first administrator {Email}.", email);
    }

    private static void ThrowIfFailed(this IdentityResult result, string what)
    {
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Could not {what}: {string.Join("; ", result.Errors.Select(e => e.Description))}");
    }
}
