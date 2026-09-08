import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  CreditCard, 
  Plus, 
  MinusCircle, 
  CheckCircle2, 
  Search, 
  DollarSign, 
  Download, 
  FileText, 
  TrendingUp, 
  Percent,
  Calculator,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AllowanceRecord {
  id: string;
  name: string;
  type: 'Fixed Monthly' | 'Percentage of Basic' | 'Per Diem';
  amount: number;
  applicableDepartment: string;
  isTaxable: boolean;
}

interface DeductionRecord {
  id: string;
  name: string;
  deductionType: 'Statutory (PF / PT)' | 'Fine / Late Penalty' | 'Loan / Advance Recovery';
  amountOrPercent: string;
  applicableTo: string;
}

interface SalaryRecord {
  id: string;
  employeeName: string;
  role: string;
  month: string;
  basicSalary: number;
  hra: number;
  allowancesTotal: number;
  deductionsTotal: number;
  netSalary: number;
  status: 'Disbursed' | 'Pending Approval';
  paymentDate: string;
  utrRef: string;
}

const INITIAL_ALLOWANCES: AllowanceRecord[] = [
  {
    id: 'alw-1',
    name: 'Research Terminal & Data Allowance',
    type: 'Fixed Monthly',
    amount: 5000,
    applicableDepartment: 'Equity Research',
    isTaxable: false
  },
  {
    id: 'alw-2',
    name: 'Sales Client Conveyance & Travel',
    type: 'Fixed Monthly',
    amount: 6000,
    applicableDepartment: 'Advisory Sales',
    isTaxable: false
  },
  {
    id: 'alw-3',
    name: 'Mobile Calling & Internet Reimbursement',
    type: 'Fixed Monthly',
    amount: 2500,
    applicableDepartment: 'All Employees',
    isTaxable: false
  },
  {
    id: 'alw-4',
    name: 'Market Closing Overtime / Comp Allowance',
    type: 'Per Diem',
    amount: 1500,
    applicableDepartment: 'Derivatives Desk',
    isTaxable: true
  }
];

const INITIAL_DEDUCTIONS: DeductionRecord[] = [
  {
    id: 'ded-1',
    name: 'Provident Fund (Employee PF 12%)',
    deductionType: 'Statutory (PF / PT)',
    amountOrPercent: '12% of Basic',
    applicableTo: 'All Permanent Staff'
  },
  {
    id: 'ded-2',
    name: 'Karnataka Professional Tax (PT)',
    deductionType: 'Statutory (PF / PT)',
    amountOrPercent: '₹200 / month',
    applicableTo: 'All Employees (>₹15,000)'
  },
  {
    id: 'ded-3',
    name: 'Biometric Late Punch Penalty',
    deductionType: 'Fine / Late Penalty',
    amountOrPercent: '₹250 per 3 late marks',
    applicableTo: 'Attendance Roster'
  },
  {
    id: 'ded-4',
    name: 'Staff Festival Advance Recovery',
    deductionType: 'Loan / Advance Recovery',
    amountOrPercent: '₹5,000 / month',
    applicableTo: 'Subscribed Employees'
  }
];

const INITIAL_SALARIES: SalaryRecord[] = [
  {
    id: 'sal-101',
    employeeName: 'Rajesh Varma',
    role: 'VP, Equity Advisory',
    month: 'August 2026',
    basicSalary: 120000,
    hra: 60000,
    allowancesTotal: 60000,
    deductionsTotal: 18000,
    netSalary: 222000,
    status: 'Disbursed',
    paymentDate: '31-Aug-2026',
    utrRef: 'HDFC-SAL-9821'
  },
  {
    id: 'sal-102',
    employeeName: 'Sneha Kapur',
    role: 'Senior Derivatives Analyst',
    month: 'August 2026',
    basicSalary: 70000,
    hra: 35000,
    allowancesTotal: 30000,
    deductionsTotal: 11000,
    netSalary: 124000,
    status: 'Disbursed',
    paymentDate: '31-Aug-2026',
    utrRef: 'HDFC-SAL-9822'
  },
  {
    id: 'sal-103',
    employeeName: 'Rohan Deshmukh',
    role: 'Senior Sales Executive',
    month: 'August 2026',
    basicSalary: 45000,
    hra: 22500,
    allowancesTotal: 25000,
    deductionsTotal: 7500,
    netSalary: 85000,
    status: 'Disbursed',
    paymentDate: '31-Aug-2026',
    utrRef: 'HDFC-SAL-9823'
  },
  {
    id: 'sal-104',
    employeeName: 'Aditya Roy',
    role: 'Equity Research Analyst',
    month: 'August 2026',
    basicSalary: 55000,
    hra: 27500,
    allowancesTotal: 27500,
    deductionsTotal: 9000,
    netSalary: 101000,
    status: 'Disbursed',
    paymentDate: '31-Aug-2026',
    utrRef: 'HDFC-SAL-9824'
  }
];

