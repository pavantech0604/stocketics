import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Plus, 
  Search, 
  X, 
  Trash2, 
  Info,
  ShieldCheck,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Filter,
  ArrowLeft
} from 'lucide-react';

export interface ITTicket {
  id: string;
  problemFor: string;
  description: string;
  createDate: string;
  createBy: string;
  creatorRole?: string;
  modifiedBy: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
}

const INITIAL_TICKETS: ITTicket[] = [
  {
    id: 'it-101',
    problemFor: 'Network / Internet',
    description: 'Trading floor router switch 2 experiencing packet drops during NSE opening bell (09:15 AM).',
    createDate: '08-09-2026',
    createBy: 'Rohan Deshmukh',
    creatorRole: 'employee',
    modifiedBy: 'IT Admin (Ramesh)',
    status: 'In Progress',
    priority: 'Urgent'
  },
  {
    id: 'it-102',
    problemFor: 'Biometrics / Punch Device',
    description: 'Floor 3 biometric fingerprint scanner failed to sync morning punch records for 4 executives.',
    createDate: '08-09-2026',
    createBy: 'Priya Sharma',
    creatorRole: 'hr',
    modifiedBy: 'IT Admin (Ramesh)',
    status: 'Open',
    priority: 'High'
  },
  {
    id: 'it-103',
    problemFor: 'CRM Access & Permissions',
    description: 'New advisor Sneha Kapur requires HNI derivative lead allocation rights in Stocketics CRM.',
    createDate: '07-09-2026',
    createBy: 'Arjun Malhotra',
    creatorRole: 'manager',
    modifiedBy: 'Super Admin',
    status: 'Resolved',
    priority: 'Medium'
  }
];

