using System.Net;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Tests.Support;

namespace Stocketics.Tests;

public class LeadTests : IClassFixture<CrmWorld>
{
    private readonly CrmWorld _w;
    public LeadTests(CrmWorld w) => _w = w;

    private static UpdateLeadRequest Upd(LeadDto l, string? name = null, string? phone = null, int? version = null)
        => new(name ?? l.Name, phone ?? l.Phone, l.Email, l.State, l.City, l.Source, l.Campaign, l.Priority, l.Description, version ?? l.Version);

    // ── creation & validation (rules ported from crm.js) ──────────────────

    [Fact]
    public async Task Manager_creates_a_lead_with_normalised_contact_and_owns_it()
    {
        var res = await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(phone: "+91 98765 43210", email: "  Asha.Rao@Example.COM "));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var lead = await CrmWorld.Read<LeadDto>(res);
        Assert.Equal("9876543210", lead.Phone);
        Assert.Equal("asha.rao@example.com", lead.Email);
        Assert.Equal(LeadStatuses.New, lead.Status);
        Assert.Equal(_w.MgrDto.Id, lead.ManagerId);
        Assert.Null(lead.OwnerId);
    }

    [Fact]
    public async Task Duplicate_phone_or_email_is_rejected_even_when_formatted_differently()
    {
        var phone = CrmWorld.NextPhone();
        await _w.NewLead(phone: phone, email: "dupe.lead@example.com");

        Assert.Equal(HttpStatusCode.Conflict, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(phone: "+91" + phone))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(email: "DUPE.LEAD@example.com"))).StatusCode);
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("5876543210")]
    public async Task Invalid_phone_is_rejected(string phone)
        => Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(phone: phone))).StatusCode);

    [Fact]
    public async Task Unknown_state_source_or_bad_email_is_rejected()
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(state: "Atlantis"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(source: "Carrier pigeon"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(email: "not-an-email"))).StatusCode);
    }

    [Fact]
    public async Task Team_leader_and_employee_cannot_create_leads()
    {
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Tl.PostAsync("/api/v1/leads", CrmWorld.LeadReq())).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.PostAsync("/api/v1/leads", CrmWorld.LeadReq())).StatusCode);
    }

    [Fact]
    public async Task Anonymous_callers_are_rejected()
        => Assert.Equal(HttpStatusCode.Unauthorized, (await _w.F.NewClient().GetAsync("/api/v1/leads")).StatusCode);

    // ── visibility scoping ────────────────────────────────────────────────

    [Fact]
    public async Task Employee_sees_only_their_own_leads_and_is_forbidden_from_others()
    {
        var mine = await _w.LeadOwnedByE1();
        var teammates = await _w.NewLead();
        await _w.Assign(_w.Mgr, _w.E2Dto.Id, Roles.Employee, "Direct allocation for scoping test", null, teammates);

        var list = await _w.E1.GetJsonAsync<PagedResult<LeadDto>>("/api/v1/leads?pageSize=100");
        Assert.Contains(list.Items, l => l.Id == mine.Id);
        Assert.DoesNotContain(list.Items, l => l.Id == teammates.Id);
        Assert.All(list.Items, l => Assert.Equal(_w.E1Dto.Id, l.OwnerId));
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.GetAsync($"/api/v1/leads/{teammates.Id}")).StatusCode);
    }

    [Fact]
    public async Task Team_leader_sees_their_team_but_not_another_teams_leads()
    {
        var mine = await _w.LeadOwnedByE1();
        // The other team's lead belongs to the other manager's line.
        var other = await _w.NewLead(by: _w.Mgr2);
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Mgr2, _w.Tl2Dto.Id, Roles.TeamLeader, null, null, other)).StatusCode);

        var list = await _w.Tl.GetJsonAsync<PagedResult<LeadDto>>("/api/v1/leads?pageSize=100");
        Assert.Contains(list.Items, l => l.Id == mine.Id);
        Assert.DoesNotContain(list.Items, l => l.Id == other.Id);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Tl.GetAsync($"/api/v1/leads/{other.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _w.Tl2.GetAsync($"/api/v1/leads/{other.Id}")).StatusCode);
    }

    [Fact]
    public async Task Unknown_lead_is_404()
        => Assert.Equal(HttpStatusCode.NotFound, (await _w.Mgr.GetAsync($"/api/v1/leads/{Guid.NewGuid()}")).StatusCode);

    [Fact]
    public async Task List_filters_and_pages()
    {
        var phoneTag = CrmWorld.NextPhone();
        await _w.NewLead(phone: phoneTag, state: "Kerala", source: "Referral");
        for (var i = 0; i < 2; i++) await _w.NewLead(state: "Kerala", source: "Referral");

        var all = await _w.Mgr.GetJsonAsync<PagedResult<LeadDto>>("/api/v1/leads?state=Kerala&source=Referral&pageSize=2&page=1");
        Assert.True(all.Total >= 3);
        Assert.Equal(2, all.Items.Count);
        var byPhone = await _w.Mgr.GetJsonAsync<PagedResult<LeadDto>>($"/api/v1/leads?q={phoneTag}");
        Assert.Single(byPhone.Items);
        var unassigned = await _w.Mgr.GetJsonAsync<PagedResult<LeadDto>>("/api/v1/leads?unassigned=true&pageSize=100");
        Assert.All(unassigned.Items, l => Assert.Null(l.OwnerId));
    }

    // ── edit & concurrency ────────────────────────────────────────────────

    [Fact]
    public async Task Update_with_a_stale_version_returns_409_and_keeps_the_newer_data()
    {
        var lead = await _w.NewLead();
        var first = await _w.Mgr.PutAsync($"/api/v1/leads/{lead.Id}", Upd(lead, name: "Renamed Once"));
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var stale = await _w.Mgr.PutAsync($"/api/v1/leads/{lead.Id}", Upd(lead, name: "Stale Write"));
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal("Renamed Once", (await _w.Fresh(_w.Mgr, lead.Id)).Name);
    }

    [Fact]
    public async Task Edit_cannot_take_another_leads_phone()
    {
        var a = await _w.NewLead();
        var b = await _w.NewLead();
        Assert.Equal(HttpStatusCode.Conflict, (await _w.Mgr.PutAsync($"/api/v1/leads/{b.Id}", Upd(b, phone: a.Phone))).StatusCode);
    }

    [Fact]
    public async Task Edit_records_before_and_after_in_the_timeline()
    {
        var lead = await _w.NewLead();
        await _w.Mgr.PutAsync($"/api/v1/leads/{lead.Id}", Upd(lead, name: "Timeline Name"));
        var detail = await _w.Mgr.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        var edit = Assert.Single(detail.Activity, a => a.Type == ActivityTypes.Edit);
        Assert.Contains("Timeline Name", edit.Detail);
        Assert.Contains("Asha Rao", edit.Detail);
    }

    // ── assignment ────────────────────────────────────────────────────────

    [Fact]
    public async Task Manager_to_team_leader_then_team_leader_to_employee_builds_the_chain()
    {
        var lead = await _w.NewLead();
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Mgr, _w.TlDto.Id, Roles.TeamLeader, null, null, lead)).StatusCode);
        var atTl = await _w.Fresh(_w.Mgr, lead.Id);
        Assert.Equal(_w.TlDto.Id, atTl.TeamLeaderId);
        Assert.Equal(_w.MgrDto.Id, atTl.ManagerId);
        Assert.Null(atTl.OwnerId);

        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Tl, _w.E1Dto.Id, null, null, null, atTl)).StatusCode);
        var atE1 = await _w.Fresh(_w.Mgr, lead.Id);
        Assert.Equal(_w.E1Dto.Id, atE1.OwnerId);
        Assert.Equal(_w.TlDto.Id, atE1.TeamLeaderId);
        Assert.Equal("Asha Rao", (await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}")).Lead.Name);
    }

    [Fact]
    public async Task Direct_assignment_to_an_employee_by_a_manager_needs_a_reason()
    {
        var lead = await _w.NewLead();
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, null, null, lead)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Urgent: client asked for E1", null, lead)).StatusCode);
        var after = await _w.Fresh(_w.Mgr, lead.Id);
        Assert.Equal(_w.E1Dto.Id, after.OwnerId);
        Assert.Equal(_w.TlDto.Id, after.TeamLeaderId);   // derived from the employee's reporting line
        Assert.Equal(_w.MgrDto.Id, after.ManagerId);
    }

    [Fact]
    public async Task Reassignment_needs_a_reason_and_is_kept_in_the_history()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Tl, _w.E2Dto.Id, null, null, null, lead)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Tl, _w.E2Dto.Id, null, "E1 is on leave this week", null, lead)).StatusCode);

        var detail = await _w.Mgr.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        Assert.Equal(_w.E2Dto.Id, detail.Lead.OwnerId);
        Assert.Equal(3, detail.Assignments.Count); // manager→TL, TL→E1, E1→E2
        var latest = detail.Assignments[0];
        Assert.Equal("Reassignment", latest.Type);
        Assert.Equal(_w.E1Dto.Name, latest.PreviousOwnerName);
        Assert.Equal(_w.E2Dto.Name, latest.NewOwnerName);
        Assert.Equal("E1 is on leave this week", latest.Reason);
    }

    [Fact]
    public async Task Assigning_to_the_current_owner_is_rejected()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Tl, _w.E1Dto.Id, null, "Same person again", null, lead)).StatusCode);
    }

    [Fact]
    public async Task Team_leader_cannot_assign_to_another_teams_employee_and_manager_cannot_use_another_managers_leader()
    {
        var lead = await _w.NewLead();
        await _w.Assign(_w.Mgr, _w.TlDto.Id, Roles.TeamLeader, null, null, lead);
        lead = await _w.Fresh(_w.Mgr, lead.Id);

        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Tl, _w.E3Dto.Id, null, "Wrong team", null, lead)).StatusCode);

        var fresh = await _w.NewLead();
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.Tl2Dto.Id, Roles.TeamLeader, null, null, fresh)).StatusCode);
    }

    [Fact]
    public async Task Employees_cannot_assign_leads()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Assign(_w.E1, _w.E2Dto.Id, null, "Giving it away", null, lead)).StatusCode);
    }

    [Fact]
    public async Task Assigning_with_a_stale_version_returns_409_and_changes_nothing()
    {
        var lead = await _w.NewLead();
        var stale = lead with { Version = lead.Version + 5 };
        Assert.Equal(HttpStatusCode.Conflict, (await _w.Assign(_w.Mgr, _w.TlDto.Id, Roles.TeamLeader, null, null, stale)).StatusCode);
        Assert.Null((await _w.Fresh(_w.Mgr, lead.Id)).TeamLeaderId);
    }

    [Fact]
    public async Task Assignment_is_all_or_nothing_when_one_lead_in_the_batch_is_invalid()
    {
        var good = await _w.NewLead();
        var bad = await _w.NewLead();
        var res = await _w.Assign(_w.Mgr, _w.TlDto.Id, Roles.TeamLeader, null, null, good, bad with { Version = 99 });
        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
        Assert.Null((await _w.Fresh(_w.Mgr, good.Id)).TeamLeaderId);
    }

    [Fact]
    public async Task Target_must_be_an_active_person_with_the_right_role()
    {
        var lead = await _w.NewLead();
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.TeamLeader, null, null, lead)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, Guid.NewGuid(), Roles.TeamLeader, null, null, lead)).StatusCode);
    }

    [Fact]
    public async Task Assignment_notifies_the_new_owner()
    {
        var lead = await _w.LeadOwnedByE1();
        var notes = await _w.E1.GetJsonAsync<List<NotificationDto>>("/api/v1/notifications");
        Assert.Contains(notes, n => n.LeadId == lead.Id && n.Title.StartsWith("Lead assigned"));
    }

    [Fact]
    public async Task Hr_can_view_and_assign_across_teams_per_the_permission_matrix()
    {
        var lead = await _w.NewLead();
        Assert.Equal(HttpStatusCode.OK, (await _w.Hr.GetAsync($"/api/v1/leads/{lead.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Hr, _w.TlDto.Id, Roles.TeamLeader, null, null, lead)).StatusCode);
    }
}
