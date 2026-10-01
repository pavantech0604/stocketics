import {
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
  OrgContentDoc
} from '../types/config';

// ── 1. Lead Operations Dictionaries ───────────────────────────────────────
export const INITIAL_LEAD_SOURCES: LeadSourceConfig[] = [
  { id: 'ls-01', name: 'D WEB KANNADA', description: 'Digital inbound campaign - Karnataka regional traffic', isActive: true, availableCount: 6168, totalUploaded: 12500, usageCount: 4210, createdAt: '2026-01-15', updatedAt: '2026-09-20' },
  { id: 'ls-02', name: 'D WEB TELUGU', description: 'Digital ad conversions - Andhra & Telangana', isActive: true, availableCount: 4063, totalUploaded: 8900, usageCount: 3120, createdAt: '2026-01-15', updatedAt: '2026-09-21' },
  { id: 'ls-03', name: 'D WEB TAMIL', description: 'Targeted Tamil Nadu equity & options web leads', isActive: true, availableCount: 792, totalUploaded: 2400, usageCount: 1105, createdAt: '2026-02-01', updatedAt: '2026-09-22' },
  { id: 'ls-04', name: 'D WEB HINDI', description: 'North India & central belt digital search traffic', isActive: true, availableCount: 5961, totalUploaded: 14200, usageCount: 5120, createdAt: '2026-01-10', updatedAt: '2026-09-23' },
  { id: 'ls-05', name: 'D WEB KERALA', description: 'Kerala state NRI and domestic equity inquiries', isActive: true, availableCount: 1930, totalUploaded: 4500, usageCount: 1640, createdAt: '2026-02-10', updatedAt: '2026-09-20' },
  { id: 'ls-06', name: 'PND - OS KANNADA', description: 'Offline partner network distribution - Kannada', isActive: true, availableCount: 3988, totalUploaded: 7000, usageCount: 2210, createdAt: '2026-03-01', updatedAt: '2026-09-19' },
  { id: 'ls-07', name: 'SPL KANNADA', description: 'Special high-net-worth VIP Kannada leads', isActive: true, availableCount: 1020, totalUploaded: 2100, usageCount: 890, createdAt: '2026-03-15', updatedAt: '2026-09-22' },
  { id: 'ls-08', name: 'KTK-OS TAMIL', description: 'Bangalore Tamil diaspora traders', isActive: true, availableCount: 5577, totalUploaded: 9800, usageCount: 3450, createdAt: '2026-02-20', updatedAt: '2026-09-21' },
  { id: 'ls-09', name: 'PD - OS ANDHRA', description: 'Partner desk offline registrations - Andhra', isActive: true, availableCount: 4037, totalUploaded: 8100, usageCount: 2890, createdAt: '2026-03-05', updatedAt: '2026-09-23' },
  { id: 'ls-10', name: 'PD - OS KANNADA', description: 'Partner desk direct registrations - Karnataka', isActive: true, availableCount: 3690, totalUploaded: 7500, usageCount: 2740, createdAt: '2026-03-10', updatedAt: '2026-09-22' },
];

