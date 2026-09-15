import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import {
  Home,
  Users,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Calendar,
  PhoneCall,
  Award,
  AlertTriangle,
  Clock,
  Activity,
  Target,
  Star,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { RefKPIGrid } from '../common/RefKPIGrid';
import { MarketWorkspace } from '../market/MarketWorkspace';
import { SalesExecutiveChart, ManagersChart } from '../common/ChartWidgets';
import { TipsModal } from '../common/TipsModal';
import { AdvisoryPipeline } from '../manager/AdvisoryPipeline';
import { ClientManagementView } from '../manager/ClientManagementView';
import { CallLogsView } from '../common/CallLogsView';
import { SMSDeliveryReportView } from '../employee/SMSDeliveryReportView';
import { ITProblemView } from '../hr/ITProblemView';
import { LeavePortal } from '../employee/LeavePortal';
import { TeamLeaderboardView } from './TeamLeaderboardView';
import { CoachingHubView } from './CoachingHubView';
import { LeadReassignmentView } from './LeadReassignmentView';
import { TeamSMSBroadcastView } from './TeamSMSBroadcastView';
import { DailyStandupView } from './DailyStandupView';
import { TeamTargetsView } from './TeamTargetsView';
import { RACallsDashboardView } from '../common/RACallsDashboardView';
import { EmployeeKYCView } from '../employee/EmployeeKYCView';
import { TicketManagementView } from '../manager/TicketManagementView';
import { ManagerMailView } from '../manager/ManagerMailView';

export const TeamLeaderDashboard: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    employees,
    advisoryLeads,
    callLogs,
    teamMembers,
    teamTargets,
    coachingNotes,
    dailyStandups,
    getTeamMemberIds,
    showToast
  } = useApp();

  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const teamMemberIds = getTeamMemberIds(currentUser.id);

  // Drilldown states for team lead leads filtering
  const [filterEmpId, setFilterEmpId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [drilldownSearch, setDrilldownSearch] = useState<string>('');

  // ─── Route Handler ─────────────────────────────────────────────────
  if (activeTab === 'market') return <MarketWorkspace />;
  if (activeTab === 'call-logs') return <CallLogsView />;
  if (activeTab === 'ra-calls') return <RACallsDashboardView />;
  if (activeTab === 'kyc-review' || activeTab === 'kyc-documents') return <EmployeeKYCView />;

  if (
    activeTab === 'leads' || activeTab === 'new-leads' || activeTab === 'view-all-leads' ||
    activeTab === 'confirmed-payment' || activeTab === 'today-followup' ||
    activeTab === 'active-prospect' || activeTab === 'past-prospect' || activeTab === 'unknown-calls'
  ) return <AdvisoryPipeline />;

  if (
    activeTab === 'client' || activeTab === 'register-clients' || activeTab === 'active-clients' ||
    activeTab === 'expire-clients' || activeTab === 'expired-clients' ||
    activeTab === 'hold-clients' || activeTab === 'hold-expire' || activeTab === 'payment-reminder'
  ) return <ClientManagementView />;

  if (activeTab === 'lead-reassignment') return <LeadReassignmentView />;
  if (activeTab === 'team-leaderboard') return <TeamLeaderboardView />;
  if (activeTab === 'coaching' || activeTab === 'coaching-add' || activeTab === 'coaching-history') return <CoachingHubView />;
  if (activeTab === 'daily-standup') return <DailyStandupView />;
  if (activeTab === 'team-targets') return <TeamTargetsView />;
  if (activeTab === 'team-sms' || activeTab === 'team-sms-send' || activeTab === 'team-sms-delivery' || activeTab === 'team-sms-broadcast-history') return <TeamSMSBroadcastView />;
  if (activeTab === 'sms-delivery-report') return <SMSDeliveryReportView />;
  if (activeTab === 'it-problem') return <ITProblemView />;
  if (activeTab === 'leave' || activeTab === 'new-entry' || activeTab === 'leave-list') return <LeavePortal />;
  if (activeTab === 'ticket' || activeTab === 'tickets') return <TicketManagementView />;
  if (activeTab === 'mail') return <ManagerMailView />;

  // ─── Dashboard Data ────────────────────────────────────────────────
  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));
  const teamLeads = advisoryLeads.filter(l => teamMemberIds.includes(l.assignedToId));
  const teamCalls = callLogs.filter(c => teamMemberIds.includes(c.employeeId));
  const today = new Date().toISOString().split('T')[0];
  const todayCalls = teamCalls.filter(c => c.timestamp.includes(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')) || c.timestamp.includes(today));

  const convertedLeads = teamLeads.filter(l => l.status === 'Converted');
  const totalRevenue = convertedLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);
  const followupsToday = teamLeads.filter(l => l.lastContactDate && l.lastContactDate.includes(today)).length;

  // KPI Data
  const kpiRow1 = [
    { id: 'team-members', value: teamEmployees.length, label: 'Team Members', colorClass: 'kpi-c-amber' as const },
    { id: 'active-leads', value: teamLeads.length, label: 'Active Leads', colorClass: 'kpi-c-blue' as const },
    { id: 'converted', value: convertedLeads.length, label: 'Converted (MTD)', colorClass: 'kpi-c-teal' as const },
    { id: 'revenue', value: totalRevenue, format: 'currency' as const, decimals: 0, label: 'Team Revenue (MTD)', colorClass: 'kpi-c-purple' as const },
    { id: 'followups', value: followupsToday, label: "Today's Follow-ups", colorClass: 'kpi-c-orange' as const },
    { id: 'calls-today', value: todayCalls.length, label: 'Calls Today', colorClass: 'kpi-c-cyan' as const },
  ];

  // Leaderboard data (inline preview)
  const leaderboardData = teamEmployees.map(emp => {
    const empLeads = advisoryLeads.filter(l => l.assignedToId === emp.id);
    const empConverted = empLeads.filter(l => l.status === 'Converted').length;
    const empRevenue = empLeads.filter(l => l.status === 'Converted').reduce((s, l) => s + l.expectedRevenue, 0);
    const empCalls = callLogs.filter(c => c.employeeId === emp.id).length;
    const score = empConverted * 30 + (empRevenue / 10000) + empCalls * 2;
    return { ...emp, converted: empConverted, revenue: empRevenue, calls: empCalls, score: Math.round(score), activeLeads: empLeads.length };
  }).sort((a, b) => b.score - a.score);

  const rankEmojis = ['🥇', '🥈', '🥉'];

  // Attention items
  const idleEmployees = teamEmployees.filter(emp => {
    const hasCalls = callLogs.some(c => c.employeeId === emp.id);
    return !hasCalls;
  });

  const todayStandups = dailyStandups.filter(s => s.date === today);
  const missingStandups = teamEmployees.filter(emp => !todayStandups.some(s => s.employeeId === emp.id));

  const behindTargets = teamTargets.filter(t => {
    const pct = t.targetValue > 0 ? (t.actualValue / t.targetValue) * 100 : 0;
    return pct < 50 && teamMemberIds.includes(t.employeeId);
  });

  // Activity Feed (simulated from call logs)
  const recentActivity = teamCalls.slice(0, 6).map(c => ({
    id: c.id,
    text: `${c.employeeName} called ${c.clientName}`,
    detail: c.disposition,
    time: c.timestamp.split(' ').slice(1).join(' '),
    sentiment: c.sentiment,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Team Leader Dashboard</span>
          </span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setIsTipsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Target size={14} /> Tips
        </button>
      </div>

      <h1 className="page-title-ref" style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Award size={24} style={{ color: '#f59e0b' }} />
        Team Command Center
      </h1>

      {/* KPI Grid */}
      <RefKPIGrid
        customRow1={kpiRow1}
        customRow2={[]}
        onCardClick={(id: string) => {
          if (id === 'active-leads') setActiveTab('leads');
          else if (id === 'calls-today') setActiveTab('call-logs');
          else if (id === 'team-members') setActiveTab('team-leaderboard');
          else if (id === 'followups') setActiveTab('today-followup');
        }}
      />

      {/* Main Content: 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Team Leaderboard Preview */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} style={{ color: '#f59e0b' }} />
                <span>Team Leaderboard</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('team-leaderboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Full View <ChevronRight size={13} />
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase' }}>Rank</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase' }}>Employee</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase' }}>Leads</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase' }}>Converted</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((emp, idx) => (
                  <tr key={emp.id} style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: idx === 0 ? 'rgba(245, 158, 11, 0.06)' : 'transparent',
                    transition: 'background 0.2s',
                  }}>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, fontSize: '1rem' }}>
                      {idx < 3 ? rankEmojis[idx] : <span style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={emp.avatar} alt={emp.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: idx === 0 ? '2px solid #f59e0b' : '2px solid var(--border-subtle)' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.title}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>{emp.activeLeads}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: emp.converted > 0 ? '#10b981' : 'var(--text-muted)' }}>{emp.converted}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.82rem',
                        background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : idx === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' : 'var(--bg-surface-alt)',
                        color: idx < 3 ? '#fff' : 'var(--text-primary)',
                      }}>
                        {idx === 0 && <Star size={12} />}
                        {emp.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live Activity Monitor */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: '#06b6d4' }} />
                <span>Live Activity Monitor</span>
              </div>
            </div>
            {recentActivity.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentActivity.map((act, idx) => (
                  <div key={act.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                    background: idx === 0 ? 'rgba(6, 182, 212, 0.06)' : 'var(--bg-surface-alt)',
                    borderLeft: `3px solid ${act.sentiment === 'Positive' ? '#10b981' : act.sentiment === 'Challenging' ? '#ef4444' : '#64748b'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: '0.35rem', flexShrink: 0,
                      background: idx === 0 ? '#06b6d4' : '#94a3b8',
                      boxShadow: idx === 0 ? '0 0 6px rgba(6, 182, 212, 0.6)' : 'none',
                      animation: idx === 0 ? 'pulse 2s infinite' : 'none',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{act.text}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{act.detail}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{act.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No recent activity. Team calls and actions will appear here in real-time.
              </div>
            )}
          </div>

          {/* Team Performance Summary & Efficiency Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))' }}>
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} style={{ color: '#3b82f6' }} />
                <span>Overall Team Performance Summary</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time team analytics</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'var(--bg-surface-alt)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Conversion Rate</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                  {teamLeads.length > 0 ? ((convertedLeads.length / teamLeads.length) * 100).toFixed(1) : '0'}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-alt)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avg Deal Size</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.2rem' }}>
                  ₹{convertedLeads.length > 0 ? Math.round(totalRevenue / convertedLeads.length).toLocaleString() : '0'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-alt)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Assigned</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                  {teamLeads.length} Leads
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-alt)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Calls Logged</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
                  {teamCalls.length}
                </div>
              </div>
            </div>
          </div>

          {/* Team Assigned Leads Drilldown & Filter Roster */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} style={{ color: '#f59e0b' }} />
                <span>Team Leads Drilldown ({teamLeads.length} Total Assigned)</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('leads')}>
                View In Pipeline →
              </button>
            </div>

            {/* Filter controls row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {/* Employee Filter */}
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Team Member</label>
                <select
                  value={filterEmpId}
                  onChange={(e) => setFilterEmpId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Team Members ({teamEmployees.length})</option>
                  {teamEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Lead Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Lead Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Sources</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Website Inbound">Website Inbound</option>
                  <option value="Referral">Referral</option>
                  <option value="Organic">Organic</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Search Client</label>
                <input
                  type="text"
                  placeholder="Client name or phone..."
                  value={drilldownSearch}
                  onChange={(e) => setDrilldownSearch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Filtered Table */}
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-alt)' }}>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Client Name</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned To</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Source</th>
                    <th style={{ padding: '0.45rem 0.6rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Exp. Value</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLeads
                    .filter(l => {
                      if (filterEmpId !== 'all' && l.assignedToId !== filterEmpId) return false;
                      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
                      if (filterSource !== 'all' && l.source !== filterSource) return false;
                      if (drilldownSearch && !l.clientName.toLowerCase().includes(drilldownSearch.toLowerCase()) && !l.phone.includes(drilldownSearch)) return false;
                      return true;
                    })
                    .slice(0, 12)
                    .map(lead => (
                      <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.5rem 0.6rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.clientName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lead.phone}</div>
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', color: 'var(--text-secondary)' }}>
                          {lead.assignedToName || lead.assignedToId}
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '10px',
                            background: lead.status === 'Converted' ? 'rgba(16, 185, 129, 0.15)' : lead.status === 'Trial Active' ? 'rgba(56, 189, 248, 0.15)' : lead.status === 'In Contact' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                            color: lead.status === 'Converted' ? '#10b981' : lead.status === 'Trial Active' ? '#38bdf8' : lead.status === 'In Contact' ? '#f59e0b' : 'var(--text-muted)',
                          }}>
                            {lead.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {lead.source}
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 600, color: '#8b5cf6' }}>
                          ₹{lead.expectedRevenue?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-split-grid">
            <SalesExecutiveChart />
            <ManagersChart />
          </div>
        </div>

        {/* Right Column: Attention Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Actions */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.05))' }}>
            <div className="card-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} style={{ color: '#f59e0b' }} />
              <span>Quick Actions</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('lead-reassignment')} style={{ fontSize: '0.76rem', padding: '0.5rem' }}>
                🔄 Reassign Leads
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('coaching-add')} style={{ fontSize: '0.76rem', padding: '0.5rem' }}>
                🎯 Add Coaching Note
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('team-sms-send')} style={{ fontSize: '0.76rem', padding: '0.5rem' }}>
                📢 Team SMS
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('daily-standup')} style={{ fontSize: '0.76rem', padding: '0.5rem' }}>
                📋 Daily Standup
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('team-targets')} style={{ fontSize: '0.76rem', padding: '0.5rem' }}>
                📊 Team Targets
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('team-leaderboard')} style={{ fontSize: '0.76rem', padding: '0.5rem' }}>
                🏆 Leaderboard
              </button>
            </div>
          </div>

          {/* Attention: Missing Standups */}
          {missingStandups.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="card-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Clock size={16} style={{ color: '#f59e0b' }} />
                <span>Standup Pending ({missingStandups.length})</span>
              </div>
              {missingStandups.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <img src={emp.avatar} alt={emp.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{emp.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>Pending</span>
                </div>
              ))}
            </div>
          )}

          {/* Attention: Behind Targets */}
          {behindTargets.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="card-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                <span>Target Gaps ({behindTargets.length})</span>
              </div>
              {behindTargets.slice(0, 5).map(t => {
                const pct = t.targetValue > 0 ? Math.round((t.actualValue / t.targetValue) * 100) : 0;
                return (
                  <div key={t.id} style={{ padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.employeeName}</span>
                      <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {t.metric}: {t.actualValue} / {t.targetValue}
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--border-subtle)', marginTop: '0.3rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#10b981', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('team-targets')} style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.76rem' }}>
                View All Targets →
              </button>
            </div>
          )}

          {/* Coaching Snapshot */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Star size={16} style={{ color: '#8b5cf6' }} />
              <span>Recent Coaching</span>
            </div>
            {coachingNotes.slice(0, 3).map(note => (
              <div key={note.id} style={{ padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px',
                    background: note.type === 'Praise' ? 'rgba(16,185,129,0.12)' : note.type === 'Improvement' ? 'rgba(239,68,68,0.12)' : note.type === 'Goal' ? 'rgba(245,158,11,0.12)' : note.type === '1:1 Meeting' ? 'rgba(59,130,246,0.12)' : 'rgba(100,116,139,0.12)',
                    color: note.type === 'Praise' ? '#059669' : note.type === 'Improvement' ? '#dc2626' : note.type === 'Goal' ? '#d97706' : note.type === '1:1 Meeting' ? '#2563eb' : '#475569',
                  }}>{note.type}</span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>{note.employeeName}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {note.text.length > 80 ? note.text.substring(0, 80) + '...' : note.text}
                </div>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('coaching-history')} style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.76rem' }}>
              View Coaching Hub →
            </button>
          </div>
        </div>
      </div>

      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
