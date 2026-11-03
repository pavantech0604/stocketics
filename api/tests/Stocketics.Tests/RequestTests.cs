using System.Net;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Tests.Support;

namespace Stocketics.Tests;

public class RequestTests : IClassFixture<CrmWorld>
{
    private readonly CrmWorld _w;
    public RequestTests(CrmWorld w) => _w = w;

    private static CreateLeadRequestRequest Req(string state, int count, bool draft = false, DateTimeOffset? by = null)
        => new(state, count, "Need more leads", by, draft);

    private static ReviewLeadRequestRequest Review(LeadRequestDto r, string status, int? count = null, string? comment = null)
        => new(r.Version, status, count, comment);

    // Each test uses its own state so the "one active request per employee per state" rule never couples them.

    [Fact]
    public async Task Employee_submits_a_request_that_goes_to_their_team_leader()
    {
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req("Goa", 10));
        Assert.Equal(RequestStatuses.Submitted, r.Status);
        Assert.Equal(_w.TlDto.Id, r.TeamLeaderId);
        Assert.Equal(_w.MgrDto.Id, r.ManagerId);
        Assert.Single(r.History);

        var tlNotes = await _w.Tl.GetJsonAsync<List<NotificationDto>>("/api/v1/notifications");
        Assert.Contains(tlNotes, n => n.Title.Contains(_w.E1Dto.Name));
    }

    [Fact]
    public async Task Only_employees_can_create_requests()
    {
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Tl.PostAsync("/api/v1/lead-requests", Req("Assam", 5))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Mgr.PostAsync("/api/v1/lead-requests", Req("Assam", 5))).StatusCode);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(101)]   // default cap is 100
    [InlineData(-3)]
    public async Task Quantity_must_be_within_the_configured_limit(int count)
        => Assert.Equal(HttpStatusCode.BadRequest, (await _w.E2.PostAsync("/api/v1/lead-requests", Req("Bihar", count))).StatusCode);

    [Fact]
    public async Task State_must_be_valid_and_required_by_must_be_in_the_future()
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E2.PostAsync("/api/v1/lead-requests", Req("Atlantis", 5))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E2.PostAsync("/api/v1/lead-requests", Req("Sikkim", 5, by: DateTimeOffset.UtcNow.AddDays(-1)))).StatusCode);
    }

    [Fact]
    public async Task A_second_active_request_for_the_same_state_is_a_conflict()
    {
        Assert.Equal(HttpStatusCode.OK, (await _w.E2.PostAsync("/api/v1/lead-requests", Req("Tripura", 5))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await _w.E2.PostAsync("/api/v1/lead-requests", Req("Tripura", 7))).StatusCode);
        // a different state is fine
        Assert.Equal(HttpStatusCode.OK, (await _w.E2.PostAsync("/api/v1/lead-requests", Req("Mizoram", 7))).StatusCode);
    }

    [Fact]
    public async Task Employees_cannot_approve_but_the_team_leader_can()
    {
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req("Nagaland", 4));
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Approved))).StatusCode);

        var approved = await _w.Tl.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Approved));
        Assert.Equal(RequestStatuses.Approved, approved.Status);
        Assert.Equal(4, approved.ApprovedCount);
        Assert.Equal(new[] { "Submitted", "Approved" }, approved.History.Select(h => h.Action));

        var empNotes = await _w.E1.GetJsonAsync<List<NotificationDto>>("/api/v1/notifications");
        Assert.Contains(empNotes, n => n.Title == "Lead request: Approved");
    }

    [Fact]
    public async Task Another_teams_leader_or_employee_cannot_see_or_review_the_request()
    {
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req("Meghalaya", 4));
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Tl2.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Approved))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Mgr2.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Approved))).StatusCode);

        Assert.DoesNotContain(await _w.Tl2.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests"), x => x.Id == r.Id);
        Assert.DoesNotContain(await _w.E2.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests"), x => x.Id == r.Id);
        Assert.Contains(await _w.Tl.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests"), x => x.Id == r.Id);
    }

    [Fact]
    public async Task Partial_approval_needs_a_comment_and_a_count_below_the_request()
    {
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req("Manipur", 10));
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.PartiallyApproved, 6, null))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.PartiallyApproved, 10, "Not partial at all"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.PartiallyApproved, 0, "Zero is not partial"))).StatusCode);

        var ok = await _w.Tl.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.PartiallyApproved, 6, "Only six available"));
        Assert.Equal(6, ok.ApprovedCount);
    }

    [Fact]
    public async Task Rejection_needs_a_comment_and_closes_the_request()
    {
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req("Arunachal Pradesh", 3));
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Rejected))).StatusCode);
        var rejected = await _w.Tl.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Rejected, null, "No leads left in this state"));
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(rejected, RequestStatuses.Approved))).StatusCode);
        // closed, so the employee may ask again for that state
        Assert.Equal(HttpStatusCode.OK, (await _w.E1.PostAsync("/api/v1/lead-requests", Req("Arunachal Pradesh", 3))).StatusCode);
    }

    [Fact]
    public async Task Stale_review_version_is_a_conflict()
    {
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req("Ladakh", 3));
        await _w.Tl.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.SeenByTeamLeader));
        Assert.Equal(HttpStatusCode.Conflict, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Approved))).StatusCode);
    }

    [Fact]
    public async Task Drafts_are_private_to_the_employee_until_submitted()
    {
        var draft = await _w.E2.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req("Puducherry", 3, draft: true));
        Assert.Equal(RequestStatuses.Draft, draft.Status);
        Assert.DoesNotContain(await _w.Tl.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests"), x => x.Id == draft.Id);
        Assert.Contains(await _w.E2.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests"), x => x.Id == draft.Id);

        // the team leader cannot see or approve a draft
        Assert.Equal(HttpStatusCode.NotFound, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{draft.Id}/review", Review(draft, RequestStatuses.Approved))).StatusCode);
        var submitted = await _w.E2.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{draft.Id}/review", Review(draft, RequestStatuses.Submitted));
        Assert.Equal(RequestStatuses.Submitted, submitted.Status);
        Assert.Contains(await _w.Tl.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests"), x => x.Id == draft.Id);
    }

    // ── allocation ────────────────────────────────────────────────────────

    [Fact]
    public async Task Approved_request_is_fulfilled_by_allocating_matching_leads_to_the_requester()
    {
        const string state = "Jharkhand";
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req(state, 2));
        r = await _w.Tl.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Approved));

        var a = await _w.NewLead(state: state);
        var b = await _w.NewLead(state: state);

        // first lead: partially allocated
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Fulfilling E1's approved request", r.Id, a)).StatusCode);
        var mid = (await _w.E1.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests")).Single(x => x.Id == r.Id);
        Assert.Equal(1, mid.AllocatedCount);
        Assert.Equal(RequestStatuses.Approved, mid.Status);

        // second lead completes it
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Fulfilling E1's approved request", r.Id, b)).StatusCode);
        var done = (await _w.E1.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests")).Single(x => x.Id == r.Id);
        Assert.Equal(RequestStatuses.Fulfilled, done.Status);
        Assert.Equal(2, done.AllocatedCount);
        Assert.Equal("Fulfilled", done.History.Last().Action);

        var detail = await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{a.Id}");
        Assert.Equal("Lead request", detail.Assignments[0].Source);
        Assert.Equal(r.Id, detail.Assignments[0].RequestId);

        // a fulfilled request cannot be allocated against again
        var c = await _w.NewLead(state: state);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "One too many for the request", r.Id, c)).StatusCode);
    }

    [Fact]
    public async Task Allocation_cannot_exceed_the_approved_count_or_use_the_wrong_state_or_person()
    {
        const string state = "Chhattisgarh";
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req(state, 5));
        r = await _w.Tl.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.PartiallyApproved, 1, "Only one available"));

        var a = await _w.NewLead(state: state);
        var b = await _w.NewLead(state: state);
        var wrongState = await _w.NewLead(state: "Odisha");

        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Two against an approval of one", r.Id, a, b)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Lead from the wrong state", r.Id, wrongState)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.E2Dto.Id, Roles.Employee, "Request belongs to E1 not E2", r.Id, a)).StatusCode);
    }

    [Fact]
    public async Task Unapproved_request_cannot_be_allocated_and_allocated_requests_cannot_be_changed()
    {
        const string state = "Telangana";
        var r = await _w.E1.PostJsonAsync<LeadRequestDto>("/api/v1/lead-requests", Req(state, 3));
        var lead = await _w.NewLead(state: state);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Request is only submitted", r.Id, lead)).StatusCode);

        r = await _w.Tl.PostJsonAsync<LeadRequestDto>($"/api/v1/lead-requests/{r.Id}/review", Review(r, RequestStatuses.Approved));
        Assert.Equal(HttpStatusCode.OK, (await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Request is approved now", r.Id, lead)).StatusCode);
        var current = (await _w.Tl.GetJsonAsync<List<LeadRequestDto>>("/api/v1/lead-requests")).Single(x => x.Id == r.Id);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Tl.PostAsync($"/api/v1/lead-requests/{r.Id}/review", Review(current, RequestStatuses.Rejected, null, "Changed my mind later"))).StatusCode);
    }
}
