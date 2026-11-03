using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

public sealed class DndService(AppDbContext db, CrmAccess access, IAuditService audit) : IDndService
{
    public async Task<PagedResult<DndDto>> ListAsync(string? q, int page, int pageSize, CancellationToken ct = default)
    {
        await access.RequireViewScopeAsync(ct);
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.DndNumbers.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLowerInvariant();
            query = query.Where(d => d.Phone.Contains(term) || (d.ClientName != null && d.ClientName.ToLower().Contains(term)));
        }
        var total = await query.CountAsync(ct);
        var rows = await query.OrderByDescending(d => d.CreatedAt).ThenBy(d => d.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<DndDto>(rows.Select(Map).ToList(), total, page, pageSize);
    }

    public async Task<DndDto> AddAsync(AddDndRequest r, CancellationToken ct = default)
    {
        var phone = Normalizer.TryNormalizePhone(r.Phone)
                    ?? throw new ValidationFailedException("phone", "Enter a valid 10-digit Indian mobile number.");
        if (await db.DndNumbers.AnyAsync(d => d.Phone == phone, ct))
            throw new ConflictException("This number is already on the DND list.");

        var lead = r.LeadId is { } lid
            ? await db.Leads.FirstOrDefaultAsync(l => l.Id == lid, ct) ?? throw new NotFoundException("Lead not found.")
            : await db.Leads.FirstOrDefaultAsync(l => l.Phone == phone, ct);

        // Anyone who can edit the lead may flag it; a number with no lead needs edit rights generally.
        if (lead is not null) await access.RequireEditAsync(lead, ct);
        else if (!await access.HasAsync(Permissions.LeadsEditAll, ct)
                 && !await access.HasAsync(Permissions.LeadsEditTeam, ct)
                 && !await access.HasAsync(Permissions.LeadsEditOwn, ct))
            throw new ForbiddenException();
        if (lead is not null && lead.Phone != phone)
            throw new ValidationFailedException("phone", "The number does not match the lead.");

        var me = await access.MeAsync(ct);
        var entry = new DndNumber
        {
            Phone = phone, ClientName = lead?.Name, LeadId = lead?.Id, Reason = r.Reason.Trim(),
            AddedById = me.Id, AddedByName = me.Name,
        };
        db.DndNumbers.Add(entry);
        if (lead is not null)
        {
            lead.IsDnd = true;
            await access.AddActivityAsync(lead, ActivityTypes.Dnd, "Marked Do Not Disturb: " + entry.Reason, ct: ct);
        }
        audit.Record("dnd.added", "dnd", phone);
        await access.SaveAsync(ct);
        return Map(entry);
    }

    public async Task RemoveAsync(Guid id, CancellationToken ct = default)
    {
        if (!await access.HasAsync(Permissions.LeadsEditAll, ct))
            throw new ForbiddenException("Only Managers and Admins can remove a number from the DND list.");
        var entry = await db.DndNumbers.FirstOrDefaultAsync(d => d.Id == id, ct)
                    ?? throw new NotFoundException("DND entry not found.");
        var lead = await db.Leads.FirstOrDefaultAsync(l => l.Phone == entry.Phone, ct);
        db.DndNumbers.Remove(entry);
        if (lead is not null)
        {
            lead.IsDnd = false;
            await access.AddActivityAsync(lead, ActivityTypes.Dnd, "Removed from Do Not Disturb list", ct: ct);
        }
        audit.Record("dnd.removed", "dnd", entry.Phone);
        await access.SaveAsync(ct);
    }

    private static DndDto Map(DndNumber d) => new(d.Id, d.Phone, d.ClientName, d.LeadId, d.Reason, d.AddedByName, d.CreatedAt);
}

