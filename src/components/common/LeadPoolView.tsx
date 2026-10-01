import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { DataTable } from './DataTable';
import { Upload, UserPlus, RefreshCw, Filter, Download, Phone, Mail, MapPin, Tag, Clock, AlertTriangle, CheckCircle, XCircle, Users } from 'lucide-react';
import type { AdvisoryLead } from '../../types';

// ─── Status Badge ─────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    'New Lead':       { bg: 'var(--status-new-bg)',       color: 'var(--status-new-text)',       label: 'New' },
    'In Contact':     { bg: 'var(--status-followup-bg)',  color: 'var(--status-followup-text)',  label: 'In Contact' },
    'Trial Active':   { bg: 'var(--status-interested-bg)',color: 'var(--status-interested-text)',label: 'Trial' },
    'Converted':      { bg: 'var(--status-client-bg)',    color: 'var(--status-client-text)',    label: 'Converted' },
    'Lost':           { bg: 'var(--status-lost-bg)',      color: 'var(--status-lost-text)',      label: 'Lost' },
  };
  const s = map[status] || { bg: 'var(--status-dnd-bg)', color: 'var(--status-dnd-text)', label: status };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', fontSize: 11, fontWeight: 700, borderRadius: 999, background: s.bg, color: s.color, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
      {s.label}
    </span>
  );
};

// ─── Response Badge ───────────────────────────────────────────────────────
const ResponseBadge: React.FC<{ response?: string }> = ({ response }) => {
  if (!response) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
  const r = response.toLowerCase();
  let bg = 'var(--bg-surface-alt)', color = 'var(--text-muted)';
  if (r.includes('interested') || r.includes('call back')) { bg = 'var(--status-interested-bg)'; color = 'var(--status-interested-text)'; }
  else if (r.includes('not interested') || r.includes('dnd')) { bg = 'var(--status-lost-bg)'; color = 'var(--status-lost-text)'; }
  else if (r.includes('converted') || r.includes('paid')) { bg = 'var(--status-client-bg)'; color = 'var(--status-client-text)'; }
  return <span style={{ display: 'inline-flex', height: 20, padding: '0 6px', fontSize: 10.5, fontWeight: 700, borderRadius: 999, background: bg, color }}>{response}</span>;
};

// ─── Tab Config ───────────────────────────────────────────────────────────
type TabId = 'all' | 'unassigned' | 'assigned' | 'recent' | 'followup' | 'interested' | 'converted';
interface TabDef { id: TabId; label: string; icon: React.ReactNode; color?: string; }
const TABS: TabDef[] = [
  { id: 'all',        label: 'All Leads',    icon: <Users size={13} /> },
  { id: 'unassigned', label: 'Unassigned',   icon: <AlertTriangle size={13} />, color: 'var(--warning)' },
  { id: 'assigned',   label: 'Assigned',     icon: <UserPlus size={13} />, color: 'var(--info)' },
  { id: 'followup',   label: 'Follow-up Due',icon: <Clock size={13} />, color: 'var(--kpi-prospect)' },
  { id: 'interested', label: 'Interested',   icon: <CheckCircle size={13} />, color: 'var(--status-interested)' },
  { id: 'converted',  label: 'Converted',    icon: <CheckCircle size={13} />, color: 'var(--status-client)' },
];

