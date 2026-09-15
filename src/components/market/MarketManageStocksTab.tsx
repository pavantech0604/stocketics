import React, { useState } from 'react';
import { MarketQuote, MarketInstrumentConfig } from '../../types';
import { useApp } from '../../state/store';
import {
  Sliders,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface MarketManageStocksTabProps {
  quotes: MarketQuote[];
}

export const MarketManageStocksTab: React.FC<MarketManageStocksTabProps> = () => {
  const {
    theme,
    customInstruments,
    addMarketInstrument,
    removeMarketInstrument,
    toggleInstrumentVisibility,
    showToast
  } = useApp();

  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<'option' | 'stock' | 'index' | 'commodity' | 'forex'>('option');
  const [newExchange, setNewExchange] = useState('NSE NFO');
  const [newBasePrice, setNewBasePrice] = useState('');

  // Optional call parameters
  const [newCallAction, setNewCallAction] = useState<'BUY' | 'SELL'>('BUY');
  const [newEntryPrice, setNewEntryPrice] = useState('');
  const [newTarget1, setNewTarget1] = useState('');
  const [newStopLoss, setNewStopLoss] = useState('');
  const [newLotSize, setNewLotSize] = useState('50');

  const trendingPresets = [
    {
      label: 'NIFTY 24900 CE',
      symbol: 'NSE:NIFTY24SEP24900CE',
      type: 'option' as const,
      baseValue: 145.00,
      exchange: 'NSE NFO',
      callType: 'BUY' as const,
      entryPrice: 125.00,
      target1: 175.00,
      target2: 215.00,
      stopLoss: 95.00,
      lotSize: 50,
      expiry: '26-SEP-2024'
    },
    {
      label: 'BANKNIFTY 52000 PE',
      symbol: 'NSE:BANKNIFTY24SEP52000PE',
      type: 'option' as const,
      baseValue: 260.00,
      exchange: 'NSE NFO',
      callType: 'BUY' as const,
      entryPrice: 220.00,
      target1: 310.00,
      target2: 360.00,
      stopLoss: 170.00,
      lotSize: 15,
      expiry: '25-SEP-2024'
    },
    {
      label: 'SENSEX 82000 CE',
      symbol: 'BSE:SENSEX24SEP82000CE',
      type: 'option' as const,
      baseValue: 290.00,
      exchange: 'BSE BFO',
      callType: 'BUY' as const,
      entryPrice: 240.00,
      target1: 350.00,
      target2: 410.00,
      stopLoss: 190.00,
      lotSize: 10,
      expiry: '27-SEP-2024'
    },
    {
      label: 'HDFC BANK',
      symbol: 'NSE:HDFCBANK',
      type: 'stock' as const,
      baseValue: 1642.50,
      exchange: 'NSE',
      lotSize: 1
    },
    {
      label: 'INFY',
      symbol: 'NSE:INFY',
      type: 'stock' as const,
      baseValue: 1894.20,
      exchange: 'NSE',
      lotSize: 1
    },
    {
      label: 'TATA MOTORS',
      symbol: 'NSE:TATAMOTORS',
      type: 'stock' as const,
      baseValue: 978.40,
      exchange: 'NSE',
      lotSize: 1
    },
    {
      label: 'GOLD OCT FUT',
      symbol: 'MCX:GOLD24OCTFUT',
      type: 'commodity' as const,
      baseValue: 72450.00,
      exchange: 'MCX',
      lotSize: 100
    },
    {
      label: 'CRUDE OIL OCT FUT',
      symbol: 'MCX:CRUDEOIL24OCTFUT',
      type: 'commodity' as const,
      baseValue: 5880.00,
      exchange: 'MCX',
      lotSize: 100
    }
  ];

  const handleAddPreset = (preset: any) => {
    const key = preset.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    addMarketInstrument({
      key,
      symbol: preset.symbol,
      label: preset.label,
      type: preset.type,
      currency: 'INR',
      baseValue: preset.baseValue,
      serviceSegment: preset.type === 'option' ? 'INDEX OPTION' : preset.type === 'commodity' ? 'COMMODITY' : 'EQUITY',
      exchange: preset.exchange,
      enabled: true,
      callType: preset.callType,
      entryPrice: preset.entryPrice,
      target1: preset.target1,
      target2: preset.target2,
      stopLoss: preset.stopLoss,
      lotSize: preset.lotSize,
      expiry: preset.expiry
    });
  };

  const handleCreateCustomInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newBasePrice) {
      showToast('Symbol and base price are required.', 'error');
      return;
    }

    const label = newLabel.trim() || newSymbol.trim().toUpperCase();
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const baseVal = parseFloat(newBasePrice);

    addMarketInstrument({
      key,
      symbol: newSymbol.trim().toUpperCase(),
      label,
      type: newType,
      currency: 'INR',
      baseValue: baseVal,
      exchange: newExchange,
      serviceSegment: newType === 'option' ? 'INDEX OPTION' : newType === 'commodity' ? 'COMMODITY' : 'EQUITY',
      enabled: true,
      callType: newType === 'option' && newEntryPrice ? newCallAction : undefined,
      entryPrice: newEntryPrice ? parseFloat(newEntryPrice) : undefined,
      target1: newTarget1 ? parseFloat(newTarget1) : undefined,
      target2: newTarget1 ? +(parseFloat(newTarget1) * 1.05).toFixed(2) : undefined,
      stopLoss: newStopLoss ? parseFloat(newStopLoss) : undefined,
      lotSize: newLotSize ? parseInt(newLotSize) : 1
    });

    setNewSymbol('');
    setNewLabel('');
    setNewBasePrice('');
    setNewEntryPrice('');
    setNewTarget1('');
    setNewStopLoss('');
  };

  const filteredList = customInstruments.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.exchange || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="market-manage-stocks-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))'
          : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.25)' : '#e2e8f0'}`,
        borderRadius: 12,
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: isDark 
              ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(56, 189, 248, 0.3))' 
              : 'rgba(2, 132, 199, 0.1)',
            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sliders size={18} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
              Manage Market Watchlists & Intraday Stocks
            </h3>
            <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              Configure live instruments, trending option contracts, and exchange feeds for all CRM roles
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontSize: '0.74rem', 
          color: isDark ? '#38bdf8' : '#0284c7', 
          background: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.08)', 
          padding: '4px 12px', 
          borderRadius: 16, 
          border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.2)'}` 
        }}>
          <CheckCircle2 size={13} />
          <span>Active in Watchlist: <strong>{customInstruments.filter(i => i.enabled !== false).length}</strong> / {customInstruments.length}</span>
        </div>
      </div>

      {/* 1-Click Trending Market Presets Strip */}
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
        borderRadius: 10,
        padding: '0.9rem 1.1rem',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
          <Flame size={15} style={{ color: '#f97316' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            1-Click Add Trending Market Picks
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {trendingPresets.map(preset => {
            const alreadyAdded = customInstruments.some(ci => ci.label.toLowerCase() === preset.label.toLowerCase());
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleAddPreset(preset)}
                style={{
                  background: alreadyAdded 
                    ? (isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)') 
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'),
                  border: `1px solid ${alreadyAdded 
                    ? '#10b981' 
                    : (isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1')}`,
                  color: alreadyAdded 
                    ? '#10b981' 
                    : (isDark ? '#ffffff' : '#1e293b'),
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {alreadyAdded ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                <span>{preset.label}</span>
                <span style={{ fontSize: '0.64rem', opacity: 0.75 }}>₹{preset.baseValue}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Stock / Option Contract Card */}
      <form onSubmit={handleCreateCustomInstrument} style={{
        background: isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.2)' : '#e2e8f0'}`,
        borderRadius: 10,
        padding: '1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} />
          <span>Add Custom Stock or Option Contract</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.25rem' }}>
              Symbol / Script Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NIFTY 24900 CE or INFY"
              value={newSymbol}
              onChange={e => {
                setNewSymbol(e.target.value);
                if (!newLabel) setNewLabel(e.target.value);
              }}
              style={{
                width: '100%',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                borderRadius: 6,
                padding: '7px 10px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.8rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.25rem' }}>
              Instrument Type
            </label>
            <select
              value={newType}
              onChange={e => {
                const val = e.target.value as any;
                setNewType(val);
                if (val === 'option') setNewExchange('NSE NFO');
                else if (val === 'commodity') setNewExchange('MCX');
                else setNewExchange('NSE');
              }}
              style={{
                width: '100%',
                background: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                borderRadius: 6,
                padding: '7px 10px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.8rem'
              }}
            >
              <option value="option" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>Index / Stock Option (CE/PE)</option>
              <option value="stock" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>Equity Stock</option>
              <option value="index" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>Index</option>
              <option value="commodity" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>Commodity (MCX)</option>
              <option value="forex" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>Forex</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.25rem' }}>
              Exchange
            </label>
            <select
              value={newExchange}
              onChange={e => setNewExchange(e.target.value)}
              style={{
                width: '100%',
                background: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                borderRadius: 6,
                padding: '7px 10px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.8rem'
              }}
            >
              <option value="NSE NFO" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>NSE NFO (Options & Futures)</option>
              <option value="NSE" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>NSE (Equities)</option>
              <option value="BSE" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>BSE</option>
              <option value="MCX" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>MCX (Commodities)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.25rem' }}>
              Base Price (₹) *
            </label>
            <input
              type="number"
              step="0.05"
              required
              placeholder="e.g. 145.50"
              value={newBasePrice}
              onChange={e => setNewBasePrice(e.target.value)}
              style={{
                width: '100%',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                borderRadius: 6,
                padding: '7px 10px',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.8rem'
              }}
            />
          </div>
        </div>

        {/* Optional Call Parameters for Options */}
        {newType === 'option' && (
          <div style={{
            background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f1f5f9',
            border: `1px solid ${isDark ? 'transparent' : '#e2e8f0'}`,
            borderRadius: 6,
            padding: '0.65rem 0.85rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.65rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.2rem' }}>Call Action</label>
              <select
                value={newCallAction}
                onChange={e => setNewCallAction(e.target.value as any)}
                style={{ width: '100%', background: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`, borderRadius: 4, padding: '5px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.76rem' }}
              >
                <option value="BUY" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>BUY CALL</option>
                <option value="SELL" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>SELL / SHORT</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.2rem' }}>Entry (₹)</label>
              <input
                type="number"
                step="0.05"
                placeholder="120.00"
                value={newEntryPrice}
                onChange={e => setNewEntryPrice(e.target.value)}
                style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`, borderRadius: 4, padding: '5px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.76rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.2rem' }}>Target 1 (₹)</label>
              <input
                type="number"
                step="0.05"
                placeholder="160.00"
                value={newTarget1}
                onChange={e => setNewTarget1(e.target.value)}
                style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`, borderRadius: 4, padding: '5px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.76rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.2rem' }}>Stop Loss (₹)</label>
              <input
                type="number"
                step="0.05"
                placeholder="95.00"
                value={newStopLoss}
                onChange={e => setNewStopLoss(e.target.value)}
                style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`, borderRadius: 4, padding: '5px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.76rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '0.2rem' }}>Lot Size</label>
              <input
                type="number"
                value={newLotSize}
                onChange={e => setNewLotSize(e.target.value)}
                style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`, borderRadius: 4, padding: '5px 8px', color: isDark ? '#fff' : '#0f172a', fontSize: '0.76rem' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} /> Add to Watchlist
          </button>
        </div>
      </form>

      {/* Active Watchlist Table with Smooth Scrolling */}
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
        borderRadius: 10,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {/* Header & Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
            Current Watchlist Instruments ({filteredList.length})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: 9, color: isDark ? '#94a3b8' : '#64748b' }} />
              <input
                type="text"
                placeholder="Filter instruments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                  borderRadius: 6,
                  padding: '5px 8px 5px 26px',
                  fontSize: '0.75rem',
                  color: isDark ? '#ffffff' : '#0f172a',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Smooth Scrollable Table Area */}
        <div 
          className="custom-kite-scrollbar"
          style={{
            overflowX: 'auto',
            maxHeight: '420px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0'}`,
            borderRadius: 8
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: isDark ? 'rgba(0, 0, 0, 0.3)' : '#f8fafc', borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`, color: isDark ? '#94a3b8' : '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', width: 85 }}>Status</th>
                <th style={{ padding: '8px 12px' }}>Script / Label</th>
                <th style={{ padding: '8px 12px' }}>Type</th>
                <th style={{ padding: '8px 12px' }}>Exchange</th>
                <th style={{ padding: '8px 12px' }}>Base Price</th>
                <th style={{ padding: '8px 12px' }}>Call Setup</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: 70 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    No instruments match your search filter.
                  </td>
                </tr>
              ) : (
                filteredList.map(inst => (
                  <tr
                    key={inst.key}
                    style={{
                      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'}`,
                      background: inst.enabled === false ? (isDark ? 'rgba(0, 0, 0, 0.15)' : '#f8fafc') : 'transparent',
                      opacity: inst.enabled === false ? 0.6 : 1
                    }}
                  >
                    <td style={{ padding: '8px 12px' }}>
                      <button
                        type="button"
                        onClick={() => toggleInstrumentVisibility(inst.key)}
                        style={{
                          background: inst.enabled !== false 
                            ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)') 
                            : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
                          color: inst.enabled !== false ? '#10b981' : (isDark ? '#94a3b8' : '#64748b'),
                          border: `1px solid ${inst.enabled !== false ? '#10b981' : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1')}`,
                          borderRadius: 4,
                          padding: '3px 8px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer'
                        }}
                      >
                        {inst.enabled !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{inst.enabled !== false ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {inst.label}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        background: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                        color: isDark ? '#38bdf8' : '#0284c7',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '0.66rem',
                        fontWeight: 700
                      }}>
                        {inst.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {inst.exchange || 'NSE'}
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                      ₹{inst.baseValue.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {inst.callType && inst.entryPrice ? (
                        <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontSize: '0.72rem', fontWeight: 600 }}>
                          {inst.callType} @ ₹{inst.entryPrice} | TGT: ₹{inst.target1}
                        </span>
                      ) : (
                        <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => removeMarketInstrument(inst.key)}
                        title={`Remove ${inst.label}`}
                        style={{
                          background: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 4,
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
