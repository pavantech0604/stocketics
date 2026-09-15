import { 
  KYCDocumentItem, 
  CallReminder, 
  CompanyAnnouncement, 
  CashbackRule, 
  EmployeeCashbackRecord, 
  ExtendedAttendanceRecord, 
  LeaveBalance, 
  TradingDisplayConfig, 
  SubscriptionExpirySMSConfig, 
  ExpirySMSLog, 
  RACallRecord, 
  CompanyBankDetails 
} from '../types';

export const INITIAL_KYC_DOCUMENTS: KYCDocumentItem[] = [
  {
    id: 'kyd-101',
    clientId: 'cl-1',
    clientName: 'Ramesh Patel',
    clientMobile: '9876543210',
    documentNumber: 'AAAPL1234K',
    uploadedBy: 'Aditya Roy',
    uploadedById: 'emp-008',
    documentType: 'PAN Card',
    fileName: 'ramesh_patel_pan.pdf',
    fileSize: '1.2 MB',
    status: 'Verified',
    remarks: 'Clear copy, PAN verified with NSDL database.',
    reviewedBy: 'Arjun Malhotra',
    reviewedAt: '2026-09-10 14:30',
    createdAt: '2026-09-09 11:20',
    updatedAt: '2026-09-10 14:30'
  },
  {
    id: 'kyd-102',
    clientId: 'cl-1',
    clientName: 'Ramesh Patel',
    clientMobile: '9876543210',
    documentNumber: 'XXXX-XXXX-8821',
    uploadedBy: 'Aditya Roy',
    uploadedById: 'emp-008',
    documentType: 'Aadhaar Card',
    fileName: 'ramesh_aadhaar_front_back.pdf',
    fileSize: '2.4 MB',
    status: 'Verified',
    remarks: 'Masked Aadhaar verified.',
    reviewedBy: 'Arjun Malhotra',
    reviewedAt: '2026-09-10 14:32',
    createdAt: '2026-09-09 11:22',
    updatedAt: '2026-09-10 14:32'
  },
  {
    id: 'kyd-103',
    clientId: 'cl-2',
    clientName: 'Pooja Sharma',
    clientMobile: '9812345678',
    documentNumber: 'HDFC0002819',
    uploadedBy: 'Aditya Roy',
    uploadedById: 'emp-008',
    documentType: 'Bank Proof',
    fileName: 'pooja_cancelled_cheque.jpg',
    fileSize: '0.8 MB',
    status: 'Pending',
    createdAt: '2026-09-12 10:15',
    updatedAt: '2026-09-12 10:15'
  },
  {
    id: 'kyd-104',
    clientId: 'cl-3',
    clientName: 'Shihabudheen Chelembra',
    clientMobile: '9946123456',
    documentNumber: 'EB-2026-9812',
    uploadedBy: 'Aditya Roy',
    uploadedById: 'emp-008',
    documentType: 'Address Proof',
    fileName: 'shihab_electricity_bill.pdf',
    fileSize: '1.9 MB',
    status: 'Needs Reupload',
    remarks: 'Bill is older than 3 months. Please upload electricity or bank statement of last 2 months.',
    reviewedBy: 'Arjun Malhotra',
    reviewedAt: '2026-09-11 16:45',
    createdAt: '2026-09-11 09:30',
    updatedAt: '2026-09-11 16:45'
  },
  {
    id: 'kyd-105',
    clientId: 'cl-4',
    clientName: 'Vikramaditya Rao',
    clientMobile: '9820011223',
    documentNumber: 'BKZPR7890M',
    uploadedBy: 'Aditya Roy',
    uploadedById: 'emp-008',
    documentType: 'PAN Card',
    fileName: 'vikram_pan_scan.pdf',
    fileSize: '1.1 MB',
    status: 'Pending',
    createdAt: '2026-09-12 11:40',
    updatedAt: '2026-09-12 11:40'
  }
];

// 2. Call Reminders
const _now = new Date();
const formatScheduledTime = (minutesAhead: number) => {
  const d = new Date(_now.getTime() + minutesAhead * 60000);
  return d.toISOString();
};

