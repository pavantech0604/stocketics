using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

public enum ViewScope { None, Own, Team, All }

public sealed record Person(Guid Id, string Name, string Role, bool Active, Guid? ManagerId);

/// <summary>
/// Cross-cutting rules shared by the lead, request and client services: who can see what, how the
/// employee → team leader → manager chain is resolved, and how changes are saved.
/// </summary>
public sealed class CrmAccess(AppDbContext db, ICurrentUser current, IPermissionService permissions)
{
    private Person? _me;

    public Guid MeId => current.UserId;
    public string MyRole => current.Role ?? string.Empty;

    public async Task<bool> HasAsync(string permission, CancellationToken ct = default)
        => current.Role is { } role && await permissions.HasAsync(role, permission, ct);

    // ── visibility ──────────────────────────────────────────────────────────

    /// <summary>
    /// Widest read scope granted by the permission matrix: leads.view.all (everything), .team (my team,
    /// meaning leads where I am the team leader or manager, plus my own) or .own (only mine).
    /// </summary>
    public async Task<ViewScope> ViewScopeAsync(CancellationToken ct = default)
    {
        if (await HasAsync(Permissions.LeadsViewAll, ct)) return ViewScope.All;
        if (await HasAsync(Permissions.LeadsViewTeam, ct)) return ViewScope.Team;
        if (await HasAsync(Permissions.LeadsViewOwn, ct)) return ViewScope.Own;
        return ViewScope.None;
    }

    public async Task<ViewScope> RequireViewScopeAsync(CancellationToken ct = default)
    {
        var scope = await ViewScopeAsync(ct);
        if (scope == ViewScope.None) throw new ForbiddenException();
        return scope;
    }

    public IQueryable<T> Scope<T>(IQueryable<T> query, ViewScope scope) where T : CrmOwned
    {
        var me = MeId;
        return scope switch
        {
            ViewScope.All => query,
            ViewScope.Team => query.Where(x => x.OwnerId == me || x.TeamLeaderId == me || x.ManagerId == me),
            ViewScope.Own => query.Where(x => x.OwnerId == me),
            _ => query.Where(_ => false),
        };
    }

    public bool InScope(CrmOwned x, ViewScope scope) => scope switch
    {
        ViewScope.All => true,
        ViewScope.Team => x.OwnerId == MeId || x.TeamLeaderId == MeId || x.ManagerId == MeId,
        ViewScope.Own => x.OwnerId == MeId,
        _ => false,
    };

    /// <summary>Write access to one record: edit.all, edit.team (I lead or manage it) or edit.own (I own it).</summary>
    public async Task<bool> CanEditAsync(CrmOwned x, CancellationToken ct = default)
    {
        if (await HasAsync(Permissions.LeadsEditAll, ct)) return true;
        if (x.OwnerId == MeId && await HasAsync(Permissions.LeadsEditOwn, ct)) return true;
        return (x.TeamLeaderId == MeId || x.ManagerId == MeId) && await HasAsync(Permissions.LeadsEditTeam, ct);
    }

    public async Task RequireEditAsync(CrmOwned x, CancellationToken ct = default)
    {
        if (!await CanEditAsync(x, ct)) throw new ForbiddenException("You cannot modify this record.");
    }

    // ── people & hierarchy ──────────────────────────────────────────────────

    public async Task<Person> MeAsync(CancellationToken ct = default)
        => _me ??= (await PeopleAsync([MeId], ct)).GetValueOrDefault(MeId)
                   ?? new Person(MeId, current.Email ?? "Unknown", MyRole, true, null);

    public async Task<Dictionary<Guid, Person>> PeopleAsync(IEnumerable<Guid?> ids, CancellationToken ct = default)
    {
        var list = ids.Where(i => i.HasValue).Select(i => i!.Value).Distinct().ToList();
        if (list.Count == 0) return [];
        var rows = await (from e in db.Employees.AsNoTracking()
                          join u in db.Users on e.UserId equals u.Id
                          join ur in db.UserRoles on u.Id equals ur.UserId
                          join r in db.Roles on ur.RoleId equals r.Id
                          where list.Contains(e.Id)
                          select new { e.Id, e.Name, Role = r.Name, u.IsActive, e.ManagerId }).ToListAsync(ct);
        return rows.ToDictionary(x => x.Id, x => new Person(x.Id, x.Name, x.Role ?? string.Empty, x.IsActive, x.ManagerId));
    }

