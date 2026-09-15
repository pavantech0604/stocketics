import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { Home, Star, MessageSquare, Target, Users, Search, Filter, Plus, X } from 'lucide-react';
import { CoachingNoteType } from '../../types';

export const CoachingHubView: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, employees, coachingNotes, addCoachingNote, getTeamMemberIds } = useApp();
  const teamMemberIds = getTeamMemberIds(currentUser.id);
  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));

  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(activeTab === 'coaching-add');
  const [formEmployee, setFormEmployee] = useState('');
  const [formType, setFormType] = useState<CoachingNoteType>('Praise');
  const [formText, setFormText] = useState('');
  const [formPrivate, setFormPrivate] = useState(false);

  const teamNotes = coachingNotes.filter(n => teamMemberIds.includes(n.employeeId));
  const filtered = teamNotes.filter(n => {
    if (filterEmployee !== 'all' && n.employeeId !== filterEmployee) return false;
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  const noteTypes: CoachingNoteType[] = ['Praise', 'Improvement', 'Goal', '1:1 Meeting', 'Observation'];
  const typeColors: Record<CoachingNoteType, { bg: string; color: string }> = {
    'Praise': { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    'Improvement': { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
    'Goal': { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
    '1:1 Meeting': { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
    'Observation': { bg: 'rgba(100,116,139,0.12)', color: '#475569' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployee || !formText.trim()) return;
    const emp = teamEmployees.find(e => e.id === formEmployee);
    addCoachingNote({
      teamLeaderId: currentUser.id,
      employeeId: formEmployee,
      employeeName: emp?.name || '',
      type: formType,
      text: formText.trim(),
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      isPrivate: formPrivate,
    });
    setFormText('');
    setFormEmployee('');
    setIsAddOpen(false);
  };

  // Employee coaching summary cards
  const empSummaries = teamEmployees.map(emp => {
    const empNotes = teamNotes.filter(n => n.employeeId === emp.id);
    const praiseCount = empNotes.filter(n => n.type === 'Praise').length;
    const improvementCount = empNotes.filter(n => n.type === 'Improvement').length;
    const lastNote = empNotes[0];
    const trend = praiseCount > improvementCount ? 'up' : praiseCount === improvementCount ? 'stable' : 'down';
    return { ...emp, totalNotes: empNotes.length, praiseCount, improvementCount, lastNote, trend };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Dashboard</span>
          </span>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Coaching Hub</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Plus size={14} /> Add Note
        </button>
      </div>

      <h1 className="page-title-ref" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={24} style={{ color: '#8b5cf6' }} /> Coaching Hub
      </h1>

      {/* Employee Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {empSummaries.map(emp => (
          <div key={emp.id} className="card" style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', border: filterEmployee === emp.id ? '2px solid #8b5cf6' : '1px solid var(--border-subtle)' }} onClick={() => setFilterEmployee(filterEmployee === emp.id ? 'all' : emp.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <img src={emp.avatar} alt={emp.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{emp.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.totalNotes} notes</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '1.1rem' }}>
                {emp.trend === 'up' ? '📈' : emp.trend === 'down' ? '📉' : '➡️'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem' }}>
              <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(16,185,129,0.12)', color: '#059669', fontWeight: 600 }}>✅ {emp.praiseCount}</span>
              <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239,68,68,0.12)', color: '#dc2626', fontWeight: 600 }}>⚠️ {emp.improvementCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
          <option value="all">All Types</option>
          {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {filterEmployee !== 'all' && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilterEmployee('all')} style={{ fontSize: '0.76rem' }}>
            <X size={12} /> Clear Employee Filter
          </button>
        )}
      </div>

      {/* Notes Timeline */}
      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No coaching notes found. Click "Add Note" to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filtered.map((note, idx) => (
              <div key={note.id} style={{
                padding: '0.85rem 1rem', borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                borderLeft: `3px solid ${typeColors[note.type].color}`,
                marginLeft: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px',
                    background: typeColors[note.type].bg, color: typeColors[note.type].color,
                  }}>{note.type}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{note.employeeName}</span>
                  {note.isPrivate && <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>🔒 Private</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{note.timestamp}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{note.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {isAddOpen && (
        <div className="tips-modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="tips-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <div className="tips-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={18} style={{ color: '#8b5cf6' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Add Coaching Note</h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsAddOpen(false)}><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Employee *</label>
                <select value={formEmployee} onChange={e => setFormEmployee(e.target.value)} required style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                  <option value="">Select Employee</option>
                  {teamEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Note Type *</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {noteTypes.map(t => (
                    <button key={t} type="button" onClick={() => setFormType(t)} className={`btn btn-sm ${formType === t ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.76rem' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Note *</label>
                <textarea value={formText} onChange={e => setFormText(e.target.value)} required rows={4} placeholder="Write your coaching note..." style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.86rem', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={formPrivate} onChange={e => setFormPrivate(e.target.checked)} style={{ accentColor: '#8b5cf6' }} />
                🔒 Private (only visible to you)
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