export const HRPayrollView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  // Subtabs mapping:
  // Allowance: 'add-allowance', 'allowance'
  // Deduction: 'add-deduction', 'deduction-list'
  // Salary: 'create-salary', 'salary-list'
  const getSubTab = (): 'add-allowance' | 'allowance-list' | 'add-deduction' | 'deduction-list' | 'create-salary' | 'salary-list' => {
    if (activeTab === 'allowance-add' || activeTab === 'add-allowance') return 'add-allowance';
    if (activeTab === 'allowance' || activeTab === 'allowance-list') return 'allowance-list';
    if (activeTab === 'deduction-add' || activeTab === 'add-deduction') return 'add-deduction';
    if (activeTab === 'deduction' || activeTab === 'deduction-list') return 'deduction-list';
    if (activeTab === 'salary-create' || activeTab === 'create-salary') return 'create-salary';
    return 'salary-list';
  };

  const [currentTab, setCurrentTab] = useState(getSubTab());
  const [allowances, setAllowances] = useState<AllowanceRecord[]>(INITIAL_ALLOWANCES);
  const [deductions, setDeductions] = useState<DeductionRecord[]>(INITIAL_DEDUCTIONS);
  const [salaries, setSalaries] = useState<SalaryRecord[]>(INITIAL_SALARIES);

  // Forms State
  const [newAllowance, setNewAllowance] = useState({
    name: '',
    type: 'Fixed Monthly' as AllowanceRecord['type'],
    amount: 3000,
    applicableDepartment: 'All Employees',
    isTaxable: false
  });

  const [newDeduction, setNewDeduction] = useState({
    name: '',
    deductionType: 'Statutory (PF / PT)' as DeductionRecord['deductionType'],
    amountOrPercent: '',
    applicableTo: 'All Staff'
  });

  const [newSalary, setNewSalary] = useState({
    employeeName: 'Ananya Sen',
    role: 'Advisory Sales Specialist',
    month: 'September 2026',
    basicSalary: 50000,
    hra: 25000,
    allowancesTotal: 20000,
    deductionsTotal: 8000
  });

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: any, tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleAddAllowanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllowance.name.trim()) return;

    const added: AllowanceRecord = {
      id: `alw-${Date.now()}`,
      name: newAllowance.name,
      type: newAllowance.type,
      amount: Number(newAllowance.amount),
      applicableDepartment: newAllowance.applicableDepartment,
      isTaxable: newAllowance.isTaxable
    };

    setAllowances(prev => [added, ...prev]);
    showToast(`Allowance "${newAllowance.name}" configured!`, 'success');
    handleTabChange('allowance-list', 'allowance');
  };

  const handleAddDeductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeduction.name.trim()) return;

    const added: DeductionRecord = {
      id: `ded-${Date.now()}`,
      name: newDeduction.name,
      deductionType: newDeduction.deductionType,
      amountOrPercent: newDeduction.amountOrPercent || 'Fixed',
      applicableTo: newDeduction.applicableTo
    };

    setDeductions(prev => [added, ...prev]);
    showToast(`Deduction "${newDeduction.name}" configured!`, 'success');
    handleTabChange('deduction-list', 'deduction-list');
  };

  const handleCreateSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const net = Number(newSalary.basicSalary) + Number(newSalary.hra) + Number(newSalary.allowancesTotal) - Number(newSalary.deductionsTotal);

    const generated: SalaryRecord = {
      id: `sal-${Date.now()}`,
      employeeName: newSalary.employeeName,
      role: newSalary.role,
      month: newSalary.month,
      basicSalary: Number(newSalary.basicSalary),
      hra: Number(newSalary.hra),
      allowancesTotal: Number(newSalary.allowancesTotal),
      deductionsTotal: Number(newSalary.deductionsTotal),
      netSalary: net,
      status: 'Disbursed',
      paymentDate: '07-Sep-2026',
      utrRef: `HDFC-SAL-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setSalaries(prev => [generated, ...prev]);
    try { confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
    showToast(`Payslip generated for ${newSalary.employeeName} - Net Pay: ₹${net.toLocaleString('en-IN')}`, 'success');
    handleTabChange('salary-list', 'salary-list');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Payroll Engine</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'add-allowance' && 'Add Allowance'}
            {currentTab === 'allowance-list' && 'Allowance'}
            {currentTab === 'add-deduction' && 'Add Deduction'}
            {currentTab === 'deduction-list' && 'Deduction list'}
            {currentTab === 'create-salary' && 'Create Salary'}
            {currentTab === 'salary-list' && 'Salary list'}
          </span>
        </div>
      </div>

      {/* Header & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title-ref" style={{ margin: 0 }}>
          {currentTab === 'create-salary' || currentTab === 'salary-list' ? 'Salary' : 'Payroll Engine'}
        </h1>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>

          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('dashboard')}
            style={{ 
              background: '#00a8ff', 
              borderColor: '#00a8ff', 
              color: '#ffffff', 
              fontWeight: 600, 
              padding: '0.45rem 1.25rem', 
              borderRadius: '4px',
              fontSize: '0.88rem',
              height: '36px'
            }}
          >
            &lt;&lt; Back
          </button>
        </div>
      </div>

      {/* Sub-Options Nav Tabs: Grouped by Module matching screenshots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem', overflowX: 'auto' }}>
        {/* Allowance Group */}
        <button 
          className={`btn btn-sm ${currentTab === 'add-allowance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('add-allowance', 'allowance-add')}
        >
          <Plus size={13} /> Add Allowance
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'allowance-list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('allowance-list', 'allowance')}
        >
          Allowance ({allowances.length})
        </button>

        {/* Deduction Group */}
        <button 
          className={`btn btn-sm ${currentTab === 'add-deduction' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('add-deduction', 'deduction-add')}
        >
          <MinusCircle size={13} /> Add Deduction
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'deduction-list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('deduction-list', 'deduction-list')}
        >
          Deduction list ({deductions.length})
        </button>

        {/* Salary Group */}
        <button 
          className={`btn btn-sm ${currentTab === 'create-salary' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('create-salary', 'salary-create')}
        >
          <Calculator size={13} /> Create Salary
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'salary-list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('salary-list', 'salary-list')}
        >
          Salary list ({salaries.length})
        </button>
      </div>

      {/* VIEW: ADD ALLOWANCE */}
      {currentTab === 'add-allowance' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Plus size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Configure New Staff Allowance</span>
              </div>
              <div className="card-subtitle">Define monthly perks, phone/internet stipends, or travel allowances</div>
            </div>
          </div>

          <form onSubmit={handleAddAllowanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Allowance Name *</label>
              <input 
                className="form-input" 
                required
                placeholder="e.g. Research Terminal & Internet Allowance"
                value={newAllowance.name}
                onChange={e => setNewAllowance({ ...newAllowance, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Allowance Type *</label>
                <select 
                  className="form-select"
                  value={newAllowance.type}
                  onChange={e => setNewAllowance({ ...newAllowance, type: e.target.value as any })}
                >
                  <option value="Fixed Monthly">Fixed Monthly Amount</option>
                  <option value="Percentage of Basic">Percentage of Basic</option>
                  <option value="Per Diem">Per Diem (Daily Shift)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  value={newAllowance.amount}
                  onChange={e => setNewAllowance({ ...newAllowance, amount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Applicable Department</label>
              <select 
                className="form-select"
                value={newAllowance.applicableDepartment}
                onChange={e => setNewAllowance({ ...newAllowance, applicableDepartment: e.target.value })}
              >
                <option value="All Employees">All Employees</option>
                <option value="Equity Research">Equity Research</option>
                <option value="Advisory Sales">Advisory Sales</option>
                <option value="Derivatives Desk">Derivatives Desk</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Save Allowance Policy</button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: ALLOWANCE LIST */}
      {currentTab === 'allowance-list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Allowance Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department Eligibility</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {allowances.map(alw => (
                <tr key={alw.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {alw.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {alw.type}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--success)' }}>
                    ₹{alw.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="delta-badge" style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.74rem' }}>
                      {alw.applicableDepartment}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => showToast(`Editing allowance ${alw.name}`, 'info')}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: ADD DEDUCTION */}
      {currentTab === 'add-deduction' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <MinusCircle size={18} style={{ color: 'var(--error)' }} />
                <span>Configure Salary Deduction</span>
              </div>
              <div className="card-subtitle">Set statutory tax, PF contribution, or biometric penalty rules</div>
            </div>
          </div>

          <form onSubmit={handleAddDeductionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Deduction Rule Name *</label>
              <input 
                className="form-input" 
                required
                placeholder="e.g. Professional Tax (Karnataka)"
                value={newDeduction.name}
                onChange={e => setNewDeduction({ ...newDeduction, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Deduction Type *</label>
                <select 
                  className="form-select"
                  value={newDeduction.deductionType}
                  onChange={e => setNewDeduction({ ...newDeduction, deductionType: e.target.value as any })}
                >
                  <option value="Statutory (PF / PT)">Statutory (PF / PT / TDS)</option>
                  <option value="Fine / Late Penalty">Fine / Late Attendance Penalty</option>
                  <option value="Loan / Advance Recovery">Loan / Advance Recovery</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Rate or Amount *</label>
                <input 
                  className="form-input" 
                  required
                  placeholder="e.g. 12% of Basic or ₹200/mo"
                  value={newDeduction.amountOrPercent}
                  onChange={e => setNewDeduction({ ...newDeduction, amountOrPercent: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Save Deduction Rule</button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: DEDUCTION LIST */}
      {currentTab === 'deduction-list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Deduction Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Classification</th>
                <th style={{ padding: '0.85rem 1rem' }}>Deduction Rate</th>
                <th style={{ padding: '0.85rem 1rem' }}>Applicable Staff</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map(ded => (
                <tr key={ded.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ded.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="delta-badge" style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.74rem' }}>
                      {ded.deductionType}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ded.amountOrPercent}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {ded.applicableTo}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => showToast(`Editing deduction rule ${ded.name}`, 'info')}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: CREATE SALARY (Exact Match to Image 11) */}
      {currentTab === 'create-salary' && (
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '6px', 
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '0.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.75rem' }}>
            Salary
          </h2>

          <form onSubmit={handleCreateSalarySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* Two Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 3rem' }}>
              {/* Left Column (Image 11) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Employee</label>
                  <select 
                    className="input-field"
                    value={newSalary.employeeName}
                    onChange={e => setNewSalary({ ...newSalary, employeeName: e.target.value })}
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select</option>
                    <option value="Ananya Sen">Ananya Sen</option>
                    <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                    <option value="Aditya Roy">Aditya Roy</option>
                    <option value="Sneha Kapur">Sneha Kapur</option>
                    <option value="Karan Mehra">Karan Mehra</option>
                    <option value="Sirajul Fasal M">Sirajul Fasal M</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>For Month</label>
                  <select 
                    className="input-field"
                    value={newSalary.month}
                    onChange={e => setNewSalary({ ...newSalary, month: e.target.value })}
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Month</option>
                    <option value="September 2026">September 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Bank Name</label>
                  <input 
                    type="text" 
                    defaultValue="HDFC Bank"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Basic Salary</label>
                  <input 
                    type="text" 
                    value={newSalary.basicSalary}
                    onChange={e => setNewSalary({ ...newSalary, basicSalary: Number(e.target.value) })}
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Total leaves</label>
                  <input 
                    type="text" 
                    defaultValue="2"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Total Paid Leaves</label>
                  <input 
                    type="text" 
                    defaultValue="2"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Advance</label>
                  <input 
                    type="text" 
                    defaultValue="0"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Remaing Paid Leaves</label>
                  <input 
                    type="text" 
                    defaultValue="0"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
              </div>

              {/* Right Column (Image 11) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>User name</label>
                  <input 
                    type="text" 
                    defaultValue="ananya.sales"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Mobile</label>
                  <input 
                    type="text" 
                    defaultValue="98450 12890"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Bank Aocount No.</label>
                  <input 
                    type="text" 
                    defaultValue="50100491823101"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Total Present Days</label>
                  <input 
                    type="text" 
                    defaultValue="24"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Total Half Days</label>
                  <input 
                    type="text" 
                    defaultValue="0"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Deduct Paid Leaves</label>
                  <input 
                    type="text" 
                    defaultValue="0"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Deduct Advance</label>
                  <input 
                    type="text" 
                    defaultValue="0"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Remaing Advance</label>
                  <input 
                    type="text" 
                    defaultValue="0"
                    className="input-field" 
                    style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Allowance & Deduction Section (Image 11) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 3rem', marginTop: '1rem' }}>
              {/* Allowance Section */}
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>☑ Allowance</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select className="input-field" style={{ height: '36px', flex: 1, borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    <option value="">Select</option>
                    <option value="HRA">HRA</option>
                    <option value="Special">Special Allowance</option>
                    <option value="Travel">Travel Conveyance</option>
                  </select>
                  <input 
                    type="text" 
                    defaultValue="Fixed" 
                    className="input-field" 
                    style={{ width: '80px', height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', textAlign: 'center' }} 
                  />
                  <input 
                    type="text" 
                    placeholder="Amount" 
                    defaultValue="15000"
                    className="input-field" 
                    style={{ width: '100px', height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                  />
                  <button 
                    type="button"
                    style={{ width: '36px', height: '36px', background: '#00a8ff', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Deduction Section */}
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>☑ Deduction</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select className="input-field" style={{ height: '36px', flex: 1, borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    <option value="">Select</option>
                    <option value="PF">Provident Fund (PF)</option>
                    <option value="PT">Professional Tax (PT)</option>
                    <option value="TDS">TDS Deduction</option>
                  </select>
                  <input 
                    type="text" 
                    defaultValue="Fixed" 
                    className="input-field" 
                    style={{ width: '80px', height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', textAlign: 'center' }} 
                  />
                  <input 
                    type="text" 
                    placeholder="Amount" 
                    defaultValue="2500"
                    className="input-field" 
                    style={{ width: '100px', height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                  />
                  <button 
                    type="button"
                    style={{ width: '36px', height: '36px', background: '#00a8ff', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Gross Salary Input */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', maxWidth: '400px', marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Gross Salary</label>
              <input 
                type="text" 
                defaultValue="62,500"
                className="input-field" 
                style={{ height: '36px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ 
                  background: '#00a8ff', 
                  borderColor: '#00a8ff', 
                  color: '#ffffff', 
                  padding: '0.55rem 2rem', 
                  fontWeight: 700,
                  borderRadius: '4px',
                  fontSize: '0.92rem'
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: SALARY LIST */}
      {currentTab === 'salary-list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Employee Details</th>
                <th style={{ padding: '0.85rem 1rem' }}>Payroll Period</th>
                <th style={{ padding: '0.85rem 1rem' }}>Gross (Basic + HRA + Alw)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Deductions</th>
                <th style={{ padding: '0.85rem 1rem' }}>Net Disbursed</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Payslip</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map(sal => (
                <tr key={sal.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sal.employeeName}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{sal.role}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {sal.month}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    ₹{(sal.basicSalary + sal.hra + sal.allowancesTotal).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--error)', fontWeight: 600 }}>
                    -₹{sal.deductionsTotal.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{sal.netSalary.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => showToast(`Downloading PDF Payslip for ${sal.employeeName} (${sal.month})`, 'success')}
                    >
                      <Download size={13} /> Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
