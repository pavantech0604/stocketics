using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    AppDbContext db,
    ICurrentUser current,
    IPermissionService permissions,
    IAuditService audit) : IAuthService
{
    /// <summary>Same message for unknown user, wrong password and inactive account, so the response never reveals which.</summary>
    private const string BadCredentials = "Invalid email or password.";

    public async Task<CurrentUserDto> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim();
        var user = await users.FindByEmailAsync(email);

        if (user is null || !user.IsActive)
        {
            // Burn roughly the same CPU as a real password check so response time doesn't reveal
            // whether the account exists.
            users.PasswordHasher.HashPassword(new ApplicationUser(), request.Password);
            await audit.RecordAndSaveAsync("auth.login.failed", "user", null,
                new { reason = user is null ? "unknown" : "inactive" }, actorEmail: email, ct: ct);
            throw new UnauthorizedAccessException(BadCredentials);
        }

        var result = await signIn.PasswordSignInAsync(user, request.Password, isPersistent: false, lockoutOnFailure: true);
        if (result.IsLockedOut)
        {
            await audit.RecordAndSaveAsync("auth.login.locked", "user", user.Id.ToString(), actorId: user.Id,
                actorEmail: user.Email, ct: ct);
            throw new AccountLockedException();
        }
        if (!result.Succeeded)
        {
            await audit.RecordAndSaveAsync("auth.login.failed", "user", user.Id.ToString(),
                new { reason = "bad_password" }, user.Id, user.Email, ct);
            throw new UnauthorizedAccessException(BadCredentials);
        }

        user.LastLoginAt = DateTimeOffset.UtcNow;
        await users.UpdateAsync(user);
        await audit.RecordAndSaveAsync("auth.login", "user", user.Id.ToString(), actorId: user.Id,
            actorEmail: user.Email, ct: ct);
        return await ToDtoAsync(user, ct);
    }

    public async Task LogoutAsync(CancellationToken ct = default)
    {
        if (current.IsAuthenticated)
            await audit.RecordAndSaveAsync("auth.logout", "user", current.UserId.ToString(), ct: ct);
        await signIn.SignOutAsync();
    }

    public async Task<CurrentUserDto> GetCurrentAsync(CancellationToken ct = default)
    {
        var user = await users.FindByIdAsync(current.UserId.ToString());
        if (user is null || !user.IsActive) throw new UnauthorizedAccessException();
        return await ToDtoAsync(user, ct);
    }

    public async Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await users.FindByIdAsync(current.UserId.ToString())
                   ?? throw new UnauthorizedAccessException();
        var result = await users.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            throw new ValidationFailedException("newPassword", string.Join(" ", result.Errors.Select(e => e.Description)));
        await audit.RecordAndSaveAsync("auth.password.changed", "user", user.Id.ToString(), ct: ct);
        await signIn.RefreshSignInAsync(user); // new security stamp → keep this session, drop others
    }

    private async Task<CurrentUserDto> ToDtoAsync(ApplicationUser user, CancellationToken ct)
    {
        var role = (await users.GetRolesAsync(user)).FirstOrDefault() ?? string.Empty;
        var employee = await db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.UserId == user.Id, ct);
        var perms = (await permissions.GetForRoleAsync(role, ct)).Order().ToList();
        return new CurrentUserDto(user.Id, user.Email!, user.FullName, role, employee?.Department, employee?.Title, perms);
    }
}

/// <summary>Raised when Identity lockout trips; the API maps it to 423 Locked.</summary>
public sealed class AccountLockedException()
    : AppException("Too many failed attempts. Try again in a few minutes.", 423);
