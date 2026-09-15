import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { ExtendedAttendanceRecord, AttendanceSource } from '../../types';
import { 
  Clock, 
  UploadCloud, 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Shield,
  MapPin,
  Fingerprint,
  RotateCw,
  Filter,
  Download,
  Award,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HRAttendanceView: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    extendedAttendance,
    syncBiometricAttendance,
    importAttendanceRecords,
    leaveBalances,
    showToast 
  } = useApp();

  const getSubTab = (): 'upload' | 'list' | 'balances' => {
    if (activeTab === 'attendance-upload' || activeTab === 'upload-attendance') return 'upload';
    if (activeTab === 'leave-balances') return 'balances';
    return 'list';
  };

  const [currentTab, setCurrentTab] = useState<'upload' | 'list' | 'balances'>(getSubTab());
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: 'upload' | 'list' | 'balances', tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleBiometricSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncBiometricAttendance();
      setIsSyncing(false);
    }, 700);
  };

  const handleSimulateUpload = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const newRec: ExtendedAttendanceRecord = {
        id: `att-import-${Date.now()}`,
        employeeId: 'emp-bulk',
        employeeName: 'Bulk Import Staff (Zone 2)',
        department: 'Advisory Sales Desk B',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        punchIn: '09:02 AM',
        punchOut: '06:05 PM',
        totalHours: 9.05,
        status: 'Present',
        source: 'Import',
        terminal: 'ZKTeco BioStation Export .CSV'
      };
      importAttendanceRecords([newRec]);
      handleTabChange('list', 'attendance-list');
    }, 1000);
  };

  const filteredAttendance = extendedAttendance.filter(a => {
    const matchesSearch = 
      a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.leaveType && a.leaveType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSource = sourceFilter === 'all' || a.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

    return matchesSearch && matchesSource && matchesStatus;
  });

  const getSourceBadge = (source: AttendanceSource) => {
    switch (source) {
      case 'Biometric':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 7px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>
            <Fingerprint size={12} /> Biometric
          </span>
        );
      case 'Import':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2px 7px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>
            <FileSpreadsheet size={12} /> CSV Import
          </span>
        );
      case 'Manual':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 7px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>
            <Layers size={12} /> Manual
          </span>
        );
    }
  };

  const getStatusBadge = (item: ExtendedAttendanceRecord) => {
    if (item.status === 'Leave') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(234, 179, 8, 0.18)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.35)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800 }}>
          <Calendar size={12} /> Leave ({item.leaveType || 'Approved'})
        </span>
      );
    }
    switch (item.status) {
      case 'Present':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
            <CheckCircle2 size={12} /> Present
          </span>
        );
      case 'Late':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
            <Clock size={12} /> Late
          </span>
        );
      case 'Half Day':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
            Half Day
          </span>
        );
      case 'Absent':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
            <AlertTriangle size={12} /> Absent
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Attendance</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'upload' ? 'Upload Biometric Data' : currentTab === 'balances' ? 'Leave Balances' : 'Attendance List'}
          </span>
        </div>
      </div>

      {/* Header with Biometric Terminal Sync Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Fingerprint size={24} color="#38bdf8" />
            Biometric Punch & Attendance Governance
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Multi-source biometric punch logs (Bangalore HQ Optical Bio-01 / Bio-02), manual adjustments, and automated leave roster reflection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button 
            className="btn btn-outline"
            disabled={isSyncing}
            onClick={handleBiometricSync}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #38bdf8', color: '#38bdf8' }}
          >
            <RotateCw size={15} className={isSyncing ? 'spin-anim' : ''} />
            {isSyncing ? 'Syncing Terminals...' : 'Sync Biometric Devices'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleTabChange('upload', 'attendance-upload')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UploadCloud size={16} /> Import Punch CSV
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Upload Attendance, Attendance list, Leave Balances */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('list', 'attendance-list')}
        >
          <Clock size={14} /> Attendance Roster ({extendedAttendance.length} Records)
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('upload', 'attendance-upload')}
        >
          <UploadCloud size={14} /> Upload / Import
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'balances' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('balances', 'leave-balances')}
        >
          <Calendar size={14} /> Leave Balances (CL / PL / Sick)
        </button>
      </div>

      {/* TAB 1: ATTENDANCE LIST & SOURCE FILTER */}
      {currentTab === 'list' && (
        <>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 260 }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search employee, desk, leave type (CL/PL)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={15} color="#94a3b8" />
              {/* Source filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem'
                }}
              >
                <option value="all">All Sources</option>
                <option value="Biometric">Biometric Only</option>
                <option value="Manual">Manual Entry</option>
                <option value="Import">CSV Import</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">On Leave (CL/PL/Sick)</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Employee Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Punch In</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Punch Out</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Hours</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status & Leave Type</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Source Mode</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Device Terminal / Origin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.employeeName}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.department}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {item.date}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {item.punchIn}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {item.punchOut}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.totalHours ? `${item.totalHours} hrs` : '-'}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {getStatusBadge(item)}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {getSourceBadge(item.source)}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.terminal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: UPLOAD ATTENDANCE */}
      {currentTab === 'upload' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <UploadCloud size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Upload Daily Biometric Punch File (.CSV / .XLSX)</span>
              </div>
              <div className="card-subtitle">Sync logs from ZKTeco/eSSL biometric devices or import manual register</div>
            </div>
          </div>

          <div style={{ 
            border: '2px dashed var(--border-subtle)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '3rem 2rem', 
            textAlign: 'center',
            background: 'var(--bg-surface-alt)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div className="stat-icon-tile" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #0284c7, #051d33)' }}>
              <FileSpreadsheet size={28} />
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Drag and drop your Biometric Export CSV here
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports ZKTeco, BioStar, eSSL, and Excel formatted attendance rosters
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-outline"
                onClick={() => showToast('Sample biometric attendance CSV template downloaded', 'info')}
              >
                Download Sample CSV
              </button>
              <button 
                className="btn btn-primary"
                disabled={isSyncing}
                onClick={handleSimulateUpload}
              >
                {isSyncing ? 'Syncing Biometric Logs...' : 'Select File & Sync Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE BALANCES (CL / PL / SICK) */}
      {currentTab === 'balances' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {Object.entries(leaveBalances).map(([empId, bal]) => (
            <div
              key={empId}
              className="card"
              style={{ padding: 18, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Employee: {empId.toUpperCase()}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Financial Year 2026-27</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-surface-alt)', padding: 10, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Casual Leave (CL)</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                    {bal.clRemaining} / {bal.clTotal ?? 12}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{bal.clUsed ?? Math.max(0, 12 - bal.clRemaining)} Days Used</span>
                </div>

                <div style={{ background: 'var(--bg-surface-alt)', padding: 10, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Privilege (PL)</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                    {bal.plRemaining} / {bal.plTotal ?? 15}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{bal.plUsed ?? Math.max(0, 15 - bal.plRemaining)} Days Used</span>
                </div>

                <div style={{ background: 'var(--bg-surface-alt)', padding: 10, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Sick Leave (SL)</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
                    {bal.sickRemaining} / {bal.sickTotal ?? 8}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{bal.sickUsed ?? Math.max(0, 8 - bal.sickRemaining)} Days Used</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
