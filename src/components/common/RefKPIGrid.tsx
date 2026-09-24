import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarClock,
  Target,
  Users,
  Clock,
  Trash2,
  TrendingUp,
  Award,
  ThumbsUp,
  CreditCard,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Filter,
  X,
  Zap,
} from 'lucide-react';

export interface KPICardData {
  id: string;
  value: number;
  format?: 'number' | 'currency';
  decimals?: number;
  label: string;
  colorClass: string;
  subtext?: string;
}

export interface RefKPIGridProps {
  onCardClick?: (cardId: string) => void;
  customRow1?: KPICardData[];
  customRow2?: KPICardData[];
  activeId?: string;
}

export const RefKPIGrid: React.FC<RefKPIGridProps> = ({
  onCardClick,
  customRow1,
  customRow2,
  activeId,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [density, setDensity] = useState<'compact' | 'standard'>(() => {
    try {
      const saved = localStorage.getItem('apex_kpi_density');
      return saved === 'compact' ? 'compact' : 'standard';
    } catch {
      return 'standard';
    }
  });
  const [activeCategory, setActiveCategory] = useState<'all' | 'pipeline' | 'activity' | 'revenue'>('all');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1000; // ms

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
  const allCards = [...row1, ...row2];

  const getCardIcon = (id: string, label: string) => {
    const norm = (id + ' ' + label).toLowerCase();
    if (norm.includes('followup') || norm.includes('follow-up')) return <CalendarClock size={14} />;
    if (norm.includes('prospect')) return <Target size={14} />;
    if (norm.includes('available') || norm.includes('new-lead') || norm.includes('active-leads')) return <Users size={14} />;
    if (norm.includes('modified')) return <Clock size={14} />;
    if (norm.includes('dispose')) return <Trash2 size={14} />;
    if (norm.includes('today-sale') || norm.includes("today's sale")) return <TrendingUp size={14} />;
    if (norm.includes('monthly-sale') || norm.includes('monthly sale') || norm.includes('revenue')) return <Award size={14} />;
    if (norm.includes('interested')) return <ThumbsUp size={14} />;
    if (norm.includes('payment') || norm.includes('converted')) return <CreditCard size={14} />;
    return <Sparkles size={14} />;
  };

  const getCardCategory = (card: KPICardData): 'pipeline' | 'activity' | 'revenue' => {
    const norm = (card.id + ' ' + card.label).toLowerCase();
    if (norm.includes('sale') || norm.includes('payment') || norm.includes('revenue') || norm.includes('monthly') || norm.includes('target')) {
      return 'revenue';
    }
    if (norm.includes('modified') || norm.includes('dispose') || norm.includes('call') || norm.includes('clock')) {
      return 'activity';
    }
    return 'pipeline';
  };

  const isCardActive = (card: KPICardData) => {
    const target = selectedCardId || activeId;
    if (!target) return false;
    if (card.id === target) return true;
    const c = card.id.toLowerCase();
    const t = target.toLowerCase();
    if (c.includes('followup') && t.includes('followup')) return true;
    if (c.includes('prospect') && t.includes('prospect')) return true;
    if ((c.includes('available') || c.includes('new-lead')) && (t.includes('available') || t.includes('new-lead'))) return true;
    if (c.includes('modified') && t.includes('modified')) return true;
    if (c.includes('dispose') && t.includes('dispose')) return true;
    if (c.includes('today-sale') && t.includes('today-sale')) return true;
    if (c.includes('monthly-sale') && (t.includes('monthly-sale') || t.includes('sales-report'))) return true;
    if (c.includes('interested') && t.includes('interested')) return true;
    if (c.includes('payment') && (t.includes('payment') || t.includes('confirmed-payment'))) return true;
    return false;
  };

  const pipelineCount = allCards.filter(c => getCardCategory(c) === 'pipeline').length;
  const activityCount = allCards.filter(c => getCardCategory(c) === 'activity').length;
  const revenueCount = allCards.filter(c => getCardCategory(c) === 'revenue').length;

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
    // Milestone celebratory confetti
    if (card.id.includes('sale') || card.id.includes('payment') || card.id.includes('revenue') || card.id.includes('converted')) {
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

    if (selectedCardId === card.id) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(card.id);
    }

    if (onCardClick) {
      onCardClick(card.id);
    }
  };

  const handleClearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCardId(null);
    if (onCardClick) {
      onCardClick('all');
    }
  };

  const activeCardObj = allCards.find(c => isCardActive(c));

  // Category filtering
  const visibleRow1 = activeCategory === 'all' 
    ? row1 
    : row1.filter(c => getCardCategory(c) === activeCategory);

  const visibleRow2 = activeCategory === 'all' 
    ? row2 
    : row2.filter(c => getCardCategory(c) === activeCategory);

  const filteredAll = activeCategory === 'all'
    ? allCards
    : allCards.filter(c => getCardCategory(c) === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* KPI Controls Header: Navigation Filter Pills + Density View Selector */}
      <div className="kpi-controls-bar">
        <div className="kpi-filter-pills">
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={12} /> View:
          </span>
          <button
            type="button"
            className={`kpi-filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All ({allCards.length})
          </button>
          <button
            type="button"
            className={`kpi-filter-pill ${activeCategory === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveCategory('pipeline')}
          >
            Pipeline ({pipelineCount})
          </button>
          <button
            type="button"
            className={`kpi-filter-pill ${activeCategory === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveCategory('activity')}
          >
            Activity ({activityCount})
          </button>
          <button
            type="button"
            className={`kpi-filter-pill ${activeCategory === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveCategory('revenue')}
          >
            Sales & Revenue ({revenueCount})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeCardObj && (
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.18rem 0.55rem',
                borderRadius: 20,
                background: 'rgba(37, 99, 235, 0.1)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                color: '#2563eb',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              <span>Filter: {activeCardObj.label}</span>
              <button
                type="button"
                onClick={handleClearFilter}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#2563eb' }}
                title="Clear Active Filter"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Density Toggle (Reduces display height by >50%) */}
          <div className="kpi-view-toggle">
            <button
              type="button"
              className={`kpi-view-btn ${density === 'compact' ? 'active' : ''}`}
              onClick={() => {
                setDensity('compact');
                try {
                  localStorage.setItem('apex_kpi_density', 'compact');
                } catch {
                  // ignore
                }
              }}
              title="Compact View: Ultra-slim cards to save vertical screen space"
            >
              <Minimize2 size={12} />
              <span>Compact</span>
            </button>
            <button
              type="button"
              className={`kpi-view-btn ${density === 'standard' ? 'active' : ''}`}
              onClick={() => {
                setDensity('standard');
                try {
                  localStorage.setItem('apex_kpi_density', 'standard');
                } catch {
                  // ignore
                }
              }}
              title="Standard View: Streamlined modern cards"
            >
              <Maximize2 size={12} />
              <span>Standard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render when a specific category is filtered */}
      {activeCategory !== 'all' ? (
        <div className={density === 'compact' ? 'kpi-grid-compact' : 'kpi-grid-flexible'}>
          {filteredAll.map((card) => {
            const active = isCardActive(card);
            return (
              <div
                key={card.id}
                className={`kpi-card-ref ${card.colorClass} ${density === 'compact' ? 'kpi-compact' : ''} ${active ? 'is-active' : ''}`}
                onClick={(e) => handleCardClick(card, e)}
                title={`Click to filter leads by ${card.label}`}
              >
                {density === 'compact' ? (
                  <>
                    <div className="kpi-icon-badge">
                      {getCardIcon(card.id, card.label)}
                    </div>
                    <div className="kpi-compact-content">
                      <div className="kpi-card-num">{formatValue(card)}</div>
                      <div className="kpi-card-label">{card.label}</div>
                    </div>
                    <div className="kpi-card-arrow">
                      <ChevronRight size={13} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="kpi-card-header-inner">
                      <div className="kpi-icon-badge">
                        {getCardIcon(card.id, card.label)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {active && <span className="kpi-active-tag">Active</span>}
                        <div className="kpi-card-arrow">
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="kpi-card-num">{formatValue(card)}</div>
                      <div className="kpi-card-label">{card.label}</div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* Row 1: 6 Cards */}
          <div className="kpi-grid-6">
            {visibleRow1.map((card) => {
              const active = isCardActive(card);
              return (
                <div
                  key={card.id}
                  className={`kpi-card-ref ${card.colorClass} ${density === 'compact' ? 'kpi-compact' : ''} ${active ? 'is-active' : ''}`}
                  onClick={(e) => handleCardClick(card, e)}
                  title={`Click to filter leads: ${card.label}`}
                >
                  {density === 'compact' ? (
                    <>
                      <div className="kpi-icon-badge">
                        {getCardIcon(card.id, card.label)}
                      </div>
                      <div className="kpi-compact-content">
                        <div className="kpi-card-num">{formatValue(card)}</div>
                        <div className="kpi-card-label">{card.label}</div>
                      </div>
                      <div className="kpi-card-arrow">
                        <ChevronRight size={13} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="kpi-card-header-inner">
                        <div className="kpi-icon-badge">
                          {getCardIcon(card.id, card.label)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {active && <span className="kpi-active-tag">Active</span>}
                          <div className="kpi-card-arrow">
                            <ChevronRight size={13} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="kpi-card-num">{formatValue(card)}</div>
                        <div className="kpi-card-label">{card.label}</div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Row 2: 3 Cards + Interactive Navigation Hub in Remaining 3 Columns */}
          {visibleRow2.length > 0 && (
            <div className={visibleRow2.length <= 3 ? 'kpi-row-2-ref' : 'kpi-grid-6'}>
              {visibleRow2.map((card) => {
                const active = isCardActive(card);
                return (
                  <div
                    key={card.id}
                    className={`kpi-card-ref ${card.colorClass} ${density === 'compact' ? 'kpi-compact' : ''} ${active ? 'is-active' : ''}`}
                    onClick={(e) => handleCardClick(card, e)}
                    title={`Click to filter leads: ${card.label}`}
                  >
                    {density === 'compact' ? (
                      <>
                        <div className="kpi-icon-badge">
                          {getCardIcon(card.id, card.label)}
                        </div>
                        <div className="kpi-compact-content">
                          <div className="kpi-card-num">{formatValue(card)}</div>
                          <div className="kpi-card-label">{card.label}</div>
                        </div>
                        <div className="kpi-card-arrow">
                          <ChevronRight size={13} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="kpi-card-header-inner">
                          <div className="kpi-icon-badge">
                            {getCardIcon(card.id, card.label)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {active && <span className="kpi-active-tag">Active</span>}
                            <div className="kpi-card-arrow">
                              <ChevronRight size={13} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="kpi-card-num">{formatValue(card)}</div>
                          <div className="kpi-card-label">{card.label}</div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Quick Navigation Action Hub filling columns 4, 5, 6 (Eliminates dead white space) */}
              {visibleRow2.length === 3 && (
                <div className="kpi-row2-action-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Zap size={14} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeCardObj ? `Filtering: ${activeCardObj.label}` : 'Live Leads Navigation Desk'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeCardObj ? 'Click Open Desk to view leads' : 'Click any metric card to filter leads'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    {activeCardObj && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={handleClearFilter}
                        title="Clear current filter"
                      >
                        <X size={11} /> Reset
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#2563eb', color: '#fff', border: 'none' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onCardClick) onCardClick(activeCardObj?.id || 'available-leads');
                      }}
                    >
                      <span>Leads Desk</span>
                      <ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
