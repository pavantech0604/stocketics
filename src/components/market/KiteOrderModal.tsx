import React, { useState } from 'react';
import { MarketQuote } from '../../types';
import { useApp } from '../../state/store';
import { X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface KiteOrderModalProps {
  quote: MarketQuote | null;
  initialType?: 'BUY' | 'SELL';
  isOpen: boolean;
  onClose: () => void;
}

export const KiteOrderModal: React.FC<KiteOrderModalProps> = ({
  quote,
  initialType = 'BUY',
  isOpen,
  onClose,
}) => {
  const { theme, showToast } = useApp();
  const isDark = theme === 'dark';
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>(initialType);
  const [productType, setProductType] = useState<'MIS' | 'CNC'>('MIS');
  const [validity, setValidity] = useState<'DAY' | 'IOC'>('DAY');
  const [priceType, setPriceType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  
  const [quantity, setQuantity] = useState<number>(quote?.lotSize || (quote?.type === 'option' ? 50 : 1));
  const [limitPrice, setLimitPrice] = useState<string>(quote ? quote.value.toFixed(2) : '0.00');
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !quote) return null;

  const currentPrice = priceType === 'MARKET' ? quote.value : parseFloat(limitPrice) || quote.value;
  const estimatedMargin = +(currentPrice * quantity * (productType === 'MIS' ? 0.2 : 1.0)).toFixed(2);
  const totalValue = +(currentPrice * quantity).toFixed(2);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(
        `✓ ${orderType} ${quantity} ${quote.label} @ ₹${currentPrice} placed successfully (Simulated Order Executed on Kite Exchange)`,
        'success'
      );
      onClose();
    }, 600);
  };

  const isBuy = orderType === 'BUY';
  const themeColor = isBuy ? '#2563eb' : '#ea580c';
  const themeLightBg = isBuy ? 'rgba(37, 99, 235, 0.15)' : 'rgba(234, 88, 12, 0.15)';

  return (
    <div className="market-modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div 
        className="kite-order-window" 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: isDark ? '#0f172a' : '#ffffff',
          border: `1px solid ${themeColor}`,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: isDark 
            ? `0 12px 36px rgba(0, 0, 0, 0.5), 0 0 24px ${themeLightBg}`
            : '0 12px 36px rgba(0, 0, 0, 0.16)'
        }}
      >
        {/* Top Header Bar */}
        <div style={{
          background: isBuy ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'linear-gradient(135deg, #c2410c, #ea580c)',
          padding: '0.85rem 1.25rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                {orderType}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{quote.label}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{quote.exchange || 'NSE'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>
              LTP: ₹{quote.value.toFixed(2)} ({quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Toggle Buy / Sell */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '2px',
              borderRadius: 20,
              display: 'flex',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => setOrderType('BUY')}
                style={{
                  background: isBuy ? '#ffffff' : 'transparent',
                  color: isBuy ? '#1d4ed8' : '#ffffff',
                  border: 'none',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => setOrderType('SELL')}
                style={{
                  background: !isBuy ? '#ffffff' : 'transparent',
                  color: !isBuy ? '#c2410c' : '#ffffff',
                  border: 'none',
                  borderRadius: 16,
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                S
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} style={{ padding: '1.25rem' }}>
          {/* Product Type (Intraday MIS vs Longterm CNC) */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{
              flex: 1,
              padding: '0.6rem 0.75rem',
              borderRadius: 8,
              border: `1px solid ${productType === 'MIS' ? themeColor : (isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
              background: productType === 'MIS' ? themeLightBg : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: isDark ? '#ffffff' : '#0f172a'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Intraday (MIS)</div>
                <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Margin 5x Auto Square-off</div>
              </div>
              <input
                type="radio"
                name="productType"
                checked={productType === 'MIS'}
                onChange={() => setProductType('MIS')}
                style={{ accentColor: themeColor }}
              />
            </label>

            <label style={{
              flex: 1,
              padding: '0.6rem 0.75rem',
              borderRadius: 8,
              border: `1px solid ${productType === 'CNC' ? themeColor : (isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
              background: productType === 'CNC' ? themeLightBg : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: isDark ? '#ffffff' : '#0f172a'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Overnight (NRML/CNC)</div>
                <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Full Cash Margin</div>
              </div>
              <input
                type="radio"
                name="productType"
                checked={productType === 'CNC'}
                onChange={() => setProductType('CNC')}
                style={{ accentColor: themeColor }}
              />
            </label>
          </div>

          {/* Quantity & Price Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.35rem' }}>
                Quantity (Lot: {quote.lotSize || (quote.type === 'option' ? 50 : 1)})
              </label>
              <input
                type="number"
                min={1}
                step={quote.lotSize || (quote.type === 'option' ? 25 : 1)}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                  borderRadius: 6,
                  padding: '8px 12px',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.35rem' }}>
                Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                disabled={priceType === 'MARKET'}
                value={priceType === 'MARKET' ? quote.value.toFixed(2) : limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                style={{
                  width: '100%',
                  background: priceType === 'MARKET' 
                    ? (isDark ? 'rgba(255, 255, 255, 0.02)' : '#e2e8f0') 
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'),
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                  borderRadius: 6,
                  padding: '8px 12px',
                  color: priceType === 'MARKET' 
                    ? (isDark ? '#94a3b8' : '#64748b') 
                    : (isDark ? '#ffffff' : '#0f172a'),
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Order Type Toggle (Market vs Limit) */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setPriceType('MARKET')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 6,
                border: priceType === 'MARKET' ? `1px solid ${themeColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
                background: priceType === 'MARKET' ? themeLightBg : (isDark ? 'transparent' : '#f8fafc'),
                color: priceType === 'MARKET' ? (isDark ? '#ffffff' : themeColor) : (isDark ? '#94a3b8' : '#64748b'),
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Market Order
            </button>
            <button
              type="button"
              onClick={() => setPriceType('LIMIT')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 6,
                border: priceType === 'LIMIT' ? `1px solid ${themeColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
                background: priceType === 'LIMIT' ? themeLightBg : (isDark ? 'transparent' : '#f8fafc'),
                color: priceType === 'LIMIT' ? (isDark ? '#ffffff' : themeColor) : (isDark ? '#94a3b8' : '#64748b'),
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Limit Order
            </button>
          </div>

          {/* Margin & Total Summary */}
          <div style={{
            background: isDark ? 'rgba(0, 0, 0, 0.3)' : '#f8fafc',
            border: `1px solid ${isDark ? 'transparent' : '#e2e8f0'}`,
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem'
          }}>
            <div>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Margin Required: </span>
              <strong style={{ color: isDark ? '#38bdf8' : '#0284c7', fontFamily: 'var(--font-mono, monospace)' }}>₹{estimatedMargin.toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Total Value: </span>
              <strong style={{ color: isDark ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>₹{totalValue.toLocaleString()}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1'}`,
                color: isDark ? '#94a3b8' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '10px',
                borderRadius: 8,
                background: themeColor,
                border: 'none',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: `0 4px 14px ${themeLightBg}`
              }}
            >
              {isSubmitting ? (
                <span>Routing to Exchange...</span>
              ) : (
                <>
                  <span>Place {orderType} Order</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