export const INITIAL_CALL_REMINDERS: CallReminder[] = [
  {
    id: 'rem-1',
    clientId: 'cl-2',
    clientName: 'Pooja Sharma',
    phone: '+91 98112 45678',
    leadStatus: 'Interested',
    scheduledTime: formatScheduledTime(1), // Due in 1 min for instant testing
    notes: 'Requested call back to discuss Bank NIFTY Options advisory subscription & annual pricing.',
    assignedToId: 'emp-008',
    assignedToName: 'Aditya Roy',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rem-2',
    clientId: 'cl-5',
    clientName: 'Anil Kumar Singhania',
    phone: '+91 98200 98765',
    leadStatus: 'Today Followup',
    scheduledTime: formatScheduledTime(15),
    notes: 'HNI client interested in Long Term Wealth Advisory portfolio. Discuss demat integration.',
    assignedToId: 'emp-008',
    assignedToName: 'Aditya Roy',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rem-3',
    clientId: 'cl-3',
    clientName: 'Shihabudheen Chelembra',
    phone: '+91 70128 26397',
    leadStatus: 'Payment Pending',
    scheduledTime: formatScheduledTime(45),
    notes: 'Follow up on HDFC payment confirmation receipt and send bank details.',
    assignedToId: 'emp-008',
    assignedToName: 'Aditya Roy',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 3. Company Announcements / Manager Greetings
export const INITIAL_ANNOUNCEMENTS: CompanyAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Festival Season Advisory & Q3 Sales Surge',
    message: 'Wishing the entire Stocketics family a prosperous and energetic festival season! Let us maintain highest compliance and achieve 100% client satisfaction across all advisory desks.',
    type: 'Greeting',
    audience: 'all',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    isActive: true,
    createdBy: 'Arjun Malhotra',
    createdById: 'emp-004',
    createdAt: '2026-09-08 09:30',
    readByEmployeeIds: []
  },
  {
    id: 'ann-2',
    title: 'Sales Champion Alert: Aditya Roy Crossed ₹4.5L Target',
    message: 'Huge congratulations to Aditya Roy from Equity Advisory Desk for crossing the monthly revenue target of ₹4,50,000! Cashback incentive has been unlocked.',
    type: 'Sales Achievement',
    audience: 'all',
    startDate: '2026-09-10',
    endDate: '2026-09-25',
    isActive: true,
    createdBy: 'Arjun Malhotra',
    createdById: 'emp-004',
    createdAt: '2026-09-11 11:00',
    readByEmployeeIds: []
  },
  {
    id: 'ann-3',
    title: 'SEBI Compliance Update on Derivatives Advisory',
    message: 'All team leads and analysts must ensure mandatory risk disclosures are read to clients before issuing index option and futures calls.',
    type: 'General Notice',
    audience: 'all',
    startDate: '2026-09-05',
    endDate: '2026-09-30',
    isActive: true,
    createdBy: 'Priya Sharma',
    createdById: 'emp-001',
    createdAt: '2026-09-05 10:00',
    readByEmployeeIds: []
  }
];

// 4. Cashback Rules & Employee Cashback Records
export const INITIAL_CASHBACK_RULES: CashbackRule[] = [
  {
    id: 'cb-rule-1',
    name: 'Executive Sales Target Incentive',
    targetSalesAmount: 400000,
    cashbackType: 'percentage',
    cashbackValue: 5, // 5% cashback on crossing ₹4 Lakhs
    applicableRole: 'employee',
    applicableDepartment: 'Equity Research & Advisory',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    isActive: true
  },
  {
    id: 'cb-rule-2',
    name: 'Mega Achiever Bonus',
    targetSalesAmount: 700000,
    cashbackType: 'fixed',
    cashbackValue: 35000, // ₹35,000 fixed cashback on crossing ₹7 Lakhs
    applicableRole: 'employee',
    applicableDepartment: 'All',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    isActive: true
  }
];

export const INITIAL_CASHBACK_RECORDS: EmployeeCashbackRecord[] = [
  {
    id: 'cbr-1',
    employeeId: 'emp-008',
    employeeName: 'Aditya Roy',
    department: 'Equity Advisory Desk',
    targetSalesAmount: 400000,
    currentSales: 480000,
    cashbackEarned: 24000,
    status: 'Pending',
    period: 'September 2026'
  },
  {
    id: 'cbr-2',
    employeeId: 'emp-009',
    employeeName: 'Rohan Deshmukh',
    department: 'Advisory Sales Desk A',
    targetSalesAmount: 400000,
    currentSales: 420000,
    cashbackEarned: 21000,
    status: 'Approved',
    period: 'September 2026',
    approvedBy: 'Arjun Malhotra',
    approvedAt: '2026-09-11 17:00'
  },
  {
    id: 'cbr-3',
    employeeId: 'emp-010',
    employeeName: 'Sneha Kapur',
    department: 'Derivatives Options Desk',
    targetSalesAmount: 400000,
    currentSales: 450000,
    cashbackEarned: 22500,
    status: 'Paid',
    period: 'August 2026',
    approvedBy: 'Arjun Malhotra',
    approvedAt: '2026-09-01 12:00',
    paidAt: '2026-09-05 15:30'
  }
];

