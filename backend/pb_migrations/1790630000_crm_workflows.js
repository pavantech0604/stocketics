/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Retain every legacy record. Public APIs must not bypass the new identity boundary.
  for (const name of ['employees', 'leads', 'leaves', 'attendance', 'confirmed_payments', 'kyc_records', 'call_logs']) {
    const collection = app.findCollectionByNameOrId(name);
    for (const rule of ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule']) collection[rule] = null;
    app.save(collection);
  }
  const users = new Collection({ name: 'crm_users', type: 'auth',
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    authRule: 'status = "Active"', passwordAuth: { enabled: true, identityFields: ['email'] },
    fields: [
      { name: 'name', type: 'text', required: true, max: 120 },
      { name: 'role', type: 'select', required: true, maxSelect: 1, values: ['admin', 'manager', 'team_leader', 'employee'] },
      { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['Active', 'Inactive', 'On Leave', 'Blocked'] },
      { name: 'managerId', type: 'text' }, { name: 'teamLeaderId', type: 'text' },
      { name: 'branch', type: 'text', max: 120 },
    ],
  });
  app.save(users);
  const names = ['leads', 'clients', 'activity', 'followups', 'requests', 'assignments', 'documents', 'notifications', 'imports', 'audit', 'settings'];
  for (const name of names) {
    const fields = [
      { name: 'data', type: 'json', maxSize: 5000000 },
      { name: 'leadId', type: 'text' }, { name: 'ownerId', type: 'text' },
      { name: 'teamLeaderId', type: 'text' }, { name: 'managerId', type: 'text' },
      { name: 'version', type: 'number', onlyInt: true, min: 0 },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ];
    const indexes = [];
    if (name === 'leads' || name === 'clients') {
      fields.push({ name: 'phone', type: 'text' }, { name: 'emailKey', type: 'text' });
      indexes.push(`CREATE UNIQUE INDEX idx_crm_${name}_phone ON crm_${name} (phone) WHERE phone != ''`);
      indexes.push(`CREATE UNIQUE INDEX idx_crm_${name}_email ON crm_${name} (emailKey) WHERE emailKey != ''`);
    }
    if (name === 'clients') indexes.push('CREATE UNIQUE INDEX idx_crm_client_lead ON crm_clients (leadId)');
    if (name === 'documents') fields.push({ name: 'file', type: 'file', maxSelect: 1, maxSize: 5242880, protected: true, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] });
    indexes.push(`CREATE INDEX idx_crm_${name}_scope ON crm_${name} (managerId, teamLeaderId, ownerId)`);
    indexes.push(`CREATE INDEX idx_crm_${name}_lead ON crm_${name} (leadId)`);
    app.save(new Collection({ name: 'crm_' + name, type: 'base', fields, indexes,
      listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null }));
  }
}, () => {
  throw new Error('Non-destructive migration: restore a reviewed backup to roll back. No CRM records will be deleted.');
});
