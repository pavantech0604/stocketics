import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Plus, 
  Search, 
  Tag, 
  Receipt, 
  Building,
  Filter,
  X,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  voucherNumber: string;
  expenseHead: string;
  vendorName: string;
  amount: number;
  date: string;
  paymentMode: 'Company Account' | 'Corporate Card' | 'Cash / Petty Cash' | 'UPI';
  paidBy: string;
  status: 'Approved' | 'Pending Verification';
  description: string;
}

interface ExpenseHead {
  id: string;
  headName: string;
  monthlyBudget: number;
  spentThisMonth: number;
  department: string;
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    voucherNumber: 'EXP-2026-0841',
    expenseHead: 'Cloud Server & PBX Telecom',
    vendorName: 'Tata Tele & AWS Cloud India',
    amount: 38500,
    date: '05-Sep-2026',
    paymentMode: 'Company Account',
    paidBy: 'Siddharth Rao (IT)',
    status: 'Approved',
    description: 'Monthly cloud virtual number dialer servers and AWS EC2 hosting'
  },
  {
    id: 'exp-2',
    voucherNumber: 'EXP-2026-0842',
    expenseHead: 'Market Real-time Feeds (NSE/MCX)',
    vendorName: 'Omnesys Technologies Pvt Ltd',
    amount: 45000,
    date: '02-Sep-2026',
    paymentMode: 'Company Account',
    paidBy: 'Rajesh Varma (VP)',
    status: 'Approved',
    description: 'Tick-by-tick real time Level-2 market data feeds for research terminal'
  },
  {
    id: 'exp-3',
    voucherNumber: 'EXP-2026-0843',
    expenseHead: 'Pantry & Staff Refreshment',
    vendorName: 'Nespresso & Cafe Coffee Day',
    amount: 12400,
    date: '04-Sep-2026',
    paymentMode: 'Corporate Card',
    paidBy: 'Priya Sharma (HR)',
    status: 'Approved',
    description: 'Monthly coffee, tea and snacks supply for Bangalore trading floor'
  },
  {
    id: 'exp-4',
    voucherNumber: 'EXP-2026-0844',
    expenseHead: 'Stationery & Courier Dispatch',
    vendorName: 'BlueDart Express & OfficeWorld',
    amount: 4200,
    date: '06-Sep-2026',
    paymentMode: 'UPI',
    paidBy: 'Karan Mehra (HR)',
    status: 'Pending Verification',
    description: 'Client welcome kits and agreement dossier courier dispatch'
  }
];

const INITIAL_HEADS: ExpenseHead[] = [
  {
    id: 'head-1',
    headName: 'Cloud Server & PBX Telecom',
    monthlyBudget: 50000,
    spentThisMonth: 38500,
    department: 'IT & Infrastructure'
  },
  {
    id: 'head-2',
    headName: 'Market Real-time Feeds (NSE/MCX)',
    monthlyBudget: 60000,
    spentThisMonth: 45000,
    department: 'Equity Research'
  },
  {
    id: 'head-3',
    headName: 'Office Rent & Electricity',
    monthlyBudget: 150000,
    spentThisMonth: 145000,
    department: 'Operations & Facilities'
  },
  {
    id: 'head-4',
    headName: 'Pantry & Staff Refreshment',
    monthlyBudget: 20000,
    spentThisMonth: 12400,
    department: 'HR & People Ops'
  },
  {
    id: 'head-5',
    headName: 'Stationery & Courier Dispatch',
    monthlyBudget: 10000,
    spentThisMonth: 4200,
    department: 'Admin & Compliance'
  }
];

