import React, { useState, useEffect, useMemo } from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import { useApp } from '../../state/store';
import { MarketQuote, MarketInstrumentConfig } from '../../types';
import { INITIAL_DETAILED_CLIENTS } from '../../data/clientDatabase';
import {
  TrendingUp,
  TrendingDown,
  RotateCw,
  Clock,
  Activity,
  Share2,
  DollarSign,
  Target,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Sliders,
  X,
  Upload,
  Image as ImageIcon,
  Flame,
  AlertCircle,
  Send,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdvisoryCallDispatchModal } from './AdvisoryCallDispatchModal';

// Mini Sparkline component
const Sparkline: React.FC<{ data?: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 22;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="kite-board-sparkline" aria-hidden="true">
      <polyline
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const SAMPLE_RECEIPTS = [
  {
    id: 'sample-upi-1',
    label: 'UPI Transfer (₹1,500)',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-gpay-2',
    label: 'Google Pay Proof (₹2,500)',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-imps-3',
    label: 'IMPS Bank Confirmation',
    url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80'
  }
];

export const LiveMarketAdvisoryBoard: React.FC = () => {
  const { quotes, isLoading, isRefreshing, lastUpdated, marketStatus, refresh } = useMarketData();
  const {
    role,
    currentUser,
    detailedClients,
    customInstruments,
    addMarketInstrument,
    bookClientPositionAndPayment,
    showToast
  } = useApp();

  // Dispatch Modal State
  const [dispatchQuote, setDispatchQuote] = useState<MarketQuote | null>(null);

  // Booking Modal State
  const [bookingQuote, setBookingQuote] = useState<MarketQuote | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('client-shihab');
  const [customClientName, setCustomClientName] = useState<string>('');
  const [customClientMobile, setCustomClientMobile] = useState<string>('');
  const [lots, setLots] = useState<number>(2);
  const [advisoryFee, setAdvisoryFee] = useState<number>(1500);
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank - 0021');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>(SAMPLE_RECEIPTS[0].url);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Quick Add Trend Modal for Managers
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);

  // Real-time IST Clock
  const [clockStr, setClockStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockStr(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Separate Indices vs Active Options / RA Calls
  const indexQuotes = useMemo(() => {
    return quotes.filter(q => q.type === 'index' || q.type === 'commodity' || q.type === 'forex').slice(0, 4);
  }, [quotes]);

  const optionQuotes = useMemo(() => {
    const ops = quotes.filter(q => q.type === 'option' || q.isCallActive || (q.callType && q.entryPrice));
    if (ops.length > 0) return ops;
    return quotes.slice(0, 4);
  }, [quotes]);

  // Handle WhatsApp Copy
  const handleShareWhatsApp = (q: MarketQuote) => {
    const text = `📈 *STOCKETICS ADVISORY RECOMMENDATION*\n\n` +
      `*Contract:* ${q.label} (${q.exchange || 'NSE'})\n` +
      `*Call:* ${q.callType || 'BUY'} @ ₹${q.entryPrice || q.previousClose}\n` +
      `*Target 1:* ₹${q.target1 || '—'}\n` +
      `*Target 2:* ₹${q.target2 || '—'}\n` +
      `*Stop Loss:* ₹${q.stopLoss || '—'}\n` +
      `*Live Price:* ₹${q.value.toFixed(2)} (${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)} pts / ${q.changePercent.toFixed(2)}%)\n` +
      `*Research Analyst:* ${q.analyst || 'Aditya Roy (RA)'}\n\n` +
      `_Track real-time updates in Stocketics Client Terminal._`;

    navigator.clipboard.writeText(text);
    showToast(`Advisory call for ${q.label} copied! Ready to paste to client on WhatsApp.`, 'success');
  };

  // Open Book Modal
  const openBookingModal = (q: MarketQuote) => {
    setBookingQuote(q);
    const lotSize = q.lotSize || 50;
    const entry = q.entryPrice || (q.value * 0.85);
    const gain = Math.max(0, q.value - entry);
    const estProfit = Math.round(gain * (lots * lotSize));
    const fee = Math.max(1000, Math.round(estProfit * 0.25));
    setAdvisoryFee(fee);
  };

  // Submit Booking
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingQuote) return;

    let cName = customClientName;
    let cMobile = customClientMobile;

    if (selectedClientId !== 'custom') {
      const found = INITIAL_DETAILED_CLIENTS.find(c => c.id === selectedClientId);
      if (found) {
        cName = found.clientName;
        cMobile = found.mobile;
      }
    }

    if (!cName || !cMobile) {
      showToast('Please specify a client name and mobile number', 'warning');
      return;
    }

    const lotSize = bookingQuote.lotSize || 50;
    const entry = bookingQuote.entryPrice || (bookingQuote.value * 0.85);
    const exit = bookingQuote.value;
    const totalProfit = Math.max(0, Math.round((exit - entry) * (lots * lotSize)));

    bookClientPositionAndPayment({
      clientName: cName,
      mobile: cMobile,
      scriptName: bookingQuote.label,
      entryPrice: Number(entry.toFixed(2)),
      exitPrice: Number(exit.toFixed(2)),
      lots: lots,
      lotSize: lotSize,
      totalProfit: totalProfit,
      advisoryAmount: advisoryFee,
      bank: selectedBank,
      screenshotUrl: paymentScreenshotUrl,
      notes: bookingNotes
    });

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });

    setBookingQuote(null);
  };

  // Image Upload Simulation
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentScreenshotUrl(reader.result as string);
      setIsUploading(false);
      showToast('Client payment screenshot attached!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Filter state for options
  const [activeFilter, setActiveFilter] = useState<'all' | 'targets' | 'profit'>('all');

  // Filtered Options
  const filteredOptionQuotes = useMemo(() => {
    return optionQuotes.filter(q => {
      const entry = q.entryPrice || (q.value * 0.85);
      const t1 = q.target1 || (entry * 1.25);
      const t2 = q.target2 || (entry * 1.45);
      const isTgtHit = q.value >= t1 || q.value >= t2;
      const isInProfit = (q.value - entry) > 0;

      if (activeFilter === 'targets') return isTgtHit;
      if (activeFilter === 'profit') return isInProfit;
      return true;
    });
  }, [optionQuotes, activeFilter]);

  const targetsHitCount = useMemo(() => {
    return optionQuotes.filter(q => {
      const entry = q.entryPrice || (q.value * 0.85);
      const t1 = q.target1 || (entry * 1.25);
      const t2 = q.target2 || (entry * 1.45);
      return q.value >= t1 || q.value >= t2;
    }).length;
  }, [optionQuotes]);

  const inProfitCount = useMemo(() => {
    return optionQuotes.filter(q => {
      const entry = q.entryPrice || (q.value * 0.85);
      return (q.value - entry) > 0;
    }).length;
  }, [optionQuotes]);

  return (
    <div className="live-advisory-board live-advisory-rail-terminal card">
      {/* Board Top Header: Compact & Sleek */}
      <div className="live-advisory-header-compact">
        <div className="live-header-compact-left">
          <div className="live-pulse-badge-compact">
            <span className="live-dot-pulse"></span>
            <span className="live-dot-label">
              {marketStatus === 'open' ? 'LIVE NSE/BSE' : 'MARKET SIM'}
            </span>
          </div>
          <h3 className="live-terminal-title">Live RA Terminal</h3>
        </div>

        <div className="live-header-compact-right">
          <span className="live-clock-pill">{clockStr}</span>
          <button
            type="button"
            className={`live-refresh-icon-btn ${isRefreshing ? 'is-spinning' : ''}`}
            onClick={() => refresh()}
            title="Refresh Live Feeds"
          >
            <RotateCw size={12} />
          </button>
          {(role === 'manager' || role === 'hr' || role === 'team_leader') && (
            <button
              type="button"
              className="live-add-trend-btn"
              onClick={() => setIsTrendModalOpen(true)}
              title="Add Trending Contract"
            >
              <Plus size={12} />
              <span>Trend</span>
            </button>
          )}
        </div>
      </div>

      {/* Indices 2x2 Mini Matrix: Compact & High Density */}
      <div className="live-indices-mini-matrix">
        {indexQuotes.map(q => {
          const isUp = q.change >= 0;
          return (
            <div key={q.key} className={`index-compact-pill ${q.tickDirection ? `tick-${q.tickDirection}` : ''}`}>
              <div className="index-compact-top">
                <span className="index-compact-name">{q.label}</span>
                <span className={`index-compact-pct ${isUp ? 'pct-pos' : 'pct-neg'}`}>
                  {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="index-compact-bottom">
                <span className="index-compact-price">
                  {q.currency === 'INR' ? '₹' : '$'}{q.value.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <Sparkline data={q.historicalMiniSeries} isPositive={isUp} />
              </div>
            </div>
          );
        })}
      </div>

      {/* RA Advisory Options Section Header & Filter Tabs */}
      <div className="advisory-options-rail-header">
        <div className="rail-header-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Flame size={15} style={{ color: '#ea580c' }} />
            <span style={{ fontWeight: 800, fontSize: '0.84rem' }}>RA Calls & Options</span>
          </div>
          <span className="rail-active-count">{optionQuotes.length} Active</span>
        </div>

        {/* Interactive Filter Pills */}
        <div className="rail-filter-tabs">
          <button
            type="button"
            className={`rail-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({optionQuotes.length})
          </button>
          <button
            type="button"
            className={`rail-filter-btn ${activeFilter === 'targets' ? 'active' : ''}`}
            onClick={() => setActiveFilter('targets')}
          >
            🎯 Targets Hit ({targetsHitCount})
          </button>
          <button
            type="button"
            className={`rail-filter-btn ${activeFilter === 'profit' ? 'active' : ''}`}
            onClick={() => setActiveFilter('profit')}
          >
            📈 In Profit ({inProfitCount})
          </button>
        </div>
      </div>

      {/* Active Options Scrollable Cards List */}
      <div className="advisory-options-rail-scroll">
        {filteredOptionQuotes.length === 0 ? (
          <div className="rail-empty-state">
            <span>No options match the selected filter.</span>
          </div>
        ) : (
          filteredOptionQuotes.map(q => {
            const isUp = q.change >= 0;
            const entry = q.entryPrice || (q.value * 0.85);
            const t1 = q.target1 || (entry * 1.25);
            const t2 = q.target2 || (entry * 1.45);
            const sl = q.stopLoss || (entry * 0.82);
            const pointsGain = q.value - entry;
            const pctGain = ((q.value - entry) / entry) * 100;
            const isTgt1Hit = q.value >= t1;
            const isTgt2Hit = q.value >= t2;
            const isInProfit = pointsGain > 0;

            // Calculate progress towards T2 (0% to 100%)
            const totalRange = t2 - entry || 1;
            const currentProgress = Math.max(0, Math.min(100, Math.round(((q.value - entry) / totalRange) * 100)));

            const activeClientsCount = detailedClients.filter(c => 
              (c.serviceName || '').toUpperCase().includes(q.serviceSegment || (q.type === 'option' ? 'INDEX OPTION' : 'EQUITY'))
            ).length || 2;

            return (
              <div 
                key={q.key} 
                className={`option-compact-card ${isTgt1Hit ? 'is-target-hit' : ''} ${q.tickDirection ? `tick-${q.tickDirection}` : ''}`}
              >
                {/* Card Top: Symbol, Expiry, Status Pill */}
                <div className="option-compact-head">
                  <div className="option-compact-title-wrap">
                    <span className="option-compact-symbol">{q.label}</span>
                    <span className="option-compact-badge">{q.type === 'option' ? 'OPT' : 'EQ'}</span>
                  </div>

                  <div>
                    {isTgt2Hit ? (
                      <span className="status-compact-chip chip-tgt2">🚀 TGT 2 HIT</span>
                    ) : isTgt1Hit ? (
                      <span className="status-compact-chip chip-tgt1">🎯 TGT 1 HIT</span>
                    ) : isInProfit ? (
                      <span className="status-compact-chip chip-profit">📈 IN PROFIT</span>
                    ) : (
                      <span className="status-compact-chip chip-active">ACTIVE</span>
                    )}
                  </div>
                </div>

                {/* Card Middle: LTP & Live Profit Gain */}
                <div className="option-compact-price-row">
                  <div className="price-left">
                    <span className="price-label">LIVE LTP</span>
                    <div className="price-val-wrap">
                      <span className="price-ltp">₹{q.value.toFixed(2)}</span>
                      <span className={`price-pct ${isUp ? 'pct-pos' : 'pct-neg'}`}>
                        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="price-right">
                    <span className="gain-label">ADVISORY PROFIT</span>
                    <span className={`gain-val ${pointsGain >= 0 ? 'gain-pos' : 'gain-neg'}`}>
                      {pointsGain >= 0 ? '+' : ''}₹{pointsGain.toFixed(1)} pts ({pctGain >= 0 ? '+' : ''}{pctGain.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Visual Target Progress Bar */}
                <div className="option-target-progress-wrap">
                  <div className="target-progress-labels">
                    <span>Entry: ₹{entry.toFixed(0)}</span>
                    <span style={{ color: isTgt1Hit ? '#059669' : 'inherit' }}>T1: ₹{t1.toFixed(0)}</span>
                    <span style={{ color: isTgt2Hit ? '#059669' : 'inherit' }}>T2: ₹{t2.toFixed(0)}</span>
                  </div>
                  <div className="target-progress-track">
                    <div 
                      className={`target-progress-bar ${isTgt2Hit ? 'bar-tgt2' : isTgt1Hit ? 'bar-tgt1' : 'bar-profit'}`} 
                      style={{ width: `${Math.max(5, currentProgress)}%` }}
                    />
                  </div>
                </div>

                {/* Compact Target Grid (Entry, T1, T2, SL) */}
                <div className="option-compact-matrix">
                  <div className="compact-matrix-cell">
                    <span className="cell-lbl">SL</span>
                    <span className="cell-val cell-sl">₹{sl.toFixed(1)}</span>
                  </div>
                  <div className="compact-matrix-cell">
                    <span className="cell-lbl">Entry</span>
                    <span className="cell-val">₹{entry.toFixed(1)}</span>
                  </div>
                  <div className="compact-matrix-cell">
                    <span className="cell-lbl">Tgt 1</span>
                    <span className={`cell-val ${isTgt1Hit ? 'cell-hit' : 'cell-tgt'}`}>
                      ₹{t1.toFixed(1)} {isTgt1Hit ? '✓' : ''}
                    </span>
                  </div>
                  <div className="compact-matrix-cell">
                    <span className="cell-lbl">Tgt 2</span>
                    <span className={`cell-val ${isTgt2Hit ? 'cell-hit' : 'cell-tgt'}`}>
                      ₹{t2.toFixed(1)} {isTgt2Hit ? '✓' : ''}
                    </span>
                  </div>
                </div>

                {/* Active Subscribed Clients Row */}
                <div className="option-compact-client-row">
                  <span 
                    className="compact-client-chip"
                    onClick={() => setDispatchQuote(q)}
                    title="Click to broadcast this call via SMS/Email to matching clients"
                  >
                    <Users size={11} />
                    <span><strong>{activeClientsCount}</strong> Active Clients Subscribed</span>
                  </span>
                  <span className="option-analyst-tag">{q.analyst || 'Aditya Roy (RA)'}</span>
                </div>

                {/* 3 Compact Action Buttons */}
                <div className="option-compact-actions">
                  <button
                    type="button"
                    className="btn-rail-sms-email"
                    onClick={() => setDispatchQuote(q)}
                    title="Dispatch call to active service clients via SMS and Email"
                  >
                    <Send size={11} />
                    <span>SMS/Email</span>
                  </button>

                  <button
                    type="button"
                    className="btn-rail-whatsapp"
                    onClick={() => handleShareWhatsApp(q)}
                    title="Copy WhatsApp formatted advisory text"
                  >
                    <Share2 size={11} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    className="btn-rail-book"
                    onClick={() => openBookingModal(q)}
                    title="Book position for client and record payment screenshot"
                  >
                    <DollarSign size={11} />
                    <span>Book</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Advisory Call Dispatch Modal */}
      {dispatchQuote && (
        <AdvisoryCallDispatchModal
          quote={dispatchQuote}
          onClose={() => setDispatchQuote(null)}
        />
      )}

      {/* Book Profit & Payment Screenshot Modal */}
      {bookingQuote && (
        <div className="modal-backdrop" onClick={() => setBookingQuote(null)}>
          <div className="modal-container book-profit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <DollarSign size={20} style={{ color: '#10b981' }} />
                <div>
                  <h3 className="modal-title">Book Client Position & Confirm Payment</h3>
                  <p className="modal-subtitle">Record executed profit and attach client payment screenshot</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setBookingQuote(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {/* Trade Summary Banner */}
                <div className="booking-trade-summary">
                  <div className="summary-left">
                    <span className="summary-symbol">{bookingQuote.label}</span>
                    <span className="summary-call">{bookingQuote.callType || 'BUY'} • {bookingQuote.exchange || 'NSE NFO'}</span>
                  </div>
                  <div className="summary-right">
                    <div className="summary-stat">
                      <span>Entry</span>
                      <strong>₹{(bookingQuote.entryPrice || bookingQuote.value * 0.85).toFixed(2)}</strong>
                    </div>
                    <div className="summary-stat">
                      <span>Live Exit (LTP)</span>
                      <strong style={{ color: '#10b981' }}>₹{bookingQuote.value.toFixed(2)}</strong>
                    </div>
                    <div className="summary-stat">
                      <span>Gain / Lot</span>
                      <strong style={{ color: '#10b981' }}>
                        +₹{Math.max(0, (bookingQuote.value - (bookingQuote.entryPrice || bookingQuote.value * 0.85)) * (bookingQuote.lotSize || 50)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Client Selection */}
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Select Active Client</label>
                  <select
                    className="form-control"
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                  >
                    {INITIAL_DETAILED_CLIENTS.slice(0, 8).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.clientName} ({c.mobile}) - {c.serviceName}
                      </option>
                    ))}
                    <option value="custom">+ Enter Another Client Details</option>
                  </select>
                </div>

                {selectedClientId === 'custom' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Client Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Ramesh Patel"
                        value={customClientName}
                        onChange={e => setCustomClientName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="10-digit mobile"
                        value={customClientMobile}
                        onChange={e => setCustomClientMobile(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Lots & Profit Calculation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Number of Lots Traded</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-control"
                      value={lots}
                      onChange={e => {
                        const l = Math.max(1, parseInt(e.target.value) || 1);
                        setLots(l);
                        const lotSize = bookingQuote.lotSize || 50;
                        const entry = bookingQuote.entryPrice || (bookingQuote.value * 0.85);
                        const gain = Math.max(0, bookingQuote.value - entry);
                        const profit = Math.round(gain * (l * lotSize));
                        setAdvisoryFee(Math.max(1000, Math.round(profit * 0.25)));
                      }}
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Quantity: {lots * (bookingQuote.lotSize || 50)} units
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Received Advisory Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={advisoryFee}
                      onChange={e => setAdvisoryFee(parseInt(e.target.value) || 0)}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                      Est. Client Net Profit: ₹{Math.round(Math.max(0, (bookingQuote.value - (bookingQuote.entryPrice || bookingQuote.value * 0.85)) * (lots * (bookingQuote.lotSize || 50)))).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Receiving Bank */}
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">Receiving Bank Account</label>
                  <select
                    className="form-control"
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                  >
                    <option value="HDFC Bank - 0021">HDFC Bank (A/C: ****0021 - Current)</option>
                    <option value="ICICI Bank - 4492">ICICI Bank (A/C: ****4492 - Corporate)</option>
                    <option value="SBI Current - 8810">State Bank of India (A/C: ****8810)</option>
                    <option value="Axis Bank - 3319">Axis Bank (A/C: ****3319)</option>
                  </select>
                </div>

                {/* Client Payment Screenshot Upload */}
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">
                    Client Payment Screenshot Proof <span style={{ color: '#10b981' }}>*</span>
                  </label>
                  
                  <div className="screenshot-upload-dropzone">
                    {paymentScreenshotUrl ? (
                      <div className="screenshot-preview-card">
                        <img src={paymentScreenshotUrl} alt="Payment Receipt" className="screenshot-img" />
                        <div className="screenshot-overlay">
                          <span className="screenshot-ok-badge">
                            <CheckCircle2 size={14} /> Receipt Attached
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <Upload size={24} style={{ color: 'var(--stocketics-blue-500)' }} />
                        <span>Upload Client UPI / Bank Screenshot</span>
                      </div>
                    )}

                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <label className="btn-file-upload">
                        <Upload size={13} />
                        <span>{isUploading ? 'Uploading...' : 'Choose File from Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleScreenshotUpload}
                        />
                      </label>

                      {SAMPLE_RECEIPTS.map(sr => (
                        <button
                          key={sr.id}
                          type="button"
                          className="btn-sample-receipt"
                          onClick={() => {
                            setPaymentScreenshotUrl(sr.url);
                            showToast(`Loaded ${sr.label}`, 'info');
                          }}
                        >
                          <ImageIcon size={12} />
                          <span>{sr.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">Advisory Notes / Confirmation Remark</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Client booked Target 1 on NIFTY CE call. Shared screenshot via WhatsApp."
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBookingQuote(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#10b981', borderColor: '#10b981', color: '#ffffff' }}
                >
                  Confirm & Record Confirmed Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Option Trend Modal for Managers */}
      {isTrendModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTrendModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Trending Option to Live Board</h3>
              <button className="modal-close-btn" onClick={() => setIsTrendModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Select an intraday trending strike to immediately push to all employee and team lead live dashboards:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { key: 'nifty_24900_ce', label: 'NIFTY 24900 CE', base: 145.0, call: 'BUY', t1: 190, t2: 225, sl: 120, lot: 50 },
                  { key: 'banknifty_52000_pe', label: 'BANKNIFTY 52000 PE', base: 310.0, call: 'BUY', t1: 380, t2: 440, sl: 260, lot: 15 },
                  { key: 'sensex_82000_ce', label: 'SENSEX 82000 CE', base: 195.0, call: 'BUY', t1: 250, t2: 295, sl: 160, lot: 10 },
                  { key: 'crude_6300_ce', label: 'CRUDE OIL 6300 CE', base: 165.0, call: 'BUY', t1: 220, t2: 265, sl: 135, lot: 100 },
                  { key: 'reliance_3050_ce', label: 'RELIANCE 3050 CE', base: 42.50, call: 'BUY', t1: 58, t2: 72, sl: 34, lot: 250 },
                  { key: 'hdfcbank_1700_ce', label: 'HDFCBANK 1700 CE', base: 28.00, call: 'BUY', t1: 38, t2: 47, sl: 22, lot: 550 },
                ].map(trend => (
                  <button
                    key={trend.key}
                    type="button"
                    className="btn-trend-quick-add"
                    onClick={() => {
                      addMarketInstrument({
                        key: trend.key,
                        label: trend.label,
                        symbol: trend.label,
                        exchange: 'NSE NFO',
                        currency: 'INR',
                        type: 'option',
                        baseValue: trend.base,
                        isCustom: true,
                        callType: 'BUY',
                        entryPrice: trend.base,
                        target1: trend.t1,
                        target2: trend.t2,
                        stopLoss: trend.sl,
                        analyst: currentUser.name,
                        lotSize: trend.lot,
                        enabled: true
                      });
                      setIsTrendModalOpen(false);
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{trend.label}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Base: ₹{trend.base} | Target: ₹{trend.t1} / ₹{trend.t2} | Lot: {trend.lot}
                      </div>
                    </div>
                    <span className="btn-add-pill">+ Add</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsTrendModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
