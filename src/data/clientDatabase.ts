import { ActiveClientRecordDetailed } from '../types';

/**
 * Master detailed client records matching Stocketics CRM specifications
 * Initial counts match reference view:
 *   Leads ( 1 )
 *   Clients ( 2 )
 *   Un-allotted ( 1 )
 *   Disposed ( 1 )
 *   Deleted ( 0 )
 */
export const INITIAL_DETAILED_CLIENTS: ActiveClientRecordDetailed[] = [
  {
    id: 'client-shihab',
    clientCode: 'L-21673106',
    ownerName: 'Ravi R Raju',
    generatorName: 'Ravi R Raju',
    clientName: 'Shihabudheen Chelembra',
    mobile: '7012826397',
    alternateMobile: '9847123450',
    email: 'shihabmorayur@gmail.com',
    panNo: 'BSYPC6412K',
    dob: '1988-05-30',
    state: 'Kerala',
    city: 'MALLAPURAM',
    address: 'MALLAPURAM',
    response: 'CLOSED OWN',
    callbackDate: '2026-09-15',
    leadSource: 'INCOMING LEAD',
    description: 'Anjali Requested me to add this lead in the name of Ravi raju',
    tabCategory: 'clients',
    serviceName: 'INDEX OPTION',
    startDate: '2026-09-11',
    endDate: '2026-11-01',
    notesHistory: [
      {
        id: 'note-shihab-1',
        authorName: 'Anjali',
        authorRole: 'Advisory Executive',
        timestamp: '11-Sep-2026 11:30 AM',
        response: 'INCOMING LEAD',
        text: 'Anjali Requested me to add this lead in the name of Ravi raju'
      },
      {
        id: 'note-shihab-2',
        authorName: 'Ravi R Raju',
        authorRole: 'Senior Advisor',
        timestamp: '11-Sep-2026 02:45 PM',
        response: 'CLOSED OWN',
        text: 'Spoke with Shihabudheen. Discussed Index Option strategy. Client confirmed 2-month subscription.'
      }
    ],
    freeTrials: [
      {
        id: 'ft-shihab-1',
        product: 'INDEX OPTION',
        startDate: '2026-09-08',
        endDate: '2026-09-10',
        status: 'Expired',
        communication: ['SMS', 'App']
      },
      {
        id: 'ft-shihab-2',
        product: 'STOCK OPTION',
        startDate: '2026-09-13',
        endDate: '2026-09-15',
        status: 'Active',
        communication: ['SMS']
      }
    ],
    invoices: [
      {
        id: 'inv-shihab-1',
        invoiceNo: 'INV-9729',
        products: 'INDEX OPTION',
        startDate: '2026-09-11',
        endDate: '2026-11-01',
        approveDate: '2026-09-11',
        paidAmt: 30000.00,
        status: 'Active',
        isHold: false,
        paymentMode: 'NEFT/RTGS',
        bankName: 'HDFC Bank',
        paymentDate: '12-09-2026',
        description: '2 Months Index Option Advisory Subscription',
        email: 'shihabmorayur@gmail.com',
        panCard: 'BSYPC6412K',
        dob: '1988-05-30',
        state: 'Kerala',
        city: 'MALLAPURAM',
        address: 'MALLAPURAM'
      }
    ],
    kycData: {
      fullName: 'Shihabudheen Chelembra',
      mobile: '7012826397',
      email: 'shihabmorayur@gmail.com',
      panNo: 'BSYPC6412K',
      formType: 'Individual',
      fileName: 'KYC_Shihabudheen_PAN_Aadhaar.pdf',
      fileSize: '1.8 MB',
      status: 'Approved',
      uploadedAt: '11-Sep-2026'
    }
  },
  {
    id: 'client-rajesh',
    clientCode: 'L-21673108',
    ownerName: 'Rohan Deshmukh',
    generatorName: 'Rohan Deshmukh',
    clientName: 'Rajesh K. Singhania',
    mobile: '9820100401',
    alternateMobile: '9820100409',
    email: 'rajesh.singhania@gmail.com',
    panNo: 'ABFPS7712L',
    dob: '1984-08-22',
    state: 'Maharashtra',
    city: 'Mumbai',
    address: 'Worli Sea Face, Mumbai',
    response: 'CLOSED OWN',
    callbackDate: '2026-09-20',
    leadSource: 'INCOMING LEAD',
    description: 'High net worth investor subscribed to INDEX OPTION premier plan',
    tabCategory: 'clients',
    serviceName: 'INDEX OPTION',
    startDate: '2026-09-05',
    endDate: '2026-09-21',
    notesHistory: [
      {
        id: 'note-rajesh-1',
        authorName: 'Rohan Deshmukh',
        authorRole: 'Advisor',
        timestamp: '05-Sep-2026 10:15 AM',
        response: 'CLOSED OWN',
        text: 'Client confirmed subscription for Index Option. Transferred ₹25,000 via IMPS.'
      }
    ],
    freeTrials: [],
    invoices: [
      {
        id: 'inv-rajesh-1',
        invoiceNo: 'INV-9612',
        products: 'INDEX OPTION',
        startDate: '2026-09-05',
        endDate: '2026-09-21',
        approveDate: '2026-09-05',
        paidAmt: 25000.00,
        status: 'Active',
        isHold: false,
        paymentMode: 'Net Banking',
        bankName: 'ICICI Bank',
        paymentDate: '2026-09-05'
      }
    ],
    kycData: {
      fullName: 'Rajesh K. Singhania',
      mobile: '9820100401',
      email: 'rajesh.singhania@gmail.com',
      panNo: 'ABFPS7712L',
      formType: 'Individual',
      fileName: 'KYC_Singhania.pdf',
      status: 'Approved',
      uploadedAt: '05-Sep-2026'
    }
  },
  {
    id: 'lead-vikram',
    clientCode: 'L-21673115',
    ownerName: 'Ravi R Raju',
    generatorName: 'Ravi R Raju',
    clientName: 'Vikram Malhotra',
    mobile: '9811234567',
    email: 'vikram.m@gmail.com',
    panNo: 'AAAPM1234K',
    response: 'INTERESTED',
    leadSource: 'INCOMING LEAD',
    description: 'Requested call back for Stock Future demo next week',
    tabCategory: 'leads',
    serviceName: 'STOCK FUTURE',
    startDate: '2026-09-12',
    endDate: '2026-10-12',
    notesHistory: [
      {
        id: 'note-vm-1',
        authorName: 'Ravi R Raju',
        authorRole: 'Advisor',
        timestamp: '10-Sep-2026 04:10 PM',
        response: 'INTERESTED',
        text: 'Client interested in Futures swing trading strategy. Demo scheduled.'
      }
    ],
    freeTrials: [],
    invoices: [],
    kycData: {
      fullName: 'Vikram Malhotra',
      mobile: '9811234567',
      email: 'vikram.m@gmail.com',
      panNo: 'AAAPM1234K',
      formType: 'Individual',
      status: 'Pending Approval'
    }
  },
  {
    id: 'lead-unallot-1',
    clientCode: 'L-21673109',
    ownerName: 'Unassigned',
    generatorName: 'Web Portal',
    clientName: 'Manoj K. Verma',
    mobile: '9823011223',
    email: 'manoj.verma@outlook.com',
    panNo: 'BKLPV8821M',
    response: 'NEW LEAD',
    leadSource: 'WEBSITE REGISTRATION',
    description: 'Registered on website seeking equity research guidance',
    tabCategory: 'unallotted',
    serviceName: 'EQUITY PREMIER',
    startDate: '2026-09-12',
    endDate: '2026-10-12',
    notesHistory: [],
    freeTrials: [],
    invoices: [],
    kycData: {
      fullName: 'Manoj K. Verma',
      mobile: '9823011223',
      email: 'manoj.verma@outlook.com',
      panNo: 'BKLPV8821M',
      formType: 'Individual',
      status: 'Not Submitted'
    }
  },
  {
    id: 'lead-disp-1',
    clientCode: 'L-21673002',
    ownerName: 'Anjali',
    generatorName: 'Campaign',
    clientName: 'Suresh Patel',
    mobile: '9423156789',
    email: 'suresh.p@yahoo.com',
    panNo: 'XYZPP9876Q',
    response: 'NOT INTERESTED',
    leadSource: 'CAMPAIGN',
    description: 'Client relocated abroad, requested not to call',
    tabCategory: 'disposed',
    serviceName: 'COMMODITY',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    notesHistory: [
      {
        id: 'note-disp-1',
        authorName: 'Anjali',
        authorRole: 'Advisor',
        timestamp: '08-Sep-2026 10:20 AM',
        response: 'NOT INTERESTED',
        text: 'Called client, customer not interested at present.'
      }
    ],
    freeTrials: [],
    invoices: [],
    kycData: {
      fullName: 'Suresh Patel',
      mobile: '9423156789',
      email: 'suresh.p@yahoo.com',
      panNo: 'XYZPP9876Q',
      formType: 'Individual',
      status: 'Not Submitted'
    }
  }
];

