using Stocketics.Domain.Constants;

namespace Stocketics.Domain.Entities;

/// <summary>
/// Anything owned through the employee → team leader → manager chain. The three ids are denormalised onto the
/// row (as in crm.js) so role-scoped reads are a single indexed predicate; assignment keeps them consistent.
/// </summary>
public abstract class CrmOwned : Entity
{
    public Guid? OwnerId { get; set; }
    public Guid? TeamLeaderId { get; set; }
    public Guid? ManagerId { get; set; }
}

public class Lead : CrmOwned
{
    public string Name { get; set; } = string.Empty;
    /// <summary>Normalised 10-digit mobile. Unique across all leads, archived or not.</summary>
    public string Phone { get; set; } = string.Empty;
    /// <summary>Lower-cased; null when absent (so the unique index ignores it).</summary>
    public string? Email { get; set; }
    public string State { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Campaign { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
    public string Status { get; set; } = LeadStatuses.New;
    public bool IsArchived { get; set; }
    public bool IsDnd { get; set; }
    public string? LastResponse { get; set; }
    /// <summary>Earliest open follow-up; denormalised for the "today's follow-ups" views.</summary>
    public DateTimeOffset? NextFollowUpAt { get; set; }
}

/// <summary>Append-only timeline of everything that happened to a lead (calls, status changes, edits, assignments).</summary>
public class LeadActivity : Entity
{
    public Guid LeadId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string? Outcome { get; set; }
    public Guid? ActorId { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public Guid? TeamLeaderAtTime { get; set; }
    public string StatusAtTime { get; set; } = string.Empty;
    public DateTimeOffset? NextDueAt { get; set; }
    /// <summary>For a correction: the entry being corrected. The original is never modified.</summary>
    public Guid? OriginalActivityId { get; set; }
    public Guid? FollowUpId { get; set; }
    /// <summary>JSON before/after detail for edits.</summary>
    public string? Detail { get; set; }
}

public class LeadFollowUp : Entity
{
    public Guid LeadId { get; set; }
    public DateTimeOffset DueAt { get; set; }
    public string Status { get; set; } = "Open";
    public Guid? CreatedById { get; set; }
    public string? Response { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public Guid? CompletedById { get; set; }
    public DateTimeOffset? ReminderSentAt { get; set; }
}

public class LeadAssignment : Entity
{
    public Guid LeadId { get; set; }
    public Guid? PreviousOwnerId { get; set; }
    public Guid? PreviousTeamLeaderId { get; set; }
    public Guid? NewOwnerId { get; set; }
    public Guid? NewTeamLeaderId { get; set; }
    public Guid? ActorId { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    /// <summary>"Initial assignment" or "Reassignment".</summary>
    public string Type { get; set; } = string.Empty;
    /// <summary>Manual, Lead request or Import.</summary>
    public string Source { get; set; } = "Manual";
    public Guid? RequestId { get; set; }
}

public class LeadRequest : Entity
{
    public Guid OwnerId { get; set; }
    public Guid TeamLeaderId { get; set; }
    public Guid? ManagerId { get; set; }
    public string State { get; set; } = string.Empty;
    public int Count { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public DateTimeOffset? RequiredBy { get; set; }
    public string Status { get; set; } = RequestStatuses.Submitted;
    public int ApprovedCount { get; set; }
    public int AllocatedCount { get; set; }

    public List<LeadRequestEvent> Events { get; set; } = [];
    public List<LeadRequestAllocation> Allocations { get; set; } = [];
}

public class LeadRequestEvent : Entity
{
    public Guid RequestId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class LeadRequestAllocation
{
    public Guid RequestId { get; set; }
    public Guid LeadId { get; set; }
}

public class DndNumber : Entity
{
    public string Phone { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public Guid? LeadId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid? AddedById { get; set; }
    public string AddedByName { get; set; } = string.Empty;
}

public class Client : CrmOwned
{
    public string ClientCode { get; set; } = string.Empty;
    /// <summary>The lead this client was converted from (1:1, unique).</summary>
    public Guid LeadId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string State { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Campaign { get; set; } = string.Empty;
    public string Status { get; set; } = ClientStatuses.Active;
    public Guid? ConvertedById { get; set; }
    public DateTimeOffset ConvertedAt { get; set; }

    public List<ClientNote> Notes { get; set; } = [];
    public List<ClientSubscription> Subscriptions { get; set; } = [];
    public List<ClientTrial> Trials { get; set; } = [];
}

public class ClientNote : Entity
{
    public Guid ClientId { get; set; }
    public Guid? AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorRole { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}

public class ClientSubscription : Entity
{
    public Guid ClientId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string ServiceCategory { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Status { get; set; } = "Active";
    public string? InvoiceNo { get; set; }
    public decimal PaidAmount { get; set; }
    public Guid? AdvisorId { get; set; }
}

public class ClientTrial : Entity
{
    public Guid ClientId { get; set; }
    public string Product { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Status { get; set; } = "Active";
}

public class Notification : Entity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid? LeadId { get; set; }
    public bool IsRead { get; set; }
}

public class ImportBatch : Entity
{
    public string FileName { get; set; } = string.Empty;
    public Guid? ActorId { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public int Total { get; set; }
    public int CreatedCount { get; set; }
    public int DuplicateCount { get; set; }
    public int FailedCount { get; set; }
    public Guid? AssignedToTeamLeaderId { get; set; }
    /// <summary>Per-row outcome (JSON array of row/status/message/leadId), kept permanently.</summary>
    public string ResultsJson { get; set; } = "[]";
}
