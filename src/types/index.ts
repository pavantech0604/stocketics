export type UserRole = 'hr' | 'manager' | 'employee' | 'team_leader';

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
  dob?: string; // Format: YYYY-MM-DD or MM-DD
  leaveBalance: {
    paid: number;
    sick: number;
    comp: number;
  };
}

export interface BirthdayWish {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  message: string;
  timestamp: string;
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

export type LeaveType = 'Paid Time Off' | 'Sick Leave' | 'Compensatory Off' | 'Maternity/Paternity' | 'Unpaid Leave' | 'CL' | 'PL' | 'Sick' | 'Other';
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
  type: 'approval' | 'system' | 'mention' | 'kudos' | 'lead_access' | 'call_reminder' | 'announcement' | 'cashback';
  read: boolean;
  targetRole?: UserRole;
  targetUserId?: string;
  actionTab?: string;
  leadId?: string;
  leadName?: string;
  actionPerformed?: string;
  performedBy?: string;
  performedById?: string;
  leadStatus?: string;
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
  screenshotUrl?: string;
  advisoryCallId?: string;
  profitAmount?: number;
  scriptName?: string;
  entryPrice?: number;
  exitPrice?: number;
  lots?: number;
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

export interface ClientEmployeeNote {
  id: string;
  authorName: string;
  authorRole?: string;
  timestamp: string;
  response: string;
  text: string;
}

export interface FreeTrialRecord {
  id: string;
  product: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Approved' | 'Expired' | 'Pending';
  communication: string[];
}

export interface ClientInvoiceRecord {
  id: string;
  invoiceNo: string;
  products: string;
  startDate: string;
  endDate: string;
  approveDate: string;
  paidAmt: number;
  status: 'Active' | 'Hold' | 'Expired';
  isHold: boolean;
  paymentMode?: string;
  bankName?: string;
  paymentDate?: string;
  description?: string;
  email?: string;
  panCard?: string;
  dob?: string;
  state?: string;
  city?: string;
  address?: string;
}

export interface ClientKYCData {
  fullName: string;
  mobile: string;
  email: string;
  panNo: string;
  formType: 'Individual' | 'Corporate' | 'Partnership' | 'HUF' | 'NRI';
  fileName?: string;
  fileSize?: string;
  status: 'Approved' | 'Pending Approval' | 'Under Review' | 'Not Submitted' | 'Rejected';
  uploadedAt?: string;
}

export interface ActiveClientRecordDetailed {
  id: string;
  clientCode: string;
  ownerName: string;
  generatorName: string;
  clientName: string;
  mobile: string;
  alternateMobile?: string;
  email: string;
  panNo: string;
  dob?: string;
  state?: string;
  city?: string;
  address?: string;
  response: string;
  callbackDate?: string;
  leadSource: string;
  description: string;
  tabCategory: 'leads' | 'clients' | 'unallotted' | 'disposed' | 'deleted';
  serviceName: string;
  startDate: string;
  endDate: string;
  notesHistory: ClientEmployeeNote[];
  freeTrials: FreeTrialRecord[];
  invoices: ClientInvoiceRecord[];
  kycData: ClientKYCData;
  isDND?: boolean;
  trialStatus?: 'Trial Day 1' | 'Trial Day 2' | 'Trial Expired' | 'Retrial Active' | 'Retrial Expired' | 'Converted' | 'Not Converted';
  trialStartDate?: string;
  trialEndDate?: string;
  retrialDate?: string;
}

// ─── Team Leader Role Types ──────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  department: Department;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export interface TeamMember {
  teamId: string;
  employeeId: string;
  joinedAt: string;
}

export type CoachingNoteType = 'Praise' | 'Improvement' | 'Goal' | '1:1 Meeting' | 'Observation';

export interface CoachingNote {
  id: string;
  teamLeaderId: string;
  employeeId: string;
  employeeName: string;
  type: CoachingNoteType;
  text: string;
  timestamp: string;
  isPrivate: boolean;
}

export type StandupMood = 'Great' | 'Good' | 'Okay' | 'Struggling';

export interface DailyStandup {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  mood: StandupMood;
  submittedAt: string;
}

export type TargetMetric = 'Leads Converted' | 'Revenue' | 'Calls Made' | 'SMS Sent' | 'New Clients';
export type TargetPeriod = 'Daily' | 'Weekly' | 'Monthly';

export interface TeamTarget {
  id: string;
  teamId: string;
  employeeId: string;
  employeeName: string;
  metric: TargetMetric;
  targetValue: number;
  actualValue: number;
  period: TargetPeriod;
  startDate: string;
  endDate: string;
}

// ─── Cross-Employee Client/Lead Search Alert Types ───────────────────

