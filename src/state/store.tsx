import { appendLeadResponse, isClosedOwn, isClosedWon, selectRealLeads, validateLegacyAssignee, validateLegacyResponse, canEditLegacyLead, legacyKYCComplete, sanitizeLeadRecords } from '../crm/legacyWorkflow';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  AdvisoryLead, 
  LeadStatus, 
  TaskItem, 
  NotificationItem, 
  PayslipRecord,
  KYCRecord,
  CallLogRecord,
  Team,
  TeamMember,
  CoachingNote,
  DailyStandup,
  TeamTarget,
  ClientSearchAlert,
  MarketWidgetConfig,
  RolePermissions,
  MarketInstrumentConfig,
  ConfirmedPaymentRecord,
  ActiveClientRecordDetailed,
  AdvisoryDispatchRecord,
  MarketQuote,
  KiteConfig,
  KYCDocumentItem,
  KYCDocumentStatus,
  KYCDocumentType,
  CallReminder,
  CallReminderStatus,
  CompanyAnnouncement,
  CashbackRule,
  EmployeeCashbackRecord,
  ExtendedAttendanceRecord,
  LeaveBalance,
  TradingDisplayConfig,
  SubscriptionExpirySMSConfig,
  ExpirySMSLog,
  RACallRecord,
  CompanyBankDetails,
  LeadSourcePool,
  LeadAssignmentHistory,
  KYCCase,
  KYCCaseStatus,
  KYCAuditEntry,
  LeadChangeEntry,
  ROLE_PERMISSION_MATRIX,
  GlobalDNDEntry,
  LeadDispositionEvent,
  ClientServiceSubscription,
  InvoiceTaxBreakdown,
  InvoiceData
} from '../types';
import { INITIAL_DETAILED_CLIENTS } from '../data/clientDatabase';
import { DEFAULT_MARKET_WIDGET_CONFIG, DEFAULT_ROLE_PERMISSIONS, MARKET_INSTRUMENTS } from '../config/marketInstruments';
import { 
  CURRENT_PROFILES, 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVES, 
  INITIAL_LEADS, 
  INITIAL_TASKS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_PAYSLIPS, 
  INITIAL_KYC_RECORDS, 
  INITIAL_CALL_LOGS, 
  INITIAL_TEAMS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_COACHING_NOTES, 
  INITIAL_DAILY_STANDUPS, 
  INITIAL_TEAM_TARGETS,
  INITIAL_LEAD_SOURCE_POOLS,
  INITIAL_ASSIGNMENT_HISTORY,
  INITIAL_CONFIRMED_PAYMENTS_LIST
} from '../data/initialData';
import {
  INITIAL_KYC_DOCUMENTS,
  INITIAL_CALL_REMINDERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CASHBACK_RULES,
  INITIAL_CASHBACK_RECORDS,
  INITIAL_EXTENDED_ATTENDANCE,
  INITIAL_LEAVE_BALANCES,
  INITIAL_TRADING_DISPLAY_CONFIG,
  INITIAL_EXPIRY_SMS_CONFIGS,
  INITIAL_EXPIRY_SMS_LOGS,
  INITIAL_RA_CALLS,
  INITIAL_COMPANY_BANK_DETAILS
} from '../data/workflowInitialData';
import { 
  RoleCredential, 
  getStoredCredentials, 
  saveStoredCredentials 
} from '../data/credentials';
import { pb, api, checkPocketBaseHealth } from '../api/pocketbase';
import confetti from 'canvas-confetti';

