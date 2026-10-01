# CRM deployment and data migration

## Current integration

The existing portal remains at its original routes. The new persistent CRM runs at `/backend-workspace`. These currently have separate identity and data models. Do not use the existing portal's browser login as evidence of backend authorization.

No migration has been run on `backend/pb_data` or the old remote CRM. Development tests use fresh `.crm-test/run-*` directories only. The test script creates synthetic accounts and records there, never in production.

## Run isolated verification

From `E:\Apex` in PowerShell:

```powershell
node scripts/test-crm.mjs
node scripts/test-legacy-workflow.mjs
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
```

For an interactive test workspace, keep these two commands running in separate terminals:

```powershell
node scripts/test-crm.mjs --preview
```

```powershell
$env:VITE_POCKETBASE_URL='http://127.0.0.1:18090'
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5178 --strictPort
```

Open `http://127.0.0.1:5178/backend-workspace`. The preview command prints an ephemeral QA password. QA identities include `admin@example.test`, `manager@example.test`, `leader@example.test`, `employee@example.test`, and `employee2@example.test`. All share that run's random password. These are test accounts, not production credentials. Stopping the command stops its backend; restarting creates a new isolated database and password.

## Production migration sequence

1. Export and back up the existing PocketBase database/files and each browser's real cached business records. Stop writes while taking a consistent database backup. Test restoring the backup in a separate directory.
2. Work against the restored copy first. Run the bundled binary with explicit `--dir`, `--hooksDir` and `--migrationsDir` paths. Do not point exploratory scripts at the production directory.
3. Apply `1790630000_crm_workflows.js` in that staging copy using PocketBase's migration command. This adds the new collections **and locks direct CRUD on the seven old collections**. Original records remain. Existing optional legacy sync will therefore require a coordinated cutover; running this migration alone is not a compatible production upgrade.
4. Use the local PocketBase superuser interface to provision the first `crm_users` Admin: an organization-controlled email, strong unique password, role `admin`, status `Active`. The new workspace Admin can then create Managers, Leaders and Employees in that order. Never promote HR automatically, reuse the supplied legacy passwords, or enable public collection rules.
5. Produce a reviewed mapping file for legacy identity → new identity, Manager → Leader → Employee, and legacy status → supported status. Resolve missing owners, duplicated phone/email values and multiple-team membership before import. Existing mapping changes intentionally require a reviewed migration rather than an ordinary edit.
6. Import verified lead rows in batches of at most 1,000 and reconcile accepted, duplicate and invalid counts. Lead CSV import does **not** migrate client history, uploaded files, payroll or billing. A separate migration adapter must preserve legacy IDs, timestamps, relationship links and document bytes for those records. Do not discard originals after import.
7. Reconcile per-owner totals, active clients, open follow-ups, requests, assignment history and document versions. Run the QA checklist with staging identities and real-volume data. The current state endpoint refuses arrays of 10,000 or more records; server pagination is required before datasets exceed this limit, including activity/audit rows.
8. Deploy backend hooks and frontend together, set `VITE_POCKETBASE_URL` at frontend build time, configure HTTPS/reverse proxy, backups and approved file retention, and provision credentials through an approved channel. Keep PocketBase's superuser UI restricted. Confirm authentication rate limiting and operational monitoring in that deployment.
9. Only switch the default portal and retire legacy writes after identity/data reconciliation and business acceptance. Preserve the original portal's HR/finance functions until equivalent backed workflows are available.

The migration deliberately refuses a destructive down operation. Recovery means restoring the reviewed backup and reconciling writes made after the backup, not dropping workflow collections.

## File handling

PAN is retained in KYC details; Aadhaar number metadata retains only its last four digits. Uploaded files may contain full identity details and require protected storage, backups and an approved retention policy. Downloads enforce current lead scope. No malware scanning or external identity verification provider has been integrated.
