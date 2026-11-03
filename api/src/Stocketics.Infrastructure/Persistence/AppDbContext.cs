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

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadActivity> LeadActivities => Set<LeadActivity>();
    public DbSet<LeadFollowUp> LeadFollowUps => Set<LeadFollowUp>();
    public DbSet<LeadAssignment> LeadAssignments => Set<LeadAssignment>();
    public DbSet<LeadRequest> LeadRequests => Set<LeadRequest>();
    public DbSet<LeadRequestEvent> LeadRequestEvents => Set<LeadRequestEvent>();
    public DbSet<LeadRequestAllocation> LeadRequestAllocations => Set<LeadRequestAllocation>();
    public DbSet<DndNumber> DndNumbers => Set<DndNumber>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ClientNote> ClientNotes => Set<ClientNote>();
    public DbSet<ClientSubscription> ClientSubscriptions => Set<ClientSubscription>();
    public DbSet<ClientTrial> ClientTrials => Set<ClientTrial>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ImportBatch> ImportBatches => Set<ImportBatch>();

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

        ConfigureCrm(b);

        // Ids are assigned in code (Guid.NewGuid()). Declaring them non-generated makes EF insert any such
        // entity, including ones added through a tracked parent's collection; otherwise EF can mistake a
        // pre-set key for an existing row and issue an UPDATE that matches nothing.
        foreach (var type in b.Model.GetEntityTypes().Where(t => typeof(Entity).IsAssignableFrom(t.ClrType)).ToList())
            b.Entity(type.ClrType).Property(nameof(Entity.Id)).ValueGeneratedNever();

        foreach (var entity in b.Model.GetEntityTypes())
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.Name));

                // SQLite stores DateTimeOffset as text and cannot compare/order it server-side. Store it as a
                // sortable integer instead (dev/tests only; PostgreSQL uses native timestamptz).
                if (Database.IsSqlite() && (property.ClrType == typeof(DateTimeOffset) || property.ClrType == typeof(DateTimeOffset?)))
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.DateTimeOffsetToBinaryConverter());
            }
    }

    private static void ConfigureCrm(ModelBuilder b)
    {
        void OwnerFks<T>(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<T> e) where T : CrmOwned
        {
            e.HasOne<Employee>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<Employee>().WithMany().HasForeignKey(x => x.TeamLeaderId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<Employee>().WithMany().HasForeignKey(x => x.ManagerId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.OwnerId);
            e.HasIndex(x => x.TeamLeaderId);
            e.HasIndex(x => x.ManagerId);
            e.Property(x => x.Version).IsConcurrencyToken();
        }

        b.Entity<Lead>(e =>
        {
            e.ToTable("leads");
            e.Property(x => x.Name).HasMaxLength(120).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(10).IsRequired();
            e.Property(x => x.Email).HasMaxLength(254);
            e.Property(x => x.State).HasMaxLength(60).IsRequired();
            e.Property(x => x.City).HasMaxLength(120);
            e.Property(x => x.Source).HasMaxLength(120).IsRequired();
            e.Property(x => x.Campaign).HasMaxLength(120);
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.Priority).HasMaxLength(10).IsRequired();
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
            e.Property(x => x.LastResponse).HasMaxLength(2000);
            // The database, not just the service, guarantees no two leads share a contact.
            e.HasIndex(x => x.Phone).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => new { x.OwnerId, x.Status });
            e.HasIndex(x => x.NextFollowUpAt);
            OwnerFks(e);
        });

        b.Entity<LeadActivity>(e =>
        {
            e.ToTable("lead_activities");
            e.Property(x => x.Type).HasMaxLength(30).IsRequired();
            e.Property(x => x.Note).HasMaxLength(2000);
            e.Property(x => x.Outcome).HasMaxLength(120);
            e.Property(x => x.ActorName).HasMaxLength(120);
            e.Property(x => x.ActorRole).HasMaxLength(30);
            e.Property(x => x.StatusAtTime).HasMaxLength(20);
            e.HasOne<Lead>().WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.LeadId);
        });

        b.Entity<LeadFollowUp>(e =>
        {
            e.ToTable("lead_followups");
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
            e.Property(x => x.Response).HasMaxLength(2000);
            e.HasOne<Lead>().WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.LeadId, x.Status });
            e.HasIndex(x => new { x.Status, x.DueAt });
        });

        b.Entity<LeadAssignment>(e =>
        {
            e.ToTable("lead_assignments");
            e.Property(x => x.ActorName).HasMaxLength(120);
            e.Property(x => x.Reason).HasMaxLength(500);
            e.Property(x => x.Type).HasMaxLength(30).IsRequired();
            e.Property(x => x.Source).HasMaxLength(30).IsRequired();
            e.HasOne<Lead>().WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.LeadId);
        });

        b.Entity<LeadRequest>(e =>
        {
            e.ToTable("lead_requests", t => t.HasCheckConstraint("ck_lead_requests_count", "\"count\" > 0"));
            e.Property(x => x.State).HasMaxLength(60).IsRequired();
            e.Property(x => x.Remarks).HasMaxLength(1000);
            e.Property(x => x.Status).HasMaxLength(30).IsRequired();
            e.Property(x => x.Version).IsConcurrencyToken();
            e.HasOne<Employee>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<Employee>().WithMany().HasForeignKey(x => x.TeamLeaderId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<Employee>().WithMany().HasForeignKey(x => x.ManagerId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.Events).WithOne().HasForeignKey(x => x.RequestId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Allocations).WithOne().HasForeignKey(x => x.RequestId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.OwnerId, x.Status });
            e.HasIndex(x => x.TeamLeaderId);
        });
        b.Entity<LeadRequestEvent>(e =>
        {
            e.ToTable("lead_request_events");
            e.Property(x => x.Action).HasMaxLength(30).IsRequired();
            e.Property(x => x.ActorName).HasMaxLength(120);
            e.Property(x => x.Note).HasMaxLength(1000);
        });
        b.Entity<LeadRequestAllocation>(e =>
        {
            e.ToTable("lead_request_allocations");
            e.HasKey(x => new { x.RequestId, x.LeadId });
            e.HasOne<Lead>().WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<DndNumber>(e =>
        {
            e.ToTable("dnd_numbers");
            e.Property(x => x.Phone).HasMaxLength(10).IsRequired();
            e.Property(x => x.ClientName).HasMaxLength(120);
            e.Property(x => x.Reason).HasMaxLength(500);
            e.Property(x => x.AddedByName).HasMaxLength(120);
            e.HasIndex(x => x.Phone).IsUnique();
        });

        b.Entity<Client>(e =>
        {
            e.ToTable("clients");
            e.Property(x => x.ClientCode).HasMaxLength(20).IsRequired();
            e.Property(x => x.Name).HasMaxLength(120).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(10).IsRequired();
            e.Property(x => x.Email).HasMaxLength(254);
            e.Property(x => x.State).HasMaxLength(60);
            e.Property(x => x.City).HasMaxLength(120);
            e.Property(x => x.Source).HasMaxLength(120);
            e.Property(x => x.Campaign).HasMaxLength(120);
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
            e.HasOne<Lead>().WithOne().HasForeignKey<Client>(x => x.LeadId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.LeadId).IsUnique();
            e.HasIndex(x => x.Phone).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.ClientCode).IsUnique();
            e.HasMany(x => x.Notes).WithOne().HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Subscriptions).WithOne().HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Trials).WithOne().HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
            OwnerFks(e);
        });
        b.Entity<ClientNote>(e =>
        {
            e.ToTable("client_notes");
            e.Property(x => x.AuthorName).HasMaxLength(120);
            e.Property(x => x.AuthorRole).HasMaxLength(30);
            e.Property(x => x.Response).HasMaxLength(120);
            e.Property(x => x.Text).HasMaxLength(2000);
        });
        b.Entity<ClientSubscription>(e =>
        {
            e.ToTable("client_subscriptions", t => t.HasCheckConstraint("ck_client_subscriptions_dates", "end_date >= start_date"));
            e.Property(x => x.ServiceName).HasMaxLength(120).IsRequired();
            e.Property(x => x.ServiceCategory).HasMaxLength(120);
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
            e.Property(x => x.InvoiceNo).HasMaxLength(60);
            e.Property(x => x.PaidAmount).HasPrecision(18, 2);
        });
        b.Entity<ClientTrial>(e =>
        {
            e.ToTable("client_trials", t => t.HasCheckConstraint("ck_client_trials_dates", "end_date >= start_date"));
            e.Property(x => x.Product).HasMaxLength(120).IsRequired();
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
        });

        b.Entity<Notification>(e =>
        {
            e.ToTable("notifications");
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.HasIndex(x => new { x.UserId, x.IsRead });
        });

        b.Entity<ImportBatch>(e =>
        {
            e.ToTable("import_batches");
            e.Property(x => x.FileName).HasMaxLength(200);
            e.Property(x => x.ActorName).HasMaxLength(120);
        });
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
