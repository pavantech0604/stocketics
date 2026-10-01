import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import {
  Users, CheckCircle2, AlertTriangle, TrendingUp, Calendar, PhoneCall,
  Briefcase, Plus, Search, Filter, RefreshCw, BarChart2, DollarSign, Clock,
  ArrowRight, ShieldAlert, Award, FileText, ArrowUpRight, ChevronRight,
  PieChart, Activity, Globe, Download, Target, Headphones, Star, Megaphone
} from 'lucide-react';

const MiniFunnel = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%', padding: '16px 0' }}>
    <div style={{ width: '90%', height: '32px', background: 'var(--status-new-bg)', color: 'var(--status-new-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Total Leads (100%)</div>
    <div style={{ width: '75%', height: '32px', background: 'var(--info-bg, #eff6ff)', color: 'var(--info)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Contacted</div>
    <div style={{ width: '55%', height: '32px', background: 'var(--status-interested-bg)', color: 'var(--status-interested-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Interested</div>
    <div style={{ width: '35%', height: '32px', background: 'var(--status-client-bg)', color: 'var(--status-client-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Converted</div>
  </div>
);

const ProgressBar = ({ percent, color }: { percent: number, color: string }) => (
  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
    <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease-out' }} />
  </div>
);

export const TeamLeaderCommandCenter: React.FC = () => {
  const { advisoryLeads, employees, callLogs, currentUser, getTeamMemberIds, setActiveTab, showToast } = useApp();

  const [dateRange, setDateRange] = useState('Today');
  
  // Date calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // -- Scope Team Data --
  const teamMemberIds = getTeamMemberIds(currentUser.id);
  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));
  
  // Leads assigned to team members
  const teamAssignedLeads = advisoryLeads.filter(l => l.assignedToId && teamMemberIds.includes(l.assignedToId));
  // Leads in team pool (unassigned but belonging to this TL)
  const teamPoolLeads = advisoryLeads.filter(l => l.isTeamPool && l.teamLeaderId === currentUser.id);
  
  const allTeamLeads = [...teamAssignedLeads, ...teamPoolLeads];
  
  const teamCalls = callLogs.filter(c => teamMemberIds.includes(c.employeeId));

  // -- Core Metrics --
  const totalLeads = allTeamLeads.length;
  const interestedLeads = allTeamLeads.filter(l => l.response?.toLowerCase().includes('interested') || l.response?.toLowerCase().includes('call back'));
  const convertedLeads = allTeamLeads.filter(l => l.status === 'Converted');
  const paymentPending = allTeamLeads.filter(l => l.status === 'In Contact' && l.response?.toLowerCase().includes('payment'));
  
  // Follow-ups
  const followups = allTeamLeads.filter(l => l.callbackDate && l.status !== 'Converted' && l.status !== 'Lost');
  const overdueFollowups = followups.filter(l => new Date(l.callbackDate!) < today);
  const todayFollowups = followups.filter(l => l.callbackDate?.startsWith(todayStr));
  
  // Needs Attention
  const leadsNotTouched = teamAssignedLeads.filter(l => !l.lastContactDate || new Date(l.lastContactDate) < new Date(Date.now() - 3 * 86400000));
  
  // Exec Performance Calculation
  const execStats = useMemo(() => {
    return teamEmployees.map(exec => {
      const execLeads = teamAssignedLeads.filter(l => l.assignedToId === exec.id);
      const converted = execLeads.filter(l => l.status === 'Converted').length;
      const overdue = execLeads.filter(l => l.callbackDate && new Date(l.callbackDate) < today && l.status !== 'Converted').length;
      return {
        ...exec,
        leads: execLeads.length,
        interested: execLeads.filter(l => l.response?.toLowerCase().includes('interested')).length,
        converted: converted,
        overdue: overdue,
        conversionRate: execLeads.length ? ((converted / execLeads.length) * 100).toFixed(1) : '0.0'
      };
    }).sort((a, b) => b.converted - a.converted);
  }, [teamEmployees, teamAssignedLeads, today]);

  // Activity Feed (simulated from call logs)
  const recentActivity = teamCalls.slice(0, 6).map(c => ({
    id: c.id,
    text: `${c.employeeName} called ${c.clientName}`,
    detail: c.disposition,
    time: c.timestamp.split(' ').slice(1).join(' '),
    sentiment: c.sentiment,
  }));

  const teamName = currentUser.name.split(' ')[0] + "'s Team";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* SECTION 1: HEADER & GLOBAL CONTROLS */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: 'var(--radius-lg)', 
        padding: '24px 32px', 
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={28} /> Team Leader Command Center
            </h1>
            <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: 500 }}>
              {teamName} • {teamEmployees.length} Executives • {teamAssignedLeads.length} Assigned Leads
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
              Your team has <strong>{overdueFollowups.length}</strong> overdue follow-ups and <strong>{todayFollowups.length}</strong> actions due today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setActiveTab('allot-leads')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600 }}>
              <Users size={16} /> Allot Leads
            </button>
            <button className="btn" onClick={() => setActiveTab('lead-pool')} style={{ background: '#fff', color: '#d97706', border: 'none', fontWeight: 700 }}>
              <ArrowRight size={16} /> View Team Lead Pool
            </button>
          </div>
        </div>
        
        {/* Global Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-surface)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <button onClick={() => showToast('Filters reset', 'success')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Reset Filters
          </button>
        </div>
      </div>

      {/* SECTION 3: NEEDS ATTENTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldAlert size={20} color="var(--danger)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--danger)' }}>Team Needs Attention</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div onClick={() => setActiveTab('leads')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span>
                {overdueFollowups.length} Overdue Follow-ups
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
            <div onClick={() => setActiveTab('lead-pool')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span>
                {teamPoolLeads.length} Unassigned Team Leads
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
            <div onClick={() => setActiveTab('leads')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--kpi-prospect)' }}></span>
                {leadsNotTouched.length} Leads inactive &gt; 3 days
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRIMARY KPIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', gridColumn: 'span 2' }}>
          {[
            { label: 'Assigned Leads', value: teamAssignedLeads.length, icon: <Users size={18} color="#d97706" />, bg: 'rgba(245, 158, 11, 0.15)' },
            { label: 'Calls Logged', value: teamCalls.length, icon: <PhoneCall size={18} color="var(--success)" />, bg: 'var(--status-new-bg)' },
            { label: 'Follow-ups Due', value: todayFollowups.length, icon: <Clock size={18} color="var(--warning)" />, bg: 'var(--bg-surface-alt)' },
            { label: 'Interested', value: interestedLeads.length, icon: <Activity size={18} color="var(--kpi-prospect)" />, bg: 'var(--status-interested-bg)' },
            { label: 'Qualified', value: paymentPending.length, icon: <CheckCircle2 size={18} color="var(--info)" />, bg: 'var(--info-bg)' },
            { label: 'Converted', value: convertedLeads.length, icon: <Award size={18} color="var(--success)" />, bg: 'var(--status-client-bg)' },
          ].map((kpi, i) => (
            <div key={i} className="card" onClick={() => setActiveTab('lead-pool')} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#fcd34d'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kpi.icon}
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{kpi.label}</p>
                <h4 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{kpi.value.toLocaleString()}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 5: EXECUTIVE PERFORMANCE */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="var(--text-secondary)" /> Executive Performance & Workload
              </h3>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search executive..." style={{ padding: '6px 10px 6px 30px', fontSize: '12.5px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-alt)', outline: 'none' }} />
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                    <th style={{ padding: '10px 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Executive</th>
                    <th style={{ padding: '10px 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Assigned</th>
                    <th style={{ padding: '10px 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Interested</th>
                    <th style={{ padding: '10px 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Converted</th>
                    <th style={{ padding: '10px 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Conv %</th>
                    <th style={{ padding: '10px 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {execStats.map(exec => (
                    <tr key={exec.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={exec.avatar} alt={exec.name} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-subtle)' }} />
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{exec.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Workload: {exec.leads > 40 ? 'High' : exec.leads < 10 ? 'Low' : 'Balanced'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600 }}>{exec.leads}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--kpi-prospect)', fontWeight: 600 }}>{exec.interested}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>{exec.converted}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {exec.conversionRate}%
                          <ProgressBar percent={Number(exec.conversionRate)} color="var(--success)" />
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {exec.overdue > 0 ? (
                          <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '12px', fontWeight: 700 }}>{exec.overdue}</span>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 12: RECENT LEADS */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--text-secondary)" /> Recent Team Leads
              </h3>
              <button onClick={() => setActiveTab('lead-pool')} style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open Lead Pool <ArrowRight size={14} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allTeamLeads.slice(0, 4).map(lead => (
                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-alt)' }}>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>{lead.clientName}</p>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>{lead.source} • {lead.assignedToName || 'Unassigned'}</p>
                  </div>
                  <div>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: lead.status === 'Converted' ? 'var(--status-client-bg)' : lead.response?.toLowerCase().includes('interested') ? 'var(--status-interested-bg)' : 'var(--bg-surface)', color: lead.status === 'Converted' ? 'var(--status-client-text)' : lead.response?.toLowerCase().includes('interested') ? 'var(--status-interested-text)' : 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 6: CONVERSION FUNNEL */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color="var(--text-secondary)" /> Team Funnel
            </h3>
            <MiniFunnel />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 700, textTransform: 'uppercase' }}>Conv. Rate</p>
                <p style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--success)' }}>
                  {allTeamLeads.length ? ((convertedLeads.length / allTeamLeads.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 700, textTransform: 'uppercase' }}>Active</p>
                <p style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--stocketics-blue-600)' }}>{teamAssignedLeads.length}</p>
              </div>
            </div>
          </div>

          {/* SECTION 10 & 9: SOURCES & LANGUAGES */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--text-secondary)" /> Demographics
            </h3>
            
            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 700 }}>Top Sources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ fontWeight: 600 }}>Meta Inbound</span> <span>45%</span></div>
              <ProgressBar percent={45} color="#d97706" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ fontWeight: 600 }}>Google Ads</span> <span>30%</span></div>
              <ProgressBar percent={30} color="#fbbf24" />
            </div>

            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 700 }}>Languages</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Kannada', 'Hindi', 'English'].map(lang => (
                <span key={lang} style={{ padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{lang}</span>
              ))}
            </div>
          </div>

          {/* Live Activity Monitor */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--text-secondary)" /> Recent Activity
              </h3>
            </div>
            {recentActivity.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivity.slice(0, 4).map((act, idx) => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: '4px', flexShrink: 0, background: idx === 0 ? '#10b981' : '#94a3b8' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{act.text}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{act.detail} • {act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No recent activity.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
