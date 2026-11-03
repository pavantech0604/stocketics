# Stocketics API (ASP.NET Core 10 + PostgreSQL)

Backend for the Stocketics CRM, replacing PocketBase. This is **Slice 1: Foundation** from
`../ARCHITECTURE_PROPOSAL.md`: authentication, roles/permissions, employee/user admin, audit log, error
handling. Leads, clients, KYC, payments, HR, etc. arrive in later slices.

## Layout

```
api/
  src/Stocketics.Domain          entities + constants (roles, 26 permissions); no dependencies
  src/Stocketics.Application     DTOs, service interfaces, exceptions, phone/email normalisation
  src/Stocketics.Infrastructure  EF Core DbContext, migrations, Identity, service implementations, seeding
  src/Stocketics.Api             controllers, auth/CSRF/rate-limit/error middleware, Program.cs
  tests/Stocketics.Tests         68 tests (unit + integration against the real API)
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

## Not done yet

Leads/clients/KYC/payments/HR/teams/market modules; Excel import (needs the real files); frontend screens still
use the legacy login. Removing the hard-coded credentials in `src/data/credentials.ts` and switching the login
screen to `authApi.login` is the next frontend step. Backups and the Nginx deployment are Slice 8.
