import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  FileText,
  Send
} from 'lucide-react';
import { LeaveType } from '../../types';
import confetti from 'canvas-confetti';
import { TipsModal } from '../common/TipsModal';

export const LeavePortal: React.FC = () => {
  const { currentUser, leaveRequests, submitLeaveRequest, setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Form State matching Reference Image 3
  const [leaveFor, setLeaveFor] = useState<string>('Casual Leave (CL)');
  const [reason, setReason] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2026-09-10');
  const [toDate, setToDate] = useState<string>('2026-09-11');

  const myLeaves = leaveRequests.filter(l => l.employeeName === currentUser.name || l.employeeId === currentUser.id);

  const calculateDays = () => {
    if (!fromDate || !toDate) return 1;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
  };

  const daysCount = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please provide a reason for the leave request', 'error');
      return;
    }

    // Map selected 'leaveFor' to typed LeaveType
    let mappedType: LeaveType = 'Paid Time Off';
    if (leaveFor.includes('Sick') || leaveFor.includes('Medical')) mappedType = 'Sick Leave';
    else if (leaveFor.includes('Comp')) mappedType = 'Compensatory Off';
    else if (leaveFor.includes('Unpaid')) mappedType = 'Unpaid Leave';

    submitLeaveRequest({
      employeeId: currentUser.id,
      type: mappedType,
      startDate: fromDate,
      endDate: toDate,
      daysCount: daysCount,
      reason: `[${leaveFor}] ${reason}`,
    });

    confetti({ particleCount: 50, spread: 60 });
    showToast(`Leave request for ${daysCount} day(s) submitted! Routed to Reporting Manager.`, 'success');
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    setActiveTab('dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Subpage Breadcrumb Header Strip (Matching Reference Image 3) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Header Bar with Title & << Back Button (Matching Reference Image 3) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <h1 className="page-title-ref" style={{ margin: 0 }}>Leave</h1>

        <button 
          className="btn-ref-back"
          onClick={() => setActiveTab('dashboard')}
          title="Return to Dashboard"
        >
          <span>&lt;&lt; Back</span>
        </button>
      </div>

      {/* Leave Quota Chips (Visual Balance and Quick Information) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #0088ea' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Paid Leave (PTO)</div>
          <div className="mono-cell" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {currentUser.leaveBalance.paid} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Days</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0088ea', marginTop: '0.2rem' }}>Annual Accrual Balance</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sick / Medical Leave</div>
          <div className="mono-cell" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {currentUser.leaveBalance.sick} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Days</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.2rem' }}>Requires Doctor Note if &gt;2 Days</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Compensatory Off</div>
          <div className="mono-cell" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {currentUser.leaveBalance.comp} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Days</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.2rem' }}>Weekend Market Overtime Credit</div>
        </div>
      </div>

      {/* Main Form Card: "Request Leave" (Strictly Matching Reference Image 3) */}
      <div className="form-card-ref">
        <h2 className="form-title-ref">Request Leave</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '720px' }}>
          
          {/* Field 1: Leave For */}
          <div className="form-group-ref">
            <label className="form-label-ref">Leave For</label>
            <div className="form-field-ref">
              <select 
                className="form-control-ref"
                value={leaveFor}
                onChange={e => setLeaveFor(e.target.value)}
              >
                <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                <option value="Sick / Medical Leave (SL)">Sick / Medical Leave (SL)</option>
                <option value="Half Day - First Half (Morning)">Half Day - First Half (Morning)</option>
                <option value="Half Day - Second Half (Afternoon)">Half Day - Second Half (Afternoon)</option>
                <option value="Paid Time Off (Full Day)">Paid Time Off (Full Day)</option>
                <option value="Compensatory Off (Comp-Off)">Compensatory Off (Comp-Off)</option>
                <option value="Emergency Personal Leave">Emergency Personal Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>
          </div>

          {/* Field 2: Reason */}
          <div className="form-group-ref">
            <label className="form-label-ref">Reason</label>
            <div className="form-field-ref">
              <textarea 
                className="form-control-ref"
                rows={4}
                placeholder="Enter detailed reason for leave request..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Field 3: From Date */}
          <div className="form-group-ref">
            <label className="form-label-ref">From Date</label>
            <div className="form-field-ref" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="date"
                className="form-control-ref"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Field 4: To Date */}
          <div className="form-group-ref">
            <label className="form-label-ref">To Date</label>
            <div className="form-field-ref" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="date"
                className="form-control-ref"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                required
              />
              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: 700, 
                color: '#0088ea', 
                background: '#e0f2fe', 
                padding: '0.35rem 0.75rem', 
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}>
                {daysCount} Day{daysCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Action Buttons: Submit and Cancel (Matching Image 3) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingLeft: '155px', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-ref-blue">
              Submit
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCancel}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Requests History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>My Submitted Leave History</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time approval status from Reporting Manager & HR Operations Desk
            </p>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0088ea' }}>
            {myLeaves.length} Record{myLeaves.length === 1 ? '' : 's'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                <th>Leave Category</th>
                <th>Duration</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.length > 0 ? (
                myLeaves.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.type}</div>
                    </td>
                    <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--stocketics-blue-600)' }}>
                      {item.daysCount} Day{item.daysCount > 1 ? 's' : ''}
                    </td>
                    <td className="mono-cell" style={{ fontSize: '0.82rem' }}>{item.startDate}</td>
                    <td className="mono-cell" style={{ fontSize: '0.82rem' }}>{item.endDate}</td>
                    <td style={{ maxWidth: '280px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {item.reason}
                    </td>
                    <td>
                      <span className={`delta-badge ${
                        item.status === 'Approved' 
                          ? 'positive' 
                          : item.status === 'Declined' 
                          ? 'negative' 
                          : 'warning'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="mono-cell" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.appliedAt}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    No leave requests submitted yet. Use the form above to request time off.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Tips Modal removed */}
    </div>
  );
};