export const INITIAL_LEAD_RESPONSES: LeadResponseConfig[] = [
  { id: 'resp-01', name: 'Interested', status: 'Trial Active', description: 'Client showed strong interest; opted in for 2-day live trial', isActive: true, usageCount: 3120, createdAt: '2026-01-01' },
  { id: 'resp-02', name: 'Call Back', status: 'In Contact', description: 'Requested scheduled callback at specific time', isActive: true, usageCount: 5410, createdAt: '2026-01-01' },
  { id: 'resp-03', name: 'Busy', status: 'In Contact', description: 'Client busy on call; scheduled for retry', isActive: true, usageCount: 2840, createdAt: '2026-01-01' },
  { id: 'resp-04', name: 'Not Interested', status: 'Lost', description: 'Client declined advisory services', isActive: true, usageCount: 1980, createdAt: '2026-01-01' },
  { id: 'resp-05', name: 'Language Barrier', status: 'In Contact', description: 'Needs reassignment to native language representative', isActive: true, usageCount: 420, createdAt: '2026-01-01' },
  { id: 'resp-06', name: 'Wrong Number', status: 'Lost', description: 'Invalid or disconnected telephone contact', isActive: true, usageCount: 650, createdAt: '2026-01-01' },
  { id: 'resp-07', name: 'DND', status: 'Lost', description: 'Do Not Disturb requested; added to compliance blacklist', isActive: true, usageCount: 310, createdAt: '2026-01-01' },
  { id: 'resp-08', name: 'Payment', status: 'Converted', description: 'Payment confirmed; converted to active paid client', isActive: true, usageCount: 940, createdAt: '2026-01-01' },
  { id: 'resp-09', name: 'HOLD', status: 'In Contact', description: 'Lead on temporary hold per customer request', isActive: true, usageCount: 180, createdAt: '2026-02-15' },
  { id: 'resp-10', name: 'SUCCESS', status: 'Converted', description: 'Successfully closed service package', isActive: true, usageCount: 890, createdAt: '2026-02-15' }
];

export const INITIAL_LEAD_STATUSES: LeadStatusConfig[] = [
  { id: 'st-01', name: 'New Lead', description: 'Fresh inbound lead awaiting first contact', isActive: true, usageCount: 6420, createdAt: '2026-01-01' },
  { id: 'st-02', name: 'In Contact', description: 'Communication initiated; active followup scheduled', isActive: true, usageCount: 4890, createdAt: '2026-01-01' },
  { id: 'st-03', name: 'Trial Active', description: 'Receiving live 2-day research recommendations', isActive: true, usageCount: 780, createdAt: '2026-01-01' },
  { id: 'st-04', name: 'Converted', description: 'Client has paid subscription fee; active contract', isActive: true, usageCount: 1240, createdAt: '2026-01-01' },
  { id: 'st-05', name: 'Lost', description: 'Disposed, invalid or rejected leads', isActive: true, usageCount: 3100, createdAt: '2026-01-01' }
];

// ── 2. People & Teams ─────────────────────────────────────────────────────
export const INITIAL_DEPARTMENTS: DepartmentConfig[] = [
  { id: 'dept-01', name: 'Advisory Sales', description: 'Client acquisition, relationship management & onboarding', headName: 'Vikram Malhotra', isActive: true, employeeCount: 18, createdAt: '2026-01-01' },
  { id: 'dept-02', name: 'Equity Research', description: 'Technical analysis, fundamental reports & SEBI RA signal generation', headName: 'Aditya Roy', isActive: true, employeeCount: 6, createdAt: '2026-01-01' },
  { id: 'dept-03', name: 'Operations', description: 'KYC validation, demat verification & client service desk', headName: 'Pooja Hegde', isActive: true, employeeCount: 8, createdAt: '2026-01-01' },
  { id: 'dept-04', name: 'HR', description: 'Recruitment, payroll, biometric attendance & employee relations', headName: 'Deepa Krishnan', isActive: true, employeeCount: 4, createdAt: '2026-01-01' },
  { id: 'dept-05', name: 'Finance', description: 'Invoicing, tax compliance, GST filing & banking reconciliation', headName: 'Suresh Raina', isActive: true, employeeCount: 5, createdAt: '2026-01-01' },
  { id: 'dept-06', name: 'IT', description: 'Infrastructure, CRM maintenance, SMS gateways & security', headName: 'Ramesh Babu', isActive: true, employeeCount: 4, createdAt: '2026-01-01' }
];

