import { saveKYCFile, downloadKYCFile } from '../../utils/kycFiles';
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../state/store';
import { AdvisoryLead, KYCCase, KYCDocumentType } from '../../types';
import './onboardingWorkspace.css';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Lock,
  ArrowRight,
  Check,
  FileCheck2,
  Upload,
  Send,
  CreditCard,
  Fingerprint,
  X,
  History,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeadKYCOnboardingModalProps {
  lead: AdvisoryLead;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadKYCOnboardingModal: React.FC<LeadKYCOnboardingModalProps> = ({
  lead,
  isOpen,
  onClose
}) => {
  const {
    currentUser,
    role,
    kycCases,
    createKYCCase,
    submitKYCCase,
    addKYCCaseDocument,
    updateLeadStatus,
    showToast
  } = useApp();

  // Tab State: 'upload' or 'request'
  const [activeTab, setActiveTab] = useState<'upload' | 'request'>('upload');
  const [showAuditHistory, setShowAuditHistory] = useState(false);

  // PAN Input State
  const [panNumber, setPanNumber] = useState(lead.panNumber || '');
  const [panFile, setPanFile] = useState<File | null>(null);
  const [isPanDragging, setIsPanDragging] = useState(false);

  // Aadhaar Input State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [isAadhaarDragging, setIsAadhaarDragging] = useState(false);

  const [replacingPan, setReplacingPan] = useState(false);
  const [replacingAadhaar, setReplacingAadhaar] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');

  // Request Channel
  const [requestChannel, setRequestChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');

  // Find existing KYC case for this lead
  const existingCase: KYCCase | undefined = useMemo(() => {
    return kycCases.find(c => c.leadId === lead.id && c.status !== 'Withdrawn');
  }, [kycCases, lead.id]);

  // Document Lookups
  const panDoc = useMemo(() => {
    return existingCase?.documents.find(
      d => d.type === 'PAN Card' && (d.status === 'Uploaded' || d.status === 'Verified' || d.status === 'Pending Review')
    );
  }, [existingCase]);

  const aadhaarDoc = useMemo(() => {
    return existingCase?.documents.find(
      d => d.type === 'Aadhaar Card' && (d.status === 'Uploaded' || d.status === 'Verified' || d.status === 'Pending Review')
    );
  }, [existingCase]);

  const isPanUploaded = Boolean(panDoc) && !replacingPan;
  const isAadhaarUploaded = Boolean(aadhaarDoc) && !replacingAadhaar;
  const isBothUploaded = isPanUploaded && isAadhaarUploaded;
  const uploadedCount = (isPanUploaded ? 1 : 0) + (isAadhaarUploaded ? 1 : 0);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation & Masking
  const validatePan = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
  const validateAadhaar = (aadhaar: string) => aadhaar.replace(/\D/g, '').length === 12;

  const maskAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `XXXX-${digits.slice(4)}`;
    return `XXXX-XXXX-${digits.slice(8)}`;
  };

  // Helper to ensure case exists in store
  const getOrCreateCase = () => {
    if (existingCase) return existingCase;
    const requiredDocs: KYCDocumentType[] = ['PAN Card', 'Aadhaar Card'];
    return createKYCCase(lead.id, requiredDocs);
  };

  const attachDocuments = async (types: ('PAN Card' | 'Aadhaar Card')[]) => {
    if (isAttaching) return;
    setAttachmentError('');
    setIsAttaching(true);
    try {
      for (const type of types) {
        if (type === 'PAN Card' && (!validatePan(panNumber) || !panFile)) throw new Error('Enter a valid PAN and choose its document file.');
        if (type === 'Aadhaar Card' && (!validateAadhaar(aadhaarNumber) || !aadhaarFile)) throw new Error('Enter the 12-digit Aadhaar number and choose its document file.');
      }
      const currentCase = getOrCreateCase();
      if (!currentCase) throw new Error('No lead is linked to this onboarding form. Open onboarding from the assigned lead.');
      let attached = 0;
      for (const type of types) {
        const file = (type === 'PAN Card' ? panFile : aadhaarFile)!;
        const id = await saveKYCFile(file);
        const number = type === 'PAN Card' ? panNumber.trim().toUpperCase() : 'XXXX-XXXX-' + aadhaarNumber.replace(/\D/g, '').slice(-4);
        addKYCCaseDocument(currentCase.id, type, id, number, file.name);
        attached++;
        if (type === 'PAN Card') { setPanFile(null); setReplacingPan(false); }
        else { setAadhaarFile(null); setReplacingAadhaar(false); }
      }
      showToast(attached + ' document(s) saved in this browser.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save the document. Please try again.';
      setAttachmentError(message);
      showToast(message, 'error');
    } finally { setIsAttaching(false); }
  };
  const handleAttachPan = () => attachDocuments(['PAN Card']);
  const handleAttachAadhaar = () => attachDocuments(['Aadhaar Card']);
  const handleAttachBoth = () => attachDocuments([
    ...(!isPanUploaded ? ['PAN Card' as const] : []),
    ...(!isAadhaarUploaded ? ['Aadhaar Card' as const] : []),
  ]);
  const downloadDocument = async (id?: string) => {
    try { await downloadKYCFile(id); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Unable to download document.', 'error'); }
  };

  // Dispatch Request Link to Client
  const handleSendRequest = () => {
    let kCase = existingCase;
    if (!kCase) {
      const requiredDocs: KYCDocumentType[] = ['PAN Card', 'Aadhaar Card'];
      kCase = createKYCCase(lead.id, requiredDocs, requestChannel) || undefined;
    }

    const portalUrl = `https://crm.stocketics.com/kyc-portal?case=${kCase?.id || 'new'}&lead=${lead.id}`;
    const message = `Hello ${lead.clientName}, please upload your mandatory KYC documents (PAN Card & Aadhaar Card) for Stocketics Advisory onboarding using our secure compliance portal: ${portalUrl}`;

    if (requestChannel === 'WhatsApp') {
      window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      showToast(`Opening WhatsApp to send document upload link to ${lead.clientName}.`, 'success');
    } else {
      showToast(`Upload request dispatched via ${requestChannel} to ${lead.phone}.`, 'success');
    }
  };

  // Submit to Manager for Final Approval
  const handleSubmitForApproval = () => {
    if (!existingCase) {
      showToast('No active KYC case found.', 'error');
      return;
    }

    if (!isBothUploaded) {
      showToast('Both PAN Card & Aadhaar Card are strictly required for submission.', 'error');
      return;
    }

    submitKYCCase(existingCase.id);
    if (lead.status !== 'Converted' && lead.status !== 'Trial Active') {
      updateLeadStatus(lead.id, 'Trial Active');
    }
    try { confetti({ particleCount: 60, spread: 75 }); } catch (_) {}
    showToast('KYC Case submitted! Dispatched to Team Leader / Manager for sign-off.', 'success');
  };

  return (
    <div
      className="onboarding-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Client Onboarding Modal"
    >
      <div
        className="onboarding-modal-card"
        onClick={e => e.stopPropagation()}
      >
        {/* ─── 1. STOCKETICS BRAND HEADER ──────────────────────────────────── */}
        <header className="onboarding-modal-header">
          <div className="onboarding-modal-header-left">
            <div className="onboarding-header-icon-box">
              <ShieldCheck size={20} />
            </div>
            <div className="onboarding-header-titles">
              <div className="onboarding-header-title-row">
                <h3>Client Onboarding</h3>
                <span className="onboarding-header-badge">
                  {lead.serviceType || 'Advisory Client'}
                </span>
              </div>
              <div className="onboarding-header-sub">
                Client: <strong style={{ color: '#ffffff' }}>{lead.clientName}</strong> • {lead.phone}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="onboarding-modal-close-btn"
            onClick={onClose}
            title="Close modal (Esc)"
          >
            <X size={16} />
          </button>
        </header>

        {/* ─── 2. COMPACT CLIENT SNAPSHOT STRIP ───────────────────────────── */}
        <div className="onboarding-client-strip">
          <div className="onboarding-client-strip-info">
            <span>Advisor: <strong style={{ color: '#0284c7' }}>{lead.assignedToName || 'Aditya Roy'}</strong></span>
            <span>•</span>
            <span>Fee: <strong style={{ color: '#166534' }}>{lead.expectedRevenue > 0 ? `₹${lead.expectedRevenue.toLocaleString('en-IN')}` : '₹65,000'}</strong></span>
            <span>•</span>
            <span>Bracket: <strong>{lead.investmentBracket || '₹5L - ₹10L'}</strong></span>
          </div>

          <div style={{ fontSize: '11px', color: '#64748b' }}>
            SEBI Compliance Standard
          </div>
        </div>

        {/* ─── 3. SINGLE CLEAN PROGRESS BAR ───────────────────────────────── */}
        <div className="onboarding-progress-banner">
          <div className="onboarding-progress-left">
            <span>Document Progress:</span>
            <div className="onboarding-progress-track-wrapper">
              <div
                className="onboarding-progress-track-bar"
                style={{ width: `${uploadedCount * 50}%` }}
              />
            </div>
          </div>

          <div
            className={`onboarding-progress-pill ${isBothUploaded ? 'complete' : 'incomplete'}`}
          >
            {isBothUploaded ? '✓ Both Documents Attached' : `${uploadedCount}/2 Uploaded`}
          </div>
        </div>

        {/* ─── 4. INTERACTIVE TAB SWITCHER ─────────────────────────────────── */}
        <div className="onboarding-tabs-bar">
          <button
            type="button"
            className={`onboarding-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={14} />
            <span>Upload Documents (PAN & Aadhaar)</span>
          </button>

          <button
            type="button"
            className={`onboarding-tab-btn ${activeTab === 'request' ? 'active' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            <Send size={14} />
            <span>Request from Client (WhatsApp/SMS)</span>
          </button>
        </div>

        {/* ─── 5. MODAL BODY ──────────────────────────────────────────────── */}
        <div className="onboarding-modal-body">

          {/* TAB 1: UPLOAD DOCUMENTS */}
          {activeTab === 'upload' && (
            <>
              {/* CARD 1: PAN CARD */}
              <div className={`onboarding-doc-card ${isPanUploaded ? 'attached' : ''}`}>
                <div className="onboarding-doc-card-top">
                  <div className="onboarding-doc-card-title">
                    <CreditCard size={16} color="#0073b7" />
                    <span>1. PAN Card (Permanent Account Number)</span>
                  </div>

                  <span className={`onboarding-doc-status-badge ${isPanUploaded ? 'attached' : 'required'}`}>
                    {isPanUploaded ? (
                      <>
                        <Check size={11} strokeWidth={3} /> Attached
                      </>
                    ) : (
                      'Required'
                    )}
                  </span>
                </div>

                {isPanUploaded ? (
                  <div className="onboarding-doc-attached-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCheck2 size={16} color="#16a34a" />
                      <div>
                        <strong style={{ fontFamily: 'monospace', color: '#166534' }}>
                          {panDoc?.maskedNumber}
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadDocument(panDoc?.documentId)}>Download</button>
                        </strong>
                        <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '11px' }}>
                          ({panDoc?.fileName || 'PAN_Document.pdf'})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingPan(true);
                        setPanNumber(panDoc?.maskedNumber || '');
                        showToast('Enter new PAN details or upload a new file below to replace.', 'info');
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div className="onboarding-doc-fields-row">
                    <div className="onboarding-input-group">
                      <label htmlFor="pan-input">PAN Number (10 Characters)</label>
                      <input
                        id="pan-input"
                        type="text"
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        value={panNumber}
                        onChange={e => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                        className={`onboarding-text-input ${validatePan(panNumber) ? 'valid' : ''}`}
                      />
                    </div>

                    <div className="onboarding-input-group">
                      <label>PAN Document File</label>
                      <div
                        className={`onboarding-mini-dropzone ${isPanDragging ? 'dragging' : ''}`}
                        onDragOver={e => { e.preventDefault(); setIsPanDragging(true); }}
                        onDragLeave={() => setIsPanDragging(false)}
                        onDrop={e => {
                          e.preventDefault();
                          setIsPanDragging(false);
                          if (e.dataTransfer.files?.[0]) setPanFile(e.dataTransfer.files[0]);
                        }}
                        role="button" tabIndex={0} aria-label="Choose PAN file"
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('pan-file-picker')?.click(); } }}
                        onClick={() => document.getElementById('pan-file-picker')?.click()}
                      >
                        <input
                          id="pan-file-picker"
                          onClick={e => e.stopPropagation()}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          onChange={e => {
                            if (e.target.files?.[0]) setPanFile(e.target.files[0]);
                          }}
                        />
                        <Upload size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {panFile ? panFile.name : 'Upload PDF / JPG'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!isPanUploaded && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleAttachPan}
                      disabled={isAttaching}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: isAttaching ? 'wait' : 'pointer',
                        opacity: isAttaching ? 0.6 : 1
                      }}
                    >
                      Attach PAN
                    </button>
                  </div>
                )}
              </div>

              {/* CARD 2: AADHAAR CARD */}
              <div className={`onboarding-doc-card ${isAadhaarUploaded ? 'attached' : ''}`}>
                <div className="onboarding-doc-card-top">
                  <div className="onboarding-doc-card-title">
                    <Fingerprint size={16} color="#10b981" />
                    <span>2. Aadhaar Card (UIDAI Masked Proof)</span>
                  </div>

                  <span className={`onboarding-doc-status-badge ${isAadhaarUploaded ? 'attached' : 'required'}`}>
                    {isAadhaarUploaded ? (
                      <>
                        <Check size={11} strokeWidth={3} /> Attached
                      </>
                    ) : (
                      'Required'
                    )}
                  </span>
                </div>

                {isAadhaarUploaded ? (
                  <div className="onboarding-doc-attached-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCheck2 size={16} color="#16a34a" />
                      <div>
                        <strong style={{ fontFamily: 'monospace', color: '#166534' }}>
                          {aadhaarDoc?.maskedNumber}
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadDocument(aadhaarDoc?.documentId)}>Download</button>
                        </strong>
                        <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '11px' }}>
                          ({aadhaarDoc?.fileName || 'Aadhaar_Document.pdf'})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingAadhaar(true);
                        showToast('Enter new Aadhaar details or upload a new scan to replace.', 'info');
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div className="onboarding-doc-fields-row">
                    <div className="onboarding-input-group">
                      <label htmlFor="aadhaar-input">
                        12-Digit Number {aadhaarNumber ? `(${maskAadhaar(aadhaarNumber)})` : ''}
                      </label>
                      <input
                        id="aadhaar-input"
                        type="text"
                        maxLength={12}
                        placeholder="12-digit number"
                        value={aadhaarNumber}
                        onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className={`onboarding-text-input ${validateAadhaar(aadhaarNumber) ? 'valid' : ''}`}
                      />
                    </div>

                    <div className="onboarding-input-group">
                      <label>Front & Back Scan</label>
                      <div
                        className={`onboarding-mini-dropzone ${isAadhaarDragging ? 'dragging' : ''}`}
                        onDragOver={e => { e.preventDefault(); setIsAadhaarDragging(true); }}
                        onDragLeave={() => setIsAadhaarDragging(false)}
                        onDrop={e => {
                          e.preventDefault();
                          setIsAadhaarDragging(false);
                          if (e.dataTransfer.files?.[0]) setAadhaarFile(e.dataTransfer.files[0]);
                        }}
                        role="button" tabIndex={0} aria-label="Choose Aadhaar file"
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('aadhaar-file-picker')?.click(); } }}
                        onClick={() => document.getElementById('aadhaar-file-picker')?.click()}
                      >
                        <input
                          id="aadhaar-file-picker"
                          onClick={e => e.stopPropagation()}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          onChange={e => {
                            if (e.target.files?.[0]) setAadhaarFile(e.target.files[0]);
                          }}
                        />
                        <Upload size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {aadhaarFile ? aadhaarFile.name : 'Upload PDF / JPG'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!isAadhaarUploaded && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleAttachAadhaar}
                      disabled={isAttaching}
                      style={{
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: isAttaching ? 'wait' : 'pointer',
                        opacity: isAttaching ? 0.6 : 1
                      }}
                    >
                      Attach Aadhaar
                    </button>
                  </div>
                )}
              </div>

              <p style={{fontSize: '11px', color: '#64748b'}}>Choose PDF, JPG or PNG files up to 10 MB. Files are saved in this browser. Upload a masked Aadhaar scan; the file itself is not automatically redacted.</p>
              {attachmentError && <p role="alert" style={{color: '#b91c1c', fontSize: '12px'}}>{attachmentError}</p>}
              {/* FAST ATTACH BOTH BUTTON */}
              {(!isPanUploaded || !isAadhaarUploaded) && (
                <button
                  type="button"
                  onClick={handleAttachBoth}
                  disabled={isAttaching}
                  style={{
                    background: '#0073b7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FileCheck2 size={15} /> Save & Attach Ready Documents
                </button>
              )}
            </>
          )}

          {/* TAB 2: REQUEST FROM CLIENT */}
          {activeTab === 'request' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12.5px', color: '#475569' }}>
                Dispatches a secure, tokenized upload link directly to <strong>{lead.clientName}</strong> so they can capture and upload their PAN and Aadhaar from their smartphone.
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'WhatsApp', label: 'WhatsApp', icon: <MessageSquare size={14} color="#16a34a" /> },
                  { id: 'SMS', label: 'SMS Gateway', icon: <Phone size={14} color="#0284c7" /> },
                  { id: 'Email', label: 'Email', icon: <Mail size={14} color="#8b5cf6" /> }
                ].map(ch => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setRequestChannel(ch.id as any)}
                    style={{
                      flex: 1,
                      background: requestChannel === ch.id ? '#f0f9ff' : '#ffffff',
                      border: `1.5px solid ${requestChannel === ch.id ? '#0284c7' : '#cbd5e1'}`,
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: requestChannel === ch.id ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: requestChannel === ch.id ? '#0284c7' : '#475569'
                    }}
                  >
                    {ch.icon}
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>

              {/* Message Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '11.5px',
                  lineHeight: '1.45',
                  color: '#334155'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Live Message Preview:
                </div>
                Hello <strong>{lead.clientName}</strong>, please upload your mandatory KYC documents (PAN Card & Aadhaar Card) for Stocketics Advisory onboarding using our secure compliance portal: <span style={{ color: '#0073b7', textDecoration: 'underline' }}>https://crm.stocketics.com/kyc-portal?case={existingCase?.id || 'new'}</span>
              </div>

              <button
                type="button"
                onClick={handleSendRequest}
                style={{
                  background: requestChannel === 'WhatsApp' ? '#16a34a' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} /> Send Link on {requestChannel}
              </button>
            </div>
          )}

          {/* AUDIT HISTORY DRAWER ACCORDION */}
          {showAuditHistory && (
            <div
              style={{
                marginTop: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: '#f8fafc',
                padding: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '12px', color: '#1e293b' }}>Chronological Case Audit Log</strong>
                <button
                  type="button"
                  onClick={() => setShowAuditHistory(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={14} />
                </button>
              </div>

              {!existingCase || existingCase.auditTrail.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>
                  No audit events recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {existingCase.auditTrail.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: '#ffffff',
                        borderLeft: '2.5px solid #0073b7',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0073b7', fontWeight: 700 }}>
                        <span>{item.action}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.timestamp}</span>
                      </div>
                      <div style={{ color: '#475569', marginTop: '2px' }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── 6. CLEAN MODAL FOOTER ───────────────────────────────────────── */}
        <footer className="onboarding-modal-footer">
          <div className="onboarding-modal-footer-left">
            <span>Case: <strong style={{ fontFamily: 'monospace' }}>{existingCase?.id || 'Draft'}</strong></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowAuditHistory(!showAuditHistory)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0073b7',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <History size={12} />
              {showAuditHistory ? 'Hide Audit' : `Audit (${existingCase?.auditTrail?.length || 0})`}
            </button>
          </div>

          <div className="onboarding-modal-footer-right">
            <button
              type="button"
              className="onboarding-btn-close"
              onClick={onClose}
            >
              Close
            </button>

            {existingCase?.status === 'Approved' ? (
              <span
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={14} /> Approved by Compliance
              </span>
            ) : existingCase?.status === 'Pending Approval' || existingCase?.status === 'In Review' ? (
              <span
                style={{
                  background: '#fffbeb',
                  color: '#d97706',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Clock size={14} /> In Review with Manager
              </span>
            ) : (
              <button
                type="button"
                className="onboarding-btn-submit"
                onClick={handleSubmitForApproval}
                disabled={!isBothUploaded}
                title={!isBothUploaded ? 'Upload both PAN & Aadhaar to submit' : 'Submit for review'}
              >
                <ShieldCheck size={15} />
                <span>{isBothUploaded ? 'Submit for Approval' : 'Both Documents Required'}</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
