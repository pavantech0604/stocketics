import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  ArrowUpRight, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Home,
  Lightbulb,
  FileSpreadsheet
} from 'lucide-react';
import { EmployeeDirectory } from './EmployeeDirectory';
import { AttendanceRoster } from './AttendanceRoster';
import { LeaveApprovalsHR } from './LeaveApprovalsHR';
import { PayrollProcessor } from './PayrollProcessor';
import { ComplianceVault } from './ComplianceVault';
import { AdvisoryPipeline } from '../manager/AdvisoryPipeline';
import { LeavePortal } from '../employee/LeavePortal';
import { RefKPIGrid } from '../common/RefKPIGrid';
import { MarketWorkspace } from '../market/MarketWorkspace';
import { SalesExecutiveChart, ManagersChart } from '../common/ChartWidgets';
import { TipsModal } from '../common/TipsModal';
import { ApproveProspectView } from '../manager/ApproveProspectView';
import { ClientManagementView } from '../manager/ClientManagementView';
import { TicketManagementView } from '../manager/TicketManagementView';
import { LeaveManagementView } from '../manager/LeaveManagementView';
import { TargetManagementView } from '../manager/TargetManagementView';
import { CallLogsView } from '../common/CallLogsView';

// Dedicated HR Module Views matching all reference screenshots
import { HRRecruitmentView } from './HRRecruitmentView';
import { HRAssetsView } from './HRAssetsView';
import { HRPayrollView } from './HRPayrollView';
import { HRAttendanceView } from './HRAttendanceView';
import { HRExpensesView } from './HRExpensesView';
import { HRReportView } from './HRReportView';
import { ITProblemView } from './ITProblemView';
import { HRMessengerView } from './HRMessengerView';
import { HRGreetingMessengerView } from './HRGreetingMessengerView';
import { HRTipArchiveView } from './HRTipArchiveView';
import { ManagerMailView } from '../manager/ManagerMailView';
import { ManagerSMSView } from '../manager/ManagerSMSView';
import { HRTeamsManagementView } from './HRTeamsManagementView';
import { RACallsDashboardView } from '../common/RACallsDashboardView';