export const INITIAL_PROFILES: ProfileConfig[] = [
  { id: 'prof-01', departmentId: 'dept-01', departmentName: 'Advisory Sales', name: 'Business Development Executive', description: 'Direct sales representative managing inbound leads', isActive: true, createdAt: '2026-01-01' },
  { id: 'prof-02', departmentId: 'dept-01', departmentName: 'Advisory Sales', name: 'Senior Advisory Associate', description: 'High-ticket and portfolio advisory closer', isActive: true, createdAt: '2026-01-01' },
  { id: 'prof-03', departmentId: 'dept-01', departmentName: 'Advisory Sales', name: 'Team Leader', description: 'Manages sales squad, allotments, and daily targets', isActive: true, createdAt: '2026-01-01' },
  { id: 'prof-04', departmentId: 'dept-02', departmentName: 'Equity Research', name: 'Research Analyst', description: 'SEBI certified equity and derivatives market analyst', isActive: true, createdAt: '2026-01-01' },
  { id: 'prof-05', departmentId: 'dept-03', departmentName: 'Operations', name: 'KYC & Compliance Officer', description: 'Verifies PAN, Aadhaar, risk profiling and bank proofs', isActive: true, createdAt: '2026-01-01' },
  { id: 'prof-06', departmentId: 'dept-04', departmentName: 'HR', name: 'HR Manager', description: 'Personnel administration and company policies', isActive: true, createdAt: '2026-01-01' }
];

export const INITIAL_BRANCHES: BranchConfig[] = [
  { id: 'br-01', name: 'Mumbai Corporate Office', code: 'MUM-01', city: 'Mumbai', state: 'Maharashtra', address: 'Maker Chambers V, 4th Floor, Nariman Point', isActive: true, employeeCount: 22 },
  { id: 'br-02', name: 'Bangalore Tech & Regional Desk', code: 'BLR-01', city: 'Bengaluru', state: 'Karnataka', address: 'Indiranagar 100ft Road, 2nd Stage', isActive: true, employeeCount: 16 },
  { id: 'br-03', name: 'Hyderabad Branch', code: 'HYD-01', city: 'Hyderabad', state: 'Telangana', address: 'Cyber Towers, Hitec City, Madhapur', isActive: true, employeeCount: 7 }
];

// ── 3. Products & Billing ─────────────────────────────────────────────────
export const INITIAL_PRODUCT_CATEGORIES: ProductCategoryConfig[] = [
  { id: 'cat-01', name: 'Index Options', description: 'Nifty and BankNifty intraday & positional option buying/selling', isActive: true, productCount: 3, createdAt: '2026-01-01' },
  { id: 'cat-02', name: 'Stock Options', description: 'High beta stock option contracts with tight stoplosses', isActive: true, productCount: 2, createdAt: '2026-01-01' },
  { id: 'cat-03', name: 'Equity Cash', description: 'Large-cap and mid-cap delivery and momentum cash calls', isActive: true, productCount: 2, createdAt: '2026-01-01' },
  { id: 'cat-04', name: 'Commodity', description: 'MCX Crude Oil, Natural Gas, Gold & Silver futures/options', isActive: true, productCount: 2, createdAt: '2026-01-01' },
  { id: 'cat-05', name: 'Hedge & PMS', description: 'Directional multi-leg spreads and institutional wealth advisory', isActive: true, productCount: 1, createdAt: '2026-01-01' }
];

