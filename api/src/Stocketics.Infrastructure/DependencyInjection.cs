using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocketics.Application.Abstractions;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;
using Stocketics.Infrastructure.Services;

namespace Stocketics.Infrastructure;

public static class DependencyInjection
{
    public const string PostgresProvider = "Postgres";
    public const string SqliteProvider = "Sqlite";

    /// <summary>
    /// Database provider is configuration, not code: <c>Database:Provider</c> = Postgres (production, the
    /// only provider migrations are generated for) or Sqlite (local development and tests, so the API runs
    /// on a machine without PostgreSQL).
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var provider = config["Database:Provider"] ?? PostgresProvider;
        var connection = config.GetConnectionString("Default");
        if (string.IsNullOrWhiteSpace(connection))
            throw new InvalidOperationException(
                "ConnectionStrings:Default is not configured. Set it via environment variable " +
                "ConnectionStrings__Default (see api/README.md).");

        services.AddDbContext<AppDbContext>(o =>
        {
            switch (provider)
            {
                case PostgresProvider:
                    o.UseNpgsql(connection, n => n.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName));
                    break;
                case SqliteProvider:
                    o.UseSqlite(connection);
                    break;
                default:
                    throw new InvalidOperationException($"Unknown Database:Provider '{provider}'. Use Postgres or Sqlite.");
            }
        });

        services.AddMemoryCache();
        services.AddHttpContextAccessor();

        services.AddIdentityCore<ApplicationUser>(o =>
            {
                o.User.RequireUniqueEmail = true;
                o.Password.RequiredLength = 10;
                o.Password.RequireDigit = true;
                o.Password.RequireLowercase = true;
                o.Password.RequireUppercase = true;
                o.Password.RequireNonAlphanumeric = false;
                o.Lockout.MaxFailedAccessAttempts = 5;
                o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                o.Lockout.AllowedForNewUsers = true;
            })
            .AddRoles<ApplicationRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies(o =>
        {
            o.ApplicationCookie?.Configure(c => ConfigureCookie(c, config));
        });

        // Re-check the security stamp on every request so deactivation, role changes and password resets
        // take effect immediately instead of after the default 30 minutes.
        services.Configure<SecurityStampValidatorOptions>(o => o.ValidationInterval = TimeSpan.Zero);

        services.AddScoped<ICurrentUser, HttpCurrentUser>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmployeeService, EmployeeService>();

        services.AddScoped<CrmAccess>();
        services.AddScoped<ICrmSettingsService, CrmSettingsService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ILeadService, LeadService>();
        services.AddScoped<ILeadImportService, LeadImportService>();
        services.AddScoped<IDndService, DndService>();
        services.AddScoped<ILeadRequestService, LeadRequestService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<FollowUpReminderProcessor>();
        services.AddHostedService<FollowUpReminderService>();
        return services;
    }

    private static void ConfigureCookie(CookieAuthenticationOptions c, IConfiguration config)
    {
        c.Cookie.Name = "stocketics.auth";
        c.Cookie.HttpOnly = true;
        c.Cookie.SameSite = SameSiteMode.Lax;
        // Secure by default; only relaxed explicitly for plain-http local development and tests.
        c.Cookie.SecurePolicy = config.GetValue("Auth:RequireHttpsCookies", true)
            ? CookieSecurePolicy.Always
            : CookieSecurePolicy.SameAsRequest;
        c.ExpireTimeSpan = TimeSpan.FromHours(config.GetValue("Auth:SessionHours", 8));
        c.SlidingExpiration = true;
        // This is a JSON API: answer 401/403 rather than redirecting to a login page.
        c.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
        c.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
    }
}