/// <summary>
/// Bulk lead import from already-parsed rows (the frontend reads the spreadsheet). Every row gets a recorded
/// outcome; the whole batch is one transaction, so an unexpected failure leaves nothing half-imported.
/// Server-side parsing of uploaded .xlsx/.csv files is a later step that will feed this same engine.
/// </summary>
public sealed class LeadImportService(
    AppDbContext db, CrmAccess access, ICrmSettingsService settings, IAuditService audit) : ILeadImportService
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<ImportBatchDto> ImportAsync(ImportLeadsRequest r, CancellationToken ct = default)
    {
        if (!await access.HasAsync(Permissions.LeadsEditAll, ct))
            throw new ForbiddenException("Only Managers and Admins can import leads.");

        var cfg = await settings.GetAsync(ct);
        var actor = await access.MeAsync(ct);

        Guid? managerId = null;
        if (access.MyRole == Roles.Manager) managerId = access.MeId;
        else if (r.ManagerId is { } m) managerId = (await access.RequirePersonAsync(m, Roles.Manager, "managerId", ct)).Id;

        Person? tl = null;
        if (r.TeamLeaderId is { } tlId)
        {
            var chain = await access.ResolveChainAsync(tlId, Roles.TeamLeader, ct);
            if (access.MyRole == Roles.Manager && chain.TeamLeader.ManagerId != access.MeId)
                throw new ValidationFailedException("teamLeaderId", "Team Leader must report to you.");
            tl = chain.TeamLeader;
            managerId = chain.Manager.Id;
        }

        // Normalise first so we can check all contacts against the database in two queries, not 2,000.
        var parsed = new List<(int Row, ImportLeadsParsed? Ok, string? Error)>();
        for (var i = 0; i < r.Rows.Count; i++)
        {
            var row = r.Rows[i];
            try
            {
                var c = LeadService.ValidateContact(row.Name, row.Phone, row.Email, row.State, row.Source ?? r.Source, cfg);
                parsed.Add((i + 2, new ImportLeadsParsed(c, row, row.Source ?? r.Source!), null)); // row 1 is the header
            }
            catch (ValidationFailedException ex) { parsed.Add((i + 2, null, ex.Message)); }
        }

        var phones = parsed.Where(p => p.Ok is not null).Select(p => p.Ok!.Contact.Phone).Distinct().ToList();
        var emails = parsed.Where(p => p.Ok?.Contact.Email is not null).Select(p => p.Ok!.Contact.Email!).Distinct().ToList();
        var takenPhones = (await db.Leads.Where(l => phones.Contains(l.Phone)).Select(l => l.Phone).ToListAsync(ct))
            .Concat(await db.Clients.Where(c => phones.Contains(c.Phone)).Select(c => c.Phone).ToListAsync(ct)).ToHashSet();
        var takenEmails = (await db.Leads.Where(l => l.Email != null && emails.Contains(l.Email)).Select(l => l.Email!).ToListAsync(ct))
            .Concat(await db.Clients.Where(c => c.Email != null && emails.Contains(c.Email)).Select(c => c.Email!).ToListAsync(ct)).ToHashSet();
        var dnd = (await db.DndNumbers.Where(d => phones.Contains(d.Phone)).Select(d => d.Phone).ToListAsync(ct)).ToHashSet();

        var results = new List<ImportRowResult>();
        var created = 0;
        foreach (var (rowNo, ok, error) in parsed)
        {
            if (ok is null) { results.Add(new ImportRowResult(rowNo, "Failed", error, null)); continue; }

            var c = ok.Contact;
            if (takenPhones.Contains(c.Phone) || (c.Email is not null && takenEmails.Contains(c.Email)))
            {
                results.Add(new ImportRowResult(rowNo, "Duplicate", "Duplicate phone or email; existing records were preserved.", null));
                continue;
            }
            takenPhones.Add(c.Phone);
            if (c.Email is not null) takenEmails.Add(c.Email);

            var lead = new Lead
            {
                Name = c.Name, Phone = c.Phone, Email = c.Email, State = ok.Row.State!, City = ok.Row.City?.Trim() ?? string.Empty,
                Source = ok.Source, Campaign = ok.Row.Campaign?.Trim() ?? string.Empty, Status = LeadStatuses.New,
                ManagerId = managerId, TeamLeaderId = tl?.Id, IsDnd = dnd.Contains(c.Phone),
            };
            db.Leads.Add(lead);
            await access.AddActivityAsync(lead, ActivityTypes.Created, "Lead imported", ct: ct);
            if (tl is not null)
                db.LeadAssignments.Add(new LeadAssignment
                {
                    LeadId = lead.Id, NewTeamLeaderId = tl.Id, ActorId = actor.Id, ActorName = actor.Name,
                    Type = "Initial assignment", Source = "Import",
                });
            results.Add(new ImportRowResult(rowNo, "Created", null, lead.Id));
            created++;
        }

        var batch = new ImportBatch
        {
            FileName = r.FileName?.Trim() ?? string.Empty, ActorId = actor.Id, ActorName = actor.Name, Total = r.Rows.Count,
            CreatedCount = created, DuplicateCount = results.Count(x => x.Status == "Duplicate"),
            FailedCount = results.Count(x => x.Status == "Failed"), AssignedToTeamLeaderId = tl?.Id,
            ResultsJson = JsonSerializer.Serialize(results, Json),
        };
        db.ImportBatches.Add(batch);
        if (tl is not null && created > 0) access.Notify(tl.Id, $"{created} leads imported and assigned to you");
        audit.Record("lead.imported", "import", batch.Id.ToString(), new { batch.FileName, created, batch.DuplicateCount, batch.FailedCount });
        await access.SaveAsync(ct);
        return Map(batch, results);
    }

    public async Task<IReadOnlyList<ImportBatchDto>> ListAsync(CancellationToken ct = default)
    {
        await RequireAsync(ct);
        var rows = await db.ImportBatches.AsNoTracking().OrderByDescending(b => b.CreatedAt).Take(100).ToListAsync(ct);
        return rows.Select(b => Map(b, null)).ToList();
    }

    public async Task<ImportBatchDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        await RequireAsync(ct);
        var b = await db.ImportBatches.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException("Import not found.");
        return Map(b, JsonSerializer.Deserialize<List<ImportRowResult>>(b.ResultsJson, Json));
    }

    private async Task RequireAsync(CancellationToken ct)
    {
        if (!await access.HasAsync(Permissions.LeadsEditAll, ct)) throw new ForbiddenException();
    }

    private static ImportBatchDto Map(ImportBatch b, IReadOnlyList<ImportRowResult>? results) => new(
        b.Id, b.FileName, b.ActorName, b.Total, b.CreatedCount, b.DuplicateCount, b.FailedCount,
        b.AssignedToTeamLeaderId, b.CreatedAt, results);

    private sealed record ImportLeadsParsed(LeadService.Contact Contact, ImportRow Row, string Source);
}
