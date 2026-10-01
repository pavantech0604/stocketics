import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { CRMRecord, CRMState } from './types';
import { Field, Badge, date } from './UI';
import { downloadCSV, errorMessage } from './api';
export type Run = (body: Record<string, unknown>, message?: string) => Promise<boolean>;
export interface FormProps { state: CRMState; run: Run; busy: boolean; close: () => void }
export function LeadForm({ state, run, busy, close, lead }: FormProps & { lead?: CRMRecord }) {
  const [form, set] = useState({ name: lead?.name || '', phone: lead?.phone || '', email: lead?.email || '', state: lead?.state || '', city: lead?.city || '', source: lead?.source || state.settings.sources[0], campaign: lead?.campaign || '', priority: lead?.priority || 'Normal', managerId: lead?.managerId || '' });
  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set({ ...form, [key]: e.target.value }) });
  return <form onSubmit={async e => { e.preventDefault(); if (await run({ action: lead ? 'edit' : 'create', leadId: lead?.id, version: lead?.version, ...form }, lead ? 'Contact updated' : 'Lead created')) close(); }}><div className="crm-form-grid">
    <Field label="Lead name *"><input required minLength={2} maxLength={120} {...field('name')} /></Field>
    <Field label="Mobile number *"><input required type="tel" placeholder="10-digit Indian mobile" {...field('phone')} /></Field>
    <Field label="Email"><input type="email" {...field('email')} /></Field>
    <Field label="State *"><select required {...field('state')}><option value="">Select state</option>{state.settings.states.map(s => <option key={s}>{s}</option>)}</select></Field>
    <Field label="City"><input {...field('city')} /></Field>
    <Field label="Source *"><select {...field('source')}>{state.settings.sources.map(s => <option key={s}>{s}</option>)}</select></Field>
    <Field label="Campaign"><input {...field('campaign')} /></Field>
    <Field label="Priority"><select {...field('priority')}>{['Normal', 'High', 'Low'].map(s => <option key={s}>{s}</option>)}</select></Field>
    {!lead && state.user.role === 'admin' && <Field label="Manager"><select {...field('managerId')}><option value="">Admin unassigned pool</option>{state.users.filter(u => u.role === 'manager' && u.status === 'Active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>}
  </div>{!lead && <p className="crm-hint">New leads enter the unassigned pool. Allocate to a Team Leader next.</p>}<footer><button type="button" onClick={close}>Cancel</button><button className="primary" disabled={busy}>{lead ? 'Save contact' : 'Create lead'}</button></footer></form>;
}
export function AssignmentForm({ state, run, busy, close, leads, request }: FormProps & { leads: CRMRecord[]; request?: CRMRecord }) {
  const isLeader = state.user.role === 'team_leader';
  const [targetRole, setRole] = useState(isLeader || request ? 'employee' : 'team_leader');
  const [targetId, setId] = useState(request?.ownerId || ''); const [reason, setReason] = useState('');
  const eligible = state.users.filter(u => u.status === 'Active' && u.role === targetRole && (!isLeader || u.teamLeaderId === state.user.id));
  return <form onSubmit={async e => { e.preventDefault(); if (!window.confirm(`Assign ${leads.length} selected lead(s)? Ownership and open follow-ups will move together.`)) return;
    if (await run({ action: 'assign', ids: leads.map(l => l.id), versions: Object.fromEntries(leads.map(l => [l.id, l.version])), targetRole, targetId, reason, requestId: request?.id }, 'Assignment saved')) close(); }}>
    <p>{leads.length} selected lead(s). Existing responses and documents stay linked.</p>
    {!isLeader && !request && <Field label="Assign to"><select value={targetRole} onChange={e => { setRole(e.target.value); setId(''); }}><option value="team_leader">Team Leader</option><option value="employee">Employee — Manager override</option></select></Field>}
    <Field label="Recipient *"><select required value={targetId} disabled={!!request} onChange={e => setId(e.target.value)}><option value="">Select recipient</option>{eligible.map(u => <option key={u.id} value={u.id}>{u.name} · {state.leads.filter(l => targetRole === 'employee' ? l.ownerId === u.id : l.teamLeaderId === u.id).length} leads</option>)}</select></Field>
    <Field label="Assignment / override reason"><textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Required for reassignment and direct Employee overrides" /></Field>
    <footer><button type="button" onClick={close}>Cancel</button><button className="primary" disabled={busy || !leads.length || !eligible.length}>Confirm assignment</button></footer>
  </form>;
}
export function RequestForm({ state, run, busy, close }: FormProps) {
  const [region, setRegion] = useState(''), [count, setCount] = useState(10), [remarks, setRemarks] = useState(''), [requiredBy, setRequiredBy] = useState('');
  const leader = state.users.find(u => u.id === state.user.teamLeaderId);
  return <form onSubmit={async e => { e.preventDefault(); if (await run({ action: 'request', state: region, count, remarks, requiredBy: requiredBy ? new Date(requiredBy).toISOString() : '' }, 'Lead request submitted')) close(); }}>
    <div className="crm-callout">{state.user.name} → {leader?.name || 'Team Leader mapping required'}</div>
    <Field label="State *"><select required value={region} onChange={e => setRegion(e.target.value)}><option value="">Select state</option>{state.settings.states.map(s => <option key={s}>{s}</option>)}</select></Field>
    <Field label={`Number of leads * (maximum ${state.settings.maxRequest})`}><input type="number" min={1} max={state.settings.maxRequest} required value={count} onChange={e => setCount(Number(e.target.value))} /></Field>
    <Field label="Required by"><input type="datetime-local" value={requiredBy} onChange={e => setRequiredBy(e.target.value)} /></Field>
    <Field label="Reason / remarks"><textarea value={remarks} onChange={e => setRemarks(e.target.value)} /></Field>
    <footer><button type="button" disabled={busy || !region || !leader} onClick={async () => { if (await run({ action: 'request', state: region, count, remarks, draft: true }, 'Draft saved')) close(); }}>Save draft</button><button className="primary" disabled={busy || !leader}>Submit request</button></footer>
  </form>;
}
export function ReviewRequest({ request, state, run, busy, close }: FormProps & { request: CRMRecord }) {
  const [status, setStatus] = useState('Approved'), [count, setCount] = useState(1), [comment, setComment] = useState('');
  return <form onSubmit={async e => { e.preventDefault(); if (await run({ action: 'reviewRequest', id: request.id, version: request.version, status, count, comment }, 'Review saved')) close(); }}>
    <p>{state.users.find(u => u.id === request.ownerId)?.name} requests <strong>{request.count} leads in {request.state}</strong>.</p>
    <Field label="Decision"><select value={status} onChange={e => setStatus(e.target.value)}>{['Seen by Team Leader', 'Under Review', 'Approved', 'Partially Approved', 'Rejected'].map(s => <option key={s}>{s}</option>)}</select></Field>
    {status === 'Partially Approved' && <Field label="Approved quantity"><input type="number" min={1} max={request.count - 1} required value={count} onChange={e => setCount(Number(e.target.value))} /></Field>}
    <Field label="Comments"><textarea required={['Rejected', 'Partially Approved'].includes(status)} minLength={5} value={comment} onChange={e => setComment(e.target.value)} /></Field>
    <p className="crm-hint">Under Review forwards the request to its Manager. Approval is followed by lead allocation.</p>
    <footer><button type="button" onClick={close}>Cancel</button><button disabled={busy} className="primary">Save decision</button></footer>
  </form>;
}
const importFields = ['name', 'phone', 'email', 'state', 'city', 'source', 'campaign'] as const;
export function ImportForm({ state, run, busy, close }: FormProps) {
  const [rows, setRows] = useState<Record<string, string>[]>([]), [headers, setHeaders] = useState<string[]>([]), [mapping, setMapping] = useState<Record<string, string>>({}), [filename, setFilename] = useState(''), [error, setError] = useState(''), [leader, setLeader] = useState(''), [source, setSource] = useState(state.settings.sources[0]);
  const mapped = rows.map(r => Object.fromEntries(importFields.map(k => [k, r[mapping[k]] || (k === 'source' ? source : '')])));
  async function parse(file?: File) {
    setError(''); setRows([]); setHeaders([]); if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Choose a file smaller than 5 MB.');
      if (!/\.(csv|xlsx|xls)$/i.test(file.name)) throw new Error('Choose a CSV or Excel file.');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const table = XLSX.utils.sheet_to_json<Record<string, string>>(workbook.Sheets[workbook.SheetNames[0]], { defval: '', raw: false });
      if (!table.length || table.length > 1000) throw new Error('Use a header row and 1–1000 data rows.');
      const keys = Object.keys(table[0]); const next: Record<string, string> = {};
      const aliases: Record<string, RegExp> = { name: /^(name|client name|lead name)$/i, phone: /^(phone|mobile|mobile number|phone number)$/i, email: /^email/i, state: /^state$/i, city: /^city$/i, source: /^source$/i, campaign: /^campaign$/i };
      importFields.forEach(k => { next[k] = keys.find(h => aliases[k].test(h.trim())) || ''; });
      setMapping(next); setHeaders(keys); setRows(table); setFilename(file.name);
    } catch (e) { setError(errorMessage(e)); }
  }
  return <div><p>Upload real leads, map columns, and review before importing. Duplicate phone/email records are skipped and reported.</p>
    <div className="crm-toolbar"><button onClick={() => downloadCSV([{ name: '', phone: '', email: '', state: '', city: '', source: '', campaign: '' }], 'lead-template.csv')}>Download template</button><input aria-label="Choose leads file" type="file" accept=".csv,.xlsx,.xls" onChange={e => void parse(e.target.files?.[0])} /></div>
    {error && <div role="alert" className="crm-error">{error}</div>}
    {!!rows.length && <><div className="crm-form-grid">{importFields.map(k => <Field key={k} label={`${k}${['name', 'phone', 'state'].includes(k) ? ' *' : ''}`}><select value={mapping[k]} onChange={e => setMapping({ ...mapping, [k]: e.target.value })}><option value="">Not mapped</option>{headers.map(h => <option key={h}>{h}</option>)}</select></Field>)}
      <Field label="Default source"><select value={source} onChange={e => setSource(e.target.value)}>{state.settings.sources.map(s => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Assign after upload"><select value={leader} onChange={e => setLeader(e.target.value)}><option value="">Keep unassigned</option>{state.users.filter(u => u.role === 'team_leader' && u.status === 'Active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field></div>
      <h3>Preview · {rows.length} rows</h3><div className="crm-table-wrap"><table><thead><tr>{importFields.map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{mapped.slice(0, 5).map((r, i) => <tr key={i}>{importFields.map(k => <td key={k}>{r[k] || '—'}</td>)}</tr>)}</tbody></table></div>
      <p className="crm-hint">Server validation records every successful, failed and duplicate row. Download the full error report from Import history.</p>
      <footer><button onClick={close}>Cancel</button><button className="primary" disabled={busy || !mapping.name || !mapping.phone || !mapping.state} onClick={async () => { if (await run({ action: 'import', rows: mapped, filename, source, teamLeaderId: leader }, 'Import complete — review the saved row report')) close(); }}>Import {rows.length} rows</button></footer>
    </>}
  </div>;
}
export function UserForm({ state, run, busy, close }: FormProps) {
  const [form, set] = useState({ name: '', email: '', password: '', role: 'employee', status: 'Active', teamLeaderId: '', managerId: '', branch: '' });
  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set({ ...form, [key]: e.target.value }) });
  return <form onSubmit={async e => { e.preventDefault(); if (await run({ action: 'user', ...form }, 'User created')) close(); }}><div className="crm-form-grid">
    <Field label="Full name *"><input required minLength={2} {...field('name')} /></Field><Field label="Email *"><input required type="email" {...field('email')} /></Field>
    <Field label="Initial password *"><input required type="password" minLength={12} autoComplete="new-password" {...field('password')} /></Field>
    <Field label="Role"><select {...field('role')}>{['employee', 'team_leader', 'manager', 'admin'].map(s => <option key={s}>{s}</option>)}</select></Field>
    <Field label="Branch"><input {...field('branch')} /></Field>
    {form.role === 'team_leader' && <Field label="Manager *"><select required {...field('managerId')}><option value="">Select Manager</option>{state.users.filter(u => u.role === 'manager' && u.status === 'Active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>}
    {form.role === 'employee' && <Field label="Team Leader *"><select required {...field('teamLeaderId')}><option value="">Select Team Leader</option>{state.users.filter(u => u.role === 'team_leader' && u.status === 'Active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>}
  </div><footer><button type="button" onClick={close}>Cancel</button><button disabled={busy} className="primary">Create account</button></footer></form>;
}
export function RequestHistory({ request }: { request: CRMRecord }) { return <><Badge>{request.status}</Badge><p>{request.remarks || 'No remarks'}</p>{(request.history || []).map((h: any, i: number) => <article className="crm-timeline-item" key={i}><strong>{h.action}</strong><p>{h.note}</p><small>{h.actor} · {date(h.at)}</small></article>)}</>; }
