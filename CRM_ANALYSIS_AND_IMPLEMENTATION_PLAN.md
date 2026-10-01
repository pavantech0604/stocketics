# CRM analysis and implementation plan

Prepared 28 September 2026, before implementation. Scope: the supplied 18-section prompt and the current workspace. This is a source review, not a claim that every existing screen has passed runtime QA.

## 1. Current application architecture

React 19, TypeScript, Vite 8, plain CSS, Lucide, Chart.js, SheetJS, and PocketBase JS SDK. `src/App.tsx` selects one of four role dashboards. A roughly 3,000-line React context in `src/state/store.tsx` owns most behavior. Routing is an `activeTab` string, not a URL router. PocketBase 0.25.9 is bundled; SQLite data and seven collection migrations exist. No server business hooks or automated tests existed at inspection.

## 2. Routes, pages, components

`src/components/{hr,manager,teamlead,employee}` contains role dashboards, HR/payroll/attendance, lead allocation, sales, messaging, clients, KYC and reporting screens. Shared components include Sidebar, CRMActionModals, ClientDirectory, AllotLeadsView, LeadKYCOnboardingModal, KYCStepper and reminders. `AdvisoryPipeline` implements lead tabs and response forms. Legacy tab aliases include leads/advisory/view-all-leads, new-leads, today-followup, active-prospect, past-prospect, allot-leads, bulk-upload-leads, client/active-clients and kyc-list. Market components and external market services are separate.

## 3. Database entities/schema

Existing collections: employees, leads, leaves, attendance, confirmed_payments, kyc_records, call_logs. They contain a subset of the TypeScript entities. Employees are a base collection, not authenticated identities. The checked-in collection rules are empty strings (public CRUD). Team mappings, assignment history, detailed clients, KYC cases, most configuration, reminders and notifications live in browser state/storage. Original DB and archive will not be modified during development.

## 4. Roles and permissions

Current roles: hr, manager, team_leader, employee. Team Leader already exists despite being described as new in the prompt. Login compares browser-stored credentials, permits login without credentials, and chooses a predefined identity. Client-side permission maps cannot protect the public backend. HR must not silently become Admin. Introduce a separate authenticated CRM identity with admin/manager/team_leader/employee roles and explicit Manager → Leader → Employee mapping. Existing HR access remains in the original portal pending identity migration.

## 5. Module condition

| Module | Finding |
| --- | --- |
| Leads | Rich but dense interface; local storage and optional partial server sync |
| Imports | XLSX/CSV parser and preview; sample production leads, direct employee distribution, weak durable result tracking |
| Assignment | Existing hierarchy UI; missing server checks; generates fictional leads when availability is short |
| Responses | Embedded dispositionHistory appends, but mutable with parent lead; callback dates not reliably validated |
| Clients/conversion | Separate local client model; changing response/status can mark Converted without transactional client creation |
| KYC | Several overlapping local models; central modal creates simulated document IDs without persisting file bytes; incomplete submission possible |
| Requests | No durable employee lead request lifecycle found |
| Dashboard | Role screens exist; metrics depend on mixed local/seed/live state |
| Notifications/audit | Browser records; several success messages claim actions without durable delivery |
| Validation/errors | Hand-written per form; swallowed API errors (`catch(() => {})`); no common transaction boundary |

## 6. Broken/incomplete flows

Highest risks: anonymous access, browser-selected identity, invented allocation inventory, successful-looking unsaved changes, loss of history through mismatched server schema, KYC without stored files, and conversion without a unique linked client. Local cache migration code also removes multiple storage keys based on heuristics. These cannot be solved by cosmetic changes.

## 7. Old CRM references

Available: logo, navy/blue design tokens, LegacyKPIGrid/RefKPIGrid, PHP CRM/reference screenshot comments, familiar labels and tab names. No actual old CRM source, screenshots, videos or URL found. Comments are not proof of old behavior. User has been asked for a reference location. Needs business confirmation: exact visual parity and any undocumented legacy workflows.

## 8. Gap analysis and the three configurations

The sidebar's actual Configuration children are **Allot Leads** and **Compliance & Settings**; there are not three identifiable CRM dashboard configuration pages. Three related stored settings objects are MarketWidgetConfig (market card visibility/instruments/refresh), KiteConfig (broker integration), and TradingDisplayConfig (trading call display). They are not interchangeable CRM dashboard settings and have no matching configuration DB/audit entities. Preserve them in the legacy implementation. Needs business confirmation: which three dashboard options the prompt refers to. Do not manufacture unrelated settings or claim these three are the requested ones.

## 9. Exact implementation sequence

1. Finish this analysis and inventory. Establish build baseline.
2. Add isolated `crm_*` collections and authenticated identities, keeping original data intact. Lock legacy public APIs when migration is applied. No destructive down migration.
3. Add one server service boundary for role-scoped reads and validated transactional commands. Direct write APIs for workflow collections remain locked.
4. Implement real lead creation/import with duplicate detection and row results, hierarchical assignment, immutable activity/corrections, follow-ups, requests linked to allocation, unique conversion and protected versioned documents.
5. Add a shared CRM workspace with role-specific navigation/dashboard, filterable leads and clients, detail tabs, requests, upload history, team configuration, notifications and audit views. Integration as of 29 September: the original portal remains the default; the connected workspace is at `/backend-workspace`. Existing data is not automatically migrated.
6. Verify with isolated PocketBase integration tests, TypeScript/build checks and browser checks where available. Record limitations and migration steps.