export const HRDashboard: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    employees, 
    attendanceRecords, 
    leaveRequests, 
    updateLeaveStatus 
  } = useApp();

  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<string | null>(null);

  // Market Workspace Route
  if (activeTab === 'market') {
    return <MarketWorkspace />;
  }

  // Live Advisory Calls Route
  if (activeTab === 'ra-calls' || activeTab === 'advisory-calls' || activeTab === 'trading-calls') {
    return <RACallsDashboardView />;
  }

  // 0. Configuration & Compliance Vault
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

  // Teams & Squads Architecture
  if (
    activeTab === 'teams' ||
    activeTab === 'create-team' ||
    activeTab === 'all-teams' ||
    activeTab === 'assign-members'
  ) {
    return <HRTeamsManagementView />;
  }

  // 1. IT Problem View (Matching Reference Image 3)
  if (activeTab === 'it-problem') {
    return <ITProblemView />;
  }

  // 2. Messenger View (Matching Reference Image 4)
  if (activeTab === 'messenger') {
    return <HRMessengerView />;
  }

  // 3. Greeting Messenger (Matching Reference Image 5)
  if (activeTab === 'greeting') {
    return <HRGreetingMessengerView />;
  }

  // 4. Tip Archive Suite (Matching Reference Images 6, 7 & 8)
  if (
    activeTab === 'tip-archive' ||
    activeTab === 'pre-tip-archive' ||
    activeTab === 'greeting-tip-archive' ||
    activeTab === 'greenting-tip-archive' ||
    activeTab === 'sent-tips'
  ) {
    return <HRTipArchiveView defaultMode="sent-tips" />;
  }

  if (activeTab === 'open-call') {
    return <HRTipArchiveView defaultMode="open-call" />;
  }

  if (activeTab === 'closed-call') {
    return <HRTipArchiveView defaultMode="closed-call" />;
  }

  // 5. Mail & SMS Broadcast
  if (activeTab === 'mail') {
    return <ManagerMailView />;
  }

  if (activeTab === 'sms') {
    return <ManagerSMSView />;
  }

  // 2. Recruitment Pipeline: New Entry, Scheduled, Offered, Shortlisted, Hold, Reject (Screenshot 2)
  if (
    activeTab === 'recruitment' ||
    activeTab === 'recruitment-new' ||
    activeTab === 'recruitment-scheduled' ||
    activeTab === 'recruitment-offered' ||
    activeTab === 'recruitment-shortlisted' ||
    activeTab === 'recruitment-hold' ||
    activeTab === 'recruitment-reject'
  ) {
    return <HRRecruitmentView />;
  }

  // 3. Assets: Add Product, Assets list, Allot Product, Alloted list (Screenshot 2)
  if (
    activeTab === 'assets' ||
    activeTab === 'assets-add-product' ||
    activeTab === 'assets-list' ||
    activeTab === 'assets-allot-product' ||
    activeTab === 'assets-alloted-list'
  ) {
    return <HRAssetsView />;
  }

  // 4. Compensation & Payroll: Allowance, Deduction, Salary (Screenshots 2 & 3)
  if (
    activeTab === 'allowance' ||
    activeTab === 'add-allowance' ||
    activeTab === 'allowance-list' ||
    activeTab === 'deduction' ||
    activeTab === 'add-deduction' ||
    activeTab === 'deduction-list' ||
    activeTab === 'salary' ||
    activeTab === 'create-salary' ||
    activeTab === 'salary-list' ||
    activeTab === 'payroll'
  ) {
    return <HRPayrollView />;
  }

  // 5. Attendance: Upload Attendance, Attendance list (Screenshot 3)
  if (
    activeTab === 'attendance' ||
    activeTab === 'upload-attendance' ||
    activeTab === 'attendance-upload' ||
    activeTab === 'attendance-list'
  ) {
    return <HRAttendanceView />;
  }

  // 6. Expenses: Add Expenses, Expenses list, Add Expenses Head, Expenses Head list (Screenshot 3)
  if (
    activeTab === 'expenses' ||
    activeTab === 'add-expenses' ||
    activeTab === 'expenses-add' ||
    activeTab === 'expenses-list' ||
    activeTab === 'add-expenses-head' ||
    activeTab === 'expenses-add-head' ||
    activeTab === 'expenses-head-list'
  ) {
    return <HRExpensesView />;
  }

  // 7. Leave Management: New Entry, List, Approved, Rejected (Screenshot 2)
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

  // Dedicated Call Logs View
  if (activeTab === 'call-logs') {
    return <CallLogsView />;
  }

  // 8. Leads Pipeline: 8 Sub-Options (Screenshot 1)
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
    activeTab === 'unknown-calls'
  ) {
    return <AdvisoryPipeline />;
  }

  // 9. Approve Pipeline
  if (
    activeTab === 'approve' || 
    activeTab === 'approve-prospect'
  ) {
    return <ApproveProspectView />;
  }

  // 10. Client Management
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

  // 11. Support Tickets
  if (
    activeTab === 'ticket' || 
    activeTab === 'tickets' || 
    activeTab === 'tickets-category' ||
    activeTab === 'add-ticket'
  ) {
    return <TicketManagementView />;
  }

  // Target Management
  if (
    activeTab === 'target' ||
    activeTab === 'add-target' ||
    activeTab === 'all-target'
  ) {
    return <TargetManagementView />;
  }

  // 12. Employee Directory
  if (activeTab === 'employees') return <EmployeeDirectory />;

  // 13. Reports & Analytics (Matching Reference Image 2)
  if (
    activeTab === 'report' || 
    activeTab === 'sales-report' || 
    activeTab === 'manager-report' || 
    activeTab === 'lead-report' || 
    activeTab === 'dcr-report' || 
    activeTab === 'collection-report' ||
    activeTab === 'account-report' ||
    activeTab === 'cr-compliance' ||
    activeTab === 'sales-eod-report' ||
    activeTab === 'alloted-lead-report' ||
    activeTab === 'employee-report' ||
    activeTab === 'call-log-report' ||
    activeTab === 'source-report'
  ) {
    return <HRReportView />;
  }

  // 14. Configuration & Compliance Vault
  if (
    activeTab === 'configuration' || 
    activeTab === 'compliance' || 
    activeTab === 'user-management' || 
    activeTab === 'role-permissions' || 
    activeTab === 'department-settings' || 
    activeTab === 'service-master' || 
    activeTab === 'compliance-vault'
  ) {
    return <ComplianceVault />;
  }

  // 15. Targets
  if (
    activeTab === 'target' || 
    activeTab === 'add-target' || 
    activeTab === 'all-target'
  ) {
    return <TargetManagementView />;
  }

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');

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

          {/* 6+2 Vibrant Colorful KPI Grid (Direct Match to Reference Image 1) */}
          <RefKPIGrid 
        customRow1={[
          { id: 'followup', value: 0, label: "Today's Followup", colorClass: 'kpi-c-blue' },
          { id: 'prospect', value: 0, label: "Today's Prospect", colorClass: 'kpi-c-orange' },
          { id: 'available', value: 0, label: 'Available Leads', colorClass: 'kpi-c-teal' },
          { id: 'modified', value: 0, label: 'Modified Today', colorClass: 'kpi-c-purple' },
          { id: 'dispose', value: 0, label: 'Dispose Today', colorClass: 'kpi-c-red' },
          { id: 'monthly-sale', value: 0, label: 'Monthly Sale', colorClass: 'kpi-c-navy' },
        ]}
        customRow2={[
          { id: 'interested', value: 0, label: 'Interested leads', colorClass: 'kpi-c-violet' },
          { id: 'payment', value: 0, label: 'Payment leads', colorClass: 'kpi-c-amber' },
        ]}
        onCardClick={(cardId) => {
          setSelectedKpiFilter(prev => prev === cardId ? null : cardId);
        }} 
      />

      {/* Two Side-by-Side Charts: SALES EXECUTIVE & MANAGERS (Matching Reference Screenshot) */}
      <div className="charts-split-grid">
        <SalesExecutiveChart />
        <ManagersChart />
      </div>

      {/* Quick Action Navigation Strip for HR Suite */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--stocketics-blue-500)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Stocketics Enterprise Administration Suite
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Direct access to recruitment, assets, allowances, deductions, salaries, biometric punches, and advisory compliance archives.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('recruitment')}>
            <Users size={14} />
            <span>Recruitment</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('attendance')}>
            <Clock size={14} />
            <span>Attendance</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('salary')}>
            <CreditCard size={14} />
            <span>Salary & Payroll</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('assets')}>
            <FileSpreadsheet size={14} />
            <span>Asset Inventory</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('expenses')}>
            <TrendingUp size={14} />
            <span>Expenses</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('tip-archive')}>
            <ShieldCheck size={14} />
            <span>Tip Archives</span>
          </button>
        </div>
      </div>

      {/* Operational Two-Column Split: Workforce Roster & Pending Approvals */}
      <div className="dashboard-split-grid">
        {/* Left Column: Recent Staff Directory */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Users size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Active Personnel & Team Leads</span>
              </div>
              <div className="card-subtitle">
                {selectedKpiFilter ? `Filtered by ${selectedKpiFilter}` : 'Cross-departmental overview'}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('employees')}>
              <span>Directory ({employees.length})</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ width: '100%', overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%', tableLayout: 'auto', minWidth: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left' }}>Personnel</th>
                  <th style={{ width: '95px', padding: '0.65rem 0.35rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Department</th>
                  <th style={{ width: '75px', padding: '0.65rem 0.35rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ width: '100px', padding: '0.65rem 0.5rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map(emp => {
                  const deptSlug = emp.department ? emp.department.toLowerCase().replace(/\s+/g, '-') : 'ops';
                  const statusSlug = emp.status ? emp.status.toLowerCase().replace(/\s+/g, '-') : 'active';
                  return (
                    <tr key={emp.id}>
                      <td style={{ padding: '0.65rem 0.5rem', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={emp.avatar} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={emp.email}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.35rem', textAlign: 'center' }}>
                        <span className={`dept-pill dept-${deptSlug}`}>
                          {emp.department}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.35rem', textAlign: 'center' }}>
                        <span className={`status-badge status-${statusSlug}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="mono-cell" style={{ padding: '0.65rem 0.5rem', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                        {emp.joinDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Pending Action Items */}
        <div className="card" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                <span>Pending Approvals ({pendingLeaves.length})</span>
              </div>
              <div className="card-subtitle">Actionable leave & quota requests</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('leave-list')}>
              <span>View All</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {pendingLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 0.5rem', display: 'block' }} />
                <div style={{ fontWeight: 600 }}>All Clear!</div>
                <div style={{ fontSize: '0.8rem' }}>No pending approval queues</div>
              </div>
            ) : (
              pendingLeaves.slice(0, 3).map(req => {
                const applicant = employees.find(e => e.id === req.employeeId);
                return (
                  <div key={req.id} style={{ padding: '0.85rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        {req.employeeName}
                      </div>
                      <span className="status-badge status-pending">{req.type}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      {req.startDate} to {req.endDate} ({req.daysCount} days) • {applicant?.department}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-success btn-sm" 
                        style={{ flex: 1 }}
                        onClick={() => updateLeaveStatus(req.id, 'Approved', 'Approved by HR Administrator')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ flex: 1 }}
                        onClick={() => updateLeaveStatus(req.id, 'Declined', 'Declined by HR Administrator')}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Reference Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
