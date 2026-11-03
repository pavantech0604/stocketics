using System.Net;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Tests.Support;

namespace Stocketics.Tests;

public class ImportTests : IClassFixture<CrmWorld>
{
    private readonly CrmWorld _w;
    public ImportTests(CrmWorld w) => _w = w;

    private static ImportRow Row(string? phone = null, string name = "Imported Person", string? email = null, string state = "Gujarat", string? source = null)
        => new(name, phone ?? CrmWorld.NextPhone(), email, state, "Surat", source, "Spring");

    [Fact]
    public async Task Import_reports_every_row_and_creates_only_the_valid_new_ones()
    {
        var existing = await _w.NewLead();
        var dupeInFile = CrmWorld.NextPhone();
        var req = new ImportLeadsRequest("leads.xlsx", "Website", null, null, [
            Row(),                                  // row 2: created
            Row(dupeInFile),                        // row 3: created
            Row(dupeInFile),                        // row 4: duplicate of row 3 (same file)
            Row(existing.Phone),                    // row 5: duplicate of an existing lead
            Row("12345"),                           // row 6: invalid phone
            Row(state: "Atlantis"),                 // row 7: invalid state
            Row(name: "X"),                         // row 8: name too short
            Row(source: "Carrier pigeon"),          // row 9: invalid source
            Row(email: "bad-email"),                // row 10: invalid email
        ]);

        var batch = await _w.Mgr.PostJsonAsync<ImportBatchDto>("/api/v1/leads/import", req);
        Assert.Equal(9, batch.Total);
        Assert.Equal(2, batch.Created);
        Assert.Equal(2, batch.Duplicates);
        Assert.Equal(5, batch.Failed);

        var results = batch.Results!;
        Assert.Equal(new[] { 2, 3, 4, 5, 6, 7, 8, 9, 10 }, results.Select(r => r.Row));   // row 1 is the header
        Assert.Equal("Created", results[0].Status);
        Assert.NotNull(results[0].LeadId);
        Assert.Equal("Duplicate", results[2].Status);
        Assert.Equal("Duplicate", results[3].Status);
        Assert.All(results.Skip(4), r => Assert.Equal("Failed", r.Status));
        Assert.All(results.Skip(4), r => Assert.False(string.IsNullOrWhiteSpace(r.Message)));

        // the history is permanent and retrievable
        var again = await _w.Mgr.GetJsonAsync<ImportBatchDto>($"/api/v1/leads/imports/{batch.Id}");
        Assert.Equal(9, again.Results!.Count);
        Assert.Contains(await _w.Mgr.GetJsonAsync<List<ImportBatchDto>>("/api/v1/leads/imports"), b => b.Id == batch.Id && b.Results is null);
    }

    [Fact]
    public async Task Rows_without_their_own_source_use_the_batch_default()
    {
        var phone = CrmWorld.NextPhone();
        await _w.Mgr.PostJsonAsync<ImportBatchDto>("/api/v1/leads/import",
            new ImportLeadsRequest("one.csv", "Referral", null, null, [Row(phone)]));
        var lead = (await _w.Mgr.GetJsonAsync<PagedResult<LeadDto>>($"/api/v1/leads?q={phone}")).Items.Single();
        Assert.Equal("Referral", lead.Source);
        Assert.Equal(LeadStatuses.New, lead.Status);
    }

    [Fact]
    public async Task Import_can_assign_everything_to_a_team_leader()
    {
        var phone = CrmWorld.NextPhone();
        var batch = await _w.Mgr.PostJsonAsync<ImportBatchDto>("/api/v1/leads/import",
            new ImportLeadsRequest("assigned.csv", "Website", null, _w.TlDto.Id, [Row(phone)]));
        Assert.Equal(_w.TlDto.Id, batch.AssignedToTeamLeaderId);

        var lead = (await _w.Tl.GetJsonAsync<PagedResult<LeadDto>>($"/api/v1/leads?q={phone}")).Items.Single();
        Assert.Equal(_w.TlDto.Id, lead.TeamLeaderId);
        Assert.Null(lead.OwnerId);
        var detail = await _w.Tl.GetJsonAsync<LeadDetailDto>($"/api/v1/leads/{lead.Id}");
        Assert.Equal("Import", detail.Assignments.Single().Source);
        Assert.Contains(await _w.Tl.GetJsonAsync<List<NotificationDto>>("/api/v1/notifications"), n => n.Title.Contains("imported and assigned"));
    }

