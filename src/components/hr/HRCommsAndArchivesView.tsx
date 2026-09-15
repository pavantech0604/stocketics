import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Send, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Gift, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Share2, 
  Download, 
  FileText, 
  Hash, 
  User, 
  Shield, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  Zap, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Award,
  RefreshCw,
  XCircle,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type HRCommsTab = 
  | 'messenger' 
  | 'greeting' 
  | 'tip-archive' 
  | 'pre-tip-archive' 
  | 'greeting-tip-archive' 
  | 'open-call' 
  | 'closed-call';

interface Message {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  text: string;
  timestamp: string;
  channel: string;
  isComplianceNotice?: boolean;
}

interface GreetingItem {
  id: string;
  recipientName: string;
  type: 'Birthday' | 'Work Anniversary' | 'Festival' | 'Client Welcome';
  departmentOrRole: string;
  date: string;
  status: 'Scheduled' | 'Dispatched' | 'Delivered';
  channel: 'WhatsApp' | 'SMS' | 'Email';
  messagePreview: string;
}

interface StockTip {
  id: string;
  script: string;
  segment: 'Options' | 'Futures' | 'Cash / Delivery' | 'Commodity';
  callType: 'BUY' | 'SELL';
  recommendedAt: string;
  entryPrice: number;
  target1: number;
  target2: number;
  stopLoss: number;
  achievedPrice?: number;
  pnlPoints?: number;
  returnPercent?: number;
  analyst: string;
  sebiReg: string;
  status: 'Target 1 Hit' | 'Target 2 Hit' | 'Stop Loss Hit' | 'Trailing SL Hit' | 'Open' | 'Closed';
  notes: string;
}

interface OpenCallTrade {
  id: string;
  script: string;
  segment: string;
  callType: 'BUY' | 'SELL';
  time: string;
  entryPrice: number;
  cmp: number;
  target1: number;
  target2: number;
  stopLoss: number;
  trailingSL: number;
  lotsOrQty: string;
  analyst: string;
  statusText: string;
}

interface ClosedCallTrade {
  id: string;
  script: string;
  segment: string;
  callType: 'BUY' | 'SELL';
  openTime: string;
  closeTime: string;
  entryPrice: number;
  exitPrice: number;
  pnlPoints: number;
  returnPercent: number;
  exitReason: 'Target 2 Hit' | 'Target 1 Hit' | 'Trailing SL Hit' | 'SL Hit' | 'Time Expiry';
  analyst: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'Compliance Officer (SEBI)',
    role: 'Compliance Vault',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    text: 'Mandatory Compliance Alert: All advisory research analysts must ensure risk disclosures and stop loss rationale are logged before publishing trades.',
    timestamp: '09:02 AM',
    channel: 'compliance-alerts',
    isComplianceNotice: true
  },
  {
    id: 'msg-2',
    sender: 'Rajesh Varma',
    role: 'VP Equity Research',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    text: 'Good morning team. GIFT Nifty is indicating a +95 point gap-up. Banking sector showing strong relative momentum post RBI commentary.',
    timestamp: '09:05 AM',
    channel: 'equity-research-desk'
  },
  {
    id: 'msg-3',
    sender: 'Sneha Kapur',
    role: 'Derivatives Analyst',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    text: 'Bank Nifty weekly straddle premiums are elevated. We are looking at 51200 CE breakout above ₹340 levels with a tight 35 point stop.',
    timestamp: '09:12 AM',
    channel: 'equity-research-desk'
  },
  {
    id: 'msg-4',
    sender: 'Rohan Deshmukh',
    role: 'Advisory Sales Head',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    text: 'Sales floor alert: 22 high-value HNI renewal leads assigned across desks. Target today is 100% dialer coverage by 11:30 AM.',
    timestamp: '09:18 AM',
    channel: 'advisory-sales-floor'
  }
];

const INITIAL_GREETINGS: GreetingItem[] = [
  {
    id: 'grt-1',
    recipientName: 'Sneha Kapur (Derivatives Trader)',
    type: 'Birthday',
    departmentOrRole: 'Derivatives Desk',
    date: 'Today, 08-Sep-2026',
    status: 'Scheduled',
    channel: 'WhatsApp',
    messagePreview: 'Wishing you a very Happy Birthday, Sneha! May your trades hit target and year be prosperous! - Team Stocketics'
  },
  {
    id: 'grt-2',
    recipientName: 'Karan Mehra (Talent Acquisition)',
    type: 'Work Anniversary',
    departmentOrRole: 'HR & People Ops',
    date: '09-Sep-2026',
    status: 'Scheduled',
    channel: 'Email',
    messagePreview: 'Congratulations Karan on completing 2 fruitful years with Stocketics! Thank you for scaling our trading desks.'
  },
  {
    id: 'grt-3',
    recipientName: 'All 850 Active HNI Advisory Clients',
    type: 'Festival',
    departmentOrRole: 'Client Base',
    date: 'Upcoming Diwali 2026',
    status: 'Dispatched',
    channel: 'WhatsApp',
    messagePreview: 'Wishing you and your family an auspicious Diwali & Samvat 2082! May wealth and alpha illuminate your portfolio.'
  },
  {
    id: 'grt-4',
    recipientName: 'Dr. Harshvardhan Jain',
    type: 'Client Welcome',
    departmentOrRole: 'New HNI Client (PMS Tier)',
    date: '07-Sep-2026',
    status: 'Delivered',
    channel: 'Email',
    messagePreview: 'Welcome to Stocketics Premium Advisory! Your dedicated research analyst is Aditya Roy. Access your dashboard.'
  }
];

