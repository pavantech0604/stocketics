import React, { useState } from 'react';
import { useApp } from '../../state/store';
import {
  Home,
  Target,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Download,
  Calendar,
  DollarSign,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TargetMetric, TargetPeriod, TeamTarget } from '../../types';

export const TeamTargetsView: React.FC = () => {
  const {
    currentUser,
    employees,
    teamTargets,
    setTeamTarget,
    updateTeamTarget,
    getTeamMemberIds,
    setActiveTab,
    showToast
  } = useApp();

  const teamMemberIds = getTeamMemberIds(currentUser.id);
  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<TargetPeriod | 'All'>('All');
  const [selectedMetric, setSelectedMetric] = useState<TargetMetric | 'All'>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('All');

  // Set Target Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState(teamEmployees[0]?.id || '');
  const [targetMetric, setTargetMetric] = useState<TargetMetric>('Leads Converted');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Inline editing actual
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editActualVal, setEditActualVal] = useState<number>(0);

  // Filter team targets to this team
  const scopedTargets = teamTargets.filter(t => teamMemberIds.includes(t.employeeId));

  const filteredTargets = scopedTargets.filter(t => {
    if (selectedPeriod !== 'All' && t.period !== selectedPeriod) return false;
    if (selectedMetric !== 'All' && t.metric !== selectedMetric) return false;
    if (selectedEmployee !== 'All' && t.employeeId !== selectedEmployee) return false;
    return true;
  });

  // KPI Calculations
  const totalTargets = scopedTargets.length;
  const avgAchievement = totalTargets > 0
    ? Math.round(scopedTargets.reduce((acc, t) => acc + Math.min(150, (t.actualValue / (t.targetValue || 1)) * 100), 0) / totalTargets)
    : 0;

  const exceededCount = scopedTargets.filter(t => t.actualValue >= t.targetValue).length;
  const atRiskTargets = scopedTargets.filter(t => (t.actualValue / (t.targetValue || 1)) < 0.6);

  const handleCreateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployeeId || targetValue <= 0) {
      showToast('Please select a valid employee and target value.', 'warning');
      return;
    }

    const emp = teamEmployees.find(e => e.id === targetEmployeeId);
    setTeamTarget({
      teamId: `team-${currentUser.id}`,
      employeeId: targetEmployeeId,
      employeeName: emp?.name || 'Team Member',
      metric: targetMetric,
      targetValue: Number(targetValue),
      actualValue: 0,
      period: targetPeriod,
      startDate,
      endDate
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Target set successfully for ${emp?.name}!`, 'success');
    setIsModalOpen(false);
    setTargetValue(10);
  };

  const handleUpdateActual = (id: string) => {
    updateTeamTarget(id, Number(editActualVal));
    const t = scopedTargets.find(item => item.id === id);
    if (t && Number(editActualVal) >= t.targetValue) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast('Goal achieved! Awesome achievement!', 'success');
    } else {
      showToast('Actual value updated.', 'info');
    }
    setEditingTargetId(null);
  };

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Employee,Metric,Period,Target,Actual,Achievement %,Status\n" +
      filteredTargets.map(t => {
        const pct = Math.round((t.actualValue / (t.targetValue || 1)) * 100);
        const status = pct >= 100 ? 'Exceeded' : pct >= 80 ? 'On Track' : 'Behind';
        return `"${t.employeeName}","${t.metric}","${t.period}",${t.targetValue},${t.actualValue},"${pct}%","${status}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `team_targets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Target report exported successfully.', 'success');
  };

  const getMetricIcon = (metric: TargetMetric) => {
    switch (metric) {
      case 'Leads Converted': return <TrendingUp size={16} className="text-emerald-500" />;
      case 'Revenue': return <DollarSign size={16} className="text-amber-500" />;
      case 'Calls Made': return <PhoneCall size={16} className="text-blue-500" />;
      case 'SMS Sent': return <MessageSquare size={16} className="text-purple-500" />;
      case 'New Clients': return <Users size={16} className="text-cyan-500" />;
    }
  };

  return (
    <div className="crm-view-container tl-targets-view" style={{ padding: '24px 28px' }}>
      {/* Breadcrumbs */}
      <div className="crm-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit' }}>
          <Home size={14} /> Home
        </button>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Team Targets vs Actuals</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target className="text-amber-500" size={26} />
            Team Targets & Goal Tracking
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
            Empower your team with measurable goals, real-time tracking, and proactive gap prevention.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={exportReport}
            className="crm-btn crm-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 15px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Download size={15} /> Export Report
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="crm-btn crm-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            <Plus size={16} /> Set New Target
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Active Goals</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Target size={18} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{totalTargets}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Across {teamEmployees.length} members</div>
        </div>

        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Avg Team Achievement</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle2 size={18} /></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: avgAchievement >= 80 ? '#10b981' : avgAchievement >= 60 ? '#f59e0b' : '#ef4444' }}>
              {avgAchievement}%
            </span>
            <span style={{ fontSize: '12px', color: avgAchievement >= 80 ? '#10b981' : '#f59e0b' }}>
              {avgAchievement >= 80 ? '↑ Healthy' : '⚠ Action needed'}
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, avgAchievement)}%`, height: '100%', background: avgAchievement >= 80 ? '#10b981' : avgAchievement >= 60 ? '#f59e0b' : '#ef4444', borderRadius: '3px', transition: 'width 0.5s' }} />
          </div>
        </div>

        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Goals Exceeded</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><TrendingUp size={18} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{exceededCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>≥ 100% of target value</div>
        </div>

        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Critical Gap (Behind &lt;60%)</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><AlertTriangle size={18} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: atRiskTargets.length > 0 ? '#ef4444' : 'var(--text-primary)' }}>
            {atRiskTargets.length}
          </div>
          <div style={{ fontSize: '12px', color: atRiskTargets.length > 0 ? '#ef4444' : '#10b981', marginTop: '4px' }}>
            {atRiskTargets.length > 0 ? 'Requires 1:1 coaching' : 'No critical lags'}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          <Filter size={15} /> Filters:
        </div>

        {/* Period filter */}
        <select
          value={selectedPeriod}
          onChange={e => setSelectedPeriod(e.target.value as any)}
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
        >
          <option value="All">All Periods</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>

        {/* Metric filter */}
        <select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value as any)}
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
        >
          <option value="All">All Metrics</option>
          <option value="Leads Converted">Leads Converted</option>
          <option value="Revenue">Revenue</option>
          <option value="Calls Made">Calls Made</option>
          <option value="SMS Sent">SMS Sent</option>
          <option value="New Clients">New Clients</option>
        </select>

        {/* Employee filter */}
        <select
          value={selectedEmployee}
          onChange={e => setSelectedEmployee(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
        >
          <option value="All">All Team Members</option>
          {teamEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>

        {(selectedPeriod !== 'All' || selectedMetric !== 'All' || selectedEmployee !== 'All') && (
          <button
            onClick={() => { setSelectedPeriod('All'); setSelectedMetric('All'); setSelectedEmployee('All'); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', marginLeft: 'auto', textDecoration: 'underline' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Target Progress Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        {filteredTargets.map(t => {
          const emp = teamEmployees.find(e => e.id === t.employeeId);
          const pct = Math.round((t.actualValue / (t.targetValue || 1)) * 100);
          const isExceeded = pct >= 100;
          const isBehind = pct < 60;
          const isEditing = editingTargetId === t.id;

          const badgeColor = isExceeded
            ? { bg: 'rgba(16,185,129,0.12)', text: '#10b981', label: 'Exceeded' }
            : pct >= 80
            ? { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', label: 'On Track' }
            : pct >= 60
            ? { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'Needs Push' }
            : { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'Behind Target' };

          const formatVal = (val: number) => {
            if (t.metric === 'Revenue') {
              return '₹' + val.toLocaleString('en-IN');
            }
            return val.toLocaleString();
          };

          return (
            <div
              key={t.id}
              style={{
                background: 'var(--card-bg, #fff)',
                border: isBehind ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '18px 20px',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={t.employeeName}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{t.employeeName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.period} Target • {t.startDate} to {t.endDate}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', background: badgeColor.bg, color: badgeColor.text }}>
                    {badgeColor.label}
                  </span>
                </div>

                {/* Metric Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', background: 'var(--bg-main, #f8fafc)', padding: '6px 10px', borderRadius: '6px', width: 'fit-content' }}>
                  {getMetricIcon(t.metric)}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.metric}</span>
                </div>

                {/* Progress Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatVal(t.actualValue)}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}> / {formatVal(t.targetValue)}</span>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: badgeColor.text }}>
                    {pct}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      height: '100%',
                      background: badgeColor.text,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* Action / Quick update footer */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                    <input
                      type="number"
                      value={editActualVal}
                      onChange={e => setEditActualVal(Number(e.target.value))}
                      style={{ width: '80px', padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--accent)', fontSize: '13px' }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateActual(t.id)}
                      className="crm-btn crm-btn-primary"
                      style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTargetId(null)}
                      className="crm-btn crm-btn-secondary"
                      style={{ padding: '5px 8px', fontSize: '12px', borderRadius: '6px' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingTargetId(t.id);
                        setEditActualVal(t.actualValue);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Edit2 size={13} /> Update Progress
                    </button>

                    {isBehind && (
                      <button
                        onClick={() => setActiveTab('coaching')}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Coach in 1:1 →
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTargets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--card-bg, #fff)', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
          <Target size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>No targets found</h3>
          <p style={{ fontSize: '13px', margin: '0 0 16px' }}>Create target goals to track your team's real-time trajectory.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="crm-btn crm-btn-primary"
            style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Plus size={14} /> Set First Target
          </button>
        </div>
      )}

      {/* Target Setting Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #fff)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '500px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} className="text-amber-500" />
                Set New Team Target
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTarget} style={{ padding: '22px' }}>
              {/* Employee */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Assign to Employee *
                </label>
                <select
                  value={targetEmployeeId}
                  onChange={e => setTargetEmployeeId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '14px' }}
                >
                  {teamEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              {/* Metric & Period Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Metric Goal *
                  </label>
                  <select
                    value={targetMetric}
                    onChange={e => setTargetMetric(e.target.value as TargetMetric)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    <option value="Leads Converted">Leads Converted</option>
                    <option value="Revenue">Revenue (₹)</option>
                    <option value="Calls Made">Calls Made</option>
                    <option value="SMS Sent">SMS Sent</option>
                    <option value="New Clients">New Clients</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Period *
                  </label>
                  <select
                    value={targetPeriod}
                    onChange={e => setTargetPeriod(e.target.value as TargetPeriod)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Target Value */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Target Goal Value {targetMetric === 'Revenue' ? '(₹)' : '(Units)'} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={e => setTargetValue(Number(e.target.value))}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '14px' }}
                />
              </div>

              {/* Date Range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="crm-btn crm-btn-secondary"
                  style={{ padding: '9px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-btn crm-btn-primary"
                  style={{ padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}
                >
                  Establish Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
