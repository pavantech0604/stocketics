import React from 'react';
import './KYCStepper.css';
import { KYCCase } from '../../types';
import {
  FileQuestion,
  Send,
  Upload,
  FileEdit,
  Clock,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRight
} from 'lucide-react';

const STEPS: { key: string; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'Not Started', label: 'Not Started', icon: <FileQuestion size={16} />, color: '#94a3b8' },
  { key: 'Documents Requested', label: 'Requested', icon: <Send size={16} />, color: '#3b82f6' },
  { key: 'Awaiting Documents', label: 'Awaiting', icon: <Clock size={16} />, color: '#f59e0b' },
  { key: 'Draft', label: 'Draft', icon: <FileEdit size={16} />, color: '#8b5cf6' },
  { key: 'Pending Approval', label: 'Pending', icon: <Clock size={16} />, color: '#f97316' },
  { key: 'In Review', label: 'In Review', icon: <Eye size={16} />, color: '#0ea5e9' },
  { key: 'Approved', label: 'Approved', icon: <CheckCircle2 size={16} />, color: '#10b981' },
];

const TERMINAL_STEPS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'Needs Reupload': { label: 'Reupload Required', icon: <RefreshCw size={16} />, color: '#ef4444' },
  'Rejected': { label: 'Rejected', icon: <XCircle size={16} />, color: '#ef4444' },
  'Withdrawn': { label: 'Withdrawn', icon: <Ban size={16} />, color: '#6b7280' },
};

interface KYCStepperProps {
  kycCase?: KYCCase | null | undefined;
  currentStatus?: string;
  status?: string;
  compact?: boolean;
}

export const KYCStepper: React.FC<KYCStepperProps> = ({ kycCase, currentStatus: propStatus, status, compact = false }) => {
  const activeStatus = propStatus || status || kycCase?.status;

  if (!activeStatus && !kycCase) {
    return (
      <div className="kyc-stepper kyc-stepper-empty">
        <div className="kyc-stepper-placeholder">
          <FileQuestion size={compact ? 16 : 20} style={{ color: '#94a3b8' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: compact ? '0.78rem' : '0.85rem' }}>
            No KYC case started
          </span>
        </div>
      </div>
    );
  }

  const currentStatus = activeStatus || 'Not Started';
  const isTerminal = !!TERMINAL_STEPS[currentStatus];
  const currentStepIndex = isTerminal ? STEPS.length : STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className={`kyc-stepper ${compact ? 'kyc-stepper-compact' : ''}`}>
      <div className="kyc-stepper-track">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;
          const isFuture = idx > currentStepIndex && !isTerminal;
          const stepColor = isPast ? '#10b981' : isActive ? step.color : '#cbd5e1';

          return (
            <React.Fragment key={step.key}>
              {idx > 0 && (
                <div
                  className="kyc-stepper-connector"
                  style={{
                    background: isPast || (isActive && !isTerminal) ? '#10b981' : '#e2e8f0',
                    height: compact ? 2 : 3,
                  }}
                />
              )}
              <div
                className={`kyc-stepper-step ${isActive ? 'active' : ''} ${isPast ? 'completed' : ''} ${isFuture ? 'future' : ''}`}
                style={{ '--step-color': stepColor } as React.CSSProperties}
                title={step.label}
              >
                <div className="kyc-stepper-dot" style={{
                  background: isPast ? '#10b981' : isActive ? step.color : '#e2e8f0',
                  color: isPast || isActive ? '#fff' : '#94a3b8',
                  width: compact ? 24 : 32,
                  height: compact ? 24 : 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 0 4px ${step.color}30` : 'none',
                }}>
                  {isPast ? <CheckCircle2 size={compact ? 12 : 16} /> : step.icon}
                </div>
                {!compact && (
                  <span className="kyc-stepper-label" style={{
                    color: isPast ? '#10b981' : isActive ? step.color : '#94a3b8',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    marginTop: 4,
                  }}>
                    {step.label}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Terminal state indicator */}
      {isTerminal && TERMINAL_STEPS[currentStatus] && (
        <div className="kyc-stepper-terminal" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.4rem 0.75rem', borderRadius: 8,
          background: `${TERMINAL_STEPS[currentStatus].color}15`,
          color: TERMINAL_STEPS[currentStatus].color,
          fontSize: compact ? '0.75rem' : '0.82rem',
          fontWeight: 600, marginTop: compact ? 4 : 8,
        }}>
          {TERMINAL_STEPS[currentStatus].icon}
          {TERMINAL_STEPS[currentStatus].label}
          {kycCase?.reviewReason && (
            <span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.8 }}>
              — {kycCase.reviewReason}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
