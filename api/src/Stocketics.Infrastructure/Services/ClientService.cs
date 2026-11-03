using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

/// <summary>
/// Clients are created by converting a qualified lead (see <see cref="LeadService.ConvertAsync"/>); their contact
/// details are edited through that lead. This service covers the client-only data: status, notes,
/// subscriptions and trials. Visibility and edit rights follow the same permission matrix as leads.
/// </summary>
public sealed class ClientService(AppDbContext db, CrmAccess access, IAuditService audit) : IClientService
{
    public async Task<PagedResult<ClientDto>> ListAsync(ClientQuery q, CancellationToken ct = default)
    {
        var scope = await access.RequireViewScopeAsync(ct);
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);

        var query = access.Scope(db.Clients.AsNoTracking(), scope);
        if (!string.IsNullOrWhiteSpace(q.Q))
        {
            var term = q.Q.Trim().ToLowerInvariant();
            query = query.Where(c => c.Name.ToLower().Contains(term) || c.Phone.Contains(term)
                                     || (c.Email != null && c.Email.Contains(term)) || c.ClientCode.ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(q.Status)) query = query.Where(c => c.Status == q.Status);
        if (q.OwnerId is { } owner) query = query.Where(c => c.OwnerId == owner);

        var total = await query.CountAsync(ct);
        var rows = await query.OrderByDescending(c => c.ConvertedAt).ThenBy(c => c.Id)
            .Skip((page - 1) * size).Take(size).ToListAsync(ct);
        var people = await access.PeopleAsync(rows.SelectMany(c => new Guid?[] { c.OwnerId, c.TeamLeaderId, c.ManagerId }), ct);
        var phones = rows.Select(c => c.Phone).ToList();
        var dnd = (await db.DndNumbers.Where(d => phones.Contains(d.Phone)).Select(d => d.Phone).ToListAsync(ct)).ToHashSet();
        return new PagedResult<ClientDto>(rows.Select(c => CrmMapper.Client(c, people, dnd.Contains(c.Phone))).ToList(), total, page, size);
    }

