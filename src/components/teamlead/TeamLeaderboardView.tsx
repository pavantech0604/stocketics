import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { Home, Award, Star, TrendingUp, PhoneCall, Target, ArrowUpRight, ArrowDownRight, Minus, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TeamLeaderboardView: React.FC = () => {
  const { setActiveTab, employees, advisoryLeads, callLogs, getTeamMemberIds, currentUser } = useApp();
  const teamMemberIds = getTeamMemberIds(currentUser.id);
  const [metric, setMetric] = useState<'score' | 'converted' | 'revenue' | 'calls'>('score');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  const teamEmployees = employees.filter(e => teamMemberIds.includes(e.id));

  const leaderboardData = teamEmployees.map(emp => {
    const empLeads = advisoryLeads.filter(l => l.assignedToId === emp.id);
    const empConverted = empLeads.filter(l => l.status === 'Converted').length;
    const empRevenue = empLeads.filter(l => l.status === 'Converted').reduce((s, l) => s + l.expectedRevenue, 0);
    const empCalls = callLogs.filter(c => c.employeeId === emp.id).length;
    const score = empConverted * 30 + (empRevenue / 10000) + empCalls * 2;
    const trialLeads = empLeads.filter(l => l.status === 'Trial Active').length;
    return {
      ...emp, converted: empConverted, revenue: empRevenue, calls: empCalls,
      score: Math.round(score), activeLeads: empLeads.length, trialLeads,
    };
  }).sort((a, b) => {
    if (metric === 'converted') return b.converted - a.converted;
    if (metric === 'revenue') return b.revenue - a.revenue;
    if (metric === 'calls') return b.calls - a.calls;
    return b.score - a.score;
  });

  const rankEmojis = ['🥇', '🥈', '🥉'];
  const podiumColors = ['linear-gradient(135deg, #fbbf24, #f59e0b)', 'linear-gradient(135deg, #94a3b8, #64748b)', 'linear-gradient(135deg, #d97706, #b45309)'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>/ Dashboard</span>
          </span>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Team Leaderboard</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title-ref" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={24} style={{ color: '#f59e0b' }} /> Team Leaderboard
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['score', 'converted', 'revenue', 'calls'] as const).map(m => (
            <button key={m} className={`btn btn-sm ${metric === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMetric(m)} style={{ textTransform: 'capitalize', fontSize: '0.78rem' }}>
              {m === 'score' ? '⚡ Score' : m === 'converted' ? '✅ Converted' : m === 'revenue' ? '💰 Revenue' : '📞 Calls'}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 */}
      {leaderboardData.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '1rem', alignItems: 'end' }}>
          {[1, 0, 2].map(idx => {
            const emp = leaderboardData[idx];
            if (!emp) return null;
            const isFirst = idx === 0;
            return (
              <div key={emp.id} style={{
                textAlign: 'center', padding: isFirst ? '1.75rem 1rem' : '1.25rem 1rem',
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden',
                boxShadow: isFirst ? '0 8px 32px rgba(245,158,11,0.15)' : '0 4px 16px rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                  background: podiumColors[idx],
                }} />
                <div style={{ fontSize: isFirst ? '2.5rem' : '2rem', marginBottom: '0.5rem' }}>{rankEmojis[idx]}</div>
                <img src={emp.avatar} alt={emp.name} style={{
                  width: isFirst ? 72 : 56, height: isFirst ? 72 : 56, borderRadius: '50%', objectFit: 'cover',
                  border: `3px solid ${idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#d97706'}`,
                  marginBottom: '0.5rem',
                }} />
                <div style={{ fontWeight: 800, fontSize: isFirst ? '1rem' : '0.9rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{emp.title}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem',
                  background: podiumColors[idx], color: '#fff',
                }}>
                  {isFirst && <Star size={14} />}
                  {emp.score} pts
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span>✅ {emp.converted}</span>
                  <span>📞 {emp.calls}</span>
                  <span>₹{(emp.revenue / 1000).toFixed(0)}K</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
              {['Rank', 'Employee', 'Active Leads', 'Converted', 'Revenue', 'Calls', 'Trials', 'Score'].map(h => (
                <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: h === 'Employee' ? 'left' : 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((emp, idx) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx === 0 ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>
                  {idx < 3 ? rankEmojis[idx] : `#${idx + 1}`}
                </td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={emp.avatar} alt={emp.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{emp.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.status}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{emp.activeLeads}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: emp.converted > 0 ? '#10b981' : 'var(--text-muted)' }}>{emp.converted}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>₹{emp.revenue.toLocaleString()}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{emp.calls}</td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: '#8b5cf6' }}>{emp.trialLeads}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    padding: '0.2rem 0.55rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.82rem',
                    background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'var(--bg-surface-alt)',
                    color: idx === 0 ? '#fff' : 'var(--text-primary)',
                  }}>{emp.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
