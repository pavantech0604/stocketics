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
    ownerName: 'Sirajul Fasal M',
    clientName: 'Sruthi A S',
    mobile: '8891171239',
    segment: 'INDEX OPTION',
    serviceDate: '2026-09-08',
    ftCount: 1
  },
  {
    id: 'app-002',
    ownerName: 'Golla Yugendra',
    clientName: 'M Subramanyam',
    mobile: '9948527886',
    segment: 'INDEX OPTION',
    serviceDate: '2026-09-08',
    ftCount: 2
  },
  {
    id: 'app-003',
    ownerName: 'Devika B',
    clientName: 'BHARATH',
    mobile: '9952011804',
    segment: 'INDEX OPTION',
    serviceDate: '2026-09-07',
    ftCount: 1
  },
  {
    id: 'app-004',
    ownerName: 'Golla Yugendra',
    clientName: 'Pasula Laxmi Prasanna',
    mobile: '9491924562',
    segment: 'Market Pathshala',
    serviceDate: '2026-09-07',
    ftCount: 3
  },
  {
    id: 'app-005',
    ownerName: 'Rohan Deshmukh',
    clientName: 'Pugazhendhi S',
    mobile: '8489712962',
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
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={15} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Main Page Title */}
      <h1 className="page-title-ref">Approval</h1>

      {/* Main Approval Card */}
      <div className="approval-card-container">
        {/* Top Action Bar (Matching Reference Image 3) */}
        <div className="approval-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Queue Count: <strong style={{ color: 'var(--text-primary)' }}>{records.length}</strong>
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
          <table className="approval-ref-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={records.length === 0}
                    style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#7cb342' }}
                  />
                </th>
                <th>Owner Name</th>
                <th>Client Name</th>
                <th>Mobile</th>
                <th>Segment</th>
                <th>Service Date</th>
                <th style={{ textAlign: 'center' }}>FT Count</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="approval-empty-row">
                    Record Not Available
                  </td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const isChecked = selectedIds.includes(record.id);

                  return (
                    <tr key={record.id} className={isChecked ? 'row-selected' : ''}>
                      <td>{index + 1}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(record.id)}
                          style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#7cb342' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{record.ownerName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{record.clientName}</td>
                      <td style={{ color: '#0284c7', fontFamily: 'monospace' }}>{record.mobile}</td>
                      <td>
                        <span className="segment-badge">
                          {record.segment}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{record.serviceDate}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{record.ftCount}</td>
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
