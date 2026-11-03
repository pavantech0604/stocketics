using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Stocketics.Domain.Entities;

namespace Stocketics.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AppSetting> Settings => Set<AppSetting>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // snake_case table names, per the architecture proposal. Column names are converted by the
        // naming convention below so migrations read naturally in psql.
        b.Entity<ApplicationUser>(e =>
        {
            e.ToTable("users");
            e.Property(x => x.FullName).HasMaxLength(120);
            e.HasOne(x => x.Employee).WithOne(x => x.User).HasForeignKey<Employee>(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<ApplicationRole>().ToTable("roles");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("user_roles");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("user_claims");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("user_logins");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("user_tokens");
        b.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("role_claims");

        b.Entity<Employee>(e =>
        {
            e.ToTable("employees", t =>
            {
                t.HasCheckConstraint("ck_employees_salary_nonneg", "salary >= 0");
            });
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(120).IsRequired();
            e.Property(x => x.Email).HasMaxLength(254).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(20);
            e.Property(x => x.Department).HasMaxLength(60).IsRequired();
            e.Property(x => x.Title).HasMaxLength(120);
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
            e.Property(x => x.Salary).HasPrecision(18, 2);
            e.Property(x => x.LeavePaid).HasPrecision(6, 1);
            e.Property(x => x.LeaveSick).HasPrecision(6, 1);
            e.Property(x => x.LeaveComp).HasPrecision(6, 1);
            e.Property(x => x.Version).IsConcurrencyToken();
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.UserId).IsUnique();
            e.HasIndex(x => x.ManagerId);
            e.HasOne(x => x.Manager).WithMany().HasForeignKey(x => x.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<RolePermission>(e =>
        {
            e.ToTable("role_permissions");
            e.HasKey(x => new { x.Role, x.Permission });
            e.Property(x => x.Role).HasMaxLength(50);
            e.Property(x => x.Permission).HasMaxLength(80);
        });

        b.Entity<AuditLog>(e =>
        {
            e.ToTable("audit_logs");
            e.Property(x => x.Action).HasMaxLength(80).IsRequired();
            e.Property(x => x.EntityType).HasMaxLength(80).IsRequired();
            e.Property(x => x.EntityId).HasMaxLength(80);
            e.Property(x => x.ActorEmail).HasMaxLength(254);
            e.Property(x => x.IpAddress).HasMaxLength(64);
            e.HasIndex(x => x.ActorId);
            e.HasIndex(x => new { x.EntityType, x.EntityId });
        });

        b.Entity<AppSetting>(e =>
        {
            e.ToTable("settings");
            e.HasKey(x => x.Key);
            e.Property(x => x.Key).HasMaxLength(100);
        });

        foreach (var entity in b.Model.GetEntityTypes())
            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToSnakeCase(property.Name));
    }

    private static string ToSnakeCase(string name)
    {
        var sb = new System.Text.StringBuilder(name.Length + 4);
        for (var i = 0; i < name.Length; i++)
        {
            var c = name[i];
            if (char.IsUpper(c))
            {
                var prevLower = i > 0 && !char.IsUpper(name[i - 1]);
                var nextLower = i + 1 < name.Length && char.IsLower(name[i + 1]);
                if (i > 0 && (prevLower || nextLower)) sb.Append('_');
                sb.Append(char.ToLowerInvariant(c));
            }
            else sb.Append(c);
        }
        return sb.ToString();
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        StampEntities();
        return base.SaveChangesAsync(ct);
    }

    public override int SaveChanges()
    {
        StampEntities();
        return base.SaveChanges();
    }

    private void StampEntities()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
                // Original value is whatever the client sent (see EmployeeService); EF compares it in the
                // WHERE clause, so a stale write affects 0 rows and raises DbUpdateConcurrencyException.
                entry.Entity.Version = entry.Property(x => x.Version).OriginalValue + 1;
            }
        }
    }
}