/**
 * Normalizes phone numbers by removing spaces, hyphens, parentheses, and leading +91 / 0
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Searches for a client matching a phone query or general term
 */
export function findClientByPhone(
  query: string, 
  clientList: ActiveClientRecordDetailed[] = INITIAL_DETAILED_CLIENTS
): ActiveClientRecordDetailed | undefined {
  if (!query || !query.trim()) return undefined;

  const cleanQuery = normalizePhone(query);
  const lowerQuery = query.toLowerCase().trim();

  // 1. Direct phone matching
  if (cleanQuery.length >= 3) {
    const phoneMatch = clientList.find(c => {
      const cMobile = normalizePhone(c.mobile);
      const cAlt = c.alternateMobile ? normalizePhone(c.alternateMobile) : '';
      return cMobile.includes(cleanQuery) || cAlt.includes(cleanQuery);
    });
    if (phoneMatch) return phoneMatch;
  }

  // 2. Client Code or Name matching
  return clientList.find(c => 
    c.clientCode.toLowerCase() === lowerQuery ||
    c.clientName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Returns all matching clients for a query
 */
export function searchDetailedClients(
  query: string,
  clientList: ActiveClientRecordDetailed[] = INITIAL_DETAILED_CLIENTS
): ActiveClientRecordDetailed[] {
  if (!query || !query.trim()) return [];

  const cleanQuery = normalizePhone(query);
  const lowerQuery = query.toLowerCase().trim();

  return clientList.filter(c => {
    const cMobile = normalizePhone(c.mobile);
    const cAlt = c.alternateMobile ? normalizePhone(c.alternateMobile) : '';
    
    const matchesPhone = cleanQuery.length >= 3 && (cMobile.includes(cleanQuery) || cAlt.includes(cleanQuery));
    const matchesName = c.clientName.toLowerCase().includes(lowerQuery);
    const matchesCode = c.clientCode.toLowerCase().includes(lowerQuery);
    const matchesOwner = c.ownerName.toLowerCase().includes(lowerQuery);

    return matchesPhone || matchesName || matchesCode || matchesOwner;
  });
}
