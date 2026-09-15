import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Search, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  X,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TipsModal } from '../common/TipsModal';

interface SMSReportRecord {
  sNo: number;
  id: string;
  ownerName: string;
  mobile: string;
  message: string;
  sender: string;
  sentTime: string;
  deliveryTime: string;
  status: 'Delivered' | 'Failed / DND' | 'Pending';
  sendBy: string;
  type: 'Trading Tip' | 'Payment' | 'KYC Alert' | 'Renewal' | 'Followup';
}

const INITIAL_RECORDS: SMSReportRecord[] = [
  {
    sNo: 1,
    id: 'sms-101',
    ownerName: 'Kavita Radhakrishnan',
    mobile: '9847000403',
    message: '[STOCKETICS] BUY BANKNIFTY 51200 CE above 340. TGT1: 380, TGT2: 440, SL: 275. Valid for Intraday.',
    sender: 'STKADV',
    sentTime: '08-09-2026 09:20:12',
    deliveryTime: '08-09-2026 09:20:14',
    status: 'Delivered',
    sendBy: 'Rohan Deshmukh',
    type: 'Trading Tip'
  },
  {
    sNo: 2,
    id: 'sms-102',
    ownerName: 'Dr. Harshvardhan Jain',
    mobile: '9425000402',
    message: 'Dear Dr. Jain, your subscription renewal of Rs. 20,000 for Equity Premier is confirmed! UTR: HDFC99238411.',
    sender: 'STKFIN',
    sentTime: '08-09-2026 09:05:04',
    deliveryTime: '08-09-2026 09:05:06',
    status: 'Delivered',
    sendBy: 'Arjun Malhotra',
    type: 'Payment'
  },
  {
    sNo: 3,
    id: 'sms-103',
    ownerName: 'Col. Vikram Rathore',
    mobile: '9414000405',
    message: 'Your Stocketics SEBI Mandated Risk Profiling OTP is 492019. Valid for 10 minutes.',
    sender: 'STKSEC',
    sentTime: '08-09-2026 08:58:30',
    deliveryTime: '08-09-2026 08:58:32',
    status: 'Delivered',
    sendBy: 'System Dispatch',
    type: 'KYC Alert'
  },
  {
    sNo: 4,
    id: 'sms-104',
    ownerName: 'Manish Chawla',
    mobile: '9912000404',
    message: 'Alert: Your Equity Premier advisory service expires in 4 days. Renew today: stoketics.com/renew',
    sender: 'STKCRM',
    sentTime: '07-09-2026 16:30:15',
    deliveryTime: '07-09-2026 16:30:18',
    status: 'Delivered',
    sendBy: 'Sneha Kapur',
    type: 'Renewal'
  },
  {
    sNo: 5,
    id: 'sms-105',
    ownerName: 'Amitabh Sen',
    mobile: '9810200410',
    message: 'Stocketics Special Offer: 20% discount on Nifty Options annual renewal pack. Valid till Friday.',
    sender: 'STKADV',
    sentTime: '07-09-2026 14:15:00',
    deliveryTime: '--',
    status: 'Failed / DND',
    sendBy: 'Aditya Roy',
    type: 'Renewal'
  },
  {
    sNo: 6,
    id: 'sms-106',
    ownerName: 'Rajesh K. Singhania',
    mobile: '9820100401',
    message: '[STOCKETICS HNI] BUY TATASTEEL CASH at 152.50. TGT: 160/166, SL: 147. Daily breakout setup.',
    sender: 'STKADV',
    sentTime: '07-09-2026 10:15:22',
    deliveryTime: '07-09-2026 10:15:24',
    status: 'Delivered',
    sendBy: 'Aditya Roy',
    type: 'Trading Tip'
  },
  {
    sNo: 7,
    id: 'sms-107',
    ownerName: 'Pooja Kulkarni',
    mobile: '9922000406',
    message: 'Hello Pooja, following up regarding your advisory consultation request on BankNifty option hedging.',
    sender: 'STKCRM',
    sentTime: '07-09-2026 09:45:10',
    deliveryTime: '07-09-2026 09:45:12',
    status: 'Delivered',
    sendBy: 'Kabir Varma',
    type: 'Followup'
  }
];

