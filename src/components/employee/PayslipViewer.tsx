import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PayslipViewer: React.FC = () => {
  const { currentUser, payslips } = useApp();
  const [selectedSlip, setSelectedSlip] = useState(payslips[0]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Digital Payslips & Tax Documents
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Official confidential earnings statements and tax deductions for Apex Edge Research personnel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Payslip</span>
          </button>
          <button className="btn btn-primary" onClick={() => alert(`Downloading signed PDF for ${selectedSlip.month} ${selectedSlip.year}`)}>
            <Download size={16} />
            <span>Download Signed PDF</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem' }}>
        {/* Left: Historical Select */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title" style={{ marginBottom: '1rem' }}>
            <FileText size={18} style={{ color: 'var(--apex-blue-500)' }} />
            <span>Pay Slip Archive</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {payslips.map(slip => (
              <div
                key={slip.id}
                onClick={() => setSelectedSlip(slip)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: selectedSlip.id === slip.id ? 'var(--bg-active)' : 'var(--bg-surface-alt)',
                  borderLeft: selectedSlip.id === slip.id ? '4px solid var(--apex-blue-600)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {slip.month} {slip.year}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <span>Disbursed {slip.paidDate}</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{slip.netPay.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Formal Detailed Payslip Sheet */}
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-strong)' }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--apex-navy-900)' }}>
                APEX EDGE RESEARCH & ADVISORY PVT LTD
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                SEBI Reg: INH000012489 • Level 4, Tech Park, Bangalore HQ - 560001
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--apex-blue-600)' }}>
                SALARY SLIP - {selectedSlip.month.toUpperCase()} {selectedSlip.year}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-active" style={{ fontSize: '0.8rem' }}>
                <CheckCircle2 size={13} /> {selectedSlip.paymentStatus}
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Paid Date: {selectedSlip.paidDate}
              </div>
            </div>
          </div>

          {/* Employee Info Block */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: 'var(--bg-surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Employee Name:</div>
              <div style={{ fontWeight: 700 }}>{currentUser.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Employee ID:</div>
              <div className="mono-cell">{currentUser.id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Department:</div>
              <div style={{ fontWeight: 600 }}>{currentUser.department}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Designation:</div>
              <div style={{ fontWeight: 600 }}>{currentUser.title}</div>
            </div>
          </div>

          {/* Earnings vs Deductions Split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Earnings */}
            <div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem', marginBottom: '0.75rem', color: 'var(--success)' }}>
                EARNINGS (INR)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Basic Salary</span>
                  <span className="mono-cell">₹{selectedSlip.basicPay.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>House Rent Allowance (HRA)</span>
                  <span className="mono-cell">₹{selectedSlip.hra.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Special Allowances</span>
                  <span className="mono-cell">₹{selectedSlip.allowances.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Advisory Research Incentives</span>
                  <span className="mono-cell" style={{ color: 'var(--success)' }}>₹{selectedSlip.incentives.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-strong)', paddingTop: '0.5rem', fontWeight: 700 }}>
                  <span>Gross Earnings:</span>
                  <span className="mono-cell">₹{selectedSlip.gross.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem', marginBottom: '0.75rem', color: 'var(--danger)' }}>
                DEDUCTIONS (INR)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Provident Fund (PF Employee)</span>
                  <span className="mono-cell">₹{selectedSlip.pf.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax Deduction (TDS/ITR)</span>
                  <span className="mono-cell">₹{selectedSlip.taxWithholding.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-strong)', paddingTop: '0.5rem', fontWeight: 700 }}>
                  <span>Total Deductions:</span>
                  <span className="mono-cell" style={{ color: 'var(--danger)' }}>₹{selectedSlip.deductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 117, 189, 0.1) 100%)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--success)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success-text)' }}>
                NET SALARY DISBURSED TO BANK
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                HDFC Bank A/C: •••• •••• 4912
              </div>
            </div>
            <div className="mono-cell" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
              ₹{selectedSlip.netPay.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
