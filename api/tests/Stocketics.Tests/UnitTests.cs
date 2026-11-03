using Stocketics.Application.Common;
using Stocketics.Domain.Constants;

namespace Stocketics.Tests;

public class NormalizerTests
{
    [Theory]
    [InlineData("9876543210", "9876543210")]
    [InlineData("+91 98765 43210", "9876543210")]
    [InlineData("919876543210", "9876543210")]
    [InlineData("09876543210", "9876543210")]
    [InlineData("98765-43210", "9876543210")]
    [InlineData("(+91) 6000000000", "6000000000")]
    public void Phone_accepts_and_normalises_indian_mobiles(string input, string expected)
        => Assert.Equal(expected, Normalizer.TryNormalizePhone(input));

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("12345")]
    [InlineData("5876543210")]   // must start 6-9
    [InlineData("98765432101")]  // 11 digits not starting with 0
    [InlineData("9.8765E+09")]   // Excel scientific notation
    [InlineData("abcdefghij")]
    public void Phone_rejects_invalid(string? input) => Assert.Null(Normalizer.TryNormalizePhone(input));

    [Theory]
    [InlineData("  Foo@Bar.COM ", "foo@bar.com")]
    [InlineData("a@b.co", "a@b.co")]
    public void Email_trims_and_lowercases(string input, string expected)
        => Assert.Equal(expected, Normalizer.TryNormalizeEmail(input));

    [Theory]
    [InlineData("nope")]
    [InlineData("a@b")]
    [InlineData("a b@c.com")]
    [InlineData("")]
    public void Email_rejects_invalid_when_required(string input) => Assert.Null(Normalizer.TryNormalizeEmail(input));

    [Fact]
    public void Email_optional_allows_empty() => Assert.Equal(string.Empty, Normalizer.TryNormalizeEmail("  ", required: false));
}

public class PermissionDefaultsTests
{
    [Fact]
    public void Catalogue_has_the_26_frontend_keys_without_duplicates()
    {
        Assert.Equal(26, Permissions.All.Count);
        Assert.Equal(26, Permissions.All.Distinct().Count());
    }

    // Counts and exact sets were extracted programmatically from ROLE_PERMISSION_MATRIX in src/types/index.ts.
    [Theory]
    [InlineData(Roles.Admin, 26)]
    [InlineData(Roles.Manager, 22)]
    [InlineData(Roles.TeamLeader, 14)]
    [InlineData(Roles.Hr, 8)]
    [InlineData(Roles.Employee, 4)]
    public void Defaults_match_the_frontend_matrix(string role, int expectedCount)
    {
        var grants = Permissions.Defaults[role];
        Assert.Equal(expectedCount, grants.Count);
        Assert.Equal(grants.Count, grants.Distinct().Count());
        Assert.All(grants, g => Assert.Contains(g, Permissions.All));
    }

    [Fact]
    public void Every_role_has_defaults() => Assert.All(Roles.All, r => Assert.True(Permissions.Defaults.ContainsKey(r)));

    [Fact]
    public void Employee_cannot_see_team_or_all_leads()
    {
        var emp = Permissions.Defaults[Roles.Employee];
        Assert.DoesNotContain(Permissions.LeadsViewTeam, emp);
        Assert.DoesNotContain(Permissions.LeadsViewAll, emp);
        Assert.DoesNotContain(Permissions.AdminEmployees, emp);
    }

    [Fact]
    public void Hr_manages_people_but_not_approvals()
    {
        var hr = Permissions.Defaults[Roles.Hr];
        Assert.Contains(Permissions.AdminEmployees, hr);
        Assert.Contains(Permissions.AdminRoles, hr);
        Assert.DoesNotContain(Permissions.ApprovePayments, hr);
    }
}
