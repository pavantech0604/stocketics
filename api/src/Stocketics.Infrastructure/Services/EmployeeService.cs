using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Stocketics.Application.Abstractions;
using Stocketics.Application.Common;
using Stocketics.Application.Dtos;
using Stocketics.Domain.Constants;
using Stocketics.Domain.Entities;
using Stocketics.Infrastructure.Persistence;

namespace Stocketics.Infrastructure.Services;

public sealed class EmployeeService(
    AppDbContext db,
    UserManager<ApplicationUser> users,
    ICurrentUser current,
    IPermissionService permissions,
    IAuditService audit) : IEmployeeService
{
    // ── reads ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Data scoping: holders of admin.employees see everyone; everyone else sees themselves and their
    /// direct reports. (Team-based scoping is added with the Teams slice.)
    /// </summary>
    private async Task<IQueryable<Employee>> ScopedAsync(CancellationToken ct)
    {
        if (await HasAsync(Permissions.AdminEmployees, ct)) return db.Employees.AsNoTracking();
        var me = current.UserId;
        return db.Employees.AsNoTracking().Where(e => e.Id == me || e.ManagerId == me);
    }

    private IQueryable<Row> Project(IQueryable<Employee> source) =>
        from e in source
        join u in db.Users on e.UserId equals u.Id
        join ur in db.UserRoles on u.Id equals ur.UserId
        join r in db.Roles on ur.RoleId equals r.Id
        select new Row { E = e, IsActive = u.IsActive, Role = r.Name! };

    public async Task<PagedResult<EmployeeDto>> ListAsync(EmployeeQuery q, CancellationToken ct = default)
    {
        var page = Math.Max(1, q.Page);
        var size = Math.Clamp(q.PageSize, 1, 100);
        var rows = Project(await ScopedAsync(ct));

        if (!string.IsNullOrWhiteSpace(q.Q))
        {
            var term = q.Q.Trim().ToLowerInvariant();
            rows = rows.Where(x => x.E.Name.ToLower().Contains(term) || x.E.Email.Contains(term)
                                   || x.E.Title.ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(q.Role)) rows = rows.Where(x => x.Role == q.Role);
        if (!string.IsNullOrWhiteSpace(q.Department)) rows = rows.Where(x => x.E.Department == q.Department);
        if (!string.IsNullOrWhiteSpace(q.Status)) rows = rows.Where(x => x.E.Status == q.Status);
        if (q.Active is { } active) rows = rows.Where(x => x.IsActive == active);

        var total = await rows.CountAsync(ct);
        var items = await rows.OrderBy(x => x.E.Name).ThenBy(x => x.E.Id)
            .Skip((page - 1) * size).Take(size).ToListAsync(ct);

        var showSalary = await HasAsync(Permissions.AdminPayroll, ct);
        return new PagedResult<EmployeeDto>(items.Select(x => ToDto(x, showSalary)).ToList(), total, page, size);
    }

    public async Task<EmployeeDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var row = await Project((await ScopedAsync(ct)).Where(e => e.Id == id)).FirstOrDefaultAsync(ct);
        if (row is null)
        {
            // Distinguish "does not exist" from "exists but outside your scope" only for the caller's benefit
            // of a correct status code; neither reveals any data.
            if (await db.Employees.AnyAsync(e => e.Id == id, ct)) throw new ForbiddenException();
            throw new NotFoundException("Employee not found.");
        }
        return ToDto(row, await HasAsync(Permissions.AdminPayroll, ct));
    }

    // ── writes ──────────────────────────────────────────────────────────────

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeRequest r, CancellationToken ct = default)
    {
        await RequireAsync(Permissions.AdminEmployees, ct);
        var email = Normalizer.TryNormalizeEmail(r.Email)
                    ?? throw new ValidationFailedException("email", "Enter a valid email address.");
        var phone = NormalizePhone(r.Phone);
        ValidateCommon(r.Department, r.Status ?? EmployeeStatuses.Active);
        RequireRoleAssignable(r.Role);
        if (await users.FindByEmailAsync(email) is not null || await db.Employees.IgnoreQueryFilters().AnyAsync(e => e.Email == email, ct))
            throw new ConflictException("An account with this email already exists.");
        if (r.ManagerId is { } mgr) await ValidateManagerAsync(null, mgr, ct);

        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(), UserName = email, Email = email, FullName = r.Name.Trim(),
            IsActive = true, CreatedAt = DateTimeOffset.UtcNow,
        };
        var created = await users.CreateAsync(user, r.Password);
        if (!created.Succeeded) throw ToValidation("password", created);
        var added = await users.AddToRoleAsync(user, r.Role);
        if (!added.Succeeded) throw ToValidation("role", added);

        var employee = new Employee
        {
            Id = user.Id, UserId = user.Id, Name = r.Name.Trim(), Email = email, Phone = phone,
            Department = r.Department, Title = r.Title?.Trim() ?? string.Empty,
            Status = r.Status ?? EmployeeStatuses.Active, JoinDate = r.JoinDate, DateOfBirth = r.DateOfBirth,
            Salary = r.Salary ?? 0, ManagerId = r.ManagerId,
        };
        db.Employees.Add(employee);
        audit.Record("employee.created", "employee", employee.Id.ToString(), new { email, role = r.Role });
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return await GetAsync(employee.Id, ct);
    }

    public async Task<EmployeeDto> UpdateAsync(Guid id, UpdateEmployeeRequest r, CancellationToken ct = default)
    {
        await RequireAsync(Permissions.AdminEmployees, ct);
        ValidateCommon(r.Department, r.Status);
        var phone = NormalizePhone(r.Phone);

        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct)
                       ?? throw new NotFoundException("Employee not found.");
        await RequireNotAdminTargetUnlessAdminAsync(employee, ct);
        if (r.ManagerId is { } mgr) await ValidateManagerAsync(id, mgr, ct);
        if (employee.Version != r.Version)
            throw new ConflictException("This record was changed by someone else. Refresh and try again.");

        // Compare against the version the client last saw. EF puts this in the UPDATE's WHERE clause,
        // so a concurrent edit makes the save fail with DbUpdateConcurrencyException (→ 409).
        db.Entry(employee).Property(e => e.Version).OriginalValue = r.Version!.Value;

        var user = await db.Users.FirstAsync(u => u.Id == employee.UserId, ct);
        var showSalary = await HasAsync(Permissions.AdminPayroll, ct);

        employee.Name = r.Name.Trim();
        user.FullName = employee.Name;
        employee.Phone = phone;
        employee.Department = r.Department;
        employee.Title = r.Title?.Trim() ?? string.Empty;
        employee.Status = r.Status;
        employee.JoinDate = r.JoinDate;
        employee.DateOfBirth = r.DateOfBirth;
        employee.ManagerId = r.ManagerId;
        // Salary is payroll data: only callers with admin.payroll may change it.
        if (showSalary && r.Salary is { } salary) employee.Salary = salary;

        audit.Record("employee.updated", "employee", id.ToString(), new { r.Department, r.Status, r.ManagerId });
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("This record was changed by someone else. Refresh and try again.");
        }
        return await GetAsync(id, ct);
    }

    public async Task<EmployeeDto> SetActiveAsync(Guid id, bool active, CancellationToken ct = default)
    {
        await RequireAsync(Permissions.AdminEmployees, ct);
        if (!active && id == current.UserId)
            throw new ValidationFailedException("id", "You cannot deactivate your own account.");

        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct)
                       ?? throw new NotFoundException("Employee not found.");
        await RequireNotAdminTargetUnlessAdminAsync(employee, ct);
        var user = await users.FindByIdAsync(id.ToString()) ?? throw new NotFoundException("User not found.");

        if (!active && await IsLastActiveAdminAsync(user, ct))
            throw new ConflictException("This is the last active administrator and cannot be deactivated.");

        user.IsActive = active;
        employee.Status = active ? EmployeeStatuses.Active : EmployeeStatuses.Inactive;
        // Rotating the security stamp invalidates the target's existing cookie sessions immediately.
        await users.UpdateSecurityStampAsync(user);
        audit.Record(active ? "employee.activated" : "employee.deactivated", "employee", id.ToString());
        await db.SaveChangesAsync(ct);
        return await GetAsync(id, ct);
    }

    public async Task<EmployeeDto> ChangeRoleAsync(Guid id, string role, CancellationToken ct = default)
    {
        await RequireAsync(Permissions.AdminRoles, ct);
        if (id == current.UserId) throw new ValidationFailedException("id", "You cannot change your own role.");
        RequireRoleAssignable(role);

        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct)
                       ?? throw new NotFoundException("Employee not found.");
        await RequireNotAdminTargetUnlessAdminAsync(employee, ct);
        var user = await users.FindByIdAsync(id.ToString()) ?? throw new NotFoundException("User not found.");

        var oldRoles = await users.GetRolesAsync(user);
        if (oldRoles.Contains(Roles.Admin) && role != Roles.Admin && await IsLastActiveAdminAsync(user, ct))
            throw new ConflictException("This is the last active administrator and cannot be demoted.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var removed = await users.RemoveFromRolesAsync(user, oldRoles);
        if (!removed.Succeeded) throw ToValidation("role", removed);
        var added = await users.AddToRoleAsync(user, role);
        if (!added.Succeeded) throw ToValidation("role", added);
        await users.UpdateSecurityStampAsync(user); // forces re-evaluation of the role claim
        audit.Record("employee.role.changed", "employee", id.ToString(), new { from = oldRoles, to = role });
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return await GetAsync(id, ct);
    }

    public async Task ResetPasswordAsync(Guid id, string newPassword, CancellationToken ct = default)
    {
        await RequireAsync(Permissions.AdminEmployees, ct);
        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct)
                       ?? throw new NotFoundException("Employee not found.");
        await RequireNotAdminTargetUnlessAdminAsync(employee, ct);
        var user = await users.FindByIdAsync(id.ToString()) ?? throw new NotFoundException("User not found.");

        var token = await users.GeneratePasswordResetTokenAsync(user);
        var result = await users.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded) throw ToValidation("newPassword", result);
        await users.ResetAccessFailedCountAsync(user);
        await users.SetLockoutEndDateAsync(user, null);
        await audit.RecordAndSaveAsync("employee.password.reset", "employee", id.ToString(), ct: ct);
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    // A class with member-initialisers (not a positional record): EF Core can translate later
    // Where/OrderBy over its members, but not over a constructor call.
    private sealed class Row
    {
        public Employee E { get; init; } = null!;
        public bool IsActive { get; init; }
        public string Role { get; init; } = string.Empty;
    }

    private static EmployeeDto ToDto(Row x, bool showSalary) => new(
        x.E.Id, x.E.Name, x.E.Email, x.E.Phone, x.Role, x.E.Department, x.E.Title, x.E.Status, x.IsActive,
        x.E.JoinDate, x.E.DateOfBirth, x.E.ManagerId,
        new LeaveBalanceDto(x.E.LeavePaid, x.E.LeaveSick, x.E.LeaveComp),
        showSalary ? x.E.Salary : null, x.E.Version);

    private async Task<bool> HasAsync(string permission, CancellationToken ct)
        => current.Role is { } role && await permissions.HasAsync(role, permission, ct);

    private async Task RequireAsync(string permission, CancellationToken ct)
    {
        if (!await HasAsync(permission, ct)) throw new ForbiddenException();
    }

    /// <summary>
    /// Privilege-escalation guard: only an admin may create, modify, deactivate or reset an admin account,
    /// or grant the admin role. HR holds admin.employees/admin.roles but must not be able to mint admins.
    /// </summary>
    private void RequireRoleAssignable(string role)
    {
        if (!Roles.IsValid(role)) throw new ValidationFailedException("role", $"Role must be one of: {string.Join(", ", Roles.All)}.");
        if (role == Roles.Admin && current.Role != Roles.Admin)
            throw new ForbiddenException("Only an administrator can assign the admin role.");
    }

    private async Task RequireNotAdminTargetUnlessAdminAsync(Employee target, CancellationToken ct)
    {
        if (current.Role == Roles.Admin) return;
        var roles = await db.UserRoles.Where(ur => ur.UserId == target.UserId)
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.Name).ToListAsync(ct);
        if (roles.Contains(Roles.Admin)) throw new ForbiddenException("Only an administrator can modify an admin account.");
    }

    private async Task<bool> IsLastActiveAdminAsync(ApplicationUser user, CancellationToken ct)
    {
        var admins = await (from u in db.Users
                            join ur in db.UserRoles on u.Id equals ur.UserId
                            join r in db.Roles on ur.RoleId equals r.Id
                            where r.Name == Roles.Admin && u.IsActive
                            select u.Id).ToListAsync(ct);
        return admins.Count == 1 && admins[0] == user.Id;
    }

    private static string NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        return Normalizer.TryNormalizePhone(phone)
               ?? throw new ValidationFailedException("phone", "Enter a valid 10-digit Indian mobile number.");
    }

    private static void ValidateCommon(string department, string status)
    {
        var errors = new Dictionary<string, string[]>();
        if (!Departments.All.Contains(department))
            errors["department"] = [$"Department must be one of: {string.Join(", ", Departments.All)}."];
        if (!EmployeeStatuses.All.Contains(status))
            errors["status"] = [$"Status must be one of: {string.Join(", ", EmployeeStatuses.All)}."];
        if (errors.Count > 0) throw new ValidationFailedException(errors);
    }

    /// <summary>Manager must be an active employee, and the reporting chain must not loop back to the employee.</summary>
    private async Task ValidateManagerAsync(Guid? employeeId, Guid managerId, CancellationToken ct)
    {
        if (employeeId == managerId) throw new ValidationFailedException("managerId", "An employee cannot report to themselves.");
        var mgr = await (from e in db.Employees.AsNoTracking()
                         join u in db.Users on e.UserId equals u.Id
                         where e.Id == managerId
                         select new { u.IsActive }).FirstOrDefaultAsync(ct);
        if (mgr is null || !mgr.IsActive)
            throw new ValidationFailedException("managerId", "Manager must be an existing, active employee.");

        if (employeeId is null) return;
        var cursor = (Guid?)managerId;
        for (var hops = 0; cursor is not null && hops < 50; hops++)
        {
            if (cursor == employeeId) throw new ValidationFailedException("managerId", "This would create a circular reporting chain.");
            var id = cursor;
            cursor = await db.Employees.AsNoTracking().Where(e => e.Id == id).Select(e => e.ManagerId).FirstOrDefaultAsync(ct);
        }
    }

    private static ValidationFailedException ToValidation(string field, IdentityResult result)
        => new(field, string.Join(" ", result.Errors.Select(e => e.Description)));
}
