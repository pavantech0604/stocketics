import React, { useState, useMemo } from 'react';
import { MarketQuote, RACallRecord } from '../../types';
import { useApp } from '../../state/store';
import {
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Send,
  Share2,
  DollarSign,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Radio,
  User,
  X,
  AlertCircle
} from 'lucide-react';

interface MarketRACallsTabProps {
  quotes: MarketQuote[];
  onOpenBooking?: (call: any) => void;
}

export const MarketRACallsTab: React.FC<MarketRACallsTabProps> = ({ quotes }) => {
  const {
    raCalls,
    currentUser,
    detailedClients,
    createRACall,
    bookClientPositionAndPayment,
    showToast,
    theme
  } = useApp();
  const isDark = theme === 'dark';

  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Booking Modal State
  const [bookingCall, setBookingCall] = useState<any | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [bookedLots, setBookedLots] = useState<number>(1);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');

  // New Call Modal State
  const [isNewCallOpen, setIsNewCallOpen] = useState<boolean>(false);
  const [callTitle, setCallTitle] = useState('');
  const [callSegment, setCallSegment] = useState('NIFTY OPTION');
  const [callType, setCallType] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [target1, setTarget1] = useState('');
  const [target2, setTarget2] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [rationale, setRationale] = useState('');

  const isManagerOrAnalyst = currentUser.role === 'manager' || currentUser.role === 'admin' || currentUser.role === 'analyst' || currentUser.role === 'team_leader';

  // Map RA calls with real-time live market quote data
  const enrichedCalls = useMemo(() => {
    return raCalls.map(call => {
      // Find matching live quote by label or symbol
      const matchingQuote = quotes.find(q => 
        q.label.toLowerCase().includes(call.title.toLowerCase()) ||
        call.title.toLowerCase().includes(q.label.toLowerCase()) ||
        (call.title.toLowerCase().includes('nifty') && q.key.includes('nifty'))
      );

      const livePrice = matchingQuote ? matchingQuote.value : (call.target1 ? (call.entryPrice + (call.target1 - call.entryPrice) * 0.75) : call.entryPrice);
      const pointsDiff = +(livePrice - call.entryPrice).toFixed(2);
      const pctGain = +(((livePrice - call.entryPrice) / (call.entryPrice || 1)) * 100).toFixed(1);

      const isTgt2 = call.target2 ? livePrice >= call.target2 : false;
      const isTgt1 = call.target1 ? livePrice >= call.target1 : false;
      const isSL = call.stopLoss ? livePrice <= call.stopLoss : false;
      const inProfit = pointsDiff > 0;

      return {
        ...call,
        livePrice,
        pointsDiff,
        pctGain,
        isTgt1,
        isTgt2,
        isSL,
        inProfit,
        matchingQuote
      };
    });
  }, [raCalls, quotes]);

  // Filter calls
  const filteredCalls = useMemo(() => {
    return enrichedCalls.filter(call => {
      const matchSearch = call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          call.segment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (call.analystName || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (segmentFilter !== 'all' && !call.segment.toLowerCase().includes(segmentFilter.toLowerCase())) {
        return false;
      }

      if (statusFilter === 'active' && (call.status !== 'ACTIVE' && !call.inProfit)) return false;
      if (statusFilter === 'target1' && !call.isTgt1) return false;
      if (statusFilter === 'target2' && !call.isTgt2) return false;
      if (statusFilter === 'profit' && !call.inProfit) return false;

      return true;
    });
  }, [enrichedCalls, searchQuery, segmentFilter, statusFilter]);

  const handleShareWhatsApp = (call: any) => {
    const text = encodeURIComponent(
      `🔥 *LIVE RA ADVISORY SIGNAL*\n` +
      `⚡ Script: *${call.title}*\n` +
      `📌 Action: *${call.type || 'BUY'}*\n` +
      `💵 Entry: ₹${call.entryPrice}\n` +
      `🎯 TGT 1: ₹${call.target1}\n` +
      `🚀 TGT 2: ₹${call.target2 || 'Open'}\n` +
      `🛑 SL: ₹${call.stopLoss}\n` +
      `📊 Live LTP: ₹${call.livePrice.toFixed(2)} (+${call.pointsDiff} pts / +${call.pctGain}%)\n` +
      `👨‍💼 Analyst: ${call.analystName || 'SEBI Registered RA'}\n\n` +
      `_Trade as per your risk appetite. For official research advisory only._`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCreateNewCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callTitle || !entryPrice || !target1 || !stopLoss) {
      showToast('Please fill in required fields: Script Name, Entry, Target 1, Stop Loss.', 'error');
      return;
    }

    createRACall({
      title: callTitle,
      segment: callSegment as any,
      type: callType,
      callType: callType,
      entryPrice: parseFloat(entryPrice),
      target1: parseFloat(target1),
      target2: target2 ? parseFloat(target2) : +(parseFloat(target1) * 1.05).toFixed(2),
      stopLoss: parseFloat(stopLoss),
      givenBy: currentUser.name || 'SEBI Registered RA',
      givenById: currentUser.id || 'ra-01',
      accessTier: 'all',
      applicableClientsCount: detailedClients.length || 35,
      analystName: currentUser.name || 'Aditya V. Sharma (SEBI RA)',
      analystRegNo: 'INH000008921',
      rationale: rationale || 'Breakout with surge in open interest & volume confirmation.'
    });

    showToast(`✓ Published advisory signal: ${callTitle}`, 'success');
    setIsNewCallOpen(false);
    setCallTitle('');
    setEntryPrice('');
    setTarget1('');
    setTarget2('');
    setStopLoss('');
    setRationale('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCall || !selectedClientId) {
      showToast('Please select a client to record profit booking.', 'error');
      return;
    }

    const client = detailedClients.find(c => c.id === selectedClientId);
    const clientName = client ? client.clientName : 'Client';
    const profitPerUnit = bookingCall.pointsDiff > 0 ? bookingCall.pointsDiff : 15.0;
    const lotSize = (bookingCall as any).lotSize || bookingCall.matchingQuote?.lotSize || 50;
    const totalProfit = +(profitPerUnit * lotSize * bookedLots).toFixed(2);
    const advisoryShare = Math.round(totalProfit * 0.15); // 15% advisory fee

    bookClientPositionAndPayment({
      clientName,
      mobile: client?.mobile || '9988776655',
      scriptName: bookingCall.title,
      entryPrice: bookingCall.entryPrice,
      exitPrice: bookingCall.livePrice,
      lots: bookedLots,
      lotSize,
      totalProfit,
      advisoryAmount: advisoryShare > 0 ? advisoryShare : 1500,
      bank: 'HDFC Bank - 0021',
      screenshotUrl: screenshotUrl || undefined,
      notes: bookingNotes || `Booked profit on ${bookingCall.title}. Client Profit: ₹${totalProfit.toLocaleString('en-IN')}`
    });

    showToast(`✓ Successfully recorded profit booking of ₹${totalProfit.toLocaleString()} for ${clientName}!`, 'success');
    setBookingCall(null);
    setSelectedClientId('');
    setBookedLots(1);
    setBookingNotes('');
    setScreenshotUrl('');
  };

  return (
    <div className="market-ra-calls-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Banner & Action Controls */}
      <div style={{
        background: isDark 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))' 
          : '#ffffff',
        border: isDark 
          ? '1px solid rgba(56, 189, 248, 0.25)' 
          : '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.3))',
              border: '1px solid rgba(249, 115, 22, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={18} style={{ color: '#f97316' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                Research Analyst Live Advisory Board
              </h3>
              <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                SEBI registered real-time option calls tracked dynamically against Kite Connect live feeds
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isManagerOrAnalyst && (
            <button
              type="button"
              onClick={() => setIsNewCallOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)'
              }}
            >
              <Plus size={14} /> Publish Advisory Call
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '0.65rem 1rem',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search option, strike, analyst..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: '0.78rem',
              color: isDark ? '#ffffff' : '#0f172a',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['all', 'nifty', 'banknifty', 'stock option', 'mcx'].map(seg => (
            <button
              key={seg}
              type="button"
              onClick={() => setSegmentFilter(seg)}
              style={{
                background: segmentFilter === seg 
                  ? (isDark ? '#38bdf8' : '#0284c7') 
                  : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
                color: segmentFilter === seg 
                  ? (isDark ? '#0f172a' : '#ffffff') 
                  : (isDark ? '#94a3b8' : '#475569'),
                border: segmentFilter === seg 
                  ? 'none' 
                  : (isDark ? 'none' : '1px solid #e2e8f0'),
                borderRadius: 14,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {seg === 'all' ? 'All Segments' : seg}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Status:</span>
          {['all', 'active', 'profit', 'target1', 'target2'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? '#10b981' : 'transparent',
                color: statusFilter === st ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                border: `1px solid ${statusFilter === st ? '#10b981' : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1')}`,
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {st === 'all' ? 'All' : st === 'profit' ? 'In Profit' : st === 'target1' ? 'TGT 1 Hit' : st === 'target2' ? 'TGT 2 Hit' : 'Active'}
            </button>
          ))}
        </div>
      </div>

      {/* Smooth Scrollable Cards Container */}
      <div 
        className="custom-kite-scrollbar"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1rem',
          maxHeight: 'calc(100vh - 270px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {filteredCalls.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#ffffff',
            border: isDark ? '1px dashed rgba(255, 255, 255, 0.12)' : '1px dashed #cbd5e1',
            borderRadius: 12,
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
            <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isDark ? '#f8fafc' : '#0f172a' }}>No advisory calls match this criteria</div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Switch filters or create a new call above.</div>
          </div>
        ) : (
          filteredCalls.map(call => {
            const entry = call.entryPrice;
            const t1 = call.target1 || entry * 1.1;
            const t2 = call.target2 || entry * 1.2;
            const sl = call.stopLoss || entry * 0.9;
            const span = t2 - sl || 1;
            const progressPct = Math.min(100, Math.max(0, ((call.livePrice - sl) / span) * 100));

            return (
              <div
                key={call.id}
                style={{
                  background: isDark 
                    ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))' 
                    : '#ffffff',
                  border: `1px solid ${call.isTgt2 ? '#10b981' : call.isTgt1 ? (isDark ? 'rgba(56, 189, 248, 0.4)' : '#0284c7') : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0')}`,
                  borderRadius: 12,
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: call.inProfit 
                    ? (isDark ? '0 4px 20px rgba(16, 185, 129, 0.08)' : '0 4px 16px rgba(16, 185, 129, 0.12)') 
                    : (isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.04)'),
                  position: 'relative'
                }}
              >
                {/* Header: Script Name, Call Type, Live LTP */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: call.type === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: call.type === 'BUY' ? '#10b981' : '#ef4444',
                        border: `1px solid ${call.type === 'BUY' ? '#10b981' : '#ef4444'}`,
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: '0.68rem',
                        fontWeight: 800
                      }}>
                        {call.type || 'BUY'}
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {call.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b', background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>
                        {call.segment}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
                      RA: <strong style={{ color: isDark ? '#cbd5e1' : '#0f172a' }}>{call.analystName || 'Aditya Sharma'}</strong> • {call.analystRegNo || 'INH000008921'}
                    </div>
                  </div>

                  {/* Live Price Cell */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: isDark ? '#ffffff' : '#0f172a' }}>
                      ₹{call.livePrice.toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                      color: call.pointsDiff >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {call.pointsDiff >= 0 ? '+' : ''}{call.pointsDiff} ({call.pctGain >= 0 ? '+' : ''}{call.pctGain}%)
                    </div>
                  </div>
                </div>

                {/* Target & Stop Loss Summary Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.4rem',
                  background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f8fafc',
                  border: isDark ? 'none' : '1px solid #e2e8f0',
                  padding: '0.5rem',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Entry</div>
                    <div style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>₹{entry}</div>
                  </div>
                  <div>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Target 1</div>
                    <div style={{ fontWeight: 700, color: call.isTgt1 ? '#10b981' : (isDark ? '#38bdf8' : '#0284c7'), fontFamily: 'var(--font-mono, monospace)' }}>
                      ₹{t1} {call.isTgt1 && '✓'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Target 2</div>
                    <div style={{ fontWeight: 700, color: call.isTgt2 ? '#10b981' : '#f59e0b', fontFamily: 'var(--font-mono, monospace)' }}>
                      ₹{t2} {call.isTgt2 && '🚀'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Stop Loss</div>
                    <div style={{ fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono, monospace)' }}>₹{sl}</div>
                  </div>
                </div>

                {/* Visual Milestone Gauge Bar */}
                <div style={{ position: 'relative', margin: '0.35rem 0' }}>
                  <div style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: call.isTgt2 ? 'linear-gradient(90deg, #38bdf8, #10b981)' : call.isTgt1 ? '#38bdf8' : '#f59e0b',
                      borderRadius: 3,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
                    <span style={{ color: '#ef4444' }}>SL ₹{sl}</span>
                    <span style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>Entry ₹{entry}</span>
                    <span style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>T1 ₹{t1}</span>
                    <span style={{ color: '#10b981' }}>T2 ₹{t2}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                  {call.isTgt2 ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      border: '1px solid #10b981',
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      <Zap size={11} /> TARGET 2 HIT (+₹{(call.pointsDiff * 50).toFixed(0)} / Lot)
                    </span>
                  ) : call.isTgt1 ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.12)',
                      color: isDark ? '#38bdf8' : '#0284c7',
                      border: `1px solid ${isDark ? '#38bdf8' : '#0284c7'}`,
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      <Target size={11} /> TARGET 1 HIT (+₹{(call.pointsDiff * 50).toFixed(0)} / Lot)
                    </span>
                  ) : call.inProfit ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      <TrendingUp size={11} /> IN PROFIT (+{call.pointsDiff} pts)
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                      color: isDark ? '#94a3b8' : '#64748b',
                      padding: '2px 8px',
                      borderRadius: 12
                    }}>
                      <Clock size={11} /> ACCUMULATION ACTIVE
                    </span>
                  )}

                  <span style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Lot: {(call as any).lotSize || call.matchingQuote?.lotSize || 50} Qty
                  </span>
                </div>

                {/* Actions Strip */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  paddingTop: '0.5rem',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0'
                }}>
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(call)}
                    title="Share call signal directly via WhatsApp"
                    style={{
                      flex: 1,
                      background: 'rgba(37, 211, 102, 0.12)',
                      color: '#25d366',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      borderRadius: 6,
                      padding: '6px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={12} /> WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingCall(call)}
                    title="Record profit booking and client payment confirmation"
                    style={{
                      flex: 1.3,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <DollarSign size={12} /> Book Profit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL 1: BOOK CLIENT PROFIT MODAL ── */}
      {bookingCall && (
        <div className="market-modal-backdrop" onClick={() => setBookingCall(null)} style={{
          position: 'fixed',
          inset: 0,
          background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="kite-detail-card" onClick={e => e.stopPropagation()} style={{
            width: '100%',
            maxWidth: '480px',
            background: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${isDark ? '#10b981' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: '1.25rem',
            color: isDark ? '#ffffff' : '#0f172a',
            boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 12px 36px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                  Position Profit Recording
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                  Book Profit: {bookingCall.title}
                </h3>
              </div>
              <button type="button" onClick={() => setBookingCall(null)} style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Math Summary */}
              <div style={{ background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Entry Price</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: isDark ? '#ffffff' : '#0f172a' }}>₹{bookingCall.entryPrice}</div>
                </div>
                <div>
                  <div style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Live Price</div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>₹{bookingCall.livePrice.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Estimated Gain</div>
                  <div style={{ fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>
                    +₹{(Math.max(5, bookingCall.pointsDiff) * (bookingCall.lotSize || 50) * bookedLots).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Client Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>
                  Select Client *
                </label>
                <select
                  required
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  style={{
                    width: '100%',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '8px 10px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.82rem'
                  }}
                >
                  <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>-- Select Subscribed Client --</option>
                  {detailedClients.map(c => (
                    <option key={c.id} value={c.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>
                      {c.clientName} ({c.serviceName || 'Equity / Options'} • {c.mobile})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lots Traded */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>
                  Number of Lots Executed
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={bookedLots}
                  onChange={e => setBookedLots(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '100%',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '8px 10px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>
                  Notes / Payment Mode
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client confirmed position closed via UPI payment"
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '8px 10px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setBookingCall(null)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '9px',
                    borderRadius: 6,
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm & Record Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PUBLISH NEW ADVISORY CALL MODAL ── */}
      {isNewCallOpen && (
        <div className="market-modal-backdrop" onClick={() => setIsNewCallOpen(false)} style={{
          position: 'fixed',
          inset: 0,
          background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="kite-detail-card" onClick={e => e.stopPropagation()} style={{
            width: '100%',
            maxWidth: '520px',
            background: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${isDark ? '#f97316' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: '1.25rem',
            color: isDark ? '#ffffff' : '#0f172a',
            boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 12px 36px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: 800, textTransform: 'uppercase' }}>
                  SEBI Research Analyst Desk
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                  Publish New Advisory Call
                </h3>
              </div>
              <button type="button" onClick={() => setIsNewCallOpen(false)} style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewCall} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>
                  Call / Script Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIFTY 24900 CE [26 SEP] or BANKNIFTY 52000 PE"
                  value={callTitle}
                  onChange={e => setCallTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '8px 10px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>Segment</label>
                  <select
                    value={callSegment}
                    onChange={e => setCallSegment(e.target.value)}
                    style={{
                      width: '100%',
                      background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '8px 10px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="NIFTY OPTION" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>NIFTY OPTION</option>
                    <option value="BANKNIFTY OPTION" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>BANKNIFTY OPTION</option>
                    <option value="FINNIFTY OPTION" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>FINNIFTY OPTION</option>
                    <option value="STOCK OPTION" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>STOCK OPTION</option>
                    <option value="COMMODITY MCX" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>COMMODITY MCX</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>Action</label>
                  <select
                    value={callType}
                    onChange={e => setCallType(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '8px 10px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="BUY" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>BUY CALL</option>
                    <option value="SELL" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>SELL / SHORT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>Entry *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="120.00"
                    value={entryPrice}
                    onChange={e => setEntryPrice(e.target.value)}
                    style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: 6, padding: '6px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>TGT 1 *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="150.00"
                    value={target1}
                    onChange={e => setTarget1(e.target.value)}
                    style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: 6, padding: '6px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>TGT 2</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="190.00"
                    value={target2}
                    onChange={e => setTarget2(e.target.value)}
                    style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: 6, padding: '6px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.25rem' }}>SL *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="95.00"
                    value={stopLoss}
                    onChange={e => setStopLoss(e.target.value)}
                    style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: 6, padding: '6px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.35rem' }}>
                  Trade Rationale / Technical Trigger
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15-min candle breakout with heavy PCR accumulation"
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                  style={{
                    width: '100%',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '8px 10px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewCallOpen(false)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '9px',
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Broadcast Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