    /// <summary>An existing, active person who holds exactly the given role (crm.js <c>owner()</c>).</summary>
    public async Task<Person> RequirePersonAsync(Guid id, string role, string field, CancellationToken ct = default)
    {
        var p = (await PeopleAsync([id], ct)).GetValueOrDefault(id);
        var label = role.Replace('_', ' ');
        if (p is null) throw new ValidationFailedException(field, $"Select an existing {label}.");
        if (!p.Active || p.Role != role) throw new ValidationFailedException(field, $"Assignee must be an active {label}.");
        return p;
    }

    /// <summary>
    /// Resolves the chain for an assignment target. A team leader's manager is its <c>ManagerId</c>; an
    /// employee's team leader is its <c>ManagerId</c> and that leader's manager one level up.
    /// </summary>
    public async Task<(Person Target, Person TeamLeader, Person Manager)> ResolveChainAsync(
        Guid targetId, string targetRole, CancellationToken ct = default)
    {
        var target = await RequirePersonAsync(targetId, targetRole, "targetId", ct);
        var tl = targetRole == Roles.TeamLeader
            ? target
            : target.ManagerId is { } tlId
                ? await RequirePersonAsync(tlId, Roles.TeamLeader, "targetId", ct)
                : throw new ValidationFailedException("targetId", "Select an existing team leader.");
        if (tl.ManagerId is not { } mgrId) throw new ValidationFailedException("targetId", "Team Leader must have an active Manager.");
        var mgr = (await PeopleAsync([mgrId], ct)).GetValueOrDefault(mgrId);
        if (mgr is null || !mgr.Active || mgr.Role != Roles.Manager)
            throw new ValidationFailedException("targetId", "Team Leader must have an active Manager.");
        return (target, tl, mgr);
    }

    // ── side effects ────────────────────────────────────────────────────────

    public void Notify(Guid? userId, string title, Guid? leadId = null)
    {
        if (userId is { } id)
            db.Notifications.Add(new Notification { UserId = id, Title = title, LeadId = leadId });
    }

    public async Task<LeadActivity> AddActivityAsync(Lead lead, string type, string note, string? outcome = null,
        DateTimeOffset? nextDue = null, Guid? original = null, Guid? followUp = null, string? detail = null,
        CancellationToken ct = default)
    {
        var me = await MeAsync(ct);
        var a = new LeadActivity
        {
            LeadId = lead.Id, Type = type, Note = note, Outcome = outcome, ActorId = me.Id, ActorName = me.Name,
            ActorRole = MyRole, TeamLeaderAtTime = lead.TeamLeaderId, StatusAtTime = lead.Status,
            NextDueAt = nextDue, OriginalActivityId = original, FollowUpId = followUp, Detail = detail,
        };
        db.LeadActivities.Add(a);
        return a;
    }

    /// <summary>
    /// Commits the unit of work. A stale write (someone else changed the row since the client read it) and a
    /// unique-index hit (two requests creating the same contact at once) both surface as 409, never a 500.
    /// </summary>
    public async Task SaveAsync(CancellationToken ct = default)
    {
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("This record changed. Refresh and try again.");
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            throw new ConflictException("Duplicate phone or email; existing records were preserved.");
        }
    }

    private static bool IsUniqueViolation(DbUpdateException ex) => ex.InnerException switch
    {
        Npgsql.PostgresException pg => pg.SqlState == "23505",
        Microsoft.Data.Sqlite.SqliteException sq => sq.SqliteErrorCode == 19 && sq.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase),
        _ => false,
    };

    /// <summary>The client's version must match the row it read; this is the crm.js <c>version()</c> check.</summary>
    public static void CheckVersion(Entity entity, int? expected)
    {
        if (expected != entity.Version)
            throw new ConflictException("This record changed. Refresh and try again.");
    }
}
