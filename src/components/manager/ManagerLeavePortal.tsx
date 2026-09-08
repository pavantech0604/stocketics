import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  List,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TipsModal } from '../common/TipsModal';

interface ManagerLeaveEntry {
  id: string;
  applicant: string;
  leaveFor: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: 'Approved' | 'Pending' | 'Declined';
}

const INITIAL_MANAGER_LEAVES: ManagerLeaveEntry[] = [
  {
    id: 'l-01',
    applicant: 'Sirajul Fasal M',
    leaveFor: 'Medical Checkup',
    reason: 'Routine health checkup and eye consultation.',
    fromDate: '2026-09-12',
    toDate: '2026-09-13',
    status: 'Approved'
  },
  {
    id: 'l-02',
    applicant: 'Devika B',
    leaveFor: 'Family Occasion',
    reason: 'Sister marriage ceremony in Coimbatore.',
    fromDate: '2026-09-15',
    toDate: '2026-09-18',
    status: 'Pending'
  },
  {
    id: 'l-03',
    applicant: 'Golla Yugendra',
    leaveFor: 'Personal Emergency',
    reason: 'Bank documentation & property registration.',
    fromDate: '2026-09-20',
    toDate: '2026-09-20',
    status: 'Pending'
  }
];

export const ManagerLeavePortal: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'request' | 'list'>('request');
  const [leaveEntries, setLeaveEntries] = useState<ManagerLeaveEntry[]>(INITIAL_MANAGER_LEAVES);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Form State matching Image 8
  const [leaveFor, setLeaveFor] = useState('');
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveFor.trim() || !fromDate || !toDate) {
      showToast('Please fill in Leave For and date ranges.', 'warning');
      return;
    }

    const newEntry: ManagerLeaveEntry = {
      id: `l-${Date.now()}`,
      applicant: 'Vinod Kumar K J (Self)',
      leaveFor,
      reason,
      fromDate,
      toDate,
      status: 'Pending'
    };

    setLeaveEntries(prev => [newEntry, ...prev]);
    try {
      confetti({ particleCount: 50, spread: 50 });
    } catch (e) {}
    showToast('Leave request submitted to HR Operations successfully!', 'success');
    setLeaveFor('');
    setReason('');
    setFromDate('');
    setToDate('');
    setViewMode('list');
  };

  const handleApproveEntry = (id: string) => {
    setLeaveEntries(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
    showToast('Leave approved for desk member!', 'success');
  };

  const handleDeclineEntry = (id: string) => {
    setLeaveEntries(prev => prev.map(item => item.id === id ? { ...item, status: 'Declined' } : item));
    showToast('Leave declined.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip (Matching Reference Images 8 & 9) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={15} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Header with Subtab switch & << Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="page-title-ref" style={{ margin: 0 }}>Leave</h1>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              type="button"
              className={`btn btn-sm ${viewMode === 'request' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('request')}
            >
              <Plus size={13} />
              <span>Request Leave (Form)</span>
            </button>
            <button 
              type="button"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={13} />
              <span>Leave Records ({leaveEntries.length})</span>
            </button>
          </div>
        </div>

        <button 
          type="button"
          className="client-back-btn"
          onClick={() => setActiveTab('dashboard')}
          title="Return to Dashboard"
        >
          &lt;&lt; Back
        </button>
      </div>

      {/* VIEW 1: REQUEST LEAVE FORM (Matching Reference Image 8) */}
      {viewMode === 'request' && (
        <div className="sms-panel-card" style={{ maxWidth: '850px' }}>
          <h2 className="messages-section-title" style={{ marginBottom: '1.5rem' }}>Request Leave</h2>

          <form onSubmit={handleSubmitLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Leave For Field */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '1rem' }}>
              <label style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                Leave For
              </label>
              <input 
                type="text"
                value={leaveFor}
                onChange={(e) => setLeaveFor(e.target.value)}
                className="form-control"
                style={{ borderRadius: 4, height: 38, border: '1px solid #cbd5e1' }}
                placeholder="e.g. Annual Vacation, Family Emergency, Medical Leave"
                required
              />
            </div>

            {/* Reason Field */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'flex-start', gap: '1rem' }}>
              <label style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', paddingTop: '6px' }}>
                Reason
              </label>
              <textarea 
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-control"
                style={{ borderRadius: 4, resize: 'vertical', border: '1px solid #cbd5e1' }}
                placeholder="Detail reason for leave request..."
                required
              />
            </div>

            {/* From Date Field */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '1rem' }}>
              <label style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                From Date
              </label>
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="form-control"
                style={{ borderRadius: 4, height: 38, border: '1px solid #cbd5e1' }}
                required
              />
            </div>

            {/* To Date Field */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '1rem' }}>
              <label style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                To Date
              </label>
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="form-control"
                style={{ borderRadius: 4, height: 38, border: '1px solid #cbd5e1' }}
                required
              />
            </div>

            {/* Action Buttons matching Image 8: Submit (blue) and Cancel (gray) */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '1rem' }}>
              <div />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button 
                  type="submit" 
                  className="client-search-btn-blue"
                  style={{ minWidth: '90px', padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Submit
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setLeaveFor('');
                    setReason('');
                    setFromDate('');
                    setToDate('');
                  }}
                  style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 2: LEAVE LIST TABLE (Matching Reference Image 9) */}
      {viewMode === 'list' && (
        <div className="sms-panel-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 className="messages-section-title" style={{ margin: 0 }}>Leave</h2>
            <button 
              type="button"
              className="client-search-btn-blue"
              onClick={() => setViewMode('request')}
              style={{ fontSize: '0.78rem', padding: '4px 12px' }}
            >
              + New Leave Request
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 4 }}>
            <table className="messages-ref-table">
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>Applicant</th>
                  <th style={{ width: '150px' }}>Leave For</th>
                  <th>Reason</th>
                  <th style={{ width: '120px' }}>From Date</th>
                  <th style={{ width: '120px' }}>To Date</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="messages-empty-row">
                      Record Not Found
                    </td>
                  </tr>
                ) : (
                  leaveEntries.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.applicant}</td>
                      <td style={{ color: '#0284c7', fontWeight: 600 }}>{entry.leaveFor}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{entry.reason}</td>
                      <td>{entry.fromDate}</td>
                      <td>{entry.toDate}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: 12, 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: entry.status === 'Approved' ? '#dcfce7' : entry.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                          color: entry.status === 'Approved' ? '#15803d' : entry.status === 'Pending' ? '#b45309' : '#dc2626'
                        }}>
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {entry.status === 'Pending' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <button 
                              type="button"
                              className="approval-row-btn approve"
                              onClick={() => handleApproveEntry(entry.id)}
                              title="Approve Leave"
                            >
                              <Check size={12} />
                            </button>
                            <button 
                              type="button"
                              className="approval-row-btn deny"
                              onClick={() => handleDeclineEntry(entry.id)}
                              title="Decline Leave"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guidance Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
