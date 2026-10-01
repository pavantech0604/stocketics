// ─── Configuration Master Data Types ─────────────────────────────────────

export type ConfigCategory = 
  | 'lead_operations'
  | 'people_teams'
  | 'products_billing'
  | 'communications'
  | 'research_content'
  | 'hr_organization';

// 1. Lead Operations
export interface LeadSourceConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  availableCount: number;
  totalUploaded: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadResponseConfig {
  id: string;
  name: string;
  status: 'In Contact' | 'Trial Active' | 'Converted' | 'Lost' | 'New Lead';
  description: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export interface LeadStatusConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export interface BulkTransferParams {
  fromEmployeeId: string;
  transferScope: 'Any Contact' | 'Only Contact' | 'Only Lead';
  sourceFilter: string;
  latestResponseFilter: string;
  shiftRecord: boolean;
  toEmployeeId: string;
  toResponse?: string;
  toSource?: string;
  contactType: 'Fresh' | 'Existing';
}

export interface DisposeLeadsParams {
  profileFilter?: string;
  employeeFilter?: string;
  responseFilter?: string;
  sourceFilter?: string;
  isDNDOnly?: boolean;
  fromDate?: string;
  toDate?: string;
  reason: string;
}

// 2. People & Teams
export interface DepartmentConfig {
  id: string;
  name: string;
  description: string;
  headName?: string;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
}

export interface ProfileConfig {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface BranchConfig {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  isActive: boolean;
  employeeCount: number;
}

// 3. Products & Billing
export interface ProductCategoryConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export interface ProductServiceConfig {
  id: string;
  createdAt?: string;
  name: string;
  description: string;
  category: string;
  monthly: number;
  quarterly: number;
  halfQuarterly: number; // Half-Yearly in legacy CRM
  yearly: number;
  isActive: boolean;
  version: number;
  effectiveFrom: string;
  activeSubscribersCount: number;
}

export interface BankDetailConfig {
  id: string;
  name: string;
  accountName: string;
  accountNumberMasked: string;
  ifscCode: string;
  branch: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
}

// 4. Communications
export interface CommunicationTemplateConfig {
  id: string;
  name: string;
  type: 'SMS' | 'MESSENGER' | 'E-MAIL';
  templateBody: string;
  templateId: string; // DLT registered Template ID
  isActive: boolean;
  placeholders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrefixConfig {
  id: string;
  prefix: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface GatewayConfig {
  id: string;
  gatewayName: string;
  serviceType: 'SMS' | 'WhatsApp' | 'Email';
  endpointUrl: string;
  apiKeyMasked: string;
  senderId?: string;
  isActive: boolean;
  createdAt: string;
}

// 5. Research Content
export interface ScriptTypeConfig {
  id: string;
  name: string;
  shareOrLot: 'Lot' | 'Share';
  limitation: 'select' | '3lakh' | '5lakh' | 'LoT';
  isActive: boolean;
  createdAt: string;
}

export interface ScriptNameConfig {
  id: string;
  scriptTypeId: string;
  scriptTypeName: string;
  scriptName: string;
  lotSize: number;
  date: string;
  isActive: boolean;
}

export interface ScriptLimitConfig {
  id: string;
  scriptNameId: string;
  scriptName: string;
  scriptValue: string; // e.g. "₹3,00,000" or "5 Lots"
  isActive: boolean;
}

export interface MarketNewsConfig {
  id: string;
  text: string;
  date: string;
  author: string;
  category?: 'Macro' | 'Equities' | 'F&O' | 'Commodity';
}

export interface MotivationalQuoteConfig {
  id: string;
  text: string;
  date: string;
  author: string;
}

// 6. HR & Organization Content
export interface OrgContentDoc {
  id: string;
  type: 'training_script' | 'my_company' | 'hr_policy' | 'notice_board';
  title: string;
  content: string;
  version: number;
  publishedDate: string;
  updatedBy: string;
  isActive: boolean;
}

// Configuration Audit Log
export interface ConfigAuditEntry {
  id: string;
  category: ConfigCategory;
  entityName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'RESTORE' | 'DELETE' | 'TRANSFER' | 'DISPOSE';
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  changesSummary: string;
  previousValue?: string;
  newValue?: string;
}
