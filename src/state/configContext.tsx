import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApp } from './store';
import {
  ConfigCategory,
  LeadSourceConfig,
  LeadResponseConfig,
  LeadStatusConfig,
  DepartmentConfig,
  ProfileConfig,
  BranchConfig,
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
  OrgContentDoc,
  ConfigAuditEntry,
  BulkTransferParams,
  DisposeLeadsParams
} from '../types/config';
import {
  INITIAL_LEAD_SOURCES,
  INITIAL_LEAD_RESPONSES,
  INITIAL_LEAD_STATUSES,
  INITIAL_DEPARTMENTS,
  INITIAL_PROFILES,
  INITIAL_BRANCHES,
  INITIAL_PRODUCT_CATEGORIES,
  INITIAL_PRODUCTS_SERVICES,
  INITIAL_BANK_DETAILS,
  INITIAL_COMM_TEMPLATES,
  INITIAL_PREFIXES,
  INITIAL_GATEWAYS,
  INITIAL_SCRIPT_TYPES,
  INITIAL_SCRIPT_NAMES,
  INITIAL_SCRIPT_LIMITS,
  INITIAL_MARKET_NEWS,
  INITIAL_MOTIVATIONAL_QUOTES,
  INITIAL_ORG_DOCS
} from '../data/configInitialData';
import confetti from 'canvas-confetti';

interface ConfigContextType {
  // Master Dictionaries
  leadSources: LeadSourceConfig[];
  leadResponses: LeadResponseConfig[];
  leadStatuses: LeadStatusConfig[];
  departments: DepartmentConfig[];
  profiles: ProfileConfig[];
  branches: BranchConfig[];
  productCategories: ProductCategoryConfig[];
  productServices: ProductServiceConfig[];
  bankDetails: BankDetailConfig[];
  commTemplates: CommunicationTemplateConfig[];
  prefixes: PrefixConfig[];
  gateways: GatewayConfig[];
  scriptTypes: ScriptTypeConfig[];
  scriptNames: ScriptNameConfig[];
  scriptLimits: ScriptLimitConfig[];
  marketNews: MarketNewsConfig[];
  motivationalQuotes: MotivationalQuoteConfig[];
  orgDocs: OrgContentDoc[];
  auditLogs: ConfigAuditEntry[];