    [Fact]
    public async Task Import_to_another_managers_team_leader_is_refused_and_creates_nothing()
    {
        var phone = CrmWorld.NextPhone();
        var res = await _w.Mgr.PostAsync("/api/v1/leads/import",
            new ImportLeadsRequest("wrong.csv", "Website", null, _w.Tl2Dto.Id, [Row(phone)]));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.Empty((await _w.Mgr.GetJsonAsync<PagedResult<LeadDto>>($"/api/v1/leads?q={phone}")).Items);
    }

    [Fact]
    public async Task Only_managers_and_admins_can_import_and_the_size_is_capped()
    {
        var req = new ImportLeadsRequest("x.csv", "Website", null, null, [Row()]);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.PostAsync("/api/v1/leads/import", req)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Tl.PostAsync("/api/v1/leads/import", req)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.GetAsync("/api/v1/leads/imports")).StatusCode);

        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PostAsync("/api/v1/leads/import",
            new ImportLeadsRequest("empty.csv", "Website", null, null, []))).StatusCode);
        var tooMany = Enumerable.Range(0, 1001).Select(_ => Row()).ToList();
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Mgr.PostAsync("/api/v1/leads/import",
            new ImportLeadsRequest("big.csv", "Website", null, null, tooMany))).StatusCode);
    }

    [Fact]
    public async Task A_thousand_row_import_completes()
    {
        var rows = Enumerable.Range(0, 1000).Select(_ => Row()).ToList();
        var batch = await _w.Mgr.PostJsonAsync<ImportBatchDto>("/api/v1/leads/import", new ImportLeadsRequest("1000.csv", "Website", null, null, rows));
        Assert.Equal(1000, batch.Created);
        Assert.Equal(0, batch.Failed + batch.Duplicates);
    }
}

public class ClientAndSettingsTests : IClassFixture<CrmWorld>
{
    private readonly CrmWorld _w;
    public ClientAndSettingsTests(CrmWorld w) => _w = w;

    private async Task<ClientDto> NewClient()
    {
        var lead = await _w.NewLead();
        await _w.Assign(_w.Mgr, _w.E1Dto.Id, Roles.Employee, "Direct allocation for client test", null, lead);
        lead = await _w.Fresh(_w.E1, lead.Id);
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/responses", new RecordResponseRequest(lead.Version, "Interested in premium plan", "Interested", null, null, null));
        lead = await _w.Fresh(_w.E1, lead.Id);
        await _w.E1.PostAsync($"/api/v1/leads/{lead.Id}/status", new ChangeStatusRequest(lead.Version, LeadStatuses.Qualified, null));
        lead = await _w.Fresh(_w.E1, lead.Id);
        return await _w.E1.PostJsonAsync<ClientDto>($"/api/v1/leads/{lead.Id}/convert", new ConvertLeadRequest(lead.Version));
    }

    // ── clients ───────────────────────────────────────────────────────────

