using System.Text.Json;
using Stocketics.Application.Abstractions;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

public sealed class AuditService(AppDbContext db, ICurrentUser current) : IAuditService
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public void Record(string action, string entityType, string? entityId = null, object? detail = null)
        => db.AuditLogs.Add(Build(action, entityType, entityId, detail,
            current.IsAuthenticated ? current.UserId : null, current.Email));

    public async Task RecordAndSaveAsync(string action, string entityType, string? entityId = null,
        object? detail = null, Guid? actorId = null, string? actorEmail = null, CancellationToken ct = default)
    {
        db.AuditLogs.Add(Build(action, entityType, entityId, detail,
            actorId ?? (current.IsAuthenticated ? current.UserId : null), actorEmail ?? current.Email));
        await db.SaveChangesAsync(ct);
    }

    private AuditLog Build(string action, string entityType, string? entityId, object? detail,
        Guid? actorId, string? actorEmail) => new()
    {
        At = DateTimeOffset.UtcNow,
        ActorId = actorId,
        ActorEmail = actorEmail,
        Action = action,
        EntityType = entityType,
        EntityId = entityId,
        Detail = detail is null ? null : JsonSerializer.Serialize(detail, Json),
        IpAddress = current.IpAddress,
    };
}
