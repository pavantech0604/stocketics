import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';

interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  suffix: string;
}

const SMS_TEMPLATES: SMSTemplate[] = [
  {
    id: 'tpl-1',
    name: 'NIFTY Intraday Call (Options)',
    body: 'STOCKETICS RESEARCH: BUY NIFTY 24950 CE ABOVE 135 SL 110 TARGET 165/190. MAINTAIN STRICT RISK DISCLOSURE.',
    suffix: 'SEBI RA INH000008921. INVESTMENTS IN SECURITIES ARE SUBJECT TO MARKET RISKS.'
  },
  {
    id: 'tpl-2',
    name: 'BankNIFTY Expiry Momentum',
    body: 'STOCKETICS ALERT: BUY BANKNIFTY 51400 PE AT 210 SL 175 TGT 255/290. INTRADAY ONLY. TRAIL SL AFTER TARGET 1.',
    suffix: 'STOCKETICS SECURITIES. FOR REAL-TIME DESK SUPPORT CALL 080-6891000.'
  },
  {
    id: 'tpl-3',
    name: 'Risk Management / Stop Loss Update',
    body: 'URGENT TRADING NOTICE: TRAIL STOP LOSS FOR NIFTY CALL TO COST 135 AS TARGET 1 HAS BEEN HIT. BOOK 50% PROFIT NOW.',
    suffix: 'STOCKETICS WEALTH TECH LTD.'
  },
  {
    id: 'tpl-4',
    name: 'Free Trial Advisory Activation',
    body: 'WELCOME: YOUR 3-DAY RESEARCH TRIAL WITH STOCKETICS IS NOW ACTIVE. REAL-TIME MARKET CALLS WILL BE SENT VIA SMS.',
    suffix: 'VISIT STOCKETICS.COM FOR SEBI DISCLOSURES.'
  }
];

export const ManagerSMSView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [recipient, setRecipient] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [writerSMS, setWriterSMS] = useState('');
  const [suffix, setSuffix] = useState('SEBI RA INH000008921. INVESTMENTS IN SECURITIES ARE SUBJECT TO MARKET RISKS.');
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dispatchLog, setDispatchLog] = useState<{ id: string; time: string; mobile: string; message: string }[]>([]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = SMS_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setWriterSMS(tpl.body);
      setSuffix(tpl.suffix);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) {
      showToast('Please specify recipient mobile number or broadcast group.', 'warning');
      return;
    }
    if (!writerSMS.trim()) {
      showToast('Please type SMS content before sending.', 'warning');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newLog = {
        id: `sms-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        mobile: recipient,
        message: `${writerSMS} ${suffix}`
      };
      setDispatchLog(prev => [newLog, ...prev]);
      showToast(`SMS successfully dispatched to ${recipient} via DLT Gateway!`, 'success');
      setRecipient('');
      setWriterSMS('');
    }, 450);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip (Matching Reference Image 7) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={15} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Header with << Back Button (Matching Reference Image 7) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="page-title-ref">SMS</h1>
        <button 
          type="button"
          className="client-back-btn"
          onClick={() => setActiveTab('dashboard')}
          title="Return to Dashboard"
        >
          &lt;&lt; Back
        </button>
      </div>

      {/* SMS Form Card (Matching Reference Image 7) */}
      <div className="sms-panel-card">
        <h2 className="messages-section-title" style={{ marginBottom: '1.25rem' }}>SMS</h2>

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top Row: Mobile / Recipient + Select Template */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input 
              type="text"
              placeholder="Mobile Number (e.g. +91 98450 78210 or 'All Active Clients')"
              className="client-filter-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ width: '100%', height: '38px', borderRadius: 4, padding: '0.4rem 0.8rem' }}
              required
            />

            <select 
              className="client-filter-select"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              style={{ width: '100%', height: '38px', borderRadius: 4, padding: '0.4rem 0.8rem' }}
            >
              <option value="">Select Template</option>
              {SMS_TEMPLATES.map(tpl => (
                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
              ))}
            </select>
          </div>

          {/* Writer SMS Textarea */}
          <div>
            <textarea 
              rows={4}
              placeholder="Writer SMS"
              className="form-control"
              value={writerSMS}
              onChange={(e) => setWriterSMS(e.target.value)}
              style={{ width: '100%', resize: 'vertical', borderRadius: 4, background: '#f8fafc', border: '1px solid #cbd5e1' }}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>DLT Registered Template ID: #DLT-892182</span>
              <span>{writerSMS.length} characters (approx {Math.ceil(writerSMS.length / 160) || 1} SMS credits)</span>
            </div>
          </div>

          {/* Suffix Textarea */}
          <div>
            <textarea 
              rows={2}
              placeholder="Suffix"
              className="form-control"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              style={{ width: '100%', resize: 'vertical', borderRadius: 4, background: '#f8fafc', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* Send Button matching Image 7 */}
          <div>
            <button 
              type="submit"
              className="sms-send-btn-blue"
              disabled={isSending}
            >
              {isSending ? 'Sending Broadcast...' : 'Send'}
            </button>
          </div>
        </form>

        {/* Live Broadcast Log if any dispatched */}
        {dispatchLog.length > 0 && (
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
              Recent SMS Dispatches Today ({dispatchLog.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dispatchLog.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 6, fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>{item.mobile}</span>
                    <span style={{ margin: '0 0.5rem', color: '#94a3b8' }}>•</span>
                    <span style={{ color: '#334155' }}>{item.message.slice(0, 70)}...</span>
                  </div>
                  <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.75rem' }}>Sent at {item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guidance Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
