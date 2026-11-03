using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

/// <summary>
/// An employee asks their team leader for N more leads in a state; it is reviewed (team leader → manager),
/// approved in full or part, then allocated through the normal assignment endpoint (<c>requestId</c>).
/// </summary>
public sealed class LeadRequestService(
    AppDbContext db, CrmAccess access, ICrmSettingsService settings, IAuditService audit) : ILeadRequestService
{
    public async Task<IReadOnlyList<LeadRequestDto>> ListAsync(CancellationToken ct = default)
    {
        var me = access.MeId;
        var query = db.LeadRequests.AsNoTracking().Include(r => r.Events).AsQueryable();
        query = access.MyRole switch
        {
            Roles.Admin => query,
            Roles.Manager => query.Where(r => r.ManagerId == me),
            Roles.TeamLeader => query.Where(r => r.TeamLeaderId == me),
            Roles.Employee => query.Where(r => r.OwnerId == me),
            _ => throw new ForbiddenException(),
        };
        // Drafts are private to the employee who is still writing them.
        query = query.Where(r => r.Status != RequestStatuses.Draft || r.OwnerId == me);
        var rows = await query.OrderByDescending(r => r.CreatedAt).Take(500).ToListAsync(ct);
        var people = await access.PeopleAsync(rows.SelectMany(r => new Guid?[] { r.OwnerId, r.TeamLeaderId }), ct);
        return rows.Select(r => Map(r, people)).ToList();
    }

    public async Task<LeadRequestDto> CreateAsync(CreateLeadRequestRequest r, CancellationToken ct = default)
    {
        if (access.MyRole != Roles.Employee) throw new ForbiddenException("Only Employees can request leads.");
        var me = await access.MeAsync(ct);
        if (me.ManagerId is not { } tlId) throw new ValidationFailedException("id", "Select an existing team leader.");
        var tl = await access.RequirePersonAsync(tlId, Roles.TeamLeader, "id", ct);

        var cfg = await settings.GetAsync(ct);
        if (!cfg.States.Contains(r.State)) throw new ValidationFailedException("state", "Select an active state.");
        var count = r.Count!.Value;
        if (count < 1 || count > cfg.MaxRequest)
            throw new ValidationFailedException("count", "Requested quantity exceeds the configured limit or is invalid.");
        if (r.RequiredBy is { } by && by <= DateTimeOffset.UtcNow)
            throw new ValidationFailedException("requiredBy", "Follow-up date/time must be in the future.");

        var active = await db.LeadRequests.AnyAsync(x => x.OwnerId == me.Id && x.State == r.State
                                                          && !RequestStatuses.Closed.Contains(x.Status), ct);
        if (active) throw new ConflictException("An active request already exists for this state.");

        var status = r.Draft ? RequestStatuses.Draft : RequestStatuses.Submitted;
        var req = new LeadRequest
        {
            OwnerId = me.Id, TeamLeaderId = tl.Id, ManagerId = tl.ManagerId, State = r.State, Count = count,
            Remarks = r.Remarks?.Trim() ?? string.Empty, RequiredBy = r.RequiredBy, Status = status,
        };
        req.Events.Add(new LeadRequestEvent { RequestId = req.Id, Action = status, ActorName = me.Name });
        db.LeadRequests.Add(req);
        if (!r.Draft) access.Notify(tl.Id, $"New lead request from {me.Name}");
        audit.Record("lead.request.created", "lead_request", req.Id.ToString(), new { r.State, count });
        await access.SaveAsync(ct);
        return Map(req, await access.PeopleAsync([req.OwnerId, req.TeamLeaderId], ct));
    }

    public async Task<LeadRequestDto> ReviewAsync(Guid id, ReviewLeadRequestRequest r, CancellationToken ct = default)
    {
        var req = await db.LeadRequests.Include(x => x.Events).Include(x => x.Allocations)
                      .FirstOrDefaultAsync(x => x.Id == id, ct)
                  ?? throw new NotFoundException("Lead request not found.");
        var me = await access.MeAsync(ct);

        // Drafts are invisible to everyone but their author (the list hides them too), so say "not found"
        // rather than confirming a draft exists.
        if (req.Status == RequestStatuses.Draft && req.OwnerId != me.Id)
            throw new NotFoundException("Lead request not found.");

        var inScope = access.MyRole switch
        {
            Roles.Admin => true,
            Roles.Manager => req.ManagerId == me.Id,
            Roles.TeamLeader => req.TeamLeaderId == me.Id,
            Roles.Employee => req.OwnerId == me.Id,
            _ => false,
        };
        if (!inScope) throw new ForbiddenException("Request is outside your scope.");
        CrmAccess.CheckVersion(req, r.Version);
        if (RequestStatuses.Closed.Contains(req.Status)) throw new ValidationFailedException("status", "This request is closed.");

        var employeeAction = r.Status is RequestStatuses.Submitted or RequestStatuses.Cancelled;
        if (access.MyRole == Roles.Employee)
        {
            if (!employeeAction || req.OwnerId != me.Id)
                throw new ForbiddenException("Employees cannot approve requests.");
        }
        else if (!await access.HasAsync(Permissions.LeadsAssignTeam, ct) && !await access.HasAsync(Permissions.LeadsAssignAll, ct))
            throw new ForbiddenException();

        if (r.Status == RequestStatuses.Submitted && req.Status != RequestStatuses.Draft)
            throw new ValidationFailedException("status", "Only drafts can be submitted.");
        if (!employeeAction && req.Status == RequestStatuses.Draft)
            throw new ValidationFailedException("status", "Draft requests must be submitted by their employee first.");
        if (!RequestStatuses.Reviewable.Contains(r.Status)) throw new ValidationFailedException("status", "Invalid request status.");
        if (req.Allocations.Count > 0) throw new ValidationFailedException("status", "Requests with allocations cannot be changed.");

        var comment = r.Comment?.Trim() ?? string.Empty;
        if (r.Status is RequestStatuses.PartiallyApproved or RequestStatuses.Rejected && comment.Length < 5)
            throw new ValidationFailedException("comment", "A review comment is required.");
        if (r.Status == RequestStatuses.Expired && !(req.RequiredBy is { } rb && rb < DateTimeOffset.UtcNow))
            throw new ValidationFailedException("status", "Only overdue requests can expire.");

        if (r.Status is RequestStatuses.Approved or RequestStatuses.PartiallyApproved)
        {
            var approved = r.Status == RequestStatuses.Approved ? req.Count : r.Count ?? 0;
            if (approved <= 0 || approved > req.Count || (r.Status == RequestStatuses.PartiallyApproved && approved >= req.Count))
                throw new ValidationFailedException("count", "Partial approval must be a positive quantity below the requested count.");
            req.ApprovedCount = approved;
        }

        req.Status = r.Status;
        req.Events.Add(new LeadRequestEvent { RequestId = req.Id, Action = r.Status, ActorName = me.Name, Note = comment });
        access.Notify(r.Status == RequestStatuses.Submitted ? req.TeamLeaderId : req.OwnerId, $"Lead request: {r.Status}");
        if (r.Status == RequestStatuses.UnderReview) access.Notify(req.ManagerId, "Lead request forwarded for review");
        audit.Record("lead.request." + r.Status.ToLowerInvariant().Replace(' ', '_'), "lead_request", req.Id.ToString(), new { comment });
        await access.SaveAsync(ct);
        return Map(req, await access.PeopleAsync([req.OwnerId, req.TeamLeaderId], ct));
    }

    private static LeadRequestDto Map(LeadRequest r, IReadOnlyDictionary<Guid, Person> p) => new(
        r.Id, r.OwnerId, CrmMapper.NameOf(p, r.OwnerId), r.TeamLeaderId, CrmMapper.NameOf(p, r.TeamLeaderId), r.ManagerId,
        r.State, r.Count, r.Remarks, r.RequiredBy, r.Status, r.ApprovedCount, r.AllocatedCount,
        r.Events.OrderBy(e => e.CreatedAt).Select(e => new LeadRequestEventDto(e.Action, e.ActorName, e.Note, e.CreatedAt)).ToList(),
        r.CreatedAt, r.Version);
}