const INITIAL_TIPS: StockTip[] = [
  {
    id: 'tip-101',
    script: 'NIFTY 24800 CE',
    segment: 'Options',
    callType: 'BUY',
    recommendedAt: '05-Sep-2026 09:25 AM',
    entryPrice: 165,
    target1: 210,
    target2: 245,
    stopLoss: 135,
    achievedPrice: 246,
    pnlPoints: 81,
    returnPercent: 49.1,
    analyst: 'Sneha Kapur',
    sebiReg: 'INH000012345/RA-4',
    status: 'Target 2 Hit',
    notes: 'Massive open interest unwinding at 24800 Call strike; target 2 achieved in 45 minutes.'
  },
  {
    id: 'tip-102',
    script: 'TATASTEEL CASH',
    segment: 'Cash / Delivery',
    callType: 'BUY',
    recommendedAt: '04-Sep-2026 10:15 AM',
    entryPrice: 152.5,
    target1: 160.0,
    target2: 166.0,
    stopLoss: 147.0,
    achievedPrice: 161.2,
    pnlPoints: 8.7,
    returnPercent: 5.7,
    analyst: 'Rajesh Varma',
    sebiReg: 'INH000012345/RA-1',
    status: 'Target 1 Hit',
    notes: 'Breakout above 200-EMA on daily timeframe with heavy institutional buying volumes.'
  },
  {
    id: 'tip-103',
    script: 'BANKNIFTY 51500 PE',
    segment: 'Options',
    callType: 'BUY',
    recommendedAt: '03-Sep-2026 01:40 PM',
    entryPrice: 280,
    target1: 350,
    target2: 410,
    stopLoss: 235,
    achievedPrice: 234,
    pnlPoints: -45,
    returnPercent: -16.1,
    analyst: 'Sneha Kapur',
    sebiReg: 'INH000012345/RA-4',
    status: 'Stop Loss Hit',
    notes: 'Sudden short-covering bounce triggered SL at 235. Risk disciplined exit.'
  },
  {
    id: 'tip-104',
    script: 'RELIANCE FUT',
    segment: 'Futures',
    callType: 'BUY',
    recommendedAt: '02-Sep-2026 11:10 AM',
    entryPrice: 3010,
    target1: 3070,
    target2: 3120,
    stopLoss: 2975,
    achievedPrice: 3075,
    pnlPoints: 65,
    returnPercent: 2.16,
    analyst: 'Aditya Roy',
    sebiReg: 'INH000012345/RA-2',
    status: 'Target 1 Hit',
    notes: 'Telecom tariff hike anticipation and retail spin-off news flow supporting price structure.'
  }
];

const INITIAL_OPEN_CALLS: OpenCallTrade[] = [
  {
    id: 'oc-1',
    script: 'BANKNIFTY 51200 CE',
    segment: 'Index Options',
    callType: 'BUY',
    time: '09:20 AM',
    entryPrice: 310,
    cmp: 362,
    target1: 380,
    target2: 440,
    stopLoss: 275,
    trailingSL: 320,
    lotsOrQty: '1 Lot (15 Qty)',
    analyst: 'Sneha Kapur',
    statusText: 'Near Target 1 (+16.8%)'
  },
  {
    id: 'oc-2',
    script: 'BAJFINANCE CASH',
    segment: 'Equity Intraday',
    callType: 'BUY',
    time: '09:45 AM',
    entryPrice: 7240,
    cmp: 7335,
    target1: 7420,
    target2: 7500,
    stopLoss: 7150,
    trailingSL: 7240,
    lotsOrQty: '50 Shares',
    analyst: 'Rajesh Varma',
    statusText: 'Cost Trailed (+1.31%)'
  },
  {
    id: 'oc-3',
    script: 'INFY 1900 PE',
    segment: 'Stock Options',
    callType: 'BUY',
    time: '10:05 AM',
    entryPrice: 42,
    cmp: 39.5,
    target1: 54,
    target2: 66,
    stopLoss: 34,
    trailingSL: 34,
    lotsOrQty: '1 Lot (400 Qty)',
    analyst: 'Aditya Roy',
    statusText: 'Live / Consolidating'
  }
];

