import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';
import { useApp } from '../../state/store';
import { callbackAt, isCallbackLead } from '../../crm/legacyWorkflow';
import { useClock } from '../../crm/useClock';
import '../manager/leadWorkflow.css';

export function LeadCallbackReminder() {
  const { currentUser, advisoryLeads, setActiveTab, role } = useApp();
  const now = useClock();
  const [dismissed, setDismissed] = useState<Record<string, number>>({});
  const due = advisoryLeads.filter(lead => lead.assignedToId === currentUser.id && !lead.isTeamPool && isCallbackLead(lead) && callbackAt(lead) <= now);
  const keyFor = (lead: typeof due[number]) => `${currentUser.id}:${lead.id}:${lead.callbackDate}:${lead.callbackTime}`;
  const lead = due.find(item => (dismissed[keyFor(item)] || 0) <= now);
  if (role !== 'employee' || !lead) return null;
  const snooze = () => setDismissed(previous => ({ ...previous, [keyFor(lead)]: now + 15 * 60000 }));
  return <aside className="lead-callback-reminder" role="status" aria-label="Callback reminder">
    <header><Clock size={18} /><strong>Callback due {due.length > 1 ? `· ${due.length} leads` : ''}</strong><button aria-label="Remind me in 15 minutes" onClick={snooze}><X size={17} /></button></header>
    <h3>{lead.clientName}</h3><p>{lead.phone} · {new Date(callbackAt(lead)).toLocaleString()}</p>
    <p>{lead.dispositionHistory?.[0]?.note || lead.description || 'Review the previous conversation before calling.'}</p>
    <footer><button onClick={snooze}>In 15 minutes</button><button className="btn btn-primary" onClick={() => { setActiveTab('today-followup'); sessionStorage.setItem('crm:pending-response-lead', lead.id); window.dispatchEvent(new CustomEvent('crm:open-lead-response', { detail: lead.id })); snooze(); }}>Open response</button></footer>
  </aside>;
}