export const INITIAL_PRODUCTS_SERVICES: ProductServiceConfig[] = [
  { id: 'prod-01', name: 'EQUITY PREMIER', description: 'Fundamental delivery equity with high alpha risk-adjusted return', category: 'Equity Cash', monthly: 15000, quarterly: 38000, halfQuarterly: 65000, yearly: 110000, isActive: true, version: 1, effectiveFrom: '2026-01-01', activeSubscribersCount: 84 },
  { id: 'prod-02', name: 'INDEX OPTION', description: 'NIFTY & BANKNIFTY high momentum intraday options advisory', category: 'Index Options', monthly: 25000, quarterly: 60000, halfQuarterly: 95000, yearly: 160000, isActive: true, version: 1, effectiveFrom: '2026-01-01', activeSubscribersCount: 142 },
  { id: 'prod-03', name: 'STOCK OPTION', description: 'Stock options high beta momentum calls with defined risk', category: 'Stock Options', monthly: 22000, quarterly: 55000, halfQuarterly: 85000, yearly: 145000, isActive: true, version: 1, effectiveFrom: '2026-01-01', activeSubscribersCount: 56 },
  { id: 'prod-04', name: 'COMMODITY MOMENTUM', description: 'MCX Crude Oil & Bullion active trading strategies', category: 'Commodity', monthly: 28000, quarterly: 70000, halfQuarterly: 115000, yearly: 190000, isActive: true, version: 1, effectiveFrom: '2026-01-01', activeSubscribersCount: 38 },
  { id: 'prod-05', name: 'HEDGE & PMS', description: 'Sophisticated delta-neutral spreads and portfolio protection', category: 'Hedge & PMS', monthly: 45000, quarterly: 110000, halfQuarterly: 180000, yearly: 300000, isActive: true, version: 1, effectiveFrom: '2026-01-01', activeSubscribersCount: 19 }
];

export const INITIAL_BANK_DETAILS: BankDetailConfig[] = [
  { id: 'bank-01', name: 'HDFC BANK - PRIMARY COLLECTIONS', accountName: 'Stocketics Advisory and Research Pvt Ltd', accountNumberMasked: 'XXXX-XXXX-4921', ifscCode: 'HDFC0000060', branch: 'Fort Branch, Mumbai', description: 'Primary current account for client advisory subscriptions and online payments', isActive: true, isDefault: true },
  { id: 'bank-02', name: 'ICICI BANK - ESCROW ACCOUNT', accountName: 'Stocketics Research Pvt Ltd Escrow', accountNumberMasked: 'XXXX-XXXX-8832', ifscCode: 'ICIC0000104', branch: 'Bandra Kurla Complex, Mumbai', description: 'SEBI compliant client advance payment clearing account', isActive: true, isDefault: false },
  { id: 'bank-03', name: 'AXIS BANK - REGIONAL COLLECTION', accountName: 'Stocketics Advisory Regional', accountNumberMasked: 'XXXX-XXXX-1194', ifscCode: 'UTIB0000215', branch: 'Indiranagar, Bangalore', description: 'South zone branch collections and direct NEFT/RTGS payments', isActive: true, isDefault: false }
];

// ── 4. Communications ─────────────────────────────────────────────────────
export const INITIAL_COMM_TEMPLATES: CommunicationTemplateConfig[] = [
  { id: 'tpl-01', name: 'Welcome Trial SMS', type: 'SMS', templateBody: 'Dear {client_name}, welcome to Stocketics! Your 2-day live advisory trial for {service} is active. For support call +91-9820100401. Standard T&C apply.', templateId: 'DLT-1107161201948', isActive: true, placeholders: ['{client_name}', '{service}'], createdAt: '2026-01-01', updatedAt: '2026-08-15' },
  { id: 'tpl-02', name: 'Payment Receipt & Onboarding Email', type: 'E-MAIL', templateBody: 'Dear {client_name}, we have received your payment of ₹{amount} for {service}. Invoice No: {invoice_no}. Please complete your KYC verification link to activate advisory signals: {kyc_link}. Regards, Stocketics Compliance.', templateId: 'EMAIL-PAY-ACK-01', isActive: true, placeholders: ['{client_name}', '{amount}', '{service}', '{invoice_no}', '{kyc_link}'], createdAt: '2026-01-01', updatedAt: '2026-09-01' },
  { id: 'tpl-03', name: 'Trade Recommendation Signal', type: 'MESSENGER', templateBody: '[STOCKETICS RA CALL] {call_type} {script_name} @ ₹{entry_price} | TGT1: ₹{target1} | TGT2: ₹{target2} | SL: ₹{stop_loss} | Analyst: {analyst_name} (SEBI Reg: INH000008921). Disclosures on website.', templateId: 'MSG-RA-CALL-01', isActive: true, placeholders: ['{call_type}', '{script_name}', '{entry_price}', '{target1}', '{target2}', '{stop_loss}', '{analyst_name}'], createdAt: '2026-01-01', updatedAt: '2026-09-10' },
  { id: 'tpl-04', name: 'Scheduled Callback Reminder', type: 'SMS', templateBody: 'Hello {client_name}, this is a reminder for our scheduled advisory discussion today at {time}. Looking forward to connecting. Advisor: {advisor_name}.', templateId: 'DLT-1107161208923', isActive: true, placeholders: ['{client_name}', '{time}', '{advisor_name}'], createdAt: '2026-02-01', updatedAt: '2026-08-20' }
];

