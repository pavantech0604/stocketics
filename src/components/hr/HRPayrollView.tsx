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
  Calculator,
  Building,
  RotateCcw,
  X,
  Clock,
  Filter,
  Coins
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
    role: 'Senior Advisory Specialist',
    month: 'August 2026',
    basicSalary: 55000,
    hra: 27500,
    allowancesTotal: 25000,
    deductionsTotal: 9000,
    netSalary: 98500,
    status: 'Disbursed',
    paymentDate: '31-Aug-2026',
    utrRef: 'HDFC-SAL-9823'
  },
  {
    id: 'sal-104',
    employeeName: 'Neha Reddy',
    role: 'Relationship Manager',
    month: 'August 2026',
    basicSalary: 45000,
    hra: 22500,
    allowancesTotal: 18000,
    deductionsTotal: 7500,
    netSalary: 78000,
    status: 'Disbursed',
    paymentDate: '31-Aug-2026',
    utrRef: 'HDFC-SAL-9824'
  }
];

export const HRPayrollView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  const [currentTab, setCurrentTab] = useState<'salaries' | 'allowances' | 'deductions'>('salaries');
  const [salaries, setSalaries] = useState<SalaryRecord[]>(INITIAL_SALARIES);
  const [allowances, setAllowances] = useState<AllowanceRecord[]>(INITIAL_ALLOWANCES);
  const [deductions, setDeductions] = useState<DeductionRecord[]>(INITIAL_DEDUCTIONS);

  // Modals
  const [showCreateSalaryModal, setShowCreateSalaryModal] = useState(false);
  const [showAddAllowanceModal, setShowAddAllowanceModal] = useState(false);
  const [showAddDeductionModal, setShowAddDeductionModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
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
    if (activeTab === 'salary-create' || activeTab === 'create-salary') {
      setCurrentTab('salaries');
      setShowCreateSalaryModal(true);
    } else if (activeTab === 'allowance-add' || activeTab === 'add-allowance') {
      setCurrentTab('allowances');
      setShowAddAllowanceModal(true);
    } else if (activeTab === 'deduction-add' || activeTab === 'add-deduction') {
      setCurrentTab('deductions');
      setShowAddDeductionModal(true);
    } else if (activeTab === 'allowance' || activeTab === 'allowance-list') {
      setCurrentTab('allowances');
    } else if (activeTab === 'deduction-list' || activeTab === 'deduction') {
      setCurrentTab('deductions');
    } else {
      setCurrentTab('salaries');
    }
  }, [activeTab]);

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
    setShowAddAllowanceModal(false);
    setNewAllowance({
      name: '',
      type: 'Fixed Monthly',
      amount: 3000,
      applicableDepartment: 'All Employees',
      isTaxable: false
    });
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
    setShowAddDeductionModal(false);
    setNewDeduction({
      name: '',
      deductionType: 'Statutory (PF / PT)',
      amountOrPercent: '',
      applicableTo: 'All Staff'
    });
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
      paymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      utrRef: `HDFC-SAL-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setSalaries(prev => [generated, ...prev]);
    try { confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
    showToast(`Payslip generated for ${newSalary.employeeName} - Net: ₹${net.toLocaleString('en-IN')}`, 'success');
    setShowCreateSalaryModal(false);
  };

  // Metrics
  const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0);
  const disbursedCount = salaries.filter(s => s.status === 'Disbursed').length;

  const filteredSalaries = salaries.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      s.employeeName.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.utrRef.toLowerCase().includes(q);

    const matchesMonth = monthFilter === 'all' || s.month === monthFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setMonthFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || monthFilter !== 'all' || statusFilter !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Payroll</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'salaries' ? 'Salary Disbursements' : currentTab === 'allowances' ? 'Allowances' : 'Deductions'}
          </span>
        </div>
      </div>

      {/* Standard Page Header & Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-ref" style={{ margin: 0 }}>Payroll & Salary</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Disbursements, statutory deductions, monthly allowances, and employee payslips.
          </p>
        </div>

        {/* Separated Action Commands */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="btn btn-secondary action-btn-interactive"
            onClick={() => setShowAddAllowanceModal(true)}
            title="Configure a new recurring or one-time allowance rule"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              fontSize: '0.86rem', 
              fontWeight: 600,
              height: '38px', 
              borderRadius: '8px',
              padding: '0 0.95rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <Plus size={15} style={{ color: 'var(--stocketics-blue-500)' }} />
            <span>Add Allowance</span>
          </button>

          <button 
            type="button"
            className="btn btn-secondary action-btn-interactive"
            onClick={() => setShowAddDeductionModal(true)}
            title="Configure a new statutory or penalty deduction rule"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              fontSize: '0.86rem', 
              fontWeight: 600,
              height: '38px', 
              borderRadius: '8px',
              padding: '0 0.95rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <MinusCircle size={15} style={{ color: '#ef4444' }} />
            <span>Add Deduction</span>
          </button>

          <button 
            type="button"
            className="btn btn-primary action-btn-interactive"
            onClick={() => setShowCreateSalaryModal(true)}
            title="Disburse monthly salary and create employee payslip"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              fontSize: '0.86rem', 
              fontWeight: 600,
              height: '38px', 
              borderRadius: '8px',
              padding: '0 1rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <Calculator size={15} />
            <span>Create Salary</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--stocketics-blue-500)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Net Disbursed
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            ₹{totalPayroll.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Across {salaries.length} employee payslips
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Disbursed Payslips
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {disbursedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Bank UTR confirmed
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Allowance Rules
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {allowances.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Travel, Internet, Terminal & OT
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Deduction Policies
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {deductions.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            PF, PT, Late penalties & Advances
          </div>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.4rem', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'salaries' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('salaries'); setActiveTab('salary-list'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <CreditCard size={14} /> 
          <span>Salary Disbursements</span>
          <span style={{ 
            background: currentTab === 'salaries' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {salaries.length}
          </span>
        </button>

        <button 
          className={`btn btn-sm ${currentTab === 'allowances' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('allowances'); setActiveTab('allowance-list'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Coins size={14} /> 
          <span>Allowances</span>
          <span style={{ 
            background: currentTab === 'allowances' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {allowances.length}
          </span>
        </button>

        <button 
          className={`btn btn-sm ${currentTab === 'deductions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('deductions'); setActiveTab('deduction-list'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <MinusCircle size={14} /> 
          <span>Deductions</span>
          <span style={{ 
            background: currentTab === 'deductions' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {deductions.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SALARIES LIST */}
      {currentTab === 'salaries' && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Search employee, role, or UTR ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.84rem' }}
                  />
                </div>

                <select 
                  className="form-select"
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value="all">All Payroll Months</option>
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                </select>

                <select 
                  className="form-select"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Disbursed">Disbursed</option>
                  <option value="Pending Approval">Pending Approval</option>
                </select>

                {hasActiveFilters && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={clearFilters}
                    style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}
                  >
                    <RotateCcw size={13} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredSalaries.length}</strong> of {salaries.length} payslips
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '880px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Employee & Role</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payroll Month</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Basic + HRA</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Allowances</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Deductions</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Net Take-Home</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No salary records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSalaries.map(sal => (
                      <tr key={sal.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sal.employeeName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{sal.role}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--stocketics-blue-500)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                            {sal.utrRef}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {sal.month}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600 }}>₹{(sal.basicSalary + sal.hra).toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Basic: ₹{sal.basicSalary.toLocaleString('en-IN')}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 600 }}>
                          +₹{sal.allowancesTotal.toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: '#ef4444', fontWeight: 600 }}>
                          -₹{sal.deductionsTotal.toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          ₹{sal.netSalary.toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <span className="delta-badge positive" style={{ fontSize: '0.72rem' }}>
                            {sal.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: ALLOWANCES LIST */}
      {currentTab === 'allowances' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Allowance Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Calculation Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Applicable Desk</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Tax Category</th>
                </tr>
              </thead>
              <tbody>
                {allowances.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {a.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {a.type}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="delta-badge" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#0284c7', fontSize: '0.74rem' }}>
                        {a.applicableDepartment}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#10b981' }}>
                      ₹{a.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <span className="delta-badge" style={{ fontSize: '0.72rem', background: a.isTaxable ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: a.isTaxable ? '#ef4444' : '#047857' }}>
                        {a.isTaxable ? 'Taxable' : 'Tax Exempt'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEDUCTIONS LIST */}
      {currentTab === 'deductions' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Deduction Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Policy Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Rate / Formula</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Applicable Staff</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {d.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="delta-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', fontSize: '0.74rem' }}>
                        {d.deductionType}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#ef4444' }}>
                      {d.amountOrPercent}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {d.applicableTo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE SALARY */}
      {showCreateSalaryModal && (
        <div className="modal-overlay" onClick={() => setShowCreateSalaryModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Create Salary Disbursement</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate monthly payslip breakdown and audit UTR</p>
              </div>
              <button className="btn-icon" onClick={() => setShowCreateSalaryModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSalarySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Employee Name *</label>
                  <select 
                    className="form-select"
                    value={newSalary.employeeName}
                    onChange={e => setNewSalary({ ...newSalary, employeeName: e.target.value })}
                  >
                    <option value="Ananya Sen">Ananya Sen</option>
                    <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                    <option value="Sneha Kapur">Sneha Kapur</option>
                    <option value="Rajesh Varma">Rajesh Varma</option>
                    <option value="Neha Reddy">Neha Reddy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Disbursement Month *</label>
                  <select 
                    className="form-select"
                    value={newSalary.month}
                    onChange={e => setNewSalary({ ...newSalary, month: e.target.value })}
                  >
                    <option value="September 2026">September 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Basic Salary (₹) *</label>
                  <input 
                    type="number"
                    required
                    value={newSalary.basicSalary}
                    onChange={e => setNewSalary({ ...newSalary, basicSalary: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HRA (₹) *</label>
                  <input 
                    type="number"
                    required
                    value={newSalary.hra}
                    onChange={e => setNewSalary({ ...newSalary, hra: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Allowances Total (₹)</label>
                  <input 
                    type="number"
                    value={newSalary.allowancesTotal}
                    onChange={e => setNewSalary({ ...newSalary, allowancesTotal: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deductions Total (₹)</label>
                  <input 
                    type="number"
                    value={newSalary.deductionsTotal}
                    onChange={e => setNewSalary({ ...newSalary, deductionsTotal: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Net Pay Computed Preview */}
              <div style={{ background: 'var(--bg-surface-alt)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estimated Net Take-Home:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--stocketics-blue-500)' }}>
                  ₹{(Number(newSalary.basicSalary) + Number(newSalary.hra) + Number(newSalary.allowancesTotal) - Number(newSalary.deductionsTotal)).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateSalaryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Payslip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ALLOWANCE */}
      {showAddAllowanceModal && (
        <div className="modal-overlay" onClick={() => setShowAddAllowanceModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Configure Allowance Rule</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Define perks, per diems, or departmental reimbursements</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAddAllowanceModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAllowanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Allowance Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Special Advisory Shift Allowance"
                  value={newAllowance.name}
                  onChange={e => setNewAllowance({ ...newAllowance, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Allowance Type</label>
                  <select 
                    className="form-select"
                    value={newAllowance.type}
                    onChange={e => setNewAllowance({ ...newAllowance, type: e.target.value as any })}
                  >
                    <option value="Fixed Monthly">Fixed Monthly</option>
                    <option value="Percentage of Basic">Percentage of Basic</option>
                    <option value="Per Diem">Per Diem</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Amount (₹) *</label>
                  <input 
                    type="number"
                    required
                    value={newAllowance.amount}
                    onChange={e => setNewAllowance({ ...newAllowance, amount: Number(e.target.value) })}
                    className="form-input"
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
                  <option value="Advisory Sales">Advisory Sales</option>
                  <option value="Equity Research">Equity Research</option>
                  <option value="Derivatives Desk">Derivatives Desk</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddAllowanceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Allowance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD DEDUCTION */}
      {showAddDeductionModal && (
        <div className="modal-overlay" onClick={() => setShowAddDeductionModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Configure Deduction Rule</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Define statutory or disciplinary salary deductions</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAddDeductionModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDeductionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Deduction Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Employee Provident Fund (PF)"
                  value={newDeduction.name}
                  onChange={e => setNewDeduction({ ...newDeduction, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Deduction Type</label>
                  <select 
                    className="form-select"
                    value={newDeduction.deductionType}
                    onChange={e => setNewDeduction({ ...newDeduction, deductionType: e.target.value as any })}
                  >
                    <option value="Statutory (PF / PT)">Statutory (PF / PT)</option>
                    <option value="Fine / Late Penalty">Fine / Late Penalty</option>
                    <option value="Loan / Advance Recovery">Loan / Advance Recovery</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Rate / Amount Description *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 12% of Basic or ₹200/mo"
                    value={newDeduction.amountOrPercent}
                    onChange={e => setNewDeduction({ ...newDeduction, amountOrPercent: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Applicable Staff</label>
                <input 
                  type="text"
                  placeholder="e.g. All Permanent Staff"
                  value={newDeduction.applicableTo}
                  onChange={e => setNewDeduction({ ...newDeduction, applicableTo: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDeductionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
