import React from 'react';

export interface KPICardData {
  id: string;
  value: number;
  format?: 'number' | 'currency';
  decimals?: number;
  label: string;
  colorClass?: string;
  subtext?: string;
  tooltip?: string;
}

export interface LegacyKPIGridProps {
  onCardClick?: (cardId: string) => void;
  customRow1?: KPICardData[];
  customRow2?: KPICardData[];
  row1?: KPICardData[];
  row2?: KPICardData[];
  activeId?: string;
  isLoading?: boolean;
}

/**
 * Formats a metric value with Indian number grouping (en-IN) and INR currency symbol.
 */
export const formatMetricValue = (
  value: number,
  format: 'number' | 'currency' = 'number',
  decimals: number = 0
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  if (format === 'currency') {
    const formattedNum = Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `₹${formattedNum}`;
  }

  return Number(value).toLocaleString('en-IN');
};

/**
 * Legacy-inspired KPI Metric Card.
 * Clean, flat solid-color design with centered number and label.
 * Accessible button element with keyboard and screen-reader support.
 */
export const LegacyKPICard: React.FC<{
  card: KPICardData;
  isActive?: boolean;
  onClick?: (id: string) => void;
}> = ({ card, isActive = false, onClick }) => {
  const formatted = formatMetricValue(
    card.value,
    card.format,
    card.decimals ?? (card.format === 'currency' ? 0 : 0)
  );

  const handleClick = () => {
    if (onClick) {
      onClick(card.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const accessibleLabel = `${card.label}: ${formatted}${card.subtext ? ` (${card.subtext})` : ''}`;
  const titleTooltip = card.tooltip || `${card.label}: ${formatted}`;

  return (
    <button
      type="button"
      className={`kpi-card-legacy kpi-card-ref ${card.colorClass || ''} ${isActive ? 'is-active' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={accessibleLabel}
      title={titleTooltip}
    >
      <div className="kpi-card-num">{formatted}</div>
      <div className="kpi-card-label">{card.label}</div>
      {card.subtext && <div className="kpi-card-subtext">{card.subtext}</div>}
    </button>
  );
};

/**
 * Reusable Legacy-Inspired KPI Grid.
 * Renders 6 columns on desktop with solid background colors, centered metrics,
 * and responsive wrapping to 3, 2, or 1 column.
 */
export const LegacyKPIGrid: React.FC<LegacyKPIGridProps> = ({
  onCardClick,
  customRow1,
  customRow2,
  row1: propRow1,
  row2: propRow2,
  activeId,
  isLoading = false,
}) => {
  const defaultRow1: KPICardData[] = [
    { id: 'today-followup', value: 0, label: "Today's Followup", colorClass: 'kpi-c-followup' },
    { id: 'active-prospect', value: 0, label: "Today's Prospect", colorClass: 'kpi-c-prospect' },
    { id: 'available-leads', value: 0, label: 'Available Leads', colorClass: 'kpi-c-available' },
    { id: 'modified-today', value: 0, label: 'Modified Today', colorClass: 'kpi-c-modified' },
    { id: 'dispose-today', value: 0, label: 'Dispose Today', colorClass: 'kpi-c-dispose' },
    { id: 'today-sale', value: 0, format: 'currency', label: "Today's Sale", colorClass: 'kpi-c-today-sale' },
  ];

  const defaultRow2: KPICardData[] = [
    { id: 'monthly-sale', value: 0, format: 'currency', decimals: 2, label: 'Monthly Sale', colorClass: 'kpi-c-monthly-sale' },
    { id: 'interested-leads', value: 0, label: 'Interested leads', colorClass: 'kpi-c-interested' },
    { id: 'payment-leads', value: 0, label: 'Payment leads', colorClass: 'kpi-c-payment' },
  ];

  const finalRow1 = propRow1 || customRow1 || defaultRow1;
  const finalRow2 = propRow2 || customRow2 || defaultRow2;

  const isCardActive = (cardId: string) => {
    if (!activeId) return false;
    return activeId === cardId || activeId.toLowerCase().includes(cardId.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="kpi-grid-6" aria-busy="true" aria-label="Loading KPI metrics">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="kpi-card-legacy" style={{ background: '#94a3b8', opacity: 0.5 }}>
            <div className="kpi-card-num">...</div>
            <div className="kpi-card-label">Loading</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="legacy-kpi-container" role="region" aria-label="Key Performance Indicators">
      {/* Row 1: Standard 6 Desktop Columns */}
      {finalRow1.length > 0 && (
        <div className="kpi-grid-6">
          {finalRow1.map((card) => (
            <LegacyKPICard
              key={card.id}
              card={card}
              isActive={isCardActive(card.id)}
              onClick={onCardClick}
            />
          ))}
        </div>
      )}

      {/* Row 2: Occupies columns 1..N of 6 columns (no filler cards needed) */}
      {finalRow2 && finalRow2.length > 0 && (
        <div className="kpi-row-2-ref">
          {finalRow2.map((card) => (
            <LegacyKPICard
              key={card.id}
              card={card}
              isActive={isCardActive(card.id)}
              onClick={onCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LegacyKPIGrid;
