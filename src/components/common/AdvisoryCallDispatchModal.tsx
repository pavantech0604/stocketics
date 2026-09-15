import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { MarketQuote, ActiveClientRecordDetailed } from '../../types';
import {
  Send,
  X,
  Smartphone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdvisoryCallDispatchModalProps {
  quote: MarketQuote;
  onClose: () => void;
}

export const AdvisoryCallDispatchModal: React.FC<AdvisoryCallDispatchModalProps> = ({ quote, onClose }) => {
  const { detailedClients, dispatchAdvisoryCall, currentUser } = useApp();

  // Determine segment to match
  const callSegment = useMemo(() => {
    if (quote.serviceSegment) return quote.serviceSegment.toUpperCase();
    if (quote.type === 'option') return 'INDEX OPTION';
    if (quote.type === 'commodity') return 'COMMODITY';
    return 'EQUITY PREMIER';
  }, [quote]);

  // Filter clients who have acquired / subscribed to this service
  const matchedClients = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    // Find active clients matching service segment
    const exact = detailedClients.filter(c => {
      const sName = (c.serviceName || '').toUpperCase();
      const isSegmentMatch = sName.includes(callSegment) || callSegment.includes(sName);
      const isNotExpired = !c.endDate || c.endDate >= todayStr;
      return isSegmentMatch && isNotExpired;
    });

    if (exact.length > 0) return exact;

    // Fallback: Show all active clients with option or active status
    return detailedClients.filter(c => c.tabCategory === 'clients' || c.response === 'CLOSED OWN');
  }, [detailedClients, callSegment]);

  // Selected clients state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(() => {
    return matchedClients.map(c => c.id);
  });

  // Channel toggles
  const [channels, setChannels] = useState<{ sms: boolean; email: boolean; whatsapp: boolean }>({
    sms: true,
    email: true,
    whatsapp: true
  });

  // Preview tab
  const [previewTab, setPreviewTab] = useState<'sms' | 'email'>('sms');

  // Sending progress simulation
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');

  // Toggle single client
  const toggleClient = (id: string) => {
    setSelectedClientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedClientIds.length === matchedClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(matchedClients.map(c => c.id));
    }
  };

  // SMS Text calculation
  const smsBody = useMemo(() => {
    return `[STOCKETICS] ${quote.callType || 'BUY'} ${quote.label} @ ₹${(quote.entryPrice || quote.value).toFixed(2)}. TGT1: ₹${(quote.target1 || quote.value * 1.25).toFixed(2)}, TGT2: ₹${(quote.target2 || quote.value * 1.45).toFixed(2)}, SL: ₹${(quote.stopLoss || quote.value * 0.82).toFixed(2)}. RA: ${quote.analyst || 'Aditya Roy'} (INH000008921). Standard disclosures apply.`;
  }, [quote]);

  // Handle Dispatch
  const handleDispatch = () => {
    const targets = matchedClients.filter(c => selectedClientIds.includes(c.id));
    if (targets.length === 0) return;

    const activeChannels: ('SMS' | 'Email' | 'WhatsApp')[] = [];
    if (channels.sms) activeChannels.push('SMS');
    if (channels.email) activeChannels.push('Email');
    if (channels.whatsapp) activeChannels.push('WhatsApp');

    if (activeChannels.length === 0) return;

    setIsSending(true);
    setSendProgress(20);
    setProgressStep('Connecting to DLT SMS Gateway (STKADV) & Email Dispatcher...');

    setTimeout(() => {
      setSendProgress(60);
      setProgressStep(`Broadcasting ${quote.label} to ${targets.length} service subscribers...`);
    }, 600);

    setTimeout(() => {
      setSendProgress(100);
      setProgressStep('Delivered successfully! Updating client communication timelines...');

      setTimeout(() => {
        dispatchAdvisoryCall({
          quote,
          targetClients: targets,
          channels: activeChannels,
          customMessage: smsBody
        });
        setIsSending(false);
        onClose();
      }, 500);
    }, 1300);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-container dispatch-modal-container" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="dispatch-header-icon-box">
              <Send size={20} style={{ color: '#0284c7' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 className="modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                  Dispatch Advisory Call to Active Service Clients
                </h3>
                <span className="dispatch-segment-pill">{callSegment}</span>
              </div>
              <p className="modal-subtitle" style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem' }}>
                Broadcast real-time recommendation via SMS & Email to all clients who acquired this service
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Call Highlight Strip */}
          <div className="dispatch-call-strip">
            <div className="call-strip-left">
              <span className="call-strip-symbol">{quote.label}</span>
              <span className="call-strip-sub">{quote.exchange || 'NSE NFO'} • Current Week Expiry • RA: {quote.analyst || 'Aditya Roy'}</span>
            </div>

            <div className="call-strip-matrix">
              <div className="call-matrix-col">
                <span>Action</span>
                <strong style={{ color: '#0284c7' }}>{quote.callType || 'BUY'} @ ₹{(quote.entryPrice || quote.value).toFixed(2)}</strong>
              </div>
              <div className="call-matrix-col">
                <span>Target 1</span>
                <strong style={{ color: '#10b981' }}>₹{(quote.target1 || quote.value * 1.25).toFixed(2)}</strong>
              </div>
              <div className="call-matrix-col">
                <span>Target 2</span>
                <strong style={{ color: '#10b981' }}>₹{(quote.target2 || quote.value * 1.45).toFixed(2)}</strong>
              </div>
              <div className="call-matrix-col">
                <span>Stop Loss</span>
                <strong style={{ color: '#ef4444' }}>₹{(quote.stopLoss || quote.value * 0.82).toFixed(2)}</strong>
              </div>
              <div className="call-matrix-col ltp-col">
                <span>Live LTP</span>
                <strong>₹{quote.value.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* 2-Column Dispatch Layout */}
          <div className="dispatch-two-column-layout">
            {/* Column 1: Client Selection & Channels */}
            <div className="dispatch-left-col">
              {/* Channel Selector */}
              <div className="dispatch-section-card">
                <div className="section-card-title">
                  <span>1. Select Delivery Channels</span>
                </div>
                <div className="channel-checkbox-grid">
                  <label className={`channel-toggle-label ${channels.sms ? 'is-active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={e => setChannels({ ...channels, sms: e.target.checked })}
                    />
                    <Smartphone size={15} />
                    <span>SMS (STKADV)</span>
                  </label>

                  <label className={`channel-toggle-label ${channels.email ? 'is-active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={e => setChannels({ ...channels, email: e.target.checked })}
                    />
                    <Mail size={15} />
                    <span>Email Digest</span>
                  </label>

                  <label className={`channel-toggle-label ${channels.whatsapp ? 'is-active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={channels.whatsapp}
                      onChange={e => setChannels({ ...channels, whatsapp: e.target.checked })}
                    />
                    <MessageSquare size={15} />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>

              {/* Matched Clients List */}
              <div className="dispatch-section-card" style={{ flex: 1 }}>
                <div className="section-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={15} style={{ color: '#0284c7' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                      2. Active Service Clients ({selectedClientIds.length}/{matchedClients.length} Selected)
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-toggle-all"
                    onClick={handleToggleSelectAll}
                  >
                    {selectedClientIds.length === matchedClients.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="dispatch-clients-list">
                  {matchedClients.map(c => {
                    const isSelected = selectedClientIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`dispatch-client-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleClient(c.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by row click
                        />

                        <div className="client-info-cell">
                          <div className="client-name-row">
                            <span className="client-name-text">{c.clientName}</span>
                            <span className="client-service-chip">{c.serviceName || callSegment}</span>
                          </div>

                          <div className="client-contact-row">
                            <span>📱 {c.mobile}</span>
                            <span>•</span>
                            <span>✉️ {c.email || 'Email on file'}</span>
                            {c.endDate && (
                              <>
                                <span>•</span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>Valid: {c.endDate}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {isSelected && <Check size={16} style={{ color: '#0284c7' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Live Previews */}
            <div className="dispatch-right-col">
              <div className="dispatch-section-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="preview-nav-tabs">
                  <button
                    type="button"
                    className={`preview-tab-btn ${previewTab === 'sms' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('sms')}
                  >
                    <Smartphone size={13} />
                    <span>SMS Preview (DLT)</span>
                  </button>

                  <button
                    type="button"
                    className={`preview-tab-btn ${previewTab === 'email' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('email')}
                  >
                    <Mail size={13} />
                    <span>Official Email Digest</span>
                  </button>
                </div>

                <div className="preview-content-area">
                  {previewTab === 'sms' ? (
                    <div className="phone-sms-mockup">
                      <div className="phone-notch"></div>
                      <div className="phone-sms-header">
                        <div className="sender-avatar">STK</div>
                        <div>
                          <div className="sender-name">STKADV (Stocketics SEBI RA)</div>
                          <div className="sender-sub">Verified Business SMS Gateway</div>
                        </div>
                      </div>

                      <div className="phone-bubble">
                        <p className="sms-text-content">{smsBody}</p>
                        <span className="sms-time-stamp">Just now • DLT ID: 170716892301</span>
                      </div>

                      <div className="sms-char-counter">
                        <span>Characters: {smsBody.length} (1 SMS Unit)</span>
                        <span style={{ color: '#10b981' }}>✓ 100% DLT Compliant</span>
                      </div>
                    </div>
                  ) : (
                    <div className="email-digest-mockup">
                      <div className="email-mock-header">
                        <div className="email-brand-logo">
                          <span style={{ color: '#00d2ff', fontWeight: 900 }}>STOCKETICS</span> ADVISORY
                        </div>
                        <span className="email-sebi-tag">SEBI REG: INH000008921</span>
                      </div>

                      <div className="email-mock-body">
                        <div className="email-hero-tag">INTRADAY RESEARCH RECOMMENDATION</div>
                        <h4 className="email-call-title">
                          {quote.callType || 'BUY'} {quote.label}
                        </h4>

                        <table className="email-params-table">
                          <tbody>
                            <tr>
                              <td>Recommended Entry:</td>
                              <td><strong>₹{(quote.entryPrice || quote.value).toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                              <td>Target 1:</td>
                              <td style={{ color: '#10b981' }}><strong>₹{(quote.target1 || quote.value * 1.25).toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                              <td>Target 2:</td>
                              <td style={{ color: '#10b981' }}><strong>₹{(quote.target2 || quote.value * 1.45).toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                              <td>Stop Loss:</td>
                              <td style={{ color: '#ef4444' }}><strong>₹{(quote.stopLoss || quote.value * 0.82).toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                              <td>Segment / Expiry:</td>
                              <td>{callSegment} • {quote.expiry || 'Current Expiry'}</td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="email-disclaimer-box">
                          <strong>Regulatory Disclaimer:</strong> Investment in securities market are subject to market risks. Read all related documents carefully before investing. Recommendation issued by Research Analyst: {quote.analyst || 'Aditya Roy'}.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sending Progress Overlay */}
          {isSending && (
            <div className="dispatch-progress-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0284c7' }}>
                  {progressStep}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0284c7' }}>
                  {sendProgress}%
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${sendProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-subtle, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
            Selected: <strong>{selectedClientIds.length}</strong> active clients • Channels: <strong>{[channels.sms && 'SMS', channels.email && 'Email', channels.whatsapp && 'WhatsApp'].filter(Boolean).join(', ')}</strong>
          </span>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={isSending || selectedClientIds.length === 0}
              onClick={handleDispatch}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                borderColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700
              }}
            >
              <Send size={14} />
              <span>{isSending ? 'Dispatching...' : `Dispatch Call to ${selectedClientIds.length} Active Clients`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
