import React, { useState, useEffect } from 'react';
import { 
  ActiveClientRecordDetailed, 
  ClientEmployeeNote, 
  FreeTrialRecord, 
  ClientInvoiceRecord, 
  ClientKYCData 
} from '../../types';
import { useApp } from '../../state/store';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  PhoneCall, 
  Clock, 
  FileText, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Send, 
  Save, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { 
  NewFreeTrialModal, 
  PreviousFreeTrialModal, 
  PaymentConfirmationModal, 
  PreviousInvoicesModal, 
  InvoicePreviewModal, 
  KYCUploadModal, 
  StorylineModal, 
  C2CDialerModal 
} from './ClientActionModals';

interface ClientEditViewProps {
  client: ActiveClientRecordDetailed;
  onBack: () => void;
  onSave: (updatedClient: ActiveClientRecordDetailed) => void;
  onSaveAndNext: (updatedClient: ActiveClientRecordDetailed) => void;
  onPrevClient: () => void;
  onNextClient: () => void;
}

export const ClientEditView: React.FC<ClientEditViewProps> = ({
  client,
  onBack,
  onSave,
  onSaveAndNext,
  onPrevClient,
  onNextClient
}) => {
  const { currentUser, showToast } = useApp();

  // Form states
  const [name, setName] = useState(client.clientName);
  const [mobile, setMobile] = useState(client.mobile);
  const [alternateMobile, setAlternateMobile] = useState(client.alternateMobile || '');
  const [latestResponse, setLatestResponse] = useState(client.response || 'CLOSED OWN');
  const [callBackDate, setCallBackDate] = useState(client.callbackDate || '');
  const [leadSource, setLeadSource] = useState(client.leadSource || 'INCOMING LEAD');
  const [description, setDescription] = useState(client.description || '');
  const [serviceName, setServiceName] = useState(client.serviceName || 'INDEX OPTION');
  const [startDate, setStartDate] = useState(client.startDate || new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(client.endDate || '2026-11-01');

  // Active dropdown states
  const [activeDropdown, setActiveDropdown] = useState<'prospect' | 'billing' | 'message' | 'kyc' | null>(null);

  // Modals
  const [isNewTrialOpen, setIsNewTrialOpen] = useState(false);
  const [isPrevTrialsOpen, setIsPrevTrialsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPrevInvoicesOpen, setIsPrevInvoicesOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoiceRecord | null>(null);
  const [isKYCUploadOpen, setIsKYCUploadOpen] = useState(false);
  const [isStorylineOpen, setIsStorylineOpen] = useState(false);
  const [isC2COpen, setIsC2COpen] = useState(false);
  const [dndChecked, setDndChecked] = useState<boolean | null>(null);

  // Sync state if selected client changes
  useEffect(() => {
    setName(client.clientName);
    setMobile(client.mobile);
    setAlternateMobile(client.alternateMobile || '');
    setLatestResponse(client.response || 'CLOSED OWN');
    setCallBackDate(client.callbackDate || '');
    setLeadSource(client.leadSource || 'INCOMING LEAD');
    setDescription(client.description || '');
    setServiceName(client.serviceName || 'INDEX OPTION');
    setStartDate(client.startDate || new Date().toISOString().slice(0, 10));
    setEndDate(client.endDate || '2026-11-01');
    setDndChecked(null);
  }, [client]);

  // Handle DND Registry check
  const handleCheckDND = () => {
    setDndChecked(true);
    showToast(`TRAI DND Check for ${mobile}: Clean - No Active DND Restriction. Allowed for Advisory Calls.`, 'success');
  };

  // Construct updated record with multi-employee note handling
  const buildUpdatedClient = (): ActiveClientRecordDetailed => {
    const isNewDescription = description.trim() !== (client.description || '').trim();
    let updatedHistory = [...client.notesHistory];

    if (isNewDescription && description.trim()) {
      const newNote: ClientEmployeeNote = {
        id: `note-${Date.now()}`,
        authorName: currentUser.name || client.ownerName || 'Ravi R Raju',
        authorRole: currentUser.role || 'Advisory Executive',
        timestamp: '12-Sep-2026 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: latestResponse,
        text: description.trim()
      };
      updatedHistory = [newNote, ...updatedHistory];
    }

    return {
      ...client,
      clientName: name,
      mobile,
      alternateMobile,
      response: latestResponse,
      callbackDate: callBackDate,
      leadSource,
      description,
      serviceName,
      startDate,
      endDate,
      tabCategory: 'clients',
      notesHistory: updatedHistory
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = buildUpdatedClient();
    onSave(updated);
    showToast(`Saved updates for ${updated.clientName}! Note logged for all advisors.`, 'success');
  };

  const handleSaveAndNext = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = buildUpdatedClient();
    onSaveAndNext(updated);
    showToast(`Saved ${updated.clientName} and navigated to next record.`, 'success');
  };

  // Free trial added
  const handleTrialAdded = (newTrial: FreeTrialRecord) => {
    const updatedTrials = [newTrial, ...client.freeTrials];
    const newNote: ClientEmployeeNote = {
      id: `note-${Date.now()}`,
      authorName: currentUser.name || 'Ravi R Raju',
      authorRole: 'Advisor',
      timestamp: '12-Sep-2026 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      response: 'FREE TRIAL',
      text: `Issued FreeTrial for ${newTrial.product} (${newTrial.startDate} to ${newTrial.endDate}) via ${newTrial.communication.join(', ')}.`
    };
    onSave({
      ...client,
      freeTrials: updatedTrials,
      notesHistory: [newNote, ...client.notesHistory]
    });
    showToast(`FreeTrial Request for ${newTrial.product} successfully dispatched!`, 'success');
  };

  // Payment added
  const handlePaymentAdded = (newInvoice: ClientInvoiceRecord) => {
    const updatedInvoices = [newInvoice, ...client.invoices];
    const newNote: ClientEmployeeNote = {
      id: `note-${Date.now()}`,
      authorName: currentUser.name || 'Ravi R Raju',
      authorRole: 'Advisor',
      timestamp: '12-Sep-2026 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      response: 'CLOSED OWN',
      text: `Payment confirmed: ₹${newInvoice.paidAmt} received via ${newInvoice.paymentMode} (${newInvoice.bankName}). Generated ${newInvoice.invoiceNo}.`
    };
    onSave({
      ...client,
      invoices: updatedInvoices,
      response: 'CLOSED OWN',
      notesHistory: [newNote, ...client.notesHistory]
    });
    showToast(`Payment of ₹${newInvoice.paidAmt} confirmed and Invoice ${newInvoice.invoiceNo} generated!`, 'success');
  };

  // KYC uploaded
  const handleKYCUploaded = (kyc: ClientKYCData) => {
    const newNote: ClientEmployeeNote = {
      id: `note-${Date.now()}`,
      authorName: currentUser.name || 'Ravi R Raju',
      authorRole: 'Compliance / Advisor',
      timestamp: '12-Sep-2026 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      response: 'KYC VERIFIED',
      text: `KYC document uploaded for ${kyc.fullName} (PAN: ${kyc.panNo}, Form: ${kyc.formType}). Status: Approved.`
    };
    onSave({
      ...client,
      kycData: kyc,
      notesHistory: [newNote, ...client.notesHistory]
    });
    showToast(`KYC verification completed for ${kyc.fullName}!`, 'success');
  };

  // Toggle Hold on invoice
  const handleToggleHold = (invoiceId: string) => {
    const updatedInvoices = client.invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, isHold: !inv.isHold } : inv
    );
    onSave({ ...client, invoices: updatedInvoices });
    showToast('Updated invoice hold/active state!', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={() => setActiveDropdown(null)}>
      {/* Top Header matching Image 2: Edit with << Back and << >> navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Edit
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            &lt;&lt; Back
          </button>

          <button
            type="button"
            onClick={onPrevClient}
            title="Previous Client"
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &lt;&lt;
          </button>

          <button
            type="button"
            onClick={onNextClient}
            title="Next Client"
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &gt;&gt;
          </button>
        </div>
      </div>

      {/* Action Toolbar matching Image 2:
          Prospect ▼ | Billing Info▼ | Message▼ | Dispose (red) | KYC▼ | View storyline | C2C
      */}
      <div className="client-edit-toolbar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        background: '#ffffff',
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {/* 1. Prospect Dropdown (Exact Match to User Reference Screenshot) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'prospect' ? null : 'prospect');
            }}
            style={{
              background: '#2196f3',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '4px',
              fontSize: '0.86rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(33, 150, 243, 0.2)'
            }}
          >
            Prospect <ChevronDown size={14} />
          </button>

          {activeDropdown === 'prospect' && (
            <div className="client-edit-dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              minWidth: '175px',
              padding: '4px 0',
              animation: 'fadeIn 0.15s ease'
            }}>
              <button
                onClick={() => {
                  setIsNewTrialOpen(true);
                  setActiveDropdown(null);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13.5px',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.12s, color 0.12s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                <span>Prospect Request</span>
              </button>

              <button
                onClick={() => {
                  setIsPrevTrialsOpen(true);
                  setActiveDropdown(null);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13.5px',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.12s, color 0.12s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                <span>Previous Prospects</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Billing Info Dropdown (Exact Match to User Reference Screenshot) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'billing' ? null : 'billing');
            }}
            style={{
              background: '#2196f3',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '4px',
              fontSize: '0.86rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(33, 150, 243, 0.2)'
            }}
          >
            Billing Info <ChevronDown size={14} />
          </button>

          {activeDropdown === 'billing' && (
            <div className="client-edit-dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              minWidth: '175px',
              padding: '4px 0',
              animation: 'fadeIn 0.15s ease'
            }}>
              <button
                onClick={() => {
                  setIsPaymentOpen(true);
                  setActiveDropdown(null);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13.5px',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background 0.12s, color 0.12s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                Add Payment
              </button>

              <button
                onClick={() => {
                  setIsPrevInvoicesOpen(true);
                  setActiveDropdown(null);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13.5px',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background 0.12s, color 0.12s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                Previous Invoice
              </button>
            </div>
          )}
        </div>

        {/* 3. Message Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'message' ? null : 'message');
            }}
            style={{
              background: '#2196f3',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '4px',
              fontSize: '0.86rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(33, 150, 243, 0.2)'
            }}
          >
            Message <ChevronDown size={14} />
          </button>

          {activeDropdown === 'message' && (
            <div className="client-edit-dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              minWidth: '175px',
              padding: '4px 0',
              animation: 'fadeIn 0.15s ease'
            }}>
              <button
                onClick={() => {
                  alert(`Sent SMS Advisory Alert to ${client.mobile}`);
                  setActiveDropdown(null);
                }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0284c7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
              >
                Send SMS Alert
              </button>
              <button
                onClick={() => {
                  alert(`Opened WhatsApp Chat for ${client.mobile}`);
                  setActiveDropdown(null);
                }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0284c7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
              >
                WhatsApp / Messenger
              </button>
              <button
                onClick={() => {
                  alert(`Dispatched research advisory email to ${client.email}`);
                  setActiveDropdown(null);
                }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0284c7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
              >
                Email Research Report
              </button>
            </div>
          )}
        </div>

        {/* 4. Dispose Button (Red) */}
        <button
          type="button"
          onClick={() => {
            if (confirm(`Move client ${client.clientName} to Disposed Leads list?`)) {
              onSave({ ...client, tabCategory: 'disposed', response: 'DISPOSED' });
              showToast(`Lead ${client.clientCode} moved to Disposed`, 'info');
              onBack();
            }
          }}
          style={{
            background: '#ff1744',
            color: '#ffffff',
            border: 'none',
            padding: '0.45rem 1rem',
            borderRadius: '4px',
            fontSize: '0.86rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(255, 23, 68, 0.2)'
          }}
        >
          Dispose
        </button>

        {/* 5. KYC Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'kyc' ? null : 'kyc');
            }}
            style={{
              background: '#2196f3',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '4px',
              fontSize: '0.86rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(33, 150, 243, 0.2)'
            }}
          >
            KYC <ChevronDown size={14} />
          </button>

          {activeDropdown === 'kyc' && (
            <div className="client-edit-dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              minWidth: '175px',
              padding: '4px 0',
              animation: 'fadeIn 0.15s ease'
            }}>
              <button
                onClick={() => {
                  setIsKYCUploadOpen(true);
                  setActiveDropdown(null);
                }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0284c7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
              >
                Upload KYC Form
              </button>
              <button
                onClick={() => {
                  alert(`Client KYC Status: ${client.kycData?.status || 'Approved'}\nPAN: ${client.kycData?.panNo || client.panNo}\nForm: ${client.kycData?.formType || 'Individual'}\nDocument: ${client.kycData?.fileName || 'KYC_Form.pdf'}`);
                  setActiveDropdown(null);
                }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0284c7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; }}
              >
                View KYC Status
              </button>
            </div>
          )}
        </div>

        {/* 6. View Storyline */}
        <button
          type="button"
          onClick={() => setIsStorylineOpen(true)}
          style={{
            background: '#2196f3',
            color: '#ffffff',
            border: 'none',
            padding: '0.45rem 0.95rem',
            borderRadius: '4px',
            fontSize: '0.86rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(33, 150, 243, 0.2)'
          }}
        >
          View storyline
        </button>

        {/* 7. C2C (Cyan) */}
        <button
          type="button"
          onClick={() => setIsC2COpen(true)}
          style={{
            background: '#00bcd4',
            color: '#ffffff',
            border: 'none',
            padding: '0.45rem 1rem',
            borderRadius: '4px',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 1px 2px rgba(0, 188, 212, 0.25)'
          }}
        >
          <PhoneCall size={13} /> C2C
        </button>
      </div>

      {/* Main Edit Form Card matching Image 2 */}
      <form onSubmit={handleSave} className="client-edit-card" style={{
        background: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Row 1: Lead ID | Generator | Owner matching Image 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Lead ID : </span>
            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{client.clientCode}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Generator : </span>
            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{client.generatorName || client.ownerName}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Owner : </span>
            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{client.ownerName}</strong>
          </div>
        </div>

        {/* Row 2: Name* | Mobile No. (with CHECK DND) | Alternate Mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Name*
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.88rem',
                color: '#1e293b',
                background: '#ffffff'
              }}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                Mobile No.
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  background: '#ffffff'
                }}
                required
              />
              <button
                type="button"
                onClick={handleCheckDND}
                style={{
                  background: dndChecked ? '#dcfce7' : '#f8fafc',
                  border: `1px solid ${dndChecked ? '#16a34a' : '#cbd5e1'}`,
                  color: dndChecked ? '#16a34a' : '#475569',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {dndChecked ? '✓ NO DND' : 'CHECK DND'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Alternate Mobile
            </label>
            <input 
              type="text" 
              value={alternateMobile}
              onChange={(e) => setAlternateMobile(e.target.value)}
              placeholder="Alternate Mobile"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.88rem',
                color: '#1e293b',
                background: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Row 3: Latest Response* | Call Back Date | Lead Source */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Latest Response*
            </label>
            <select 
              value={latestResponse}
              onChange={(e) => setLatestResponse(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.88rem',
                color: '#1e293b',
                background: '#ffffff'
              }}
              required
            >
              <option value="CLOSED OWN">CLOSED OWN</option>
              <option value="INTERESTED">INTERESTED</option>
              <option value="FOLLOW UP">FOLLOW UP</option>
              <option value="CALL BACK">CALL BACK</option>
              <option value="FREE TRIAL">FREE TRIAL</option>
              <option value="NOT REACHABLE">NOT REACHABLE</option>
              <option value="RINGING">RINGING</option>
              <option value="SWITCHED OFF">SWITCHED OFF</option>
              <option value="NOT INTERESTED">NOT INTERESTED</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Call Back Date
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                value={callBackDate}
                onChange={(e) => setCallBackDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
              Lead Source
            </label>
            <input 
              type="text" 
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.88rem',
                color: '#1e293b',
                background: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Acquired Service Subscription & Duration (User Requested) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1.5px solid rgba(2, 132, 199, 0.25)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} style={{ color: '#0284c7' }} />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                Acquired Service & Subscription Details
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Eligible for Automated RA Calls (SMS / Email)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                Subscribed Service / Product*
              </label>
              <select
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #0284c7',
                  borderRadius: '4px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#0369a1',
                  background: '#ffffff'
                }}
              >
                <option value="INDEX OPTION">INDEX OPTION (Nifty & Bank Nifty Options)</option>
                <option value="STOCK OPTION">STOCK OPTION (High Momentum Stock Calls)</option>
                <option value="STOCK FUTURE">STOCK FUTURE (Intraday & Swing Futures)</option>
                <option value="COMMODITY">COMMODITY (Crude Oil, Gold & Natural Gas)</option>
                <option value="EQUITY PREMIER">EQUITY PREMIER (Cash Long-Term & Delivery)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                Service Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  background: '#ffffff'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.3rem' }}>
                Service End Date / Validity
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Description Box matching Image 2 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Description
            </label>
            <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>
              Visible to all advisors handling this client
            </span>
          </div>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Enter fresh call note or client update..."
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '0.88rem',
              color: '#1e293b',
              background: '#ffffff',
              resize: 'vertical'
            }}
          />
        </div>

        {/* MULTI-EMPLOYEE CALL NOTES & DESCRIPTION TIMELINE (User Specified Requirement)
            "and in the description i need when an employee freshly call to the new lead and it shoudl be filled in the description box and and it shoudl be displayed and  when the same client is handled by another employee the previos  employees description should be visible to the all"
        */}
        <div className="notes-timeline-box" style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#0ea5e9" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                All Advisors Call Notes & Handover History ({client.notesHistory.length})
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Cumulative History
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '200px', overflowY: 'auto' }}>
            {client.notesHistory.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem' }}>
                No past call notes recorded yet. Type in the description box above to log the first call note.
              </div>
            ) : (
              client.notesHistory.map((note) => (
                <div 
                  key={note.id}
                  className="note-item-bubble"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    borderRadius: '4px',
                    padding: '0.65rem 0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: '#0ea5e9',
                        color: '#ffffff',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {note.authorName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {note.timestamp}
                      </span>
                    </div>

                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {note.response}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.4 }}>
                    {note.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Save Buttons matching Image 2 */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            style={{
              background: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.75rem',
              borderRadius: '4px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
            }}
          >
            Save
          </button>

          <button
            type="button"
            onClick={handleSaveAndNext}
            style={{
              background: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.75rem',
              borderRadius: '4px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
            }}
          >
            Save & Next
          </button>
        </div>
      </form>

      {/* Action Modals */}
      <NewFreeTrialModal 
        isOpen={isNewTrialOpen}
        onClose={() => setIsNewTrialOpen(false)}
        client={client}
        onSubmit={handleTrialAdded}
      />

      <PreviousFreeTrialModal 
        isOpen={isPrevTrialsOpen}
        onClose={() => setIsPrevTrialsOpen(false)}
        trials={client.freeTrials}
        onOpenNewTrial={() => {
          setIsPrevTrialsOpen(false);
          setIsNewTrialOpen(true);
        }}
      />

      <PaymentConfirmationModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        client={client}
        onSubmit={handlePaymentAdded}
      />

      <PreviousInvoicesModal 
        isOpen={isPrevInvoicesOpen}
        onClose={() => setIsPrevInvoicesOpen(false)}
        invoices={client.invoices}
        onToggleHold={handleToggleHold}
        onViewInvoice={(inv) => setSelectedInvoice(inv)}
      />

      <InvoicePreviewModal 
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        clientName={client.clientName}
      />

      <KYCUploadModal 
        isOpen={isKYCUploadOpen}
        onClose={() => setIsKYCUploadOpen(false)}
        client={client}
        onSubmitKYC={handleKYCUploaded}
      />

      <StorylineModal 
        isOpen={isStorylineOpen}
        onClose={() => setIsStorylineOpen(false)}
        client={client}
      />

      <C2CDialerModal 
        isOpen={isC2COpen}
        onClose={() => setIsC2COpen(false)}
        client={client}
        currentEmployeeName={currentUser.name}
        onSaveCallNote={(note) => {
          onSave({
            ...client,
            description: note.text,
            response: note.response,
            notesHistory: [note, ...client.notesHistory]
          });
          showToast(`Call logged and note added to ${client.clientName}!`, 'success');
        }}
      />
    </div>
  );
};
