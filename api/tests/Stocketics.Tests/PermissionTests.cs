using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Tests.Support;

namespace Stocketics.Tests;

public class PermissionTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _f;
    public PermissionTests(ApiFactory f) => _f = f;

    [Fact]
    public async Task Matrix_is_seeded_from_the_frontend_defaults()
    {
        var admin = await _f.LoginAdminAsync();
        var json = await (await admin.GetAsync("/api/v1/permissions")).Content.ReadFromJsonAsync<JsonElement>();
        var roles = json.GetProperty("roles");
        Assert.Equal(26, roles.GetProperty("admin").GetArrayLength());
        Assert.Equal(22, roles.GetProperty("manager").GetArrayLength());
        Assert.Equal(14, roles.GetProperty("team_leader").GetArrayLength());
        Assert.Equal(8, roles.GetProperty("hr").GetArrayLength());
        Assert.Equal(4, roles.GetProperty("employee").GetArrayLength());
        Assert.Equal(26, json.GetProperty("catalogue").GetArrayLength());
    }

    [Fact]
    public async Task Editing_a_role_changes_what_its_users_can_do_without_a_restart()
    {
        var admin = await _f.LoginAdminAsync();
        await ApiFactory.CreateEmployeeAsync(admin, "hr.perm@test.local", Roles.Hr, "HR");
        var hr = await _f.LoginAsync("hr.perm@test.local", ApiFactory.GoodPassword);

        // HR can list employees (admin.employees)…
        Assert.Equal(HttpStatusCode.Created, (await hr.PostAsync("/api/v1/employees",
            new CreateEmployeeRequest("P One", "hr.perm.1@test.local", ApiFactory.GoodPassword, Roles.Employee, null, "HR", null, null, null, null, null, null))).StatusCode);

        // …until an admin removes it from the HR role.
        var hrPerms = Permissions.Defaults[Roles.Hr].Where(p => p != Permissions.AdminEmployees).ToArray();
        Assert.Equal(HttpStatusCode.NoContent, (await admin.PutAsync("/api/v1/permissions/hr", new SetPermissionsRequest(hrPerms))).StatusCode);

        Assert.Equal(HttpStatusCode.Forbidden, (await hr.PostAsync("/api/v1/employees",
            new CreateEmployeeRequest("P Two", "hr.perm.2@test.local", ApiFactory.GoodPassword, Roles.Employee, null, "HR", null, null, null, null, null, null))).StatusCode);

        // restore
        await admin.PutAsync("/api/v1/permissions/hr", new SetPermissionsRequest(Permissions.Defaults[Roles.Hr].ToArray()));
    }

    [Fact]
    public async Task Unknown_permission_or_role_is_rejected()
    {
        var admin = await _f.LoginAdminAsync();
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsync("/api/v1/permissions/hr",
            new SetPermissionsRequest(["leads.view.all", "made.up.permission"]))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsync("/api/v1/permissions/wizard",
            new SetPermissionsRequest(["leads.view.all"]))).StatusCode);
    }

    [Fact]
    public async Task Admin_role_cannot_lose_the_ability_to_manage_roles()
    {
        var admin = await _f.LoginAdminAsync();
        var without = Permissions.All.Where(p => p != Permissions.AdminRoles).ToArray();
        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsync("/api/v1/permissions/admin", new SetPermissionsRequest(without))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/v1/permissions")).StatusCode); // still administrable
    }
}