    [Fact]
    public async Task Owner_sees_their_clients_and_other_employees_do_not()
    {
        var client = await NewClient();
        Assert.Contains((await _w.E1.GetJsonAsync<PagedResult<ClientDto>>("/api/v1/clients?pageSize=100")).Items, c => c.Id == client.Id);
        Assert.DoesNotContain((await _w.E2.GetJsonAsync<PagedResult<ClientDto>>("/api/v1/clients?pageSize=100")).Items, c => c.Id == client.Id);
        Assert.DoesNotContain((await _w.E3.GetJsonAsync<PagedResult<ClientDto>>("/api/v1/clients?pageSize=100")).Items, c => c.Id == client.Id);
        Assert.Contains((await _w.Tl.GetJsonAsync<PagedResult<ClientDto>>("/api/v1/clients?pageSize=100")).Items, c => c.Id == client.Id);
        Assert.DoesNotContain((await _w.Tl2.GetJsonAsync<PagedResult<ClientDto>>("/api/v1/clients?pageSize=100")).Items, c => c.Id == client.Id);

        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E2.GetAsync($"/api/v1/clients/{client.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Tl2.GetAsync($"/api/v1/clients/{client.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _w.E1.GetAsync($"/api/v1/clients/{Guid.NewGuid()}")).StatusCode);
    }

    [Fact]
    public async Task Client_search_matches_name_phone_and_code()
    {
        var client = await NewClient();
        foreach (var q in new[] { client.Phone, client.ClientCode, "asha" })
            Assert.Contains((await _w.E1.GetJsonAsync<PagedResult<ClientDto>>($"/api/v1/clients?q={q}")).Items, c => c.Id == client.Id);
    }

    [Fact]
    public async Task Notes_subscriptions_and_trials_attach_to_the_client()
    {
        var client = await NewClient();
        var note = await _w.E1.PostJsonAsync<ClientNoteDto>($"/api/v1/clients/{client.Id}/notes", new AddClientNoteRequest("Interested", "Wants the options plan"));
        Assert.Equal(_w.E1Dto.Name, note.AuthorName);
        Assert.Equal(Roles.Employee, note.AuthorRole);

        var sub = await _w.E1.PostJsonAsync<ClientSubscriptionDto>($"/api/v1/clients/{client.Id}/subscriptions",
            new AddSubscriptionRequest("Equity Premier", "Advisory", new DateOnly(2026, 11, 1), new DateOnly(2027, 10, 31), null, "INV-1001", 24999.50m, _w.E2Dto.Id));
        Assert.Equal("Active", sub.Status);
        Assert.Equal(_w.E2Dto.Name, sub.AdvisorName);
        Assert.Equal(24999.50m, sub.PaidAmount);

        await _w.E1.PostJsonAsync<ClientTrialDto>($"/api/v1/clients/{client.Id}/trials",
            new AddTrialRequest("Options Strategy", new DateOnly(2026, 11, 1), new DateOnly(2026, 11, 3), null));

        var detail = await _w.E1.GetJsonAsync<ClientDetailDto>($"/api/v1/clients/{client.Id}");
        Assert.Single(detail.Notes);
        Assert.Single(detail.Subscriptions);
        Assert.Single(detail.Trials);
    }

