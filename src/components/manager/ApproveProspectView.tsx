import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TipsModal } from '../common/TipsModal';

interface ApprovalRecord {
  id: string;
  ownerName: string;
  clientName: string;
  mobile: string;
  segment: string;
  serviceDate: string;
  ftCount: number;
}

const INITIAL_APPROVAL_RECORDS: ApprovalRecord[] = [
  {
    id: 'app-001',
    ownerName: 'Rohan Deshmukh',
    clientName: 'Rajesh K. Singhania',
    mobile: '9820100401',
    segment: 'INDEX OPTION',
    serviceDate: '2026-09-08',
    ftCount: 1
  },
  {
    id: 'app-002',
    ownerName: 'Sneha Kapur',
    clientName: 'Dr. Harshvardhan Jain',
    mobile: '9425000402',
    segment: 'EQUITY PREMIER',
    serviceDate: '2026-09-08',
    ftCount: 2
  },
  {
    id: 'app-003',
    ownerName: 'Neha Reddy',
    clientName: 'Col. Vikram Rathore',
    mobile: '9414000405',
    segment: 'INDEX OPTION',
    serviceDate: '2026-09-07',
    ftCount: 1
  },
  {
    id: 'app-004',
    ownerName: 'Kabir Varma',
    clientName: 'Kavita Radhakrishnan',
    mobile: '9847000403',
    segment: 'Market Pathshala',
    serviceDate: '2026-09-07',
    ftCount: 3
  },
  {
    id: 'app-005',
    ownerName: 'Rohan Deshmukh',
    clientName: 'Manish Chawla',
    mobile: '9912000404',
    segment: 'EQUITY PREMIER',
    serviceDate: '2026-09-06',
    ftCount: 1
  }
];

export const ApproveProspectView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [records, setRecords] = useState<ApprovalRecord[]>(INITIAL_APPROVAL_RECORDS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Toggle selection for single item
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(records.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Bulk Approve
  const handleApproveSelected = () => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one record to approve.', 'warning');
      return;
    }
    const count = selectedIds.length;
    setRecords(prev => prev.filter(r => !selectedIds.includes(r.id)));
    setSelectedIds([]);
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {}
    showToast(`Approved ${count} client prospect authorization(s) successfully!`, 'success');
  };

  // Bulk Deny
  const handleDenySelected = () => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one record to deny.', 'warning');
      return;
    }
    const count = selectedIds.length;
    setRecords(prev => prev.filter(r => !selectedIds.includes(r.id)));
    setSelectedIds([]);
    showToast(`Denied ${count} prospect request(s). Returned to sales desk.`, 'info');
  };

  // Single Approve
  const handleSingleApprove = (record: ApprovalRecord) => {
    setRecords(prev => prev.filter(r => r.id !== record.id));
    setSelectedIds(prev => prev.filter(id => id !== record.id));
    try {
      confetti({ particleCount: 50, spread: 50 });
    } catch (e) {}
    showToast(`Approved service subscription for ${record.clientName}!`, 'success');
  };

  // Single Deny
  const handleSingleDeny = (record: ApprovalRecord) => {
    setRecords(prev => prev.filter(r => r.id !== record.id));
    setSelectedIds(prev => prev.filter(id => id !== record.id));
    showToast(`Denied subscription for ${record.clientName}.`, 'info');
  };

  // Reset sample records
  const handleResetQueue = () => {
    setRecords(INITIAL_APPROVAL_RECORDS);
    setSelectedIds([]);
    showToast('Reset approval queue with 5 active prospect deals.', 'info');
  };

  const isAllSelected = records.length > 0 && selectedIds.length === records.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb Strip (Matching Reference Image 3) */}
      <div className="subpage-header-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
        <div className="subpage-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px' }}>
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ea580c', cursor: 'pointer', fontWeight: 600 }}>
            <Home size={15} />
            <span>/ Dashboard</span>
          </span>
        </div>

        {/* Tips Dark Navy Button matching Reference */}
        <button 
          onClick={() => setIsTipsOpen(true)}
          style={{ 
            background: '#0a192f', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '3px', 
            padding: '0.25rem 1rem', 
            fontSize: '13px', 
            fontWeight: 700, 
            cursor: 'pointer',
            letterSpacing: '0.5px'
          }}
        >
          Tips
        </button>
      </div>

      {/* Main Page Title */}
      <h1 className="page-title-ref" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0 0 0', letterSpacing: '-0.3px' }}>Approval</h1>

      {/* Main Approval Card */}
      <div className="approval-card-container" style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        {/* Top Action Bar (Matching Reference Image 3) */}
        <div className="approval-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Queue Count: <strong style={{ color: '#0f172a' }}>{records.length}</strong>
            </span>
            {records.length === 0 && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleResetQueue}
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                <RefreshCw size={12} />
                <span>Reload Demo Queue</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {/* Green Approve Selected Button */}
            <button 
              type="button"
              className="btn-approve-selected"
              onClick={handleApproveSelected}
            >
              Approve Selected
            </button>

            {/* Orange Deny Selected Button */}
            <button 
              type="button"
              className="btn-deny-selected"
              onClick={handleDenySelected}
            >
              Deny Selected
            </button>
          </div>
        </div>

        {/* Approval Table matching Image 3 columns */}
        <div style={{ overflowX: 'auto' }}>
          <table className="approval-ref-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '760px' }}>
            <thead>
              <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ width: '40px', padding: '0.8rem 1rem' }}>#</th>
                <th style={{ width: '40px', textAlign: 'center', padding: '0.8rem 1rem' }}>
                  <input 
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={records.length === 0}
                    style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#7cb342' }}
                  />
                </th>
                <th style={{ padding: '0.8rem 1rem' }}>Owner Name</th>
                <th style={{ padding: '0.8rem 1rem' }}>Client Name</th>
                <th style={{ padding: '0.8rem 1rem' }}>Mobile</th>
                <th style={{ padding: '0.8rem 1rem' }}>Segment</th>
                <th style={{ padding: '0.8rem 1rem' }}>Service Date</th>
                <th style={{ textAlign: 'center', padding: '0.8rem 1rem' }}>FT Count</th>
                <th style={{ textAlign: 'center', padding: '0.8rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="approval-empty-row" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600 }}>
                    Record Not Available
                  </td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const isChecked = selectedIds.includes(record.id);

                  return (
                    <tr 
                      key={record.id} 
                      className={isChecked ? 'row-selected' : ''}
                      style={{ 
                        background: isChecked ? '#f0fdf4' : (index % 2 === 0 ? '#ffffff' : '#fafafa'),
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <td>{index + 1}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(record.id)}
                          style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#7cb342' }}
                        />
                      </td>
                      <td className="approval-owner-name">{record.ownerName}</td>
                      <td className="approval-client-name">{record.clientName}</td>
                      <td className="approval-mobile-cell">{record.mobile}</td>
                      <td>
                        <span className="segment-badge">
                          {record.segment}
                        </span>
                      </td>
                      <td className="approval-date-cell">{record.serviceDate}</td>
                      <td className="approval-ft-cell" style={{ textAlign: 'center' }}>{record.ftCount}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <button 
                            type="button"
                            className="approval-row-btn approve"
                            onClick={() => handleSingleApprove(record)}
                            title="Approve Subscription"
                          >
                            <Check size={13} strokeWidth={2.5} />
                            <span>Approve</span>
                          </button>
                          <button 
                            type="button"
                            className="approval-row-btn deny"
                            onClick={() => handleSingleDeny(record)}
                            title="Deny / Return"
                          >
                            <X size={13} strokeWidth={2.5} />
                            <span>Deny</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidance Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
