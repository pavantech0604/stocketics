import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../state/store';
import { Search, User, Briefcase, Calendar, Clock, ArrowRight, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    employees, 
    advisoryLeads, 
    setActiveTab, 
    setRole, 
    handlePunchToggle, 
    isClockedIn 
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredEmployees = query 
    ? employees.filter(e => 
        e.name.toLowerCase().includes(query.toLowerCase()) || 
        e.department.toLowerCase().includes(query.toLowerCase()) ||
        e.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredLeads = query
    ? advisoryLeads.filter(l => 
        l.clientName.toLowerCase().includes(query.toLowerCase()) ||
        l.serviceType.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleSelectAction = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
  };

  return (
    <div className="drawer-backdrop" onClick={() => setCommandPaletteOpen(false)}>
      <div 
        style={{
          width: '100%',
          maxWidth: '580px',
          margin: '10vh auto auto',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.15s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', gap: '0.75rem' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Type a command or search employees, leads, routes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ padding: '0.75rem', maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Quick Actions */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>
              Quick System Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                className="nav-item"
                style={{ borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                onClick={() => handleSelectAction(handlePunchToggle)}
              >
                <Clock size={16} style={{ color: 'var(--apex-blue-500)' }} />
                <span>{isClockedIn ? 'Punch Out of Shift' : 'Punch In to Shift'}</span>
              </button>
              <button
                className="nav-item"
                style={{ borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                onClick={() => handleSelectAction(() => { setRole('hr'); setActiveTab('dashboard'); })}
              >
                <User size={16} style={{ color: 'var(--dept-hr)' }} />
                <span>Switch to HR Dashboard</span>
              </button>
              <button
                className="nav-item"
                style={{ borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                onClick={() => handleSelectAction(() => { setRole('manager'); setActiveTab('dashboard'); })}
              >
                <Briefcase size={16} style={{ color: 'var(--dept-sales)' }} />
                <span>Switch to Manager Dashboard</span>
              </button>
              <button
                className="nav-item"
                style={{ borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                onClick={() => handleSelectAction(() => { setRole('employee'); setActiveTab('dashboard'); })}
              >
                <Calendar size={16} style={{ color: 'var(--dept-research)' }} />
                <span>Switch to Employee Dashboard</span>
              </button>
            </div>
          </div>

          {/* Matched Employees */}
          {filteredEmployees.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>
                Employees
              </div>
              {filteredEmployees.map(emp => (
                <div 
                  key={emp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  className="nav-item"
                  onClick={() => handleSelectAction(() => { setRole('hr'); setActiveTab('employees'); })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img src={emp.avatar} alt={emp.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.title} • {emp.department}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Matched Leads */}
          {filteredLeads.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>
                Advisory Leads
              </div>
              {filteredLeads.map(lead => (
                <div 
                  key={lead.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                  className="nav-item"
                  onClick={() => handleSelectAction(() => { setRole('manager'); setActiveTab('advisory'); })}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{lead.clientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lead.serviceType} • {lead.investmentBracket}</div>
                  </div>
                  <span className="badge badge-active">{lead.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-surface-alt)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Navigate with arrows</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
