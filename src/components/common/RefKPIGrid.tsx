import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface KPICardData {
  id: string;
  value: number;
  format?: 'number' | 'currency';
  decimals?: number;
  label: string;
  colorClass: string;
  subtext?: string;
}

interface RefKPIGridProps {
  onCardClick?: (cardId: string) => void;
  customRow1?: KPICardData[];
  customRow2?: KPICardData[];
}

export const RefKPIGrid: React.FC<RefKPIGridProps> = ({ onCardClick, customRow1, customRow2 }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200; // ms

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedProgress(ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, []);

  const defaultRow1: KPICardData[] = [
    { id: 'followup', value: 2, label: "Today's Followup", colorClass: 'kpi-c-blue' },
    { id: 'prospect', value: 0, label: "Today's Prospect", colorClass: 'kpi-c-orange' },
    { id: 'available', value: 10590, label: 'Available Leads', colorClass: 'kpi-c-teal' },
    { id: 'modified', value: 366, label: 'Modified Today', colorClass: 'kpi-c-purple' },
    { id: 'dispose', value: 1658, label: 'Dispose Today', colorClass: 'kpi-c-red' },
    { id: 'today-sale', value: 0, label: "Today's Sale", colorClass: 'kpi-c-cyan' },
  ];

  const defaultRow2: KPICardData[] = [
    { 
      id: 'monthly-sale', 
      value: 1053100.00, 
      format: 'currency', 
      decimals: 2, 
      label: 'Monthly Sale', 
      colorClass: 'kpi-c-navy' 
    },
    { id: 'interested', value: 295, label: 'Interested leads', colorClass: 'kpi-c-violet' },
    { id: 'payment', value: 1, label: 'Payment leads', colorClass: 'kpi-c-amber' },
  ];

  const row1 = customRow1 || defaultRow1;
  const row2 = customRow2 || defaultRow2;

  const formatValue = (card: KPICardData) => {
    const currentVal = card.value * animatedProgress;
    if (card.format === 'currency') {
      return currentVal.toLocaleString('en-US', {
        minimumFractionDigits: card.decimals ?? 2,
        maximumFractionDigits: card.decimals ?? 2,
      });
    }
    return Math.round(currentVal).toLocaleString('en-US');
  };

  const handleCardClick = (card: KPICardData, e: React.MouseEvent) => {
    if (card.id === 'monthly-sale' || card.id === 'payment') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#0088ea', '#00a884', '#e58e26', '#8c31d9'],
      });
    }
    if (onCardClick) {
      onCardClick(card.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 6 Cards Row (Top Row) */}
      <div className="kpi-grid-6">
        {row1.map((card) => (
          <div
            key={card.id}
            className={`kpi-card-ref ${card.colorClass}`}
            onClick={(e) => handleCardClick(card, e)}
            title={`Click to inspect ${card.label}`}
          >
            <div className="kpi-card-num">{formatValue(card)}</div>
            <div className="kpi-card-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Row 2 (3 Cards for Manager & Employee matching Image 1, 2 Cards under columns 1 & 2 for HR) */}
      <div className={row2.length <= 3 ? 'kpi-row-2-ref' : 'kpi-grid-6'}>
        {row2.map((card) => (
          <div
            key={card.id}
            className={`kpi-card-ref ${card.colorClass}`}
            onClick={(e) => handleCardClick(card, e)}
            title={`Click to inspect ${card.label}`}
          >
            <div className="kpi-card-num">{formatValue(card)}</div>
            <div className="kpi-card-label">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
