namespace Stocketics.Domain.Constants;

/// <summary>Role names match the frontend <c>UserRole</c> union exactly.</summary>
public static class Roles
{
    public const string Admin = "admin";
    public const string Hr = "hr";
    public const string Manager = "manager";
    public const string TeamLeader = "team_leader";
    public const string Employee = "employee";

    public static readonly IReadOnlyList<string> All = [Admin, Hr, Manager, TeamLeader, Employee];

    public static bool IsValid(string? role) => role is not null && All.Contains(role);
}
