import React from 'react';
import { Shield, FileCheck, AlertTriangle, Download, ExternalLink } from 'lucide-react';

export const ComplianceVault: React.FC = () => {
  const complianceRecords = [
    {
      id: 'doc-01',
      title: 'SEBI Research Analyst (RA) Registration Certificate',
      refNo: 'INH000012489',
      issuedBy: 'Securities and Exchange Board of India',
      validTill: '14-Nov-2027',
      status: 'Compliant',
      type: 'Statutory License',
    },
    {
      id: 'doc-02',
      title: 'Annual Prevention of Insider Trading (PIT) Audit',
      refNo: 'AUD-2026-Q2',
      issuedBy: 'Deloitte & Touche LLP',
      validTill: '31-Oct-2026',
      status: 'Renewal Due (54 Days)',
      type: 'Audit Report',
    },
    {
      id: 'doc-03',
      title: 'NISM Series XV: Research Analyst Certification (Roster)',
      refNo: 'NISM-ROST-09',
      issuedBy: 'National Institute of Securities Markets',
      validTill: '20-Dec-2026',
      status: 'Compliant (12/12 Certified)',
      type: 'Staff Certification',
    },
    {
      id: 'doc-04',
      title: 'Master Client Disclosures & Risk Profiling Mandate',
      refNo: 'DP-DISCL-V4',
      issuedBy: 'Stocketics Legal & Compliance',
      validTill: 'Permanent',
      status: 'Active',
      type: 'Policy Document',
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          SEBI Compliance & Regulatory Vault
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Statutory financial advisory licenses, analyst registrations, and audit trails for Stocketics Advisory & Research Pvt Ltd.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="card stat-card">
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">REGULATORY STATUS</span>
            <span className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--success)' }}>100% Compliant</span>
            <span className="stat-delta-row" style={{ color: 'var(--text-muted)' }}>SEBI RA Lic: INH000012489</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #0f75bd 0%, #051d33 100%)' }}>
            <FileCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">ACTIVE AUDITS</span>
            <span className="stat-value">4 Mandates</span>
            <span className="stat-delta-row" style={{ color: 'var(--text-muted)' }}>All filings current</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">EXPIRY RADAR</span>
            <span className="stat-value">1 Due</span>
            <span className="stat-delta-row" style={{ color: 'var(--warning)' }}>PIT Audit Renewal in Oct</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Registered Statutory Documents & Certifications</div>
        </div>
        <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="data-table table-min-750">
            <thead>
              <tr>
                <th>Document / License Title</th>
                <th>Classification</th>
                <th>Registration / Ref ID</th>
                <th>Issuing Authority</th>
                <th>Validity / Renewal</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complianceRecords.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileCheck size={16} style={{ color: 'var(--apex-blue-500)' }} />
                      <span>{doc.title}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-remote">{doc.type}</span></td>
                  <td className="mono-cell">{doc.refNo}</td>
                  <td>{doc.issuedBy}</td>
                  <td style={{ fontSize: '0.82rem' }}>{doc.validTill}</td>
                  <td>
                    <span className={`badge ${doc.status.includes('Compliant') || doc.status === 'Active' ? 'badge-active' : 'badge-leave'}`}>
                      <span className="badge-dot" />
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`Viewing statutory certificate: ${doc.title}\nRef: ${doc.refNo}`)}
                    >
                      <Download size={13} />
                      <span>Verify</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
