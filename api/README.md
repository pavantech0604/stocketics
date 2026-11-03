# Stocketics API (ASP.NET Core 10 + PostgreSQL)

Backend for the Stocketics CRM, replacing PocketBase, built in the slices from `../ARCHITECTURE_PROPOSAL.md`:

- **Slice 1, Foundation:** authentication, roles/permissions, employee/user admin, audit log, error handling.
- **Slice 2, Leads and clients:** leads, assignment, responses and follow-ups, lead requests, DND, clients,
  bulk import (from parsed rows), CRM settings, notifications. The business rules are ported from
  `backend/pb_hooks/crm.js`.

KYC, payments, HR, teams, market data and reports arrive in later slices.

## Layout

```
api/
  src/Stocketics.Domain          entities + constants (roles, 26 permissions); no dependencies
  src/Stocketics.Application     DTOs, service interfaces, exceptions, phone/email normalisation
  src/Stocketics.Infrastructure  EF Core DbContext, migrations, Identity, service implementations, seeding
  src/Stocketics.Api             controllers, auth/CSRF/rate-limit/error middleware, Program.cs
  tests/Stocketics.Tests         148 tests (unit + integration against the real API)
```

## Run it without PostgreSQL (development)

Development uses SQLite so nothing needs installing but the .NET 10 SDK. The schema is created
automatically on first start.

```powershell
cd api/src/Stocketics.Api
$env:Seed__AdminEmail    = "you@yourcompany.example"
$env:Seed__AdminPassword = "Choose-A-Strong-One-1"      # >=10 chars, upper + lower + digit
dotnet run                                              # http://localhost:5073
```

The first administrator is created **only if the database has no users and both values are supplied**.
There is deliberately no default password. Then, from the repo root, `npm run dev` starts the frontend, which
proxies `/api` to `localhost:5073` (override with `VITE_API_PROXY_TARGET`).

## Run it with PostgreSQL

```powershell
cd api
copy .env.example .env      # edit the passwords
docker compose up --build   # Postgres 17 + API on http://127.0.0.1:5073
```

> The compose file and Dockerfile have **not been executed yet** (no Docker on the authoring machine).
> Without Docker, point at any Postgres:
> `ConnectionStrings__Default="Host=...;Database=stocketics;Username=...;Password=..."` and leave
> `Database__Provider` as `Postgres` (the default). Migrations apply automatically at startup
> (`Database__AutoMigrate=false` to turn that off).

## Configuration

| Key (env var form `A__B`) | Default | Notes |
| --- | --- | --- |
| `Database:Provider` | `Postgres` | `Sqlite` in `appsettings.Development.json` |
| `ConnectionStrings:Default` | none (required) | App refuses to start without it |
| `Database:AutoMigrate` | `true` | Postgres only |
| `Auth:RequireHttpsCookies` | `true` | Only set `false` for plain-http localhost |
| `Auth:SessionHours` | `8` | Sliding expiry |
| `RateLimit:LoginPerMinute` | `10` | Per client IP, on top of per-account lockout |
| `Seed:AdminEmail` / `Seed:AdminPassword` / `Seed:AdminName` | none | First run on an empty DB only |

Never commit real values. `api/.env` is git-ignored; use environment variables or user-secrets.

## Authentication & CSRF (what the frontend must do)

Cookie session, HttpOnly + SameSite=Lax, no tokens in JavaScript. Every POST/PUT/DELETE also needs a CSRF
header, or the API answers 400:

1. `GET /api/v1/auth/csrf` → `{ token }`
2. send it as `X-CSRF-TOKEN` on each mutating call
3. **fetch a fresh token after login and after logout** (tokens are bound to the identity)

`src/api/client.ts` in the frontend already does all of this. Failed logins return an identical 401 whether the
account exists or not; 5 bad passwords lock the account for 15 minutes (423).

## Endpoints (`/api/v1`)

