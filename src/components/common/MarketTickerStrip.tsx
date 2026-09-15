import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import { useApp } from '../../state/store';
import { MarketQuote, MarketInstrumentConfig } from '../../types';
import { INITIAL_DETAILED_CLIENTS } from '../../data/clientDatabase';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RotateCw, 
  Clock, 
  X, 
  Activity,
  Sliders,
  Plus,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Share2,
  DollarSign,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Flame,
  Target,
  ChevronRight,
  Play,
  Pause,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdvisoryCallDispatchModal } from './AdvisoryCallDispatchModal';

/**
 * Format currency value according to instrument currency
 */
function formatMarketValue(value: number, currency: string, type: string): string {
  if (type === 'forex') {
    return `₹${value.toFixed(2)}`;
  }
  if (currency === 'INR') {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Lightweight SVG Sparkline
 */
const MiniSparkline: React.FC<{ data?: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 54;
  const height = 18;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const strokeColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <svg width={width} height={height} className="kite-sparkline" aria-hidden="true">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// Realistic sample payment receipts for one-click testing
const SAMPLE_RECEIPTS = [
  {
    id: 'sample-upi-1',
    label: 'UPI Transfer Receipt (₹1,500)',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-gpay-2',
    label: 'Google Pay Success (₹2,500)',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-imps-3',
    label: 'IMPS Bank Transfer Confirmation',
    url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80'
  }
];

export const MarketTickerStrip: React.FC = () => {
  const { 
    quotes, 
    isLoading, 
    isRefreshing, 
    error, 
    lastUpdated, 
    marketStatus, 
    refresh, 
    hasAccess 
  } = useMarketData();

  const { 
    role, 
    currentUser, 
    customInstruments, 
    addMarketInstrument, 
    removeMarketInstrument, 
    toggleInstrumentVisibility, 
    bookClientPositionAndPayment,
    tradingDisplayConfig,
    updateTradingDisplayConfig,
    showToast 
  } = useApp();

  const isBoxLayout = tradingDisplayConfig?.mode === 'boxes';

  // Marquee pause state (hover or manual button)
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Modals state
  const [selectedQuote, setSelectedQuote] = useState<MarketQuote | null>(null);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isCallsDrawerOpen, setIsCallsDrawerOpen] = useState(false);
  const [bookingCallQuote, setBookingCallQuote] = useState<MarketQuote | null>(null);
  const [dispatchCallQuote, setDispatchCallQuote] = useState<MarketQuote | null>(null);

  // Booking Form State
  const [selectedClientId, setSelectedClientId] = useState<string>('client-shihab');
  const [customClientName, setCustomClientName] = useState<string>('');
  const [customClientMobile, setCustomClientMobile] = useState<string>('');
  const [lots, setLots] = useState<number>(2);
  const [advisoryFee, setAdvisoryFee] = useState<number>(1500);
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank - 0021');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>(SAMPLE_RECEIPTS[0].url);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // New Custom Stock/Option Form in Manager Modal
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [newStockLabel, setNewStockLabel] = useState('');
  const [newStockType, setNewStockType] = useState<'option' | 'stock' | 'index' | 'commodity' | 'forex'>('option');
  const [newStockExchange, setNewStockExchange] = useState('NSE NFO');
  const [newStockBasePrice, setNewStockBasePrice] = useState('185.00');
  const [newStockCallType, setNewStockCallType] = useState<'BUY' | 'SELL'>('BUY');
  const [newStockEntryPrice, setNewStockEntryPrice] = useState('160.00');
  const [newStockTarget1, setNewStockTarget1] = useState('210.00');
  const [newStockTarget2, setNewStockTarget2] = useState('245.00');
  const [newStockStopLoss, setNewStockStopLoss] = useState('135.00');
  const [newStockAnalyst, setNewStockAnalyst] = useState('Aditya Roy (RA)');
  const [newStockLotSize, setNewStockLotSize] = useState('50');

  // Real-time IST Clock
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Market ticker strip is visible across all CRM dashboards

  const isMarketOpen = marketStatus === 'open';
  const canManageTicker = role === 'manager' || role === 'hr' || role === 'team_leader';

  // Active RA advisory calls
  const activeAdvisoryQuotes = useMemo(() => {
    return quotes.filter(q => q.isCallActive || q.type === 'option' || (q.callType && q.entryPrice));
  }, [quotes]);

  // Handle Share Call with Client via WhatsApp
  const handleShareCall = (quote: MarketQuote) => {
    const message = `📈 *STOCKETICS ADVISORY RECOMMENDATION*\n\n` +
      `*Script:* ${quote.label} (${quote.exchange || 'NSE'})\n` +
      `*Action:* ${quote.callType || 'BUY'} @ ₹${quote.entryPrice || quote.previousClose}\n` +
      `*Target 1:* ₹${quote.target1 || '—'}\n` +
      `*Target 2:* ₹${quote.target2 || '—'}\n` +
      `*Stop Loss:* ₹${quote.stopLoss || '—'}\n` +
      `*Current Live Market:* ₹${quote.value.toFixed(2)} (${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} pts / ${quote.changePercent.toFixed(2)}%)\n` +
      `*Research Analyst:* ${quote.analyst || 'Aditya Roy (RA)'}\n\n` +
      `_Watch live updates in Stocketics Client Terminal._`;

    navigator.clipboard.writeText(message);
    showToast(`Advisory call for ${quote.label} copied! Ready to send to client via WhatsApp.`, 'success');
  };

  // Open Book Profit Modal
  const openBookProfit = (quote: MarketQuote) => {
    setBookingCallQuote(quote);
    const entry = quote.entryPrice || quote.previousClose;
    const current = quote.value;
    const lotSize = quote.lotSize || (quote.label.includes('BANKNIFTY') ? 15 : 50);
    const qty = lots * lotSize;
    const profit = Math.max(0, (current - entry) * qty);
    setAdvisoryFee(Math.round(profit > 0 ? profit * 0.25 : 1500));
  };

  // Confirm Book Profit & Record Payment
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCallQuote) return;

    let clientName = customClientName;
    let clientMobile = customClientMobile;

    if (selectedClientId !== 'custom') {
      const found = INITIAL_DETAILED_CLIENTS.find(c => c.id === selectedClientId);
      if (found) {
        clientName = found.clientName;
        clientMobile = found.mobile;
      }
    }

    if (!clientName.trim()) {
      showToast('Please specify the client name.', 'warning');
      return;
    }

    const entry = bookingCallQuote.entryPrice || bookingCallQuote.previousClose;
    const exit = bookingCallQuote.value;
    const lotSize = bookingCallQuote.lotSize || (bookingCallQuote.label.includes('BANKNIFTY') ? 15 : 50);
    const totalQty = lots * lotSize;
    const totalProfit = Math.round((exit - entry) * totalQty);

    bookClientPositionAndPayment({
      clientName,
      mobile: clientMobile || '+91 70128 26397',
      scriptName: bookingCallQuote.label,
      entryPrice: entry,
      exitPrice: exit,
      lots,
      lotSize,
      totalProfit,
      advisoryAmount: Number(advisoryFee) || 1500,
      bank: selectedBank,
      screenshotUrl: paymentScreenshotUrl,
      notes: bookingNotes
    });

    setBookingCallQuote(null);
  };

  // Handle local screenshot image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setPaymentScreenshotUrl(uploadEvent.target.result as string);
        showToast('Payment screenshot attached successfully!', 'success');
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Adding New Trending Stock/Option in Manager Modal
  const handleAddCustomInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockSymbol.trim()) {
      showToast('Please enter a valid stock/option symbol.', 'warning');
      return;
    }

    const key = newStockSymbol.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const label = newStockLabel.trim() || newStockSymbol.trim().toUpperCase();
    const baseValue = parseFloat(newStockBasePrice) || 100;
    const entryPrice = parseFloat(newStockEntryPrice) || baseValue;
    const target1 = parseFloat(newStockTarget1) || +(baseValue * 1.25).toFixed(2);
    const target2 = parseFloat(newStockTarget2) || +(baseValue * 1.5).toFixed(2);
    const stopLoss = parseFloat(newStockStopLoss) || +(baseValue * 0.85).toFixed(2);

    const newInst: MarketInstrumentConfig = {
      key,
      label,
      symbol: `${newStockExchange}:${label}`,
      type: newStockType,
      currency: 'INR',
      exchange: newStockExchange,
      enabled: true,
      baseValue,
      callType: newStockCallType,
      entryPrice,
      target1,
      target2,
      stopLoss,
      analyst: newStockAnalyst || currentUser.name,
      lotSize: parseInt(newStockLotSize) || 50,
      isCustom: true
    };

    addMarketInstrument(newInst);
    setNewStockSymbol('');
    setNewStockLabel('');
    showToast(`Added ${label} to live ticker!`, 'success');
  };

  // Quick 1-click Preset Add
  const handleQuickAddPreset = (preset: { label: string; symbol: string; type: any; base: number; entry?: number; t1?: number; t2?: number; sl?: number; exchange: string }) => {
    const key = preset.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newInst: MarketInstrumentConfig = {
      key,
      label: preset.label,
      symbol: preset.symbol,
      type: preset.type,
      currency: 'INR',
      exchange: preset.exchange,
      enabled: true,
      baseValue: preset.base,
      callType: preset.entry ? 'BUY' : undefined,
      entryPrice: preset.entry,
      target1: preset.t1,
      target2: preset.t2,
      stopLoss: preset.sl,
      analyst: 'Aditya Roy (RA)',
      lotSize: preset.label.includes('BANKNIFTY') ? 15 : 50,
      isCustom: true
    };
    addMarketInstrument(newInst);
  };

  // Duplicate quotes array for continuous smooth infinite scrolling
  const marqueeQuotes = useMemo(() => {
    if (quotes.length === 0) return [];
    return [...quotes, ...quotes];
  }, [quotes]);

  return (
    <section className="kite-ticker-wrapper" aria-label="Live Market Ticker">
      {/* ── 1. Left Controls & Operational Status ── */}
      <div className="kite-ticker-status-segment">
        <div className="kite-status-indicator" title={isMarketOpen ? 'Indian Market Open (NSE/BSE)' : 'Market Closed (After Hours/Weekend)'}>
          <span className={`kite-pulse-dot ${isMarketOpen ? 'dot-open' : 'dot-closed'}`} />
          <span className="kite-status-text">
            {isMarketOpen ? 'LIVE' : 'CLOSED'}
          </span>
        </div>

        <div className="kite-time-display" title="Indian Standard Time">
          <Clock size={11} className="kite-time-icon" />
          <span>{currentTimeStr || '10:00:00 IST'}</span>
        </div>

        {/* Play / Pause marquee scroll */}
        <button
          type="button"
          className="kite-btn-icon"
          onClick={() => setIsPaused(prev => !prev)}
          title={isPaused ? 'Resume live ticker scroll' : 'Pause ticker scroll'}
          aria-label={isPaused ? 'Resume ticker scroll' : 'Pause ticker scroll'}
        >
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
        </button>

        {/* Refresh feed */}
        <button
          type="button"
          className="kite-btn-icon"
          onClick={() => refresh()}
          disabled={isRefreshing || isLoading}
          title="Refresh market rates safely"
          aria-label="Refresh market indicators"
        >
          <RotateCw size={12} className={isRefreshing ? 'spin-anim' : ''} />
        </button>
      </div>

      {/* ── 2. Center Infinite Scrolling Marquee Track ── */}
      <div 
        className="kite-marquee-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isLoading && quotes.length === 0 && (
          <div className="kite-ticker-loading">
            <span className="spin-anim" style={{ display: 'inline-block' }}><RotateCw size={13} /></span>
            <span>Connecting to live exchange rates...</span>
          </div>
        )}

        {error && quotes.length === 0 && (
          <div className="kite-ticker-error">
            <AlertCircle size={13} />
            <span>Feed disconnected.</span>
            <button type="button" onClick={() => refresh()} className="kite-error-retry">Retry</button>
          </div>
        )}

        {isBoxLayout ? (
          <div 
            className="kite-box-layout-container" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              overflowX: 'auto', 
              padding: '2px 4px',
              scrollbarWidth: 'thin'
            }}
          >
            {quotes.map((quote) => {
              const isPositive = quote.change > 0;
              const isNegative = quote.change < 0;
              const hasCall = !!quote.isCallActive || quote.type === 'option' || (quote.callType && quote.entryPrice);
              const isProfitAchieved = !!quote.profitAchieved;

              return (
                <div
                  key={quote.key}
                  className="kite-box-item"
                  onClick={() => setSelectedQuote(quote)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${hasCall ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: 8,
                    padding: '4px 10px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  title={`Click to view ${quote.label} details`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8' }}>
                        {quote.exchange || quote.type.toUpperCase()}
                      </span>
                      <strong style={{ fontSize: '0.78rem', color: '#fff' }}>{quote.label}</strong>
                      {hasCall && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, background: isProfitAchieved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(249, 115, 22, 0.2)', color: isProfitAchieved ? '#10b981' : '#f97316', padding: '1px 5px', borderRadius: 4 }}>
                          {isProfitAchieved ? 'TGT HIT' : (quote.callType || 'CALL')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>
                        {formatMarketValue(quote.value, quote.currency, quote.type)}
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: isPositive ? '#10b981' : isNegative ? '#ef4444' : '#94a3b8' }}>
                        {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <MiniSparkline data={quote.historicalMiniSeries} isPositive={isPositive} />
                </div>
              );
            })}
          </div>
        ) : (
          marqueeQuotes.length > 0 && (
            <div 
              className={`kite-marquee-track ${isPaused || isHovered ? 'track-paused' : ''}`}
            >
              {marqueeQuotes.map((quote, idx) => {
                const isPositive = quote.change > 0;
                const isNegative = quote.change < 0;
                const hasCall = !!quote.isCallActive || quote.type === 'option' || (quote.callType && quote.entryPrice);
                const isProfitAchieved = !!quote.profitAchieved;
                const tickClass = quote.tickDirection === 'up' ? 'flash-tick-up' : quote.tickDirection === 'down' ? 'flash-tick-down' : '';

                return (
                  <div
                    key={`${quote.key}-${idx}`}
                    className={`kite-ticker-item ${tickClass} ${hasCall ? 'item-has-call' : ''}`}
                    onClick={() => setSelectedQuote(quote)}
                    tabIndex={0}
                    role="button"
                    title={`Click to view ${quote.label} details or book client position`}
                  >
                    {/* Exchange badge */}
                    <span className="kite-item-exchange">{quote.exchange || quote.type.toUpperCase()}</span>

                    {/* Script Name */}
                    <span className="kite-item-name">{quote.label}</span>

                    {/* Active RA Call / Profit Chip */}
                    {hasCall && (
                      <span className={`kite-call-chip ${isProfitAchieved ? 'chip-profit' : 'chip-call'}`}>
                        {isProfitAchieved ? (
                          <>
                            <Target size={10} />
                            <span>TGT HIT (+{quote.percentageGain?.toFixed(1) || '28'}%)</span>
                          </>
                        ) : (
                          <>
                            <Flame size={10} />
                            <span>BUY @ {quote.entryPrice}</span>
                          </>
                        )}
                      </span>
                    )}

                    {/* LTP (Last Traded Price) */}
                    <span className="kite-item-price mono-cell">
                      {formatMarketValue(quote.value, quote.currency, quote.type)}
                    </span>

                    {/* Points & Percentage Delta */}
                    <span className={`kite-item-delta mono-cell ${isPositive ? 'delta-positive' : isNegative ? 'delta-negative' : 'delta-neutral'}`}>
                      {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                    </span>

                    {/* Micro Sparkline */}
                    <MiniSparkline data={quote.historicalMiniSeries} isPositive={isPositive} />
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ── 3. Right Action Controls (RA Calls Drawer & Manager Ticker Customization) ── */}
      <div className="kite-ticker-actions-segment">
        {/* Toggle Ticker vs Box Layout */}
        <button
          type="button"
          onClick={() => updateTradingDisplayConfig({ mode: isBoxLayout ? 'ticker' : 'boxes' })}
          className="kite-btn-icon"
          title={isBoxLayout ? 'Switch to Scrolling Marquee' : 'Switch to Box Cards Layout'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 6,
            background: isBoxLayout ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: isBoxLayout ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
            color: isBoxLayout ? '#38bdf8' : '#94a3b8',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isBoxLayout ? 'Boxes' : 'Ticker'}
        </button>

        {/* Active Calls Quick Trigger */}
        <button
          type="button"
          className="kite-btn-call-trigger"
          onClick={() => setIsCallsDrawerOpen(prev => !prev)}
          title="View active Research Analyst calls & profit tracking"
        >
          <Target size={13} className="kite-action-icon" />
          <span className="kite-action-label">RA Calls</span>
          <span className="kite-count-pill">{activeAdvisoryQuotes.length}</span>
        </button>

        {/* Manager Stock / Ticker Customization Button */}
        {canManageTicker && (
          <button
            type="button"
            className="kite-btn-manage-trigger"
            onClick={() => setIsManagerModalOpen(true)}
            title="Manager Controls: Add or remove stocks & options according to trend"
          >
            <Sliders size={13} />
            <span className="kite-action-label">Manage Stocks</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 1: INTERACTIVE STOCK / OPTION DETAIL MODAL
      ══════════════════════════════════════════════════════════════ */}
      {selectedQuote && (
        <div className="market-modal-backdrop" onClick={() => setSelectedQuote(null)}>
          <div className="market-modal-card kite-detail-card" onClick={e => e.stopPropagation()}>
            <div className="market-modal-header">
              <div>
                <div className="market-modal-symbol">{selectedQuote.symbol} • {selectedQuote.exchange || 'EXCHANGE'}</div>
                <h3 className="market-modal-title">{selectedQuote.label}</h3>
              </div>
              <button 
                type="button" 
                className="market-modal-close" 
                onClick={() => setSelectedQuote(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            {/* Price & Change Banner */}
            <div className="market-modal-price-box">
              <div className="market-modal-price">
                {formatMarketValue(selectedQuote.value, selectedQuote.currency, selectedQuote.type)}
              </div>
              <div className={`market-modal-delta ${selectedQuote.change >= 0 ? 'delta-positive' : 'delta-negative'}`}>
                {selectedQuote.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>
                  {selectedQuote.change >= 0 ? '+' : ''}{selectedQuote.change.toFixed(2)} ({selectedQuote.change >= 0 ? '+' : ''}{selectedQuote.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* If RA Call Active: Show Advisory Specification Card */}
            {(selectedQuote.callType || selectedQuote.entryPrice || selectedQuote.type === 'option') && (
              <div className="kite-call-summary-box">
                <div className="kite-call-summary-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color="var(--stocketics-blue-600)" />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Active Research Analyst Recommendation</span>
                  </div>
                  {selectedQuote.profitAchieved && (
                    <span className="badge-profit-pill">
                      🎯 Target Hit (+{selectedQuote.percentageGain?.toFixed(1) || '28.7'}%)
                    </span>
                  )}
                </div>

                <div className="kite-call-metrics-grid">
                  <div className="kite-metric-item">
                    <span className="label">Entry Price</span>
                    <span className="value mono-cell">₹{selectedQuote.entryPrice || selectedQuote.previousClose}</span>
                  </div>
                  <div className="kite-metric-item">
                    <span className="label">Target 1</span>
                    <span className="value mono-cell" style={{ color: 'var(--success)' }}>₹{selectedQuote.target1 || '—'}</span>
                  </div>
                  <div className="kite-metric-item">
                    <span className="label">Target 2</span>
                    <span className="value mono-cell" style={{ color: 'var(--success)' }}>₹{selectedQuote.target2 || '—'}</span>
                  </div>
                  <div className="kite-metric-item">
                    <span className="label">Stop Loss</span>
                    <span className="value mono-cell" style={{ color: 'var(--danger)' }}>₹{selectedQuote.stopLoss || '—'}</span>
                  </div>
                  <div className="kite-metric-item">
                    <span className="label">Current Points Gain</span>
                    <span className="value mono-cell" style={{ color: selectedQuote.pointsGain && selectedQuote.pointsGain >= 0 ? 'var(--success)' : 'inherit' }}>
                      {selectedQuote.pointsGain ? `${selectedQuote.pointsGain >= 0 ? '+' : ''}${selectedQuote.pointsGain} pts` : '—'}
                    </span>
                  </div>
                  <div className="kite-metric-item">
                    <span className="label">Analyst</span>
                    <span className="value">{selectedQuote.analyst || 'Aditya Roy (RA)'}</span>
                  </div>
                </div>

                {/* Advisory Actions: Share with Client & Book Position */}
                <div className="kite-call-actions-row">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-dispatch-sms-email"
                    onClick={() => {
                      const q = selectedQuote;
                      setSelectedQuote(null);
                      setDispatchCallQuote(q);
                    }}
                    title="Dispatch call to active service clients via SMS and Email"
                    style={{ borderColor: '#0284c7', color: '#0284c7' }}
                  >
                    <Send size={14} />
                    <span>Dispatch SMS / Email</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleShareCall(selectedQuote)}
                  >
                    <Share2 size={14} />
                    <span>Share WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedQuote(null);
                      openBookProfit(selectedQuote);
                    }}
                  >
                    <DollarSign size={14} />
                    <span>Book Position for Client</span>
                  </button>
                </div>
              </div>
            )}

            {/* Standard 2x2 Key Data Grid */}
            <div className="market-modal-grid">
              <div className="market-modal-stat">
                <span className="stat-name">Previous Close</span>
                <span className="stat-val">{formatMarketValue(selectedQuote.previousClose, selectedQuote.currency, selectedQuote.type)}</span>
              </div>
              <div className="market-modal-stat">
                <span className="stat-name">Day High</span>
                <span className="stat-val">{selectedQuote.high ? formatMarketValue(selectedQuote.high, selectedQuote.currency, selectedQuote.type) : '—'}</span>
              </div>
              <div className="market-modal-stat">
                <span className="stat-name">Day Low</span>
                <span className="stat-val">{selectedQuote.low ? formatMarketValue(selectedQuote.low, selectedQuote.currency, selectedQuote.type) : '—'}</span>
              </div>
              <div className="market-modal-stat">
                <span className="stat-name">Feed Source</span>
                <span className="stat-val" style={{ fontSize: '0.78rem' }}>{selectedQuote.provider}</span>
              </div>
            </div>

            <div className="market-modal-footer">
              <div className="market-modal-meta">
                <Clock size={12} />
                <span>As of {new Date(selectedQuote.asOf).toLocaleTimeString('en-GB')} • Mode: {selectedQuote.dataStatus.toUpperCase()}</span>
              </div>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedQuote(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 2: RA ADVISORY CALLS DRAWER (EMPLOYEE & TEAM LEAD)
      ══════════════════════════════════════════════════════════════ */}
      {isCallsDrawerOpen && (
        <div className="market-modal-backdrop" onClick={() => setIsCallsDrawerOpen(false)}>
          <div className="kite-drawer-card" onClick={e => e.stopPropagation()}>
            <div className="kite-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={18} color="var(--stocketics-blue-600)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Research Analyst Advisory Calls</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Live market prices, option profit tracking, and client position booking
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="market-modal-close" 
                onClick={() => setIsCallsDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="kite-drawer-body">
              {activeAdvisoryQuotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                  <p>No active calls placed right now. Manager or RA will broadcast new calls as trends develop.</p>
                </div>
              ) : (
                activeAdvisoryQuotes.map(call => {
                  const isProfit = !!call.profitAchieved;
                  const pts = call.pointsGain || (call.value - call.previousClose);

                  return (
                    <div key={call.key} className="kite-call-card-item">
                      <div className="kite-call-card-top">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="kite-call-type-tag">{call.callType || 'BUY'}</span>
                            <span className="kite-call-script-name">{call.label}</span>
                            <span className="kite-call-exchange-tag">{call.exchange || 'NSE'}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Analyst: <strong>{call.analyst || 'Aditya Roy (RA)'}</strong> • Lot: {call.lotSize || 50} Qty
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className="kite-call-ltp mono-cell">
                            ₹{call.value.toFixed(2)}
                          </div>
                          <div className={`kite-call-gain mono-cell ${pts >= 0 ? 'delta-positive' : 'delta-negative'}`}>
                            {pts >= 0 ? '+' : ''}{pts.toFixed(2)} pts ({call.percentageGain ? `${call.percentageGain >= 0 ? '+' : ''}${call.percentageGain.toFixed(1)}%` : `${call.changePercent.toFixed(1)}%`})
                          </div>
                        </div>
                      </div>

                      {/* Targets & SL bar */}
                      <div className="kite-call-targets-bar">
                        <div>Entry: <strong>₹{call.entryPrice || call.previousClose}</strong></div>
                        <div>TGT 1: <strong style={{ color: 'var(--success)' }}>₹{call.target1 || '—'}</strong></div>
                        <div>TGT 2: <strong style={{ color: 'var(--success)' }}>₹{call.target2 || '—'}</strong></div>
                        <div>SL: <strong style={{ color: 'var(--danger)' }}>₹{call.stopLoss || '—'}</strong></div>
                      </div>

                      {/* Status indicator */}
                      <div className="kite-call-status-row">
                        {isProfit ? (
                          <div className="kite-profit-pill-lg">
                            <Target size={13} />
                            <span>TARGET ACHIEVED • IN PROFIT</span>
                          </div>
                        ) : (
                          <div className="kite-open-pill-lg">
                            <Activity size={13} />
                            <span>POSITION ACTIVE • TRACKING LIVE</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm btn-dispatch-sms-email"
                            onClick={() => {
                              setIsCallsDrawerOpen(false);
                              setDispatchCallQuote(call);
                            }}
                            title="Dispatch call to active service clients via SMS and Email"
                            style={{ borderColor: '#0284c7', color: '#0284c7' }}
                          >
                            <Send size={13} />
                            <span>SMS / Email</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleShareCall(call)}
                            title="Share formatted advisory text to WhatsApp"
                          >
                            <Share2 size={13} />
                            <span>Share Client</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setIsCallsDrawerOpen(false);
                              openBookProfit(call);
                            }}
                          >
                            <DollarSign size={13} />
                            <span>Book Profit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 3: BOOK PROFIT & CLIENT PAYMENT SCREENSHOT UPLOADER
      ══════════════════════════════════════════════════════════════ */}
      {bookingCallQuote && (
        <div className="market-modal-backdrop" onClick={() => setBookingCallQuote(null)}>
          <div className="market-modal-card kite-booking-modal" onClick={e => e.stopPropagation()}>
            <div className="market-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                  <DollarSign size={18} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Profit Booking & Payment Confirmation</span>
                </div>
                <h3 className="market-modal-title">Book Client Position: {bookingCallQuote.label}</h3>
              </div>
              <button 
                type="button" 
                className="market-modal-close" 
                onClick={() => setBookingCallQuote(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="kite-booking-form">
              {/* Live Position Math Summary */}
              {(() => {
                const entry = bookingCallQuote.entryPrice || bookingCallQuote.previousClose;
                const exit = bookingCallQuote.value;
                const lotSize = bookingCallQuote.lotSize || (bookingCallQuote.label.includes('BANKNIFTY') ? 15 : 50);
                const totalQty = lots * lotSize;
                const totalGrossProfit = Math.round((exit - entry) * totalQty);

                return (
                  <div className="kite-booking-summary-banner">
                    <div className="summary-col">
                      <span className="label">Entry Price</span>
                      <span className="val mono-cell">₹{entry.toFixed(2)}</span>
                    </div>
                    <div className="summary-col">
                      <span className="label">Live Exit Price</span>
                      <span className="val mono-cell" style={{ color: 'var(--success)' }}>₹{exit.toFixed(2)}</span>
                    </div>
                    <div className="summary-col">
                      <span className="label">Quantity</span>
                      <span className="val mono-cell">{totalQty} ({lots} Lots)</span>
                    </div>
                    <div className="summary-col">
                      <span className="label">Client Gross Profit</span>
                      <span className="val mono-cell profit-highlight">
                        ₹{totalGrossProfit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Client Selection */}
              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="field-label">Select Client from Database *</label>
                  <select 
                    className="select-input"
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                  >
                    {INITIAL_DETAILED_CLIENTS.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.clientName} ({client.mobile}) • {client.response}
                      </option>
                    ))}
                    <option value="custom">+ Custom / New Client</option>
                  </select>
                </div>

                <div className="form-group" style={{ width: '110px' }}>
                  <label className="field-label">Lots *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    className="text-input" 
                    value={lots}
                    onChange={e => setLots(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
              </div>

              {/* Custom Client Name & Phone if custom */}
              {selectedClientId === 'custom' && (
                <div className="form-group-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="field-label">Client Full Name *</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. Ramesh Chandra" 
                      value={customClientName} 
                      onChange={e => setCustomClientName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="field-label">Mobile Number *</label>
                    <input 
                      type="tel" 
                      className="text-input" 
                      placeholder="e.g. 9820011223" 
                      value={customClientMobile} 
                      onChange={e => setCustomClientMobile(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              )}

              {/* Payment Details: Advisory Fee & Bank */}
              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="field-label">Advisory Profit-Share Fee (₹) *</label>
                  <input 
                    type="number" 
                    className="text-input" 
                    value={advisoryFee}
                    onChange={e => setAdvisoryFee(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="field-label">Company Credit Bank *</label>
                  <select 
                    className="select-input"
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                  >
                    <option value="HDFC Bank - 0021">HDFC Bank (A/C: 002194821)</option>
                    <option value="ICICI Bank - 4402">ICICI Bank (A/C: 440219401)</option>
                    <option value="State Bank of India - 1109">State Bank of India (A/C: 1109482)</option>
                    <option value="Axis Bank - 9918">Axis Bank (A/C: 991823719)</option>
                  </select>
                </div>
              </div>

              {/* Client Payment Screenshot Upload & Preview */}
              <div className="form-group">
                <label className="field-label">
                  Client Payment Screenshot Proof * (Uploaded by Client after profit)
                </label>
                
                <div className="kite-upload-area">
                  <div className="upload-options-bar">
                    <label className="btn btn-secondary btn-sm file-upload-btn">
                      <Upload size={13} />
                      <span>{isUploading ? 'Uploading...' : 'Upload Screenshot (PNG/JPG)'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload} 
                      />
                    </label>

                    {/* Quick Demo Screenshot Presets for One-Click Testing */}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>or choose preset:</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {SAMPLE_RECEIPTS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`btn-tag-chip ${paymentScreenshotUrl === preset.url ? 'active' : ''}`}
                          onClick={() => setPaymentScreenshotUrl(preset.url)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Preview */}
                  {paymentScreenshotUrl && (
                    <div className="screenshot-preview-container">
                      <img 
                        src={paymentScreenshotUrl} 
                        alt="Client Payment Screenshot" 
                        className="screenshot-preview-img" 
                      />
                      <div className="screenshot-preview-badge">
                        <CheckCircle2 size={12} />
                        <span>Screenshot Verified</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="field-label">Internal Advisor Notes</label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="e.g. Client called and shared screenshot on WhatsApp; confirmed credit in HDFC Bank"
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                />
              </div>

              {/* Modal Actions */}
              <div className="kite-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setBookingCallQuote(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#10b981', borderColor: '#059669' }}
                >
                  <CheckCircle2 size={15} />
                  <span>Confirm & Record Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 4: MANAGER DYNAMIC TICKER CUSTOMIZATION MODAL
      ══════════════════════════════════════════════════════════════ */}
      {isManagerModalOpen && (
        <div className="market-modal-backdrop" onClick={() => setIsManagerModalOpen(false)}>
          <div className="market-modal-card kite-manager-modal" onClick={e => e.stopPropagation()}>
            <div className="market-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--stocketics-blue-600)' }}>
                  <Sliders size={18} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Manager Trend Controls</span>
                </div>
                <h3 className="market-modal-title">Manage Live Market Ticker & Trending Stocks</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Add or remove stocks and options according to the intraday market trend for all employees.
                </p>
              </div>
              <button 
                type="button" 
                className="market-modal-close" 
                onClick={() => setIsManagerModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="kite-manager-body">
              {/* 1-Click Trending Watchlist Presets */}
              <div className="kite-preset-section">
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  🔥 1-Click Add Trending Watchlist Picks:
                </div>
                <div className="kite-preset-chips">
                  {[
                    { label: 'NIFTY 24900 CE', symbol: 'NSE:NIFTY24SEP24900CE', type: 'option' as const, base: 145.00, entry: 120.00, t1: 170.00, t2: 210.00, sl: 95.00, exchange: 'NSE NFO' },
                    { label: 'BANKNIFTY 52000 PE', symbol: 'NSE:BANKNIFTY24SEP52000PE', type: 'option' as const, base: 260.00, entry: 215.00, t1: 310.00, t2: 365.00, sl: 175.00, exchange: 'NSE NFO' },
                    { label: 'SENSEX 82000 CE', symbol: 'BSE:SENSEX24SEP82000CE', type: 'option' as const, base: 290.00, entry: 240.00, t1: 350.00, t2: 410.00, sl: 190.00, exchange: 'BSE BFO' },
                    { label: 'HDFC BANK', symbol: 'NSE:HDFCBANK', type: 'stock' as const, base: 1640.50, exchange: 'NSE' },
                    { label: 'INFY', symbol: 'NSE:INFY', type: 'stock' as const, base: 1890.20, exchange: 'NSE' },
                    { label: 'TATA MOTORS', symbol: 'NSE:TATAMOTORS', type: 'stock' as const, base: 975.40, exchange: 'NSE' },
                    { label: 'GOLD OCT FUT', symbol: 'MCX:GOLD', type: 'commodity' as const, base: 72450.00, exchange: 'MCX' },
                  ].map(pick => (
                    <button
                      key={pick.label}
                      type="button"
                      className="kite-quick-add-btn"
                      onClick={() => handleQuickAddPreset(pick)}
                    >
                      <Plus size={11} />
                      <span>{pick.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Stock / Option Form */}
              <form onSubmit={handleAddCustomInstrument} className="kite-add-instrument-card">
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  + Add Custom Stock or Option Contract
                </div>

                <div className="form-group-row">
                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label className="field-label">Symbol / Script Name *</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. NIFTY 24900 CE or INFY" 
                      value={newStockSymbol} 
                      onChange={e => {
                        setNewStockSymbol(e.target.value);
                        if (!newStockLabel) setNewStockLabel(e.target.value);
                      }} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="field-label">Instrument Type</label>
                    <select 
                      className="select-input"
                      value={newStockType}
                      onChange={e => setNewStockType(e.target.value as any)}
                    >
                      <option value="option">Index / Stock Option (CE/PE)</option>
                      <option value="stock">Equity Stock</option>
                      <option value="index">Index</option>
                      <option value="commodity">Commodity (MCX)</option>
                      <option value="forex">Forex</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="field-label">Exchange</label>
                    <select 
                      className="select-input"
                      value={newStockExchange}
                      onChange={e => setNewStockExchange(e.target.value)}
                    >
                      <option value="NSE NFO">NSE NFO (Options)</option>
                      <option value="NSE">NSE (Equities)</option>
                      <option value="BSE">BSE</option>
                      <option value="MCX">MCX (Commodities)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="field-label">Base Price (₹) *</label>
                    <input 
                      type="number" 
                      step="0.05" 
                      className="text-input" 
                      value={newStockBasePrice} 
                      onChange={e => setNewStockBasePrice(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {/* Optional Call Parameters */}
                {newStockType === 'option' && (
                  <div className="form-group-row" style={{ marginTop: '0.4rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px' }}>
                    <div className="form-group" style={{ width: '80px' }}>
                      <label className="field-label">Action</label>
                      <select 
                        className="select-input" 
                        value={newStockCallType} 
                        onChange={e => setNewStockCallType(e.target.value as any)}
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="field-label">Entry (₹)</label>
                      <input 
                        type="number" 
                        step="0.05" 
                        className="text-input" 
                        value={newStockEntryPrice} 
                        onChange={e => setNewStockEntryPrice(e.target.value)} 
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="field-label">Target 1 (₹)</label>
                      <input 
                        type="number" 
                        step="0.05" 
                        className="text-input" 
                        value={newStockTarget1} 
                        onChange={e => setNewStockTarget1(e.target.value)} 
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="field-label">Stop Loss (₹)</label>
                      <input 
                        type="number" 
                        step="0.05" 
                        className="text-input" 
                        value={newStockStopLoss} 
                        onChange={e => setNewStockStopLoss(e.target.value)} 
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="field-label">Lot Size</label>
                      <input 
                        type="number" 
                        className="text-input" 
                        value={newStockLotSize} 
                        onChange={e => setNewStockLotSize(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Plus size={14} />
                    <span>Add to Live Ticker</span>
                  </button>
                </div>
              </form>

              {/* Existing Instruments Table with Show/Hide & Delete */}
              <div className="kite-current-instruments-section">
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Current Ticker Instruments ({customInstruments.length})
                </div>

                <div className="kite-instruments-table-wrap">
                  <table className="kite-instruments-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Symbol</th>
                        <th>Type</th>
                        <th>Exchange</th>
                        <th>Base Price</th>
                        <th>Call Setup</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customInstruments.map(inst => (
                        <tr key={inst.key}>
                          <td>
                            <button
                              type="button"
                              className={`btn-status-toggle ${inst.enabled !== false ? 'active' : ''}`}
                              onClick={() => toggleInstrumentVisibility(inst.key)}
                              title={inst.enabled !== false ? 'Hide from live ticker' : 'Show in live ticker'}
                            >
                              {inst.enabled !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                              <span>{inst.enabled !== false ? 'Active' : 'Hidden'}</span>
                            </button>
                          </td>
                          <td style={{ fontWeight: 700 }}>{inst.label}</td>
                          <td>
                            <span className="inst-type-badge">{inst.type.toUpperCase()}</span>
                          </td>
                          <td>{inst.exchange || 'NSE'}</td>
                          <td className="mono-cell">₹{inst.baseValue.toFixed(2)}</td>
                          <td>
                            {inst.callType && inst.entryPrice ? (
                              <span style={{ fontSize: '0.72rem', color: 'var(--stocketics-blue-600)', fontWeight: 600 }}>
                                {inst.callType} @ ₹{inst.entryPrice} | TGT: ₹{inst.target1}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-action-icon delete"
                              onClick={() => removeMarketInstrument(inst.key)}
                              title={`Remove ${inst.label} from ticker`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="market-modal-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Changes are immediately synchronized across all employee and team lead screens.
              </span>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => setIsManagerModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advisory Call Dispatch Modal (SMS / Email) */}
      {dispatchCallQuote && (
        <AdvisoryCallDispatchModal
          quote={dispatchCallQuote}
          onClose={() => setDispatchCallQuote(null)}
        />
      )}
    </section>
  );
};

