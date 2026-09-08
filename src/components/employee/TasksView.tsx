import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { CheckSquare, Square, Check, Plus, AlertTriangle, Calendar } from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, toggleTask } = useApp();
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredTasks = tasks.filter(t => 
    filterCategory === 'All' || t.category === filterCategory
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            My Daily Priority Tasks & Action Items
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Check off daily research notes, compliance deadlines, and client calls.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            className="form-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ fontSize: '0.84rem', padding: '0.45rem 0.85rem' }}
          >
            <option value="All">All Categories</option>
            <option value="Research">Equity Research</option>
            <option value="Client Call">Client Calls</option>
            <option value="Compliance">SEBI Compliance</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: task.completed ? 'var(--bg-surface-alt)' : 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                opacity: task.completed ? 0.65 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div 
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border-strong)'}`,
                    background: task.completed ? 'var(--success)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    transition: 'all 0.15s',
                  }}
                >
                  {task.completed && <Check size={14} />}
                </div>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>Due: {task.dueDate}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 600 }}>{task.category}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className={`badge ${task.priority === 'Urgent' ? 'badge-danger' : task.priority === 'High' ? 'badge-leave' : 'badge-remote'}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
