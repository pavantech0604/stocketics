using System.ComponentModel.DataAnnotations;

namespace Stocketics.Application.Dtos;

// ── Leads ────────────────────────────────────────────────────────────────────

public sealed record LeadDto(
    Guid Id, string Name, string Phone, string Email, string State, string City, string Source, string Campaign,
    string Description, string Priority, string Status,
    Guid? OwnerId, string? OwnerName, Guid? TeamLeaderId, string? TeamLeaderName, Guid? ManagerId, string? ManagerName,
    bool IsArchived, bool IsDnd, string? LastResponse, DateTimeOffset? NextFollowUpAt,
    DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, int Version);

public sealed record LeadActivityDto(
    Guid Id, string Type, string Note, string? Outcome, string ActorName, string ActorRole, DateTimeOffset At,
    string StatusAtTime, DateTimeOffset? NextDueAt, Guid? OriginalActivityId, Guid? FollowUpId, string? Detail);

public sealed record FollowUpDto(
    Guid Id, DateTimeOffset DueAt, string Status, string? Response, DateTimeOffset? CompletedAt);

public sealed record LeadAssignmentDto(
    Guid Id, string Type, string Source, string? PreviousOwnerName, string? PreviousTeamLeaderName,
    string? NewOwnerName, string? NewTeamLeaderName, string ActorName, string Reason, Guid? RequestId,
    DateTimeOffset At);

public sealed record LeadDetailDto(
    LeadDto Lead, IReadOnlyList<LeadActivityDto> Activity, IReadOnlyList<FollowUpDto> FollowUps,
    IReadOnlyList<LeadAssignmentDto> Assignments, Guid? ClientId);

public sealed record LeadQuery(
    string? Q = null, string? Status = null, string? State = null, string? Source = null, string? Priority = null,
    Guid? OwnerId = null, Guid? TeamLeaderId = null,
    /// <summary>true = only leads with no employee owner yet.</summary>
    bool? Unassigned = null,
    /// <summary>Default false: archived leads are hidden unless asked for.</summary>
    bool? Archived = null,
    /// <summary>Follow-up window (the client supplies local-day bounds, so no server timezone is assumed).</summary>
    DateTimeOffset? DueFrom = null, DateTimeOffset? DueTo = null,
    int Page = 1, int PageSize = 25);

public sealed record CreateLeadRequest(
    [Required, MinLength(2), MaxLength(120)] string Name,
    [Required, MaxLength(30)] string Phone,
    [MaxLength(254)] string? Email,
    [Required] string State,
    [MaxLength(120)] string? City,
    [Required] string Source,
    [MaxLength(120)] string? Campaign,
    string? Priority,
    [MaxLength(2000)] string? Description,
    /// <summary>Admin/HR only: the manager the lead belongs to. A manager creating a lead owns it.</summary>
    Guid? ManagerId);

public sealed record UpdateLeadRequest(
    [Required, MinLength(2), MaxLength(120)] string Name,
    [Required, MaxLength(30)] string Phone,
    [MaxLength(254)] string? Email,
    [Required] string State,
    [MaxLength(120)] string? City,
    [Required] string Source,
    [MaxLength(120)] string? Campaign,
    [Required] string Priority,
    [MaxLength(2000)] string? Description,
    [Required] int? Version);

public sealed record AssignItem([Required] Guid LeadId, [Required] int? Version);

public sealed record AssignLeadsRequest(
    [Required, MinLength(1), MaxLength(500)] IReadOnlyList<AssignItem> Items,
    [Required] Guid TargetId,
    /// <summary>team_leader (default for callers who may assign across teams) or employee.</summary>
    string? TargetRole,
    string? Reason,
    Guid? RequestId);

public sealed record AssignResultDto(int Count);

public sealed record RecordResponseRequest(
    [Required] int? Version,
    [Required, MinLength(2), MaxLength(2000)] string Note,
    [MaxLength(120)] string? Outcome,
    /// <summary>Schedules the next follow-up; must be in the future.</summary>
    DateTimeOffset? NextDue,
    /// <summary>Completes this open follow-up with the note as its response.</summary>
    Guid? FollowUpId,
    /// <summary>Marks this entry as a correction of an earlier one (which stays unchanged).</summary>
    Guid? CorrectsActivityId);

public sealed record ChangeStatusRequest([Required] int? Version, [Required] string Status, string? Reason);

public sealed record ArchiveRequest([Required] int? Version, [Required, MinLength(5), MaxLength(500)] string Reason);

public sealed record ConvertLeadRequest([Required] int? Version);

// ── Import ───────────────────────────────────────────────────────────────────

public sealed record ImportRow(
    string? Name, string? Phone, string? Email, string? State, string? City, string? Source, string? Campaign);

