import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../state/store';
import { RACallRecord, STANDARD_ADVISORY_SERVICES, ActiveClientRecordDetailed } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Lock,
  Unlock,
  Radio,
  User,
  Filter,
  Flame,
  Award,
  Send,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Smartphone,
  Mail,
  Users,
  Check,
  Zap,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdvisoryCallDispatchModal } from './AdvisoryCallDispatchModal';

export const RACallsDashboardView: React.FC = () => {
  const {
    theme,
    raCalls,
    createRACall,
    updateRACallStatus,
    currentUser,
    detailedClients,
    updateClientService,
    activateClientRetrial,
    markClientConverted,
    showToast,
    clientSearchQuery
  } = useApp();

  const isDark = theme === 'dark';

  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newCallModalOpen, setNewCallModalOpen] = useState(false);
  const [selectedClientForTrial, setSelectedClientForTrial] = useState<string>('');

  // Active Advisory Clients Drawer state, drawer search & Call Dispatch Modal state
  const [showActiveClientsDrawer, setShowActiveClientsDrawer] = useState(false);
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
  const [dispatchModalCall, setDispatchModalCall] = useState<RACallRecord | null>(null);
  const [dispatchModalTargetClient, setDispatchModalTargetClient] = useState<ActiveClientRecordDetailed | null>(null);

  // Auto-select client if clientSearchQuery was set from header or sidebar
  useEffect(() => {
    if (clientSearchQuery && clientSearchQuery.trim()) {
      const q = clientSearchQuery.trim().toLowerCase();
      const match = detailedClients.find(c => 
        (c.mobile && c.mobile.includes(q)) || 
        (c.clientName && c.clientName.toLowerCase().includes(q))
      );
      if (match) {
        setSelectedClientForTrial(match.id);
        setShowActiveClientsDrawer(true);
      }
    }
  }, [clientSearchQuery, detailedClients]);

  // Selected client for interactive service configuration
  const selectedClient = useMemo(() => {
    return detailedClients.find(c => c.id === selectedClientForTrial) || null;
  }, [detailedClients, selectedClientForTrial]);

  // Interactive Client Service Setup State
  const [serviceOption, setServiceOption] = useState<string>('INDEX OPTION');
  const [serviceFromDate, setServiceFromDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [serviceToDate, setServiceToDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [serviceTier, setServiceTier] = useState<'Free Trial' | 'Paid Converted Service'>('Free Trial');

  // Sync state when selected client changes
  useEffect(() => {
    if (selectedClient) {
      setServiceOption(selectedClient.serviceName || 'INDEX OPTION');
      const start = selectedClient.startDate || new Date().toISOString().slice(0, 10);
      setServiceFromDate(start);
      if (selectedClient.endDate) {
        setServiceToDate(selectedClient.endDate);
      } else {
        const d = new Date(start);
        d.setDate(d.getDate() + (selectedClient.trialStatus?.includes('Active') ? 2 : 30));
        setServiceToDate(d.toISOString().slice(0, 10));
      }
      setServiceTier((selectedClient.trialStatus === 'Converted' || selectedClient.tabCategory === 'clients') ? 'Paid Converted Service' : 'Free Trial');
    }
  }, [selectedClient]);

  // Quick preset helper for From Date
  const handleFromPreset = (type: 'today' | 'yesterday' | 'firstOfMonth') => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    } else if (type === 'firstOfMonth') {
      d.setDate(1);
    }
    setServiceFromDate(d.toISOString().slice(0, 10));
  };

  // Quick preset helper for To Date
  const handleToPreset = (daysToAdd: number) => {
    const base = new Date(serviceFromDate || new Date());
    base.setDate(base.getDate() + daysToAdd);
    setServiceToDate(base.toISOString().slice(0, 10));
  };

  // Live calculated duration
  const daysDifference = useMemo(() => {
    if (!serviceFromDate || !serviceToDate) return 0;
    const diffTime = new Date(serviceToDate).getTime() - new Date(serviceFromDate).getTime();
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  }, [serviceFromDate, serviceToDate]);

  // Active advisory clients list
  const activeAdvisoryClients = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return detailedClients.filter(c => {
      const isTrial = c.trialStatus?.includes('Active') || c.trialStatus?.includes('Trial');
      const isClient = c.tabCategory === 'clients' || c.trialStatus === 'Converted' || c.response === 'CLOSED WON' || c.response === 'CLOSED OWN';
      const isNotExpired = !c.endDate || c.endDate >= todayStr;
      return (isTrial || isClient) && isNotExpired;
    });
  }, [detailedClients]);

  // Filtered active clients in drawer based on drawerSearchQuery
  const filteredDrawerClients = useMemo(() => {
    if (!drawerSearchQuery.trim()) return activeAdvisoryClients;
    const q = drawerSearchQuery.toLowerCase().trim();
    const cleanQ = drawerSearchQuery.replace(/\D/g, '');
    return activeAdvisoryClients.filter(c => 
      (c.clientName || '').toLowerCase().includes(q) ||
      (c.mobile || '').includes(q) ||
      (cleanQ.length >= 3 && (c.mobile || '').replace(/\D/g, '').includes(cleanQ)) ||
      (c.serviceName || '').toLowerCase().includes(q) ||
      (c.trialStatus || '').toLowerCase().includes(q)
    );
  }, [activeAdvisoryClients, drawerSearchQuery]);

  // Handle Save Advisory Service & Period
  const handleSaveService = () => {
    if (!selectedClient) return;
    const isPaid = serviceTier === 'Paid Converted Service';
    updateClientService(
      selectedClient.id,
      serviceOption,
      serviceFromDate,
      serviceToDate,
      isPaid ? 'Converted' : 'Active Trial',
      `Configured advisory service to ${serviceOption} from ${serviceFromDate} to ${serviceToDate} (${serviceTier})`
    );
  };

  // New call form state
  const [callSegment, setCallSegment] = useState('NIFTY OPTION');
  const [callTitle, setCallTitle] = useState('');
  const [callAction, setCallAction] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [target1, setTarget1] = useState('');
  const [target2, setTarget2] = useState('');
  const [target3, setTarget3] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [analystName, setAnalystName] = useState(currentUser.name || 'Aditya V. Sharma (SEBI RA)');
  const [analystRegNo, setAnalystRegNo] = useState('INH000008921');
  const [tierAccess, setTierAccess] = useState<'Free Trial & Paid' | 'Paid Only'>('Free Trial & Paid');
  const [rationale, setRationale] = useState('');

  const isAnalystOrManager = currentUser.role === 'manager' || currentUser.role === 'admin' || currentUser.role === 'analyst' || currentUser.role === 'team_leader';

  const filteredCalls = raCalls.filter(call => {
    const matchesSegment = segmentFilter === 'all' || call.segment.toLowerCase().includes(segmentFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    return matchesSegment && matchesStatus;
  });

  const handleCreateCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callTitle || !entryPrice || !target1 || !stopLoss) {
      showToast('Please fill in required fields: Symbol/Title, Entry, Target 1, and Stop Loss.', 'error');
      return;
    }

    createRACall({
      title: callTitle,
      segment: callSegment as any,
      type: callAction as 'BUY' | 'SELL',
      callType: callAction as 'BUY' | 'SELL',
      entryPrice: parseFloat(entryPrice),
      target1: parseFloat(target1),
      target2: target2 ? parseFloat(target2) : parseFloat((parseFloat(target1) * 1.02).toFixed(2)),
      target3: target3 ? parseFloat(target3) : undefined,
      stopLoss: parseFloat(stopLoss),
      givenBy: analystName || 'SEBI Registered RA',
      givenById: 'ra-sebi-01',
      accessTier: tierAccess as any,
      tierAccess: tierAccess as any,
      applicableClientsCount: 45,
      analystName,
      analystRegNo,
      rationale: rationale || 'Breakout with surge in call/put open interest & volume confirmation.'
    });

    setNewCallModalOpen(false);
    setCallTitle('');
    setEntryPrice('');
    setTarget1('');
    setTarget2('');
    setTarget3('');
    setStopLoss('');
    setRationale('');
  };

  const getStatusBadge = (status: RACallRecord['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1.5s infinite' }} /> ACTIVE
          </span>
        );
      case 'TARGET 1 HIT':
      case 'TARGET 2 HIT':
      case 'ALL TARGETS HIT':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800 }}>
            <CheckCircle2 size={12} /> {status}
          </span>
        );
      case 'STOP LOSS HIT':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800 }}>
            <AlertTriangle size={12} /> {status}
          </span>
        );
      case 'CLOSED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.3)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800 }}>
            <Clock size={12} /> CLOSED
          </span>
        );
    }
  };

  return (
    <div style={{ padding: '6px 0' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Flame size={24} color="#f97316" />
            Research Analyst (RA) Live Advisory Calls
          </h2>
          <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            SEBI-registered Research Analyst calls with automated entry, target, stop loss & tier authorization
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Active Advisory Clients Desk Button */}
          <button
            type="button"
            onClick={() => setShowActiveClientsDrawer(!showActiveClientsDrawer)}
            style={{
              background: showActiveClientsDrawer 
                ? (isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.15)')
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'),
              color: isDark ? '#38bdf8' : '#0284c7',
              border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.4)' : '#bae6fd'}`,
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Users size={16} />
            <span>Active Advisory Clients ({activeAdvisoryClients.length})</span>
            {showActiveClientsDrawer ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {isAnalystOrManager && (
            <button
              onClick={() => setNewCallModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
              }}
            >
              <Plus size={16} /> Publish New Advisory Call
            </button>
          )}
        </div>
      </div>

      {/* Active Clients Advisory Desk Drawer / Section (Collapsible) */}
      {showActiveClientsDrawer && (
        <div
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))'
              : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.35)' : '#bfdbfe'}`,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(2, 132, 199, 0.08)',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 8, borderRadius: 10, background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe', color: '#0284c7' }}>
                <Users size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                  Active Clients Advisory Desk
                </h3>
                <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Clients requiring live advisory calls today with real-time validity & delivery counters
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Drawer Quick Search Input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#94a3b8' : '#64748b' }} />
                <input
                  type="text"
                  placeholder="Filter clients / phone..."
                  value={drawerSearchQuery}
                  onChange={e => setDrawerSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '5px 24px 5px 26px',
                    fontSize: '0.75rem',
                    borderRadius: 6,
                    background: isDark ? 'rgba(0,0,0,0.25)' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                    color: isDark ? '#fff' : '#0f172a'
                  }}
                />
                {drawerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDrawerSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isDark ? '#94a3b8' : '#64748b',
                      padding: 0,
                      display: 'flex'
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowActiveClientsDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, textAlign: 'left', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Client Name & Contact</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Needed Service / Option</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Active Period (From - To)</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Service Validity</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Calls Delivered</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right' }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrawerClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem 1rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                      No active advisory clients matching "{drawerSearchQuery}"
                    </td>
                  </tr>
                ) : filteredDrawerClients.map(c => {
                    const today = new Date();
                    const end = c.endDate ? new Date(c.endDate) : null;
                    const diffDays = end ? Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    const isExpiringToday = diffDays === 0;
                    const isExpired = diffDays < 0;
                    const isSelected = selectedClientForTrial === c.id;

                    return (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
                          transition: 'background 0.2s',
                          background: isSelected ? (isDark ? 'rgba(56, 189, 248, 0.12)' : '#f0f9ff') : undefined
                        }}
                      >
                        <td 
                          style={{ padding: '10px', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedClientForTrial(c.id);
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                          title="Click to select this client in the setup panel above"
                        >
                          <div style={{ fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>{c.clientName}</div>
                          <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>{c.mobile} • {c.email || 'Email on file'}</div>
                        </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isDark ? 'rgba(249, 115, 22, 0.15)' : '#fff7ed',
                          color: '#ea580c',
                          border: '1px solid rgba(249, 115, 22, 0.3)',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          <Sparkles size={12} /> {c.serviceName || 'INDEX OPTION'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: isDark ? '#cbd5e1' : '#475569' }}>
                        {c.startDate || 'Immediate'} → <strong>{c.endDate || 'Ongoing'}</strong>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {isExpired ? (
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700, fontSize: '0.72rem' }}>
                            Expired
                          </span>
                        ) : isExpiringToday ? (
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(245, 158, 11, 0.18)', color: '#d97706', fontWeight: 800, fontSize: '0.72rem', animation: 'pulse 1.5s infinite' }}>
                            Expiring Today
                          </span>
                        ) : (
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>
                            {diffDays} Days Remaining
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 700,
                          color: (c.callsDeliveredCount || 0) > 0 ? '#10b981' : (isDark ? '#94a3b8' : '#64748b')
                        }}>
                          🎯 {c.callsDeliveredCount || 0} Delivered
                        </span>
                        {c.lastCallSentAt && (
                          <div style={{ fontSize: '0.68rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                            Last: {c.lastCallSentAt.split(',')[0]}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientForTrial(c.id);
                              window.scrollTo({ top: 180, behavior: 'smooth' });
                            }}
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}`,
                              color: isDark ? '#fff' : '#0f172a',
                              borderRadius: 6,
                              padding: '5px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Configure
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const matchingCall = raCalls.find(call => call.status === 'ACTIVE') || raCalls[0];
                              setDispatchModalCall(matchingCall);
                              setDispatchModalTargetClient(c);
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Send size={12} /> Send Call
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Free Trial Client Limit & Retrial Manager Strip */}
      <div
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))'
            : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.25)' : '#e2e8f0'}`,
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: selectedClient ? 12 : 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(2, 132, 199, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(2, 132, 199, 0.25)'}`
            }}
          >
            <ShieldAlert size={22} color={isDark ? '#38bdf8' : '#0284c7'} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isDark ? '#fff' : '#0f172a' }}>
              Free Trial Policy: Max 2 Days Live Calls + 1-Day Retrial Buffer
            </div>
            <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              Select any client below to configure active service period, required option, and dispatch live calls.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={selectedClientForTrial}
            onChange={(e) => setSelectedClientForTrial(e.target.value)}
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.4)' : '#0284c7'}`,
              borderRadius: 8,
              padding: '8px 14px',
              color: isDark ? '#fff' : '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 600,
              minWidth: 260
            }}
          >
            <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
              -- Select Client to Manage Service & Period --
            </option>
            {detailedClients.map(c => (
              <option key={c.id} value={c.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                {c.clientName} ({c.serviceName || 'INDEX OPTION'} • {c.trialStatus || 'Active'})
              </option>
            ))}
          </select>

          <button
            disabled={!selectedClientForTrial}
            onClick={() => {
              if (selectedClientForTrial) {
                activateClientRetrial(selectedClientForTrial);
              }
            }}
            style={{
              background: selectedClientForTrial 
                ? (isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)') 
                : (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'),
              color: selectedClientForTrial 
                ? (isDark ? '#38bdf8' : '#0284c7') 
                : (isDark ? '#64748b' : '#94a3b8'),
              border: `1px solid ${selectedClientForTrial 
                ? (isDark ? '#38bdf8' : '#0284c7') 
                : (isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: selectedClientForTrial ? 'pointer' : 'not-allowed'
            }}
          >
            ⚡ +1 Day Retrial
          </button>

          <button
            disabled={!selectedClientForTrial}
            onClick={() => {
              if (selectedClientForTrial) {
                markClientConverted(selectedClientForTrial);
              }
            }}
            style={{
              background: selectedClientForTrial 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'),
              color: selectedClientForTrial ? '#fff' : (isDark ? '#64748b' : '#94a3b8'),
              border: selectedClientForTrial ? 'none' : `1px solid ${isDark ? 'transparent' : '#cbd5e1'}`,
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: selectedClientForTrial ? 'pointer' : 'not-allowed'
            }}
          >
            💎 Convert to Paid
          </button>
        </div>
      </div>

      {/* Interactive Client Service Setup Glassmorphic Panel */}
      {selectedClient && (
        <div
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
              : 'linear-gradient(135deg, #ffffff, #f0f9ff)',
            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.4)' : '#38bdf8'}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 8px 30px rgba(56, 189, 248, 0.15)',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Panel Header: Client Profile Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0f2fe'}`, paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                }}
              >
                {selectedClient.clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                    {selectedClient.clientName}
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: selectedClient.trialStatus === 'Converted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: selectedClient.trialStatus === 'Converted' ? '#10b981' : '#38bdf8',
                    border: `1px solid ${selectedClient.trialStatus === 'Converted' ? '#10b981' : '#38bdf8'}`
                  }}>
                    {selectedClient.trialStatus || 'Active Trial'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>
                  📱 {selectedClient.mobile} • ✉️ {selectedClient.email || 'No email'} • Client Code: <strong>{selectedClient.clientCode || selectedClient.id}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>Calls Delivered</span>
                <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>🎯 {selectedClient.callsDeliveredCount || 0} Calls</strong>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClientForTrial('')}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
                  color: isDark ? '#94a3b8' : '#64748b',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem'
                }}
              >
                <X size={14} /> Clear
              </button>
            </div>
          </div>

          {/* Service Configuration Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            {/* From Date with presets */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 6 }}>
                From Date (Service Start)
              </label>
              <input
                type="date"
                value={serviceFromDate}
                onChange={e => setServiceFromDate(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem',
                  marginBottom: 6
                }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => handleFromPreset('today')}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', borderRadius: 4, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569', cursor: 'pointer' }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleFromPreset('yesterday')}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', borderRadius: 4, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569', cursor: 'pointer' }}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => handleFromPreset('firstOfMonth')}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', borderRadius: 4, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569', cursor: 'pointer' }}
                >
                  1st of Month
                </button>
              </div>
            </div>

            {/* To Date with duration presets */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 6 }}>
                To Date (Service Expiry)
              </label>
              <input
                type="date"
                value={serviceToDate}
                onChange={e => setServiceToDate(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem',
                  marginBottom: 6
                }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => handleToPreset(2)}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', borderRadius: 4, border: 'none', background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}
                >
                  +2 Days Trial
                </button>
                <button
                  type="button"
                  onClick={() => handleToPreset(7)}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', borderRadius: 4, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569', cursor: 'pointer' }}
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleToPreset(30)}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', borderRadius: 4, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569', cursor: 'pointer' }}
                >
                  +1 Month
                </button>
                <button
                  type="button"
                  onClick={() => handleToPreset(90)}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', borderRadius: 4, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569', cursor: 'pointer' }}
                >
                  +3 Months
                </button>
              </div>
            </div>

            {/* Which Options / Service Required Dropdown */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 6 }}>
                Which Options / Service Required
              </label>
              <select
                value={serviceOption}
                onChange={e => setServiceOption(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: 6
                }}
              >
                {STANDARD_ADVISORY_SERVICES.map(srv => (
                  <option key={srv.id} value={srv.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                    {srv.name}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                Calls in this segment will auto-match this client for 1-click dispatch.
              </span>
            </div>

            {/* Service Tier: Free Trial vs Paid */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 6 }}>
                Service Tier & Access Level
              </label>
              <select
                value={serviceTier}
                onChange={e => setServiceTier(e.target.value as any)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: 6
                }}
              >
                <option value="Free Trial" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                  Free Trial (2-Day limit + Buffer)
                </option>
                <option value="Paid Converted Service" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                  Paid Converted Service (Full Access)
                </option>
              </select>

              {/* Live duration validity indicator */}
              <div style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <CheckCircle2 size={13} />
                <span>Active for {daysDifference} Days (Valid until {serviceToDate})</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0f2fe'}`, paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSaveService}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 10px rgba(2, 132, 199, 0.35)'
                }}
              >
                💾 Save Advisory Service & Period
              </button>

              <button
                type="button"
                onClick={() => {
                  activateClientRetrial(selectedClient.id);
                  setServiceToDate(prev => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().slice(0, 10);
                  });
                }}
                style={{
                  background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                  color: isDark ? '#38bdf8' : '#0284c7',
                  border: `1px solid ${isDark ? '#38bdf8' : '#0284c7'}`,
                  borderRadius: 8,
                  padding: '9px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ⚡ +1 Day Retrial
              </button>

              <button
                type="button"
                onClick={() => {
                  markClientConverted(selectedClient.id);
                  setServiceTier('Paid Converted Service');
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                💎 Convert to Paid
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const activeCall = raCalls.find(call => call.status === 'ACTIVE') || raCalls[0];
                setDispatchModalCall(activeCall);
                setDispatchModalTargetClient(selectedClient);
              }}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 10px rgba(249, 115, 22, 0.35)'
              }}
            >
              <Send size={14} /> Send Live Call Now
            </button>
          </div>
        </div>
      )}


      {/* Segment and Status Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={15} color={isDark ? '#94a3b8' : '#64748b'} />
          {['all', 'NIFTY', 'BANKNIFTY', 'CASH', 'COMMODITY', 'CRUDE'].map(seg => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              style={{
                background: segmentFilter === seg 
                  ? 'rgba(249, 115, 22, 0.18)' 
                  : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                color: segmentFilter === seg ? '#ea580c' : (isDark ? '#94a3b8' : '#64748b'),
                border: segmentFilter === seg 
                  ? '1px solid #f97316' 
                  : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1'}`,
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: segmentFilter === seg ? 'none' : (isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.03)')
              }}
            >
              {seg === 'all' ? 'All Segments' : seg}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['all', 'ACTIVE', 'TARGET 1 HIT', 'STOP LOSS HIT', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st 
                  ? (isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.12)') 
                  : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                color: statusFilter === st ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
                border: statusFilter === st 
                  ? `1px solid ${isDark ? '#38bdf8' : '#0284c7'}` 
                  : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1'}`,
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: statusFilter === st ? 'none' : (isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.03)')
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid of RA Calls with Silky Smooth Scrolling */}
      <div 
        className="custom-kite-scrollbar"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
          maxHeight: 'calc(100vh - 240px)',
          overflowY: 'auto',
          paddingRight: '6px'
        }}
      >
        {filteredCalls.map((call) => {
          const isBuy = call.callType === 'BUY';
          return (
            <div
              key={call.id}
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                border: `1px solid ${isBuy 
                  ? (isDark ? 'rgba(16, 185, 129, 0.3)' : '#86efac') 
                  : (isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5')}`,
                borderRadius: 16,
                padding: 20,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Card top banner */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        background: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isBuy ? '#10b981' : '#ef4444',
                        border: `1px solid ${isBuy ? '#10b981' : '#ef4444'}`,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {isBuy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {call.callType}
                    </span>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      color: isDark ? '#94a3b8' : '#64748b', 
                      background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', 
                      border: `1px solid ${isDark ? 'transparent' : '#e2e8f0'}`,
                      padding: '3px 6px', 
                      borderRadius: 4 
                    }}>
                      {call.segment}
                    </span>
                  </div>

                  {getStatusBadge(call.status)}
                </div>

                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                  {call.title}
                </h3>

                <div style={{ fontSize: '0.75rem', color: isDark ? '#cbd5e1' : '#64748b', marginBottom: 14 }}>
                  {call.rationale}
                </div>

                {/* Price Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8,
                    background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'transparent' : '#e2e8f0'}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginBottom: 14,
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block' }}>Entry</span>
                    <strong style={{ fontSize: '0.9rem', color: isDark ? '#fff' : '#0f172a' }}>₹{call.entryPrice}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'block' }}>Target 1</span>
                    <strong style={{ fontSize: '0.9rem', color: '#10b981' }}>₹{call.target1}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: isDark ? '#34d399' : '#059669', display: 'block' }}>Target 2</span>
                    <strong style={{ fontSize: '0.9rem', color: isDark ? '#34d399' : '#059669' }}>{call.target2 ? `₹${call.target2}` : '-'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#ef4444', display: 'block' }}>Stop Loss</span>
                    <strong style={{ fontSize: '0.9rem', color: '#ef4444' }}>₹{call.stopLoss}</strong>
                  </div>
                </div>
              </div>

                {/* Matched Subscribed Clients Count Badge */}
                {(() => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const matched = detailedClients.filter(c => {
                    const sName = (c.serviceName || '').toUpperCase();
                    const cSeg = (call.segment || '').toUpperCase();
                    const isSegmentMatch = sName.includes(cSeg) || cSeg.includes(sName) ||
                      (cSeg.includes('OPTION') && sName.includes('OPTION')) ||
                      (cSeg.includes('COMMODITY') && sName.includes('COMMODITY'));
                    const isNotExpired = !c.endDate || c.endDate >= todayStr;
                    return isSegmentMatch && isNotExpired;
                  });

                  return (
                    <div style={{
                      margin: '10px 0',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isDark ? 'rgba(56, 189, 248, 0.08)' : '#f0f9ff',
                      border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.25)' : '#bae6fd'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.74rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>
                        <Users size={14} />
                        <span>🎯 {matched.length} Subscribed Client{matched.length === 1 ? '' : 's'}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {matched.slice(0, 2).map(c => c.clientName).join(', ')}{matched.length > 2 ? ` +${matched.length - 2} more` : ''}
                      </span>
                    </div>
                  );
                })()}

                {/* Prominent Send Live Call via SMS & Email button */}
                <button
                  type="button"
                  onClick={() => {
                    setDispatchModalCall(call);
                    setDispatchModalTargetClient(null);
                  }}
                  style={{
                    width: '100%',
                    marginBottom: 10,
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Send size={13} /> Send Live Call via SMS & Email
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}`, paddingTop: 10, marginBottom: 10 }}>
                  <div>
                    Analyst: <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{call.analystName}</strong>
                    <span style={{ display: 'block', fontSize: '0.66rem', color: isDark ? '#64748b' : '#94a3b8' }}>SEBI Reg: {call.analystRegNo}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span>{call.openTime}</span>
                    <span style={{ display: 'block', color: (call.tierAccess === 'paid' || (call.tierAccess as string) === 'Paid Only') ? '#f59e0b' : '#38bdf8' }}>
                      {call.tierAccess}
                    </span>
                  </div>
                </div>

                {isAnalystOrManager && call.status === 'ACTIVE' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    <button
                      onClick={() => updateRACallStatus(call.id, 'TARGET 1 HIT')}
                      style={{
                        background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 6,
                        padding: '6px 4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Target 1 Hit
                    </button>
                    <button
                      onClick={() => updateRACallStatus(call.id, 'STOP LOSS HIT')}
                      style={{
                        background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 6,
                        padding: '6px 4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      SL Hit
                    </button>
                    <button
                      onClick={() => updateRACallStatus(call.id, 'CLOSED')}
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                        color: isDark ? '#cbd5e1' : '#475569',
                        border: `1px solid ${isDark ? 'transparent' : '#cbd5e1'}`,
                        borderRadius: 6,
                        padding: '6px 4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Close Call
                    </button>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Publish Call Modal */}
      {newCallModalOpen && (
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
              maxWidth: 580,
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(249, 115, 22, 0.4)' : '#e2e8f0'}`,
              borderRadius: 18,
              padding: 24,
              color: isDark ? '#fff' : '#0f172a',
              boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.7)' : '0 20px 50px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flame size={22} color="#f97316" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Publish Advisory Signal</h3>
              </div>
              <button
                onClick={() => setNewCallModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCall}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>Segment</label>
                  <select
                    value={callSegment}
                    onChange={(e) => setCallSegment(e.target.value)}
                    style={{
                      width: '100%',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="NIFTY OPTION" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>NIFTY OPTION</option>
                    <option value="BANKNIFTY OPTION" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>BANKNIFTY OPTION</option>
                    <option value="INTRADAY CASH" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>INTRADAY CASH</option>
                    <option value="CRUDE OIL FUTURES" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>CRUDE OIL FUTURES</option>
                    <option value="COMMODITY MCX" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>COMMODITY MCX</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>Signal Direction</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setCallAction('BUY')}
                      style={{
                        background: callAction === 'BUY' ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)') : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                        color: callAction === 'BUY' ? '#10b981' : (isDark ? '#94a3b8' : '#64748b'),
                        border: callAction === 'BUY' ? '1px solid #10b981' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
                        borderRadius: 8,
                        padding: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      BUY / CALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setCallAction('SELL')}
                      style={{
                        background: callAction === 'SELL' ? (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)') : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                        color: callAction === 'SELL' ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b'),
                        border: callAction === 'SELL' ? '1px solid #ef4444' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
                        borderRadius: 8,
                        padding: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      SELL / PUT
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>
                  Instrument Title / Strike
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIFTY 25500 CE (Weekly Expiry)"
                  value={callTitle}
                  onChange={(e) => setCallTitle(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: isDark ? '#fff' : '#0f172a',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>Entry (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="120.00"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                      borderRadius: 8,
                      padding: '8px',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#10b981', display: 'block', marginBottom: 4 }}>Target 1 (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="145.00"
                    value={target1}
                    onChange={(e) => setTarget1(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                      borderRadius: 8,
                      padding: '8px',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: isDark ? '#34d399' : '#059669', display: 'block', marginBottom: 4 }}>Target 2 (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="170.00"
                    value={target2}
                    onChange={(e) => setTarget2(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                      borderRadius: 8,
                      padding: '8px',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#ef4444', display: 'block', marginBottom: 4 }}>Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="95.00"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                      borderRadius: 8,
                      padding: '8px',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>Audience Tier Access</label>
                  <select
                    value={tierAccess}
                    onChange={(e) => setTierAccess(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Free Trial & Paid" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>Free Trial & Paid Clients</option>
                    <option value="Paid Only" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>Paid Only (Locked for Free Trial)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>SEBI RA Attribution</label>
                  <input
                    type="text"
                    value={analystName}
                    onChange={(e) => setAnalystName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 4 }}>Research Rationale</label>
                <input
                  type="text"
                  placeholder="Technical indicator / OI breakout rationale"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: isDark ? '#fff' : '#0f172a',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setNewCallModalOpen(false)}
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                    color: isDark ? '#cbd5e1' : '#475569',
                    border: `1px solid ${isDark ? 'transparent' : '#cbd5e1'}`,
                    borderRadius: 8,
                    padding: '9px 16px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Broadcast Call Instantly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Advisory Call Dispatch Modal */}
      {dispatchModalCall && (
        <AdvisoryCallDispatchModal
          quote={dispatchModalCall}
          targetClient={dispatchModalTargetClient}
          onClose={() => {
            setDispatchModalCall(null);
            setDispatchModalTargetClient(null);
          }}
        />
      )}
    </div>
  );
};
