import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  List, 
  FileText, 
  User, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

interface StaffLeaveEntry {
  id: string;
  employeeName: string;
  role: string;
  leaveType: 'Paid Time Off' | 'Sick Leave' | 'Emergency Leave' | 'Comp-off';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Declined';
  appliedDate: string;
  managerNote?: string;
}

const INITIAL_LEAVES_DATA: StaffLeaveEntry[] = [
  {
    id: 'lev-1',
    employeeName: 'Sneha Kapur',
    role: 'Derivatives Analyst',
    leaveType: 'Paid Time Off',
    startDate: '2026-09-11',
    endDate: '2026-09-14',
    daysCount: 3,
    reason: 'Family event and travel to Jaipur',
    status: 'Pending',
    appliedDate: '06-Sep-2026'
  },
  {
    id: 'lev-2',
    employeeName: 'Ananya Sen',
    role: 'Advisory Sales Specialist',
    leaveType: 'Paid Time Off',
    startDate: '2026-09-07',
    endDate: '2026-09-08',
    daysCount: 2,
    reason: 'Personal medical appointment and rest',
    status: 'Approved',
    appliedDate: '01-Sep-2026',
    managerNote: 'Handover complete with Rohan D.'
  },
  {
    id: 'lev-3',
    employeeName: 'Karan Mehra',
    role: 'Talent Acquisition',
    leaveType: 'Sick Leave',
    startDate: '2026-09-02',
    endDate: '2026-09-03',
    daysCount: 2,
    reason: 'Viral fever and doctor consultation',
    status: 'Approved',
    appliedDate: '02-Sep-2026',
    managerNote: 'Approved on medical grounds.'
  },
  {
    id: 'lev-4',
    employeeName: 'Rohan Deshmukh',
    role: 'Senior Sales Executive',
    leaveType: 'Emergency Leave',
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    daysCount: 2,
    reason: 'Personal family emergency',
    status: 'Declined',
    appliedDate: '24-Aug-2026',
    managerNote: 'Declined due to quarterly market settlement expiry week.'
  }
];

