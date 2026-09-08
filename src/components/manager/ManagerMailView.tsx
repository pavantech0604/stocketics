import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Mail, 
  Send, 
  Inbox as InboxIcon, 
  FileText, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  Download,
  Trash2,
  Reply,
  X
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';

interface MailMessage {
  id: string;
  date: string;
  sendFrom: string;
  sendTo?: string;
  subject: string;
  message: string;
  file?: string;
  isRead?: boolean;
}

const INITIAL_INBOX: MailMessage[] = [
  {
    id: 'mail-1',
    date: '08-Sep-2026',
    sendFrom: 'Compliance Officer (SEBI Desk)',
    subject: 'Quarterly Research Disclosure & Audit Confirmation',
    message: 'All equity recommendations published between 01-Jun-2026 and 31-Aug-2026 must have signed audit rationale documents uploaded by Friday 5 PM.',
    file: 'SEBI_Audit_Circular_Q2.pdf'
  },
  {
    id: 'mail-2',
    date: '08-Sep-2026',
    sendFrom: 'Sirajul Fasal M (Equity Advisor)',
    subject: 'Client High-Value Renewal Request: Sruthi A S',
    message: 'Client Sruthi A S has expressed interest in upgrading to the Annual Index Options Advisory desk. Proposed package discount approved by Team Lead.',
    file: 'KYC_Verification_Ack.pdf'
  },
  {
    id: 'mail-3',
    date: '07-Sep-2026',
    sendFrom: 'Golla Yugendra (Senior Advisor)',
    subject: 'EOD Desk Report - 07 September 2026',
    message: 'Achieved 100% daily target with 51 connects and ₹35,000 in direct bookings under Index Option segment. Payment receipt verified in bank statement.'
  }
];

const INITIAL_SENT: MailMessage[] = [
  {
    id: 'sent-1',
    date: '08-Sep-2026',
    sendFrom: 'Vinod Kumar K J',
    sendTo: 'All Research Analysts & Advisors',
    subject: 'Market Volatility Guidelines for NIFTY Expiry',
    message: 'Please advise all clients to maintain strict trailing stop-losses for tomorrow expiry trades. No high-leverage naked call selling allowed.'
  }
];

