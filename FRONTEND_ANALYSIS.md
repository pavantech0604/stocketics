# FRONTEND_ANALYSIS.md

Prepared 2 November 2026 (Phase 1). **Method and limits:** derived from `package.json`, `src/types/index.ts` (1,173 lines), `src/state/store.tsx` (3,561 lines, structure and API calls), `src/api/pocketbase.ts`, the `src/crm/` workspace, `backend/pb_migrations`, `backend/pb_hooks/crm.js`, `scripts/seed-pocketbase.mjs`, the three Excel/CSV importers, and targeted greps across `src/`. It is **not** a line-by-line read of all ~145 component files. Per-screen form validation inside legacy components is not exhaustively catalogued; where this document says "unknown", that is the reason.

## 1. Correction to the project brief

The brief says there is "no backend application". **There is one**: a bundled PocketBase 0.2x server (`backend/pocketbase.exe`, SQLite) with 8 migrations and a transactional hook layer (`pb_hooks/crm.js`, 365 lines). It holds only ~250 KB of seed data (`pb_data/data.db`), so there is no real business data to migrate from it. But its hook logic encodes real business rules that must be **ported, not lost** (section 6).

## 2. Stack

| Item | Value |
| --- | --- |
| UI | React 19.2, TypeScript ~6.0, Vite 8, plain CSS (no UI framework) |
| Libs | lucide-react, chart.js + react-chartjs-2, lightweight-charts (candles), xlsx 0.18.5 (SheetJS), canvas-confetti, pocketbase JS SDK |
| Routing | **No router.** `activeTab` string in a React context; one exception: `window.location.pathname.startsWith('/backend-workspace')` mounts the new CRM workspace (`src/App.tsx:78`) |
| State | One 3,561-line context (`src/state/store.tsx`, ~200 hooks/handlers) + `configContext.tsx` (39 KB) |
| Hosting today | Vercel SPA rewrite (`vercel.json`); PocketBase URL via `VITE_POCKETBASE_URL` |
| Tests | None in the repo (scripts `test-crm.mjs` and `test-legacy-workflow.mjs` are referenced by docs; verify they exist before relying on them) |

## 3. Two frontends in one repo

| | Legacy portal | New CRM workspace (`src/crm/`) |
| --- | --- | --- |
| Entry | Default route; role dashboards | `/backend-workspace` only |
| Roles | hr, manager, team_leader, employee (+ admin) | admin, manager, team_leader, employee |
| Data | Seed data + localStorage + partial PocketBase sync (6 collections, errors swallowed with `.catch(() => {})`) | Server-authoritative: `GET /api/crm/state`, `POST /api/crm/action`, document upload/download |
| Auth | Browser-side credential check (`src/data/credentials.ts`, hard-coded role logins) | PocketBase auth collection `crm_users`, token in memory |
| Size | ~145 files | 8 files, dense one-line JSX |

`.old.tsx` variants exist for four dashboards (dead code candidates).

**Decision needed (see ARCHITECTURE_PROPOSAL.md D1):** which of these is the product that goes to production.

## 4. Where data lives today

| Storage | What |
| --- | --- |
| PocketBase (legacy, 7 collections) | employees, leads, leaves, attendance, confirmed_payments, kyc_records, call_logs; realtime subscriptions on leaves/leads/attendance (`store.tsx:2094-2116`) |
| PocketBase (new, 12 collections) | crm_users + crm_leads/clients/activity/followups/requests/assignments/documents/notifications/imports/audit/settings; mostly one JSON `data` column each |
| **localStorage (38+ keys)** | `apex_crm_*`: role, theme, sidebar, teams, team_members, team_targets, tasks, standups, leaves, confirmed_payments, source_pools, sms_reports, search_alerts. `stocketics_*`: it_tickets, ra_calls, kyc_cases, kyc_documents, lead_changelog, announcements, call_reminders, dispatched_calls, bank_details, cashback_rules/records, expiry_sms_configs/logs, extended_attendance, role_permissions, custom_instruments, market_widget_config, trading_display_config, **kite_config (API key + access token)** |
| sessionStorage | `apex_crm_authenticated`, `apex_crm_last_uploaded_source`, `crm:pending-response-lead` |
| Seed/mock | `src/data/initialData.ts` (56 KB), `workflowInitialData.ts`, `configInitialData.ts`, `clientDatabase.ts`, `credentials.ts` |

