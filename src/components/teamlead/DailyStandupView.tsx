import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { Home, ClipboardList, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react';

export const DailyStandupView: React.FC = () => {
  const { setActiveTab, currentUser, employees, dailyStandups, getTeamMemberIds, showToast } = useApp();
  const teamMemberIds = getTeamMemberIds(currentUser.id);
  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const dateStandups = dailyStandups.filter(s => s.date === selectedDate);
  const submitted = dateStandups.map(s => s.employeeId);
  const missingMembers = teamEmployees.filter(e => !submitted.includes(e.id));

  const moodEmojis: Record<string, string> = { 'Great': '😄', 'Good': '🙂', 'Okay': '😐', 'Struggling': '😟' };
  const moodColors: Record<string, string> = { 'Great': '#10b981', 'Good': '#3b82f6', 'Okay': '#f59e0b', 'Struggling': '#ef4444' };

  const navigateDate = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Dashboard</span>
          </span>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Daily Standup</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title-ref" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={24} style={{ color: '#8b5cf6' }} /> Daily Standup
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateDate(-1)}><ChevronLeft size={14} /></button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', minWidth: '220px', textAlign: 'center' }}>
            {formatDate(selectedDate)}
            {selectedDate === today && <span style={{ marginLeft: '0.4rem', fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Today</span>}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateDate(1)} disabled={selectedDate >= today}><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Submission Status */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem' }}>
          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          <span style={{ fontWeight: 700, color: '#10b981' }}>{dateStandups.length} Submitted</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem' }}>
          <Clock size={16} style={{ color: '#f59e0b' }} />
          <span style={{ fontWeight: 700, color: '#f59e0b' }}>{missingMembers.length} Pending</span>
        </div>
        {missingMembers.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem' }}>
            {missingMembers.map(emp => (
              <div key={emp.id} title={`${emp.name} - Pending`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <img src={emp.avatar} alt={emp.name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#d97706' }}>{emp.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Standup Cards */}
      {dateStandups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <ClipboardList size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>No standups submitted for {formatDate(selectedDate)}</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Team members will submit their daily updates here.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {dateStandups.map(standup => (
            <div key={standup.id} className="card" style={{ padding: '1.1rem', position: 'relative', overflow: 'hidden' }}>
              {/* Mood accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: moodColors[standup.mood] || '#94a3b8' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {(() => { const emp = teamEmployees.find(e => e.id === standup.employeeId); return emp ? <img src={emp.avatar} alt={emp.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : null; })()}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{standup.employeeName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Submitted at {standup.submittedAt}</div>
                  </div>
                </div>
                <div title={`Mood: ${standup.mood}`} style={{
                  fontSize: '1.5rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: `${moodColors[standup.mood]}15`,
                }}>
                  {moodEmojis[standup.mood] || '😐'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.2rem' }}>✅ Yesterday</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{standup.yesterday}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.2rem' }}>📌 Today's Plan</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{standup.today}</div>
                </div>
                {standup.blockers && (
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertTriangle size={12} /> Blockers
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#dc2626', lineHeight: 1.5 }}>{standup.blockers}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
