import React, { useState } from 'react';
import { 
  ActiveClientRecordDetailed, 
  FreeTrialRecord, 
  ClientInvoiceRecord, 
  ClientKYCData, 
  ClientEmployeeNote 
} from '../../types';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  PhoneCall, 
  PhoneOff, 
  UploadCloud, 
  Send, 
  ShieldCheck, 
  Eye, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  Check, 
  MessageSquare, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Search
} from 'lucide-react';

/* =========================================================
   1. NEW FREETRIAL REQUEST MODAL (Exact Reference Image 3)
   ========================================================= */
interface NewFreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ActiveClientRecordDetailed;
  onSubmit: (newTrial: FreeTrialRecord) => void;
}

export const NewFreeTrialModal: React.FC<NewFreeTrialModalProps> = ({
  isOpen,
  onClose,
  client,
  onSubmit
}) => {
  const [service, setService] = useState<string>('STOCK CASH');
  const [startDate, setStartDate] = useState<string>('2026-09-13');
  const [endDate, setEndDate] = useState<string>('2026-09-13');
  const [communication, setCommunication] = useState({
    SMS: true,
    Messenger: false,
    App: false,
    OnCall: false
  });

  if (!isOpen) return null;

  const servicesList = [
    'STOCK CASH',
    'STOCK FUTURE',
    'STOCK OPTION',
    'INDEX FUTURE',
    'REGISTRATION',
    'CONSULTANCY',
    'Commodity',
    'Market Pathshala'
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const commChannels: string[] = [];
    if (communication.SMS) commChannels.push('SMS');
    if (communication.Messenger) commChannels.push('Messenger');
    if (communication.App) commChannels.push('App');
    if (communication.OnCall) commChannels.push('On Call');

    const newTrial: FreeTrialRecord = {
      id: `ft-${Date.now()}`,
      product: service,
      startDate,
      endDate,
      status: 'Active',
      communication: commChannels
    };

    onSubmit(newTrial);
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '580px', width: '95%', padding: 0, overflow: 'hidden', borderRadius: '8px' }}
      >
        {/* Header matching Image 3 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155', margin: 0 }}>
            New FreeTrial Request
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSend} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Services Section */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.75rem' }}>
              Services
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '0.75rem 1rem'
            }}>
              {servicesList.map(srv => (
                <label 
                  key={srv} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: service === srv ? 700 : 500
                  }}
                >
                  <input 
                    type="radio" 
                    name="freeTrialService" 
                    checked={service === srv}
                    onChange={() => setService(srv)}
                    style={{ cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                  <span>{srv}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dates & Communication Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                Start Date
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#334155',
                  outline: 'none',
                  background: '#f8fafc'
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                End Date
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#334155',
                  outline: 'none',
                  background: '#f8fafc'
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                Communication
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={communication.SMS}
                    onChange={(e) => setCommunication({ ...communication, SMS: e.target.checked })}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <span>SMS</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={communication.Messenger}
                    onChange={(e) => setCommunication({ ...communication, Messenger: e.target.checked })}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <span>Messenger</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={communication.App}
                    onChange={(e) => setCommunication({ ...communication, App: e.target.checked })}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <span>App</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={communication.OnCall}
                    onChange={(e) => setCommunication({ ...communication, OnCall: e.target.checked })}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <span>On Call</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons matching Image 3 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
            <button 
              type="submit"
              style={{
                background: '#0ea5e9',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 2.2rem',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.35)'
              }}
            >
              Send
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                color: '#475569',
                border: 'none',
                padding: '0.55rem 1.8rem',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   2. PREVIOUS FREETRIAL MODAL (User Requested)
   ========================================================= */
interface PreviousFreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  trials: FreeTrialRecord[];
  onOpenNewTrial: () => void;
}

export const PreviousFreeTrialModal: React.FC<PreviousFreeTrialModalProps> = ({
  isOpen,
  onClose,
  trials,
  onOpenNewTrial
}) => {
  const [filter, setFilter] = useState('All');

  if (!isOpen) return null;

  const filtered = filter === 'All' 
    ? trials 
    : trials.filter(t => t.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '750px', width: '95%', padding: 0, overflow: 'hidden', borderRadius: '8px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155', margin: 0 }}>
              Previous Prospects
            </h2>
            <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {trials.length} records
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Filter By</span>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#334155',
                  background: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Approved">Approved</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <button 
              onClick={onOpenNewTrial}
              style={{
                background: '#2196f3',
                color: '#ffffff',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Prospect Request
            </button>
          </div>

          {/* Table matching user specification: # | PRODUCT | STARTDATE | END DATE | STATUS | ACTION */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.75rem', width: '40px' }}>#</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>PRODUCT</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>STARTDATE</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>END DATE</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>STATUS</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      No FreeTrial records found
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>{item.product}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>{item.startDate}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>{item.endDate}</td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: item.status === 'Active' ? '#dcfce7' : item.status === 'Expired' ? '#fee2e2' : '#fef3c7',
                          color: item.status === 'Active' ? '#15803d' : item.status === 'Expired' ? '#b91c1c' : '#b45309'
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => alert(`Resending FreeTrial alert for ${item.product} to client mobile...`)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#0284c7',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Resend
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button 
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                color: '#475569',
                border: 'none',
                padding: '0.45rem 1.25rem',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   3. PAYMENT CONFIRMATION (ADD PAYMENT) MODAL (User Requested)
   ========================================================= */
interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ActiveClientRecordDetailed;
  onSubmit: (newInvoice: ClientInvoiceRecord) => void;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  client,
  onSubmit
}) => {
  const [email, setEmail] = useState(client.email || 'shihabmorayur@gmail.com');
  const [panCard, setPanCard] = useState(client.panNo || 'BSYPC6412K');
  const [dob, setDob] = useState(client.dob || '1988-05-30');
  const [state, setState] = useState(client.state || 'Kerala');
  const [city, setCity] = useState(client.city || 'MALLAPURAM');
  const [address, setAddress] = useState(client.address || 'MALLAPURAM');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [paymentMode, setPaymentMode] = useState('NEFT/RTGS');
  const [paymentDate, setPaymentDate] = useState('2026-09-12');
  const [amount, setAmount] = useState('30000.00');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const invNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: ClientInvoiceRecord = {
      id: `inv-${Date.now()}`,
      invoiceNo: invNum,
      products: client.serviceName || 'INDEX OPTION',
      startDate: paymentDate,
      endDate: '2026-11-01',
      approveDate: paymentDate,
      paidAmt: parseFloat(amount) || 30000.00,
      status: 'Active',
      isHold: false,
      paymentMode,
      bankName,
      paymentDate,
      description,
      email,
      panCard,
      dob,
      state,
      city,
      address
    };

    onSubmit(newInvoice);
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px', width: '95%', padding: 0, overflow: 'hidden', borderRadius: '8px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155', margin: 0 }}>
            Payment Confirmation
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Row 1: Email & Pan Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Pan Card
              </label>
              <input 
                type="text" 
                value={panCard}
                onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                required
              />
            </div>
          </div>

          {/* Row 2: Dob & State & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Dob
              </label>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                State
              </label>
              <select 
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="">Select State</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                City
              </label>
              <input 
                type="text" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Select City"
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Row 3: Address */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
              Address
            </label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
              required
            />
          </div>

          {/* Row 4: Bank Name & Payment Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Bank Name
              </label>
              <select 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="">Select Bank Name</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Payment Mode
              </label>
              <select 
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="">Select Payment Mode</option>
                <option value="NEFT/RTGS">NEFT/RTGS</option>
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Row 5: Payment Date & Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Payment Date
              </label>
              <input 
                type="date" 
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Amount
              </label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                step="0.01"
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
              Description
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Payment confirmation notes or UTR / reference id..."
              style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.5rem 1.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   4. PREVIOUS INVOICES MODAL (User Requested)
   ========================================================= */
interface PreviousInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: ClientInvoiceRecord[];
  onToggleHold: (invoiceId: string) => void;
  onViewInvoice: (invoice: ClientInvoiceRecord) => void;
}

export const PreviousInvoicesModal: React.FC<PreviousInvoicesModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onToggleHold,
  onViewInvoice
}) => {
  if (!isOpen) return null;

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '980px', width: '96%', padding: 0, overflow: 'hidden', borderRadius: '8px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155', margin: 0 }}>
              Previous Invoice
            </h2>
            <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {invoices.length} Invoices
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Table matching user spec:
              # | Products | Start Date | End Date | Approve Date | Invoice No | Paid Amt | Status | Hold & Active | Edit
          */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.6rem', width: '35px' }}>#</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Products</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Start Date</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>End Date</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Approve Date</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Invoice No</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Paid Amt</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Hold & Active</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, idx) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 0.6rem', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>{inv.products}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>{inv.startDate}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>{inv.endDate}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>{inv.approveDate}</td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <button 
                          onClick={() => onViewInvoice(inv)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontWeight: 700,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          {inv.invoiceNo}
                        </button>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#166534', fontFamily: 'monospace' }}>
                        ₹{inv.paidAmt.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: inv.isHold ? '#fef3c7' : '#dcfce7',
                          color: inv.isHold ? '#b45309' : '#15803d'
                        }}>
                          {inv.isHold ? 'On Hold' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => onToggleHold(inv.id)}
                          title={inv.isHold ? 'Resume Service to Active' : 'Pause Service to Hold'}
                          style={{
                            background: inv.isHold ? '#fef3c7' : '#f1f5f9',
                            border: `1px solid ${inv.isHold ? '#f59e0b' : '#cbd5e1'}`,
                            color: inv.isHold ? '#b45309' : '#475569',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {inv.isHold ? 'Set Active' : 'Hold'}
                        </button>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => onViewInvoice(inv)}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '3px 9px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button 
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                color: '#475569',
                border: 'none',
                padding: '0.45rem 1.25rem',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   5. INVOICE PREVIEW / RECEIPT MODAL (INV-9729)
   ========================================================= */
interface InvoicePreviewModalProps {
  invoice: ClientInvoiceRecord | null;
  onClose: () => void;
  clientName: string;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  onClose,
  clientName
}) => {
  if (!invoice) return null;

  const netAmount = (invoice.paidAmt / 1.18).toFixed(2);
  const gstAmount = (invoice.paidAmt - parseFloat(netAmount)).toFixed(2);

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '650px', width: '95%', padding: '1.5rem', borderRadius: '8px', background: '#ffffff' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0284c7', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              TAX INVOICE
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Apex Research & Advisory Services Pvt. Ltd.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
              {invoice.invoiceNo}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {invoice.approveDate}</div>
          </div>
        </div>

        {/* Customer & Bill details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.82rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>BILLED TO:</div>
            <div style={{ fontWeight: 800, color: '#1e293b' }}>{clientName}</div>
            <div style={{ color: '#475569' }}>{invoice.address || 'MALLAPURAM, KERALA'}</div>
            <div style={{ color: '#475569' }}>Email: {invoice.email || 'shihabmorayur@gmail.com'}</div>
            <div style={{ color: '#475569' }}>PAN: {invoice.panCard || 'BSYPC6412K'}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>PAYMENT DETAILS:</div>
            <div>Bank: <strong>{invoice.bankName || 'HDFC Bank'}</strong></div>
            <div>Mode: <strong>{invoice.paymentMode || 'NEFT/RTGS'}</strong></div>
            <div>Payment Date: <strong>{invoice.paymentDate || invoice.approveDate}</strong></div>
            <div>Status: <span style={{ color: '#16a34a', fontWeight: 700 }}>VERIFIED & APPROVED</span></div>
          </div>
        </div>

        {/* Services table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.6rem' }}>Description</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>Period</th>
              <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.65rem 0.6rem', fontWeight: 700 }}>{invoice.products} Subscription</td>
              <td style={{ padding: '0.65rem 0.6rem', color: '#64748b' }}>{invoice.startDate} to {invoice.endDate}</td>
              <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontFamily: 'monospace' }}>{netAmount}</td>
            </tr>
            <tr style={{ color: '#64748b' }}>
              <td colSpan={2} style={{ padding: '0.35rem 0.6rem', textAlign: 'right' }}>Integrated GST (18%):</td>
              <td style={{ padding: '0.35rem 0.6rem', textAlign: 'right', fontFamily: 'monospace' }}>{gstAmount}</td>
            </tr>
            <tr style={{ fontWeight: 800, borderTop: '2px solid #cbd5e1', fontSize: '0.95rem' }}>
              <td colSpan={2} style={{ padding: '0.65rem 0.6rem', textAlign: 'right' }}>Total Paid:</td>
              <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', color: '#166534', fontFamily: 'monospace' }}>₹{invoice.paidAmt.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Printer size={14} /> Print
            </button>
            <button 
              onClick={() => alert(`Downloading PDF for ${invoice.invoiceNo}...`)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Download size={14} /> Download
            </button>
          </div>
          <button 
            onClick={onClose}
            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.45rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   6. KYC UPLOAD FORM MODAL (User Requested)
   ========================================================= */
interface KYCUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ActiveClientRecordDetailed;
  onSubmitKYC: (kyc: ClientKYCData) => void;
}

export const KYCUploadModal: React.FC<KYCUploadModalProps> = ({
  isOpen,
  onClose,
  client,
  onSubmitKYC
}) => {
  const [fullName, setFullName] = useState(client.clientName || 'Shihabudheen Chelembra');
  const [mobileNumber, setMobileNumber] = useState(client.mobile || '7012826397');
  const [emailAddress, setEmailAddress] = useState(client.email || 'shihabmorayur@gmail.com');
  const [panNo, setPanNo] = useState(client.panNo || 'BSYPC6412K');
  const [formType, setFormType] = useState<'Individual' | 'Corporate' | 'Partnership' | 'HUF' | 'NRI'>('Individual');
  const [fileName, setFileName] = useState<string>(client.kycData?.fileName || '');
  const [fileSize, setFileSize] = useState<string>(client.kycData?.fileSize || '');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      alert('Please choose a KYC form / document to upload.');
      return;
    }

    const updatedKYC: ClientKYCData = {
      fullName,
      mobile: mobileNumber,
      email: emailAddress,
      panNo: panNo.toUpperCase(),
      formType,
      fileName,
      fileSize: fileSize || '1.4 MB',
      status: 'Approved',
      uploadedAt: '12-Sep-2026'
    };

    onSubmitKYC(updatedKYC);
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '540px', width: '95%', padding: 0, overflow: 'hidden', borderRadius: '8px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#0284c7" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155', margin: 0 }}>
              Active Client KYC Verification
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* KYC Form Fields matching user spec:
            Full Name*: Shihabudheen Chelembra
            Mobile Number*: 7012826397
            Email address*: shihabmorayur@gmail.com
            Pan No.*: BSYPC6412K
            Form Type*: Individual
            Upload Kyc Form*: No file chosen
        */}
        <form onSubmit={handleUploadSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
              Full Name*
            </label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Mobile Number*
              </label>
              <input 
                type="text" 
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Email address*
              </label>
              <input 
                type="email" 
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Pan No.*
              </label>
              <input 
                type="text" 
                value={panNo}
                onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
                Form Type*
              </label>
              <select 
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', background: '#fff' }}
                required
              >
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Partnership">Partnership</option>
                <option value="HUF">HUF</option>
                <option value="NRI">NRI</option>
              </select>
            </div>
          </div>

          {/* Upload KYC Form */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
              Upload Kyc Form*
            </label>
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '6px',
              padding: '1.25rem',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer'
            }}>
              <UploadCloud size={28} color="#0284c7" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                {fileName ? fileName : 'Choose file or drag here'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                {fileName ? `File size: ${fileSize}` : 'Supports PDF, JPG, PNG (Max 10MB)'}
              </div>
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.5rem 1.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Upload & Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   7. STORYLINE / AUDIT TRAIL MODAL (User Requested)
   ========================================================= */
interface StorylineModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ActiveClientRecordDetailed;
}