export const HRExpensesView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  const [currentTab, setCurrentTab] = useState<'vouchers' | 'heads'>('vouchers');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [heads, setHeads] = useState<ExpenseHead[]>(INITIAL_HEADS);
  
  // Modals for actions
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddHeadModal, setShowAddHeadModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHead, setSelectedHead] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Add Expense Form
  const [newExpense, setNewExpense] = useState({
    expenseHead: 'Pantry & Staff Refreshment',
    vendorName: '',
    amount: 1500,
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Corporate Card' as ExpenseItem['paymentMode'],
    paidBy: 'Priya Sharma (HR)',
    description: ''
  });

  // Add Expense Head Form
  const [newHead, setNewHead] = useState({
    headName: '',
    monthlyBudget: 25000,
    department: 'HR & People Ops'
  });

  useEffect(() => {
    if (activeTab === 'expenses-add-head') {
      setCurrentTab('heads');
      setShowAddHeadModal(true);
    } else if (activeTab === 'expenses-add' || activeTab === 'add-expenses') {
      setCurrentTab('vouchers');
      setShowAddExpenseModal(true);
    } else if (activeTab === 'expenses-head-list') {
      setCurrentTab('heads');
    } else {
      setCurrentTab('vouchers');
    }
  }, [activeTab]);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.vendorName.trim()) return;

    const voucher = `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const added: ExpenseItem = {
      id: `exp-${Date.now()}`,
      voucherNumber: voucher,
      expenseHead: newExpense.expenseHead,
      vendorName: newExpense.vendorName,
      amount: Number(newExpense.amount),
      date: newExpense.date,
      paymentMode: newExpense.paymentMode,
      paidBy: newExpense.paidBy,
      status: 'Approved',
      description: newExpense.description || 'Office expense voucher'
    };

    setExpenses(prev => [added, ...prev]);
    // Also update spentThisMonth for the head
    setHeads(prev => prev.map(h => h.headName === newExpense.expenseHead ? {
      ...h,
      spentThisMonth: h.spentThisMonth + Number(newExpense.amount)
    } : h));

    showToast(`Expense voucher ${voucher} recorded for ₹${Number(newExpense.amount).toLocaleString('en-IN')}`, 'success');
    setShowAddExpenseModal(false);
    setNewExpense({
      expenseHead: 'Pantry & Staff Refreshment',
      vendorName: '',
      amount: 1500,
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'Corporate Card',
      paidBy: 'Priya Sharma (HR)',
      description: ''
    });
  };

  const handleAddHeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHead.headName.trim()) return;

    const added: ExpenseHead = {
      id: `head-${Date.now()}`,
      headName: newHead.headName,
      monthlyBudget: Number(newHead.monthlyBudget),
      spentThisMonth: 0,
      department: newHead.department
    };

    setHeads(prev => [added, ...prev]);
    showToast(`Expense Head "${newHead.headName}" created with budget ₹${Number(newHead.monthlyBudget).toLocaleString('en-IN')}`, 'success');
    setShowAddHeadModal(false);
    setNewHead({
      headName: '',
      monthlyBudget: 25000,
      department: 'HR & People Ops'
    });
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = heads.reduce((sum, h) => sum + h.monthlyBudget, 0);
  const approvedCount = expenses.filter(e => e.status === 'Approved').length;
  const pendingCount = expenses.filter(e => e.status === 'Pending Verification').length;

  const filteredExpenses = expenses.filter(exp => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      exp.vendorName.toLowerCase().includes(q) ||
      exp.voucherNumber.toLowerCase().includes(q) ||
      exp.expenseHead.toLowerCase().includes(q) ||
      exp.paidBy.toLowerCase().includes(q);

    const matchesHead = selectedHead === 'all' || exp.expenseHead === selectedHead;
    const matchesMode = selectedMode === 'all' || exp.paymentMode === selectedMode;
    const matchesStatus = selectedStatus === 'all' || exp.status === selectedStatus;

    return matchesSearch && matchesHead && matchesMode && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedHead('all');
    setSelectedMode('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedHead !== 'all' || selectedMode !== 'all' || selectedStatus !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Administration</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'vouchers' ? 'Expenses' : 'Expense Heads'}
          </span>
        </div>
      </div>

      {/* Standard Page Header & Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-ref" style={{ margin: 0 }}>Expenses</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track vendor payments, departmental expense budgets, and verification status.
          </p>
        </div>

        {/* Separated Action Commands */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="btn btn-secondary action-btn-interactive"
            onClick={() => setShowAddHeadModal(true)}
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
            <Tag size={15} style={{ color: 'var(--stocketics-blue-500)' }} />
            <span>Add Expense Head</span>
          </button>

          <button 
            type="button"
            className="btn btn-primary action-btn-interactive"
            onClick={() => setShowAddExpenseModal(true)}
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
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip (Separating monetary total out of tab badge) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--stocketics-blue-500)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Expenditure
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Across {expenses.length} recorded vouchers
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Budget Limit
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            ₹{totalBudget.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {heads.length} Department Budget Heads
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Approved Vouchers
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Reconciled & Approved
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Pending Verification
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> Awaiting audit signoff
          </div>
        </div>
      </div>

      {/* Navigation View Tabs (Pure navigation, clean record counts) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'vouchers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('vouchers'); setActiveTab('expenses-list'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Receipt size={14} /> 
          <span>Expense Vouchers</span>
          <span style={{ 
            background: currentTab === 'vouchers' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {expenses.length}
          </span>
        </button>

        <button 
          className={`btn btn-sm ${currentTab === 'heads' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('heads'); setActiveTab('expenses-head-list'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Building size={14} /> 
          <span>Budget Heads</span>
          <span style={{ 
            background: currentTab === 'heads' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {heads.length}
          </span>
        </button>
      </div>

      {/* TAB 1: EXPENSE VOUCHERS LIST */}
      {currentTab === 'vouchers' && (
        <>
          {/* Shared Filter Bar */}
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Search vendor, voucher, head, or personnel..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.84rem' }}
                  />
                </div>

                <select 
                  className="form-select"
                  value={selectedHead}
                  onChange={e => setSelectedHead(e.target.value)}
                  style={{ height: '36px', fontSize: '0.82rem', width: 'auto', minWidth: '160px' }}
                >
                  <option value="all">All Expense Heads</option>
                  {heads.map(h => (
                    <option key={h.id} value={h.headName}>{h.headName}</option>
                  ))}
                </select>

                <select 
                  className="form-select"
                  value={selectedMode}
                  onChange={e => setSelectedMode(e.target.value)}
                  style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value="all">All Channels</option>
                  <option value="Company Account">Company Account</option>
                  <option value="Corporate Card">Corporate Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                </select>

                <select 
                  className="form-select"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Verification">Pending Verification</option>
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
                Showing <strong>{filteredExpenses.length}</strong> of {expenses.length} vouchers
              </div>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Voucher & Vendor</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Expense Head</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payment Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Channel & Paid By</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No expense vouchers matching the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{exp.vendorName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--stocketics-blue-500)', fontFamily: 'monospace' }}>
                            {exp.voucherNumber}
                          </div>
                          {exp.description && (
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {exp.description}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className="delta-badge" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#0284c7', fontSize: '0.74rem' }}>
                            {exp.expenseHead}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {exp.date}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 600 }}>{exp.paymentMode}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paid By: {exp.paidBy}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <span className={`delta-badge ${exp.status === 'Approved' ? 'positive' : ''}`} style={{ 
                            fontSize: '0.72rem',
                            background: exp.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: exp.status === 'Approved' ? '#10b981' : '#f59e0b'
                          }}>
                            {exp.status}
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

      {/* TAB 2: BUDGET HEADS LIST */}
      {currentTab === 'heads' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Expense Head Title</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Department Desk</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Monthly Budget</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Spent This Month</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Budget Utilization</th>
                </tr>
              </thead>
              <tbody>
                {heads.map(h => {
                  const util = Math.round((h.spentThisMonth / h.monthlyBudget) * 100);
                  return (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Tag size={15} style={{ color: 'var(--stocketics-blue-500)' }} />
                          <span>{h.headName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {h.department}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                        ₹{h.monthlyBudget.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
                        ₹{h.spentThisMonth.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <span className="delta-badge" style={{ 
                          background: util > 90 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          color: util > 90 ? '#ef4444' : '#047857',
                          fontWeight: 700
                        }}>
                          {util}% Utilized
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD EXPENSE */}
      {showAddExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowAddExpenseModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Record Expense Voucher</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter bill details for accounts audit</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAddExpenseModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expense Head *</label>
                <select 
                  className="form-select"
                  value={newExpense.expenseHead}
                  onChange={e => setNewExpense({ ...newExpense, expenseHead: e.target.value })}
                >
                  {heads.map(h => (
                    <option key={h.id} value={h.headName}>{h.headName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Vendor / Payee Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Tata Tele / Cafe Coffee Day"
                    value={newExpense.vendorName}
                    onChange={e => setNewExpense({ ...newExpense, vendorName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={newExpense.amount || ''}
                    onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select 
                    className="form-select"
                    value={newExpense.paymentMode}
                    onChange={e => setNewExpense({ ...newExpense, paymentMode: e.target.value as any })}
                  >
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Company Account">Company Account</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expense Date</label>
                  <input 
                    type="date"
                    value={newExpense.date}
                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Paid / Authorized By</label>
                <input 
                  type="text"
                  value={newExpense.paidBy}
                  onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Remarks</label>
                <textarea 
                  rows={2}
                  className="form-textarea"
                  placeholder="Invoice particulars, department purpose..."
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddExpenseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Generate Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD EXPENSE HEAD */}
      {showAddHeadModal && (
        <div className="modal-overlay" onClick={() => setShowAddHeadModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Create Budget Expense Head</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Define departmental expenditure ceiling</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAddHeadModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expense Head Title *</label>
                <input 
                  className="form-input" 
                  required
                  placeholder="e.g. Legal, Audit & Regulatory Filing"
                  value={newHead.headName}
                  onChange={e => setNewHead({ ...newHead, headName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Monthly Budget Limit (₹) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={newHead.monthlyBudget}
                    onChange={e => setNewHead({ ...newHead, monthlyBudget: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department Desk</label>
                  <select 
                    className="form-select"
                    value={newHead.department}
                    onChange={e => setNewHead({ ...newHead, department: e.target.value })}
                  >
                    <option value="HR & People Ops">HR & People Ops</option>
                    <option value="IT & Infrastructure">IT & Infrastructure</option>
                    <option value="Equity Research">Equity Research</option>
                    <option value="Operations & Facilities">Operations & Facilities</option>
                    <option value="Admin & Compliance">Admin & Compliance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddHeadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
