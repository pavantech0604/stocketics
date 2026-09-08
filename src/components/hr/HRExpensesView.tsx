import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  DollarSign, 
  Plus, 
  FileText, 
  Search, 
  CheckCircle2, 
  Tag, 
  Receipt, 
  TrendingUp, 
  Calendar,
  Building
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

  // Subtabs: 'add-expense', 'expenses-list', 'add-head', 'heads-list'
  const getSubTab = (): 'add-expense' | 'expenses-list' | 'add-head' | 'heads-list' => {
    if (activeTab === 'expenses-add' || activeTab === 'add-expenses') return 'add-expense';
    if (activeTab === 'expenses-add-head' || activeTab === 'add-expenses-head') return 'add-head';
    if (activeTab === 'expenses-head-list') return 'heads-list';
    return 'expenses-list';
  };

  const [currentTab, setCurrentTab] = useState(getSubTab());
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [heads, setHeads] = useState<ExpenseHead[]>(INITIAL_HEADS);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Form
  const [newExpense, setNewExpense] = useState({
    expenseHead: 'Pantry & Staff Refreshment',
    vendorName: '',
    amount: 1500,
    date: '2026-09-07',
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
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: any, tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

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
    showToast(`Expense voucher ${voucher} recorded for ₹${Number(newExpense.amount).toLocaleString('en-IN')}`, 'success');
    handleTabChange('expenses-list', 'expenses-list');
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
    handleTabChange('heads-list', 'expenses-head-list');
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Expenses</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'add-expense' && 'Add Expenses'}
            {currentTab === 'expenses-list' && 'Expenses list'}
            {currentTab === 'add-head' && 'Add Expenses Head'}
            {currentTab === 'heads-list' && 'Expenses Head list'}
          </span>
        </div>
      </div>

      {/* Header & Back Button (Image 12) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title-ref" style={{ margin: 0 }}>Expenses</h1>

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

      {/* Sub-Options Nav Tabs: Exact Names Add Expenses, Expenses list, Add Expenses Head, Expenses Head list */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'add-expense' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('add-expense', 'expenses-add')}
        >
          <Plus size={14} /> Add Expenses
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'expenses-list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('expenses-list', 'expenses-list')}
        >
          <Receipt size={14} /> Expenses list (₹{totalSpent.toLocaleString('en-IN')})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'add-head' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('add-head', 'expenses-add-head')}
        >
          <Tag size={14} /> Add Expenses Head
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'heads-list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('heads-list', 'expenses-head-list')}
        >
          <Building size={14} /> Expenses Head list ({heads.length})
        </button>
      </div>

      {/* TAB 1: ADD EXPENSES FORM (Exact Match to Image 12) */}
      {currentTab === 'add-expense' && (
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '6px', 
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '0.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.75rem' }}>
            Expense
          </h2>

          <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 3rem' }}>
              {/* Left Column (Image 12) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Expense Head Title: */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    Expense Head Title:
                  </label>
                  <select 
                    value={newExpense.expenseHead}
                    onChange={e => setNewExpense({ ...newExpense, expenseHead: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Head</option>
                    {heads.map(h => (
                      <option key={h.id} value={h.headName}>{h.headName}</option>
                    ))}
                    <option value="Cloud Server & PBX Telecom">Cloud Server & PBX Telecom</option>
                    <option value="Market Real-time Feeds (NSE/MCX)">Market Real-time Feeds (NSE/MCX)</option>
                    <option value="Pantry & Staff Refreshment">Pantry & Staff Refreshment</option>
                    <option value="Office Stationery">Office Stationery</option>
                  </select>
                </div>

                {/* From: */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    From:
                  </label>
                  <input 
                    type="text"
                    placeholder="from"
                    value={newExpense.vendorName}
                    onChange={e => setNewExpense({ ...newExpense, vendorName: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Price: */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    Price:
                  </label>
                  <input 
                    type="text"
                    placeholder="Price"
                    value={newExpense.amount || ''}
                    onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Expense By: */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    Expense By:
                  </label>
                  <select 
                    value={newExpense.paidBy}
                    onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Sindhu H S (HR)">Sindhu H S (HR)</option>
                    <option value="Vinod Kumar K J (VP)">Vinod Kumar K J (VP)</option>
                    <option value="Finance Desk">Finance Desk</option>
                  </select>
                </div>
              </div>

              {/* Right Column (Image 12) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Item Name: */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    Item Name:
                  </label>
                  <input 
                    type="text"
                    placeholder="Item Name"
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Date: */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    Date:
                  </label>
                  <input 
                    type="text"
                    defaultValue="2026-09-08"
                    placeholder="Date"
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Description: */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    Description:
                  </label>
                  <input 
                    type="text"
                    placeholder="Discription"
                    value={newExpense.description}
                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '150px', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ 
                  background: '#00a8ff', 
                  borderColor: '#00a8ff', 
                  color: '#ffffff', 
                  padding: '0.55rem 2.25rem', 
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

      {/* TAB 2: EXPENSES LIST */}
      {currentTab === 'expenses-list' && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '380px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search vendor, expense head, voucher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Voucher & Vendor</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Expense Head</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Payment Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Channel & Paid By</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{exp.vendorName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--stocketics-blue-500)', fontFamily: 'monospace' }}>{exp.voucherNumber}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="delta-badge" style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.74rem' }}>
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
                      <div>{exp.paymentMode}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By: {exp.paidBy}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <span className="delta-badge positive" style={{ fontSize: '0.72rem' }}>
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 3: ADD EXPENSES HEAD */}
      {currentTab === 'add-head' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Tag size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Create New Budget Expense Head</span>
              </div>
              <div className="card-subtitle">Define departmental expenditure categories and monthly budget limits</div>
            </div>
          </div>

          <form onSubmit={handleAddHeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Expense Head Title *</label>
              <input 
                className="form-input" 
                required
                placeholder="e.g. Legal, Audit & SEBI Filing Fees"
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
                <label className="form-label">Department Responsibility</label>
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
              <button type="submit" className="btn btn-primary">Create Expense Head</button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: EXPENSES HEAD LIST */}
      {currentTab === 'heads-list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
      )}
    </div>
  );
};
