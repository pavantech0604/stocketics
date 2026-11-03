namespace Stocketics.Domain.Constants;

/// <summary>
/// Lead statuses are the ones enforced by backend/pb_hooks/crm.js. The legacy portal uses a different
/// vocabulary (New Lead / Trial Active ...); mapping the two is a pending decision, see README.
/// </summary>
public static class LeadStatuses
{
    public const string New = "New";
    public const string InContact = "In Contact";
    public const string Qualified = "Qualified";
    public const string Lost = "Lost";
    public const string Converted = "Converted";

    /// <summary>Statuses a user may set directly. Converted is only reachable through conversion.</summary>
    public static readonly IReadOnlyList<string> Settable = [New, InContact, Qualified, Lost];
}

public static class LeadPriorities
{
    public static readonly IReadOnlyList<string> All = ["High", "Normal", "Low"];
}

public static class ActivityTypes
{
    public const string Created = "Created";
    public const string Call = "Call";
    public const string Correction = "Correction";
    public const string Status = "Status";
    public const string Edit = "Edit";
    public const string Assignment = "Assignment";
    public const string Archive = "archive";
    public const string Restore = "restore";
    public const string Conversion = "Conversion";
    public const string Dnd = "DND";
}

public static class RequestStatuses
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string SeenByTeamLeader = "Seen by Team Leader";
    public const string UnderReview = "Under Review";
    public const string Approved = "Approved";
    public const string PartiallyApproved = "Partially Approved";
    public const string Rejected = "Rejected";
    public const string Cancelled = "Cancelled";
    public const string Expired = "Expired";
    public const string Fulfilled = "Fulfilled";

    /// <summary>Terminal: no further review or allocation.</summary>
    public static readonly IReadOnlyList<string> Closed = [Rejected, Cancelled, Expired, Fulfilled];

    /// <summary>Statuses a reviewer may move a request to.</summary>
    public static readonly IReadOnlyList<string> Reviewable =
        [Submitted, SeenByTeamLeader, UnderReview, Approved, PartiallyApproved, Rejected, Cancelled, Expired];
}

public static class ClientStatuses
{
    public const string Active = "Active";
    public const string Hold = "Hold";
    public const string Expired = "Expired";

    public static readonly IReadOnlyList<string> All = [Active, Hold, Expired];
}

public static class SubscriptionStatuses
{
    public static readonly IReadOnlyList<string> All = ["Active", "Hold", "Expired", "Suspended"];
}

public static class TrialStatuses
{
    public static readonly IReadOnlyList<string> All = ["Active", "Approved", "Expired", "Pending"];
}

/// <summary>Defaults from crm.js <c>defaultSettings</c>.</summary>
public static class CrmDefaults
{
    public const int MaxRequest = 100;

    public static readonly IReadOnlyList<string> States =
    [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
        "Chandigarh", "Puducherry", "Andaman and Nicobar Islands", "Lakshadweep",
        "Dadra and Nagar Haveli and Daman and Diu",
    ];

    public static readonly IReadOnlyList<string> Sources = ["Website", "Referral", "Campaign", "Other"];
}
