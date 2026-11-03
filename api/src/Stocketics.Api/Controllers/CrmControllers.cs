using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocketics.Api.Security;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;

namespace Stocketics.Api.Controllers;

/// <summary>
/// Controllers only authenticate and route. Visibility scoping, edit rights, version checks and every
/// business rule are enforced in the services, so they hold whichever way a call arrives.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/leads")]
public class LeadsController(ILeadService leads, ILeadImportService imports) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<LeadDto>>> List([FromQuery] LeadQuery query, CancellationToken ct)
        => await leads.ListAsync(query, ct);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LeadDetailDto>> Get(Guid id, CancellationToken ct) => await leads.GetAsync(id, ct);

    [HttpPost]
    public async Task<ActionResult<LeadDto>> Create(CreateLeadRequest request, CancellationToken ct)
    {
        var lead = await leads.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = lead.Id }, lead);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<LeadDto>> Update(Guid id, UpdateLeadRequest request, CancellationToken ct)
        => await leads.UpdateAsync(id, request, ct);

    /// <summary>Allocate leads to a team leader or an employee (also fulfils an approved lead request).</summary>
    [HttpPost("assign")]
    public async Task<ActionResult<AssignResultDto>> Assign(AssignLeadsRequest request, CancellationToken ct)
        => await leads.AssignAsync(request, ct);

    [HttpPost("{id:guid}/responses")]
    public async Task<ActionResult<LeadDto>> Respond(Guid id, RecordResponseRequest request, CancellationToken ct)
        => await leads.RecordResponseAsync(id, request, ct);

    [HttpPost("{id:guid}/status")]
    public async Task<ActionResult<LeadDto>> ChangeStatus(Guid id, ChangeStatusRequest request, CancellationToken ct)
        => await leads.ChangeStatusAsync(id, request, ct);

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult<LeadDto>> Archive(Guid id, ArchiveRequest request, CancellationToken ct)
        => await leads.SetArchivedAsync(id, true, request, ct);

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<LeadDto>> Restore(Guid id, ArchiveRequest request, CancellationToken ct)
        => await leads.SetArchivedAsync(id, false, request, ct);

    [HttpPost("{id:guid}/convert")]
    public async Task<ActionResult<ClientDto>> Convert(Guid id, ConvertLeadRequest request, CancellationToken ct)
        => await leads.ConvertAsync(id, request, ct);

    // ── bulk import ─────────────────────────────────────────────────────────

    [HttpPost("import")]
    public async Task<ActionResult<ImportBatchDto>> Import(ImportLeadsRequest request, CancellationToken ct)
        => await imports.ImportAsync(request, ct);

    [HttpGet("imports")]
    public async Task<ActionResult<IReadOnlyList<ImportBatchDto>>> ListImports(CancellationToken ct)
        => Ok(await imports.ListAsync(ct));

    [HttpGet("imports/{id:guid}")]
    public async Task<ActionResult<ImportBatchDto>> GetImport(Guid id, CancellationToken ct)
        => await imports.GetAsync(id, ct);
}

[ApiController]
[Authorize]
[Route("api/v1/lead-requests")]
public class LeadRequestsController(ILeadRequestService requests) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LeadRequestDto>>> List(CancellationToken ct) => Ok(await requests.ListAsync(ct));

    [HttpPost]
    public async Task<ActionResult<LeadRequestDto>> Create(CreateLeadRequestRequest request, CancellationToken ct)
        => await requests.CreateAsync(request, ct);

    [HttpPost("{id:guid}/review")]
    public async Task<ActionResult<LeadRequestDto>> Review(Guid id, ReviewLeadRequestRequest request, CancellationToken ct)
        => await requests.ReviewAsync(id, request, ct);
}

[ApiController]
[Authorize]
[Route("api/v1/dnd")]
public class DndController(IDndService dnd) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<DndDto>>> List(string? q, int page = 1, int pageSize = 25, CancellationToken ct = default)
        => await dnd.ListAsync(q, page, pageSize, ct);

    [HttpPost]
    public async Task<ActionResult<DndDto>> Add(AddDndRequest request, CancellationToken ct)
        => await dnd.AddAsync(request, ct);

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remove(Guid id, CancellationToken ct)
    {
        await dnd.RemoveAsync(id, ct);
        return NoContent();
    }
}

[ApiController]
[Authorize]
[Route("api/v1/clients")]
public class ClientsController(IClientService clients) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ClientDto>>> List([FromQuery] ClientQuery query, CancellationToken ct)
        => await clients.ListAsync(query, ct);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClientDetailDto>> Get(Guid id, CancellationToken ct) => await clients.GetAsync(id, ct);

    [HttpPost("{id:guid}/status")]
    public async Task<ActionResult<ClientDto>> SetStatus(Guid id, SetClientStatusRequest request, CancellationToken ct)
        => await clients.SetStatusAsync(id, request, ct);

    [HttpPost("{id:guid}/notes")]
    public async Task<ActionResult<ClientNoteDto>> AddNote(Guid id, AddClientNoteRequest request, CancellationToken ct)
        => await clients.AddNoteAsync(id, request, ct);

    [HttpPost("{id:guid}/subscriptions")]
    public async Task<ActionResult<ClientSubscriptionDto>> AddSubscription(Guid id, AddSubscriptionRequest request, CancellationToken ct)
        => await clients.AddSubscriptionAsync(id, request, ct);

    [HttpPost("{id:guid}/trials")]
    public async Task<ActionResult<ClientTrialDto>> AddTrial(Guid id, AddTrialRequest request, CancellationToken ct)
        => await clients.AddTrialAsync(id, request, ct);
}

[ApiController]
[Authorize]
[Route("api/v1/settings/crm")]
public class CrmSettingsController(ICrmSettingsService settings) : ControllerBase
{
    /// <summary>States, sources and request limit that drive the CRM dropdowns and validation.</summary>
    [HttpGet]
    public async Task<ActionResult<CrmSettingsDto>> Get(CancellationToken ct) => await settings.GetAsync(ct);

    [HttpPut]
    [HasPermission(Permissions.AdminSettings)]
    public async Task<ActionResult<CrmSettingsDto>> Update(UpdateCrmSettingsRequest request, CancellationToken ct)
        => await settings.UpdateAsync(request, ct);
}

[ApiController]
[Authorize]
[Route("api/v1/notifications")]
public class NotificationsController(INotificationService notifications) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> List(CancellationToken ct)
        => Ok(await notifications.ListMineAsync(ct));

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await notifications.MarkReadAsync(id, ct);
        return NoContent();
    }
}
