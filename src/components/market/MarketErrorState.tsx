import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface MarketErrorStateProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const MarketErrorState: React.FC<MarketErrorStateProps> = ({
  message = 'Unable to establish connection with market data provider.',
  onRetry,
  isRetrying = false
}) => {
  return (
    <div className="market-error-state card" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      textAlign: 'center',
      gap: '0.85rem',
      background: 'var(--bg-surface-alt)',
      border: '1px dashed var(--danger, #ef4444)'
    }}>
      <AlertCircle size={36} style={{ color: 'var(--danger, #ef4444)' }} />
      <div style={{ maxWidth: '420px' }}>
        <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          Market Feed Temporarily Unavailable
        </h4>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onRetry}
          disabled={isRetrying}
          style={{ marginTop: '0.5rem', gap: '0.4rem' }}
        >
          <RotateCw size={13} className={isRetrying ? 'is-spinning' : ''} />
          <span>{isRetrying ? 'Reconnecting...' : 'Retry Provider Connection'}</span>
        </button>
      )}
    </div>
  );
};
