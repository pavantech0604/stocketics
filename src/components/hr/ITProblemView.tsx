import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Plus, 
  ArrowLeft, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  Monitor, 
  Wifi, 
  Key, 
  PhoneCall, 
  Fingerprint, 
  Trash2, 
  Edit 
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';

interface ITTicket {
  id: string;
  problemFor: string;
  description: string;
  createDate: string;
  createBy: string;
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
    createBy: 'Sirajul Fasal M',
    modifiedBy: 'IT Admin (Ramesh)',
    status: 'In Progress',
    priority: 'Urgent'
  },
  {
    id: 'it-102',
    problemFor: 'Biometrics / Punch Device',
    description: 'Floor 3 biometric fingerprint scanner failed to sync morning punch records for 4 executives.',
    createDate: '08-09-2026',
    createBy: 'Sindhu H S',
    modifiedBy: 'IT Admin (Ramesh)',
    status: 'Open',
    priority: 'High'
  },
  {
    id: 'it-103',
    problemFor: 'CRM Access & Permissions',
    description: 'New advisor Devika B requires HNI derivative lead allocation rights in Stocketics CRM.',
    createDate: '07-09-2026',
    createBy: 'Vinod Kumar K J',
    modifiedBy: 'Super Admin',
    status: 'Resolved',
    priority: 'Medium'
  }
];

export const ITProblemView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [tickets, setTickets] = useState<ITTicket[]>(INITIAL_TICKETS);

  // Search filter states
  const [fromDate, setFromDate] = useState('08-09-2026');
  const [toDate, setToDate] = useState('08-09-2026');
  const [selectedProblemFor, setSelectedProblemFor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Add IT Problem Modal
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
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!isFilterActive) return true;
    if (selectedProblemFor && !ticket.problemFor.toLowerCase().includes(selectedProblemFor.toLowerCase())) {
      return false;
    }
    if (selectedStatus && ticket.status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

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
      createDate: '08-09-2026',
      createBy: 'Sindhu H S',
      modifiedBy: 'Unassigned',
      status: 'Open',
      priority: newPriority
    };

    setTickets(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewDescription('');
    showToast('IT Problem ticket logged successfully!', 'success');
  };

  const handleToggleStatus = (id: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const nextStatus: ITTicket['status'] = 
          t.status === 'Open' ? 'In Progress' :
          t.status === 'In Progress' ? 'Resolved' :
          t.status === 'Resolved' ? 'Closed' : 'Open';
        return { ...t, status: nextStatus, modifiedBy: 'Sindhu H S' };
      })
    );
    showToast('Updated ticket status', 'info');
  };

  const handleDelete = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    showToast('Ticket removed', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip (Direct Match to Reference Image 4) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Title & Top Action Buttons (Matching Reference Image 4) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.25rem' }}>
        <h1 className="page-title-ref" style={{ margin: 0 }}>IT Problem</h1>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button 
            className="btn-ref-blue"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span>+ Add IT Problem</span>
          </button>

          <button 
            className="btn-ref-back"
            onClick={() => setActiveTab('dashboard')}
            title="Return to Dashboard"
          >
            <span>&lt;&lt; Back</span>
          </button>
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

        {isFilterActive && (
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
                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                /* Empty state matching Image 4: Record Not Found */
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'left', color: '#64748b', fontSize: '0.92rem' }}>
                    Record Not Found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, idx) => (
                  <tr 
                    key={ticket.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600, color: '#1e293b' }}>
                      {ticket.problemFor}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#334155', maxWidth: '340px' }}>
                      {ticket.description}
                    </td>
                    <td className="mono-cell" style={{ padding: '0.75rem 1rem', fontSize: '0.84rem', color: '#64748b' }}>
                      {ticket.createDate}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>
                      {ticket.createBy}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem', color: '#64748b' }}>
                      {ticket.modifiedBy}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem' }}>
                      <span 
                        onClick={() => handleToggleStatus(ticket.id)}
                        className={`delta-badge ${
                          ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'positive' :
                          ticket.status === 'In Progress' ? 'warning' : 'primary'
                        }`}
                        style={{ cursor: 'pointer' }}
                        title="Click to advance status"
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.84rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          onClick={() => handleToggleStatus(ticket.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Advance Status"
                        >
                          Update
                        </button>
                        <button 
                          onClick={() => handleDelete(ticket.id)}
                          title="Delete Ticket"
                          style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add IT Problem Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '580px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>+ Add New IT Problem</h3>
              <button 
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
                  <option value="Low">Low - General Question</option>
                  <option value="Medium">Medium - Standard Issue</option>
                  <option value="High">High - High Priority</option>
                  <option value="Urgent">Urgent - Trading Floor Down</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Problem Description *
                </label>
                <textarea 
                  rows={4}
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

      {/* Tips Modal removed */}
    </div>
  );
};
