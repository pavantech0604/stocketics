using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

public sealed class CrmSettingsService(AppDbContext db, CrmAccess access, IAuditService audit) : ICrmSettingsService
{
    private const string Key = "crm.settings";
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    // Stored shape. States are fixed (the 36 Indian states/UTs), only the rest is editable.
    private sealed record Stored(int MaxRequest, bool AadhaarBackRequired, List<string> Sources);

    public async Task<CrmSettingsDto> GetAsync(CancellationToken ct = default)
    {
        var row = await db.Settings.AsNoTracking().FirstOrDefaultAsync(s => s.Key == Key, ct);
        var s = row is null ? null : JsonSerializer.Deserialize<Stored>(row.Value, Json);
        return new CrmSettingsDto(
            s?.MaxRequest ?? CrmDefaults.MaxRequest, s?.AadhaarBackRequired ?? false,
            CrmDefaults.States, (IReadOnlyList<string>?)s?.Sources ?? CrmDefaults.Sources);
    }

    public async Task<CrmSettingsDto> UpdateAsync(UpdateCrmSettingsRequest r, CancellationToken ct = default)
    {
        if (!await access.HasAsync(Permissions.AdminSettings, ct)) throw new ForbiddenException();
        var before = await GetAsync(ct);

        var max = r.MaxRequest!.Value;
        if (max is < 1 or > 1000) throw new ValidationFailedException("maxRequest", "Request maximum must be 1–1000.");

        var sources = r.Sources.Select(s => s.Trim()).ToList();
        if (sources.Count == 0 || sources.Any(s => s.Length is 0 or > 120))
            throw new ValidationFailedException("sources", "Provide valid source names.");
        if (sources.Distinct(StringComparer.Ordinal).Count() != sources.Count)
            throw new ValidationFailedException("sources", "Source names must be unique.");
        // Historical leads reference these names, so a source can be added but never removed.
        var removed = before.Sources.Where(s => !sources.Contains(s)).ToList();
        if (removed.Count > 0)
            throw new ValidationFailedException("sources", "Existing sources cannot be removed; historical workflows depend on them.");

        var json = JsonSerializer.Serialize(new Stored(max, r.AadhaarBackRequired, sources), Json);
        var row = await db.Settings.FirstOrDefaultAsync(s => s.Key == Key, ct);
        if (row is null) db.Settings.Add(new AppSetting { Key = Key, Value = json, UpdatedAt = DateTimeOffset.UtcNow });
        else { row.Value = json; row.UpdatedAt = DateTimeOffset.UtcNow; }

        audit.Record("crm.settings.updated", "settings", Key, new { before = new { before.MaxRequest, before.AadhaarBackRequired, before.Sources }, after = new { MaxRequest = max, r.AadhaarBackRequired, Sources = sources } });
        await db.SaveChangesAsync(ct);
        return await GetAsync(ct);
    }
}

public sealed class NotificationService(AppDbContext db, ICurrentUser current) : INotificationService
{
    public async Task<IReadOnlyList<NotificationDto>> ListMineAsync(CancellationToken ct = default)
    {
        var me = current.UserId;
        var rows = await db.Notifications.AsNoTracking().Where(n => n.UserId == me)
            .OrderBy(n => n.IsRead).ThenByDescending(n => n.CreatedAt).Take(100).ToListAsync(ct);
        return rows.Select(n => new NotificationDto(n.Id, n.Title, n.LeadId, n.IsRead, n.CreatedAt)).ToList();
    }

    public async Task MarkReadAsync(Guid id, CancellationToken ct = default)
    {
        var n = await db.Notifications.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException("Notification not found.");
        // Same answer whether it exists or belongs to someone else: never confirm another user's records.
        if (n.UserId != current.UserId) throw new NotFoundException("Notification not found.");
        n.IsRead = true;
        await db.SaveChangesAsync(ct);
    }
}
