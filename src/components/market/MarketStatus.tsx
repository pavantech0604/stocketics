import React from 'react';
import { MarketStatus as MarketStatusType, MarketDataStatus } from '../../types';
import { Clock, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MarketStatusProps {
  status: MarketStatusType;
  dataStatus?: MarketDataStatus;
  provider?: string;
  className?: string;
}

export const MarketStatus: React.FC<MarketStatusProps> = ({
  status,
  dataStatus,
  provider,
  className = ''
}) => {
  const isKiteLive = dataStatus === 'realtime' || provider?.includes('Kite');

  const getStatusBadge = () => {
    switch (status) {
      case 'open':
        return (
          <span className="market-status-pill status-open">
            <span className="live-dot-pulse"></span>
            <span>MARKET OPEN</span>
          </span>
        );
      case 'pre_open':
        return (
          <span className="market-status-pill status-pre-open">
            <Clock size={12} />
            <span>PRE-OPEN</span>
          </span>
        );
      case 'holiday':
        return (
          <span className="market-status-pill status-holiday">
            <AlertTriangle size={12} />
            <span>EXCHANGE HOLIDAY</span>
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="market-status-pill status-closed">
            <Clock size={12} />
            <span>MARKET CLOSED</span>
          </span>
        );
    }
  };

  return (
    <div className={`market-status-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      {getStatusBadge()}
      
      {isKiteLive ? (
        <span className="market-provider-chip provider-kite" title="Streaming real-time live data via Zerodha Kite Connect API">
          <ShieldCheck size={12} />
          <span>Kite LIVE</span>
        </span>
      ) : (
        <span className="market-provider-chip provider-live" title="Streaming real-time live Indian market prices">
          <Activity size={12} />
          <span>NSE Live Feed</span>
        </span>
      )}
    </div>
  );
};