| Method & path | Needs | Purpose |
| --- | --- | --- |
| `GET /auth/csrf`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password` | login (csrf/login anonymous) | Session; `me` returns role + effective permissions |
| `GET /employees` (`q, role, department, status, active, page, pageSize`) | login | `admin.employees` sees all; others see self + direct reports |
| `GET /employees/{id}` | login (scoped) | 403 if outside your scope |
| `POST /employees`, `PUT /employees/{id}` | `admin.employees` | Create user+employee / update (requires `version`) |
| `POST /employees/{id}/deactivate` · `/activate` | `admin.employees` | Deactivation kills live sessions immediately |
| `PUT /employees/{id}/role` | `admin.roles` | Role change forces re-login |
| `POST /employees/{id}/reset-password` | `admin.employees` | Clears lockout |
| `GET /permissions`, `PUT /permissions/{role}` | `admin.roles` | Role → permission matrix (DB-backed, editable) |
| `GET /health` | anonymous | DB connectivity |

Errors are RFC 9457 ProblemDetails; validation errors carry `errors: { field: [messages] }`. Salary is returned
only to callers with `admin.payroll`.

### CRM endpoints (slice 2)

| Method & path | Rule of thumb |
| --- | --- |
| `GET /leads` (`q, status, state, source, priority, ownerId, teamLeaderId, unassigned, archived, dueFrom, dueTo, page, pageSize`) | Scoped by `leads.view.*`; archived hidden unless `archived=true` |
| `GET /leads/{id}` | Lead + timeline + follow-ups + assignment history + client id; 403 outside your scope |
| `POST /leads` | `leads.edit.all` (managers, admin, HR). Rejects duplicate phone/email across leads **and** clients |
| `PUT /leads/{id}` | Needs `version`; cascades contact changes to the lead's client |
| `POST /leads/assign` | Manager/admin/HR to a team leader or employee; team leader to their employees. Reason required for reassignments and direct-to-employee. Optional `requestId` fulfils an approved request |
| `POST /leads/{id}/responses` | Record a call; optional `nextDue` (future only, needs an owner), `followUpId` to complete one, `correctsActivityId` to correct an earlier entry |
| `POST /leads/{id}/status` · `/archive` · `/restore` · `/convert` | Qualifying needs an owner and a recorded call; Lost needs a reason; convert needs Qualified and creates the client |
| `POST /leads/import`, `GET /leads/imports[/{id}]` | 1 to 1000 parsed rows; every row gets Created/Duplicate/Failed with a reason; one transaction |
| `GET/POST /lead-requests`, `POST /lead-requests/{id}/review` | Employee asks the team leader for N leads in a state; review lifecycle; drafts are private |
| `GET /clients[/{id}]`, `POST /clients/{id}/status\|notes\|subscriptions\|trials` | Clients come from conversion; same scoping as leads |
| `GET/POST /dnd`, `DELETE /dnd/{id}` | Do-Not-Disturb list; flags leads and clients by phone; only `leads.edit.all` can lift it |
| `GET/PUT /settings/crm` | Read by anyone; PUT needs `admin.settings`. Sources can be added, never removed |
| `GET /notifications`, `POST /notifications/{id}/read` | Your own only |

**Visibility** follows the permission matrix: `leads.view.all` sees everything, `.team` sees leads where you are
the owner, team leader or manager, `.own` only your own. Employee, team leader and manager are linked through
`Employee.ManagerId` (employee's manager is a team leader, whose manager is a manager). Every lead carries
`ownerId/teamLeaderId/managerId`, kept consistent by assignment.

**Concurrency:** every change to a lead, client or request carries the `version` you read; a stale value returns
409. Two simultaneous creates of the same contact also return 409 (the database has unique indexes on phone
and email, so this holds even if two requests race).

A background job (every 5 minutes, `Reminders:Enabled` / `Reminders:IntervalMinutes`) notifies the owner,
team leader and manager once when a follow-up falls due.

Guard rails enforced in the service layer (not just the UI): only an admin can create/modify/reset an admin or
grant the admin role; nobody can deactivate or re-role themselves; the last active admin can't be removed;
the admin role can't lose `admin.roles`; manager chains can't loop.

## Tests

```powershell
cd api
dotnet test
```

Integration tests boot the real API on a throwaway SQLite file, so they run anywhere. They do **not** exercise
PostgreSQL.

## Migrations

Generated for PostgreSQL only; no running database needed to create one.

```powershell
cd api
dotnet tool restore
dotnet tool run dotnet-ef migrations add <Name> -p src/Stocketics.Infrastructure -s src/Stocketics.Api -o Persistence/Migrations
dotnet tool run dotnet-ef migrations script -p src/Stocketics.Infrastructure -s src/Stocketics.Api   # review the SQL
```

SQLite (dev/tests) uses `EnsureCreated` from the same model instead of migrations.

## Differences from ARCHITECTURE_PROPOSAL.md

- **Concurrency token** is an integer `version` column (incremented on update), not Postgres `xmin`. It matches
  the old PocketBase `version` check and behaves the same on SQLite and Postgres.
- **Validation** uses DataAnnotations plus service-level rules, not FluentValidation, for now.
- `Employee.Id` equals `User.Id` (1:1), so the API has a single identifier per person.
- Employees list scoping is "self + direct reports" until Teams exist (Slice 5).
- Slice 2 uses one append-only `lead_activities` timeline (as crm.js does) instead of the separate
  `lead_responses` / `lead_changes` tables in the proposal; lead assignments keep their own table.
- Lead visibility uses the **permission matrix** (managers hold `leads.view.all`), so a manager can see another
  manager's leads. crm.js limited a manager to their own. Remove `leads.view.all` from the manager role in
  `/permissions` if that is not wanted; no code change is needed.

## Decisions still open

- **Status vocabulary.** The API uses the crm.js statuses (New, In Contact, Qualified, Lost, Converted). The legacy
  portal shows New Lead / In Contact / Trial Active / Converted / Lost. Mapping them (and what "Trial Active"
  means for the pipeline) needs your call.
- **DND semantics.** DND is a flag that follows the phone number. Whether it should also block follow-ups,
  calls or dispatch was not in the code I could read, so nothing is blocked yet.
- **Client code format** is `CL-` + 8 hex characters (unique-indexed). Say if you need a sequential format.
- **Search alerts** (cross-employee client search notifications) are not built.

## Not done yet

KYC, payments/invoices, HR, teams, market data, reports; **server-side parsing of uploaded Excel/CSV files**
(needs the real files; the import engine and per-row history are ready for it); frontend screens still use the
legacy login and local state. Removing the hard-coded credentials in `src/data/credentials.ts` and switching
screens to `src/api/client.ts` / `src/api/crm.ts` is the next frontend step. Backups and the Nginx deployment
are Slice 8.
