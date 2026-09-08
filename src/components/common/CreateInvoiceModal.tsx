import React, { useState, useEffect } from 'react';
import { ConfirmedPaymentRecord, InvoiceData } from '../../types';
import { X, CheckCircle2, Building, ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import stocketicsLogo from '../../assets/logo.jpg';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentRecord: ConfirmedPaymentRecord | null;
  onInvoiceCreated: (paymentId: string, invoiceData: InvoiceData) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  paymentRecord,
  onInvoiceCreated
}) => {
  // Form fields
  const [clientName, setClientName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [dob, setDob] = useState('1992-06-15');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pancard, setPancard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');

  // Company Bank Account Confirmation
  const [companyBank, setCompanyBank] = useState('IDFC FIRST Bank - Current A/C #10082348123 (IFSC: IDFB0040101)');
  const [utrNumber, setUtrNumber] = useState('');
  const [isBankCreditConfirmed, setIsBankCreditConfirmed] = useState(false);

  // Service Details
  const [itemDescription, setItemDescription] = useState('INDEX OPTION');
  const [subType, setSubType] = useState('NORMAL');
  const [fromDate, setFromDate] = useState('2026-09-08');
  const [toDate, setToDate] = useState('2026-10-07');

  // Commercials
  const [totalGross, setTotalGross] = useState<number>(51999);
  const [discount, setDiscount] = useState<number>(26999);
  const [paidAmount, setPaidAmount] = useState<number>(25000);

  // Auto-derived Tax figures
  const netAmount = parseFloat((paidAmount / 1.18).toFixed(2));
  const gstAmount = parseFloat((paidAmount - netAmount).toFixed(2));

  // Initialize or reset when paymentRecord opens
  useEffect(() => {
    if (paymentRecord) {
      setClientName(paymentRecord.clientName || '');
      setPhone(paymentRecord.mobile || '');
      setPaidAmount(paymentRecord.amount || 25000);
      setTotalGross(Math.round((paymentRecord.amount || 25000) * 1.8));
      setDiscount(Math.round((paymentRecord.amount || 25000) * 0.8));
      setUtrNumber(paymentRecord.reason ? `${paymentRecord.reason}-UTR` : `UTR-${Date.now().toString().slice(-8)}`);
      setIsBankCreditConfirmed(false);

      // Pre-fill email and city intelligently
      const slug = (paymentRecord.clientName || 'client').toLowerCase().replace(/\s+/g, '.');
      setEmail(`${slug}@gmail.com`);
      setStreetAddress('Commercial Business Hub, MG Road');
      setCity('MUMBAI');
      setPancard('AABCS' + Math.floor(1000 + Math.random() * 9000) + 'K');

      if (paymentRecord.description) {
        if (paymentRecord.description.toLowerCase().includes('pms')) {
          setItemDescription('HEDGE & PMS');
          setSubType('PREMIER ANNUAL');
        } else if (paymentRecord.description.toLowerCase().includes('option')) {
          setItemDescription('INDEX OPTION');
          setSubType('NORMAL');
        } else {
          setItemDescription('EQUITY PREMIER');
          setSubType('HNI QUARTERLY');
        }
      }
    }
  }, [paymentRecord]);

  if (!isOpen || !paymentRecord) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBankCreditConfirmed) {
      alert('Please confirm that the payment credit has been verified in the company bank account.');
      return;
    }

    const randomInvNo = `INV-09-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const invoiceDateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    
    const dueDateObj = new Date(now);
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    const newInvoice: InvoiceData = {
      invoiceNo: randomInvNo,
      invoiceDate: invoiceDateStr,
      dueDate: dueDateStr,
      clientName: clientName.trim(),
      fathersName: fathersName.trim(),
      dob,
      email: email.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim().toUpperCase(),
      phone: phone.trim(),
      pancard: pancard.trim().toUpperCase(),
      itemDescription,
      subType,
      fromDate,
      toDate,
      totalGross,
      discount,
      adjustment: 0,
      netAmount,
      gstAmount,
      paidAmount,
      dueAmount: 0,
      paymentMode: 'Online Bank Credit',
      bankName: paymentRecord.bank || 'IDFC BANK',
      paymentDetail: `Verified in ${companyBank.split(' - ')[0]} | Ref: ${utrNumber}`
    };

    onInvoiceCreated(paymentRecord.id, newInvoice);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}
    onClose();
  };

  return (
    <div 
      className="tips-modal-backdrop" 
      onClick={onClose} 
      style={{ 
        zIndex: 9999, 
        overflowY: 'auto', 
        padding: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="tips-modal-card" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '750px', 
          width: '95vw', 
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
            padding: '1rem 1.25rem', 
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src={stocketicsLogo} 
              alt="Logo" 
              style={{ height: '32px', borderRadius: '3px', background: '#ffffff', padding: '2px' }} 
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Create New Invoice
              </h3>
              <div style={{ fontSize: '11px', color: '#e0f2fe' }}>
                Confirm Bank Receipt & Generate Official Client Invoice
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', display: 'flex', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* SECTION 1: MANDATORY BANK CREDIT CONFIRMATION */}
          <div 
            style={{ 
              background: '#f0fdf4', 
              border: '1.5px solid #86efac', 
              borderRadius: '6px', 
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '13px', marginBottom: '0.6rem' }}>
              <Building size={16} />
              <span>Step 1: Confirm Payment in Company Bank Account</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '3px' }}>
                  Company Bank Account *
                </label>
                <select 
                  value={companyBank}
                  onChange={e => setCompanyBank(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', outline: 'none' }}
                >
                  <option value="IDFC FIRST Bank - Current A/C #10082348123 (IFSC: IDFB0040101)">
                    IDFC FIRST Bank - Current A/C #10082348123
                  </option>
                  <option value="HDFC Bank Ltd - Current A/C #50200088912341 (IFSC: HDFC0001024)">
                    HDFC Bank Ltd - Current A/C #50200088912341
                  </option>
                  <option value="ICICI Bank Ltd - Current A/C #000405012345 (IFSC: ICIC0000004)">
                    ICICI Bank Ltd - Current A/C #000405012345
                  </option>
                  <option value="State Bank of India - Current A/C #391204812301 (IFSC: SBIN0000843)">
                    State Bank of India - Current A/C #391204812301
                  </option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '3px' }}>
                  Bank Reference / UTR Number *
                </label>
                <input 
                  type="text" 
                  required
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value)}
                  placeholder="e.g. UTR-9940128912"
                  style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Verification Checkbox */}
            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                cursor: 'pointer', 
                padding: '0.6rem 0.8rem', 
                background: '#ffffff', 
                border: '1px solid #bbf7d0', 
                borderRadius: '4px',
                userSelect: 'none'
              }}
            >
              <input 
                type="checkbox" 
                checked={isBankCreditConfirmed}
                onChange={e => setIsBankCreditConfirmed(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#16a34a' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                ✓ I confirm that payment of ₹{paidAmount.toLocaleString('en-IN')} has been verified and received in the company bank account.
              </span>
            </label>
          </div>

          {/* SECTION 2: CLIENT DETAILS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b', fontWeight: 700, fontSize: '13px', marginBottom: '0.6rem' }}>
              <FileText size={15} color="#0284c7" />
              <span>Step 2: Client Bill-To Particulars</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Client Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Mobile Number *
                </label>
                <input 
                  type="text" 
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Client Email *
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  PAN Card Number *
                </label>
                <input 
                  type="text" 
                  required
                  value={pancard}
                  onChange={e => setPancard(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Father's Name
                </label>
                <input 
                  type="text" 
                  value={fathersName}
                  onChange={e => setFathersName(e.target.value)}
                  placeholder="Optional"
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Date of Birth
                </label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Street Address & City *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    required
                    value={streetAddress}
                    onChange={e => setStreetAddress(e.target.value)}
                    placeholder="Street Address"
                    style={{ flex: 2, padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                  <input 
                    type="text" 
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SUBSCRIPTION SERVICE & DATES */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b', fontWeight: 700, fontSize: '13px', marginBottom: '0.6rem' }}>
              <ShieldCheck size={15} color="#0284c7" />
              <span>Step 3: Advisory Subscription Plan & Duration</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Description / Service Plan *
                </label>
                <select 
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}
                >
                  <option value="INDEX OPTION">INDEX OPTION</option>
                  <option value="EQUITY PREMIER">EQUITY PREMIER</option>
                  <option value="HEDGE & PMS">HEDGE & PMS</option>
                  <option value="STOCK RECOMMENDATIONS">STOCK RECOMMENDATIONS</option>
                  <option value="COMMODITY MOMENTUM">COMMODITY MOMENTUM</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  Sub Type
                </label>
                <input 
                  type="text" 
                  value={subType}
                  onChange={e => setSubType(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  From Date *
                </label>
                <input 
                  type="date" 
                  required
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
                  To Date *
                </label>
                <input 
                  type="date" 
                  required
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: FINANCIALS & TAX BREAKDOWN */}
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              Financials & Automatic GST Reconciliation
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Gross Total:</span>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>₹{totalGross.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Discount:</span>
                <div style={{ fontWeight: 700, color: '#ef4444' }}>- ₹{discount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Net Amount (Excl. Tax):</span>
                <div style={{ fontWeight: 700, color: '#0369a1' }}>₹{netAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>GST (18%):</span>
                <div style={{ fontWeight: 700, color: '#0369a1' }}>₹{gstAmount.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: '#e0f2fe', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                <span style={{ color: '#0369a1', fontWeight: 600 }}>Total Paid:</span>
                <div style={{ fontWeight: 800, color: '#0c4a6e', fontSize: '14px' }}>₹{paidAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.45rem 1rem', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!isBankCreditConfirmed}
              style={{ 
                background: isBankCreditConfirmed ? '#0284c7' : '#94a3b8', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '0.45rem 1.25rem', 
                fontSize: '12px', 
                fontWeight: 700, 
                cursor: isBankCreditConfirmed ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: isBankCreditConfirmed ? '0 2px 4px rgba(2, 132, 199, 0.3)' : 'none'
              }}
            >
              <CheckCircle2 size={15} />
              Confirm Bank Credit & Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
