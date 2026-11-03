using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Stocketics.Infrastructure.Persistence;

/// <summary>
/// Used only by <c>dotnet ef</c>. Migrations are always generated for PostgreSQL (the production provider),
/// and generating them needs no running database: the connection string below is never opened.
/// Runtime configuration is separate (see <see cref="DependencyInjection"/>).
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=design-time-only;Database=stocketics",
                n => n.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
            .Options;
        return new AppDbContext(options);
    }
}
