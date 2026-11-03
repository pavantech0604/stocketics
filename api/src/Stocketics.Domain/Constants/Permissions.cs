namespace Stocketics.Domain.Constants;

/// <summary>The 26 permission keys of the frontend <c>RolePermissionMatrix</c>.</summary>
public static class Permissions
{
    public const string LeadsViewOwn = "leads.view.own";
    public const string LeadsViewTeam = "leads.view.team";
    public const string LeadsViewAll = "leads.view.all";
    public const string LeadsEditOwn = "leads.edit.own";
    public const string LeadsEditTeam = "leads.edit.team";
    public const string LeadsEditAll = "leads.edit.all";
    public const string LeadsAssignTeam = "leads.assign.team";
    public const string LeadsAssignAll = "leads.assign.all";
    public const string LeadsReassignTeam = "leads.reassign.team";
    public const string LeadsReassignAll = "leads.reassign.all";
    public const string KycUpload = "kyc.upload";
    public const string KycSubmit = "kyc.submit";
    public const string KycReviewTeam = "kyc.review.team";
    public const string KycReviewAll = "kyc.review.all";
    public const string KycViewDocumentsTeam = "kyc.view.documents.team";
    public const string KycViewDocumentsAll = "kyc.view.documents.all";
    public const string TeamViewOwn = "team.view.own";
    public const string TeamCoaching = "team.coaching";
    public const string TeamStandup = "team.standup";
    public const string TeamTargets = "team.targets";
    public const string AdminEmployees = "admin.employees";
    public const string AdminPayroll = "admin.payroll";
    public const string AdminRoles = "admin.roles";
    public const string AdminSettings = "admin.settings";
    public const string ApproveProspects = "approve.prospects";
    public const string ApprovePayments = "approve.payments";

    public static readonly IReadOnlyList<string> All =
    [
        LeadsViewOwn, LeadsViewTeam, LeadsViewAll, LeadsEditOwn, LeadsEditTeam, LeadsEditAll,
        LeadsAssignTeam, LeadsAssignAll, LeadsReassignTeam, LeadsReassignAll,
        KycUpload, KycSubmit, KycReviewTeam, KycReviewAll, KycViewDocumentsTeam, KycViewDocumentsAll,
        TeamViewOwn, TeamCoaching, TeamStandup, TeamTargets,
        AdminEmployees, AdminPayroll, AdminRoles, AdminSettings,
        ApproveProspects, ApprovePayments,
    ];

    /// <summary>
    /// Default grants, copied from <c>ROLE_PERMISSION_MATRIX</c> in <c>src/types/index.ts</c>.
    /// Seeded once; after that the database copy (editable by users holding admin.roles) is authoritative.
    /// </summary>
    public static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> Defaults =
        new Dictionary<string, IReadOnlyList<string>>
        {
            [Roles.Admin] = All,
            [Roles.Manager] =
            [
                LeadsViewOwn, LeadsViewTeam, LeadsViewAll, LeadsEditOwn, LeadsEditTeam, LeadsEditAll,
                LeadsAssignTeam, LeadsAssignAll, LeadsReassignTeam, LeadsReassignAll,
                KycUpload, KycSubmit, KycReviewTeam, KycReviewAll, KycViewDocumentsTeam, KycViewDocumentsAll,
                TeamViewOwn, TeamCoaching, TeamStandup, TeamTargets, ApproveProspects, ApprovePayments,
            ],
            [Roles.TeamLeader] =
            [
                LeadsViewOwn, LeadsViewTeam, LeadsEditOwn, LeadsEditTeam, LeadsAssignTeam, LeadsReassignTeam,
                KycUpload, KycSubmit, KycReviewTeam, KycViewDocumentsTeam,
                TeamViewOwn, TeamCoaching, TeamStandup, TeamTargets,
            ],
            [Roles.Employee] = [LeadsViewOwn, LeadsEditOwn, KycUpload, KycSubmit],
            [Roles.Hr] =
            [
                LeadsViewAll, LeadsEditAll, LeadsAssignAll, LeadsReassignAll,
                AdminEmployees, AdminPayroll, AdminRoles, AdminSettings,
            ],
        };
}
