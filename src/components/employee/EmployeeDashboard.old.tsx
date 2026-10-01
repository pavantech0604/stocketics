import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { PunchClockWidget } from './PunchClockWidget';
import { LeavePortal } from './LeavePortal';
import { PayslipViewer } from './PayslipViewer';
import { TasksView } from './TasksView';
import { 
  Calendar, 
  CreditCard, 
  CheckSquare, 
  TrendingUp, 
  Download, 
  Bell, 
  ArrowUpRight, 
  Award,
  Home,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  ShieldCheck,
  Building2,
  Gift,
  Sparkles
} from 'lucide-react';
import { RefKPIGrid } from '../common/RefKPIGrid';
import { MarketWorkspace } from '../market/MarketWorkspace';
import { SalesExecutiveChart, ManagersChart } from '../common/ChartWidgets';
import { TipsModal } from '../common/TipsModal';
import { AdvisoryPipeline } from '../manager/AdvisoryPipeline';
import { ClientManagementView } from '../manager/ClientManagementView';
import { CallLogsView } from '../common/CallLogsView';
import { SMSDeliveryReportView } from './SMSDeliveryReportView';
import { ITProblemView } from '../hr/ITProblemView';
import { ManagerMailView } from '../manager/ManagerMailView';
import { ManagerSMSView } from '../manager/ManagerSMSView';
import { AnnouncementBannerStrip } from '../common/EmployeeAnnouncementModal';
import { BankDetailsSMSModal } from './BankDetailsSMSModal';
import { EmployeeKYCView } from './EmployeeKYCView';
import { RACallsDashboardView } from '../common/RACallsDashboardView';
import { TicketManagementView } from '../manager/TicketManagementView';

