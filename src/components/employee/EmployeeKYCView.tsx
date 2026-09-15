import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { KYCDocumentType, KYCDocumentStatus, KYCDocumentItem } from '../../types';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  CreditCard,
  Building,
  Home,
  Copy,
  Check,
  Download,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EmployeeKYCView: React.FC = () => {
  const {
    kycDocuments,
    uploadKYCDocument,
    detailedClients,
    advisoryLeads,
    currentUser,
    showToast,
    theme,
    setActiveTab
  } = useApp();

  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reuploadDocId, setReuploadDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<KYCDocumentItem | null>(null);

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [documentType, setDocumentType] = useState<KYCDocumentType>('PAN Card');
  const [documentNumber, setDocumentNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic counts for KPI and Filter Pills
  const counts = useMemo(() => {
    const total = kycDocuments.length;
    const pending = kycDocuments.filter(d => d.status === 'Pending').length;
    const verified = kycDocuments.filter(d => d.status === 'Verified').length;
    const rejected = kycDocuments.filter(d => d.status === 'Rejected').length;
    const needsReupload = kycDocuments.filter(d => d.status === 'Needs Reupload').length;
    const actionRequired = rejected + needsReupload;
    return { total, pending, verified, rejected, needsReupload, actionRequired };
  }, [kycDocuments]);

  // Filter documents
  const filteredDocs = useMemo(() => {
    return kycDocuments.filter(doc => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.clientName.toLowerCase().includes(q) ||
        (doc.clientMobile ? doc.clientMobile.includes(q) : false) ||
        (doc.documentNumber ? doc.documentNumber.toLowerCase().includes(q) : false) ||
        doc.documentType.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'all') {
        matchesStatus = true;
      } else if (statusFilter === 'action-required') {
        matchesStatus = doc.status === 'Rejected' || doc.status === 'Needs Reupload';
      } else {
        matchesStatus = doc.status === statusFilter;
      }

      const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [kycDocuments, searchQuery, statusFilter, typeFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied document ID "${text}" to clipboard!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = detailedClients.find(c => c.id === clientId);
    if (client) {
      setClientName(client.clientName);
      setClientMobile(client.mobile);
      return;
    }
    const lead = advisoryLeads.find(l => l.id === clientId);
    if (lead) {
      setClientName(lead.clientName);
      setClientMobile(lead.phone);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientMobile.trim()) {
      showToast('Please provide client name and mobile number.', 'error');
      return;
    }
    if (!documentNumber.trim()) {
      showToast('Please enter the document ID or account number.', 'error');
      return;
    }

    const fileName = selectedFile
      ? selectedFile.name
      : `${documentType.toLowerCase().replace(/\s+/g, '_')}_verified_scan.pdf`;
    const fileSize = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : '1.4 MB';

    uploadKYCDocument({
      clientId: selectedClientId || `client-${Date.now()}`,
      clientName: clientName.trim(),
      clientMobile: clientMobile.trim(),
      documentType,
      documentNumber: documentNumber.trim().toUpperCase(),
      fileUrl: '#',
      fileName,
      fileSize,
      uploadedBy: currentUser.name,
      uploadedById: currentUser.id
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Document uploaded successfully for ${clientName}!`, 'success');

    setUploadModalOpen(false);
    setSelectedFile(null);
    setDocumentNumber('');
    setSelectedClientId('');
    setClientName('');
    setClientMobile('');
    if (reuploadDocId) {
      setReuploadDocId(null);
    }
  };

  const handleStartReupload = (doc: KYCDocumentItem) => {
    setSelectedClientId(doc.clientId);
    setClientName(doc.clientName);
    setClientMobile(doc.clientMobile || '9876543210');
    setDocumentType(doc.documentType);
    setDocumentNumber(doc.documentNumber || '');
    setReuploadDocId(doc.id);
    setUploadModalOpen(true);
  };

  const getDocTypeBadge = (type: KYCDocumentType) => {
    switch (type) {
      case 'PAN Card':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 700,
            background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
            color: isDark ? '#38bdf8' : '#0369a1',
            border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd'
          }}>
            <CreditCard size={12} />
            PAN Card
          </span>
        );
      case 'Aadhaar Card':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 700,
            background: isDark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff',
            color: isDark ? '#c084fc' : '#7e22ce',
            border: isDark ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid #e9d5ff'
          }}>
            <ShieldCheck size={12} />
            Aadhaar Card
          </span>
        );
      case 'Bank Proof':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 700,
            background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
            color: isDark ? '#fbbf24' : '#92400e',
            border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a'
          }}>
            <Building size={12} />
            Bank Proof
          </span>
        );
      case 'Address Proof':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 700,
            background: isDark ? 'rgba(20, 184, 166, 0.15)' : '#ccfbf1',
            color: isDark ? '#2dd4bf' : '#0f766e',
            border: isDark ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid #99f6e4'
          }}>
            <FileCheck size={12} />
            Address Proof
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.74rem',
            fontWeight: 700,
            background: isDark ? 'rgba(148, 163, 184, 0.15)' : '#f1f5f9',
            color: isDark ? '#cbd5e1' : '#334155',
            border: isDark ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid #e2e8f0'
          }}>
            <FileText size={12} />
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (status: KYCDocumentStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: isDark ? 'rgba(16, 185, 129, 0.18)' : '#ecfdf5',
            color: isDark ? '#34d399' : '#047857',
            border: isDark ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #a7f3d0',
            padding: '3px 9px',
            borderRadius: 14,
            fontSize: '0.73rem',
            fontWeight: 800,
            letterSpacing: '0.2px'
          }}>
            <CheckCircle2 size={13} /> Verified
          </span>
        );
      case 'Pending':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: isDark ? 'rgba(245, 158, 11, 0.18)' : '#fffbeb',
            color: isDark ? '#fbbf24' : '#b45309',
            border: isDark ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #fde68a',
            padding: '3px 9px',
            borderRadius: 14,
            fontSize: '0.73rem',
            fontWeight: 800,
            letterSpacing: '0.2px'
          }}>
            <Clock size={13} /> Pending Review
          </span>
        );
      case 'Rejected':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: isDark ? 'rgba(239, 68, 68, 0.18)' : '#fef2f2',
            color: isDark ? '#f87171' : '#b91c1c',
            border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #fecaca',
            padding: '3px 9px',
            borderRadius: 14,
            fontSize: '0.73rem',
            fontWeight: 800,
            letterSpacing: '0.2px'
          }}>
            <XCircle size={13} /> Rejected
          </span>
        );
      case 'Needs Reupload':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: isDark ? 'rgba(168, 85, 247, 0.18)' : '#faf5ff',
            color: isDark ? '#c084fc' : '#6b21a8',
            border: isDark ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid #e9d5ff',
            padding: '3px 9px',
            borderRadius: 14,
            fontSize: '0.73rem',
            fontWeight: 800,
            letterSpacing: '0.2px'
          }}>
            <RefreshCw size={13} /> Needs Re-upload
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ─── Breadcrumb Navigation Strip ─── */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}>
          <span
            className="home-link"
            onClick={() => setActiveTab('dashboard')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#ea580c', fontWeight: 700 }}
          >
            <Home size={15} />
            <span>/ Home</span>
          </span>
          <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>/</span>
          <span style={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}>Compliance & Advisory</span>
          <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>/</span>
          <span style={{ fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7' }}>Client KYC Document Vault</span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
          border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #a7f3d0',
          padding: '4px 10px',
          borderRadius: 20,
          fontSize: '0.74rem',
          fontWeight: 700,
          color: isDark ? '#34d399' : '#047857'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          SEBI & PMLA 2026 Compliant
        </div>
      </div>

      {/* ─── Main Header Banner & CTA ─── */}
      <div
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '20px 24px',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 900,
                color: isDark ? '#ffffff' : '#0f172a',
                letterSpacing: '-0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Client KYC Verification & Document Vault
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: isDark ? '#94a3b8' : '#475569'
              }}
            >
              Submit and track PAN, Aadhaar, and Bank proofs for SEBI compliance & advisory onboarding
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => {
              setSelectedClientId('');
              setClientName('');
              setClientMobile('');
              setDocumentNumber('');
              setSelectedFile(null);
              setUploadModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '11px 20px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={18} strokeWidth={2.6} /> Upload New KYC Document
          </button>
        </div>
      </div>

      {/* ─── Interactive KPI Metrics Grid (Clickable to Filter) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {/* Card 1: Total Uploads */}
        <div
          onClick={() => setStatusFilter('all')}
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
            border: statusFilter === 'all'
              ? (isDark ? '2px solid #38bdf8' : '2px solid #2563eb')
              : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0'),
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: statusFilter === 'all'
              ? (isDark ? '0 0 15px rgba(56, 189, 248, 0.2)' : '0 4px 12px rgba(37, 99, 235, 0.12)')
              : (isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)'),
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          title="Click to view all KYC documents"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#94a3b8' : '#475569' }}>
              Total Uploads
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
              color: isDark ? '#38bdf8' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.1 }}>
            {counts.total}
          </div>
          <div style={{ fontSize: '0.73rem', fontWeight: 600, color: isDark ? '#64748b' : '#64748b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Across all client portfolios</span>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div
          onClick={() => setStatusFilter('Pending')}
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
            border: statusFilter === 'Pending'
              ? (isDark ? '2px solid #fbbf24' : '2px solid #d97706')
              : (isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fed7aa'),
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: statusFilter === 'Pending'
              ? (isDark ? '0 0 15px rgba(245, 158, 11, 0.25)' : '0 4px 12px rgba(217, 119, 6, 0.15)')
              : (isDark ? 'none' : '0 1px 3px rgba(245, 158, 11, 0.06)'),
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          title="Click to filter by Pending Review"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#fbbf24' : '#b45309' }}>
              Pending Review
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
              color: isDark ? '#fbbf24' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: isDark ? '#fbbf24' : '#b45309', lineHeight: 1.1 }}>
            {counts.pending}
          </div>
          <div style={{ fontSize: '0.73rem', fontWeight: 600, color: isDark ? '#fbbf24' : '#b45309', marginTop: 6 }}>
            Awaiting compliance sign-off
          </div>
        </div>

        {/* Card 3: Verified Compliant */}
        <div
          onClick={() => setStatusFilter('Verified')}
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
            border: statusFilter === 'Verified'
              ? (isDark ? '2px solid #34d399' : '2px solid #059669')
              : (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #a7f3d0'),
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: statusFilter === 'Verified'
              ? (isDark ? '0 0 15px rgba(16, 185, 129, 0.25)' : '0 4px 12px rgba(5, 150, 105, 0.15)')
              : (isDark ? 'none' : '0 1px 3px rgba(16, 185, 129, 0.06)'),
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          title="Click to filter by Verified Compliant"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#34d399' : '#047857' }}>
              Verified Compliant
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
              color: isDark ? '#34d399' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: isDark ? '#34d399' : '#047857', lineHeight: 1.1 }}>
            {counts.verified}
          </div>
          <div style={{ fontSize: '0.73rem', fontWeight: 600, color: isDark ? '#34d399' : '#047857', marginTop: 6 }}>
            100% NSDL/UIDAI Verified
          </div>
        </div>

        {/* Card 4: Action Required */}
        <div
          onClick={() => setStatusFilter('action-required')}
          style={{
            background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
            border: statusFilter === 'action-required'
              ? (isDark ? '2px solid #f87171' : '2px solid #dc2626')
              : (isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca'),
            borderRadius: 14,
            padding: '16px 18px',
            boxShadow: statusFilter === 'action-required'
              ? (isDark ? '0 0 15px rgba(239, 68, 68, 0.25)' : '0 4px 12px rgba(220, 38, 38, 0.15)')
              : (isDark ? 'none' : '0 1px 3px rgba(239, 68, 68, 0.06)'),
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          title="Click to filter by Action Required (Rejected / Needs Re-upload)"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#f87171' : '#b91c1c' }}>
              Action Required
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
              color: isDark ? '#f87171' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: isDark ? '#f87171' : '#b91c1c', lineHeight: 1.1 }}>
            {counts.actionRequired}
          </div>
          <div style={{ fontSize: '0.73rem', fontWeight: 600, color: isDark ? '#f87171' : '#b91c1c', marginTop: 6 }}>
            Rejected or re-upload needed
          </div>
        </div>
      </div>

      {/* ─── Search & Interactive Filter Control Bar ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        {/* Search Field */}
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search
            size={17}
            color={isDark ? '#94a3b8' : '#475569'}
            style={{ position: 'absolute', left: 14, top: 12 }}
          />
          <input
            type="text"
            placeholder="Search by client name, phone, document ID or file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '10px 38px 10px 40px',
              color: isDark ? '#ffffff' : '#0f172a',
              fontSize: '0.88rem',
              fontWeight: 600,
              outline: 'none',
              boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 12,
                top: 11,
                background: 'transparent',
                border: 'none',
                color: isDark ? '#94a3b8' : '#64748b',
                cursor: 'pointer',
                padding: 0
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills with Counts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              background: statusFilter === 'all'
                ? '#2563eb'
                : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff'),
              color: statusFilter === 'all'
                ? '#ffffff'
                : (isDark ? '#cbd5e1' : '#334155'),
              border: statusFilter === 'all'
                ? '1px solid #2563eb'
                : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1'),
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: statusFilter === 'all' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>All</span>
            <span style={{
              background: statusFilter === 'all' ? 'rgba(255,255,255,0.25)' : (isDark ? '#334155' : '#e2e8f0'),
              color: statusFilter === 'all' ? '#ffffff' : (isDark ? '#cbd5e1' : '#334155'),
              padding: '1px 6px',
              borderRadius: 10,
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Pending')}
            style={{
              background: statusFilter === 'Pending'
                ? '#d97706'
                : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff'),
              color: statusFilter === 'Pending'
                ? '#ffffff'
                : (isDark ? '#fbbf24' : '#b45309'),
              border: statusFilter === 'Pending'
                ? '1px solid #d97706'
                : (isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fed7aa'),
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: statusFilter === 'Pending' ? '0 2px 8px rgba(217, 119, 6, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={13} />
            <span>Pending</span>
            <span style={{
              background: statusFilter === 'Pending' ? 'rgba(255,255,255,0.25)' : (isDark ? '#451a03' : '#fef3c7'),
              color: statusFilter === 'Pending' ? '#ffffff' : (isDark ? '#fbbf24' : '#b45309'),
              padding: '1px 6px',
              borderRadius: 10,
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Verified')}
            style={{
              background: statusFilter === 'Verified'
                ? '#059669'
                : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff'),
              color: statusFilter === 'Verified'
                ? '#ffffff'
                : (isDark ? '#34d399' : '#047857'),
              border: statusFilter === 'Verified'
                ? '1px solid #059669'
                : (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #a7f3d0'),
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: statusFilter === 'Verified' ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={13} />
            <span>Verified</span>
            <span style={{
              background: statusFilter === 'Verified' ? 'rgba(255,255,255,0.25)' : (isDark ? '#064e3b' : '#d1fae5'),
              color: statusFilter === 'Verified' ? '#ffffff' : (isDark ? '#34d399' : '#047857'),
              padding: '1px 6px',
              borderRadius: 10,
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {counts.verified}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('action-required')}
            style={{
              background: statusFilter === 'action-required'
                ? '#dc2626'
                : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff'),
              color: statusFilter === 'action-required'
                ? '#ffffff'
                : (isDark ? '#f87171' : '#b91c1c'),
              border: statusFilter === 'action-required'
                ? '1px solid #dc2626'
                : (isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca'),
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: statusFilter === 'action-required' ? '0 2px 8px rgba(220, 38, 38, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertCircle size={13} />
            <span>Action Required</span>
            <span style={{
              background: statusFilter === 'action-required' ? 'rgba(255,255,255,0.25)' : (isDark ? '#4c0519' : '#fee2e2'),
              color: statusFilter === 'action-required' ? '#ffffff' : (isDark ? '#f87171' : '#b91c1c'),
              padding: '1px 6px',
              borderRadius: 10,
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {counts.actionRequired}
            </span>
          </button>

          {/* Document Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Document Types</option>
            <option value="PAN Card">PAN Card</option>
            <option value="Aadhaar Card">Aadhaar Card</option>
            <option value="Bank Proof">Bank Proof</option>
            <option value="Address Proof">Address Proof</option>
          </select>
        </div>
      </div>

      {/* ─── Ultra-Readable High-Contrast KYC Documents Table ─── */}
      <div
        style={{
          background: isDark ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  background: isDark ? '#1e293b' : '#f1f5f9',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '2px solid #cbd5e1'
                }}
              >
                <th style={{ padding: '14px 18px', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Client Details
                </th>
                <th style={{ padding: '14px 18px', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Document Type
                </th>
                <th style={{ padding: '14px 18px', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Document ID / Number
                </th>
                <th style={{ padding: '14px 18px', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  File Attachment
                </th>
                <th style={{ padding: '14px 18px', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status & Compliance Review
                </th>
                <th style={{ padding: '14px 18px', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <ShieldAlert size={40} color={isDark ? '#64748b' : '#94a3b8'} />
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#1e293b' }}>
                        No KYC documents match your filter criteria
                      </div>
                      <div style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                        Try clearing your search query or switching to another status tab.
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setTypeFilter('all');
                        }}
                        style={{
                          marginTop: 8,
                          background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                          color: isDark ? '#fff' : '#0f172a',
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => {
                  const initials = doc.clientName
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const fallbackDocNumber =
                    doc.documentNumber ||
                    (doc.documentType === 'PAN Card'
                      ? 'AAAPL1234K'
                      : doc.documentType === 'Aadhaar Card'
                      ? 'XXXX-XXXX-8821'
                      : 'DOC-482910');

                  const phoneDisplay = doc.clientMobile || '9876543210';

                  return (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
                        background: idx % 2 === 1
                          ? (isDark ? 'rgba(255, 255, 255, 0.015)' : '#fafafa')
                          : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = idx % 2 === 1
                          ? (isDark ? 'rgba(255, 255, 255, 0.015)' : '#fafafa')
                          : 'transparent';
                      }}
                    >
                      {/* Column 1: Client Details */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                              flexShrink: 0
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                              {doc.clientName}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', marginTop: 2 }}>
                              📞 +91 {phoneDisplay}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Document Type */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div>
                          {getDocTypeBadge(doc.documentType)}
                          <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 5, fontWeight: 500 }}>
                            Uploaded by <strong style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{doc.uploadedBy}</strong>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Document ID / Number with Copy Button */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <code
                            style={{
                              background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#f8fafc',
                              border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #cbd5e1',
                              padding: '4px 9px',
                              borderRadius: 6,
                              color: isDark ? '#38bdf8' : '#1e3a8a',
                              fontSize: '0.84rem',
                              fontWeight: 800,
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {fallbackDocNumber}
                          </code>
                          <button
                            onClick={() => handleCopy(fallbackDocNumber, doc.id)}
                            style={{
                              background: copiedId === doc.id ? '#10b981' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                              color: copiedId === doc.id ? '#fff' : (isDark ? '#94a3b8' : '#475569'),
                              border: `1px solid ${copiedId === doc.id ? '#10b981' : (isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1')}`,
                              borderRadius: 6,
                              padding: '4px 6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            title="Copy Document ID"
                          >
                            {copiedId === doc.id ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Column 4: File Attachment */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div
                          onClick={() => setPreviewDoc(doc)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '5px 10px',
                            background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.background = isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
                            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
                          }}
                          title="Click to preview file"
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: '#ef4444',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800
                            }}
                          >
                            PDF
                          </div>
                          <div>
                            <div style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.82rem', fontWeight: 700 }}>
                              {doc.fileName}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                              {doc.fileSize || '1.4 MB'} • Click to view
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 5: Status & Compliance Review */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            {getStatusBadge(doc.status)}
                          </div>
                          {doc.remarks && (
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: doc.status === 'Rejected'
                                  ? '#dc2626'
                                  : (isDark ? '#e2e8f0' : '#1e293b'),
                                background: doc.status === 'Rejected'
                                  ? (isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2')
                                  : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'),
                                border: `1px solid ${doc.status === 'Rejected' ? '#fca5a5' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0')}`,
                                borderRadius: 6,
                                padding: '4px 8px',
                                maxWidth: 280,
                                lineHeight: 1.35,
                                fontWeight: 600,
                                marginTop: 4
                              }}
                            >
                              {doc.remarks}
                            </div>
                          )}
                          {doc.reviewedBy && (
                            <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 4, fontWeight: 500 }}>
                              By <strong style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{doc.reviewedBy}</strong> on {doc.reviewedAt || '2026-09-10 14:30'}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            style={{
                              background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                              color: isDark ? '#38bdf8' : '#1d4ed8',
                              border: isDark ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid #bfdbfe',
                              borderRadius: 8,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2563eb';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff';
                              e.currentTarget.style.color = isDark ? '#38bdf8' : '#1d4ed8';
                              e.currentTarget.style.borderColor = isDark ? '1px solid rgba(56, 189, 248, 0.35)' : '#bfdbfe';
                            }}
                            title="Inspect KYC Document Details"
                          >
                            <Eye size={14} /> View
                          </button>

                          {(doc.status === 'Rejected' || doc.status === 'Needs Reupload') && (
                            <button
                              onClick={() => handleStartReupload(doc)}
                              style={{
                                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                borderRadius: 8,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2';
                                e.currentTarget.style.color = '#dc2626';
                              }}
                              title="Re-upload correct document"
                            >
                              <RefreshCw size={14} /> Re-upload
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Interactive Document Preview & Compliance Audit Modal ─── */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? 'rgba(10, 17, 40, 0.85)' : 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewDoc(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#e2e8f0'}`,
              borderRadius: 20,
              padding: 26,
              color: isDark ? '#ffffff' : '#0f172a',
              boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.8)' : '0 20px 50px rgba(0,0,0,0.15)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
                    KYC Document Verification Vault
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    SEBI Master Circular Onboarding Compliance Dossier
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  border: 'none',
                  borderRadius: 8,
                  padding: 6,
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Simulated Document Inspection Card */}
            <div
              style={{
                background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                borderRadius: 14,
                padding: '18px 20px',
                marginBottom: 18,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    PDF ATTACHMENT
                  </div>
                  <strong style={{ fontSize: '0.92rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {previewDoc.fileName}
                  </strong>
                </div>
                {getStatusBadge(previewDoc.status)}
              </div>

              {/* Watermarked Document Preview Sheet */}
              <div
                style={{
                  background: isDark ? '#020617' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.25)' : '#cbd5e1'}`,
                  borderRadius: 10,
                  padding: 18,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-25deg)',
                    fontSize: '1.7rem',
                    fontWeight: 900,
                    color: previewDoc.status === 'Verified' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    pointerEvents: 'none',
                    letterSpacing: '3px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {previewDoc.status === 'Verified' ? 'OFFICIALLY VERIFIED' : 'PENDING COMPLIANCE'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Client Legal Name
                    </span>
                    <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.95rem' }}>
                      {previewDoc.clientName}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Registered Mobile
                    </span>
                    <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.95rem' }}>
                      +91 {previewDoc.clientMobile || '9876543210'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Document Category
                    </span>
                    <div style={{ marginTop: 3 }}>
                      {getDocTypeBadge(previewDoc.documentType)}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Document ID / Number
                    </span>
                    <strong style={{ color: isDark ? '#38bdf8' : '#1d4ed8', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {previewDoc.documentNumber || 'AAAPL1234K'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Review Remarks */}
            {previewDoc.remarks && (
              <div
                style={{
                  background: previewDoc.status === 'Rejected'
                    ? (isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2')
                    : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc'),
                  border: `1px solid ${previewDoc.status === 'Rejected' ? '#fca5a5' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')}`,
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AlertCircle size={15} color={previewDoc.status === 'Rejected' ? '#dc2626' : (isDark ? '#38bdf8' : '#0284c7')} />
                  <span style={{ fontSize: '0.75rem', color: previewDoc.status === 'Rejected' ? '#dc2626' : (isDark ? '#38bdf8' : '#0284c7'), fontWeight: 800 }}>
                    Compliance Officer Audit Note:
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: previewDoc.status === 'Rejected' ? '#b91c1c' : (isDark ? '#e2e8f0' : '#1e293b'), fontWeight: 600, lineHeight: 1.4 }}>
                  {previewDoc.remarks}
                </div>
                {previewDoc.reviewedBy && (
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 6, fontWeight: 500 }}>
                    Reviewed by {previewDoc.reviewedBy} on {previewDoc.reviewedAt || '2026-09-10 14:30'}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => {
                  showToast(`Downloading ${previewDoc.fileName}...`, 'info');
                }}
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                  color: isDark ? '#ffffff' : '#1e293b',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Download size={15} /> Download Copy
              </button>

              {(previewDoc.status === 'Rejected' || previewDoc.status === 'Needs Reupload') && (
                <button
                  onClick={() => {
                    const doc = previewDoc;
                    setPreviewDoc(null);
                    handleStartReupload(doc);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <RefreshCw size={15} /> Re-upload Document
                </button>
              )}

              <button
                onClick={() => setPreviewDoc(null)}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Interactive Upload / Re-upload Modal ─── */}
      {uploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? 'rgba(10, 17, 40, 0.85)' : 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setUploadModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 550,
              background: isDark ? '#0f172a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#e2e8f0'}`,
              borderRadius: 20,
              padding: 26,
              color: isDark ? '#ffffff' : '#0f172a',
              boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.8)' : '0 20px 50px rgba(0,0,0,0.15)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Upload size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {reuploadDocId ? 'Re-upload KYC Document' : 'Upload Client KYC Document'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    SEBI & PMLA mandated client identity and banking proofs
                  </span>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  border: 'none',
                  borderRadius: 8,
                  padding: 6,
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {/* Client Selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 5 }}>
                  Select Client from Active Database
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  style={{
                    width: '100%',
                    background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="" style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                    -- Select Client or enter manually below --
                  </option>
                  {detailedClients.map(c => (
                    <option key={c.id} value={c.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                      {c.clientName} ({c.mobile}) - Client
                    </option>
                  ))}
                  {advisoryLeads.map(l => (
                    <option key={l.id} value={l.id} style={{ background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#fff' : '#0f172a' }}>
                      {l.clientName} ({l.phone}) - Lead
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Name & Mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 5 }}>
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 5 }}>
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={clientMobile}
                    onChange={(e) => setClientMobile(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Document Category & ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 5 }}>
                    Document Category *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as KYCDocumentType)}
                    style={{
                      width: '100%',
                      background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="PAN Card">PAN Card</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Bank Proof">Bank Proof (Cheque/Statement)</option>
                    <option value="Address Proof">Address Proof</option>
                    <option value="Other">Other Proof</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 5 }}>
                    Document ID / Account No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDE1234F"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      fontFamily: 'monospace',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* File Upload Drag-and-drop zone */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'block', marginBottom: 6 }}>
                  Upload Document Scan (PDF, PNG, JPG) *
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setSelectedFile(e.dataTransfer.files[0]);
                    }
                  }}
                  style={{
                    border: `2px dashed ${isDragging ? '#2563eb' : (isDark ? 'rgba(56, 189, 248, 0.3)' : '#cbd5e1')}`,
                    borderRadius: 12,
                    padding: '22px 16px',
                    textAlign: 'center',
                    background: isDragging
                      ? (isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff')
                      : (isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => document.getElementById('kyc-file-input')?.click()}
                >
                  <Upload size={32} color={isDark ? '#38bdf8' : '#2563eb'} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {selectedFile ? (
                      <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={16} /> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    ) : (
                      'Click to select document or drag & drop here'
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 4 }}>
                    Supported formats: PDF, JPG, PNG up to 10MB (Clear & Unmasked)
                  </div>
                  <input
                    id="kyc-file-input"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                    color: isDark ? '#cbd5e1' : '#475569',
                    border: `1px solid ${isDark ? 'transparent' : '#cbd5e1'}`,
                    borderRadius: 10,
                    padding: '10px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 22px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  Submit for Compliance Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
