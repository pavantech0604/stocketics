import React from 'react';
import { Calendar, Users, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const TeamScheduler: React.FC = () => {
  const teamRoster = [
    { name: 'Aditya Roy', title: 'Senior Equity Analyst', mon: 'Office', tue: 'Office', wed: 'Office', thu: 'Remote', fri: 'Office', capacity: '40/40 hrs' },
    { name: 'Sneha Kapur', title: 'Quant Derivatives Strategist', mon: 'Office', tue: 'Office', wed: 'Office', thu: 'PTO', fri: 'PTO', capacity: '24/40 hrs' },
    { name: 'Rohan Deshmukh', title: 'Advisory Lead', mon: 'Remote', tue: 'Remote', wed: 'Office', thu: 'Office', fri: 'Office', capacity: '40/40 hrs' },
    { name: 'Ananya Sen', title: 'Wealth Consultant', mon: 'PTO', tue: 'PTO', wed: 'Office', thu: 'Office', fri: 'Office', capacity: '24/40 hrs' },
    { name: 'Vikram Patel', title: 'Cloud Infrastructure', mon: 'Remote', tue: 'Remote', wed: 'Remote', thu: 'Remote', fri: 'Remote', capacity: '40/40 hrs' },
  ];

  const getShiftBadge = (status: string) => {
    if (status === 'Office') {
      return (
        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(15, 117, 189, 0.1)', color: '#0f75bd', fontWeight: 700, fontSize: '0.74rem' }}>
          HQ Office
        </span>
      );
    }
    if (status === 'Remote') {
      return (
        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(32, 197, 203, 0.12)', color: '#0d9488', fontWeight: 700, fontSize: '0.74rem' }}>
          Remote
        </span>
      );
    }
    return (
      <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 700, fontSize: '0.74rem' }}>
        PTO Leave
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Team Shift Coverage & Weekly Gantt
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Ensure uninterrupted market hours coverage across equity research desks and trade execution.
        </p>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Coverage Matrix (Week of 07-Sep to 11-Sep 2026)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0f75bd' }} /> Office (HQ)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#20C5CB' }} /> Remote
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#F59E0B' }} /> PTO / Off
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Monday 07</th>
                <th>Tuesday 08</th>
                <th>Wednesday 09</th>
                <th>Thursday 10</th>
                <th>Friday 11</th>
                <th>Planned Capacity</th>
              </tr>
            </thead>
            <tbody>
              {teamRoster.map(item => (
                <tr key={item.name}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.title}</div>
                  </td>
                  <td>{getShiftBadge(item.mon)}</td>
                  <td>{getShiftBadge(item.tue)}</td>
                  <td>{getShiftBadge(item.wed)}</td>
                  <td>{getShiftBadge(item.thu)}</td>
                  <td>{getShiftBadge(item.fri)}</td>
                  <td className="mono-cell" style={{ fontWeight: 700 }}>{item.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