    [Fact]
    public async Task Subscription_and_trial_dates_must_be_ordered_and_values_valid()
    {
        var client = await NewClient();
        var d1 = new DateOnly(2026, 11, 10);
        var d0 = new DateOnly(2026, 11, 1);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E1.PostAsync($"/api/v1/clients/{client.Id}/subscriptions",
            new AddSubscriptionRequest("Equity Premier", null, d1, d0, null, null, 100, null))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E1.PostAsync($"/api/v1/clients/{client.Id}/subscriptions",
            new AddSubscriptionRequest("Equity Premier", null, d0, d1, "Bogus", null, 100, null))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E1.PostAsync($"/api/v1/clients/{client.Id}/subscriptions",
            new AddSubscriptionRequest("Equity Premier", null, d0, d1, null, null, -5, null))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E1.PostAsync($"/api/v1/clients/{client.Id}/subscriptions",
            new AddSubscriptionRequest("Equity Premier", null, d0, d1, null, null, 100, Guid.NewGuid()))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E1.PostAsync($"/api/v1/clients/{client.Id}/trials",
            new AddTrialRequest("Options", d1, d0, null))).StatusCode);
    }

    [Fact]
    public async Task Other_employees_cannot_write_to_a_client_they_do_not_own()
    {
        var client = await NewClient();
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E2.PostAsync($"/api/v1/clients/{client.Id}/notes", new AddClientNoteRequest(null, "Not mine to note"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E2.PostAsync($"/api/v1/clients/{client.Id}/status", new SetClientStatusRequest(client.Version, "Hold"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E3.PostAsync($"/api/v1/clients/{client.Id}/trials", new AddTrialRequest("X Plan", new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 2), null))).StatusCode);
    }

    [Fact]
    public async Task Client_status_changes_validate_value_and_version()
    {
        var client = await NewClient();
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.E1.PostAsync($"/api/v1/clients/{client.Id}/status", new SetClientStatusRequest(client.Version, "Banana"))).StatusCode);

        var held = await _w.E1.PostJsonAsync<ClientDto>($"/api/v1/clients/{client.Id}/status", new SetClientStatusRequest(client.Version, "Hold"));
        Assert.Equal("Hold", held.Status);
        Assert.Equal(HttpStatusCode.Conflict, (await _w.E1.PostAsync($"/api/v1/clients/{client.Id}/status", new SetClientStatusRequest(client.Version, "Expired"))).StatusCode);
    }

    [Fact]
    public async Task Client_dnd_flag_follows_the_phone()
    {
        var client = await NewClient();
        await _w.E1.PostAsync("/api/v1/dnd", new AddDndRequest(client.Phone, "Asked not to be contacted", client.LeadId));
        Assert.True((await _w.E1.GetJsonAsync<ClientDetailDto>($"/api/v1/clients/{client.Id}")).Client.IsDnd);
    }

    // ── CRM settings ──────────────────────────────────────────────────────

    [Fact]
    public async Task Settings_expose_the_36_states_and_default_sources_to_everyone()
    {
        var s = await _w.E1.GetJsonAsync<CrmSettingsDto>("/api/v1/settings/crm");
        Assert.Equal(36, s.States.Count);
        Assert.Contains("Karnataka", s.States);
        Assert.Contains("Website", s.Sources);
        Assert.Equal(100, s.MaxRequest);
    }

    [Fact]
    public async Task Sources_can_be_added_but_never_removed_and_the_limit_is_bounded()
    {
        var current = await _w.Hr.GetJsonAsync<CrmSettingsDto>("/api/v1/settings/crm");   // HR holds admin.settings
        var withNew = current.Sources.Append("Partner Network").ToList();

        var ok = await _w.Hr.PutAsync("/api/v1/settings/crm", new UpdateCrmSettingsRequest(current.MaxRequest, current.AadhaarBackRequired, withNew));
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await _w.Mgr.PostAsync("/api/v1/leads", CrmWorld.LeadReq(source: "Partner Network"))).StatusCode);

        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Hr.PutAsync("/api/v1/settings/crm",
            new UpdateCrmSettingsRequest(100, false, withNew.Where(x => x != "Website").ToList()))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Hr.PutAsync("/api/v1/settings/crm",
            new UpdateCrmSettingsRequest(100, false, withNew.Append("Website").ToList()))).StatusCode);   // duplicate name
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Hr.PutAsync("/api/v1/settings/crm", new UpdateCrmSettingsRequest(0, false, withNew))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _w.Hr.PutAsync("/api/v1/settings/crm", new UpdateCrmSettingsRequest(1001, false, withNew))).StatusCode);
    }

    [Fact]
    public async Task Only_holders_of_admin_settings_can_change_crm_settings()
    {
        var s = await _w.E1.GetJsonAsync<CrmSettingsDto>("/api/v1/settings/crm");
        var body = new UpdateCrmSettingsRequest(s.MaxRequest, s.AadhaarBackRequired, s.Sources.ToList());
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.E1.PutAsync("/api/v1/settings/crm", body)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _w.Mgr.PutAsync("/api/v1/settings/crm", body)).StatusCode);
    }
}
