import { useClock } from './useClock';
import React, { useState } from 'react';
import { Clock, Phone, ShieldCheck } from 'lucide-react';
import type { CRMRecord, CRMState } from './types';
import type { Run } from './Forms';
import { Badge, date, Empty, Field } from './UI';
import { downloadDocument, errorMessage } from './api';
import { nextFollowup } from './selectors';

export function LeadDetail({ lead, state, run, busy, assign, edit, upload, reportError }: { lead: CRMRecord; state: CRMState; run: Run; busy: boolean; assign: () => void; edit: () => void; upload: (form: FormData) => Promise<boolean>; reportError: (s: string) => void }) {
  const now = useClock();
  const [tab, setTab] = useState('Overview'), [note, setNote] = useState(''), [outcome, setOutcome] = useState('Call Back'), [nextDue, setDue] = useState('');
  const [originalId, setOriginal] = useState(''), [followupId, setFollowup] = useState('');
  const [oldest, setOldest] = useState(false), [activityType, setActivityType] = useState('All');
  const [kind, setKind] = useState('PAN'), [number, setNumber] = useState(''), [holderName, setHolder] = useState(lead.name), [reason, setReason] = useState(''), [file, setFile] = useState<File | null>(null);
  const userName = (id: string) => state.users.find(u => u.id === id)?.name || (id ? 'Previous team member' : 'Unassigned');
  const next = nextFollowup(state, lead.id), manager = ['admin', 'manager'].includes(state.user.role);
  const activity = state.activity.filter(a => a.leadId === lead.id && (activityType === 'All' || a.type === activityType)).sort((a, b) => oldest ? a.at.localeCompare(b.at) : b.at.localeCompare(a.at));
  const documents = state.documents.filter(d => d.leadId === lead.id);
  const action = (body: Record<string, unknown>, message?: string) => run({ leadId: lead.id, version: lead.version, ...body }, message);
  const response = <form onSubmit={async e => { e.preventDefault(); if (await action({ action: originalId ? 'correction' : followupId ? 'completeFollowup' : 'response', note, outcome, nextDue: nextDue ? new Date(nextDue).toISOString() : '', originalId, followupId }, 'Response saved to the timeline')) { setNote(''); setDue(''); setOriginal(''); setFollowup(''); } }}>
    <h3>{originalId ? 'Add a correction' : followupId ? 'Complete follow-up' : 'Log call / add response'}</h3>
    {(originalId || followupId) && <div className="crm-callout">A new entry will be added. Earlier responses stay unchanged.<button type="button" onClick={() => { setOriginal(''); setFollowup(''); }}>Cancel selection</button></div>}
    <Field label="Call outcome"><select value={outcome} onChange={e => setOutcome(e.target.value)}>{['Call Back', 'Interested', 'Busy', 'Not Reachable', 'Not Interested', 'Qualified', 'Note'].map(s => <option key={s}>{s}</option>)}</select></Field>
    <Field label="Response *"><textarea required minLength={2} maxLength={2000} placeholder="What happened, and what should happen next?" value={note} onChange={e => setNote(e.target.value)} /></Field>
    <Field label="Next follow-up"><input type="datetime-local" value={nextDue} onChange={e => setDue(e.target.value)} /></Field>
    <footer><button type="button" onClick={() => { const d = new Date(Date.now() + 7 * 86400000); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); setDue(d.toISOString().slice(0, 16)); }}>One week later</button><button className="primary" disabled={busy || lead.archived}>Save response</button></footer>
  </form>;
  return <div className="crm-detail">
    <div className="crm-detail-summary"><div><small>LEAD · {lead.id}</small><h2>{lead.name}</h2><p><Phone size={14} /> {lead.phone} · {lead.email || 'No email'}</p></div><div><Badge>{lead.status}</Badge> <Badge>{lead.priority}</Badge></div></div>
    <div className="crm-detail-facts"><span>Team Leader<strong>{userName(lead.teamLeaderId)}</strong></span><span>Employee<strong>{userName(lead.ownerId)}</strong></span><span>Next follow-up<strong className={next && new Date(next.due).getTime() < now ? 'crm-danger-text' : ''}>{next ? date(next.due) : 'Not scheduled'}</strong></span><span>KYC<strong>{lead.kycStatus}</strong></span></div>
    <div className="crm-tabs" role="tablist" aria-label="Lead details">{['Overview', 'Activity', 'Follow-ups', 'Documents / KYC', 'Assignment History'].map(t => <button role="tab" aria-selected={tab === t} key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'Overview' && <><div className="crm-detail-actions">
      {state.user.role !== 'employee' && !lead.archived && lead.status !== 'Converted' && <button onClick={assign}>Assign / reassign</button>}
      <button onClick={() => setTab('Documents / KYC')}><ShieldCheck size={16} /> Upload KYC</button>
      {lead.status === 'Qualified' && !lead.archived && <button className="primary" disabled={busy} onClick={() => { if (window.confirm('Create a client from this qualified lead? Its complete history and ownership will remain linked.')) void action({ action: 'convert' }, 'Client created'); }}>Convert to client</button>}
      <details className="crm-more"><summary>More actions</summary>
        {!lead.archived && <button onClick={edit}>Edit lead / client</button>}
        {manager && <button disabled={busy} onClick={() => { const reason = window.prompt(`Reason to ${lead.archived ? 'restore' : 'archive'} this lead:`); if (reason && window.confirm('Confirm this change?')) void action({ action: lead.archived ? 'restore' : 'archive', reason }, 'Lead updated'); }}>{lead.archived ? 'Restore lead' : 'Archive lead'}</button>}
        <button onClick={() => setTab('Assignment History')}>View ownership history</button>
      </details>
    </div><div className="crm-callout"><strong>Last response</strong><p>{lead.lastResponse || 'No response recorded. Log your first contact below.'}</p></div>
    <div className="crm-detail-facts"><span>Location<strong>{lead.city ? lead.city + ', ' : ''}{lead.state}</strong></span><span>Source / campaign<strong>{lead.source}{lead.campaign ? ' / ' + lead.campaign : ''}</strong></span></div>
    {lead.status !== 'Converted' && !lead.archived && <Field label="Lead status"><select value={lead.status} disabled={busy} onChange={e => { const status = e.target.value; const reason = status === 'Lost' ? window.prompt('Reason this lead was lost:') : ''; if (status !== 'Lost' || reason) void action({ action: 'status', status, reason }, 'Status updated'); }}>{['New', 'In Contact', 'Qualified', 'Lost'].map(s => <option key={s}>{s}</option>)}</select></Field>}
    {response}</>}
    {tab === 'Activity' && <><div className="crm-toolbar"><select aria-label="Activity type" value={activityType} onChange={e => setActivityType(e.target.value)}>{['All', ...new Set(state.activity.filter(a => a.leadId === lead.id).map(a => a.type))].map(t => <option key={t}>{t}</option>)}</select><button onClick={() => setOldest(!oldest)}>{oldest ? 'Oldest first' : 'Newest first'}</button></div>
      {!activity.length && <Empty title="No activity yet" />}{activity.map(a => <article key={a.id} className="crm-timeline-item"><div className="crm-toolbar"><Badge>{a.type}</Badge><small>{date(a.at)}</small></div><strong>{a.actorName} · {a.actorRole}</strong><p className="crm-note">{a.note}</p>{a.outcome && <small>Outcome: {a.outcome}</small>}{a.originalId && <small>Correction to entry {a.originalId}</small>}{a.nextDue && <p><Clock size={14} /> Follow-up: {date(a.nextDue)}</p>}{!lead.archived && <button className="text-button" onClick={() => { setOriginal(a.id); setFollowup(''); setTab('Overview'); }}>Add correction</button>}</article>)}</>}
    {tab === 'Follow-ups' && <>{state.followups.filter(f => f.leadId === lead.id).length === 0 && <Empty title="No follow-ups scheduled" detail="Log a response with the next follow-up date to create one." />}{state.followups.filter(f => f.leadId === lead.id).map(f => <article className="crm-timeline-item" key={f.id}><div className="crm-toolbar"><strong>{date(f.due)}</strong><Badge>{f.status === 'Open' && new Date(f.due).getTime() < now ? 'Overdue' : f.status}</Badge></div><p>{f.response}</p>{f.status === 'Open' && <button onClick={() => { setFollowup(f.id); setOriginal(''); setTab('Overview'); }}>Complete with response</button>}{f.completedAt && <small>Completed {date(f.completedAt)}</small>}</article>)}</>}
    {tab === 'Documents / KYC' && <><div className="crm-callout"><Badge>{lead.kycStatus}</Badge><p>PAN and Aadhaar front are required{state.settings.aadhaarBackRequired ? ', along with Aadhaar back' : ''}. Each upload creates a protected version.</p>{lead.kycReason && <p><strong>Review reason:</strong> {lead.kycReason}</p>}</div>
      <KYCProfile lead={lead} busy={busy} action={action} />
      <form onSubmit={async e => { e.preventDefault(); if (!file) return;
        if (file.size > 5242880 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) { reportError('Use a PDF, JPEG or PNG up to 5 MB.'); return; }
        const form = new FormData(); for (const [k, v] of Object.entries({ leadId: lead.id, version: String(lead.version), kind, holderName, number, reason })) form.set(k, v); form.set('file', file);
        if (await upload(form)) { setFile(null); setNumber(''); setReason(''); (e.target as HTMLFormElement).reset(); }
      }}><h3>Upload KYC document</h3><div className="crm-form-grid">
        <Field label="Document"><select value={kind} onChange={e => { setKind(e.target.value); setNumber(''); }}><option>PAN</option><option>Aadhaar Front</option><option>Aadhaar Back</option><option>KYC Form</option></select></Field>
        <Field label="Holder name *"><input required minLength={2} value={holderName} onChange={e => setHolder(e.target.value)} /></Field>
        {kind !== 'KYC Form' && <Field label={kind === 'PAN' ? 'PAN number *' : 'Aadhaar number *'}><input required autoComplete="off" value={number} maxLength={kind === 'PAN' ? 10 : 12} pattern={kind === 'PAN' ? '[A-Za-z]{5}[0-9]{4}[A-Za-z]' : '[2-9][0-9]{11}'} onChange={e => setNumber(e.target.value)} /></Field>}
        <Field label="File * (PDF, JPEG, PNG; 5 MB)"><input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} /></Field></div>
        <Field label="Reupload reason"><textarea required={documents.some(d => d.kind === kind)} minLength={5} value={reason} onChange={e => setReason(e.target.value)} /></Field>
        <footer><span className="crm-hint">Aadhaar numbers are masked in record details. Uploaded files have restricted access.</span><button className="primary" disabled={busy || !file || lead.archived}>{busy ? 'Uploading…' : 'Upload new version'}</button></footer>
      </form><h3>Document versions</h3>{!documents.length && <Empty title="No documents uploaded" />}{documents.map(d => <article className="crm-timeline-item" key={d.id}><div className="crm-toolbar"><strong>{d.kind} · v{d.documentVersion}</strong><button onClick={() => void downloadDocument(d.id, d.kind.replace(/ /g, '-') + '-v' + d.documentVersion).catch(e => reportError(errorMessage(e)))}>Download</button></div><p>{d.holderName} · {d.maskedNumber}</p><small>{d.uploadedBy} · {date(d.created)}</small>{d.reason && <p>{d.reason}</p>}</article>)}
      <div className="crm-detail-actions"><button className="primary" disabled={busy || !lead.ownerId || !['Not Started', 'Pending Employee Upload', 'Reupload Required', 'KYC Rejected'].includes(lead.kycStatus)} onClick={() => void action({ action: 'submitKyc' }, 'KYC submitted')}>Submit for review</button>
      {state.user.role !== 'employee' && ['Under Team Leader Review', 'Under Manager/Admin Review'].includes(lead.kycStatus) && <><button disabled={busy} onClick={() => void action({ action: 'reviewKyc', decision: 'Forward' }, 'Forwarded to Manager')}>Forward to Manager</button>{manager && <button disabled={busy} onClick={() => { if (window.confirm('Verify that all required documents have been reviewed and are complete?')) void action({ action: 'reviewKyc', decision: 'Approve' }, 'KYC verified'); }}>Verify KYC</button>}<button disabled={busy} onClick={() => { const reason = window.prompt('Reason for rejecting KYC:'); if (reason && window.confirm('Reject this KYC submission and notify its owner?')) void action({ action: 'reviewKyc', decision: 'Reject', reason }, 'KYC rejected'); }}>Reject</button></>}
      </div></>}
    {tab === 'Assignment History' && <>{state.assignments.filter(a => a.leadId === lead.id).map(a => <article key={a.id} className="crm-timeline-item"><Badge>{a.type}</Badge><p>Team Leader: {userName(a.previousTeamLeaderId)} → {userName(a.newTeamLeaderId)}</p><p>Employee: {userName(a.previousOwnerId)} → {userName(a.newOwnerId)}</p><p>{a.reason || 'Initial allocation'}</p><small>{a.actorName} · {date(a.at)} · {a.source}</small></article>)}{!state.assignments.some(a => a.leadId === lead.id) && <Empty title="Not assigned yet" />}</>}
  </div>;
}
function KYCProfile({ lead, busy, action }: { lead: CRMRecord; busy: boolean; action: (body: Record<string, unknown>, message?: string) => Promise<boolean> }) {
  const [profile, set] = useState({ fullName: lead.kycProfile?.fullName || lead.name, mobile: lead.kycProfile?.mobile || lead.phone, email: lead.kycProfile?.email || lead.email, pan: lead.kycProfile?.pan || '', formType: lead.kycProfile?.formType || 'Individual' });
  return <form onSubmit={async e => { e.preventDefault(); await action({ action: 'kycProfile', ...profile }, 'KYC details saved'); }}><h3>Client KYC details</h3><p className="crm-hint">The same form is used from Leads, Clients and KYC tasks.</p><div className="crm-form-grid">{(['fullName', 'mobile', 'email', 'pan'] as const).map(k => <Field key={k} label={{ fullName: 'Full name *', mobile: 'Mobile number *', email: 'Email address *', pan: 'PAN number *' }[k]}><input required type={k === 'email' ? 'email' : k === 'mobile' ? 'tel' : 'text'} value={profile[k]} onChange={e => set({ ...profile, [k]: e.target.value })} /></Field>)}<Field label="Form type *"><select value={profile.formType} onChange={e => set({ ...profile, formType: e.target.value })}>{['Individual', 'Non-Individual', 'Company'].map(s => <option key={s}>{s}</option>)}</select></Field></div><footer><button disabled={busy}>Save KYC details</button></footer></form>;
}