const INITIAL_CLOSED_CALLS: ClosedCallTrade[] = [
  {
    id: 'cc-1',
    script: 'NIFTY 24700 CE',
    segment: 'Index Options',
    callType: 'BUY',
    openTime: '06-Sep 09:22 AM',
    closeTime: '06-Sep 10:45 AM',
    entryPrice: 140,
    exitPrice: 215,
    pnlPoints: 75,
    returnPercent: 53.6,
    exitReason: 'Target 2 Hit',
    analyst: 'Sneha Kapur'
  },
  {
    id: 'cc-2',
    script: 'HDFCBANK FUT',
    segment: 'Stock Futures',
    callType: 'BUY',
    openTime: '06-Sep 10:30 AM',
    closeTime: '06-Sep 02:15 PM',
    entryPrice: 1640,
    exitPrice: 1672,
    pnlPoints: 32,
    returnPercent: 1.95,
    exitReason: 'Target 1 Hit',
    analyst: 'Rajesh Varma'
  },
  {
    id: 'cc-3',
    script: 'M&M CASH',
    segment: 'Cash Delivery',
    callType: 'BUY',
    openTime: '04-Sep 09:30 AM',
    closeTime: '05-Sep 03:15 PM',
    entryPrice: 2750,
    exitPrice: 2840,
    pnlPoints: 90,
    returnPercent: 3.27,
    exitReason: 'Target 2 Hit',
    analyst: 'Aditya Roy'
  },
  {
    id: 'cc-4',
    script: 'TCS 4500 CE',
    segment: 'Stock Options',
    callType: 'BUY',
    openTime: '04-Sep 01:15 PM',
    closeTime: '04-Sep 02:45 PM',
    entryPrice: 85,
    exitPrice: 72,
    pnlPoints: -13,
    returnPercent: -15.3,
    exitReason: 'SL Hit',
    analyst: 'Sneha Kapur'
  }
];

interface Props {
  initialTab?: HRCommsTab;
}

