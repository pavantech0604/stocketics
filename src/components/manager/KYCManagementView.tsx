import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { KYCRecord, KYCStatus, RiskProfile } from '../../types';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  AlertTriangle,
  CreditCard,
  Building,
  User,
  Eye,
  X,
  Check,
  Filter,
  Download,
  ShieldAlert
} from 'lucide-react';

export const KYCManagementView: React.FC = () => {
  const { kycRecords, approveKYC, rejectKYC, kycDocuments, reviewKYCDocument, setActiveTab, showToast } = useApp();
  const [mainViewMode, setMainViewMode] = useState<'dossiers' | 'documents_queue'>('dossiers');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  
  // Modal states
  const [inspectRecord, setInspectRecord] = useState<KYCRecord | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<KYCRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<'pan' | 'aadhaar' | 'bank'>('pan');

  // Document queue review state
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRemarks, setDocRemarks] = useState<string>('');

  // Filter logic
  const filteredRecords = kycRecords.filter(record => {
    // Tab filter
    if (selectedTab === 'pending' && record.status !== 'Pending Approval') return false;
    if (selectedTab === 'approved' && record.status !== 'Approved') return false;
    if (selectedTab === 'rejected' && record.status !== 'Rejected') return false;

    // Risk Profile filter
    if (riskFilter !== 'All' && record.riskProfile !== riskFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        record.customerName.toLowerCase().includes(q) ||
        record.panNumber.toLowerCase().includes(q) ||
        record.dematClientId.toLowerCase().includes(q) ||
        record.phone.includes(q) ||
        record.email.toLowerCase().includes(q) ||
        record.bankName.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const countPending = kycRecords.filter(r => r.status === 'Pending Approval').length;
  const countApproved = kycRecords.filter(r => r.status === 'Approved').length;
  const countRejected = kycRecords.filter(r => r.status === 'Rejected').length;

  const handleOpenReject = (record: KYCRecord) => {
    setRejectingRecord(record);
    setRejectionReason('Name mismatch on bank proof against PAN card.');
  };

  const handleConfirmReject = () => {
    if (!rejectingRecord) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }
    rejectKYC(rejectingRecord.id, rejectionReason.trim());
    setRejectingRecord(null);
    setRejectionReason('');
    if (inspectRecord?.id === rejectingRecord.id) {
      setInspectRecord(null);
    }
  };

  const handleQuickApprove = (record: KYCRecord) => {
    approveKYC(record.id);
    if (inspectRecord?.id === record.id) {
      setInspectRecord(null);
    }
  };

  const getRiskBadge = (profile: RiskProfile) => {
    switch (profile) {
      case 'Aggressive':
        return <span className="delta-badge negative" style={{ fontSize: '0.72rem' }}>Aggressive</span>;
      case 'Moderate':
        return <span className="delta-badge" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem' }}>Moderate</span>;
      case 'Conservative':
        return <span className="delta-badge positive" style={{ fontSize: '0.72rem' }}>Conservative</span>;
    }
  };

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="delta-badge positive" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="delta-badge" style={{ background: '#ffedd5', color: '#c2410c', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="delta-badge negative" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return <span className="delta-badge warning">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Compliance & Advisory</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>KYC Details</span>
        </div>
      </div>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} style={{ color: 'var(--stocketics-blue-500)' }} />
            Customer KYC Verification & Compliance
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            SEBI CKYC compliant portal for identity verification, Demat linkage, risk profiling, and manager authorization.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn btn-sm ${mainViewMode === 'dossiers' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMainViewMode('dossiers')}
          >
            Client Dossiers ({kycRecords.length})
          </button>
          <button 
            className={`btn btn-sm ${mainViewMode === 'documents_queue' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMainViewMode('documents_queue')}
            style={mainViewMode === 'documents_queue' ? { background: '#f59e0b', borderColor: '#f59e0b', color: '#fff' } : {}}
          >
            Uploads Review Queue ({kycDocuments.filter(d => d.status === 'Pending').length} Pending)
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Exporting KYC Audit Log in CSV format...', 'info')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={14} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* 4 Fast KPI Summary Metric Cards */}
      {mainViewMode === 'dossiers' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid var(--stocketics-blue-500)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total KYC Applications</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{kycRecords.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>All registered customer dossiers</div>
        </div>

        <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '0.78rem', color: '#c2410c', textTransform: 'uppercase', fontWeight: 700 }}>Pending Action</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c', marginTop: '0.25rem' }}>{countPending}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Requires Manager signoff</div>
        </div>

        <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>Verified & Approved</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{countApproved}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Authorized for Live Trading</div>
        </div>

        <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.78rem', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 700 }}>Rejected / Resubmit</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>{countRejected}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Sent back for correction</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Subtabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${selectedTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTab('all')}
            >
              All Records ({kycRecords.length})
            </button>
            <button 
              className={`btn btn-sm ${selectedTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTab('pending')}
              style={selectedTab === 'pending' ? { background: '#ea580c', borderColor: '#ea580c', color: '#fff' } : {}}
            >
              Pending Approval ({countPending})
            </button>
            <button 
              className={`btn btn-sm ${selectedTab === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTab('approved')}
              style={selectedTab === 'approved' ? { background: '#10b981', borderColor: '#10b981', color: '#fff' } : {}}
            >
              Approved ({countApproved})
            </button>
            <button 
              className={`btn btn-sm ${selectedTab === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedTab('rejected')}
              style={selectedTab === 'rejected' ? { background: '#ef4444', borderColor: '#ef4444', color: '#fff' } : {}}
            >
              Rejected ({countRejected})
            </button>
          </div>

          {/* Search & Risk Filter */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.82rem' }}
                placeholder="Search Name, PAN, Demat..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              className="form-select" 
              style={{ height: '34px', fontSize: '0.82rem', padding: '0 0.6rem' }}
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
            >
              <option value="All">All Risk Profiles</option>
              <option value="Aggressive">Aggressive</option>
              <option value="Moderate">Moderate</option>
              <option value="Conservative">Conservative</option>
            </select>
          </div>
        </div>

        {/* KYC Table */}
        <div className="table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Identity (PAN / Aadhaar)</th>
                <th>Demat & Depository</th>
                <th>Bank Account</th>
                <th>Risk Profile</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'center' }}>Manager Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{record.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.phone} • {record.email}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--stocketics-blue-600)', marginTop: '2px' }}>
                          Advisor: {record.assignedAdvisorName}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="mono-cell" style={{ fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
                          {record.panNumber}
                        </span>
                        <span className="mono-cell" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {record.aadhaarMasked}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div className="mono-cell" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {record.dematClientId}
                        </div>
                        <span className="delta-badge" style={{ fontSize: '0.68rem', padding: '1px 6px', background: 'var(--bg-surface-alt)' }}>
                          {record.depository}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{record.bankName}</div>
                        <div className="mono-cell" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          A/C: {record.bankAccountMasked} • {record.ifscCode}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                        {getRiskBadge(record.riskProfile)}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{record.annualIncomeBracket}</span>
                      </div>
                    </td>

                    <td>
                      {getStatusBadge(record.status)}
                      {record.rejectionReason && (
                        <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '3px', maxWidth: '180px', lineHeight: 1.2 }}>
                          {record.rejectionReason}
                        </div>
                      )}
                      {record.verifiedDate && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {record.verifiedDate}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="mono-cell" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {record.submittedDate}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          title="Inspect Documents"
                          onClick={() => {
                            setInspectRecord(record);
                            setSelectedDocType('pan');
                          }}
                          style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                        >
                          <Eye size={13} /> View Docs
                        </button>

                        {record.status === 'Pending Approval' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm"
                              title="Approve KYC"
                              onClick={() => handleQuickApprove(record)}
                              style={{ padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem' }}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              title="Reject KYC"
                              onClick={() => handleOpenReject(record)}
                              style={{ padding: '0.35rem 0.6rem', color: '#dc2626', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem' }}
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    No KYC records found matching the active filter or query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* ITEM-BY-ITEM DOCUMENT UPLOAD REVIEW QUEUE */}
      {mainViewMode === 'documents_queue' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-alt)' }}>
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: '#f59e0b' }} />
                <span>Uploaded Documents Verification Queue ({kycDocuments.length})</span>
              </div>
              <div className="card-subtitle">Review and verify employee-submitted PAN, Aadhaar, and Bank proof uploads</div>
            </div>
          </div>

          <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', textTransform: 'uppercase', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Client Details</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Document Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Document ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Attachment File</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Uploaded By</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status & Remarks</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Review Action</th>
                </tr>
              </thead>
              <tbody>
                {kycDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No uploaded documents in verification queue.
                    </td>
                  </tr>
                ) : (
                  kycDocuments.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{doc.clientName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{doc.clientMobile}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {doc.documentType}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <code style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 6px', borderRadius: 4, color: 'var(--stocketics-blue-500)', fontSize: '0.78rem' }}>
                          {doc.documentNumber}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <FileText size={14} color="#94a3b8" />
                          <span>{doc.fileName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({doc.fileSize})</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div>{doc.uploadedBy}</div>
                        <div style={{ fontSize: '0.7rem' }}>{doc.createdAt}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`delta-badge ${doc.status === 'Verified' ? 'positive' : doc.status === 'Rejected' ? 'negative' : 'warning'}`}>
                          {doc.status}
                        </span>
                        {doc.remarks && (
                          <div style={{ fontSize: '0.72rem', color: doc.status === 'Rejected' ? '#dc2626' : 'var(--text-muted)', marginTop: 3, maxWidth: 200 }}>
                            {doc.remarks}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {doc.status !== 'Verified' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => reviewKYCDocument(doc.id, 'Verified', 'Document verified and approved by Manager.')}
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            >
                              <CheckCircle2 size={12} /> Verify
                            </button>
                          )}
                          {doc.status !== 'Rejected' && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setRejectingDocId(doc.id);
                                setDocRemarks('Photo blurry / ID number mismatch against bank details.');
                              }}
                              style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#dc2626', borderColor: '#fca5a5' }}
                            >
                              <X size={12} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Document Rejection Remarks */}
      {rejectingDocId && (
        <div className="tips-modal-backdrop" onClick={() => setRejectingDocId(null)}>
          <div className="tips-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="tips-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#dc2626" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Reject KYC Document</h3>
              </div>
              <button className="tips-modal-close" onClick={() => setRejectingDocId(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Enter Rejection Remarks for Employee:
              </label>
              <textarea
                rows={3}
                className="form-input"
                value={docRemarks}
                onChange={(e) => setDocRemarks(e.target.value)}
                style={{ width: '100%', marginBottom: '1rem' }}
                placeholder="State reason (e.g. Blurred photo, Signature missing)..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setRejectingDocId(null)}>Cancel</button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: '#dc2626', borderColor: '#dc2626' }}
                  onClick={() => {
                    if (rejectingDocId) {
                      reviewKYCDocument(rejectingDocId, 'Rejected', docRemarks || 'Rejected by Manager.');
                      setRejectingDocId(null);
                      setDocRemarks('');
                    }
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL */}
      {inspectRecord && (
        <div className="tips-modal-backdrop" onClick={() => setInspectRecord(null)}>
          <div className="tips-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', width: '92vw' }}>
            <div className="tips-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: 'var(--stocketics-blue-500)', color: '#fff' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    KYC Document Verification • {inspectRecord.customerName}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PAN: {inspectRecord.panNumber} • Demat ID: {inspectRecord.dematClientId} ({inspectRecord.depository})
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectRecord(null)}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Document Type Switcher */}
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <button 
                  className={`btn btn-sm ${selectedDocType === 'pan' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedDocType('pan')}
                >
                  <CreditCard size={14} /> PAN Card Photo
                </button>
                <button 
                  className={`btn btn-sm ${selectedDocType === 'aadhaar' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedDocType('aadhaar')}
                >
                  <User size={14} /> Aadhaar Proof (Masked)
                </button>
                <button 
                  className={`btn btn-sm ${selectedDocType === 'bank' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedDocType('bank')}
                >
                  <Building size={14} /> Cancelled Cheque / Bank Proof
                </button>
              </div>

              {/* Document Preview Box */}
              <div style={{ 
                background: 'var(--bg-surface-alt)', 
                border: '1px dashed var(--border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <img 
                  src={
                    selectedDocType === 'pan' 
                      ? inspectRecord.documents.panCardUrl 
                      : selectedDocType === 'aadhaar' 
                      ? inspectRecord.documents.aadhaarFrontUrl 
                      : inspectRecord.documents.bankProofUrl
                  } 
                  alt="KYC Document Preview" 
                  style={{ 
                    maxHeight: '280px', 
                    maxWidth: '100%', 
                    borderRadius: 'var(--radius-sm)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    objectFit: 'cover'
                  }} 
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Digitally verified checksum matching NSDL/KRA repository guidelines.
                </div>
              </div>

              {/* Customer Profile Dossier Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Registered Phone</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inspectRecord.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bank & IFSC</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inspectRecord.bankName} ({inspectRecord.ifscCode})</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Annual Income</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inspectRecord.annualIncomeBracket}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Trading Experience</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inspectRecord.tradingExperience}</div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Current Status:</span>
                  {getStatusBadge(inspectRecord.status)}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {inspectRecord.status === 'Pending Approval' ? (
                    <>
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleOpenReject(inspectRecord)}
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <X size={15} /> Reject with Note
                      </button>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleQuickApprove(inspectRecord)}
                      >
                        <CheckCircle2 size={15} /> Authorize & Approve KYC
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => setInspectRecord(null)}>
                      Close Preview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingRecord && (
        <div className="tips-modal-backdrop" onClick={() => setRejectingRecord(null)}>
          <div className="tips-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="tips-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="tip-icon-wrap" style={{ width: '34px', height: '34px', background: '#fee2e2', color: '#dc2626' }}>
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Reject KYC Application</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer: {rejectingRecord.customerName} ({rejectingRecord.panNumber})</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setRejectingRecord(null)}><X size={15} /></button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Please select or write the precise compliance reason for rejection. This note will be dispatched to the assigned advisor ({rejectingRecord.assignedAdvisorName}) for customer correction.
              </p>

              {/* Quick Reason Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Quick Preset Reasons:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Name mismatch on bank proof against PAN card.',
                    'PAN Card photo is blurred, unreadable, or missing signature.',
                    'Aadhaar document incomplete or address proof truncated.',
                    'Demat Client Master Report (CMR) not stamped by DP.'
                  ].map((preset, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setRejectionReason(preset)}
                      style={{ 
                        textAlign: 'left', 
                        justifyContent: 'flex-start',
                        fontSize: '0.78rem',
                        background: rejectionReason === preset ? 'var(--stocketics-blue-50)' : undefined,
                        borderColor: rejectionReason === preset ? 'var(--stocketics-blue-500)' : undefined
                      }}
                    >
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Compliance Rejection Note *</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  required
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="State the exact discrepancy found in the verification..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectingRecord(null)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ background: '#dc2626', borderColor: '#dc2626' }}
                  onClick={handleConfirmReject}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