export const ManagerMailView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [activeMailTab, setActiveMailTab] = useState<'inbox' | 'new-mail' | 'sent'>('inbox');
  const [inboxMessages, setInboxMessages] = useState<MailMessage[]>(INITIAL_INBOX);
  const [sentMessages, setSentMessages] = useState<MailMessage[]>(INITIAL_SENT);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState<MailMessage | null>(null);

  // New Mail Form State
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeFile, setComposeFile] = useState<string | null>(null);

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeMessage.trim()) return;

    const newSent: MailMessage = {
      id: `sent-${Date.now()}`,
      date: '08-Sep-2026',
      sendFrom: 'Vinod Kumar K J',
      sendTo: composeTo,
      subject: composeSubject,
      message: composeMessage,
      file: composeFile || undefined
    };

    setSentMessages(prev => [newSent, ...prev]);
    showToast(`Mail sent to ${composeTo} successfully!`, 'success');
    setComposeTo('');
    setComposeSubject('');
    setComposeMessage('');
    setComposeFile(null);
    setActiveMailTab('sent');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip (Matching Reference Image 6) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={15} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* Main Page Title */}
      <h1 className="page-title-ref">Messages</h1>

      {/* Messages Layout: Left Sidebar Buttons + Right Content Panel (Matching Reference Image 6) */}
      <div className="messages-layout-card">
        {/* Left Side Buttons matching Image 6 */}
        <div className="messages-nav-sidebar">
          <button 
            type="button"
            className={`msg-nav-btn ${activeMailTab === 'new-mail' ? 'active' : ''}`}
            onClick={() => {
              setActiveMailTab('new-mail');
              setSelectedMail(null);
            }}
          >
            New Mail
          </button>

          <button 
            type="button"
            className={`msg-nav-btn ${activeMailTab === 'inbox' ? 'active' : ''}`}
            onClick={() => {
              setActiveMailTab('inbox');
              setSelectedMail(null);
            }}
          >
            Inbox {inboxMessages.length > 0 && `(${inboxMessages.length})`}
          </button>

          <button 
            type="button"
            className={`msg-nav-btn ${activeMailTab === 'sent' ? 'active' : ''}`}
            onClick={() => {
              setActiveMailTab('sent');
              setSelectedMail(null);
            }}
          >
            Sent Mail
          </button>
        </div>

        {/* Right Main Content Panel matching Image 6 */}
        <div className="messages-content-panel">
          {/* INBOX VIEW (Matching Image 6) */}
          {activeMailTab === 'inbox' && (
            <div>
              <h2 className="messages-section-title">INBOX</h2>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <table className="messages-ref-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Date</th>
                      <th style={{ width: '220px' }}>Send From</th>
                      <th style={{ width: '220px' }}>Subject</th>
                      <th>Message</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inboxMessages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="messages-empty-row">
                          No record found
                        </td>
                      </tr>
                    ) : (
                      inboxMessages.map(item => (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedMail(item)}
                          style={{ cursor: 'pointer' }}
                          className="table-row-hover"
                        >
                          <td style={{ color: 'var(--text-muted)' }}>{item.date}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.sendFrom}</td>
                          <td style={{ fontWeight: 700, color: '#0284c7' }}>{item.subject}</td>
                          <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '300px' }}>
                            {item.message}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {item.file ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#0284c7', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Paperclip size={13} /> Attached
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SENT MAIL VIEW */}
          {activeMailTab === 'sent' && (
            <div>
              <h2 className="messages-section-title">SENT MAIL</h2>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <table className="messages-ref-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Date</th>
                      <th style={{ width: '220px' }}>Sent To</th>
                      <th style={{ width: '220px' }}>Subject</th>
                      <th>Message</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentMessages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="messages-empty-row">
                          No record found
                        </td>
                      </tr>
                    ) : (
                      sentMessages.map(item => (
                        <tr key={item.id} onClick={() => setSelectedMail(item)} style={{ cursor: 'pointer' }}>
                          <td style={{ color: 'var(--text-muted)' }}>{item.date}</td>
                          <td style={{ fontWeight: 600 }}>{item.sendTo}</td>
                          <td style={{ fontWeight: 700, color: '#0284c7' }}>{item.subject}</td>
                          <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '300px' }}>
                            {item.message}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}>
                              Delivered
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NEW MAIL COMPOSE VIEW */}
          {activeMailTab === 'new-mail' && (
            <div>
              <h2 className="messages-section-title">COMPOSE NEW MESSAGE</h2>

              <form onSubmit={handleSendMail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '750px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Send To (Advisor / Department / All)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. all@advisory.stocketics.com or staff name"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Subject
                  </label>
                  <input 
                    type="text"
                    placeholder="Subject of research alert, team directive, or client notice"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Message Content
                  </label>
                  <textarea 
                    rows={6}
                    placeholder="Type your official memo, instruction or response..."
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                    className="form-control"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setComposeFile(composeFile ? null : 'Market_Report_Attachment.pdf')}
                    >
                      <Paperclip size={14} />
                      <span>{composeFile ? 'File Attached (Click to remove)' : 'Attach Document'}</span>
                    </button>
                    {composeFile && (
                      <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>{composeFile}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveMailTab('inbox')}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Send size={14} />
                      <span>Send Message</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Selected Mail Detail Modal */}
      {selectedMail && (
        <div className="tips-modal-backdrop" onClick={() => setSelectedMail(null)}>
          <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="tips-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0284c7' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedMail.subject}</h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>From: {selectedMail.sendFrom} • {selectedMail.date}</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedMail(null)}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-surface-alt)', padding: '1rem', borderRadius: 8, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {selectedMail.message}
              </div>

              {selectedMail.file && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    <Paperclip size={15} color="#0284c7" />
                    <span>{selectedMail.file}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => showToast(`Downloaded ${selectedMail.file}`, 'info')}
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setComposeTo(selectedMail.sendFrom);
                    setComposeSubject(`Re: ${selectedMail.subject}`);
                    setActiveMailTab('new-mail');
                    setSelectedMail(null);
                  }}
                >
                  <Reply size={13} style={{ marginRight: 4 }} />
                  <span>Reply</span>
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedMail(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidance Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
