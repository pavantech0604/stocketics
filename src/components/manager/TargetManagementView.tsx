import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  PhoneCall, 
  Users,
  Search,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SalesTarget {
  id: string;
  executiveName: string;
  department: string;
  period: string;
  revenueTarget: number;
  revenueAchieved: number;
  callsTarget: number;
  callsAchieved: number;
  conversionsTarget: number;
  conversionsAchieved: number;
  incentiveSlab: string;
}

const INITIAL_TARGETS: SalesTarget[] = [
  {
    id: 'tgt-1',
    executiveName: 'Shajakhan',
    department: 'Advisory Sales Desk A',
    period: 'September 2026',
    revenueTarget: 600000,
    revenueAchieved: 480000,
    callsTarget: 1100,
    callsAchieved: 950,
    conversionsTarget: 8,
    conversionsAchieved: 7,
    incentiveSlab: '10% Tier 1 Alpha'
  },
  {
    id: 'tgt-2',
    executiveName: 'Rohan Deshmukh',
    department: 'Equity Research Desk',
    period: 'September 2026',
    revenueTarget: 400000,
    revenueAchieved: 310000,
    callsTarget: 900,
    callsAchieved: 780,
    conversionsTarget: 6,
    conversionsAchieved: 5,
    incentiveSlab: '8% Tier 2'
  },
  {
    id: 'tgt-3',
    executiveName: 'Ananya Sen',
    department: 'HNI Advisory Desk',
    period: 'September 2026',
    revenueTarget: 450000,
    revenueAchieved: 395000,
    callsTarget: 800,
    callsAchieved: 740,
    conversionsTarget: 5,
    conversionsAchieved: 5,
    incentiveSlab: '10% Tier 1 Alpha'
  },
  {
    id: 'tgt-4',
    executiveName: 'Aditya Roy',
    department: 'Derivatives Desk',
    period: 'September 2026',
    revenueTarget: 350000,
    revenueAchieved: 210000,
    callsTarget: 950,
    callsAchieved: 620,
    conversionsTarget: 5,
    conversionsAchieved: 3,
    incentiveSlab: '6% Standard'
  },
  {
    id: 'tgt-5',
    executiveName: 'Sneha Kapur',
    department: 'Commodity & PMS',
    period: 'September 2026',
    revenueTarget: 500000,
    revenueAchieved: 460000,
    callsTarget: 850,
    callsAchieved: 810,
    conversionsTarget: 6,
    conversionsAchieved: 6,
    incentiveSlab: '12% Top Performer'
  }
];

