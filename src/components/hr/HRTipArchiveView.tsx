import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Download, 
  Plus, 
  XCircle, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Search,
  X
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';

export type TipArchiveMode = 'sent-tips' | 'open-call' | 'closed-call';

interface ClosedCallRecord {
  id: number;
  sentBy: string;
  service: string;
  scriptType: string;
  scriptName: string;
  shareLot: string | number;
  type: 'BUY' | 'SELL';
  entryPrice: string;
  target1: number;
  target2: number;
  target3: string;
  stopLoss: number;
  closedPrice: number;
  openTime: string;
  closeTime: string;
  point: number;
  pointPositive: boolean;
}

const INITIAL_CLOSED_RECORDS: ClosedCallRecord[] = [
  {
    id: 1,
    sentBy: 'Kiran Kumar B P',
    service: 'INDEX OPTION',
    scriptType: 'INDEX OPTION',
    scriptName: 'NIFTY',
    shareLot: 2,
    type: 'BUY',
    entryPrice: '140-150',
    target1: 190,
    target2: 220,
    target3: '-',
    stopLoss: 120,
    closedPrice: 140,
    openTime: '2026-09-07 12:41:14',
    closeTime: '2026-09-07 15:27:49',
    point: 0,
    pointPositive: false
  },
  {
    id: 2,
    sentBy: 'Kiran Kumar B P',
    service: 'INDEX OPTION',
    scriptType: 'INDEX OPTION',
    scriptName: 'SENSEX',
    shareLot: 2,
    type: 'BUY',
    entryPrice: '360',
    target1: 460,
    target2: 520,
    target3: '-',
    stopLoss: 260,
    closedPrice: 380,
    openTime: '2026-09-07 12:05:15',
    closeTime: '2026-09-07 15:28:27',
    point: 20,
    pointPositive: true
  },
  {
    id: 3,
    sentBy: 'Sirajul Fasal M',
    service: 'INDEX OPTION',
    scriptType: 'INDEX OPTION',
    scriptName: 'BANKNIFTY',
    shareLot: 3,
    type: 'BUY',
    entryPrice: '280-290',
    target1: 340,
    target2: 390,
    target3: '-',
    stopLoss: 240,
    closedPrice: 345,
    openTime: '2026-09-06 09:45:10',
    closeTime: '2026-09-06 11:20:18',
    point: 55,
    pointPositive: true
  }
];

interface Props {
  defaultMode?: TipArchiveMode;
}

