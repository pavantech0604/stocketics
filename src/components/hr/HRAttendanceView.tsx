import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Clock, 
  UploadCloud, 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Shield,
  MapPin
} from 'lucide-react';

interface PunchRecord {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  punchIn: string;
  punchOut: string;
  totalHours: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
  ipAddress: string;
  terminal: string;
}

const INITIAL_ATTENDANCE: PunchRecord[] = [
  {
    id: 'att-1',
    employeeName: 'Rajesh Varma',
    department: 'Equity Research Desk',
    date: '07-Sep-2026',
    punchIn: '08:55 AM',
    punchOut: '06:15 PM',
    totalHours: 9.3,
    status: 'Present',
    ipAddress: '106.51.67.248',
    terminal: 'Bangalore HQ Optical Bio-01'
  },
  {
    id: 'att-2',
    employeeName: 'Rohan Deshmukh',
    department: 'Advisory Sales Desk A',
    date: '07-Sep-2026',
    punchIn: '09:04 AM',
    punchOut: '06:00 PM',
    totalHours: 8.9,
    status: 'Present',
    ipAddress: '106.51.67.248',
    terminal: 'Bangalore HQ Optical Bio-01'
  },
  {
    id: 'att-3',
    employeeName: 'Sneha Kapur',
    department: 'Derivatives Options Desk',
    date: '07-Sep-2026',
    punchIn: '09:48 AM',
    punchOut: '06:30 PM',
    totalHours: 8.7,
    status: 'Late',
    ipAddress: '106.51.67.248',
    terminal: 'Bangalore HQ Optical Bio-02'
  },
  {
    id: 'att-4',
    employeeName: 'Aditya Roy',
    department: 'Equity Research Desk',
    date: '07-Sep-2026',
    punchIn: '09:12 AM',
    punchOut: '06:10 PM',
    totalHours: 8.9,
    status: 'Present',
    ipAddress: '106.51.67.248',
    terminal: 'Bangalore HQ Optical Bio-01'
  },
  {
    id: 'att-5',
    employeeName: 'Ananya Sen',
    department: 'Advisory Sales Desk B',
    date: '07-Sep-2026',
    punchIn: '--',
    punchOut: '--',
    totalHours: 0,
    status: 'Absent',
    ipAddress: '--',
    terminal: 'Approved Leave (PTO)'
  }
];

export const HRAttendanceView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  // Subtabs: 'upload' or 'list'
  const getSubTab = (): 'upload' | 'list' => {
    if (activeTab === 'attendance-upload' || activeTab === 'upload-attendance') return 'upload';
    return 'list';
  };

  const [currentTab, setCurrentTab] = useState<'upload' | 'list'>(getSubTab());
  const [attendance, setAttendance] = useState<PunchRecord[]>(INITIAL_ATTENDANCE);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: 'upload' | 'list', tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      showToast('Successfully synced 148 employee punches from Biometric Terminal IP: 106.51.67.248!', 'success');
      handleTabChange('list', 'attendance-list');
    }, 1200);
  };

  const filtered = attendance.filter(a => 
    a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Attendance</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'upload' ? 'Upload Attendance' : 'Attendance list'}
          </span>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Biometric Punch & Attendance Governance
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Biometric optical machine sync, IP address logging (106.51.67.248), late marks, and daily working hours.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-primary"
            onClick={() => handleTabChange('upload', 'attendance-upload')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UploadCloud size={16} /> Upload Attendance
          </button>
        </div>
      </div>

      {/* Sub-Options Nav Tabs: Exact Names Upload Attendance, Attendance list */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('upload', 'attendance-upload')}
        >
          <UploadCloud size={14} /> Upload Attendance
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('list', 'attendance-list')}
        >
          <Clock size={14} /> Attendance list ({attendance.length} Staff Today)
        </button>
      </div>

      {/* TAB 1: UPLOAD ATTENDANCE */}
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
                disabled={isUploading}
                onClick={handleSimulateUpload}
              >
                {isUploading ? 'Syncing Biometric Logs...' : 'Select File & Sync Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LIST */}
      {currentTab === 'list' && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '380px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search staff name, desk, status..."
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
                  <th style={{ padding: '0.85rem 1.25rem' }}>Employee Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Punch In</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Punch Out</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Hours</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Verified Network IP</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Terminal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.employeeName}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.department}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {item.punchIn}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {item.punchOut}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: item.totalHours >= 8 ? 'var(--success)' : 'var(--warning)' }}>
                      {item.totalHours} hrs
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`delta-badge ${item.status === 'Present' ? 'positive' : item.status === 'Late' ? '' : 'negative'}`} style={{
                        background: item.status === 'Late' ? '#fef3c7' : undefined,
                        color: item.status === 'Late' ? '#b45309' : undefined,
                        fontSize: '0.72rem'
                      }}>
                        {item.status}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.ipAddress}
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.terminal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
