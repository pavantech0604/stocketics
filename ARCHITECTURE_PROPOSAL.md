# ARCHITECTURE_PROPOSAL.md: for approval before any backend code is written

Prepared 2 November 2026. Companion to `FRONTEND_ANALYSIS.md` and `EXCEL_MAPPING.md`.

## 1. Decisions I need from you

| # | Decision | My recommendation | Why |
| --- | --- | --- | --- |
| D1 | Which frontend ships: legacy portal, `src/crm` workspace, or both merged | **Legacy portal as the shell and UX; `src/crm` rules as the backend logic.** Do not ship `/backend-workspace` as a second product | The legacy portal has the 145-file feature surface (HR, payroll, market, teams). The new workspace has the only correct business rules. |
| D2 | Replace PocketBase entirely with ASP.NET + PostgreSQL | **Yes**, as you asked. PocketBase data is seed only; nothing to migrate | One backend, one DB, no SQLite on the production path |
| D3 | Scope of first release | **Vertical slices** (below), not all 17 modules at once | ~38 localStorage keys' worth of entities; big-bang replacement is the main schedule risk |
| D4 | Realtime (PocketBase subscriptions today) | **Polling/refetch first; SignalR later if needed** | 5–20 users; avoids complexity |
| D5 | Frontend hosting | **Move to the VPS, same origin as the API** (Nginx serves the build and proxies `/api`), retiring Vercel for production | Required for the cookie-auth design; avoids CORS and cross-site cookies |
| D6 | File storage for KYC documents | **Docker volume on the VPS**, included in backups, encrypted backups; not the database | Simple and cheap; S3-compatible storage is a later option |
| D7 | Off-server backup target | Needs your choice: Backblaze B2 / Cloudflare R2 / Hostinger backups / another VPS. B2 or R2 cost a few rupees per month at this size | Brief requires off-server backups |
| D8 | Excel files | **Provide them** (see `EXCEL_MAPPING.md`). Blocks Phase 2 and the final import design | |
| D9 | SMS/Email/WhatsApp | Tell me which providers are actually in use (ValueFirst, SendGrid, Gupshup appear in code) | Credentials move server-side; unknown whether live |

## 2. Delivery slices

1. **Foundation:** solution skeleton, Postgres + EF Core, Identity + cookie auth + CSRF, roles/permissions, audit log, user/employee admin, error handling, Docker Compose for local dev.
2. **Lead-to-client core:** leads, dispositions, assignment/reassignment, requests, DND, follow-ups, clients, Excel import (staged) with history. This is the revenue path and carries the ported `crm.js` rules.
3. **KYC and payments:** KYC cases, document upload, review, payments, invoices.
4. **HR:** attendance (+ biometric import), leave, payroll, payslips, cashback.
5. **Teams and engagement:** teams, targets, coaching, standups, tasks, announcements, tickets, call logs/reminders, SMS.
6. **Market and RA calls:** server-side Kite proxy, RA calls, dispatch.
7. **Dashboards and reports** (built incrementally alongside 2–6, finished here).
8. **Production deployment, backup/restore drill, security checklist.**

After each slice, the matching frontend screens switch from localStorage/seed to the API and I delete the matching localStorage keys.

## 3. Proposed database schema (PostgreSQL, EF Core, snake_case, UTC `timestamptz`)

Conventions: `uuid` primary keys; `created_at`, `updated_at`; `xmin`-based concurrency token (maps the old `version` check); soft delete (`deleted_at`) on leads, clients, employees, payments, KYC; money `numeric(18,2)`; dates `date`; phone stored as normalised 10-digit text.

| Group | Tables | Key constraints |
| --- | --- | --- |
| Identity | `users` (ASP.NET Identity), `roles`, `user_roles`, `permissions`, `role_permissions` | unique email; permission keys = the 26 in `RolePermissionMatrix` |
| People | `employees` (1:1 `users`), `teams`, `team_members`, `leave_balances` | self-FK `manager_id`; unique (team, employee) |
| Leads | `leads`, `lead_responses` (was dispositionHistory), `lead_assignments` (was assignment history), `lead_changes`, `lead_requests`, `lead_source_pools`, `dnd_numbers` | **unique partial index on phone and on lower(email) where not deleted**; FK owner/team/team leader; index (owner_id, status), (next_followup_at) |
| Clients | `clients` (unique `lead_id`), `client_subscriptions`, `client_notes`, `client_trials` | unique phone/email; FK owner, generator |
| KYC | `kyc_cases`, `kyc_documents` (file path, sha256, mime, size), `kyc_audit` | PAN stored encrypted or hashed + masked display (to design with you); status state machine in service layer |
| Money | `payments`, `invoices`, `invoice_taxes`, `payment_attributions`, `payslips`, `cashback_rules`, `cashback_records` | unique invoice_no; unique utr where present; check attribution sums to 100 |
| HR | `attendance` (one canonical model), `leaves` | unique (employee, date); check end ≥ start |
| Engagement | `tasks`, `notifications`, `announcements`, `announcement_reads`, `coaching_notes`, `standups`, `targets`, `tickets`, `call_logs`, `call_reminders`, `sms_logs`, `sms_expiry_configs` | FKs to employee/client |
| Market | `ra_calls`, `instruments`, `dispatches`, `kite_session` (token encrypted, admin-only) | |
| Platform | `settings`, `lookups`, `import_batches`, `import_rows` (staging), `audit_logs` | `import_rows` keeps raw JSON + status + error per row |

