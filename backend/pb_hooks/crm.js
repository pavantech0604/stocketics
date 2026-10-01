// All mutations enter through a transaction in crm.pb.js. No direct workflow CRUD is exposed.
const statuses = ['New', 'In Contact', 'Qualified', 'Lost'];
const defaultSettings = {
  maxRequest: 100, aadhaarBackRequired: false,
  states: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry', 'Andaman and Nicobar Islands', 'Lakshadweep', 'Dadra and Nagar Haveli and Daman and Diu'],
  sources: ['Website', 'Referral', 'Campaign', 'Other'],
};
function fail(message) { throw new BadRequestError(message); }
function requireValue(condition, message) { if (!condition) fail(message); }
function text(value, max) { return String(value || '').trim().slice(0, max || 2000); }
function data(record) { return JSON.parse(record.getString('data') || '{}'); }
function out(record) { return Object.assign({}, data(record), { id: record.id, version: record.getInt('version'), created: record.getString('created'), updated: record.getString('updated'), leadId: record.getString('leadId'), ownerId: record.getString('ownerId'), teamLeaderId: record.getString('teamLeaderId'), managerId: record.getString('managerId') }); }
function user(record) { return { id: record.id, name: record.getString('name'), email: record.getString('email'), role: record.getString('role'), status: record.getString('status'), teamLeaderId: record.getString('teamLeaderId'), managerId: record.getString('managerId'), branch: record.getString('branch') }; }
function actor(app, auth) {
  const u = user(app.findRecordById('crm_users', auth.id));
  if (u.status !== 'Active') throw new ForbiddenError('Your account is not active.');
  return u;
}
function manager(u) { return u.role === 'admin' || u.role === 'manager'; }
function scope(u) {
  if (u.role === 'admin') return 'id != ""';
  return (u.role === 'manager' ? 'managerId' : u.role === 'team_leader' ? 'teamLeaderId' : 'ownerId') + ' = {:actor}';
}
function list(app, name, filter, params) { return app.findRecordsByFilter('crm_' + name, filter || 'id != ""', '-created,-id', 10000, 0, params || {}); }
function lead(app, auth, id) {
  const u = actor(app, auth);
  const records = list(app, 'leads', '(' + scope(u) + ') && id = {:lead}', { actor: u.id, lead: id });
  if (!records.length) throw new ForbiddenError('This lead is outside your access scope.');
  return records[0];
}
function save(app, name, payload, parent, record) {
  const r = record || new Record(app.findCollectionByNameOrId('crm_' + name));
  r.set('data', payload);
  if (parent) for (const key of ['leadId', 'ownerId', 'teamLeaderId', 'managerId']) r.set(key, parent[key] || '');
  r.set('version', r.getInt('version') + 1);
  app.save(r);
  return r;
}
function audit(app, u, action, parent, detail) {
  save(app, 'audit', { action, actorId: u.id, actorName: u.name, detail, at: new Date().toISOString() }, parent || { managerId: u.role === 'manager' ? u.id : u.managerId });
}
function notify(app, id, title, leadId) { if (id) save(app, 'notifications', { title, read: false, at: new Date().toISOString() }, { ownerId: id, leadId }); }
function settings(app) { const r = list(app, 'settings'); return r.length ? Object.assign({}, defaultSettings, data(r[0]), { version: r[0].getInt('version') }) : defaultSettings; }
function version(r, expected) { requireValue(Number(expected) === r.getInt('version'), 'This record changed. Refresh and try again.'); }
function due(value) { const date = new Date(value); requireValue(value && Number.isFinite(date.getTime()) && date.getTime() > Date.now(), 'Follow-up date/time must be in the future.'); return date.toISOString(); }
function phone(value) {
  let p = text(value).replace(/\D/g, '');
  if (p.length === 12 && p.startsWith('91')) p = p.slice(2);
  if (p.length === 11 && p[0] === '0') p = p.slice(1);
  requireValue(/^[6-9]\d{9}$/.test(p), 'Enter a valid 10-digit Indian mobile number.');
  return p;
}
function email(value) { const e = text(value, 254).toLowerCase(); requireValue(!e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), 'Enter a valid email address.'); return e; }
function duplicate(app, name, p, e) { return list(app, name, 'phone = {:phone} || (emailKey != "" && emailKey = {:email})', { phone: p, email: e }).length > 0; }
function owner(app, id, role) {
  let u;
  try { u = user(app.findRecordById('crm_users', id)); } catch { fail('Select an existing ' + role.replace('_', ' ') + '.'); }
  requireValue(u.status === 'Active' && u.role === role, 'Assignee must be an active ' + role.replace('_', ' ') + '.');
  return u;
}
function event(app, u, l, type, note, extra) {
  const p = out(l); p.leadId = l.id;
  save(app, 'activity', Object.assign({ type, note, actorId: u.id, actorName: u.name, actorRole: u.role, teamLeaderAtTime: p.teamLeaderId, statusAtTime: p.status, at: new Date().toISOString() }, extra || {}), p);
  audit(app, u, type, p, note);
}
function state(app, auth) {
  const u = actor(app, auth), leads = list(app, 'leads', scope(u), { actor: u.id }).map(out);
  const result = { user: u, leads, settings: settings(app) };
  const allUsers = app.findRecordsByFilter('crm_users', 'id != ""', 'name', 10000, 0).map(user);
  result.users = allUsers.filter(x => u.role === 'admin' || x.id === u.id || (u.role === 'manager' && x.managerId === u.id) || (u.role === 'team_leader' && x.teamLeaderId === u.id) || x.id === u.teamLeaderId || x.id === u.managerId);
  for (const name of ['clients', 'activity', 'followups', 'assignments', 'documents']) {
    // Child access metadata moves with the lead, while immutable event payloads are preserved.
    result[name] = list(app, name, scope(u), { actor: u.id }).map(out);
  }
  result.requests = list(app, 'requests', scope(u), { actor: u.id }).map(out).filter(q => q.status !== 'Draft' || q.ownerId === u.id);
  result.notifications = list(app, 'notifications', 'ownerId = {:actor}', { actor: u.id }).map(out);
  result.imports = manager(u) ? list(app, 'imports', scope(u), { actor: u.id }).map(out) : [];
  result.audit = manager(u) ? list(app, 'audit', scope(u), { actor: u.id }).map(out) : [];
  for (const key of Object.keys(result)) if (Array.isArray(result[key]) && result[key].length >= 10000) fail('This workspace exceeds the current 10,000-record read limit. Contact your administrator before continuing; counts would otherwise be incomplete.');
  return result;
}
function create(app, u, b) {
  requireValue(manager(u), 'Only Managers and Admins can create or import leads.');
  const cfg = settings(app), p = phone(b.phone), e = email(b.email);
  requireValue(text(b.name, 120).length >= 2, 'Lead name is required.');
  requireValue(cfg.states.includes(b.state), 'Select an active state.');
  requireValue(cfg.sources.includes(b.source), 'Select an active source.');
  requireValue(!duplicate(app, 'leads', p, e) && !duplicate(app, 'clients', p, e), 'Duplicate phone or email; existing records were preserved.');
  const l = new Record(app.findCollectionByNameOrId('crm_leads'));
  if (u.role === 'admin' && b.managerId) owner(app, b.managerId, 'manager');
  l.set('phone', p); l.set('emailKey', e);
  const payload = { name: text(b.name, 120), phone: p, email: e, state: b.state, city: text(b.city, 120), source: b.source, campaign: text(b.campaign, 120), priority: ['High', 'Normal', 'Low'].includes(b.priority) ? b.priority : 'Normal', status: 'New', kycStatus: 'Not Started', archived: false };
  const r = save(app, 'leads', payload, { managerId: u.role === 'manager' ? u.id : text(b.managerId) }, l);
  event(app, u, r, 'Created', 'Lead created');
  return r;
}
function assign(app, u, auth, b) {
  requireValue(u.role !== 'employee', 'Employees cannot assign leads.');
  requireValue(Array.isArray(b.ids) && b.ids.length > 0 && b.ids.length <= 500, 'Select 1–500 leads.');
  requireValue(new Set(b.ids).size === b.ids.length, 'Duplicate lead selection.');
  const targetRole = u.role === 'team_leader' ? 'employee' : (b.targetRole || 'team_leader');
  requireValue(targetRole === 'team_leader' || targetRole === 'employee', 'Invalid assignment target.');
  const target = owner(app, b.targetId, targetRole);
  let tl = targetRole === 'team_leader' ? target : owner(app, target.teamLeaderId, 'team_leader');
  requireValue(tl.managerId && owner(app, tl.managerId, 'manager'), 'Team Leader must have an active Manager.');
  requireValue(u.role !== 'team_leader' || target.teamLeaderId === u.id, 'Employee must belong to your team.');
  requireValue(u.role !== 'manager' || tl.managerId === u.id, 'Team Leader must report to you.');
  if (manager(u) && targetRole === 'employee') requireValue(text(b.reason).length >= 5, 'Direct assignment override requires a reason.');
  let request;
  if (b.requestId) {
    request = app.findRecordById('crm_requests', b.requestId);
    const q = out(request);
    requireValue(targetRole === 'employee' && q.ownerId === target.id && ['Approved', 'Partially Approved'].includes(q.status), 'Request is not approved for this employee.');
    requireValue((q.allocatedIds || []).length + b.ids.length <= q.approvedCount, 'Allocation exceeds the approved request count.');
  }
  for (const id of b.ids) {
    const l = lead(app, auth, id), before = out(l), payload = data(l);
    version(l, (b.versions || {})[id]);
    requireValue(!before.archived && before.status !== 'Converted', 'Archived or converted leads cannot be reassigned.');
    requireValue(before.ownerId !== target.id, 'Lead is already assigned to this employee.');
    if (u.role === 'team_leader') requireValue(before.teamLeaderId === u.id, 'Lead is outside your team.');
    if (before.ownerId || (before.teamLeaderId && before.teamLeaderId !== tl.id)) requireValue(text(b.reason).length >= 5, 'Reassignment requires a reason.');
    if (request) {
      const q = data(request);
      requireValue(before.state === q.state && !(q.allocatedIds || []).includes(id), 'Lead must match the requested state and cannot be counted twice.');
    }
    const next = { leadId: id, managerId: tl.managerId, teamLeaderId: tl.id, ownerId: targetRole === 'employee' ? target.id : '' };
    save(app, 'leads', payload, next, l);
    for (const collection of ['activity', 'followups', 'documents', 'assignments']) {
      for (const child of list(app, collection, 'leadId = {:id}', { id })) {
        // Change access metadata only. Submitted response and completed follow-up data stay intact.
        for (const key of ['ownerId', 'teamLeaderId', 'managerId']) child.set(key, next[key]);
        app.save(child);
      }
    }
    save(app, 'assignments', { previousOwnerId: before.ownerId, previousTeamLeaderId: before.teamLeaderId, newOwnerId: next.ownerId, newTeamLeaderId: next.teamLeaderId, actorId: u.id, actorName: u.name, reason: text(b.reason), type: before.teamLeaderId ? 'Reassignment' : 'Initial assignment', source: b.requestId ? 'Lead request' : b.source || 'Manual', notificationStatus: 'Recorded', at: new Date().toISOString() }, next);
    event(app, u, l, 'Assignment', 'Assigned to ' + target.name + (b.reason ? ': ' + text(b.reason) : ''));
    notify(app, target.id, 'Lead assigned: ' + before.name, id);
  }
  if (request) {
    const q = data(request); q.allocatedIds = (q.allocatedIds || []).concat(b.ids);
    if (q.allocatedIds.length === q.approvedCount) q.status = 'Fulfilled';
    q.history.push({ action: q.status === 'Fulfilled' ? 'Fulfilled' : 'Allocated', note: b.ids.length + ' leads allocated', actor: u.name, at: new Date().toISOString() });
    save(app, 'requests', q, null, request);
  }
  return { success: true, count: b.ids.length };
}
function action(app, auth, b) {
  const u = actor(app, auth), type = b.action;
  if (type === 'create') return out(create(app, u, b));
  if (type === 'assign') return assign(app, u, auth, b);
  if (type === 'import') {
    requireValue(manager(u), 'Only Managers and Admins can import leads.');
    requireValue(Array.isArray(b.rows) && b.rows.length > 0 && b.rows.length <= 1000, 'Import 1–1000 rows at a time.');
    const results = [], created = [];
    // Per-row validation failures are recorded; unexpected DB failures roll back the whole import.
    for (let i = 0; i < b.rows.length; i++) {
      const row = Object.assign({}, b.rows[i], { source: b.rows[i].source || b.source, managerId: b.managerId });
      let valid = true, message = '';
      try {
        const p = phone(row.phone), e = email(row.email), cfg = settings(app);
        requireValue(text(row.name).length >= 2, 'Lead name is required.');
        requireValue(cfg.states.includes(row.state), 'Invalid state.');
        requireValue(cfg.sources.includes(row.source), 'Invalid source.');
        requireValue(!duplicate(app, 'leads', p, e) && !duplicate(app, 'clients', p, e), 'Duplicate phone or email.');
      } catch (error) { valid = false; message = String(error.message || error); }
      if (!valid) { results.push({ row: i + 2, status: message.toLowerCase().includes('duplicate') ? 'Duplicate' : 'Failed', message }); continue; }
      const l = create(app, u, row); created.push(out(l)); results.push({ row: i + 2, status: 'Created', leadId: l.id, message: '' });
    }
    if (b.teamLeaderId && created.length) {
      const versions = {}; created.forEach(l => { versions[l.id] = l.version; });
      for (let i = 0; i < created.length; i += 500) assign(app, u, auth, { ids: created.slice(i, i + 500).map(l => l.id), versions, targetId: b.teamLeaderId, targetRole: 'team_leader', source: 'Import' });
    }
    const report = { filename: text(b.filename, 200), actor: u.name, total: b.rows.length, createdCount: created.length, failed: results.filter(r => r.status === 'Failed').length, duplicates: results.filter(r => r.status === 'Duplicate').length, skipped: results.filter(r => r.status !== 'Created').length, results, assignment: b.teamLeaderId || 'Unassigned', at: new Date().toISOString() };
    save(app, 'imports', report, { managerId: u.role === 'manager' ? u.id : b.managerId, ownerId: u.id });
    audit(app, u, 'Import', null, text(b.filename) + ': ' + created.length + ' created');
    return report;
  }
  if (type === 'request') {
    requireValue(u.role === 'employee', 'Only Employees can request leads.');
    const tl = owner(app, u.teamLeaderId, 'team_leader'), cfg = settings(app);
    requireValue(cfg.states.includes(b.state), 'Select an active state.');
    requireValue(Number.isInteger(Number(b.count)) && Number(b.count) > 0 && Number(b.count) <= cfg.maxRequest, 'Requested quantity exceeds the configured limit or is invalid.');
    if (b.requiredBy) due(b.requiredBy);
    requireValue(!list(app, 'requests', 'ownerId = {:id}', { id: u.id }).some(r => { const q = data(r); return q.state === b.state && !['Rejected', 'Fulfilled', 'Cancelled', 'Expired'].includes(q.status); }), 'An active request already exists for this state.');
    const q = save(app, 'requests', { state: b.state, count: Number(b.count), remarks: text(b.remarks), requiredBy: b.requiredBy || '', status: b.draft ? 'Draft' : 'Submitted', approvedCount: 0, allocatedIds: [], history: [{ action: b.draft ? 'Draft' : 'Submitted', actor: u.name, at: new Date().toISOString() }] }, { ownerId: u.id, teamLeaderId: tl.id, managerId: tl.managerId });
    if (!b.draft) notify(app, tl.id, 'New lead request from ' + u.name);
    audit(app, u, 'Lead request', out(q), q.id);
    return out(q);
  }
  if (type === 'reviewRequest') {
    const q = app.findRecordById('crm_requests', b.id), before = out(q), payload = data(q);
    version(q, b.version);
    requireValue(u.role === 'admin' || (u.role === 'manager' && before.managerId === u.id) || (u.role === 'team_leader' && before.teamLeaderId === u.id) || (u.role === 'employee' && before.ownerId === u.id), 'Request is outside your scope.');
    requireValue(!['Rejected', 'Cancelled', 'Expired', 'Fulfilled'].includes(before.status), 'This request is closed.');
    const employeeAction = ['Submitted', 'Cancelled'].includes(b.status);
    requireValue(u.role !== 'employee' || (employeeAction && before.ownerId === u.id), 'Employees cannot approve requests.');
    if (b.status === 'Submitted') requireValue(before.status === 'Draft', 'Only drafts can be submitted.');
    if (!employeeAction) requireValue(before.status !== 'Draft', 'Draft requests must be submitted by their employee first.');
    requireValue(['Submitted', 'Seen by Team Leader', 'Under Review', 'Approved', 'Partially Approved', 'Rejected', 'Cancelled', 'Expired'].includes(b.status), 'Invalid request status.');
    requireValue(!(before.allocatedIds || []).length, 'Requests with allocations cannot be changed.');
    if (['Partially Approved', 'Rejected'].includes(b.status)) requireValue(text(b.comment).length >= 5, 'A review comment is required.');
    if (b.status === 'Expired') requireValue(before.requiredBy && new Date(before.requiredBy).getTime() < Date.now(), 'Only overdue requests can expire.');
    payload.status = b.status;
    if (['Approved', 'Partially Approved'].includes(b.status)) {
      payload.approvedCount = b.status === 'Approved' ? before.count : Number(b.count);
      requireValue(Number.isInteger(payload.approvedCount) && payload.approvedCount > 0 && payload.approvedCount <= before.count && (b.status !== 'Partially Approved' || payload.approvedCount < before.count), 'Partial approval must be a positive quantity below the requested count.');
    }
    payload.history.push({ action: b.status, actor: u.name, note: text(b.comment), at: new Date().toISOString() });
    save(app, 'requests', payload, null, q); audit(app, u, 'Request ' + b.status, before, text(b.comment));
    notify(app, b.status === 'Submitted' ? before.teamLeaderId : before.ownerId, 'Lead request: ' + b.status);
    if (b.status === 'Under Review') notify(app, before.managerId, 'Lead request forwarded for review');
    return out(q);
  }
  if (type === 'settings') {
    requireValue(u.role === 'admin', 'Only Admin can edit global settings.');
    const cfg = settings(app), found = list(app, 'settings')[0];
    if (found) version(found, b.version);
    requireValue(Number.isInteger(Number(b.maxRequest)) && b.maxRequest > 0 && b.maxRequest <= 1000, 'Request maximum must be 1–1000.');
    requireValue(Array.isArray(b.sources) && b.sources.length && b.sources.every(s => text(s, 120) === s && s.length), 'Provide valid source names.');
    requireValue(new Set(b.sources).size === b.sources.length, 'Source names must be unique.');
    requireValue(cfg.sources.every(s => b.sources.includes(s)), 'Existing sources cannot be removed; historical workflows depend on them.');
    save(app, 'settings', Object.assign({}, cfg, { maxRequest: Number(b.maxRequest), aadhaarBackRequired: Boolean(b.aadhaarBackRequired), sources: b.sources }), null, found);
    audit(app, u, 'Configuration', null, JSON.stringify({ before: cfg, after: b }));
    return { success: true };
  }
  if (type === 'user') {
    requireValue(u.role === 'admin', 'Only Admin can manage identities and hierarchy.');
    const r = b.id ? app.findRecordById('crm_users', b.id) : new Record(app.findCollectionByNameOrId('crm_users'));
    requireValue(['admin', 'manager', 'team_leader', 'employee'].includes(b.role), 'Invalid role.');
    requireValue(['Active', 'Inactive', 'On Leave', 'Blocked'].includes(b.status), 'Invalid availability.');
    requireValue(text(b.name).length >= 2 && email(b.email), 'Name and email are required.');
    requireValue(!b.id || (b.role === r.getString('role') && text(b.teamLeaderId) === r.getString('teamLeaderId') && text(b.managerId) === r.getString('managerId')), 'Existing identity role/mapping changes require a reviewed ownership migration.');
    requireValue(b.id !== u.id || b.status === 'Active', 'You cannot disable your own account.');
    let managerId = '', teamLeaderId = '';
    if (b.role === 'team_leader') managerId = owner(app, b.managerId, 'manager').id;
    if (b.role === 'employee') { const tl = owner(app, b.teamLeaderId, 'team_leader'); teamLeaderId = tl.id; managerId = tl.managerId; }
    for (const k of ['name', 'role', 'status']) r.set(k, text(b[k], 120));
    r.set('email', email(b.email)); r.set('managerId', managerId); r.set('teamLeaderId', teamLeaderId); r.set('branch', text(b.branch, 120));
    if (!b.id || b.password) { requireValue(String(b.password || '').length >= 12, 'Use a password of at least 12 characters.'); r.setPassword(b.password); }
    app.save(r); audit(app, u, b.id ? 'User updated' : 'User created', null, r.id + ' ' + b.role + ' ' + b.status);
    return user(r);
  }
  if (type === 'readNotification') {
    const r = app.findRecordById('crm_notifications', b.id); requireValue(r.getString('ownerId') === u.id, 'Notification is outside your scope.');
    save(app, 'notifications', Object.assign(data(r), { read: true }), null, r); return { success: true };
  }
  const l = lead(app, auth, b.leadId), before = out(l), payload = data(l);
  version(l, b.version);
  const parent = Object.assign({}, before, { leadId: l.id });
  requireValue(!before.archived || type === 'restore', 'Restore this archived lead before making changes.');
  if (type === 'edit') {
    const p = phone(b.phone), e = email(b.email), cfg = settings(app);
    requireValue(text(b.name, 120).length >= 2 && cfg.states.includes(b.state) && cfg.sources.includes(b.source), 'Name, active state and source are required.');
    requireValue(['High', 'Normal', 'Low'].includes(b.priority), 'Select a valid priority.');
    requireValue(!list(app, 'leads', 'id != {:id} && (phone = {:p} || (emailKey != "" && emailKey = {:e}))', { id: l.id, p, e }).length, 'Another lead already uses this phone or email.');
    requireValue(!list(app, 'clients', 'leadId != {:id} && (phone = {:p} || (emailKey != "" && emailKey = {:e}))', { id: l.id, p, e }).length, 'Another client already uses this phone or email.');
    const changes = { name: text(b.name, 120), phone: p, email: e, state: b.state, city: text(b.city, 120), source: b.source, campaign: text(b.campaign, 120), priority: b.priority };
    Object.assign(payload, changes); l.set('phone', p); l.set('emailKey', e); save(app, 'leads', payload, null, l);
    for (const client of list(app, 'clients', 'leadId = {:id}', { id: l.id })) { client.set('phone', p); client.set('emailKey', e); save(app, 'clients', Object.assign(data(client), changes), null, client); }
    event(app, u, l, 'Edit', 'Contact details updated', { before: { name: before.name, phone: before.phone, email: before.email, state: before.state, city: before.city, source: before.source, campaign: before.campaign, priority: before.priority }, after: changes }); return out(l);
  }
  if (type === 'kycProfile') {
    requireValue(text(b.fullName).length >= 2 && email(b.email), 'KYC full name and email are required.');
    const pan = text(b.pan).toUpperCase(); requireValue(/^[A-Z]{5}\d{4}[A-Z]$/.test(pan), 'Invalid PAN format.');
    requireValue(['Individual', 'Non-Individual', 'Company'].includes(b.formType), 'Select a KYC form type.');
    requireValue(before.kycStatus !== 'KYC Verified', 'Upload a new document version before amending verified KYC.');
    payload.kycProfile = { fullName: text(b.fullName, 120), mobile: phone(b.mobile), email: email(b.email), pan, formType: b.formType };
    if (['Under Team Leader Review', 'Under Manager/Admin Review'].includes(before.kycStatus)) payload.kycStatus = 'Pending Employee Upload';
    save(app, 'leads', payload, null, l); event(app, u, l, 'KYC details', 'KYC profile updated', { previous: before.kycProfile || null, current: payload.kycProfile }); return out(l);
  }
  if (type === 'response' || type === 'correction' || type === 'completeFollowup') {
    requireValue(text(b.note).length >= 2, 'Enter a response before saving.');
    let originalId = '';
    if (type === 'correction') { const original = app.findRecordById('crm_activity', b.originalId); requireValue(original.getString('leadId') === l.id, 'Original entry belongs to a different lead.'); originalId = original.id; }
    if (type === 'completeFollowup') {
      const f = app.findRecordById('crm_followups', b.followupId);
      requireValue(f.getString('leadId') === l.id && data(f).status === 'Open', 'Follow-up is already completed or belongs to another lead.');
      save(app, 'followups', Object.assign(data(f), { status: 'Completed', completedAt: new Date().toISOString(), response: text(b.note), completedBy: u.id }), parent, f);
    }
    let nextDue = '';
    if (b.nextDue) {
      requireValue(before.ownerId, 'Assign an Employee before scheduling a follow-up.'); nextDue = due(b.nextDue);
      save(app, 'followups', { due: nextDue, status: 'Open', createdBy: u.id, response: text(b.note) }, parent);
    }
    event(app, u, l, type === 'correction' ? 'Correction' : 'Call', text(b.note), { outcome: text(b.outcome, 120), nextDue, originalId, followupId: b.followupId || '' });
    payload.lastResponse = text(b.note); save(app, 'leads', payload, null, l);
    return out(l);
  }
  if (type === 'status') {
    requireValue(before.status !== 'Converted' && statuses.includes(b.status), 'Invalid status transition.');
    if (b.status === 'Qualified') requireValue(before.ownerId && list(app, 'activity', 'leadId = {:id}', { id: l.id }).some(r => data(r).type === 'Call'), 'Qualification requires an Employee and a recorded response.');
    if (b.status === 'Lost') requireValue(text(b.reason).length >= 2, 'A lost reason is required.');
    event(app, u, l, 'Status', before.status + ' → ' + b.status + (b.reason ? ': ' + text(b.reason) : ''));
    payload.status = b.status; save(app, 'leads', payload, null, l); return out(l);
  }
  if (type === 'archive' || type === 'restore') {
    requireValue(manager(u), 'Only Managers and Admins can archive or restore.');
    requireValue(text(b.reason).length >= 5, 'An archive/restore reason is required.');
    payload.archived = type === 'archive'; save(app, 'leads', payload, null, l); event(app, u, l, type, text(b.reason)); return out(l);
  }
  if (type === 'convert') {
    requireValue(before.status === 'Qualified' && before.ownerId, 'Only qualified leads with an Employee owner can convert.');
    requireValue(!list(app, 'clients', 'leadId = {:id}', { id: l.id }).length && !duplicate(app, 'clients', before.phone, before.email), 'This lead or contact already has a client record.');
    const c = new Record(app.findCollectionByNameOrId('crm_clients')); c.set('phone', before.phone); c.set('emailKey', before.email);
    save(app, 'clients', { name: before.name, phone: before.phone, email: before.email, state: before.state, source: before.source, campaign: before.campaign, convertedBy: u.id, convertedAt: new Date().toISOString(), status: 'Active' }, parent, c);
    payload.status = 'Converted'; payload.clientId = c.id; save(app, 'leads', payload, null, l);
    event(app, u, l, 'Conversion', 'Client created; activity, documents and follow-ups remain linked to this lead.');
    notify(app, before.ownerId, 'Converted to client: ' + before.name, l.id); return out(c);
  }
  if (type === 'submitKyc' || type === 'reviewKyc') {
    const documents = list(app, 'documents', 'leadId = {:id}', { id: l.id }).map(out), latest = {};
    for (const d of documents) if (!latest[d.kind] || d.documentVersion > latest[d.kind].documentVersion) latest[d.kind] = d;
    const mandatory = ['PAN', 'Aadhaar Front'].concat(settings(app).aadhaarBackRequired ? ['Aadhaar Back'] : []);
    requireValue(mandatory.every(k => latest[k]), 'PAN and all required Aadhaar documents must be uploaded.');
    requireValue(before.kycProfile && before.kycProfile.fullName && before.kycProfile.mobile && before.kycProfile.email && before.kycProfile.formType && before.kycProfile.pan === latest.PAN.maskedNumber, 'Save complete KYC details with a PAN matching the uploaded document.');
    if (type === 'submitKyc') {
      requireValue(['Not Started', 'Pending Employee Upload', 'Reupload Required', 'KYC Rejected'].includes(before.kycStatus), 'KYC is already submitted or verified.');
      if (before.kycStatus === 'KYC Rejected') requireValue(documents.some(d => new Date(d.created).getTime() > new Date(before.kycReviewedAt).getTime()), 'Upload corrected documents before resubmission.');
      payload.kycStatus = 'Under Team Leader Review';
      notify(app, before.teamLeaderId || before.managerId, 'KYC submitted: ' + before.name, l.id);
    } else {
      requireValue(u.role !== 'employee', 'Employees cannot review KYC.');
      requireValue(['Under Team Leader Review', 'Under Manager/Admin Review'].includes(before.kycStatus), 'KYC must be submitted before review.');
      requireValue(['Approve', 'Reject', 'Forward'].includes(b.decision), 'Invalid KYC decision.');
      requireValue(b.decision !== 'Approve' || manager(u), 'Final verification requires Manager or Admin.');
      if (b.decision === 'Reject') requireValue(text(b.reason).length >= 5, 'A rejection reason is required.');
      payload.kycStatus = b.decision === 'Approve' ? 'KYC Verified' : b.decision === 'Reject' ? 'KYC Rejected' : 'Under Manager/Admin Review';
      payload.kycReviewedAt = new Date().toISOString(); payload.kycReason = text(b.reason);
      notify(app, b.decision === 'Forward' ? before.managerId : before.ownerId, 'KYC: ' + payload.kycStatus + ' — ' + before.name, l.id);
    }
    save(app, 'leads', payload, null, l); event(app, u, l, 'KYC', payload.kycStatus + (b.reason ? ': ' + text(b.reason) : '')); return out(l);
  }
  fail('Unknown CRM action.');
}
function upload(app, auth, b, files) {
  const u = actor(app, auth), l = lead(app, auth, b.leadId), before = out(l), payload = data(l);
  version(l, b.version);
  requireValue(!before.archived && before.ownerId, 'KYC requires an active lead with an Employee owner.');
  requireValue(['PAN', 'Aadhaar Front', 'Aadhaar Back', 'KYC Form'].includes(b.kind), 'Invalid document type.');
  requireValue(files && files.length === 1, 'Select one PDF, JPEG or PNG up to 5 MB.');
  requireValue(text(b.holderName).length >= 2, 'Document holder name is required.');
  let masked = '';
  if (b.kind === 'PAN') { masked = text(b.number).toUpperCase(); requireValue(/^[A-Z]{5}\d{4}[A-Z]$/.test(masked), 'Invalid PAN format.'); }
  else if (b.kind !== 'KYC Form') { const n = text(b.number).replace(/\s/g, ''); requireValue(/^[2-9]\d{11}$/.test(n), 'Aadhaar must contain 12 digits and start with 2–9.'); masked = 'XXXX-XXXX-' + n.slice(-4); }
  const previous = list(app, 'documents', 'leadId = {:id}', { id: l.id }).filter(r => data(r).kind === b.kind).sort((a, b) => data(b).documentVersion - data(a).documentVersion);
  if (previous.length || before.kycStatus === 'KYC Verified') requireValue(text(b.reason).length >= 5, 'Reupload requires a reason; previous versions will be preserved.');
  const d = new Record(app.findCollectionByNameOrId('crm_documents')); d.set('file', files[0]);
  // Original filenames can contain Aadhaar numbers; only the protected file field keeps its storage name.
  const parent = Object.assign({}, before, { leadId: l.id });
  save(app, 'documents', { kind: b.kind, holderName: text(b.holderName, 120), maskedNumber: masked, documentVersion: previous.length + 1, uploadedBy: u.name, reason: text(b.reason), previousId: previous.length ? previous[0].id : '' }, parent, d);
  payload.kycStatus = previous.length ? 'Reupload Required' : 'Pending Employee Upload'; save(app, 'leads', payload, null, l);
  event(app, u, l, 'KYC upload', b.kind + ' version ' + (previous.length + 1) + (b.reason ? ': ' + text(b.reason) : ''));
  return out(d);
}
function reminders(app) {
  const now = Date.now();
  for (const f of list(app, 'followups')) {
    const d = data(f); if (d.status !== 'Open' || d.reminderSentAt || new Date(d.due).getTime() > now) continue;
    const l = app.findRecordById('crm_leads', f.getString('leadId')), p = out(l); if (p.archived) continue;
    for (const id of [...new Set([p.ownerId, p.teamLeaderId, p.managerId].filter(Boolean))]) notify(app, id, 'Follow-up due: ' + p.name, l.id);
    d.reminderSentAt = new Date().toISOString(); save(app, 'followups', d, null, f);
  }
}
module.exports = { state, action, upload, lead, reminders };
