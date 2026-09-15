import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { Home, RefreshCw, Search, ArrowRight, Users, Check, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LeadReassignmentView: React.FC = () => {
  const { setActiveTab, currentUser, employees, advisoryLeads, reassignLead, getTeamMemberIds, showToast } = useApp();
  const teamMemberIds = getTeamMemberIds(currentUser.id);
  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));
  const teamLeads = advisoryLeads.filter(l => teamMemberIds.includes(l.assignedToId));

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [targetEmployee, setTargetEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = teamLeads.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.clientName.toLowerCase().includes(q) || l.assignedToName.toLowerCase().includes(q) || l.phone.includes(q);
    }
    return true;
  });

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const handleReassign = () => {
    if (!targetEmployee || selectedLeads.length === 0) {
      showToast('Select leads and a target employee first.', 'warning');
      return;
    }
    const emp = teamEmployees.find(e => e.id === targetEmployee);
    if (!emp) return;
    selectedLeads.forEach(leadId => {
      reassignLead(leadId, targetEmployee, emp.name);
    });
    confetti({ particleCount: 40, spread: 50 });
    setSelectedLeads([]);
    setTargetEmployee('');
  };

  // Capacity visualization
  const capacityData = teamEmployees.map(emp => {
    const count = advisoryLeads.filter(l => l.assignedToId === emp.id).length;
    return { ...emp, leadCount: count };
  });
  const maxLeads = Math.max(...capacityData.map(c => c.leadCount), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Dashboard</span>
          </span>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Lead Reassignment</span>
        </div>
      </div>

      <h1 className="page-title-ref" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <RefreshCw size={24} style={{ color: '#06b6d4' }} /> Lead Reassignment Center
      </h1>

      {/* Employee Capacity Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {capacityData.map(emp => {
          const pct = Math.round((emp.leadCount / maxLeads) * 100);
          const isTarget = targetEmployee === emp.id;
          return (
            <div key={emp.id} className="card" onClick={() => setTargetEmployee(isTarget ? '' : emp.id)} style={{
              padding: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
              border: isTarget ? '2px solid #06b6d4' : '1px solid var(--border-subtle)',
              background: isTarget ? 'rgba(6,182,212,0.05)' : 'var(--bg-surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <img src={emp.avatar} alt={emp.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.leadCount} leads</div>
                </div>
                {isTarget && <Check size={18} style={{ color: '#06b6d4' }} />}
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 3, transition: 'width 0.4s',
                  background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      {selectedLeads.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
          background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
          </span>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          <select value={targetEmployee} onChange={e => setTargetEmployee(e.target.value)} style={{
            padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', flex: 1, maxWidth: '250px',
          }}>
            <option value="">Select target employee...</option>
            {teamEmployees.map(e => <option key={e.id} value={e.id}>{e.name} ({advisoryLeads.filter(l => l.assignedToId === e.id).length} leads)</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleReassign} disabled={!targetEmployee} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <RefreshCw size={14} /> Reassign
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..." style={{ width: '100%', padding: '0.45rem 0.6rem 0.45rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }} />
        </div>
        {['all', 'New Lead', 'In Contact', 'Trial Active', 'Converted', 'Lost'].map(s => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus(s)} style={{ fontSize: '0.76rem', textTransform: 'capitalize' }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
              <th style={{ padding: '0.5rem 0.75rem', width: 40 }}>
                <input type="checkbox" checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} onChange={toggleAll} style={{ accentColor: '#06b6d4' }} />
              </th>
              {['Client Name', 'Phone', 'Service', 'Status', 'Assigned To', 'Revenue'].map(h => (
                <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: selectedLeads.includes(lead.id) ? 'rgba(6,182,212,0.05)' : 'transparent', transition: 'background 0.2s' }}>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleLead(lead.id)} style={{ accentColor: '#06b6d4' }} />
                </td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{lead.clientName}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>{lead.phone}</td>
                <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>{lead.serviceType}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px',
                    background: lead.status === 'Converted' ? 'rgba(16,185,129,0.12)' : lead.status === 'Lost' ? 'rgba(239,68,68,0.12)' : lead.status === 'Trial Active' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)',
                    color: lead.status === 'Converted' ? '#059669' : lead.status === 'Lost' ? '#dc2626' : lead.status === 'Trial Active' ? '#7c3aed' : '#2563eb',
                  }}>{lead.status}</span>
                </td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, fontSize: '0.82rem' }}>{lead.assignedToName}</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>₹{lead.expectedRevenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No leads found.</div>
        )}
      </div>
    </div>
  );
};
