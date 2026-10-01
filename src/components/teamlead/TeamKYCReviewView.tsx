import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { KYCCase, KYCCaseStatus, ROLE_PERMISSION_MATRIX } from '../../types';
import {
  ShieldCheck,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Eye,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  Lock,
  RefreshCw,
  ShieldAlert,
  X,
  CreditCard,
  Fingerprint,
  Filter,
  ArrowRight
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'Not Started': { label: 'Not Started', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: <Clock size={14} /> },
  'Documents Requested': { label: 'Requested', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <FileText size={14} /> },
  'Awaiting Documents': { label: 'Awaiting', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={14} /> },
  'Draft': { label: 'Draft', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <FileText size={14} /> },
  'Pending Approval': { label: 'Pending', color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: <AlertTriangle size={14} /> },
  'In Review': { label: 'In Review', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: <Eye size={14} /> },
  'Needs Reupload': { label: 'Reupload', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <RefreshCw size={14} /> },
  'Approved': { label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 size={14} /> },
  'Rejected': { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={14} /> },
  'Withdrawn': { label: 'Withdrawn', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: <X size={14} /> },
};

const DOC_ICON: Record<string, React.ReactNode> = {
  'PAN Card': <CreditCard size={16} />,
  'Aadhaar Card': <Fingerprint size={16} />,
  'Bank Proof': <FileText size={16} />,
  'Address Proof': <FileText size={16} />,
  'Other': <FileText size={16} />,
};

