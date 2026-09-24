import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  XCircle, 
  CalendarDays, 
  PhoneCall, 
  Briefcase, 
  ArrowUpRight,
  Home,
  Gift,
  Megaphone,
  BellRing,
  Flame,
  Plus,
  Send,
  Edit3,
  Clock,
  Sparkles,
  Radio,
  Eye,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { AdvisoryPipeline } from './AdvisoryPipeline';
import { TeamScheduler } from './TeamScheduler';
import { PerformanceReviews } from './PerformanceReviews';
import { EmployeeDirectory } from '../hr/EmployeeDirectory';
import { AttendanceRoster } from '../hr/AttendanceRoster';
import { ComplianceVault } from '../hr/ComplianceVault';
import { AllotLeadsView } from '../common/AllotLeadsView';
import { RefKPIGrid } from '../common/RefKPIGrid';
import { MarketWorkspace } from '../market/MarketWorkspace';
import { SalesExecutiveChart, ManagersChart } from '../common/ChartWidgets';
import { TipsModal } from '../common/TipsModal';
import { ApproveProspectView } from './ApproveProspectView';
import { ClientManagementView } from './ClientManagementView';
import { TicketManagementView } from './TicketManagementView';
import { TargetManagementView } from './TargetManagementView';
import { ManagerReportView } from './ManagerReportView';
import { ManagerMailView } from './ManagerMailView';
import { ManagerSMSView } from './ManagerSMSView';
import { ManagerLeavePortal } from './ManagerLeavePortal';
import { LeaveManagementView } from './LeaveManagementView';
import { KYCManagementView } from './KYCManagementView';
import { CallLogsView } from '../common/CallLogsView';
import { ITProblemView } from '../hr/ITProblemView';
import { ExpirySMSManagementView } from './ExpirySMSManagementView';
import { RACallsDashboardView } from '../common/RACallsDashboardView';
import { AdvisoryCallDispatchModal } from '../common/AdvisoryCallDispatchModal';
import { AnnouncementType, STANDARD_ADVISORY_SERVICES, ActiveClientRecordDetailed, RACallRecord } from '../../types';

