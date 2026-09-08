import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2, 
  Copy, 
  BookOpen, 
  Heart, 
  Bell, 
  LogOut, 
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. User Profile Modal
export const UserProfileModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, role, showToast } = useApp();

  if (!isOpen) return null;

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Staff Profile & Credentials</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stocketics Employee Identity Card • SEBI Licensed Personnel</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-surface-alt)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }} 
              />
              <span style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#10b981', border: '2px solid #fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentUser.name}</h4>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  {role.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {currentUser.title} • {currentUser.department}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Employee ID: <strong style={{ color: 'var(--text-primary)' }}>STK-{currentUser.id.toUpperCase()}</strong> • Status: <strong style={{ color: '#15803d' }}>Active</strong>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.2rem' }}>Official Email</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.email}</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.2rem' }}>Contact Phone</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.phone}</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.2rem' }}>Base Office Location</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bangalore Tech Center HQ</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.2rem' }}>Date of Joining</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.joinDate}</div>
            </div>
          </div>

          {/* SEBI Compliance & Certifications */}
          <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontWeight: 700, fontSize: '0.82rem' }}>
              <ShieldCheck size={16} />
              <span>SEBI Research & Advisory Certifications</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.35rem', lineHeight: 1.4 }}>
              • NISM Series XV: Research Analyst Certification (Valid till Dec 2028)<br />
              • NISM Series VIII: Equity Derivatives Trading Representative
            </div>
          </div>

          {/* Leave Quota Snapshot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-surface-alt)', borderRadius: '6px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PTO Available</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>{currentUser.leaveBalance.paid} Days</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sick Leave</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{currentUser.leaveBalance.sick} Days</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compensatory Off</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{currentUser.leaveBalance.comp} Days</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                showToast('Digital Employee Identity Card downloaded in PDF format.', 'success');
              }}
            >
              <Download size={14} /> Download Digital ID
            </button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. HR Policy Modal
export const HRPolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [activeDoc, setActiveDoc] = useState('conduct');

  if (!isOpen) return null;

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
              <BookOpen size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Stocketics HR Policy & Handbook</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Workplace Rules, Compliance Codes, and Service Guidelines</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Policy Picker Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
            {[
              { id: 'conduct', label: 'SEBI Code of Conduct' },
              { id: 'attendance', label: 'Attendance & Working Hours' },
              { id: 'leave', label: 'Leave & PTO Entitlement' },
              { id: 'insider', label: 'Anti-Insider Trading' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDoc(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: activeDoc === tab.id ? 700 : 500,
                  background: activeDoc === tab.id ? '#0284c7' : 'transparent',
                  color: activeDoc === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Policy Text Body */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '0.85rem', background: 'var(--bg-surface-alt)', borderRadius: '8px', fontSize: '0.83rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
            {activeDoc === 'conduct' && (
              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#0284c7' }}>SEBI Research Analyst Code of Conduct 2026</h5>
                <p>1. All stock recommendations published to clients must have an underlying written research rationale logged in the Stocketics Compliance Vault.</p>
                <p>2. Analysts and sales advisors are strictly barred from sharing recommendations on unapproved personal messaging channels (e.g. personal Telegram, WhatsApp).</p>
                <p>3. Stop-loss levels and risk disclosures are mandatory on 100% of published calls. Guaranteed returns or profit-sharing promises are unlawful.</p>
              </div>
            )}

            {activeDoc === 'attendance' && (
              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#0284c7' }}>Attendance & Trading Desk Working Hours</h5>
                <p>1. General market hours shift runs from 08:30 AM to 05:30 PM (Monday to Friday). Morning pre-bell briefing begins promptly at 08:45 AM.</p>
                <p>2. Biometric punch or CRM IP check-in is mandatory before 09:05 AM. Late punch marks beyond 09:15 AM incur statutory penalty after 3 occurrences per month.</p>
                <p>3. Desk coverage must be maintained continuously during market hours (09:15 AM to 03:30 PM).</p>
              </div>
            )}

            {activeDoc === 'leave' && (
              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#0284c7' }}>Leave, Holidays & Time-Off Rules</h5>
                <p>1. Full-time permanent personnel receive 18 days Paid Time Off (PTO), 10 days Sick Leave, and 12 public festival holidays per calendar year.</p>
                <p>2. Planned leaves exceeding 2 days must be applied through the CRM portal at least 5 business days in advance with handover coverage assigned.</p>
                <p>3. Unutilized PTO up to 10 days can be encashed or carried forward into the subsequent calendar year.</p>
              </div>
            )}

            {activeDoc === 'insider' && (
              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#0284c7' }}>Prevention of Insider Trading & Personal Trading</h5>
                <p>1. Employees must pre-clear any personal equity or derivative trade in their personal Demat account with the Chief Compliance Officer.</p>
                <p>2. Minimum holding period of 30 days applies to personal equity investments to prevent front-running client trade calls.</p>
                <p>3. Personal Demat statements must be submitted quarterly for regulatory audit compliance.</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last revised: August 2026 • Policy Version 4.2</span>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => showToast('Full Stocketics HR Policy Handbook PDF downloaded.', 'success')}
            >
              <Download size={14} /> Download Policy PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Training Script Modal
export const TrainingScriptModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [activeScript, setActiveScript] = useState('options');

  if (!isOpen) return null;

  const scripts: Record<string, { title: string; audience: string; text: string }> = {
    options: {
      title: 'HNI Options Strategy Pitch (Index Derivatives)',
      audience: 'HNI Active Day Traders & High Alpha Seekers',
      text: `"Hello [ClientName], this is [AdvisorName] from Stocketics Research Desk. I am calling regarding your recent query on Bank Nifty weekly option strategies.\n\nAt Stocketics, our derivative desk operates strictly under SEBI registered algorithms. Unlike retail tips, we provide precise strike prices, predefined stop losses of maximum 25-30 points, and 1:2 risk-to-reward ratios.\n\nOur client retention rate this quarter has been 84.2%. Would you like to review our live verified track sheet for the past 3 months on your WhatsApp?"`
    },
    objection: {
      title: 'Handling Market Volatility & Stop Loss Objections',
      audience: 'Cautious or Hesitant Prospects',
      text: `"I completely appreciate your concern about volatility, Mr. [ClientName]. Market volatility is actually where derivative strategies capture maximum alpha.\n\nOur strict rule at Stocketics is risk discipline: if a trade invalidates our technical setup, our research analyst triggers a stop loss immediately to safeguard your 95% capital, preserving liquidity for the next high-probability setup.\n\nCapital preservation is our first mandate before profit generation."`
    },
    onboarding: {
      title: 'Client Onboarding & KYC Documentation Walkthrough',
      audience: 'Converted Paying Clients',
      text: `"Congratulations [ClientName] on choosing Stocketics Premium Advisory!\n\nTo ensure 100% regulatory compliance, I have dispatched your digital agreement and SEBI Risk Suitability Form to your registered email. Once you e-sign via Aadhaar OTP, your dedicated analyst desk will begin broadcasting live trades directly to your terminal within 15 minutes."`
    },
    renewal: {
      title: 'Subscription Renewal & Service Extension Pitch',
      audience: 'Expiring Subscribers (within 7 days)',
      text: `"Good morning [ClientName]. I see that your Equity Premier subscription is expiring on [ExpiryDate].\n\nOver your active tenure, our desk has generated +18.4% net returns across your portfolio. Under our annual renewal concession, renewing this week entitles you to a flat 15% discount plus 2 months of complimentary Commodity desk coverage. Shall I issue your renewal payment invoice today?"`
    }
  };

  const current = scripts[activeScript] || scripts.options;

  const handleCopyScript = () => {
    navigator.clipboard?.writeText(current.text);
    confetti({ particleCount: 35, spread: 40 });
    showToast('Training pitch script copied to clipboard!', 'success');
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Sales & Advisory Training Scripts</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Objection Handling, High-Impact Pitches & Onboarding Flows</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
            {[
              { id: 'options', label: 'Options Strategy Pitch' },
              { id: 'objection', label: 'Objection Handling' },
              { id: 'onboarding', label: 'Onboarding Flow' },
              { id: 'renewal', label: 'Renewal Pitch' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveScript(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: activeScript === tab.id ? 700 : 500,
                  background: activeScript === tab.id ? '#10b981' : 'transparent',
                  color: activeScript === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{current.title}</h5>
              <span style={{ fontSize: '0.72rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                Target: {current.audience}
              </span>
            </div>

            <div style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem', maxHeight: '220px', overflowY: 'auto' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--text-primary)', margin: 0 }}>
                {current.text}
              </pre>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleCopyScript}
            >
              <Copy size={14} /> Copy Script
            </button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. My Company Modal
export const MyCompanyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
              <Heart size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>My Company • Stocketics</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate Vision, Leadership & National Presence</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #0284c7 0%, #051d33 100%)', borderRadius: '8px', color: '#ffffff' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontWeight: 700 }}>
              STOCKETICS RESEARCH & ADVISORY PVT. LTD.
            </div>
            <h4 style={{ margin: '0.35rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Empowering Investors with Data-Driven Alpha</h4>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              SEBI Registered Research Analyst • Registration No. <strong>INH000012345</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>FOUNDED</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>2018 (8 Years of Excellence)</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUBSCRIBERS SERVED</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>14,500+ Across 28 States</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>HEADQUARTERS</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>Outer Ring Road, Bangalore</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>REGIONAL OFFICES</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>Mumbai BKC & Delhi NCR</div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Executive Leadership</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.4rem' }}>
              <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>Rajesh Varma</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>VP Equity Research</div>
              </div>
              <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>Rohan Deshmukh</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>VP Advisory Sales</div>
              </div>
              <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>Priya Sharma</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Head of People Ops</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Check Notification Modal
export const CheckNotificationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, showToast } = useApp();

  if (!isOpen) return null;

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>CRM Notifications</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time alerts, lead assignments, and system notices</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{notifications.length} Total Alerts</span>
            <button 
              onClick={() => {
                notifications.forEach(n => markNotificationRead(n.id));
                showToast('All notifications marked as read.', 'success');
              }}
              style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Mark All as Read
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markNotificationRead(n.id)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: n.read ? '#f8fafc' : '#e0f2fe',
                  border: `1px solid ${n.read ? '#e2e8f0' : '#bae6fd'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.6rem'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : '#0284c7', marginTop: '5px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>{n.title}</div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '0.2rem' }}>{n.message}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Logout Confirmation Modal
export const LogoutConfirmModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { showToast, logout } = useApp();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: '#fee2e2', color: '#dc2626' }}>
              <LogOut size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Logout Session</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stocketics Secure CRM Logout</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Are you sure you want to log out of the CRM? All active calls and research drafts will be safely stored.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Stay Logged In
            </button>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
              onClick={handleConfirmLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
