import React from 'react';
import { X, Lightbulb, Zap, ShieldCheck, PhoneCall, RefreshCw } from 'lucide-react';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="tips-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tips-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="tip-icon-wrap" style={{ width: '32px', height: '32px' }}>
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Operational Tips & CRM Guidelines
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Best practices for Stocketics CRM users, sales desks & management
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '6px' }}
            aria-label="Close tips modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="tips-modal-body">
          <div className="tip-item-card">
            <div className="tip-icon-wrap" style={{ background: 'linear-gradient(135deg, #0088ea 0%, #0070c0 100%)' }}>
              <PhoneCall size={20} />
            </div>
            <div className="tip-content-wrap">
              <h4>Lead Follow-up Velocity</h4>
              <p>
                Prospects contacted within 15 minutes of status change show a <strong>64% higher conversion rate</strong> into advisory clients. Review your "Today's Followup" list each morning.
              </p>
            </div>
          </div>

          <div className="tip-item-card">
            <div className="tip-icon-wrap" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <ShieldCheck size={20} />
            </div>
            <div className="tip-content-wrap">
              <h4>SEBI Advisory Compliance</h4>
              <p>
                Ensure every advisory trade recommendation is matched with an active SEBI compliance risk questionnaire. Check the <strong>SEBI Compliance Vault</strong> tab before confirming payments.
              </p>
            </div>
          </div>

          <div className="tip-item-card">
            <div className="tip-icon-wrap" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <RefreshCw size={20} />
            </div>
            <div className="tip-content-wrap">
              <h4>Disposed Leads Re-engagement</h4>
              <p>
                Disposed leads older than 30 days are automatically recycled back into the "Available Leads" pool for re-qualification campaigns.
              </p>
            </div>
          </div>

          <div className="tip-item-card">
            <div className="tip-icon-wrap" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Zap size={20} />
            </div>
            <div className="tip-content-wrap">
              <h4>Power Shortcuts</h4>
              <p>
                Use <kbd className="kbd-shortcut">Ctrl+K</kbd> to quickly search leads and commands, and <kbd className="kbd-shortcut">Ctrl+B</kbd> to collapse or expand the navigation sidebar.
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-surface-alt)' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
