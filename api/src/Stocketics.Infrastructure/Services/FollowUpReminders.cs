using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

/// <summary>Port of the crm.js 5-minute cron: notify owner, team leader and manager once per overdue follow-up.</summary>
public sealed class FollowUpReminderProcessor(AppDbContext db)
{
    public async Task<int> RunOnceAsync(DateTimeOffset now, CancellationToken ct = default)
    {
        var due = await db.LeadFollowUps
            .Where(f => f.Status == "Open" && f.ReminderSentAt == null && f.DueAt <= now)
            .OrderBy(f => f.DueAt).Take(500).ToListAsync(ct);
        if (due.Count == 0) return 0;

        var leadIds = due.Select(f => f.LeadId).Distinct().ToList();
        var leads = await db.Leads.AsNoTracking().Where(l => leadIds.Contains(l.Id)).ToDictionaryAsync(l => l.Id, ct);

        var sent = 0;
        foreach (var f in due)
        {
            f.ReminderSentAt = now; // mark even for archived leads so they are not re-examined every run
            if (!leads.TryGetValue(f.LeadId, out var lead) || lead.IsArchived) continue;
            foreach (var userId in new[] { lead.OwnerId, lead.TeamLeaderId, lead.ManagerId }.Where(i => i.HasValue).Select(i => i!.Value).Distinct())
                db.Notifications.Add(new Notification { UserId = userId, Title = $"Follow-up due: {lead.Name}", LeadId = lead.Id });
            sent++;
        }
        await db.SaveChangesAsync(ct);
        return sent;
    }
}

public sealed class FollowUpReminderService(IServiceScopeFactory scopes, IConfiguration config, ILogger<FollowUpReminderService> log)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!config.GetValue("Reminders:Enabled", true)) return;
        var every = TimeSpan.FromMinutes(config.GetValue("Reminders:IntervalMinutes", 5));

        using var timer = new PeriodicTimer(every);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopes.CreateScope();
                var n = await scope.ServiceProvider.GetRequiredService<FollowUpReminderProcessor>().RunOnceAsync(DateTimeOffset.UtcNow, stoppingToken);
                if (n > 0) log.LogInformation("Sent {Count} follow-up reminders", n);
            }
            catch (OperationCanceledException) { /* shutting down */ }
            catch (Exception ex) { log.LogError(ex, "Follow-up reminder run failed; will retry next interval"); }
        }
    }
}
