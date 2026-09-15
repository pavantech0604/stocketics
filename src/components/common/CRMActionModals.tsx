import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { X, UserPlus, PhoneCall, ShieldAlert, Mail, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { AdvisoryService } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Add New Lead Modal (Triggered from "Add New Lead" sub-option)
export const AddNewLeadModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast, advisoryLeads, updateLeadStatus } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState<AdvisoryService>('Equity Premier');
  const [investment, setInvestment] = useState('₹5L - ₹10L');
  const [revenue, setRevenue] = useState('45000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    showToast(`Lead created successfully for ${name} (${service})`, 'success');
    setName('');
    setPhone('');
    setEmail('');
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Add New Advisory Lead</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Create an institutional or retail market prospect</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Client Full Name *</label>
            <input className="form-input" required placeholder="e.g. Ramesh Chandra Verma" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-input" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="client@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Advisory Service</label>
              <select className="form-select" value={service} onChange={e => setService(e.target.value as AdvisoryService)}>
                <option value="Equity Premier">Equity Premier</option>
                <option value="Options Strategy">Options Strategy</option>
                <option value="Commodity Momentum">Commodity Momentum</option>
                <option value="Hedge & PMS">Hedge & PMS</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Investment Bracket</label>
              <select className="form-select" value={investment} onChange={e => setInvestment(e.target.value)}>
                <option value="₹2L - ₹5L">₹2L - ₹5L</option>
                <option value="₹5L - ₹10L">₹5L - ₹10L</option>
                <option value="₹10L - ₹25L">₹10L - ₹25L</option>
                <option value="₹25L+ HNI">₹25L+ HNI</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Call Logs Modal (Triggered from "Call Logs" / "Unknown Calls" sub-option)
export const CallLogsModal: React.FC<ModalProps & { isUnknown?: boolean }> = ({ isOpen, onClose, isUnknown }) => {
  if (!isOpen) return null;

  const mockLogs = isUnknown ? [
    { id: 'u1', phone: '+91 94231 55678', time: '10:42 AM', duration: '0m 45s', status: 'Missed Call', location: 'Mumbai, MH' },
    { id: 'u2', phone: '+91 88712 90123', time: '11:15 AM', duration: '1m 20s', status: 'Callback Req', location: 'Ahmedabad, GJ' },
    { id: 'u3', phone: '+91 91024 43219', time: '01:05 PM', duration: '0m 18s', status: 'Disconnected', location: 'Bengaluru, KA' },
  ] : [
    { id: 'c1', client: 'Rajesh K. Singhania', advisor: 'Sneha Kapur', phone: '+91 98201 00401', time: '09:30 AM', duration: '8m 22s', outcome: 'Interested in Options HNI' },
    { id: 'c2', client: 'Anita Roy', advisor: 'Kabir Varma', phone: '+91 98111 00413', time: '10:15 AM', duration: '4m 10s', outcome: 'Followup scheduled for 4 PM' },
    { id: 'c3', client: 'Col. Vikram Rathore', advisor: 'Aditya Roy', phone: '+91 94140 00405', time: '11:45 AM', duration: '12m 40s', outcome: 'Payment Link Sent' },
    { id: 'c4', client: 'Pooja Kulkarni', advisor: 'Neha Reddy', phone: '+91 99220 00406', time: '01:20 PM', duration: '6m 15s', outcome: 'KYC Verification Pending' },
  ];

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isUnknown ? 'Unknown Inbound Calls Log' : 'Enterprise Telephony & Call Logs'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected to Stocketics PBX & Cloud Telephony</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{isUnknown ? 'Phone Number' : 'Client & Advisor'}</th>
                <th>Timestamp</th>
                <th>Duration</th>
                <th>{isUnknown ? 'Location' : 'Call Outcome'}</th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log: any) => (
                <tr key={log.id}>
                  <td>
                    {isUnknown ? (
                      <span className="mono-cell" style={{ fontWeight: 700 }}>{log.phone}</span>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{log.client}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned: {log.advisor} • {log.phone}</div>
                      </div>
                    )}
                  </td>
                  <td className="mono-cell">{log.time}</td>
                  <td className="mono-cell">{log.duration}</td>
                  <td>
                    <span className="status-badge status-active">
                      {isUnknown ? log.status : log.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-surface-alt)' }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

// 3. IT Problem Modal (Triggered from "IT Problem" sub-option)
export const ITProblemModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [issueType, setIssueType] = useState('Trading Terminal Connectivity');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('IT Problem Ticket #IT-8842 logged with Infrastructure Desk', 'success');
    setDescription('');
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Report IT / Terminal Problem</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency support for trading terminals, PBX, or CRM</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Issue Category</label>
            <select className="form-select" value={issueType} onChange={e => setIssueType(e.target.value)}>
              <option value="Trading Terminal Connectivity">Trading Terminal Connectivity</option>
              <option value="Cloud Telephony / PBX Audio">Cloud Telephony / PBX Audio</option>
              <option value="Demat / KYC Portal Gateway">Demat / KYC Portal Gateway</option>
              <option value="CRM Account Permissions">CRM Account Permissions</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea className="form-textarea" rows={3} required placeholder="Describe the error code or symptoms observed..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#ef4444' }}>Submit Urgent Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Mail Composer Modal
export const MailComposerModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Mail sent to ${recipient || 'selected recipients'}`, 'success');
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '34px', height: '34px' }}><Mail size={18} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Compose Client Broadcast</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stocketics Secure Email Gateway</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">To (Client Email or Group)</label>
            <input className="form-input" required placeholder="clients@stocketics-advisory.com" value={recipient} onChange={e => setRecipient(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input className="form-input" required placeholder="Market Update & Trade Recommendation..." value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Message Body</label>
            <textarea className="form-textarea" rows={4} required placeholder="Write email text..." value={body} onChange={e => setBody(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Send Email</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. SMS Alert Modal
export const SMSAlertModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [template, setTemplate] = useState('Stock Recommendation (Intraday)');
  const [message, setMessage] = useState('STOCKETICS BUY NIFTY 24500 CE @ 120 SL 90 TGT 165/190. Strictly maintain SL. SEBI Reg No: INH00000842.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('SMS Broadcast dispatched to 1,280 active advisory subscribers', 'success');
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '34px', height: '34px' }}><MessageSquare size={18} /></div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Dispatch High-Speed SMS Alert</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct DLT-approved SMS gateway</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">DLT Header Template</label>
            <select className="form-select" value={template} onChange={e => setTemplate(e.target.value)}>
              <option value="Stock Recommendation (Intraday)">Stock Recommendation (Intraday)</option>
              <option value="Market Morning Commentary">Market Morning Commentary</option>
              <option value="Payment Link Reminder">Payment Link Reminder</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">SMS Content (160 Characters)</label>
            <textarea className="form-textarea" rows={3} required value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Dispatch SMS</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. Add Client Modal (Triggered from "Add Client" sub-option)
export const AddClientModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [clientName, setClientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [servicePackage, setServicePackage] = useState('Equity Premier');
  const [panNumber, setPanNumber] = useState('');
  const [riskCategory, setRiskCategory] = useState('Moderate');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    showToast(`Client ${clientName} successfully registered under ${servicePackage}`, 'success');
    setClientName('');
    setMobile('');
    setEmail('');
    setPanNumber('');
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Register Advisory Client</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SEBI Compliant Advisory Onboarding</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Client Full Name *</label>
            <input className="form-input" required placeholder="e.g. Radhika Singhania" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input className="form-input" required placeholder="+91 98200 44102" value={mobile} onChange={e => setMobile(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">PAN Number *</label>
              <input className="form-input" required placeholder="ABCDE1234F" value={panNumber} onChange={e => setPanNumber(e.target.value.toUpperCase())} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="client@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Advisory Package</label>
              <select className="form-select" value={servicePackage} onChange={e => setServicePackage(e.target.value)}>
                <option value="Equity Premier">Equity Premier</option>
                <option value="Options Strategy">Options Strategy</option>
                <option value="Commodity Momentum">Commodity Momentum</option>
                <option value="Hedge & PMS">Hedge & PMS</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">SEBI Risk Profile Categorization</label>
            <select className="form-select" value={riskCategory} onChange={e => setRiskCategory(e.target.value)}>
              <option value="Conservative">Conservative (Capital Preservation)</option>
              <option value="Moderate">Moderate (Growth & Equity Alpha)</option>
              <option value="Aggressive">Aggressive (Derivatives & Momentum)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Complete Registration</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. Add Ticket Modal (Triggered from "Add Ticket" sub-option)
export const AddTicketModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [ticketSubject, setTicketSubject] = useState('');
  const [category, setCategory] = useState('Client Issue');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal'>('Normal');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    showToast(`Support Ticket created: #${Math.floor(1000 + Math.random() * 9000)}`, 'success');
    setTicketSubject('');
    setDescription('');
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Create Support / Internal Ticket</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log operational, trade discrepancy, or compliance tickets</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ticket Subject *</label>
            <input className="form-input" required placeholder="e.g. Trade signal delivery delay in Options" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Client Issue">Client Issue</option>
                <option value="Payment / Invoice">Payment / Invoice</option>
                <option value="Terminal / Feeds">Terminal / Feeds</option>
                <option value="Compliance Query">Compliance Query</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} required placeholder="Detailed notes on the issue..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};

