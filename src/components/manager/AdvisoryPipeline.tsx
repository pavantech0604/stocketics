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
  LayoutGrid,
  List,
  MapPin,
  MessageSquare,
  X,
  PhoneOutgoing,
  Download,
  RotateCcw,
  Sparkles,
  ChevronRight,
  User,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AddNewLeadModal, CallLogsModal } from '../common/CRMActionModals';
import { BulkLeadUploadModal } from './BulkLeadUploadModal';
import { AllConfirmedPaymentsView } from './AllConfirmedPaymentsView';
import { TipsModal } from '../common/TipsModal';
import confetti from 'canvas-confetti';

export const AdvisoryPipeline: React.FC = () => {
  const { role, activeTab, setActiveTab, advisoryLeads, updateLeadStatus, showToast, employees } = useApp();
  
  // View mode: 'table' (clean compact table matching CRM) or 'cards' (responsive cards, zero horizontal scroll)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedAdvisor, setSelectedAdvisor] = useState('All');
  
  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isCallLogsOpen, setIsCallLogsOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [inspectLead, setInspectLead] = useState<AdvisoryLead | null>(null);

  // Subtab navigation matching CRM structure
  const getSubTabFromActive = (): string => {
    if (activeTab === 'new-leads') return 'new-leads';
    if (activeTab === 'today-followup') return 'today-followup';
    if (activeTab === 'active-prospect') return 'active-prospect';
    if (activeTab === 'past-prospect') return 'past-prospect';
    if (activeTab === 'confirmed-payment') return 'confirmed-payment';
    return 'view-all-leads';
  };

  const [currentLeadTab, setCurrentLeadTab] = useState<string>(getSubTabFromActive());

  useEffect(() => {
    setCurrentLeadTab(getSubTabFromActive());
    if (activeTab === 'bulk-upload-leads') {
      setIsBulkUploadOpen(true);
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setCurrentLeadTab(tabId);
    setActiveTab(tabId);
  };

  // Filter leads based on Tab, Search, Service, and Advisor
  const filteredLeads = advisoryLeads.filter(l => {
    // Service filter
    if (selectedService !== 'All' && l.serviceType !== selectedService) return false;

    // Advisor filter (for managers)
    if (selectedAdvisor !== 'All' && l.assignedToId !== selectedAdvisor) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        l.clientName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.assignedToName.toLowerCase().includes(q) ||
        (l.city && l.city.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Subtab filter
    if (currentLeadTab === 'new-leads') return l.status === 'New Lead';
    if (currentLeadTab === 'today-followup') return l.status === 'In Contact' || l.lastContactDate === '07-Sep-2026';
    if (currentLeadTab === 'active-prospect') return l.status === 'Trial Active';
    if (currentLeadTab === 'past-prospect') return l.status === 'Lost' || l.status === 'Converted';

    return true; // view-all-leads
  });

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
            Lost / Closed
          </span>
        );
    }
  };

  const handleStageClick = (lead: AdvisoryLead, nextStage: LeadStatus) => {
    updateLeadStatus(lead.id, nextStage);
    if (nextStage === 'Converted') {
      try { confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } }); } catch (_) {}
      showToast(`Lead ${lead.clientName} converted to Paid Advisory!`, 'success');
    } else {
      showToast(`Updated ${lead.clientName} stage to ${nextStage}`, 'info');
    }
  };

  const handleExportCSV = () => {
    const headers = "Lead ID,Client Name,Phone,Email,City,Service Type,Expected Value,Investment Bracket,Status,Assigned Advisor,Last Contact\n";
    const rows = filteredLeads.map(l => 
      `"${l.id}","${l.clientName}","${l.phone}","${l.email}","${l.city || ''}","${l.serviceType}",${l.expectedRevenue},"${l.investmentBracket}","${l.status}","${l.assignedToName}","${l.lastContactDate}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Stocketics_Leads_${currentLeadTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported leads list to CSV.', 'success');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedService('All');
    setSelectedAdvisor('All');
    showToast('Filters reset.', 'info');
  };

  const getTabTitle = () => {
    switch (currentLeadTab) {
      case 'new-leads': return 'New Leads Inquiries';
      case 'today-followup': return "Today's Follow-up Pipeline";
      case 'active-prospect': return 'Active Trial Prospects';
      case 'past-prospect': return 'Past & Closed Leads';
      case 'confirmed-payment': return 'All Confirmed Payment';
      default: return 'Advisory Leads & Pipeline Desk';
    }
  };

  const getTabBreadcrumb = () => {
    switch (currentLeadTab) {
      case 'new-leads': return 'New Leads';
      case 'today-followup': return "Today's Follow-up";
      case 'active-prospect': return 'Active Prospects';
      case 'past-prospect': return 'Past / Lost';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
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
          {role === 'manager' ? (
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

      {/* 2. Title & Interactive View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#161e47', margin: 0, letterSpacing: '-0.3px' }}>
            {getTabTitle()}
          </h2>
          <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '12.5px' }}>
            {getTabSubtitle()}
          </p>
        </div>

        {/* View Mode Switcher: Table vs Cards (Zero horizontal scroll on both) */}
        {currentLeadTab !== 'confirmed-payment' && (
          <div style={{ display: 'flex', alignItems: 'center', background: '#e2e8f0', borderRadius: '5px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#161e47' : '#475569',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <List size={14} /> Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#161e47' : '#475569',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <LayoutGrid size={14} /> Cards View
            </button>
          </div>
        )}
      </div>

      {/* 3. Subtabs Bar (Responsive Flex-Wrap, NO Horizontal Scroll) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          background: '#ffffff',
          borderRadius: '6px',
          padding: '8px 10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        {[
          { id: 'view-all-leads', label: 'All Leads', count: advisoryLeads.length },
          { id: 'new-leads', label: 'New Leads', count: advisoryLeads.filter(l => l.status === 'New Lead').length },
          { id: 'today-followup', label: "Today's Follow-up", count: advisoryLeads.filter(l => l.status === 'In Contact' || l.lastContactDate === '07-Sep-2026').length },
          { id: 'active-prospect', label: 'Active Prospect', count: advisoryLeads.filter(l => l.status === 'Trial Active').length },
          { id: 'past-prospect', label: 'Past / Lost', count: advisoryLeads.filter(l => l.status === 'Lost' || l.status === 'Converted').length },
          { id: 'confirmed-payment', label: 'Confirmed Payment', count: 4, icon: <CreditCard size={13} /> }
        ].map(tab => {
          const isActive = currentLeadTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                background: isActive ? '#0073b7' : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                border: `1px solid ${isActive ? '#0073b7' : '#cbd5e1'}`,
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.12s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span 
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#475569',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONFIRMED PAYMENT TAB SWITCH */}
      {currentLeadTab === 'confirmed-payment' ? (
        <AllConfirmedPaymentsView embedded={true} />
      ) : (
        <>
          {/* 4. CRM Search & Filter Toolbar (Clean, Unified, No Extra Filter Cards) */}
          <div 
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
            <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
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
                  placeholder="Search client, mobile, city, advisor..."
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

            {/* Product Segment Dropdown */}
            <div style={{ minWidth: '160px', flex: '0 1 auto' }}>
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
                <option value="All">All Advisory Services</option>
                <option value="Equity Premier">Equity Premier</option>
                <option value="Options Strategy">Options Strategy</option>
                <option value="Commodity Momentum">Commodity Momentum</option>
                <option value="Hedge & PMS">Hedge & PMS</option>
              </select>
            </div>

            {/* Advisor Dropdown (Manager View) */}
            {role === 'manager' && (
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
                  <option value="All">All Assigned Advisors</option>
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

              <button
                onClick={handleExportCSV}
                style={{
                  height: '36px',
                  padding: '0 0.85rem',
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Download size={13} /> Export CSV
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
          ) : viewMode === 'table' ? (
            /* ------------------------------------------------------------- */
            /* TABLE VIEW: Responsive Fluid Grid, 100% Width, Zero Overflow  */
            /* ------------------------------------------------------------- */
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '100%'
              }}
            >
              <table 
                style={{ 
                  width: '100%', 
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse', 
                  textAlign: 'left',
                  fontSize: '12px'
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                    <th style={{ width: '28%', padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Prospect Profile</th>
                    <th style={{ width: '20%', padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Service & Value</th>
                    <th style={{ width: '18%', padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Advisor & Touch</th>
                    <th style={{ width: '18%', padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Stage Progression</th>
                    <th style={{ width: '16%', padding: '10px 12px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, idx) => {
                    const sBadge = getServiceBadge(lead.serviceType);
                    return (
                      <tr 
                        key={lead.id} 
                        style={{ 
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f0f7ff'}
                        onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa'}
                      >
                        {/* Prospect Profile */}
                        <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <div 
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                background: '#161e47', 
                                color: '#ffffff', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 700, 
                                fontSize: '12px',
                                flexShrink: 0
                              }}
                            >
                              {lead.clientName.charAt(0)}
                            </div>
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div 
                                onClick={() => setInspectLead(lead)}
                                style={{ 
                                  fontWeight: 700, 
                                  color: '#0073b7', 
                                  fontSize: '12.5px',
                                  cursor: 'pointer',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Click to view details"
                              >
                                {lead.clientName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <span>{lead.phone}</span>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span>{lead.city || 'India'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Service & Value */}
                        <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                          <div>
                            <span 
                              style={{
                                display: 'inline-block',
                                background: sBadge.bg,
                                color: sBadge.color,
                                border: `1px solid ${sBadge.border}`,
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {lead.serviceType}
                            </span>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', marginTop: '3px' }}>
                              ₹{lead.expectedRevenue.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </td>

                        {/* Advisor & Touch */}
                        <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 600, color: '#334155', fontSize: '12px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {lead.assignedToName}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                            {lead.lastContactDate}
                          </div>
                        </td>

                        {/* Interactive Stage Stepper */}
                        <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <select
                              value={lead.status}
                              onChange={e => handleStageClick(lead, e.target.value as LeadStatus)}
                              style={{
                                padding: '3px 6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#1e293b',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              {stages.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                              <option value="Lost">Lost / Closed</option>
                            </select>
                            {lead.status === 'Converted' && (
                              <span title="Converted" style={{ color: '#16a34a' }}>✓</span>
                            )}
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td style={{ padding: '10px 12px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              onClick={() => showToast(`Calling ${lead.clientName} (${lead.phone})...`, 'info')}
                              title="Call Client"
                              style={{
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <PhoneCall size={12} />
                            </button>

                            <button
                              onClick={() => {
                                const msg = encodeURIComponent(`Hello ${lead.clientName}, this is regarding your advisory inquiry with Stocketics.`);
                                window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                              }}
                              title="Chat on WhatsApp"
                              style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <MessageSquare size={12} />
                            </button>

                            <button
                              onClick={() => setInspectLead(lead)}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                padding: '4px 7px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#475569',
                                cursor: 'pointer'
                              }}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Footer */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  background: '#f8fafc', 
                  borderTop: '1px solid #e2e8f0', 
                  fontSize: '12px', 
                  color: '#64748b' 
                }}
              >
                <span>Showing <strong>{filteredLeads.length}</strong> active leads</span>
                <span>Subtab: <strong>{currentLeadTab}</strong></span>
              </div>
            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* CARDS VIEW: Responsive Clean Cards (Zero Horizontal Overflow)  */
            /* ------------------------------------------------------------- */
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '12px',
                width: '100%'
              }}
            >
              {filteredLeads.map(lead => {
                const sBadge = getServiceBadge(lead.serviceType);
                return (
                  <div
                    key={lead.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = '#0073b7';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 115, 183, 0.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                    }}
                  >
                    <div>
                      {/* Card Top: Client & Service */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div 
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '4px',
                              background: '#161e47',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px'
                            }}
                          >
                            {lead.clientName.charAt(0)}
                          </div>
                          <div>
                            <div 
                              onClick={() => setInspectLead(lead)}
                              style={{ fontSize: '13.5px', fontWeight: 800, color: '#0073b7', cursor: 'pointer' }}
                            >
                              {lead.clientName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {lead.phone} • {lead.city || 'India'}
                            </div>
                          </div>
                        </div>

                        <span 
                          style={{
                            background: sBadge.bg,
                            color: sBadge.color,
                            border: `1px solid ${sBadge.border}`,
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '10.5px',
                            fontWeight: 700
                          }}
                        >
                          {lead.serviceType}
                        </span>
                      </div>

                      {/* Card Middle: Key Figures */}
                      <div 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          background: '#f8fafc', 
                          padding: '6px 8px', 
                          borderRadius: '4px', 
                          border: '1px solid #f1f5f9',
                          marginBottom: '10px' 
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Expected Fee</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                            ₹{lead.expectedRevenue.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Advisor</div>
                          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                            {lead.assignedToName}
                          </div>
                        </div>
                      </div>

                      {/* Stage Dropdown Selector */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Current Stage</span>
                          {getStatusBadge(lead.status)}
                        </div>
                        <select
                          value={lead.status}
                          onChange={e => handleStageClick(lead, e.target.value as LeadStatus)}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#1e293b',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {stages.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                          <option value="Lost">Lost / Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Card Actions Bottom */}
                    <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                      <button
                        onClick={() => showToast(`Calling ${lead.clientName}...`, 'info')}
                        style={{
                          flex: 1,
                          background: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          borderRadius: '4px',
                          padding: '5px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <PhoneCall size={12} /> Call
                      </button>

                      <button
                        onClick={() => {
                          const msg = encodeURIComponent(`Hello ${lead.clientName}, this is regarding your advisory inquiry with Stocketics.`);
                          window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                        }}
                        style={{
                          flex: 1,
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          borderRadius: '4px',
                          padding: '5px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <MessageSquare size={12} /> WhatsApp
                      </button>

                      <button
                        onClick={() => setInspectLead(lead)}
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '5px 8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
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
                  <strong>{inspectLead.city || 'India'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Product Segment</span>
                  <strong>{inspectLead.serviceType}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Expected Fee</span>
                  <strong style={{ color: '#166534' }}>₹{inspectLead.expectedRevenue.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Investment Bracket</span>
                  <strong>{inspectLead.investmentBracket}</strong>
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

      {/* Action Modals */}
      <AddNewLeadModal isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} />
      <BulkLeadUploadModal isOpen={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} />
      <CallLogsModal isOpen={isCallLogsOpen} onClose={() => setIsCallLogsOpen(false)} />
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