export const StorylineModal: React.FC<StorylineModalProps> = ({
  isOpen,
  onClose,
  client
}) => {
  if (!isOpen) return null;

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', width: '95%', padding: 0, overflow: 'hidden', borderRadius: '8px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155', margin: 0 }}>
              Storyline • {client.clientName}
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Client Code: {client.clientCode} | Mobile: {client.mobile}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', maxHeight: '500px', overflowY: 'auto' }}>
          <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Storyline item 1: Invoices */}
            {client.invoices.map(inv => (
              <div key={inv.id} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.85rem', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a', border: '2px solid #fff' }} />
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{inv.approveDate} • PAYMENT CONFIRMED</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  Invoice {inv.invoiceNo} generated for ₹{inv.paidAmt.toFixed(2)} ({inv.products})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Paid via {inv.paymentMode} ({inv.bankName}). Validity: {inv.startDate} to {inv.endDate}.
                </div>
              </div>
            ))}

            {/* Storyline item 2: KYC */}
            {client.kycData?.status && (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.85rem', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#0284c7', border: '2px solid #fff' }} />
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{client.kycData.uploadedAt || '11-Sep-2026'} • KYC VERIFICATION</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  KYC Form Uploaded ({client.kycData.formType}) - {client.kycData.status}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  PAN: {client.kycData.panNo} | File: {client.kycData.fileName || 'KYC_Form.pdf'}
                </div>
              </div>
            )}

            {/* Storyline item 3: Employee Notes / Calls */}
            {client.notesHistory.map(note => (
              <div key={note.id} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.85rem', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', border: '2px solid #fff' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{note.timestamp}</span>
                  <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {note.authorName} ({note.authorRole || 'Advisor'})
                  </span>
                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {note.response}
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#1e293b', marginTop: '4px', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  {note.text}
                </div>
              </div>
            ))}

            {/* Storyline item 4: Free Trials */}
            {client.freeTrials.map(trial => (
              <div key={trial.id} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.85rem', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6', border: '2px solid #fff' }} />
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{trial.startDate} • FREE TRIAL ISSUED</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  Free Trial for {trial.product} ({trial.startDate} to {trial.endDate})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                  Channels: {trial.communication.join(', ')} | Status: {trial.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button onClick={onClose} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.45rem 1.25rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   8. C2C (CLICK TO CALL) SIMULATOR MODAL
   ========================================================= */
interface C2CDialerModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ActiveClientRecordDetailed;
  onSaveCallNote: (note: ClientEmployeeNote) => void;
  currentEmployeeName: string;
}

export const C2CDialerModal: React.FC<C2CDialerModalProps> = ({
  isOpen,
  onClose,
  client,
  onSaveCallNote,
  currentEmployeeName
}) => {
  const [callDuration, setCallDuration] = useState(14);
  const [disposition, setDisposition] = useState('CLOSED OWN');
  const [callNoteText, setCallNoteText] = useState('');

  if (!isOpen) return null;

  const handleEndCall = () => {
    if (callNoteText.trim()) {
      const newNote: ClientEmployeeNote = {
        id: `note-${Date.now()}`,
        authorName: currentEmployeeName || 'Ravi R Raju',
        authorRole: 'Advisory Executive',
        timestamp: '12-Sep-2026 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: disposition,
        text: callNoteText.trim()
      };
      onSaveCallNote(newNote);
    }
    onClose();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div 
        className="tips-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px', width: '95%', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
          <PhoneCall size={28} />
        </div>

        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>
          Call Connected
        </h3>
        <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
          {client.clientName} ({client.mobile})
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
          Call Duration: 00:{callDuration < 10 ? '0' + callDuration : callDuration}
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
              Call Disposition Response*
            </label>
            <select 
              value={disposition}
              onChange={(e) => setDisposition(e.target.value)}
              style={{ width: '100%', padding: '0.45rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              <option value="CLOSED OWN">CLOSED OWN</option>
              <option value="INTERESTED">INTERESTED</option>
              <option value="FOLLOW UP">FOLLOW UP</option>
              <option value="CALL BACK">CALL BACK</option>
              <option value="FREE TRIAL">FREE TRIAL REQUEST</option>
              <option value="NOT REACHABLE">NOT REACHABLE</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.2rem' }}>
              Add Call Notes / Description
            </label>
            <textarea 
              value={callNoteText}
              onChange={(e) => setCallNoteText(e.target.value)}
              placeholder="Enter call notes to be visible to all employees..."
              rows={2}
              style={{ width: '100%', padding: '0.45rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button 
            onClick={handleEndCall}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <PhoneOff size={15} /> End Call & Log Notes
          </button>
        </div>
      </div>
    </div>
  );
};