const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('ApexCRM', 1);
  request.onupgradeneeded = (e) => {
    const db = (e.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains('leads')) {
      db.createObjectStore('leads');
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function saveLeadsToIDB(leads: AdvisoryLead[]) {
  try {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('leads', 'readwrite');
      tx.objectStore('leads').put(leads, 'all_leads');
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (e) {
    console.warn('[IDB] Failed to save leads', e);
  }
}

async function getLeadsFromIDB(): Promise<AdvisoryLead[] | null> {
  try {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('leads', 'readonly');
      const req = tx.objectStore('leads').get('all_leads');
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    });
  } catch (e) {
    console.warn('[IDB] Failed to get leads', e);
    return null;
  }
}

export const isBirthdayToday = (dob?: string, targetDate: Date = new Date()): boolean => {
  if (!dob) return false;
  const currentMonth = targetDate.getMonth() + 1;
  const currentDay = targetDate.getDate();

  if (dob.includes('-')) {
    const parts = dob.split('-');
    if (parts.length === 3) {
      return parseInt(parts[1], 10) === currentMonth && parseInt(parts[2], 10) === currentDay;
    }
    if (parts.length === 2) {
      return parseInt(parts[0], 10) === currentMonth && parseInt(parts[1], 10) === currentDay;
    }
  }
  const parsed = new Date(dob);
  if (!isNaN(parsed.getTime())) {
    return parsed.getMonth() + 1 === currentMonth && parsed.getDate() === currentDay;
  }
  return false;
};

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: Employee;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Authentication & Credentials
  isAuthenticated: boolean;
  roleCredentials: Record<UserRole, RoleCredential>;
  updateRoleCredential: (role: UserRole, updates: Partial<RoleCredential>) => void;
  login: (targetRole: UserRole, email?: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;

  // Domain state
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedAt' | 'avatar' | 'employeeName' | 'department'>) => void;
  updateLeaveStatus: (leaveId: string, status: 'Approved' | 'Declined', note?: string) => void;
  advisoryLeads: AdvisoryLead[];
  setAdvisoryLeads: React.Dispatch<React.SetStateAction<AdvisoryLead[]>>;
  updateLeadStatus: (leadId: string, status: AdvisoryLead['status']) => void;
  bulkAddLeads: (leads: AdvisoryLead[]) => void;
  leadSourcePools: LeadSourcePool[];
  assignmentHistory: LeadAssignmentHistory[];
  allotLeadsBySourceToTeamLeader: (source: string, teamLeaderId: string, count: number) => { success: boolean; count: number; message: string };
  allotLeadsFromTeamPoolToEmployee: (teamLeaderId: string, source: string, employeeId: string, count: number) => { success: boolean; count: number; message: string };
  updateLeadResponse: (leadId: string, response: string, note?: string, callbackDate?: string, callbackTime?: string) => boolean;
  disposeLead: (leadId: string, reason: string) => void;
  addBulkSourceLeads: (source: string, count: number, leads?: Partial<AdvisoryLead>[]) => void;
  resetLeadStateToDefault: () => void;
  kycRecords: KYCRecord[];
  approveKYC: (id: string) => void;
  rejectKYC: (id: string, reason: string) => void;
  tasks: TaskItem[];
  toggleTask: (taskId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  payslips: PayslipRecord[];
  callLogs: CallLogRecord[];
  addCallLog: (log: Omit<CallLogRecord, 'id'>) => void;
  updateCallLogScore: (id: string, score: number, managerNote?: string) => void;

  // Live Punch Clock
  isClockedIn: boolean;
  clockInTime: string | null;
  isOnBreak: boolean;
  breakType: string | null;
  elapsedWorkSeconds: number;
  handlePunchToggle: () => void;
  handleBreakToggle: (breakName: string) => void;

  // Team Leader State
  teams: Team[];
  teamMembers: TeamMember[];
  coachingNotes: CoachingNote[];
  dailyStandups: DailyStandup[];
  teamTargets: TeamTarget[];
  getTeamForLeader: (leaderId: string) => Team | undefined;
  getTeamMemberIds: (leaderId: string) => string[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  addTeamMember: (teamId: string, employeeId: string) => void;
  removeTeamMember: (teamId: string, employeeId: string) => void;
  addCoachingNote: (note: Omit<CoachingNote, 'id'>) => void;
  addDailyStandup: (standup: Omit<DailyStandup, 'id'>) => void;
  setTeamTarget: (target: Omit<TeamTarget, 'id'>) => void;
  updateTeamTarget: (id: string, actualValue: number) => void;
  reassignLead: (leadId: string, newEmployeeId: string, newEmployeeName?: string, reason?: string) => void;
  batchReassignLeads: (leadIds: string[], newEmployeeId: string, reason?: string) => { success: boolean; count: number; message: string };

  // Cross-Employee Client/Lead Search Alerts
  clientSearchAlerts: ClientSearchAlert[];
  triggerClientSearchAlert: (params: Omit<ClientSearchAlert, 'id' | 'timestamp' | 'read' | 'acknowledged'>) => void;
  acknowledgeSearchAlert: (id: string) => void;
  dismissAllSearchAlerts: () => void;
  simulateCrossSearchAlert: () => void;

  // Birthday Celebration Pop-up
  isBirthdayCelebrationOpen: boolean;
  openBirthdayCelebration: () => void;
  closeBirthdayCelebration: () => void;
  todayBirthdays: Employee[];
  sendBirthdayWish: (recipientId: string, message: string) => void;
  simulateBirthdayCelebration: (targetEmployeeName?: string) => void;

  // Role Permissions & Security
  rolePermissions: RolePermissions;
  hasPermission: (permissionKey: string) => boolean;
  toggleRolePermission: (targetRole: UserRole, permissionKey: string) => void;

  // Market Widget Dashboard Settings
  marketWidgetConfig: MarketWidgetConfig;
  updateMarketWidgetConfig: (updates: Partial<MarketWidgetConfig>) => void;

  // Zerodha Kite Connect API Session
  kiteConfig: KiteConfig;
  updateKiteConfig: (updates: Partial<KiteConfig>) => void;

  // Dynamic Market Instruments & Manager Watchlist
  customInstruments: MarketInstrumentConfig[];
  addMarketInstrument: (instrument: MarketInstrumentConfig) => void;
  removeMarketInstrument: (key: string) => void;
  toggleInstrumentVisibility: (key: string) => void;
  bookClientPositionAndPayment: (data: {
    clientName: string;
    mobile: string;
    scriptName: string;
    entryPrice: number;
    exitPrice: number;
    lots: number;
    lotSize: number;
    totalProfit: number;
    advisoryAmount: number;
    bank: string;
    screenshotUrl?: string;
    notes?: string;
  }) => void;

  // Global Client Search Query (Synchronizes sidebar search with Search Results page)
  clientSearchQuery: string;
  setClientSearchQuery: (query: string) => void;

  // Detailed Active Clients & Service Subscriptions
  detailedClients: ActiveClientRecordDetailed[];
  saveClientWithService: (clientData: Partial<ActiveClientRecordDetailed> & { id?: string }) => void;
  updateClientService: (clientId: string, serviceName: string, startDate: string, endDate: string, trialStatus?: string, customNote?: string) => void;

  // Advisory Call Dispatches (SMS / Email / WhatsApp)
  dispatchedCalls: AdvisoryDispatchRecord[];
  dispatchAdvisoryCall: (params: {
    quote: MarketQuote | RACallRecord | any;
    targetClients: ActiveClientRecordDetailed[];
    channels: ('SMS' | 'Email' | 'WhatsApp')[];
    customMessage?: string;
  }) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;

  // ─── 1. KYC Verification & Document Upload ───────────────────────────
  kycDocuments: KYCDocumentItem[];
  uploadKYCDocument: (doc: Omit<KYCDocumentItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  reviewKYCDocument: (docId: string, status: KYCDocumentStatus, remarks?: string) => void;

  // ─── 2. Lead Access Security & Real-Time Alert ────────────────────────
  logLeadAccess: (leadId: string, action: string, leadName: string, leadStatus: string, assignedOwnerId: string, assignedOwnerName: string) => void;

  // ─── 3. Scheduled Call Reminders ─────────────────────────────────────
  callReminders: CallReminder[];
  scheduleCallReminder: (reminder: Omit<CallReminder, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  resolveCallReminder: (id: string, action: CallReminderStatus, rescheduleTime?: string, notes?: string) => void;

  // ─── 4. Company Greetings & Announcements ────────────────────────────
  announcements: CompanyAnnouncement[];
  createAnnouncement: (announcement: Omit<CompanyAnnouncement, 'id' | 'createdAt' | 'readByEmployeeIds'>) => void;
  updateAnnouncement: (id: string, updates: Partial<CompanyAnnouncement>) => void;
  deactivateAnnouncement: (id: string) => void;
  markAnnouncementRead: (id: string, employeeId: string) => void;

  // ─── 5. Employee Sales Cashback & Incentives ─────────────────────────
  cashbackRules: CashbackRule[];
  cashbackRecords: EmployeeCashbackRecord[];
  approveCashback: (id: string) => void;
  markCashbackPaid: (id: string) => void;
  updateCashbackRule: (rule: CashbackRule) => void;

  // ─── 6. Biometric Attendance & Leaves ────────────────────────────────
  extendedAttendance: ExtendedAttendanceRecord[];
  syncBiometricAttendance: () => void;
  importAttendanceRecords: (records: ExtendedAttendanceRecord[]) => void;
  leaveBalances: Record<string, LeaveBalance>;

  // ─── 8. Trading Display Config (Ticker vs Box Layout) ────────────────
  tradingDisplayConfig: TradingDisplayConfig;
  updateTradingDisplayConfig: (updates: Partial<TradingDisplayConfig>) => void;

  // ─── 9. Subscription Expiry SMS Management ──────────────────────────
  expirySMSConfigs: SubscriptionExpirySMSConfig[];
  expirySMSLogs: ExpirySMSLog[];
  sendExpirySMS: (clientId: string, templateText?: string) => void;
  updateExpirySMSConfig: (id: string, updates: Partial<SubscriptionExpirySMSConfig>) => void;

  // ─── 10. Research Analyst (RA) Calls ────────────────────────────────
  raCalls: RACallRecord[];
  createRACall: (call: Omit<RACallRecord, 'id' | 'openTime' | 'status'>) => void;
  updateRACallStatus: (id: string, status: RACallRecord['status']) => void;

  // ─── 11. Company Bank Details & Bank SMS ─────────────────────────────
  companyBankDetails: CompanyBankDetails;
  updateCompanyBankDetails: (details: Partial<CompanyBankDetails>) => void;
  sendBankDetailsSMS: (clientId: string, clientMobile: string, clientName: string) => void;

  // ─── 12. Free Trial RA Limit & Retrial Workflow ──────────────────────
  activateClientRetrial: (clientId: string) => void;
  markClientConverted: (clientId: string) => void;

  // ─── 13. KYC Case Lifecycle ──────────────────────────────────────────
  kycCases: KYCCase[];
  createKYCCase: (leadId: string, requiredDocs: KYCDocumentType[], channel?: string) => KYCCase | null;
  submitKYCCase: (caseId: string) => void;
  reviewKYCCase: (caseId: string, decision: 'Approved' | 'Rejected' | 'Needs Reupload', reason?: string) => void;
  getKYCCaseForLead: (leadId: string) => KYCCase | undefined;
  addKYCCaseDocument: (caseId: string, docType: KYCDocumentType, docId: string, maskedNumber?: string, fileName?: string) => void;

  // ─── 14. Lead Change Audit ───────────────────────────────────────────
  leadChangeLog: LeadChangeEntry[];
  logLeadChange: (leadId: string, field: string, prevValue: string, newValue: string, reason?: string) => void;

  // ─── 15. Role Permission Matrix Check ────────────────────────────────
  hasMatrixPermission: (permKey: string) => boolean;

  // ─── 16. Confirmed Payments & Client Conversion ──────────────────────
  confirmedPayments: ConfirmedPaymentRecord[];
  approveConfirmedPayment: (paymentId: string, utrNumber?: string, notes?: string) => { success: boolean; message: string };
  rejectConfirmedPayment: (paymentId: string, reason: string) => void;
  createConfirmedPayment: (payment: Omit<ConfirmedPaymentRecord, 'id' | 'date'>) => void;

  // ─── 17. Global DND Registry & Append-Only Dispositions ─────────────
  globalDNDList: GlobalDNDEntry[];
  addToGlobalDND: (phone: string, reason: string, leadId?: string) => void;
  isPhoneDND: (phone: string) => boolean;
  addLeadDisposition: (leadId: string, response: string, note?: string, callbackDate?: string, callbackTime?: string) => boolean;

  // ─── 18. Advisory Dispatch Gating Check (SEBI Compliance) ────────────
  canDispatchAdvisoryToClient: (clientIdOrCode: string) => { allowed: boolean; reason?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Toasts state & notifier - defined at top to prevent Temporal Dead Zone (TDZ) issues in downstream callbacks
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Theme state - White theme default matching classic CRM
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('apex_crm_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('apex_crm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Role state
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('apex_crm_role') as UserRole) || 'hr';
  });

  // Authentication state - defaults to false on fresh visits so user lands directly on the Login Portal
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isLoginPath = window.location.pathname === '/login' || window.location.hash === '#/login';
      if (isLoginPath) {
        return false;
      }
      return sessionStorage.getItem('apex_crm_authenticated') === 'true';
    }
    return false;
  });

  // Keep browser URL synchronized with auth state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) {
      if (window.location.pathname !== '/login' && window.location.hash !== '#/login') {
        try {
          window.history.replaceState({}, '', '/login');
        } catch (_) {}
      }
    } else {
      if (window.location.pathname === '/login') {
        try {
          window.history.replaceState({}, '', '/');
        } catch (_) {}
      }
    }
  }, [isAuthenticated]);

  // Support browser Back/Forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const isLoginPath = window.location.pathname === '/login' || window.location.hash === '#/login';
      if (isLoginPath) {
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Role Credentials State
  const [roleCredentials, setRoleCredentials] = useState<Record<UserRole, RoleCredential>>(() => {
    return getStoredCredentials();
  });

  const updateRoleCredential = (targetRole: UserRole, updates: Partial<RoleCredential>) => {
    setRoleCredentials(prev => {
      const next = {
        ...prev,
        [targetRole]: { ...prev[targetRole], ...updates }
      };
      saveStoredCredentials(next);
      return next;
    });
  };

  const login = (targetRole: UserRole, email?: string, password?: string): { success: boolean; error?: string } => {
    const cred = roleCredentials[targetRole];
    if (email && password) {
      const validEmail = 
        cred.email.toLowerCase() === email.trim().toLowerCase() ||
        email.trim().toLowerCase() === targetRole ||
        email.trim().toLowerCase() === CURRENT_PROFILES[targetRole].email.toLowerCase();
      
      if (!validEmail) {
        return { success: false, error: 'Incorrect email address for this role portal.' };
      }
      if (password !== cred.password) {
        return { success: false, error: 'Invalid password. Check credentials hint below.' };
      }
    }

    setRoleState(targetRole);
    localStorage.setItem('apex_crm_role', targetRole);
    setIsAuthenticated(true);
    sessionStorage.setItem('apex_crm_authenticated', 'true');
    localStorage.setItem('apex_crm_authenticated', 'true');
    setActiveTabState('dashboard');

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    // Birthday celebration popup logic on login:
    // If any employee has a birthday today or user has a birthday today, show the celebratory poster
    const targetProfile = CURRENT_PROFILES[targetRole];
    const targetEmp = employees.find(e => e.id === targetProfile?.id) || targetProfile;
    const isTargetUserBirthday = targetEmp ? isBirthdayToday(targetEmp.dob) : false;
    const hasCompanyBirthdays = employees.some(e => isBirthdayToday(e.dob));

    if (hasCompanyBirthdays || isTargetUserBirthday) {
      setIsBirthdayCelebrationOpen(true);
    } else {
      setIsBirthdayCelebrationOpen(false);
    }

    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      try {
        window.history.pushState({}, '', '/');
      } catch (_) {}
    }
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsBirthdayCelebrationOpen(false);
    sessionStorage.removeItem('apex_crm_authenticated');
    localStorage.removeItem('apex_crm_authenticated');
    setActiveTabState('dashboard');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (window.location.pathname !== '/login') {
        try {
          window.history.pushState({}, '', '/login');
        } catch (_) {}
      }
    }
    showToast('Logged out safely. Welcome back to Stocketics Portal.', 'info');
  };

  const [activeTab, setActiveTabState] = useState<string>('dashboard');

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainWrapper = document.querySelector('.main-wrapper');
      if (mainWrapper) mainWrapper.scrollTop = 0;
      const pageWrapper = document.querySelector('.page-content-wrapper');
      if (pageWrapper) pageWrapper.scrollTop = 0;
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('apex_crm_role', newRole);
    setActiveTab('dashboard');
    showToast(`Switched active view to ${newRole.toUpperCase()} Portal`, 'info');
  };



  // Sidebar & Command Palette
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('apex_crm_sidebar') === 'collapsed';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('apex_crm_sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Existing cached records are preserved until an explicit, backed-up migration.

  // Entities state with persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('apex_crm_employees');
    if (saved) {
      try {
        const parsed: Employee[] = JSON.parse(saved);
        return parsed.map(emp => {
          const init = INITIAL_EMPLOYEES.find(ie => ie.id === emp.id || ie.name.toLowerCase() === emp.name.toLowerCase());
          // Ensure dynamic celebrants (emp-008 Aditya Roy & emp-005 Sneha Kapur) always sync to today's active date
          const isDynamicCelebrant = init && (init.id === 'emp-008' || init.id === 'emp-005');
          return {
            ...emp,
            dob: isDynamicCelebrant ? init.dob : (emp.dob || (init ? init.dob : undefined))
          };
        });
      } catch (_) {}
    }
    return INITIAL_EMPLOYEES;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_employees', JSON.stringify(employees));
  }, [employees]);

  // Synchronize currentUser with live employees state so DOB and profile changes are reactive
  const currentUser = React.useMemo(() => {
    return employees.find(e => e.id === CURRENT_PROFILES[role]?.id) || CURRENT_PROFILES[role];
  }, [employees, role]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('apex_crm_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('apex_crm_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  const [advisoryLeads, setAdvisoryLeads] = useState<AdvisoryLead[]>(() => {
    const saved = localStorage.getItem('apex_crm_leads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(l => l.teamLeaderId || l.isTeamPool)) {
          return sanitizeLeadRecords(parsed);
        }
      } catch (_) {}
    }
    return INITIAL_LEADS;
  });

  useEffect(() => {
    async function loadIDB() {
      const idbSaved = await getLeadsFromIDB();
      if (idbSaved && Array.isArray(idbSaved) && idbSaved.length > 0) {
        setAdvisoryLeads(sanitizeLeadRecords(idbSaved));
      }
    }
    loadIDB();
  }, []);

  useEffect(() => {
    saveLeadsToIDB(advisoryLeads).catch(() => {});
    try {
      localStorage.setItem('apex_crm_leads', JSON.stringify(advisoryLeads));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded for leads. Safely falling back to IndexedDB.');
        localStorage.removeItem('apex_crm_leads');
      }
    }
  }, [advisoryLeads]);

  // Lead Source Pools State
  const [leadSourcePools, setLeadSourcePools] = useState<LeadSourcePool[]>(() => {
    const saved = localStorage.getItem('apex_crm_source_pools');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(pool => {
            const initialMatch = INITIAL_LEAD_SOURCE_POOLS.find(
              ip => ip.sourceName.trim().toLowerCase() === pool.sourceName.trim().toLowerCase()
            );
            if (initialMatch && pool.availableCount === 0 && initialMatch.availableCount > 0) {
              return { ...pool, availableCount: initialMatch.availableCount };
            }
            return pool;
          });
        }
      } catch (_) {}
    }
    return INITIAL_LEAD_SOURCE_POOLS;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_source_pools', JSON.stringify(leadSourcePools));
  }, [leadSourcePools]);

  // Lead Assignment History State
  const [assignmentHistory, setAssignmentHistory] = useState<LeadAssignmentHistory[]>(() => {
    const saved = localStorage.getItem('apex_crm_assignment_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return INITIAL_ASSIGNMENT_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_assignment_history', JSON.stringify(assignmentHistory));
  }, [assignmentHistory]);

  // ── Confirmed Payments State ──────────────────────────────────────────
  const [confirmedPayments, setConfirmedPayments] = useState<ConfirmedPaymentRecord[]>(() => {
    const saved = localStorage.getItem('apex_crm_confirmed_payments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return INITIAL_CONFIRMED_PAYMENTS_LIST;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_confirmed_payments', JSON.stringify(confirmedPayments));
  }, [confirmedPayments]);

  // ── Global DND Blacklist Registry ─────────────────────────────────────
  const [globalDNDList, setGlobalDNDList] = useState<GlobalDNDEntry[]>(() => {
    const saved = localStorage.getItem('apex_crm_global_dnd');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [
      { id: 'dnd-1', phone: '9988776655', clientName: 'Amit Shah (Flagged)', reason: 'Customer requested DND on call', addedById: 'emp-1', addedByName: 'Rohit Sharma', addedAt: '2026-09-20' },
      { id: 'dnd-2', phone: '9123456780', clientName: 'Sanjay Dutt', reason: 'Regulatory DND registry match', addedById: 'emp-2', addedByName: 'Priya Sharma', addedAt: '2026-09-22' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_global_dnd', JSON.stringify(globalDNDList));
  }, [globalDNDList]);

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('apex_crm_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [payslips] = useState<PayslipRecord[]>(INITIAL_PAYSLIPS);

  // Customer KYC Records State
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>(() => {
    const saved = localStorage.getItem('apex_crm_kyc');
    return saved ? JSON.parse(saved) : INITIAL_KYC_RECORDS;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_kyc', JSON.stringify(kycRecords));
  }, [kycRecords]);

  const approveKYC = (id: string) => {
    setKycRecords(prev => prev.map(k => {
      if (k.id === id) {
        return {
          ...k,
          status: 'Approved' as const,
          verifiedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verifiedBy: `${currentUser.name} (${role.toUpperCase()})`,
          rejectionReason: undefined
        };
      }
      return k;
    }));
    confetti({ particleCount: 50, spread: 60 });
    showToast('Customer KYC Approved & Verified successfully!', 'success');
  };

  const rejectKYC = (id: string, reason: string) => {
    setKycRecords(prev => prev.map(k => {
      if (k.id === id) {
        return {
          ...k,
          status: 'Rejected' as const,
          verifiedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          verifiedBy: `${currentUser.name} (${role.toUpperCase()})`,
          rejectionReason: reason
        };
      }
      return k;
    }));
    showToast('KYC rejected. Correction note dispatched to advisor.', 'warning');
  };

  const bulkAddLeads = (newLeads: AdvisoryLead[]) => {
    setAdvisoryLeads(prev => [...newLeads, ...prev]);
    confetti({ particleCount: 65, spread: 75 });
    showToast(`Successfully distributed ${newLeads.length} leads across team!`, 'success');
  };

  // Call Logs State
  const [callLogs, setCallLogs] = useState<CallLogRecord[]>(() => {
    const saved = localStorage.getItem('apex_crm_call_logs');
    return saved ? JSON.parse(saved) : INITIAL_CALL_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);

  // Detailed Active Clients State with Service Subscriptions
  const [detailedClients, setDetailedClients] = useState<ActiveClientRecordDetailed[]>(() => {
    const saved = localStorage.getItem('apex_crm_detailed_clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return INITIAL_DETAILED_CLIENTS;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_detailed_clients', JSON.stringify(detailedClients));
  }, [detailedClients]);

  const saveClientWithService = useCallback((clientData: Partial<ActiveClientRecordDetailed> & { id?: string }) => {
    setDetailedClients(prev => {
      const id = clientData.id || `client-${Date.now()}`;
      const existingIdx = prev.findIndex(c => c.id === id || (clientData.mobile && c.mobile === clientData.mobile));
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...clientData,
          tabCategory: 'clients',
          response: clientData.response || 'CLOSED WON',
          serviceName: clientData.serviceName || updated[existingIdx].serviceName || 'INDEX OPTION',
          startDate: clientData.startDate || updated[existingIdx].startDate || new Date().toISOString().slice(0, 10),
          endDate: clientData.endDate || updated[existingIdx].endDate || '2026-11-01',
          notesHistory: [
            {
              id: `note-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: currentUser.title || currentUser.role,
              timestamp: `${nowStr} (Service Subscribed)`,
              response: 'CLOSED WON',
              text: `Subscribed to service ${clientData.serviceName || 'INDEX OPTION'} from ${clientData.startDate || nowStr} to ${clientData.endDate || 'Ongoing'}.`
            },
            ...(updated[existingIdx].notesHistory || [])
          ]
        };
        return updated;
      } else {
        const newRecord: ActiveClientRecordDetailed = {
          id,
          clientCode: clientData.clientCode || `L-${Math.floor(20000000 + Math.random() * 9000000)}`,
          ownerName: clientData.ownerName || currentUser.name,
          generatorName: clientData.generatorName || currentUser.name,
          clientName: clientData.clientName || 'New Client',
          mobile: clientData.mobile || '',
          email: clientData.email || '',
          panNo: clientData.panNo || '',
          response: clientData.response || 'CLOSED WON',
          leadSource: clientData.leadSource || 'ADVISORY UPGRADE',
          description: clientData.description || `Active service subscriber for ${clientData.serviceName || 'INDEX OPTION'}`,
          tabCategory: 'clients',
          serviceName: clientData.serviceName || 'INDEX OPTION',
          startDate: clientData.startDate || new Date().toISOString().slice(0, 10),
          endDate: clientData.endDate || '2026-11-01',
          notesHistory: [
            {
              id: `note-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: currentUser.title || currentUser.role,
              timestamp: `${nowStr} (New Service Client)`,
              response: 'CLOSED WON',
              text: `Client acquired with service: ${clientData.serviceName || 'INDEX OPTION'}.`
            }
          ],
          freeTrials: [],
          invoices: [],
          kycData: {
            fullName: clientData.clientName || '',
            mobile: clientData.mobile || '',
            email: clientData.email || '',
            panNo: clientData.panNo || '',
            formType: 'Individual',
            status: 'Approved'
          },
          ...clientData
        };
        return [newRecord, ...prev];
      }
    });
    showToast(`Saved client "${clientData.clientName || 'Client'}" with service ${clientData.serviceName || 'INDEX OPTION'}!`, 'success');
  }, [currentUser, showToast]);

  const updateClientService = useCallback((
    clientId: string, 
    serviceName: string, 
    startDate: string, 
    endDate: string,
    trialStatus?: string,
    customNote?: string
  ) => {
    const nowStr = new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    let targetClientName = 'Client';

    setDetailedClients(prev => prev.map(c => {
      if (c.id === clientId) {
        targetClientName = c.clientName;
        const resolvedTrialStatus = trialStatus || c.trialStatus || (c.tabCategory === 'clients' ? 'Active' : 'Active Trial');
        const isConverted = resolvedTrialStatus === 'Converted' || resolvedTrialStatus === 'Active';

        const updatedHistory = [
          {
            id: `srv-note-${Date.now()}-${c.id}`,
            authorName: currentUser.name,
            authorRole: currentUser.title || currentUser.role,
            timestamp: nowStr,
            response: 'SERVICE UPDATE',
            text: customNote || `Updated service subscription to ${serviceName} (Valid: ${startDate} to ${endDate}) [Status: ${resolvedTrialStatus}].`
          },
          ...(c.notesHistory || [])
        ];

        return {
          ...c,
          serviceName,
          startDate,
          endDate,
          trialStatus: resolvedTrialStatus,
          trialStartDate: isConverted ? c.trialStartDate : (c.trialStartDate || startDate),
          trialEndDate: isConverted ? c.trialEndDate : (c.trialEndDate || endDate),
          tabCategory: isConverted ? 'clients' : c.tabCategory,
          notesHistory: updatedHistory
        };
      }
      return c;
    }));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Saved advisory service for "${targetClientName}": ${serviceName} (${startDate} to ${endDate})`, 'success');
  }, [currentUser, showToast]);

  // Advisory Call Dispatches state (SMS, Email, WhatsApp)
  const [dispatchedCalls, setDispatchedCalls] = useState<AdvisoryDispatchRecord[]>(() => {
    const saved = localStorage.getItem('stocketics_dispatched_calls');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('stocketics_dispatched_calls', JSON.stringify(dispatchedCalls));
  }, [dispatchedCalls]);

  const dispatchAdvisoryCall = useCallback((params: {
    quote: MarketQuote | RACallRecord | any;
    targetClients: ActiveClientRecordDetailed[];
    channels: ('SMS' | 'Email' | 'WhatsApp')[];
    customMessage?: string;
  }) => {
    const { quote, targetClients, channels, customMessage } = params;
    if (targetClients.length === 0) {
      showToast('No active clients selected for dispatch.', 'warning');
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    // Normalize signal/quote attributes
    const scriptName = ('title' in quote && quote.title) ? quote.title : (quote.label || 'ADVISORY SIGNAL');
    const serviceSegment = ('segment' in quote && quote.segment) ? quote.segment : (quote.serviceSegment || 'INDEX OPTION');
    const callType: 'BUY' | 'SELL' = (quote.callType || (('type' in quote && (quote.type === 'BUY' || quote.type === 'SELL')) ? quote.type : 'BUY'));
    const entryPrice = typeof quote.entryPrice === 'number' ? quote.entryPrice : (typeof quote.value === 'number' ? quote.value : 0);
    const target1 = typeof quote.target1 === 'number' ? quote.target1 : +(entryPrice * 1.25).toFixed(2);
    const target2 = typeof quote.target2 === 'number' ? quote.target2 : +(entryPrice * 1.45).toFixed(2);
    const stopLoss = typeof quote.stopLoss === 'number' ? quote.stopLoss : +(entryPrice * 0.82).toFixed(2);
    const ltpAtSend = typeof quote.value === 'number' ? quote.value : entryPrice;
    const analyst = quote.analystName || quote.analyst || quote.givenBy || currentUser.name || 'Aditya Roy';
    const analystRegNo = quote.analystRegNo || 'INH000008921';

    const dispatchId = `DISPATCH-${Date.now().toString().slice(-6)}`;
    const smsText = customMessage || 
      `[STOCKETICS LIVE RA CALL] ${callType} ${scriptName} @ ₹${entryPrice.toFixed(2)} | TGT1: ₹${target1.toFixed(2)} | TGT2: ₹${target2.toFixed(2)} | SL: ₹${stopLoss.toFixed(2)} | RA: ${analyst} (SEBI Reg: ${analystRegNo}). Standard T&C apply.`;

    const newDispatch: AdvisoryDispatchRecord = {
      id: dispatchId,
      scriptName,
      serviceSegment,
      callType,
      entryPrice,
      target1,
      target2,
      stopLoss,
      ltpAtSend,
      channels,
      recipientCount: targetClients.length,
      recipients: targetClients.map(c => ({
        clientId: c.id,
        clientName: c.clientName,
        mobile: c.mobile,
        email: c.email
      })),
      smsTemplateUsed: 'STKADV-LIVE-RA-CALL',
      sentBy: currentUser.name,
      sentRole: currentUser.title || currentUser.role,
      sentAt: nowStr,
      status: 'Delivered'
    };

    setDispatchedCalls(prev => [newDispatch, ...prev]);

    // Update each client's notes with this dispatch AND increment callsDeliveredCount & lastCallSentAt
    const targetIds = new Set(targetClients.map(c => c.id));
    setDetailedClients(prev => prev.map(c => {
      if (targetIds.has(c.id)) {
        const nextDeliveredCount = (c.callsDeliveredCount || 0) + 1;
        return {
          ...c,
          callsDeliveredCount: nextDeliveredCount,
          lastCallSentAt: nowStr,
          notesHistory: [
            {
              id: `dispatch-note-${Date.now()}-${c.id}`,
              authorName: currentUser.name,
              authorRole: currentUser.title || currentUser.role,
              timestamp: `${nowStr} (${channels.join('/')} Dispatched)`,
              response: 'DISPATCHED CALL',
              text: `Dispatched ${callType} ${scriptName} (Entry: ₹${entryPrice.toFixed(2)}, TGT1: ₹${target1.toFixed(2)}, SL: ₹${stopLoss.toFixed(2)}) via ${channels.join(', ')}. (Total Calls Delivered: ${nextDeliveredCount})`
            },
            ...(c.notesHistory || [])
          ]
        };
      }
      return c;
    }));

    // Append to SMS report logs in localStorage for SMSDeliveryReportView
    try {
      const existingReports = localStorage.getItem('apex_crm_sms_reports');
      const reportsList = existingReports ? JSON.parse(existingReports) : [];
      targetClients.forEach((tc, idx) => {
        reportsList.unshift({
          sNo: reportsList.length + 1,
          id: `sms-disp-${Date.now()}-${idx}`,
          ownerName: tc.clientName,
          mobile: tc.mobile,
          message: smsText,
          sender: 'STKADV',
          sentTime: nowStr,
          deliveryTime: nowStr,
          status: 'Delivered',
          sendBy: currentUser.name,
          type: 'Trading Tip'
        });
      });
      localStorage.setItem('apex_crm_sms_reports', JSON.stringify(reportsList));
    } catch (_) {}

    // In-app Notification
    setNotifications(prev => [
      {
        id: `notif-disp-${Date.now()}`,
        title: `Advisory Call Dispatched: ${scriptName}`,
        message: `Successfully sent ${callType} ${scriptName} to ${targetClients.length} active clients via ${channels.join(', ')}.`,
        time: 'Just now',
        read: false,
        type: 'system'
      },
      ...prev
    ]);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Advisory call on ${scriptName} delivered to ${targetClients.length} active clients via ${channels.join(' & ')}!`, 'success');
  }, [currentUser, showToast]);

  // ─── Team Leader State ─────────────────────────────────────────────
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('apex_crm_teams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      } catch (_) {}
    }
    return INITIAL_TEAMS;
  });
  useEffect(() => { localStorage.setItem('apex_crm_teams', JSON.stringify(teams)); }, [teams]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('apex_crm_team_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      } catch (_) {}
    }
    return INITIAL_TEAM_MEMBERS;
  });
  useEffect(() => { localStorage.setItem('apex_crm_team_members', JSON.stringify(teamMembers)); }, [teamMembers]);

  const [coachingNotes, setCoachingNotes] = useState<CoachingNote[]>(() => {
    const saved = localStorage.getItem('apex_crm_coaching_notes');
    return saved ? JSON.parse(saved) : INITIAL_COACHING_NOTES;
  });
  useEffect(() => { localStorage.setItem('apex_crm_coaching_notes', JSON.stringify(coachingNotes)); }, [coachingNotes]);

  const [dailyStandups, setDailyStandups] = useState<DailyStandup[]>(() => {
    const saved = localStorage.getItem('apex_crm_standups');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_STANDUPS;
  });
  useEffect(() => { localStorage.setItem('apex_crm_standups', JSON.stringify(dailyStandups)); }, [dailyStandups]);

  const [teamTargets, setTeamTargets] = useState<TeamTarget[]>(() => {
    const saved = localStorage.getItem('apex_crm_team_targets');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_TARGETS;
  });
  useEffect(() => { localStorage.setItem('apex_crm_team_targets', JSON.stringify(teamTargets)); }, [teamTargets]);

  // Team helper functions
  const getTeamForLeader = (leaderId: string): Team | undefined => {
    return teams.find(t => t.leaderId === leaderId && t.status === 'Active');
  };

  const getTeamMemberIds = (leaderId: string): string[] => {
    const team = getTeamForLeader(leaderId);
    if (!team) return [];
    return teamMembers.filter(tm => tm.teamId === team.id).map(tm => tm.employeeId);
  };

  const addTeam = (data: Omit<Team, 'id'>) => {
    const newTeam: Team = { ...data, id: `team-${Date.now().toString(36)}` };
    setTeams(prev => [newTeam, ...prev]);
    confetti({ particleCount: 50, spread: 60 });
    showToast(`Team "${newTeam.name}" created successfully!`, 'success');
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
    showToast('Team updated successfully!', 'success');
  };

  const addTeamMember = (teamId: string, employeeId: string) => {
    const exists = teamMembers.some(tm => tm.teamId === teamId && tm.employeeId === employeeId);
    if (exists) { showToast('Employee is already in this team.', 'warning'); return; }
    setTeamMembers(prev => [...prev, {
      teamId, employeeId,
      joinedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }]);
    const emp = employees.find(e => e.id === employeeId);
    showToast(`${emp?.name || 'Employee'} added to team!`, 'success');
  };

  const removeTeamMember = (teamId: string, employeeId: string) => {
    setTeamMembers(prev => prev.filter(tm => !(tm.teamId === teamId && tm.employeeId === employeeId)));
    const emp = employees.find(e => e.id === employeeId);
    showToast(`${emp?.name || 'Employee'} removed from team.`, 'info');
  };

  const addCoachingNote = (data: Omit<CoachingNote, 'id'>) => {
    const newNote: CoachingNote = { ...data, id: `cn-${Date.now().toString(36)}` };
    setCoachingNotes(prev => [newNote, ...prev]);
    showToast('Coaching note saved!', 'success');
  };

  const addDailyStandup = (data: Omit<DailyStandup, 'id'>) => {
    const newStandup: DailyStandup = { ...data, id: `su-${Date.now().toString(36)}` };
    setDailyStandups(prev => [newStandup, ...prev]);
    showToast('Standup submitted!', 'success');
  };

  const setTeamTarget = (data: Omit<TeamTarget, 'id'>) => {
    const newTarget: TeamTarget = { ...data, id: `tt-${Date.now().toString(36)}` };
    setTeamTargets(prev => [newTarget, ...prev]);
    showToast('Target set successfully!', 'success');
  };

  const updateTeamTarget = (id: string, actualValue: number) => {
    setTeamTargets(prev => prev.map(t => t.id === id ? { ...t, actualValue } : t));
    showToast('Target progress updated!', 'success');
  };

  const reassignLead = (leadId: string, newEmployeeId: string, _newEmployeeName?: string, reason?: string) => {
    batchReassignLeads([leadId], newEmployeeId, reason);
  };

  const batchReassignLeads = (leadIds: string[], newEmployeeId: string, reason?: string) => {
    if (!leadIds || leadIds.length === 0) {
      showToast('No leads selected for reassignment.', 'warning');
      return { success: false, count: 0, message: 'No leads selected' };
    }

    const targetEmp = employees.find(e => e.id === newEmployeeId);
    if (!targetEmp) {
      showToast('Selected recipient employee was not found.', 'error');
      return { success: false, count: 0, message: 'Invalid recipient' };
    }

    if (!['Active', 'Remote'].includes(targetEmp.status)) {
      showToast(`${targetEmp.name} is currently inactive and cannot receive leads.`, 'error');
      return { success: false, count: 0, message: 'Employee inactive' };
    }

    // Auto-detect destination team & team leader mapping for data integrity
    const memberRecord = teamMembers.find(tm => tm.employeeId === newEmployeeId);
    const targetTeam = memberRecord ? teams.find(t => t.id === memberRecord.teamId) : undefined;
    const targetLeader = targetTeam ? employees.find(e => e.id === targetTeam.leaderId) : undefined;

    const leadIdSet = new Set(leadIds);
    const targetLeads = advisoryLeads.filter(l => leadIdSet.has(l.id));

    if (targetLeads.length === 0) {
      showToast('Selected leads could not be found.', 'error');
      return { success: false, count: 0, message: 'Leads not found' };
    }

    const isManagerRole = ['manager', 'hr', 'admin'].includes(role);
    const myTeamMemberIds = getTeamMemberIds(currentUser.id);

    // Permission scoping: Managers can reassign any lead; Team Leaders reassign squad or team pool leads
    const eligibleLeads = targetLeads.filter(l => {
      if (isManagerRole) return true;
      if (role === 'team_leader') {
        return l.teamLeaderId === currentUser.id || myTeamMemberIds.includes(l.assignedToId) || l.assignedToId === currentUser.id;
      }
      return false;
    });

    if (eligibleLeads.length === 0) {
      showToast('You do not have permission to reassign the selected lead(s).', 'error');
      return { success: false, count: 0, message: 'Permission denied' };
    }

    const eligibleIds = new Set(eligibleLeads.map(l => l.id));
    const nowFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    setAdvisoryLeads(prev => prev.map(lead => {
      if (eligibleIds.has(lead.id)) {
        return {
          ...lead,
          assignedToId: targetEmp.id,
          assignedToName: targetEmp.name,
          teamId: targetTeam?.id || lead.teamId,
          teamLeaderId: targetLeader?.id || lead.teamLeaderId,
          teamLeaderName: targetLeader?.name || lead.teamLeaderName,
          assignedById: currentUser.id,
          assignedByName: currentUser.name,
          assignedAt: nowFormatted,
          isTeamPool: false
        };
      }
      return lead;
    }));

    const historyEntries: LeadAssignmentHistory[] = eligibleLeads.map(l => ({
      id: `lah-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      leadId: l.id,
      leadName: l.clientName,
      source: l.source || 'General',
      fromId: l.assignedToId,
      fromName: l.assignedToName || 'Unassigned',
      toId: targetEmp.id,
      toName: targetEmp.name,
      assignedById: currentUser.id,
      assignedByName: currentUser.name,
      assignedAt: nowFormatted,
      assignmentType: 'reassignment',
      leadCount: 1
    }));
    setAssignmentHistory(prev => [...historyEntries, ...prev]);

    setNotifications(prev => [{
      id: `notif-${Date.now().toString(36)}`,
      title: 'Leads Reassigned',
      message: `${eligibleLeads.length} lead${eligibleLeads.length > 1 ? 's were' : ' was'} reassigned to you by ${currentUser.name}.${reason ? ` Note: ${reason}` : ''}`,
      time: nowIso,
      type: 'lead_access' as const,
      read: false,
      targetUserId: targetEmp.id,
      actionTab: 'new-leads'
    }, ...prev]);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(
      eligibleLeads.length === 1 
        ? `Lead "${eligibleLeads[0].clientName}" reassigned to ${targetEmp.name}!` 
        : `Successfully reassigned ${eligibleLeads.length} leads to ${targetEmp.name}!`, 
      'success'
    );

    return { success: true, count: eligibleLeads.length, message: 'Leads successfully reassigned' };
  };

  // Allocate existing records only; never manufacture inventory when a pool is short.
  const commitLegacyAllocation = (selected: AdvisoryLead[], recipient: Employee, leader: Employee, team: Team, toEmployee: boolean) => {
    const ids = new Set(selected.map(l => l.id));
    const timestamp = new Date().toISOString();
    setAdvisoryLeads(prev => {
      const existingIds = new Set(prev.map(l => l.id));
      const updatedExisting = prev.map(l => ids.has(l.id) ? {
        ...l, teamId: team.id, teamLeaderId: leader.id, teamLeaderName: leader.name,
        assignedToId: recipient.id, assignedToName: recipient.name,
        isTeamPool: !toEmployee, assignedById: currentUser.id, assignedByName: currentUser.name, assignedAt: timestamp
      } : l);
      const newItems = selected.filter(l => !existingIds.has(l.id)).map(l => ({
        ...l, teamId: team.id, teamLeaderId: leader.id, teamLeaderName: leader.name,
        assignedToId: recipient.id, assignedToName: recipient.name,
        isTeamPool: !toEmployee, assignedById: currentUser.id, assignedByName: currentUser.name, assignedAt: timestamp
      }));
      return [...newItems, ...updatedExisting];
    });
    setAssignmentHistory(prev => [...selected.map(l => ({
      id: `lah-${crypto.randomUUID()}`, leadId: l.id, leadName: l.clientName,
      source: l.source || 'General', fromId: l.assignedToId, fromName: l.assignedToName,
      toId: recipient.id, toName: recipient.name, assignedById: currentUser.id,
      assignedByName: currentUser.name, assignedAt: timestamp,
      assignmentType: (toEmployee ? 'team_to_employee' : 'manager_to_team') as LeadAssignmentHistory['assignmentType'], leadCount: 1
    })), ...prev]);
    if (!toEmployee) {
      const allottedSource = selected[0]?.source;
      if (allottedSource) {
        const normAllotted = allottedSource.trim().replace(/\s+/g, ' ').toLowerCase();
        setLeadSourcePools(prev => prev.map(pool => {
          const normPool = pool.sourceName.trim().replace(/\s+/g, ' ').toLowerCase();
          if (normPool === normAllotted) {
            return {
              ...pool,
              availableCount: Math.max(0, pool.availableCount - selected.length)
            };
          }
          return pool;
        }));
      }
    }
    setNotifications(prev => [{ id: `notif-${crypto.randomUUID()}`, title: 'Leads assigned',
      message: `${selected.length} existing leads assigned by ${currentUser.name}.`, time: timestamp,
      type: 'lead_access' as const, read: false, targetUserId: recipient.id, actionTab: 'new-leads'
    }, ...prev]);
    showToast(`${selected.length} leads assigned to ${recipient.name}.`, 'success');
    return { success: true, count: selected.length, message: 'Assignment saved in this portal.' };
  };
  const allotLeadsBySourceToTeamLeader = (source: string, teamLeaderId: string, count: number) => {
    try {
      const isPermitted = role === 'manager' || role === 'hr' || (role as string) === 'admin';
      if (!isPermitted && !hasPermission('leads.assign.all')) {
        throw new Error('Manager assignment permission is required.');
      }
      const leader = employees.find(e => e.id === teamLeaderId);
      if (!leader) throw new Error('Selected team leader was not found.');
      if (leader.id === currentUser.id || leader.name === currentUser.name) {
        throw new Error('You cannot allot leads to yourself as manager. Please select an eligible Team Leader.');
      }
      let team = teams.find(t => t.leaderId === teamLeaderId && t.status === 'Active');
      if (!team) {
        team = teams.find(t => t.leaderId === teamLeaderId) || teams[0];
      }
      if (!team) {
        team = {
          id: `team-${leader.id}`,
          name: `${leader.name}'s Squad`,
          leaderId: leader.id,
          department: 'Advisory Sales',
          createdAt: new Date().toLocaleDateString('en-GB'),
          status: 'Active'
        };
      }
      const selected = selectRealLeads(advisoryLeads, source, count);
      return commitLegacyAllocation(selected, leader, leader, team, false);
    } catch (error) { return { success: false, count: 0, message: error instanceof Error ? error.message : 'Assignment failed.' }; }
  };
  const allotLeadsFromTeamPoolToEmployee = (teamLeaderId: string, source: string, employeeId: string, count: number) => {
    try {
      if (role !== 'team_leader' || teamLeaderId !== currentUser.id || !hasPermission('leads.assign.team')) throw new Error('Only this Team Leader can allocate their pool.');
      const employee = employees.find(e => e.id === employeeId);
      if (!employee) throw new Error('Selected employee was not found.');
      const leader = employees.find(e => e.id === teamLeaderId) || (currentUser as Employee);
      let team = teams.find(t => t.leaderId === teamLeaderId && t.status === 'Active');
      if (!team) {
        team = teams.find(t => t.leaderId === teamLeaderId) || teams[0];
      }
      if (!team) {
        team = {
          id: `team-${leader.id}`,
          name: `${leader.name}'s Squad`,
          leaderId: leader.id,
          department: 'Advisory Sales',
          createdAt: new Date().toLocaleDateString('en-GB'),
          status: 'Active'
        };
      }
      const selected = selectRealLeads(advisoryLeads, source, count, teamLeaderId);
      return commitLegacyAllocation(selected, employee, leader as Employee, team, true);
    } catch (error) { return { success: false, count: 0, message: error instanceof Error ? error.message : 'Assignment failed.' }; }
  };
  const addToGlobalDND = useCallback((phone: string, reason: string, leadId?: string) => {
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').slice(-10);
    setGlobalDNDList(prev => {
      if (prev.some(entry => entry.phone.replace(/[\s\-\+]/g, '').slice(-10) === cleanPhone)) {
        return prev;
      }
      const newEntry: GlobalDNDEntry = {
        id: `dnd-${Date.now()}`,
        phone,
        leadId,
        reason,
        addedById: currentUser.id,
        addedByName: currentUser.name,
        addedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      return [newEntry, ...prev];
    });
    showToast(`Phone ${phone} added to Global DND Blacklist.`, 'warning');
  }, [currentUser, showToast]);

  const isPhoneDND = useCallback((phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').slice(-10);
    return globalDNDList.some(entry => entry.phone.replace(/[\s\-\+]/g, '').slice(-10) === cleanPhone);
  }, [globalDNDList]);

  // ── Lead Response & Disposition Management ─────────────────────────────
  const addLeadDisposition = useCallback((leadId: string, response: string, note?: string, callbackDate?: string, callbackTime?: string) => {
    const target = advisoryLeads.find(l => l.id === leadId);
    if (!target || !canEditLegacyLead(role, currentUser.id, target, getTeamMemberIds(currentUser.id))) { showToast('This lead is outside your current ownership scope.', 'error'); return false; }
    if (response === 'Call Back' && !callbackDate) { showToast('Choose a date and time for the next callback.', 'error'); return false; }
    try { validateLegacyResponse(note, callbackDate, callbackTime); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Invalid response.', 'error'); return false; }
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const isDND = response === 'DND';

    setAdvisoryLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        let newStatus: AdvisoryLead['status'] = lead.status;
        if (isClosedOwn({ status: 'New Lead', response })) {
          newStatus = lead.status === 'Converted' ? 'Converted' : 'In Contact';
        } else if (response === 'Interested') {
          newStatus = 'Trial Active';
        } else if (response === 'Payment' || response === 'Converted') {
          // Recording an outcome alone must not pretend a client was created.
          newStatus = lead.status;
        } else if (response === 'Not Interested' || response === 'DND') {
          newStatus = 'Lost';
        } else if (response === 'Call Back' || response === 'Busy') {
          newStatus = 'In Contact';
        }

        const dispEvent: LeadDispositionEvent = {
          id: `disp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          leadId,
          timestamp: new Date().toISOString(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: role,
          response,
          note,
          callbackDate,
          callbackTime,
          sentiment: response === 'Interested' || response === 'Payment' ? 'Positive' : response === 'Call Back' ? 'Neutral' : 'Challenging'
        };

        const updatedHistory = appendLeadResponse(lead, dispEvent);
        const newDescription = note 
          ? (lead.description ? `${note} | ${lead.description}` : note)
          : lead.description;

        if (isDND) {
          addToGlobalDND(lead.phone, note || 'Client requested DND during call', lead.id);
        }

        return {
          ...lead,
          response,
          status: newStatus,
          modifiedToday: true,
          lastContactDate: todayStr,
          callbackDate: callbackDate,
          callbackTime: callbackTime,
          description: newDescription,
          isDND: isDND || lead.isDND,
          dispositionHistory: updatedHistory
        };
      }
      return lead;
    }));

    showToast(`Lead updated: response marked as "${response}"!`, 'success');
    return true;
  }, [advisoryLeads, currentUser, role, teams, teamMembers, addToGlobalDND, showToast]);

  const updateLeadResponse = (leadId: string, response: string, note?: string, callbackDate?: string, callbackTime?: string) => {
    return addLeadDisposition(leadId, response, note, callbackDate, callbackTime);
  };

  const disposeLead = (leadId: string, reason: string) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setAdvisoryLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          response: reason,
          status: 'Lost',
          disposedToday: true,
          disposedAt: todayStr,
          lastContactDate: todayStr,
          modifiedToday: true,
          description: lead.description ? `[Disposed: ${reason}] ${lead.description}` : `[Disposed: ${reason}]`
        };
      }
      return lead;
    }));
    showToast(`Lead disposed: ${reason}`, 'info');
  };

  const addBulkSourceLeads = (source: string, count: number, leads?: Partial<AdvisoryLead>[]) => {
    const cleanSource = source.trim().replace(/\s+/g, ' ');
    let canonicalSource = cleanSource;

    setLeadSourcePools(prev => {
      const matchIndex = prev.findIndex(sp => sp.sourceName.trim().replace(/\s+/g, ' ').toLowerCase() === cleanSource.toLowerCase());
      if (matchIndex !== -1) {
        canonicalSource = prev[matchIndex].sourceName;
        return prev.map((sp, idx) => {
          if (idx === matchIndex) {
            return { 
              ...sp, 
              availableCount: sp.availableCount + count, 
              totalUploaded: sp.totalUploaded + count 
            };
          }
          return sp;
        });
      } else {
        return [
          {
            sourceName: cleanSource,
            availableCount: count,
            totalUploaded: count,
            language: 'General'
          },
          ...prev
        ];
      }
    });

    if (leads && leads.length > 0) {
      const normalizedLeads: AdvisoryLead[] = leads.map(l => ({
        ...l,
        source: canonicalSource,
        isTeamPool: false,
        assignedToId: '',
        assignedToName: '',
        teamLeaderId: '',
        status: (l.status || 'New Lead') as LeadStatus,
        response: l.response || 'Fresh'
      } as AdvisoryLead));
      setAdvisoryLeads(prev => [...normalizedLeads, ...prev]);
    }
    showToast(`Added ${count.toLocaleString()} leads to pool under "${canonicalSource}"!`, 'success');
  };

  const resetLeadStateToDefault = () => {
    localStorage.removeItem('apex_crm_leads');
    localStorage.removeItem('apex_crm_source_pools');
    localStorage.removeItem('apex_crm_assignment_history');
    setAdvisoryLeads(INITIAL_LEADS);
    setLeadSourcePools(INITIAL_LEAD_SOURCE_POOLS);
    setAssignmentHistory(INITIAL_ASSIGNMENT_HISTORY);
    showToast('Reset lead state & pools to default seed data!', 'info');
  };

  // ─── Cross-Employee Client/Lead Search Alert State ──────────────────
  const [clientSearchAlerts, setClientSearchAlerts] = useState<ClientSearchAlert[]>(() => {
    const saved = localStorage.getItem('apex_crm_search_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [
      {
        id: 'csa-initial-1',
        clientId: 'client-shihab',
        clientCode: 'L-21673106',
        clientName: 'Shihabudheen Chelembra',
        clientMobile: '7012826397',
        targetType: 'client',
        ownerId: 'emp-008',
        ownerName: 'Aditya Roy',
        searchedById: 'emp-006',
        searchedByName: 'Rohan Deshmukh',
        searchedByRole: 'Senior Portfolio Advisor',
        searchedByAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        searchQuery: 'Shihabudheen',
        searchLocation: 'Active Clients Search Bar',
        timestamp: 'Today, 10:42 AM',
        read: false,
        acknowledged: false,
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_search_alerts', JSON.stringify(clientSearchAlerts));
  }, [clientSearchAlerts]);

  const triggerClientSearchAlert = (params: Omit<ClientSearchAlert, 'id' | 'timestamp' | 'read' | 'acknowledged'>) => {
    if (!params.ownerName || params.ownerName.toLowerCase() === 'unassigned') return;
    if (params.searchedByName.toLowerCase() === params.ownerName.toLowerCase()) return;

    // Avoid duplicate unacknowledged alerts for the same client and searcher
    const isRecentDuplicate = clientSearchAlerts.some(
      a => a.clientId === params.clientId &&
           a.searchedByName.toLowerCase() === params.searchedByName.toLowerCase() &&
           !a.acknowledged
    );
    if (isRecentDuplicate) return;

    const newAlert: ClientSearchAlert = {
      ...params,
      id: `csa-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: `Today, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      read: false,
      acknowledged: false,
    };

    setClientSearchAlerts(prev => [newAlert, ...prev]);

    // Immediate feedback for searcher
    showToast(`🔒 Access Logged: ${params.ownerName} was notified that you searched "${params.clientName}".`, 'warning');
  };

  const acknowledgeSearchAlert = (id: string) => {
    setClientSearchAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true, read: true } : a));
  };

  const dismissAllSearchAlerts = () => {
    setClientSearchAlerts(prev => prev.map(a => ({ ...a, acknowledged: true, read: true })));
  };

  const simulateCrossSearchAlert = () => {
    const colleagues = employees.filter(e => e.id !== currentUser.id && e.name !== currentUser.name);
    const randomColleague = colleagues[Math.floor(Math.random() * colleagues.length)] || {
      id: 'emp-005',
      name: 'Sneha Kapur',
      role: 'Senior Derivatives Analyst',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
    };

    const targetClientNames = [
      { name: 'Shihabudheen Chelembra', code: 'L-21673106', phone: '+91 70128 26397' },
      { name: 'Rajesh K. Singhania', code: 'L-21673108', phone: '+91 98201 00401' },
      { name: 'Vikram Malhotra', code: 'L-21673115', phone: '+91 98112 34567' },
      { name: 'Kavita Radhakrishnan', code: 'L-21673120', phone: '+91 98470 00403' }
    ];
    const chosen = targetClientNames[Math.floor(Math.random() * targetClientNames.length)];

    const newAlert: ClientSearchAlert = {
      id: `csa-sim-${Date.now()}`,
      clientId: `client-${Date.now()}`,
      clientCode: chosen.code,
      clientName: chosen.name,
      clientMobile: chosen.phone,
      targetType: 'client',
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      searchedById: randomColleague.id,
      searchedByName: randomColleague.name,
      searchedByRole: randomColleague.role || 'Equity Advisor',
      searchedByAvatar: randomColleague.avatar,
      searchQuery: chosen.name.split(' ')[0],
      searchLocation: 'Active Clients Search Bar',
      timestamp: 'Just now',
      read: false,
      acknowledged: false,
    };

    setClientSearchAlerts(prev => [newAlert, ...prev]);
    showToast(`Simulated: ${randomColleague.name} just searched your client "${chosen.name}"!`, 'info');
  };

  // -------------------------------------------------------------
  // COMPANY BIRTHDAY CELEBRATION POP-UP STATE & METHODS
  // -------------------------------------------------------------
  const [isBirthdayCelebrationOpen, setIsBirthdayCelebrationOpen] = useState<boolean>(false);
  const [simulatedCelebrant, setSimulatedCelebrant] = useState<Employee | null>(null);

  const todayBirthdays = React.useMemo(() => {
    let matched = employees.filter(emp => isBirthdayToday(emp.dob));
    if (simulatedCelebrant && !matched.some(e => e.id === simulatedCelebrant.id)) {
      matched = [simulatedCelebrant, ...matched];
    }
    // Fallback: If no employee matches today's date,
    // guarantee Aditya Roy (emp-008) and Sneha Kapur (emp-005) as today's active celebrants
    if (matched.length === 0) {
      const fallbacks = employees.filter(e => e.id === 'emp-008' || e.id === 'emp-005');
      if (fallbacks.length > 0) {
        matched = fallbacks;
      }
    }
    return matched;
  }, [employees, simulatedCelebrant]);

  // Trigger celebration popup automatically upon session start
  useEffect(() => {
    if (!isAuthenticated) return;

    const hasCompanyBirthdays = todayBirthdays.length > 0;
    const isUserBirthday = isBirthdayToday(currentUser.dob);
    const shouldShow = hasCompanyBirthdays || isUserBirthday;

    if (shouldShow) {
      const sessionKey = `stocketics_bday_seen_${currentUser.id}_${new Date().toISOString().slice(0, 10)}`;
      const alreadySeen = sessionStorage.getItem(sessionKey);
      if (!alreadySeen) {
        setIsBirthdayCelebrationOpen(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [isAuthenticated, role, currentUser.id, currentUser.dob, todayBirthdays.length]);

  const openBirthdayCelebration = () => {
    setIsBirthdayCelebrationOpen(true);
  };

  const closeBirthdayCelebration = () => {
    setIsBirthdayCelebrationOpen(false);
  };

  const sendBirthdayWish = (recipientId: string, message: string) => {
    const recipient = employees.find(e => e.id === recipientId);
    const recipientName = recipient ? recipient.name : 'Colleague';
    
    // Add to notifications
    setNotifications(prev => [
      {
        id: `notif-bday-${Date.now()}`,
        title: `Birthday Greeting Delivered`,
        message: `Your wish "${message}" was delivered to ${recipientName}.`,
        time: 'Just now',
        read: false,
        type: 'system'
      },
      ...prev
    ]);

    showToast(`Birthday cheer sent to ${recipientName}! 🎈`, 'success');
  };

  const simulateBirthdayCelebration = (targetEmployeeName?: string) => {
    if (targetEmployeeName) {
      const emp = employees.find(e => e.name.toLowerCase().includes(targetEmployeeName.toLowerCase()));
      if (emp) {
        setSimulatedCelebrant(emp);
      }
    }
    setIsBirthdayCelebrationOpen(true);
  };

  // -------------------------------------------------------------
  // ROLE-BASED ACCESS CONTROL PERMISSIONS
  // -------------------------------------------------------------
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => {
    let base = DEFAULT_ROLE_PERMISSIONS;
    const saved = localStorage.getItem('stocketics_role_permissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        base = {
          ...DEFAULT_ROLE_PERMISSIONS,
          ...parsed,
        };
      } catch (_) {}
    }
    return {
      hr: { ...base.hr, market_dashboard_view: true, market_workspace_view: true },
      manager: { ...base.manager, market_dashboard_view: true, market_workspace_view: true },
      team_leader: { ...base.team_leader, market_dashboard_view: true, market_workspace_view: true },
      employee: {
        ...base.employee,
        market_dashboard_view: base.employee?.market_dashboard_view ?? true,
        market_workspace_view: base.employee?.market_workspace_view ?? true
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('stocketics_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  const hasPermission = useCallback((permissionKey: string): boolean => {
    // Managers, Team Leaders, and HR always have market access
    if (permissionKey === 'market_dashboard_view' || permissionKey === 'market_workspace_view') {
      if (role === 'manager' || role === 'team_leader' || role === 'hr') return true;
      return !!rolePermissions.employee?.[permissionKey];
    }
    const rolePerms = rolePermissions[role];
    if (!rolePerms) return false;
    return !!rolePerms[permissionKey];
  }, [rolePermissions, role]);

  const toggleRolePermission = useCallback((targetRole: UserRole, permissionKey: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [targetRole]: {
        ...prev[targetRole],
        [permissionKey]: !prev[targetRole]?.[permissionKey]
      }
    }));
  }, []);

  // -------------------------------------------------------------
  // KITE ZERODHA API CONNECTION CONFIGURATION
  // -------------------------------------------------------------
  const DEFAULT_KITE_API_KEY = 'gfhzjzfyy35ol599';

  const [kiteConfig, setKiteConfig] = useState<KiteConfig>(() => {
    const saved = localStorage.getItem('stocketics_kite_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.apiKey || parsed.apiKey === 'your_kite_api_key') {
          parsed.apiKey = DEFAULT_KITE_API_KEY;
        }
        return parsed;
      } catch (_) {}
    }
    return {
      apiKey: (import.meta as any).env?.VITE_KITE_API_KEY || DEFAULT_KITE_API_KEY,
      accessToken: (import.meta as any).env?.VITE_KITE_ACCESS_TOKEN || '',
      isConnected: false,
      autoConnect: true
    };
  });

  const updateKiteConfig = useCallback((updates: Partial<KiteConfig>) => {
    setKiteConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('stocketics_kite_config', JSON.stringify(next));
      return next;
    });
  }, []);

  // -------------------------------------------------------------
  // MARKET INFORMATION WIDGET CONFIGURATION
  // -------------------------------------------------------------
  const [marketWidgetConfig, setMarketWidgetConfig] = useState<MarketWidgetConfig>(() => {
    const saved = localStorage.getItem('stocketics_market_widget_config');
    const allDefaultKeys = MARKET_INSTRUMENTS.map(i => i.key);
    if (saved) {
      try {
        const parsed: MarketWidgetConfig = JSON.parse(saved);
        // Ensure all default instruments and options are included in selectedInstruments
        const mergedKeys = Array.from(new Set([...(parsed.selectedInstruments || []), ...allDefaultKeys]));
        return {
          ...DEFAULT_MARKET_WIDGET_CONFIG,
          ...parsed,
          selectedInstruments: mergedKeys
        };
      } catch (_) {}
    }
    return DEFAULT_MARKET_WIDGET_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_market_widget_config', JSON.stringify(marketWidgetConfig));
  }, [marketWidgetConfig]);

  const updateMarketWidgetConfig = useCallback((updates: Partial<MarketWidgetConfig>) => {
    setMarketWidgetConfig(prev => ({ ...prev, ...updates }));
    showToast('Market widget settings updated', 'info');
  }, []);

  // -------------------------------------------------------------
  // DYNAMIC MARKET INSTRUMENTS (MANAGER TREND WATCHLIST)
  // -------------------------------------------------------------
  const [customInstruments, setCustomInstruments] = useState<MarketInstrumentConfig[]>(() => {
    const saved = localStorage.getItem('stocketics_custom_instruments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any newly introduced default options that are missing from saved list
          const existingKeys = new Set(parsed.map((item: MarketInstrumentConfig) => item.key.toLowerCase()));
          const missingDefaults = MARKET_INSTRUMENTS.filter(def => !existingKeys.has(def.key.toLowerCase()));
          return [...parsed, ...missingDefaults];
        }
      } catch (_) {}
    }
    return MARKET_INSTRUMENTS;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_custom_instruments', JSON.stringify(customInstruments));
  }, [customInstruments]);

  const addMarketInstrument = useCallback((inst: MarketInstrumentConfig) => {
    setCustomInstruments(prev => {
      const exists = prev.some(item => item.key.toLowerCase() === inst.key.toLowerCase());
      if (exists) {
        showToast(`${inst.label} is already in the market ticker.`, 'warning');
        return prev;
      }
      showToast(`Added ${inst.label} to live ticker!`, 'success');
      return [inst, ...prev];
    });

    setMarketWidgetConfig(prev => ({
      ...prev,
      selectedInstruments: prev.selectedInstruments.includes(inst.key)
        ? prev.selectedInstruments
        : [inst.key, ...prev.selectedInstruments]
    }));
  }, [showToast]);

  const removeMarketInstrument = useCallback((key: string) => {
    setCustomInstruments(prev => prev.filter(item => item.key !== key));
    setMarketWidgetConfig(prev => ({
      ...prev,
      selectedInstruments: prev.selectedInstruments.filter(k => k !== key)
    }));
    showToast('Removed instrument from ticker.', 'info');
  }, [showToast]);

  const toggleInstrumentVisibility = useCallback((key: string) => {
    setCustomInstruments(prev => prev.map(item => item.key === key ? { ...item, enabled: !item.enabled } : item));
    setMarketWidgetConfig(prev => {
      const isSelected = prev.selectedInstruments.includes(key);
      return {
        ...prev,
        selectedInstruments: isSelected
          ? prev.selectedInstruments.filter(k => k !== key)
          : [...prev.selectedInstruments, key]
      };
    });
  }, []);

  const bookClientPositionAndPayment = useCallback((data: {
    clientName: string;
    mobile: string;
    scriptName: string;
    entryPrice: number;
    exitPrice: number;
    lots: number;
    lotSize: number;
    totalProfit: number;
    advisoryAmount: number;
    bank: string;
    screenshotUrl?: string;
    notes?: string;
  }) => {
    const newPaymentId = `CP-${Date.now().toString().slice(-6)}`;
    const newPayment: ConfirmedPaymentRecord = {
      id: newPaymentId,
      ownerName: currentUser.name,
      clientName: data.clientName,
      mobile: data.mobile,
      bank: data.bank || 'HDFC Bank - 0021',
      amount: data.advisoryAmount,
      status: 'Approved',
      reason: 'Profit Share Booking',
      description: `Booked profit on ${data.scriptName} (${data.lots} Lots, Entry: ₹${data.entryPrice}, Exit: ₹${data.exitPrice}, Client Profit: ₹${data.totalProfit.toLocaleString('en-IN')}). Advisory profit-share fee credited.`,
      clientStatus: 'ACTIVE ADV',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      screenshotUrl: data.screenshotUrl,
      profitAmount: data.totalProfit,
      scriptName: data.scriptName,
      entryPrice: data.entryPrice,
      exitPrice: data.exitPrice,
      lots: data.lots
    };

    // Save to localStorage apex_crm_confirmed_payments
    try {
      const existing = localStorage.getItem('apex_crm_confirmed_payments');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newPayment);
      localStorage.setItem('apex_crm_confirmed_payments', JSON.stringify(list));
    } catch (_) {}

    // Add in-app notification
    setNotifications(prev => [
      {
        id: `notif-pmt-${Date.now()}`,
        title: `Client Profit Booked: ${data.clientName}`,
        message: `${data.scriptName} position closed with ₹${data.totalProfit.toLocaleString('en-IN')} profit! Received advisory fee ₹${data.advisoryAmount.toLocaleString('en-IN')}.`,
        time: 'Just now',
        read: false,
        type: 'system'
      },
      ...prev
    ]);

    confetti({ particleCount: 80, spread: 85, origin: { y: 0.6 } });
    showToast(`🎉 Profit booked for ${data.clientName}! Payment recorded in Confirmed Payments.`, 'success');
  }, [currentUser.name, showToast]);

  // Global client search state for sidebar-to-results synchronization
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');

  // -------------------------------------------------------------
  // POCKETBASE LIVE DATABASE SYNCHRONIZATION & REALTIME WEBSOCKETS
  // -------------------------------------------------------------
  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    const initPocketBase = async () => {
      try {
        const isOnline = await checkPocketBaseHealth();
        if (!isOnline) {
          console.log('[PocketBase] Local engine offline. Running in zero-disruption local mode.');
          return;
        }

        console.log('[PocketBase] Connected to live engine on port 8090. Syncing state...');

        // 1. Initial Data Fetch
        const [pbEmps, pbLeaves, pbAtt, pbLeads, pbKyc, pbCalls] = await Promise.allSettled([
          api.getEmployees(),
          api.getLeaves(),
          api.getAttendance(),
          api.getLeads(),
          api.getKYCRecords(),
          api.getCallLogs()
        ]);

        if (pbEmps.status === 'fulfilled' && pbEmps.value.length > 0) {
          setEmployees(pbEmps.value);
        }
        if (pbLeaves.status === 'fulfilled' && pbLeaves.value.length > 0) {
          setLeaveRequests(pbLeaves.value);
        }
        if (pbAtt.status === 'fulfilled' && pbAtt.value.length > 0) {
          setAttendanceRecords(pbAtt.value);
        }
        if (pbLeads.status === 'fulfilled' && pbLeads.value.length > 0) {
          setAdvisoryLeads(pbLeads.value);
        }
        if (pbKyc.status === 'fulfilled' && pbKyc.value.length > 0) {
          setKycRecords(pbKyc.value);
        }
        if (pbCalls.status === 'fulfilled' && pbCalls.value.length > 0) {
          setCallLogs(pbCalls.value);
        }

        // 2. Real-Time WebSockets Subscriptions across all open tabs/roles
        try {
          const unsubLeaves = await pb.collection('leaves').subscribe('*', e => {
            if (e.action === 'create') {
              setLeaveRequests(prev => [e.record as unknown as LeaveRequest, ...prev.filter(l => l.id !== e.record.id)]);
            } else if (e.action === 'update') {
              setLeaveRequests(prev => prev.map(l => l.id === e.record.id ? (e.record as unknown as LeaveRequest) : l));
            } else if (e.action === 'delete') {
              setLeaveRequests(prev => prev.filter(l => l.id !== e.record.id));
            }
          });
          unsubscribes.push(unsubLeaves);

          const unsubLeads = await pb.collection('leads').subscribe('*', e => {
            if (e.action === 'create') {
              setAdvisoryLeads(prev => [e.record as unknown as AdvisoryLead, ...prev.filter(l => l.id !== e.record.id)]);
            } else if (e.action === 'update') {
              setAdvisoryLeads(prev => prev.map(l => l.id === e.record.id ? (e.record as unknown as AdvisoryLead) : l));
            } else if (e.action === 'delete') {
              setAdvisoryLeads(prev => prev.filter(l => l.id !== e.record.id));
            }
          });
          unsubscribes.push(unsubLeads);

          const unsubAtt = await pb.collection('attendance').subscribe('*', e => {
            if (e.action === 'create') {
              setAttendanceRecords(prev => [e.record as unknown as AttendanceRecord, ...prev.filter(a => a.id !== e.record.id)]);
            } else if (e.action === 'update') {
              setAttendanceRecords(prev => prev.map(a => a.id === e.record.id ? (e.record as unknown as AttendanceRecord) : a));
            }
          });
          unsubscribes.push(unsubAtt);
        } catch (subErr) {
          console.warn('[PocketBase] Real-time subscription notice:', subErr);
        }
      } catch (err) {
        console.warn('[PocketBase] Engine check failed, keeping local fallback:', err);
      }
    };

    initPocketBase();

    return () => {
      unsubscribes.forEach(u => {
        try { u(); } catch (_) {}
      });
    };
  }, []);

  const addCallLog = (log: Omit<CallLogRecord, 'id'>) => {
    const newLog: CallLogRecord = {
      ...log,
      id: 'cl-' + Date.now().toString(36),
    };
    setCallLogs(prev => [newLog, ...prev]);
    confetti({ particleCount: 40, spread: 50 });
    showToast('Call logged successfully!', 'success');
  };

  const updateCallLogScore = (id: string, score: number, managerNote?: string) => {
    setCallLogs(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          managerScore: score,
          ...(managerNote !== undefined ? { managerNote } : {})
        };
      }
      return c;
    }));
    showToast('Call quality score & coaching notes saved!', 'success');
  };

  // Live Punch Clock State
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [clockInTime, setClockInTime] = useState<string | null>('09:15 AM');
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [breakType, setBreakType] = useState<string | null>(null);
  const [elapsedWorkSeconds, setElapsedWorkSeconds] = useState<number>(19840); // 5h 30m

  useEffect(() => {
    let interval: any = null;
    if (isClockedIn && !isOnBreak) {
      interval = setInterval(() => {
        setElapsedWorkSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, isOnBreak]);

  // (Toasts state and showToast moved to top of AppProvider to prevent TDZ issues)

  // Actions
  const handlePunchToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setIsOnBreak(false);
      showToast('Successfully Clocked Out. Have a great evening!', 'info');
    } else {
      setIsClockedIn(true);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockInTime(timeStr);
      showToast(`Clocked in at ${timeStr}. Status: Active`, 'success');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleBreakToggle = (selectedBreak: string) => {
    if (isOnBreak && breakType === selectedBreak) {
      setIsOnBreak(false);
      setBreakType(null);
      showToast(`Resumed shift from ${selectedBreak}`, 'success');
    } else {
      setIsOnBreak(true);
      setBreakType(selectedBreak);
      showToast(`Started break: ${selectedBreak}. Timer paused.`, 'warning');
    }
  };

  const addEmployee = (data: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...data,
      id: `emp-${String(employees.length + 1).padStart(3, '0')}`,
    };
    setEmployees(prev => [newEmp, ...prev]);
    api.createEmployee(newEmp).catch(() => {});
    showToast(`Added ${newEmp.name} to the Employee Directory!`, 'success');
    confetti({ particleCount: 60, spread: 70 });
  };

  const submitLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedAt' | 'avatar' | 'employeeName' | 'department'>) => {
    const newLeave: LeaveRequest = {
      ...data,
      id: `leave-${Date.now().toString().slice(-4)}`,
      employeeName: currentUser.name,
      department: currentUser.department,
      avatar: currentUser.avatar,
      status: 'Pending',
      appliedAt: 'Just now',
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
    api.createLeave(newLeave).catch(() => {});
    
    // Notify Manager
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Leave Request Received',
        message: `${currentUser.name} applied for ${data.type} (${data.daysCount} days)`,
        time: 'Just now',
        type: 'approval',
        read: false,
        targetRole: 'manager',
      },
      ...prev
    ]);

    showToast(`Leave request submitted for ${data.daysCount} day(s). Awaiting Manager approval.`, 'success');
  };

  // -------------------------------------------------------------
  // 1. KYC VERIFICATION & DOCUMENT UPLOAD WORKFLOW
  // -------------------------------------------------------------
  const [kycDocuments, setKycDocuments] = useState<KYCDocumentItem[]>(() => {
    const saved = localStorage.getItem('stocketics_kyc_documents');
    if (!saved) return INITIAL_KYC_DOCUMENTS;
    try {
      const parsed: KYCDocumentItem[] = JSON.parse(saved);
      return parsed.map(item => {
        const initialMatch = INITIAL_KYC_DOCUMENTS.find(init => init.id === item.id);
        return {
          ...item,
          clientMobile: item.clientMobile || initialMatch?.clientMobile || '9876543210',
          documentNumber: item.documentNumber || initialMatch?.documentNumber || (item.documentType === 'PAN Card' ? 'AAAPL1234K' : item.documentType === 'Aadhaar Card' ? 'XXXX-XXXX-8821' : 'DOC-ID-4821')
        };
      });
    } catch {
      return INITIAL_KYC_DOCUMENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('stocketics_kyc_documents', JSON.stringify(kycDocuments));
  }, [kycDocuments]);

  const uploadKYCDocument = useCallback((doc: Omit<KYCDocumentItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newDoc: KYCDocumentItem = {
      ...doc,
      id: `kyd-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setKycDocuments(prev => [newDoc, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-kyc-${Date.now()}`,
        title: `KYC Document Uploaded: ${doc.clientName}`,
        message: `${currentUser.name} uploaded ${doc.documentType} for ${doc.clientName}. Ready for verification.`,
        time: 'Just now',
        type: 'approval',
        read: false,
        targetRole: 'manager',
        actionTab: 'kyc-management'
      },
      ...prev
    ]);

    showToast(`Uploaded ${doc.documentType} for ${doc.clientName}! Sent to Manager review queue.`, 'success');
  }, [currentUser.name, showToast]);

  const reviewKYCDocument = useCallback((docId: string, status: KYCDocumentStatus, remarks?: string) => {
    let clientName = '';
    let docType = '';
    setKycDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        clientName = d.clientName;
        docType = d.documentType;
        return {
          ...d,
          status,
          remarks: remarks || (status === 'Verified' ? 'Document verified and approved.' : 'Rejected. Please re-upload.'),
          reviewedBy: `${currentUser.name} (${role.toUpperCase()})`,
          reviewedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    if (status === 'Verified') {
      confetti({ particleCount: 40, spread: 50 });
      showToast(`Verified ${docType} for ${clientName}!`, 'success');
    } else {
      showToast(`Document marked as ${status} with remarks.`, 'warning');
    }
  }, [currentUser.name, role, showToast]);

  // -------------------------------------------------------------
  // 2. REAL-TIME NOTIFICATION ON LEAD ACCESS BY OTHER EMPLOYEES
  // -------------------------------------------------------------
  const logLeadAccess = useCallback((
    leadId: string, 
    action: string, 
    leadName: string, 
    leadStatus: string, 
    assignedOwnerId: string, 
    assignedOwnerName: string
  ) => {
    const isDifferentUser = assignedOwnerId && assignedOwnerId !== currentUser.id && assignedOwnerName.toLowerCase() !== currentUser.name.toLowerCase();
    
    if (isDifferentUser) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setNotifications(prev => [
        {
          id: `notif-access-${Date.now()}`,
          title: `Lead Activity Alert: ${leadName}`,
          message: `Your assigned lead "${leadName}" was ${action} by ${currentUser.name} (${currentUser.role.toUpperCase()}) at ${nowTime}.`,
          time: 'Just now',
          type: 'lead_access',
          read: false,
          targetUserId: assignedOwnerId,
          leadId,
          leadName,
          actionPerformed: action,
          performedBy: currentUser.name,
          performedById: currentUser.id,
          leadStatus,
          actionTab: 'leads'
        },
        ...prev
      ]);

      triggerClientSearchAlert({
        clientId: leadId,
        clientName: leadName,
        targetType: 'lead',
        ownerId: assignedOwnerId,
        ownerName: assignedOwnerName,
        searchedById: currentUser.id,
        searchedByName: currentUser.name,
        searchedByRole: currentUser.role,
        searchQuery: leadName,
        searchLocation: 'Leads Pipeline / Access Activity'
      });
    }
  }, [currentUser.id, currentUser.name, currentUser.role, triggerClientSearchAlert]);

  // -------------------------------------------------------------
  // 3. SCHEDULED CALL REMINDERS WITH TIMED POPUP
  // -------------------------------------------------------------
  const [callReminders, setCallReminders] = useState<CallReminder[]>(() => {
    const saved = localStorage.getItem('stocketics_call_reminders');
    return saved ? JSON.parse(saved) : INITIAL_CALL_REMINDERS;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_call_reminders', JSON.stringify(callReminders));
  }, [callReminders]);

  const scheduleCallReminder = useCallback((reminder: Omit<CallReminder, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newRem: CallReminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCallReminders(prev => [newRem, ...prev]);
    showToast(`Call reminder scheduled for ${reminder.clientName} at ${new Date(reminder.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`, 'success');
  }, [showToast]);

  const resolveCallReminder = useCallback((
    id: string, 
    action: CallReminderStatus, 
    rescheduleTime?: string, 
    notes?: string
  ) => {
    setCallReminders(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: action,
          snoozedUntil: action === 'Snoozed' ? rescheduleTime : undefined,
          scheduledTime: action === 'Rescheduled' && rescheduleTime ? rescheduleTime : r.scheduledTime,
          notes: notes ? `${r.notes}\n[Update]: ${notes}` : r.notes,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));

    if (action === 'Completed') {
      showToast('Client call marked as completed and logged!', 'success');
    } else if (action === 'Snoozed') {
      showToast('Reminder snoozed.', 'info');
    } else if (action === 'Rescheduled') {
      showToast('Follow-up call rescheduled successfully.', 'success');
    } else if (action === 'Not Reachable') {
      showToast('Call logged as Not Reachable. Next follow-up suggested.', 'warning');
    }
  }, [showToast]);

  // -------------------------------------------------------------
  // 4. MANAGER GREETINGS & ANNOUNCEMENTS POPUPS
  // -------------------------------------------------------------
  const [announcements, setAnnouncements] = useState<CompanyAnnouncement[]>(() => {
    const saved = localStorage.getItem('stocketics_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const createAnnouncement = useCallback((data: Omit<CompanyAnnouncement, 'id' | 'createdAt' | 'readByEmployeeIds'>) => {
    const newAnn: CompanyAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readByEmployeeIds: []
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    confetti({ particleCount: 70, spread: 80 });
    showToast(`Company announcement "${data.title}" published!`, 'success');
  }, [showToast]);

  const updateAnnouncement = useCallback((id: string, updates: Partial<CompanyAnnouncement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    showToast('Announcement updated.', 'info');
  }, [showToast]);

  const deactivateAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: false } : a));
    showToast('Announcement deactivated.', 'info');
  }, [showToast]);

  const markAnnouncementRead = useCallback((id: string, employeeId: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id && !a.readByEmployeeIds.includes(employeeId)) {
        return { ...a, readByEmployeeIds: [...a.readByEmployeeIds, employeeId] };
      }
      return a;
    }));
  }, []);

  // -------------------------------------------------------------
  // 5. EMPLOYEE SALES CASHBACK & INCENTIVE WORKFLOW
  // -------------------------------------------------------------
  const [cashbackRules, setCashbackRules] = useState<CashbackRule[]>(() => {
    const saved = localStorage.getItem('stocketics_cashback_rules');
    return saved ? JSON.parse(saved) : INITIAL_CASHBACK_RULES;
  });

  const [cashbackRecords, setCashbackRecords] = useState<EmployeeCashbackRecord[]>(() => {
    const saved = localStorage.getItem('stocketics_cashback_records');
    return saved ? JSON.parse(saved) : INITIAL_CASHBACK_RECORDS;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_cashback_rules', JSON.stringify(cashbackRules));
  }, [cashbackRules]);

  useEffect(() => {
    localStorage.setItem('stocketics_cashback_records', JSON.stringify(cashbackRecords));
  }, [cashbackRecords]);

  const approveCashback = useCallback((id: string) => {
    setCashbackRecords(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Approved',
          approvedBy: currentUser.name,
          approvedAt: new Date().toLocaleDateString('en-GB')
        };
      }
      return c;
    }));
    confetti({ particleCount: 50, spread: 60 });
    showToast('Cashback incentive approved for employee payout!', 'success');
  }, [currentUser.name, showToast]);

  const markCashbackPaid = useCallback((id: string) => {
    setCashbackRecords(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Paid',
          paidAt: new Date().toLocaleDateString('en-GB')
        };
      }
      return c;
    }));
    showToast('Cashback marked as Paid & disbursed.', 'success');
  }, [showToast]);

  const updateCashbackRule = useCallback((rule: CashbackRule) => {
    setCashbackRules(prev => {
      const idx = prev.findIndex(r => r.id === rule.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = rule;
        return next;
      }
      return [rule, ...prev];
    });
    showToast('Cashback sales limit rule updated.', 'success');
  }, [showToast]);

  // -------------------------------------------------------------
  // 6. BIOMETRIC ATTENDANCE WITH MANUAL & IMPORT FALLBACK
  // -------------------------------------------------------------
  const [extendedAttendance, setExtendedAttendance] = useState<ExtendedAttendanceRecord[]>(() => {
    const saved = localStorage.getItem('stocketics_extended_attendance');
    return saved ? JSON.parse(saved) : INITIAL_EXTENDED_ATTENDANCE;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_extended_attendance', JSON.stringify(extendedAttendance));
  }, [extendedAttendance]);

  const syncBiometricAttendance = useCallback(() => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    
    setExtendedAttendance(prev => {
      return prev.map(a => {
        if (a.date === todayStr && a.source === 'Biometric') {
          return {
            ...a,
            punchOut: nowTime,
            totalHours: +(a.totalHours + 0.5).toFixed(1)
          };
        }
        return a;
      });
    });

    confetti({ particleCount: 40, spread: 55 });
    showToast(`Successfully synced biometric punch logs from Optical Bio-01 and Bio-02.`, 'success');
  }, [showToast]);

  const importAttendanceRecords = useCallback((newRecords: ExtendedAttendanceRecord[]) => {
    setExtendedAttendance(prev => [...newRecords, ...prev]);
    showToast(`Imported ${newRecords.length} attendance punch logs successfully.`, 'success');
  }, [showToast]);

  // -------------------------------------------------------------
  // 7. LEAVE BALANCES & REFLECTION IN ATTENDANCE
  // -------------------------------------------------------------
  const [leaveBalances] = useState<Record<string, LeaveBalance>>(() => {
    const saved = localStorage.getItem('stocketics_leave_balances');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_BALANCES;
  });

  // -------------------------------------------------------------
  // 8. TRADING DISPLAY CONFIG (TICKER VS BOX LAYOUT)
  // -------------------------------------------------------------
  const [tradingDisplayConfig, setTradingDisplayConfig] = useState<TradingDisplayConfig>(() => {
    const saved = localStorage.getItem('stocketics_trading_display_config');
    return saved ? JSON.parse(saved) : INITIAL_TRADING_DISPLAY_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_trading_display_config', JSON.stringify(tradingDisplayConfig));
  }, [tradingDisplayConfig]);

  const updateTradingDisplayConfig = useCallback((updates: Partial<TradingDisplayConfig>) => {
    setTradingDisplayConfig(prev => ({ ...prev, ...updates }));
    showToast(`Trading display updated to ${updates.mode || tradingDisplayConfig.mode}.`, 'info');
  }, [tradingDisplayConfig.mode, showToast]);

  // -------------------------------------------------------------
  // 9. SUBSCRIPTION EXPIRY SMS WORKFLOW
  // -------------------------------------------------------------
  const [expirySMSConfigs, setExpirySMSConfigs] = useState<SubscriptionExpirySMSConfig[]>(() => {
    const saved = localStorage.getItem('stocketics_expiry_sms_configs');
    return saved ? JSON.parse(saved) : INITIAL_EXPIRY_SMS_CONFIGS;
  });

  const [expirySMSLogs, setExpirySMSLogs] = useState<ExpirySMSLog[]>(() => {
    const saved = localStorage.getItem('stocketics_expiry_sms_logs');
    return saved ? JSON.parse(saved) : INITIAL_EXPIRY_SMS_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_expiry_sms_configs', JSON.stringify(expirySMSConfigs));
  }, [expirySMSConfigs]);

  useEffect(() => {
    localStorage.setItem('stocketics_expiry_sms_logs', JSON.stringify(expirySMSLogs));
  }, [expirySMSLogs]);

  const sendExpirySMS = useCallback((clientId: string, templateText?: string) => {
    const client = detailedClients.find(c => c.id === clientId);
    if (!client) return;

    const message = templateText || `Dear ${client.clientName}, your Stocketics Advisory package for ${client.serviceName} expires on ${client.endDate}. Please renew promptly to continue receiving real-time signals.`;
    
    const newLog: ExpirySMSLog = {
      id: `esl-${Date.now()}`,
      clientId,
      clientName: client.clientName,
      phone: client.mobile,
      serviceName: client.serviceName,
      expiryDate: client.endDate,
      expiryTime: '17:00',
      message,
      status: 'Sent',
      sentAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggeredBy: currentUser.role
    };

    setExpirySMSLogs(prev => [newLog, ...prev]);
    confetti({ particleCount: 35, spread: 50 });
    showToast(`Expiry reminder SMS sent to ${client.clientName} (${client.mobile}).`, 'success');
  }, [detailedClients, currentUser.role, showToast]);

  const updateExpirySMSConfig = useCallback((id: string, updates: Partial<SubscriptionExpirySMSConfig>) => {
    setExpirySMSConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showToast('Subscription expiry SMS trigger saved.', 'success');
  }, [showToast]);

  // -------------------------------------------------------------
  // 10. RESEARCH ANALYST (RA) ADVISORY CALLS
  // -------------------------------------------------------------
  const [raCalls, setRaCalls] = useState<RACallRecord[]>(() => {
    const saved = localStorage.getItem('stocketics_ra_calls');
    return saved ? JSON.parse(saved) : INITIAL_RA_CALLS;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_ra_calls', JSON.stringify(raCalls));
  }, [raCalls]);

  const createRACall = useCallback((callData: Omit<RACallRecord, 'id' | 'openTime' | 'status'>) => {
    const newCall: RACallRecord = {
      ...callData,
      id: `ra-${Date.now()}`,
      status: 'ACTIVE',
      openTime: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRaCalls(prev => [newCall, ...prev]);
    confetti({ particleCount: 60, spread: 70 });
    showToast(`RA Call published: ${newCall.title} (${newCall.segment})! Visible on all dashboards.`, 'success');
  }, [showToast]);

  const updateRACallStatus = useCallback((id: string, status: RACallRecord['status']) => {
    setRaCalls(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          closeTime: status !== 'ACTIVE' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return c;
    }));
    showToast(`RA Call updated to ${status}.`, 'info');
  }, [showToast]);

  // -------------------------------------------------------------
  // 11. COMPANY BANK DETAILS & BANK SMS DISPATCH
  // -------------------------------------------------------------
  const [companyBankDetails, setCompanyBankDetails] = useState<CompanyBankDetails>(() => {
    const saved = localStorage.getItem('stocketics_bank_details');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_BANK_DETAILS;
  });

  useEffect(() => {
    localStorage.setItem('stocketics_bank_details', JSON.stringify(companyBankDetails));
  }, [companyBankDetails]);

  const updateCompanyBankDetails = useCallback((details: Partial<CompanyBankDetails>) => {
    setCompanyBankDetails(prev => ({ ...prev, ...details }));
    showToast('Company bank details updated by Administrator.', 'success');
  }, [showToast]);

  const sendBankDetailsSMS = useCallback((clientId: string, clientMobile: string, clientName: string) => {
    showToast(`Official Bank details SMS dispatched to ${clientName} (${clientMobile})!`, 'success');
    confetti({ particleCount: 45, spread: 60 });
  }, [showToast]);

  // -------------------------------------------------------------
  // 12. FREE TRIAL 2-DAY LIMIT & RETRIAL WORKFLOW
  // -------------------------------------------------------------
  const activateClientRetrial = useCallback((clientId: string) => {
    setDetailedClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          trialStatus: 'Retrial Active',
          retrialDate: new Date().toLocaleDateString('en-GB')
        };
      }
      return c;
    }));
    showToast('1-Day Retrial activated for client! RA call access extended by 24 hours.', 'success');
    confetti({ particleCount: 40, spread: 50 });
  }, [showToast]);

  const markClientConverted = useCallback((clientId: string) => {
    setDetailedClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          trialStatus: 'Converted',
          response: 'CONVERTED PAID CLIENT',
          tabCategory: 'clients'
        };
      }
      return c;
    }));
    confetti({ particleCount: 80, spread: 80 });
    showToast('Client successfully marked as Converted! Full advisory access unlocked.', 'success');
  }, [showToast]);

  // ─── 13. KYC Case Lifecycle ────────────────────────────────────────
  const [kycCases, setKycCases] = useState<KYCCase[]>(() => {
    const saved = localStorage.getItem('stocketics_kyc_cases');
    if (saved) { try { return JSON.parse(saved); } catch (_) {} }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('stocketics_kyc_cases', JSON.stringify(kycCases));
  }, [kycCases]);

  const getKYCCaseForLead = useCallback((leadId: string): KYCCase | undefined => {
    return kycCases.find(c => c.leadId === leadId && c.status !== 'Withdrawn');
  }, [kycCases]);

  const nowStamp = () => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const createKYCCase = useCallback((leadId: string, requiredDocs: KYCDocumentType[], channel?: string): KYCCase | null => {
    requiredDocs = [...new Set<KYCDocumentType>(['PAN Card', 'Aadhaar Card', ...requiredDocs])];
    // Idempotent: reuse existing open case
    const existing = kycCases.find(c => c.leadId === leadId && !['Withdrawn', 'Rejected'].includes(c.status));
    if (existing) {
      showToast(`KYC case already exists for this lead (${existing.status}). Opening existing case.`, 'info');
      return existing;
    }

    const lead = advisoryLeads.find(l => l.id === leadId);
    if (!lead) { showToast('Lead not found.', 'error'); return null; }

    const ts = nowStamp();
    const newCase: KYCCase = {
      id: `kyc-case-${Date.now().toString(36)}`,
      leadId,
      leadName: lead.clientName,
      leadPhone: lead.phone,
      leadEmail: lead.email,
      assignedAdvisorId: lead.assignedToId,
      assignedAdvisorName: lead.assignedToName,
      teamId: lead.teamId,
      teamLeaderId: lead.teamLeaderId,
      status: channel ? 'Documents Requested' : 'Not Started',
      requiredDocuments: requiredDocs,
      documents: requiredDocs.map(dt => ({ type: dt, status: 'Requested' as const, version: 1 })),
      requestChannel: channel,
      requestedAt: channel ? ts : undefined,
      policyNote: requiredDocs.length > 1
        ? 'Compliance policy requires both PAN Card and Aadhaar Card for full onboarding.'
        : 'Single identity document accepted under current policy.',
      auditTrail: [{
        id: `audit-${Date.now().toString(36)}`,
        timestamp: ts,
        action: 'Case Created',
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: role,
        detail: `KYC case created for ${lead.clientName}. Required: ${requiredDocs.join(', ')}.${channel ? ` Request sent via ${channel}.` : ''}`
      }],
      createdAt: ts,
      updatedAt: ts
    };

    setKycCases(prev => [newCase, ...prev]);
    confetti({ particleCount: 40, spread: 50 });
    showToast(`KYC case started for ${lead.clientName}! Documents: ${requiredDocs.join(' & ')}`, 'success');
    return newCase;
  }, [kycCases, advisoryLeads, currentUser, role, showToast]);

  const addKYCCaseDocument = useCallback((caseId: string, docType: KYCDocumentType, docId: string, maskedNumber?: string, fileName?: string) => {
    const ts = nowStamp();
    setKycCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedDocs = c.documents.map(d => {
          if (d.type === docType) {
            return { ...d, status: 'Uploaded' as const, documentId: docId, maskedNumber, fileName, uploadedAt: ts, version: d.version + (d.documentId ? 1 : 0) };
          }
          return d;
        });
        const allUploaded = updatedDocs.every(d => d.status === 'Uploaded' || d.status === 'Verified');
        return {
          ...c,
          documents: updatedDocs,
          status: allUploaded ? 'Draft' as const : 'Awaiting Documents' as const,
          updatedAt: ts,
          auditTrail: [...c.auditTrail, {
            id: `audit-${Date.now().toString(36)}`,
            timestamp: ts,
            action: 'Document Uploaded',
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: role,
            detail: `${docType} uploaded${maskedNumber ? ` (${maskedNumber})` : ''}. File: ${fileName || 'N/A'}`
          }]
        };
      }
      return c;
    }));
  }, [currentUser, role]);

  const submitKYCCase = useCallback((caseId: string) => {
    const targetCase = kycCases.find(c => c.id === caseId);
    if (!targetCase || !legacyKYCComplete(targetCase.documents, ['Uploaded', 'Verified'])) { showToast('Upload both PAN and Aadhaar before submitting KYC.', 'error'); return; }
    if (!hasPermission('kyc.submit') || (role === 'employee' && targetCase.assignedAdvisorId !== currentUser.id) || (role === 'team_leader' && targetCase.teamLeaderId !== currentUser.id)) { showToast('You cannot submit this KYC case.', 'error'); return; }
    const ts = nowStamp();
    setKycCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const uploadedDocs = c.documents.filter(d => d.status === 'Uploaded' || d.status === 'Verified');
        if (uploadedDocs.length === 0) {
          showToast('Cannot submit: no documents uploaded yet.', 'error');
          return c;
        }
        const reviewer = c.teamLeaderId
          ? employees.find(e => e.id === c.teamLeaderId)
          : employees.find(e => e.role === 'manager' || e.role === 'Manager');
        return {
          ...c,
          status: 'Pending Approval' as const,
          submittedAt: ts,
          updatedAt: ts,
          documents: c.documents.map(d => d.status === 'Uploaded' ? { ...d, status: 'Pending Review' as const } : d),
          auditTrail: [...c.auditTrail, {
            id: `audit-${Date.now().toString(36)}`,
            timestamp: ts,
            action: 'Submitted for Approval',
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: role,
            detail: `Case submitted with ${uploadedDocs.length} document(s). Reviewer: ${reviewer?.name || 'Manager'}.`
          }]
        };
      }
      return c;
    }));
    confetti({ particleCount: 50, spread: 60 });
    showToast('KYC case submitted for approval! Reviewer has been notified.', 'success');

    // Notify reviewer
    setNotifications(prev => [{
      id: `notif-kyc-submit-${Date.now()}`,
      title: 'KYC Case Submitted for Review',
      message: `A KYC case has been submitted by ${currentUser.name}. Please review the documents.`,
      time: 'Just now',
      type: 'approval' as const,
      read: false,
      targetRole: 'manager' as const,
      actionTab: 'kyc-list'
    }, ...prev]);
  }, [kycCases, currentUser, role, employees, rolePermissions, showToast]);

  const reviewKYCCase = useCallback((caseId: string, decision: 'Approved' | 'Rejected' | 'Needs Reupload', reason?: string) => {
    const targetCase = kycCases.find(c => c.id === caseId);
    if (!targetCase || !hasPermission('kyc.review.all') || role !== 'manager') { showToast('Final KYC review requires an authorised Manager.', 'error'); return; }
    if (decision !== 'Approved' && !reason?.trim()) { showToast('Enter a reason for rejection or reupload.', 'error'); return; }
    if (decision === 'Approved' && !legacyKYCComplete(targetCase.documents, ['Pending Review', 'Verified'])) { showToast('Both PAN and Aadhaar must be submitted before verification.', 'error'); return; }
    const ts = nowStamp();
    const isDelegated = false;
    setKycCases(prev => prev.map(c => {
      if (c.id === caseId) {
        let newDocStatuses = c.documents;
        if (decision === 'Approved') {
          newDocStatuses = c.documents.map(d => d.status === 'Pending Review' ? { ...d, status: 'Verified' as const } : d);
        } else if (decision === 'Rejected') {
          newDocStatuses = c.documents.map(d => d.status === 'Pending Review' ? { ...d, status: 'Rejected' as const } : d);
        } else {
          newDocStatuses = c.documents.map(d => d.status === 'Pending Review' ? { ...d, status: 'Needs Reupload' as const } : d);
        }
        return {
          ...c,
          status: decision === 'Approved' ? 'Approved' as const : decision === 'Rejected' ? 'Rejected' as const : 'Needs Reupload' as const,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewDecision: decision,
          reviewReason: reason,
          reviewedAt: ts,
          isDelegatedReview: isDelegated,
          documents: newDocStatuses,
          updatedAt: ts,
          auditTrail: [...c.auditTrail, {
            id: `audit-${Date.now().toString(36)}`,
            timestamp: ts,
            action: `Review: ${decision}`,
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorRole: role,
            detail: `${decision} by ${currentUser.name}${isDelegated ? ' (Delegated Team Approval)' : ''}.${reason ? ` Reason: ${reason}` : ''}`,
            isDelegated
          }]
        };
      }
      return c;
    }));

    if (decision === 'Approved') {
      confetti({ particleCount: 70, spread: 80 });
      showToast('KYC case approved! Client onboarding can proceed.', 'success');
    } else if (decision === 'Rejected') {
      showToast(`KYC case rejected.${reason ? ` Reason: ${reason}` : ''}`, 'error');
    } else {
      showToast(`Documents require reupload.${reason ? ` Note: ${reason}` : ''}`, 'warning');
    }
  }, [kycCases, currentUser, role, rolePermissions, showToast]);

  // ─── 14. Lead Change Audit ─────────────────────────────────────────
  const [leadChangeLog, setLeadChangeLog] = useState<LeadChangeEntry[]>(() => {
    const saved = localStorage.getItem('stocketics_lead_changelog');
    if (saved) { try { return JSON.parse(saved); } catch (_) {} }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('stocketics_lead_changelog', JSON.stringify(leadChangeLog));
  }, [leadChangeLog]);

  const logLeadChange = useCallback((leadId: string, field: string, prevValue: string, newValue: string, reason?: string) => {
    const entry: LeadChangeEntry = {
      id: `lce-${Date.now().toString(36)}`,
      leadId,
      timestamp: nowStamp(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: role,
      field,
      previousValue: prevValue,
      newValue,
      reason
    };
    setLeadChangeLog(prev => [entry, ...prev].slice(0, 500));
  }, [currentUser, role]);

  // ─── 15. Role Permission Matrix Check ──────────────────────────────
  const hasMatrixPermission = useCallback((permKey: string): boolean => {
    const matrix = ROLE_PERMISSION_MATRIX[role];
    if (!matrix) return false;
    return (matrix as unknown as Record<string, boolean>)[permKey] === true;
  }, [role]);


  const updateLeaveStatus = (leaveId: string, status: 'Approved' | 'Declined', note?: string) => {
    const req = leaveRequests.find(l => l.id === leaveId);
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === leaveId) {
        return {
          ...l,
          status,
          approvedBy: currentUser.name,
          managerNote: note || (status === 'Approved' ? 'Approved by Manager' : 'Declined'),
        };
      }
      return l;
    }));

    api.updateLeave(leaveId, {
      status,
      approvedBy: currentUser.name,
      managerNote: note || (status === 'Approved' ? 'Approved by Manager' : 'Declined')
    }).catch(() => {});

    if (status === 'Approved') {
      if (req) {
        const leaveAttRecord: ExtendedAttendanceRecord = {
          id: `att-leave-${Date.now()}`,
          employeeId: req.employeeName ? `emp-${req.employeeName.toLowerCase().replace(/\s+/g, '')}` : 'emp-008',
          employeeName: req.employeeName,
          department: req.department || 'Operations',
          date: req.startDate,
          punchIn: '-',
          punchOut: '-',
          totalHours: 0,
          status: 'Leave',
          source: 'Manual',
          terminal: 'HR Leave Approval System',
          leaveType: (req.type === 'CL' || req.type === 'PL' || req.type === 'Sick') ? req.type : 'Other'
        };
        setExtendedAttendance(prev => [leaveAttRecord, ...prev]);
      }
      confetti({ particleCount: 70, spread: 60 });
      showToast(`Leave request #${leaveId} approved and recorded in attendance roster!`, 'success');
    } else {
      showToast(`Leave request #${leaveId} declined`, 'error');
    }
  };

  const updateLeadStatus = (leadId: string, status: AdvisoryLead['status']) => {
    const target = advisoryLeads.find(lead => lead.id === leadId);
    if (!target || !canEditLegacyLead(role, currentUser.id, target, getTeamMemberIds(currentUser.id))) { showToast('This lead is outside your ownership scope.', 'error'); return; }
    if (status === 'Converted' || target.status === 'Converted') { showToast('Use the connected CRM conversion workflow to preserve client history.', 'error'); return; }
    setAdvisoryLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status };
      }
      return lead;
    }));
    api.updateLead(leadId, { status }).catch(() => {});
    showToast(`Lead status updated to ${status}`, 'info');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const next = !t.completed;
        if (next) {
          confetti({ particleCount: 30, spread: 40 });
          showToast('Task marked as complete!', 'success');
        }
        return { ...t, completed: next };
      }
      return t;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Keyboard shortcut listener for Cmd/Ctrl + B (sidebar) and Cmd/Ctrl + K (search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── 16. Confirmed Payments & Client Conversion ──────────────────────
  const approveConfirmedPayment = useCallback((paymentId: string, utrNumber?: string, notes?: string) => {
    // Check permission: manager role or role with 'approve.payments'
    if (role !== 'manager' && !ROLE_PERMISSION_MATRIX[role]?.['approve.payments']) {
      showToast('Permission Denied: Only Manager / Finance can approve payments and issue invoices.', 'error');
      return { success: false, message: 'Permission Denied' };
    }

    const targetPayment = confirmedPayments.find(p => p.id === paymentId);
    if (!targetPayment) {
      return { success: false, message: 'Payment record not found' };
    }

    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const nowIso = new Date().toISOString();
    const resolvedUtr = utrNumber || targetPayment.utrNumber || `UTR-${Date.now().toString().slice(-8)}`;

    // Calculate 18% GST breakdown (SAC: 997152)
    const grossAmount = targetPayment.amount;
    const taxableValue = Math.round((grossAmount / 1.18) * 100) / 100;
    const totalGstAmount = Math.round((grossAmount - taxableValue) * 100) / 100;
    const cgstAmount = Math.round((totalGstAmount / 2) * 100) / 100;
    const sgstAmount = Math.round((totalGstAmount - cgstAmount) * 100) / 100;

    const generatedInvoiceNo = targetPayment.invoiceData?.invoiceNo || `INV-26-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInvoiceData: InvoiceData = targetPayment.invoiceData || {
      invoiceNo: generatedInvoiceNo,
      invoiceDate: `${todayStr} 00:00:00`,
      dueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      clientName: targetPayment.clientName,
      email: `${targetPayment.clientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      streetAddress: 'Corporate Office / Client Address',
      city: 'MUMBAI',
      phone: targetPayment.mobile,
      pancard: 'AAACS' + Math.floor(1000 + Math.random() * 9000) + 'K',
      itemDescription: targetPayment.description || 'INVESTMENT ADVISORY SERVICES',
      subType: 'PREMIER',
      fromDate: todayStr,
      toDate: new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalGross: grossAmount,
      discount: 0,
      adjustment: 0,
      netAmount: taxableValue,
      gstAmount: totalGstAmount,
      paidAmount: grossAmount,
      dueAmount: 0,
      paymentMode: 'Online Transfer',
      bankName: targetPayment.bank || 'HDFC BANK',
      paymentDetail: `UTR: ${resolvedUtr}`,
      taxBreakdown: {
        sacCode: '997152',
        taxableValue,
        cgstRate: 9,
        cgstAmount,
        sgstRate: 9,
        sgstAmount,
        igstRate: 18,
        igstAmount: 0,
        totalGstAmount,
        netPayable: grossAmount
      }
    };

    // Update payment record to Approved
    setConfirmedPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'Approved',
          utrNumber: resolvedUtr,
          verifiedBy: currentUser.name,
          verifiedById: currentUser.id,
          verifiedDate: todayStr,
          invoiceCreated: true,
          invoiceData: newInvoiceData,
          description: notes ? `${notes} | ${p.description}` : p.description
        };
      }
      return p;
    }));

    // Auto-create or merge with Client Master Record (Resolving Q01 & Q02 deduplication)
    const cleanMobile = targetPayment.mobile.replace(/[\s\-\+]/g, '').slice(-10);
    setDetailedClients(prev => {
      const existingClientIdx = prev.findIndex(c => c.mobile.replace(/[\s\-\+]/g, '').slice(-10) === cleanMobile);
      const serviceName = targetPayment.description || 'EQUITY PREMIER';
      const startDate = new Date().toISOString().slice(0, 10);
      const endDate = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

      const newSub: ClientServiceSubscription = {
        id: `sub-${Date.now()}`,
        serviceName,
        serviceCategory: 'Equity Cash',
        startDate,
        endDate,
        status: 'Active',
        invoiceNo: generatedInvoiceNo,
        paidAmount: grossAmount,
        assignedAdvisorId: currentUser.id,
        assignedAdvisorName: targetPayment.ownerName || currentUser.name,
        createdAt: nowIso
      };

      if (existingClientIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingClientIdx];
        updated[existingClientIdx] = {
          ...existing,
          tabCategory: 'clients',
          serviceName,
          startDate,
          endDate,
          invoices: [
            {
              id: `inv-rec-${Date.now()}`,
              invoiceNo: generatedInvoiceNo,
              products: serviceName,
              startDate,
              endDate,
              approveDate: todayStr,
              paidAmt: grossAmount,
              status: 'Active',
              isHold: false,
              paymentMode: 'Online',
              bankName: targetPayment.bank,
              paymentDate: todayStr,
              description: `Payment Approved (UTR: ${resolvedUtr})`
            },
            ...(existing.invoices || [])
          ],
          serviceSubscriptions: [
            newSub,
            ...(existing.serviceSubscriptions || [])
          ],
          notesHistory: [
            {
              id: `note-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: role,
              timestamp: `${todayStr} (Payment Approved)`,
              response: 'CONVERTED / PAID',
              text: `Payment of ₹${grossAmount.toLocaleString('en-IN')} approved with UTR: ${resolvedUtr}. Subscribed to ${serviceName}.`
            },
            ...(existing.notesHistory || [])
          ]
        };
        return updated;
      } else {
        const seq = Math.floor(1000 + Math.random() * 9000);
        const newClient: ActiveClientRecordDetailed = {
          id: `client-pay-${targetPayment.id}`,
          clientCode: `STK-26-EQP-${seq}`,
          ownerName: targetPayment.ownerName || currentUser.name,
          generatorName: targetPayment.ownerName || currentUser.name,
          clientName: targetPayment.clientName,
          mobile: targetPayment.mobile,
          email: `${targetPayment.clientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          panNo: 'AAACS' + seq + 'K',
          response: 'CONVERTED / PAID',
          leadSource: 'PAYMENT CONVERSION',
          description: `Converted client from approved payment ${targetPayment.id} (₹${grossAmount.toLocaleString('en-IN')})`,
          tabCategory: 'clients',
          serviceName,
          startDate,
          endDate,
          notesHistory: [
            {
              id: `note-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: role,
              timestamp: `${todayStr} (Client Onboarded)`,
              response: 'CONVERTED / PAID',
              text: `Payment of ₹${grossAmount.toLocaleString('en-IN')} approved by ${currentUser.name}. Generated Tax Invoice ${generatedInvoiceNo}.`
            }
          ],
          freeTrials: [],
          invoices: [
            {
              id: `inv-rec-${Date.now()}`,
              invoiceNo: generatedInvoiceNo,
              products: serviceName,
              startDate,
              endDate,
              approveDate: todayStr,
              paidAmt: grossAmount,
              status: 'Active',
              isHold: false,
              paymentMode: 'Online',
              bankName: targetPayment.bank,
              paymentDate: todayStr,
              description: `Payment Approved (UTR: ${resolvedUtr})`
            }
          ],
          kycData: {
            fullName: targetPayment.clientName,
            mobile: targetPayment.mobile,
            email: `${targetPayment.clientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
            panNo: 'AAACS' + seq + 'K',
            formType: 'Individual',
            status: 'Pending Approval'
          },
          serviceSubscriptions: [newSub]
        };
        return [newClient, ...prev];
      }
    });

    // Also update any matching AdvisoryLead to Converted
    setAdvisoryLeads(prev => prev.map(l => {
      if (l.phone.includes(cleanMobile) || cleanMobile.includes(l.phone.replace(/[\s\-\+]/g, '').slice(-10))) {
        return {
          ...l,
          status: 'Converted',
          response: 'Payment',
          modifiedToday: true
        };
      }
      return l;
    }));

    confetti({ particleCount: 75, spread: 80 });
    showToast(`Payment Approved! Invoice ${generatedInvoiceNo} created and Client Master updated.`, 'success');
    return { success: true, message: `Payment approved and invoice ${generatedInvoiceNo} generated.` };
  }, [role, confirmedPayments, currentUser, showToast]);

  const rejectConfirmedPayment = useCallback((paymentId: string, reason: string) => {
    if (role !== 'manager' && !ROLE_PERMISSION_MATRIX[role]?.['approve.payments']) {
      showToast('Permission Denied: Only Manager / Finance can reject payments.', 'error');
      return;
    }
    setConfirmedPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'Rejected',
          reason: reason || p.reason,
          verifiedBy: currentUser.name,
          verifiedById: currentUser.id,
          verifiedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      }
      return p;
    }));
    showToast(`Payment rejected: ${reason}`, 'info');
  }, [role, currentUser, showToast]);

  const createConfirmedPayment = useCallback((paymentData: Omit<ConfirmedPaymentRecord, 'id' | 'date'>) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newPayment: ConfirmedPaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now().toString().slice(-6)}`,
      date: todayStr
    };
    setConfirmedPayments(prev => [newPayment, ...prev]);
    showToast(`Confirmed payment recorded for ${paymentData.clientName} (₹${paymentData.amount.toLocaleString('en-IN')})!`, 'success');
  }, [showToast]);

  // ─── 18. Advisory Dispatch Gating Check (Compliance Safeguard Q05) ──
  const canDispatchAdvisoryToClient = useCallback((clientIdOrCode: string): { allowed: boolean; reason?: string } => {
    const client = detailedClients.find(c => c.id === clientIdOrCode || c.clientCode === clientIdOrCode || c.mobile === clientIdOrCode);
    if (!client) {
      return { allowed: false, reason: 'Client record not found.' };
    }

    const cleanMobile = client.mobile.replace(/[\s\-\+]/g, '').slice(-10);
    const kCase = kycCases.find(c => c.leadPhone.replace(/[\s\-\+]/g, '').slice(-10) === cleanMobile || c.leadName.toLowerCase() === client.clientName.toLowerCase());
    const isKYCApproved = client.kycData?.status === 'Approved' || kCase?.status === 'Approved';

    if (!isKYCApproved) {
      return {
        allowed: false,
        reason: `Advisory dispatch halted for "${client.clientName}": KYC status is "${client.kycData?.status || kCase?.status || 'Pending Approval'}". SEBI regulatory compliance requires verified KYC before recommendation signals can be sent.`
      };
    }

    if (client.isDND) {
      return {
        allowed: false,
        reason: `Advisory dispatch halted: Client "${client.clientName}" is registered on the DND registry.`
      };
    }

    return { allowed: true };
  }, [detailedClients, kycCases]);

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      currentUser,
      theme,
      toggleTheme,
      isSidebarCollapsed,
      toggleSidebar,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      isCommandPaletteOpen,
      setCommandPaletteOpen,
      activeTab,
      setActiveTab,
      isAuthenticated,
      roleCredentials,
      updateRoleCredential,
      login,
      logout,
      employees,
      addEmployee,
      attendanceRecords,
      leaveRequests,
      submitLeaveRequest,
      updateLeaveStatus,
      advisoryLeads,
      setAdvisoryLeads,
      updateLeadStatus,
      bulkAddLeads,
      leadSourcePools,
      assignmentHistory,
      allotLeadsBySourceToTeamLeader,
      allotLeadsFromTeamPoolToEmployee,
      updateLeadResponse,
      disposeLead,
      addBulkSourceLeads,
      resetLeadStateToDefault,
      kycRecords,
      approveKYC,
      rejectKYC,
      tasks,
      toggleTask,
      notifications,
      markNotificationRead,
      payslips,
      callLogs,
      addCallLog,
      updateCallLogScore,
      isClockedIn,
      clockInTime,
      isOnBreak,
      breakType,
      elapsedWorkSeconds,
      handlePunchToggle,
      handleBreakToggle,
      teams,
      teamMembers,
      coachingNotes,
      dailyStandups,
      teamTargets,
      getTeamForLeader,
      getTeamMemberIds,
      addTeam,
      updateTeam,
      addTeamMember,
      removeTeamMember,
      addCoachingNote,
      addDailyStandup,
      setTeamTarget,
      updateTeamTarget,
      reassignLead,
      batchReassignLeads,
      clientSearchAlerts,
      triggerClientSearchAlert,
      acknowledgeSearchAlert,
      dismissAllSearchAlerts,
      simulateCrossSearchAlert,
      isBirthdayCelebrationOpen,
      openBirthdayCelebration,
      closeBirthdayCelebration,
      todayBirthdays,
      sendBirthdayWish,
      simulateBirthdayCelebration,
      rolePermissions,
      hasPermission,
      toggleRolePermission,
      marketWidgetConfig,
      updateMarketWidgetConfig,
      kiteConfig,
      updateKiteConfig,
      customInstruments,
      addMarketInstrument,
      removeMarketInstrument,
      toggleInstrumentVisibility,
      bookClientPositionAndPayment,
      clientSearchQuery,
      setClientSearchQuery,
      detailedClients,
      saveClientWithService,
      updateClientService,
      dispatchedCalls,
      dispatchAdvisoryCall,
      toasts,
      showToast,
      // 1. KYC Verification
      kycDocuments,
      uploadKYCDocument,
      reviewKYCDocument,
      // 2. Lead Access Security
      logLeadAccess,
      // 3. Call Reminders
      callReminders,
      scheduleCallReminder,
      resolveCallReminder,
      // 4. Announcements
      announcements,
      createAnnouncement,
      updateAnnouncement,
      deactivateAnnouncement,
      markAnnouncementRead,
      // 5. Sales Cashback
      cashbackRules,
      cashbackRecords,
      approveCashback,
      markCashbackPaid,
      updateCashbackRule,
      // 6. Attendance & Leaves
      extendedAttendance,
      syncBiometricAttendance,
      importAttendanceRecords,
      leaveBalances,
      // 8. Trading Display Config
      tradingDisplayConfig,
      updateTradingDisplayConfig,
      // 9. Expiry SMS
      expirySMSConfigs,
      expirySMSLogs,
      sendExpirySMS,
      updateExpirySMSConfig,
      // 10. RA Calls
      raCalls,
      createRACall,
      updateRACallStatus,
      // 11. Company Bank Details
      companyBankDetails,
      updateCompanyBankDetails,
      sendBankDetailsSMS,
      // 12. Free Trial & Retrial
      activateClientRetrial,
      markClientConverted,
      // 13. KYC Case Lifecycle
      kycCases,
      createKYCCase,
      submitKYCCase,
      reviewKYCCase,
      getKYCCaseForLead,
      addKYCCaseDocument,
      // 14. Lead Change Audit
      leadChangeLog,
      logLeadChange,
      // 15. Role Permission Matrix
      hasMatrixPermission,
      // 16. Confirmed Payments & Client Conversion
      confirmedPayments,
      approveConfirmedPayment,
      rejectConfirmedPayment,
      createConfirmedPayment,
      // 17. Global DND Registry & Append-Only Dispositions
      globalDNDList,
      addToGlobalDND,
      isPhoneDND,
      addLeadDisposition,
      // 18. Advisory Dispatch Gating Check (Compliance)
      canDispatchAdvisoryToClient,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
