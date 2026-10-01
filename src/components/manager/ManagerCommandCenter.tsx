import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import {
  Users, CheckCircle2, AlertTriangle, TrendingUp, Calendar, PhoneCall,
  Briefcase, Plus, Search, Filter, RefreshCw, BarChart2, DollarSign, Clock,
  ArrowRight, ShieldAlert, Award, FileText, ArrowUpRight, ChevronRight,
  PieChart, Activity, Globe, Download
} from 'lucide-react';
import { AdvisoryLead, LeadStatus } from '../../types';

// Mock charts for visual appeal since we shouldn't invent a chart library but can use CSS
const MiniFunnel = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%', padding: '16px 0' }}>
    <div style={{ width: '90%', height: '32px', background: 'var(--status-new-bg)', color: 'var(--status-new-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Total (100%)</div>
    <div style={{ width: '75%', height: '32px', background: 'var(--info-bg, #eff6ff)', color: 'var(--info)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Contacted (75%)</div>
    <div style={{ width: '55%', height: '32px', background: 'var(--status-interested-bg)', color: 'var(--status-interested-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Interested (40%)</div>
    <div style={{ width: '35%', height: '32px', background: 'var(--status-client-bg)', color: 'var(--status-client-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Converted (15%)</div>
  </div>
);

const ProgressBar = ({ percent, color }: { percent: number, color: string }) => (
  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
    <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease-out' }} />
  </div>
);

export const ManagerCommandCenter: React.FC = () => {
  const { advisoryLeads, employees, setActiveTab, showToast } = useApp();

  const [dateRange, setDateRange] = useState('Today');
  const [teamFilter, setTeamFilter] = useState('All Teams');
  
  // Date calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // --- Data Calculations ---
  
  // Core Metrics
  const totalLeads = advisoryLeads.length;
  const unassignedLeads = advisoryLeads.filter(l => !l.assignedToId || l.isTeamPool);
  const assignedLeads = advisoryLeads.filter(l => l.assignedToId && !l.isTeamPool);
  const interestedLeads = advisoryLeads.filter(l => l.response?.toLowerCase().includes('interested') || l.response?.toLowerCase().includes('call back'));
  const convertedLeads = advisoryLeads.filter(l => l.status === 'Converted');
  const paymentPending = advisoryLeads.filter(l => l.status === 'In Contact' && l.response?.toLowerCase().includes('payment'));
  
  // Follow-ups
  const followups = advisoryLeads.filter(l => l.callbackDate && l.status !== 'Converted' && l.status !== 'Lost');
  const overdueFollowups = followups.filter(l => new Date(l.callbackDate!) < today);
  const todayFollowups = followups.filter(l => l.callbackDate?.startsWith(todayStr));
  
  // Needs Attention
  const leadsNotTouched = assignedLeads.filter(l => !l.lastContactDate || new Date(l.lastContactDate) < new Date(Date.now() - 3 * 86400000));
  
  // Exec Performance Calculation
  const execStats = useMemo(() => {
    const salesExecs = employees.filter(e => e.role.includes('Sales') || e.department === 'Advisory Sales');
    return salesExecs.map(exec => {
      const execLeads = advisoryLeads.filter(l => l.assignedToId === exec.id);
      const converted = execLeads.filter(l => l.status === 'Converted').length;
      return {
        ...exec,
        leads: execLeads.length,
        interested: execLeads.filter(l => l.response?.toLowerCase().includes('interested')).length,
        converted: converted,
        overdue: execLeads.filter(l => l.callbackDate && new Date(l.callbackDate) < today && l.status !== 'Converted').length,
        conversionRate: execLeads.length ? ((converted / execLeads.length) * 100).toFixed(1) : '0.0'
      };
    }).sort((a, b) => b.converted - a.converted);
  }, [employees, advisoryLeads, today]);

  // Team Calculations
  const alphaTeamLeads = advisoryLeads.filter(l => {
    const assigned = employees.find(e => e.id === l.assignedToId);
    return assigned?.managerId === 'emp-006' || l.teamLeaderId === 'emp-006';
  });
  
  const betaTeamLeads = advisoryLeads.filter(l => {
    const assigned = employees.find(e => e.id === l.assignedToId);
    return assigned?.managerId === 'emp-008' || l.teamLeaderId === 'emp-008';
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* SECTION 1: HEADER & GLOBAL CONTROLS */}
      <div style={{ 
        background: 'linear-gradient(to right, var(--stocketics-blue-900), var(--stocketics-blue-700))', 
        borderRadius: 'var(--radius-lg)', 
        padding: '24px 32px', 
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Manager Command Center</h1>
            <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}. Your teams have {todayFollowups.length} follow-ups due today and {overdueFollowups.length} overdue.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={() => setActiveTab('allot-leads')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontWeight: 600 }}>
              <Users size={16} /> Allot Leads
            </button>
            <button className="btn" onClick={() => setActiveTab('lead-pool')} style={{ background: '#fff', color: 'var(--stocketics-blue-800)', border: 'none', fontWeight: 700 }}>
              <ArrowRight size={16} /> View Lead Pool
            </button>
          </div>
        </div>
        
        {/* Global Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-surface)', fontSize: '13px', fontWeight: 600 }}>
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-surface)', fontSize: '13px', fontWeight: 600 }}>
            <option>All Teams</option>
            <option>Alpha Team</option>
            <option>Beta Team</option>
          </select>
          <button style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} /> More Filters
          </button>
        </div>
      </div>

      {/* SECTION 3: NEEDS ATTENTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldAlert size={20} color="var(--danger)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--danger)' }}>Needs Attention</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span>
                {overdueFollowups.length} Overdue Follow-ups
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span>
                {unassignedLeads.length} Unassigned Leads
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
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
            { label: 'Total Leads', value: totalLeads, icon: <Users size={18} color="var(--stocketics-blue-600)" />, bg: 'var(--stocketics-blue-50)' },
            { label: 'New Today', value: '14', icon: <Plus size={18} color="var(--success)" />, bg: 'var(--status-new-bg)' },
            { label: 'Follow-ups Due', value: todayFollowups.length, icon: <Clock size={18} color="var(--warning)" />, bg: 'var(--bg-surface-alt)' },
            { label: 'Interested', value: interestedLeads.length, icon: <Activity size={18} color="var(--kpi-prospect)" />, bg: 'var(--status-interested-bg)' },
            { label: 'Qualified', value: paymentPending.length, icon: <CheckCircle2 size={18} color="var(--info)" />, bg: 'var(--info-bg)' },
            { label: 'Converted Clients', value: convertedLeads.length, icon: <Award size={18} color="var(--success)" />, bg: 'var(--status-client-bg)' },
          ].map((kpi, i) => (
            <div key={i} className="card" onClick={() => setActiveTab('lead-pool')} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--stocketics-blue-300)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 4: TEAM PERFORMANCE OVERVIEW */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--text-secondary)" /> Team Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-subtle)', background: 'var(--bg-surface-alt)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 2px 0' }}>Alpha Team</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Leader: Rohan Deshmukh</p>
                  </div>
                  <div style={{ background: 'var(--stocketics-blue-100)', color: 'var(--stocketics-blue-700)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>{alphaTeamLeads.length} Leads</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>Converted</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--success)' }}>{alphaTeamLeads.filter(l => l.status === 'Converted').length}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>Overdue</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--danger)' }}>{alphaTeamLeads.filter(l => l.callbackDate && new Date(l.callbackDate) < today).length}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-subtle)', background: 'var(--bg-surface-alt)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 2px 0' }}>Beta Team</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Leader: Karan Mehta</p>
                  </div>
                  <div style={{ background: 'var(--stocketics-blue-100)', color: 'var(--stocketics-blue-700)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>{betaTeamLeads.length} Leads</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>Converted</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--success)' }}>{betaTeamLeads.filter(l => l.status === 'Converted').length}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>Overdue</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--danger)' }}>{betaTeamLeads.filter(l => l.callbackDate && new Date(l.callbackDate) < today).length}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 5: EXECUTIVE PERFORMANCE */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="var(--text-secondary)" /> Executive Performance
              </h3>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search executive..." style={{ padding: '6px 10px 6px 30px', fontSize: '12.5px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', outline: 'none' }} />
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
                  {execStats.slice(0, 5).map(exec => (
                    <tr key={exec.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={exec.avatar} alt={exec.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{exec.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{exec.managerId === 'emp-006' ? 'Alpha Team' : exec.managerId === 'emp-008' ? 'Beta Team' : 'Unassigned'}</p>
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
            <button style={{ width: '100%', padding: '10px', marginTop: '12px', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--stocketics-blue-600)', cursor: 'pointer' }}>View All Executives</button>
          </div>

          {/* SECTION 12: RECENT LEADS */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--text-secondary)" /> Recent Lead Activity
              </h3>
              <button onClick={() => setActiveTab('lead-pool')} style={{ background: 'none', border: 'none', color: 'var(--stocketics-blue-600)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open Lead Pool <ArrowRight size={14} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {advisoryLeads.slice(0, 4).map(lead => (
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
              <Filter size={18} color="var(--text-secondary)" /> Conversion Funnel
            </h3>
            <MiniFunnel />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 700, textTransform: 'uppercase' }}>Conv. Rate</p>
                <p style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--success)' }}>15.2%</p>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 700, textTransform: 'uppercase' }}>Drop-off</p>
                <p style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--danger)' }}>60%</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ fontWeight: 600 }}>D WEB KANNADA</span> <span>42%</span></div>
              <ProgressBar percent={42} color="var(--stocketics-blue-500)" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ fontWeight: 600 }}>Google Ads</span> <span>35%</span></div>
              <ProgressBar percent={35} color="var(--stocketics-blue-400)" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ fontWeight: 600 }}>Meta Inbound</span> <span>23%</span></div>
              <ProgressBar percent={23} color="var(--stocketics-blue-300)" />
            </div>

            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 700 }}>Languages</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Kannada', 'Hindi', 'English', 'Telugu'].map(lang => (
                <span key={lang} style={{ padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{lang}</span>
              ))}
            </div>
          </div>

          {/* SECTION 14: SALES SNAPSHOT */}
          <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--success-bg), #dcfce7)', borderColor: '#bbf7d0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
              <DollarSign size={18} /> Financial Snapshot
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Sales Today</p>
              <h4 style={{ fontSize: '28px', fontWeight: 800, color: '#166534', margin: 0 }}>₹42,500</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#166534', margin: '0 0 2px 0' }}>This Week</p>
                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#14532d' }}>₹1,45,000</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#166534', margin: '0 0 2px 0' }}>Avg Deal</p>
                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#14532d' }}>₹8,500</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManagerCommandCenter;
