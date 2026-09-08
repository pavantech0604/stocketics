import React from 'react';
import { Award, Target, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export const PerformanceReviews: React.FC = () => {
  const okrs = [
    {
      title: 'Q3 Equity Research Alpha Target',
      lead: 'Aditya Roy & Sneha Kapur',
      progress: 82,
      target: 'Generate >14% annualized outperformance on Model Nifty Portfolio',
      status: 'On Track',
    },
    {
      title: 'HNI Advisory Client Acquisition',
      lead: 'Rohan Deshmukh',
      progress: 68,
      target: 'Enroll 25 new HNI subscribers with >₹25L ticket size',
      status: 'In Progress',
    },
    {
      title: 'Real-time Algorithmic Volatility Scanner',
      lead: 'Vikram Patel & Sneha Kapur',
      progress: 95,
      target: 'Sub-50ms execution latency for Bank Nifty options breakout models',
      status: 'Ahead of Schedule',
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Performance Evaluations & Quarterly OKRs
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Continuous performance coaching, bi-weekly 1-on-1 meeting records, and objective deliverables.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {okrs.map(okr => (
          <div key={okr.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{okr.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Owners: {okr.lead}
                </div>
              </div>
              <span className="badge badge-active">{okr.status}</span>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <strong>Objective:</strong> {okr.target}
            </p>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span>Deliverable Progress</span>
                <span className="mono-cell">{okr.progress}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${okr.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