  // Mutators with Real Validation
  addLeadSource: (source: Omit<LeadSourceConfig, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => { success: boolean; error?: string };
  updateLeadSource: (id: string, updates: Partial<LeadSourceConfig>) => { success: boolean; error?: string };
  toggleLeadSourceActive: (id: string) => void;

  addLeadResponse: (resp: Omit<LeadResponseConfig, 'id' | 'createdAt' | 'usageCount'>) => { success: boolean; error?: string };
  updateLeadResponseConfig: (id: string, updates: Partial<LeadResponseConfig>) => { success: boolean; error?: string };
  toggleLeadResponseActive: (id: string) => void;

  addLeadStatusConfig: (st: Omit<LeadStatusConfig, 'id' | 'createdAt' | 'usageCount'>) => { success: boolean; error?: string };
  updateLeadStatusConfig: (id: string, updates: Partial<LeadStatusConfig>) => { success: boolean; error?: string };

  addDepartment: (dept: Omit<DepartmentConfig, 'id' | 'createdAt' | 'employeeCount'>) => { success: boolean; error?: string };
  updateDepartment: (id: string, updates: Partial<DepartmentConfig>) => { success: boolean; error?: string };
  toggleDepartmentActive: (id: string) => void;

  addProfile: (prof: Omit<ProfileConfig, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateProfile: (id: string, updates: Partial<ProfileConfig>) => { success: boolean; error?: string };
  toggleProfileActive: (id: string) => void;

  addProductCategory: (cat: Omit<ProductCategoryConfig, 'id' | 'createdAt' | 'productCount'>) => { success: boolean; error?: string };
  updateProductCategory: (id: string, updates: Partial<ProductCategoryConfig>) => { success: boolean; error?: string };

  addProductService: (prod: Omit<ProductServiceConfig, 'id' | 'createdAt' | 'version' | 'activeSubscribersCount'>) => { success: boolean; error?: string };
  updateProductService: (id: string, updates: Partial<ProductServiceConfig>) => { success: boolean; error?: string };
  toggleProductServiceActive: (id: string) => void;

  addBankDetail: (bank: Omit<BankDetailConfig, 'id'>) => { success: boolean; error?: string };
  updateBankDetail: (id: string, updates: Partial<BankDetailConfig>) => { success: boolean; error?: string };

  addCommTemplate: (tpl: Omit<CommunicationTemplateConfig, 'id' | 'createdAt' | 'updatedAt' | 'placeholders'>) => { success: boolean; error?: string };
  updateCommTemplate: (id: string, updates: Partial<CommunicationTemplateConfig>) => { success: boolean; error?: string };
  toggleCommTemplateActive: (id: string) => void;

  addPrefix: (pfx: Omit<PrefixConfig, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  addGateway: (gw: Omit<GatewayConfig, 'id' | 'createdAt'>) => { success: boolean; error?: string };

  addScriptType: (stype: Omit<ScriptTypeConfig, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  addScriptName: (sname: Omit<ScriptNameConfig, 'id' | 'date'>) => { success: boolean; error?: string };
  addScriptLimit: (slimit: Omit<ScriptLimitConfig, 'id'>) => { success: boolean; error?: string };

  addMarketNews: (news: Omit<MarketNewsConfig, 'id' | 'date'>) => { success: boolean; error?: string };
  deleteMarketNews: (id: string) => void;

  addMotivationalQuote: (quote: Omit<MotivationalQuoteConfig, 'id' | 'date'>) => { success: boolean; error?: string };
  deleteMotivationalQuote: (id: string) => void;

  updateOrgDoc: (type: OrgContentDoc['type'], title: string, content: string) => { success: boolean; error?: string };

  // Bulk Operations
  executeBulkTransfer: (params: BulkTransferParams) => { success: boolean; count: number; message: string };
  executeDisposeLeads: (params: DisposeLeadsParams) => { success: boolean; count: number; message: string };
  executeDeleteAndExport: (mode: 'export_only' | 'delete_only' | 'both', selectedLeadIds: string[]) => { success: boolean; count: number; message: string };
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, role, showToast, advisoryLeads, setAdvisoryLeads } = useApp();

  // Helper to persist state
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`apex_config_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const saveState = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(`apex_config_${key}`, JSON.stringify(data));
    } catch (_) {}
  };

  // 1. Lead Operations
  const [leadSources, setLeadSources] = useState<LeadSourceConfig[]>(() => loadState('lead_sources', INITIAL_LEAD_SOURCES));
  useEffect(() => saveState('lead_sources', leadSources), [leadSources]);

  const [leadResponses, setLeadResponses] = useState<LeadResponseConfig[]>(() => loadState('lead_responses', INITIAL_LEAD_RESPONSES));
  useEffect(() => saveState('lead_responses', leadResponses), [leadResponses]);

  const [leadStatuses, setLeadStatuses] = useState<LeadStatusConfig[]>(() => loadState('lead_statuses', INITIAL_LEAD_STATUSES));
  useEffect(() => saveState('lead_statuses', leadStatuses), [leadStatuses]);

  // 2. People & Teams
  const [departments, setDepartments] = useState<DepartmentConfig[]>(() => loadState('departments', INITIAL_DEPARTMENTS));
  useEffect(() => saveState('departments', departments), [departments]);

  const [profiles, setProfiles] = useState<ProfileConfig[]>(() => loadState('profiles', INITIAL_PROFILES));
  useEffect(() => saveState('profiles', profiles), [profiles]);

  const [branches, setBranches] = useState<BranchConfig[]>(() => loadState('branches', INITIAL_BRANCHES));
  useEffect(() => saveState('branches', branches), [branches]);

  // 3. Products & Billing
  const [productCategories, setProductCategories] = useState<ProductCategoryConfig[]>(() => loadState('product_categories', INITIAL_PRODUCT_CATEGORIES));
  useEffect(() => saveState('product_categories', productCategories), [productCategories]);

  const [productServices, setProductServices] = useState<ProductServiceConfig[]>(() => loadState('product_services', INITIAL_PRODUCTS_SERVICES));
  useEffect(() => saveState('product_services', productServices), [productServices]);

  const [bankDetails, setBankDetails] = useState<BankDetailConfig[]>(() => loadState('bank_details', INITIAL_BANK_DETAILS));
  useEffect(() => saveState('bank_details', bankDetails), [bankDetails]);

  // 4. Communications
  const [commTemplates, setCommTemplates] = useState<CommunicationTemplateConfig[]>(() => loadState('comm_templates', INITIAL_COMM_TEMPLATES));
  useEffect(() => saveState('comm_templates', commTemplates), [commTemplates]);

  const [prefixes, setPrefixes] = useState<PrefixConfig[]>(() => loadState('prefixes', INITIAL_PREFIXES));
  useEffect(() => saveState('prefixes', prefixes), [prefixes]);

  const [gateways, setGateways] = useState<GatewayConfig[]>(() => loadState('gateways', INITIAL_GATEWAYS));
  useEffect(() => saveState('gateways', gateways), [gateways]);

  // 5. Research Content
  const [scriptTypes, setScriptTypes] = useState<ScriptTypeConfig[]>(() => loadState('script_types', INITIAL_SCRIPT_TYPES));
  useEffect(() => saveState('script_types', scriptTypes), [scriptTypes]);

  const [scriptNames, setScriptNames] = useState<ScriptNameConfig[]>(() => loadState('script_names', INITIAL_SCRIPT_NAMES));
  useEffect(() => saveState('script_names', scriptNames), [scriptNames]);

  const [scriptLimits, setScriptLimits] = useState<ScriptLimitConfig[]>(() => loadState('script_limits', INITIAL_SCRIPT_LIMITS));
  useEffect(() => saveState('script_limits', scriptLimits), [scriptLimits]);

  const [marketNews, setMarketNews] = useState<MarketNewsConfig[]>(() => loadState('market_news', INITIAL_MARKET_NEWS));
  useEffect(() => saveState('market_news', marketNews), [marketNews]);

  const [motivationalQuotes, setMotivationalQuotes] = useState<MotivationalQuoteConfig[]>(() => loadState('motivational_quotes', INITIAL_MOTIVATIONAL_QUOTES));
  useEffect(() => saveState('motivational_quotes', motivationalQuotes), [motivationalQuotes]);

  // 6. HR & Organization Content
  const [orgDocs, setOrgDocs] = useState<OrgContentDoc[]>(() => loadState('org_docs', INITIAL_ORG_DOCS));
  useEffect(() => saveState('org_docs', orgDocs), [orgDocs]);

  // Audit Log
  const [auditLogs, setAuditLogs] = useState<ConfigAuditEntry[]>(() => loadState('audit_logs', []));
  useEffect(() => saveState('audit_logs', auditLogs), [auditLogs]);

  const logAudit = useCallback((
    category: ConfigCategory,
    entityName: string,
    recordId: string,
    action: ConfigAuditEntry['action'],
    summary: string,
    prevVal?: string,
    newVal?: string
  ) => {
    const entry: ConfigAuditEntry = {
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      category,
      entityName,
      recordId,
      action,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: role,
      timestamp: new Date().toLocaleString('en-GB'),
      changesSummary: summary,
      previousValue: prevVal,
      newValue: newVal
    };
    setAuditLogs(prev => [entry, ...prev].slice(0, 500));
  }, [currentUser, role]);

  // ── Mutators: Lead Operations ──────────────────────────────────────────
  const addLeadSource = useCallback((source: Omit<LeadSourceConfig, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    if (!source.name || !source.name.trim()) {
      return { success: false, error: 'Source name is required.' };
    }
    const cleanName = source.name.trim();
    if (leadSources.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, error: `Lead source "${cleanName}" already exists.` };
    }
    const today = new Date().toISOString().slice(0, 10);
    const newRecord: LeadSourceConfig = {
      ...source,
      id: `ls-${Date.now().toString(36)}`,
      name: cleanName,
      usageCount: 0,
      createdAt: today,
      updatedAt: today
    };
    setLeadSources(prev => [newRecord, ...prev]);
    logAudit('lead_operations', 'Lead Source', newRecord.id, 'CREATE', `Created Lead Source "${cleanName}"`);
    showToast(`Lead Source "${cleanName}" added successfully.`, 'success');
    return { success: true };
  }, [leadSources, logAudit, showToast]);

  const updateLeadSource = useCallback((id: string, updates: Partial<LeadSourceConfig>) => {
    const target = leadSources.find(s => s.id === id);
    if (!target) return { success: false, error: 'Record not found' };
    if (updates.name && !updates.name.trim()) {
      return { success: false, error: 'Name cannot be blank.' };
    }
    setLeadSources(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...updates,
          updatedAt: new Date().toISOString().slice(0, 10)
        };
      }
      return s;
    }));
    logAudit('lead_operations', 'Lead Source', id, 'UPDATE', `Updated Lead Source "${updates.name || target.name}"`);
    showToast('Lead Source updated.', 'success');
    return { success: true };
  }, [leadSources, logAudit, showToast]);

  const toggleLeadSourceActive = useCallback((id: string) => {
    setLeadSources(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isActive;
        logAudit('lead_operations', 'Lead Source', id, nextState ? 'RESTORE' : 'DEACTIVATE', `${nextState ? 'Activated' : 'Deactivated'} Lead Source "${s.name}"`);
        showToast(`Lead Source "${s.name}" ${nextState ? 'activated' : 'deactivated (archived)'}.`, 'info');
        return { ...s, isActive: nextState };
      }
      return s;
    }));
  }, [logAudit, showToast]);

  const addLeadResponse = useCallback((resp: Omit<LeadResponseConfig, 'id' | 'createdAt' | 'usageCount'>) => {
    if (!resp.name || !resp.name.trim()) {
      return { success: false, error: 'Response name is required.' };
    }
    const cleanName = resp.name.trim();
    if (leadResponses.some(r => r.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, error: `Response "${cleanName}" already exists.` };
    }
    const newRecord: LeadResponseConfig = {
      ...resp,
      id: `resp-${Date.now().toString(36)}`,
      name: cleanName,
      usageCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setLeadResponses(prev => [newRecord, ...prev]);
    logAudit('lead_operations', 'Lead Response', newRecord.id, 'CREATE', `Created Lead Response "${cleanName}" (Status: ${resp.status})`);
    showToast(`Lead Response "${cleanName}" added.`, 'success');
    return { success: true };
  }, [leadResponses, logAudit, showToast]);

  const updateLeadResponseConfig = useCallback((id: string, updates: Partial<LeadResponseConfig>) => {
    setLeadResponses(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    logAudit('lead_operations', 'Lead Response', id, 'UPDATE', `Updated Lead Response`);
    showToast('Lead Response updated.', 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const toggleLeadResponseActive = useCallback((id: string) => {
    setLeadResponses(prev => prev.map(r => {
      if (r.id === id) {
        const nextState = !r.isActive;
        logAudit('lead_operations', 'Lead Response', id, nextState ? 'RESTORE' : 'DEACTIVATE', `${nextState ? 'Activated' : 'Deactivated'} Lead Response "${r.name}"`);
        showToast(`Lead Response "${r.name}" ${nextState ? 'activated' : 'deactivated'}.`, 'info');
        return { ...r, isActive: nextState };
      }
      return r;
    }));
  }, [logAudit, showToast]);

  const addLeadStatusConfig = useCallback((st: Omit<LeadStatusConfig, 'id' | 'createdAt' | 'usageCount'>) => {
    if (!st.name || !st.name.trim()) {
      return { success: false, error: 'Status name is required.' };
    }
    const cleanName = st.name.trim();
    if (leadStatuses.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, error: `Status "${cleanName}" already exists.` };
    }
    const newRecord: LeadStatusConfig = {
      ...st,
      id: `st-${Date.now().toString(36)}`,
      name: cleanName,
      usageCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setLeadStatuses(prev => [newRecord, ...prev]);
    logAudit('lead_operations', 'Lead Status', newRecord.id, 'CREATE', `Created Lead Status "${cleanName}"`);
    showToast(`Lead Status "${cleanName}" added.`, 'success');
    return { success: true };
  }, [leadStatuses, logAudit, showToast]);

  const updateLeadStatusConfig = useCallback((id: string, updates: Partial<LeadStatusConfig>) => {
    setLeadStatuses(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    showToast('Lead Status updated.', 'success');
    return { success: true };
  }, [showToast]);

  // ── Mutators: People & Teams ──────────────────────────────────────────
  const addDepartment = useCallback((dept: Omit<DepartmentConfig, 'id' | 'createdAt' | 'employeeCount'>) => {
    if (!dept.name || !dept.name.trim()) {
      return { success: false, error: 'Department Name is required.' };
    }
    const cleanName = dept.name.trim();
    if (departments.some(d => d.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, error: `Department "${cleanName}" already exists.` };
    }
    const newRecord: DepartmentConfig = {
      ...dept,
      id: `dept-${Date.now().toString(36)}`,
      name: cleanName,
      employeeCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setDepartments(prev => [newRecord, ...prev]);
    logAudit('people_teams', 'Department', newRecord.id, 'CREATE', `Added Department "${cleanName}"`);
    showToast(`Department "${cleanName}" created.`, 'success');
    return { success: true };
  }, [departments, logAudit, showToast]);

  const updateDepartment = useCallback((id: string, updates: Partial<DepartmentConfig>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    showToast('Department updated.', 'success');
    return { success: true };
  }, [showToast]);

  const toggleDepartmentActive = useCallback((id: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
  }, []);

  const addProfile = useCallback((prof: Omit<ProfileConfig, 'id' | 'createdAt'>) => {
    if (!prof.departmentId) {
      return { success: false, error: 'Department selection is required.' };
    }
    if (!prof.name || !prof.name.trim()) {
      return { success: false, error: 'Profile Name is required.' };
    }
    const cleanName = prof.name.trim();
    const dept = departments.find(d => d.id === prof.departmentId);
    const newRecord: ProfileConfig = {
      ...prof,
      id: `prof-${Date.now().toString(36)}`,
      departmentName: dept?.name || 'General',
      name: cleanName,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setProfiles(prev => [newRecord, ...prev]);
    logAudit('people_teams', 'Profile', newRecord.id, 'CREATE', `Added Profile "${cleanName}" in Department "${dept?.name}"`);
    showToast(`Profile "${cleanName}" added.`, 'success');
    return { success: true };
  }, [departments, logAudit, showToast]);

  const updateProfile = useCallback((id: string, updates: Partial<ProfileConfig>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Profile updated.', 'success');
    return { success: true };
  }, [showToast]);

  const toggleProfileActive = useCallback((id: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  }, []);

  // ── Mutators: Products & Billing ──────────────────────────────────────
  const addProductCategory = useCallback((cat: Omit<ProductCategoryConfig, 'id' | 'createdAt' | 'productCount'>) => {
    if (!cat.name || !cat.name.trim()) {
      return { success: false, error: 'Category Name is required.' };
    }
    const cleanName = cat.name.trim();
    if (productCategories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, error: `Category "${cleanName}" already exists.` };
    }
    const newRecord: ProductCategoryConfig = {
      ...cat,
      id: `cat-${Date.now().toString(36)}`,
      name: cleanName,
      productCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setProductCategories(prev => [newRecord, ...prev]);
    logAudit('products_billing', 'Category', newRecord.id, 'CREATE', `Added Category "${cleanName}"`);
    showToast(`Category "${cleanName}" added.`, 'success');
    return { success: true };
  }, [productCategories, logAudit, showToast]);

  const updateProductCategory = useCallback((id: string, updates: Partial<ProductCategoryConfig>) => {
    setProductCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showToast('Category updated.', 'success');
    return { success: true };
  }, [showToast]);

  const addProductService = useCallback((prod: Omit<ProductServiceConfig, 'id' | 'createdAt' | 'version' | 'activeSubscribersCount'>) => {
    if (!prod.name || !prod.name.trim()) {
      return { success: false, error: 'Product/Service Name is required.' };
    }
    if (!prod.category) {
      return { success: false, error: 'Category is required.' };
    }
    if (prod.monthly < 0 || prod.quarterly < 0 || prod.halfQuarterly < 0 || prod.yearly < 0) {
      return { success: false, error: 'Pricing amounts must be non-negative.' };
    }
    const cleanName = prod.name.trim();
    const newRecord: ProductServiceConfig = {
      ...prod,
      id: `prod-${Date.now().toString(36)}`,
      name: cleanName,
      version: 1,
      activeSubscribersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setProductServices(prev => [newRecord, ...prev]);
    logAudit('products_billing', 'Product/Service', newRecord.id, 'CREATE', `Created Service "${cleanName}" in Category "${prod.category}"`);
    showToast(`Service "${cleanName}" created.`, 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const updateProductService = useCallback((id: string, updates: Partial<ProductServiceConfig>) => {
    setProductServices(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          version: p.version + 1
        };
      }
      return p;
    }));
    logAudit('products_billing', 'Product/Service', id, 'UPDATE', `Updated Service Pricing Schedule`);
    showToast('Product Service pricing schedule updated.', 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const toggleProductServiceActive = useCallback((id: string) => {
    setProductServices(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  }, []);

  const addBankDetail = useCallback((bank: Omit<BankDetailConfig, 'id'>) => {
    if (!bank.name || !bank.name.trim()) {
      return { success: false, error: 'Bank Name is required.' };
    }
    if (!bank.accountNumberMasked) {
      return { success: false, error: 'Account Number is required.' };
    }
    const newRecord: BankDetailConfig = {
      ...bank,
      id: `bank-${Date.now().toString(36)}`
    };
    setBankDetails(prev => [newRecord, ...prev]);
    logAudit('products_billing', 'Bank Details', newRecord.id, 'CREATE', `Added Bank Account "${bank.name}"`);
    showToast(`Bank "${bank.name}" added.`, 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const updateBankDetail = useCallback((id: string, updates: Partial<BankDetailConfig>) => {
    setBankDetails(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    showToast('Bank details updated.', 'success');
    return { success: true };
  }, [showToast]);

  // ── Mutators: Communications ──────────────────────────────────────────
  const addCommTemplate = useCallback((tpl: Omit<CommunicationTemplateConfig, 'id' | 'createdAt' | 'updatedAt' | 'placeholders'>) => {
    if (!tpl.name || !tpl.name.trim()) {
      return { success: false, error: 'Template Name is required.' };
    }
    if (!tpl.templateBody || !tpl.templateBody.trim()) {
      return { success: false, error: 'Template Body is required.' };
    }
    const cleanName = tpl.name.trim();
    // extract {placeholders}
    const matches = tpl.templateBody.match(/\{[a-zA-Z0-9_-]+\}/g) || [];
    const placeholders = Array.from(new Set(matches));

    const today = new Date().toISOString().slice(0, 10);
    const newRecord: CommunicationTemplateConfig = {
      ...tpl,
      id: `tpl-${Date.now().toString(36)}`,
      name: cleanName,
      placeholders,
      createdAt: today,
      updatedAt: today
    };
    setCommTemplates(prev => [newRecord, ...prev]);
    logAudit('communications', 'Template', newRecord.id, 'CREATE', `Created ${tpl.type} Template "${cleanName}"`);
    showToast(`Template "${cleanName}" created.`, 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const updateCommTemplate = useCallback((id: string, updates: Partial<CommunicationTemplateConfig>) => {
    setCommTemplates(prev => prev.map(t => {
      if (t.id === id) {
        const body = updates.templateBody || t.templateBody;
        const matches = body.match(/\{[a-zA-Z0-9_-]+\}/g) || [];
        return {
          ...t,
          ...updates,
          placeholders: Array.from(new Set(matches)),
          updatedAt: new Date().toISOString().slice(0, 10)
        };
      }
      return t;
    }));
    showToast('Template updated.', 'success');
    return { success: true };
  }, [showToast]);

  const toggleCommTemplateActive = useCallback((id: string) => {
    setCommTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  }, []);

  const addPrefix = useCallback((pfx: Omit<PrefixConfig, 'id' | 'createdAt'>) => {
    if (!pfx.prefix || !pfx.prefix.trim()) {
      return { success: false, error: 'Prefix is required.' };
    }
    const cleanPfx = pfx.prefix.trim().toUpperCase();
    const newRecord: PrefixConfig = {
      ...pfx,
      id: `pfx-${Date.now().toString(36)}`,
      prefix: cleanPfx,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setPrefixes(prev => [newRecord, ...prev]);
    logAudit('communications', 'Prefix', newRecord.id, 'CREATE', `Added Prefix "${cleanPfx}"`);
    showToast(`Prefix "${cleanPfx}" added.`, 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const addGateway = useCallback((gw: Omit<GatewayConfig, 'id' | 'createdAt'>) => {
    if (!gw.gatewayName || !gw.gatewayName.trim()) {
      return { success: false, error: 'Gateway Name is required.' };
    }
    if (!gw.endpointUrl || !gw.endpointUrl.trim()) {
      return { success: false, error: 'Endpoint URL is required.' };
    }
    const cleanName = gw.gatewayName.trim();
    const newRecord: GatewayConfig = {
      ...gw,
      id: `gw-${Date.now().toString(36)}`,
      gatewayName: cleanName,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setGateways(prev => [newRecord, ...prev]);
    logAudit('communications', 'Gateway', newRecord.id, 'CREATE', `Configured Gateway "${cleanName}" (${gw.serviceType})`);
    showToast(`Gateway "${cleanName}" configured.`, 'success');
    return { success: true };
  }, [logAudit, showToast]);

  // ── Mutators: Research Content ─────────────────────────────────────────
  const addScriptType = useCallback((stype: Omit<ScriptTypeConfig, 'id' | 'createdAt'>) => {
    if (!stype.name || !stype.name.trim()) {
      return { success: false, error: 'Script Type Name is required.' };
    }
    const cleanName = stype.name.trim();
    const newRecord: ScriptTypeConfig = {
      ...stype,
      id: `stype-${Date.now().toString(36)}`,
      name: cleanName,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setScriptTypes(prev => [newRecord, ...prev]);
    logAudit('research_content', 'Script Type', newRecord.id, 'CREATE', `Added Script Type "${cleanName}" (${stype.shareOrLot})`);
    showToast(`Script Type "${cleanName}" added.`, 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const addScriptName = useCallback((sname: Omit<ScriptNameConfig, 'id' | 'date'>) => {
    if (!sname.scriptTypeId) {
      return { success: false, error: 'Script Type selection is required.' };
    }
    if (!sname.scriptName || !sname.scriptName.trim()) {
      return { success: false, error: 'Script Name is required.' };
    }
    const cleanName = sname.scriptName.trim().toUpperCase();
    const parentType = scriptTypes.find(t => t.id === sname.scriptTypeId);
    const newRecord: ScriptNameConfig = {
      ...sname,
      id: `sname-${Date.now().toString(36)}`,
      scriptTypeName: parentType?.name || 'General',
      scriptName: cleanName,
      date: new Date().toISOString().slice(0, 10)
    };
    setScriptNames(prev => [newRecord, ...prev]);
    logAudit('research_content', 'Script Name', newRecord.id, 'CREATE', `Added Script "${cleanName}" (${parentType?.name})`);
    showToast(`Script Name "${cleanName}" added.`, 'success');
    return { success: true };
  }, [scriptTypes, logAudit, showToast]);

  const addScriptLimit = useCallback((slimit: Omit<ScriptLimitConfig, 'id'>) => {
    if (!slimit.scriptNameId) {
      return { success: false, error: 'Script selection is required.' };
    }
    if (!slimit.scriptValue || !slimit.scriptValue.trim()) {
      return { success: false, error: 'Script Value limit is required.' };
    }
    const script = scriptNames.find(s => s.id === slimit.scriptNameId);
    const newRecord: ScriptLimitConfig = {
      ...slimit,
      id: `slimit-${Date.now().toString(36)}`,
      scriptName: script?.scriptName || 'N/A'
    };
    setScriptLimits(prev => [newRecord, ...prev]);
    logAudit('research_content', 'Script Limit', newRecord.id, 'CREATE', `Set Limit for "${script?.scriptName}" to "${slimit.scriptValue}"`);
    showToast(`Script Limit saved.`, 'success');
    return { success: true };
  }, [scriptNames, logAudit, showToast]);

  const addMarketNews = useCallback((news: Omit<MarketNewsConfig, 'id' | 'date'>) => {
    if (!news.text || !news.text.trim()) {
      return { success: false, error: 'Market News text is required.' };
    }
    const newRecord: MarketNewsConfig = {
      ...news,
      id: `news-${Date.now().toString(36)}`,
      date: new Date().toISOString().slice(0, 10),
      author: news.author || currentUser.name
    };
    setMarketNews(prev => [newRecord, ...prev]);
    logAudit('research_content', 'Market News', newRecord.id, 'CREATE', `Published Market News Item`);
    showToast('Market News published.', 'success');
    return { success: true };
  }, [currentUser.name, logAudit, showToast]);

  const deleteMarketNews = useCallback((id: string) => {
    setMarketNews(prev => prev.filter(n => n.id !== id));
    logAudit('research_content', 'Market News', id, 'DELETE', `Deleted Market News item`);
    showToast('Market News item deleted.', 'info');
  }, [logAudit, showToast]);

  const addMotivationalQuote = useCallback((quote: Omit<MotivationalQuoteConfig, 'id' | 'date'>) => {
    if (!quote.text || !quote.text.trim()) {
      return { success: false, error: 'Quote text is required.' };
    }
    const newRecord: MotivationalQuoteConfig = {
      ...quote,
      id: `quote-${Date.now().toString(36)}`,
      date: new Date().toISOString().slice(0, 10),
      author: quote.author || 'Anonymous'
    };
    setMotivationalQuotes(prev => [newRecord, ...prev]);
    logAudit('research_content', 'Motivational Quote', newRecord.id, 'CREATE', `Added Motivational Quote`);
    showToast('Motivational quote added.', 'success');
    return { success: true };
  }, [logAudit, showToast]);

  const deleteMotivationalQuote = useCallback((id: string) => {
    setMotivationalQuotes(prev => prev.filter(q => q.id !== id));
    logAudit('research_content', 'Motivational Quote', id, 'DELETE', `Deleted Motivational Quote`);
    showToast('Motivational quote deleted.', 'info');
  }, [logAudit, showToast]);

  // ── Mutators: HR Org Content ───────────────────────────────────────────
  const updateOrgDoc = useCallback((type: OrgContentDoc['type'], title: string, content: string) => {
    if (!content || !content.trim()) {
      return { success: false, error: 'Document content is required.' };
    }
    setOrgDocs(prev => prev.map(doc => {
      if (doc.type === type) {
        const nextVer = doc.version + 1;
        logAudit('hr_organization', doc.title, doc.id, 'UPDATE', `Updated ${doc.title} to Version ${nextVer}`);
        return {
          ...doc,
          title: title || doc.title,
          content,
          version: nextVer,
          publishedDate: new Date().toISOString().slice(0, 10),
          updatedBy: `${currentUser.name} (${role.toUpperCase()})`
        };
      }
      return doc;
    }));
    confetti({ particleCount: 50, spread: 60 });
    showToast('Organizational Document updated and published.', 'success');
    return { success: true };
  }, [currentUser.name, role, logAudit, showToast]);

  // ── Bulk Operations: Lead Operations ──────────────────────────────────
  const executeBulkTransfer = useCallback((params: BulkTransferParams) => {
    const { fromEmployeeId, toEmployeeId, transferScope, sourceFilter, latestResponseFilter, toResponse, toSource } = params;
    if (!fromEmployeeId || !toEmployeeId) {
      return { success: false, count: 0, message: 'Source and Destination employees must be selected.' };
    }
    if (fromEmployeeId === toEmployeeId) {
      return { success: false, count: 0, message: 'Destination employee must be different from source employee.' };
    }

    let transferredCount = 0;
    setAdvisoryLeads(prev => prev.map(l => {
      if (l.assignedToId === fromEmployeeId) {
        if (sourceFilter && sourceFilter !== 'All' && l.source !== sourceFilter) return l;
        if (latestResponseFilter && latestResponseFilter !== 'All' && l.response !== latestResponseFilter) return l;
        if (transferScope === 'Only Contact' && l.status === 'New Lead') return l;
        if (transferScope === 'Only Lead' && l.status !== 'New Lead') return l;

        transferredCount++;
        return {
          ...l,
          assignedToId: toEmployeeId,
          assignedToName: `Transfer -> ${toEmployeeId}`,
          response: toResponse || l.response,
          source: toSource || l.source,
          modifiedToday: true
        };
      }
      return l;
    }));

    logAudit('lead_operations', 'Bulk Contact Transfer', `xfer-${Date.now()}`, 'TRANSFER', `Transferred ${transferredCount} leads from ${fromEmployeeId} to ${toEmployeeId}`);
    confetti({ particleCount: 60, spread: 70 });
    showToast(`Successfully transferred ${transferredCount} leads!`, 'success');
    return { success: true, count: transferredCount, message: `Transferred ${transferredCount} leads.` };
  }, [logAudit, setAdvisoryLeads, showToast]);

  const executeDisposeLeads = useCallback((params: DisposeLeadsParams) => {
    const { employeeFilter, responseFilter, sourceFilter, isDNDOnly, reason } = params;
    if (!reason || !reason.trim()) {
      return { success: false, count: 0, message: 'Disposal reason is required per compliance policy.' };
    }

    let disposedCount = 0;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    setAdvisoryLeads(prev => prev.map(l => {
      if (employeeFilter && employeeFilter !== 'All' && l.assignedToId !== employeeFilter) return l;
      if (responseFilter && responseFilter !== 'All' && l.response !== responseFilter) return l;
      if (sourceFilter && sourceFilter !== 'All' && l.source !== sourceFilter) return l;
      if (isDNDOnly && !l.isDND) return l;

      disposedCount++;
      return {
        ...l,
        status: 'Lost',
        response: `Disposed: ${reason}`,
        disposedToday: true,
        disposedAt: today,
        modifiedToday: true
      };
    }));

    logAudit('lead_operations', 'Dispose Leads', `disp-${Date.now()}`, 'DISPOSE', `Disposed ${disposedCount} leads. Reason: ${reason}`);
    showToast(`Disposed ${disposedCount} leads according to policy.`, 'info');
    return { success: true, count: disposedCount, message: `Disposed ${disposedCount} leads.` };
  }, [logAudit, setAdvisoryLeads, showToast]);

  const executeDeleteAndExport = useCallback((mode: 'export_only' | 'delete_only' | 'both', selectedLeadIds: string[]) => {
    if (selectedLeadIds.length === 0) {
      return { success: false, count: 0, message: 'No leads selected.' };
    }

    if (mode === 'export_only' || mode === 'both') {
      // Simulate clean CSV export
      showToast(`Exported CSV containing ${selectedLeadIds.length} lead records.`, 'success');
    }

    if (mode === 'delete_only' || mode === 'both') {
      setAdvisoryLeads(prev => prev.filter(l => !selectedLeadIds.includes(l.id)));
      logAudit('lead_operations', 'Delete & Export', `del-${Date.now()}`, 'DELETE', `Permanently deleted ${selectedLeadIds.length} leads.`);
      showToast(`Permanently deleted ${selectedLeadIds.length} leads.`, 'warning');
    }

    return { success: true, count: selectedLeadIds.length, message: `Operation completed for ${selectedLeadIds.length} records.` };
  }, [logAudit, setAdvisoryLeads, showToast]);

  return (
    <ConfigContext.Provider value={{
      leadSources,
      leadResponses,
      leadStatuses,
      departments,
      profiles,
      branches,
      productCategories,
      productServices,
      bankDetails,
      commTemplates,
      prefixes,
      gateways,
      scriptTypes,
      scriptNames,
      scriptLimits,
      marketNews,
      motivationalQuotes,
      orgDocs,
      auditLogs,
      addLeadSource,
      updateLeadSource,
      toggleLeadSourceActive,
      addLeadResponse,
      updateLeadResponseConfig,
      toggleLeadResponseActive,
      addLeadStatusConfig,
      updateLeadStatusConfig,
      addDepartment,
      updateDepartment,
      toggleDepartmentActive,
      addProfile,
      updateProfile,
      toggleProfileActive,
      addProductCategory,
      updateProductCategory,
      addProductService,
      updateProductService,
      toggleProductServiceActive,
      addBankDetail,
      updateBankDetail,
      addCommTemplate,
      updateCommTemplate,
      toggleCommTemplateActive,
      addPrefix,
      addGateway,
      addScriptType,
      addScriptName,
      addScriptLimit,
      addMarketNews,
      deleteMarketNews,
      addMotivationalQuote,
      deleteMotivationalQuote,
      updateOrgDoc,
      executeBulkTransfer,
      executeDisposeLeads,
      executeDeleteAndExport
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
