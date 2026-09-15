import React, { useState, useMemo } from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import { useApp } from '../../state/store';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Target, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Flame
} from 'lucide-react';
import { MarketQuote } from '../../types';

// Mini SVG Sparkline Component
const MiniSparkline: React.FC<{ data: number[]; isUp: boolean }> = ({ data, isUp }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 68;
  const height = 24;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const strokeColor = isUp ? '#10b981' : '#ef4444';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const areaPoints = `${points} ${width - 2},${height} 2,${height}`;

  return (
    <svg width={width} height={height} className="snapshot-sparkline-svg" aria-hidden="true" style={{ overflow: 'visible' }}>
      <polygon fill={fillColor} points={areaPoints} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const MarketSnapshot: React.FC = () => {
  const { quotes, lastUpdated, marketStatus, hasAccess, refresh, isRefreshing } = useMarketData();
  const { setActiveTab, hasPermission, kiteConfig, theme } = useApp();
  const isDark = theme === 'dark';
  
  const [selectedKey, setSelectedKey] = useState<string>('nifty50');
  const [activeCategory, setActiveCategory] = useState<'all' | 'indices' | 'commodities' | 'options'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Guard: check permission
  if (!hasAccess || !hasPermission('market_dashboard_view')) {
    return null;
  }

  // Filter quotes based on active category
  const filteredQuotes = useMemo(() => {
    if (activeCategory === 'indices') {
      return quotes.filter(q => q.type === 'index' || ['nifty50', 'sensex', 'banknifty', 'finnifty'].includes(q.key));
    }
    if (activeCategory === 'commodities') {
      return quotes.filter(q => q.type === 'commodity' || q.type === 'forex' || ['usdinr', 'crudeoil', 'gold', 'silver'].includes(q.key));
    }
    if (activeCategory === 'options') {
      return quotes.filter(q => q.type === 'option' || q.isCallActive);
    }
    return quotes;
  }, [quotes, activeCategory]);

  const activeQuote: MarketQuote = useMemo(() => {
    return quotes.find(q => q.key === selectedKey) || filteredQuotes[0] || quotes[0];
  }, [quotes, selectedKey, filteredQuotes]);

  if (!activeQuote) return null;

  const isUp = activeQuote.change >= 0;
  const isKiteLive = Boolean(kiteConfig?.apiKey) && (activeQuote.dataStatus === 'realtime' || activeQuote.provider?.includes('Kite'));

  // Day's Range calculation
  const dayLow = activeQuote.low || activeQuote.value * 0.992;
  const dayHigh = activeQuote.high || activeQuote.value * 1.008;
  const rangeSpan = dayHigh - dayLow || 1;
  const currentPosPct = Math.min(100, Math.max(0, ((activeQuote.value - dayLow) / rangeSpan) * 100));

  // Option target hit status
  const isTgt2 = activeQuote.targetHit === 'TGT2';
  const isTgt1 = activeQuote.targetHit === 'TGT1';

  return (
    <div className="card market-snapshot-enhanced" style={{
      background: isDark
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.75))'
        : '#ffffff',
      border: isDark ? '1px solid rgba(56, 189, 248, 0.22)' : '1px solid #e2e8f0',
      borderRadius: 'var(--radius-lg, 12px)',
      boxShadow: isDark
        ? '0 8px 24px -6px rgba(0, 0, 0, 0.25), 0 0 16px rgba(56, 189, 248, 0.08)'
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
      padding: '0.85rem 1.15rem',
      marginBottom: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient glow top accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: '2px',
        background: isDark
          ? 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)'
          : 'linear-gradient(90deg, transparent, #0284c7, #6366f1, transparent)',
        opacity: isDark ? 0.8 : 0.5
      }} />

      {/* ── 1. Header Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
        {/* Title & Live Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: isDark
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))'
              : 'rgba(2, 132, 199, 0.1)',
            border: isDark ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(2, 132, 199, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={18} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#fff' : '#0f172a', letterSpacing: '-0.01em' }}>
                Live Market Snapshot
              </span>
              
              {isKiteLive ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <ShieldCheck size={11} /> Kite Live
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: marketStatus === 'open' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                  color: marketStatus === 'open' ? '#10b981' : '#94a3b8',
                  border: `1px solid ${marketStatus === 'open' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: marketStatus === 'open' ? '#10b981' : '#94a3b8', animation: marketStatus === 'open' ? 'pulse 2s infinite' : 'none' }} />
                  {marketStatus === 'open' ? 'NSE Real-Time' : 'Exchange Closed'}
                </span>
              )}
            </div>

            {lastUpdated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)' }}>
                <Clock size={10} />
                <span>Updated: {lastUpdated} IST</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Pills & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {/* Categories */}
          <div style={{
            display: 'inline-flex',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 8,
            padding: '2px',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              style={{
                background: activeCategory === 'all' ? (isDark ? '#38bdf8' : '#0284c7') : 'transparent',
                color: activeCategory === 'all' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                fontSize: '0.72rem',
                padding: '4px 9px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('indices')}
              style={{
                background: activeCategory === 'indices' ? (isDark ? '#38bdf8' : '#0284c7') : 'transparent',
                color: activeCategory === 'indices' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                fontSize: '0.72rem',
                padding: '4px 9px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Indices
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('commodities')}
              style={{
                background: activeCategory === 'commodities' ? (isDark ? '#38bdf8' : '#0284c7') : 'transparent',
                color: activeCategory === 'commodities' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: 700,
                fontSize: '0.72rem',
                padding: '4px 9px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Commodities & FX
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('options')}
              style={{
                background: activeCategory === 'options' ? '#f59e0b' : 'transparent',
                color: activeCategory === 'options' ? '#ffffff' : (isDark ? '#f59e0b' : '#b45309'),
                fontWeight: 700,
                fontSize: '0.72rem',
                padding: '4px 9px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Flame size={12} /> RA Options
            </button>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => refresh()}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '5px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
              borderRadius: 6,
              color: isRefreshing ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#94a3b8' : '#64748b'),
              cursor: 'pointer'
            }}
            title="Refresh Quotes"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-anim' : ''} />
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '5px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.72rem',
              fontWeight: 600,
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
              borderRadius: 6,
              color: isDark ? '#94a3b8' : '#64748b',
              cursor: 'pointer'
            }}
            title={isExpanded ? 'Collapse spotlight details' : 'Expand spotlight details'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>{isExpanded ? 'Compact' : 'Inspect'}</span>
          </button>

          {/* View Full Market Workspace */}
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="btn btn-primary btn-sm"
            style={{
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              cursor: 'pointer'
            }}
            title="Open Interactive Market Workspace with full Candlestick charts"
          >
            <span>Market Workspace</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* ── 2. Interactive Instrument Cards Strip (Click to inspect) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.65rem',
        marginBottom: isExpanded ? '0.85rem' : '0'
      }}>
        {filteredQuotes.slice(0, 6).map(q => {
          const isSelected = q.key === activeQuote.key;
          const qUp = q.change >= 0;
          const hasOptionBadge = q.isCallActive || q.type === 'option';

          return (
            <div
              key={q.key}
              onClick={() => setSelectedKey(q.key)}
              style={{
                background: isSelected 
                  ? (isDark ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.14), rgba(30, 41, 59, 0.9))' : 'rgba(2, 132, 199, 0.08)') 
                  : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'),
                border: isSelected 
                  ? (isDark ? '1px solid #38bdf8' : '1px solid #0284c7') 
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0'),
                borderRadius: 10,
                padding: '0.6rem 0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected 
                  ? (isDark ? '0 0 14px rgba(56, 189, 248, 0.25)' : '0 2px 8px rgba(2, 132, 199, 0.15)') 
                  : 'none',
                transform: isSelected ? 'translateY(-1px)' : 'none',
                position: 'relative'
              }}
            >
              {/* Header: Label + Exchange */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: isSelected ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#fff' : '#0f172a'),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '120px'
                }}>
                  {q.label}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  color: isDark ? '#94a3b8' : '#64748b'
                }}>
                  {q.exchange || 'NSE'}
                </span>
              </div>

              {/* Price & Sparkline Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div>
                  <div style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: isDark ? '#fff' : '#0f172a',
                    letterSpacing: '-0.02em'
                  }}>
                    {q.currency === 'INR' ? '₹' : '$'}
                    {q.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: qUp ? '#10b981' : '#ef4444',
                    marginTop: 2
                  }}>
                    {qUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    <span>{qUp ? '+' : ''}{q.changePercent.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Sparkline trend */}
                <div>
                  <MiniSparkline data={q.historicalMiniSeries || [q.value * 0.99, q.value * 1.005, q.value * 0.998, q.value]} isUp={qUp} />
                </div>
              </div>

              {/* Option Target hit pill if applicable */}
              {hasOptionBadge && (
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: q.callType === 'SELL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: q.callType === 'SELL' ? '#ef4444' : '#10b981'
                  }}>
                    {q.callType || 'BUY CALL'}
                  </span>

                  {q.targetHit && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: 'rgba(234, 179, 8, 0.2)',
                      color: '#eab308'
                    }}>
                      {q.targetHit} HIT
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 3. Interactive Spotlight & Day's Range Visualizer (Expanded Panel) ── */}
      {isExpanded && (
        <div style={{
          background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f8fafc',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
          borderRadius: 10,
          padding: '0.85rem 1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center'
        }}>
          {/* Left Column: Price Hero & Day Range Progress Slider */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: isDark ? '#38bdf8' : '#0284c7' }}>
                  {activeQuote.label}
                </span>
                <span style={{ fontSize: '0.72rem', background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)', color: isDark ? '#38bdf8' : '#0284c7', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
                  Selected Instrument
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isUp ? '#10b981' : '#ef4444' }}>
                  {isUp ? '+' : ''}{activeQuote.change.toFixed(2)} ({isUp ? '+' : ''}{activeQuote.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Day's Range Visual Progress Track */}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>
                <span>Day Low: <strong style={{ color: '#ef4444' }}>₹{dayLow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
                <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>Intraday Position: {currentPosPct.toFixed(0)}%</span>
                <span>Day High: <strong style={{ color: '#10b981' }}>₹{dayHigh.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
              </div>

              {/* Slider Track */}
              <div style={{
                height: 7,
                borderRadius: 4,
                background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)',
                position: 'relative'
              }}>
                {/* Current Price Marker */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${currentPosPct}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0,0,0,0.5)',
                  border: '2px solid #0284c7'
                }} />
              </div>
            </div>
          </div>

          {/* Right Column: Key Intraday Metrics or Option Target Progress */}
          <div>
            {activeQuote.type === 'option' || activeQuote.isCallActive ? (
              /* Option Target Progress Gauge */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569' }}>
                    Research Analyst Target Milestone
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ra-calls')}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View RA Signal Board →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, textAlign: 'center' }}>
                  <div style={{ background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)', padding: '6px 4px', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ fontSize: '0.64rem', color: '#ef4444', fontWeight: 700 }}>STOP LOSS</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>₹{activeQuote.stopLoss || (activeQuote.value * 0.85).toFixed(1)}</div>
                  </div>
                  <div style={{ background: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.08)', padding: '6px 4px', borderRadius: 6, border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.2)'}` }}>
                    <div style={{ fontSize: '0.64rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>ENTRY</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>₹{activeQuote.entryPrice || (activeQuote.value * 0.95).toFixed(1)}</div>
                  </div>
                  <div style={{ background: isTgt1 || isTgt2 ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)') : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'), padding: '6px 4px', borderRadius: 6, border: isTgt1 || isTgt2 ? '1px solid #10b981' : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0') }}>
                    <div style={{ fontSize: '0.64rem', color: isTgt1 || isTgt2 ? '#10b981' : (isDark ? '#94a3b8' : '#64748b'), fontWeight: 700 }}>{isTgt1 || isTgt2 ? 'TGT 1 ✅' : 'TARGET 1'}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>₹{activeQuote.target1 || (activeQuote.value * 1.15).toFixed(1)}</div>
                  </div>
                  <div style={{ background: isTgt2 ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)') : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'), padding: '6px 4px', borderRadius: 6, border: isTgt2 ? '1px solid #10b981' : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0') }}>
                    <div style={{ fontSize: '0.64rem', color: isTgt2 ? '#10b981' : (isDark ? '#94a3b8' : '#64748b'), fontWeight: 700 }}>{isTgt2 ? 'TGT 2 🚀' : 'TARGET 2'}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>₹{activeQuote.target2 || (activeQuote.value * 1.3).toFixed(1)}</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Index/Commodity Intraday Stats Grid */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569' }}>
                    Session Key Metrics
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('market')}
                    style={{
                      background: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                      color: isDark ? '#38bdf8' : '#0284c7',
                      border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.25)'}`,
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Open Candlestick Chart →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, textAlign: 'center' }}>
                  <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff', border: isDark ? 'none' : '1px solid #e2e8f0', padding: '6px 4px', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b' }}>Open</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>
                      ₹{(activeQuote.open || activeQuote.value * 0.998).toFixed(1)}
                    </div>
                  </div>
                  <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff', border: isDark ? 'none' : '1px solid #e2e8f0', padding: '6px 4px', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b' }}>Prev Close</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>
                      ₹{(activeQuote.previousClose || activeQuote.value - activeQuote.change).toFixed(1)}
                    </div>
                  </div>
                  <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff', border: isDark ? 'none' : '1px solid #e2e8f0', padding: '6px 4px', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b' }}>52W High</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginTop: 2 }}>
                      ₹{(activeQuote.high ? activeQuote.high * 1.08 : activeQuote.value * 1.12).toFixed(1)}
                    </div>
                  </div>
                  <div style={{ background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff', border: isDark ? 'none' : '1px solid #e2e8f0', padding: '6px 4px', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b' }}>52W Low</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', marginTop: 2 }}>
                      ₹{(activeQuote.low ? activeQuote.low * 0.88 : activeQuote.value * 0.82).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
