import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import {
  Calendar, CheckCircle2, PhoneCall, TrendingUp, AlertTriangle, Clock,
  ArrowRight, Search, Activity, Target, UserCheck, Star, RefreshCw, Filter, 
  Briefcase, Play, Globe, Flame, ShieldAlert, Award, ChevronRight, MessageSquare
} from 'lucide-react';
import { AdvisoryLead } from '../../types';

const MiniFunnel = ({ total, contacted, interested, converted }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%', padding: '16px 0' }}>
    <div style={{ width: '100%', height: '32px', background: 'var(--status-new-bg)', color: 'var(--status-new-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>My Leads ({total})</div>
    <div style={{ width: '80%', height: '32px', background: 'var(--info-bg, #eff6ff)', color: 'var(--info)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Contacted ({contacted})</div>
    <div style={{ width: '60%', height: '32px', background: 'var(--status-interested-bg)', color: 'var(--status-interested-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Interested ({interested})</div>
    <div style={{ width: '40%', height: '32px', background: 'var(--status-client-bg)', color: 'var(--status-client-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>Converted ({converted})</div>
  </div>
);

const ProgressBar = ({ percent, color }: { percent: number, color: string }) => (
  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, percent))}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease-out' }} />
  </div>
);

export const SalesExecutiveCommandCenter: React.FC = () => {
  const { advisoryLeads, currentUser, callLogs, cashbackRules, setActiveTab, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // ============================================================================
  // EXECUTIVE DATA SELECTORS (SCOPED TO CURRENT USER)
  // ============================================================================
  const myLeads = useMemo(() => 
    advisoryLeads.filter(l => 
      (l.assignedToId === currentUser.id || l.assignedToName?.toLowerCase() === currentUser.name.toLowerCase()) && !l.isTeamPool
    ), [advisoryLeads, currentUser]
  );

  const myNewLeads = myLeads.filter(l => l.status === 'New Lead');
  const myContactedLeads = myLeads.filter(l => l.status === 'In Contact' || l.lastContactDate);
  const myInterestedLeads = myLeads.filter(l => l.response?.toLowerCase().includes('interested') || l.response?.toLowerCase().includes('call back'));
  const myQualifiedLeads = myLeads.filter(l => l.response?.toLowerCase().includes('payment') || l.status === 'Trial Active');
  const myConvertedLeads = myLeads.filter(l => l.status === 'Converted');
  
  const myFollowups = myLeads.filter(l => l.callbackDate && l.status !== 'Converted' && l.status !== 'Lost');
  const myFollowUpsToday = myFollowups.filter(l => l.callbackDate?.startsWith(todayStr));
  const myOverdueFollowUps = myFollowups.filter(l => new Date(l.callbackDate!) < today && !l.callbackDate?.startsWith(todayStr));
  const myUpcomingFollowUps = myFollowups.filter(l => new Date(l.callbackDate!) > today && !l.callbackDate?.startsWith(todayStr));

  const myInactiveLeads = myContactedLeads.filter(l => l.lastContactDate && new Date(l.lastContactDate) < new Date(today.getTime() - 3 * 86400000) && l.status !== 'Converted');
  
  const mySales = myConvertedLeads.reduce((sum, l) => sum + (l.expectedRevenue || 35000), 0);
  const myActivity = callLogs.filter(c => c.employeeId === currentUser.id);

  // Targets
  const employeeRevenue = mySales || 0;
  const currentRule = cashbackRules?.filter(r => employeeRevenue >= (r.salesLimitThreshold ?? r.targetSalesAmount)).pop();
  const nextRule = cashbackRules?.find(r => (r.salesLimitThreshold ?? r.targetSalesAmount) > employeeRevenue) || cashbackRules?.[cashbackRules.length - 1];
  const nextThreshold = nextRule ? (nextRule.salesLimitThreshold ?? nextRule.targetSalesAmount) : 200000;
  const targetProgress = Math.min(100, Math.round((employeeRevenue / nextThreshold) * 100)) || 0;

  // Work Queue Generation
  const workQueue = useMemo(() => {
    const queue: { lead: AdvisoryLead; reason: string; priority: number }[] = [];
    myOverdueFollowUps.forEach(l => queue.push({ lead: l, reason: 'Overdue Follow-up', priority: 1 }));
    myFollowUpsToday.forEach(l => queue.push({ lead: l, reason: 'Follow-up Due Today', priority: 2 }));
    myNewLeads.forEach(l => queue.push({ lead: l, reason: 'New Lead - Contact Now', priority: 3 }));
    myInterestedLeads.filter(l => !l.callbackDate).forEach(l => queue.push({ lead: l, reason: 'Interested - Missing Action', priority: 4 }));
    return queue.sort((a, b) => a.priority - b.priority).slice(0, 10);
  }, [myOverdueFollowUps, myFollowUpsToday, myNewLeads, myInterestedLeads]);

  // Language Breakdown
  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    myLeads.forEach(l => {
      // simulate language if missing for demo purposes, but strictly use real data if available
      const lang = (l as any).language || 'Kannada';
      counts[lang] = (counts[lang] || 0) + 1;
    });
    return counts;
  }, [myLeads]);

  const searchResults = searchQuery.trim().length > 0 
    ? myLeads.filter(l => l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery))
    : [];

  const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';
  const firstName = currentUser.name.split(' ')[0];

  const handleDrillDown = (tab: string) => {
    setActiveTab(tab);
    showToast(`Opening ${tab.replace('-', ' ')}...`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px', fontFamily: 'var(--font-family-base)' }}>
      
      {/* SECTION 1: PERSONALIZED HEADER */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
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
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Good {timeOfDay}, {firstName}
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              You have <strong>{myFollowUpsToday.length} follow-ups</strong> due today, <strong>{myOverdueFollowUps.length} overdue</strong>, and <strong>{myInterestedLeads.length} interested leads</strong> waiting for action.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
              <input 
                type="text" 
                placeholder="Search my leads..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '8px 12px 8px 36px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: '#fff', fontSize: '13.5px', outline: 'none', width: '220px' }} 
              />
            </div>
            <button className="btn" onClick={() => handleDrillDown('leads')} style={{ background: '#fff', color: '#1e3a8a', border: 'none', fontWeight: 700, borderRadius: '20px', padding: '8px 16px' }}>
              My Leads
            </button>
          </div>
        </div>
      </div>

      {searchQuery && searchResults.length > 0 && (
        <div className="card" style={{ padding: '16px', background: 'var(--bg-surface-alt)', border: '1px solid var(--stocketics-blue-300)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Search Results ({searchResults.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
            {searchResults.map(l => (
              <div key={l.id} style={{ padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{l.clientName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.phone}</div>
                </div>
                <button onClick={() => handleDrillDown('leads')} style={{ background: 'var(--stocketics-blue-50)', color: 'var(--stocketics-blue-700)', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Open</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: TODAY'S PRIORITY STRIP */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={16} color="var(--danger)" /> Today's Priority
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {myOverdueFollowUps.length > 0 && (
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--danger)', background: 'var(--danger-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '12px', color: 'var(--danger)', margin: '0 0 4px 0', fontWeight: 700, textTransform: 'uppercase' }}>Overdue Follow-ups</h4>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#991b1b', lineHeight: 1 }}>{myOverdueFollowUps.length}</div>
                  <p style={{ fontSize: '13px', color: '#7f1d1d', margin: '8px 0 0 0', fontWeight: 500 }}>Handle these first</p>
                </div>
                <button onClick={() => handleDrillDown('today-followup')} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>View Now</button>
              </div>
            </div>
          )}

          {myFollowUpsToday.length > 0 && (
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--warning)', background: '#fffbeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '12px', color: '#b45309', margin: '0 0 4px 0', fontWeight: 700, textTransform: 'uppercase' }}>Follow-ups Due Today</h4>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#92400e', lineHeight: 1 }}>{myFollowUpsToday.length}</div>
                  <p style={{ fontSize: '13px', color: '#78350f', margin: '8px 0 0 0', fontWeight: 500 }}>Scheduled for today</p>
                </div>
                <button onClick={() => handleDrillDown('today-followup')} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>View All</button>
              </div>
            </div>
          )}

          {myNewLeads.length > 0 && (
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--info)', background: 'var(--info-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '12px', color: 'var(--info)', margin: '0 0 4px 0', fontWeight: 700, textTransform: 'uppercase' }}>New Leads</h4>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0369a1', lineHeight: 1 }}>{myNewLeads.length}</div>
                  <p style={{ fontSize: '13px', color: '#075985', margin: '8px 0 0 0', fontWeight: 500 }}>Not yet contacted</p>
                </div>
                <button onClick={() => handleDrillDown('new-leads')} style={{ background: 'var(--info)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>Start Calling</button>
              </div>
            </div>
          )}

          {myOverdueFollowUps.length === 0 && myFollowUpsToday.length === 0 && myNewLeads.length === 0 && (
            <div className="card" style={{ padding: '20px', background: 'var(--success-bg)', borderLeft: '4px solid var(--success)', gridColumn: 'span 3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>You're caught up! No critical priorities right now.</h4>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: EXECUTIVE KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'My Total Leads', value: myLeads.length, icon: <Briefcase size={16} color="var(--stocketics-blue-600)" />, action: 'leads' },
          { label: 'Interested', value: myInterestedLeads.length, icon: <Activity size={16} color="var(--kpi-prospect)" />, action: 'interested-leads' },
          { label: 'Qualified', value: myQualifiedLeads.length, icon: <Star size={16} color="#d97706" />, action: 'payment-leads' },
          { label: 'Converted', value: myConvertedLeads.length, icon: <Award size={16} color="var(--success)" />, action: 'confirmed-payment' },
          { label: 'My Sales', value: `₹${(mySales / 1000).toFixed(1)}k`, icon: <TrendingUp size={16} color="var(--success)" />, action: 'confirmed-payment' },
        ].map((kpi, i) => (
          <div key={i} className="card" onClick={() => handleDrillDown(kpi.action)} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{kpi.value}</h4>
              <p style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '4px 0 0 0' }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 4: MY WORK QUEUE */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} color="var(--text-secondary)" /> My Work Queue
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleDrillDown('today-followup')} style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View All Due</button>
              </div>
            </div>
            
            {workQueue.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {workQueue.map((item, idx) => (
                  <div key={item.lead.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-alt)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fff'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.lead.clientName}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', background: item.priority === 1 ? 'var(--danger-bg)' : item.priority === 2 ? '#fffbeb' : 'var(--bg-surface)', color: item.priority === 1 ? 'var(--danger)' : item.priority === 2 ? '#d97706' : 'var(--text-muted)' }}>
                          {item.reason}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span><PhoneCall size={10} style={{marginRight: 4}} /> {item.lead.phone}</span>
                        <span>•</span>
                        <span>{item.lead.serviceType || 'Advisory'}</span>
                        <span>•</span>
                        <span>Status: <strong style={{color: 'var(--text-secondary)'}}>{item.lead.status}</strong></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleDrillDown('leads')} style={{ background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Open</button>
                      <button onClick={() => showToast('Logging call... (Demo)', 'success')} style={{ background: 'var(--stocketics-blue-600)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PhoneCall size={12} /> Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>Queue is empty</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>You have handled all immediate priorities.</p>
              </div>
            )}
          </div>

          {/* SECTION 6: FOLLOW-UP COMMAND CENTER */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--text-secondary)" /> Upcoming Follow-ups
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myUpcomingFollowUps.length > 0 ? myUpcomingFollowUps.slice(0, 4).map(lead => (
                <div key={lead.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', alignItems: 'center', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>{lead.clientName}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{lead.response || 'No Response Yet'}</div>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {lead.callbackDate} {lead.callbackTime && `at ${lead.callbackTime}`}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDrillDown('today-followup')} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>Reschedule</button>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>No upcoming follow-ups scheduled.</div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* SECTION 8: INTERESTED LEADS */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--kpi-prospect)" /> Interested Leads
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myInterestedLeads.slice(0, 5).map(l => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{l.clientName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Since {l.lastContactDate || 'Unknown'}</div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => handleDrillDown('interested-leads')} />
                  </div>
                ))}
              </div>
              <button onClick={() => handleDrillDown('interested-leads')} style={{ width: '100%', marginTop: '12px', background: 'transparent', border: 'none', color: 'var(--stocketics-blue-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>View All ({myInterestedLeads.length})</button>
            </div>

            {/* SECTION 14: NEEDS MY ATTENTION */}
            <div className="card" style={{ padding: '20px', borderLeft: '3px solid var(--warning)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} color="var(--warning)" /> Needs My Attention
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div onClick={() => handleDrillDown('today-followup')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: '6px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }}></span>
                    {myOverdueFollowUps.length} Overdue Follow-ups
                  </span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
                <div onClick={() => handleDrillDown('interested-leads')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: '6px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)' }}></span>
                    {myInterestedLeads.filter(l => !l.callbackDate).length} Interested without Next Action
                  </span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
                <div onClick={() => handleDrillDown('leads')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: '6px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                    {myInactiveLeads.length} Inactive &gt; 3 Days
                  </span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 12: TARGET PROGRESS */}
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-alt) 100%)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} color="var(--text-secondary)" /> Target Progress
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Sales</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{targetProgress}%</span>
              </div>
              <ProgressBar percent={targetProgress} color="var(--stocketics-blue-500)" />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>Achieved</p>
                <p style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>₹{(employeeRevenue / 1000).toFixed(1)}k</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>Target</p>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>₹{(nextThreshold / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </div>

          {/* SECTION 10: MY PIPELINE */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="var(--text-secondary)" /> My Pipeline
            </h3>
            <MiniFunnel 
              total={myLeads.length} 
              contacted={myContactedLeads.length} 
              interested={myInterestedLeads.length} 
              converted={myConvertedLeads.length} 
            />
          </div>

          {/* SECTION 13: MY RECENT ACTIVITY */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} color="var(--text-secondary)" /> Recent Activity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myActivity.slice(0, 5).map((act, i) => (
                <div key={act.id} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '2px', background: 'var(--border-subtle)', position: 'relative', marginTop: '6px' }}>
                    <div style={{ position: 'absolute', width: '8px', height: '8px', background: i === 0 ? 'var(--stocketics-blue-500)' : 'var(--text-muted)', borderRadius: '50%', left: '-3px', top: '0' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>Called {act.clientName}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{act.disposition} • {act.timestamp.split(' ')[1]} {act.timestamp.split(' ')[2]}</p>
                  </div>
                </div>
              ))}
              {myActivity.length === 0 && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No calls logged recently.</div>}
            </div>
          </div>

          {/* SECTION 16: LANGUAGE BREAKDOWN */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="var(--text-secondary)" /> Language Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(languageStats).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([lang, count]) => (
                <div key={lang}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{lang}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({Math.round((count / myLeads.length) * 100)}%)</span>
                  </div>
                  <ProgressBar percent={(count / myLeads.length) * 100} color="var(--text-secondary)" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
