import type { CRMRecord, CRMState } from './types';
export function nextFollowup(state: CRMState, id: string) {
  return state.followups.filter(f => f.leadId === id && f.status === 'Open').sort((a, b) => a.due.localeCompare(b.due))[0];
}
export function matchesTab(state: CRMState, lead: CRMRecord, tab: string, now = new Date()) {
  const followups = state.followups.filter(f => f.leadId === lead.id && f.status === 'Open');
  if (tab === 'Archived') return lead.archived;
  if (lead.archived) return false;
  if (tab === 'All') return true;
  if (tab === 'Unassigned') return !lead.teamLeaderId;
  if (tab === 'To Allocate') return !!lead.teamLeaderId && !lead.ownerId;
  if (tab === 'Assigned') return !!lead.ownerId;
  if (tab === 'Follow-up Due') return followups.some(f => new Date(f.due).toDateString() === now.toDateString());
  if (tab === 'Overdue') return followups.some(f => new Date(f.due).getTime() < now.getTime());
  if (tab === 'KYC Pending') return lead.kycStatus !== 'KYC Verified';
  return lead.status === tab;
}
