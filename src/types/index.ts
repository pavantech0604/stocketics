

export type UserRole = 'hr' | 'manager' | 'employee' | 'team_leader' | 'admin';

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
export type AdvisoryService = 'Equity Premier' | 'Options Strategy' | 'Commodity Momentum' | 'Hedge & PMS' | '';

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
  // Multi-tier allotment & response tracking fields
  teamId?: string;
  teamLeaderId?: string;
  teamLeaderName?: string;
  isTeamPool?: boolean;
  assignedById?: string;
  assignedByName?: string;
  assignedAt?: string;
  response?: string;
  callbackDate?: string;
  callbackTime?: string;
  description?: string;
  modifiedToday?: boolean;
  disposedToday?: boolean;
  disposedAt?: string;
  isDND?: boolean;
  leadCode?: string;
  panNumber?: string;
  dispositionHistory?: LeadDispositionEvent[];
}

export interface LeadDispositionEvent {
  id: string;
  leadId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  response: string;
  note?: string;
  callbackDate?: string;
  callbackTime?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Challenging';
  durationSeconds?: number;
}

export interface GlobalDNDEntry {
  id: string;
  phone: string;
  clientName?: string;
  leadId?: string;
  reason: string;
  addedById: string;
  addedByName: string;
  addedAt: string;
}

export interface LeadSourcePool {
  sourceName: string;
  availableCount: number;
  totalUploaded: number;
  language?: string;
}

export interface LeadAssignmentHistory {
  id: string;
  leadId?: string;
  leadName?: string;
  source: string;
  fromId?: string;
  fromName?: string;
  toId: string;
  toName: string;
  assignedById: string;
  assignedByName: string;
  assignedAt: string;
  assignmentType: 'manager_to_team' | 'team_to_employee' | 'reassignment' | 'bulk_upload';
  leadCount: number;
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
  taxBreakdown?: InvoiceTaxBreakdown;
}