export const ITProblemView: React.FC = () => {
  const { setActiveTab, showToast, role, currentUser } = useApp();

  // Load tickets with localStorage persistence
  const [tickets, setTickets] = useState<ITTicket[]>(() => {
    try {
      const saved = localStorage.getItem('stocketics_it_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TICKETS;
  });

  // Save tickets on change
  useEffect(() => {
    try {
      localStorage.setItem('stocketics_it_tickets', JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  // Synchronize live if tickets are submitted from other CRM modals
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('stocketics_it_tickets');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setTickets(parsed);
        }
      } catch {}
    };
    window.addEventListener('it_tickets_updated', handleSync);
    return () => window.removeEventListener('it_tickets_updated', handleSync);
  }, []);

  // Strict Role-Based Permissions:
  // Managers and HR can manage, update status, and delete.
  // Employees and Team Leaders can submit and view, but have NO Action column and CANNOT make changes.
  const canManageTickets = role === 'manager' || role === 'hr';

  // Current active user name for attribution and "My Tickets" filtering
  const currentUserName = currentUser?.name || (
    role === 'employee' ? 'Rohan Deshmukh' :
    role === 'team_leader' ? 'Vikram Malhotra' :
    role === 'manager' ? 'Arjun Singhania' :
    'Priya Sharma'
  );

  // Quick Tab View Filter
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'my' | 'pending' | 'resolved'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Search filter states
  const [fromDate, setFromDate] = useState('08-09-2026');
  const [toDate, setToDate] = useState('08-09-2026');
  const [selectedProblemFor, setSelectedProblemFor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Add IT Problem Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProblemFor, setNewProblemFor] = useState('Software / CRM');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  const handleSearch = () => {
    setIsFilterActive(true);
    showToast('Applied IT Problem search filters', 'info');
  };

  const handleResetSearch = () => {
    setIsFilterActive(false);
    setSelectedProblemFor('');
    setSelectedStatus('');
    setSearchKeyword('');
  };

  // Filtered tickets calculation
  const filteredTickets = tickets.filter(ticket => {
    // Tab Filter
    if (activeTabFilter === 'my') {
      const isMyTicket = ticket.createBy.toLowerCase().includes(currentUserName.toLowerCase()) ||
        (ticket.creatorRole && ticket.creatorRole === role);
      if (!isMyTicket) return false;
    } else if (activeTabFilter === 'pending') {
      if (ticket.status !== 'Open' && ticket.status !== 'In Progress') return false;
    } else if (activeTabFilter === 'resolved') {
      if (ticket.status !== 'Resolved' && ticket.status !== 'Closed') return false;
    }

    // Keyword Filter
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matches = 
        ticket.problemFor.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        ticket.createBy.toLowerCase().includes(q) ||
        ticket.status.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Form Filter
    if (!isFilterActive) return true;
    if (selectedProblemFor && !ticket.problemFor.toLowerCase().includes(selectedProblemFor.toLowerCase())) {
      return false;
    }
    if (selectedStatus && ticket.status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  const myTicketsCount = tickets.filter(t => 
    t.createBy.toLowerCase().includes(currentUserName.toLowerCase()) || 
    (t.creatorRole && t.creatorRole === role)
  ).length;

  const pendingCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      showToast('Please enter a description for the IT problem', 'error');
      return;
    }

    const created: ITTicket = {
      id: `it-${Date.now().toString().slice(-4)}`,
      problemFor: newProblemFor,
      description: newDescription.trim(),
      createDate: new Date().toLocaleDateString('en-GB'),
      createBy: currentUserName,
      creatorRole: role,
      modifiedBy: 'IT Infrastructure Desk',
      status: 'Open',
      priority: newPriority
    };

    const updated = [created, ...tickets];
    setTickets(updated);
    try {
      localStorage.setItem('stocketics_it_tickets', JSON.stringify(updated));
      window.dispatchEvent(new Event('it_tickets_updated'));
    } catch {}

    setIsAddModalOpen(false);
    setNewDescription('');
    showToast(`IT Problem ticket logged successfully by ${currentUserName}! IT Support has been notified.`, 'success');
  };

  const handleToggleStatus = (id: string) => {
    if (!canManageTickets) {
      showToast('Read-only: Employees and Team Leaders cannot modify IT ticket status', 'info');
      return;
    }

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const nextStatus: ITTicket['status'] = 
          t.status === 'Open' ? 'In Progress' :
          t.status === 'In Progress' ? 'Resolved' :
          t.status === 'Resolved' ? 'Closed' : 'Open';
        return { ...t, status: nextStatus, modifiedBy: currentUserName };
      })
    );
    showToast('Updated ticket status', 'info');
  };

  const handleDelete = (id: string) => {
    if (!canManageTickets) {
      showToast('Access Denied: Employees and Team Leaders cannot delete IT problem tickets', 'error');
      return;
    }
    setTickets(prev => prev.filter(t => t.id !== id));
    showToast('Ticket removed successfully', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Title & Top Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.25rem' }}>
        <div>
          <h1 className="page-title-ref" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            IT Problem
          </h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Corporate IT helpdesk, workstation issues, trading connectivity & infrastructure logs
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {/* Add IT Problem Button: Available for Employee, TL, Manager, HR */}
          <button 
            type="button"
            className="btn-ref-blue action-btn-interactive"
            onClick={() => setIsAddModalOpen(true)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6,
              fontWeight: 600,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Add IT Problem</span>
          </button>

          <button 
            type="button"
            className="btn-ref-back action-btn-interactive"
            onClick={() => setActiveTab('dashboard')}
            title="Return to Dashboard"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 5,
              fontWeight: 600,
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>
      </div>


      {/* Interactive Navigation Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTabFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTabFilter === 'all' ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
              background: activeTabFilter === 'all' ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
              color: activeTabFilter === 'all' ? '#0284c7' : 'var(--text-secondary)'
            }}
          >
            All Tickets ({tickets.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter('my')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTabFilter === 'my' ? '1px solid #f97316' : '1px solid var(--border-subtle)',
              background: activeTabFilter === 'my' ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-surface)',
              color: activeTabFilter === 'my' ? '#ea580c' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <User size={13} />
            My Reported Tickets ({myTicketsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter('pending')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTabFilter === 'pending' ? '1px solid #eab308' : '1px solid var(--border-subtle)',
              background: activeTabFilter === 'pending' ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-surface)',
              color: activeTabFilter === 'pending' ? '#ca8a04' : 'var(--text-secondary)'
            }}
          >
            Open / Pending ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter('resolved')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTabFilter === 'resolved' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              background: activeTabFilter === 'resolved' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
              color: activeTabFilter === 'resolved' ? '#059669' : 'var(--text-secondary)'
            }}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Quick Search Box */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tickets / reporter..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '6px 24px 6px 28px',
              fontSize: '0.78rem',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)'
            }}
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 0
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Card Matching Reference Image 4 */}
      <div className="filter-card-ref">
        <input 
          type="text"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="filter-input-ref"
          placeholder="08-09-2026"
          title="From Date"
        />

        <input 
          type="text"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="filter-input-ref"
          placeholder="08-09-2026"
          title="To Date"
        />

        <select 
          className="filter-select-ref"
          value={selectedProblemFor}
          onChange={(e) => setSelectedProblemFor(e.target.value)}
        >
          <option value="">Problem for</option>
          <option value="Hardware">Hardware / PC</option>
          <option value="Software">Software / CRM</option>
          <option value="Network">Network / Internet</option>
          <option value="Biometrics">Biometrics / Attendance</option>
          <option value="Telephony">Telephony / Dialer</option>
          <option value="Access">Access & Permissions</option>
        </select>

        <select 
          className="filter-select-ref"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <button 
          onClick={handleSearch}
          className="btn-ref-blue"
        >
          search
        </button>

        {(isFilterActive || selectedProblemFor || selectedStatus || searchKeyword) && (
          <button 
            onClick={handleResetSearch}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.45rem 0.85rem' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table Container Matching Image 4 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Problem for</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Create date</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Create by</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Modified by</th>
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Status</th>
                {/* ACTION COLUMN: Visible ONLY to Managers and HR; Completely hidden for Employee and Team Leader */}
                {canManageTickets && (
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                /* Empty state matching Image 4: Record Not Found */
                <tr>
                  <td colSpan={canManageTickets ? 7 : 6} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.92rem' }}>
                    Record Not Found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, idx) => {
                  const isMyCreatedTicket = ticket.createBy.toLowerCase().includes(currentUserName.toLowerCase()) ||
                    (ticket.creatorRole && ticket.creatorRole === role);

                  return (
                    <tr 
                      key={ticket.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isMyCreatedTicket 
                          ? 'rgba(2, 132, 199, 0.03)' 
                          : (idx % 2 === 0 ? '#ffffff' : '#f8fafc')
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{ticket.problemFor}</span>
                          {ticket.priority && (
                            <span style={{
                              fontSize: '0.66rem',
                              padding: '1px 5px',
                              borderRadius: 4,
                              fontWeight: 700,
                              background: ticket.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.15)' :
                                ticket.priority === 'High' ? 'rgba(249, 115, 22, 0.15)' :
                                ticket.priority === 'Medium' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                              color: ticket.priority === 'Urgent' ? '#ef4444' :
                                ticket.priority === 'High' ? '#ea580c' :
                                ticket.priority === 'Medium' ? '#2563eb' : '#4b5563'
                            }}>
                              {ticket.priority}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#334155', maxWidth: '340px' }}>
                        {ticket.description}
                      </td>
                      <td className="mono-cell" style={{ padding: '0.75rem 1rem', fontSize: '0.84rem', color: '#64748b' }}>
                        {ticket.createDate}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>{ticket.createBy}</span>
                          {isMyCreatedTicket && (
                            <span style={{
                              fontSize: '0.66rem',
                              padding: '1px 4px',
                              borderRadius: 4,
                              background: 'rgba(2, 132, 199, 0.12)',
                              color: '#0284c7',
                              fontWeight: 800
                            }}>
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem', color: '#64748b' }}>
                        {ticket.modifiedBy}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem' }}>
                        <span 
                          onClick={canManageTickets ? () => handleToggleStatus(ticket.id) : undefined}
                          className={`delta-badge ${
                            ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'positive' :
                            ticket.status === 'In Progress' ? 'warning' : 'primary'
                          }`}
                          style={{ cursor: canManageTickets ? 'pointer' : 'default' }}
                          title={canManageTickets ? "Click to advance status" : `Ticket Status: ${ticket.status} (Managed by IT Desk)`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      {/* ACTION COLUMN CELLS: Only rendered for Managers and HR */}
                      {canManageTickets && (
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button 
                              type="button"
                              onClick={() => handleToggleStatus(ticket.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              title="Advance Status"
                            >
                              Update
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDelete(ticket.id)}
                              title="Delete Ticket"
                              style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add IT Problem Modal: Accessible by all roles */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '580px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: 6, borderRadius: 8, background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Log New IT Problem</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Reporting as: <strong style={{ color: '#0284c7' }}>{currentUserName}</strong> ({role.toUpperCase()})
                  </span>
                </div>
              </div>
              <button 
                type="button"
                className="btn-icon" 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Problem For / Category *
                </label>
                <select 
                  className="input-field"
                  value={newProblemFor}
                  onChange={(e) => setNewProblemFor(e.target.value)}
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="Hardware / PC">Hardware / PC & Laptop</option>
                  <option value="Software / CRM">Software / CRM Portal</option>
                  <option value="Network / Internet">Network / Internet & Leased Line</option>
                  <option value="Biometrics / Punch Device">Biometrics / Biometric Punch Device</option>
                  <option value="Telephony / Softphone">Telephony / VoIP Softphone</option>
                  <option value="CRM Access & Permissions">CRM Access & User Permissions</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Urgency / Priority
                </label>
                <select 
                  className="input-field"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="Low">Low - General Technical Question</option>
                  <option value="Medium">Medium - Standard Operational Issue</option>
                  <option value="High">High - Impeding Client Calls or Trades</option>
                  <option value="Urgent">Urgent - Trading Floor Down / System Failure</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Problem Description *
                </label>
                <textarea 
                  rows={4}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide precise details of the technical error, affected workstation or desk..."
                  className="input-field"
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ background: '#00a8ff', borderColor: '#00a8ff', color: '#ffffff' }}
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
