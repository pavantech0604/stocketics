using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

/// <summary>Row → DTO mapping shared by the lead, request and client services.</summary>
internal static class CrmMapper
{
    public static string? NameOf(IReadOnlyDictionary<Guid, Person> people, Guid? id)
        => id is { } i && people.TryGetValue(i, out var p) ? p.Name : null;

    public static LeadDto Lead(Lead l, IReadOnlyDictionary<Guid, Person> p) => new(
        l.Id, l.Name, l.Phone, l.Email ?? string.Empty, l.State, l.City, l.Source, l.Campaign, l.Description,
        l.Priority, l.Status, l.OwnerId, NameOf(p, l.OwnerId), l.TeamLeaderId, NameOf(p, l.TeamLeaderId),
        l.ManagerId, NameOf(p, l.ManagerId), l.IsArchived, l.IsDnd, l.LastResponse, l.NextFollowUpAt,
        l.CreatedAt, l.UpdatedAt, l.Version);

    public static ClientDto Client(Client c, IReadOnlyDictionary<Guid, Person> p, bool isDnd) => new(
        c.Id, c.ClientCode, c.LeadId, c.Name, c.Phone, c.Email ?? string.Empty, c.State, c.City, c.Source,
        c.Campaign, c.Status, isDnd, c.OwnerId, NameOf(p, c.OwnerId), c.TeamLeaderId, c.ManagerId, c.ConvertedAt,
        c.Version);

    public static IEnumerable<Guid?> PeopleIds(Lead l) => [l.OwnerId, l.TeamLeaderId, l.ManagerId];
}

