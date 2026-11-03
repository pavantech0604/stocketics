using Stocketics.Application.Common;
using Stocketics.Application.Dtos;

namespace Stocketics.Application.Abstractions;

public interface ILeadService
{
    Task<PagedResult<LeadDto>> ListAsync(LeadQuery query, CancellationToken ct = default);
    Task<LeadDetailDto> GetAsync(Guid id, CancellationToken ct = default);
    Task<LeadDto> CreateAsync(CreateLeadRequest request, CancellationToken ct = default);
    Task<LeadDto> UpdateAsync(Guid id, UpdateLeadRequest request, CancellationToken ct = default);
    Task<AssignResultDto> AssignAsync(AssignLeadsRequest request, CancellationToken ct = default);
    Task<LeadDto> RecordResponseAsync(Guid id, RecordResponseRequest request, CancellationToken ct = default);
    Task<LeadDto> ChangeStatusAsync(Guid id, ChangeStatusRequest request, CancellationToken ct = default);
    Task<LeadDto> SetArchivedAsync(Guid id, bool archived, ArchiveRequest request, CancellationToken ct = default);
    Task<ClientDto> ConvertAsync(Guid id, ConvertLeadRequest request, CancellationToken ct = default);
}

public interface ILeadImportService
{
    Task<ImportBatchDto> ImportAsync(ImportLeadsRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ImportBatchDto>> ListAsync(CancellationToken ct = default);
    Task<ImportBatchDto> GetAsync(Guid id, CancellationToken ct = default);
}

public interface IDndService
{
    Task<PagedResult<DndDto>> ListAsync(string? q, int page, int pageSize, CancellationToken ct = default);
    Task<DndDto> AddAsync(AddDndRequest request, CancellationToken ct = default);
    Task RemoveAsync(Guid id, CancellationToken ct = default);
}

public interface ILeadRequestService
{
    Task<IReadOnlyList<LeadRequestDto>> ListAsync(CancellationToken ct = default);
    Task<LeadRequestDto> CreateAsync(CreateLeadRequestRequest request, CancellationToken ct = default);
    Task<LeadRequestDto> ReviewAsync(Guid id, ReviewLeadRequestRequest request, CancellationToken ct = default);
}

public interface IClientService
{
    Task<PagedResult<ClientDto>> ListAsync(ClientQuery query, CancellationToken ct = default);
    Task<ClientDetailDto> GetAsync(Guid id, CancellationToken ct = default);
    Task<ClientDto> SetStatusAsync(Guid id, SetClientStatusRequest request, CancellationToken ct = default);
    Task<ClientNoteDto> AddNoteAsync(Guid id, AddClientNoteRequest request, CancellationToken ct = default);
    Task<ClientSubscriptionDto> AddSubscriptionAsync(Guid id, AddSubscriptionRequest request, CancellationToken ct = default);
    Task<ClientTrialDto> AddTrialAsync(Guid id, AddTrialRequest request, CancellationToken ct = default);
}

public interface ICrmSettingsService
{
    Task<CrmSettingsDto> GetAsync(CancellationToken ct = default);
    Task<CrmSettingsDto> UpdateAsync(UpdateCrmSettingsRequest request, CancellationToken ct = default);
}

public interface INotificationService
{
    Task<IReadOnlyList<NotificationDto>> ListMineAsync(CancellationToken ct = default);
    Task MarkReadAsync(Guid id, CancellationToken ct = default);
}
