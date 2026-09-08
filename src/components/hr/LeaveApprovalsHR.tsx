import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  Percent, 
  UserCheck, 
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  type: 'Leave' | 'Client KYC' | 'Payment' | 'Discount' | 'Free Trial';
  requestedBy: string;
  avatar?: string;
  subject: string;
  amountOrDays: string;
  date: string;
  details: string;
  status: 'Pending' | 'Approved' | 'Declined';
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'app-101',
    type: 'Payment',
    requestedBy: 'Rohan Deshmukh',
    subject: 'Client HNI Subscription NEFT',
    amountOrDays: '₹1,50,000 (Hedge & PMS)',
    date: '07-Sep-2026 11:45 AM',
    details: 'NEFT UTR: HDFC9923841102 from Sunil Mittal. Client onboarding payment verified by Axis Bank gateway.',
    status: 'Pending'
  },
  {
    id: 'app-102',
    type: 'Client KYC',
    requestedBy: 'Aditya Roy',
    subject: 'New Client SEBI Risk Profiling',
    amountOrDays: 'Score: 42 (Moderate Risk)',
    date: '07-Sep-2026 10:15 AM',
    details: 'Client Dr. Harshvardhan Jain submitted PAN + Aadhaar XML. Compliant with SEBI advisory mandate.',
    status: 'Pending'
  },
  {
    id: 'app-103',
    type: 'Discount',
    requestedBy: 'Ananya Sen',
    subject: 'Advisory Annual Fee Concession',
    amountOrDays: '15% Concession (₹14,250)',
    date: '06-Sep-2026 04:20 PM',
    details: 'Long-term client Radhika Singhania renewing 12-month Options Strategy package.',
    status: 'Pending'
  },
  {
    id: 'app-104',
    type: 'Free Trial',
    requestedBy: 'Rohan Deshmukh',
    subject: 'Commodity Trial Extension',
    amountOrDays: '+3 Days Extension',
    date: '07-Sep-2026 09:30 AM',
    details: 'Client Manish Agarwal requesting 3 additional days of live market calls before wire payment.',
    status: 'Pending'
  }
];

export const LeaveApprovalsHR: React.FC = () => {
  const { activeTab, setActiveTab, leaveRequests, updateLeaveStatus, showToast } = useApp();

  const getSubTabFromActive = (): string => {
    if (activeTab === 'approve-client') return 'client';
    if (activeTab === 'approve-payment') return 'payment';
    if (activeTab === 'approve-discount') return 'discount';
    if (activeTab === 'approve-trial') return 'trial';
    return 'leave';
  };

  const [currentTab, setCurrentTab] = useState<string>(getSubTabFromActive());
  const [approvalsList, setApprovalsList] = useState<ApprovalItem[]>(INITIAL_APPROVALS);

  useEffect(() => {
    setCurrentTab(getSubTabFromActive());
  }, [activeTab]);

  const handleTabChange = (tab: string, tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleApprovalAction = (id: string, action: 'Approved' | 'Declined') => {
    setApprovalsList(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
    showToast(`Request ${action === 'Approved' ? 'approved' : 'declined'} successfully`, action === 'Approved' ? 'success' : 'info');
  };

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
  const otherPending = approvalsList.filter(a => a.status === 'Pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Governance & Approval Center
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
          Approve client registrations, payments, advisory fee concessions, and staff leave applications.
        </p>
      </div>

      {/* Sub-Tabs matching Sidebar Sub-options under Approve */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'leave' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('leave', 'approve-leave')}
        >
          Approve Leave ({pendingLeaves.length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'client' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('client', 'approve-client')}
        >
          Approve Client ({approvalsList.filter(a => a.type === 'Client KYC' && a.status === 'Pending').length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'payment' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('payment', 'approve-payment')}
        >
          Approve Payment ({approvalsList.filter(a => a.type === 'Payment' && a.status === 'Pending').length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'discount' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('discount', 'approve-discount')}
        >
          Approve Discount ({approvalsList.filter(a => a.type === 'Discount' && a.status === 'Pending').length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'trial' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('trial', 'approve-trial')}
        >
          Approve Free Trial ({approvalsList.filter(a => a.type === 'Free Trial' && a.status === 'Pending').length})
        </button>
      </div>

      {/* LEAVE APPROVALS TAB */}
      {currentTab === 'leave' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={18} style={{ color: 'var(--warning)' }} />
                <span>Pending Leave Requests ({pendingLeaves.length})</span>
              </div>
              <div className="card-subtitle">Immediate decisions required before weekly roster lock</div>
            </div>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700 }}>All Caught Up!</div>
              <div style={{ fontSize: '0.82rem' }}>There are no pending leave requests awaiting approval.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingLeaves.map(req => (
                <div 
                  key={req.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-alt)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img src={req.avatar} alt={req.employeeName} style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{req.employeeName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {req.department} • Applied {req.appliedAt}
                      </div>
                      <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                        <strong>Reason:</strong> "{req.reason}"
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--apex-blue-600)' }}>
                        {req.type} ({req.daysCount} Day{req.daysCount > 1 ? 's' : ''})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {req.startDate} to {req.endDate}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => updateLeaveStatus(req.id, 'Declined', 'Declined by Authority')}
                      >
                        <XCircle size={15} /> Decline
                      </button>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => updateLeaveStatus(req.id, 'Approved', 'Approved by Authority')}
                      >
                        <CheckCircle2 size={15} /> Approve Request
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CLIENT / PAYMENT / DISCOUNT / TRIAL APPROVALS TABS */}
      {currentTab !== 'leave' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileCheck size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>
                  {currentTab === 'client' && 'Client KYC & Risk Profile Approvals'}
                  {currentTab === 'payment' && 'Subscription Payment Receipts Queue'}
                  {currentTab === 'discount' && 'Advisory Fee Concession Requests'}
                  {currentTab === 'trial' && 'Free Trial Extension Requests'}
                </span>
              </div>
              <div className="card-subtitle">Verified against SEBI research analyst mandates</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {approvalsList
              .filter(item => {
                if (currentTab === 'client') return item.type === 'Client KYC';
                if (currentTab === 'payment') return item.type === 'Payment';
                if (currentTab === 'discount') return item.type === 'Discount';
                if (currentTab === 'trial') return item.type === 'Free Trial';
                return true;
              })
              .map(item => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-alt)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                        {item.subject}
                      </span>
                      <span className="delta-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                        {item.amountOrDays}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Submitted by: <strong>{item.requestedBy}</strong> • {item.date}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      {item.details}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {item.status === 'Pending' ? (
                      <>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleApprovalAction(item.id, 'Declined')}
                        >
                          <XCircle size={15} /> Decline
                        </button>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleApprovalAction(item.id, 'Approved')}
                        >
                          <CheckCircle2 size={15} /> Approve
                        </button>
                      </>
                    ) : (
                      <span className={`delta-badge ${item.status === 'Approved' ? 'positive' : 'negative'}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
