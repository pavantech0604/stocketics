import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { CreditCard, CheckCircle, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PayrollProcessor: React.FC = () => {
  const { employees, showToast } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cycleStatus, setCycleStatus] = useState<'Ready' | 'Disbursed'>('Ready');

  const totalMonthlyPayroll = employees.reduce((acc, e) => acc + e.salary, 0);
  const totalPF = Math.round(totalMonthlyPayroll * 0.06);
  const totalTax = Math.round(totalMonthlyPayroll * 0.08);
  const totalNet = totalMonthlyPayroll - totalPF - totalTax;

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCycleStatus('Disbursed');
      confetti({ particleCount: 80, spread: 70 });
      showToast(`Payroll Cycle #09 Processed! ₹${totalNet.toLocaleString('en-IN')} disbursed via Corporate Direct Deposit.`, 'success');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Payroll & Compensation Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Monthly salary disbursements, tax withholdings, statutory PF, and advisory commissions for Apex Edge.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-primary"
            onClick={handleRunPayroll}
            disabled={isProcessing || cycleStatus === 'Disbursed'}
          >
            <CreditCard size={16} />
            <span>{isProcessing ? 'Processing Disbursement...' : cycleStatus === 'Disbursed' ? 'Cycle #09 Disbursed' : 'Execute September Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Metric Overview */}
      <div className="kpi-grid-4">
        <div className="card stat-card">
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #0f75bd 0%, #051d33 100%)' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">GROSS PAYROLL</span>
            <span className="stat-value">₹{totalMonthlyPayroll.toLocaleString('en-IN')}</span>
            <span className="stat-delta-row">
              <span className="delta-badge positive">+2.4%</span>
              <span style={{ color: 'var(--text-muted)' }}>vs August</span>
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">NET PAYOUT</span>
            <span className="stat-value">₹{totalNet.toLocaleString('en-IN')}</span>
            <span className="stat-delta-row">
              <span className="delta-badge positive">98% Auto-cleared</span>
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <FileSpreadsheet size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">STATUTORY PF / ESI</span>
            <span className="stat-value">₹{totalPF.toLocaleString('en-IN')}</span>
            <span className="stat-delta-row">
              <span style={{ color: 'var(--text-muted)' }}>EPFO Compliant</span>
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">TDS WITHHOLDINGS</span>
            <span className="stat-value">₹{totalTax.toLocaleString('en-IN')}</span>
            <span className="stat-delta-row">
              <span style={{ color: 'var(--text-muted)' }}>ITR-2/16 Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Salary Breakdown Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Personnel Compensation Roster</div>
          <span className="badge badge-active">Cycle #09 (Due in 3 Days)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Department</th>
                <th>Basic Pay</th>
                <th>HRA Allowance</th>
                <th>PF Deduction</th>
                <th>TDS Tax</th>
                <th>Net Payable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const basic = Math.round(emp.salary * 0.5);
                const hra = Math.round(emp.salary * 0.25);
                const pf = Math.round(emp.salary * 0.06);
                const tds = Math.round(emp.salary * 0.08);
                const net = emp.salary - pf - tds;
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="user-cell">
                        <img src={emp.avatar} alt={emp.name} />
                        <div>
                          <div className="user-cell-name">{emp.name}</div>
                          <div className="user-cell-sub">{emp.title}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{emp.department}</span></td>
                    <td className="mono-cell">₹{basic.toLocaleString('en-IN')}</td>
                    <td className="mono-cell">₹{hra.toLocaleString('en-IN')}</td>
                    <td className="mono-cell" style={{ color: 'var(--danger)' }}>-₹{pf.toLocaleString('en-IN')}</td>
                    <td className="mono-cell" style={{ color: 'var(--warning)' }}>-₹{tds.toLocaleString('en-IN')}</td>
                    <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--success)' }}>
                      ₹{net.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${cycleStatus === 'Disbursed' ? 'badge-active' : 'badge-leave'}`}>
                        <span className="badge-dot" />
                        {cycleStatus === 'Disbursed' ? 'Paid' : 'Pending Batch'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