export const INITIAL_PREFIXES: PrefixConfig[] = [
  { id: 'pfx-01', prefix: 'STK-', description: 'Standard client code identifier (e.g. STK-26-0492)', isActive: true, createdAt: '2026-01-01' },
  { id: 'pfx-02', prefix: 'INV-26-', description: 'Current financial year 2026 tax invoice serial prefix', isActive: true, createdAt: '2026-01-01' },
  { id: 'pfx-03', prefix: 'RA-CALL-', description: 'Research analyst signal broadcast identifier', isActive: true, createdAt: '2026-01-01' },
  { id: 'pfx-04', prefix: 'KYC-CASE-', description: 'Compliance case docket prefix', isActive: true, createdAt: '2026-01-01' }
];

export const INITIAL_GATEWAYS: GatewayConfig[] = [
  { id: 'gw-01', gatewayName: 'ValueFirst Enterprise SMS', serviceType: 'SMS', endpointUrl: 'https://api.valuefirst.com/psms/servlet/psms.vfe', apiKeyMasked: 'vf_live_••••••••••••••••39a1', senderId: 'STKADV', isActive: true, createdAt: '2026-01-01' },
  { id: 'gw-02', gatewayName: 'Gupshup WhatsApp Enterprise', serviceType: 'WhatsApp', endpointUrl: 'https://api.gupshup.io/wa/api/v1/msg', apiKeyMasked: 'gs_live_••••••••••••••••88b2', senderId: 'STOCKETICS', isActive: true, createdAt: '2026-01-15' },
  { id: 'gw-03', gatewayName: 'SendGrid Transactional Cloud', serviceType: 'Email', endpointUrl: 'https://api.sendgrid.com/v3/mail/send', apiKeyMasked: 'SG.••••••••••••••••••••••••77c3', senderId: 'advisory@stocketics.com', isActive: true, createdAt: '2026-01-10' }
];

// ── 5. Research Content Dictionaries ──────────────────────────────────────
export const INITIAL_SCRIPT_TYPES: ScriptTypeConfig[] = [
  { id: 'stype-01', name: 'Stock Cash', shareOrLot: 'Share', limitation: 'select', isActive: true, createdAt: '2026-01-01' },
  { id: 'stype-02', name: 'Index Option', shareOrLot: 'Lot', limitation: 'LoT', isActive: true, createdAt: '2026-01-01' },
  { id: 'stype-03', name: 'Stock Future', shareOrLot: 'Lot', limitation: '3lakh', isActive: true, createdAt: '2026-01-01' },
  { id: 'stype-04', name: 'MCX Bullion', shareOrLot: 'Lot', limitation: '5lakh', isActive: true, createdAt: '2026-01-01' },
  { id: 'stype-05', name: 'BTST / STBT', shareOrLot: 'Share', limitation: '3lakh', isActive: true, createdAt: '2026-02-01' },
  { id: 'stype-06', name: 'Swing Momentum', shareOrLot: 'Share', limitation: '5lakh', isActive: true, createdAt: '2026-02-01' }
];