export const SMSDeliveryReportView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Filter Form State (Matching Image 2)
  const [fromDate, setFromDate] = useState('08-09-2026');
  const [toDate, setToDate] = useState('08-09-2026');
  const [mobileSearch, setMobileSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('Select Type');
  const [isFiltered, setIsFiltered] = useState(false);

  const [records, setRecords] = useState<SMSReportRecord[]>(INITIAL_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<SMSReportRecord | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFiltered(true);
    showToast('Applied SMS Report search filters', 'info');
  };

  const handleReset = () => {
    setMobileSearch('');
    setSelectedStatus('All');
    setSelectedType('Select Type');
    setIsFiltered(false);
  };

  const filteredRecords = records.filter(item => {
    if (!isFiltered) return true;
    if (mobileSearch && !item.mobile.includes(mobileSearch)) return false;
    if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
    if (selectedType !== 'Select Type' && item.type !== selectedType) return false;
    return true;
  });

  const handleResend = (rec: SMSReportRecord) => {
    setRecords(prev => prev.map(r => {
      if (r.id === rec.id) {
        return {
          ...r,
          status: 'Delivered',
          deliveryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
      }
      return r;
    }));
    confetti({ particleCount: 35, spread: 50 });
    showToast(`SMS to ${rec.ownerName} (${rec.mobile}) resent via DLT priority gateway!`, 'success');
    if (selectedRecord?.id === rec.id) {
      setSelectedRecord(prev => prev ? { ...prev, status: 'Delivered', deliveryTime: 'Just now' } : null);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('SMS message copied to clipboard', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Subpage Breadcrumb Header Strip (Matching Reference Image 2) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Page Title */}
      <h1 className="page-title-ref" style={{ margin: 0 }}>SMS Report</h1>

      {/* Reference Filter Card (Matching Reference Image 2) */}
      <form onSubmit={handleSearch} className="filter-card-ref">
        {/* From Date */}
        <input 
          type="text"
          className="filter-input-ref"
          placeholder="From Date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          title="From Date (DD-MM-YYYY)"
        />

        {/* To Date */}
        <input 
          type="text"
          className="filter-input-ref"
          placeholder="To Date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          title="To Date (DD-MM-YYYY)"
        />

        {/* Mobile */}
        <input 
          type="text"
          className="filter-input-ref"
          placeholder="Mobile"
          value={mobileSearch}
          onChange={e => setMobileSearch(e.target.value)}
          title="Filter by 10-digit mobile number"
        />

        {/* Status */}
        <select 
          className="filter-select-ref"
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Delivered">Delivered</option>
          <option value="Failed / DND">Failed / DND</option>
          <option value="Pending">Pending</option>
        </select>

        {/* Select Type */}
        <select 
          className="filter-select-ref"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="Select Type">Select Type</option>
          <option value="Trading Tip">Trading Tip</option>
          <option value="Payment">Payment</option>
          <option value="KYC Alert">KYC Alert</option>
          <option value="Renewal">Renewal</option>
          <option value="Followup">Followup</option>
        </select>

        {/* Search Action Button */}
        <button type="submit" className="btn-ref-blue">
          <Search size={15} />
          <span>Search</span>
        </button>

        {isFiltered && (
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            onClick={handleReset}
            style={{ padding: '0.45rem 0.85rem' }}
          >
            Reset Filters
          </button>
        )}

        {/* Export Action */}
        <button 
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => showToast('SMS audit delivery report exported in CSV format.', 'success')}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </form>

      {/* Exact Reference Table (Matching Image 2 Columns) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ margin: 0, width: '100%', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ width: '60px', textAlign: 'center' }}>S no.</th>
                <th>Owner Name</th>
                <th>Mobile</th>
                <th>Message</th>
                <th>Sender</th>
                <th>Sent Time</th>
                <th>Delivery Time</th>
                <th>Status</th>
                <th>Send By</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((item, idx) => (
                  <tr 
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full message payload and actions"
                  >
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.ownerName}
                    </td>
                    <td className="mono-cell" style={{ color: 'var(--stocketics-blue-600)', fontWeight: 600 }}>
                      {item.mobile}
                    </td>
                    <td style={{ maxWidth: '300px', color: 'var(--text-secondary)' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        fontSize: '0.82rem'
                      }}>
                        {item.message}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        background: 'var(--bg-surface-alt)', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {item.sender}
                      </span>
                    </td>
                    <td className="mono-cell" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.sentTime}
                    </td>
                    <td className="mono-cell" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.deliveryTime}
                    </td>
                    <td>
                      <span className={`delta-badge ${
                        item.status === 'Delivered' 
                          ? 'positive' 
                          : item.status === 'Failed / DND' 
                          ? 'negative' 
                          : 'warning'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      {item.sendBy}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Record Not Found</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>No SMS logs matched your filter criteria</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SMS Inspection & Resend Modal */}
      {selectedRecord && (
        <div className="modal-backdrop" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>SMS Dispatch Audit</h3>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-alt)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Recipient</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedRecord.ownerName} ({selectedRecord.mobile})</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-alt)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>DLT Sender ID / Header</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedRecord.sender}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-alt)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Delivery Status</span>
                <span className={`delta-badge ${selectedRecord.status === 'Delivered' ? 'positive' : 'negative'}`}>
                  {selectedRecord.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Full Message Text ({selectedRecord.message.length} chars)
                </div>
                <div style={{ 
                  background: 'var(--bg-surface-alt)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '6px', 
                  padding: '0.75rem', 
                  fontSize: '0.85rem', 
                  lineHeight: '1.45',
                  color: 'var(--text-primary)'
                }}>
                  {selectedRecord.message}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopyMessage(selectedRecord.message)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Copy size={14} />
                <span>Copy Text</span>
              </button>

              {selectedRecord.status !== 'Delivered' && (
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleResend(selectedRecord)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={14} />
                  <span>Resend via Priority Route</span>
                </button>
              )}

              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Tips Modal removed */}
    </div>
  );
};
