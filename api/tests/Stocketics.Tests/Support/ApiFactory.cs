using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Stocketics.Application.Dtos;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Tests.Support;

/// <summary>Boots the real API against a throwaway SQLite file, seeded with one admin.</summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin@test.local";
    public const string AdminPassword = "Admin#Pass12345";
    public const string GoodPassword = "Sturdy#Pass2026";

    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"stocketics-test-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        // UseSetting (not ConfigureAppConfiguration): Program.cs reads configuration eagerly while building.
        builder.UseSetting("Database:Provider", "Sqlite");
        builder.UseSetting("ConnectionStrings:Default", $"Data Source={_dbPath}");
        builder.UseSetting("Auth:RequireHttpsCookies", "false");
        builder.UseSetting("RateLimit:LoginPerMinute", "10000");
        builder.UseSetting("Seed:AdminEmail", AdminEmail);
        builder.UseSetting("Seed:AdminPassword", AdminPassword);
    }

    public TestClient NewClient() => new(CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("http://localhost"),
        HandleCookies = true,
        AllowAutoRedirect = false,
    }));

    public async Task<TestClient> LoginAsync(string email, string password)
    {
        var c = NewClient();
        var res = await c.PostAsync("/api/v1/auth/login", new LoginRequest(email, password));
        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"Login as {email} failed: {(int)res.StatusCode} {await res.Content.ReadAsStringAsync()}");
        await c.RefreshCsrfAsync();
        return c;
    }

    public Task<TestClient> LoginAdminAsync() => LoginAsync(AdminEmail, AdminPassword);

    /// <summary>Creates an employee as the given admin client and returns the created DTO.</summary>
    public static async Task<EmployeeDto> CreateEmployeeAsync(TestClient admin, string email, string role,
        string department = "Advisory Sales", Guid? managerId = null, string password = GoodPassword, decimal salary = 50000)
    {
        var res = await admin.PostAsync("/api/v1/employees", new CreateEmployeeRequest(
            "Test " + email.Split('@')[0], email, password, role, null, department, "Tester", null, null, null, salary, managerId));
        res.EnsureSuccessStatusCode();
        return (await res.Content.ReadFromJsonAsync<EmployeeDto>())!;
    }

    public async Task<T> WithDbAsync<T>(Func<AppDbContext, Task<T>> action)
    {
        using var scope = Services.CreateScope();
        return await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing) return;
        SqliteConnection.ClearAllPools();
        try { File.Delete(_dbPath); } catch (IOException) { /* temp file; OS cleans up eventually */ }
    }
}

/// <summary>HttpClient wrapper that attaches the CSRF header the API requires on unsafe methods.</summary>
public sealed class TestClient(HttpClient http)
{
    public HttpClient Http { get; } = http;
    private string? _csrf;

    public async Task RefreshCsrfAsync()
    {
        var body = await Http.GetFromJsonAsync<CsrfResponse>("/api/v1/auth/csrf");
        _csrf = body!.Token;
    }

    public Task<HttpResponseMessage> GetAsync(string url) => Http.GetAsync(url);

    public Task<HttpResponseMessage> PostAsync(string url, object? body = null) => Send(HttpMethod.Post, url, body, withCsrf: true);

    public Task<HttpResponseMessage> PutAsync(string url, object? body = null) => Send(HttpMethod.Put, url, body, withCsrf: true);

    /// <summary>For asserting that the API rejects a mutating call that lacks the CSRF header.</summary>
    public Task<HttpResponseMessage> PostWithoutCsrfAsync(string url, object? body = null) => Send(HttpMethod.Post, url, body, withCsrf: false);

    private async Task<HttpResponseMessage> Send(HttpMethod method, string url, object? body, bool withCsrf)
    {
        if (withCsrf && _csrf is null) await RefreshCsrfAsync();
        var req = new HttpRequestMessage(method, url);
        if (body is not null) req.Content = JsonContent.Create(body, body.GetType());
        if (withCsrf) req.Headers.Add("X-CSRF-TOKEN", _csrf);
        return await Http.SendAsync(req);
    }

    public sealed record CsrfResponse(string Token, string HeaderName);
}