export const EmployeeDashboard: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    tasks, 
    toggleTask, 
    payslips,
    advisoryLeads,
    cashbackRules,
    cashbackRecords,
    showToast
  } = useApp();

  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isBankSMSOpen, setIsBankSMSOpen] = useState(false);

  // Dedicated Market Workspace Routing
  if (activeTab === 'market') {
    return <MarketWorkspace />;
  }

  // Dedicated Call Logs View (Employee Scoped: Personal Call Records Only)
  if (activeTab === 'call-logs') {
    return <CallLogsView />;
  }

  // 1. Leads: New Leads, View All Leads, Confirmed Payment, Today's Follow-up, Active Prospect, Past Prospect, Unknown Calls, Add Lead, Call Logs
  if (
    activeTab === 'leads' || 
    activeTab === 'advisory' || 
    activeTab === 'available-leads' || 
    activeTab === 'today-followup' || 
    activeTab === 'new-leads' || 
    activeTab === 'view-all-leads' || 
    activeTab === 'confirmed-payment' || 
    activeTab === 'active-prospect' || 
    activeTab === 'past-prospect' ||
    activeTab === 'unknown-calls' ||
    activeTab === 'add-new-lead'
  ) {
    return <AdvisoryPipeline />;
  }

  // 2. Client: Register Clients, Active Clients, Expire Clients, Expired Clients, Hold Clients, Hold & Expire, Payment Reminder
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

  // 3. SMS Delivery Report
  if (activeTab === 'sms-delivery-report') {
    return <SMSDeliveryReportView />;
  }

  // 4. IT Problem
  if (activeTab === 'it-problem') {
    return <ITProblemView />;
  }

  // 5. Mail & SMS Broadcast
  if (activeTab === 'mail') {
    return <ManagerMailView />;
  }

  if (activeTab === 'sms') {
    return <ManagerSMSView />;
  }

  // 4. Leave: New Entry, List
  if (
    activeTab === 'leave' || 
    activeTab === 'new-entry' || 
    activeTab === 'leave-list' || 
    activeTab === 'apply-leave' ||
    activeTab === 'leave-portal'
  ) {
    return <LeavePortal />;
  }

  // 5. Additional Employee Utilities
  if (activeTab === 'payslips') return <PayslipViewer />;
  if (activeTab === 'tasks') return <TasksView />;
  if (activeTab === 'kyc' || activeTab === 'kyc-upload' || activeTab === 'kyc-documents' || activeTab === 'kyc-verification') {
    return <EmployeeKYCView />;
  }
  if (activeTab === 'ra-calls' || activeTab === 'advisory-calls' || activeTab === 'trading-calls') {
    return <RACallsDashboardView />;
  }
  if (activeTab === 'ticket' || activeTab === 'tickets') {
    return <TicketManagementView />;
  }

  const latestSlip = payslips[0];
  const pendingTasks = tasks.filter(t => !t.completed);

  // Dynamic Employee KPIs strictly matching Image 1
  const employeeRow1 = [
    { id: 'followup', value: 0, label: "Today's Followup", colorClass: 'kpi-c-blue' },
    { id: 'prospect', value: 0, label: "Today's Prospect", colorClass: 'kpi-c-orange' },
    { id: 'available', value: 0, label: 'Available Leads', colorClass: 'kpi-c-teal' },
    { id: 'modified', value: 0, label: 'Modified Today', colorClass: 'kpi-c-purple' },
    { id: 'dispose', value: 0, label: 'Dispose Today', colorClass: 'kpi-c-red' },
    { id: 'today-sale', value: 0, label: "Today's Sale", colorClass: 'kpi-c-cyan' },
  ];

  const employeeRow2 = [
    { 
      id: 'monthly-sale', 
      value: 25000.00, 
      format: 'currency' as const, 
      decimals: 2, 
      label: 'Monthly Sale', 
      colorClass: 'kpi-c-navy' 
    },
    { id: 'interested', value: 0, label: 'Interested leads', colorClass: 'kpi-c-violet' },
    { id: 'payment', value: 0, label: 'Payment leads', colorClass: 'kpi-c-amber' },
  ];

  // Sales Incentive & Cashback calculations
  const employeeRevenue = advisoryLeads
    .filter(l => (l.assignedToId === currentUser.id || l.assignedToName?.toLowerCase() === currentUser.name.toLowerCase()) && l.status === 'Converted')
    .reduce((sum, l) => sum + (l.expectedRevenue || 0), 0) || 120000;

  const currentRule = cashbackRules.filter(r => employeeRevenue >= (r.salesLimitThreshold ?? r.targetSalesAmount)).pop();
  const nextRule = cashbackRules.find(r => (r.salesLimitThreshold ?? r.targetSalesAmount) > employeeRevenue) || cashbackRules[cashbackRules.length - 1];
  const nextThreshold = nextRule ? (nextRule.salesLimitThreshold ?? nextRule.targetSalesAmount) : 200000;
  const nextReward = nextRule ? (nextRule.cashbackAmount ?? nextRule.cashbackValue) : 5000;
  const prevLimit = currentRule ? (currentRule.salesLimitThreshold ?? currentRule.targetSalesAmount) : 0;
  const cashbackProgressPct = nextRule ? Math.min(100, Math.max(0, Math.round(((employeeRevenue - prevLimit) / (nextThreshold - prevLimit)) * 100))) : 100;
  const myCashbacks = cashbackRecords.filter(c => c.employeeId === currentUser.id || c.employeeName.toLowerCase() === currentUser.name.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip (Matching Reference Image 1) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Home</span>
          </span>
        </div>
      </div>

      <div className="dashboard-full-container">
        {/* Company Announcements & Greetings Banner */}
        <AnnouncementBannerStrip />

        {/* Quick Enterprise Workflow Actions Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button
            onClick={() => setIsBankSMSOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
            }}
          >
            <Building2 size={14} /> Send Bank Details SMS
          </button>

          <button
            onClick={() => setActiveTab('kyc-upload')}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2,132,199,0.3)'
            }}
          >
            <ShieldCheck size={14} /> Upload Client KYC
          </button>

          <button
            onClick={() => setActiveTab('ra-calls')}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(249,115,22,0.3)'
            }}
          >
            <PhoneCall size={14} /> Live RA Advisory Board
          </button>
        </div>

        {/* Reference Title */}
        <h1 className="page-title-ref" style={{ margin: '0 0 0.5rem 0' }}>Dashboard</h1>

        {/* 6+3 Vibrant Colorful KPI Grid (Row 1 has 6 cards; Row 2 has 3 cards aligned under cols 1-3) */}
        <RefKPIGrid 
          customRow1={employeeRow1}
          customRow2={employeeRow2}
        />

        {/* Sales Incentive & Cashback Progress Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.06), rgba(245,158,11,0.03))', border: '1px solid rgba(234,179,8,0.25)', marginBottom: '1.25rem' }}>
          <div className="card-header" style={{ marginBottom: '0.6rem' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gift size={18} style={{ color: '#eab308' }} />
              <span>Sales Target Cashback & Incentive Progress</span>
              <span style={{ fontSize: '0.72rem', background: 'rgba(234,179,8,0.18)', color: '#ca8a04', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                MONTHLY TARGET BONUS
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Current MTD: <strong style={{ color: '#10b981' }}>₹{employeeRevenue.toLocaleString()}</strong>
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              <span>Target to Unlock: <strong>₹{nextThreshold.toLocaleString()}</strong></span>
              <span>Reward: <strong style={{ color: '#eab308' }}>₹{nextReward.toLocaleString()} Instant Cashback</strong></span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 8, borderRadius: 4, background: 'var(--border-subtle)', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${cashbackProgressPct}%`,
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <span>{cashbackProgressPct}% towards next reward slab</span>
              <span>Need ₹{(Math.max(0, nextThreshold - employeeRevenue)).toLocaleString()} more</span>
            </div>
          </div>

          {myCashbacks.length > 0 && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>My Disbursed Incentives:</span>
              {myCashbacks.map(cb => (
                <span key={cb.id} style={{ background: cb.status === 'Paid' ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.15)', color: cb.status === 'Paid' ? '#10b981' : '#38bdf8', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                  ₹{cb.cashbackEarned.toLocaleString()} ({cb.status})
                </span>
              ))}
            </div>
          )}
        </div>

      {/* Dual Performance Charts: SALES EXECUTIVE & MANAGERS (Side-by-Side Matching Image 1) */}
      <div className="charts-split-grid">
        <SalesExecutiveChart />
        <ManagersChart />
      </div>

      {/* Personal Operational Workdesk */}
      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top 3 Column Action Grid */}
        <div className="kpi-grid-3">
          {/* Widget 1: Punch Clock */}
          <PunchClockWidget />

          {/* Widget 2: Leave Quotas */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                <div className="card-title">
                  <Calendar size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                  <span>My Leave Quotas</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('new-entry')}>
                  Apply
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Paid Leave (PTO)</span>
                  <span className="mono-cell" style={{ fontWeight: 800, color: 'var(--stocketics-blue-600)' }}>
                    {currentUser.leaveBalance.paid} Days Left
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sick / Medical Leave</span>
                  <span className="mono-cell" style={{ fontWeight: 800, color: 'var(--success)' }}>
                    {currentUser.leaveBalance.sick} Days Left
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Compensatory Off</span>
                  <span className="mono-cell" style={{ fontWeight: 800, color: 'var(--warning)' }}>
                    {currentUser.leaveBalance.comp} Days Available
                  </span>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-outline btn-sm" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setActiveTab('leave')}
            >
              Open Leave Portal & History
            </button>
          </div>

          {/* Widget 3: Compensation & Payslip Snapshot */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                <div className="card-title">
                  <CreditCard size={18} style={{ color: 'var(--success)' }} />
                  <span>Monthly Compensation</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('payslips')}>
                  All Slips
                </button>
              </div>

              {latestSlip ? (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Net Payout • {latestSlip.month}
                  </div>
                  <div className="mono-cell" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                    ₹{latestSlip.netPay.toLocaleString('en-IN')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.78rem', fontWeight: 600 }}>
                    <CheckCircle2 size={14} />
                    <span>Salary Disbursed to Bank</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No payslips generated yet</div>
              )}
            </div>

            <button 
              className="btn btn-outline btn-sm" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setActiveTab('payslips')}
            >
              Download Latest Payslip (PDF)
            </button>
          </div>
        </div>

        {/* Daily Tasks / Call Schedule */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <CheckSquare size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Today's Action Items ({pendingTasks.length})</span>
              </div>
              <div className="card-subtitle">Calls, client onboarding, and risk profiling tasks</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('tasks')}>
              Manage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {tasks.slice(0, 4).map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.65rem 0.85rem', 
                  background: 'var(--bg-surface-alt)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => {}} 
                  style={{ accentColor: 'var(--stocketics-blue-500)', width: 16, height: 16 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Due: {task.dueDate} • Priority: {task.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Assigned Prospects Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <UserCheck size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
              <span>My Assigned Advisory Leads & Prospects</span>
            </div>
            <div className="card-subtitle">Active prospects assigned for advisory conversion</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('call-logs')}>
              <PhoneCall size={14} style={{ color: '#2563eb' }} />
              <span>My Call Logs</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('view-all-leads')}>
              <span>Pipeline ({advisoryLeads.length})</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div style={{ width: '100%', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', tableLayout: 'fixed', minWidth: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '26%', padding: '0.65rem 0.6rem' }}>Prospect Profile</th>
                <th style={{ width: '22%', padding: '0.65rem 0.6rem' }}>Service Plan</th>
                <th style={{ width: '16%', padding: '0.65rem 0.6rem' }}>Expected Revenue</th>
                <th style={{ width: '14%', padding: '0.65rem 0.6rem' }}>Last Contact</th>
                <th style={{ width: '10%', padding: '0.65rem 0.6rem' }}>Status</th>
                <th style={{ width: '12%', padding: '0.65rem 0.6rem', textAlign: 'right' }}>Dialer Action</th>
              </tr>
            </thead>
            <tbody>
              {advisoryLeads.slice(0, 4).map(lead => (
                <tr key={lead.id}>
                  <td style={{ padding: '0.65rem 0.6rem', overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.clientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.phone} • {lead.city || 'Mumbai'}</div>
                  </td>
                  <td style={{ padding: '0.65rem 0.6rem', overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.serviceType}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Source: {lead.source || 'Direct Website'}</div>
                  </td>
                  <td className="mono-cell" style={{ padding: '0.65rem 0.6rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    ₹{lead.expectedRevenue.toLocaleString()}
                  </td>
                  <td className="mono-cell" style={{ padding: '0.65rem 0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {lead.lastContactDate}
                  </td>
                  <td style={{ padding: '0.65rem 0.6rem' }}>
                    <span className="delta-badge positive" style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>{lead.status}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Dialing ${lead.clientName} (${lead.phone}) via PBX Cloud...`, 'info')}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.74rem' }}
                    >
                      <PhoneCall size={12} style={{ color: 'var(--success)' }} />
                      <span>Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Direct Bank Details SMS Dispatch Modal */}
    <BankDetailsSMSModal 
      isOpen={isBankSMSOpen} 
      onClose={() => setIsBankSMSOpen(false)} 
    />
  </div>
);
};
