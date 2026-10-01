import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { useConfig } from '../../state/configContext';
import {
  ConfigCategory,
  LeadSourceConfig,
  LeadResponseConfig,
  LeadStatusConfig,
  DepartmentConfig,
  ProfileConfig,
  ProductCategoryConfig,
  ProductServiceConfig,
  BankDetailConfig,
  CommunicationTemplateConfig,
  PrefixConfig,
  GatewayConfig,
  ScriptTypeConfig,
  ScriptNameConfig,
  ScriptLimitConfig,
  MarketNewsConfig,
  MotivationalQuoteConfig,
  OrgContentDoc
} from '../../types/config';
import {
  Settings,
  Layers,
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  FileText,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Lock,
  Archive,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConfigurationHubProps {
  initialCategory?: ConfigCategory;
}

export const ConfigurationHub: React.FC<ConfigurationHubProps> = ({ initialCategory }) => {
  const { role, currentUser, employees, teams, advisoryLeads, theme, showToast, setActiveTab } = useApp();
  const config = useConfig();
  const isDark = theme === 'dark';

  // Role permissions: Manager gets Lead Ops, Billing, People, Comms, Audit
  // HR gets People, Research Content, Comms, Org Content, Audit (Explicitly NOT Lead Ops)
  const isManager = role === 'manager';
  const isHR = role === 'hr';

  const defaultCategory: ConfigCategory = useMemo(() => {
    if (initialCategory) return initialCategory;
    if (isHR) return 'people_teams';
    return 'lead_operations';
  }, [initialCategory, isHR]);

  const [activeCategory, setActiveCategory] = useState<ConfigCategory>(defaultCategory);
  const [subTab, setSubTab] = useState<string>('sources');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals / Drawers state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form states with real validation
  const [sourceForm, setSourceForm] = useState({ name: '', description: '', availableCount: 500 });
  const [responseForm, setResponseForm] = useState({ name: '', status: 'In Contact' as const, description: '' });
  const [statusForm, setStatusForm] = useState({ name: '', description: '' });
  const [deptForm, setDeptForm] = useState({ name: '', description: '', headName: '' });
  const [profileForm, setProfileForm] = useState({ departmentId: '', name: '', description: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [serviceForm, setServiceForm] = useState({ name: '', category: '', description: '', monthly: 15000, quarterly: 38000, halfQuarterly: 65000, yearly: 110000 });
  const [bankForm, setBankForm] = useState({ name: '', accountName: '', accountNumberMasked: '', ifscCode: '', branch: '', description: '' });
  const [tplForm, setTplForm] = useState({ name: '', type: 'SMS' as const, templateBody: '', templateId: '' });
  const [prefixForm, setPrefixForm] = useState({ prefix: '', description: '' });
  const [gwForm, setGwForm] = useState({ gatewayName: '', serviceType: 'SMS' as const, endpointUrl: '', apiKeyMasked: '', senderId: '' });
  const [stypeForm, setStypeForm] = useState({ name: '', shareOrLot: 'Lot' as const, limitation: 'LoT' as const });
  const [snameForm, setSnameForm] = useState({ scriptTypeId: '', scriptName: '', lotSize: 50 });
  const [slimitForm, setSlimitForm] = useState({ scriptNameId: '', scriptValue: '' });
  const [newsForm, setNewsForm] = useState({ text: '', category: 'Macro' as const });
  const [quoteForm, setQuoteForm] = useState({ text: '', author: '' });

  // Bulk operation forms
  const [transferForm, setTransferForm] = useState<{
    fromEmployeeId: string;
    toEmployeeId: string;
    transferScope: 'Any Contact' | 'Only Contact' | 'Only Lead';
    sourceFilter: string;
    latestResponseFilter: string;
    shiftRecord: boolean;
    toResponse: string;
    toSource: string;
    contactType: 'Fresh' | 'Existing';
  }>({
    fromEmployeeId: '',
    toEmployeeId: '',
    transferScope: 'Any Contact',
    sourceFilter: 'All',
    latestResponseFilter: 'All',
    shiftRecord: true,
    toResponse: '',
    toSource: '',
    contactType: 'Fresh'
  });

  const [disposeForm, setDisposeForm] = useState({
    profileFilter: 'All',
    employeeFilter: 'All',
    responseFilter: 'All',
    sourceFilter: 'All',
    isDNDOnly: false,
    reason: ''
  });

  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Dynamic placeholders for templates
  const templatePlaceholders = ['{client_name}', '{service}', '{amount}', '{invoice_no}', '{date}', '{time}', '{advisor_name}', '{analyst_name}'];

  // Helper to calculate preview of matching leads for bulk transfer
  const matchingTransferCount = useMemo(() => {
    if (!transferForm.fromEmployeeId) return 0;
    return advisoryLeads.filter(l => {
      if (l.assignedToId !== transferForm.fromEmployeeId) return false;
      if (transferForm.sourceFilter !== 'All' && l.source !== transferForm.sourceFilter) return false;
      if (transferForm.latestResponseFilter !== 'All' && l.response !== transferForm.latestResponseFilter) return false;
      if (transferForm.transferScope === 'Only Contact' && l.status === 'New Lead') return false;
      if (transferForm.transferScope === 'Only Lead' && l.status !== 'New Lead') return false;
      return true;
    }).length;
  }, [advisoryLeads, transferForm]);

  // Helper for matching dispose count
  const matchingDisposeCount = useMemo(() => {
    return advisoryLeads.filter(l => {
      if (disposeForm.employeeFilter !== 'All' && l.assignedToId !== disposeForm.employeeFilter) return false;
      if (disposeForm.responseFilter !== 'All' && l.response !== disposeForm.responseFilter) return false;
      if (disposeForm.sourceFilter !== 'All' && l.source !== disposeForm.sourceFilter) return false;
      if (disposeForm.isDNDOnly && !l.isDND) return false;
      return true;
    }).length;
  }, [advisoryLeads, disposeForm]);

  // Categories list configured by role
  const availableCategories = useMemo(() => {
    const list: { key: ConfigCategory; label: string; icon: React.ReactNode; desc: string }[] = [];
    if (isManager || !isHR) {
      list.push({
        key: 'lead_operations',
        label: 'Lead Operations',
        icon: <Layers size={17} />,
        desc: 'Sources, responses, statuses, allotments, bulk transfers, and disposal'
      });
    }
    list.push({
      key: 'people_teams',
      label: 'People & Teams',
      icon: <Users size={17} />,
      desc: 'Departments, employee profiles, branches, and team rosters'
    });
    list.push({
      key: 'products_billing',
      label: 'Products & Billing',
      icon: <CreditCard size={17} />,
      desc: 'Advisory service packages, price schedules, categories, and company bank accounts'
    });
    list.push({
      key: 'communications',
      label: 'Communications',
      icon: <MessageSquare size={17} />,
      desc: 'DLT SMS, WhatsApp & Email message templates, gateways, and code prefixes'
    });
    if (isHR || isManager) {
      list.push({
        key: 'research_content',
        label: 'Research Content',
        icon: <TrendingUp size={17} />,
        desc: 'Script types, contract lots, limits, market news, and motivational quotes'
      });
    }
    if (isHR) {
      list.push({
        key: 'hr_organization',
        label: 'HR & Org Content',
        icon: <FileText size={17} />,
        desc: 'Sales training scripts, corporate profiles, compliance policies, and notice boards'
      });
    }
    return list;
  }, [isManager, isHR]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ── Top Header Strip matching Legacy CRM ────────────────────────── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: '#ffffff', 
        padding: '0.65rem 1rem', 
        borderRadius: '6px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', 
            color: '#ffffff', 
            padding: '6px', 
            borderRadius: '6px' 
          }}>
            <Settings size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer', color: '#ea580c', fontWeight: 600 }}>Dashboard</span>
              <span>/</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>Configuration Hub</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              System Configuration & Master Dictionaries
            </h2>
          </div>
        </div>

        {/* Role Capability Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            background: isManager ? 'rgba(14, 165, 233, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: isManager ? '#0284c7' : '#059669',
            border: `1px solid ${isManager ? '#bae6fd' : '#a7f3d0'}`
          }}>
            {isManager ? '🛡️ Manager Scope (Lead Ops & Billing)' : '📋 HR Scope (Personnel & Content)'}
          </div>
        </div>
      </div>

      {/* ── Impact & Architecture Advisory Banner ───────────────────────── */}
      <div style={{
        background: '#f8fafc',
        borderLeft: '4px solid #0284c7',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <InfoIcon />
        <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
          <strong>Real-Time Safeguards Active:</strong> All form controls strictly enforce real client-side validation (native <code>required</code> controls). Master data deletions are blocked if records are in use by existing leads, invoices, or subscriptions—use the safe <strong>Deactivate/Archive</strong> toggle instead. Pricing changes automatically increment catalog versioning without mutating historical client tax invoices.
        </div>
      </div>

      {/* ── Category Navigation Tabs ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {availableCategories.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => {
              setActiveCategory(cat.key);
              // Set default sub-tab per category
              if (cat.key === 'lead_operations') setSubTab('sources');
              if (cat.key === 'people_teams') setSubTab('profiles');
              if (cat.key === 'products_billing') setSubTab('services');
              if (cat.key === 'communications') setSubTab('templates');
              if (cat.key === 'research_content') setSubTab('scripts');
              if (cat.key === 'hr_organization') setSubTab('training');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 0.95rem',
              borderRadius: '6px',
              border: activeCategory === cat.key ? '1px solid #0284c7' : '1px solid #cbd5e1',
              background: activeCategory === cat.key ? '#0284c7' : '#ffffff',
              color: activeCategory === cat.key ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ── Section Content Area ────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        
        {/* ================================================================= */}
        {/* CATEGORY 1: LEAD OPERATIONS (Manager Role)                       */}
        {/* ================================================================= */}
        {activeCategory === 'lead_operations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Sub-Tabs Navigation */}
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'sources', label: 'Lead Sources' },
                { id: 'responses', label: 'Lead Responses' },
                { id: 'statuses', label: 'Lead Statuses' },
                { id: 'bulk_leads', label: 'Bulk Distribution' },
                { id: 'transfer', label: 'Bulk Contact Transfer' },
                { id: 'dispose', label: 'Dispose Leads' },
                { id: 'delete_export', label: 'Delete & Export' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSubTab(st.id)}
                  style={{
                    background: subTab === st.id ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderBottom: subTab === st.id ? '2px solid #0284c7' : 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '13px',
                    fontWeight: subTab === st.id ? 700 : 500,
                    color: subTab === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* SubTab 1: Lead Sources */}
            {subTab === 'sources' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Lead Source Dictionary</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure digital channels, campaigns, and vendor sources. Influences lead allotment, pipeline filters, and conversion metrics.</p>
                  </div>
                  <button
                    onClick={() => setActiveModal('add_source')}
                    style={primaryBtnStyle}
                  >
                    <Plus size={15} /> Add Source
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Source Name *</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Available Count</th>
                      <th style={thStyle}>Total Uploaded</th>
                      <th style={thStyle}>In-Use Status</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.leadSources.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{s.name}</td>
                        <td style={{ ...tdStyle, color: '#64748b', maxWidth: '240px' }}>{s.description || '-'}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#0284c7' }}>{s.availableCount.toLocaleString('en-IN')}</td>
                        <td style={tdStyle}>{s.totalUploaded.toLocaleString('en-IN')}</td>
                        <td style={tdStyle}>
                          <span style={s.isActive ? activeBadgeStyle : inactiveBadgeStyle}>
                            {s.isActive ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => config.toggleLeadSourceActive(s.id)}
                            style={s.isActive ? warningBtnStyle : secondaryBtnStyle}
                            title="Toggle active status without breaking old leads"
                          >
                            {s.isActive ? 'Deactivate' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab 2: Lead Responses */}
            {subTab === 'responses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Lead Response Dictionary</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Dispositions selected during sales calls. Kept distinct from lifecycle statuses.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_response')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Response
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Response Name *</th>
                      <th style={thStyle}>Associated Lifecycle Status *</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.leadResponses.map((r, idx) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{r.name}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: '#64748b' }}>{r.description || '-'}</td>
                        <td style={tdStyle}>
                          <span style={r.isActive ? activeBadgeStyle : inactiveBadgeStyle}>{r.isActive ? 'Active' : 'Archived'}</span>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => config.toggleLeadResponseActive(r.id)} style={secondaryBtnStyle}>
                            {r.isActive ? 'Deactivate' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab 3: Lead Statuses */}
            {subTab === 'statuses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Lead Status Dictionary</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Master CRM lifecycle categories.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_status')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Status
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Status Name *</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Active Leads Using This</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.leadStatuses.map((st, idx) => (
                      <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{st.name}</td>
                        <td style={{ ...tdStyle, color: '#64748b' }}>{st.description || '-'}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#0284c7' }}>{st.usageCount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab: Bulk Leads Distribution */}
            {subTab === 'bulk_leads' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700 }}>Bulk Leads Distribution</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Distribute an equal number of fresh leads across multiple selected team members simultaneously.
                  </p>
                </div>
                {/* Form controls for bulk members distribution */}
                <BulkMembersDistributor />
              </div>
            )}

            {/* SubTab 6: Bulk Contact Transfer */}
            {subTab === 'transfer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700 }}>Bulk Contact Transfer</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Reassign leads and active contacts from one representative to another with full ownership history preservation.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!transferForm.fromEmployeeId || !transferForm.toEmployeeId) {
                    showToast('Please select both From and To employees.', 'error');
                    return;
                  }
                  config.executeBulkTransfer(transferForm);
                }} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>From Employee *</label>
                    <select
                      required
                      value={transferForm.fromEmployeeId}
                      onChange={e => setTransferForm({ ...transferForm, fromEmployeeId: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Select Employee...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>To Employee *</label>
                    <select
                      required
                      value={transferForm.toEmployeeId}
                      onChange={e => setTransferForm({ ...transferForm, toEmployeeId: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Select Destination Employee...</option>
                      {employees.filter(e => e.id !== transferForm.fromEmployeeId).map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Transfer Scope *</label>
                    <select
                      required
                      value={transferForm.transferScope}
                      onChange={e => setTransferForm({ ...transferForm, transferScope: e.target.value as any })}
                      style={inputStyle}
                    >
                      <option value="Any Contact">Any Contact (All Leads + Active Followups)</option>
                      <option value="Only Contact">Only Contact (Followups & Prospects only)</option>
                      <option value="Only Lead">Only Lead (Fresh Uncontacted Leads only)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Source Filter</label>
                    <select
                      value={transferForm.sourceFilter}
                      onChange={e => setTransferForm({ ...transferForm, sourceFilter: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="All">All Sources</option>
                      {config.leadSources.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2', background: '#eff6ff', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>
                      ⚡ Preview Match: {matchingTransferCount} lead(s) match this transfer rule.
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <button
                      type="submit"
                      disabled={matchingTransferCount === 0}
                      style={{
                        ...primaryBtnStyle,
                        opacity: matchingTransferCount === 0 ? 0.5 : 1,
                        cursor: matchingTransferCount === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Execute Bulk Contact Transfer ({matchingTransferCount})
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SubTab 7: Dispose Leads */}
            {subTab === 'dispose' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700 }}>Dispose Leads Batch Tool</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Batch archive non-converting, unresponsive, or DND leads with mandatory reason logging.
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  config.executeDisposeLeads(disposeForm);
                }} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Employee Filter</label>
                    <select
                      value={disposeForm.employeeFilter}
                      onChange={e => setDisposeForm({ ...disposeForm, employeeFilter: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="All">All Employees</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Response Filter</label>
                    <select
                      value={disposeForm.responseFilter}
                      onChange={e => setDisposeForm({ ...disposeForm, responseFilter: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="All">All Responses</option>
                      {config.leadResponses.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Lead Source Filter</label>
                    <select
                      value={disposeForm.sourceFilter}
                      onChange={e => setDisposeForm({ ...disposeForm, sourceFilter: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="All">All Sources</option>
                      {config.leadSources.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="dndOnlyCheck"
                      checked={disposeForm.isDNDOnly}
                      onChange={e => setDisposeForm({ ...disposeForm, isDNDOnly: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="dndOnlyCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      Filter DND (Do Not Disturb) Leads Only
                    </label>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Disposal Reason * (Required per compliance policy)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unresponsive after 5 followups / Not interested in F&O"
                      value={disposeForm.reason}
                      onChange={e => setDisposeForm({ ...disposeForm, reason: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>
                      ⚠️ Affected Records: {matchingDisposeCount} leads will be marked as Disposed.
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <button
                      type="submit"
                      disabled={matchingDisposeCount === 0 || !disposeForm.reason.trim()}
                      style={{
                        ...dangerBtnStyle,
                        opacity: matchingDisposeCount === 0 || !disposeForm.reason.trim() ? 0.5 : 1,
                        cursor: matchingDisposeCount === 0 || !disposeForm.reason.trim() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Execute Batch Disposal ({matchingDisposeCount})
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SubTab 8: Delete & Export */}
            {subTab === 'delete_export' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700 }}>Separate Export & Destructive Delete</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Cleanly separated export and irreversible deletion controls with multi-row selection and audit trail.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => config.executeDeleteAndExport('export_only', selectedDeleteIds.length > 0 ? selectedDeleteIds : advisoryLeads.slice(0, 50).map(l => l.id))}
                    style={primaryBtnStyle}
                  >
                    <Download size={15} /> Export Selected to CSV ({selectedDeleteIds.length || 'All Top 50'})
                  </button>

                  <button
                    onClick={() => {
                      if (selectedDeleteIds.length === 0) {
                        showToast('Please select at least one lead record below to delete.', 'warning');
                        return;
                      }
                      setDeleteConfirmOpen(true);
                    }}
                    style={dangerBtnStyle}
                    disabled={selectedDeleteIds.length === 0}
                  >
                    <Trash2 size={15} /> Permanently Delete Selected ({selectedDeleteIds.length})
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>
                        <input
                          type="checkbox"
                          checked={selectedDeleteIds.length === advisoryLeads.slice(0, 20).length && advisoryLeads.length > 0}
                          onChange={e => {
                            if (e.target.checked) setSelectedDeleteIds(advisoryLeads.slice(0, 20).map(l => l.id));
                            else setSelectedDeleteIds([]);
                          }}
                        />
                      </th>
                      <th style={thStyle}>Lead Name</th>
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Source</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Assigned Advisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advisoryLeads.slice(0, 20).map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>
                          <input
                            type="checkbox"
                            checked={selectedDeleteIds.includes(l.id)}
                            onChange={e => {
                              if (e.target.checked) setSelectedDeleteIds([...selectedDeleteIds, l.id]);
                              else setSelectedDeleteIds(selectedDeleteIds.filter(id => id !== l.id));
                            }}
                          />
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{l.clientName}</td>
                        <td style={tdStyle}>{l.phone}</td>
                        <td style={tdStyle}>{l.source || 'General'}</td>
                        <td style={tdStyle}>{l.status}</td>
                        <td style={tdStyle}>{l.assignedToName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CATEGORY 2: PEOPLE & TEAMS (Departments, Profiles, Employees)    */}
        {/* ================================================================= */}
        {activeCategory === 'people_teams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              {[
                { id: 'departments', label: 'Departments' },
                { id: 'profiles', label: 'Employee Profiles' },
                { id: 'employees_view', label: 'Employees Directory' },
                { id: 'branches', label: 'Branches' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSubTab(st.id)}
                  style={{
                    background: subTab === st.id ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderBottom: subTab === st.id ? '2px solid #0284c7' : 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '13px',
                    fontWeight: subTab === st.id ? 700 : 500,
                    color: subTab === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* SubTab: Profiles */}
            {subTab === 'profiles' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Employee Profiles</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Designated roles assigned to departments. Department populates a selector; native HTML required validation enforced.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_profile')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Profile
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Profile Name *</th>
                      <th style={thStyle}>Department *</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.profiles.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', fontWeight: 600, fontSize: '12px' }}>
                            {p.departmentName}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: '#64748b' }}>{p.description || '-'}</td>
                        <td style={tdStyle}>
                          <span style={p.isActive ? activeBadgeStyle : inactiveBadgeStyle}>{p.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => config.toggleProfileActive(p.id)} style={secondaryBtnStyle}>
                            {p.isActive ? 'Deactivate' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab: Departments */}
            {subTab === 'departments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Departments</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Operational departments across the organization.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_dept')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Department
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Department Name *</th>
                      <th style={thStyle}>Department Head</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Active Headcount</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.departments.map((d, idx) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{d.name}</td>
                        <td style={{ ...tdStyle, color: '#334155' }}>{d.headName || 'Not Assigned'}</td>
                        <td style={{ ...tdStyle, color: '#64748b' }}>{d.description || '-'}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#0284c7' }}>{d.employeeCount} Employees</td>
                        <td style={tdStyle}>
                          <span style={d.isActive ? activeBadgeStyle : inactiveBadgeStyle}>{d.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab: Employees Directory */}
            {subTab === 'employees_view' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Employees Directory</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Authorized staff list. Contact information masked based on role context.</p>
                  </div>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>Emp ID</th>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Profile / Role</th>
                      <th style={thStyle}>Department</th>
                      <th style={thStyle}>Contact</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(e => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#64748b' }}>{e.id}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{e.name}</td>
                        <td style={tdStyle}>{e.title || e.role}</td>
                        <td style={tdStyle}>{e.department}</td>
                        <td style={tdStyle}>{isHR || isManager ? e.phone : e.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}</td>
                        <td style={tdStyle}>{e.email}</td>
                        <td style={tdStyle}>
                          <span style={e.status === 'Active' ? activeBadgeStyle : inactiveBadgeStyle}>{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab: Branches */}
            {subTab === 'branches' && (
              <div>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Company Branches & Regional Desks</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {config.branches.map(b => (
                    <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{b.name}</span>
                        <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{b.code}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{b.address}, {b.city}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>{b.employeeCount} Active Staff</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CATEGORY 3: PRODUCTS & BILLING                                    */}
        {/* ================================================================= */}
        {activeCategory === 'products_billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              {[
                { id: 'services', label: 'Products / Services' },
                { id: 'categories', label: 'Categories' },
                { id: 'banks', label: 'Company Bank Details' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSubTab(st.id)}
                  style={{
                    background: subTab === st.id ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderBottom: subTab === st.id ? '2px solid #0284c7' : 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '13px',
                    fontWeight: subTab === st.id ? 700 : 500,
                    color: subTab === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* SubTab: Products/Services */}
            {subTab === 'services' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Product & Service Catalog</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Version-controlled price schedules. Modifying prices does NOT overwrite past invoices or existing active service agreements.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_service')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Product / Service
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Service Name *</th>
                      <th style={thStyle}>Category *</th>
                      <th style={thStyle}>Monthly (₹) *</th>
                      <th style={thStyle}>Quarterly (₹) *</th>
                      <th style={thStyle}>Half-Yearly (₹) *</th>
                      <th style={thStyle}>Yearly (₹) *</th>
                      <th style={thStyle}>Version</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.productServices.map((ps, idx) => (
                      <tr key={ps.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{ps.name}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 600 }}>
                            {ps.category}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>₹{ps.monthly.toLocaleString('en-IN')}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>₹{ps.quarterly.toLocaleString('en-IN')}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>₹{ps.halfQuarterly.toLocaleString('en-IN')}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>₹{ps.yearly.toLocaleString('en-IN')}</td>
                        <td style={tdStyle}>v{ps.version}</td>
                        <td style={tdStyle}>
                          <span style={ps.isActive ? activeBadgeStyle : inactiveBadgeStyle}>{ps.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab: Categories */}
            {subTab === 'categories' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Product Categories</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Groups services by market segment.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_category')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Category
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Category Name *</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Active Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.productCategories.map((c, idx) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{c.name}</td>
                        <td style={{ ...tdStyle, color: '#64748b' }}>{c.description || '-'}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#0284c7' }}>{c.productCount} Services</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab: Bank Details */}
            {subTab === 'banks' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Authorized Company Bank Accounts</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Accounts displayed on invoices and payment links. Sensitive details are masked.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_bank')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Bank Account
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {config.bankDetails.map(b => (
                    <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: b.isDefault ? '#f0fdf4' : '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{b.name}</span>
                        {b.isDefault && <span style={{ fontSize: '11px', background: '#16a34a', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Default</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px' }}><strong>A/C Name:</strong> {b.accountName}</div>
                      <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px' }}><strong>A/C No:</strong> {b.accountNumberMasked}</div>
                      <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px' }}><strong>IFSC:</strong> {b.ifscCode}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{b.branch}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CATEGORY 4: COMMUNICATIONS                                       */}
        {/* ================================================================= */}
        {activeCategory === 'communications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              {[
                { id: 'templates', label: 'Message Templates' },
                { id: 'prefixes', label: 'Prefixes' },
                { id: 'gateways', label: 'Gateways' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSubTab(st.id)}
                  style={{
                    background: subTab === st.id ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderBottom: subTab === st.id ? '2px solid #0284c7' : 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '13px',
                    fontWeight: subTab === st.id ? 700 : 500,
                    color: subTab === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* SubTab: Templates */}
            {subTab === 'templates' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Communication Templates</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>SMS, Messenger and Email templates with validated DLT parameters and interactive placeholder tags.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_template')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Template
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {config.commTemplates.map(t => (
                    <div key={t.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{t.name}</span>
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, background: t.type === 'SMS' ? '#e0f2fe' : t.type === 'MESSENGER' ? '#f3e8ff' : '#fef3c7', color: '#0369a1' }}>
                            {t.type}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>DLT ID: {t.templateId}</span>
                      </div>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.65rem 0.85rem', fontSize: '13px', color: '#334155', fontFamily: 'monospace', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                        {t.templateBody}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {t.placeholders.map(p => (
                          <span key={p} style={{ fontSize: '11px', background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SubTab: Prefixes */}
            {subTab === 'prefixes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Code & Invoice Prefixes</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Standardized sequence codes across the system.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_prefix')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Prefix
                  </button>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Prefix *</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.prefixes.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{p.prefix}</td>
                        <td style={{ ...tdStyle, color: '#64748b' }}>{p.description || '-'}</td>
                        <td style={tdStyle}>
                          <span style={p.isActive ? activeBadgeStyle : inactiveBadgeStyle}>{p.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SubTab: Gateways */}
            {subTab === 'gateways' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Communication Gateways</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>External dispatch providers. API keys are masked and securely stored.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_gateway')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Gateway
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {config.gateways.map(g => (
                    <div key={g.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{g.gatewayName}</span>
                        <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{g.serviceType}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', wordBreak: 'break-all' }}>{g.endpointUrl}</div>
                      <div style={{ fontSize: '12px', color: '#334155', fontFamily: 'monospace' }}>Key: {g.apiKeyMasked}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CATEGORY 5: RESEARCH CONTENT                                     */}
        {/* ================================================================= */}
        {activeCategory === 'research_content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              {[
                { id: 'scripts', label: 'Script Configuration' },
                { id: 'news', label: 'Market News' },
                { id: 'quotes', label: 'Motivational Quotes' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSubTab(st.id)}
                  style={{
                    background: subTab === st.id ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderBottom: subTab === st.id ? '2px solid #0284c7' : 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '13px',
                    fontWeight: subTab === st.id ? 700 : 500,
                    color: subTab === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* SubTab: Script Configuration */}
            {subTab === 'scripts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 1. Script Types */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>1. Script Types (Name*, Share/Lot*, Limitation*)</h4>
                    <button onClick={() => setActiveModal('add_script_type')} style={primaryBtnStyle}>
                      <Plus size={14} /> Add Script Type
                    </button>
                  </div>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Script Type Name *</th>
                        <th style={thStyle}>Share / Lot *</th>
                        <th style={thStyle}>Limitation *</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.scriptTypes.map((st, idx) => (
                        <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{st.name}</td>
                          <td style={tdStyle}>{st.shareOrLot}</td>
                          <td style={tdStyle}>{st.limitation}</td>
                          <td style={tdStyle}>
                            <span style={st.isActive ? activeBadgeStyle : inactiveBadgeStyle}>{st.isActive ? 'Active' : 'Inactive'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2. Script Names */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>2. Script Names (Script Type*, Script Name*, Lot Size*)</h4>
                    <button onClick={() => setActiveModal('add_script_name')} style={primaryBtnStyle}>
                      <Plus size={14} /> Add Script Name
                    </button>
                  </div>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Script Name *</th>
                        <th style={thStyle}>Script Type *</th>
                        <th style={thStyle}>Lot Size *</th>
                        <th style={thStyle}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.scriptNames.map((sn, idx) => (
                        <tr key={sn.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{sn.scriptName}</td>
                          <td style={tdStyle}>{sn.scriptTypeName}</td>
                          <td style={tdStyle}>{sn.lotSize}</td>
                          <td style={tdStyle}>{sn.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 3. Script Limits */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>3. Script Limits (Script Name*, Script Value*)</h4>
                    <button onClick={() => setActiveModal('add_script_limit')} style={primaryBtnStyle}>
                      <Plus size={14} /> Add Script Limit
                    </button>
                  </div>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Script Name *</th>
                        <th style={thStyle}>Permitted Exposure / Lot Limit *</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.scriptLimits.map((sl, idx) => (
                        <tr key={sl.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{sl.scriptName}</td>
                          <td style={{ ...tdStyle, fontWeight: 600, color: '#0284c7' }}>{sl.scriptValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SubTab: Market News */}
            {subTab === 'news' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Daily Market News</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Broadcast updates shown on employee dashboard banners.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_news')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add News Update
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {config.marketNews.map(n => (
                    <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 500 }}>{n.text}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>Date: {n.date} | Author: {n.author}</div>
                      </div>
                      <button onClick={() => config.deleteMarketNews(n.id)} style={dangerBtnStyle}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SubTab: Quotes */}
            {subTab === 'quotes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Daily Motivational Quotes</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Trader psychology quotes displayed on employee login and dashboard header.</p>
                  </div>
                  <button onClick={() => setActiveModal('add_quote')} style={primaryBtnStyle}>
                    <Plus size={15} /> Add Quote
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {config.motivationalQuotes.map(q => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', color: '#1e293b', fontStyle: 'italic' }}>"{q.text}"</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>— {q.author} (Added: {q.date})</div>
                      </div>
                      <button onClick={() => config.deleteMotivationalQuote(q.id)} style={dangerBtnStyle}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CATEGORY 6: HR & ORGANIZATION CONTENT                             */}
        {/* ================================================================= */}
        {activeCategory === 'hr_organization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              {[
                { id: 'training', label: 'Training Script *' },
                { id: 'company', label: 'My Company *' },
                { id: 'policy', label: 'HR Policy *' },
                { id: 'notice', label: 'Notice Board' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSubTab(st.id)}
                  style={{
                    background: subTab === st.id ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderBottom: subTab === st.id ? '2px solid #0284c7' : 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '13px',
                    fontWeight: subTab === st.id ? 700 : 500,
                    color: subTab === st.id ? '#0284c7' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Interactive Document Editor for Training Script / My Company / HR Policy */}
            {(() => {
              const docTypeMap: Record<string, OrgContentDoc['type']> = {
                training: 'training_script',
                company: 'my_company',
                policy: 'hr_policy',
                notice: 'notice_board'
              };
              const currentDoc = config.orgDocs.find(d => d.type === docTypeMap[subTab]);
              if (!currentDoc) return null;

              return (
                <OrgDocEditor
                  key={currentDoc.id}
                  doc={currentDoc}
                  onSave={(title, content) => config.updateOrgDoc(currentDoc.type, title, content)}
                />
              );
            })()}
          </div>
        )}
      </div>

      {/* ── MODALS & DRAWERS FOR ADD / EDIT ────────────────────────────── */}
      
      {/* Modal: Add Lead Source */}
      {activeModal === 'add_source' && (
        <ModalWrapper title="Add New Lead Source" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addLeadSource({
              name: sourceForm.name,
              description: sourceForm.description,
              availableCount: Number(sourceForm.availableCount) || 500,
              totalUploaded: Number(sourceForm.availableCount) || 500,
              isActive: true
            });
            if (res.success) {
              setSourceForm({ name: '', description: '', availableCount: 500 });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to add source', 'error');
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Source Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. D WEB KANNADA"
                value={sourceForm.name}
                onChange={e => setSourceForm({ ...sourceForm, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                placeholder="Campaign specifics, vendor reference, or language target"
                value={sourceForm.description}
                onChange={e => setSourceForm({ ...sourceForm, description: e.target.value })}
                style={{ ...inputStyle, height: '80px' }}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Initial Lead Inventory *</label>
              <input
                type="number"
                required
                min={0}
                value={sourceForm.availableCount}
                onChange={e => setSourceForm({ ...sourceForm, availableCount: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Lead Source</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Response */}
      {activeModal === 'add_response' && (
        <ModalWrapper title="Add New Lead Response" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addLeadResponse({
              name: responseForm.name,
              status: responseForm.status,
              description: responseForm.description,
              isActive: true
            });
            if (res.success) {
              setResponseForm({ name: '', status: 'In Contact', description: '' });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to add response', 'error');
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Response Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Call Back / Language Barrier / Interested"
                value={responseForm.name}
                onChange={e => setResponseForm({ ...responseForm, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Associated Lifecycle Status *</label>
              <select
                required
                value={responseForm.status}
                onChange={e => setResponseForm({ ...responseForm, status: e.target.value as any })}
                style={inputStyle}
              >
                <option value="New Lead">New Lead</option>
                <option value="In Contact">In Contact</option>
                <option value="Trial Active">Trial Active</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                placeholder="Notes regarding when to apply this response"
                value={responseForm.description}
                onChange={e => setResponseForm({ ...responseForm, description: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Response</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Profile */}
      {activeModal === 'add_profile' && (
        <ModalWrapper title="Add Profile" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addProfile({
              departmentId: profileForm.departmentId,
              name: profileForm.name,
              description: profileForm.description,
              departmentName: '',
              isActive: true
            });
            if (res.success) {
              setProfileForm({ departmentId: '', name: '', description: '' });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to add profile', 'error');
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Department * (Populates from selector)</label>
              <select
                required
                value={profileForm.departmentId}
                onChange={e => setProfileForm({ ...profileForm, departmentId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Department...</option>
                {config.departments.filter(d => d.isActive).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Profile Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Business Development Executive"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                placeholder="Core responsibilities and scope"
                value={profileForm.description}
                onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                style={{ ...inputStyle, height: '70px' }}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Profile</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Category */}
      {activeModal === 'add_category' && (
        <ModalWrapper title="Add Category" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addProductCategory({
              name: catForm.name,
              description: catForm.description,
              isActive: true
            });
            if (res.success) {
              setCatForm({ name: '', description: '' });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to add category', 'error');
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Long-Term Portfolio / F&O Momentum"
                value={catForm.name}
                onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                placeholder="Category overview"
                value={catForm.description}
                onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Category</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Product / Service */}
      {activeModal === 'add_service' && (
        <ModalWrapper title="Add Product / Service" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addProductService({
              name: serviceForm.name,
              category: serviceForm.category,
              description: serviceForm.description,
              monthly: Number(serviceForm.monthly),
              quarterly: Number(serviceForm.quarterly),
              halfQuarterly: Number(serviceForm.halfQuarterly),
              yearly: Number(serviceForm.yearly),
              effectiveFrom: new Date().toISOString().slice(0, 10),
              isActive: true
            });
            if (res.success) {
              setServiceForm({ name: '', category: '', description: '', monthly: 15000, quarterly: 38000, halfQuarterly: 65000, yearly: 110000 });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to add service', 'error');
            }
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
              <div>
                <label style={labelStyle}>Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OPTIONS STRATEGY"
                  value={serviceForm.name}
                  onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  required
                  value={serviceForm.category}
                  onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select Category...</option>
                  {config.productCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Monthly Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={serviceForm.monthly}
                  onChange={e => setServiceForm({ ...serviceForm, monthly: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Quarterly Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={serviceForm.quarterly}
                  onChange={e => setServiceForm({ ...serviceForm, quarterly: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Half-Quarterly / Semi-Annual (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={serviceForm.halfQuarterly}
                  onChange={e => setServiceForm({ ...serviceForm, halfQuarterly: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Yearly Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={serviceForm.yearly}
                  onChange={e => setServiceForm({ ...serviceForm, yearly: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ ...formGroupStyle, marginTop: '0.85rem' }}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                placeholder="Product strategy and target investor segment"
                value={serviceForm.description}
                onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Product Package</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Script Type */}
      {activeModal === 'add_script_type' && (
        <ModalWrapper title="Add Script Type" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addScriptType({
              name: stypeForm.name,
              shareOrLot: stypeForm.shareOrLot,
              limitation: stypeForm.limitation,
              isActive: true
            });
            if (res.success) {
              setStypeForm({ name: '', shareOrLot: 'Lot', limitation: 'LoT' });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to add script type', 'error');
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Index Option / Swing Cash"
                value={stypeForm.name}
                onChange={e => setStypeForm({ ...stypeForm, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Share/Lot * (Lot / Share)</label>
              <select
                required
                value={stypeForm.shareOrLot}
                onChange={e => setStypeForm({ ...stypeForm, shareOrLot: e.target.value as any })}
                style={inputStyle}
              >
                <option value="Lot">Lot</option>
                <option value="Share">Share</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Limitation * (select/select, 3lakh, 5lakh, LoT)</label>
              <select
                required
                value={stypeForm.limitation}
                onChange={e => setStypeForm({ ...stypeForm, limitation: e.target.value as any })}
                style={inputStyle}
              >
                <option value="select">select / select</option>
                <option value="3lakh">3lakh</option>
                <option value="5lakh">5lakh</option>
                <option value="LoT">LoT</option>
              </select>
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Script Type</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Script Name */}
      {activeModal === 'add_script_name' && (
        <ModalWrapper title="Add Script Name" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addScriptName({
              scriptTypeId: snameForm.scriptTypeId,
              scriptTypeName: '',
              scriptName: snameForm.scriptName,
              lotSize: Number(snameForm.lotSize) || 1,
              isActive: true
            });
            if (res.success) {
              setSnameForm({ scriptTypeId: '', scriptName: '', lotSize: 50 });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to add script name', 'error');
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Script Type * (Choices include cash, future, option, BTST, swing)</label>
              <select
                required
                value={snameForm.scriptTypeId}
                onChange={e => setSnameForm({ ...snameForm, scriptTypeId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Script Type...</option>
                {config.scriptTypes.map(st => <option key={st.id} value={st.id}>{st.name} ({st.shareOrLot})</option>)}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Script Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. NIFTY 50 / BANKNIFTY / RELIANCE"
                value={snameForm.scriptName}
                onChange={e => setSnameForm({ ...snameForm, scriptName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Lot Size</label>
              <input
                type="number"
                min={1}
                value={snameForm.lotSize}
                onChange={e => setSnameForm({ ...snameForm, lotSize: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Script</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Script Limit */}
      {activeModal === 'add_script_limit' && (
        <ModalWrapper title="Add Script Limit" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addScriptLimit({
              scriptNameId: slimitForm.scriptNameId,
              scriptName: '',
              scriptValue: slimitForm.scriptValue,
              isActive: true
            });
            if (res.success) {
              setSlimitForm({ scriptNameId: '', scriptValue: '' });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to save limit', 'error');
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Script Name *</label>
              <select
                required
                value={slimitForm.scriptNameId}
                onChange={e => setSlimitForm({ ...slimitForm, scriptNameId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Script...</option>
                {config.scriptNames.map(sn => <option key={sn.id} value={sn.id}>{sn.scriptName}</option>)}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Script Value *</label>
              <input
                type="text"
                required
                placeholder="e.g. ₹5,00,000 Exposure or 20 Lots"
                value={slimitForm.scriptValue}
                onChange={e => setSlimitForm({ ...slimitForm, scriptValue: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Limit</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Template */}
      {activeModal === 'add_template' && (
        <ModalWrapper title="Add Template" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addCommTemplate({
              name: tplForm.name,
              type: tplForm.type,
              templateBody: tplForm.templateBody,
              templateId: tplForm.templateId,
              isActive: true
            });
            if (res.success) {
              setTplForm({ name: '', type: 'SMS', templateBody: '', templateId: '' });
              setActiveModal(null);
            } else {
              showToast(res.error || 'Failed to save template', 'error');
            }
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Template Name"
                  value={tplForm.name}
                  onChange={e => setTplForm({ ...tplForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Type * (SMS, MESSENGER, E-MAIL)</label>
                <select
                  required
                  value={tplForm.type}
                  onChange={e => setTplForm({ ...tplForm, type: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="SMS">SMS</option>
                  <option value="MESSENGER">MESSENGER</option>
                  <option value="E-MAIL">E-MAIL</option>
                </select>
              </div>
            </div>

            <div style={{ ...formGroupStyle, marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={labelStyle}>Template Body *</label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Click to insert tag:</span>
              </div>
              {/* Tag inserter chips */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {templatePlaceholders.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTplForm({ ...tplForm, templateBody: tplForm.templateBody + ' ' + p })}
                    style={{ fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px', padding: '2px 5px', cursor: 'pointer' }}
                  >
                    + {p}
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={4}
                placeholder="Enter message text with placeholders..."
                value={tplForm.templateBody}
                onChange={e => setTplForm({ ...tplForm, templateBody: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Template ID (DLT Registration ID)</label>
              <input
                type="text"
                placeholder="e.g. DLT-1107161208923"
                value={tplForm.templateId}
                onChange={e => setTplForm({ ...tplForm, templateId: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Live rendered preview */}
            {tplForm.templateBody && (
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Live Sample Preview:</div>
                <div style={{ fontSize: '12.5px', color: '#334155', fontFamily: 'monospace' }}>
                  {tplForm.templateBody
                    .replace(/\{client_name\}/g, 'Rajesh Singhania')
                    .replace(/\{service\}/g, 'INDEX OPTION')
                    .replace(/\{amount\}/g, '25,000')
                    .replace(/\{invoice_no\}/g, 'INV-26-09529')
                    .replace(/\{date\}/g, '24-Sep-2026')
                    .replace(/\{time\}/g, '03:30 PM')
                    .replace(/\{advisor_name\}/g, 'Rohan Deshmukh')
                    .replace(/\{analyst_name\}/g, 'Aditya Roy')}
                </div>
              </div>
            )}

            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Template</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Prefix */}
      {activeModal === 'add_prefix' && (
        <ModalWrapper title="Add Prefix" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addPrefix({ prefix: prefixForm.prefix, description: prefixForm.description, isActive: true });
            if (res.success) {
              setPrefixForm({ prefix: '', description: '' });
              setActiveModal(null);
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Prefix *</label>
              <input
                type="text"
                required
                placeholder="e.g. STK- / ADV-"
                value={prefixForm.prefix}
                onChange={e => setPrefixForm({ ...prefixForm, prefix: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                placeholder="Prefix usage description"
                value={prefixForm.description}
                onChange={e => setPrefixForm({ ...prefixForm, description: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Prefix</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Gateway */}
      {activeModal === 'add_gateway' && (
        <ModalWrapper title="Add Gateway" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addGateway({
              gatewayName: gwForm.gatewayName,
              serviceType: gwForm.serviceType,
              endpointUrl: gwForm.endpointUrl,
              apiKeyMasked: gwForm.apiKeyMasked.replace(/./g, '•'),
              senderId: gwForm.senderId,
              isActive: true
            });
            if (res.success) {
              setGwForm({ gatewayName: '', serviceType: 'SMS', endpointUrl: '', apiKeyMasked: '', senderId: '' });
              setActiveModal(null);
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Gateway *</label>
              <input
                type="text"
                required
                placeholder="Gateway Provider Name"
                value={gwForm.gatewayName}
                onChange={e => setGwForm({ ...gwForm, gatewayName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Channel Type *</label>
              <select
                required
                value={gwForm.serviceType}
                onChange={e => setGwForm({ ...gwForm, serviceType: e.target.value as any })}
                style={inputStyle}
              >
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Endpoint URL *</label>
              <input
                type="url"
                required
                placeholder="https://api.gateway.com/endpoint"
                value={gwForm.endpointUrl}
                onChange={e => setGwForm({ ...gwForm, endpointUrl: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>API Key / Secret Token *</label>
              <input
                type="password"
                required
                placeholder="Enter secret token (masked on save)"
                value={gwForm.apiKeyMasked}
                onChange={e => setGwForm({ ...gwForm, apiKeyMasked: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Gateway</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add News */}
      {activeModal === 'add_news' && (
        <ModalWrapper title="Add Market News" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addMarketNews({ text: newsForm.text, author: currentUser.name, category: newsForm.category });
            if (res.success) {
              setNewsForm({ text: '', category: 'Macro' });
              setActiveModal(null);
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>News Text *</label>
              <textarea
                required
                rows={3}
                placeholder="Market news bulletin text..."
                value={newsForm.text}
                onChange={e => setNewsForm({ ...newsForm, text: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Publish News</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Modal: Add Quote */}
      {activeModal === 'add_quote' && (
        <ModalWrapper title="Add Motivational Quote" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const res = config.addMotivationalQuote({ text: quoteForm.text, author: quoteForm.author });
            if (res.success) {
              setQuoteForm({ text: '', author: '' });
              setActiveModal(null);
            }
          }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Quote Text *</label>
              <textarea
                required
                rows={3}
                placeholder="Motivational quote text..."
                value={quoteForm.text}
                onChange={e => setQuoteForm({ ...quoteForm, text: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Author</label>
              <input
                type="text"
                placeholder="e.g. Warren Buffett / Alexander Elder"
                value={quoteForm.author}
                onChange={e => setQuoteForm({ ...quoteForm, author: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={modalActionStyle}>
              <button type="button" onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>Cancel</button>
              <button type="submit" style={primaryBtnStyle}>Save Quote</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Confirmation Dialog for Destructive Delete */}
      {deleteConfirmOpen && (
        <ModalWrapper title="Confirm Irreversible Deletion" onClose={() => setDeleteConfirmOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px' }}>
              <div style={{ color: '#991b1b', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                ⚠️ Warning: Destructive Action
              </div>
              <div style={{ color: '#7f1d1d', fontSize: '13px' }}>
                You are about to permanently delete <strong>{selectedDeleteIds.length}</strong> lead records from the CRM database. This operation cannot be undone.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirmOpen(false)} style={secondaryBtnStyle}>Cancel</button>
              <button
                onClick={() => {
                  config.executeDeleteAndExport('delete_only', selectedDeleteIds);
                  setSelectedDeleteIds([]);
                  setDeleteConfirmOpen(false);
                }}
                style={dangerBtnStyle}
              >
                Permanently Delete Records
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

// ── Sub-Component: Bulk Members Distributor ──────────────────────────────
const BulkMembersDistributor: React.FC = () => {
  const { employees, advisoryLeads, allotLeadsFromTeamPoolToEmployee, showToast } = useApp();
  const config = useConfig();
  const [selectedSource, setSelectedSource] = useState(config.leadSources[0]?.name || 'D WEB KANNADA');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [quantityMode, setQuantityMode] = useState<'per_member' | 'total'>('per_member');
  const [leadQuantity, setLeadQuantity] = useState<number>(10);

  const activeSalesEmployees = useMemo(() => {
    return employees.filter(e => e.department === 'Advisory Sales' || e.role === 'employee' || e.role === 'Employee');
  }, [employees]);

  const sourceObj = config.leadSources.find(s => s.name === selectedSource);
  const availableInSource = sourceObj?.availableCount || 0;

  const totalRequired = quantityMode === 'per_member' 
    ? leadQuantity * selectedMemberIds.length 
    : leadQuantity;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) {
      showToast('Please select at least one recipient member.', 'error');
      return;
    }
    if (totalRequired <= 0) {
      showToast('Please enter a valid positive number of leads.', 'error');
      return;
    }
    if (totalRequired > availableInSource) {
      showToast(`Insufficient leads in pool. Required: ${totalRequired}, Available: ${availableInSource}.`, 'error');
      return;
    }

    const perMember = quantityMode === 'per_member' ? leadQuantity : Math.floor(leadQuantity / selectedMemberIds.length);
    selectedMemberIds.forEach(empId => {
      allotLeadsFromTeamPoolToEmployee('team-001', selectedSource, empId, perMember);
    });

    confetti({ particleCount: 70, spread: 80 });
    showToast(`Bulk distribution complete: ${totalRequired} leads allotted across ${selectedMemberIds.length} members!`, 'success');
    setSelectedMemberIds([]);
  };

  return (
    <form onSubmit={handleExecute} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Lead Source Pool *</label>
        <select
          required
          value={selectedSource}
          onChange={e => setSelectedSource(e.target.value)}
          style={inputStyle}
        >
          {config.leadSources.map(s => (
            <option key={s.id} value={s.name}>{s.name} ({s.availableCount} available)</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Distribution Allocation Mode *</label>
        <select
          required
          value={quantityMode}
          onChange={e => setQuantityMode(e.target.value as any)}
          style={inputStyle}
        >
          <option value="per_member">Quantity Per Member</option>
          <option value="total">Total Pool Split Across Selected</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Number of Leads * ({quantityMode === 'per_member' ? 'Per Member' : 'Total Pool'})</label>
        <input
          type="number"
          required
          min={1}
          value={leadQuantity}
          onChange={e => setLeadQuantity(Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Summary Calculation</label>
        <div style={{ ...inputStyle, background: '#f8fafc', display: 'flex', alignItems: 'center', fontWeight: 600, color: totalRequired > availableInSource ? '#dc2626' : '#0284c7' }}>
          Total Required: {totalRequired} / {availableInSource} Available
        </div>
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={labelStyle}>Select Recipient Members * ({selectedMemberIds.length} selected)</label>
          <button
            type="button"
            onClick={() => {
              if (selectedMemberIds.length === activeSalesEmployees.length) setSelectedMemberIds([]);
              else setSelectedMemberIds(activeSalesEmployees.map(e => e.id));
            }}
            style={{ fontSize: '11px', background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600 }}
          >
            {selectedMemberIds.length === activeSalesEmployees.length ? 'Deselect All' : 'Select All Members'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '0.65rem', borderRadius: '4px' }}>
          {activeSalesEmployees.map(e => (
            <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedMemberIds.includes(e.id)}
                onChange={ev => {
                  if (ev.target.checked) setSelectedMemberIds([...selectedMemberIds, e.id]);
                  else setSelectedMemberIds(selectedMemberIds.filter(id => id !== e.id));
                }}
              />
              <span>{e.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <button
          type="submit"
          disabled={selectedMemberIds.length === 0 || totalRequired > availableInSource}
          style={{
            ...primaryBtnStyle,
            opacity: selectedMemberIds.length === 0 || totalRequired > availableInSource ? 0.5 : 1,
            cursor: selectedMemberIds.length === 0 || totalRequired > availableInSource ? 'not-allowed' : 'pointer'
          }}
        >
          Distribute Leads to {selectedMemberIds.length} Member(s)
        </button>
      </div>
    </form>
  );
};

// ── Sub-Component: Org Doc Editor ─────────────────────────────────────────
const OrgDocEditor: React.FC<{ doc: OrgContentDoc; onSave: (title: string, content: string) => void }> = ({ doc, onSave }) => {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSave(title, content);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{doc.title}</h3>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Version: <strong>v{doc.version}</strong> | Last Published: {doc.publishedDate} by {doc.updatedBy}
          </div>
        </div>
        <button type="submit" style={primaryBtnStyle}>
          {isSaved ? '✓ Published!' : 'Save & Publish Version'}
        </button>
      </div>

      <div>
        <label style={labelStyle}>Document Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Document Content * (Required labeled textarea with real validation)</label>
        <textarea
          required
          rows={12}
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ ...inputStyle, fontFamily: 'monospace', lineHeight: 1.6 }}
        />
      </div>
    </form>
  );
};

// ── Modal Wrapper Helper ──────────────────────────────────────────────────
const ModalWrapper: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            ✕
          </button>
        </div>
        <div style={{ padding: '1.25rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Icon Helper ──────────────────────────────────────────────────────────
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ── Styles Helper ────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  fontSize: '13px',
  color: '#1e293b',
  outline: 'none',
  background: '#ffffff',
  boxSizing: 'border-box'
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '0.85rem'
};

const modalActionStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.65rem',
  marginTop: '1.25rem'
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  background: '#0284c7',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  padding: '0.45rem 0.85rem',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const secondaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  padding: '0.45rem 0.75rem',
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer'
};

const warningBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#fff7ed',
  color: '#c2410c',
  border: '1px solid #fed7aa',
  borderRadius: '4px',
  padding: '0.35rem 0.65rem',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const dangerBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#ef4444',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  padding: '0.45rem 0.75rem',
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '13px'
};

const tableHeaderRowStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderBottom: '2px solid #e2e8f0'
};

const thStyle: React.CSSProperties = {
  padding: '0.65rem 0.75rem',
  fontWeight: 700,
  color: '#475569',
  fontSize: '12.5px'
};

const tdStyle: React.CSSProperties = {
  padding: '0.65rem 0.75rem',
  color: '#334155'
};

const activeBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 700,
  background: '#dcfce7',
  color: '#15803d'
};

const inactiveBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 700,
  background: '#f1f5f9',
  color: '#64748b'
};