public sealed record ImportLeadsRequest(
    [MaxLength(200)] string? FileName,
    /// <summary>Default source for rows that don't carry their own.</summary>
    string? Source,
    Guid? ManagerId,
    /// <summary>When set, successfully created leads are assigned to this team leader.</summary>
    Guid? TeamLeaderId,
    [Required, MinLength(1), MaxLength(1000)] IReadOnlyList<ImportRow> Rows);

public sealed record ImportRowResult(int Row, string Status, string? Message, Guid? LeadId);

public sealed record ImportBatchDto(
    Guid Id, string FileName, string ActorName, int Total, int Created, int Duplicates, int Failed,
    Guid? AssignedToTeamLeaderId, DateTimeOffset At, IReadOnlyList<ImportRowResult>? Results);

// ── DND ──────────────────────────────────────────────────────────────────────

public sealed record DndDto(
    Guid Id, string Phone, string? ClientName, Guid? LeadId, string Reason, string AddedByName, DateTimeOffset AddedAt);

public sealed record AddDndRequest(
    [Required, MaxLength(30)] string Phone, [Required, MinLength(2), MaxLength(500)] string Reason, Guid? LeadId);

// ── Lead requests ────────────────────────────────────────────────────────────

public sealed record LeadRequestEventDto(string Action, string ActorName, string? Note, DateTimeOffset At);

public sealed record LeadRequestDto(
    Guid Id, Guid OwnerId, string? OwnerName, Guid TeamLeaderId, string? TeamLeaderName, Guid? ManagerId,
    string State, int Count, string Remarks, DateTimeOffset? RequiredBy, string Status, int ApprovedCount,
    int AllocatedCount, IReadOnlyList<LeadRequestEventDto> History, DateTimeOffset CreatedAt, int Version);

public sealed record CreateLeadRequestRequest(
    [Required] string State,
    [Required] int? Count,
    [MaxLength(1000)] string? Remarks,
    DateTimeOffset? RequiredBy,
    bool Draft = false);

public sealed record ReviewLeadRequestRequest(
    [Required] int? Version, [Required] string Status,
    /// <summary>Required (and below the requested count) only for Partially Approved.</summary>
    int? Count,
    [MaxLength(1000)] string? Comment);

// ── Clients ──────────────────────────────────────────────────────────────────

public sealed record ClientDto(
    Guid Id, string ClientCode, Guid LeadId, string Name, string Phone, string Email, string State, string City,
    string Source, string Campaign, string Status, bool IsDnd,
    Guid? OwnerId, string? OwnerName, Guid? TeamLeaderId, Guid? ManagerId, DateTimeOffset ConvertedAt, int Version);

public sealed record ClientNoteDto(Guid Id, string AuthorName, string AuthorRole, string Response, string Text, DateTimeOffset At);

public sealed record ClientSubscriptionDto(
    Guid Id, string ServiceName, string ServiceCategory, DateOnly StartDate, DateOnly EndDate, string Status,
    string? InvoiceNo, decimal PaidAmount, Guid? AdvisorId, string? AdvisorName);

public sealed record ClientTrialDto(Guid Id, string Product, DateOnly StartDate, DateOnly EndDate, string Status);

public sealed record ClientDetailDto(
    ClientDto Client, IReadOnlyList<ClientNoteDto> Notes, IReadOnlyList<ClientSubscriptionDto> Subscriptions,
    IReadOnlyList<ClientTrialDto> Trials);

public sealed record ClientQuery(
    string? Q = null, string? Status = null, Guid? OwnerId = null, int Page = 1, int PageSize = 25);

public sealed record SetClientStatusRequest([Required] int? Version, [Required] string Status);

public sealed record AddClientNoteRequest(
    [MaxLength(120)] string? Response, [Required, MinLength(2), MaxLength(2000)] string Text);

public sealed record AddSubscriptionRequest(
    [Required, MinLength(2), MaxLength(120)] string ServiceName,
    [MaxLength(120)] string? ServiceCategory,
    [Required] DateOnly StartDate, [Required] DateOnly EndDate,
    string? Status, [MaxLength(60)] string? InvoiceNo,
    [Range(0, 100_000_000)] decimal PaidAmount, Guid? AdvisorId);

public sealed record AddTrialRequest(
    [Required, MinLength(2), MaxLength(120)] string Product,
    [Required] DateOnly StartDate, [Required] DateOnly EndDate, string? Status);

// ── Settings & notifications ─────────────────────────────────────────────────

public sealed record CrmSettingsDto(
    int MaxRequest, bool AadhaarBackRequired, IReadOnlyList<string> States, IReadOnlyList<string> Sources);

public sealed record UpdateCrmSettingsRequest(
    [Required] int? MaxRequest, bool AadhaarBackRequired, [Required] IReadOnlyList<string> Sources);

public sealed record NotificationDto(Guid Id, string Title, Guid? LeadId, bool IsRead, DateTimeOffset At);