// 5. Extended Attendance Records (with Biometric source and Leaves)
export const INITIAL_EXTENDED_ATTENDANCE: ExtendedAttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-008',
    employeeName: 'Aditya Roy',
    department: 'Equity Advisory Desk',
    date: '12-Sep-2026',
    punchIn: '08:58 AM',
    punchOut: '06:12 PM',
    totalHours: 9.2,
    status: 'Present',
    source: 'Biometric',
    terminal: 'Bangalore HQ Optical Bio-01',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'att-2',
    employeeId: 'emp-009',
    employeeName: 'Rohan Deshmukh',
    department: 'Advisory Sales Desk A',
    date: '12-Sep-2026',
    punchIn: '09:02 AM',
    punchOut: '06:05 PM',
    totalHours: 9.0,
    status: 'Present',
    source: 'Biometric',
    terminal: 'Bangalore HQ Optical Bio-01',
    ipAddress: '192.168.1.106'
  },
  {
    id: 'att-3',
    employeeId: 'emp-010',
    employeeName: 'Sneha Kapur',
    department: 'Derivatives Options Desk',
    date: '12-Sep-2026',
    punchIn: '09:42 AM',
    punchOut: '06:30 PM',
    totalHours: 8.8,
    status: 'Late',
    source: 'Biometric',
    terminal: 'Bangalore HQ Optical Bio-02',
    ipAddress: '192.168.1.107'
  },
  {
    id: 'att-4',
    employeeId: 'emp-004',
    employeeName: 'Arjun Malhotra',
    department: 'Equity Research & Advisory',
    date: '12-Sep-2026',
    punchIn: '08:50 AM',
    punchOut: '06:20 PM',
    totalHours: 9.5,
    status: 'Present',
    source: 'Biometric',
    terminal: 'Bangalore HQ Optical Bio-01'
  },
  {
    id: 'att-5',
    employeeId: 'emp-008',
    employeeName: 'Aditya Roy',
    department: 'Equity Advisory Desk',
    date: '11-Sep-2026',
    punchIn: '09:00 AM',
    punchOut: '06:10 PM',
    totalHours: 9.1,
    status: 'Present',
    source: 'Biometric',
    terminal: 'Bangalore HQ Optical Bio-01'
  },
  {
    id: 'att-6',
    employeeId: 'emp-012',
    employeeName: 'Ananya Sen',
    department: 'HNI Advisory Desk',
    date: '12-Sep-2026',
    punchIn: '-',
    punchOut: '-',
    totalHours: 0,
    status: 'Leave',
    source: 'Manual',
    terminal: 'HR System',
    leaveType: 'CL'
  }
];

// 6. Leave Balances
export const INITIAL_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  'emp-008': { employeeId: 'emp-008', clRemaining: 10, plRemaining: 14, sickRemaining: 7 },
  'emp-009': { employeeId: 'emp-009', clRemaining: 12, plRemaining: 15, sickRemaining: 8 },
  'emp-004': { employeeId: 'emp-004', clRemaining: 8, plRemaining: 16, sickRemaining: 6 },
  'emp-001': { employeeId: 'emp-001', clRemaining: 14, plRemaining: 18, sickRemaining: 8 },
};

// 7. Trading Display Configuration
export const INITIAL_TRADING_DISPLAY_CONFIG: TradingDisplayConfig = {
  mode: 'ticker', // or 'boxes'
  activeItemKeys: ['nifty50', 'sensex', 'banknifty', 'usdinr', 'crudeoil']
};

// 8. Subscription Expiry SMS Config & Logs
export const INITIAL_EXPIRY_SMS_CONFIGS: SubscriptionExpirySMSConfig[] = [
  {
    id: 'exp-cfg-1',
    triggerType: 'before_expiry_3d',
    triggerHoursBefore: 72,
    template: 'Dear Client, your Stocketics Advisory package will expire in 3 days. Renew now to ensure uninterrupted live calls.',
    isActive: true
  },
  {
    id: 'exp-cfg-2',
    triggerType: 'before_expiry_1d',
    triggerHoursBefore: 24,
    template: 'Urgent: Your Stocketics Research subscription expires tomorrow. Tap here to renew and retain your dedicated analyst support.',
    isActive: true
  },
  {
    id: 'exp-cfg-3',
    triggerType: 'expiry_day',
    triggerHoursBefore: 0,
    template: 'Notice: Your Stocketics Advisory package expires today. Contact your advisor to renew with exclusive client benefits.',
    isActive: true
  }
];