export const LeaveManagementView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  // Sub-options: 'new-entry', 'leave-list', 'approved-leaves', 'rejected-leaves'
  const getSubTab = (): 'new' | 'list' | 'approved' | 'rejected' => {
    if (activeTab === 'new-entry' || activeTab === 'apply-leave') return 'new';
    if (activeTab === 'approved-leaves' || activeTab === 'approved') return 'approved';
    if (activeTab === 'rejected-leaves' || activeTab === 'rejected') return 'rejected';
    return 'list';
  };

  const [currentTab, setCurrentTab] = useState<'new' | 'list' | 'approved' | 'rejected'>(getSubTab());
  const [leavesList, setLeavesList] = useState<StaffLeaveEntry[]>(INITIAL_LEAVES_DATA);
  const [searchTerm, setSearchTerm] = useState('');

  // New Leave Form
  const [formData, setFormData] = useState({
    employeeName: 'Sneha Kapur',
    leaveType: 'Paid Time Off' as StaffLeaveEntry['leaveType'],
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: 'new' | 'list' | 'approved' | 'rejected', tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleSubmitNewEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) return;

    const newId = `lev-${Math.floor(100 + Math.random() * 900)}`;
    const created: StaffLeaveEntry = {
      id: newId,
      employeeName: formData.employeeName,
      role: 'Staff Member',
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysCount: 2,
      reason: formData.reason,
      status: 'Approved',
      appliedDate: '07-Sep-2026',
      managerNote: 'Direct entry logged and authorized by Manager.'
    };

    setLeavesList(prev => [created, ...prev]);
    showToast(`Leave entry logged successfully for ${formData.employeeName}`, 'success');
    setFormData({
      employeeName: 'Sneha Kapur',
      leaveType: 'Paid Time Off',
      startDate: '',
      endDate: '',
      reason: ''
    });
    handleTabChange('list', 'leave-list');
  };

  const handleApprove = (id: string) => {
    setLeavesList(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved', managerNote: 'Approved by Manager' } : l));
    showToast('Leave request approved!', 'success');
  };

  const handleDecline = (id: string) => {
    setLeavesList(prev => prev.map(l => l.id === id ? { ...l, status: 'Declined', managerNote: 'Declined by Manager' } : l));
    showToast('Leave request declined.', 'info');
  };

  const filteredLeaves = leavesList.filter(l => {
    const matchSearch = 
      l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());

    if (currentTab === 'approved') return matchSearch && l.status === 'Approved';
    if (currentTab === 'rejected') return matchSearch && l.status === 'Declined';
    return matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Leave</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'new' && 'New Entry'}
            {currentTab === 'list' && 'List'}
            {currentTab === 'approved' && 'Approved'}
            {currentTab === 'rejected' && 'Rejected'}
          </span>
        </div>
      </div>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Team Leave & Attendance Roster
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Manage staff time-off applications, audit rosters, and record executive leave entries.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => handleTabChange('new', 'new-entry')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> New Leave Entry
        </button>
      </div>

      {/* Sub-Options Nav Tabs: Exact Names New Entry, List, Approved, Rejected */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'new' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('new', 'new-entry')}
        >
          <Plus size={14} /> New Entry
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('list', 'leave-list')}
        >
          <List size={14} /> List ({leavesList.length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('approved', 'approved-leaves')}
        >
          <CheckCircle2 size={14} /> Approved ({leavesList.filter(l => l.status === 'Approved').length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('rejected', 'rejected-leaves')}
        >
          <XCircle size={14} /> Rejected ({leavesList.filter(l => l.status === 'Declined').length})
        </button>
      </div>

      {/* TAB 1: NEW ENTRY (Interactive Form) */}
      {currentTab === 'new' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Plus size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Log New Leave Entry</span>
              </div>
              <div className="card-subtitle">Authorize staff PTO, sick time, or comp-off directly</div>
            </div>
          </div>

          <form onSubmit={handleSubmitNewEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Employee *</label>
              <select 
                className="form-select"
                value={formData.employeeName}
                onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
              >
                <option value="Sneha Kapur">Sneha Kapur (Derivatives Analyst)</option>
                <option value="Rohan Deshmukh">Rohan Deshmukh (Sales Executive)</option>
                <option value="Ananya Sen">Ananya Sen (Advisory Sales)</option>
                <option value="Aditya Roy">Aditya Roy (Research Analyst)</option>
                <option value="Karan Mehra">Karan Mehra (HR Executive)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Leave Type *</label>
              <select 
                className="form-select"
                value={formData.leaveType}
                onChange={e => setFormData({ ...formData, leaveType: e.target.value as any })}
              >
                <option value="Paid Time Off">Paid Time Off (Annual Quota)</option>
                <option value="Sick Leave">Sick Leave (Medical)</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Comp-off">Comp-off (Weekend Shift Adjustment)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">From Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">To Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Justification *</label>
              <textarea 
                className="form-textarea" 
                rows={3}
                required
                placeholder="Reason for time-off..."
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => handleTabChange('list', 'leave-list')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record & Authorize Leave
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2, 3, 4: LIST, APPROVED, REJECTED */}
      {currentTab !== 'new' && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '420px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search staff name, reason..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredLeaves.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No records found in this category.
              </div>
            ) : (
              filteredLeaves.map(item => (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {item.employeeName}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• {item.role}</span>
                        <span className="delta-badge" style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem' }}>
                          {item.leaveType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        <strong>Dates:</strong> {item.startDate} to {item.endDate} ({item.daysCount} Day{item.daysCount > 1 ? 's' : ''})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Reason: "{item.reason}"
                      </div>
                      {item.managerNote && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--stocketics-blue-500)', marginTop: '0.25rem', fontWeight: 600 }}>
                          Manager Note: {item.managerNote}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {item.status === 'Pending' ? (
                        <>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDecline(item.id)}
                          >
                            <XCircle size={14} /> Decline
                          </button>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(item.id)}
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        </>
                      ) : (
                        <span className={`delta-badge ${item.status === 'Approved' ? 'positive' : 'negative'}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
