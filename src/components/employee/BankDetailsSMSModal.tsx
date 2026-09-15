import React, { useState } from 'react';
import { useApp } from '../../state/store';
import {
  Building2,
  Send,
  Lock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  MessageSquare,
  ShieldCheck,
  X,
  CreditCard,
  QrCode
} from 'lucide-react';

interface BankDetailsSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClient?: {
    id: string;
    name: string;
    mobile: string;
  };
}

export const BankDetailsSMSModal: React.FC<BankDetailsSMSModalProps> = ({
  isOpen,
  onClose,
  defaultClient
}) => {
  const {
    companyBankDetails,
    sendBankDetailsSMS,
    detailedClients,
    advisoryLeads,
    showToast,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  const [selectedClientId, setSelectedClientId] = useState(defaultClient?.id || '');
  const [recipientName, setRecipientName] = useState(defaultClient?.name || '');
  const [recipientMobile, setRecipientMobile] = useState(defaultClient?.mobile || '');
  const [includeUPI, setIncludeUPI] = useState(true);
  const [customNote, setCustomNote] = useState('Kindly share payment confirmation screenshot after transaction.');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  // Compile list of available clients/leads for employee selection
  const clientOptions = [
    ...detailedClients.map(c => ({ id: c.id, name: c.clientName, phone: c.mobile, type: 'Client' })),
    ...advisoryLeads.map(l => ({ id: l.id, name: l.clientName, phone: l.phone, type: 'Lead' }))
  ];

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clientOptions.find(c => c.id === clientId);
    if (found) {
      setRecipientName(found.name);
      setRecipientMobile(found.phone);
    }
  };

  const previewMessage = `Dear ${recipientName || 'Client'}, please find our official company bank details for Stocketics Advisory subscription:
• Account Name: ${companyBankDetails.accountName}
• Bank: ${companyBankDetails.bankName}
• Account No: ${companyBankDetails.accountNumber}
• IFSC Code: ${companyBankDetails.ifscCode}
• Branch: ${companyBankDetails.branch}
${includeUPI ? `• Official UPI: ${companyBankDetails.upiId}` : ''}
${customNote ? `Note: ${customNote}` : ''}`;

  const handleSend = () => {
    if (!recipientMobile || recipientMobile.trim().length < 10) {
      showToast('Please specify a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!recipientName) {
      showToast('Please enter the client recipient name.', 'error');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      sendBankDetailsSMS(selectedClientId || 'custom-client', recipientMobile, recipientName);
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1800);
    }, 800);
  };

  const copyDetails = () => {
    navigator.clipboard.writeText(previewMessage);
    showToast('Company bank details copied to clipboard!', 'info');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark ? 'rgba(10, 17, 40, 0.78)' : 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: isDark ? '#0f172a' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#e2e8f0'}`,
          borderRadius: 20,
          boxShadow: isDark 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(59, 130, 246, 0.15)' 
            : '0 20px 45px rgba(0, 0, 0, 0.1)',
          color: isDark ? '#f8fafc' : '#0f172a',
          padding: 24,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Building2 size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Dispatch Bank Details SMS
              </h3>
              <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                Directly deliver verified company billing accounts to clients
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Security Notice */}
        <div
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(2, 132, 199, 0.08)',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(2, 132, 199, 0.25)'}`,
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.78rem',
            color: isDark ? '#93c5fd' : '#0369a1',
            marginBottom: 18
          }}
        >
          <ShieldCheck size={20} color={isDark ? '#60a5fa' : '#0284c7'} style={{ flexShrink: 0 }} />
          <span>
            <strong>Company Compliance Policy:</strong> Banking parameters are locked by Management. All outgoing SMS dispatches are time-stamped and logged for regulatory audits.
          </span>
        </div>

        {/* Recipient Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: 6 }}>
              Select Active Client / Lead
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleSelectClient(e.target.value)}
              style={{
                width: '100%',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                borderRadius: 8,
                padding: '9px 12px',
                color: isDark ? '#fff' : '#0f172a',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>-- Select from directory --</option>
              {clientOptions.map((c, i) => (
                <option key={`${c.id}-${i}`} value={c.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                  {c.name} ({c.phone}) - {c.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? 'var(--text-secondary, #94a3b8)' : '#475569', display: 'block', marginBottom: 6 }}>
              Recipient Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} color={isDark ? '#94a3b8' : '#64748b'} style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={recipientMobile}
                onChange={(e) => setRecipientMobile(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '9px 12px 9px 36px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Read-Only Company Bank Account Card */}
        <div
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))' 
              : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={14} color="#f59e0b" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#f59e0b' : '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pre-Approved Bank Details (Locked)
              </span>
            </div>
            <button
              onClick={copyDetails}
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                border: `1px solid ${isDark ? 'transparent' : '#cbd5e1'}`,
                color: isDark ? '#38bdf8' : '#0284c7',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Copy size={13} /> Copy Details
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b', display: 'block', fontSize: '0.72rem' }}>Beneficiary Name</span>
              <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{companyBankDetails.accountName}</strong>
            </div>
            <div>
              <span style={{ color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b', display: 'block', fontSize: '0.72rem' }}>Bank Name</span>
              <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{companyBankDetails.bankName}</strong>
            </div>
            <div>
              <span style={{ color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b', display: 'block', fontSize: '0.72rem' }}>Account Number</span>
              <strong style={{ color: isDark ? '#38bdf8' : '#0284c7', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{companyBankDetails.accountNumber}</strong>
            </div>
            <div>
              <span style={{ color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b', display: 'block', fontSize: '0.72rem' }}>IFSC Code</span>
              <strong style={{ color: isDark ? '#38bdf8' : '#0284c7', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{companyBankDetails.ifscCode}</strong>
            </div>
            <div>
              <span style={{ color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b', display: 'block', fontSize: '0.72rem' }}>Branch</span>
              <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{companyBankDetails.branch}</strong>
            </div>
            <div>
              <span style={{ color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b', display: 'block', fontSize: '0.72rem' }}>UPI ID</span>
              <strong style={{ color: '#10b981' }}>{companyBankDetails.upiId}</strong>
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? 'var(--text-secondary, #94a3b8)' : '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={14} color={isDark ? '#60a5fa' : '#2563eb'} />
              Live SMS Preview (Delivered to {recipientMobile || 'Client'})
            </label>
            <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeUPI}
                onChange={(e) => setIncludeUPI(e.target.checked)}
              />
              Include UPI ID in SMS
            </label>
          </div>
          <div
            style={{
              background: isDark ? 'rgba(0, 0, 0, 0.4)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1'}`,
              borderRadius: 10,
              padding: 12,
              fontSize: '0.78rem',
              color: isDark ? '#cbd5e1' : '#0f172a',
              fontFamily: 'monospace',
              lineHeight: 1.5,
              whiteSpace: 'pre-line'
            }}
          >
            {previewMessage}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
              color: isDark ? '#cbd5e1' : '#475569',
              border: `1px solid ${isDark ? 'transparent' : '#cbd5e1'}`,
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            disabled={isSending || sentSuccess}
            onClick={handleSend}
            style={{
              background: sentSuccess
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 22px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: isSending || sentSuccess ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            {sentSuccess ? (
              <>
                <CheckCircle2 size={16} /> SMS Dispatched!
              </>
            ) : isSending ? (
              'Dispatching SMS...'
            ) : (
              <>
                <Send size={16} /> Send Bank Details SMS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
