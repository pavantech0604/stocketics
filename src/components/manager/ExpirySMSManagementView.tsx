import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { SubscriptionExpirySMSConfig } from '../../types';
import {
  Clock,
  Send,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Settings,
  MessageSquare,
  Search,
  Filter,
  User,
  Phone,
  RefreshCw,
  BellRing
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExpirySMSManagementView: React.FC = () => {
  const {
    detailedClients,
    expirySMSConfigs,
    expirySMSLogs,
    sendExpirySMS,
    updateExpirySMSConfig,
    showToast,
    theme
  } = useApp();
  const isDark = theme === 'dark';

  const [activeTabSub, setActiveTabSub] = useState<'clients' | 'triggers' | 'logs'>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'expiring_soon' | 'expired'>('all');
  const [selectedClientForSMS, setSelectedClientForSMS] = useState<string | null>(null);
  const [customSMSText, setCustomSMSText] = useState('');

  // Calculate days remaining from today's date
  const now = new Date();

  const clientsWithExpiry = detailedClients.map(c => {
    // Parse DD/MM/YYYY or YYYY-MM-DD
    let daysRemaining = 999;
    try {
      let parts: string[] = [];
      if (c.endDate.includes('/')) {
        parts = c.endDate.split('/');
        const expDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const diffMs = expDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      } else if (c.endDate.includes('-')) {
        const expDate = new Date(c.endDate);
        const diffMs = expDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    } catch (_) {
      daysRemaining = 15;
    }

    return {
      ...c,
      daysRemaining
    };
  });

  const filteredClients = clientsWithExpiry.filter(c => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.mobile.includes(searchQuery) ||
                          c.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterUrgency === 'expiring_soon') return c.daysRemaining <= 5 && c.daysRemaining >= 0;
    if (filterUrgency === 'expired') return c.daysRemaining < 0;
    return true;
  });

  const handleOpenSMSModal = (client: any) => {
    setSelectedClientForSMS(client.id);
    setCustomSMSText(
      `Dear ${client.clientName}, your Stocketics Advisory package for "${client.serviceName}" expires on ${client.endDate} at 17:00 IST. Please renew your package promptly to prevent advisory signal interruption.`
    );
  };

  const handleConfirmSendSMS = () => {
    if (!selectedClientForSMS) return;
    sendExpirySMS(selectedClientForSMS, customSMSText);
    setSelectedClientForSMS(null);
    setCustomSMSText('');
  };

  const handleToggleTrigger = (config: SubscriptionExpirySMSConfig) => {
    updateExpirySMSConfig(config.id, { isActive: !config.isActive });
  };

  return (
    <div style={{ padding: '6px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BellRing size={24} color="#f59e0b" />
            Subscription Expiry & Renewal SMS Automation
          </h2>
          <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            Track client package expiry dates & dispatch automated multi-stage renewal SMS notices
          </span>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9', padding: 4, borderRadius: 10, border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTabSub('clients')}
            style={{
              background: activeTabSub === 'clients' ? '#3b82f6' : 'transparent',
              color: activeTabSub === 'clients' ? '#fff' : (isDark ? '#cbd5e1' : '#64748b'),
              border: 'none',
              borderRadius: 7,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Expiring Clients ({clientsWithExpiry.filter(c => c.daysRemaining <= 7).length})
          </button>
          <button
            onClick={() => setActiveTabSub('triggers')}
            style={{
              background: activeTabSub === 'triggers' ? '#3b82f6' : 'transparent',
              color: activeTabSub === 'triggers' ? '#fff' : (isDark ? '#cbd5e1' : '#64748b'),
              border: 'none',
              borderRadius: 7,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Automated SMS Triggers
          </button>
          <button
            onClick={() => setActiveTabSub('logs')}
            style={{
              background: activeTabSub === 'logs' ? '#3b82f6' : 'transparent',
              color: activeTabSub === 'logs' ? '#fff' : (isDark ? '#cbd5e1' : '#64748b'),
              border: 'none',
              borderRadius: 7,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Dispatch Logs ({expirySMSLogs.length})
          </button>
        </div>
      </div>

      {/* View 1: Clients List with Expiry Badges */}
      {activeTabSub === 'clients' && (
        <>
          {/* Filter and Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={16} color={isDark ? '#94a3b8' : '#64748b'} style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="text"
                placeholder="Search by client name, mobile or service package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '9px 12px 9px 36px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={15} color={isDark ? '#94a3b8' : '#64748b'} />
              <button
                onClick={() => setFilterUrgency('all')}
                style={{
                  background: filterUrgency === 'all' 
                    ? (isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.12)') 
                    : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                  color: filterUrgency === 'all' 
                    ? (isDark ? '#38bdf8' : '#0284c7') 
                    : (isDark ? '#94a3b8' : '#64748b'),
                  border: filterUrgency === 'all' 
                    ? (isDark ? '1px solid #38bdf8' : '1px solid #0284c7') 
                    : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All Clients
              </button>
              <button
                onClick={() => setFilterUrgency('expiring_soon')}
                style={{
                  background: filterUrgency === 'expiring_soon' 
                    ? (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.12)') 
                    : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                  color: filterUrgency === 'expiring_soon' ? '#f59e0b' : (isDark ? '#94a3b8' : '#64748b'),
                  border: filterUrgency === 'expiring_soon' ? '1px solid #f59e0b' : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Expiring in ≤ 5 Days
              </button>
              <button
                onClick={() => setFilterUrgency('expired')}
                style={{
                  background: filterUrgency === 'expired' 
                    ? (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)') 
                    : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                  color: filterUrgency === 'expired' ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b'),
                  border: filterUrgency === 'expired' ? '1px solid #ef4444' : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'),
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Expired Packages
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Client & Mobile</th>
                  <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Active Package</th>
                  <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Package Expiry Date</th>
                  <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Expiry Status</th>
                  <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Assigned Agent</th>
                  <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => {
                  const isExpired = client.daysRemaining < 0;
                  const isCritical = client.daysRemaining <= 2 && client.daysRemaining >= 0;
                  const isWarning = client.daysRemaining <= 7 && client.daysRemaining > 2;

                  return (
                    <tr key={client.id} style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>{client.clientName}</div>
                        <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>{client.mobile}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>{client.serviceName}</span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#64748b' : '#94a3b8' }}>₹{((client as any).totalAmount || (client as any).paidAmount || 25000).toLocaleString()}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: isDark ? '#38bdf8' : '#0284c7' }}>{client.endDate}</div>
                        <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>17:00 IST (EOD)</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {isExpired ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                            <AlertTriangle size={12} /> Expired ({Math.abs(client.daysRemaining)}d ago)
                          </span>
                        ) : isCritical ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                            <Clock size={12} /> {client.daysRemaining === 0 ? 'Expires Today!' : `Expires in ${client.daysRemaining}d`}
                          </span>
                        ) : isWarning ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                            <Clock size={12} /> {client.daysRemaining} Days Left
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> Active ({client.daysRemaining}d)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: isDark ? '#cbd5e1' : '#475569' }}>
                        {client.ownerName || client.generatorName || 'Adviser Assigned'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenSMSModal(client)}
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer'
                          }}
                        >
                          <Send size={13} /> Send Expiry SMS
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View 2: Automated Triggers Config */}
      {activeTabSub === 'triggers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {expirySMSConfigs.map(config => (
            <div
              key={config.id}
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                border: `1px solid ${config.isActive ? (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(2, 132, 199, 0.3)') : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0')}`,
                borderRadius: 14,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#fff' : '#0f172a' }}>
                    {(config.triggerDaysBefore ?? Math.round(config.triggerHoursBefore / 24)) === 0
                      ? 'Day of Expiry (At 17:00 IST)'
                      : `T-${config.triggerDaysBefore ?? Math.round(config.triggerHoursBefore / 24)} Days Prior (${(config.triggerDaysBefore ?? Math.round(config.triggerHoursBefore / 24)) * 24} Hours)`}
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.isActive}
                      onChange={() => handleToggleTrigger(config)}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: config.isActive ? '#10b981' : (isDark ? '#94a3b8' : '#64748b') }}>
                      {config.isActive ? 'Active Auto-Dispatch' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: 12 }}>
                  Channels: <strong style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>{(config.channels ?? ['SMS', 'WhatsApp']).join(', ')}</strong> | Time: <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{config.sendTime ?? '10:00 AM IST'}</strong>
                </div>

                <div
                  style={{
                    background: isDark ? 'rgba(0,0,0,0.3)' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: '0.78rem',
                    color: isDark ? '#cbd5e1' : '#0f172a',
                    fontFamily: 'monospace',
                    marginBottom: 14
                  }}
                >
                  "{config.templateText ?? config.template}"
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: isDark ? '#64748b' : '#94a3b8', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9', paddingTop: 10 }}>
                <span>Automatic cron evaluation every hour</span>
                <button
                  onClick={() => showToast(`Trigger rule for T-${config.triggerDaysBefore ?? Math.round(config.triggerHoursBefore / 24)} days saved.`, 'info')}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                >
                  Edit Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 3: Dispatch Logs */}
      {activeTabSub === 'logs' && (
        <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Recipient Client</th>
                <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Mobile Number</th>
                <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Package Expiry</th>
                <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Dispatched Content</th>
                <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {expirySMSLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>{log.clientName}</td>
                  <td style={{ padding: '12px 16px', color: isDark ? '#38bdf8' : '#0284c7' }}>{log.phone}</td>
                  <td style={{ padding: '12px 16px', color: isDark ? '#cbd5e1' : '#475569' }}>{log.expiryDate} {log.expiryTime}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', maxWidth: 300 }}>{log.message}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                      <CheckCircle2 size={12} /> {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: isDark ? '#64748b' : '#94a3b8' }}>{log.sentAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Send Modal */}
      {selectedClientForSMS && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? 'rgba(10, 17, 40, 0.78)' : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.4)' : '#e2e8f0'}`,
              borderRadius: 18,
              padding: 24,
              color: isDark ? '#ffffff' : '#0f172a',
              boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 45px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: isDark ? '#ffffff' : '#0f172a' }}>
                <Send size={18} color="#f59e0b" /> Dispatch Renewal Notice SMS
              </h3>
              <button
                onClick={() => setSelectedClientForSMS(null)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>
                Review / Edit Expiry Reminder Message
              </label>
              <textarea
                value={customSMSText}
                onChange={(e) => setCustomSMSText(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: 10,
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setSelectedClientForSMS(null)}
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                  color: isDark ? '#cbd5e1' : '#475569',
                  border: isDark ? 'none' : '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendSMS}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Dispatch SMS Immediately
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
