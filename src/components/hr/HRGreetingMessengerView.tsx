import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Send, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Gift, 
  Users, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TipsModal } from '../common/TipsModal';

interface ServiceItem {
  id: string;
  name: string;
  count: number;
}

const GREETING_SERVICES: ServiceItem[] = [
  { id: 'gs-1', name: 'INDEX OPTION', count: 280 },
  { id: 'gs-2', name: 'NIFTY OPTION HNI', count: 145 },
  { id: 'gs-3', name: 'BANK NIFTY PRO', count: 190 },
  { id: 'gs-4', name: 'STOCK OPTION ALPHA', count: 110 },
  { id: 'gs-5', name: 'EQUITY CASH MOMENTUM', count: 220 },
  { id: 'gs-6', name: 'MCX BULLION SPECIAL', count: 85 },
  { id: 'gs-7', name: 'COMMODITY ENERGY PACK', count: 75 },
  { id: 'gs-8', name: 'LONG TERM WEALTH ADVISORY', count: 310 },
  { id: 'gs-9', name: 'MARKET PATHSHALA', count: 160 }
];

const TEMPLATES: Record<string, string> = {
  'birthday': 'Wishing you a very Happy Birthday! May the upcoming year bring you exceptional joy, good health, and prosperous investments. - Team Apex Edge Research',
  'anniversary': 'Warmest congratulations on your Work Anniversary! We deeply appreciate your commitment and valuable contributions to the organization. - HR Desk, Apex Edge Research',
  'festival': 'Wishing you and your family a very happy and prosperous festival! May this festive season illuminate your life with abundance and peace. - Apex Edge Research',
  'welcome': 'Welcome to Apex Edge Research! We are delighted to partner with you on your financial journey. Your dedicated wealth manager will assist you shortly.',
  'market-opening': 'Good morning! Pre-market updates and key resistance/support levels have been published to your client app. Have a profitable trading session.'
};

