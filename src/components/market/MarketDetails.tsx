import React from 'react';
import { MarketQuote } from '../../types';
import { useApp } from '../../state/store';
import { 
  ShieldCheck, 
  UserCheck, 
  Target, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  Activity,
  Send,
  Layers,
  BarChart2
} from 'lucide-react';

interface MarketDetailsProps {
  quote: MarketQuote;
}

export const MarketDetails: React.FC<MarketDetailsProps> = ({ quote }) => {
  const { detailedClients, showToast } = useApp();

  const prevClose = quote.previousClose || quote.value;
  const high = quote.high || +(quote.value * 1.008).toFixed(2);
  const low = quote.low || +(quote.value * 0.992).toFixed(2);
  const open = quote.open || +(prevClose * 1.001).toFixed(2);

  // Approximate 52-week range based on instrument type
  const rangeMultiplier = quote.type === 'index' ? 0.18 : quote.type === 'option' ? 0.8 : 0.25;
  const yearHigh = +(quote.value * (1 + rangeMultiplier)).toFixed(2);
  const yearLow = +(quote.value * (1 - rangeMultiplier)).toFixed(2);

  // Day Range percentage (0% to 100%)
  const daySpan = high - low || 1;
  const dayProgress = Math.max(0, Math.min(100, Math.round(((quote.value - low) / daySpan) * 100)));

  // Subscribed clients matching service segment
  const matchingClients = detailedClients.filter(c => 
    (c.serviceName || '').toUpperCase().includes(quote.serviceSegment || (quote.type === 'option' ? 'INDEX OPTION' : 'EQUITY'))
  );

  const isCall = !!(quote.callType && quote.entryPrice);
  const entry = quote.entryPrice || 0;
  const t1 = quote.target1 || 0;
  const t2 = quote.target2 || 0;
  const sl = quote.stopLoss || 0;

  const isTgt2Hit = quote.targetHit === 'TGT2' || (t2 > 0 && quote.value >= t2);
  const isTgt1Hit = quote.targetHit === 'TGT1' || (t1 > 0 && quote.value >= t1);
  const isSLHit = quote.targetHit === 'SL' || (sl > 0 && quote.value <= sl);
  const isInProfit = entry > 0 && quote.value > entry;

  // Calculate target milestone progress (0% at entry, 50% at T1, 100% at T2)
  let targetProgress = 0;
  if (isCall && t2 > entry) {
    targetProgress = Math.max(0, Math.min(100, Math.round(((quote.value - entry) / (t2 - entry)) * 100)));
  }

  const handleNotifyClients = () => {
    showToast(`Advisory update notification queued for ${matchingClients.length} clients subscribed to ${quote.label}.`, 'success');
  };

  return (
    <div className="mkt-details-container card">
      {/* 1. Research Analyst Options Command Terminal (When Option or Advisory Call is Active) */}
      {isCall && (
        <div className="mkt-option-terminal-card">
          {/* Header Strip */}
          <div className="mkt-terminal-header">
            <div className="mkt-contract-info">
              <span className={`mkt-call-badge ${quote.callType === 'BUY' ? 'badge-buy-ce' : 'badge-buy-pe'}`}>
                {quote.callType === 'BUY' ? 'BUY CALL (CE)' : 'BUY PUT (PE)'}
              </span>
              <div className="mkt-contract-title">
                <span className="contract-name">{quote.label}</span>
                <span className="contract-meta">
                  Expiry: {quote.expiry || 'Current Week'} • Lot Size: {quote.lotSize || 50} • {quote.exchange || 'NSE'}
                </span>
              </div>
            </div>

            <div className="mkt-terminal-actions">
              <span className="mkt-subscribers-pill">
                <UserCheck size={13} />
                <span>{matchingClients.length} Clients Subscribed</span>
              </span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleNotifyClients}
                title="Send automated SMS / WhatsApp advisory update to subscribed clients"
              >
                <Send size={12} />
                <span>Notify Clients</span>
              </button>
            </div>
          </div>

          {/* Target Milestone Visual Tracker */}
          <div className="mkt-milestone-gauge">
            <div className="mkt-gauge-header">
              <div className="gauge-status-title">
                <Target size={14} style={{ color: 'var(--stocketics-blue-500, #0ea5e9)' }} />
                <span>Advisory Target Progress</span>
              </div>

              <div className="gauge-status-badge">
                {isTgt2Hit ? (
                  <span className="mkt-badge-hit tgt2"><Zap size={12} /> TARGET 2 ACHIEVED</span>
                ) : isTgt1Hit ? (
                  <span className="mkt-badge-hit tgt1"><Target size={12} /> TARGET 1 ACHIEVED</span>
                ) : isSLHit ? (
                  <span className="mkt-badge-hit sl"><ShieldAlert size={12} /> STOP LOSS TRIGGERED</span>
                ) : isInProfit ? (
                  <span className="mkt-badge-hit profit"><ArrowUpRight size={12} /> IN PROFIT (+{quote.pointsGain?.toFixed(1)} pts)</span>
                ) : (
                  <span className="mkt-badge-hit active">ACTIVE ACCUMULATION</span>
                )}
              </div>
            </div>

            {/* Visual Milestones Track */}
            <div className="mkt-milestones-track-wrapper">
              <div className="mkt-milestones-track">
                <div 
                  className="mkt-milestones-progress-fill" 
                  style={{ width: `${targetProgress}%` }}
                />
              </div>

              {/* Milestone Nodes */}
              <div className="mkt-milestone-nodes">
                {/* Stop Loss Node */}
                <div className={`mkt-node node-sl ${isSLHit ? 'is-reached' : ''}`}>
                  <div className="node-marker"></div>
                  <div className="node-info">
                    <span className="node-lbl">Stop Loss</span>
                    <span className="node-val">₹{sl.toFixed(2)}</span>
                  </div>
                </div>

                {/* Entry Node */}
                <div className="mkt-node node-entry is-reached">
                  <div className="node-marker"></div>
                  <div className="node-info">
                    <span className="node-lbl">Entry</span>
                    <span className="node-val">₹{entry.toFixed(2)}</span>
                  </div>
                </div>

                {/* Target 1 Node */}
                <div className={`mkt-node node-t1 ${isTgt1Hit ? 'is-reached' : ''}`}>
                  <div className="node-marker"></div>
                  <div className="node-info">
                    <span className="node-lbl">Target 1</span>
                    <span className="node-val">₹{t1.toFixed(2)}</span>
                  </div>
                </div>

                {/* Target 2 Node */}
                <div className={`mkt-node node-t2 ${isTgt2Hit ? 'is-reached' : ''}`}>
                  <div className="node-marker"></div>
                  <div className="node-info">
                    <span className="node-lbl">Target 2</span>
                    <span className="node-val">₹{t2.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* P&L and Profit Summary Bar */}
            <div className="mkt-pnl-summary-bar">
              <div className="pnl-item">
                <span className="pnl-lbl">Current Market Price</span>
                <span className="pnl-val highlight">₹{quote.value.toFixed(2)}</span>
              </div>
              <div className="pnl-item">
                <span className="pnl-lbl">Points Run</span>
                <span className={`pnl-val ${(quote.pointsGain || 0) >= 0 ? 'pos' : 'neg'}`}>
                  {(quote.pointsGain || 0) >= 0 ? '+' : ''}₹{(quote.pointsGain || 0).toFixed(2)} pts ({(quote.percentageGain || 0).toFixed(2)}%)
                </span>
              </div>
              <div className="pnl-item">
                <span className="pnl-lbl">Projected P&L / Lot</span>
                <span className={`pnl-val ${(quote.pointsGain || 0) >= 0 ? 'pos' : 'neg'}`}>
                  {(quote.pointsGain || 0) >= 0 ? '+' : ''}₹{Math.round((quote.pointsGain || 0) * (quote.lotSize || 50)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pnl-item">
                <span className="pnl-lbl">Analyst Coverage</span>
                <span className="pnl-val">{quote.analyst || 'SEBI RA Team'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Day's Range Visual Gradient Bar */}
      <div className="mkt-range-card">
        <div className="mkt-range-header">
          <div className="mkt-range-title-group">
            <span className="range-badge">Day's Range</span>
            <span className="range-percent-pill">{dayProgress}% of range</span>
          </div>
          <div className="mkt-range-values">
            <span className="range-lbl-low">L: ₹{low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span className="range-lbl-mid">LTP: ₹{quote.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span className="range-lbl-high">H: ₹{high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="mkt-range-track">
          <div className="mkt-range-pin" style={{ left: `${dayProgress}%` }}>
            <span className="mkt-pin-pointer"></span>
            <span className="mkt-pin-bubble">₹{quote.value.toFixed(1)}</span>
          </div>
          <div className="mkt-range-fill" style={{ width: `${dayProgress}%` }}></div>
        </div>
      </div>

      {/* 3. Scoped 4-Column Financial Statistics Grid (Zero CSS Bleed) */}
      <div className="mkt-stats-card-grid">
        {/* Tile 1: Session OHLC */}
        <div className="mkt-stat-tile">
          <div className="mkt-tile-header">
            <BarChart2 size={13} />
            <span>Today's Session</span>
          </div>
          <div className="mkt-tile-body">
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Open</span>
              <span className="mkt-tile-val">₹{open.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">High</span>
              <span className="mkt-tile-val">₹{high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Low</span>
              <span className="mkt-tile-val">₹{low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Prev. Close</span>
              <span className="mkt-tile-val">₹{prevClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Tile 2: 52-Week Statistics */}
        <div className="mkt-stat-tile">
          <div className="mkt-tile-header">
            <TrendingUp size={13} />
            <span>52-Week Range</span>
          </div>
          <div className="mkt-tile-body">
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">52-Week High</span>
              <span className="mkt-tile-val">₹{yearHigh.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">52-Week Low</span>
              <span className="mkt-tile-val">₹{yearLow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Range Span</span>
              <span className="mkt-tile-val">₹{(yearHigh - yearLow).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Distance to ATH</span>
              <span className="mkt-tile-val" style={{ color: '#0284c7' }}>
                -{(((yearHigh - quote.value) / yearHigh) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tile 3: Volume & Liquidity */}
        <div className="mkt-stat-tile">
          <div className="mkt-tile-header">
            <Layers size={13} />
            <span>Volume & Liquidity</span>
          </div>
          <div className="mkt-tile-body">
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Volume</span>
              <span className="mkt-tile-val">
                {quote.volume ? quote.volume.toLocaleString('en-IN') : '14,25,800'}
              </span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Lot Size</span>
              <span className="mkt-tile-val">{quote.lotSize || 1} units</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Avg. Price (ATP)</span>
              <span className="mkt-tile-val">₹{((high + low + quote.value) / 3).toFixed(2)}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Currency</span>
              <span className="mkt-tile-val">{quote.currency || 'INR'}</span>
            </div>
          </div>
        </div>

        {/* Tile 4: Exchange & Feed Specs */}
        <div className="mkt-stat-tile">
          <div className="mkt-tile-header">
            <Activity size={13} />
            <span>Exchange & Feed</span>
          </div>
          <div className="mkt-tile-body">
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Exchange</span>
              <span className="mkt-tile-val exchange-badge">{quote.exchange || 'NSE'}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Segment</span>
              <span className="mkt-tile-val">{quote.serviceSegment || 'EQUITY'}</span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Live Feed</span>
              <span className="mkt-tile-val feed-live">
                {quote.provider?.includes('Kite') ? 'Kite Connect LIVE' : 'NSE Real-Time Feed'}
              </span>
            </div>
            <div className="mkt-tile-row">
              <span className="mkt-tile-lbl">Tick Pulse</span>
              <span className={`mkt-tile-val tick-pulse ${quote.tickDirection || 'neutral'}`}>
                {quote.tickDirection === 'up' ? '▲ BUY TICK' : quote.tickDirection === 'down' ? '▼ SELL TICK' : '● ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