export const HRTipArchiveView: React.FC<Props> = ({ defaultMode }) => {
  const { activeTab, setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Resolve mode from activeTab or defaultMode
  const resolveInitialMode = (): TipArchiveMode => {
    if (activeTab === 'open-call') return 'open-call';
    if (activeTab === 'closed-call') return 'closed-call';
    if (activeTab === 'sent-tips') return 'sent-tips';
    return defaultMode || 'closed-call';
  };

  const [mode, setMode] = useState<TipArchiveMode>(resolveInitialMode());

  // Filter States
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-30');
  const [sentTipsDate1, setSentTipsDate1] = useState('2026-09-08');
  const [sentTipsDate2, setSentTipsDate2] = useState('2026-09-08');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [analystFilter, setAnalystFilter] = useState('All');
  const [scriptTypeFilter, setScriptTypeFilter] = useState('All');

  // Closed Records state
  const [closedRecords, setClosedRecords] = useState<ClosedCallRecord[]>(INITIAL_CLOSED_RECORDS);
  const [isAddCallModalOpen, setIsAddCallModalOpen] = useState(false);

  // New Call Form State
  const [newCallForm, setNewCallForm] = useState({
    sentBy: 'Sindhu H S',
    service: 'INDEX OPTION',
    scriptType: 'INDEX OPTION',
    scriptName: 'NIFTY 24800 CE',
    shareLot: '2',
    type: 'BUY' as 'BUY' | 'SELL',
    entryPrice: '165',
    target1: '210',
    target2: '245',
    stopLoss: '135',
    closedPrice: '212'
  });

  const handleExport = () => {
    const csvRows = [
      ['#', 'Sent By', 'Service', 'Script Type', 'Script Name', 'Share/Lot', 'Type', 'Entry Price', 'Target 1', 'Target 2', 'Stop Loss', 'Closed Price', 'Open Time', 'Close Time', 'Point'],
      ...closedRecords.map(r => [
        r.id,
        r.sentBy,
        r.service,
        r.scriptType,
        r.scriptName,
        r.shareLot,
        r.type,
        r.entryPrice,
        r.target1,
        r.target2,
        r.stopLoss,
        r.closedPrice,
        r.openTime,
        r.closeTime,
        r.point
      ])
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Tip_Archive_${mode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Tip archive records exported to CSV!', 'success');
  };

  const handleCreateClosedCall = (e: React.FormEvent) => {
    e.preventDefault();
    const entryNum = parseFloat(newCallForm.entryPrice) || 100;
    const closedNum = parseFloat(newCallForm.closedPrice) || 100;
    const points = Math.round(closedNum - entryNum);

    const record: ClosedCallRecord = {
      id: closedRecords.length + 1,
      sentBy: newCallForm.sentBy,
      service: newCallForm.service,
      scriptType: newCallForm.scriptType,
      scriptName: newCallForm.scriptName,
      shareLot: newCallForm.shareLot,
      type: newCallForm.type,
      entryPrice: newCallForm.entryPrice,
      target1: parseFloat(newCallForm.target1) || 0,
      target2: parseFloat(newCallForm.target2) || 0,
      target3: '-',
      stopLoss: parseFloat(newCallForm.stopLoss) || 0,
      closedPrice: closedNum,
      openTime: '2026-09-08 10:15:00',
      closeTime: '2026-09-08 14:30:00',
      point: points,
      pointPositive: points >= 0
    };

    setClosedRecords(prev => [record, ...prev]);
    setIsAddCallModalOpen(false);
    showToast(`Archived closed call for ${record.scriptName}`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ {mode === 'sent-tips' ? 'Dashboard' : 'Messenger'}</span>
          </span>
        </div>
      </div>

      {/* Header & Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1 className="page-title-ref" style={{ margin: 0 }}>
            {mode === 'sent-tips' && 'Sent Tips'}
            {mode === 'open-call' && 'Open Calls'}
            {mode === 'closed-call' && 'Close Calls'}
          </h1>

          {/* Quick Sub-mode Switcher */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              onClick={() => setMode('sent-tips')}
              className={`btn btn-sm ${mode === 'sent-tips' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
            >
              Sent Tips
            </button>
            <button 
              onClick={() => setMode('open-call')}
              className={`btn btn-sm ${mode === 'open-call' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
            >
              Open Calls
            </button>
            <button 
              onClick={() => setMode('closed-call')}
              className={`btn btn-sm ${mode === 'closed-call' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
            >
              Close Calls
            </button>
          </div>
        </div>

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

      {/* VIEW 1: Sent Tips (Image 6) */}
      {mode === 'sent-tips' && (
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '6px', 
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.75rem'
        }}>
          {/* Top Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <input 
              type="text"
              value={sentTipsDate1}
              onChange={(e) => setSentTipsDate1(e.target.value)}
              className="input-field"
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem' }}
            />
            <input 
              type="text"
              value={sentTipsDate2}
              onChange={(e) => setSentTipsDate2(e.target.value)}
              className="input-field"
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem' }}
            />
            <select 
              className="input-field"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All</option>
              <option value="INDEX OPTION">INDEX OPTION</option>
              <option value="EQUITY CASH">EQUITY CASH</option>
              <option value="COMMODITY">COMMODITY</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' }} />

          {/* Red Alert Banner Matching Image 6 */}
          <div style={{ 
            background: '#ff4d4f', 
            color: '#ffffff', 
            borderRadius: '6px', 
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.95rem',
            fontWeight: 600
          }}>
            <XCircle size={22} style={{ color: '#ffffff' }} />
            <span>No Calls Available...</span>
          </div>
        </div>
      )}

      {/* VIEW 2: Open Calls (Image 7) */}
      {mode === 'open-call' && (
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '6px', 
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.75rem'
        }}>
          {/* Card Title & Export Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Tip Archive
            </h2>

            <button 
              onClick={handleExport}
              className="btn btn-primary"
              style={{ 
                background: '#00a8ff', 
                borderColor: '#00a8ff', 
                color: '#ffffff', 
                fontWeight: 600, 
                padding: '0.4rem 1.25rem', 
                borderRadius: '4px',
                fontSize: '0.88rem'
              }}
            >
              Export
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <input 
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field"
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem' }}
            />
            <input 
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field"
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem' }}
            />
            <select 
              className="input-field"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All</option>
              <option value="INDEX OPTION">INDEX OPTION</option>
              <option value="EQUITY CASH">EQUITY CASH</option>
            </select>
            <select 
              className="input-field"
              value={analystFilter}
              onChange={(e) => setAnalystFilter(e.target.value)}
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All</option>
              <option value="Kiran Kumar B P">Kiran Kumar B P</option>
              <option value="Sirajul Fasal M">Sirajul Fasal M</option>
              <option value="Sindhu H S">Sindhu H S</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' }} />

          {/* 14-Column Table Header Schema Matching Image 7 */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.82rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>#</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Sent By</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Service</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Script Type</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Script Name</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Share/Lot</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Type</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Entry Price</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Target1</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Target2</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Target3</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Stop/Loss</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Open Time</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Action</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Red Alert Banner Matching Image 7 */}
          <div style={{ 
            background: '#ff4d4f', 
            color: '#ffffff', 
            borderRadius: '6px', 
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.95rem',
            fontWeight: 600
          }}>
            <XCircle size={22} style={{ color: '#ffffff' }} />
            <span>No Calls Available...</span>
          </div>
        </div>
      )}

      {/* VIEW 3: Close Calls (Image 8) */}
      {mode === 'closed-call' && (
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '6px', 
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          padding: '1.75rem'
        }}>
          {/* Card Title & Buttons: Add & Export */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Tip Archive
            </h2>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button 
                onClick={() => setIsAddCallModalOpen(true)}
                className="btn btn-primary"
                style={{ 
                  background: '#00a8ff', 
                  borderColor: '#00a8ff', 
                  color: '#ffffff', 
                  fontWeight: 600, 
                  padding: '0.4rem 1.25rem', 
                  borderRadius: '4px',
                  fontSize: '0.88rem'
                }}
              >
                Add
              </button>

              <button 
                onClick={handleExport}
                className="btn btn-primary"
                style={{ 
                  background: '#00a8ff', 
                  borderColor: '#00a8ff', 
                  color: '#ffffff', 
                  fontWeight: 600, 
                  padding: '0.4rem 1.25rem', 
                  borderRadius: '4px',
                  fontSize: '0.88rem'
                }}
              >
                Export
              </button>
            </div>
          </div>

          {/* Row 1 Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            <input 
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field"
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem' }}
            />
            <input 
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field"
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem' }}
            />
            <select 
              className="input-field"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All</option>
              <option value="INDEX OPTION">INDEX OPTION</option>
              <option value="EQUITY CASH">EQUITY CASH</option>
            </select>
            <select 
              className="input-field"
              value={analystFilter}
              onChange={(e) => setAnalystFilter(e.target.value)}
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All</option>
              <option value="Kiran Kumar B P">Kiran Kumar B P</option>
              <option value="Sirajul Fasal M">Sirajul Fasal M</option>
            </select>
          </div>

          {/* Row 2 Filter: Script Type ▾ */}
          <div style={{ marginBottom: '1.25rem' }}>
            <select 
              className="input-field"
              value={scriptTypeFilter}
              onChange={(e) => setScriptTypeFilter(e.target.value)}
              style={{ width: '160px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="Script Type">Script Type</option>
              <option value="INDEX OPTION">INDEX OPTION</option>
              <option value="EQUITY CASH">EQUITY CASH</option>
              <option value="FUTURE">FUTURE</option>
            </select>
          </div>

          {/* Table Matching Image 8 with Dark Charcoal Header */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#334155', color: '#ffffff' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>#</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Sent by</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Service</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Script Type</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Script Name</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Share/Lot</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Type</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Entry Price</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Target1</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Target2</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Target3</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Stop/Loss</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Closed Price</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Open Time</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>Close Time</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>POINT</th>
                </tr>
              </thead>
              <tbody>
                {closedRecords.map((item, idx) => (
                  <tr 
                    key={item.id}
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      background: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', color: '#1e293b' }}>{item.id}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{item.sentBy}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', color: '#475569' }}>{item.service}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', color: '#475569' }}>{item.scriptType}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{item.scriptName}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', textAlign: 'center' }}>{item.shareLot}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem' }}>
                      <span className={item.type === 'BUY' ? 'badge badge-success' : 'badge badge-danger'}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem' }}>{item.entryPrice}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem' }}>{item.target1}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem' }}>{item.target2}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem' }}>{item.target3}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem' }}>{item.stopLoss}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', fontWeight: 700 }}>{item.closedPrice}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.78rem', color: '#64748b' }}>{item.openTime}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.78rem', color: '#64748b' }}>{item.closeTime}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>
                      {item.pointPositive ? (
                        <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {item.point} ▲
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>
                          {item.point}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Closed Call Modal */}
      {isAddCallModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCallModalOpen(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '600px', width: '94%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>+ Add Closed Trade to Archive</h3>
              <button 
                className="btn-icon" 
                onClick={() => setIsAddCallModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClosedCall} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Script Name</label>
                  <input 
                    type="text" 
                    value={newCallForm.scriptName}
                    onChange={(e) => setNewCallForm({ ...newCallForm, scriptName: e.target.value })}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Service</label>
                  <input 
                    type="text" 
                    value={newCallForm.service}
                    onChange={(e) => setNewCallForm({ ...newCallForm, service: e.target.value })}
                    className="input-field" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Entry Price</label>
                  <input 
                    type="text" 
                    value={newCallForm.entryPrice}
                    onChange={(e) => setNewCallForm({ ...newCallForm, entryPrice: e.target.value })}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Closed Price</label>
                  <input 
                    type="text" 
                    value={newCallForm.closedPrice}
                    onChange={(e) => setNewCallForm({ ...newCallForm, closedPrice: e.target.value })}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Lots / Qty</label>
                  <input 
                    type="text" 
                    value={newCallForm.shareLot}
                    onChange={(e) => setNewCallForm({ ...newCallForm, shareLot: e.target.value })}
                    className="input-field" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddCallModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#00a8ff', borderColor: '#00a8ff' }}>
                  Save to Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
