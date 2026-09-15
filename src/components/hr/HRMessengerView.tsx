import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Send, 
  CheckSquare, 
  Square, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Users, 
  Zap,
  ArrowUpDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TipsModal } from '../common/TipsModal';

interface ServiceItem {
  id: string;
  name: string;
  activeSubscribers: number;
}

const AVAILABLE_SERVICES: ServiceItem[] = [
  { id: 'srv-1', name: 'INDEX OPTION', activeSubscribers: 280 },
  { id: 'srv-2', name: 'NIFTY OPTION HNI', activeSubscribers: 145 },
  { id: 'srv-3', name: 'BANK NIFTY PRO', activeSubscribers: 190 },
  { id: 'srv-4', name: 'STOCK OPTION ALPHA', activeSubscribers: 110 },
  { id: 'srv-5', name: 'EQUITY CASH MOMENTUM', activeSubscribers: 220 },
  { id: 'srv-6', name: 'MCX BULLION SPECIAL', activeSubscribers: 85 },
  { id: 'srv-7', name: 'COMMODITY ENERGY PACK', activeSubscribers: 75 },
  { id: 'srv-8', name: 'LONG TERM WEALTH ADVISORY', activeSubscribers: 310 },
  { id: 'srv-9', name: 'MARKET PATHSHALA', activeSubscribers: 160 }
];

