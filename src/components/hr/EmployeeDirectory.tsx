import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { Employee, Department, EmployeeStatus } from '../../types';
import { Search, Plus, Download, X, UserCheck, Shield } from 'lucide-react';

export const EmployeeDirectory: React.FC = () => {
  const { employees, addEmployee } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Employee Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Equity Research' as Department,
    title: '',
    salary: 80000,
    status: 'Active' as EmployeeStatus,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    leaveBalance: { paid: 14, sick: 6, comp: 2 },
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleSubmitNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    addEmployee(formData);
    setIsDrawerOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: 'Equity Research',
      title: '',
      salary: 80000,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      leaveBalance: { paid: 14, sick: 6, comp: 2 },
    });
  };

  const getDeptClass = (dept: Department) => {
    switch (dept) {
      case 'HR': return 'dept-hr';
      case 'IT': return 'dept-it';
      case 'Equity Research': return 'dept-research';
      case 'Advisory Sales': return 'dept-sales';
      case 'Finance': return 'dept-finance';
      case 'Operations': return 'dept-ops';
      default: return 'dept-research';
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Department', 'Title', 'Status', 'Join Date', 'Salary'];
    const rows = filteredEmployees.map(e => [
      e.id,
      `"${e.name}"`,
      e.email,
      `"${e.department}"`,
      `"${e.title}"`,
      e.status,
      e.joinDate,
      e.salary
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_employees_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Employee Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Workforce roster, profile management & asset verification for Apex Edge Research.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={exportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus size={16} />
            <span>Onboard New Employee</span>
          </button>
        </div>
      </div>

      {/* Table Container with Filters */}
      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="table-search-input">
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Filter by name, email or designation..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select 
              className="form-select" 
              style={{ fontSize: '0.84rem', padding: '0.45rem 0.85rem' }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="HR">HR</option>
              <option value="IT">IT & Architecture</option>
              <option value="Equity Research">Equity Research</option>
              <option value="Advisory Sales">Advisory Sales</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>

            <select 
              className="form-select" 
              style={{ fontSize: '0.84rem', padding: '0.45rem 0.85rem' }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Remote">Remote</option>
              <option value="Probation">Probation</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {filteredEmployees.length} of {employees.length} personnel
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Work Status</th>
                <th>Join Date</th>
                <th>Leave Quota (P/S/C)</th>
                <th>Monthly Gross</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="user-cell">
                      <img src={emp.avatar} alt={emp.name} />
                      <div>
                        <div className="user-cell-name">{emp.name}</div>
                        <div className="user-cell-sub">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`dept-pill ${getDeptClass(emp.department)}`}>
                      {emp.department}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{emp.title}</td>
                  <td>
                    <span className={`badge ${emp.status === 'Active' ? 'badge-active' : emp.status === 'On Leave' ? 'badge-leave' : 'badge-remote'}`}>
                      <span className="badge-dot" />
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{emp.joinDate}</td>
                  <td>
                    <span className="mono-cell" style={{ fontSize: '0.82rem' }}>
                      {emp.leaveBalance.paid}P / {emp.leaveBalance.sick}S / {emp.leaveBalance.comp}C
                    </span>
                  </td>
                  <td className="mono-cell">₹{emp.salary.toLocaleString('en-IN')}</td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`Employee Details: ${emp.name}\nDepartment: ${emp.department}\nPhone: ${emp.phone}\nManager ID: ${emp.managerId || 'None'}`)}
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserCheck size={20} style={{ color: 'var(--apex-blue-500)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>New Employee Onboarding</h3>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewEmployee} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="drawer-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="e.g. Vikram Singhania"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Corporate Email *</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required 
                    placeholder="e.g. vikram.s@apexedge.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select 
                      className="form-select"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                    >
                      <option value="Equity Research">Equity Research</option>
                      <option value="Advisory Sales">Advisory Sales</option>
                      <option value="IT">IT & Infrastructure</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select 
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    >
                      <option value="Active">Active (In-Office)</option>
                      <option value="Remote">Remote</option>
                      <option value="Probation">Probationary</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Designation / Role Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Senior Derivative Analyst"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Gross Salary (INR)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