export interface ClientSearchAlert {
  id: string;
  clientId: string;
  clientCode?: string;
  clientName: string;
  clientMobile?: string;
  targetType: 'client' | 'lead';
  ownerId?: string;
  ownerName: string;          // Respective employee having/owning the client
  searchedById: string;       // Employee who performed the search
  searchedByName: string;     // Name of employee who searched
  searchedByRole: string;     // Role of employee who searched
  searchedByAvatar?: string;
  searchQuery: string;        // Search term
  searchLocation: string;     // Where it was searched
  timestamp: string;          // When search occurred
  read: boolean;
  acknowledged: boolean;
}

// ─── Market Information & Dashboard Widget Types ───────────────────

export type MarketInstrumentType = 'index' | 'stock' | 'option' | 'forex' | 'commodity';
export type MarketDataStatus = 'realtime' | 'delayed' | 'end_of_day' | 'unavailable';
export type MarketStatus = 'open' | 'closed' | 'pre_open' | 'holiday';

export interface MarketInstrumentConfig {
  key: string;
  label: string;
  symbol: string;
  type: MarketInstrumentType;
  currency: string;
  exchange?: string;
  enabled: boolean;
  baseValue: number;
  callType?: 'BUY' | 'SELL';
  entryPrice?: number;
  target1?: number;
  target2?: number;
  stopLoss?: number;
  isCustom?: boolean;
  analyst?: string;
  lotSize?: number;
  expiry?: string;
  notes?: string;
  serviceSegment?: string;
}

export interface MarketQuote {
  key: string;
  label: string;
  symbol: string;
  type: MarketInstrumentType;
  value: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange?: string;
  asOf: string;
  marketStatus: MarketStatus;
  dataStatus: MarketDataStatus;
  provider: string;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  volume?: number;
  historicalMiniSeries?: number[];
  callType?: 'BUY' | 'SELL';
  entryPrice?: number;
  target1?: number;
  target2?: number;
  stopLoss?: number;
  isCallActive?: boolean;
  profitAchieved?: boolean;
  targetHit?: 'TGT1' | 'TGT2' | 'SL' | null;
  pointsGain?: number;
  percentageGain?: number;
  tickDirection?: 'up' | 'down' | 'neutral';
  analyst?: string;
  lotSize?: number;
  expiry?: string;
  serviceSegment?: string;
}

export interface MarketWidgetConfig {
  isEnabled: boolean;
  density: 'compact' | 'standard';
  layout: 'ticker' | 'card';
  refreshSeconds: number;
  selectedInstruments: string[];
  showMiniChart?: boolean;
  autoScroll?: boolean;
  scrollSpeed?: 'slow' | 'medium' | 'fast';
}

export interface CandleData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type MarketTimeframe = '1m' | '5m' | '15m' | '1h' | '1D' | '1W';

export interface KiteConfig {
  apiKey: string;
  accessToken: string;
  isConnected: boolean;
  lastConnectedAt?: string;
  autoConnect?: boolean;
}

export interface RolePermissions {
  [role: string]: {
    market_dashboard_view: boolean;
    market_workspace_view: boolean;
    [permissionKey: string]: boolean;
  };
}

// ─── Advisory Call SMS & Email Dispatch Types ─────────────────────────

export interface AdvisoryDispatchRecord {
  id: string;
  scriptName: string;
  serviceSegment: string;
  callType: 'BUY' | 'SELL';
  entryPrice: number;
  target1: number;
  target2: number;
  stopLoss: number;
  ltpAtSend: number;
  channels: ('SMS' | 'Email' | 'WhatsApp')[];
  recipientCount: number;
  recipients: { clientId: string; clientName: string; mobile: string; email: string }[];
  smsTemplateUsed: string;
  sentBy: string;
  sentRole: string;
  sentAt: string;
  status: 'Delivered' | 'Partial' | 'Pending';
}

export interface SMSReportRecord {
  sNo: number;
  id: string;
  ownerName: string;
  mobile: string;
  message: string;
  sender: string;
  sentTime: string;
  deliveryTime: string;
  status: 'Delivered' | 'Failed / DND' | 'Pending';
  sendBy: string;
  type: 'Trading Tip' | 'Payment' | 'KYC Alert' | 'Renewal' | 'Followup';
}

// ─── KYC Document Item Workflow Types ─────────────────────────────────
export type KYCDocumentType = 'PAN Card' | 'Aadhaar Card' | 'Address Proof' | 'Bank Proof' | 'Other';
export type KYCDocumentStatus = 'Pending' | 'Verified' | 'Rejected' | 'Needs Reupload';