export const HRGreetingMessengerView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Form states matching Image 5
  const [sendViaMobile, setSendViaMobile] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(true);
  const [selectedPrefix, setSelectedPrefix] = useState('Dear');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('birthday');
  const [clientTier, setClientTier] = useState<'All' | 'Paid'>('Paid');
  const [greetingText, setGreetingText] = useState(TEMPLATES['birthday']);

  // Right column services selection
  const [selectedServices, setSelectedServices] = useState<string[]>(['gs-1', 'gs-2', 'gs-3', 'gs-8']);

  const isAllChecked = selectedServices.length === GREETING_SERVICES.length;

  const handleToggleCheckAll = () => {
    if (isAllChecked) {
      setSelectedServices([]);
    } else {
      setSelectedServices(GREETING_SERVICES.map(s => s.id));
    }
  };

  const handleToggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleTemplateChange = (key: string) => {
    setSelectedTemplateKey(key);
    if (TEMPLATES[key]) {
      setGreetingText(TEMPLATES[key]);
    }
  };

  const totalClients = GREETING_SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.count, 0);

  const handleSend = () => {
    if (!greetingText.trim()) {
      showToast('Please type a greeting message', 'error');
      return;
    }
    if (selectedServices.length === 0) {
      showToast('Please select at least one service category', 'error');
      return;
    }

    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.6 }
    });

    const channels = [];
    if (sendViaMobile) channels.push('SMS');
    if (sendViaWhatsapp) channels.push('WhatsApp');

    showToast(`Greeting dispatched via ${channels.join(' & ')} to ${totalClients} clients!`, 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb & Tips Strip (Matching Reference Image 5) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Messenger</span>
          </span>
        </div>
      </div>

      {/* Header & Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title-ref" style={{ margin: 0 }}>Greeting Messenger</h1>

        <button 
          className="btn btn-primary"
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            background: '#00a8ff', 
            borderColor: '#00a8ff', 
            color: '#ffffff', 
            fontWeight: 600, 
            padding: '0.45rem 1.25rem', 
            borderRadius: '4px',
            fontSize: '0.88rem'
          }}
        >
          &lt;&lt; Back
        </button>
      </div>

      {/* Main Container */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '6px', 
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        padding: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
          {/* Left Column: Greeting Messenger */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.2rem' }}>
              Greeting Messenger
            </h2>

            {/* Checkboxes: Mobile & Whatsapp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                <input 
                  type="checkbox"
                  checked={sendViaMobile}
                  onChange={(e) => setSendViaMobile(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Mobile</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                <input 
                  type="checkbox"
                  checked={sendViaWhatsapp}
                  onChange={(e) => setSendViaWhatsapp(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Whatsapp</span>
              </label>
            </div>

            {/* Prefix & Template Dropdowns + Radio Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {/* Select Prefix */}
              <select 
                className="input-field"
                value={selectedPrefix}
                onChange={(e) => setSelectedPrefix(e.target.value)}
                style={{ width: '150px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              >
                <option value="Select Prefix">Select Prefix</option>
                <option value="Dear">Dear</option>
                <option value="Respected">Respected</option>
                <option value="Hello">Hello</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Greetings">Greetings</option>
              </select>

              {/* Select Template */}
              <select 
                className="input-field"
                value={selectedTemplateKey}
                onChange={(e) => handleTemplateChange(e.target.value)}
                style={{ width: '180px', height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              >
                <option value="">Select Template</option>
                <option value="birthday">Birthday Greeting</option>
                <option value="anniversary">Work Anniversary</option>
                <option value="festival">Festival Wishes</option>
                <option value="welcome">Welcome Onboard</option>
                <option value="market-opening">Market Opening Call</option>
              </select>

              {/* Radio: All vs Paid */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="radio" 
                    name="clientTier"
                    checked={clientTier === 'All'}
                    onChange={() => setClientTier('All')}
                  />
                  <span>All</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="radio" 
                    name="clientTier"
                    checked={clientTier === 'Paid'}
                    onChange={() => setClientTier('Paid')}
                  />
                  <span>Paid</span>
                </label>
              </div>
            </div>

            {/* Textarea Box Matching Image 5 */}
            <div style={{ marginBottom: '0.75rem' }}>
              <textarea 
                rows={7}
                value={greetingText}
                onChange={(e) => setGreetingText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your greeting message or select a template above..."
                className="input-field"
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  borderRadius: '4px', 
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  lineHeight: '1.5',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Footer with Shortcut & Send Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <div>Shift + Enter to Send</div>
                <div>(Character - {greetingText.length})</div>
              </div>

              <button 
                type="button"
                onClick={handleSend}
                className="btn btn-primary"
                style={{ 
                  background: '#00a8ff', 
                  borderColor: '#00a8ff', 
                  color: '#ffffff', 
                  padding: '0.5rem 1.8rem', 
                  fontWeight: 700,
                  borderRadius: '4px',
                  fontSize: '0.92rem'
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Right Column: Select Services Matching Image 5 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.2rem' }}>
              Select Services
            </h2>

            {/* Dark Navy Header with Check All */}
            <div 
              onClick={handleToggleCheckAll}
              style={{ 
                background: '#051d33', 
                color: '#ffffff', 
                padding: '0.65rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input 
                  type="checkbox" 
                  checked={isAllChecked}
                  onChange={handleToggleCheckAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                  Check All
                </span>
              </div>

              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {selectedServices.length} of {GREETING_SERVICES.length} selected
              </span>
            </div>

            {/* Service Checkbox List */}
            <div style={{ 
              border: '1px solid var(--border-subtle)', 
              borderTop: 'none', 
              borderRadius: '0 0 4px 4px', 
              maxHeight: '340px', 
              overflowY: 'auto',
              background: '#fafafa'
            }}>
              {GREETING_SERVICES.map((srv, idx) => {
                const isChecked = selectedServices.includes(srv.id);
                return (
                  <div 
                    key={srv.id}
                    onClick={() => handleToggleService(srv.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.65rem 1rem', 
                      borderBottom: idx === GREETING_SERVICES.length - 1 ? 'none' : '1px solid #f1f5f9',
                      background: isChecked ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleService(srv.id)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                        {srv.name}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {srv.count} recipients
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
