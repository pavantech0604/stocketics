import { MarketInstrumentConfig, MarketWidgetConfig, RolePermissions } from '../types';

/**
 * Central Configuration for Approved Stocketics Market Instruments
 * Includes:
 * 1. Benchmark Indices (NIFTY 50, Sensex, Bank Nifty)
 * 2. Active RA Advisory Option Calls (NIFTY 24800 CE, BANKNIFTY 51500 PE, SENSEX 81500 CE)
 * 3. Trending Equities (RELIANCE, TCS)
 * 4. Key Energy & Forex Macro Indicators (Crude Oil, USD/INR)
 */
export const MARKET_INSTRUMENTS: MarketInstrumentConfig[] = [
  {
    key: 'nifty50',
    label: 'NIFTY 50',
    symbol: 'NSE:NIFTY50',
    type: 'index',
    currency: 'INR',
    exchange: 'NSE',
    enabled: true,
    baseValue: 24852.15,
  },
  {
    key: 'banknifty',
    label: 'BANK NIFTY',
    symbol: 'NSE:BANKNIFTY',
    type: 'index',
    currency: 'INR',
    exchange: 'NSE',
    enabled: true,
    baseValue: 51540.80,
  },
  {
    key: 'nifty_24800_ce',
    label: 'NIFTY 24800 CE',
    symbol: 'NSE:NIFTY24SEP24800CE',
    type: 'option',
    currency: 'INR',
    exchange: 'NSE NFO',
    enabled: true,
    baseValue: 212.40,
    callType: 'BUY',
    entryPrice: 165.00,
    target1: 210.00,
    target2: 245.00,
    stopLoss: 135.00,
    analyst: 'Aditya Roy (RA)',
    lotSize: 50,
    expiry: '26-Sep-2026',
    notes: 'Massive open interest unwinding at 24800 Call strike; Target 1 Achieved!',
    serviceSegment: 'INDEX OPTION'
  },
  {
    key: 'banknifty_51500_pe',
    label: 'BANKNIFTY 51500 PE',
    symbol: 'NSE:BANKNIFTY24SEP51500PE',
    type: 'option',
    currency: 'INR',
    exchange: 'NSE NFO',
    enabled: true,
    baseValue: 345.50,
    callType: 'BUY',
    entryPrice: 280.00,
    target1: 340.00,
    target2: 390.00,
    stopLoss: 240.00,
    analyst: 'Rohan Deshmukh',
    lotSize: 15,
    expiry: '26-Sep-2026',
    notes: 'Resistance rejection at 51800; Target 1 Achieved!',
    serviceSegment: 'INDEX OPTION'
  },
  {
    key: 'sensex',
    label: 'Sensex',
    symbol: 'BSE:SENSEX',
    type: 'index',
    currency: 'INR',
    exchange: 'BSE',
    enabled: true,
    baseValue: 81332.72,
  },
  {
    key: 'sensex_81500_ce',
    label: 'SENSEX 81500 CE',
    symbol: 'BSE:SENSEX24SEP81500CE',
    type: 'option',
    currency: 'INR',
    exchange: 'BSE BFO',
    enabled: true,
    baseValue: 380.00,
    callType: 'BUY',
    entryPrice: 360.00,
    target1: 460.00,
    target2: 520.00,
    stopLoss: 260.00,
    analyst: 'Aditya Roy (RA)',
    lotSize: 10,
    expiry: '26-Sep-2026',
    serviceSegment: 'INDEX OPTION'
  },
  {
    key: 'reliance',
    label: 'RELIANCE',
    symbol: 'NSE:RELIANCE',
    type: 'stock',
    currency: 'INR',
    exchange: 'NSE',
    enabled: true,
    baseValue: 2985.40,
    callType: 'BUY',
    entryPrice: 2940.00,
    target1: 3020.00,
    target2: 3080.00,
    stopLoss: 2890.00,
    analyst: 'Sneha Kapur',
    lotSize: 1,
    serviceSegment: 'EQUITY PREMIER'
  },
  {
    key: 'tcs',
    label: 'TCS',
    symbol: 'NSE:TCS',
    type: 'stock',
    currency: 'INR',
    exchange: 'NSE',
    enabled: true,
    baseValue: 4210.00,
    lotSize: 1,
    serviceSegment: 'EQUITY PREMIER'
  },
  {
    key: 'usdinr',
    label: 'USD/INR',
    symbol: 'FX:USDINR',
    type: 'forex',
    currency: 'INR',
    exchange: 'RBI / FOREX',
    enabled: true,
    baseValue: 83.94,
  },
  {
    key: 'crudeoil',
    label: 'Crude Oil',
    symbol: 'COMM:CRUDE_WTI',
    type: 'commodity',
    currency: 'USD',
    exchange: 'MCX / NYMEX',
    enabled: true,
    baseValue: 71.85,
    serviceSegment: 'COMMODITY'
  },
];

/**
 * Default Widget Settings with Auto-scroll Marquee enabled
 */
export const DEFAULT_MARKET_WIDGET_CONFIG: MarketWidgetConfig = {
  isEnabled: true,
  density: 'compact',
  layout: 'ticker',
  refreshSeconds: 15,
  selectedInstruments: [
    'nifty50', 
    'banknifty', 
    'nifty_24800_ce', 
    'banknifty_51500_pe', 
    'sensex', 
    'reliance', 
    'tcs', 
    'crudeoil', 
    'usdinr'
  ],
  showMiniChart: true,
  autoScroll: true,
  scrollSpeed: 'medium'
};

/**
 * Role-Based Access Control Permissions
 * All CRM roles (HR, Manager, Team Leader, Employee) have live market view enabled
 */
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  hr: {
    market_dashboard_view: true,
    market_workspace_view: true,
  },
  manager: {
    market_dashboard_view: true,
    market_workspace_view: true,
  },
  team_leader: {
    market_dashboard_view: true,
    market_workspace_view: true,
  },
  employee: {
    market_dashboard_view: true,
    market_workspace_view: true,
  },
};
