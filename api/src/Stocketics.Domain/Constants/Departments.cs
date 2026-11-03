namespace Stocketics.Domain.Constants;

public static class Departments
{
    public static readonly IReadOnlyList<string> All =
        ["HR", "IT", "Equity Research", "Advisory Sales", "Operations", "Finance"];
}

public static class EmployeeStatuses
{
    public const string Active = "Active";
    public const string OnLeave = "On Leave";
    public const string Remote = "Remote";
    public const string Probation = "Probation";
    public const string Inactive = "Inactive";

    public static readonly IReadOnlyList<string> All = [Active, OnLeave, Remote, Probation, Inactive];
}