export const INITIAL_EXPIRY_SMS_LOGS: ExpirySMSLog[] = [
  {
    id: 'esl-1',
    clientId: 'cl-1',
    clientName: 'Ramesh Patel',
    phone: '+91 98250 12345',
    serviceName: 'INDEX OPTION HNI',
    expiryDate: '2026-09-13',
    expiryTime: '15:30',
    message: 'Urgent: Your Stocketics Research subscription expires tomorrow. Tap here to renew and retain your dedicated analyst support.',
    status: 'Sent',
    sentAt: '2026-09-12 10:00',
    triggeredBy: 'automated'
  },
  {
    id: 'esl-2',
    clientId: 'cl-3',
    clientName: 'Shihabudheen Chelembra',
    phone: '+91 70128 26397',
    serviceName: 'EQUITY CASH MOMENTUM',
    expiryDate: '2026-09-12',
    expiryTime: '17:00',
    message: 'Notice: Your Stocketics Advisory package expires today. Contact your advisor to renew with exclusive client benefits.',
    status: 'Sent',
    sentAt: '2026-09-12 09:15',
    triggeredBy: 'manager'
  }
];

// 9. RA Calls & Signals
export const INITIAL_RA_CALLS: RACallRecord[] = [
  {
    id: 'ra-1',
    title: 'BUY NIFTY 24800 CE',
    segment: 'Index Option',
    type: 'BUY',
    entryPrice: 185.00,
    target1: 210.00,
    target2: 240.00,
    stopLoss: 160.00,
    openTime: '2026-09-12 09:35',
    status: 'TARGET 1 HIT',
    givenBy: 'Aditya Roy',
    givenById: 'emp-008',
    accessTier: 'all',
    applicableClientsCount: 42,
    pointsGain: 27.40
  },
  {
    id: 'ra-2',
    title: 'BUY BANKNIFTY 51500 PE',
    segment: 'Index Option',
    type: 'BUY',
    entryPrice: 280.00,
    target1: 340.00,
    target2: 390.00,
    stopLoss: 240.00,
    openTime: '2026-09-12 10:15',
    status: 'ACTIVE',
    givenBy: 'Aditya Roy',
    givenById: 'emp-008',
    accessTier: 'paid',
    applicableClientsCount: 28,
    pointsGain: 18.50
  },
  {
    id: 'ra-3',
    title: 'BUY RELIANCE 3000 CE',
    segment: 'Stock Option',
    type: 'BUY',
    entryPrice: 42.00,
    target1: 56.00,
    target2: 70.00,
    stopLoss: 33.00,
    openTime: '2026-09-12 11:00',
    status: 'ACTIVE',
    givenBy: 'Rohan Deshmukh',
    givenById: 'emp-009',
    accessTier: 'paid',
    applicableClientsCount: 19,
    pointsGain: 6.20
  },
  {
    id: 'ra-4',
    title: 'BUY CRUDEOIL 6200 PE',
    segment: 'Commodity',
    type: 'BUY',
    entryPrice: 115.00,
    target1: 145.00,
    target2: 175.00,
    stopLoss: 95.00,
    openTime: '2026-09-12 11:30',
    status: 'ACTIVE',
    givenBy: 'Arjun Malhotra',
    givenById: 'emp-004',
    accessTier: 'trial',
    applicableClientsCount: 35,
    pointsGain: 12.00
  }
];

// 10. Verified Company Bank Details (Controlled only by Manager/Admin)
export const INITIAL_COMPANY_BANK_DETAILS: CompanyBankDetails = {
  bankName: 'HDFC Bank Ltd',
  accountName: 'Stocketics Advisory & Research Private Limited',
  accountNumber: '50200084910284',
  ifscCode: 'HDFC0001248',
  branch: 'Koramangala 5th Block, Bangalore - 560095',
  upiId: 'stocketics.advisory@hdfcbank',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=stocketics.advisory@hdfcbank&pn=StocketicsAdvisory'
};
