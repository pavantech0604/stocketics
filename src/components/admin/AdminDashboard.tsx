import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { 
  ShieldCheck, Users, Database, Server, Settings, Activity, 
  AlertTriangle, CheckCircle2, ChevronRight, FileText, Search, UserCheck
} from 'lucide-react';
import { Employee, AdvisoryLead } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { 
    employees, 
    advisoryLeads, 
    leadSourcePools,
    teams,
    rolePermissions,
    currentUser,
    setActiveTab,
    showToast
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('overview');

  // ==========================================
  // DATA SELECTORS
  // ==========================================
  
  // Users & Roles
  const allUsers = employees || [];
  const activeUsers = allUsers.filter(u => u.status === 'Active');
  const inactiveUsers = allUsers.filter(u => u.status !== 'Active');
  const roleCounts = useMemo(() => {
    return allUsers.reduce((acc, user) => {
      const role = user.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [allUsers]);

  // Lead Quality
  const allLeads = advisoryLeads || [];
  const unassignedLeads = allLeads.filter(l => !l.assignedToId && !l.isTeamPool);
  const duplicateLeads = allLeads.filter(l => l.response?.toLowerCase().includes('duplicate') || l.description?.toLowerCase().includes('duplicate'));
  const invalidLeads = allLeads.filter(l => l.status === 'Lost' && (l.response?.toLowerCase().includes('invalid') || l.description?.toLowerCase().includes('invalid')));

  const leadsImportedToday = allLeads.filter(l => {
    if (!l.assignedAt) return false;
    const today = new Date().toISOString().split('T')[0];
    return l.assignedAt.startsWith(today);
  });

  // Admin Alerts / Needs Attention
  const needsAttention = useMemo(() => {
    const alerts: { type: string; msg: string; count: number; severity: 'high' | 'medium' | 'low' }[] = [];
    
    // Inactive users with leads
    const inactiveOwningLeads = inactiveUsers.filter(u => allLeads.some(l => l.assignedToId === u.id));
    if (inactiveOwningLeads.length > 0) {
      alerts.push({ type: 'inactive_leads', msg: `${inactiveOwningLeads.length} inactive users own active leads`, count: inactiveOwningLeads.length, severity: 'high' });
    }

    if (unassignedLeads.length > 0) {
      alerts.push({ type: 'unassigned', msg: `${unassignedLeads.length} leads are unassigned`, count: unassignedLeads.length, severity: 'medium' });
    }

    if (duplicateLeads.length > 0) {
      alerts.push({ type: 'duplicates', msg: `${duplicateLeads.length} duplicate leads require review`, count: duplicateLeads.length, severity: 'medium' });
    }

    // Role anomalies (e.g. employee without manager)
    const employeesWithoutManager = allUsers.filter(u => u.role === 'employee' && !u.managerId);
    if (employeesWithoutManager.length > 0) {
      alerts.push({ type: 'orphaned_employees', msg: `${employeesWithoutManager.length} employees lack reporting managers`, count: employeesWithoutManager.length, severity: 'medium' });
    }

    return alerts;
  }, [inactiveUsers, allLeads, unassignedLeads, duplicateLeads, allUsers]);

  const totalAlerts = needsAttention.reduce((sum, a) => sum + a.count, 0);

  // Configuration Overview
  const activeSources = leadSourcePools.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px', fontFamily: 'var(--font-family-base)' }}>
      {/* SECTION 1: ADMIN HEADER */}
      <div style={{ 
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)', 
        padding: '24px 32px', 
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={28} color="var(--stocketics-blue-600)" />
              System Administration
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
              CRM is operating normally. <strong>{activeUsers.length} active users</strong>, <strong>{unassignedLeads.length} unassigned leads</strong>, and <strong>{needsAttention.length} alerts</strong> require review.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: SYSTEM STATUS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Application Status', value: 'Operational', icon: <Server size={18} color="var(--success)" />, bg: 'var(--success-bg)' },
          { label: 'User Access', value: `${activeUsers.length} Active`, icon: <UserCheck size={18} color="var(--info)" />, bg: 'var(--info-bg)' },
          { label: 'Lead Data Quality', value: `${Math.round(((allLeads.length - duplicateLeads.length - invalidLeads.length) / (allLeads.length || 1)) * 100)}% Valid`, icon: <CheckCircle2 size={18} color="var(--stocketics-blue-600)" />, bg: 'var(--stocketics-blue-50)' },
          { label: 'Assignment Health', value: `${unassignedLeads.length} Unassigned`, icon: <Activity size={18} color="var(--warning)" />, bg: '#fffbeb' },
        ].map((status, i) => (
          <div key={i} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: status.bg }}>
            <div style={{ background: '#fff', padding: '10px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
              {status.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 4px 0' }}>{status.label}</p>
              <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{status.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 3: ADMIN KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Total Users', value: allUsers.length },
              { label: 'Total Leads', value: allLeads.length },
              { label: 'Managers', value: roleCounts['manager'] || 0 },
              { label: 'Team Leaders', value: roleCounts['team_leader'] || 0 },
              { label: 'Executives', value: roleCounts['employee'] || 0 },
              { label: 'Admin Alerts', value: totalAlerts, color: 'var(--danger)' },
            ].map((kpi, i) => (
              <div key={i} className="card" style={{ padding: '16px', borderTop: kpi.color ? `3px solid ${kpi.color}` : '3px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 8px 0' }}>{kpi.label}</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: kpi.color || 'var(--text-primary)' }}>{kpi.value}</h3>
              </div>
            ))}
          </div>

          {/* SECTION 4: ADMINISTRATIVE ATTENTION REQUIRED */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--danger-bg)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <AlertTriangle size={18} color="var(--danger)" /> Administrative Attention Required
            </h3>
            
            {needsAttention.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {needsAttention.map((alert, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: alert.severity === 'high' ? 'var(--danger-bg)' : '#fffbeb', borderRadius: '8px', border: `1px solid ${alert.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alert.severity === 'high' ? 'var(--danger)' : 'var(--warning)' }} />
                      <span style={{ fontSize: '14.5px', fontWeight: 600, color: alert.severity === 'high' ? '#991b1b' : '#92400e' }}>{alert.msg}</span>
                    </div>
                    <button style={{ background: '#fff', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Review</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', background: 'var(--success-bg)', borderRadius: '8px' }}>
                <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success)', margin: 0 }}>No critical administrative alerts.</p>
              </div>
            )}
          </div>

          {/* SECTION 6: USER ADMINISTRATION PREVIEW */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--text-secondary)" /> User Administration Overview
              </h3>
              <button style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Manage All Users</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.slice(0, 6).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                      <td style={{ padding: '12px 8px' }}>{u.role}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: u.status === 'Active' ? 'var(--success-bg)' : 'var(--danger-bg)', color: u.status === 'Active' ? 'var(--success)' : 'var(--danger)' }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <button style={{ background: 'transparent', border: '1px solid var(--border-subtle)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* SECTION 11 & 12: DATA QUALITY & IMPORT HEALTH */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={16} color="var(--stocketics-blue-600)" /> Lead Data Health
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Leads</span>
                  <span style={{ fontWeight: 700 }}>{allLeads.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Unassigned Leads</span>
                  <span style={{ fontWeight: 700, color: unassignedLeads.length > 0 ? 'var(--warning)' : 'inherit' }}>{unassignedLeads.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Duplicate Leads</span>
                  <span style={{ fontWeight: 700, color: duplicateLeads.length > 0 ? 'var(--danger)' : 'inherit' }}>{duplicateLeads.length}</span>
                </div>
                <button style={{ width: '100%', marginTop: '8px', background: 'transparent', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>Review Data Pool</button>
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--stocketics-blue-600)" /> Import Health
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Imported Today</span>
                  <span style={{ fontWeight: 700 }}>{leadsImportedToday.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Active Lead Sources</span>
                  <span style={{ fontWeight: 700 }}>{activeSources}</span>
                </div>
                <button style={{ width: '100%', marginTop: 'auto', background: 'var(--stocketics-blue-600)', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>Open Import Center</button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 7: ROLE & PERMISSION OVERVIEW */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--text-secondary)" /> Role Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(roleCounts).map(([role, count]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-surface-alt)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{role.replace('_', ' ')}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>{count} Users</span>
                </div>
              ))}
              <button style={{ background: 'transparent', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>Manage Permissions</button>
            </div>
          </div>

          {/* SECTION 9: ORGANIZATION STRUCTURE HEALTH */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="var(--text-secondary)" /> Organization Health
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Configured Teams</span>
                <span style={{ fontWeight: 700 }}>{teams?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Team Leaders</span>
                <span style={{ fontWeight: 700 }}>{roleCounts['team_leader'] || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: needsAttention.some(a => a.type === 'orphaned_employees') ? 'var(--warning)' : 'inherit' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Unmapped Executives</span>
                <span style={{ fontWeight: 700 }}>{needsAttention.find(a => a.type === 'orphaned_employees')?.count || 0}</span>
              </div>
            </div>
          </div>

          {/* SECTION 17: CONFIGURATION CENTER */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={16} color="var(--text-secondary)" /> System Configuration
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Lead Sources</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeSources} Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Teams & Hierarchy</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configured</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Global Settings</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Operational</span>
              </div>
              <button style={{ width: '100%', marginTop: '8px', background: 'transparent', border: 'none', color: 'var(--stocketics-blue-600)', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}>Open Settings &gt;</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
