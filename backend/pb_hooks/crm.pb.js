/// <reference path="../pb_data/types.d.ts" />
cronAdd('crm-followup-reminders', '*/5 * * * *', () => {
  const service = require(__hooks + '/crm.js');
  $app.runInTransaction(tx => service.reminders(tx));
});
routerAdd('GET', '/api/crm/state', (e) => {
  return e.json(200, require(__hooks + '/crm.js').state($app, e.auth));
}, $apis.requireAuth('crm_users'));

routerAdd('POST', '/api/crm/action', (e) => {
  const service = require(__hooks + '/crm.js');
  let result;
  $app.runInTransaction((tx) => { result = service.action(tx, e.auth, e.requestInfo().body); });
  return e.json(200, result || { success: true });
}, $apis.requireAuth('crm_users'));

routerAdd('POST', '/api/crm/document', (e) => {
  const service = require(__hooks + '/crm.js');
  let result;
  $app.runInTransaction((tx) => { result = service.upload(tx, e.auth, e.requestInfo().body, e.findUploadedFiles('file')); });
  return e.json(200, result);
}, $apis.requireAuth('crm_users'));

routerAdd('GET', '/api/crm/document/{id}', (e) => {
  const service = require(__hooks + '/crm.js');
  const doc = $app.findRecordById('crm_documents', e.request.pathValue('id'));
  service.lead($app, e.auth, doc.getString('leadId'));
  const fs = $app.newFilesystem();
  try {
    e.response.header().set('Content-Disposition', 'attachment');
    e.response.header().set('Cache-Control', 'no-store');
    e.response.header().set('X-Content-Type-Options', 'nosniff');
    return fs.serve(e.response, e.request, doc.baseFilesPath() + '/' + doc.getString('file'), doc.getString('file'));
  } finally { fs.close(); }
}, $apis.requireAuth('crm_users'));