export interface InvoiceTaxBreakdown {
  sacCode: string; // '997152' Investment Advisory Services
  taxableValue: number;
  cgstRate: number; // 9%
  cgstAmount: number;
  sgstRate: number; // 9%
  sgstAmount: number;
  igstRate: number; // 18%
  igstAmount: number;
  totalGstAmount: number;
  netPayable: number;
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
  utrNumber?: string;
  verifiedBy?: string;
  verifiedById?: string;
  verifiedDate?: string;
  servicePackage?: string;
  leadId?: string;
  clientId?: string;
  splitAttribution?: {
    generatorId?: string;
    generatorName?: string;
    closerId?: string;
    closerName?: string;
    generatorSharePct?: number;
    closerSharePct?: number;
  };
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

export interface ClientServiceSubscription {
  id: string;
  serviceName: string;
  serviceCategory: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Hold' | 'Expired' | 'Suspended';
  invoiceNo?: string;
  paidAmount: number;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  createdAt: string;
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
  trialStatus?: 'Trial Day 1' | 'Trial Day 2' | 'Trial Expired' | 'Retrial Active' | 'Retrial Expired' | 'Converted' | 'Not Converted' | 'Active Trial' | 'Active' | string;
  trialStartDate?: string;
  trialEndDate?: string;
  retrialDate?: string;
  callsDeliveredCount?: number;
  lastCallSentAt?: string;
  serviceCategory?: string;
  serviceSubscriptions?: ClientServiceSubscription[];
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

// ─── Standard Advisory Services ───────────────────────────────────────
export interface StandardAdvisoryService {
  id: string;
  name: string;
  category: 'Index Options' | 'Stock Options' | 'Futures' | 'Cash / Equity' | 'Commodity';
  segment: 'Index Option' | 'Stock Option' | 'Equity Cash' | 'Commodity';
  description: string;
}

export const STANDARD_ADVISORY_SERVICES: StandardAdvisoryService[] = [
  { id: 'INDEX OPTION', name: 'INDEX OPTION (Nifty & Bank Nifty Options)', category: 'Index Options', segment: 'Index Option', description: 'Nifty & Bank Nifty weekly and monthly options' },
  { id: 'NIFTY OPTION', name: 'NIFTY OPTION (Nifty Index Options Specific)', category: 'Index Options', segment: 'Index Option', description: 'Nifty Index options specific intraday momentum' },
  { id: 'BANKNIFTY OPTION', name: 'BANKNIFTY OPTION (Bank Nifty Options Specific)', category: 'Index Options', segment: 'Index Option', description: 'Bank Nifty high volatility intraday breakout options' },
  { id: 'STOCK OPTION', name: 'STOCK OPTION (High Momentum Stock Options)', category: 'Stock Options', segment: 'Stock Option', description: 'High momentum F&O stock options calls' },
  { id: 'STOCK FUTURE', name: 'STOCK FUTURE (Intraday & Swing Futures)', category: 'Futures', segment: 'Stock Option', description: 'Intraday & swing derivative stock futures' },
  { id: 'INTRADAY CASH', name: 'INTRADAY CASH (Cash / Equity Intraday)', category: 'Cash / Equity', segment: 'Equity Cash', description: 'NSE cash equity momentum intraday trades' },
  { id: 'COMMODITY', name: 'COMMODITY (Crude Oil, Gold & Natural Gas)', category: 'Commodity', segment: 'Commodity', description: 'MCX bullion, energy & base metals' },
  { id: 'CRUDE OIL FUTURES', name: 'CRUDE OIL FUTURES (Crude Oil MCX)', category: 'Commodity', segment: 'Commodity', description: 'Crude Oil MCX specialized high conviction futures' },
  { id: 'EQUITY PREMIER', name: 'EQUITY PREMIER (Cash Long-Term & Delivery)', category: 'Cash / Equity', segment: 'Equity Cash', description: 'High alpha fundamental delivery & positional equity' },
];

// ─── KYC Case Workflow Types (Full Lifecycle) ─────────────────────────
export type KYCCaseStatus =
  | 'Not Started'
  | 'Documents Requested'
  | 'Awaiting Documents'
  | 'Draft'
  | 'Pending Approval'
  | 'In Review'
  | 'Needs Reupload'
  | 'Approved'
  | 'Rejected'
  | 'Withdrawn';

export type KYCCaseDocStatus =
  | 'Requested'
  | 'Uploaded'
  | 'Pending Review'
  | 'Verified'
  | 'Needs Reupload'
  | 'Rejected';

export interface KYCCaseDocument {
  type: KYCDocumentType;
  status: KYCCaseDocStatus;
  documentId?: string;        // Reference to KYCDocumentItem
  maskedNumber?: string;       // e.g. "XXXX-XXXX-8821"
  fileName?: string;
  uploadedAt?: string;
  version: number;
}

export interface KYCAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  detail: string;
  previousValue?: string;
  newValue?: string;
  isDelegated?: boolean;       // true when TL acts under delegated permission
}

export interface KYCCase {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  assignedAdvisorId: string;
  assignedAdvisorName: string;
  teamId?: string;
  teamLeaderId?: string;
  status: KYCCaseStatus;
  requiredDocuments: KYCDocumentType[];
  documents: KYCCaseDocument[];
  requestChannel?: string;      // 'SMS' | 'WhatsApp' | 'Email' | 'In-Person'
  requestedAt?: string;
  submittedAt?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewDecision?: 'Approved' | 'Rejected' | 'Needs Reupload';
  reviewReason?: string;
  reviewedAt?: string;
  isDelegatedReview?: boolean;
  policyNote?: string;
  auditTrail: KYCAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── Lead Change Audit Entry ──────────────────────────────────────────
export interface LeadChangeEntry {
  id: string;
  leadId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  field: string;
  previousValue: string;
  newValue: string;
  reason?: string;
}

// ─── Explicit Role Permission Matrix ──────────────────────────────────
export interface RolePermissionMatrix {
  // Lead access
  'leads.view.own': boolean;
  'leads.view.team': boolean;
  'leads.view.all': boolean;
  'leads.edit.own': boolean;
  'leads.edit.team': boolean;
  'leads.edit.all': boolean;
  'leads.assign.team': boolean;
  'leads.assign.all': boolean;
  'leads.reassign.team': boolean;
  'leads.reassign.all': boolean;
  // KYC
  'kyc.upload': boolean;
  'kyc.submit': boolean;
  'kyc.review.team': boolean;
  'kyc.review.all': boolean;
  'kyc.view.documents.team': boolean;
  'kyc.view.documents.all': boolean;
  // Team management
  'team.view.own': boolean;
  'team.coaching': boolean;
  'team.standup': boolean;
  'team.targets': boolean;
  // Administration
  'admin.employees': boolean;
  'admin.payroll': boolean;
  'admin.roles': boolean;
  'admin.settings': boolean;
  // Approval
  'approve.prospects': boolean;
  'approve.payments': boolean;
}

export const ROLE_PERMISSION_MATRIX: Record<UserRole, RolePermissionMatrix> = {
  admin: {
    'leads.view.own': true,
    'leads.view.team': true,
    'leads.view.all': true,
    'leads.edit.own': true,
    'leads.edit.team': true,
    'leads.edit.all': true,
    'leads.assign.team': true,
    'leads.assign.all': true,
    'leads.reassign.team': true,
    'leads.reassign.all': true,
    'kyc.upload': true,
    'kyc.submit': true,
    'kyc.review.team': true,
    'kyc.review.all': true,
    'kyc.view.documents.team': true,
    'kyc.view.documents.all': true,
    'team.view.own': true,
    'team.coaching': true,
    'team.standup': true,
    'team.targets': true,
    'admin.employees': true,
    'admin.payroll': true,
    'admin.roles': true,
    'admin.settings': true,
    'approve.prospects': true,
    'approve.payments': true,
  },
  employee: {
    'leads.view.own': true,
    'leads.view.team': false,
    'leads.view.all': false,
    'leads.edit.own': true,
    'leads.edit.team': false,
    'leads.edit.all': false,
    'leads.assign.team': false,
    'leads.assign.all': false,
    'leads.reassign.team': false,
    'leads.reassign.all': false,
    'kyc.upload': true,
    'kyc.submit': true,
    'kyc.review.team': false,
    'kyc.review.all': false,
    'kyc.view.documents.team': false,
    'kyc.view.documents.all': false,
    'team.view.own': false,
    'team.coaching': false,
    'team.standup': false,
    'team.targets': false,
    'admin.employees': false,
    'admin.payroll': false,
    'admin.roles': false,
    'admin.settings': false,
    'approve.prospects': false,
    'approve.payments': false,
  },
  team_leader: {
    'leads.view.own': true,
    'leads.view.team': true,
    'leads.view.all': false,
    'leads.edit.own': true,
    'leads.edit.team': true,
    'leads.edit.all': false,
    'leads.assign.team': true,
    'leads.assign.all': false,
    'leads.reassign.team': true,
    'leads.reassign.all': false,
    'kyc.upload': true,
    'kyc.submit': true,
    'kyc.review.team': true,   // Delegated KYC review – enabled by default
    'kyc.review.all': false,
    'kyc.view.documents.team': true,
    'kyc.view.documents.all': false,
    'team.view.own': true,
    'team.coaching': true,
    'team.standup': true,
    'team.targets': true,
    'admin.employees': false,
    'admin.payroll': false,
    'admin.roles': false,
    'admin.settings': false,
    'approve.prospects': false,
    'approve.payments': false,
  },
  manager: {
    'leads.view.own': true,
    'leads.view.team': true,
    'leads.view.all': true,
    'leads.edit.own': true,
    'leads.edit.team': true,
    'leads.edit.all': true,
    'leads.assign.team': true,
    'leads.assign.all': true,
    'leads.reassign.team': true,
    'leads.reassign.all': true,
    'kyc.upload': true,
    'kyc.submit': true,
    'kyc.review.team': true,
    'kyc.review.all': true,
    'kyc.view.documents.team': true,
    'kyc.view.documents.all': true,
    'team.view.own': true,
    'team.coaching': true,
    'team.standup': true,
    'team.targets': true,
    'admin.employees': false,
    'admin.payroll': false,
    'admin.roles': false,
    'admin.settings': false,
    'approve.prospects': true,
    'approve.payments': true,
  },
  hr: {
    'leads.view.own': false,
    'leads.view.team': false,
    'leads.view.all': true,
    'leads.edit.own': false,
    'leads.edit.team': false,
    'leads.edit.all': true,
    'leads.assign.team': false,
    'leads.assign.all': true,
    'leads.reassign.team': false,
    'leads.reassign.all': true,
    'kyc.upload': false,
    'kyc.submit': false,
    'kyc.review.team': false,
    'kyc.review.all': false,
    'kyc.view.documents.team': false,
    'kyc.view.documents.all': false,
    'team.view.own': false,
    'team.coaching': false,
    'team.standup': false,
    'team.targets': false,
    'admin.employees': true,
    'admin.payroll': true,
    'admin.roles': true,
    'admin.settings': true,
    'approve.prospects': false,
    'approve.payments': false,
  },
};

