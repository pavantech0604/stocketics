import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  AddNewLeadModal, 
  CallLogsModal, 
  ITProblemModal, 
  MailComposerModal, 
  SMSAlertModal,
  AddClientModal,
  AddTicketModal
} from './CRMActionModals';
import { BulkLeadUploadModal } from '../manager/BulkLeadUploadModal';
import { 
  UserProfileModal,
  HRPolicyModal,
  TrainingScriptModal,
  MyCompanyModal,
  CheckNotificationModal,
  LogoutConfirmModal
} from './ProfileModals';
import stocketicsLogo from '../../assets/logo.jpg';

// Exact SVG Icons matching the reference CRM at http://106.51.67.248:209/
// Profile Dropdown Icons matching reference screenshots (Images 1, 2, 3)
const ProfileMenuIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HRPolicyIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <circle cx="11" cy="11" r="1.5" />
  </svg>
);

const TrainingScriptIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const MyCompanyIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CheckNotificationIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const LogoutIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const DashboardIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);

const CircleChevronDownIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <path d="m8 10 4 4 4-4" />
  </svg>
);

const ShieldCheckIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CircleChevronRightIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <path d="m10 8 4 4-4 4" />
  </svg>
);

const ConfigurationIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ReportIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M9 9v12" />
    <path d="M15 9v12" />
  </svg>
);

const MailIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="15" y2="10" />
  </svg>
);

const SMSIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="8" cy="10" r="1" fill="currentColor" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
  </svg>
);

const MessengerIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <line x1="6" y1="14" x2="11" y2="14" />
  </svg>
);

const TargetIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const TicketTrayIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

