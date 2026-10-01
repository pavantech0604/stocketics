import { isClosedWon, isClosedOwn, isFollowupDue, resolveLeadClientName } from '../../crm/legacyWorkflow';
import { useClock } from '../../crm/useClock';
import './leadWorkflow.css';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { AdvisoryLead, LeadStatus } from '../../types';
import { 
  Home,
  PhoneCall, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  UploadCloud,
  MapPin,
  MessageSquare,
  X,
  PhoneOutgoing,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  User,
  Zap,
  ArrowRight,
  Check,
  Eye,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { AddNewLeadModal, CallLogsModal } from '../common/CRMActionModals';
const BulkLeadUploadModal = React.lazy(() => import('./BulkLeadUploadModal').then(m => ({ default: m.BulkLeadUploadModal })));
const AllConfirmedPaymentsView = React.lazy(() => import('./AllConfirmedPaymentsView').then(m => ({ default: m.AllConfirmedPaymentsView })));
import { TipsModal } from '../common/TipsModal';
const LeadKYCOnboardingModal = React.lazy(() => import('../common/LeadKYCOnboardingModal').then(m => ({ default: m.LeadKYCOnboardingModal })));


export const AdvisoryPipeline: React.FC = () => {
  const now = useClock();
  const { 
    role, 
    activeTab, 
    setActiveTab, 
    advisoryLeads, 
    updateLeadStatus, 
    updateLeadResponse,
    disposeLead,
    showToast, 
    employees, 
    currentUser, 
    triggerClientSearchAlert,
    getTeamMemberIds,
    leadSourcePools,
    getKYCCaseForLead
  } = useApp();
  
  // Scoped leads based strictly on user role
  const scopedLeads = React.useMemo(() => {
    if (role === 'employee') {
      // Employee strictly sees ONLY their assigned leads
      return advisoryLeads.filter(l => l.assignedToId === currentUser.id && !l.isTeamPool);
    }
    if (role === 'team_leader') {
      const myTeamMemberIds = getTeamMemberIds(currentUser.id);
      return advisoryLeads.filter(l => 
        l.teamLeaderId === currentUser.id || 
        myTeamMemberIds.includes(l.assignedToId) ||
        l.assignedToId === currentUser.id
      );
    }
    // Manager & HR see all
    return advisoryLeads;
  }, [advisoryLeads, role, currentUser.id]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedAdvisor, setSelectedAdvisor] = useState('All');
  const [selectedResponse, setSelectedResponse] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Response Update Modal State
  const [responseModalLead, setResponseModalLead] = useState<AdvisoryLead | null>(null);
  const [modalResponse, setModalResponse] = useState<string>('Interested');
  const [modalNote, setModalNote] = useState<string>('');
  const [modalCallbackDate, setModalCallbackDate] = useState<string>('');
  const [modalCallbackTime, setModalCallbackTime] = useState<string>('03:30 PM');

  // Cross-employee search tracking
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => {
        const q = searchQuery.toLowerCase();
        const otherLead = advisoryLeads.find(l => {
          const match = l.clientName.toLowerCase().includes(q) || l.phone.includes(q);
          const isOther = l.assignedToName && l.assignedToName.toLowerCase() !== currentUser.name.toLowerCase() && l.assignedToName.toLowerCase() !== 'unassigned';
          return match && isOther;
        });

        if (otherLead) {
          triggerClientSearchAlert({
            clientId: otherLead.id,
            clientName: otherLead.clientName,
            clientMobile: otherLead.phone,
            targetType: 'lead',
            ownerName: otherLead.assignedToName,
            searchedById: currentUser.id,
            searchedByName: currentUser.name,
            searchedByRole: currentUser.title || currentUser.role,
            searchedByAvatar: currentUser.avatar,
            searchQuery: searchQuery.trim(),
            searchLocation: 'Leads Advisory Pipeline'
          });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, advisoryLeads, currentUser.name]);
  
  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isCallLogsOpen, setIsCallLogsOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [inspectLead, setInspectLead] = useState<AdvisoryLead | null>(null);
  const [kycModalLead, setKycModalLead] = useState<AdvisoryLead | null>(null);

  // Subtab navigation matching CRM structure
  const getSubTabFromActive = (): string => {
    if (activeTab === 'closed-won' || activeTab === 'closed-own') return 'closed-won';
    if (activeTab === 'new-leads') return 'new-leads';
    if (activeTab === 'today-followup') return 'today-followup';
    if (activeTab === 'active-prospect') return 'active-prospect';
    if (activeTab === 'past-prospect') return 'closed-won';
    if (activeTab === 'confirmed-payment') return 'confirmed-payment';
    if (activeTab === 'interested-leads') return 'interested-leads';
    if (activeTab === 'modified-today') return 'modified-today';
    if (activeTab === 'disposed-today') return 'disposed-today';
    if (activeTab === 'team-pool-leads') return 'team-pool-leads';
    return 'view-all-leads';
  };

  const [currentLeadTab, setCurrentLeadTab] = useState<string>(getSubTabFromActive);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  useEffect(() => {
    const nextSubTab = getSubTabFromActive();
    setCurrentLeadTab(prev => (prev !== nextSubTab ? nextSubTab : prev));
    if (activeTab === 'bulk-upload-leads') {
      setIsBulkUploadOpen(true);
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setCurrentLeadTab(tabId);
    setActiveTab(tabId);
  };

  // Reset pagination when active subtab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentLeadTab, searchQuery, selectedService, selectedAdvisor, selectedResponse, selectedSource]);

  // Memoized tab counts for viewbar buttons (single pass)
  const tabCounts = React.useMemo(() => {
    let newLeads = 0;
    let followups = 0;
    let closedWon = 0;
    const nowObj = new Date(now);

    for (let i = 0; i < scopedLeads.length; i++) {
      const l = scopedLeads[i];
      if (isClosedWon(l)) {
        closedWon++;
      } else if (l.status === 'New Lead' || l.response === 'Fresh') {
        newLeads++;
      }
      if (isFollowupDue(l, nowObj)) {
        followups++;
      }
    }
    return {
      all: scopedLeads.length,
      newLeads,
      followups,
      closedWon
    };
  }, [scopedLeads, now]);

  // Filter leads based on Scoped Role, Tab, Search, Service, Response, and Advisor
  const filteredLeads = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const isSearchActive = q.length > 0;
    const isServiceFilter = selectedService !== 'All';
    const isAdvisorFilter = selectedAdvisor !== 'All';
    const isResponseFilter = selectedResponse !== 'All';
    const selResponseLower = selectedResponse.toLowerCase();
    const isSourceFilter = selectedSource !== 'All';
    const nowObj = new Date(now);

    return scopedLeads.filter(l => {
    // Service filter
    if (selectedService !== 'All' && l.serviceType !== selectedService) return false;

    // Advisor filter (for managers / team leaders)
    if (selectedAdvisor !== 'All' && l.assignedToId !== selectedAdvisor) return false;

    // Response filter
    if (selectedResponse !== 'All') {
      const resp = (l.response || 'Fresh').toLowerCase();
      if (selectedResponse.toLowerCase() !== resp) return false;
    }

    // Lead Source filter
    if (selectedSource !== 'All' && l.source !== selectedSource) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        l.clientName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.assignedToName && l.assignedToName.toLowerCase().includes(q)) ||
        (l.source && l.source.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Subtab filter
    if (currentLeadTab === 'closed-won' || currentLeadTab === 'closed-own') return isClosedWon(l);
    if (!['view-all-leads', 'confirmed-payment', 'modified-today'].includes(currentLeadTab) && isClosedOwn(l)) return false;
    if (currentLeadTab === 'new-leads') {
      return l.status === 'New Lead' || l.response === 'Fresh';
    }
    if (currentLeadTab === 'today-followup') {
      return isFollowupDue(l, new Date(now));
    }
    if (currentLeadTab === 'active-prospect') {
      return l.status === 'Trial Active' || l.response === 'Interested';
    }
    if (currentLeadTab === 'past-prospect') {
      return l.status === 'Lost';
    }
    if (currentLeadTab === 'interested-leads') {
      return l.response === 'Interested';
    }
    if (currentLeadTab === 'confirmed-payment') {
      return l.status === 'Converted' || l.response === 'Payment';
    }
    if (currentLeadTab === 'modified-today') {
      return l.modifiedToday === true || l.lastContactDate?.includes('22-Sep');
    }
    if (currentLeadTab === 'disposed-today') {
      return l.disposedToday === true || l.status === 'Lost';
    }
    if (currentLeadTab === 'team-pool-leads') {
      return l.isTeamPool === true;
    }

    return true; // view-all-leads
    });
  }, [scopedLeads, selectedService, selectedAdvisor, selectedResponse, selectedSource, searchQuery, currentLeadTab, now]);

  const totalExpectedRevenue = React.useMemo(() => {
    return filteredLeads.reduce((acc, l) => acc + (l.expectedRevenue || 0), 0);
  }, [filteredLeads]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLeads = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, safeCurrentPage, pageSize]);

  const stages: LeadStatus[] = ['New Lead', 'In Contact', 'Trial Active', 'Converted'];

  const getServiceBadge = (service: string) => {
    switch (service) {
      case 'Equity Premier':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'Options Strategy':
        return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
      case 'Commodity Momentum':
        return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
      case 'Hedge & PMS':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  const getServiceShortLabel = (service: string) => {
    if (!service) return '-';
    if (service === 'Commodity Momentum') return 'Commodity';
    if (service === 'Options Strategy') return 'Options';
    if (service === 'Equity Premier') return 'Equity Prem';
    return service;
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New Lead':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
            New Lead
          </span>
        );
      case 'In Contact':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            In Contact
          </span>
        );
      case 'Trial Active':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }} />
            Trial Active
          </span>
        );
      case 'Converted':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
            Converted
          </span>
        );
      case 'Lost':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }} />
            Not interested / disposed
          </span>
        );
    }
  };

  const getStageStyle = (status: LeadStatus) => {
    switch (status) {
      case 'New Lead':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', dot: '#0284c7' };
      case 'In Contact':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', dot: '#f59e0b' };
      case 'Trial Active':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', dot: '#8b5cf6' };
      case 'Converted':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#16a34a' };
      case 'Lost':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#dc2626' };
      default:
        return { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', dot: '#94a3b8' };
    }
  };

  const handleStageClick = (lead: AdvisoryLead, nextStage: LeadStatus | 'Closed Won' | 'Closed Own') => {
    if (nextStage === 'Converted' || nextStage === 'Closed Won' || nextStage === 'Closed Own') {
      handleOpenResponseModal(lead); setModalResponse(nextStage === 'Closed Own' ? 'Closed Won' : nextStage);
    } else updateLeadStatus(lead.id, nextStage);
  };

  const getResponseBadge = (response?: string) => {
    switch (response) {
      case 'Interested':
        return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', dot: '#16a34a', label: 'Interested' };
      case 'Call Back':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', dot: '#f59e0b', label: 'Call Back' };
      case 'Fresh':
      case 'New':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', dot: '#0284c7', label: 'Fresh' };
      case 'Busy':
        return { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa', dot: '#f97316', label: 'Busy' };
      case 'Payment':
        return { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', dot: '#22c55e', label: 'Payment' };
      case 'Not Interested':
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', dot: '#94a3b8', label: 'Not Interested' };
      case 'Language Barrier':
        return { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', dot: '#a855f7', label: 'Language Barrier' };
      case 'Wrong Number':
        return { bg: '#ffe4e6', color: '#be123c', border: '#fecdd3', dot: '#f43f5e', label: 'Wrong Number' };
      case 'DND':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca', dot: '#ef4444', label: 'DND' };
      default:
        return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8', label: response || 'Fresh' };
    }
  };

  const handleOpenResponseModal = (lead: AdvisoryLead) => {
    setResponseModalLead(lead);
    setModalResponse(lead.response || 'Interested');
    setModalNote('');
    setModalCallbackDate(lead.callbackDate || new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-CA'));
    setModalCallbackTime(lead.callbackTime || '03:30 PM');
  };

  useEffect(() => {
    const openPending = () => {
      const id = sessionStorage.getItem('crm:pending-response-lead');
      const lead = scopedLeads.find(item => item.id === id);
      if (lead) { sessionStorage.removeItem('crm:pending-response-lead'); handleOpenResponseModal(lead); }
    };
    openPending();
    window.addEventListener('crm:open-lead-response', openPending);
    return () => window.removeEventListener('crm:open-lead-response', openPending);
  }, [activeTab, scopedLeads]);

  const handleSaveResponse = () => {
    if (!responseModalLead) return;
    const saved = updateLeadResponse(
      responseModalLead.id,
      modalResponse,
      modalNote,
      ['Call Back', 'Interested'].includes(modalResponse) ? modalCallbackDate : undefined,
      ['Call Back', 'Interested'].includes(modalResponse) ? modalCallbackTime : undefined
    );
    if (!saved) return;
    if (isClosedWon({ status: responseModalLead.status, response: modalResponse })) { handleResetFilters(); handleTabChange('closed-won'); }
    setResponseModalLead(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedService('All');
    setSelectedAdvisor('All');
    setSelectedResponse('All');
    setSelectedSource('All');
    showToast('Filters reset.', 'info');
  };

  const getTabTitle = () => {
    switch (currentLeadTab) {
      case 'new-leads': return 'New Leads Inquiries';
      case 'closed-won':
      case 'closed-own': return "Closed Won · Client Onboarding";
      case 'today-followup': return "Today's Follow-up Pipeline";
      case 'active-prospect': return 'Active Trial Prospects';
      case 'past-prospect': return 'Closed Won · Client Onboarding';
      case 'confirmed-payment': return 'All Confirmed Payment';
      default: return 'Advisory Leads & Pipeline Desk';
    }
  };

  const getTabBreadcrumb = () => {
    switch (currentLeadTab) {
      case 'new-leads': return 'New Leads';
      case 'closed-won':
      case 'closed-own': return "Closed Won";
      case 'today-followup': return "Today's Follow-up";
      case 'active-prospect': return 'Active Prospects';
      case 'past-prospect': return 'Closed Won';
      case 'confirmed-payment': return 'Confirmed Payment';
      default: return 'Advisory Leads Desk';
    }
  };

  const getTabSubtitle = () => {
    switch (currentLeadTab) {
      case 'confirmed-payment':
        return 'Reconcile customer subscription payments, bank credit verifications, and client tax invoices.';
      default:
        return 'Real-time client stage tracking, tele-calling actions, and advisory revenue pipeline.';
    }
  };

  return (
    <div className="lead-pipeline" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* 1. Top Breadcrumb & Action Strip matching CRM */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: '#ffffff', 
          padding: '0.45rem 0.85rem', 
          borderRadius: '4px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px' }}>
          <span 
            onClick={() => setActiveTab('dashboard')} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ea580c', cursor: 'pointer', fontWeight: 600 }}
          >
            <Home size={15} color="#ea580c" />
            <span>/ Dashboard</span>
          </span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#475569', fontWeight: 500 }}>Sales Pipeline</span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#0073b7', fontWeight: 700 }}>{getTabBreadcrumb()}</span>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {(role === 'manager' || role === 'hr') ? (
            <button 
              onClick={() => setIsBulkUploadOpen(true)}
              style={{
                background: '#0073b7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '3px',
                padding: '0.35rem 0.85rem',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <UploadCloud size={14} /> Bulk Upload Leads
            </button>
          ) : (
            <button 
              onClick={() => setIsAddLeadOpen(true)}
              style={{
                background: '#0073b7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '3px',
                padding: '0.35rem 0.85rem',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Plus size={14} /> Add New Lead
            </button>
          )}

          <button 
            onClick={() => setActiveTab('call-logs')}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '3px',
              padding: '0.35rem 0.85rem',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <PhoneCall size={13} /> Call Logs
          </button>

          <button 
            onClick={() => setIsTipsOpen(true)}
            style={{ 
              background: '#0a192f', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '3px', 
              padding: '0.35rem 0.9rem', 
              fontSize: '12.5px', 
              fontWeight: 700, 
              cursor: 'pointer'
            }}
          >
            Tips
          </button>
        </div>
      </div>

      {/* 2. Title & Executive Pipeline Metrics Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#161e47', margin: 0, letterSpacing: '-0.3px' }}>
              {getTabTitle()}
            </h2>
            <span style={{ fontSize: '11px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '12px' }}>
              {filteredLeads.length} {filteredLeads.length === 1 ? 'Prospect' : 'Prospects'}
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '12.5px' }}>
            {getTabSubtitle()}
          </p>
        </div>

        {/* Executive Real-Time Pipeline Metric Widget */}
        {currentLeadTab !== 'confirmed-payment' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                background: '#ffffff', 
                border: '1px solid #cbd5e1', 
                borderRadius: '6px', 
                padding: '6px 12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 6px rgba(22, 163, 74, 0.4)' }} />
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Active Leads:</span>
                <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{filteredLeads.length}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="lead-viewbar" aria-label="Lead views">
        <div className="lead-primary-views">{[
          { id: 'view-all-leads', label: 'All Leads', count: tabCounts.all },
          { id: 'new-leads', label: 'New', count: tabCounts.newLeads },
          { id: 'today-followup', label: 'Follow-ups', count: tabCounts.followups },
          { id: 'closed-won', label: 'Closed Won', count: tabCounts.closedWon }
        ].map(view => <button key={view.id} aria-pressed={currentLeadTab === view.id || (view.id === 'closed-won' && currentLeadTab === 'closed-own')} className={(currentLeadTab === view.id || (view.id === 'closed-won' && currentLeadTab === 'closed-own')) ? 'selected' : ''} onClick={() => handleTabChange(view.id)}>{view.label}<span>{view.count}</span></button>)}</div>
        <select aria-label="More lead views" value={['view-all-leads', 'new-leads', 'today-followup', 'closed-won', 'closed-own'].includes(currentLeadTab) ? '' : currentLeadTab} onChange={e => { if(e.target.value) handleTabChange(e.target.value); }}>
          <option value="">More views</option><option value="active-prospect">Active Prospect</option><option value="interested-leads">Interested Leads</option><option value="confirmed-payment">Confirmed Payment</option><option value="modified-today">Modified Today</option><option value="disposed-today">Disposed / Not interested</option>{role !== 'employee' && <option value="team-pool-leads">Team Pool</option>}
        </select>
      </nav>

      {/* CONFIRMED PAYMENT TAB SWITCH */}
      {currentLeadTab === 'confirmed-payment' ? (
        <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Confirmed Payments...</div>}>
          <AllConfirmedPaymentsView embedded={true} />
        </React.Suspense>
      ) : (
        <>
          {/* 4. CRM Search & Filter Toolbar (Clean, Unified, No Extra Filter Cards) */}
          <div className={`lead-searchbar ${showFilters ? 'expanded' : ''}`}
            style={{
              background: '#ffffff',
              borderRadius: '6px',
              padding: '0.85rem 1rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            {/* Search Input */}
            <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #94a3b8',
                  borderRadius: '4px',
                  padding: '0 0.65rem',
                  height: '36px',
                  gap: '6px'
                }}
              >
                <Search size={14} color="#64748b" />
                <input 
                  type="text"
                  placeholder="Search client, mobile, source, city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '12.5px',
                    width: '100%',
                    color: '#1e293b'
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Response Dropdown */}
            <button className="lead-filter-toggle" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>Filters{[selectedResponse, selectedSource, selectedService, selectedAdvisor].filter(v => v !== 'All').length ? ` (${[selectedResponse, selectedSource, selectedService, selectedAdvisor].filter(v => v !== 'All').length})` : ''}</button>
            <div style={{ minWidth: '150px', flex: '0 1 auto' }}>
              <select
                value={selectedResponse}
                onChange={e => setSelectedResponse(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 0.65rem',
                  border: '1px solid #94a3b8',
                  borderRadius: '4px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: selectedResponse !== 'All' ? '#0284c7' : '#334155',
                  background: selectedResponse !== 'All' ? '#f0f9ff' : '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Responses</option>
                <option value="Fresh">Fresh / Uncontacted</option>
                <option value="Interested">Interested</option>
                <option value="Call Back">Call Back</option>
                <option value="Busy">Busy / Waiting</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Language Barrier">Language Barrier</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="DND">DND (Do Not Call)</option>
                <option value="Payment">Payment Pending</option><option value="Closed Won">Closed Won</option><option value="Converted">Converted</option>
              </select>
            </div>

            {/* Filter by Lead Source Dropdown (Matching Screenshot Sources) */}
            <div style={{ minWidth: '160px', flex: '0 1 auto' }}>
              <select
                value={selectedSource}
                onChange={e => setSelectedSource(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 0.65rem',
                  border: '1px solid #94a3b8',
                  borderRadius: '4px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: selectedSource !== 'All' ? '#0369a1' : '#334155',
                  background: selectedSource !== 'All' ? '#f0f9ff' : '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Lead Sources</option>
                <option value="D WEB KANNADA">D WEB KANNADA</option>
                <option value="D WEB TELUGU">D WEB TELUGU</option>
                <option value="D WEB TAMIL">D WEB TAMIL</option>
                <option value="D WEB HINDI">D WEB HINDI</option>
                <option value="D WEB KERALA">D WEB KERALA</option>
                <option value="PND - OS KANNADA">PND - OS KANNADA</option>
                <option value="SPL KANNADA">SPL KANNADA</option>
                <option value="KTK-OS TAMIL">KTK-OS TAMIL</option>
                <option value="PD - OS ANDHRA">PD - OS ANDHRA</option>
                <option value="PD - OS KANNADA">PD - OS KANNADA</option>
              </select>
            </div>

            {/* Product Segment Dropdown */}
            <div style={{ minWidth: '150px', flex: '0 1 auto' }}>
              <select
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 0.65rem',
                  border: '1px solid #94a3b8',
                  borderRadius: '4px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#334155',
                  background: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Services</option>
                <option value="Equity Premier">Equity Premier</option>
                <option value="Options Strategy">Options Strategy</option>
                <option value="Commodity Momentum">Commodity Momentum</option>
                <option value="Hedge & PMS">Hedge & PMS</option>
              </select>
            </div>

            {/* Advisor Dropdown (Manager & Team Leader View) */}
            {role !== 'employee' && (
              <div style={{ minWidth: '150px', flex: '0 1 auto' }}>
                <select
                  value={selectedAdvisor}
                  onChange={e => setSelectedAdvisor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 0.65rem',
                    border: '1px solid #94a3b8',
                    borderRadius: '4px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#334155',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Advisors</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              <button
                onClick={handleResetFilters}
                title="Reset Filters"
                style={{
                  height: '36px',
                  padding: '0 0.75rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          {/* 5. MAIN CONTENT: TABLE VIEW OR CARDS VIEW (ZERO HORIZONTAL SCROLL) */}
          {filteredLeads.length === 0 ? (
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '6px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'inline-flex', padding: '12px', background: '#f1f5f9', borderRadius: '50%', marginBottom: '10px' }}>
                <AlertCircle size={28} color="#94a3b8" />
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>No Leads Found</div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 14px 0' }}>
                No active leads match the selected status or search criteria.
              </p>
              <button
                onClick={handleResetFilters}
                style={{ background: '#0073b7', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* PREMIUM LEADS DESK TABLE (ZERO HORIZONTAL OVERFLOW, MODERN UI) */
            /* ------------------------------------------------------------- */
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '100%'
              }}
            >
              <div className="lead-table-wrap">
                <table className="lead-fit-table"
                  style={{ 
                    width: '100%', 
                    minWidth: 0,
                    borderCollapse: 'collapse', 
                    textAlign: 'left',
                    fontSize: '12.5px'
                  }}
                >
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                    <th style={{ width: '20%', padding: '8px 10px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} color="#0284c7" /> Prospect Profile
                      </span>
                    </th>
                    <th style={{ width: '12%', padding: '8px 10px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#0369a1" /> Lead Source
                      </span>
                    </th>
                    <th style={{ width: '18%', padding: '8px 10px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} color="#15803d" /> Response & Touch
                      </span>
                    </th>
                    <th style={{ width: '15%', padding: '8px 10px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={12} color="#d97706" /> Service & Fee
                      </span>
                    </th>
                    <th style={{ width: '17%', padding: '8px 10px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={12} color="#059669" /> Stage & Advisor
                      </span>
                    </th>
                    <th style={{ width: '18%', padding: '8px 10px', fontWeight: 700, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <PhoneOutgoing size={12} color="#16a34a" /> Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead, idx) => {
                    const sBadge = getServiceBadge(lead.serviceType);
                    const stageStyle = getStageStyle(lead.status);
                    const { name: displayClientName } = resolveLeadClientName(lead);
                    return (
                      <tr 
                        key={lead.id} 
                        style={{ 
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafbfe',
                          transition: 'all 0.15s ease'
                        }}


                      >
                        {/* Prospect Profile */}
                        <td data-label="Prospect" style={{ padding: '8px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <div 
                              style={{ 
                                width: '30px', 
                                height: '30px', 
                                borderRadius: '50%', 
                                background: '#161e47', 
                                color: '#ffffff', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 700, 
                                fontSize: '11.5px',
                                flexShrink: 0
                              }}
                            >
                              {displayClientName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div 
                                onClick={() => setInspectLead({ ...lead, clientName: displayClientName })}
                                style={{ 
                                  fontWeight: 700, 
                                  color: '#0073b7', 
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                                onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
                                title="Click to inspect lead dossier"
                              >
                                {displayClientName}
                              </div>
                              <div className="lead-contact-meta" style={{ fontSize: '10.5px', color: '#64748b' }}>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{lead.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Lead Source */}
                        <td data-label="Source" style={{ padding: '8px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            <span 
                              title={lead.source || 'Direct Web'}
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px',
                                fontSize: '10.5px', 
                                fontWeight: 700, 
                                padding: '1.5px 6px', 
                                borderRadius: '4px', 
                                background: '#f0f9ff', 
                                color: '#0369a1', 
                                border: '1px solid #bae6fd',
                                width: 'fit-content',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <MapPin size={9} color="#0284c7" />
                              {lead.source || 'Direct Web'}
                            </span>
                            {lead.teamLeaderName && (
                              <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                TL: <strong style={{ color: '#334155' }}>{lead.teamLeaderName}</strong>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Response & Touch */}
                        <td data-label="Response" style={{ padding: '8px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                          {(() => {
                            const rBadge = getResponseBadge(lead.response);
                            return (
                              <div className="lead-response-summary">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap', maxWidth: '100%' }}>
                                  <span 
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: rBadge.bg,
                                      color: rBadge.color,
                                      border: `1px solid ${rBadge.border}`,
                                      borderRadius: '10px',
                                      padding: '1.5px 7px',
                                      fontSize: '10.5px',
                                      fontWeight: 700,
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: rBadge.dot }} />
                                    {rBadge.label}
                                  </span>
                                  {lead.response === 'Call Back' && lead.callbackTime && (
                                    <span style={{ fontSize: '9.5px', color: '#b45309', fontWeight: 600, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '4px', padding: '1px 4px', whiteSpace: 'nowrap' }}>
                                      ⏰ {lead.callbackTime}
                                    </span>
                                  )}
                                </div>
                                {(lead.dispositionHistory?.[0]?.note || lead.description) && (
                                  <span style={{ fontSize: '10.5px', color: '#64748b', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.dispositionHistory?.[0]?.note || lead.description}>
                                    {lead.dispositionHistory?.[0]?.note || lead.description}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Service & Value */}
                        <td data-label="Service & fee" style={{ padding: '8px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            <div style={{ minWidth: 0 }}>
                              {lead.serviceType ? (
                                <span 
                                  title={lead.serviceType}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: sBadge.bg,
                                    color: sBadge.color,
                                    border: `1px solid ${sBadge.border}`,
                                    borderRadius: '4px',
                                    padding: '1.5px 6px',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  <Sparkles size={9} />
                                  {getServiceShortLabel(lead.serviceType)}
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>-</span>
                              )}
                            </div>
                            {lead.expectedRevenue > 0 ? (
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', letterSpacing: '-0.2px' }}>
                                ₹{lead.expectedRevenue.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>-</div>
                            )}
                          </div>
                        </td>

                        {/* Advisor & Stage */}
                        <td data-label="Stage & advisor" style={{ padding: '8px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '11.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '3px' }}>
                            {lead.assignedToName || 'Unassigned'}
                          </div>
                          {/* Interactive Stage Dropdown Pill */}
                          <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', maxWidth: '100%' }}>
                            <span 
                              style={{ 
                                position: 'absolute', 
                                left: '7px', 
                                width: '5px', 
                                height: '5px', 
                                borderRadius: '50%', 
                                background: stageStyle.dot,
                                boxShadow: `0 0 4px ${stageStyle.dot}80`,
                                pointerEvents: 'none',
                                zIndex: 1
                              }} 
                            />
                            <select
                              value={isClosedWon(lead) ? (lead.status === 'Converted' || lead.response === 'Converted' ? 'Converted' : 'Closed Won') : lead.status === 'Lost' ? '' : lead.status}
                              onChange={e => handleStageClick(lead, e.target.value as LeadStatus | 'Closed Won')}
                              style={{
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                padding: '2px 16px 2px 15px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                borderRadius: '12px',
                                border: `1px solid ${stageStyle.border}`,
                                background: stageStyle.bg,
                                color: stageStyle.color,
                                cursor: 'pointer',
                                outline: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                transition: 'all 0.15s ease',
                                maxWidth: '100%',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}
                              title="Click to change lead stage"
                            >
                              {stages.map(st => (
                                <option key={st} value={st} style={{ background: '#ffffff', color: '#1e293b' }}>
                                  {st}
                                </option>
                              ))}
                              {lead.status === 'Lost' && !isClosedOwn(lead) && <option value="" disabled>Disposed</option>}
                              <option value="Closed Won">Closed Won</option>
                            </select>
                            <ChevronDown 
                              size={9} 
                              color={stageStyle.color} 
                              style={{ position: 'absolute', right: '5px', pointerEvents: 'none' }} 
                            />
                            {lead.status === 'Converted' && (
                              <span title="Paid Advisory Client" style={{ color: '#16a34a', marginLeft: '3px', display: 'inline-flex' }}>
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td data-label="Actions" style={{ padding: '6px 8px', verticalAlign: 'middle', textAlign: 'center', overflow: 'visible' }}>
                          <div className="lead-row-actions" style={{ justifyContent: 'center', margin: '0 auto', float: 'none' }}>
                            <button
                              onClick={() => handleOpenResponseModal({ ...lead, clientName: displayClientName })}
                              className="lead-response-action"
                              title="Update Lead Response / Disposition"
                              style={{
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                borderRadius: '5px',
                                width: '25px',
                                height: '25px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.background = '#dcfce7';
                                e.currentTarget.style.borderColor = '#86efac';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = '#f0fdf4';
                                e.currentTarget.style.borderColor = '#bbf7d0';
                                e.currentTarget.style.transform = 'none';
                              }}
                            >
                              <CheckCircle2 size={13} strokeWidth={2.4} /><span>Response</span>
                            </button>

                            <button
                              onClick={() => showToast(`Calling ${displayClientName} (${lead.phone})...`, 'info')}
                              title={`Direct Dial: ${lead.phone}`}
                              style={{
                                background: '#f0f9ff',
                                color: '#0284c7',
                                border: '1px solid #bae6fd',
                                borderRadius: '5px',
                                width: '25px',
                                height: '25px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.background = '#e0f2fe';
                                e.currentTarget.style.borderColor = '#7dd3fc';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = '#f0f9ff';
                                e.currentTarget.style.borderColor = '#bae6fd';
                                e.currentTarget.style.transform = 'none';
                              }}
                            >
                              <PhoneCall size={13} strokeWidth={2.2} />
                            </button>

                            <button
                              onClick={() => {
                                const msg = encodeURIComponent(`Hello ${displayClientName}, this is regarding your advisory inquiry with Stocketics.`);
                                window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                              }}
                              title="Instant WhatsApp Connect"
                              style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                borderRadius: '5px',
                                width: '25px',
                                height: '25px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.background = '#d1fae5';
                                e.currentTarget.style.borderColor = '#6ee7b7';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = '#ecfdf5';
                                e.currentTarget.style.borderColor = '#a7f3d0';
                                e.currentTarget.style.transform = 'none';
                              }}
                            >
                              <MessageSquare size={13} strokeWidth={2.2} />
                            </button>

                            <button
                              onClick={() => setInspectLead(lead)}
                              title="View Full Lead Dossier"
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '5px',
                                width: '25px',
                                height: '25px',
                                color: '#475569',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.background = '#0073b7';
                                e.currentTarget.style.borderColor = '#0073b7';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.color = '#475569';
                                e.currentTarget.style.transform = 'none';
                              }}
                            >
                              <Eye size={13} strokeWidth={2.2} />
                            </button>

                            {(currentLeadTab === 'closed-won' || currentLeadTab === 'closed-own') && isClosedWon(lead) && (
                              <button 
                                className="lead-onboard-action" 
                                onClick={() => setKycModalLead(lead)} 
                                title="Open client onboarding"
                                style={{
                                  height: '26px',
                                  padding: '0 6px',
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  borderRadius: '5px'
                                }}
                              >
                                <ShieldCheck size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              {/* Table Footer */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 16px', 
                  background: '#f8fafc', 
                  borderTop: '1.5px solid #e2e8f0', 
                  fontSize: '12px', 
                  color: '#64748b',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span>Showing <strong>{filteredLeads.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1} - {Math.min(safeCurrentPage * pageSize, filteredLeads.length)}</strong> of <strong>{filteredLeads.length}</strong> {filteredLeads.length === 1 ? 'lead' : 'leads'}</span>
                  
                  <span>Total Expected Revenue: <strong style={{ color: '#166534' }}>₹{totalExpectedRevenue.toLocaleString('en-IN')}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {totalPages > 1 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={safeCurrentPage <= 1}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: safeCurrentPage <= 1 ? '#f1f5f9' : '#ffffff',
                          color: safeCurrentPage <= 1 ? '#94a3b8' : '#334155',
                          cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Prev
                      </button>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', padding: '0 4px' }}>
                        Page {safeCurrentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={safeCurrentPage >= totalPages}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: safeCurrentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                          color: safeCurrentPage >= totalPages ? '#94a3b8' : '#334155',
                          cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '3px 6px',
                      fontSize: '11px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                    title="Rows per page"
                  >
                    <option value={15}>15 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                  <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    Subtab: {currentLeadTab}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 6. Lead Detail Dossier Modal */}
      {inspectLead && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 25, 47, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setInspectLead(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '6px',
              maxWidth: '520px',
              width: '100%',
              border: '1px solid #cbd5e1',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{ 
                background: '#161e47', 
                color: '#ffffff', 
                padding: '12px 16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="#38bdf8" />
                <span style={{ fontWeight: 700, fontSize: '13.5px' }}>Prospect Dossier • {inspectLead.id}</span>
              </div>
              <button 
                onClick={() => setInspectLead(null)}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '2px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#161e47' }}>
                    {inspectLead.clientName}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {inspectLead.phone} • {inspectLead.email}
                  </div>
                </div>
                {getStatusBadge(inspectLead.status)}
              </div>

              {/* Data Grid */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px', 
                  background: '#f8fafc', 
                  padding: '10px', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>City / Location</span>
                  <strong>{inspectLead.city || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Product Segment</span>
                  <strong>{inspectLead.serviceType || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Expected Fee</span>
                  <strong style={{ color: '#166534' }}>{inspectLead.expectedRevenue > 0 ? `₹${inspectLead.expectedRevenue.toLocaleString('en-IN')}` : '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Investment Bracket</span>
                  <strong>{inspectLead.investmentBracket || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Assigned Advisor</span>
                  <strong>{inspectLead.assignedToName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Last Contact Date</span>
                  <strong>{inspectLead.lastContactDate}</strong>
                </div>
              </div>

              {/* Stage Transition Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Update Progression Stage:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {stages.map(stage => {
                    const isCurrent = inspectLead.status === stage;
                    return (
                      <button
                        key={stage}
                        onClick={() => {
                          handleStageClick(inspectLead, stage);
                          setInspectLead(prev => prev ? { ...prev, status: stage } : null);
                        }}
                        style={{
                          background: isCurrent ? '#0073b7' : '#ffffff',
                          color: isCurrent ? '#ffffff' : '#475569',
                          border: `1px solid ${isCurrent ? '#0073b7' : '#cbd5e1'}`,
                          borderRadius: '4px',
                          padding: '6px 2px',
                          fontSize: '11px',
                          fontWeight: isCurrent ? 700 : 600,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* KYC Onboarding Compliance Status Banner */}
              <div 
                style={{ 
                  background: '#f0f9ff', 
                  border: '1px solid #bae6fd', 
                  borderRadius: '6px', 
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#0284c7" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                      Advisory KYC Compliance
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Status: <strong>{getKYCCaseForLead(inspectLead.id)?.status || 'Not Started'}</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setKycModalLead(inspectLead);
                    setInspectLead(null);
                  }}
                  style={{
                    background: '#0073b7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={13} /> KYC Onboarding
                </button>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => {
                    showToast(`Dialing ${inspectLead.clientName}...`, 'info');
                    setInspectLead(null);
                  }}
                  style={{
                    flex: 1,
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <PhoneCall size={14} /> Call Client
                </button>
                <button
                  onClick={() => {
                    setActiveTab('call-logs');
                    setInspectLead(null);
                  }}
                  style={{
                    flex: 1,
                    background: '#0a192f',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <PhoneOutgoing size={14} /> Tele-Call Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Interactive Response & Disposition Modal */}
      {responseModalLead && (
        <div className="lead-workflow-dialog" 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => undefined}
        >
          <div role="dialog" aria-modal="true" aria-label="Update lead response"
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              border: '1px solid #cbd5e1',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflowX: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{ 
                background: '#0073b7', 
                color: '#ffffff', 
                padding: '12px 16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#ffffff" />
                <span style={{ fontWeight: 700, fontSize: '14px' }}>
                  Update Lead Response • {responseModalLead.clientName}
                </span>
              </div>
              <button 
                onClick={() => { if (!modalNote.trim() || window.confirm('Discard this unsaved response?')) setResponseModalLead(null); }}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '2px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Mobile / Source</span>
                  <strong>{responseModalLead.phone}</strong> • <span style={{ color: '#0284c7' }}>{responseModalLead.source || 'Direct Web'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Assigned Employee</span>
                  <strong>{responseModalLead.assignedToName}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Client Response:
                </label>
                <select
                  value={modalResponse}
                  onChange={e => setModalResponse(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid #0284c7',
                    borderRadius: '5px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                >
                  <option value="Interested">Interested (Active Prospect)</option>
                  <option value="Call Back">Call Back (Scheduled Follow-up)</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Converted">Converted</option>
                  <option value="Fresh">Fresh / New</option>
                  <option value="Busy">Busy / Ringing</option>
                  <option value="Payment">Payment / Token Received</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Language Barrier">Language Barrier</option>
                  <option value="Wrong Number">Wrong Number</option>
                  <option value="DND">Do Not Disturb (DND)</option>
                </select>
              </div>

              {/* Call Back Schedule */}
              {['Call Back', 'Interested'].includes(modalResponse) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#fef3c7', padding: '10px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                      Callback Date:
                    </label>
                    <input 
                      type="date"
                      value={modalCallbackDate}
                      onChange={e => setModalCallbackDate(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                      Callback Time:
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. 03:30 PM"
                      value={modalCallbackTime}
                      onChange={e => setModalCallbackTime(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                </div>
              )}

              <section className="lead-response-history" aria-label="Previous client responses">
                <h4>Previous client responses <span>{responseModalLead.dispositionHistory?.length || 0}</span></h4>
                <div className="lead-response-timeline">
                  {(responseModalLead.dispositionHistory || []).map(entry => <article key={entry.id}>
                    <header><strong>{entry.response}</strong><time>{Number.isNaN(Date.parse(entry.timestamp)) ? entry.timestamp : new Date(entry.timestamp).toLocaleString()}</time></header>
                    <p>{entry.note || 'No description recorded.'}</p>
                    <small>{entry.actorName}{entry.callbackDate ? ` · Callback: ${entry.callbackDate} ${entry.callbackTime || ''}` : ''}</small>
                  </article>)}
                  {!responseModalLead.dispositionHistory?.length && <p>{responseModalLead.description || 'No previous responses. Add the first conversation below.'}</p>}
                </div>
              </section>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  New client response / description:
                </label>
                <textarea
                  rows={3}
                  value={modalNote}
                  onChange={e => setModalNote(e.target.value)}
                  placeholder="Enter remarks, client budget, stock holdings discussed..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => {
                    disposeLead(responseModalLead.id, modalNote ? `${modalResponse} - ${modalNote}` : modalResponse);
                    setResponseModalLead(null);
                  }}
                  style={{
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Dispose Lead
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { if (!modalNote.trim() || window.confirm('Discard this unsaved response?')) setResponseModalLead(null); }}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveResponse}
                    style={{
                      background: '#0073b7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '7px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {isAddLeadOpen && <AddNewLeadModal isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} />}
      {isBulkUploadOpen && (
        <React.Suspense fallback={null}>
          <BulkLeadUploadModal isOpen={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} />
        </React.Suspense>
      )}
      {isCallLogsOpen && <CallLogsModal isOpen={isCallLogsOpen} onClose={() => setIsCallLogsOpen(false)} />}
      {isTipsOpen && <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />}
      {kycModalLead && (
        <React.Suspense fallback={null}>
          <LeadKYCOnboardingModal
          lead={kycModalLead}
          isOpen={!!kycModalLead}
          onClose={() => setKycModalLead(null)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