Everything in the localStorage list is per-browser and invisible to other users. Moving it to a shared database is the core of this project.

## 5. Modules

Field-level definitions are in `src/types/index.ts` (line refs given). Endpoints use a REST style under `/api/v1`. "Unknown" validation means not catalogued (see limits above).

### 5.1 Authentication, users, roles, permissions
- **Fields:** Employee (`types:15`), RoleCredential (`data/credentials.ts`), RolePermissionMatrix with 26 boolean keys (`types:997`), per-role matrix (`types:1031`).
- **Today:** login compares browser-held credentials and can proceed without them (per `CRM_ANALYSIS_AND_IMPLEMENTATION_PLAN.md` §4); role persisted in localStorage.
- **Operations:** login, logout, current user, create/deactivate user, change role, reset password, edit permission matrix (HR/admin).
- **Relationships:** user ↔ employee (1:1, probably same entity), manager → team leader → employee hierarchy.
- **Endpoints:** `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET|POST|PUT /users`, `PUT /users/{id}/role`, `GET|PUT /permissions`.
- **Validation:** email unique and valid; role from fixed set; password policy (to define).

### 5.2 Employees / HR directory
- **Fields:** id, name, email, phone, role, department (HR, IT, Equity Research, Advisory Sales, Operations, Finance), title, avatar, joinDate, status (Active/On Leave/Remote/Probation), salary, managerId, dob, leaveBalance{paid,sick,comp}.
- **Operations:** list/search, create, edit, deactivate, birthday wishes (`BirthdayWish` `types:36`).
- **Relationships:** self-reference via managerId; referenced by almost everything.
- **Endpoints:** `GET|POST /employees`, `GET|PUT|DELETE /employees/{id}`, `GET /employees/birthdays`.
- **Validation:** unknown in legacy UI. New workspace: valid email.

### 5.3 Attendance
- **Fields:** AttendanceRecord (`types:49`), ExtendedAttendanceRecord with source Biometric/Manual/Import and terminal (`types:789`). **Two overlapping models.**
- **Operations:** punch in/out, break toggle, roster by date, manual adjustment, **biometric CSV/XLSX upload** (`HRAttendanceView.tsx`, columns not recorded here: needs a sample file).
- **Relationships:** employee 1:N attendance; leave overlays attendance.
- **Endpoints:** `POST /attendance/punch`, `GET /attendance?date=&employeeId=`, `PUT /attendance/{id}`, `POST /imports/attendance`.
- **Validation:** one record per employee per date (to confirm); status enum. Note status strings differ between the two models ("Half-day" vs "Half Day", "On Leave" vs "Leave").

### 5.4 Leave
- **Fields:** LeaveRequest (`types:68`), LeaveBalance (`types:805`; CL/PL/Sick).
- **Operations:** apply, approve/decline with note, balance deduction, calendar.
- **Endpoints:** `GET|POST /leaves`, `PUT /leaves/{id}/decision`, `GET /leave-balances/{employeeId}`.
- **Validation:** end ≥ start; daysCount consistent; sufficient balance (to confirm). Leave type vocabulary is inconsistent ("Paid Time Off" vs "PL", "Sick Leave" vs "Sick").

### 5.5 Payroll, payslips, cashback/incentives
- **Fields:** PayslipRecord (basic, hra, allowances, incentives, gross, pf, tax, net: `types:201`), CashbackRule / EmployeeCashbackRecord (`types:754-784`).
- **Operations:** process payroll, view payslip, define cashback rule, approve/pay cashback.
- **Endpoints:** `GET|POST /payslips`, `POST /payroll/run`, `GET|POST /cashback/rules`, `GET /cashback/records`, `PUT /cashback/records/{id}/status`.
- **Validation:** all money fields to `decimal(18,2)`; gross = sum of components, net = gross − deductions (verify the formula in `PayrollProcessor.tsx`).

