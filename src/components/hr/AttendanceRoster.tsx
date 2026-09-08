import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { Clock, Wifi, ShieldAlert, CheckCircle, Search, Filter } from 'lucide-react';

export const AttendanceRoster: React.FC = () => {
  const { attendanceRecords, employees } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = attendanceRecords.filter(r => {
    const matchesSearch = r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || r.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
  const leaveCount = attendanceRecords.filter(r => r.status === 'On Leave').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Stats */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Real-Time Attendance & Biometric Roster
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Live IP-geofenced punches, shift coverage and late-arrival monitor for Apex Edge HQ.
        </p>
      </div>

      {/* Summary Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL MONITORED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>{employees.length} Staff</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>PRESENT ON SHIFT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>{presentCount} Online</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)' }}>LATE PUNCHES (&gt; 09:30 AM)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.2rem' }}>{lateCount} Flagged</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dept-sales)' }}>APPROVED PTO TODAY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dept-sales)', marginTop: '0.2rem' }}>{leaveCount} Personnel</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="table-search-input">
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search staff or department..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select 
              className="form-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{ fontSize: '0.84rem', padding: '0.45rem 0.85rem' }}
            >
              <option value="All">All Attendance Types</option>
              <option value="Present">Present</option>
              <option value="Late">Late Arrival</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            <span>HQ Office IP: 106.51.67.248 (Verified)</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Department</th>
                <th>Punch-In Timestamp</th>
                <th>Total Elapsed</th>
                <th>Status</th>
                <th>Network IP & Location</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(rec => (
                <tr key={rec.id}>
                  <td>
                    <div className="user-cell">
                      <img src={rec.avatar} alt={rec.employeeName} />
                      <div className="user-cell-name">{rec.employeeName}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{rec.department}</span>
                  </td>
                  <td className="mono-cell" style={{ fontSize: '0.85rem' }}>
                    {rec.punchIn}
                  </td>
                  <td className="mono-cell">
                    {rec.totalHours > 0 ? `${rec.totalHours} hrs` : '--'}
                  </td>
                  <td>
                    <span className={`badge ${rec.status === 'Present' ? 'badge-active' : rec.status === 'Late' ? 'badge-danger' : 'badge-leave'}`}>
                      <span className="badge-dot" />
                      {rec.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Wifi size={13} style={{ color: 'var(--apex-blue-500)' }} />
                      <span className="mono-cell">{rec.ipAddress}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{rec.location}</span>
                  </td>
                  <td>
                    {rec.ipAddress === '106.51.67.248' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: 'var(--success)', fontWeight: 600 }}>
                        <CheckCircle size={13} /> Trusted Office
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: 'var(--info)', fontWeight: 600 }}>
                        <Wifi size={13} /> Remote Gateway
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