export const INITIAL_SCRIPT_NAMES: ScriptNameConfig[] = [
  { id: 'sname-01', scriptTypeId: 'stype-02', scriptTypeName: 'Index Option', scriptName: 'NIFTY 50', lotSize: 50, date: '2026-09-01', isActive: true },
  { id: 'sname-02', scriptTypeId: 'stype-02', scriptTypeName: 'Index Option', scriptName: 'BANKNIFTY', lotSize: 15, date: '2026-09-01', isActive: true },
  { id: 'sname-03', scriptTypeId: 'stype-02', scriptTypeName: 'Index Option', scriptName: 'FINNIFTY', lotSize: 40, date: '2026-09-01', isActive: true },
  { id: 'sname-04', scriptTypeId: 'stype-01', scriptTypeName: 'Stock Cash', scriptName: 'RELIANCE', lotSize: 1, date: '2026-09-01', isActive: true },
  { id: 'sname-05', scriptTypeId: 'stype-01', scriptTypeName: 'Stock Cash', scriptName: 'HDFCBANK', lotSize: 1, date: '2026-09-01', isActive: true },
  { id: 'sname-06', scriptTypeId: 'stype-04', scriptTypeName: 'MCX Bullion', scriptName: 'CRUDEOIL', lotSize: 100, date: '2026-09-01', isActive: true },
  { id: 'sname-07', scriptTypeId: 'stype-04', scriptTypeName: 'MCX Bullion', scriptName: 'GOLDM', lotSize: 10, date: '2026-09-01', isActive: true }
];

export const INITIAL_SCRIPT_LIMITS: ScriptLimitConfig[] = [
  { id: 'slimit-01', scriptNameId: 'sname-01', scriptName: 'NIFTY 50', scriptValue: '₹5,00,000 / Max 20 Lots', isActive: true },
  { id: 'slimit-02', scriptNameId: 'sname-02', scriptName: 'BANKNIFTY', scriptValue: '₹3,00,000 / Max 15 Lots', isActive: true },
  { id: 'slimit-03', scriptNameId: 'sname-06', scriptName: 'CRUDEOIL', scriptValue: '₹4,00,000 / Max 5 Lots', isActive: true },
  { id: 'slimit-04', scriptNameId: 'sname-04', scriptName: 'RELIANCE', scriptValue: '₹10,00,000 Capital Exposure', isActive: true }
];

export const INITIAL_MARKET_NEWS: MarketNewsConfig[] = [
  { id: 'news-01', text: 'RBI Monetary Policy Committee maintains benchmark repo rate at 6.50%; highlights domestic economic resilience.', date: '2026-09-24', author: 'Aditya Roy (Head of Research)', category: 'Macro' },
  { id: 'news-02', text: 'India Q2 GDP growth estimates revised upwards to 7.4% driven by manufacturing momentum and capital expenditure.', date: '2026-09-22', author: 'Research Desk', category: 'Macro' },
  { id: 'news-03', text: 'Crude oil tests $74/bbl resistance as global inventory draws support energy complex momentum.', date: '2026-09-20', author: 'Commodity Desk', category: 'Commodity' }
];

export const INITIAL_MOTIVATIONAL_QUOTES: MotivationalQuoteConfig[] = [
  { id: 'quote-01', text: 'In investing, what is comfortable is rarely profitable. Discipline in process precedes compounding in capital.', date: '2026-09-25', author: 'Robert Arnott' },
  { id: 'quote-02', text: 'Risk comes from not knowing what you are doing. Proper position sizing and risk management turn trading into a craft.', date: '2026-09-24', author: 'Warren Buffett' },
  { id: 'quote-03', text: 'The goal of a successful trader is to make the best trades. Money is secondary. Respect your stoploss and protect your capital.', date: '2026-09-23', author: 'Alexander Elder' }
];

