import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Briefcase,
  RotateCcw,
  X,
  UserPlus,
  PauseCircle,
  XCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  department: string;
  experienceYears: number;
  currentCtc: string;
  expectedCtc: string;
  stage: 'New Entry' | 'Scheduled' | 'Shortlisted' | 'Offered' | 'Hold Candidate' | 'Reject Candidate';
  interviewDate?: string;
  offeredCtc?: string;
  notes: string;
}

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Vikram Joshi',
    phone: '+91 98210 33412',
    email: 'vikram.joshi@email.com',
    position: 'Equity Research Analyst (Mid-Cap)',
    department: 'Equity Research',
    experienceYears: 4,
    currentCtc: '₹8.5 LPA',
    expectedCtc: '₹11 LPA',
    stage: 'Scheduled',
    interviewDate: '08-Sep-2026, 03:00 PM',
    notes: 'Strong technical analysis background in Nifty 500 equities. Round 2 technical interview with VP Rajesh Varma.'
  },
  {
    id: 'cand-2',
    name: 'Pooja Hegde',
    phone: '+91 99341 55210',
    email: 'pooja.h@gmail.com',
    position: 'Advisory Sales Executive',
    department: 'Advisory Sales',
    experienceYears: 2,
    currentCtc: '₹4.2 LPA',
    expectedCtc: '₹6.0 LPA',
    stage: 'Offered',
    offeredCtc: '₹5.5 LPA + Incentives',
    notes: 'Top sales producer at previous advisory firm. Offer letter issued, joining date 15-Sep-2026.'
  },
  {
    id: 'cand-3',
    name: 'Sameer Kulkarni',
    phone: '+91 97110 88219',
    email: 'sameer.k@outlook.com',
    position: 'Derivatives Options Trader',
    department: 'Derivatives Desk',
    experienceYears: 3,
    currentCtc: '₹6.0 LPA',
    expectedCtc: '₹8.5 LPA',
    stage: 'Shortlisted',
    notes: 'Cleared initial screening test on Greeks & volatility surface models.'
  },
  {
    id: 'cand-4',
    name: 'Divya Nair',
    phone: '+91 98450 11290',
    email: 'divya.nair@yahoo.co.in',
    position: 'HR & Admin Coordinator',
    department: 'HR',
    experienceYears: 1.5,
    currentCtc: '₹3.5 LPA',
    expectedCtc: '₹4.5 LPA',
    stage: 'Hold Candidate',
    notes: 'Good communication, hold for Q4 branch expansion.'
  },
  {
    id: 'cand-5',
    name: 'Amitabh Sen',
    phone: '+91 98102 77312',
    email: 'amitabh.s@gmail.com',
    position: 'Senior Technical Analyst',
    department: 'Equity Research',
    experienceYears: 6,
    currentCtc: '₹12 LPA',
    expectedCtc: '₹15 LPA',
    stage: 'Scheduled',
    interviewDate: '10-Sep-2026, 11:30 AM',
    notes: 'Prior institutional research experience at leading domestic brokerage.'
  }
];