## 10. Database migration plan

Add crm_users auth, crm_leads, crm_clients, crm_activity, crm_followups, crm_requests, crm_assignments, crm_documents, crm_notifications, crm_imports, crm_audit, crm_settings. Records have normalized indexed lookup/ownership fields plus validated JSON details. Lead/client phone and email indexes prevent races. Client leadId is unique. Documents are append-only protected files; Aadhaar number metadata stored masked (uploaded files may contain full identity details). Every workflow mutation and its audit entries share a transaction. Original collections/data are retained and their anonymous API rules locked. Rollback must restore a backup deliberately, never delete new business data.

## 11. API changes

Authenticated `/api/crm/state`, `/api/crm/action`, `/api/crm/document` and protected document retrieval. Server resolves identity and scope, checks active status, enforces relationships, versions, validation and transitions. Auth uses PocketBase crm_users password authentication. User creation/mapping is Admin-only; Manager sees only assigned leaders and employees.

## 12. UI/UX changes

Keep Stocketics navy/blue branding. Use a compact collapsible sidebar, action cards, readable tables, advanced filters, pagination, clear empty/error/loading states, confirmation for significant changes, and one detail drawer with overview/activity/follow-ups/KYC/assignment tabs. Keep submitted responses read-only. All forms await server success and preserve errors for retry. No demo data fallback in the persistent workspace.

## 13. Risks

Existing browser data has non-PocketBase IDs and ownership by name. Automatically copying it risks duplicates and incorrect access. Do not auto-import it. Backend schema/runtime compatibility must be tested against bundled 0.25.9. Deployment still needs HTTPS, backups, credential provisioning, retention policy and operational review. Large data volumes need paginated server queries beyond an initial shared workspace implementation.

## 14. Backward compatibility

Do not delete original tables, files or UI modules. New collections isolate unverified legacy/demo data. Preserve the existing portal at its current routes and add the connected workspace separately. Provide a migration runbook for identifying real records, mapping identities, reconciling duplicates, and importing verified lead data. Existing HR, finance and market features retain their existing implementation; they are not covered by the new server permissions. The startup routine that deleted cached records based on matching names has been removed.

## 15. Testing plan

Isolated DB, never production DB: unauthenticated/direct API access, each role's scope, inactive users, invalid team mapping, duplicate phone/email, short pools, concurrent/stale updates, request partial approval and fulfillment, one-week callback and correction retention, mandatory KYC/rejection/version history, transactional duplicate-proof conversion, post-reassignment access and dashboard/list consistency. Build/typecheck entire app. QA checklist will include manual responsive/accessibility and business-specific checks.

## 16. Needs business confirmation

Exact three dashboard configurations; branch/territory and manager visibility rules; authorized HR access; Aadhaar back requirement and document retention; approved state list; conversion eligibility and KYC prerequisite; request maximum and expiry; SMS/email/WhatsApp providers; duplicate merge/update policies; real legacy records and identity mappings. Safe initial policy: manager hierarchy enforced, PAN plus Aadhaar front mandatory, no automatic duplicate merge, no fabricated messaging delivery, qualified leads eligible for conversion while KYC remains independently tracked.

## Old CRM reference inspected, 29 September

Authorized read-only sign-ins were used to inspect the supplied CRM. No remote business records were changed. Credentials are not recorded here.

- Employee client list: owner, client name, mobile, service, start/end dates and actions. Client details expose Prospect, Billing Info, Message, KYC, storyline and C2C.
- Employee Edit KYC: full name, mobile, email, PAN, form type (Individual, None-Individual, Company), KYC form upload and current-file download. The connected workspace now includes these profile fields, a KYC Form file category, and separate mandatory PAN/Aadhaar identity documents. Form upload is optional until the business confirms which signed template applies.
- Manager allocation: source with available count, employee and quantity. The supplied requirements deliberately strengthen this to Manager → Team Leader → Employee, with a recorded reason for a Manager override.
- Manager configuration includes sources, responses, statuses, banks, products/services, teams, allotment, imports, disposal/export and contact transfer. Lead statuses observed: WEB LEAD, INTERESTED, HIGHLY INTERESTED, NOT INTERESTED, PAID CLIENT. Mapping these to the new status model requires migration review.
- HR configuration includes templates, prefixes/suffixes, gateways, employee/profile/category setup, products/services, scripts, policies, training, company and notice/news content.
- Dashboard panels observed: Sales Executive, Managers and Team Leader, each with Today/Month controls. These have not been assumed to define the prompt's unspecified three dashboard configurations.

See `CRM_IMPLEMENTATION_REPORT.md`, `CRM_QA_TEST_CASES.md` and `CRM_DEPLOYMENT.md` for the implemented scope, evidence and remaining work. This review covers the critical CRM paths; it is not an assertion that every line of every HR, finance or market module was audited.