// ── 6. HR & Organization Content ──────────────────────────────────────────
export const INITIAL_ORG_DOCS: OrgContentDoc[] = [
  {
    id: 'org-01',
    type: 'training_script',
    title: 'Advisory Sales Onboarding & Objection Handling Script',
    content: `1. OPENING HOOK & GREETING:
"Hello [Client Name], this is [Your Name] from Stocketics Advisory. I am calling regarding your recent inquiry for high-conviction Index & Equity advisory strategies."

2. ESTABLISHING TRADING CONTEXT:
"Before we discuss recommendations, I would like to understand your primary trading segment: Are you predominantly active in Nifty/BankNifty Options, Stock Futures, or Delivery Cash?"

3. RISK PROFILING & SEBI ADVISORY DISCLOSURES:
"Stocketics is a SEBI Registered Research Analyst entity (INH000008921). We do not guarantee returns or accept profit-sharing deposits; our calls carry predefined stop-losses and risk management guidelines."

4. CLOSING TRIAL OFFER:
"We provide a 2-day live market observation trial with real-time entry and exit timestamps. Let me activate your trial package today so you can witness the execution precision."`,
    version: 3,
    publishedDate: '2026-08-15',
    updatedBy: 'Deepa Krishnan (HR Manager)',
    isActive: true
  },
  {
    id: 'org-02',
    type: 'my_company',
    title: 'Stocketics Advisory & Research Corporate Profile',
    content: `COMPANY OVERVIEW:
Stocketics Advisory & Research Private Limited is an institutional-grade financial advisory firm registered with the Securities and Exchange Board of India (SEBI Registration No. INH000008921).

CORPORATE MISSION:
To provide retail and high-net-worth investors with disciplined, quantitative, and risk-adjusted research recommendations across Indian equities, derivatives, and commodities.

CORE PRINCIPLES:
1. Strict Regulatory Compliance: Zero tolerance for unauthorized schemes, mandatory KYC verification, and transparent disclosure of all material conflicts.
2. Capital Preservation First: Strict stoploss discipline and position sizing on every recommendation signal.
3. Client Transparency: Real-time SMS and timestamped dispatch of calls with audit-backed performance ledgers.

HEADQUARTERS:
Maker Chambers V, 4th Floor, Nariman Point, Mumbai - 400021, Maharashtra, India.`,
    version: 2,
    publishedDate: '2026-07-01',
    updatedBy: 'Deepa Krishnan (HR Manager)',
    isActive: true
  },
  {
    id: 'org-03',
    type: 'hr_policy',
    title: 'Employee Conduct, Anti-Insider Trading & PII Security Mandate',
    content: `STOCKETICS INTERNAL COMPLIANCE POLICY 2026:

1. PERSONAL TRADING RESTRICTIONS:
All research analysts, team leaders, and advisory sales employees are strictly prohibited from trading in securities on which active client recommendations have been published within the preceding 48 hours.

2. CLIENT PII PROTECTION:
Client telephone numbers, PAN card documents, Aadhaar cards, and bank details must remain masked in non-owner contexts. Poaching or unauthorized exports of client data are criminal offenses subject to immediate termination and legal prosecution.

3. LEAVE & ATTENDANCE PROTOCOL:
Biometric check-in is mandatory before 9:15 AM (market open). Unplanned absences during market trading hours without prior team leader notice are treated as Loss of Pay (LOP).`,
    version: 4,
    publishedDate: '2026-09-01',
    updatedBy: 'Deepa Krishnan (HR Manager)',
    isActive: true
  },
  {
    id: 'org-04',
    type: 'notice_board',
    title: 'Notice Board & Latest Operational Updates',
    content: `[NOTICE - 25 SEP 2026]:
1. Biometric punch synchronization has been updated with automatic geo-tagging for field associates.
2. All KYC pending cases older than 7 days must be reviewed and resolved before quarterly audit closing.
3. Diwali quarter performance bonus and cashback tiers are live in the Sales Dashboard.`,
    version: 1,
    publishedDate: '2026-09-25',
    updatedBy: 'Deepa Krishnan (HR Manager)',
    isActive: true
  }
];