export const TeamKYCReviewView: React.FC = () => {
  const {
    kycCases,
    reviewKYCCase,
    currentUser,
    employees,
    getTeamMemberIds,
    setActiveTab,
    hasMatrixPermission,
    theme,
    showToast
  } = useApp();

  const isDark = theme === 'dark';
  const canReview = hasMatrixPermission('kyc.review.team');
  const teamMemberIds = getTeamMemberIds(currentUser.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [reviewModalCase, setReviewModalCase] = useState<KYCCase | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Rejected' | 'Needs Reupload'>('Approved');
  const [reviewReason, setReviewReason] = useState('');

  // Scope to team only (or all if manager/compliance officer)
  const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'hr' || hasMatrixPermission('kyc.review.all');
  const teamCases = useMemo(() => {
    if (isManagerOrAdmin) return kycCases;
    return kycCases.filter(c =>
      teamMemberIds.includes(c.assignedAdvisorId) ||
      c.teamLeaderId === currentUser.id
    );
  }, [kycCases, teamMemberIds, currentUser.id, isManagerOrAdmin]);

  const counts = useMemo(() => ({
    total: teamCases.length,
    pending: teamCases.filter(c => c.status === 'Pending Approval' || c.status === 'In Review').length,
    approved: teamCases.filter(c => c.status === 'Approved').length,
    rejected: teamCases.filter(c => c.status === 'Rejected').length,
    reupload: teamCases.filter(c => c.status === 'Needs Reupload').length,
  }), [teamCases]);

  const filteredCases = useMemo(() => {
    return teamCases.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.leadName.toLowerCase().includes(q) ||
        c.assignedAdvisorName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'pending' && (c.status === 'Pending Approval' || c.status === 'In Review')) ||
        c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [teamCases, searchQuery, statusFilter]);

  const getPendingAge = (submittedAt?: string) => {
    if (!submittedAt) return '';
    // Simple heuristic since we don't have real date parsing in demo
    return 'Today';
  };

  const handleReview = () => {
    if (!reviewModalCase) return;
    if ((reviewDecision === 'Rejected' || reviewDecision === 'Needs Reupload') && !reviewReason.trim()) {
      showToast('Please provide a reason for rejection or reupload request.', 'error');
      return;
    }
    reviewKYCCase(reviewModalCase.id, reviewDecision, reviewReason.trim() || undefined);
    setReviewModalCase(null);
    setReviewReason('');
  };

  // Permission denied state
  if (!canReview) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="subpage-header-strip">
          <div className="subpage-breadcrumb">
            <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
              <Home size={16} />
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Team KYC Review</span>
            </span>
          </div>
        </div>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Lock size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>KYC Review Not Enabled</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Delegated KYC review is not currently enabled for your role. Submitted KYC cases from your team will be reviewed by a Manager.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            You can still view submitted/pending status for your team's leads and escalate to a Manager if needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Team KYC Review</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="kyc-scope-badge">
            <ShieldCheck size={14} />
            <span>My Team Only</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h1 className="page-title-ref" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={24} style={{ color: '#f59e0b' }} />
          Team KYC Review Queue
        </h1>
        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 99, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600 }}>
          Delegated Approval
        </span>
      </div>

      {/* KPI Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Cases', value: counts.total, color: '#3b82f6', filter: 'all' },
          { label: 'Pending Review', value: counts.pending, color: '#f97316', filter: 'pending' },
          { label: 'Approved', value: counts.approved, color: '#10b981', filter: 'Approved' },
          { label: 'Rejected', value: counts.rejected, color: '#ef4444', filter: 'Rejected' },
          { label: 'Needs Reupload', value: counts.reupload, color: '#8b5cf6', filter: 'Needs Reupload' },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="card kyc-kpi-card"
            onClick={() => setStatusFilter(kpi.filter)}
            style={{
              padding: '1rem',
              cursor: 'pointer',
              borderLeft: `3px solid ${kpi.color}`,
              transition: 'all 0.2s',
              opacity: statusFilter === kpi.filter ? 1 : 0.85,
              transform: statusFilter === kpi.filter ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by lead name, advisor, or case ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 32, width: '100%', height: 36, fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'Approved', 'Rejected', 'Needs Reupload'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(f)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
            >
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f}
            </button>
          ))}
          {statusFilter !== 'all' && (
            <button className="btn btn-sm btn-secondary" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={12} /> Reset
            </button>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>No KYC Cases Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No KYC cases from your team yet.'}
          </p>
          {statusFilter !== 'all' && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }} style={{ marginTop: '1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredCases.map(kCase => {
            const config = STATUS_CONFIG[kCase.status] || STATUS_CONFIG['Not Started'];
            const isExpanded = expandedCaseId === kCase.id;
            const advisor = employees.find(e => e.id === kCase.assignedAdvisorId);

            return (
              <div key={kCase.id} className="card kyc-review-card" style={{ overflow: 'hidden', transition: 'all 0.2s' }}>
                {/* Card Header */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                    cursor: 'pointer', flexWrap: 'wrap'
                  }}
                  onClick={() => setExpandedCaseId(isExpanded ? null : kCase.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px', minWidth: 0 }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {kCase.leadName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={12} /> {kCase.assignedAdvisorName}
                        <span style={{ opacity: 0.5 }}>·</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{kCase.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {kCase.documents.map((doc, i) => {
                      const docStatusCfg = STATUS_CONFIG[doc.status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                      return (
                        <span key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '0.2rem 0.5rem', borderRadius: 6,
                          fontSize: '0.72rem', fontWeight: 500,
                          background: docStatusCfg.bg, color: docStatusCfg.color,
                          border: `1px solid ${docStatusCfg.color}20`
                        }}>
                          {DOC_ICON[doc.type] || <FileText size={12} />}
                          {doc.type === 'Aadhaar Card' ? 'Aadhaar' : doc.type === 'PAN Card' ? 'PAN' : doc.type}
                          {doc.maskedNumber && <span style={{ opacity: 0.7, fontFamily: 'monospace' }}>({doc.maskedNumber.slice(-4)})</span>}
                        </span>
                      );
                    })}
                  </div>

                  {/* Status badge */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '0.25rem 0.65rem', borderRadius: 99,
                    fontSize: '0.78rem', fontWeight: 600,
                    background: config.bg, color: config.color
                  }}>
                    {config.icon} {config.label}
                  </span>

                  {/* Pending age */}
                  {(kCase.status === 'Pending Approval' || kCase.status === 'In Review') && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#f97316' }}>
                      <Clock size={12} /> {getPendingAge(kCase.submittedAt)}
                    </span>
                  )}

                  {/* Review actions */}
                  {(kCase.status === 'Pending Approval' || kCase.status === 'In Review') && canReview && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => { e.stopPropagation(); setReviewModalCase(kCase); setReviewDecision('Approved'); setReviewReason(''); }}
                      style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Eye size={14} /> Review
                    </button>
                  )}
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem 0' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Assigned Advisor</div>
                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <User size={14} /> {kCase.assignedAdvisorName}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Submitted</div>
                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} /> {kCase.submittedAt || 'Not yet'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Request Channel</div>
                        <div style={{ fontWeight: 500 }}>{kCase.requestChannel || 'N/A'}</div>
                      </div>
                      {kCase.reviewerName && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Reviewed By</div>
                          <div style={{ fontWeight: 500 }}>{kCase.reviewerName} {kCase.isDelegatedReview ? '(Delegated)' : ''}</div>
                        </div>
                      )}
                    </div>

                    {/* Policy Note */}
                    {kCase.policyNote && (
                      <div style={{
                        padding: '0.6rem 0.8rem', borderRadius: 8,
                        background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem'
                      }}>
                        <strong style={{ color: '#3b82f6' }}>Policy:</strong> {kCase.policyNote}
                      </div>
                    )}

                    {/* Document Cards */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={15} /> Documents
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                        {kCase.documents.map((doc, idx) => {
                          const dCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG['Not Started'];
                          return (
                            <div key={idx} className="card" style={{
                              padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
                              borderLeft: `3px solid ${dCfg.color}`
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.85rem' }}>
                                {DOC_ICON[doc.type]} {doc.type}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                                <span style={{ padding: '0.15rem 0.4rem', borderRadius: 4, background: dCfg.bg, color: dCfg.color, fontWeight: 500, fontSize: '0.72rem' }}>
                                  {doc.status}
                                </span>
                                <span style={{ color: 'var(--text-secondary)' }}>v{doc.version}</span>
                              </div>
                              {doc.maskedNumber && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                  ID: {doc.maskedNumber}
                                </div>
                              )}
                              {doc.fileName && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  📎 {doc.fileName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Audit Trail */}
                    {kCase.auditTrail.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={15} /> Audit Trail
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 200, overflowY: 'auto' }}>
                          {kCase.auditTrail.map(entry => (
                            <div key={entry.id} style={{
                              display: 'flex', gap: '0.75rem', padding: '0.5rem 0',
                              borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem'
                            }}>
                              <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '0.72rem', minWidth: 110 }}>
                                {entry.timestamp}
                              </span>
                              <span style={{ fontWeight: 500 }}>{entry.actorName}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{entry.detail}</span>
                              {entry.isDelegated && (
                                <span style={{ fontSize: '0.68rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 600 }}>
                                  Delegated
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalCase && (
        <div className="modal-overlay" onClick={() => setReviewModalCase(null)}>
          <div
            className="modal-content kyc-review-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 520, width: '95%', borderRadius: 16, padding: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={22} style={{ color: '#f59e0b' }} />
                  Review KYC Case
                </h2>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {reviewModalCase.leadName} · {reviewModalCase.assignedAdvisorName}
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setReviewModalCase(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Documents summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              {reviewModalCase.documents.map((doc, i) => {
                const dCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG['Not Started'];
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0',
                    borderBottom: i < reviewModalCase.documents.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    {DOC_ICON[doc.type]} 
                    <span style={{ fontWeight: 500, flex: 1 }}>{doc.type}</span>
                    {doc.maskedNumber && <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{doc.maskedNumber}</span>}
                    <span style={{ padding: '0.15rem 0.45rem', borderRadius: 4, background: dCfg.bg, color: dCfg.color, fontSize: '0.75rem', fontWeight: 600 }}>
                      {doc.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Decision */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>Decision</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['Approved', 'Needs Reupload', 'Rejected'] as const).map(d => (
                  <button
                    key={d}
                    className={`btn btn-sm ${reviewDecision === d ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setReviewDecision(d)}
                    style={{
                      flex: 1,
                      background: reviewDecision === d
                        ? d === 'Approved' ? '#10b981' : d === 'Rejected' ? '#ef4444' : '#f59e0b'
                        : undefined,
                      color: reviewDecision === d ? '#fff' : undefined,
                      borderColor: reviewDecision === d
                        ? d === 'Approved' ? '#10b981' : d === 'Rejected' ? '#ef4444' : '#f59e0b'
                        : undefined,
                    }}
                  >
                    {d === 'Approved' && <CheckCircle2 size={14} />}
                    {d === 'Rejected' && <XCircle size={14} />}
                    {d === 'Needs Reupload' && <RefreshCw size={14} />}
                    <span style={{ marginLeft: 4 }}>{d === 'Needs Reupload' ? 'Reupload' : d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason (required for Reject/Reupload) */}
            {(reviewDecision === 'Rejected' || reviewDecision === 'Needs Reupload') && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  className="input"
                  value={reviewReason}
                  onChange={e => setReviewReason(e.target.value)}
                  placeholder={reviewDecision === 'Rejected' ? 'Specify reason for rejection...' : 'Specify what needs to be reuploaded...'}
                  rows={3}
                  style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem' }}
                />
              </div>
            )}

            <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '0.6rem 0.8rem', fontSize: '0.78rem', color: '#f59e0b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={14} />
              This action will be recorded as a <strong>Delegated Team Approval</strong> by {currentUser.name}.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setReviewModalCase(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleReview}
                style={{
                  background: reviewDecision === 'Approved' ? '#10b981' : reviewDecision === 'Rejected' ? '#ef4444' : '#f59e0b',
                  borderColor: reviewDecision === 'Approved' ? '#10b981' : reviewDecision === 'Rejected' ? '#ef4444' : '#f59e0b',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                {reviewDecision === 'Approved' ? <CheckCircle2 size={16} /> : reviewDecision === 'Rejected' ? <XCircle size={16} /> : <RefreshCw size={16} />}
                Confirm {reviewDecision === 'Needs Reupload' ? 'Reupload Request' : reviewDecision}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
