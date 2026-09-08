export type UserRole = 'hr' | 'manager' | 'employee';

export type Department = 
  | 'HR'
  | 'IT'
  | 'Equity Research'
  | 'Advisory Sales'
  | 'Operations'
  | 'Finance';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Remote' | 'Probation';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: Department;
  title: string;
  avatar: string;
  joinDate: string;
  status: EmployeeStatus;
  salary: number;
  managerId?: string;
  leaveBalance: {
    paid: number;
    sick: number;
    comp: number;
  };
}

export type AttendanceStatus = 'Present' | 'Late' | 'Half-day' | 'Absent' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: Department;
  date: string;
  punchIn: string;
  punchOut?: string;
  totalHours: number;
  status: AttendanceStatus;
  ipAddress: string;
  location: string;
  isOnBreak?: boolean;
}

export type LeaveType = 'Paid Time Off' | 'Sick Leave' | 'Compensatory Off' | 'Maternity/Paternity' | 'Unpaid Leave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Declined';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  avatar: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  approvedBy?: string;
  managerNote?: string;
}

export type LeadStatus = 'New Lead' | 'In Contact' | 'Trial Active' | 'Converted' | 'Lost';
export type AdvisoryService = 'Equity Premier' | 'Options Strategy' | 'Commodity Momentum' | 'Hedge & PMS';

export interface AdvisoryLead {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  serviceType: AdvisoryService;
  investmentBracket: string;
  status: LeadStatus;
  assignedToId: string;
  assignedToName: string;
  lastContactDate: string;
  expectedRevenue: number;
  city?: string;
  source?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Urgent' | 'High' | 'Normal';
  completed: boolean;
  category: 'Research' | 'Client Call' | 'Admin' | 'Compliance';
  assignedToId: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'approval' | 'system' | 'mention' | 'kudos';
  read: boolean;
  targetRole?: UserRole;
  actionTab?: string;
}

export interface PayslipRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicPay: number;
  hra: number;
  allowances: number;
  incentives: number;
  gross: number;
  deductions: number;
  pf: number;
  taxWithholding: number;
  netPay: number;
  paymentStatus: 'Paid' | 'Processing';
  paidDate: string;
}

export type KYCStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'Under Review';
export type RiskProfile = 'Aggressive' | 'Moderate' | 'Conservative';

export interface KYCDocuments {
  panCardUrl?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  bankProofUrl?: string;
}

export interface KYCRecord {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  panNumber: string;
  aadhaarMasked: string;
  bankAccountMasked: string;
  bankName: string;
  ifscCode: string;
  dematClientId: string;
  depository: 'NSDL' | 'CDSL';
  riskProfile: RiskProfile;
  annualIncomeBracket: string;
  tradingExperience: string;
  status: KYCStatus;
  submittedDate: string;
  verifiedDate?: string;
  verifiedBy?: string;
  assignedAdvisorName: string;
  rejectionReason?: string;
  documents: KYCDocuments;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  fathersName?: string;
  dob?: string;
  email: string;
  streetAddress: string;
  city: string;
  phone: string;
  pancard: string;
  itemDescription: string;
  subType?: string;
  fromDate: string;
  toDate: string;
  totalGross: number;
  discount: number;
  adjustment: number;
  netAmount: number;
  gstAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: string;
  bankName: string;
  paymentDetail?: string;
}

export interface ConfirmedPaymentRecord {
  id: string;
  ownerName: string;
  clientName: string;
  mobile: string;
  bank: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  reason: string;
  description: string;
  clientStatus: string;
  date: string;
  invoiceCreated?: boolean;
  invoiceData?: InvoiceData;
}

export type CallDirection = 'Outbound' | 'Inbound';
export type CallSentiment = 'Positive' | 'Neutral' | 'Challenging';

export interface CallLogRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  callDirection: CallDirection;
  durationSeconds: number;
  timestamp: string;
  disposition: string;
  callNotes: string;
  sentiment: CallSentiment;
  recordingDuration: string;
  hasRecording: boolean;
  managerScore?: number;
  managerNote?: string;
  keyTopics?: string[];
}