export const HRCommsAndArchivesView: React.FC<Props> = ({ initialTab = 'messenger' }) => {
  const { activeTab, setActiveTab, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const resolveTab = (): HRCommsTab => {
    if (activeTab === 'messenger') return 'messenger';
    if (activeTab === 'greeting') return 'greeting';
    if (activeTab === 'tip-archive') return 'tip-archive';
    if (activeTab === 'pre-tip-archive') return 'pre-tip-archive';
    if (activeTab === 'greeting-tip-archive' || activeTab === 'greenting-tip-archive') return 'greeting-tip-archive';
    if (activeTab === 'open-call') return 'open-call';
    if (activeTab === 'closed-call') return 'closed-call';
    return initialTab;
  };

  const [currentTab, setCurrentTab] = useState<HRCommsTab>(resolveTab());

  useEffect(() => {
    setCurrentTab(resolveTab());
  }, [activeTab]);

  const handleTabSelect = (tab: HRCommsTab) => {
    setCurrentTab(tab);
    setActiveTab(tab);
  };

  // Messenger State
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeChannel, setActiveChannel] = useState('equity-research-desk');
  const [typedMessage, setTypedMessage] = useState('');

  // Greetings State
  const [greetings, setGreetings] = useState<GreetingItem[]>(INITIAL_GREETINGS);
  const [isGreetingModalOpen, setIsGreetingModalOpen] = useState(false);
  const [greetingForm, setGreetingForm] = useState({
    recipient: 'Sneha Kapur',
    type: 'Birthday' as GreetingItem['type'],
    channel: 'WhatsApp' as GreetingItem['channel'],
    message: 'Wishing you a very Happy Birthday! May your trades hit target and year be prosperous! - Team Stocketics'
  });

  // Tips State
  const [tips, setTips] = useState<StockTip[]>(INITIAL_TIPS);
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [tipSearch, setTipSearch] = useState('');

  // Open & Closed Calls
  const [openCalls, setOpenCalls] = useState<OpenCallTrade[]>(INITIAL_OPEN_CALLS);
  const [closedCalls, setClosedCalls] = useState<ClosedCallTrade[]>(INITIAL_CLOSED_CALLS);

  // Periodic simulated live ticker tick for open calls
  useEffect(() => {
    const interval = setInterval(() => {
      setOpenCalls(prev => 
        prev.map(call => {
          const delta = (Math.random() - 0.48) * (call.entryPrice * 0.003);
          const newCmp = Number((call.cmp + delta).toFixed(2));
          return {
            ...call,
            cmp: newCmp
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Messenger send handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'Priya Sharma (HR Ops)',
      role: 'HR & Compliance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
      text: typedMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: activeChannel
    };

    setMessages(prev => [...prev, newMsg]);
    setTypedMessage('');
    showToast('Message sent to #' + activeChannel, 'success');
  };

  // Dispatch greeting
  const handleDispatchGreeting = (e: React.FormEvent) => {
    e.preventDefault();
    const newGrt: GreetingItem = {
      id: `grt-${Date.now()}`,
      recipientName: greetingForm.recipient,
      type: greetingForm.type,
      departmentOrRole: 'Team Member / Client',
      date: 'Just Now',
      status: 'Delivered',
      channel: greetingForm.channel,
      messagePreview: greetingForm.message
    };

    setGreetings(prev => [newGrt, ...prev]);
    setIsGreetingModalOpen(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    showToast(`Greeting dispatched successfully via ${greetingForm.channel}!`, 'success');
  };

  // Close / Square off an Open Call
  const handleSquareOffCall = (call: OpenCallTrade) => {
    const points = Number((call.cmp - call.entryPrice).toFixed(2));
    const retPct = Number(((points / call.entryPrice) * 100).toFixed(1));

    const newClosed: ClosedCallTrade = {
      id: `cc-${Date.now()}`,
      script: call.script,
      segment: call.segment,
      callType: call.callType,
      openTime: call.time,
      closeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      entryPrice: call.entryPrice,
      exitPrice: call.cmp,
      pnlPoints: points,
      returnPercent: retPct,
      exitReason: points >= 0 ? 'Target 1 Hit' : 'SL Hit',
      analyst: call.analyst
    };

    setOpenCalls(prev => prev.filter(c => c.id !== call.id));
    setClosedCalls(prev => [newClosed, ...prev]);
    if (points >= 0) {
      confetti({ particleCount: 50, spread: 45 });
    }
    showToast(`Squared off ${call.script} at ₹${call.cmp} (${points >= 0 ? '+' : ''}${points} pts)!`, points >= 0 ? 'success' : 'info');
  };

  return (
    <div className="crm-module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Subpage Breadcrumb Header Strip */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>/ Home</span>
          </span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#0284c7', fontWeight: 600, textTransform: 'capitalize' }}>
            {currentTab.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Regulatory Stamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
          <Shield size={14} color="#10b981" />
          <span>SEBI Compliance Archive (INH000012345)</span>
        </div>
      </div>

      {/* Module Navigation Tabs Strip (Matching Exact Names from Reference) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.4rem', 
        overflowX: 'auto', 
        background: '#ffffff', 
        padding: '0.5rem 0.75rem', 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <button 
          onClick={() => handleTabSelect('messenger')}
          className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
            currentTab === 'messenger' 
              ? 'bg-sky-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: currentTab === 'messenger' ? 600 : 500,
            background: currentTab === 'messenger' ? '#0284c7' : 'transparent',
            color: currentTab === 'messenger' ? '#ffffff' : '#475569',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <MessageSquare size={14} />
          <span>Messenger</span>
          <span style={{ 
            background: currentTab === 'messenger' ? '#0369a1' : '#e0f2fe', 
            color: currentTab === 'messenger' ? '#ffffff' : '#0284c7',
            padding: '1px 6px',
            borderRadius: '10px',
            fontSize: '0.7rem'
          }}>4</span>
        </button>

        <button 
          onClick={() => handleTabSelect('greeting')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: currentTab === 'greeting' ? 600 : 500,
            background: currentTab === 'greeting' ? '#0284c7' : 'transparent',
            color: currentTab === 'greeting' ? '#ffffff' : '#475569',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Gift size={14} />
          <span>Greeting</span>
          <span style={{ 
            background: currentTab === 'greeting' ? '#0369a1' : '#fef3c7', 
            color: currentTab === 'greeting' ? '#ffffff' : '#b45309',
            padding: '1px 6px',
            borderRadius: '10px',
            fontSize: '0.7rem'
          }}>2 Due</span>
        </button>

        <button 
          onClick={() => handleTabSelect('tip-archive')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: currentTab === 'tip-archive' ? 600 : 500,
            background: currentTab === 'tip-archive' ? '#0284c7' : 'transparent',
            color: currentTab === 'tip-archive' ? '#ffffff' : '#475569',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <FileText size={14} />
          <span>Tip Archive</span>
        </button>

        <button 
          onClick={() => handleTabSelect('pre-tip-archive')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: currentTab === 'pre-tip-archive' ? 600 : 500,
            background: currentTab === 'pre-tip-archive' ? '#0284c7' : 'transparent',
            color: currentTab === 'pre-tip-archive' ? '#ffffff' : '#475569',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Clock size={14} />
          <span>Pre Tip Archive</span>
        </button>

        <button 
          onClick={() => handleTabSelect('greeting-tip-archive')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: currentTab === 'greeting-tip-archive' ? 600 : 500,
            background: currentTab === 'greeting-tip-archive' ? '#0284c7' : 'transparent',
            color: currentTab === 'greeting-tip-archive' ? '#ffffff' : '#475569',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Sparkles size={14} />
          <span>Greenting tip Archive</span>
        </button>

        <button 
          onClick={() => handleTabSelect('open-call')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: currentTab === 'open-call' ? 600 : 500,
            background: currentTab === 'open-call' ? '#0284c7' : 'transparent',
            color: currentTab === 'open-call' ? '#ffffff' : '#475569',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
          <span>Open Call</span>
          <span style={{ 
            background: currentTab === 'open-call' ? '#0369a1' : '#ecfdf5', 
            color: currentTab === 'open-call' ? '#ffffff' : '#047857',
            padding: '1px 6px',
            borderRadius: '10px',
            fontSize: '0.7rem'
          }}>{openCalls.length}</span>
        </button>

        <button 
          onClick={() => handleTabSelect('closed-call')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: currentTab === 'closed-call' ? 600 : 500,
            background: currentTab === 'closed-call' ? '#0284c7' : 'transparent',
            color: currentTab === 'closed-call' ? '#ffffff' : '#475569',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <CheckCircle2 size={14} />
          <span>Closed Call</span>
          <span style={{ 
            background: currentTab === 'closed-call' ? '#0369a1' : '#f1f5f9', 
            color: currentTab === 'closed-call' ? '#ffffff' : '#64748b',
            padding: '1px 6px',
            borderRadius: '10px',
            fontSize: '0.7rem'
          }}>{closedCalls.length}</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. MESSENGER */}
      {currentTab === 'messenger' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '520px', overflow: 'hidden' }}>
          {/* Channels & Desk List */}
          <div style={{ borderRight: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Desk Channels
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                {[
                  { id: 'equity-research-desk', label: 'equity-research-desk', unread: 2 },
                  { id: 'compliance-alerts', label: 'compliance-alerts', unread: 1 },
                  { id: 'advisory-sales-floor', label: 'advisory-sales-floor', unread: 0 },
                  { id: 'all-staff-broadcast', label: 'all-staff-broadcast', unread: 0 }
                ].map(ch => (
                  <button 
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      background: activeChannel === ch.id ? '#e0f2fe' : 'transparent',
                      color: activeChannel === ch.id ? '#0369a1' : '#475569',
                      fontWeight: activeChannel === ch.id ? 600 : 400,
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Hash size={14} color={activeChannel === ch.id ? '#0284c7' : '#94a3b8'} />
                      <span>{ch.label}</span>
                    </span>
                    {ch.unread > 0 && (
                      <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '8px' }}>
                        {ch.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Direct Desks (Online)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                {[
                  { name: 'Rajesh Varma', role: 'VP Research', online: true },
                  { name: 'Rohan Deshmukh', role: 'Sales Head', online: true },
                  { name: 'Sneha Kapur', role: 'Derivatives', online: false }
                ].map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                        {u.name.charAt(0)}
                      </div>
                      <span style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        background: u.online ? '#10b981' : '#94a3b8',
                        border: '1.5px solid #fff' 
                      }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Messages & Input */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={18} color="#0284c7" />
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{activeChannel}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                  Audited Channel
                </span>
              </div>
              <button 
                onClick={() => showToast('Broadcast notification dispatched to all registered terminal sessions.', 'info')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Zap size={13} color="#f59e0b" />
                <span>Broadcast Alert</span>
              </button>
            </div>

            {/* Message Stream */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map(m => (
                <div key={m.id} style={{ 
                  display: 'flex', 
                  gap: '0.75rem',
                  background: m.isComplianceNotice ? '#fef2f2' : 'transparent',
                  padding: m.isComplianceNotice ? '0.75rem' : '0.25rem',
                  borderRadius: '8px',
                  border: m.isComplianceNotice ? '1px solid #fecaca' : 'none'
                }}>
                  <img src={m.avatar} alt={m.sender} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{m.sender}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>{m.role}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{m.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', background: '#ffffff' }}>
              <input 
                type="text"
                placeholder={`Message #${activeChannel}...`}
                value={typedMessage}
                onChange={e => setTypedMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Send size={14} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. GREETING */}
      {currentTab === 'greeting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Greeting KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Birthdays This Week</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>1 Staff Member</div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '0.2rem' }}>Sneha Kapur (Today)</div>
            </div>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Work Anniversaries</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>2 Milestones</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.2rem' }}>Karan M. (2 Yrs), Rajesh V. (3 Yrs)</div>
            </div>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Festival Campaign</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>Diwali 2026</div>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.2rem' }}>850 HNI Clients Queued</div>
            </div>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <button 
                onClick={() => setIsGreetingModalOpen(true)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Plus size={16} />
                <span>Dispatch New Greeting</span>
              </button>
            </div>
          </div>

          {/* Table of Scheduled & Sent Greetings */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Scheduled & Sent Greetings Ledger</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Automated via WhatsApp Business API & Stocketics SMS Gateway</span>
            </div>

            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 1rem' }}>Recipient</th>
                  <th style={{ padding: '0.6rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.6rem 1rem' }}>Scheduled / Sent Date</th>
                  <th style={{ padding: '0.6rem 1rem' }}>Channel</th>
                  <th style={{ padding: '0.6rem 1rem' }}>Message Copy</th>
                  <th style={{ padding: '0.6rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {greetings.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                      {g.recipientName}
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>{g.departmentOrRole}</div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ 
                        background: g.type === 'Birthday' ? '#fef3c7' : g.type === 'Festival' ? '#ede9fe' : '#e0f2fe',
                        color: g.type === 'Birthday' ? '#b45309' : g.type === 'Festival' ? '#6d28d9' : '#0369a1',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {g.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', color: '#475569' }}>{g.date}</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {g.channel === 'WhatsApp' && <MessageSquare size={13} color="#10b981" />}
                        {g.channel === 'Email' && <Mail size={13} color="#0284c7" />}
                        {g.channel === 'SMS' && <PhoneCall size={13} color="#6366f1" />}
                        <span>{g.channel}</span>
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', color: '#334155', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.messagePreview}
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ 
                        background: g.status === 'Delivered' ? '#dcfce7' : '#fef9c3',
                        color: g.status === 'Delivered' ? '#15803d' : '#854d0e',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {g.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => showToast(`Resent greeting to ${g.recipientName} via ${g.channel}`, 'success')}
                        style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Resend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. TIP ARCHIVE */}
      {currentTab === 'tip-archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  placeholder="Search Script (e.g. NIFTY, TATASTEEL)..."
                  value={tipSearch}
                  onChange={e => setTipSearch(e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    width: '260px',
                    outline: 'none'
                  }}
                />
              </div>

              <select 
                value={segmentFilter}
                onChange={e => setSegmentFilter(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
              >
                <option value="All">All Segments</option>
                <option value="Options">Index & Stock Options</option>
                <option value="Futures">Futures</option>
                <option value="Cash / Delivery">Cash / Delivery</option>
              </select>
            </div>

            <button 
              onClick={() => showToast('SEBI Tip Compliance Audit Report downloaded (PDF/CSV format).', 'success')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span>Export Compliance Audit</span>
            </button>
          </div>

          {/* Tip Archive Table */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 1rem' }}>Script / Instrument</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Call</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Entry (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Target 1 / 2 (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Stop Loss (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Exit (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>P&L Points</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Research Analyst</th>
                </tr>
              </thead>
              <tbody>
                {tips
                  .filter(t => segmentFilter === 'All' || t.segment === segmentFilter)
                  .filter(t => !tipSearch || t.script.toLowerCase().includes(tipSearch.toLowerCase()))
                  .map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.script}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{t.segment} • {t.recommendedAt}</div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          background: t.callType === 'BUY' ? '#dcfce7' : '#fee2e2',
                          color: t.callType === 'BUY' ? '#15803d' : '#b91c1c',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}>
                          {t.callType}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#1e293b' }}>₹{t.entryPrice}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#10b981', fontWeight: 600 }}>₹{t.target1} / ₹{t.target2}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#ef4444', fontWeight: 600 }}>₹{t.stopLoss}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#0f172a' }}>₹{t.achievedPrice}</td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          color: (t.pnlPoints || 0) >= 0 ? '#10b981' : '#ef4444',
                          fontWeight: 700
                        }}>
                          {(t.pnlPoints || 0) >= 0 ? `+${t.pnlPoints} pts` : `${t.pnlPoints} pts`}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {(t.returnPercent || 0) >= 0 ? `+${t.returnPercent}%` : `${t.returnPercent}%`}
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          background: t.status.includes('Hit') && !t.status.includes('Stop') ? '#dcfce7' : '#fee2e2',
                          color: t.status.includes('Hit') && !t.status.includes('Stop') ? '#15803d' : '#b91c1c',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{t.analyst}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t.sebiReg}</div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. PRE TIP ARCHIVE */}
      {currentTab === 'pre-tip-archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Pre-Market Summary Banner */}
          <div style={{ background: '#ffffff', color: '#161e47', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Clock size={16} color="#0073b7" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0073b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pre-Market Bell Research Vault (08:30 AM - 09:15 AM)
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#161e47' }}>Nifty & Bank Nifty Opening Strategy Archives</h3>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#64748b', maxWidth: '650px' }}>
                Audited morning outlooks sent to subscribers prior to NSE market opening. Includes overnight global cues, pivot levels, and opening range breakout setups.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Morning Pivot Levels</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>Pivot: 24,780</div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>S1: 24,650 • R1: 24,920</div>
            </div>
          </div>

          {/* Pre-Tips Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              {
                date: '07-Sep-2026 (08:45 AM)',
                script: 'NIFTY INDEX OPENING BREAKOUT',
                sentiment: 'Bullish Gap-Up',
                view: 'Overnight US Tech rally and GIFT Nifty pointing to +90 pts open. Plan: Wait for 5-minute candle close above 24,800. Target 24,920 with stop below 24,730.',
                analyst: 'Rajesh Varma (VP Research)',
                outcome: 'Target Achieved at 10:15 AM (+92 Nifty Pts)'
              },
              {
                date: '06-Sep-2026 (08:50 AM)',
                script: 'BANKNIFTY EXPIRED VOLATILITY SETUP',
                sentiment: 'Range-bound & Straddle',
                view: 'Heavy Put writing at 51,000 and Call writing at 51,500. Expected morning range 51,100 - 51,450. Ideal for morning theta capture.',
                analyst: 'Sneha Kapur (Derivatives)',
                outcome: 'Expiry closed at 51,320 (Full Premium Decay Captured)'
              }
            ].map((p, idx) => (
              <div key={idx} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.date}</span>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' }}>
                    {p.sentiment}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{p.script}</div>
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                  {p.view}
                </p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: '#64748b' }}>Analyst: <strong style={{ color: '#0f172a' }}>{p.analyst}</strong></span>
                  <span style={{ color: '#15803d', fontWeight: 600 }}>{p.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. GREETING TIP ARCHIVE */}
      {currentTab === 'greeting-tip-archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#ffffff', color: '#161e47', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Sparkles size={16} color="#d97706" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Festive & Special Occasion Wealth Picks
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#161e47' }}>Greeting Tip Archive (Samvat / New Year / Special Baskets)</h3>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#64748b', maxWidth: '650px' }}>
                Curated long-term alpha research baskets shared with clients during celebratory market sessions (Diwali Muhurat Trading & New Year Special Wealth Reports).
              </p>
            </div>
            <button 
              onClick={() => showToast('Full Diwali Muhurat Research Dossier downloaded.', 'success')}
              style={{
                background: '#0073b7',
                color: '#ffffff',
                fontWeight: 700,
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Download Muhurat Report
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              {
                campaign: 'Diwali Muhurat Trading 2026',
                basketName: 'Samvat 2082 Alpha Giants',
                stocks: 'TRENT, BEL, L&T, TITAN, POLYCAB',
                horizon: '12 - 18 Months',
                targetReturn: '+32.0%',
                currentPnl: '+18.4% (Outperforming Nifty by 9.2%)'
              },
              {
                campaign: 'New Year 2026 Special',
                basketName: 'Mid-Cap High Beta Rockets',
                stocks: 'DIXON, KAYNES, PERSISTENT, COFORGE',
                horizon: '12 Months',
                targetReturn: '+40.0%',
                currentPnl: '+24.1% (On Target)'
              },
              {
                campaign: 'Union Budget 2026 Picks',
                basketName: 'Infra & Capex Champions',
                stocks: 'IRFC, RVNL, CONCOR, NTPC',
                horizon: '24 Months',
                targetReturn: '+45.0%',
                currentPnl: '+14.8%'
              }
            ].map((b, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' }}>{b.campaign}</span>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{b.basketName}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                  <strong>Key Stocks:</strong> {b.stocks}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>Holding: {b.horizon}</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>Target: {b.targetReturn}</span>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                  Current Status: {b.currentPnl}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. OPEN CALL */}
      {currentTab === 'open-call' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header Strip with Live Pulse */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Live Market Open Positions</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({openCalls.length} Active Recommendations)</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Live CMP ticks simulated with sub-second order book updates
            </div>
          </div>

          {/* Open Calls Table */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 1rem' }}>Instrument</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Entry (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Live CMP (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Unrealized P&L</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Targets (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Stop Loss / Trailing</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Live Status</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {openCalls.map(c => {
                  const pnlPoints = Number((c.cmp - c.entryPrice).toFixed(2));
                  const isProfit = pnlPoints >= 0;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.script}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.segment} • {c.time}</div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          background: c.callType === 'BUY' ? '#dcfce7' : '#fee2e2',
                          color: c.callType === 'BUY' ? '#15803d' : '#b91c1c',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}>
                          {c.callType}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#1e293b' }}>₹{c.entryPrice}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: isProfit ? '#15803d' : '#b91c1c', fontSize: '0.88rem' }}>
                        ₹{c.cmp}
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ color: isProfit ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                          {isProfit ? `+${pnlPoints} pts` : `${pnlPoints} pts`}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {((pnlPoints / c.entryPrice) * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#10b981', fontWeight: 600 }}>₹{c.target1} / ₹{c.target2}</td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ color: '#ef4444', fontWeight: 600 }}>SL: ₹{c.stopLoss}</div>
                        <div style={{ color: '#0284c7', fontSize: '0.72rem' }}>Trail: ₹{c.trailingSL}</div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          background: isProfit ? '#ecfdf5' : '#fef2f2',
                          color: isProfit ? '#047857' : '#991b1b',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}>
                          {c.statusText}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => showToast(`Trailing stop-loss for ${c.script} tightened to ₹${(c.cmp - 5).toFixed(1)}`, 'info')}
                            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, color: '#0369a1', cursor: 'pointer' }}
                          >
                            Trail SL
                          </button>
                          <button 
                            onClick={() => handleSquareOffCall(c)}
                            style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Square Off
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. CLOSED CALL */}
      {currentTab === 'closed-call' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Closed Call Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Closed Trades</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>58 Calls</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>This Month</div>
            </div>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Win / Hit Rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>81.0%</div>
              <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '0.2rem' }}>47 Target Hits, 11 SL Hits</div>
            </div>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Cumulative Net Points</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0284c7', marginTop: '0.2rem' }}>+3,840 pts</div>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '0.2rem' }}>Advisory P&L Gain</div>
            </div>
            <div className="crm-card" style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Avg Holding Time</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>2.4 Hours</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>Intraday momentum</div>
            </div>
          </div>

          {/* Closed Calls Ledger Table */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 1rem' }}>Instrument</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Trade Duration</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Entry (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Exit Price (₹)</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Net P&L Points</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Return %</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Exit Reason</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Lead Analyst</th>
                </tr>
              </thead>
              <tbody>
                {closedCalls.map(c => {
                  const isProfit = c.pnlPoints >= 0;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.script}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.segment}</div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          background: c.callType === 'BUY' ? '#dcfce7' : '#fee2e2',
                          color: c.callType === 'BUY' ? '#15803d' : '#b91c1c',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}>
                          {c.callType}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#475569' }}>
                        <div>{c.openTime}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Closed: {c.closeTime}</div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#1e293b' }}>₹{c.entryPrice}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#0f172a' }}>₹{c.exitPrice}</td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ color: isProfit ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                          {isProfit ? `+${c.pnlPoints} pts` : `${c.pnlPoints} pts`}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          background: isProfit ? '#dcfce7' : '#fee2e2',
                          color: isProfit ? '#15803d' : '#b91c1c',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}>
                          {isProfit ? `+${c.returnPercent}%` : `${c.returnPercent}%`}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ 
                          background: c.exitReason.includes('Hit') && !c.exitReason.includes('SL') ? '#ecfdf5' : '#fef2f2',
                          color: c.exitReason.includes('Hit') && !c.exitReason.includes('SL') ? '#047857' : '#991b1b',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}>
                          {c.exitReason}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#334155', fontWeight: 600 }}>{c.analyst}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH GREETING MODAL */}
      {isGreetingModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark ? 'rgba(10, 17, 40, 0.78)' : 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gift size={18} color="#0284c7" />
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Dispatch Corporate Greeting</span>
              </div>
              <button onClick={() => setIsGreetingModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchGreeting} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Recipient Name</label>
                <input 
                  type="text"
                  required
                  value={greetingForm.recipient}
                  onChange={e => setGreetingForm({ ...greetingForm, recipient: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Greeting Category</label>
                  <select 
                    value={greetingForm.type}
                    onChange={e => setGreetingForm({ ...greetingForm, type: e.target.value as GreetingItem['type'] })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Birthday">Birthday Wishes</option>
                    <option value="Work Anniversary">Work Anniversary</option>
                    <option value="Festival">Festival Wishes</option>
                    <option value="Client Welcome">Client Welcome</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Dispatch Channel</label>
                  <select 
                    value={greetingForm.channel}
                    onChange={e => setGreetingForm({ ...greetingForm, channel: e.target.value as GreetingItem['channel'] })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="WhatsApp">WhatsApp Business API</option>
                    <option value="Email">Email Newsletter</option>
                    <option value="SMS">Corporate SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Greeting Message Body</label>
                <textarea 
                  rows={3}
                  value={greetingForm.message}
                  onChange={e => setGreetingForm({ ...greetingForm, message: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsGreetingModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Dispatch Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