export interface KYCDocumentItem {
  id: string;
  clientId: string;
  clientName: string;
  clientMobile?: string;
  documentNumber?: string;
  uploadedBy: string;
  uploadedById: string;
  documentType: KYCDocumentType;
  fileName: string;
  fileUrl?: string;
  fileSize?: string;
  status: KYCDocumentStatus;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Call Reminder Workflow Types ──────────────────────────────────────
export type CallReminderStatus = 'Pending' | 'Completed' | 'Snoozed' | 'Rescheduled' | 'Not Reachable';

export interface CallReminder {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  clientPhone?: string;
  leadStatus: string;
  scheduledTime: string;
  notes: string;
  purpose?: string;
  priority?: 'High' | 'Medium' | 'Low';
  assignedToId: string;
  assignedToName: string;
  status: CallReminderStatus;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Company Announcement Workflow Types ──────────────────────────────
export type AnnouncementType = 'Greeting' | 'Sales Achievement' | 'Target Info' | 'General Notice' | 'Urgent' | 'Celebration' | 'Milestone' | 'MorningGreeting' | 'General';
export type AnnouncementAudience = 'all' | 'team' | 'role' | 'individual';

export interface CompanyAnnouncement {
  id: string;
  title: string;
  message: string;
  content?: string;
  type: AnnouncementType;
  audience: AnnouncementAudience;
  targetAudience?: string;
  targetTeam?: string;
  targetRole?: UserRole;
  targetEmployeeId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  createdByName?: string;
  createdById: string;
  createdAt: string;
  readByEmployeeIds: string[];
}

// ─── Cashback & Incentive Workflow Types ──────────────────────────────
export interface CashbackRule {
  id: string;
  name: string;
  targetSalesAmount: number;
  salesLimitThreshold?: number;
  cashbackType: 'fixed' | 'percentage';
  cashbackValue: number;
  cashbackAmount?: number;
  applicableRole: string;
  applicableDepartment: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface EmployeeCashbackRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  targetSalesAmount: number;
  salesLimitTarget?: number;
  currentSales: number;
  salesAchieved?: number;
  cashbackEarned: number;
  status: 'Pending' | 'Approved' | 'Paid';
  period: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
}

// ─── Biometric Attendance & Leave Types ────────────────────────────────
export type AttendanceSource = 'Biometric' | 'Manual' | 'Import';

export interface ExtendedAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  punchIn: string;
  punchOut: string;
  totalHours: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'Leave';
  source: AttendanceSource;
  terminal: string;
  ipAddress?: string;
  leaveType?: 'CL' | 'PL' | 'Sick' | 'Other';
}

export interface LeaveBalance {
  employeeId: string;
  clRemaining: number;
  plRemaining: number;
  sickRemaining: number;
  clTotal?: number;
  clUsed?: number;
  plTotal?: number;
  plUsed?: number;
  sickTotal?: number;
  sickUsed?: number;
}

// ─── Trading Display Config ────────────────────────────────────────────
export interface TradingDisplayConfig {
  mode: 'ticker' | 'boxes';
  activeItemKeys: string[];
}

// ─── Subscription Expiry SMS Workflow Types ───────────────────────────
export interface SubscriptionExpirySMSConfig {
  id: string;
  triggerType: 'before_expiry_3d' | 'before_expiry_1d' | 'expiry_day' | 'post_expiry_1d' | 'custom_hours';
  triggerHoursBefore: number;
  triggerDaysBefore?: number;
  template: string;
  templateText?: string;
  channels?: string[];
  sendTime?: string;
  isActive: boolean;
}

export interface ExpirySMSLog {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  serviceName: string;
  expiryDate: string;
  expiryTime: string;
  message: string;
  status: 'Pending' | 'Sent' | 'Failed';
  sentAt?: string;
  failureReason?: string;
  triggeredBy: string;
}

// ─── RA Call Signal Types ──────────────────────────────────────────────
export interface RACallRecord {
  id: string;
  title: string;
  segment: 'Index Option' | 'Stock Option' | 'Equity Cash' | 'Commodity' | 'Forex';
  type: 'BUY' | 'SELL';
  callType?: 'BUY' | 'SELL';
  entryPrice: number;
  target1: number;
  target2: number;
  target3?: number;
  stopLoss: number;
  openTime: string;
  closeTime?: string;
  status: 'ACTIVE' | 'TARGET 1 HIT' | 'TARGET 2 HIT' | 'ALL TARGETS HIT' | 'STOP LOSS' | 'STOP LOSS HIT' | 'CLOSED';
  givenBy: string;
  analystName?: string;
  analystRegNo?: string;
  givenById: string;
  accessTier: 'all' | 'trial' | 'paid';
  tierAccess?: 'all' | 'trial' | 'paid';
  applicableClientsCount: number;
  pointsGain?: number;
  rationale?: string;
}

// ─── Company Bank Details ─────────────────────────────────────────────
export interface CompanyBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  qrCodeUrl?: string;
}


