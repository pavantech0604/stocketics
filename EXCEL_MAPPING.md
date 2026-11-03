# EXCEL_MAPPING.md

Prepared 2 November 2026 (Phase 2). **Status: blocked. No mapping has been produced, deliberately.**

## Finding

A search of the whole workspace (`C:\Users\BalajiRaoSureshV-Sof\Stocketstics`, excluding `node_modules`) found **zero** `.xlsx`, `.xls`, `.xlsm` or `.csv` files, and none has ever been committed to git history. The only spreadsheet-like content is generated sample leads inside `BulkLeadUploadModal.tsx` and a 250 KB PocketBase seed database.

The brief says the Excel files "contain all my CRM business data" and "do not assume each file is one table". Without the files, any column list, key candidate, duplicate count or relationship would be invented. So none is listed.

## What is needed from you

Place the real files in a new folder (for example `data-source/`, kept out of git via `.gitignore`) and tell me. Copies are fine and recommended; the originals are never modified. For each file I will then document: sheet names, headers, inferred types, key candidates, duplicate and missing-value counts, date/currency formats, cross-sheet relationships, and every ambiguity (flagged, not guessed).

If the data is sensitive, I can instead be given **a redacted sample of each sheet (header + 20–50 rows)** plus row counts. That is enough to design the mapping, but not enough to measure duplicates, so duplicate rates would be reported as "unmeasured".

## Evidence available now about the expected shapes

These come from the existing importers and are **hypotheses to verify against the real files**, not a mapping:

| Source | Expected columns (from code) | Notes |
| --- | --- | --- |
| Lead sheets (legacy importer) | Client Name, Mobile, Source, Response, City, Description, optional Owner/Agent name, Email | Header names matched heuristically, so real files may use other labels; phone normalised (strip spaces/dashes, +91, leading 0) |
| Lead sheets (new importer) | name, phone, email, state, city, source, campaign | Required: name, phone, state. Max 1,000 rows per upload today; the 50,000-record migration needs the staged server-side importer, not this UI |
| Attendance | Biometric export (columns unknown) | `HRAttendanceView.tsx` accepts CSV/XLSX but I did not find the parser contract |

## Known risks to check once files arrive

- Mobile numbers stored as numbers (lost leading zeros, scientific notation) or with country codes.
- Dates as Excel serials vs text; ambiguous `dd/mm` vs `mm/dd`.
- Currency with ₹ symbols/commas as text; GST included vs excluded.
- Owner/employee shown as a name string, not an id (needs matching to users, with unmatched names reported).
- The same person present as lead, client and payment row across sheets (dedupe key: normalised phone, then email; PAN where present).
- Merged cells, header rows not on row 1, multiple tables per sheet.
