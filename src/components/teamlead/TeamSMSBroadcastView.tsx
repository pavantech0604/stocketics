import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { Home, Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Users, X, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BroadcastRecord {
  id: string;
  message: string;
  recipients: string[];
  recipientNames: string[];
  sentAt: string;
  status: 'Sent' | 'Pending';
  type: 'Custom' | 'Template';
}

const SMS_TEMPLATES = [
  { id: 't1', name: '🌅 Morning Motivation', text: 'Good morning team! Let\'s make today count. Remember: every call is an opportunity. Target: 20 outbound calls before lunch! 💪 - Team Lead' },
  { id: 't2', name: '🎯 Target Reminder', text: 'Quick reminder: We\'re at [X]% of our monthly target. [Y] more conversions needed. Focus on warm leads first. You\'ve got this! 🔥' },
  { id: 't3', name: '📅 Meeting Alert', text: 'Team huddle at [TIME] today. Please have your pipeline updates ready. Key agenda: weekly performance review & lead redistribution.' },
  { id: 't4', name: '🏆 Performance Update', text: 'Weekly stats: Team converted [X] leads this week, generating ₹[Y] revenue. Top performer: [NAME]! Keep pushing! 🚀' },
];

export const TeamSMSBroadcastView: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, employees, getTeamMemberIds, showToast } = useApp();
  const teamMemberIds = getTeamMemberIds(currentUser.id);
  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));

  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [message, setMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'send' | 'delivery' | 'history'>(
    activeTab === 'team-sms-delivery' ? 'delivery' : activeTab === 'team-sms-broadcast-history' ? 'history' : 'send'
  );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecipients([]);
      setSelectAll(false);
    } else {
      setSelectedRecipients(teamMemberIds);
      setSelectAll(true);
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      setSelectAll(next.length === teamMemberIds.length);
      return next;
    });
  };

  const handleSend = () => {
    const recipients = selectAll ? teamMemberIds : selectedRecipients;
    if (recipients.length === 0) { showToast('Select at least one recipient.', 'warning'); return; }
    if (!message.trim()) { showToast('Enter a message to send.', 'warning'); return; }

    const names = recipients.map(id => employees.find(e => e.id === id)?.name || id);
    const newBroadcast: BroadcastRecord = {
      id: `bc-${Date.now().toString(36)}`,
      message: message.trim(),
      recipients,
      recipientNames: names,
      sentAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Sent',
      type: SMS_TEMPLATES.some(t => t.text === message.trim()) ? 'Template' : 'Custom',
    };
    setBroadcasts(prev => [newBroadcast, ...prev]);
    confetti({ particleCount: 35, spread: 50 });
    showToast(`SMS broadcast sent to ${recipients.length} team member${recipients.length > 1 ? 's' : ''}!`, 'success');
    setMessage('');
  };

  const applyTemplate = (text: string) => {
    setMessage(text);
    showToast('Template loaded! Customize and send.', 'info');
  };

  // Stats
  const totalSent = broadcasts.length;
  const totalRecipients = broadcasts.reduce((sum, b) => sum + b.recipients.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Dashboard</span>
          </span>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Team SMS</span>
        </div>
      </div>

      <h1 className="page-title-ref" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={24} style={{ color: '#10b981' }} /> Team SMS Broadcast
      </h1>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        {[{ key: 'send', label: '📢 Send SMS', },{ key: 'history', label: '📋 Broadcast History' }].map(tab => (
          <button key={tab.key} className={`btn btn-sm ${activeSubTab === tab.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSubTab(tab.key as any)} style={{ fontSize: '0.8rem' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{totalSent}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Broadcasts Sent</div>
        </div>
        <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{totalRecipients}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Recipients</div>
        </div>
        <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{teamEmployees.length}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Team Members</div>
        </div>
      </div>

      {activeSubTab === 'send' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
          {/* Left: Compose */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.75rem' }}>
              <Send size={16} style={{ color: '#10b981' }} />
              <span>Compose Message</span>
            </div>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Type your team message here..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.86rem', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {message.length} characters • {selectAll ? 'All team members' : `${selectedRecipients.length} selected`}
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Send size={14} /> Send Broadcast
            </button>

            {/* Templates */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quick Templates:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SMS_TEMPLATES.map(t => (
                  <div key={t.id} className="card" onClick={() => applyTemplate(t.text)} style={{
                    padding: '0.6rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                    border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-alt)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.2rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {t.text.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Recipients */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.75rem' }}>
              <Users size={16} style={{ color: '#3b82f6' }} />
              <span>Recipients</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={selectAll} onChange={handleSelectAll} style={{ accentColor: '#3b82f6' }} />
              Select All ({teamEmployees.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {teamEmployees.map(emp => (
                <label key={emp.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background 0.2s',
                  background: (selectAll || selectedRecipients.includes(emp.id)) ? 'rgba(59,130,246,0.06)' : 'transparent',
                }}>
                  <input type="checkbox" checked={selectAll || selectedRecipients.includes(emp.id)} onChange={() => toggleRecipient(emp.id)} style={{ accentColor: '#3b82f6' }} />
                  <img src={emp.avatar} alt={emp.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.phone}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="card">
          {broadcasts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No broadcasts sent yet. Compose a message and send it to your team.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {broadcasts.map((bc, idx) => (
                <div key={bc.id} style={{ padding: '0.85rem 1rem', borderBottom: idx < broadcasts.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>{bc.status}</span>
                      <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>{bc.type}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{bc.sentAt}</span>
                  </div>
                  <p style={{ margin: '0 0 0.35rem', fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{bc.message}</p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    To: {bc.recipientNames.join(', ')} ({bc.recipients.length} recipients)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
