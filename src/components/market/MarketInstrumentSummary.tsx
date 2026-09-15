import React from 'react';
import { MarketQuote } from '../../types';
import { MarketStatus } from './MarketStatus';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Target, 
  ShieldAlert, 
  Zap,
  ArrowUpRight 
} from 'lucide-react';

interface MarketInstrumentSummaryProps {
  quote: MarketQuote;
  lastUpdated?: string | null;
}

export const MarketInstrumentSummary: React.FC<MarketInstrumentSummaryProps> = ({
  quote,
  lastUpdated
}) => {
  const isUp = quote.change >= 0;
  const isZero = quote.change === 0;

  const isCall = !!(quote.callType && quote.entryPrice);
  const entry = quote.entryPrice || 0;
  const t1 = quote.target1 || 0;
  const t2 = quote.target2 || 0;
  const sl = quote.stopLoss || 0;

  const isTgt2Hit = quote.targetHit === 'TGT2' || (t2 > 0 && quote.value >= t2);
  const isTgt1Hit = quote.targetHit === 'TGT1' || (t1 > 0 && quote.value >= t1);
  const isSLHit = quote.targetHit === 'SL' || (sl > 0 && quote.value <= sl);
  const isInProfit = entry > 0 && quote.value > entry;

  return (
    <div className="market-instrument-summary card">
      <div className="summary-left-block">
        {/* Symbol, Exchange, and Type Badges */}
        <div className="summary-symbol-row">
          <h2 className="summary-symbol-title">{quote.label}</h2>
          <span className="summary-exchange-badge">{quote.exchange || 'NSE'}</span>
          <span className={`summary-type-badge type-${quote.type}`}>
            {quote.type.toUpperCase()}
          </span>

          {quote.serviceSegment && (
            <span className="summary-segment-badge">{quote.serviceSegment}</span>
          )}
        </div>

        {/* Full Instrument Symbol & Expiry */}
        <div className="summary-meta-row">
          <span className="summary-full-symbol">{quote.symbol}</span>
          {quote.expiry && (
            <span className="summary-expiry-pill">Exp: {quote.expiry}</span>
          )}
          {quote.analyst && (
            <span className="summary-analyst-pill">RA: {quote.analyst}</span>
          )}
        </div>
      </div>

      {/* RA Call / Put Status Banner if option or advisory call */}
      {isCall && (
        <div className="summary-call-block">
          <div className="call-header">
            <span className={`call-type-chip ${quote.callType === 'BUY' ? 'call-buy' : 'call-sell'}`}>
              {quote.callType} CALL
            </span>
            {isTgt2Hit ? (
              <span className="target-chip tgt2-hit">
                <Zap size={12} /> TGT 2 HIT
              </span>
            ) : isTgt1Hit ? (
              <span className="target-chip tgt1-hit">
                <Target size={12} /> TGT 1 HIT
              </span>
            ) : isSLHit ? (
              <span className="target-chip sl-hit">
                <ShieldAlert size={12} /> STOP LOSS
              </span>
            ) : isInProfit ? (
              <span className="target-chip in-profit">
                <ArrowUpRight size={12} /> IN PROFIT
              </span>
            ) : (
              <span className="target-chip active-call">ACTIVE</span>
            )}
          </div>

          <div className="call-metrics-grid">
            <div className="call-metric">
              <span className="metric-lbl">Entry</span>
              <span className="metric-val">₹{entry.toFixed(1)}</span>
            </div>
            <div className="call-metric">
              <span className="metric-lbl">T1</span>
              <span className={`metric-val ${isTgt1Hit ? 'metric-hit' : ''}`}>₹{t1.toFixed(1)}</span>
            </div>
            <div className="call-metric">
              <span className="metric-lbl">T2</span>
              <span className={`metric-val ${isTgt2Hit ? 'metric-hit' : ''}`}>₹{t2.toFixed(1)}</span>
            </div>
            <div className="call-metric">
              <span className="metric-lbl">SL</span>
              <span className="metric-val metric-sl">₹{sl.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Price & Change Block */}
      <div className="summary-right-block">
        <div className="summary-price-wrap">
          <span className="summary-ltp">
            {quote.currency === 'INR' ? '₹' : '$'}
            {quote.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>

          <div className={`summary-change-badge ${isUp ? 'change-pos' : isZero ? 'change-zero' : 'change-neg'}`}>
            {isUp ? <TrendingUp size={14} /> : isZero ? <Minus size={14} /> : <TrendingDown size={14} />}
            <span>{isUp ? '+' : ''}{quote.change.toFixed(2)}</span>
            <span>({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Status and Last Updated */}
        <div className="summary-status-row">
          <MarketStatus 
            status={quote.marketStatus} 
            dataStatus={quote.dataStatus} 
            provider={quote.provider} 
          />
          {lastUpdated && (
            <span className="summary-time-pill" title="Last feed update time">
              <Clock size={11} /> {lastUpdated} IST
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