export const HRRecruitmentView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  const [currentStage, setCurrentStage] = useState<'All' | Candidate['stage']>('All');
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    phone: '',
    email: '',
    position: 'Advisory Sales Executive',
    department: 'Advisory Sales',
    experienceYears: 2,
    currentCtc: '₹4.5 LPA',
    expectedCtc: '₹6.0 LPA',
    notes: ''
  });

  useEffect(() => {
    if (activeTab === 'recruitment-scheduled') setCurrentStage('Scheduled');
    else if (activeTab === 'recruitment-offered') setCurrentStage('Offered');
    else if (activeTab === 'recruitment-shortlisted') setCurrentStage('Shortlisted');
    else if (activeTab === 'recruitment-hold') setCurrentStage('Hold Candidate');
    else if (activeTab === 'recruitment-rejected') setCurrentStage('Reject Candidate');
    else if (activeTab === 'recruitment-new-entry') setShowAddModal(true);
  }, [activeTab]);

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name.trim() || !newCandidate.phone.trim()) return;

    const added: Candidate = {
      id: `cand-${Date.now()}`,
      name: newCandidate.name,
      phone: newCandidate.phone,
      email: newCandidate.email || `${newCandidate.name.toLowerCase().replace(/\s+/g, '')}@applicant.com`,
      position: newCandidate.position,
      department: newCandidate.department,
      experienceYears: Number(newCandidate.experienceYears),
      currentCtc: newCandidate.currentCtc,
      expectedCtc: newCandidate.expectedCtc,
      stage: 'New Entry',
      notes: newCandidate.notes || 'Applicant registered via direct entry.'
    };

    setCandidates(prev => [added, ...prev]);
    showToast(`Candidate ${newCandidate.name} added to pipeline!`, 'success');
    setShowAddModal(false);
    setNewCandidate({
      name: '',
      phone: '',
      email: '',
      position: 'Advisory Sales Executive',
      department: 'Advisory Sales',
      experienceYears: 2,
      currentCtc: '₹4.5 LPA',
      expectedCtc: '₹6.0 LPA',
      notes: ''
    });
  };

  const handleMoveStage = (candidateId: string, targetStage: Candidate['stage']) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: targetStage } : c));
    if (targetStage === 'Offered') {
      try { confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
    }
    showToast(`Candidate moved to ${targetStage}!`, 'success');
  };

  const scheduledCount = candidates.filter(c => c.stage === 'Scheduled').length;
  const offeredCount = candidates.filter(c => c.stage === 'Offered').length;
  const shortlistedCount = candidates.filter(c => c.stage === 'Shortlisted').length;

  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      c.name.toLowerCase().includes(q) ||
      c.position.toLowerCase().includes(q) ||
      c.phone.includes(q);

    const matchDept = selectedDept === 'all' || c.department === selectedDept;
    const matchStage = currentStage === 'All' || c.stage === currentStage;

    return matchSearch && matchDept && matchStage;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setCurrentStage('All');
  };

  const hasActiveFilters = searchQuery !== '' || selectedDept !== 'all' || currentStage !== 'All';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>HR & Talent</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentStage === 'All' ? 'Recruitment Pipeline' : currentStage}
          </span>
        </div>
      </div>

      {/* Standard Page Header & Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-ref" style={{ margin: 0 }}>Recruitment</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Candidate talent pipeline, interview schedules, evaluations, and offer rollouts.
          </p>
        </div>

        <button 
          type="button"
          className="btn btn-primary action-btn-interactive"
          onClick={() => setShowAddModal(true)}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.45rem', 
            fontSize: '0.86rem', 
            fontWeight: 600,
            height: '38px', 
            borderRadius: '8px',
            padding: '0 1rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <UserPlus size={16} />
          <span>Register Candidate</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--stocketics-blue-500)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Candidates
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {candidates.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            In active hiring funnel
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Interviews Scheduled
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>
            {scheduledCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} /> Upcoming rounds
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Shortlisted
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.25rem' }}>
            {shortlistedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Awaiting final approval
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Offers Rolled Out
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {offeredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Awaiting candidate joining
          </div>
        </div>
      </div>

      {/* Pure Stage Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.4rem', overflowX: 'auto' }}>
        {(['All', 'Scheduled', 'Shortlisted', 'Offered', 'Hold Candidate', 'Reject Candidate'] as const).map(stg => {
          const count = stg === 'All' ? candidates.length : candidates.filter(c => c.stage === stg).length;
          return (
            <button 
              key={stg}
              className={`btn btn-sm ${currentStage === stg ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentStage(stg)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              <span>{stg === 'All' ? 'All Candidates' : stg}</span>
              <span style={{ 
                background: currentStage === stg ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
                padding: '1px 6px', 
                borderRadius: 10, 
                fontSize: '0.72rem' 
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search candidate name, position, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.84rem' }}
              />
            </div>

            <select 
              className="form-select"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="all">All Departments</option>
              <option value="Advisory Sales">Advisory Sales</option>
              <option value="Equity Research">Equity Research</option>
              <option value="Derivatives Desk">Derivatives Desk</option>
              <option value="HR">HR</option>
            </select>

            {hasActiveFilters && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={clearFilters}
                style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredCandidates.length}</strong> of {candidates.length} candidates
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Candidate Info</th>
                <th style={{ padding: '0.85rem 1rem' }}>Position & Desk</th>
                <th style={{ padding: '0.85rem 1rem' }}>Experience</th>
                <th style={{ padding: '0.85rem 1rem' }}>CTC Range</th>
                <th style={{ padding: '0.85rem 1rem' }}>Stage Status</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No candidates found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(cand => (
                  <tr key={cand.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cand.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cand.phone} • {cand.email}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{cand.position}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--stocketics-blue-500)' }}>{cand.department}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {cand.experienceYears} Years
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                      <div>Current: <strong>{cand.currentCtc}</strong></div>
                      <div style={{ color: 'var(--text-muted)' }}>Exp: {cand.expectedCtc}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`delta-badge ${cand.stage === 'Offered' ? 'positive' : ''}`} style={{ 
                        fontSize: '0.72rem',
                        background: cand.stage === 'Offered' ? 'rgba(16, 185, 129, 0.15)' : cand.stage === 'Scheduled' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-alt)',
                        color: cand.stage === 'Offered' ? '#10b981' : cand.stage === 'Scheduled' ? '#0284c7' : 'var(--text-primary)'
                      }}>
                        {cand.stage}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {cand.stage !== 'Offered' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleMoveStage(cand.id, 'Offered')}
                            style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}
                          >
                            Offer Job
                          </button>
                        )}
                        {cand.stage !== 'Shortlisted' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleMoveStage(cand.id, 'Shortlisted')}
                            style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}
                          >
                            Shortlist
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER CANDIDATE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Register New Candidate</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add applicant to recruitment screening pipeline</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Candidate full name"
                    value={newCandidate.name}
                    onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newCandidate.phone}
                    onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Position / Role *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Advisory Sales Executive"
                    value={newCandidate.position}
                    onChange={e => setNewCandidate({ ...newCandidate, position: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department Desk</label>
                  <select 
                    className="form-select"
                    value={newCandidate.department}
                    onChange={e => setNewCandidate({ ...newCandidate, department: e.target.value })}
                  >
                    <option value="Advisory Sales">Advisory Sales</option>
                    <option value="Equity Research">Equity Research</option>
                    <option value="Derivatives Desk">Derivatives Desk</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input 
                    type="number"
                    value={newCandidate.experienceYears}
                    onChange={e => setNewCandidate({ ...newCandidate, experienceYears: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected CTC</label>
                  <input 
                    type="text"
                    placeholder="e.g. ₹6.5 LPA"
                    value={newCandidate.expectedCtc}
                    onChange={e => setNewCandidate({ ...newCandidate, expectedCtc: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Screening Notes</label>
                <textarea 
                  rows={2}
                  className="form-textarea"
                  placeholder="Key strengths, notice period, candidate background..."
                  value={newCandidate.notes}
                  onChange={e => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
