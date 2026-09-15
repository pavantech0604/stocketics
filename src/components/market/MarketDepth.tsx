import React from 'react';
import { MarketQuote } from '../../types';
import { useApp } from '../../state/store';
import { Layers, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketDepthProps {
  quote: MarketQuote;
}

interface DepthRow {
  bOrders: number;
  bQty: number;
  bPrice: number;
  aPrice: number;
  aOrders: number;
  aQty: number;
}

export const MarketDepth: React.FC<MarketDepthProps> = ({ quote }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const ltp = quote.value;
  const prevClose = quote.previousClose || ltp;
  const high = quote.high || +(ltp * 1.008).toFixed(2);
  const low = quote.low || +(ltp * 0.992).toFixed(2);
  const open = quote.open || +(prevClose * 1.001).toFixed(2);

  // Derive realistic Level 2 order book around current LTP
  const tickStep = quote.type === 'commodity' ? 1.0 : quote.value > 10000 ? 5.0 : 0.05;
  
  const depthRows: DepthRow[] = [
    {
      bOrders: Math.floor(Math.random() * 8) + 3,
      bQty: Math.floor(Math.random() * 1200) + 400,
      bPrice: +(ltp - tickStep * 1).toFixed(2),
      aPrice: +(ltp + tickStep * 1).toFixed(2),
      aOrders: Math.floor(Math.random() * 8) + 3,
      aQty: Math.floor(Math.random() * 1100) + 350
    },
    {
      bOrders: Math.floor(Math.random() * 12) + 5,
      bQty: Math.floor(Math.random() * 2500) + 800,
      bPrice: +(ltp - tickStep * 2).toFixed(2),
      aPrice: +(ltp + tickStep * 2).toFixed(2),
      aOrders: Math.floor(Math.random() * 10) + 4,
      aQty: Math.floor(Math.random() * 2200) + 700
    },
    {
      bOrders: Math.floor(Math.random() * 15) + 6,
      bQty: Math.floor(Math.random() * 3200) + 1200,
      bPrice: +(ltp - tickStep * 3).toFixed(2),
      aPrice: +(ltp + tickStep * 3).toFixed(2),
      aOrders: Math.floor(Math.random() * 14) + 6,
      aQty: Math.floor(Math.random() * 2900) + 900
    },
    {
      bOrders: Math.floor(Math.random() * 20) + 8,
      bQty: Math.floor(Math.random() * 4500) + 1500,
      bPrice: +(ltp - tickStep * 4).toFixed(2),
      aPrice: +(ltp + tickStep * 4).toFixed(2),
      aOrders: Math.floor(Math.random() * 18) + 7,
      aQty: Math.floor(Math.random() * 4100) + 1400
    },
    {
      bOrders: Math.floor(Math.random() * 25) + 10,
      bQty: Math.floor(Math.random() * 6000) + 2000,
      bPrice: +(ltp - tickStep * 5).toFixed(2),
      aPrice: +(ltp + tickStep * 5).toFixed(2),
      aOrders: Math.floor(Math.random() * 22) + 9,
      aQty: Math.floor(Math.random() * 5800) + 1900
    }
  ];

  const totalBuyQty = depthRows.reduce((acc, r) => acc + r.bQty, 0);
  const totalSellQty = depthRows.reduce((acc, r) => acc + r.aQty, 0);
  const totalVolume = totalBuyQty + totalSellQty;
  const buyRatio = Math.round((totalBuyQty / (totalVolume || 1)) * 100);

  const maxQty = Math.max(...depthRows.map(r => Math.max(r.bQty, r.aQty)));

  // Lower and Upper Circuit limits
  const lowerCircuit = +(prevClose * 0.90).toFixed(2);
  const upperCircuit = +(prevClose * 1.10).toFixed(2);

  return (
    <div className="kite-depth-container" style={{
      background: isDark 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))' 
        : '#ffffff',
      border: isDark 
        ? '1px solid rgba(56, 189, 248, 0.2)' 
        : '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      color: isDark ? '#ffffff' : '#0f172a',
      fontFamily: 'var(--font-sans, system-ui)',
      boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '0.75rem', 
        paddingBottom: '0.5rem', 
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Layers size={14} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: isDark ? '#ffffff' : '#0f172a' }}>
            Market Depth (Level 2 Quotes)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem' }}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>Total Bid: {totalBuyQty.toLocaleString()}</span>
          <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>Total Offer: {totalSellQty.toLocaleString()}</span>
        </div>
      </div>

      {/* Depth Grid 5 Best Bids vs 5 Best Offers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Bid Side (Buy) */}
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '40px 1fr 1fr', 
            padding: '0.2rem 0.4rem', 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: isDark ? '#94a3b8' : '#64748b', 
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' 
          }}>
            <span>Orders</span>
            <span style={{ textAlign: 'right' }}>Qty</span>
            <span style={{ textAlign: 'right', color: '#10b981' }}>Bid Price</span>
          </div>
          {depthRows.map((row, idx) => {
            const depthWidth = Math.round((row.bQty / maxQty) * 100);
            return (
              <div
                key={`bid-${idx}`}
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 1fr',
                  padding: '0.32rem 0.4rem',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  overflow: 'hidden'
                }}
              >
                {/* Proportional background bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: `${depthWidth}%`,
                  background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
                <span style={{ position: 'relative', zIndex: 1, color: isDark ? '#94a3b8' : '#64748b' }}>{row.bOrders}</span>
                <span style={{ position: 'relative', zIndex: 1, textAlign: 'right', color: isDark ? '#f8fafc' : '#0f172a' }}>{row.bQty.toLocaleString()}</span>
                <span style={{ position: 'relative', zIndex: 1, textAlign: 'right', color: '#10b981', fontWeight: 700 }}>₹{row.bPrice.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Offer Side (Sell) */}
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 40px', 
            padding: '0.2rem 0.4rem', 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: isDark ? '#94a3b8' : '#64748b', 
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' 
          }}>
            <span style={{ color: '#ef4444' }}>Offer Price</span>
            <span style={{ textAlign: 'right' }}>Qty</span>
            <span style={{ textAlign: 'right' }}>Orders</span>
          </div>
          {depthRows.map((row, idx) => {
            const depthWidth = Math.round((row.aQty / maxQty) * 100);
            return (
              <div
                key={`offer-${idx}`}
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 40px',
                  padding: '0.32rem 0.4rem',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  overflow: 'hidden'
                }}
              >
                {/* Proportional background bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: `${depthWidth}%`,
                  background: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
                <span style={{ position: 'relative', zIndex: 1, color: '#ef4444', fontWeight: 700 }}>₹{row.aPrice.toFixed(2)}</span>
                <span style={{ position: 'relative', zIndex: 1, textAlign: 'right', color: isDark ? '#f8fafc' : '#0f172a' }}>{row.aQty.toLocaleString()}</span>
                <span style={{ position: 'relative', zIndex: 1, textAlign: 'right', color: isDark ? '#94a3b8' : '#64748b' }}>{row.aOrders}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buy vs Sell Total Ratio Bar */}
      <div style={{ 
        marginTop: '0.65rem', 
        paddingTop: '0.5rem', 
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>Buyer Dominance: {buyRatio}%</span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>Seller Dominance: {100 - buyRatio}%</span>
        </div>
        <div style={{ height: 4, width: '100%', background: '#ef4444', borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${buyRatio}%`, background: '#10b981', height: '100%' }} />
        </div>
      </div>

      {/* Lower & Upper Circuit + Key Stats Bar */}
      <div style={{
        marginTop: '0.75rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        padding: '0.5rem 0.65rem',
        background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f8fafc',
        border: isDark ? 'none' : '1px solid #e2e8f0',
        borderRadius: 6,
        fontSize: '0.72rem'
      }}>
        <div>
          <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Lower Circuit</div>
          <div style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>₹{lowerCircuit.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Upper Circuit</div>
          <div style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>₹{upperCircuit.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Day Low / High</div>
          <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>₹{low} - ₹{high}</div>
        </div>
        <div>
          <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.65rem' }}>Open / Prev Close</div>
          <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>₹{open} / ₹{prevClose}</div>
        </div>
      </div>
    </div>
  );
};
