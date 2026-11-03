using System.Net.Http.Json;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;

namespace Stocketics.Tests.Support;

/// <summary>
/// One API instance per test class with a realistic hierarchy:
///   Mgr ─ Tl ─ E1, E2          Mgr2 ─ Tl2 ─ E3          plus an HR user.
/// Leads are created with unique phone numbers so tests in a class never collide.
/// </summary>
public sealed class CrmWorld : IAsyncLifetime
{
    private static long _phone = 100_000_000;

    public ApiFactory F { get; } = new();
    public TestClient Admin = null!, Mgr = null!, Tl = null!, E1 = null!, E2 = null!, Mgr2 = null!, Tl2 = null!, E3 = null!, Hr = null!;
    public EmployeeDto MgrDto = null!, TlDto = null!, E1Dto = null!, E2Dto = null!, Mgr2Dto = null!, Tl2Dto = null!, E3Dto = null!;

    public static string NextPhone() => "9" + Interlocked.Increment(ref _phone).ToString("D9");

    public async Task InitializeAsync()
    {
        Admin = await F.LoginAdminAsync();
        MgrDto = await ApiFactory.CreateEmployeeAsync(Admin, "mgr@crm.local", Roles.Manager);
        TlDto = await ApiFactory.CreateEmployeeAsync(Admin, "tl@crm.local", Roles.TeamLeader, managerId: MgrDto.Id);
        E1Dto = await ApiFactory.CreateEmployeeAsync(Admin, "e1@crm.local", Roles.Employee, managerId: TlDto.Id);
        E2Dto = await ApiFactory.CreateEmployeeAsync(Admin, "e2@crm.local", Roles.Employee, managerId: TlDto.Id);
        Mgr2Dto = await ApiFactory.CreateEmployeeAsync(Admin, "mgr2@crm.local", Roles.Manager);
        Tl2Dto = await ApiFactory.CreateEmployeeAsync(Admin, "tl2@crm.local", Roles.TeamLeader, managerId: Mgr2Dto.Id);
        E3Dto = await ApiFactory.CreateEmployeeAsync(Admin, "e3@crm.local", Roles.Employee, managerId: Tl2Dto.Id);
        await ApiFactory.CreateEmployeeAsync(Admin, "hr@crm.local", Roles.Hr, "HR");

        Mgr = await F.LoginAsync("mgr@crm.local", ApiFactory.GoodPassword);
        Tl = await F.LoginAsync("tl@crm.local", ApiFactory.GoodPassword);
        E1 = await F.LoginAsync("e1@crm.local", ApiFactory.GoodPassword);
        E2 = await F.LoginAsync("e2@crm.local", ApiFactory.GoodPassword);
        Mgr2 = await F.LoginAsync("mgr2@crm.local", ApiFactory.GoodPassword);
        Tl2 = await F.LoginAsync("tl2@crm.local", ApiFactory.GoodPassword);
        E3 = await F.LoginAsync("e3@crm.local", ApiFactory.GoodPassword);
        Hr = await F.LoginAsync("hr@crm.local", ApiFactory.GoodPassword);
    }

    public Task DisposeAsync()
    {
        F.Dispose();
        return Task.CompletedTask;
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    public static CreateLeadRequest LeadReq(string? phone = null, string? email = null, string state = "Karnataka",
        string source = "Website", string name = "Asha Rao")
        => new(name, phone ?? NextPhone(), email, state, "Bengaluru", source, "Diwali", null, null, null);

    public Task<LeadDto> NewLead(TestClient? by = null, string? phone = null, string? email = null,
        string state = "Karnataka", string source = "Website")
        => (by ?? Mgr).PostJsonAsync<LeadDto>("/api/v1/leads", LeadReq(phone, email, state, source));

    public async Task<LeadDto> Fresh(TestClient c, Guid id) => (await c.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{id}")).Lead;

    public Task<HttpResponseMessage> Assign(TestClient c, Guid targetId, string? role, string? reason, Guid? requestId, params LeadDto[] leads)
        => c.PostAsync("/api/v1/leads/assign", new AssignLeadsRequest(
            leads.Select(l => new AssignItem(l.Id, l.Version)).ToList(), targetId, role, reason, requestId));

    /// <summary>A lead assigned manager → team leader → employee E1, ready for the employee to work.</summary>
    public async Task<LeadDto> LeadOwnedByE1(string state = "Karnataka")
    {
        var lead = await NewLead(state: state);
        var toTl = await Assign(Mgr, TlDto.Id, Roles.TeamLeader, null, null, lead);
        toTl.EnsureSuccessStatusCode();
        lead = await Fresh(Mgr, lead.Id);
        (await Assign(Tl, E1Dto.Id, null, null, null, lead)).EnsureSuccessStatusCode();
        return await Fresh(Mgr, lead.Id);
    }

    public static async Task<string> Body(HttpResponseMessage r) => await r.Content.ReadAsStringAsync();

    public static async Task<T> Read<T>(HttpResponseMessage r) => (await r.Content.ReadFromJsonAsync<T>())!;
}
