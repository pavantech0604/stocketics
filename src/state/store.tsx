import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  AdvisoryLead, 
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
  CompanyBankDetails
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
  INITIAL_TEAM_TARGETS
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
  updateLeadStatus: (leadId: string, status: AdvisoryLead['status']) => void;
  bulkAddLeads: (leads: AdvisoryLead[]) => void;
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
  reassignLead: (leadId: string, newEmployeeId: string, newEmployeeName: string) => void;

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
  updateClientService: (clientId: string, serviceName: string, startDate: string, endDate: string) => void;

  // Advisory Call Dispatches (SMS / Email / WhatsApp)
  dispatchedCalls: AdvisoryDispatchRecord[];
  dispatchAdvisoryCall: (params: {
    quote: MarketQuote;
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
    setActiveTab('dashboard');

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
    setActiveTab('dashboard');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      try {
        window.history.pushState({}, '', '/login');
      } catch (_) {}
    }
    showToast('Logged out safely. Welcome back to Stocketics Portal.', 'info');
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');

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

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Automatic migration: scrub any legacy cached real client data from localStorage
  if (typeof window !== 'undefined') {
    try {
      const rawEmps = localStorage.getItem('apex_crm_employees');
      const rawPayments = localStorage.getItem('apex_crm_confirmed_payments');
      const rawCreds = localStorage.getItem('stocketics_crm_credentials');
      if (
        (rawEmps && (rawEmps.includes('Sindhu H S') || rawEmps.includes('Vinod Kumar') || rawEmps.includes('apexedge.in'))) ||
        (rawPayments && (rawPayments.includes('9940721833') || rawPayments.includes('Naveen'))) ||
        (rawCreds && (rawCreds.includes('Vinod Kumar') || rawCreds.includes('Sindhu H S')))
      ) {
        localStorage.removeItem('apex_crm_employees');
        localStorage.removeItem('apex_crm_attendance');
        localStorage.removeItem('apex_crm_leaves');
        localStorage.removeItem('apex_crm_leads');
        localStorage.removeItem('apex_crm_tasks');
        localStorage.removeItem('apex_crm_kyc');
        localStorage.removeItem('apex_crm_call_logs');
        localStorage.removeItem('apex_crm_confirmed_payments');
        localStorage.removeItem('stocketics_crm_credentials');
        localStorage.removeItem('apex_crm_credentials');
      }
    } catch (_) {}
  }

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
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_leads', JSON.stringify(advisoryLeads));
  }, [advisoryLeads]);

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
          response: clientData.response || 'CLOSED OWN',
          serviceName: clientData.serviceName || updated[existingIdx].serviceName || 'INDEX OPTION',
          startDate: clientData.startDate || updated[existingIdx].startDate || new Date().toISOString().slice(0, 10),
          endDate: clientData.endDate || updated[existingIdx].endDate || '2026-11-01',
          notesHistory: [
            {
              id: `note-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: currentUser.title || currentUser.role,
              timestamp: `${nowStr} (Service Subscribed)`,
              response: 'CLOSED OWN',
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
          response: clientData.response || 'CLOSED OWN',
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
              response: 'CLOSED OWN',
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

  const updateClientService = useCallback((clientId: string, serviceName: string, startDate: string, endDate: string) => {
    setDetailedClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          serviceName,
          startDate,
          endDate,
          tabCategory: 'clients'
        };
      }
      return c;
    }));
    showToast(`Updated service subscription to ${serviceName}`, 'success');
  }, [showToast]);

  // Advisory Call Dispatches state (SMS, Email, WhatsApp)
  const [dispatchedCalls, setDispatchedCalls] = useState<AdvisoryDispatchRecord[]>(() => {
    const saved = localStorage.getItem('stocketics_dispatched_calls');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('stocketics_dispatched_calls', JSON.stringify(dispatchedCalls));
  }, [dispatchedCalls]);

  const dispatchAdvisoryCall = useCallback((params: {
    quote: MarketQuote;
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

    const dispatchId = `DISPATCH-${Date.now().toString().slice(-6)}`;
    const smsText = customMessage || 
      `[STOCKETICS] ${quote.callType || 'BUY'} ${quote.label} @ ${quote.entryPrice || quote.value}. TGT1: ${quote.target1 || '—'}, TGT2: ${quote.target2 || '—'}, SL: ${quote.stopLoss || '—'}. RA: ${quote.analyst || 'Aditya Roy'}`;

    const newDispatch: AdvisoryDispatchRecord = {
      id: dispatchId,
      scriptName: quote.label,
      serviceSegment: quote.serviceSegment || 'INDEX OPTION',
      callType: quote.callType || 'BUY',
      entryPrice: quote.entryPrice || quote.value,
      target1: quote.target1 || (quote.value * 1.25),
      target2: quote.target2 || (quote.value * 1.45),
      stopLoss: quote.stopLoss || (quote.value * 0.82),
      ltpAtSend: quote.value,
      channels,
      recipientCount: targetClients.length,
      recipients: targetClients.map(c => ({
        clientId: c.id,
        clientName: c.clientName,
        mobile: c.mobile,
        email: c.email
      })),
      smsTemplateUsed: 'STKADV-OPTION-CALL',
      sentBy: currentUser.name,
      sentRole: currentUser.title || currentUser.role,
      sentAt: nowStr,
      status: 'Delivered'
    };

    setDispatchedCalls(prev => [newDispatch, ...prev]);

    // Update each client's notes with this dispatch
    const targetIds = new Set(targetClients.map(c => c.id));
    setDetailedClients(prev => prev.map(c => {
      if (targetIds.has(c.id)) {
        return {
          ...c,
          notesHistory: [
            {
              id: `dispatch-note-${Date.now()}-${c.id}`,
              authorName: currentUser.name,
              authorRole: currentUser.title || currentUser.role,
              timestamp: `${nowStr} (${channels.join('/')} Dispatched)`,
              response: 'DISPATCHED CALL',
              text: `Dispatched ${quote.callType || 'BUY'} ${quote.label} (LTP: ₹${quote.value.toFixed(2)}) via ${channels.join(', ')}.`
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
        title: `Advisory Call Dispatched: ${quote.label}`,
        message: `Successfully sent ${quote.callType || 'BUY'} ${quote.label} to ${targetClients.length} active clients via ${channels.join(', ')}.`,
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

    showToast(`Advisory call on ${quote.label} delivered to ${targetClients.length} active clients via ${channels.join(' & ')}!`, 'success');
  }, [currentUser, showToast]);

  // ─── Team Leader State ─────────────────────────────────────────────
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('apex_crm_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });
  useEffect(() => { localStorage.setItem('apex_crm_teams', JSON.stringify(teams)); }, [teams]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('apex_crm_team_members');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
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

  const reassignLead = (leadId: string, newEmployeeId: string, newEmployeeName: string) => {
    setAdvisoryLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, assignedToId: newEmployeeId, assignedToName: newEmployeeName };
      }
      return lead;
    }));
    showToast(`Lead reassigned to ${newEmployeeName}!`, 'success');
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

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      currentUser,
      theme,
      toggleTheme,
      isSidebarCollapsed,
      toggleSidebar,
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
      updateLeadStatus,
      bulkAddLeads,
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
