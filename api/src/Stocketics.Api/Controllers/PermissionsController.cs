using Microsoft.AspNetCore.Mvc;
using Stocketics.Api.Security;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;

namespace Stocketics.Api.Controllers;

[ApiController]
[Route("api/v1/permissions")]
[HasPermission(Permissions.AdminRoles)]
public class PermissionsController(IPermissionService permissions) : ControllerBase
{
    /// <summary>The full role → permission matrix, plus the catalogue of valid permission keys.</summary>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(new { roles = await permissions.GetMatrixAsync(ct), catalogue = Permissions.All });

    [HttpPut("{role}")]
    public async Task<IActionResult> Set(string role, SetPermissionsRequest request, CancellationToken ct)
    {
        await permissions.SetForRoleAsync(role, request.Permissions, ct);
        return NoContent();
    }
}