### 5.6 Leads (advisory pipeline): the core module
- **Fields:** AdvisoryLead (`types:88`; legacy statuses New Lead/In Contact/Trial Active/Converted/Lost), LeadDispositionEvent (`types:123`), GlobalDNDEntry, LeadSourcePool, LeadAssignmentHistory (`types:156`), LeadChangeEntry (`types:983`). New workspace statuses differ: New/In Contact/Qualified/Lost (`crm.js:2`).
- **Operations:** create, edit, bulk upload, filter/search (tabs: new, today's follow-up, active/past prospect), allot manager→team→employee, reassign, log response with callback date/time, mark DND, convert to client, archive/restore, request more leads (cap 100).
- **Relationships:** lead → assigned employee, team, team leader; lead 1:N disposition events; lead 1:N assignment history; lead 0..1 client (unique); lead 0..1 KYC case.
- **Endpoints:** `GET /leads?…`, `POST /leads`, `PUT /leads/{id}`, `POST /leads/{id}/responses`, `POST /leads/assign`, `POST /leads/{id}/convert`, `POST /leads/{id}/archive|restore`, `POST /lead-requests`, `PUT /lead-requests/{id}/decision`, `GET|POST /dnd`.
- **Validation (enforced today only in `crm.js`):** Indian mobile `^[6-9]\d{9}$` after stripping +91/0 prefixes; email regex, lowercase; **unique phone and unique email**; follow-up must be in the future; optimistic concurrency via `version`; request size ≤ `maxRequest`; scope by role.

### 5.7 Clients
- **Fields:** ActiveClientRecordDetailed (`types:423`) with embedded notesHistory, freeTrials, invoices, kycData, serviceSubscriptions (all arrays inside one object today).
- **Operations:** directory, search (with cross-employee **search alerts**, `types:522`), edit, subscriptions, trials, hold/expire.
- **Relationships:** client 1:1 lead, client 1:N subscriptions/invoices/notes/trials, client → owner and generator employee.
- **Endpoints:** `GET /clients`, `GET|PUT /clients/{id}`, `GET|POST /clients/{id}/subscriptions|notes|trials`, `GET /search-alerts`.
- **Validation:** unique phone/email (new workspace), PAN format (to confirm), `tabCategory` enum.

### 5.8 KYC
- **Fields:** three overlapping models: legacy KYCRecord (`types:229`), KYCDocumentItem (`types:686`), KYCCase with document list and audit trail (`types:954`, 10 statuses). New workspace stores documents as protected files (PDF/JPEG/PNG, ≤ 5 MB).
- **Operations:** request documents, upload, submit, review (approve/reject/needs-reupload), delegated review by team leader, withdraw.
- **Sensitive data:** PAN, masked Aadhaar, bank account, demat id. Currently simulated document IDs, files not persisted (per implementation report).
- **Endpoints:** `GET|POST /kyc-cases`, `POST /kyc-cases/{id}/documents` (multipart), `GET /kyc-documents/{id}/file`, `POST /kyc-cases/{id}/review`, `POST /kyc-cases/{id}/submit`.
- **Validation:** PAN `[A-Z]{5}[0-9]{4}[A-Z]`; Aadhaar stored masked only; Aadhaar back required per setting; status transitions (state machine to define).

### 5.9 Payments and invoices
- **Fields:** ConfirmedPaymentRecord (`types:295`, incl. split attribution generator/closer %), InvoiceData and tax breakdown (SAC 997152, CGST/SGST 9% or IGST 18%: `types:253-293`).
- **Operations:** record payment, approve/reject, create/view invoice, split attribution.
- **Relationships:** payment → lead/client/employee; invoice 1:1 payment.
- **Endpoints:** `GET|POST /payments`, `PUT /payments/{id}/decision`, `POST /payments/{id}/invoice`, `GET /invoices/{no}`.
- **Validation:** money as `decimal(18,2)`; gst consistent with state; invoice number unique and sequential (rule to confirm); UTR unique (to confirm); split percentages sum to 100.

### 5.10 Calls, reminders, advisory (RA) calls, dispatch
- **Fields:** CallLogRecord (`types:336`), CallReminder (`types:709`), RACallRecord (`types:853`), MarketInstrumentConfig (`types:548`), AdvisoryDispatchRecord (`types:648`).
- **Operations:** log call, manager score/note, schedule/snooze/complete reminder, publish a research call with entry/targets/stop-loss, dispatch to clients over SMS/Email/WhatsApp.
- **Endpoints:** `GET|POST /call-logs`, `GET|POST|PUT /call-reminders`, `GET|POST|PUT /ra-calls`, `POST /ra-calls/{id}/dispatch`.
- **Validation:** BUY: stopLoss < entry < t1 < t2 (SELL reverse): to confirm in UI.

### 5.11 Messaging, announcements, SMS
- **Fields:** SMSReportRecord (`types:668`), SubscriptionExpirySMSConfig / ExpirySMSLog (`types:825-850`), CompanyAnnouncement (`types:732`).
- **External references found in code:** ValueFirst SMS, SendGrid, Gupshup WhatsApp, wa.me. **Not verified whether these are live calls or placeholders.** Credentials for any real one must live server-side.
- **Endpoints:** `GET|POST /announcements`, `POST /announcements/{id}/read`, `GET|POST|PUT /sms/expiry-configs`, `GET /sms/logs`, `POST /sms/send`.

### 5.12 Teams, coaching, standups, targets
- **Fields:** Team, TeamMember, CoachingNote, DailyStandup, TeamTarget (`types:462-518`).
- **Endpoints:** `GET|POST|PUT /teams`, `PUT /teams/{id}/members`, `GET|POST /coaching-notes`, `GET|POST /standups`, `GET|POST|PUT /targets`.
- **Validation:** one team per employee (to confirm); target endDate ≥ startDate.

### 5.13 Tasks, notifications, IT tickets
- **Fields:** TaskItem (`types:173`), NotificationItem (`types:183`, 8 types), IT tickets (stored in localStorage; no type defined).
- **Endpoints:** `GET|POST|PUT /tasks`, `GET /notifications`, `PUT /notifications/{id}/read`, `GET|POST|PUT /tickets`.

### 5.14 Configuration
- `configContext.tsx`/`configInitialData.ts` (statuses, responses, sources, services, states), company bank details, standard advisory services (9 constants in `types:898`).
- **Endpoints:** `GET|PUT /settings`, `GET|PUT /settings/bank-details`, `GET|POST|PUT /lookups/{kind}`.

### 5.15 Market data (read-only external)
- Quotes proxied through `/kite-api/quote` (Kite Connect). **`apiKey` and `accessToken` are stored in browser localStorage and sent from the browser.** Must move server-side (a backend proxy holding the token).
- **Endpoints:** `GET /market/quotes`, `GET /market/candles`, `PUT /market/kite-session` (admin only).

### 5.16 Dashboards and reports
- Role dashboards: HR (124 tab branches), Manager (81), Employee (40), Team Leader (26), Admin (few). KPI grids, charts, leaderboard.
- **Endpoints:** `GET /dashboard/{role}`, `GET /reports/{name}?from=&to=` (sales, attendance, payroll, leads funnel, KYC, targets).

### 5.17 Excel features that already exist
| Feature | File | Behaviour |
| --- | --- | --- |
| Bulk lead upload (legacy) | `manager/BulkLeadUploadModal.tsx` | First sheet; heuristic header detection (name, owner, phone, source, city, email, description); positional fallback; scans values to guess phone column; normalises phone |
| Lead import (new) | `crm/Forms.tsx` | CSV/XLS/XLSX; 1–1000 rows; manual column mapping; required name, phone, state; duplicates skipped and reported |
| Biometric attendance upload | `hr/HRAttendanceView.tsx` | UI present; column contract not recorded here |

## 6. Business rules to port from `pb_hooks/crm.js`

Phone/email normalisation and validation; unique phone and email on leads and clients; unique client per lead; version check on every update (optimistic concurrency); future-only follow-ups; request cap; role-scoped reads (admin/manager see all; team leader their team; employee their own); every mutation audited and notifying; imports recorded with per-row result. These are the acceptance criteria for the .NET services.

## 7. Findings that affect the plan

1. **Hard-coded credentials** for five roles in `src/data/credentials.ts`, shipped in the client bundle. The seed script has a default admin password. Both must be removed and rotated; treat any deployed copy as compromised.
2. **Kite API key/token in the browser** (5.15).
3. `.env` is tracked in git (currently only a URL, harmless, but it sets a bad precedent for the backend).
4. **Overlapping models** (attendance ×2, KYC ×3, leave vocab, lead status vocab ×2) need a single canonical definition in the database.
5. **Embedded arrays** (client notes/trials/invoices/subscriptions; lead dispositionHistory) must become child tables.
6. Swallowed errors (`.catch(() => {})`) mean the UI reports success when saves fail.
7. Regulated-domain data (PAN, Aadhaar, bank, demat): needs encryption-at-rest planning for the volume, access logging, and a retention policy (DPDP Act obligations; confirm with whoever handles compliance).
