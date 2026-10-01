import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { AdvisoryPipeline } from './AdvisoryPipeline';
import { TeamScheduler } from './TeamScheduler';
import { PerformanceReviews } from './PerformanceReviews';
import { EmployeeDirectory } from '../hr/EmployeeDirectory';
import { AttendanceRoster } from '../hr/AttendanceRoster';
import { ComplianceVault } from '../hr/ComplianceVault';
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
import { AnnouncementType } from '../../types';

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
    showToast 
  } = useApp();

  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'MorningGreeting' | 'Celebration' | 'Milestone' | 'General' | 'Urgent'>('MorningGreeting');
  const [annAudience, setAnnAudience] = useState<'All' | 'Employees' | 'TeamLeads'>('All');

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

  // Exact 9 KPI values matching Reference Image 1
  const managerRow1 = [
    { id: 'today-followup', value: 1, label: "Today's Followup", colorClass: 'kpi-c-blue' },
    { id: 'active-prospect', value: 0, label: "Today's Prospect", colorClass: 'kpi-c-orange' },
    { id: 'available-leads', value: 10452, label: 'Available Leads', colorClass: 'kpi-c-teal' },
    { id: 'modified-today', value: 0, label: 'Modified Today', colorClass: 'kpi-c-purple' },
    { id: 'dispose-today', value: 0, label: 'Dispose Today', colorClass: 'kpi-c-red' },
    { id: 'today-sale', value: 0, label: "Today's Sale", colorClass: 'kpi-c-cyan' },
  ];

  const managerRow2 = [
    { 
      id: 'monthly-sale', 
      value: 1253100.00, 
      format: 'currency' as const, 
      decimals: 2, 
      label: 'Monthly Sale', 
      colorClass: 'kpi-c-navy' 
    },
    { id: 'interested-leads', value: 284, label: 'Interested leads', colorClass: 'kpi-c-violet' },
    { id: 'payment-leads', value: 1, label: 'Payment leads', colorClass: 'kpi-c-amber' },
  ];

  const handleKPIClick = (kpiId: string) => {
    setActiveTab('leads');
    showToast(`Filtering leads by ${kpiId.replace(/-/g, ' ').toUpperCase()}`, 'info');
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
                    {lead.serviceType} • Assigned to {lead.assignedToName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono-cell" style={{ fontWeight: 800, color: 'var(--stocketics-blue-600)', fontSize: '0.9rem' }}>
                    ₹{(lead.expectedRevenue / 100000).toFixed(1)}L
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

    </div>
  );
};