export const ManagerDashboard: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser,
    leaveRequests, 
    updateLeaveStatus, 
    advisoryLeads, 
    employees,
    cashbackRecords,
    approveCashback,
    markCashbackPaid,
    createAnnouncement,
    detailedClients,
    dispatchedCalls,
    raCalls,
    updateClientService,
    leadSourcePools,
    theme,
    showToast 
  } = useApp();

  const isDark = theme === 'dark';

  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'MorningGreeting' | 'Celebration' | 'Milestone' | 'General' | 'Urgent'>('MorningGreeting');
  const [annAudience, setAnnAudience] = useState<'All' | 'Employees' | 'TeamLeads'>('All');

  // Active Clients Advisory Desk State
  const [advisoryFilterTab, setAdvisoryFilterTab] = useState<string>('all');
  const [advisorySearch, setAdvisorySearch] = useState<string>('');
  const [editingClient, setEditingClient] = useState<ActiveClientRecordDetailed | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [dispatchCall, setDispatchCall] = useState<RACallRecord | any>(null);
  const [dispatchClient, setDispatchClient] = useState<ActiveClientRecordDetailed | null>(null);

  const openEditClientModal = (client: ActiveClientRecordDetailed) => {
    setEditingClient(client);
    setEditServiceName(client.serviceName || 'INDEX OPTION');
    setEditStartDate(client.startDate || new Date().toISOString().slice(0, 10));
    setEditEndDate(client.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setEditStatus(client.trialStatus || 'Active Trial');
  };

  const handleSaveClientService = () => {
    if (!editingClient) return;
    updateClientService(
      editingClient.id,
      editServiceName,
      editStartDate,
      editEndDate,
      editStatus
    );
    setEditingClient(null);
  };

  // Active Advisory Desk calculations & filtering
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const activeAdvisoryClients = useMemo(() => {
    return detailedClients.filter(c => {
      if (!c.endDate) return true;
      return c.endDate >= todayStr;
    });
  }, [detailedClients, todayStr]);

  const activeTodayCount = useMemo(() => {
    return detailedClients.filter(c => {
      const isStarted = !c.startDate || c.startDate <= todayStr;
      const isNotExpired = !c.endDate || c.endDate >= todayStr;
      return isStarted && isNotExpired;
    }).length;
  }, [detailedClients, todayStr]);

  const callsDispatchedTodayCount = useMemo(() => {
    return detailedClients.reduce((acc, c) => {
      if (c.lastCallSentAt && c.lastCallSentAt.includes(new Date().toLocaleDateString('en-GB'))) {
        return acc + 1;
      }
      return acc + (c.callsDeliveredCount ? 1 : 0);
    }, 0);
  }, [detailedClients]);

  const expiringSoonCount = useMemo(() => {
    return detailedClients.filter(c => {
      if (!c.endDate) return false;
      const end = new Date(c.endDate);
      const today = new Date();
      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2;
    }).length;
  }, [detailedClients]);

  const filteredDeskClients = useMemo(() => {
    return detailedClients.filter(c => {
      // Segment tab filtering
      if (advisoryFilterTab !== 'all') {
        const sName = (c.serviceName || '').toLowerCase();
        const tabKey = advisoryFilterTab.toLowerCase();
        if (tabKey === 'index options' && !sName.includes('option')) return false;
        if (tabKey === 'bank nifty' && !sName.includes('banknifty') && !sName.includes('bank nifty')) return false;
        if (tabKey === 'cash / equity' && !sName.includes('cash') && !sName.includes('equity')) return false;
        if (tabKey === 'commodity' && !sName.includes('commodity') && !sName.includes('crude')) return false;
      }

      // Search query filtering
      if (advisorySearch.trim()) {
        const q = advisorySearch.toLowerCase();
        const matchesName = (c.clientName || '').toLowerCase().includes(q);
        const matchesPhone = (c.mobile || '').includes(q);
        const matchesService = (c.serviceName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesService) return false;
      }

      return true;
    });
  }, [detailedClients, advisoryFilterTab, advisorySearch]);

  // Dedicated Market Workspace Routing
  if (activeTab === 'market') {
    return <MarketWorkspace />;
  }

  // Dedicated Call Logs View (Manager Scoped: All Employees Master Feed & Audit)
  if (activeTab === 'call-logs') {
    return <CallLogsView />;
  }

  // Subscription Expiry SMS Automation View
  if (activeTab === 'expiry-sms' || activeTab === 'subscription-expiry' || activeTab === 'sms-expiry') {
    return <ExpirySMSManagementView />;
  }

  // Research Analyst (RA) Live Calls Board
  if (activeTab === 'ra-calls' || activeTab === 'advisory-calls') {
    return <RACallsDashboardView />;
  }

  // Exact Manager Dashboard Options and Sub-Options Routing
  if (
    activeTab === 'leads' || 
    activeTab === 'advisory' || 
    activeTab === 'available-leads' || 
    activeTab === 'today-followup' || 
    activeTab === 'new-leads' || 
    activeTab === 'view-all-leads' || 
    activeTab === 'active-prospect' || 
    activeTab === 'past-prospect' ||
    activeTab === 'add-new-lead' ||
    activeTab === 'bulk-upload-leads' ||
    activeTab === 'confirmed-payment' ||
    activeTab === 'modified-today' ||
    activeTab === 'disposed-today' ||
    activeTab === 'interested-leads' ||
    activeTab === 'payment-leads' ||
    activeTab === 'unknown-calls'
  ) {
    return <AdvisoryPipeline />;
  }

  // KYC Details Routing (All, Pending, Approved, Rejected)
  if (
    activeTab === 'kyc' || 
    activeTab === 'kyc-details' || 
    activeTab === 'kyc-list' || 
    activeTab === 'kyc-pending' || 
    activeTab === 'kyc-approved' || 
    activeTab === 'kyc-rejected'
  ) {
    return <KYCManagementView />;
  }

  // 1. Approve -> Approve Prospect (Matching Image 3)
  if (
    activeTab === 'approve' || 
    activeTab === 'approve-prospect'
  ) {
    return <ApproveProspectView />;
  }

  // 2. Client -> Register Clients, Active Clients, Expire Clients, Expired, Hold, Hold & Expire, Payment Reminder
  if (
    activeTab === 'client' || 
    activeTab === 'register-clients' || 
    activeTab === 'active-clients' || 
    activeTab === 'expire-clients' ||
    activeTab === 'expired-clients' ||
    activeTab === 'hold-clients' ||
    activeTab === 'hold-expire' ||
    activeTab === 'payment-reminder'
  ) {
    return <ClientManagementView />;
  }

  // 3. Ticket -> Tickets, Tickets Category
  if (
    activeTab === 'ticket' || 
    activeTab === 'tickets' || 
    activeTab === 'tickets-category' ||
    activeTab === 'add-ticket'
  ) {
    return <TicketManagementView />;
  }

  // 4. Report (Matching Image 2)
  if (
    activeTab === 'report' || 
    activeTab === 'sales-report' || 
    activeTab === 'manager-report' || 
    activeTab === 'lead-report' || 
    activeTab === 'dcr-report' || 
    activeTab === 'attendance-roster' || 
    activeTab === 'collection-report'
  ) {
    return <ManagerReportView />;
  }

  // Lead Allotment Engine (Manager / Configuration / allotleads)
  if (activeTab === 'allot-leads' || activeTab === 'allot-team-leads') {
    return <AllotLeadsView />;
  }

  // 5. Configuration
  if (
    activeTab === 'configuration' || 
    activeTab === 'user-management' || 
    activeTab === 'role-permissions' || 
    activeTab === 'department-settings' || 
    activeTab === 'service-master' || 
    activeTab === 'compliance-vault'
  ) {
    return <ComplianceVault />;
  }

  if (
    activeTab === 'ticket' || 
    activeTab === 'tickets' || 
    activeTab === 'tickets-category'
  ) {
    return <TicketManagementView />;
  }

  // 6. Mail / Messages (Matching Image 6)
  if (activeTab === 'mail') {
    return <ManagerMailView />;
  }

  // 7. SMS (Matching Image 7)
  if (activeTab === 'sms') {
    return <ManagerSMSView />;
  }

  // 8. Leave -> New Entry, List, Approved, Rejected (Matching Reference)
  if (
    activeTab === 'leave' || 
    activeTab === 'new-entry' || 
    activeTab === 'leave-list' || 
    activeTab === 'approved-leaves' || 
    activeTab === 'rejected-leaves' ||
    activeTab === 'apply-leave'
  ) {
    return <LeaveManagementView />;
  }

  // 9. Target -> Add target, All target
  if (
    activeTab === 'target' || 
    activeTab === 'add-target' || 
    activeTab === 'all-target'
  ) {
    return <TargetManagementView />;
  }

  if (activeTab === 'schedule') return <TeamScheduler />;
  if (activeTab === 'reviews') return <PerformanceReviews />;
  if (activeTab === 'it-problem') return <ITProblemView />;

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');

  // Dynamic live KPI calculation for Manager Suite
  const mgrTodayFollowup = advisoryLeads.filter(l => l.status === 'In Contact' || l.response === 'Call Back' || l.callbackDate?.includes('2026-09') || l.lastContactDate === '22-Sep-2026').length;
  const mgrActiveProspect = advisoryLeads.filter(l => l.status === 'Trial Active' || l.response === 'Interested').length;
  const mgrAvailableLeads = leadSourcePools ? leadSourcePools.reduce((a, b) => a + (b.availableCount || 0), 0) : advisoryLeads.filter(l => l.status === 'New Lead').length;
  const mgrModifiedToday = advisoryLeads.filter(l => l.modifiedToday || l.lastContactDate?.includes('22-Sep')).length;
  const mgrDisposeToday = advisoryLeads.filter(l => l.disposedToday || (l.status === 'Lost' && l.disposedAt)).length;
  const mgrTodaySale = advisoryLeads.filter(l => (l.status === 'Converted' || l.response === 'Payment') && (l.modifiedToday || l.lastContactDate?.includes('22-Sep'))).reduce((acc, l) => acc + (l.expectedRevenue || 35000), 45000);
  const mgrMonthlySale = advisoryLeads.filter(l => l.status === 'Converted').reduce((acc, l) => acc + (l.expectedRevenue || 35000), 1253100);
  const mgrInterestedLeads = advisoryLeads.filter(l => l.response === 'Interested').length;
  const mgrPaymentLeads = advisoryLeads.filter(l => l.status === 'Converted' || l.response === 'Payment').length;

  const managerRow1 = [
    { id: 'today-followup', value: mgrTodayFollowup, label: "Today's Followup", colorClass: 'kpi-c-blue' },
    { id: 'active-prospect', value: mgrActiveProspect, label: "Today's Prospect", colorClass: 'kpi-c-orange' },
    { id: 'available-leads', value: mgrAvailableLeads, label: 'Available Leads', colorClass: 'kpi-c-teal' },
    { id: 'modified-today', value: mgrModifiedToday, label: 'Modified Today', colorClass: 'kpi-c-purple' },
    { id: 'dispose-today', value: mgrDisposeToday, label: 'Dispose Today', colorClass: 'kpi-c-red' },
    { id: 'today-sale', value: mgrTodaySale, format: 'currency' as const, decimals: 0, label: "Today's Sale", colorClass: 'kpi-c-cyan' },
  ];

  const managerRow2 = [
    { 
      id: 'monthly-sale', 
      value: mgrMonthlySale, 
      format: 'currency' as const, 
      decimals: 2, 
      label: 'Monthly Sale', 
      colorClass: 'kpi-c-navy' 
    },
    { id: 'interested-leads', value: mgrInterestedLeads, label: 'Interested leads', colorClass: 'kpi-c-violet' },
    { id: 'payment-leads', value: mgrPaymentLeads, label: 'Payment leads', colorClass: 'kpi-c-amber' },
  ];

  const handleKPIClick = (kpiId: string) => {
    if (kpiId === 'today-followup') {
      setActiveTab('today-followup');
      showToast("Filtering leads: Today's Follow-up", 'info');
    } else if (kpiId === 'active-prospect') {
      setActiveTab('active-prospect');
      showToast("Filtering leads: Active Prospects", 'info');
    } else if (kpiId === 'available-leads') {
      setActiveTab('new-leads');
      showToast("Filtering leads: Available Leads", 'info');
    } else if (kpiId === 'modified-today') {
      setActiveTab('modified-today');
      showToast("Filtering leads: Modified Today", 'info');
    } else if (kpiId === 'dispose-today') {
      setActiveTab('disposed-today');
      showToast("Filtering leads: Disposed Today", 'info');
    } else if (kpiId === 'today-sale' || kpiId === 'monthly-sale') {
      setActiveTab('sales-report');
      showToast("Opening Sales Performance Report", 'info');
    } else if (kpiId === 'interested-leads') {
      setActiveTab('interested-leads');
      showToast("Filtering leads: Interested Leads", 'info');
    } else if (kpiId === 'payment-leads') {
      setActiveTab('confirmed-payment');
      showToast("Filtering leads: Confirmed Payment Leads", 'info');
    } else {
      setActiveTab('leads');
      showToast(`Navigating to ${kpiId.replace(/-/g, ' ').toUpperCase()}`, 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip (Matching Reference) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Home</span>
          </span>
        </div>
      </div>

      <div className="dashboard-full-container">
        {/* Reference Title */}
        <h1 className="page-title-ref">Dashboard</h1>

        {/* 6+3 Vibrant Colorful KPI Grid */}
        <RefKPIGrid 
          customRow1={managerRow1}
          customRow2={managerRow2}
          onCardClick={handleKPIClick}
          activeId={activeTab}
        />

      {/* Dual Charts: Sales Executive & Managers */}
      <div className="charts-split-grid">
        <SalesExecutiveChart />
        <ManagersChart />
      </div>

      {/* Manager Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Briefcase size={20} style={{ color: 'var(--stocketics-blue-500)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Team Lead Execution & Advisory Pipeline
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              13 Active team members across Equity Research & Portfolio Advisory Desks.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('allot-leads')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none' }}>
            <Users size={14} />
            <span>Allot Leads</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setAnnouncementModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #f59e0b', color: '#f59e0b' }}>
            <Megaphone size={14} />
            <span>Post Greeting / Announcement</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('expiry-sms')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BellRing size={14} />
            <span>Expiry SMS Center</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('ra-calls')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Flame size={14} style={{ color: '#f97316' }} />
            <span>Live RA Calls</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('schedule')}>
            <CalendarDays size={14} />
            <span>Shift Gantt</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('reviews')}>
            <TrendingUp size={14} />
            <span>OKRs & 1-on-1s</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('advisory')}>
            <TrendingUp size={14} />
            <span>Lead Pipeline ({advisoryLeads.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Active Clients Requiring Live Advisory Calls Service Command Desk ─── */}
      <div 
        className="card advisory-command-desk"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))' 
            : 'linear-gradient(135deg, #ffffff, #f0f9ff)',
          border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.35)' : '#bae6fd'}`,
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 4px 20px rgba(2, 132, 199, 0.08)',
          borderRadius: 'var(--radius-lg, 16px)'
        }}
      >
        {/* Header & Subtitle */}
        <div className="card-header" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
            }}>
              <Radio size={20} />
            </div>
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 800 }}>
                <span>Active Clients Requiring Live Advisory Calls Service</span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#0284c7',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 800
                }}>
                  Live Desk
                </span>
              </div>
              <div className="card-subtitle" style={{ fontSize: '0.78rem' }}>
                Monitor client service periods, required options/segments, and dispatch real-time RA calls via SMS & Email.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('ra-calls')}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                borderColor: '#f97316',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700
              }}
            >
              <Flame size={14} /> View All RA Calls Board
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          {/* Tile 1: Active Advisory Subscribers */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Active Advisory Subscribers</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{activeAdvisoryClients.length}</div>
            </div>
          </div>

          {/* Tile 2: Active Today (Eligible for calls) */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BellRing size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Active Today (Eligible)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>{activeTodayCount}</div>
            </div>
          </div>

          {/* Tile 3: Calls Dispatched Today */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(249, 115, 22, 0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Calls Dispatched Today</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f97316' }}>{callsDispatchedTodayCount}</div>
            </div>
          </div>

          {/* Tile 4: Services Expiring Soon */}
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Services Expiring Soon</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#d97706' }}>{expiringSoonCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Filter size={14} color={isDark ? '#94a3b8' : '#64748b'} />
            {[
              { id: 'all', label: 'All Active' },
              { id: 'Index Options', label: 'Index Options' },
              { id: 'Bank Nifty', label: 'Bank Nifty' },
              { id: 'Cash / Equity', label: 'Cash / Equity' },
              { id: 'Commodity', label: 'Commodity' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAdvisoryFilterTab(tab.id)}
                style={{
                  background: advisoryFilterTab === tab.id
                    ? (isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.12)')
                    : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                  color: advisoryFilterTab === tab.id ? '#0284c7' : (isDark ? '#94a3b8' : '#64748b'),
                  border: `1px solid ${advisoryFilterTab === tab.id ? '#0284c7' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1')}`,
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search client or phone..."
                value={advisorySearch}
                onChange={e => setAdvisorySearch(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 26px 6px 26px',
                  fontSize: '0.78rem',
                  borderRadius: 6,
                  background: isDark ? 'rgba(0,0,0,0.25)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}`,
                  color: isDark ? '#fff' : '#0f172a'
                }}
              />
              {advisorySearch && (
                <button
                  type="button"
                  onClick={() => setAdvisorySearch('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 0,
                    display: 'flex'
                  }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Showing {filteredDeskClients.length} of {detailedClients.length}
            </span>
          </div>
        </div>

        {/* Client Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', textTransform: 'uppercase', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Client Name & Contact</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Needed Option / Service</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Active Period (From - To)</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Calls Delivered</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeskClients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: 8, fontSize: '0.88rem' }}>
                      No active advisory clients matching your criteria
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setAdvisoryFilterTab('all');
                        setAdvisorySearch('');
                      }}
                    >
                      Reset Filter & Search
                    </button>
                  </td>
                </tr>
              ) : filteredDeskClients.slice(0, 10).map(c => {
                  const today = new Date();
                  const end = c.endDate ? new Date(c.endDate) : null;
                  const diffDays = end ? Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  const isExpiringToday = diffDays === 0;
                  const isExpired = diffDays < 0;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td 
                        style={{ padding: '0.6rem 0.8rem', cursor: 'pointer' }}
                        onClick={() => openEditClientModal(c)}
                        title="Click to configure advisory service & validity"
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.clientName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.mobile} • {c.email || 'Email on file'}</div>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(2, 132, 199, 0.12)',
                        color: '#0284c7',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        fontWeight: 700,
                        fontSize: '0.74rem'
                      }}>
                        <Sparkles size={12} /> {c.serviceName || 'INDEX OPTION'}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                        {c.startDate || 'Immediate'} → <strong>{c.endDate || 'Ongoing'}</strong>
                      </div>
                      <div style={{ marginTop: 2 }}>
                        {isExpired ? (
                          <span style={{ padding: '1px 6px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700, fontSize: '0.68rem' }}>
                            Expired
                          </span>
                        ) : isExpiringToday ? (
                          <span style={{ padding: '1px 6px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.2)', color: '#d97706', fontWeight: 800, fontSize: '0.68rem' }}>
                            Expiring Today
                          </span>
                        ) : (
                          <span style={{ padding: '1px 6px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700, fontSize: '0.68rem' }}>
                            {diffDays} Days Remaining
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      <span style={{ fontWeight: 800, color: (c.callsDeliveredCount || 0) > 0 ? '#10b981' : 'var(--text-muted)' }}>
                        🎯 {c.callsDeliveredCount || 0} Calls Sent
                      </span>
                      {c.lastCallSentAt && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Latest: {c.lastCallSentAt.split(',')[0]}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            const matchedCall = raCalls.find(call => {
                              const sName = (c.serviceName || '').toUpperCase();
                              const seg = (call.segment || '').toUpperCase();
                              return call.status === 'ACTIVE' && (sName.includes(seg) || seg.includes(sName));
                            }) || raCalls.find(call => call.status === 'ACTIVE') || raCalls[0];

                            setDispatchCall(matchedCall);
                            setDispatchClient(c);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Send size={11} /> Send Live Call
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditClientModal(c)}
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        >
                          <Edit3 size={11} /> Edit Dates
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveTab('ra-calls')}
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        >
                          <Eye size={11} /> View RA
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Target Cashback & Incentive Approval Queue */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.04), rgba(245,158,11,0.02))', border: '1px solid rgba(234,179,8,0.25)' }}>
        <div className="card-header" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={18} style={{ color: '#eab308' }} />
            <span>Employee Sales Limit Cashback & Incentive Approvals</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(234,179,8,0.18)', color: '#ca8a04', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              {cashbackRecords.filter(c => c.status === 'Pending').length} Pending Payouts
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cashback bonuses unlocked upon crossing sales limit slabs
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', textTransform: 'uppercase', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Employee Name</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Sales Achieved MTD</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Target Limit Slab</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Bonus Cashback</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Status</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Authorization Action</th>
              </tr>
            </thead>
            <tbody>
              {cashbackRecords.map(cb => (
                <tr key={cb.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cb.employeeName}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: '#10b981', fontWeight: 700 }}>
                    ₹{(cb.salesAchieved ?? cb.currentSales).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>
                    ₹{(cb.salesLimitTarget ?? cb.targetSalesAmount).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: '#eab308', fontWeight: 800 }}>
                    ₹{cb.cashbackEarned.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem' }}>
                    <span className={`delta-badge ${cb.status === 'Paid' ? 'positive' : cb.status === 'Approved' ? 'warning' : 'negative'}`}>
                      {cb.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      {cb.status === 'Pending' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => approveCashback(cb.id)}
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          Approve Bonus
                        </button>
                      )}
                      {cb.status === 'Approved' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => markCashbackPaid(cb.id)}
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          Mark as Paid
                        </button>
                      )}
                      {cb.status === 'Paid' && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                          ✓ Disbursed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Split: Pending Approvals & Advisory Leads Overview */}
      <div className="dashboard-split-equal">
        {/* Actionable Approvals Queue */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                <span>Direct Reports • Pending Approvals ({pendingLeaves.length})</span>
              </div>
              <div className="card-subtitle">
                Contextual decision cards with quota balance & 1-click approvals
              </div>
            </div>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--success)', margin: '0 auto 0.75rem', display: 'block' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Zero Pending Requests</div>
              <div style={{ fontSize: '0.8rem' }}>Your team's coverage and attendance is all approved.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingLeaves.map(req => {
                const applicant = employees.find(e => e.id === req.employeeId);
                return (
                  <div 
                    key={req.id} 
                    style={{ 
                      padding: '1rem', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-alt)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                          <img src={applicant?.avatar} alt={req.employeeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {req.employeeName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {applicant?.title} • {req.type}
                          </div>
                        </div>
                      </div>
                      <span className="status-badge status-pending">{req.daysCount} Days</span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      "{req.reason}"
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-success btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => updateLeaveStatus(req.id, 'Approved', 'Approved by Team Lead')}
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve Leave</span>
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => updateLeaveStatus(req.id, 'Declined', 'Coverage constraints on trading floor')}
                      >
                        <XCircle size={14} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Advisory Leads Quick Pipeline */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>High-Value Lead Pipeline</span>
              </div>
              <div className="card-subtitle">
                Institutional & HNI advisory leads in active negotiation
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('call-logs')}>
                <PhoneCall size={14} style={{ color: '#0ea5e9' }} />
                <span>Team Call Logs</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('advisory')}>
                <span>Full Pipeline</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {advisoryLeads.slice(0, 4).map(lead => (
              <div 
                key={lead.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {lead.clientName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {lead.serviceType ? `${lead.serviceType} • ` : ''}Assigned to {lead.assignedToName || 'Unassigned'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono-cell" style={{ fontWeight: 800, color: 'var(--stocketics-blue-600)', fontSize: '0.9rem' }}>
                    {lead.expectedRevenue > 0 ? `₹${(lead.expectedRevenue / 100000).toFixed(1)}L` : '-'}
                  </div>
                  <span className={`status-badge ${lead.status === 'Converted' ? 'status-active' : 'status-pending'}`} style={{ fontSize: '0.7rem' }}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />

      {/* Manager Create Announcement Modal */}
      {announcementModalOpen && (
        <div className="tips-modal-backdrop" onClick={() => setAnnouncementModalOpen(false)}>
          <div className="tips-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="tips-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Broadcast Company Announcement</h3>
              </div>
              <button className="tips-modal-close" onClick={() => setAnnouncementModalOpen(false)}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!annTitle || !annContent) {
                  showToast('Please provide both title and announcement content.', 'error');
                  return;
                }
                createAnnouncement({
                  title: annTitle,
                  message: annContent,
                  type: annType as AnnouncementType,
                  audience: (annAudience === 'Employees' ? 'role' : annAudience === 'TeamLeads' ? 'role' : 'all'),
                  targetRole: annAudience === 'Employees' ? 'employee' : annAudience === 'TeamLeads' ? 'team_leader' : undefined,
                  createdBy: 'Ashish Sharma (Director / Manager)',
                  createdById: currentUser.id,
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                  isActive: true
                });
                setAnnouncementModalOpen(false);
                setAnnTitle('');
                setAnnContent('');
              }}
              style={{ padding: '1.25rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Announcement Type</label>
                  <select
                    className="form-select"
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value as any)}
                  >
                    <option value="MorningGreeting">Morning Greeting</option>
                    <option value="Celebration">Celebration / Achievement</option>
                    <option value="Milestone">Sales Milestone</option>
                    <option value="Urgent">Urgent / Important Alert</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Target Audience</label>
                  <select
                    className="form-select"
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as any)}
                  >
                    <option value="All">All Staff (Company-wide)</option>
                    <option value="Employees">Employees Only</option>
                    <option value="TeamLeads">Team Leaders Only</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Announcement Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Good Morning Stocketics Team! Market Bull Run Ahead"
                  className="form-input"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type announcement message or morning motivational briefing..."
                  className="form-input"
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAnnouncementModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }}>
                  Broadcast Immediately
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Edit Service Dates Modal */}
      {editingClient && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="modal-content" style={{
            background: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
            borderRadius: 14,
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.1rem 1.25rem',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(2, 132, 199, 0.15)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Configure Advisory Service & Validity
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {editingClient.clientName} • {editingClient.mobile}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#94a3b8' : '#64748b',
                  padding: 4,
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Service Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                  Which Option / Advisory Service Required *
                </label>
                <select
                  className="form-select"
                  value={editServiceName}
                  onChange={e => setEditServiceName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {STANDARD_ADVISORY_SERVICES.map(svc => (
                    <option key={svc.id} value={svc.name}>
                      {svc.name} ({svc.segment}) — {svc.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status / Tier Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                  Subscription Type & Status
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {['Active Trial', 'Paid Converted Service', 'Renewed Client'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditStatus(status)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: `1px solid ${editStatus === status ? '#0284c7' : (isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
                        background: editStatus === status
                          ? (isDark ? 'rgba(2, 132, 199, 0.25)' : 'rgba(2, 132, 199, 0.12)')
                          : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
                        color: editStatus === status ? '#0284c7' : (isDark ? '#94a3b8' : '#475569'),
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start & End Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                    From Date (Activation)
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={editStartDate}
                    onChange={e => setEditStartDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, fontSize: '0.82rem' }}
                  />
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setEditStartDate(new Date().toISOString().slice(0, 10))}
                      style={{ background: 'none', border: 'none', fontSize: '0.68rem', color: '#0284c7', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                    >
                      Set Today
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                    To Date (Expiry)
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={editEndDate}
                    onChange={e => setEditEndDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, fontSize: '0.82rem' }}
                  />
                  {/* Presets */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {[
                      { label: '+2d Trial', days: 2 },
                      { label: '+7d', days: 7 },
                      { label: '+1m', days: 30 },
                      { label: '+3m', days: 90 }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          const base = editStartDate ? new Date(editStartDate) : new Date();
                          const future = new Date(base.getTime() + p.days * 86400000);
                          setEditEndDate(future.toISOString().slice(0, 10));
                        }}
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: '0.68rem',
                          color: isDark ? '#94a3b8' : '#475569',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service Details Summary Banner */}
              <div style={{
                background: isDark ? 'rgba(2, 132, 199, 0.1)' : 'rgba(2, 132, 199, 0.06)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                borderRadius: 8,
                padding: '0.65rem 0.8rem',
                fontSize: '0.75rem',
                color: isDark ? '#93c5fd' : '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} />
                  <span>SEBI Regulated Call Distribution: <strong>Active</strong></span>
                </div>
                <span>Total Calls Sent: <strong>{editingClient.callsDeliveredCount || 0}</strong></span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.9rem 1.25rem',
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
              background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.6rem'
            }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditingClient(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveClientService}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <Check size={14} /> Save Advisory Service & Period
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advisory Call Dispatch Modal */}
      {dispatchCall && (
        <AdvisoryCallDispatchModal
          quote={dispatchCall}
          targetClient={dispatchClient}
          onClose={() => {
            setDispatchCall(null);
            setDispatchClient(null);
          }}
        />
      )}

    </div>
  );
};
