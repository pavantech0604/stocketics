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
  ShieldCheck
} from 'lucide-react';
import { RefKPIGrid } from '../common/RefKPIGrid';
import { SalesExecutiveChart, ManagersChart } from '../common/ChartWidgets';
import { TipsModal } from '../common/TipsModal';
import { AdvisoryPipeline } from '../manager/AdvisoryPipeline';
import { ClientManagementView } from '../manager/ClientManagementView';
import { CallLogsView } from '../common/CallLogsView';
import { SMSDeliveryReportView } from './SMSDeliveryReportView';
import { ITProblemView } from '../hr/ITProblemView';
import { ManagerMailView } from '../manager/ManagerMailView';
import { ManagerSMSView } from '../manager/ManagerSMSView';

export const EmployeeDashboard: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    tasks, 
    toggleTask, 
    payslips,
    advisoryLeads,
    showToast
  } = useApp();

  const [isTipsOpen, setIsTipsOpen] = useState(false);

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

      {/* Reference Title */}
      <h1 className="page-title-ref" style={{ margin: '0 0 0.5rem 0' }}>Dashboard</h1>

      {/* 6+3 Vibrant Colorful KPI Grid (Row 1 has 6 cards; Row 2 has 3 cards aligned under cols 1-3) */}
      <RefKPIGrid 
        customRow1={employeeRow1}
        customRow2={employeeRow2}
      />

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

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prospect Profile</th>
                <th>Service Plan</th>
                <th>Expected Revenue</th>
                <th>Last Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Dialer Action</th>
              </tr>
            </thead>
            <tbody>
              {advisoryLeads.slice(0, 4).map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{lead.clientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lead.phone} • {lead.city || 'Mumbai'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{lead.serviceType}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Source: {lead.source || 'Direct Website'}</div>
                  </td>
                  <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{lead.expectedRevenue.toLocaleString()}
                  </td>
                  <td className="mono-cell" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {lead.lastContactDate}
                  </td>
                  <td>
                    <span className="delta-badge positive">{lead.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Dialing ${lead.clientName} (${lead.phone}) via PBX Cloud...`, 'info')}
                      style={{ padding: '0.3rem 0.6rem' }}
                    >
                      <PhoneCall size={13} style={{ color: 'var(--success)' }} />
                      <span>Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Tips Modal removed */}
    </div>
  );
};
