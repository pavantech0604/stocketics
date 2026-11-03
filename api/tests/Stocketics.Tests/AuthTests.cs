using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Tests.Support;

namespace Stocketics.Tests;

public class AuthTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _f;
    public AuthTests(ApiFactory f) => _f = f;

    [Fact]
    public async Task Health_is_open_and_healthy()
    {
        var res = await _f.NewClient().GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task Protected_endpoints_return_401_not_a_redirect_when_anonymous()
    {
        var c = _f.NewClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync("/api/v1/employees")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync("/api/v1/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await c.GetAsync("/api/v1/permissions")).StatusCode);
    }

    [Fact]
    public async Task Login_without_csrf_token_is_rejected()
    {
        var res = await _f.NewClient().PostWithoutCsrfAsync("/api/v1/auth/login",
            new LoginRequest(ApiFactory.AdminEmail, ApiFactory.AdminPassword));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Admin_can_login_and_me_returns_all_26_permissions()
    {
        var admin = await _f.LoginAdminAsync();
        var me = await admin.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        var dto = (await me.Content.ReadFromJsonAsync<CurrentUserDto>())!;
        Assert.Equal(Roles.Admin, dto.Role);
        Assert.Equal(ApiFactory.AdminEmail, dto.Email);
        Assert.Equal(26, dto.Permissions.Count);
    }

    [Fact]
    public async Task Auth_cookie_is_httponly_and_samesite_lax()
    {
        var c = _f.NewClient();
        var res = await c.PostAsync("/api/v1/auth/login", new LoginRequest(ApiFactory.AdminEmail, ApiFactory.AdminPassword));
        var cookie = res.Headers.GetValues("Set-Cookie").Single(h => h.StartsWith("stocketics.auth="));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", cookie, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Wrong_password_and_unknown_user_give_identical_401_so_accounts_cannot_be_enumerated()
    {
        var c = _f.NewClient();
        var wrong = await c.PostAsync("/api/v1/auth/login", new LoginRequest(ApiFactory.AdminEmail, "Wrong#Pass12345"));
        var unknown = await c.PostAsync("/api/v1/auth/login", new LoginRequest("nobody@test.local", "Wrong#Pass12345"));
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unknown.StatusCode);
        Assert.Equal(await wrong.Content.ReadAsStringAsync().ContinueWith(t => Strip(t.Result)),
                     await unknown.Content.ReadAsStringAsync().ContinueWith(t => Strip(t.Result)));
    }

    // traceId differs per request; compare everything else.
    private static string Strip(string json) => System.Text.RegularExpressions.Regex.Replace(json, "\"traceId\":\"[^\"]*\"", "");

    [Fact]
    public async Task Account_locks_after_five_bad_passwords_even_for_the_right_password()
    {
        var admin = await _f.LoginAdminAsync();
        var emp = await ApiFactory.CreateEmployeeAsync(admin, "lockme@test.local", Roles.Employee);

        var c = _f.NewClient();
        // Failures 1-4 are plain 401s; the 5th trips the lockout threshold and Identity reports it at once.
        for (var i = 0; i < 4; i++)
            Assert.Equal(HttpStatusCode.Unauthorized,
                (await c.PostAsync("/api/v1/auth/login", new LoginRequest(emp.Email, "Wrong#Pass12345"))).StatusCode);
        Assert.Equal((HttpStatusCode)423,
            (await c.PostAsync("/api/v1/auth/login", new LoginRequest(emp.Email, "Wrong#Pass12345"))).StatusCode);

        var locked = await c.PostAsync("/api/v1/auth/login", new LoginRequest(emp.Email, ApiFactory.GoodPassword));
        Assert.Equal((HttpStatusCode)423, locked.StatusCode);
    }

    [Fact]
    public async Task Logout_ends_the_session()
    {
        var admin = await _f.LoginAdminAsync();
        Assert.Equal(HttpStatusCode.NoContent, (await admin.PostAsync("/api/v1/auth/logout")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await admin.GetAsync("/api/v1/auth/me")).StatusCode);
    }

    [Fact]
    public async Task Change_password_requires_current_password_and_enforces_policy()
    {
        var admin = await _f.LoginAdminAsync();
        await ApiFactory.CreateEmployeeAsync(admin, "pwchange@test.local", Roles.Employee);
        var emp = await _f.LoginAsync("pwchange@test.local", ApiFactory.GoodPassword);

        var wrongCurrent = await emp.PostAsync("/api/v1/auth/change-password",
            new ChangePasswordRequest("Nope#Pass12345", "Another#Pass2026"));
        Assert.Equal(HttpStatusCode.BadRequest, wrongCurrent.StatusCode);

        var weak = await emp.PostAsync("/api/v1/auth/change-password",
            new ChangePasswordRequest(ApiFactory.GoodPassword, "short"));
        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);

        var ok = await emp.PostAsync("/api/v1/auth/change-password",
            new ChangePasswordRequest(ApiFactory.GoodPassword, "Another#Pass2026"));
        Assert.Equal(HttpStatusCode.NoContent, ok.StatusCode);

        await _f.LoginAsync("pwchange@test.local", "Another#Pass2026"); // new password works
    }

    [Fact]
    public async Task Login_and_failures_are_audited_without_secrets()
    {
        var c = _f.NewClient();
        await c.PostAsync("/api/v1/auth/login", new LoginRequest(ApiFactory.AdminEmail, "Wrong#Pass12345"));
        await _f.LoginAdminAsync();

        var rows = await _f.WithDbAsync(db => db.AuditLogs.AsNoTracking().ToListAsync());
        Assert.Contains(rows, r => r.Action == "auth.login.failed");
        Assert.Contains(rows, r => r.Action == "auth.login");
        Assert.DoesNotContain(rows, r => (r.Detail ?? "").Contains("Wrong#Pass", StringComparison.Ordinal));
        Assert.DoesNotContain(rows, r => (r.Detail ?? "").Contains(ApiFactory.AdminPassword, StringComparison.Ordinal));
    }

    [Fact]
    public async Task Passwords_are_stored_hashed()
    {
        await _f.LoginAdminAsync();
        var hash = await _f.WithDbAsync(db => db.Users.AsNoTracking()
            .Where(u => u.Email == ApiFactory.AdminEmail).Select(u => u.PasswordHash).SingleAsync());
        Assert.NotNull(hash);
        Assert.DoesNotContain(ApiFactory.AdminPassword, hash);
    }
}
