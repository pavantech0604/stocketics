import React, { createContext, useContext, useState, useEffect } from 'react';
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
  CallLogRecord
} from '../types';
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
  INITIAL_CALL_LOGS
} from '../data/initialData';
import { 
  RoleCredential, 
  getStoredCredentials, 
  saveStoredCredentials 
} from '../data/credentials';
import { pb, api, checkPocketBaseHealth } from '../api/pocketbase';
import confetti from 'canvas-confetti';

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

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Authentication state - defaults to false on fresh visits so Login Portal is shown
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('apex_crm_authenticated');
    return saved === 'true';
  });

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
    localStorage.setItem('apex_crm_authenticated', 'true');
    setActiveTab('dashboard');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('apex_crm_authenticated', 'false');
    setActiveTab('dashboard');
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('apex_crm_role', newRole);
    setActiveTab('dashboard');
    showToast(`Switched active view to ${newRole.toUpperCase()} Portal`, 'info');
  };

  const currentUser = CURRENT_PROFILES[role];

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

  // Entities state with persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('apex_crm_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_employees', JSON.stringify(employees));
  }, [employees]);

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

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

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

  const updateLeaveStatus = (leaveId: string, status: 'Approved' | 'Declined', note?: string) => {
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
      confetti({ particleCount: 70, spread: 60 });
      showToast(`Leave request #${leaveId} approved!`, 'success');
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
      toasts,
      showToast,
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