// ─── Main Component ───────────────────────────────────────────────────────
export const LeadPoolView: React.FC = () => {
  const { advisoryLeads, role, currentUser, setActiveTab } = useApp();
  const [activeTab, setTab] = useState<TabId>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const isManager = role === 'manager';
  const isTeamLeader = role === 'team_leader';

  // Filter leads based on role
  const myLeads = useMemo(() => {
    if (isManager) return advisoryLeads;
    if (isTeamLeader) return advisoryLeads.filter(l => l.teamLeaderId === currentUser?.id || l.assignedToId === currentUser?.id);
    return advisoryLeads.filter(l => l.assignedToId === currentUser?.id);
  }, [advisoryLeads, role, currentUser]);

  // Tab filtering
  const tabData = useMemo(() => {
    const now = new Date();
    switch (activeTab) {
      case 'unassigned': return myLeads.filter(l => !l.assignedToId || l.isTeamPool);
      case 'assigned':   return myLeads.filter(l => l.assignedToId && !l.isTeamPool);
      case 'followup':   return myLeads.filter(l => {
        if (!l.callbackDate) return false;
        const cb = new Date(l.callbackDate);
        return cb <= now && l.status !== 'Converted' && l.status !== 'Lost';
      });
      case 'interested': return myLeads.filter(l => {
        const r = (l.response || '').toLowerCase();
        return r.includes('interested') || r.includes('call back');
      });
      case 'converted':  return myLeads.filter(l => l.status === 'Converted');
      default:           return myLeads;
    }
  }, [myLeads, activeTab]);

  // Client-side search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tabData;
    const q = searchQuery.toLowerCase();
    return tabData.filter(l =>
      l.clientName?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.source?.toLowerCase().includes(q) ||
      l.assignedToName?.toLowerCase().includes(q)
    );
  }, [tabData, searchQuery]);

  // KPI counts
  const kpis = useMemo(() => ({
    total:      myLeads.length,
    unassigned: myLeads.filter(l => !l.assignedToId || l.isTeamPool).length,
    interested: myLeads.filter(l => (l.response||'').toLowerCase().includes('interested')).length,
    converted:  myLeads.filter(l => l.status === 'Converted').length,
  }), [myLeads]);

  const columns = [
    {
      key: 'clientName', header: 'Lead', sortable: true, minWidth: '200px',
      render: (lead: AdvisoryLead) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 2 }}>{lead.clientName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {lead.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, color: 'var(--text-muted)' }}><Phone size={10}/>{lead.phone}</span>}
            {lead.email && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, color: 'var(--text-muted)' }}><Mail size={10}/>{lead.email}</span>}
          </div>
        </div>
      )
    },
    {
      key: 'status', header: 'Status', sortable: true, width: '130px',
      render: (lead: AdvisoryLead) => <StatusBadge status={lead.status} />
    },
    {
      key: 'response', header: 'Response', sortable: true, width: '150px',
      render: (lead: AdvisoryLead) => <ResponseBadge response={lead.response} />
    },
    {
      key: 'city', header: 'Location', sortable: true, width: '140px',
      render: (lead: AdvisoryLead) => lead.city ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--text-secondary)' }}>
          <MapPin size={11} /> {lead.city}
        </span>
      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
    },
    {
      key: 'source', header: 'Source', sortable: true, width: '120px',
      render: (lead: AdvisoryLead) => lead.source ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Tag size={10} /> {lead.source}
        </span>
      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
    },
    {
      key: 'assignedToName', header: 'Assigned To', sortable: true, width: '160px',
      render: (lead: AdvisoryLead) => lead.assignedToName ? (
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{lead.assignedToName}</p>
          {lead.teamLeaderName && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>via {lead.teamLeaderName}</p>}
        </div>
      ) : <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>Unassigned</span>
    },
    {
      key: 'callbackDate', header: 'Follow-up', sortable: true, width: '130px',
      render: (lead: AdvisoryLead) => {
        if (!lead.callbackDate) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
        const date = new Date(lead.callbackDate);
        const isOverdue = date < new Date() && lead.status !== 'Converted';
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isOverdue ? 700 : 400 }}>
            <Clock size={11} style={{ flexShrink: 0 }} />
            {isOverdue && <AlertTriangle size={11} />}
            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        );
      }
    },
  ];

  const rowActions = [
    {
      label: 'View Details',
      onClick: (_lead: AdvisoryLead) => { /* Navigate to lead detail */ },
    },
    {
      label: 'Schedule Follow-up',
      onClick: (_lead: AdvisoryLead) => { /* Open follow-up modal */ },
      disabled: (lead: AdvisoryLead) => lead.status === 'Converted' || lead.status === 'Lost',
    },
    ...(isManager || isTeamLeader ? [{
      label: 'Reassign Lead',
      onClick: (_lead: AdvisoryLead) => { /* Open reassign modal */ },
    }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-canvas)' }}>
      {/* Header */}
      <div style={{ padding: '20px 28px 0', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Lead Pool</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage and track all leads in your pipeline</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(isManager || isTeamLeader) && (
              <button
                onClick={() => setActiveTab('allot_leads')}
                style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', fontSize: 13.5, fontWeight: 700, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--stocketics-blue-600)', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,115,183,0.3)', transition: 'all var(--transition-fast)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--stocketics-blue-500)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--stocketics-blue-600)')}
              >
                <UserPlus size={15} /> Allot Leads
              </button>
            )}
            {isManager && (
              <button
                onClick={() => setActiveTab('bulk_upload')}
                style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', fontSize: 13.5, fontWeight: 700, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-strong)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
              >
                <Upload size={15} /> Import Leads
              </button>
            )}
          </div>
        </div>

        {/* KPI Mini-Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Total Leads',  value: kpis.total,      color: 'var(--stocketics-blue-600)' },
            { label: 'Unassigned',   value: kpis.unassigned, color: 'var(--warning)' },
            { label: 'Interested',   value: kpis.interested, color: 'var(--status-interested)' },
            { label: 'Converted',    value: kpis.converted,  color: 'var(--status-client)' },
          ].map(kpi => (
            <div key={kpi.label} style={{ flex: 1, background: 'var(--bg-canvas)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 14px', minWidth: 100 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{kpi.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', marginBottom: -1, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setTab(tab.id); setSelectedIds(new Set()); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? (tab.color || 'var(--stocketics-blue-600)') : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2.5px solid ' + (tab.color || 'var(--stocketics-blue-600)') : '2.5px solid transparent',
                background: 'transparent', border: 'none', cursor: 'pointer',
                transition: 'all var(--transition-fast)', whiteSpace: 'nowrap',
              }}
            >
              {tab.icon} {tab.label}
              {tab.id !== 'all' && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: activeTab === tab.id ? (tab.color || 'var(--stocketics-blue-600)') : 'var(--bg-surface-alt)', color: activeTab === tab.id ? '#fff' : 'var(--text-muted)' }}>
                  {tabData.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 28px', background: 'var(--stocketics-blue-100)', borderBottom: '1px solid var(--stocketics-blue-100)' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--stocketics-blue-600)' }}>{selectedIds.size} leads selected</span>
          {(isManager || isTeamLeader) && (
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', fontSize: 13, fontWeight: 600, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--stocketics-blue-600)', color: '#fff', cursor: 'pointer' }}>
              <UserPlus size={13} /> Bulk Assign
            </button>
          )}
          <button onClick={() => setSelectedIds(new Set())} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', fontSize: 13, fontWeight: 600, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <XCircle size={13} /> Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', margin: '16px 28px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filteredData}
          rowKey={lead => lead.id}
          searchable
          searchPlaceholder='Search by name, phone, email, city, source...'
          onSearch={setSearchQuery}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          rowActions={rowActions}
          emptyTitle='No leads in this view'
          emptyMessage='Try a different tab or adjust your search query.'
          pageSize={25}
          topBarExtra={
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, height: 34, padding: '0 12px', fontSize: 12.5, fontWeight: 600, border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <Filter size={13} /> Filter
            </button>
          }
        />
      </div>
    </div>
  );
};

export default LeadPoolView;