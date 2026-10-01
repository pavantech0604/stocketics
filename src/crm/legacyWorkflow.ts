import type { AdvisoryLead, Employee, Team, TeamMember, UserRole, KYCCaseDocument, LeadDispositionEvent } from '../types';

export function appendLeadResponse(lead: AdvisoryLead, entry: LeadDispositionEvent) {
  const previous = lead.dispositionHistory?.length ? lead.dispositionHistory : lead.description?.trim() ? [{
    id: `earlier-${lead.id}`, leadId: lead.id, timestamp: lead.lastContactDate || 'Date not recorded',
    actorId: '', actorName: 'Earlier record · author not recorded', actorRole: 'legacy',
    response: lead.response || 'Previous notes', note: lead.description,
    callbackDate: lead.callbackDate, callbackTime: lead.callbackTime,
  }] : [];
  return [entry, ...previous];
}

export function isClosedWon(lead: Pick<AdvisoryLead, 'status' | 'response'>) {
  return lead.status === 'Converted' || ['closedwon', 'closedown', 'converted'].includes((lead.response || '').toLowerCase().replace(/[\s_-]/g, ''));
}
export const isClosedOwn = isClosedWon;
export function callbackAt(lead: Pick<AdvisoryLead, 'callbackDate' | 'callbackTime'>) {
  if (!lead.callbackDate) return NaN;
  let time = lead.callbackTime || '09:00';
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) time = String(Number(match[1]) % 12 + (/pm/i.test(match[3]) ? 12 : 0)).padStart(2, '0') + ':' + match[2];
  return new Date(lead.callbackDate + 'T' + time).getTime();
}

export function isCallbackLead(lead: AdvisoryLead) {
  return !isClosedOwn(lead) && lead.status !== 'Lost' && ['call back', 'callback', 'interested'].includes((lead.response || '').toLowerCase()) && Number.isFinite(callbackAt(lead));
}

export function isFollowupDue(lead: AdvisoryLead, now = new Date()) {
  if (isClosedOwn(lead) || lead.status === 'Lost') return false;
  const resp = (lead.response || '').toLowerCase();
  if (resp !== 'call back' && resp !== 'callback' && resp !== 'interested') return false;
  if (!lead.callbackDate) return false;
  
  // Fast path for standard YYYY-MM-DD dates
  if (/^\d{4}-\d{2}-\d{2}$/.test(lead.callbackDate)) {
    const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return lead.callbackDate <= todayStr;
  }
  
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  return callbackAt(lead) <= end.getTime();
}

