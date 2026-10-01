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
  Fingerprint,
  RotateCw,
  Filter,
  Layers,
  RotateCcw
} from 'lucide-react';

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
      showToast('Biometric devices synced with central server.', 'success');
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 7px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>
            <Fingerprint size={12} /> Biometric
          </span>
        );
      case 'Import':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(168, 85, 247, 0.15)', color: '#9333ea', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2px 7px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>
            <FileSpreadsheet size={12} /> CSV Import
          </span>
        );
      case 'Manual':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 7px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>
            <Layers size={12} /> Manual
          </span>
        );
    }
  };

  const getStatusBadge = (item: ExtendedAttendanceRecord) => {
    if (item.status === 'Leave') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(234, 179, 8, 0.18)', color: '#b45309', border: '1px solid rgba(234, 179, 8, 0.35)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800 }}>
          <Calendar size={12} /> Leave ({item.leaveType || 'Approved'})
        </span>
      );
    }
    switch (item.status) {
      case 'Present':
        return (
          <span className="delta-badge positive" style={{ fontSize: '0.72rem' }}>
            <CheckCircle2 size={12} /> Present
          </span>
        );
      case 'Late':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(249, 115, 22, 0.15)', color: '#ea580c', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
            <Clock size={12} /> Late
          </span>
        );
      case 'Half Day':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
            <Clock size={12} /> Half Day
          </span>
        );
      case 'Absent':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
            <AlertTriangle size={12} /> Absent
          </span>
        );
    }
  };

  const presentCount = extendedAttendance.filter(a => a.status === 'Present').length;
  const leaveCount = extendedAttendance.filter(a => a.status === 'Leave').length;
  const lateCount = extendedAttendance.filter(a => a.status === 'Late').length;

  const clearFilters = () => {
    setSearchQuery('');
    setSourceFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || sourceFilter !== 'all' || statusFilter !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb Strip */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Operations</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'upload' ? 'Upload Biometric Data' : currentTab === 'balances' ? 'Leave Balances' : 'Attendance Roster'}
          </span>
        </div>
      </div>

      {/* Standardized Header & Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-ref" style={{ margin: 0 }}>Attendance</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Biometric punch logs, manual adjustments, and attendance governance.
          </p>
        </div>

        {/* Action Commands */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            disabled={isSyncing}
            onClick={handleBiometricSync}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', height: '38px', borderRadius: '8px' }}
          >
            <RotateCw size={14} className={isSyncing ? 'spin-anim' : ''} />
            <span>{isSyncing ? 'Syncing Devices...' : 'Sync Terminals'}</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={() => handleTabChange('upload', 'attendance-upload')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', height: '38px', borderRadius: '8px' }}
          >
            <UploadCloud size={16} />
            <span>Import Punch CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--stocketics-blue-500)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Roster Logs
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {extendedAttendance.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Active biometric terminals
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Present Today
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {presentCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Logged in on time
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            On Approved Leave
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {leaveCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Casual / Sick leave roster
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Late Punches
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>
            {lateCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Beyond 09:30 AM grace period
          </div>
        </div>
      </div>

      {/* Pure Navigation View Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.4rem', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('list', 'attendance-list')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Clock size={14} /> 
          <span>Attendance Roster</span>
          <span style={{ 
            background: currentTab === 'list' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {extendedAttendance.length}
          </span>
        </button>

        <button 
          className={`btn btn-sm ${currentTab === 'balances' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('balances', 'leave-balances')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Calendar size={14} /> 
          <span>Leave Balances</span>
          <span style={{ 
            background: currentTab === 'balances' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {Object.keys(leaveBalances).length}
          </span>
        </button>

        <button 
          className={`btn btn-sm ${currentTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('upload', 'attendance-upload')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <UploadCloud size={14} /> 
          <span>Upload / Import</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE LIST & FILTER BAR */}
      {currentTab === 'list' && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Search employee, desk, leave type..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.84rem' }}
                  />
                </div>

                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="form-select"
                  style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value="all">All Sources</option>
                  <option value="Biometric">Biometric Terminals</option>
                  <option value="Import">CSV Import</option>
                  <option value="Manual">Manual</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Leave">Leave</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
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
                Showing <strong>{filteredAttendance.length}</strong> of {extendedAttendance.length} entries
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Employee & Desk</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Punch Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Punch In / Out</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Logged Hours</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Capture Source</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No attendance records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.employeeName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {item.department} • <span style={{ fontFamily: 'monospace' }}>{item.employeeId}</span>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {item.date}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                            {item.punchIn || '—'} → {item.punchOut || '—'}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: (item.totalHours || 0) >= 8.5 ? '#10b981' : (item.totalHours || 0) > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                            {item.totalHours ? `${item.totalHours} hrs` : '—'}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          {getSourceBadge(item.source)}
                        </td>

                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          {getStatusBadge(item)}
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

      {/* TAB 2: UPLOAD BIOMETRIC FILE */}
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

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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

      {/* TAB 3: LEAVE BALANCES */}
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
