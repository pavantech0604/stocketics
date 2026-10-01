import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  RefreshCw, 
  Search, 
  ArrowRight, 
  Users, 
  Check, 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Sparkles, 
  Filter,
  History,
  TrendingUp,
  X
} from 'lucide-react';

export const LeadReassignmentView: React.FC = () => {
  const { 
    role, 
    currentUser, 
    employees, 
    advisoryLeads, 
    teams, 
    teamMembers, 
    getTeamMemberIds, 
    batchReassignLeads, 
    assignmentHistory, 
    setActiveTab, 
    showToast 
  } = useApp();

  const isManager = ['manager', 'hr', 'admin'].includes(role);

  // Active view tab: reassign desk or audit log
  const [activeViewMode, setActiveViewMode] = useState<'reassign' | 'history'>('reassign');

  // Candidate destination employees
  const candidateEmployees = useMemo(() => {
    if (isManager) {
      return employees.filter(e => 
        ['Active', 'Remote'].includes(e.status) && 
        (e.department === 'Advisory Sales' || e.department === 'Equity Research' || e.role === 'Employee' || e.role === 'Team Leader')
      );
    }
    const memberIds = getTeamMemberIds(currentUser.id);
    return employees.filter(e => memberIds.includes(e.id) && ['Active', 'Remote'].includes(e.status));
  }, [isManager, employees, currentUser.id, getTeamMemberIds]);

  // Scoped pool of leads that can be reassigned
  const baseLeads = useMemo(() => {
    if (isManager) {
      return advisoryLeads;
    }
    const memberIds = getTeamMemberIds(currentUser.id);
    return advisoryLeads.filter(l => 
      memberIds.includes(l.assignedToId) || 
      l.teamLeaderId === currentUser.id ||
      l.assignedToId === currentUser.id
    );
  }, [isManager, advisoryLeads, currentUser.id, getTeamMemberIds]);

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [targetEmployee, setTargetEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reassignReason, setReassignReason] = useState('Workload Rebalance');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available sources from base leads
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    baseLeads.forEach(l => { if (l.source) set.add(l.source); });
    return Array.from(set);
  }, [baseLeads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return baseLeads.filter(l => {
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
      if (filterSource !== 'all' && l.source !== filterSource) return false;
      if (filterTeam !== 'all') {
        const rep = employees.find(e => e.id === l.assignedToId);
        const mem = rep ? teamMembers.find(tm => tm.employeeId === rep.id) : undefined;
        if (mem?.teamId !== filterTeam && l.teamId !== filterTeam) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          l.clientName.toLowerCase().includes(q) || 
          (l.assignedToName && l.assignedToName.toLowerCase().includes(q)) || 
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.source && l.source.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [baseLeads, filterStatus, filterSource, filterTeam, searchQuery, employees, teamMembers]);

  // Capacity visualization
  const capacityData = useMemo(() => {
    return candidateEmployees.map(emp => {
      const count = advisoryLeads.filter(l => l.assignedToId === emp.id).length;
      const mem = teamMembers.find(tm => tm.employeeId === emp.id);
      const team = mem ? teams.find(t => t.id === mem.teamId) : undefined;
      return { 
        ...emp, 
        leadCount: count,
        teamName: team?.name || emp.department || 'Advisory Team'
      };
    });
  }, [candidateEmployees, advisoryLeads, teamMembers, teams]);

  const maxLeads = Math.max(...capacityData.map(c => c.leadCount), 1);

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedLeads.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const handleExecuteReassign = () => {
    if (!targetEmployee) {
      showToast('Please select a target destination employee.', 'warning');
      return;
    }
    if (selectedLeads.length === 0) {
      showToast('Please select at least one lead from the table to reassign.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = batchReassignLeads(selectedLeads, targetEmployee, reassignReason);
      setIsSubmitting(false);
      if (result.success) {
        setSelectedLeads([]);
      }
    }, 200);
  };

  // Reassignment audit history records
  const recentReassignments = useMemo(() => {
    return assignmentHistory.filter(h => h.assignmentType === 'reassignment').slice(0, 30);
  }, [assignmentHistory]);

  const selectedTargetEmp = employees.find(e => e.id === targetEmployee);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* ── Top Breadcrumb Strip ── */}
      <div className="subpage-header-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="subpage-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem' }}>
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7', fontWeight: 600 }}>
            <Home size={15} /> Dashboard
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Lead Reassignment Center</span>
        </div>

        {/* View mode toggle: Reassign Desk vs History */}
        <div style={{ display: 'flex', background: 'var(--bg-subtle, #f1f5f9)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle, #e2e8f0)' }}>
          <button 
            type="button" 
            onClick={() => setActiveViewMode('reassign')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeViewMode === 'reassign' ? '#0284c7' : 'transparent',
              color: activeViewMode === 'reassign' ? '#ffffff' : 'var(--text-muted, #64748b)',
              boxShadow: activeViewMode === 'reassign' ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            <RefreshCw size={13} />
            Reassign Desk
          </button>
          <button 
            type="button" 
            onClick={() => setActiveViewMode('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeViewMode === 'history' ? '#0284c7' : 'transparent',
              color: activeViewMode === 'history' ? '#ffffff' : 'var(--text-muted, #64748b)',
              boxShadow: activeViewMode === 'history' ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            <History size={13} />
            Audit History ({recentReassignments.length})
          </button>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '1rem',
        padding: '1.1rem 1.4rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(2, 132, 199, 0.05) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(6, 182, 212, 0.22)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)'
          }}>
            <RefreshCw size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Lead Reassignment Center
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#0284c7', color: '#fff' }}>
                {isManager ? 'Master Manager Scope' : 'Squad Leader Scope'}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Reassign active advisory prospects and leads dynamically with full history preservation and employee notifications.
            </div>
          </div>
        </div>

        {/* Quick Scope Stats */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Total Leads</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{baseLeads.length}</strong>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Active Reps</span>
            <strong style={{ fontSize: '14px', color: '#0284c7' }}>{candidateEmployees.length}</strong>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Selected</span>
            <strong style={{ fontSize: '14px', color: '#059669' }}>{selectedLeads.length}</strong>
          </div>
        </div>
      </div>

      {activeViewMode === 'history' ? (
        /* ── AUDIT HISTORY VIEW ── */
        <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} style={{ color: '#0284c7' }} /> Recent Reassignment Audit Log
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Showing last 30 reallocations</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle, #e2e8f0)', background: 'var(--bg-subtle, #f8fafc)' }}>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>TIMESTAMP</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>LEAD NAME</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>SOURCE</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>FROM ADVISOR</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>TO ADVISOR</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>AUTHORIZED BY</th>
                </tr>
              </thead>
              <tbody>
                {recentReassignments.map(entry => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{entry.assignedAt}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{entry.leadName || entry.leadId}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
                        {entry.source}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#ef4444', fontWeight: 600 }}>{entry.fromName || 'Unassigned'}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#10b981', fontWeight: 700 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ArrowRight size={12} /> {entry.toName}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>{entry.assignedByName || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentReassignments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No reassignment events logged yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── REASSIGN DESK VIEW ── */
        <>
          {/* ── Employee Capacity Cards (Click card to set target employee) ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} style={{ color: '#0284c7' }} /> Select Target Destination Advisor
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>(Click an advisor to assign leads directly)</span>
              </div>
              {selectedTargetEmp && (
                <button 
                  type="button" 
                  onClick={() => setTargetEmployee('')}
                  style={{ fontSize: '11.5px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <X size={12} /> Clear selection
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.75rem' }}>
              {capacityData.map(emp => {
                const pct = Math.min(Math.round((emp.leadCount / maxLeads) * 100), 100);
                const isTarget = targetEmployee === emp.id;
                return (
                  <div 
                    key={emp.id} 
                    className="card" 
                    onClick={() => setTargetEmployee(isTarget ? '' : emp.id)} 
                    style={{
                      padding: '0.85rem', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: isTarget ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                      background: isTarget ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                      boxShadow: isTarget ? '0 4px 12px rgba(2, 132, 199, 0.18)' : '0 1px 3px rgba(0,0,0,0.02)',
                      transform: isTarget ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: isTarget ? '2px solid #0284c7' : '1px solid #cbd5e1' }} 
                        />
                        {isTarget && (
                          <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#0284c7', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                            ✓
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: isTarget ? '#0284c7' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {emp.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {emp.teamName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a' }}>
                          {emp.leadCount}
                        </span>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>leads</div>
                      </div>
                    </div>

                    {/* Progress load bar */}
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--border-subtle, #e2e8f0)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', 
                        width: `${pct}%`, 
                        borderRadius: 3, 
                        transition: 'width 0.4s ease',
                        background: pct > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : pct > 50 ? 'linear-gradient(90deg, #3b82f6, #f59e0b)' : 'linear-gradient(90deg, #10b981, #059669)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Action Command Toolbar (Active when leads or target are selected) ── */}
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            padding: '1rem 1.25rem',
            background: selectedLeads.length > 0 ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.09), rgba(6, 182, 212, 0.06))' : 'var(--bg-surface)', 
            border: selectedLeads.length > 0 ? '1.5px solid #0284c7' : '1px solid var(--border-subtle)', 
            borderRadius: '10px',
            boxShadow: selectedLeads.length > 0 ? '0 4px 16px rgba(2, 132, 199, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: selectedLeads.length > 0 ? '#0284c7' : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800
                }}>
                  {selectedLeads.length} Selected
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>leads to transfer</span>
              </div>

              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

              {/* Target Employee Selector */}
              <div style={{ minWidth: '220px' }}>
                <select 
                  value={targetEmployee} 
                  onChange={e => setTargetEmployee(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: targetEmployee ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    background: targetEmployee ? '#f0f9ff' : '#ffffff',
                    color: targetEmployee ? '#0369a1' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Choose Destination Advisor...</option>
                  {candidateEmployees.map(e => {
                    const cnt = advisoryLeads.filter(l => l.assignedToId === e.id).length;
                    return (
                      <option key={e.id} value={e.id}>
                        {e.name} ({cnt} active leads)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Reason Selector */}
              <div style={{ minWidth: '180px' }}>
                <select
                  value={reassignReason}
                  onChange={e => setReassignReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="Workload Rebalance">Workload Rebalance</option>
                  <option value="Language Support">Language Support</option>
                  <option value="Leave Coverage">Leave / Absence Coverage</option>
                  <option value="Senior Advisor Escalation">Senior Advisor Escalation</option>
                  <option value="Performance Reallocation">Performance Reallocation</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {selectedLeads.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedLeads([])}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Deselect All
                </button>
              )}

              <button
                type="button"
                onClick={handleExecuteReassign}
                disabled={isSubmitting || selectedLeads.length === 0 || !targetEmployee}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: (selectedLeads.length > 0 && targetEmployee) 
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                    : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: (selectedLeads.length > 0 && targetEmployee && !isSubmitting) ? 'pointer' : 'not-allowed',
                  boxShadow: (selectedLeads.length > 0 && targetEmployee) ? '0 3px 10px rgba(2, 132, 199, 0.35)' : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                <RefreshCw size={14} className={isSubmitting ? 'spin' : ''} />
                <span>{isSubmitting ? 'Transferring...' : `Confirm Reassignment (${selectedLeads.length})`}</span>
              </button>
            </div>
          </div>

          {/* ── Filters & Search Toolbar ── */}
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '0.75rem',
            background: 'var(--bg-surface)',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '360px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search by client, phone, email, advisor..." 
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 2.2rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  outline: 'none'
                }} 
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Team Filter for Managers */}
              {isManager && teams.length > 0 && (
                <select
                  value={filterTeam}
                  onChange={e => setFilterTeam(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="all">All Squads / Teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}

              {/* Source Filter */}
              {availableSources.length > 0 && (
                <select
                  value={filterSource}
                  onChange={e => setFilterSource(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="all">All Lead Sources</option>
                  {availableSources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}

              {/* Status Filter Buttons */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['all', 'New Lead', 'In Contact', 'Trial Active', 'Converted', 'Lost'].map(s => (
                  <button 
                    key={s} 
                    type="button"
                    onClick={() => setFilterStatus(s)} 
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      border: filterStatus === s ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      background: filterStatus === s ? '#0284c7' : '#ffffff',
                      color: filterStatus === s ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {s === 'all' ? 'All Status' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Leads Table ── */}
          <div className="card" style={{ overflow: 'hidden', padding: 0, border: '1px solid var(--border-subtle)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', minWidth: '780px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', background: 'var(--bg-subtle, #f8fafc)' }}>
                    <th style={{ padding: '0.75rem', width: 44, textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} 
                        onChange={toggleAll} 
                        style={{ accentColor: '#0284c7', cursor: 'pointer', width: 16, height: 16 }} 
                      />
                    </th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>CLIENT DETAILS</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>CONTACT</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>SERVICE</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>STAGE STATUS</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>CURRENT ADVISOR</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem' }}>REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const isSelected = selectedLeads.includes(lead.id);
                    return (
                      <tr 
                        key={lead.id} 
                        onClick={() => toggleLead(lead.id)}
                        style={{ 
                          borderBottom: '1px solid var(--border-subtle)', 
                          background: isSelected ? 'rgba(2, 132, 199, 0.06)' : 'transparent', 
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '0.75rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => toggleLead(lead.id)} 
                            style={{ accentColor: '#0284c7', cursor: 'pointer', width: 16, height: 16 }} 
                          />
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                            {lead.clientName}
                          </div>
                          {lead.source && (
                            <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', padding: '1px 6px', borderRadius: '4px' }}>
                              {lead.source}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-muted)', fontSize: '12px' }}>
                          <div>{lead.phone}</div>
                          {lead.email && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{lead.email}</div>}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {lead.serviceType || 'Equity Advisory'}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <span style={{
                            fontSize: '11px', 
                            fontWeight: 700, 
                            padding: '3px 8px', 
                            borderRadius: '12px',
                            background: lead.status === 'Converted' ? '#dcfce7' : lead.status === 'Lost' ? '#fee2e2' : lead.status === 'Trial Active' ? '#ede9fe' : '#e0f2fe',
                            color: lead.status === 'Converted' ? '#15803d' : lead.status === 'Lost' ? '#b91c1c' : lead.status === 'Trial Active' ? '#6d28d9' : '#0369a1',
                            border: `1px solid ${lead.status === 'Converted' ? '#86efac' : lead.status === 'Lost' ? '#fca5a5' : lead.status === 'Trial Active' ? '#c4b5fd' : '#7dd3fc'}`
                          }}>
                            {lead.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: lead.assignedToName ? '#10b981' : '#94a3b8' }} />
                            <strong style={{ fontSize: '12.5px', color: lead.assignedToName ? 'var(--text-primary)' : '#94a3b8' }}>
                              {lead.assignedToName || 'Unassigned Pool'}
                            </strong>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
                          {lead.expectedRevenue > 0 ? `₹${lead.expectedRevenue.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={32} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No leads matching current filters</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try clearing the search query or status filter.</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
