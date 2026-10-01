# CRM QA cases and results

## Lead response and Closed Own update — 29 September

- Removed Onboard from the All Leads action column. It appears in Closed Own for eligible records; existing KYC cases retain their review/reupload action labels.
- Closed Own includes normalized Closed Own/Closed Won responses, Converted responses and records already carrying Converted status. Saving a closure response opens that filter and clears conflicting search filters. This disposition does not fabricate a payment or client record.
- Added prior client responses above a blank new-description field. New entries preserve the original description as an earlier record when structured history was absent. Actor/date are shown when recorded; missing authors are explicitly labeled.
- Replaced fixed September dates in the pipeline and employee follow-up count. Due-today and overdue callbacks remain visible; closed/lost leads are excluded. Employee reminders check every 30 seconds while the app is open, with a 15-minute snooze and an Open response action. No email, SMS or operating-system background delivery is claimed.
- Unified response/onboarding dialog styling and added the missing shared KYC stepper layout. Document cards adapt to narrow screens. Onboarding does not reopen Closed Own as Interested.
- Validation: 34 legacy workflow assertions, full TypeScript check and Vite production build passed. Existing large-bundle warning remains.
- Browser verified with the existing local employee preview: due reminder appears, opens the correct response dialog, prior notes appear above an empty new-description field, converted lead appears in Closed Own with Onboard, All Leads exposes zero Onboard buttons, and onboarding renders with horizontal progress steps and document cards. No business response or KYC upload was submitted during these browser checks.
- Screenshot: `.crm-test/onboarding-preview.png`. Existing legacy portal persistence limitations remain as described in the implementation report.

29 September 2026. Automated API cases below passed against the bundled PocketBase 0.25.9 in an isolated database. They do not certify the separate legacy portal or production deployment. Each automated run writes `.crm-test/latest-results.json` (ignored by Git).

## Automated backend cases

Common precondition: fresh test database with two Managers, two Leaders, mapped Employees, one unavailable Employee and an Admin. All records and files are synthetic local fixtures.

| ID | Module | Role | Additional precondition | Steps | Expected result | Priority |
|---|---|---|---|---|---|---|
| API-01 | Authentication | Anonymous/Employee | None | Read state anonymously; read legacy collection; write workflow collection directly | All denied | P0 |
| API-02 | Leads | Manager/Employee | None | Create lead; retry normalized duplicate phone; attempt Employee creation | Manager creates one; duplicate and unauthorized create denied | P0 |
| API-03 | Assignment | Manager/Leader | Unassigned lead | Assign to foreign Leader, then mapped Leader; read scopes | Foreign assignment denied; mapped team sees lead; unrelated team does not | P0 |
| API-04 | Assignment | Leader | Lead in team pool | Assign outsider and unavailable Employee; assign active member | Invalid recipients denied; active member receives lead | P0 |
| API-05 | Calls | Employee | Owned lead | Reject past callback; log one-week callback; append correction | Original response unchanged; correction linked; task created | P0 |
| API-06 | Reassignment | Leader/Employees | Open task | Reassign with reason; read both Employees; replay old version | New owner gets task; old owner loses access; stale write denied | P0 |
| API-07 | KYC | Employee/Manager | Owned lead | Submit incomplete; save profile; upload PAN/Aadhaar; submit; attempt Employee approval | Required documents enforced; Employee cannot approve | P0 |
| API-08 | Files | Employee/outsider | Uploaded documents | Download through custom route; attempt outsider and direct API access | Authorized file bytes available; other access denied | P0 |
| API-09 | Conversion | Employee | Assigned lead with response | Qualify; convert; attempt second conversion; inspect links | One client; history/documents retained | P0 |
| API-10 | Requests | Employee/Leader | Mapped requester | Request leads; partially approve without/with comments; allocate linked records | Comments enforced; exact real allocation fulfills request | P0 |
| API-11 | Import | Manager | Existing duplicate | Import valid, duplicate and invalid rows | Counts and row errors stored correctly; valid rows persist | P1 |
| API-12 | Settings | Admin/Employee | None | Employee settings attempt; Admin changes maximum | Employee denied; shared setting saved | P0 |
| API-13 | KYC versions | Employee/Manager | Existing KYC files | Reupload PAN; submit; reject without/with reason; resubmit unchanged | Versions retained; reason required; unchanged resubmission denied | P0 |
| API-14 | Concurrency | Leader | Team-pool lead | Send two assignments with same version | Exactly one succeeds and one final owner remains | P0 |
| API-15 | Bulk rollback | Manager | One valid and one stale target | Assign both together | Entire command rolls back; valid row stays unchanged | P0 |
| API-16 | Overrides | Manager | Unassigned lead | Direct Employee allocation without/with reason | Reason required; lead count unchanged | P0 |
| API-17 | Follow-up completion | Employee | Open task | Complete without response; complete with response/next date | Empty denied; completed task retained; next task open | P0 |
| API-18 | KYC form | Employee | Rejected KYC | Upload separate KYC Form and resubmit | Form persists; existing PAN versions remain; new submission accepted | P1 |
| API-19 | Contact edits | Employee/outsider | Converted lead/client | Edit contact; inspect client/timeline; attempt outsider edit | Client synchronized; previous values retained; outsider denied | P0 |
| API-20 | Availability | Inactive user | Valid existing token | Block user; use old token | Access denied immediately | P0 |

