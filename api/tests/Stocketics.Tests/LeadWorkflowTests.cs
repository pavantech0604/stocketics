using System.Net;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Infrastructure.Services;
using Stocketics.Tests.Support;

namespace Stocketics.Tests;

public class LeadWorkflowTests : IClassFixture<CrmWorld>
{
    private readonly CrmWorld _w;
    public LeadWorkflowTests(CrmWorld w) => _w = w;

    private static RecordResponseRequest Resp(LeadDto l, string note = "Spoke to client, interested", DateTimeOffset? next = null,
        Guid? followUp = null, Guid? corrects = null, int? version = null)
        => new(version ?? l.Version, note, "Interested", next, followUp, corrects);

    private static UpdateLeadRequest Upd(LeadDto l, string name)
        => new(name, l.Phone, l.Email, l.State, l.City, l.Source, l.Campaign, l.Priority, l.Description, l.Version);

    // ── responses & follow-ups ────────────────────────────────────────────

    [Fact]
    public async Task Owner_records_a_response_and_schedules_a_future_follow_up()
    {
        var lead = await _w.LeadOwnedByE1();
        var due = DateTimeOffset.UtcNow.AddDays(1);
        var res = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: due));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);

        var detail = await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        Assert.Equal("Spoke to client, interested", detail.Lead.LastResponse);
        Assert.NotNull(detail.Lead.NextFollowUpAt);
        Assert.Single(detail.FollowUps, f => f.Status == "Open");
        Assert.Contains(detail.Activity, a => a.Type == ActivityTypes.Call && a.Outcome == "Interested");
    }

    [Fact]
    public async Task Follow_up_in_the_past_is_rejected()
    {
        var lead = await _w.LeadOwnedByE1();
        var res = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: DateTimeOffset.UtcNow.AddMinutes(-5)));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.Contains("future", await CrmWorld.Body(res));
    }

    [Fact]
    public async Task Follow_up_needs_an_owner()
    {
        var lead = await _w.NewLead();
        await _w.Assign(_w.Mgr, _w.TlDto.Id, Roles.TeamLeader, null, null, lead);
        lead = await _w.Fresh(_w.Mgr, lead.Id);   // at the team leader, no employee yet
        var res = await _w.Tl.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: DateTimeOffset.UtcNow.AddDays(1)));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Completing_a_follow_up_closes_it_and_clears_the_next_due_date()
    {
        var lead = await _w.LeadOwnedByE1();
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: DateTimeOffset.UtcNow.AddDays(1)));
        var detail = await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        var followUp = detail.FollowUps.Single();

        var done = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(detail.Lead, "Closed the loop", followUp: followUp.Id));
        Assert.Equal(HttpStatusCode.OK, done.StatusCode);

        var after = await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        Assert.Equal("Completed", after.FollowUps.Single().Status);
        Assert.Null(after.Lead.NextFollowUpAt);

        // a completed follow-up cannot be completed again
        var again = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(after.Lead, "Again", followUp: followUp.Id));
        Assert.Equal(HttpStatusCode.BadRequest, again.StatusCode);
    }

    [Fact]
    public async Task Next_follow_up_is_the_earliest_of_the_open_ones()
    {
        var lead = await _w.LeadOwnedByE1();
        var soon = DateTimeOffset.UtcNow.AddHours(2);
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: DateTimeOffset.UtcNow.AddDays(3)));
        lead = await _w.Fresh(_w.E1, lead.Id);
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: soon));
        var after = await _w.Fresh(_w.E1, lead.Id);
        Assert.True(Math.Abs((after.NextFollowUpAt!.Value - soon).TotalSeconds) < 2);

        var window = await _w.E1.GetJsonAsync<PagedResult<LeadDto>>(
            $"/api/v1/leads?dueFrom={Uri.EscapeDataString(DateTimeOffset.UtcNow.ToString("o"))}&dueTo={Uri.EscapeDataString(DateTimeOffset.UtcNow.AddHours(3).ToString("o"))}");
        Assert.Contains(window.Items, l => l.Id == lead.Id);
    }

    [Fact]
    public async Task A_correction_adds_a_new_entry_and_leaves_the_original_untouched()
    {
        var lead = await _w.LeadOwnedByE1();
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, "Wrong note"));
        var detail = await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        var original = detail.Activity.Single(a => a.Note == "Wrong note");

        var fix = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(detail.Lead, "Corrected note", corrects: original.Id));
        Assert.Equal(HttpStatusCode.OK, fix.StatusCode);

        var after = await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        Assert.Contains(after.Activity, a => a.Id == original.Id && a.Note == "Wrong note");
        Assert.Contains(after.Activity, a => a.Type == ActivityTypes.Correction && a.OriginalActivityId == original.Id);
    }

    [Fact]
    public async Task Correction_must_reference_an_entry_of_the_same_lead()
    {
        var a = await _w.LeadOwnedByE1();
        var b = await _w.LeadOwnedByE1();
        await _w.E1.PostAsync($"/api/v1/leads/{a.Id}/responses", Resp(a, "On lead A"));
        var foreign = (await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{a.Id}")).Activity.First(x => x.Note == "On lead A");
        var res = await _w.E1.PostAsync($"/api/v1/leads/{b.Id}/responses", Resp(b, "Sneaky", corrects: foreign.Id));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Another_employee_cannot_record_a_response_on_someone_elses_lead()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E2.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead))).StatusCode);
    }

    // ── status ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Qualifying_requires_an_owner_and_a_recorded_call()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.BadRequest,
            (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.Qualified, null))).StatusCode);

        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead));
        lead = await _w.Fresh(_w.E1, lead.Id);
        var ok = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.Qualified, null));
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.Equal(LeadStatuses.Qualified, (await CrmWorld.Read<LeadDto>(ok)).Status);
    }

    [Fact]
    public async Task Lost_needs_a_reason_and_converted_cannot_be_set_directly()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.BadRequest,
            (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.Lost, null))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.Converted, null))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, "Banana", null))).StatusCode);

        var lost = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.Lost, "Not interested"));
        Assert.Equal(HttpStatusCode.OK, lost.StatusCode);
    }

    // ── conversion ────────────────────────────────────────────────────────

    private async Task<(LeadDto Lead, ClientDto Client)> QualifyAndConvert(string? email = null)
    {
        var lead = await _w.NewLead(email: email);
        await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Direct allocation for conversion test", null, lead);
        lead = await _w.Fresh(_w.E1, lead.Id);
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead));
        lead = await _w.Fresh(_w.E1, lead.Id);
        (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.Qualified, null))).EnsureSuccessStatusCode();
        lead = await _w.Fresh(_w.E1, lead.Id);
        var client = await _w.E1.PostJsonAsync<ClientDto>($"/api/v1/leads/{lead.Id}/convert", new ConvertLeadRequest(lead.Version));
        return (await _w.Fresh(_w.E1, lead.Id), client);
    }

    [Fact]
    public async Task Converting_a_qualified_lead_creates_one_client_and_keeps_the_history_linked()
    {
        var (lead, client) = await QualifyAndConvert();
        Assert.Equal(LeadStatuses.Converted, lead.Status);
        Assert.StartsWith("CL-", client.ClientCode);
        Assert.Equal(lead.Id, client.LeadId);
        Assert.Equal(lead.Phone, client.Phone);
        Assert.Equal(_w.E1Dto.Id, client.OwnerId);

        var detail = await _w.E1.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        Assert.Equal(client.Id, detail.ClientId);
        Assert.Contains(detail.Activity, a => a.Type == ActivityTypes.Conversion);
        Assert.Contains(detail.Activity, a => a.Type == ActivityTypes.Call);
    }

    [Fact]
    public async Task A_lead_converts_only_once_and_converted_leads_cannot_change_status()
    {
        var (lead, _) = await QualifyAndConvert();
        var again = await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/convert", new ConvertLeadRequest(lead.Version));
        Assert.Equal(HttpStatusCode.BadRequest, again.StatusCode);   // no longer Qualified
        Assert.Equal(HttpStatusCode.BadRequest,
            (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.New, null))).StatusCode);
    }

    [Fact]
    public async Task Converting_requires_qualified_status()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.BadRequest,
            (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/convert", new ConvertLeadRequest(lead.Version))).StatusCode);
    }

    [Fact]
    public async Task A_converted_contact_blocks_creating_a_new_lead_with_the_same_phone()
    {
        var (lead, _) = await QualifyAndConvert();
        var res = await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(phone: lead.Phone));
        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
    }

    [Fact]
    public async Task Editing_a_converted_lead_updates_its_client()
    {
        var (lead, client) = await QualifyAndConvert();
        var res = await _w.Mgr.PutAsync($"/api/v1/leads/{lead.Id}", Upd(lead, "Renamed After Conversion"));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var detail = await _w.E1.GetJsonAsync<ClientDetailDto>($"/api/v1/clients/{client.Id}");
        Assert.Equal("Renamed After Conversion", detail.Client.Name);
    }

    // ── archive ───────────────────────────────────────────────────────────

    [Fact]
    public async Task Archive_needs_a_reason_and_a_manager_and_hides_the_lead_from_the_default_list()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/archive", new ArchiveRequest(lead.Version, "I want it gone"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PostAsync($"/api/v1/leads/{lead.Id}/archive", new ArchiveRequest(lead.Version, "no"))).StatusCode);

        var res = await _w.Mgr.PostAsync($"/api/v1/leads/{lead.Id}/archive", new ArchiveRequest(lead.Version, "Duplicate of another record"));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var archived = await CrmWorld.Read<LeadDto>(res);
        Assert.True(archived.IsArchived);

        var normal = await _w.Mgr.GetJsonAsync<PagedResult<LeadDto>>("/api/v1/leads?pageSize=100");
        Assert.DoesNotContain(normal.Items, l => l.Id == lead.Id);
        var withArchived = await _w.Mgr.GetJsonAsync<PagedResult<LeadDto>>("/api/v1/leads?archived=true&pageSize=100");
        Assert.Contains(withArchived.Items, l => l.Id == lead.Id);

        // frozen until restored
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PutAsync($"/api/v1/leads/{lead.Id}", Upd(archived, "Edit while archived"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Assign(_w.Tl, _w.E2Dto.Id, null, "Moving archived lead", null, archived)).StatusCode);

        var restored = await _w.Mgr.PostAsync($"/api/v1/leads/{lead.Id}/restore", new ArchiveRequest(archived.Version, "Archived by mistake"));
        Assert.Equal(HttpStatusCode.OK, restored.StatusCode);
        Assert.False((await CrmWorld.Read<LeadDto>(restored)).IsArchived);
    }

    [Fact]
    public async Task An_archived_lead_still_reserves_its_phone()
    {
        var lead = await _w.NewLead();
        await _w.Mgr.PostAsync($"/api/v1/leads/{lead.Id}/archive", new ArchiveRequest(lead.Version, "Archive for test"));
        Assert.Equal(HttpStatusCode.Conflict, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(phone: lead.Phone))).StatusCode);
    }

    // ── DND ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Dnd_flags_the_lead_and_only_a_manager_can_lift_it()
    {
        var lead = await _w.LeadOwnedByE1();
        var add = await _w.E1.PostAsync("/api/v1/dnd", new AddDndRequest(lead.Phone, "Client asked not to be called", lead.Id));
        Assert.Equal(HttpStatusCode.OK, add.StatusCode);
        var entry = await CrmWorld.Read<DndDto>(add);
        Assert.True((await _w.Fresh(_w.E1, lead.Id)).IsDnd);

        Assert.Equal(HttpStatusCode.Conflict, (await _w.E1.PostAsync("/api/v1/dnd", new AddDndRequest(lead.Phone, "Again please", lead.Id))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.DeleteAsync($"/api/v1/dnd/{entry.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await _w.Mgr.DeleteAsync($"/api/v1/dnd/{entry.Id}")).StatusCode);
        Assert.False((await _w.Fresh(_w.E1, lead.Id)).IsDnd);
    }

    [Fact]
    public async Task A_lead_created_for_a_dnd_number_is_flagged_from_the_start()
    {
        var phone = CrmWorld.NextPhone();
        Assert.Equal(HttpStatusCode.OK, (await _w.Mgr.PostAsync("/api/v1/dnd", new AddDndRequest(phone, "Registered on DND list", null))).StatusCode);
        Assert.True((await _w.NewLead(phone: phone)).IsDnd);
    }

    [Fact]
    public async Task Employee_cannot_mark_dnd_on_a_lead_they_cannot_edit()
    {
        var lead = await _w.LeadOwnedByE1();
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E2.PostAsync("/api/v1/dnd", new AddDndRequest(lead.Phone, "Not my lead", lead.Id))).StatusCode);
    }

    // ── reminders ─────────────────────────────────────────────────────────

    [Fact]
    public async Task Reminder_job_notifies_owner_team_leader_and_manager_exactly_once()
    {
        var lead = await _w.LeadOwnedByE1();
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: DateTimeOffset.UtcNow.AddHours(1)));

        var future = DateTimeOffset.UtcNow.AddHours(2);
        var first = await _w.F.WithDbAsync(db => new FollowUpReminderProcessor(db).RunOnceAsync(future));
        Assert.True(first >= 1);
        var second = await _w.F.WithDbAsync(db => new FollowUpReminderProcessor(db).RunOnceAsync(future));
        Assert.Equal(0, second);

        var users = await _w.F.WithDbAsync(db => db.Notifications.AsNoTracking()
            .Where(n => n.LeadId == lead.Id && n.Title.StartsWith("Follow-up due")).Select(n => n.UserId).ToListAsync());
        Assert.Contains(_w.E1Dto.Id, users);
        Assert.Contains(_w.TlDto.Id, users);
        Assert.Contains(_w.MgrDto.Id, users);
        Assert.Equal(users.Count, users.Distinct().Count());
    }

    [Fact]
    public async Task Reminder_job_ignores_follow_ups_that_are_not_due_yet()
    {
        var lead = await _w.LeadOwnedByE1();
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", Resp(lead, next: DateTimeOffset.UtcNow.AddDays(5)));
        await _w.F.WithDbAsync(db => new FollowUpReminderProcessor(db).RunOnceAsync(DateTimeOffset.UtcNow));
        var any = await _w.F.WithDbAsync(db => db.Notifications.AnyAsync(n => n.LeadId == lead.Id && n.Title.StartsWith("Follow-up due")));
        Assert.False(any);
    }

    // ── notifications ─────────────────────────────────────────────────────

    [Fact]
    public async Task Notifications_can_be_marked_read_only_by_their_owner()
    {
        var lead = await _w.LeadOwnedByE1();
        var mine = (await _w.E1.GetJsonAsync<List<NotificationDto>>("/api/v1/notifications")).First(n => n.LeadId == lead.Id);

        Assert.Equal(HttpStatusCode.NotFound, (await _w.E2.PostAsync($"/api/v1/notifications/{mine.Id}/read")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await _w.E1.PostAsync($"/api/v1/notifications/{mine.Id}/read")).StatusCode);
        Assert.True((await _w.E1.GetJsonAsync<List<NotificationDto>>("/api/v1/notifications")).First(n => n.Id == mine.Id).IsRead);
    }
}