    public async Task<ClientDetailDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var c = await LoadAsync(id, track: false, ct);
        var people = await access.PeopleAsync(new Guid?[] { c.OwnerId, c.TeamLeaderId, c.ManagerId }
            .Concat(c.Subscriptions.Select(s => s.AdvisorId)), ct);
        var isDnd = await db.DndNumbers.AnyAsync(d => d.Phone == c.Phone, ct);
        return new ClientDetailDto(
            CrmMapper.Client(c, people, isDnd),
            c.Notes.OrderByDescending(n => n.CreatedAt).Select(NoteDto).ToList(),
            c.Subscriptions.OrderByDescending(s => s.StartDate).Select(s => SubDto(s, people)).ToList(),
            c.Trials.OrderByDescending(t => t.StartDate).Select(TrialDto).ToList());
    }

    public async Task<ClientDto> SetStatusAsync(Guid id, SetClientStatusRequest r, CancellationToken ct = default)
    {
        var c = await LoadAsync(id, track: true, ct);
        await access.RequireEditAsync(c, ct);
        CrmAccess.CheckVersion(c, r.Version);
        if (!ClientStatuses.All.Contains(r.Status))
            throw new ValidationFailedException("status", $"Status must be one of: {string.Join(", ", ClientStatuses.All)}.");
        var from = c.Status;
        c.Status = r.Status;
        audit.Record("client.status", "client", c.Id.ToString(), new { from, to = r.Status });
        await access.SaveAsync(ct);
        var people = await access.PeopleAsync([c.OwnerId, c.TeamLeaderId, c.ManagerId], ct);
        return CrmMapper.Client(c, people, await db.DndNumbers.AnyAsync(d => d.Phone == c.Phone, ct));
    }

    public async Task<ClientNoteDto> AddNoteAsync(Guid id, AddClientNoteRequest r, CancellationToken ct = default)
    {
        var c = await LoadAsync(id, track: true, ct);
        await access.RequireEditAsync(c, ct);
        var me = await access.MeAsync(ct);
        var note = new ClientNote
        {
            ClientId = c.Id, AuthorId = me.Id, AuthorName = me.Name, AuthorRole = access.MyRole,
            Response = r.Response?.Trim() ?? string.Empty, Text = r.Text.Trim(),
        };
        db.ClientNotes.Add(note);
        await access.SaveAsync(ct);
        return NoteDto(note);
    }

    public async Task<ClientSubscriptionDto> AddSubscriptionAsync(Guid id, AddSubscriptionRequest r, CancellationToken ct = default)
    {
        var c = await LoadAsync(id, track: true, ct);
        await access.RequireEditAsync(c, ct);
        if (r.EndDate < r.StartDate) throw new ValidationFailedException("endDate", "End date cannot be before the start date.");
        var status = r.Status ?? "Active";
        if (!SubscriptionStatuses.All.Contains(status))
            throw new ValidationFailedException("status", $"Status must be one of: {string.Join(", ", SubscriptionStatuses.All)}.");
        if (r.AdvisorId is { } adv && (await access.PeopleAsync([adv], ct)).GetValueOrDefault(adv) is not { Active: true })
            throw new ValidationFailedException("advisorId", "Advisor must be an existing, active employee.");

        var s = new ClientSubscription
        {
            ClientId = c.Id, ServiceName = r.ServiceName.Trim(), ServiceCategory = r.ServiceCategory?.Trim() ?? string.Empty,
            StartDate = r.StartDate, EndDate = r.EndDate, Status = status, InvoiceNo = r.InvoiceNo?.Trim(),
            PaidAmount = r.PaidAmount, AdvisorId = r.AdvisorId,
        };
        db.ClientSubscriptions.Add(s);
        audit.Record("client.subscription.added", "client", c.Id.ToString(), new { s.ServiceName, s.PaidAmount });
        await access.SaveAsync(ct);
        return SubDto(s, await access.PeopleAsync([s.AdvisorId], ct));
    }

    public async Task<ClientTrialDto> AddTrialAsync(Guid id, AddTrialRequest r, CancellationToken ct = default)
    {
        var c = await LoadAsync(id, track: true, ct);
        await access.RequireEditAsync(c, ct);
        if (r.EndDate < r.StartDate) throw new ValidationFailedException("endDate", "End date cannot be before the start date.");
        var status = r.Status ?? "Active";
        if (!TrialStatuses.All.Contains(status))
            throw new ValidationFailedException("status", $"Status must be one of: {string.Join(", ", TrialStatuses.All)}.");

        var t = new ClientTrial { ClientId = c.Id, Product = r.Product.Trim(), StartDate = r.StartDate, EndDate = r.EndDate, Status = status };
        db.ClientTrials.Add(t);
        await access.SaveAsync(ct);
        return TrialDto(t);
    }

    private async Task<Client> LoadAsync(Guid id, bool track, CancellationToken ct)
    {
        var scope = await access.RequireViewScopeAsync(ct);
        var query = db.Clients.Include(c => c.Notes).Include(c => c.Subscriptions).Include(c => c.Trials).AsQueryable();
        if (!track) query = query.AsNoTracking();
        var c = await query.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NotFoundException("Client not found.");
        if (!access.InScope(c, scope)) throw new ForbiddenException("This client is outside your access scope.");
        return c;
    }

    private static ClientNoteDto NoteDto(ClientNote n) => new(n.Id, n.AuthorName, n.AuthorRole, n.Response, n.Text, n.CreatedAt);

    private static ClientSubscriptionDto SubDto(ClientSubscription s, IReadOnlyDictionary<Guid, Person> p) => new(
        s.Id, s.ServiceName, s.ServiceCategory, s.StartDate, s.EndDate, s.Status, s.InvoiceNo, s.PaidAmount,
        s.AdvisorId, CrmMapper.NameOf(p, s.AdvisorId));

    private static ClientTrialDto TrialDto(ClientTrial t) => new(t.Id, t.Product, t.StartDate, t.EndDate, t.Status);
}