`scripts/test-legacy-workflow.mjs` additionally passes 15 assertions for real pool quantities, valid mapping and availability, ownership, required responses/future callback formats, and mandatory PAN plus Aadhaar. These test pure compatibility helpers; they do not convert the original browser portal into a secure backend application.

## Browser and rollout checklist

| ID | Module | Role | Preconditions | Steps | Expected result | Priority | Status |
|---|---|---|---|---|---|---|---|
| UI-01 | Login/dashboard | Admin | Isolated preview | Sign in; inspect cards and totals | Authenticated dashboard, fixture counts | P0 | Passed |
| UI-02 | Dashboard/list | Admin | Five preview leads | Open Explore leads | Five rows and corresponding ownership/status | P1 | Passed |
| UI-03 | Lead/KYC detail | Admin | Converted fixture | Open detail and Documents/KYC | Profile, PAN/Aadhaar versions and review status visible | P1 | Passed in earlier browser session |
| UI-04 | Responsive layout | Admin | 390×844 viewport | Inspect dashboard and new-lead modal | Cards stack; form readable and scrollable; close works | P1 | Passed |
| UI-05 | Employee navigation | Employee | Isolated preview account | Sign in; check nav and owned records | No manager/configuration actions; own records only | P0 | Browser interrupted; API scope passed |
| UI-06 | Form recovery | All | Staging | Enter invalid data; interrupt network; retry save | Clear error; values retained; no duplicate write | P0 | Manual staging required |
| UI-07 | Keyboard | All | Desktop | Tab/Shift-Tab through modal; Escape; unsaved close | Focus contained/returned; dirty values require discard confirmation | P1 | Implemented; full manual regression pending |
| UI-08 | KYC file controls | Employee | All four document categories | Upload/download PDF and image; reupload; reject/approve | Correct bytes, versions and review transitions visible | P0 | API passed; full browser matrix pending |
| OPS-01 | Reminders | All | Overdue open task | Allow scheduled job twice; reassign task | One durable reminder per task; current scope respected | P1 | Staging timing check pending |
| OPS-02 | Large datasets | Manager/Admin | Representative legacy volume | Load scoped data near guard; measure queries | No misleading counts; documented guard; pagination required beyond limit | P0 | Not load-tested |
| OPS-03 | Migration | Admin | Restored backup and reviewed mappings | Import; compare IDs/counts/history/documents/owners | No data loss or unauthorized exposure | P0 | Not run on original data |
| OPS-04 | Existing modules | HR/Manager/Employee | Original portal | Exercise attendance, payroll, billing and notifications | No regressions in existing workflows | P0 | Comprehensive regression pending |
| OPS-05 | Deployment | Admin | HTTPS staging | Test auth limits, backups/restore, file access and proxy settings | Organization deployment requirements satisfied | P0 | Deployment pending |

## Commands

```powershell
node scripts/test-crm.mjs
node scripts/test-legacy-workflow.mjs
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
```

Verification: 20 backend scenarios and 15 compatibility assertions pass. Full TypeScript and production build pass. Focused correctness lint passes with one fast-refresh warning for the shared UI/date helper. Vite's large-bundle warning remains. Repository-wide whitespace checking reports pre-existing/concurrent formatting issues outside the new workflow files; no claim of a clean repository-wide lint or formatting run is made.

## Latest KPI and lead layout follow-up
- Shared KPI backgrounds now use the nine colors sampled from the supplied CRM screenshot; five darker variants were replaced.
- Closed Own naming, stage selection, unified Onboard styling and compact filters retained.
- Narrow lead panels now use labeled cards; contact metadata stacks and action buttons wrap without clipping.
- 34 compatibility assertions and TypeScript/production build passed. Browser re-verification of the latest layout was blocked by preview navigation timeouts; mobile visual validation remains pending. Existing bundle-size warning remains.