Overlapping legacy models (attendance ×2, KYC ×3, status vocabularies) collapse to one canonical table each; the mapping is documented in `DATABASE_DESIGN.md` when written. I will not invent enum values: the existing strings are kept as lookup rows and reconciled with you where they conflict.

## 4. API architecture

- **Projects:** `Stocketics.Api` (controllers, middleware, auth), `Stocketics.Application` (services, DTOs, validators, interfaces), `Stocketics.Domain` (entities), `Stocketics.Infrastructure` (EF Core, migrations, file storage, Excel via ClosedXML or EPPlus-free alternative, email/SMS adapters), `Stocketics.Tests`. Repositories only where a query is reused; otherwise services use `DbContext` directly.
- **Auth:** ASP.NET Core Identity, HttpOnly + Secure + SameSite=Lax cookie, antiforgery header for mutating requests, lockout, password policy, no tokens in JS. Authorisation by policy mapped to the permission matrix **plus data scoping** (admin/manager all, team leader team, employee own), enforced in the service layer, never only in the UI.
- **Conventions:** `/api/v1/...`, DTOs only, FluentValidation, ProblemDetails errors, `page/pageSize/sort/q` + filter params, `{items,total,page,pageSize}` envelope, ETag/`If-Match` or version field for concurrency, Serilog structured logs, `/health`.
- **Module-to-endpoint mapping:** see section 5 of `FRONTEND_ANALYSIS.md` (each module lists its endpoints).
- **Frontend:** one `src/api/client.ts` (fetch wrapper, base URL from `VITE_API_BASE_URL` defaulting to `/api/v1`, 401 handling, error normalisation), React-side loading/error/pagination states added screen by screen.

## 5. Excel migration strategy (final design pending the files)

1. Upload to `POST /api/v1/imports` (type, size ≤ configurable e.g. 20 MB, extension + magic-byte check, never executed).
2. Parse into `import_rows` (staging) in a background worker; nothing touches live tables yet.
3. Validate: required columns/fields, phone/email/PAN/date/currency normalisation, owner-name → user matching.
4. Dedupe: within file, then against DB on normalised phone, then email (then PAN for clients).
5. **Dry-run report** to the user: counts of insert / update / duplicate / failed with row-level reasons; downloadable.
6. On explicit approval only: apply in batched transactions; **default is insert-new and skip-duplicates; updates to existing records require an explicit "update" choice; nothing is deleted.**
7. Persist `import_batches` + per-row results permanently; the original file is retained in the volume.
8. The initial 50,000-record load is run as a one-off through the same engine against a restored copy first, then production.

## 6. Hosting estimate

| Component | Memory (typical) |
| --- | --- |
| PostgreSQL 16/17 (tuned for small box) | 0.5–1 GB |
| ASP.NET Core API | 0.2–0.4 GB |
| Nginx + static build | < 0.05 GB |
| OS + Docker overhead | ~0.5 GB |

A 2 vCPU / 8 GB VPS (the brief's Hostinger KVM 2 class) is well above what 5–20 users and 50k rows need; 4 GB would also work. **I have not verified current Hostinger pricing**, so please confirm it fits ₹1,500–3,000/month before purchase. Off-site backup storage adds roughly ₹0–100/month. Domain and Let's Encrypt are the only other items (the domain is not free).

## 7. Constraints in this working environment

- .NET SDK 10.0.403 and Node 22 are installed here, so .NET 10 is viable.
- **Docker and PostgreSQL are not installed locally.** I can write all Dockerfiles/Compose/scripts and run unit tests, but I cannot run the compose stack or integration tests against real Postgres here until Docker Desktop (or a local Postgres) is installed. The first real end-to-end verification would otherwise happen on the VPS. I recommend installing Docker Desktop; say if you cannot.
- I cannot deploy to your VPS without your credentials; I will write exact commands and you (or I, with access you grant) run them.

## 8. Risks

- Scope: 17 modules and ~145 screens; mitigated by slices and an explicit definition of done per slice.
- Unknown real data shape until Excel files arrive.
- Rules that exist only in the legacy UI components are not catalogued; they surface during each slice's screen-by-screen read.
- Regulated personal data (PAN/Aadhaar/bank): encryption, retention and access-logging requirements should be confirmed with your compliance owner.

## 9. What I will do once you approve

Start slice 1 (foundation) on a new branch, with the credentials/secret clean-up first, and wait for the Excel files before slice 2's importer is finalised.