interface SubItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  hasSubmenu?: boolean;
  subItems?: SubItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    role,
    currentUser,
    isSidebarCollapsed, 
    toggleSidebar, 
    activeTab, 
    setActiveTab, 
    showToast,
    setCommandPaletteOpen 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Track open state for dropdown menus.
  // Initially empty ({}) so on authentication/login all submenus are cleanly collapsed and user lands on Dashboard!
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Action Modals state
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isCallLogsOpen, setIsCallLogsOpen] = useState(false);
  const [isUnknownCallsOpen, setIsUnknownCallsOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [isITProblemOpen, setIsITProblemOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [isSMSOpen, setIsSMSOpen] = useState(false);

  // Profile Popup & Modals state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHRPolicyModalOpen, setIsHRPolicyModalOpen] = useState(false);
  const [isTrainingScriptModalOpen, setIsTrainingScriptModalOpen] = useState(false);
  const [isMyCompanyModalOpen, setIsMyCompanyModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isProfileMenuOpen]);

  // EXACT Sub-Options under Leads for HR (8 Sub-Options)
  const leadsSubItems: SubItem[] = [
    { id: 'add-new-lead', label: 'Add New Lead' },
    { id: 'new-leads', label: 'New Leads' },
    { id: 'view-all-leads', label: 'View All Leads' },
    { id: 'today-followup', label: "Today's Follow-up" },
    { id: 'active-prospect', label: 'Active Prospect' },
    { id: 'past-prospect', label: 'Past Prospect' },
    { id: 'call-logs', label: 'Call Logs' },
    { id: 'unknown-calls', label: 'Unknown Calls' },
  ];

  // EXACT Sub-Options under Leads for Manager (Bulk upload & segregate leads instead of single lead entry)
  const managerLeadsSubItems: SubItem[] = [
    { id: 'bulk-upload-leads', label: 'Upload Leads File' },
    { id: 'new-leads', label: 'New Leads' },
    { id: 'view-all-leads', label: 'View All Leads' },
    { id: 'confirmed-payment', label: 'Confirmed Payment' },
    { id: 'today-followup', label: "Today's Follow-up" },
    { id: 'active-prospect', label: 'Active Prospect' },
    { id: 'past-prospect', label: 'Past Prospect' },
    { id: 'call-logs', label: 'Call Logs' },
    { id: 'unknown-calls', label: 'Unknown Calls' },
  ];

  // EXACT Sub-Options under KYC Details for Manager
  const kycSubItems: SubItem[] = [
    { id: 'kyc-list', label: 'KYC List' },
    { id: 'kyc-pending', label: 'Pending Approval' },
    { id: 'kyc-approved', label: 'Approved KYC' },
    { id: 'kyc-rejected', label: 'Rejected' },
  ];

  // EXACT Sub-Options under Leads for Employee (7 Sub-Options matching Screenshot 1)
  const employeeLeadsSubItems: SubItem[] = [
    { id: 'new-leads', label: 'New Leads' },
    { id: 'view-all-leads', label: 'View All Leads' },
    { id: 'confirmed-payment', label: 'Confirmed Payment' },
    { id: 'today-followup', label: "Today's Follow-up" },
    { id: 'active-prospect', label: 'Active Prospect' },
    { id: 'past-prospect', label: 'Past Prospect' },
    { id: 'unknown-calls', label: 'Unknown Calls' },
  ];

  // EXACT Sub-Options under Client (7 Sub-Options matching Screenshot 1)
  const clientSubItems: SubItem[] = [
    { id: 'register-clients', label: 'Register Clients' },
    { id: 'active-clients', label: 'Active Clients' },
    { id: 'expire-clients', label: 'Expire Clients' },
    { id: 'expired-clients', label: 'Expired Clients' },
    { id: 'hold-clients', label: 'Hold Clients' },
    { id: 'hold-expire', label: 'Hold & Expire' },
    { id: 'payment-reminder', label: 'Payment Reminder' },
  ];

  // EXACT Sub-Options under Approve (Matching Manager Reference)
  const approveSubItems: SubItem[] = [
    { id: 'approve-prospect', label: 'Approve Prospect' },
  ];

  // EXACT Sub-Options under Ticket (Matching Manager Reference with tray icons)
  const ticketSubItems: SubItem[] = [
    { id: 'tickets', label: 'Tickets', icon: <TicketTrayIcon /> },
    { id: 'tickets-category', label: 'Tickets Category', icon: <TicketTrayIcon /> },
  ];

  // EXACT Sub-Options under Leave for HR & Manager (4 Sub-Options)
  const leaveSubItems: SubItem[] = [
    { id: 'new-entry', label: 'New Entry' },
    { id: 'leave-list', label: 'List' },
    { id: 'approved-leaves', label: 'Approved' },
    { id: 'rejected-leaves', label: 'Rejected' },
  ];

  // EXACT Sub-Options under Leave for Employee (2 Sub-Options matching Screenshot 2)
  const employeeLeaveSubItems: SubItem[] = [
    { id: 'new-entry', label: 'New Entry' },
    { id: 'leave-list', label: 'List' },
  ];

  // EXACT Sub-Options under Target (Matching Manager Reference)
  const targetSubItems: SubItem[] = [
    { id: 'add-target', label: 'Add target' },
    { id: 'all-target', label: 'All target' },
  ];

  // EXACT Sub-Options under Recruitment (HR)
  const recruitmentSubItems: SubItem[] = [
    { id: 'recruitment-new', label: 'New Entry' },
    { id: 'recruitment-scheduled', label: 'Scheduled' },
    { id: 'recruitment-offered', label: 'Offered' },
    { id: 'recruitment-shortlisted', label: 'Shortlisted' },
    { id: 'recruitment-hold', label: 'Hold Candidate' },
    { id: 'recruitment-reject', label: 'Reject Candidate' },
  ];

  // EXACT Sub-Options under Assets (HR)
  const assetsSubItems: SubItem[] = [
    { id: 'assets-add-product', label: 'Add Product' },
    { id: 'assets-list', label: 'Assets list' },
    { id: 'assets-allot-product', label: 'Allot Product' },
    { id: 'assets-alloted-list', label: 'Alloted list' },
  ];

  // EXACT Sub-Options under Allowance (HR)
  const allowanceSubItems: SubItem[] = [
    { id: 'add-allowance', label: 'Add Allowance' },
    { id: 'allowance-list', label: 'Allowance' },
  ];

  // EXACT Sub-Options under Deduction (HR)
  const deductionSubItems: SubItem[] = [
    { id: 'add-deduction', label: 'Add Deduction' },
    { id: 'deduction-list', label: 'Deduction list' },
  ];

  // EXACT Sub-Options under Salary (HR)
  const salarySubItems: SubItem[] = [
    { id: 'create-salary', label: 'Create Salary' },
    { id: 'salary-list', label: 'Salary list' },
  ];

  // EXACT Sub-Options under Attendance (HR)
  const attendanceSubItems: SubItem[] = [
    { id: 'upload-attendance', label: 'Upload Attendance' },
    { id: 'attendance-list', label: 'Attendance list' },
  ];

  // EXACT Sub-Options under Expenses (HR)
  const expensesSubItems: SubItem[] = [
    { id: 'add-expenses', label: 'Add Expenses' },
    { id: 'expenses-list', label: 'Expenses list' },
    { id: 'add-expenses-head', label: 'Add Expenses Head' },
    { id: 'expenses-head-list', label: 'Expenses Head list' },
  ];

  // HR SPECIFIC MENU (Exact 22 items matching HR Screenshots)
  const hrMenuItems: NavMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'leads', label: 'Leads', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: leadsSubItems },
    { id: 'it-problem', label: 'IT Problem', icon: <CircleChevronRightIcon />, hasSubmenu: false },
    { id: 'configuration', label: 'Configuration', icon: <ConfigurationIcon />, hasSubmenu: false },
    { id: 'report', label: 'Report', icon: <ReportIcon />, hasSubmenu: false },
    { id: 'mail', label: 'Mail', icon: <MailIcon />, hasSubmenu: false },
    { id: 'sms', label: 'SMS', icon: <SMSIcon />, hasSubmenu: false },
    { id: 'messenger', label: 'Messenger', icon: <MessengerIcon />, hasSubmenu: false },
    { id: 'greeting', label: 'Greeting', icon: <MessengerIcon />, hasSubmenu: false },
    { id: 'tip-archive', label: 'Tip Archive', icon: <ReportIcon />, hasSubmenu: false },
    { id: 'pre-tip-archive', label: 'Pre Tip Archive', icon: <ReportIcon />, hasSubmenu: false },
    { id: 'greeting-tip-archive', label: 'Greenting tip Archive', icon: <ReportIcon />, hasSubmenu: false },
    { id: 'open-call', label: 'Open Call', icon: <ReportIcon />, hasSubmenu: false },
    { id: 'closed-call', label: 'Closed Call', icon: <ReportIcon />, hasSubmenu: false },
    { id: 'recruitment', label: 'Recruitment', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: recruitmentSubItems },
    { id: 'leave', label: 'Leave', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: leaveSubItems },
    { id: 'assets', label: 'Assets', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: assetsSubItems },
    { id: 'allowance', label: 'Allowance', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: allowanceSubItems },
    { id: 'deduction', label: 'Deduction', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: deductionSubItems },
    { id: 'salary', label: 'Salary', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: salarySubItems },
    { id: 'attendance', label: 'Attendance', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: attendanceSubItems },
    { id: 'expenses', label: 'Expenses', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: expensesSubItems },
  ];

  // MANAGER SPECIFIC MENU (Includes KYC Details and Bulk Leads Segregation)
  const managerMenuItems: NavMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'leads', label: 'Leads', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: managerLeadsSubItems },
    { id: 'kyc', label: 'KYC Details', icon: <ShieldCheckIcon />, hasSubmenu: true, subItems: kycSubItems },
    { id: 'approve', label: 'Approve', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: approveSubItems },
    { id: 'client', label: 'Client', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: clientSubItems },
    { id: 'it-problem', label: 'IT Problem', icon: <CircleChevronRightIcon />, hasSubmenu: false },
    { id: 'ticket', label: 'Ticket', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: ticketSubItems },
    { id: 'configuration', label: 'Configuration', icon: <ConfigurationIcon />, hasSubmenu: false },
    { id: 'report', label: 'Report', icon: <ReportIcon />, hasSubmenu: false },
    { id: 'mail', label: 'Mail', icon: <MailIcon />, hasSubmenu: false },
    { id: 'sms', label: 'SMS', icon: <SMSIcon />, hasSubmenu: false },
    { id: 'leave', label: 'Leave', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: leaveSubItems },
    { id: 'target', label: 'Target', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: targetSubItems },
  ];

  // EMPLOYEE SPECIFIC MENU (Exact 8 items matching Employee Screenshots 1 and 2)
  const employeeMenuItems: NavMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'leads', label: 'Leads', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: employeeLeadsSubItems },
    { id: 'client', label: 'Client', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: clientSubItems },
    { id: 'it-problem', label: 'IT Problem', icon: <CircleChevronRightIcon />, hasSubmenu: false },
    { id: 'mail', label: 'Mail', icon: <MailIcon />, hasSubmenu: false },
    { id: 'sms', label: 'SMS', icon: <SMSIcon />, hasSubmenu: false },
    { id: 'sms-delivery-report', label: 'SMS Delivery Report', icon: <SMSIcon />, hasSubmenu: false },
    { id: 'leave', label: 'Leave', icon: <CircleChevronDownIcon />, hasSubmenu: true, subItems: employeeLeaveSubItems },
  ];

  // Select menu according to current role
  const menuItems = role === 'hr' ? hrMenuItems : role === 'employee' ? employeeMenuItems : managerMenuItems;

  // Synchronize expanded menu state with activeTab and role.
  // On Dashboard or role change, all submenus are collapsed so user sees a pristine Dashboard.
  // When an activeTab belongs to a specific section, only that section is expanded!
  React.useEffect(() => {
    if (activeTab === 'dashboard') {
      setExpandedMenus({});
      return;
    }

    const currentParent = menuItems.find(
      item => item.id === activeTab || item.subItems?.some(s => s.id === activeTab)
    );

    if (currentParent && currentParent.hasSubmenu) {
      setExpandedMenus({ [currentParent.id]: true });
    } else {
      setExpandedMenus({});
    }
  }, [activeTab, role]);

  const handleParentClick = (item: NavMenuItem) => {
    setActiveTab(item.id);

    if (item.hasSubmenu) {
      setExpandedMenus(prev => {
        const isCurrentlyOpen = !!prev[item.id];
        // If clicking the parent when already on this parent tab, allow toggling collapse/expand
        if (activeTab === item.id) {
          return isCurrentlyOpen ? {} : { [item.id]: true };
        }
        // When clicking from elsewhere, open ONLY this parent and close all others
        return { [item.id]: true };
      });
    } else {
      // Flat item without submenu (e.g. Dashboard, IT Problem, Report, Mail, SMS):
      // Cleanly fold away any open submenus so no irrelevant sub-options clutter the view!
      setExpandedMenus({});
    }
  };

  const handleSubItemClick = (sub: SubItem, parentId: string) => {
    setActiveTab(sub.id);
    // Keep ONLY this parent expanded
    setExpandedMenus({ [parentId]: true });

    if (sub.id === 'add-new-lead') {
      setIsAddLeadOpen(true);
    } else if (sub.id === 'bulk-upload-leads') {
      setIsBulkUploadOpen(true);
    } else if (sub.id === 'unknown-calls') {
      setIsUnknownCallsOpen(true);
    } else if (sub.id === 'add-ticket') {
      setIsAddTicketOpen(true);
    } else if (sub.id === 'register-clients') {
      // Navigates to Register Clients tab directly in ClientManagementView
    }
  };

  const filteredItems = menuItems.filter(item => {
    const q = searchQuery.toLowerCase();
    if (item.label.toLowerCase().includes(q)) return true;
    if (item.subItems && item.subItems.some(s => s.label.toLowerCase().includes(q))) return true;
    return false;
  });

  return (
    <>
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div 
            className="sidebar-brand-card" 
            onClick={() => setActiveTab('dashboard')} 
            title="STOCKETICS CRM • Where Stock Meets Intelligence"
          >
            <img 
              src={stocketicsLogo} 
              alt="STOCKETICS" 
              className="sidebar-brand-img" 
            />
          </div>
        </div>

        {/* Sidebar Search Bar (Matching Reference) */}
        <div className="sidebar-search-wrap">
          <div className="sidebar-search-box">
            <input 
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search CRM menu"
            />
          </div>
        </div>

        {/* Menu Items with Submenus matching reference CRM */}
        <div className="sidebar-nav">
          {filteredItems.map(item => {
            const isExpanded = !!expandedMenus[item.id];
            const isDirectActive = activeTab === item.id;
            const isChildActive = item.subItems ? item.subItems.some(sub => sub.id === activeTab) : false;

            return (
              <div key={item.id} style={{ width: '100%' }}>
                <button 
                  className={`nav-item ${isDirectActive ? 'active' : ''} ${isExpanded && item.hasSubmenu ? 'expanded-parent' : ''} ${isChildActive ? 'child-active' : ''}`}
                  onClick={() => handleParentClick(item)}
                  title={item.label}
                >
                  <span className="nav-icon">
                    {item.hasSubmenu ? (
                      isExpanded ? <CircleChevronDownIcon /> : <CircleChevronRightIcon />
                    ) : (
                      item.icon
                    )}
                  </span>
                  {!isSidebarCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.hasSubmenu && (
                    <span className={`nav-chevron-indicator ${isExpanded ? 'rotated' : ''}`}>
                      <ChevronRight size={13} />
                    </span>
                  )}
                </button>

                {/* Sub-Options matching reference with CircleChevronRightIcon or specific sub-item icon */}
                {!isSidebarCollapsed && item.hasSubmenu && isExpanded && item.subItems && (
                  <div className="nav-submenu-list">
                    {item.subItems.map(sub => (
                      <button
                        key={sub.id}
                        className={`nav-subitem ${activeTab === sub.id ? 'active' : ''}`}
                        onClick={() => handleSubItemClick(sub, item.id)}
                      >
                        {sub.icon ? sub.icon : <CircleChevronRightIcon />}
                        <span className="subitem-label">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Profile on Top, Sign Out on Bottom (Replacing Collapse Placeholder) */}
        <div className="sidebar-footer" ref={profileRef}>
          {/* Profile Popup Menu Upwards (matching reference screenshots) */}
          {isProfileMenuOpen && (
            <div className="sidebar-profile-popup" role="menu">
              {/* Option 1: Profile (All roles) */}
              <button 
                type="button" 
                className="profile-popup-item"
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsProfileMenuOpen(false);
                }}
              >
                <ProfileMenuIcon />
                <span>Profile</span>
              </button>

              {/* Option 2: HR Policy (HR & Employee) */}
              {(role === 'hr' || role === 'employee') && (
                <button 
                  type="button" 
                  className="profile-popup-item"
                  onClick={() => {
                    setIsHRPolicyModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <HRPolicyIcon />
                  <span>HR Policy</span>
                </button>
              )}

              {/* Option 3: Training Script (HR & Employee) */}
              {(role === 'hr' || role === 'employee') && (
                <button 
                  type="button" 
                  className="profile-popup-item"
                  onClick={() => {
                    setIsTrainingScriptModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <TrainingScriptIcon />
                  <span>Training Script</span>
                </button>
              )}

              {/* Option 4: My Company (HR Only - Image 2) */}
              {role === 'hr' && (
                <button 
                  type="button" 
                  className="profile-popup-item"
                  onClick={() => {
                    setIsMyCompanyModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <MyCompanyIcon />
                  <span>My Company</span>
                </button>
              )}              {/* Option 5: Check Notification (All roles) */}
              <button 
                type="button" 
                className="profile-popup-item"
                onClick={() => {
                  setIsNotificationModalOpen(true);
                  setIsProfileMenuOpen(false);
                }}
              >
                <CheckNotificationIcon />
                <span>Check Notification</span>
              </button>
            </div>
          )}

          {/* Top: Profile Card / Button */}
          <button 
            type="button" 
            className={`sidebar-profile-card ${isProfileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            title={`Signed in as ${currentUser.name} (${role.toUpperCase()})`}
          >
            <div className="profile-avatar-wrap">
              <img src={currentUser.avatar} alt={currentUser.name} className="profile-avatar-img" />
              <span className="profile-online-badge" />
            </div>
            {!isSidebarCollapsed && (
              <div className="profile-details-wrap">
                <div className="profile-user-name">{currentUser.name}</div>
                <div className="profile-user-role">
                  {role === 'manager' ? 'VP / Manager' : role === 'hr' ? 'HR Director' : 'Equity Advisor'}
                </div>
              </div>
            )}
          </button>

          {/* Bottom: Logout Button */}
          <button 
            type="button" 
            className="sidebar-signout-btn"
            onClick={() => setIsLogoutConfirmOpen(true)}
            title="Logout Session"
          >
            <LogoutIcon />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Action Modals */}
      <AddNewLeadModal isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} />
      <BulkLeadUploadModal isOpen={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} />
      <CallLogsModal isOpen={isCallLogsOpen} onClose={() => setIsCallLogsOpen(false)} />
      <CallLogsModal isOpen={isUnknownCallsOpen} onClose={() => setIsUnknownCallsOpen(false)} isUnknown={true} />
      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} />
      <AddTicketModal isOpen={isAddTicketOpen} onClose={() => setIsAddTicketOpen(false)} />
      <ITProblemModal isOpen={isITProblemOpen} onClose={() => setIsITProblemOpen(false)} />
      <MailComposerModal isOpen={isMailOpen} onClose={() => setIsMailOpen(false)} />
      <SMSAlertModal isOpen={isSMSOpen} onClose={() => setIsSMSOpen(false)} />

      {/* Role Profile Dropdown Modals */}
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <HRPolicyModal isOpen={isHRPolicyModalOpen} onClose={() => setIsHRPolicyModalOpen(false)} />
      <TrainingScriptModal isOpen={isTrainingScriptModalOpen} onClose={() => setIsTrainingScriptModalOpen(false)} />
      <MyCompanyModal isOpen={isMyCompanyModalOpen} onClose={() => setIsMyCompanyModalOpen(false)} />
      <CheckNotificationModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} />
      <LogoutConfirmModal isOpen={isLogoutConfirmOpen} onClose={() => setIsLogoutConfirmOpen(false)} />
    </>
  );
};
