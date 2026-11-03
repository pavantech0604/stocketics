using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocketics.Api.Security;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;

namespace Stocketics.Api.Controllers;

/// <summary>
/// Coarse permission checks sit here as attributes; row-level scoping and the privilege-escalation rules
/// are enforced again inside <see cref="IEmployeeService"/> so no caller can bypass them.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/employees")]
public class EmployeesController(IEmployeeService employees) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<EmployeeDto>>> List([FromQuery] EmployeeQuery query, CancellationToken ct)
        => await employees.ListAsync(query, ct);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> Get(Guid id, CancellationToken ct)
        => await employees.GetAsync(id, ct);

    [HttpPost]
    [HasPermission(Permissions.AdminEmployees)]
    public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeRequest request, CancellationToken ct)
    {
        var created = await employees.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.AdminEmployees)]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, UpdateEmployeeRequest request, CancellationToken ct)
        => await employees.UpdateAsync(id, request, ct);

    [HttpPost("{id:guid}/deactivate")]
    [HasPermission(Permissions.AdminEmployees)]
    public async Task<ActionResult<EmployeeDto>> Deactivate(Guid id, CancellationToken ct)
        => await employees.SetActiveAsync(id, false, ct);

    [HttpPost("{id:guid}/activate")]
    [HasPermission(Permissions.AdminEmployees)]
    public async Task<ActionResult<EmployeeDto>> Activate(Guid id, CancellationToken ct)
        => await employees.SetActiveAsync(id, true, ct);

    [HttpPut("{id:guid}/role")]
    [HasPermission(Permissions.AdminRoles)]
    public async Task<ActionResult<EmployeeDto>> ChangeRole(Guid id, ChangeRoleRequest request, CancellationToken ct)
        => await employees.ChangeRoleAsync(id, request.Role, ct);

    [HttpPost("{id:guid}/reset-password")]
    [HasPermission(Permissions.AdminEmployees)]
    public async Task<IActionResult> ResetPassword(Guid id, ResetPasswordRequest request, CancellationToken ct)
    {
        await employees.ResetPasswordAsync(id, request.NewPassword, ct);
        return NoContent();
    }
}