export const TargetManagementView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  const getSubTab = (): 'add' | 'all' => {
    if (activeTab === 'add-target') return 'add';
    return 'all';
  };

  const [currentTab, setCurrentTab] = useState<'add' | 'all'>(getSubTab());
  const [targets, setTargets] = useState<SalesTarget[]>(INITIAL_TARGETS);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Target Form State
  const [formData, setFormData] = useState({
    executiveName: 'Rohan Deshmukh',
    department: 'Advisory Sales Desk A',
    period: 'September 2026',
    revenueTarget: 400000,
    callsTarget: 900,
    conversionsTarget: 6,
    incentiveSlab: '8% Tier 2'
  });

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: 'add' | 'all', tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget: SalesTarget = {
      id: `tgt-${Date.now()}`,
      executiveName: formData.executiveName,
      department: formData.department,
      period: formData.period,
      revenueTarget: Number(formData.revenueTarget),
      revenueAchieved: 0,
      callsTarget: Number(formData.callsTarget),
      callsAchieved: 0,
      conversionsTarget: Number(formData.conversionsTarget),
      conversionsAchieved: 0,
      incentiveSlab: formData.incentiveSlab
    };

    setTargets(prev => [newTarget, ...prev]);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    showToast(`Target of ₹${Number(formData.revenueTarget).toLocaleString('en-IN')} assigned to ${formData.executiveName} for ${formData.period}!`, 'success');
    handleTabChange('all', 'all-target');
  };

  const filteredTargets = targets.filter(t => 
    t.executiveName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTeamTarget = targets.reduce((sum, t) => sum + t.revenueTarget, 0);
  const totalTeamAchieved = targets.reduce((sum, t) => sum + t.revenueAchieved, 0);
  const teamAchievementPercent = Math.round((totalTeamAchieved / totalTeamTarget) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Target</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'add' ? 'Add target' : 'All target'}
          </span>
        </div>
      </div>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Sales Target & Revenue Allocation Desk
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Set monthly revenue quotas, monitor calling benchmarks, and review real-time team achievement.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => handleTabChange('add', 'add-target')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Allocate New Target
        </button>
      </div>

      {/* Sub-Options Nav Tabs: Exact Names "Add target" and "All target" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'add' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('add', 'add-target')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={14} /> Add target
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('all', 'all-target')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Target size={14} /> All target ({targets.length} Assigned)
        </button>
      </div>

      {/* Overview Metric Bar */}
      <div className="kpi-grid-3">
        <div className="card stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #0f75bd 0%, #051d33 100%)' }}>
            <Target size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">TOTAL TEAM QUOTA ({targets[0]?.period || 'Month'})</span>
            <span className="stat-value">₹{totalTeamTarget.toLocaleString('en-IN')}</span>
            <span className="stat-delta-row">
              <span className="delta-badge positive">{targets.length} Executive Targets</span>
            </span>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <DollarSign size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">CURRENT TEAM ACHIEVED</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>
              ₹{totalTeamAchieved.toLocaleString('en-IN')}
            </span>
            <span className="stat-delta-row">
              <span className="delta-badge positive">{teamAchievementPercent}% Achieved</span>
            </span>
          </div>
        </div>

        <div className="card stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-icon-tile" style={{ background: 'linear-gradient(135deg, #ffb53e 0%, #d97706 100%)' }}>
            <Award size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">TOP SALES PERFORMER</span>
            <span className="stat-value">Shajakhan (80%)</span>
            <span className="stat-delta-row">
              <span className="delta-badge positive">₹4.8L Booked Revenue</span>
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: ADD TARGET (Interactive Form) */}
      {currentTab === 'add' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Plus size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Add & Allocate Monthly Sales Target</span>
              </div>
              <div className="card-subtitle">
                Assign revenue milestones, calling activity targets, and incentive bonus structures.
              </div>
            </div>
          </div>

          <form onSubmit={handleAddTarget} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Sales Executive *</label>
                <select 
                  className="form-select"
                  value={formData.executiveName}
                  onChange={e => setFormData({ ...formData, executiveName: e.target.value })}
                >
                  <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                  <option value="Shajakhan">Shajakhan</option>
                  <option value="Ananya Sen">Ananya Sen</option>
                  <option value="Sneha Kapur">Sneha Kapur</option>
                  <option value="Aditya Roy">Aditya Roy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quota Period *</label>
                <select 
                  className="form-select"
                  value={formData.period}
                  onChange={e => setFormData({ ...formData, period: e.target.value })}
                >
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="Q3 2026">Q3 2026 (Quarterly Quota)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Revenue Target (₹) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  placeholder="e.g. 500000"
                  value={formData.revenueTarget}
                  onChange={e => setFormData({ ...formData, revenueTarget: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Calls (Monthly) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  placeholder="e.g. 1000"
                  value={formData.callsTarget}
                  onChange={e => setFormData({ ...formData, callsTarget: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Client Conversions *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  placeholder="e.g. 6"
                  value={formData.conversionsTarget}
                  onChange={e => setFormData({ ...formData, conversionsTarget: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Incentive Slab *</label>
                <select 
                  className="form-select"
                  value={formData.incentiveSlab}
                  onChange={e => setFormData({ ...formData, incentiveSlab: e.target.value })}
                >
                  <option value="6% Standard">6% Standard Incentive</option>
                  <option value="8% Tier 2">8% Tier 2 (Exceeds ₹3.5L)</option>
                  <option value="10% Tier 1 Alpha">10% Tier 1 Alpha (Exceeds ₹4.5L)</option>
                  <option value="12% Top Performer">12% Super-Achiever (Exceeds ₹5L)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => handleTabChange('all', 'all-target')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                Allocate Target & Notify Executive
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ALL TARGET (Scorecard & Leaderboard) */}
      {currentTab === 'all' && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '380px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search executive, desk..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
            {filteredTargets.map(tgt => {
              const pct = Math.min(100, Math.round((tgt.revenueAchieved / tgt.revenueTarget) * 100));
              const callsPct = Math.min(100, Math.round((tgt.callsAchieved / tgt.callsTarget) * 100));
              const convPct = Math.min(100, Math.round((tgt.conversionsAchieved / tgt.conversionsTarget) * 100));

              return (
                <div key={tgt.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {tgt.executiveName}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {tgt.department} • {tgt.period}
                      </div>
                    </div>
                    <span className="delta-badge" style={{ 
                      background: pct >= 80 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                      color: pct >= 80 ? '#047857' : '#0284c7',
                      fontWeight: 800
                    }}>
                      {pct}% Achieved
                    </span>
                  </div>

                  {/* Revenue Progress Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Revenue Quota:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{tgt.revenueAchieved.toLocaleString('en-IN')} / ₹{tgt.revenueTarget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        background: pct >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>

                  {/* Calling and Conversion mini meters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Calls Made</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {tgt.callsAchieved} / {tgt.callsTarget}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--stocketics-blue-500)', fontWeight: 600 }}>{callsPct}% Target</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deals Closed</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {tgt.conversionsAchieved} / {tgt.conversionsTarget}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>{convPct}% Target</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Incentive: <strong style={{ color: 'var(--text-secondary)' }}>{tgt.incentiveSlab}</strong></span>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => showToast(`Opening performance review for ${tgt.executiveName}`, 'info')}
                    >
                      Audit Call Stats
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
