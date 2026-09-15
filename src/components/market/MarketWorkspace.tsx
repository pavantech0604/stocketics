import React, { useState, useMemo } from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import { useMarketCandles } from '../../hooks/useMarketCandles';
import { useApp } from '../../state/store';
import { MarketQuote, MarketTimeframe } from '../../types';
import { MarketWatchlist } from './MarketWatchlist';
import { MarketInstrumentSummary } from './MarketInstrumentSummary';
import { CandlestickMarketChart } from './CandlestickMarketChart';
import { MarketDetails } from './MarketDetails';
import { MarketDepth } from './MarketDepth';
import { KiteOrderModal } from './KiteOrderModal';
import { MarketRACallsTab } from './MarketRACallsTab';
import { MarketManageStocksTab } from './MarketManageStocksTab';
import { MarketErrorState } from './MarketErrorState';
import { KiteConnectModal } from './KiteConnectModal';
import { 
  RotateCw, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart2,
  Sliders,
  Target,
  Clock,
  ExternalLink
} from 'lucide-react';

export const MarketWorkspace: React.FC = () => {
  const { 
    quotes, 
    isLoading: isQuotesLoading, 
    isRefreshing, 
    error: quotesError, 
    lastUpdated, 
    marketStatus,
    refresh: refreshQuotes, 
    hasAccess 
  } = useMarketData();

  const { role, hasPermission, setActiveTab, kiteConfig, theme } = useApp();
  const isDark = theme === 'dark';

  // Active Workspace Navigation Tab
  const [workspaceMode, setWorkspaceMode] = useState<'terminal' | 'ra-calls' | 'manage-stocks'>('terminal');

  // Selected instrument key (defaults to 'nifty50' or first available)
  const [selectedKey, setSelectedKey] = useState<string>('nifty50');
  
  // Modals & View Toggles
  const [isKiteModalOpen, setIsKiteModalOpen] = useState<boolean>(false);
  const [orderModalData, setOrderModalData] = useState<{ quote: MarketQuote; type: 'BUY' | 'SELL' } | null>(null);
  const [showDepthPanel, setShowDepthPanel] = useState<boolean>(true);

  // Check workspace permission: Managers, Team Leaders, HR, and Employee have guaranteed access
  const canAccessWorkspace = hasPermission('market_workspace_view');

  // Find active quote
  const activeQuote = useMemo(() => {
    return quotes.find(q => q.key === selectedKey) || quotes[0] || null;
  }, [quotes, selectedKey]);

  // Hook for candlestick data for currently selected instrument
  const {
    candles,
    isLoading: isCandlesLoading,
    timeframe,
    setTimeframe,
    refreshCandles,
  } = useMarketCandles(selectedKey, activeQuote || undefined, '1D');

  // Major Indices for top Kite-style summary strip
  const niftyQuote = quotes.find(q => q.key === 'nifty50') || quotes[0];
  const sensexQuote = quotes.find(q => q.key === 'sensex') || quotes[1];
  const bankNiftyQuote = quotes.find(q => q.key === 'banknifty') || quotes[2];

  // Handle Unauthorized Role Access
  if (!canAccessWorkspace) {
    return (
      <div className="market-access-denied card" style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        maxWidth: '520px',
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ShieldAlert size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            Market Workspace Restricted
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Your role currently does not have active <code>market_workspace_view</code> permissions enabled. Please contact your Department Administrator.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('dashboard')} style={{ marginTop: '0.5rem' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`market-workspace-root ${isDark ? 'kite-dark-theme-root' : 'kite-light-theme-root'}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      width: '100%'
    }}>
      {/* ══════════════════════════════════════════════════════════════════
          1. ZERODHA KITE STICKY TOP INDICES BAR & FEED STATUS STRIP
      ══════════════════════════════════════════════════════════════════ */}
      <div className="kite-top-indices-bar" style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)' 
          : '#ffffff',
        border: isDark 
          ? '1px solid rgba(56, 189, 248, 0.25)' 
          : '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: isDark 
          ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)' 
          : '0 2px 10px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Left: Major Benchmark Indices (NIFTY 50 & SENSEX & BANK NIFTY) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* NIFTY 50 */}
          {niftyQuote && (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
              onClick={() => setSelectedKey(niftyQuote.key)}
              title="Click to load NIFTY 50 chart"
            >
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>NIFTY 50</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: niftyQuote.change >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{niftyQuote.value.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: niftyQuote.change >= 0 ? '#10b981' : '#ef4444',
                background: niftyQuote.change >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                padding: '1px 5px',
                borderRadius: 4
              }}>
                {niftyQuote.change >= 0 ? '+' : ''}{niftyQuote.changePercent.toFixed(2)}%
              </span>
            </div>
          )}

          <div style={{ width: 1, height: 18, background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0' }} />

          {/* SENSEX */}
          {sensexQuote && (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
              onClick={() => setSelectedKey(sensexQuote.key)}
              title="Click to load SENSEX chart"
            >
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>SENSEX</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: sensexQuote.change >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{sensexQuote.value.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: sensexQuote.change >= 0 ? '#10b981' : '#ef4444',
                background: sensexQuote.change >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                padding: '1px 5px',
                borderRadius: 4
              }}>
                {sensexQuote.change >= 0 ? '+' : ''}{sensexQuote.changePercent.toFixed(2)}%
              </span>
            </div>
          )}

          <div style={{ width: 1, height: 18, background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0' }} />

          {/* BANK NIFTY */}
          {bankNiftyQuote && (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
              onClick={() => setSelectedKey(bankNiftyQuote.key)}
              title="Click to load BANK NIFTY chart"
            >
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>BANK NIFTY</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: bankNiftyQuote.change >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{bankNiftyQuote.value.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: bankNiftyQuote.change >= 0 ? '#10b981' : '#ef4444',
                background: bankNiftyQuote.change >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                padding: '1px 5px',
                borderRadius: 4
              }}>
                {bankNiftyQuote.change >= 0 ? '+' : ''}{bankNiftyQuote.changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Right: Kite Feed Live Status & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Live Status Pill */}
          <button
            type="button"
            onClick={() => setIsKiteModalOpen(true)}
            style={{
              background: kiteConfig.isConnected 
                ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)') 
                : (isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)'),
              border: `1px solid ${kiteConfig.isConnected ? '#10b981' : (isDark ? '#38bdf8' : '#0284c7')}`,
              color: kiteConfig.isConnected ? '#10b981' : (isDark ? '#38bdf8' : '#0284c7'),
              borderRadius: 16,
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
            title="Configure Zerodha Kite Connect credentials"
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: kiteConfig.isConnected ? '#10b981' : (isDark ? '#38bdf8' : '#0284c7'),
              boxShadow: kiteConfig.isConnected ? '0 0 8px #10b981' : (isDark ? '0 0 8px #38bdf8' : 'none')
            }} />
            <span>{kiteConfig.isConnected ? 'Kite Connect LIVE' : 'NSE Live Feed'}</span>
          </button>

          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              <Clock size={11} />
              <span>{lastUpdated} IST</span>
            </div>
          )}

          {/* Refresh Quotes & Candles */}
          <button
            type="button"
            className={isRefreshing ? 'is-spinning' : ''}
            onClick={() => {
              refreshQuotes();
              refreshCandles();
            }}
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
              color: isDark ? '#f8fafc' : '#0f172a',
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.72rem'
            }}
            title="Refresh Quotes & Live Candles"
          >
            <RotateCw size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. WORKSPACE TABS SWITCHER
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        background: isDark ? '#0f172a' : '#ffffff',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '0.4rem 0.6rem',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => setWorkspaceMode('terminal')}
            style={{
              background: workspaceMode === 'terminal' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
              color: workspaceMode === 'terminal' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart2 size={14} />
            <span>Trading Terminal & Charts</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceMode('ra-calls')}
            style={{
              background: workspaceMode === 'ra-calls' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'transparent',
              color: workspaceMode === 'ra-calls' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Target size={14} />
            <span>RA Advisory Calls & Live P&L</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceMode('manage-stocks')}
            style={{
              background: workspaceMode === 'manage-stocks' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
              color: workspaceMode === 'manage-stocks' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={14} />
            <span>Manage Stocks & Watchlists</span>
          </button>
        </div>

        {/* Quick Help Indicator */}
        <div style={{ fontSize: '0.72rem', color: isDark ? '#64748b' : '#64748b' }}>
          Role: <strong style={{ color: isDark ? '#38bdf8' : '#0284c7', textTransform: 'capitalize' }}>{role}</strong> • Real-time Kite WebSocket & REST Engine
        </div>
      </div>

      {/* Error state if feed fails */}
      {quotesError && (
        <MarketErrorState 
          message={quotesError} 
          onRetry={() => {
            refreshQuotes();
            refreshCandles();
          }}
          isRetrying={isRefreshing}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          3. MAIN WORKSPACE CONTENT ROUTER ACCORDING TO TAB
      ══════════════════════════════════════════════════════════════════ */}
      {workspaceMode === 'ra-calls' ? (
        <MarketRACallsTab quotes={quotes} />
      ) : workspaceMode === 'manage-stocks' ? (
        <MarketManageStocksTab quotes={quotes} />
      ) : (
        /* TRADING TERMINAL: 2-COLUMN KITE LAYOUT */
        <div className="market-workspace-grid" style={{
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr)',
          gap: '1rem',
          alignItems: 'start'
        }}>
          {/* Left Watchlist Column (Kite MarketWatch) */}
          <div className="market-watchlist-col" style={{ position: 'sticky', top: '1rem' }}>
            <MarketWatchlist
              quotes={quotes}
              selectedKey={selectedKey}
              onSelectInstrument={setSelectedKey}
              onOpenOrder={(q, type) => setOrderModalData({ quote: q, type })}
              onToggleDepth={q => {
                setSelectedKey(q.key);
                setShowDepthPanel(true);
              }}
            />
          </div>

          {/* Right Active Trading Details & Candlestick Chart Area */}
          <div className="market-main-display-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            {activeQuote ? (
              <>
                {/* Selected Instrument Summary Header with Kite Action Buttons */}
                <div style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)' 
                    : '#ffffff',
                  border: isDark 
                    ? '1px solid rgba(56, 189, 248, 0.2)' 
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
                        {activeQuote.label}
                      </h2>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                        color: isDark ? '#94a3b8' : '#64748b',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        {activeQuote.exchange || 'NSE'}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                        color: isDark ? '#38bdf8' : '#0284c7',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        {activeQuote.type.toUpperCase()}
                      </span>
                      {activeQuote.serviceSegment && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          {activeQuote.serviceSegment}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                      Symbol: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{activeQuote.symbol}</strong>
                      {activeQuote.expiry && <span> • Expiry: {activeQuote.expiry}</span>}
                    </div>
                  </div>

                  {/* Price & Action Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        color: activeQuote.change >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        ₹{activeQuote.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono, monospace)',
                        color: activeQuote.change >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        {activeQuote.change >= 0 ? '+' : ''}{activeQuote.change.toFixed(2)} ({activeQuote.change >= 0 ? '+' : ''}{activeQuote.changePercent.toFixed(2)}%)
                      </div>
                    </div>

                    {/* Kite Buy & Sell Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setOrderModalData({ quote: activeQuote, type: 'BUY' })}
                        style={{
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                        }}
                      >
                        Buy (B)
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderModalData({ quote: activeQuote, type: 'SELL' })}
                        style={{
                          background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
                        }}
                      >
                        Sell (S)
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDepthPanel(prev => !prev)}
                        style={{
                          background: showDepthPanel 
                            ? (isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)') 
                            : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc'),
                          color: showDepthPanel 
                            ? (isDark ? '#38bdf8' : '#0284c7') 
                            : (isDark ? '#94a3b8' : '#64748b'),
                          border: `1px solid ${showDepthPanel 
                            ? (isDark ? '#38bdf8' : '#0284c7') 
                            : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')}`,
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <Layers size={13} />
                        <span>Depth</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Candlestick Chart */}
                <div style={{
                  background: isDark ? '#0b0f19' : '#ffffff',
                  border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '1rem',
                  overflow: 'hidden',
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)'
                }}>
                  <CandlestickMarketChart
                    candles={candles}
                    instrumentLabel={activeQuote.label}
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                    isLoading={isCandlesLoading}
                    onRefresh={refreshCandles}
                    height={420}
                  />
                </div>

                {/* Zerodha Kite Level 2 Market Depth */}
                {showDepthPanel && (
                  <MarketDepth quote={activeQuote} />
                )}

                {/* Detailed Market Statistics & Option Specifics */}
                <MarketDetails quote={activeQuote} />
              </>
            ) : isQuotesLoading ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RotateCw size={32} className="is-spinning" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--stocketics-blue-500)' }} />
                <div>Loading real-time market quotes from Kite Connect...</div>
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div>No market instruments available.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kite Connect Credentials & Settings Modal */}
      <KiteConnectModal
        isOpen={isKiteModalOpen}
        onClose={() => setIsKiteModalOpen(false)}
      />

      {/* Kite Quick Buy/Sell Order Modal */}
      {orderModalData && (
        <KiteOrderModal
          quote={orderModalData.quote}
          initialType={orderModalData.type}
          isOpen={true}
          onClose={() => setOrderModalData(null)}
        />
      )}
    </div>
  );
};
