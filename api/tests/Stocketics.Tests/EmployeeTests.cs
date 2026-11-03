using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Tests.Support;

namespace Stocketics.Tests;

public class EmployeeTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _f;
    public EmployeeTests(ApiFactory f) => _f = f;

    private static CreateEmployeeRequest NewReq(string email, string role = Roles.Employee, string? phone = null,
        string password = ApiFactory.GoodPassword, string department = "Advisory Sales", Guid? manager = null)
        => new("Some Person", email, password, role, phone, department, "Exec", null, null, null, 40000, manager);

    // ── creation & validation ─────────────────────────────────────────────

    [Fact]
    public async Task Admin_creates_employee_who_can_then_log_in_with_the_assigned_role()
    {
        var admin = await _f.LoginAdminAsync();
        var created = await admin.PostAsync("/api/v1/employees", NewReq("Create.Me@Test.Local", Roles.TeamLeader, "+91 98765 43210"));
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var dto = (await created.Content.ReadFromJsonAsync<EmployeeDto>())!;
        Assert.Equal("create.me@test.local", dto.Email);      // lower-cased
        Assert.Equal("9876543210", dto.Phone);                // normalised
        Assert.Equal(Roles.TeamLeader, dto.Role);
        Assert.True(dto.IsActive);

        var tl = await _f.LoginAsync("create.me@test.local", ApiFactory.GoodPassword);
        var me = (await (await tl.GetAsync("/api/v1/auth/me")).Content.ReadFromJsonAsync<CurrentUserDto>())!;
        Assert.Equal(Roles.TeamLeader, me.Role);
        Assert.Equal(14, me.Permissions.Count);
    }

    [Theory]
    [InlineData("weak")]                // too short
    [InlineData("alllowercase12345")]   // no uppercase
    [InlineData("ALLUPPERCASE12345")]   // no lowercase
    [InlineData("NoDigitsHereAtAll")]   // no digit
    public async Task Weak_passwords_are_rejected(string password)
    {
        var admin = await _f.LoginAdminAsync();
        var res = await admin.PostAsync("/api/v1/employees", NewReq($"weak{Guid.NewGuid():N}@test.local", password: password));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("5876543210")]
    public async Task Invalid_phone_is_rejected(string phone)
    {
        var admin = await _f.LoginAdminAsync();
        var res = await admin.PostAsync("/api/v1/employees", NewReq($"ph{Guid.NewGuid():N}@test.local", phone: phone));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.Contains("phone", await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Unknown_role_and_department_are_rejected()
    {
        var admin = await _f.LoginAdminAsync();
        var badRole = await admin.PostAsync("/api/v1/employees", NewReq($"r{Guid.NewGuid():N}@test.local", role: "superuser"));
        Assert.Equal(HttpStatusCode.BadRequest, badRole.StatusCode);
        var badDept = await admin.PostAsync("/api/v1/employees", NewReq($"d{Guid.NewGuid():N}@test.local", department: "Piracy"));
        Assert.Equal(HttpStatusCode.BadRequest, badDept.StatusCode);
    }

    [Fact]
    public async Task Duplicate_email_is_409_case_insensitively()
    {
        var admin = await _f.LoginAdminAsync();
        await ApiFactory.CreateEmployeeAsync(admin, "dupe@test.local", Roles.Employee);
        var again = await admin.PostAsync("/api/v1/employees", NewReq("DUPE@test.local"));
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
    }

    [Fact]
    public async Task Mutations_without_csrf_header_are_rejected()
    {
        var admin = await _f.LoginAdminAsync();
        var res = await admin.PostWithoutCsrfAsync("/api/v1/employees", NewReq("nocsrf@test.local"));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.False(await _f.WithDbAsync(db => db.Users.AnyAsync(u => u.Email == "nocsrf@test.local")));
    }

    // ── authorisation & scoping ───────────────────────────────────────────

    [Fact]
    public async Task Employee_role_cannot_create_or_modify_employees()
    {
        var admin = await _f.LoginAdminAsync();
        var target = await ApiFactory.CreateEmployeeAsync(admin, "victim@test.local", Roles.Employee);
        await ApiFactory.CreateEmployeeAsync(admin, "plain@test.local", Roles.Employee);
        var emp = await _f.LoginAsync("plain@test.local", ApiFactory.GoodPassword);

        Assert.Equal(HttpStatusCode.Forbidden, (await emp.PostAsync("/api/v1/employees", NewReq("x@test.local"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await emp.PostAsync($"/api/v1/employees/{target.Id}/deactivate")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await emp.PostAsync($"/api/v1/employees/{target.Id}/reset-password",
            new ResetPasswordRequest("Hijack#Pass2026"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await emp.GetAsync("/api/v1/permissions")).StatusCode);
    }

    [Fact]
    public async Task Employee_sees_only_self_in_list_and_is_forbidden_from_others()
    {
        var admin = await _f.LoginAdminAsync();
        var other = await ApiFactory.CreateEmployeeAsync(admin, "other.person@test.local", Roles.Employee);
        var me = await ApiFactory.CreateEmployeeAsync(admin, "scoped@test.local", Roles.Employee);
        var emp = await _f.LoginAsync("scoped@test.local", ApiFactory.GoodPassword);

        var list = (await (await emp.GetAsync("/api/v1/employees")).Content.ReadFromJsonAsync<PagedResult<EmployeeDto>>())!;
        Assert.Single(list.Items);
        Assert.Equal(me.Id, list.Items[0].Id);

        Assert.Equal(HttpStatusCode.Forbidden, (await emp.GetAsync($"/api/v1/employees/{other.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await emp.GetAsync($"/api/v1/employees/{Guid.NewGuid()}")).StatusCode);
    }

    [Fact]
    public async Task Manager_sees_self_and_direct_reports_only()
    {
        var admin = await _f.LoginAdminAsync();
        var mgr = await ApiFactory.CreateEmployeeAsync(admin, "mgr.scope@test.local", Roles.Manager);
        var report = await ApiFactory.CreateEmployeeAsync(admin, "report.scope@test.local", Roles.Employee, managerId: mgr.Id);
        await ApiFactory.CreateEmployeeAsync(admin, "stranger.scope@test.local", Roles.Employee);

        var m = await _f.LoginAsync("mgr.scope@test.local", ApiFactory.GoodPassword);
        var list = (await (await m.GetAsync("/api/v1/employees")).Content.ReadFromJsonAsync<PagedResult<EmployeeDto>>())!;
        Assert.Equal(new[] { mgr.Id, report.Id }.Order(), list.Items.Select(i => i.Id).Order());
    }

    [Fact]
    public async Task Hr_cannot_create_modify_or_reset_an_admin_nor_grant_the_admin_role()
    {
        var admin = await _f.LoginAdminAsync();
        await ApiFactory.CreateEmployeeAsync(admin, "hr.guard@test.local", Roles.Hr, "HR");
        var victim = await ApiFactory.CreateEmployeeAsync(admin, "promote.me@test.local", Roles.Employee);
        var adminDto = (await (await admin.GetAsync("/api/v1/employees?q=admin@test.local")).Content
            .ReadFromJsonAsync<PagedResult<EmployeeDto>>())!.Items.Single();
        var hr = await _f.LoginAsync("hr.guard@test.local", ApiFactory.GoodPassword);

        Assert.Equal(HttpStatusCode.Forbidden, (await hr.PostAsync("/api/v1/employees", NewReq("evil.admin@test.local", Roles.Admin))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await hr.PutAsync($"/api/v1/employees/{victim.Id}/role", new ChangeRoleRequest(Roles.Admin))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await hr.PostAsync($"/api/v1/employees/{adminDto.Id}/reset-password", new ResetPasswordRequest("Hijack#Pass2026"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await hr.PostAsync($"/api/v1/employees/{adminDto.Id}/deactivate")).StatusCode);
    }

    [Fact]
    public async Task Salary_is_hidden_from_callers_without_payroll_permission()
    {
        var admin = await _f.LoginAdminAsync();
        var mgr = await ApiFactory.CreateEmployeeAsync(admin, "mgr.salary@test.local", Roles.Manager);
        var report = await ApiFactory.CreateEmployeeAsync(admin, "rep.salary@test.local", Roles.Employee, managerId: mgr.Id, salary: 77777);

        Assert.Equal(77777m, (await (await admin.GetAsync($"/api/v1/employees/{report.Id}")).Content.ReadFromJsonAsync<EmployeeDto>())!.Salary);

        var m = await _f.LoginAsync("mgr.salary@test.local", ApiFactory.GoodPassword);
        var seen = (await (await m.GetAsync($"/api/v1/employees/{report.Id}")).Content.ReadFromJsonAsync<EmployeeDto>())!;
        Assert.Null(seen.Salary);
    }

    // ── concurrency, integrity ────────────────────────────────────────────

    private static UpdateEmployeeRequest Upd(EmployeeDto e, string title, int? version = null, Guid? manager = null)
        => new(e.Name, e.Phone, e.Department, title, e.Status, e.JoinDate, e.DateOfBirth, null, manager ?? e.ManagerId, version ?? e.Version);

    [Fact]
    public async Task Update_with_a_stale_version_returns_409_and_does_not_overwrite()
    {
        var admin = await _f.LoginAdminAsync();
        var e = await ApiFactory.CreateEmployeeAsync(admin, "versioned@test.local", Roles.Employee);

        var first = await admin.PutAsync($"/api/v1/employees/{e.Id}", Upd(e, "Senior"));
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        var updated = (await first.Content.ReadFromJsonAsync<EmployeeDto>())!;
        Assert.Equal(e.Version + 1, updated.Version);
        Assert.Equal("Senior", updated.Title);

        var stale = await admin.PutAsync($"/api/v1/employees/{e.Id}", Upd(e, "Stale write")); // old version
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);

        var now = (await (await admin.GetAsync($"/api/v1/employees/{e.Id}")).Content.ReadFromJsonAsync<EmployeeDto>())!;
        Assert.Equal("Senior", now.Title);
    }

    [Fact]
    public async Task Manager_cannot_be_self_or_create_a_reporting_loop()
    {
        var admin = await _f.LoginAdminAsync();
        var a = await ApiFactory.CreateEmployeeAsync(admin, "loop.a@test.local", Roles.Manager);
        var b = await ApiFactory.CreateEmployeeAsync(admin, "loop.b@test.local", Roles.Employee, managerId: a.Id);

        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsync($"/api/v1/employees/{a.Id}", Upd(a, "x", manager: a.Id))).StatusCode);
        // a → reports to b, but b already reports to a: loop.
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsync($"/api/v1/employees/{a.Id}", Upd(a, "x", manager: b.Id))).StatusCode);
    }

    [Fact]
    public async Task List_supports_search_filter_and_paging()
    {
        var admin = await _f.LoginAdminAsync();
        for (var i = 0; i < 3; i++)
            await ApiFactory.CreateEmployeeAsync(admin, $"pager{i}@test.local", Roles.Employee, department: "Finance");

        var page1 = (await (await admin.GetAsync("/api/v1/employees?department=Finance&q=pager&pageSize=2&page=1"))
            .Content.ReadFromJsonAsync<PagedResult<EmployeeDto>>())!;
        var page2 = (await (await admin.GetAsync("/api/v1/employees?department=Finance&q=pager&pageSize=2&page=2"))
            .Content.ReadFromJsonAsync<PagedResult<EmployeeDto>>())!;
        Assert.Equal(3, page1.Total);
        Assert.Equal(2, page1.Items.Count);
        Assert.Single(page2.Items);
        Assert.Empty(page1.Items.Select(i => i.Id).Intersect(page2.Items.Select(i => i.Id)));
    }

    // ── lifecycle & session invalidation ──────────────────────────────────

    [Fact]
    public async Task Deactivation_blocks_login_and_kills_the_live_session_immediately()
    {
        var admin = await _f.LoginAdminAsync();
        var e = await ApiFactory.CreateEmployeeAsync(admin, "leaver@test.local", Roles.Employee);
        var session = await _f.LoginAsync("leaver@test.local", ApiFactory.GoodPassword);
        Assert.Equal(HttpStatusCode.OK, (await session.GetAsync("/api/v1/auth/me")).StatusCode);

        var res = await admin.PostAsync($"/api/v1/employees/{e.Id}/deactivate");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.False((await res.Content.ReadFromJsonAsync<EmployeeDto>())!.IsActive);

        Assert.Equal(HttpStatusCode.Unauthorized, (await session.GetAsync("/api/v1/auth/me")).StatusCode);
        var relogin = await _f.NewClient().PostAsync("/api/v1/auth/login", new LoginRequest("leaver@test.local", ApiFactory.GoodPassword));
        Assert.Equal(HttpStatusCode.Unauthorized, relogin.StatusCode);

        // reactivation restores access
        await admin.PostAsync($"/api/v1/employees/{e.Id}/activate");
        await _f.LoginAsync("leaver@test.local", ApiFactory.GoodPassword);
    }

    [Fact]
    public async Task Admin_cannot_deactivate_self_or_the_last_admin()
    {
        var admin = await _f.LoginAdminAsync();
        var self = (await (await admin.GetAsync("/api/v1/employees?q=admin@test.local")).Content
            .ReadFromJsonAsync<PagedResult<EmployeeDto>>())!.Items.Single();
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PostAsync($"/api/v1/employees/{self.Id}/deactivate")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsync($"/api/v1/employees/{self.Id}/role", new ChangeRoleRequest(Roles.Employee))).StatusCode);
    }

    [Fact]
    public async Task Last_active_admin_cannot_be_demoted_or_deactivated_by_another_admin()
    {
        // A second admin, then each tries to remove the other; the final removal must be refused.
        var admin = await _f.LoginAdminAsync();
        var second = await ApiFactory.CreateEmployeeAsync(admin, "admin2.lastguard@test.local", Roles.Admin, "IT");
        var other = await _f.LoginAsync("admin2.lastguard@test.local", ApiFactory.GoodPassword);
        var first = (await (await admin.GetAsync("/api/v1/employees?q=admin@test.local")).Content
            .ReadFromJsonAsync<PagedResult<EmployeeDto>>())!.Items.Single();

        // second admin deactivates the first (allowed: two admins exist)…
        Assert.Equal(HttpStatusCode.OK, (await other.PostAsync($"/api/v1/employees/{first.Id}/deactivate")).StatusCode);
        // …so "second" is now the last active admin; nobody else can touch it, and it cannot act on itself.
        Assert.Equal(HttpStatusCode.BadRequest, (await other.PostAsync($"/api/v1/employees/{second.Id}/deactivate")).StatusCode);

        // restore so later tests in this class still have their admin
        Assert.Equal(HttpStatusCode.OK, (await other.PostAsync($"/api/v1/employees/{first.Id}/activate")).StatusCode);
    }

    [Fact]
    public async Task Role_change_takes_effect_on_the_users_existing_session()
    {
        var admin = await _f.LoginAdminAsync();
        var e = await ApiFactory.CreateEmployeeAsync(admin, "promotee@test.local", Roles.Employee);
        var session = await _f.LoginAsync("promotee@test.local", ApiFactory.GoodPassword);
        Assert.Equal(HttpStatusCode.Forbidden, (await session.PostAsync("/api/v1/employees", NewReq("nope@test.local"))).StatusCode);

        var changed = await admin.PutAsync($"/api/v1/employees/{e.Id}/role", new ChangeRoleRequest(Roles.Hr));
        Assert.Equal(HttpStatusCode.OK, changed.StatusCode);

        // Security stamp rotated → old cookie is invalid, user must sign in again and gets the new role.
        Assert.Equal(HttpStatusCode.Unauthorized, (await session.GetAsync("/api/v1/auth/me")).StatusCode);
        var fresh = await _f.LoginAsync("promotee@test.local", ApiFactory.GoodPassword);
        var me = (await (await fresh.GetAsync("/api/v1/auth/me")).Content.ReadFromJsonAsync<CurrentUserDto>())!;
        Assert.Equal(Roles.Hr, me.Role);
    }

    [Fact]
    public async Task Reset_password_changes_the_credential_and_clears_lockout()
    {
        var admin = await _f.LoginAdminAsync();
        var e = await ApiFactory.CreateEmployeeAsync(admin, "forgot@test.local", Roles.Employee);

        var bad = _f.NewClient();
        for (var i = 0; i < 5; i++)
            await bad.PostAsync("/api/v1/auth/login", new LoginRequest(e.Email, "Wrong#Pass12345"));

        var reset = await admin.PostAsync($"/api/v1/employees/{e.Id}/reset-password", new ResetPasswordRequest("Brand#NewPass2026"));
        Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);

        await _f.LoginAsync(e.Email, "Brand#NewPass2026");
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await _f.NewClient().PostAsync("/api/v1/auth/login", new LoginRequest(e.Email, ApiFactory.GoodPassword))).StatusCode);
    }

    // ── audit ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Admin_actions_are_audited_with_actor_and_never_contain_passwords()
    {
        var admin = await _f.LoginAdminAsync();
        var e = await ApiFactory.CreateEmployeeAsync(admin, "audited@test.local", Roles.Employee);
        await admin.PostAsync($"/api/v1/employees/{e.Id}/reset-password", new ResetPasswordRequest("Audit#Secret2026"));
        await admin.PostAsync($"/api/v1/employees/{e.Id}/deactivate");

        var rows = await _f.WithDbAsync(db => db.AuditLogs.AsNoTracking().Where(a => a.EntityId == e.Id.ToString()).ToListAsync());
        Assert.Contains(rows, r => r.Action == "employee.created" && r.ActorEmail == ApiFactory.AdminEmail);
        Assert.Contains(rows, r => r.Action == "employee.password.reset");
        Assert.Contains(rows, r => r.Action == "employee.deactivated");
        Assert.All(rows, r =>
        {
            Assert.DoesNotContain("Audit#Secret2026", r.Detail ?? "");
            Assert.DoesNotContain(ApiFactory.GoodPassword, r.Detail ?? "");
        });
    }
}