export const HRMessengerView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'make-call' | 'option-calls' | 'open-calls' | 'close-calls'>('make-call');

  // Form Fields matching Image 4
  const [scriptType, setScriptType] = useState('Nifty Options');
  const [scriptName, setScriptName] = useState('BANKNIFTY 51200 CE');
  const [noOfSharesOrLot, setNoOfSharesOrLot] = useState('2');
  const [lotTypeSelected, setLotTypeSelected] = useState(true);
  const [lotSize, setLotSize] = useState('15');
  const [callType, setCallType] = useState('Intraday');
  const [callAction, setCallAction] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('310');
  const [target1, setTarget1] = useState('380');
  const [target2, setTarget2] = useState('440');
  const [stopLoss, setStopLoss] = useState('275');

  // Multi-service selection on Right Panel
  const [selectedServices, setSelectedServices] = useState<string[]>(['srv-1', 'srv-2', 'srv-3']);

  const isAllSelected = selectedServices.length === AVAILABLE_SERVICES.length;

  const handleToggleCheckAll = () => {
    if (isAllSelected) {
      setSelectedServices([]);
    } else {
      setSelectedServices(AVAILABLE_SERVICES.map(s => s.id));
    }
  };

  const handleToggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const totalRecipients = AVAILABLE_SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.activeSubscribers, 0);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptName.trim()) {
      showToast('Please enter a script name', 'error');
      return;
    }
    if (selectedServices.length === 0) {
      showToast('Please select at least one advisory service channel', 'error');
      return;
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Advisory call for ${scriptName} broadcast to ${totalRecipients} active clients!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb & Tips Strip (Matching Reference Image 4) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Title & Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title-ref" style={{ margin: 0 }}>Messenger</h1>

        <button 
          className="btn btn-primary"
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            background: '#00a8ff', 
            borderColor: '#00a8ff', 
            color: '#ffffff', 
            fontWeight: 600, 
            padding: '0.45rem 1.25rem', 
            borderRadius: '4px',
            fontSize: '0.88rem'
          }}
        >
          &lt;&lt; Back
        </button>
      </div>

      {/* Main Container */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '6px', 
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {/* Dark Navy Tab Bar Matching Image 4 */}
        <div style={{ 
          background: '#051d33', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 0.5rem',
          borderBottom: '2px solid #00a8ff'
        }}>
          <button
            onClick={() => setActiveSubTab('make-call')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeSubTab === 'make-call' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'make-call' ? '#051d33' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            Make Call
          </button>

          <button
            onClick={() => setActiveSubTab('option-calls')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeSubTab === 'option-calls' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'option-calls' ? '#051d33' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            Option Calls
          </button>

          <button
            onClick={() => setActiveSubTab('open-calls')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeSubTab === 'open-calls' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'open-calls' ? '#051d33' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            Open Calls
          </button>

          <button
            onClick={() => setActiveSubTab('close-calls')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeSubTab === 'close-calls' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'close-calls' ? '#051d33' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            Close Calls
          </button>
        </div>

        {/* Tab 1: Make Call Form (Matching Reference Image 4) */}
        {activeSubTab === 'make-call' && (
          <div style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '2.5rem' }}>
            {/* Left Column: Messenger Form */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                Messenger
              </h2>

              <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Script Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                    Script Type
                  </label>
                  <select 
                    value={scriptType}
                    onChange={(e) => setScriptType(e.target.value)}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="Equity Cash">Equity Cash</option>
                    <option value="Nifty Options">Nifty Options</option>
                    <option value="BankNifty Options">BankNifty Options</option>
                    <option value="Stock Options">Stock Options</option>
                    <option value="Index Futures">Index Futures</option>
                    <option value="Commodity MCX">Commodity MCX</option>
                    <option value="Forex Currency">Forex Currency</option>
                  </select>
                </div>

                {/* Script Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                    Script Name
                  </label>
                  <input 
                    type="text"
                    value={scriptName}
                    onChange={(e) => setScriptName(e.target.value)}
                    placeholder="e.g. BANKNIFTY 51200 CE"
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* No Of Shares / Lot */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                    No Of Shares / Lot
                  </label>
                  <input 
                    type="text"
                    value={noOfSharesOrLot}
                    onChange={(e) => setNoOfSharesOrLot(e.target.value)}
                    placeholder="e.g. 2"
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Lot Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                    Lot Type
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        checked={lotTypeSelected}
                        onChange={() => setLotTypeSelected(true)}
                      />
                      <span>Lot</span>
                    </label>

                    <span style={{ fontSize: '0.88rem', color: '#475569' }}>1 Lot =</span>
                    <input 
                      type="text"
                      value={lotSize}
                      onChange={(e) => setLotSize(e.target.value)}
                      style={{ width: '60px', height: '32px', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0 0.4rem', textAlign: 'center', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                {/* Call Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                    Call Type
                  </label>
                  <select 
                    value={callType}
                    onChange={(e) => setCallType(e.target.value)}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="Intraday">Intraday</option>
                    <option value="Positional">Positional</option>
                    <option value="BTST">BTST</option>
                    <option value="STBT">STBT</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Special Expiry">Special Expiry</option>
                  </select>
                </div>

                {/* Trading Targets & Action */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                    Recommendation
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setCallAction('BUY')}
                      style={{
                        padding: '0.4rem 1.25rem',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        border: '1px solid #10b981',
                        background: callAction === 'BUY' ? '#10b981' : 'transparent',
                        color: callAction === 'BUY' ? '#ffffff' : '#10b981',
                        cursor: 'pointer'
                      }}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setCallAction('SELL')}
                      style={{
                        padding: '0.4rem 1.25rem',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        border: '1px solid #ef4444',
                        background: callAction === 'SELL' ? '#ef4444' : 'transparent',
                        color: callAction === 'SELL' ? '#ffffff' : '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                {/* Price, Target & SL */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Entry Price</span>
                    <input 
                      type="text" 
                      value={entryPrice} 
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="input-field"
                      style={{ height: '34px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Target 1</span>
                    <input 
                      type="text" 
                      value={target1} 
                      onChange={(e) => setTarget1(e.target.value)}
                      className="input-field"
                      style={{ height: '34px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Target 2</span>
                    <input 
                      type="text" 
                      value={target2} 
                      onChange={(e) => setTarget2(e.target.value)}
                      className="input-field"
                      style={{ height: '34px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Stop Loss</span>
                    <input 
                      type="text" 
                      value={stopLoss} 
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="input-field"
                      style={{ height: '34px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                {/* Submit Broadcast Button */}
                <div style={{ marginTop: '0.8rem' }}>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ 
                      background: '#00a8ff', 
                      borderColor: '#00a8ff', 
                      color: '#ffffff', 
                      padding: '0.65rem 1.75rem', 
                      fontWeight: 700,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Send size={16} />
                    <span>Broadcast Call ({totalRecipients} Active Clients)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Select Services Matching Image 4 */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
                Select Services
              </h2>

              {/* Dark Navy Header with Check All */}
              <div 
                onClick={handleToggleCheckAll}
                style={{ 
                  background: '#051d33', 
                  color: '#ffffff', 
                  padding: '0.65rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={handleToggleCheckAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                    Check All
                  </span>
                </div>

                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {selectedServices.length} of {AVAILABLE_SERVICES.length} selected
                </span>
              </div>

              {/* Service Checkbox List */}
              <div style={{ 
                border: '1px solid var(--border-subtle)', 
                borderTop: 'none', 
                borderRadius: '0 0 4px 4px', 
                maxHeight: '380px', 
                overflowY: 'auto',
                background: '#fafafa'
              }}>
                {AVAILABLE_SERVICES.map((srv, idx) => {
                  const isChecked = selectedServices.includes(srv.id);
                  return (
                    <div 
                      key={srv.id}
                      onClick={() => handleToggleService(srv.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem', 
                        borderBottom: idx === AVAILABLE_SERVICES.length - 1 ? 'none' : '1px solid #f1f5f9',
                        background: isChecked ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleToggleService(srv.id)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                          {srv.name}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {srv.activeSubscribers} clients
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Option Calls View */}
        {activeSubTab === 'option-calls' && (
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
              Option Advisory Active Recommendations
            </h3>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#051d33', color: '#ffffff' }}>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Script Name</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Segment</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Action</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Entry</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>T1 / T2</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Stop Loss</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Analyst</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>NIFTY 24800 CE</td>
                    <td style={{ padding: '0.65rem' }}>Index Option</td>
                    <td style={{ padding: '0.65rem' }}><span className="badge badge-success">BUY</span></td>
                    <td style={{ padding: '0.65rem' }}>₹165</td>
                    <td style={{ padding: '0.65rem' }}>₹210 / ₹245</td>
                    <td style={{ padding: '0.65rem' }}>₹135</td>
                    <td style={{ padding: '0.65rem' }}>Aditya Roy</td>
                    <td style={{ padding: '0.65rem' }}><span className="badge badge-success">Target 2 Hit</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>BANKNIFTY 51200 CE</td>
                    <td style={{ padding: '0.65rem' }}>Index Option</td>
                    <td style={{ padding: '0.65rem' }}><span className="badge badge-success">BUY</span></td>
                    <td style={{ padding: '0.65rem' }}>₹310</td>
                    <td style={{ padding: '0.65rem' }}>₹380 / ₹440</td>
                    <td style={{ padding: '0.65rem' }}>₹275</td>
                    <td style={{ padding: '0.65rem' }}>Sneha Kapur</td>
                    <td style={{ padding: '0.65rem' }}><span className="badge badge-primary">Live CMP ₹362</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Open Calls */}
        {activeSubTab === 'open-calls' && (
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
              Market Open Positions
            </h3>
            <div style={{ padding: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '4px', marginBottom: '1rem', color: '#065f46', fontSize: '0.88rem' }}>
              Live market feed synced with NSE tick stream • Real-time trailing stop loss enabled.
            </div>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#051d33', color: '#ffffff' }}>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Script</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Entry</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>CMP</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>T1 / T2</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>SL</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>P&amp;L Points</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>RELIANCE FUT</td>
                    <td style={{ padding: '0.65rem' }}>₹2980.00</td>
                    <td style={{ padding: '0.65rem', fontWeight: 700, color: '#10b981' }}>₹3018.50</td>
                    <td style={{ padding: '0.65rem' }}>₹3020 / ₹3050</td>
                    <td style={{ padding: '0.65rem' }}>₹2950.00</td>
                    <td style={{ padding: '0.65rem', color: '#10b981', fontWeight: 800 }}>+38.50 pts</td>
                    <td style={{ padding: '0.65rem' }}>
                      <button className="btn btn-sm btn-primary" onClick={() => showToast('Trailing SL Updated to Cost!', 'success')}>
                        Trail SL
                      </button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>INFY 1860 CE</td>
                    <td style={{ padding: '0.65rem' }}>₹28.50</td>
                    <td style={{ padding: '0.65rem', fontWeight: 700, color: '#10b981' }}>₹34.20</td>
                    <td style={{ padding: '0.65rem' }}>₹35 / ₹42</td>
                    <td style={{ padding: '0.65rem' }}>₹22.00</td>
                    <td style={{ padding: '0.65rem', color: '#10b981', fontWeight: 800 }}>+5.70 pts</td>
                    <td style={{ padding: '0.65rem' }}>
                      <button className="btn btn-sm btn-success" onClick={() => showToast('Target 1 Profit Booked!', 'success')}>
                        Book T1
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Close Calls */}
        {activeSubTab === 'close-calls' && (
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
              Historical Closed Calls
            </h3>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#051d33', color: '#ffffff' }}>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Script</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Entry</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Exit Price</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Return %</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Exit Reason</th>
                    <th style={{ padding: '0.65rem', fontSize: '0.82rem' }}>Closed Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>NIFTY 24700 CE</td>
                    <td style={{ padding: '0.65rem' }}>₹140.00</td>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>₹215.00</td>
                    <td style={{ padding: '0.65rem', color: '#10b981', fontWeight: 800 }}>+53.6%</td>
                    <td style={{ padding: '0.65rem' }}><span className="badge badge-success">Target 2 Hit</span></td>
                    <td style={{ padding: '0.65rem', color: '#64748b' }}>06-Sep 10:45 AM</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>HDFCBANK FUT</td>
                    <td style={{ padding: '0.65rem' }}>₹1640.00</td>
                    <td style={{ padding: '0.65rem', fontWeight: 700 }}>₹1672.00</td>
                    <td style={{ padding: '0.65rem', color: '#10b981', fontWeight: 800 }}>+1.95%</td>
                    <td style={{ padding: '0.65rem' }}><span className="badge badge-success">Target 1 Hit</span></td>
                    <td style={{ padding: '0.65rem', color: '#64748b' }}>06-Sep 02:15 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
