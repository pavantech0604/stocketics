import React, { useState, useMemo } from 'react';
import { MarketQuote } from '../../types';
import { useApp } from '../../state/store';
import { Search, TrendingUp, TrendingDown, Layers, BarChart2, ShieldCheck, Zap } from 'lucide-react';

interface MarketWatchlistProps {
  quotes: MarketQuote[];
  selectedKey: string;
  onSelectInstrument: (key: string) => void;
  onOpenOrder?: (quote: MarketQuote, type: 'BUY' | 'SELL') => void;
  onToggleDepth?: (quote: MarketQuote) => void;
  isMobile?: boolean;
}

type FilterCategory = 'all' | 'indices' | 'options' | 'commodities' | 'forex' | 'stocks';

// Mini Sparkline component for watchlist items
const WatchlistSparkline: React.FC<{ data?: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 44;
  const height = 16;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="watchlist-sparkline" aria-hidden="true" style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const MarketWatchlist: React.FC<MarketWatchlistProps> = ({
  quotes,
  selectedKey,
  onSelectInstrument,
  onOpenOrder,
  onToggleDepth,
  isMobile = false,
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      // 1. Search Query Filter
      const matchSearch =
        q.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.serviceSegment || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      // 2. Category Filter
      if (activeCategory === 'all') return true;
      if (activeCategory === 'indices') return q.type === 'index';
      if (activeCategory === 'options') return q.type === 'option' || q.isCallActive;
      if (activeCategory === 'commodities') return q.type === 'commodity';
      if (activeCategory === 'forex') return q.type === 'forex';
      if (activeCategory === 'stocks') return q.type === 'stock';
      return true;
    });
  }, [quotes, searchQuery, activeCategory]);

  return (
    <aside 
      className={`market-watchlist-panel custom-kite-watchlist ${isMobile ? 'watchlist-mobile-strip' : ''}`}
      style={{
        background: isDark 
          ? 'linear-gradient(180deg, #0b0f19 0%, #0f172a 100%)' 
          : '#ffffff',
        border: isDark 
          ? '1px solid rgba(56, 189, 248, 0.2)' 
          : '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        boxShadow: isDark 
          ? '0 8px 24px -4px rgba(0, 0, 0, 0.35)' 
          : '0 2px 10px rgba(0, 0, 0, 0.05)',
        color: isDark ? '#ffffff' : '#0f172a'
      }}
    >
      {/* ── Watchlist Header: Search and Categories ── */}
      <div className="watchlist-header-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, color: isDark ? '#64748b' : '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            className="watchlist-search-input"
            placeholder="Search eg: nifty, 24900 ce, infy..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '6px 24px 6px 28px',
              fontSize: '0.78rem',
              color: isDark ? '#ffffff' : '#0f172a',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 7,
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: 0
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Kite Group Tabs */}
        <div 
          className="watchlist-category-tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none'
          }}
        >
          {[
            { id: 'all', label: `All (${quotes.length})` },
            { id: 'indices', label: 'Indices' },
            { id: 'options', label: '🎯 Options' },
            { id: 'commodities', label: 'MCX' },
            { id: 'forex', label: 'Forex' },
            { id: 'stocks', label: 'Stocks' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as FilterCategory)}
              style={{
                padding: '4px 9px',
                borderRadius: 14,
                fontSize: '0.68rem',
                fontWeight: 700,
                border: activeCategory === tab.id 
                  ? 'none' 
                  : isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                background: activeCategory === tab.id 
                  ? (isDark ? '#38bdf8' : '#0284c7') 
                  : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'),
                color: activeCategory === tab.id 
                  ? (isDark ? '#0f172a' : '#ffffff') 
                  : (isDark ? '#94a3b8' : '#475569'),
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Smooth Scrollable Watchlist Items ── */}
      <div 
        className="watchlist-items-scroll custom-kite-scrollbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 210px)',
          paddingRight: '3px'
        }}
      >
        {filteredQuotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.78rem' }}>
            No instruments match your search.
          </div>
        ) : (
          filteredQuotes.map(q => {
            const isSelected = q.key === selectedKey;
            const isUp = q.change >= 0;
            const isHovered = hoveredKey === q.key;

            const isTgt2 = q.targetHit === 'TGT2';
            const isTgt1 = q.targetHit === 'TGT1';
            const isInProfit = (q.pointsGain || 0) > 0;

            return (
              <div
                key={q.key}
                role="button"
                tabIndex={0}
                className={`watchlist-item-card ${isSelected ? 'is-selected' : ''}`}
                onMouseEnter={() => setHoveredKey(q.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => onSelectInstrument(q.key)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectInstrument(q.key);
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.35rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 8,
                  flex: '0 0 auto',
                  flexShrink: 0,
                  minHeight: '64px',
                  boxSizing: 'border-box',
                  background: isSelected 
                    ? (isDark 
                        ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.22), rgba(15, 23, 42, 0.8))' 
                        : 'rgba(2, 132, 199, 0.08)')
                    : isHovered 
                    ? (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9') 
                    : (isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'),
                  border: isSelected 
                    ? (isDark ? '1.5px solid #38bdf8' : '1.5px solid #0284c7') 
                    : (isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0'),
                  boxShadow: isSelected 
                    ? (isDark ? '0 0 12px rgba(56, 189, 248, 0.15)' : '0 2px 8px rgba(2, 132, 199, 0.12)') 
                    : (isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.02)'),
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Top Row: Symbol, Exchange & LTP */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isSelected 
                        ? (isDark ? '#38bdf8' : '#0284c7') 
                        : (isDark ? '#f8fafc' : '#0f172a'),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {q.label}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#64748b',
                      background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                      padding: '1px 5px',
                      borderRadius: 3
                    }}>
                      {q.exchange || 'NSE'}
                    </span>
                  </div>

                  {/* LTP */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      lineHeight: '1.25',
                      color: isUp ? '#10b981' : '#ef4444',
                      display: 'inline-block'
                    }}>
                      ₹{q.value.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Sub Info, Sparkline & Change % */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginTop: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isTgt2 ? (
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 5px', borderRadius: 4 }}>
                        🚀 TGT 2
                      </span>
                    ) : isTgt1 ? (
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7', background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)', padding: '1px 5px', borderRadius: 4 }}>
                        🎯 TGT 1
                      </span>
                    ) : isInProfit && q.type === 'option' ? (
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 5px', borderRadius: 4 }}>
                        +₹{q.pointsGain?.toFixed(1)}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>
                        {q.type}
                      </span>
                    )}

                    <WatchlistSparkline data={q.historicalMiniSeries} isPositive={isUp} />
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: isUp ? '#10b981' : '#ef4444'
                  }}>
                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span>{isUp ? '+' : ''}{q.changePercent.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Zerodha Kite Signature Quick Action Overlay on Hover */}
                {isHovered && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(4px)',
                      border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.12)',
                      zIndex: 10
                    }}
                  >
                    {/* Buy Button */}
                    <button
                      type="button"
                      title="Place Buy Order (B)"
                      onClick={() => onOpenOrder && onOpenOrder(q, 'BUY')}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 4,
                        width: 20,
                        height: 20,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      B
                    </button>

                    {/* Sell Button */}
                    <button
                      type="button"
                      title="Place Sell Order (S)"
                      onClick={() => onOpenOrder && onOpenOrder(q, 'SELL')}
                      style={{
                        background: '#ea580c',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 4,
                        width: 20,
                        height: 20,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      S
                    </button>

                    {/* Market Depth Button */}
                    <button
                      type="button"
                      title="View Market Depth"
                      onClick={() => onToggleDepth && onToggleDepth(q)}
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
                        color: isDark ? '#94a3b8' : '#475569',
                        border: 'none',
                        borderRadius: 4,
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Layers size={11} />
                    </button>

                    {/* Select Chart Button */}
                    <button
                      type="button"
                      title="Open Candlestick Chart"
                      onClick={() => onSelectInstrument(q.key)}
                      style={{
                        background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                        color: isDark ? '#38bdf8' : '#0284c7',
                        border: 'none',
                        borderRadius: 4,
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <BarChart2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