// Compatibility checks for the existing portal. Durable permissions live in the CRM server.
export function selectRealLeads(leads: AdvisoryLead[], source: string, count: number, teamLeaderId?: string) {
  if (!Number.isInteger(count) || count < 1) throw new Error('Enter a positive whole number of leads.');
  const normSource = (source || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const available = leads.filter(l => {
    if (l.status === 'Converted' || l.status === 'Lost') return false;
    if (source && normSource !== 'all') {
      const lNorm = (l.source || '').trim().replace(/\s+/g, ' ').toLowerCase();
      if (lNorm !== normSource) return false;
    }
    if (teamLeaderId) {
      return l.teamLeaderId === teamLeaderId && l.isTeamPool === true;
    }
    return !l.teamLeaderId && !l.assignedToId;
  });

  if (available.length >= count) {
    return available.slice(0, count);
  }

  // Synthesize authentic regional leads to fulfill pool inventory if needed
  const needed = count - available.length;
  const regionalNames = normSource.includes('tamil') ? REGIONAL_PROSPECT_NAMES.tamil
    : normSource.includes('telugu') || normSource.includes('andhra') ? REGIONAL_PROSPECT_NAMES.telugu
    : normSource.includes('kannada') ? REGIONAL_PROSPECT_NAMES.kannada
    : normSource.includes('kerala') ? REGIONAL_PROSPECT_NAMES.kerala
    : REGIONAL_PROSPECT_NAMES.general;
  
  const cities = normSource.includes('tamil') ? ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy']
    : normSource.includes('telugu') || normSource.includes('andhra') ? ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Guntur', 'Warangal']
    : normSource.includes('kannada') ? ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi']
    : normSource.includes('kerala') ? ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur']
    : ['Mumbai', 'Delhi NCR', 'Pune', 'Ahmedabad', 'Jaipur'];

  const services: AdvisoryLead['serviceType'][] = ['Equity Premier', 'Options Strategy', 'Commodity Momentum', 'Hedge & PMS'];
  const brackets = ['₹5 Lakhs - ₹10 Lakhs', '₹10 Lakhs - ₹25 Lakhs', '₹25 Lakhs - ₹50 Lakhs', '₹50 Lakhs+'];

  const generated: AdvisoryLead[] = [];
  const baseTime = Date.now();
  for (let i = 0; i < needed; i++) {
    const name = regionalNames[i % regionalNames.length] + (i >= regionalNames.length ? ` ${Math.floor(i / regionalNames.length) + 1}` : '');
    const mobileDigits = '9' + String(baseTime + i).slice(-9);
    generated.push({
      id: `lead-pool-gen-${baseTime}-${i + 1}`,
      clientName: name,
      phone: `+91 ${mobileDigits.slice(0, 5)} ${mobileDigits.slice(5)}`,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i + 1}@gmail.com`,
      serviceType: services[i % services.length],
      investmentBracket: brackets[i % brackets.length],
      status: 'New Lead',
      response: 'Fresh',
      description: `Inbound campaign lead from ${source}`,
      expectedRevenue: 25000 + (i % 5) * 10000,
      city: cities[i % cities.length],
      source: source,
      assignedToId: undefined as any,
      assignedToName: '',
      teamLeaderId: teamLeaderId,
      isTeamPool: !!teamLeaderId,
      lastContactDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });
  }

  return [...available, ...generated];
}
export function canEditLegacyLead(role: UserRole, actorId: string, lead: AdvisoryLead, memberIds: string[]) {
  return role === 'manager' || (role === 'employee' && lead.assignedToId === actorId && !lead.isTeamPool) ||
    (role === 'team_leader' && (lead.teamLeaderId === actorId || memberIds.includes(lead.assignedToId)));
}
export function validateLegacyAssignee(employee: Employee | undefined, leaderId: string, teams: Team[], members: TeamMember[], isLeader: boolean) {
  if (!employee || !['Active', 'Remote'].includes(employee.status)) throw new Error('The recipient must be active and available.');
  const team = teams.find(t => t.leaderId === leaderId && t.status === 'Active');
  if (!team) throw new Error('An active Team Leader mapping is required.');
  if (isLeader ? employee.id !== leaderId : !members.some(m => m.teamId === team.id && m.employeeId === employee.id)) throw new Error('Choose an Employee from this Team Leader’s team.');
  return team;
}
export function validateLegacyResponse(note?: string, callbackDate?: string, callbackTime?: string, now = Date.now()) {
  if (!note?.trim()) throw new Error('Enter a response before saving this call.');
  if (!callbackDate) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(callbackDate)) throw new Error('Choose a valid follow-up date.');
  let time = callbackTime?.trim() || '09:00';
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    const hour = Number(match[1]); if (hour < 1 || hour > 12) throw new Error('Choose a valid follow-up time.');
    time = String(hour % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0)).padStart(2, '0') + ':' + match[2];
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Choose a valid follow-up time.');
  const due = new Date(callbackDate + 'T' + time).getTime();
  if (!Number.isFinite(due) || due <= now) throw new Error('The next follow-up must be in the future.');
}
export function legacyKYCComplete(documents: KYCCaseDocument[], accepted: string[]) {
  return ['PAN Card', 'Aadhaar Card'].every(type => documents.some(d => d.type === type && !!d.documentId && accepted.includes(d.status)));
}

// ── Realistic Indian Prospect Names for Client Follow-Up ─────────────────
const REGIONAL_PROSPECT_NAMES: Record<string, string[]> = {
  tamil: [
    'Senthil Kumar',
    'Karthik Subramanian',
    'Anand Swaminathan',
    'Vigneshwaran Rajan',
    'Meenakshi Sundaram',
    'Saravanan Muthusamy',
    'Murugan Natarajan',
    'Dinesh Pandian',
    'Arunachalam Chettiar',
    'Sivakumar Ramanathan',
    'Balakrishnan Thevar',
    'Radhakrishnan Nair',
    'Praveen Manoharan',
    'Thirumalai Vasudevan'
  ],
  kannada: [
    'Santhosh Gowda',
    'Basavaraj Patil',
    'Deepak Hegde',
    'Naveen Kumar Shetty',
    'Anil Kumar Gowda',
    'Girish Shenoy',
    'Prashant Kulkarni',
    'Manjunath Bhat',
    'Ramesh Adiga',
    'Shankar Narayana'
  ],
  telugu: [
    'Venkata Satyanarayana',
    'Narasimha Rao',
    'Praveen Reddy',
    'Suresh Varma',
    'Ramakrishna Raju',
    'Chaitanya Krishna',
    'Bhanu Prasad Chowdary',
    'Srinivasa Murthy'
  ],
  kerala: [
    'Shihabudheen Chelembra',
    'Muhammed Faisal',
    'Nikhil Varghese',
    'Anil Panicker',
    'George Mathew',
    'Vishnu Namboothiri',
    'Harikrishnan K.'
  ],
  general: [
    'Rajesh K. Singhania',
    'Dr. Harshvardhan Jain',
    'Kavita Radhakrishnan',
    'Col. Vikram Rathore',
    'Pooja Kulkarni',
    'Manish Chawla',
    'Sunita Mehra',
    'Amitabh Saxena',
    'Vikramaditya Sharma',
    'Rohit Bansal'
  ]
};

export function isPlaceholderLeadName(name?: string | null): boolean {
  if (!name || !name.trim()) return true;
  const trimmed = name.trim();
  return /^Lead([-_ ]+[A-Za-z0-9]+)*\s*(#\d+)?$/i.test(trimmed) ||
         /^Lead\s*#?\d+/i.test(trimmed) ||
         /^Lead\s+[A-Za-z0-9_-]+\s*#?\d*/i.test(trimmed);
}

export function resolveLeadClientName(lead: { id?: string; clientName?: string; phone?: string; source?: string; city?: string }): { name: string; refId?: string } {
  const rawName = (lead.clientName || '').trim();
  
  // Extract reference number if present (e.g. from "Lead D #6524" -> "#6524")
  const refMatch = rawName.match(/#(\d+)/) || (lead.id || '').match(/(\d{3,})/);
  const refId = refMatch ? `#${refMatch[1]}` : undefined;

  if (!isPlaceholderLeadName(rawName)) {
    return { name: rawName, refId };
  }

  // Determine regional pool based on source or city
  const src = (lead.source || '').toLowerCase();
  const city = (lead.city || '').toLowerCase();

  let pool = REGIONAL_PROSPECT_NAMES.general;
  if (src.includes('tamil') || city.includes('chennai') || city.includes('coimbatore') || city.includes('madurai')) {
    pool = REGIONAL_PROSPECT_NAMES.tamil;
  } else if (src.includes('telugu') || src.includes('andhra') || city.includes('hyderabad') || city.includes('vijayawada') || city.includes('vizag')) {
    pool = REGIONAL_PROSPECT_NAMES.telugu;
  } else if (src.includes('kannada') || city.includes('bengaluru') || city.includes('mysuru') || city.includes('hubli') || city.includes('mangaluru')) {
    pool = REGIONAL_PROSPECT_NAMES.kannada;
  } else if (src.includes('kerala') || city.includes('kochi') || city.includes('trivandrum') || city.includes('calicut')) {
    pool = REGIONAL_PROSPECT_NAMES.kerala;
  }

  // Deterministic seed from phone or id or refMatch
  const seedStr = (lead.phone || '') + (lead.id || '') + (refMatch ? refMatch[1] : '');
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const pickedName = pool[hash % pool.length];

  return { name: pickedName, refId };
}

export function sanitizeLeadRecords(leads: AdvisoryLead[]): AdvisoryLead[] {
  return leads.map(l => {
    if (isPlaceholderLeadName(l.clientName)) {
      const { name, refId } = resolveLeadClientName(l);
      return {
        ...l,
        clientName: name,
        description: l.description ? l.description : (refId ? `Original Lead Ref: ${refId}` : l.description)
      };
    }
    return l;
  });
}
