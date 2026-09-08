import React from 'react';
import { useApp } from '../../state/store';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let borderColor = 'var(--success)';
        let iconColor = 'var(--success)';

        if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderColor = 'var(--warning)';
          iconColor = 'var(--warning)';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'var(--danger)';
          iconColor = 'var(--danger)';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderColor = 'var(--apex-blue-500)';
          iconColor = 'var(--apex-blue-500)';
        }

        return (
          <div
            key={toast.id}
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid var(--border-subtle)`,
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              minWidth: '280px',
              maxWidth: '400px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              animation: 'slideInRight 0.2s ease-out',
              pointerEvents: 'auto',
            }}
          >
            <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