public sealed class LeadService(
    AppDbContext db, CrmAccess access, ICrmSettingsService settings, IAuditService audit) : ILeadService
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    // ── reads ───────────────────────────────────────────────────────────────

    public async Task<PagedResult<LeadDto>> ListAsync(LeadQuery q, CancellationToken ct = default)
    {
        var scope = await access.RequireViewScopeAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);

        var query = access.Scope(db.Leads.AsNoTracking(), scope).Where(l => l.IsArchived == (q.Archived ?? false));
        if (!string.IsNullOrWhiteSpace(q.Q))
        {
            var term = q.Q.Trim().ToLowerInvariant();
            query = query.Where(l => l.Name.ToLower().Contains(term) || l.Phone.Contains(term)
                                     || (l.Email != null && l.Email.Contains(term)));
        }
        if (!string.IsNullOrWhiteSpace(q.Status)) query = query.Where(l => l.Status == q.Status);
        if (!string.IsNullOrWhiteSpace(q.State)) query = query.Where(l => l.State == q.State);
        if (!string.IsNullOrWhiteSpace(q.Source)) query = query.Where(l => l.Source == q.Source);
        if (!string.IsNullOrWhiteSpace(q.Priority)) query = query.Where(l => l.Priority == q.Priority);
        if (q.OwnerId is { } owner) query = query.Where(l => l.OwnerId == owner);
        if (q.TeamLeaderId is { } tl) query = query.Where(l => l.TeamLeaderId == tl);
        if (q.Unassigned == true) query = query.Where(l => l.OwnerId == null);
        if (q.Unassigned == false) query = query.Where(l => l.OwnerId != null);
        if (q.DueFrom is { } from) query = query.Where(l => l.NextFollowUpAt != null && l.NextFollowUpAt >= from);
        if (q.DueTo is { } to) query = query.Where(l => l.NextFollowUpAt != null && l.NextFollowUpAt <= to);

        var total = await query.CountAsync(ct);
        var rows = await query.OrderByDescending(l => l.CreatedAt).ThenBy(l => l.Id)
            .Skip((page - 1) * size).Take(size).ToListAsync(ct);
        var people = await access.PeopleAsync(rows.SelectMany(CrmMapper.PeopleIds), ct);
        return new PagedResult<LeadDto>(rows.Select(l => CrmMapper.Lead(l, people)).ToList(), total, page, size);
    }

    public async Task<LeadDetailDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var lead = await LoadAsync(id, track: false, ct);
        var activity = await db.LeadActivities.AsNoTracking().Where(a => a.LeadId == id)
            .OrderByDescending(a => a.CreatedAt).ToListAsync(ct);
        var followUps = await db.LeadFollowUps.AsNoTracking().Where(f => f.LeadId == id)
            .OrderBy(f => f.DueAt).ToListAsync(ct);
        var assignments = await db.LeadAssignments.AsNoTracking().Where(a => a.LeadId == id)
            .OrderByDescending(a => a.CreatedAt).ToListAsync(ct);
        var clientId = await db.Clients.AsNoTracking().Where(c => c.LeadId == id).Select(c => (Guid?)c.Id).FirstOrDefaultAsync(ct);

        var people = await access.PeopleAsync(CrmMapper.PeopleIds(lead)
            .Concat(assignments.SelectMany(a => new Guid?[] { a.PreviousOwnerId, a.PreviousTeamLeaderId, a.NewOwnerId, a.NewTeamLeaderId })), ct);

        return new LeadDetailDto(
            CrmMapper.Lead(lead, people),
            activity.Select(a => new LeadActivityDto(a.Id, a.Type, a.Note, a.Outcome, a.ActorName, a.ActorRole,
                a.CreatedAt, a.StatusAtTime, a.NextDueAt, a.OriginalActivityId, a.FollowUpId, a.Detail)).ToList(),
            followUps.Select(f => new FollowUpDto(f.Id, f.DueAt, f.Status, f.Response, f.CompletedAt)).ToList(),
            assignments.Select(a => new LeadAssignmentDto(a.Id, a.Type, a.Source,
                CrmMapper.NameOf(people, a.PreviousOwnerId), CrmMapper.NameOf(people, a.PreviousTeamLeaderId),
                CrmMapper.NameOf(people, a.NewOwnerId), CrmMapper.NameOf(people, a.NewTeamLeaderId),
                a.ActorName, a.Reason, a.RequestId, a.CreatedAt)).ToList(),
            clientId);
    }

    // ── create / edit ───────────────────────────────────────────────────────

    public async Task<LeadDto> CreateAsync(CreateLeadRequest r, CancellationToken ct = default)
    {
        if (!await access.HasAsync(Permissions.LeadsEditAll, ct))
            throw new ForbiddenException("Only Managers and Admins can create or import leads.");

        var cfg = await settings.GetAsync(ct);
        var c = ValidateContact(r.Name, r.Phone, r.Email, r.State, r.Source, cfg);
        var priority = r.Priority ?? "Normal";
        if (!LeadPriorities.All.Contains(priority)) throw new ValidationFailedException("priority", "Select a valid priority.");
        if (await IsTakenAsync(c.Phone, c.Email, null, ct)) throw Duplicate();

        Guid? managerId = null;
        if (access.MyRole == Roles.Manager) managerId = access.MeId;
        else if (r.ManagerId is { } m) managerId = (await access.RequirePersonAsync(m, Roles.Manager, "managerId", ct)).Id;

        var lead = new Lead
        {
            Name = c.Name, Phone = c.Phone, Email = c.Email, State = r.State, City = r.City?.Trim() ?? string.Empty,
            Source = r.Source, Campaign = r.Campaign?.Trim() ?? string.Empty, Description = r.Description?.Trim() ?? string.Empty,
            Priority = priority, Status = LeadStatuses.New, ManagerId = managerId,
            IsDnd = await db.DndNumbers.AnyAsync(d => d.Phone == c.Phone, ct),
        };
        db.Leads.Add(lead);
        await access.AddActivityAsync(lead, ActivityTypes.Created, "Lead created", ct: ct);
        audit.Record("lead.created", "lead", lead.Id.ToString(), new { lead.Source, lead.State });
        await access.SaveAsync(ct);
        return await ToDtoAsync(lead, ct);
    }

    public async Task<LeadDto> UpdateAsync(Guid id, UpdateLeadRequest r, CancellationToken ct = default)
    {
        var lead = await LoadForChangeAsync(id, r.Version, ct);
        var cfg = await settings.GetAsync(ct);
        var c = ValidateContact(r.Name, r.Phone, r.Email, r.State, r.Source, cfg);
        if (!LeadPriorities.All.Contains(r.Priority)) throw new ValidationFailedException("priority", "Select a valid priority.");
        // Another lead or another client (not this lead's own client) already using the contact.
        if (await IsTakenAsync(c.Phone, c.Email, lead.Id, ct))
            throw new ConflictException("Another lead or client already uses this phone or email.");

        var before = new { lead.Name, lead.Phone, lead.Email, lead.State, lead.City, lead.Source, lead.Campaign, lead.Priority, lead.Description };
        lead.Name = c.Name; lead.Phone = c.Phone; lead.Email = c.Email; lead.State = r.State;
        lead.City = r.City?.Trim() ?? string.Empty; lead.Source = r.Source; lead.Campaign = r.Campaign?.Trim() ?? string.Empty;
        lead.Priority = r.Priority; lead.Description = r.Description?.Trim() ?? string.Empty;
        lead.IsDnd = await db.DndNumbers.AnyAsync(d => d.Phone == c.Phone, ct);

        // The client converted from this lead mirrors its contact details.
        var client = await db.Clients.FirstOrDefaultAsync(x => x.LeadId == lead.Id, ct);
        if (client is not null)
        {
            client.Name = lead.Name; client.Phone = lead.Phone; client.Email = lead.Email; client.State = lead.State;
            client.City = lead.City; client.Source = lead.Source; client.Campaign = lead.Campaign;
        }

        var after = new { lead.Name, lead.Phone, lead.Email, lead.State, lead.City, lead.Source, lead.Campaign, lead.Priority, lead.Description };
        await access.AddActivityAsync(lead, ActivityTypes.Edit, "Contact details updated",
            detail: JsonSerializer.Serialize(new { before, after }, Json), ct: ct);
        audit.Record("lead.updated", "lead", lead.Id.ToString());
        await access.SaveAsync(ct);
        return await ToDtoAsync(lead, ct);
    }

    // ── assignment ──────────────────────────────────────────────────────────

    public async Task<AssignResultDto> AssignAsync(AssignLeadsRequest r, CancellationToken ct = default)
    {
        var canAll = await access.HasAsync(Permissions.LeadsAssignAll, ct);
        var canTeam = await access.HasAsync(Permissions.LeadsAssignTeam, ct);
        if (!canAll && !canTeam) throw new ForbiddenException("You cannot assign leads.");

        if (r.Items.Select(i => i.LeadId).Distinct().Count() != r.Items.Count)
            throw new ValidationFailedException("items", "Duplicate lead selection.");

        var targetRole = !canAll ? Roles.Employee : r.TargetRole ?? Roles.TeamLeader;
        if (targetRole is not (Roles.TeamLeader or Roles.Employee))
            throw new ValidationFailedException("targetRole", "Invalid assignment target.");
        if (!canAll && r.TargetRole is not null && r.TargetRole != Roles.Employee)
            throw new ForbiddenException("You can only assign to employees in your team.");

        var (target, tl, mgr) = await access.ResolveChainAsync(r.TargetId, targetRole, ct);
        if (!canAll && target.ManagerId != access.MeId)
            throw new ValidationFailedException("targetId", "Employee must belong to your team.");
        if (canAll && access.MyRole == Roles.Manager && tl.ManagerId != access.MeId)
            throw new ValidationFailedException("targetId", "Team Leader must report to you.");
        var reason = r.Reason?.Trim() ?? string.Empty;
        if (canAll && targetRole == Roles.Employee && reason.Length < 5)
            throw new ValidationFailedException("reason", "Direct assignment override requires a reason.");

        LeadRequest? request = null;
        if (r.RequestId is { } rid)
        {
            request = await db.LeadRequests.Include(x => x.Allocations).Include(x => x.Events)
                          .FirstOrDefaultAsync(x => x.Id == rid, ct)
                      ?? throw new NotFoundException("Lead request not found.");
            if (targetRole != Roles.Employee || request.OwnerId != target.Id
                || request.Status is not (RequestStatuses.Approved or RequestStatuses.PartiallyApproved))
                throw new ValidationFailedException("requestId", "Request is not approved for this employee.");
            if (request.Allocations.Count + r.Items.Count > request.ApprovedCount)
                throw new ValidationFailedException("requestId", "Allocation exceeds the approved request count.");
        }

        var scope = await access.RequireViewScopeAsync(ct);
        var ids = r.Items.Select(i => i.LeadId).ToList();
        var leads = await db.Leads.Where(l => ids.Contains(l.Id)).ToDictionaryAsync(l => l.Id, ct);
        var actor = await access.MeAsync(ct);

        foreach (var item in r.Items)
        {
            if (!leads.TryGetValue(item.LeadId, out var lead)) throw new NotFoundException("Lead not found.");
            if (!access.InScope(lead, scope)) throw new ForbiddenException("This lead is outside your access scope.");
            CrmAccess.CheckVersion(lead, item.Version);
            if (lead.IsArchived || lead.Status == LeadStatuses.Converted)
                throw new ValidationFailedException("items", "Archived or converted leads cannot be reassigned.");
            if (lead.OwnerId == target.Id)
                throw new ValidationFailedException("items", "Lead is already assigned to this employee.");
            if (!canAll && lead.TeamLeaderId != access.MeId)
                throw new ValidationFailedException("items", "Lead is outside your team.");

            // Moving a lead that already has an owner or team leader is a reassignment, a stronger permission.
            if (lead.OwnerId is not null || lead.TeamLeaderId is not null)
            {
                var perm = canAll ? Permissions.LeadsReassignAll : Permissions.LeadsReassignTeam;
                if (!await access.HasAsync(perm, ct)) throw new ForbiddenException("You cannot reassign leads.");
            }
            if ((lead.OwnerId is not null || (lead.TeamLeaderId is not null && lead.TeamLeaderId != tl.Id)) && reason.Length < 5)
                throw new ValidationFailedException("reason", "Reassignment requires a reason.");
            if (request is not null && lead.State != request.State)
                throw new ValidationFailedException("items", "Lead must match the requested state and cannot be counted twice.");

            var previousOwner = lead.OwnerId; var previousTl = lead.TeamLeaderId;
            lead.ManagerId = mgr.Id;
            lead.TeamLeaderId = tl.Id;
            lead.OwnerId = targetRole == Roles.Employee ? target.Id : null;

            db.LeadAssignments.Add(new LeadAssignment
            {
                LeadId = lead.Id, PreviousOwnerId = previousOwner, PreviousTeamLeaderId = previousTl,
                NewOwnerId = lead.OwnerId, NewTeamLeaderId = lead.TeamLeaderId, ActorId = actor.Id, ActorName = actor.Name,
                Reason = reason, Type = previousTl is not null ? "Reassignment" : "Initial assignment",
                Source = request is not null ? "Lead request" : "Manual", RequestId = request?.Id,
            });
            await access.AddActivityAsync(lead, ActivityTypes.Assignment,
                $"Assigned to {target.Name}" + (reason.Length > 0 ? $": {reason}" : string.Empty), ct: ct);
            access.Notify(target.Id, $"Lead assigned: {lead.Name}", lead.Id);
            if (request is not null) request.Allocations.Add(new LeadRequestAllocation { RequestId = request.Id, LeadId = lead.Id });
        }

        if (request is not null)
        {
            request.AllocatedCount = request.Allocations.Count;
            if (request.AllocatedCount == request.ApprovedCount) request.Status = RequestStatuses.Fulfilled;
            request.Events.Add(new LeadRequestEvent
            {
                RequestId = request.Id, Action = request.Status == RequestStatuses.Fulfilled ? "Fulfilled" : "Allocated",
                ActorName = actor.Name, Note = $"{r.Items.Count} leads allocated",
            });
        }

        audit.Record("lead.assigned", "lead", null, new { count = r.Items.Count, target = target.Id, targetRole, requestId = r.RequestId });
        await access.SaveAsync(ct);
        return new AssignResultDto(r.Items.Count);
    }

    // ── conversation ────────────────────────────────────────────────────────

    public async Task<LeadDto> RecordResponseAsync(Guid id, RecordResponseRequest r, CancellationToken ct = default)
    {
        var lead = await LoadForChangeAsync(id, r.Version, ct);
        var note = r.Note.Trim();
        if (note.Length < 2) throw new ValidationFailedException("note", "Enter a response before saving.");

        if (r.CorrectsActivityId is { } orig
            && !await db.LeadActivities.AnyAsync(a => a.Id == orig && a.LeadId == lead.Id, ct))
            throw new ValidationFailedException("correctsActivityId", "Original entry belongs to a different lead.");

        var now = DateTimeOffset.UtcNow;
        var open = await db.LeadFollowUps.Where(f => f.LeadId == lead.Id && f.Status == "Open").ToListAsync(ct);

        if (r.FollowUpId is { } fid)
        {
            var f = open.FirstOrDefault(x => x.Id == fid)
                    ?? throw new ValidationFailedException("followUpId", "Follow-up is already completed or belongs to another lead.");
            f.Status = "Completed"; f.CompletedAt = now; f.CompletedById = access.MeId; f.Response = note;
            open.Remove(f);
        }

        DateTimeOffset? nextDue = null;
        if (r.NextDue is { } due)
        {
            if (lead.OwnerId is null)
                throw new ValidationFailedException("nextDue", "Assign an Employee before scheduling a follow-up.");
            if (due <= now)
                throw new ValidationFailedException("nextDue", "Follow-up date/time must be in the future.");
            nextDue = due;
            var f = new LeadFollowUp { LeadId = lead.Id, DueAt = due, CreatedById = access.MeId, Response = note };
            db.LeadFollowUps.Add(f);
            open.Add(f);
        }

        await access.AddActivityAsync(lead, r.CorrectsActivityId is null ? ActivityTypes.Call : ActivityTypes.Correction,
            note, r.Outcome?.Trim(), nextDue, r.CorrectsActivityId, r.FollowUpId, ct: ct);
        lead.LastResponse = note;
        lead.NextFollowUpAt = open.Count == 0 ? null : open.Min(f => f.DueAt);
        await access.SaveAsync(ct);
        return await ToDtoAsync(lead, ct);
    }

    public async Task<LeadDto> ChangeStatusAsync(Guid id, ChangeStatusRequest r, CancellationToken ct = default)
    {
        var lead = await LoadForChangeAsync(id, r.Version, ct);
        if (lead.Status == LeadStatuses.Converted || !LeadStatuses.Settable.Contains(r.Status))
            throw new ValidationFailedException("status", "Invalid status transition.");
        if (r.Status == LeadStatuses.Qualified)
        {
            var called = await db.LeadActivities.AnyAsync(a => a.LeadId == lead.Id && a.Type == ActivityTypes.Call, ct);
            if (lead.OwnerId is null || !called)
                throw new ValidationFailedException("status", "Qualification requires an Employee and a recorded response.");
        }
        var reason = r.Reason?.Trim() ?? string.Empty;
        if (r.Status == LeadStatuses.Lost && reason.Length < 2)
            throw new ValidationFailedException("reason", "A lost reason is required.");

        await access.AddActivityAsync(lead, ActivityTypes.Status,
            $"{lead.Status} → {r.Status}" + (reason.Length > 0 ? $": {reason}" : string.Empty), ct: ct);
        lead.Status = r.Status;
        await access.SaveAsync(ct);
        return await ToDtoAsync(lead, ct);
    }

    public async Task<LeadDto> SetArchivedAsync(Guid id, bool archived, ArchiveRequest r, CancellationToken ct = default)
    {
        if (!await access.HasAsync(Permissions.LeadsEditAll, ct))
            throw new ForbiddenException("Only Managers and Admins can archive or restore.");
        var lead = await LoadAsync(id, track: true, ct);
        await access.RequireEditAsync(lead, ct);
        CrmAccess.CheckVersion(lead, r.Version);
        if (lead.IsArchived == archived)
            throw new ValidationFailedException("id", archived ? "Lead is already archived." : "Lead is not archived.");

        lead.IsArchived = archived;
        await access.AddActivityAsync(lead, archived ? ActivityTypes.Archive : ActivityTypes.Restore, r.Reason.Trim(), ct: ct);
        audit.Record(archived ? "lead.archived" : "lead.restored", "lead", lead.Id.ToString());
        await access.SaveAsync(ct);
        return await ToDtoAsync(lead, ct);
    }

    public async Task<ClientDto> ConvertAsync(Guid id, ConvertLeadRequest r, CancellationToken ct = default)
    {
        var lead = await LoadForChangeAsync(id, r.Version, ct);
        if (lead.Status != LeadStatuses.Qualified || lead.OwnerId is null)
            throw new ValidationFailedException("status", "Only qualified leads with an Employee owner can convert.");
        if (await db.Clients.AnyAsync(c => c.LeadId == lead.Id || c.Phone == lead.Phone || (lead.Email != null && c.Email == lead.Email), ct))
            throw new ConflictException("This lead or contact already has a client record.");

        var client = new Client
        {
            ClientCode = "CL-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
            LeadId = lead.Id, Name = lead.Name, Phone = lead.Phone, Email = lead.Email, State = lead.State,
            City = lead.City, Source = lead.Source, Campaign = lead.Campaign, Status = ClientStatuses.Active,
            OwnerId = lead.OwnerId, TeamLeaderId = lead.TeamLeaderId, ManagerId = lead.ManagerId,
            ConvertedById = access.MeId, ConvertedAt = DateTimeOffset.UtcNow,
        };
        db.Clients.Add(client);
        lead.Status = LeadStatuses.Converted;
        await access.AddActivityAsync(lead, ActivityTypes.Conversion,
            "Client created; activity and follow-ups remain linked to this lead.", ct: ct);
        access.Notify(lead.OwnerId, $"Converted to client: {lead.Name}", lead.Id);
        audit.Record("lead.converted", "lead", lead.Id.ToString(), new { clientCode = client.ClientCode });
        await access.SaveAsync(ct);

        var people = await access.PeopleAsync([client.OwnerId, client.TeamLeaderId, client.ManagerId], ct);
        return CrmMapper.Client(client, people, lead.IsDnd);
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private async Task<Lead> LoadAsync(Guid id, bool track, CancellationToken ct)
    {
        var scope = await access.RequireViewScopeAsync(ct);
        var query = track ? db.Leads : db.Leads.AsNoTracking();
        var lead = await query.FirstOrDefaultAsync(l => l.Id == id, ct) ?? throw new NotFoundException("Lead not found.");
        if (!access.InScope(lead, scope)) throw new ForbiddenException("This lead is outside your access scope.");
        return lead;
    }

    /// <summary>Loads for modification: in scope, editable by the caller, version matches, not archived.</summary>
    private async Task<Lead> LoadForChangeAsync(Guid id, int? version, CancellationToken ct)
    {
        var lead = await LoadAsync(id, track: true, ct);
        await access.RequireEditAsync(lead, ct);
        CrmAccess.CheckVersion(lead, version);
        if (lead.IsArchived) throw new ValidationFailedException("id", "Restore this archived lead before making changes.");
        return lead;
    }

    private async Task<LeadDto> ToDtoAsync(Lead lead, CancellationToken ct)
        => CrmMapper.Lead(lead, await access.PeopleAsync(CrmMapper.PeopleIds(lead), ct));

    /// <summary>True when a lead (other than <paramref name="exceptLeadId"/>) or a client not derived from it uses the contact.</summary>
    private async Task<bool> IsTakenAsync(string phone, string? email, Guid? exceptLeadId, CancellationToken ct)
    {
        var except = exceptLeadId ?? Guid.Empty;
        var lead = await db.Leads.AnyAsync(l => l.Id != except && (l.Phone == phone || (email != null && l.Email == email)), ct);
        return lead || await db.Clients.AnyAsync(c => c.LeadId != except && (c.Phone == phone || (email != null && c.Email == email)), ct);
    }

    internal static ConflictException Duplicate() => new("Duplicate phone or email; existing records were preserved.");

    internal sealed record Contact(string Name, string Phone, string? Email);

    /// <summary>The crm.js validation shared by create, edit and import.</summary>
    internal static Contact ValidateContact(string? name, string? phone, string? email, string? state, string? source, CrmSettingsDto cfg)
    {
        var n = (name ?? string.Empty).Trim();
        if (n.Length < 2) throw new ValidationFailedException("name", "Lead name is required.");
        var p = Normalizer.TryNormalizePhone(phone)
                ?? throw new ValidationFailedException("phone", "Enter a valid 10-digit Indian mobile number.");
        var e = Normalizer.TryNormalizeEmail(email, required: false)
                ?? throw new ValidationFailedException("email", "Enter a valid email address.");
        if (state is null || !cfg.States.Contains(state)) throw new ValidationFailedException("state", "Select an active state.");
        if (source is null || !cfg.Sources.Contains(source)) throw new ValidationFailedException("source", "Select an active source.");
        return new Contact(n, p, e.Length == 0 ? null : e);
    }
}
