import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  UserPlus, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  XCircle, 
  Search, 
  Plus, 
  FileText, 
  Mail, 
  Phone, 
  Briefcase,
  DollarSign,
  ChevronRight,
  Filter
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
    experienceYears: 7,
    currentCtc: '₹14 LPA',
    expectedCtc: '₹22 LPA',
    stage: 'Reject Candidate',
    notes: 'CTC expectation beyond authorized budget for the position.'
  }
];

export const HRRecruitmentView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  // Map activeTab to stage
  const getStageFromTab = (): Candidate['stage'] => {
    if (activeTab === 'recruitment-scheduled') return 'Scheduled';
    if (activeTab === 'recruitment-offered') return 'Offered';
    if (activeTab === 'recruitment-shortlisted') return 'Shortlisted';
    if (activeTab === 'recruitment-hold') return 'Hold Candidate';
    if (activeTab === 'recruitment-reject') return 'Reject Candidate';
    return 'New Entry';
  };

  const [currentStage, setCurrentStage] = useState<Candidate['stage']>(getStageFromTab());
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState('');

  // New Candidate Form State
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
    setCurrentStage(getStageFromTab());
  }, [activeTab]);

  const handleTabChange = (stage: Candidate['stage'], tabId: string) => {
    setCurrentStage(stage);
    setActiveTab(tabId);
  };

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
    showToast(`Candidate ${newCandidate.name} added to Recruitment pipeline!`, 'success');
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

  const filteredCandidates = candidates.filter(c => {
    const matchSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    
    if (currentStage === 'New Entry') return matchSearch; // Shows all / new entries
    return matchSearch && c.stage === currentStage;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Recruitment</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>{currentStage}</span>
        </div>
      </div>

      {/* Header & Back Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-ref" style={{ margin: 0 }}>
            {currentStage === 'New Entry' ? 'Enquiry' : 'Recruitment'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>

          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('dashboard')}
            style={{ 
              background: '#00a8ff', 
              borderColor: '#00a8ff', 
              color: '#ffffff', 
              fontWeight: 600, 
              padding: '0.45rem 1.25rem', 
              borderRadius: '4px',
              fontSize: '0.88rem',
              height: '36px'
            }}
          >
            &lt;&lt; Back
          </button>
        </div>
      </div>

      {/* Sub-Options Nav Tabs: Exact Names from Screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${currentStage === 'New Entry' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('New Entry', 'recruitment-new-entry')}
        >
          <Plus size={14} /> New Entry
        </button>
        <button 
          className={`btn btn-sm ${currentStage === 'Scheduled' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('Scheduled', 'recruitment-scheduled')}
        >
          <Calendar size={14} /> Scheduled ({candidates.filter(c => c.stage === 'Scheduled').length})
        </button>
        <button 
          className={`btn btn-sm ${currentStage === 'Offered' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('Offered', 'recruitment-offered')}
        >
          <CheckCircle2 size={14} /> Offered ({candidates.filter(c => c.stage === 'Offered').length})
        </button>
        <button 
          className={`btn btn-sm ${currentStage === 'Shortlisted' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('Shortlisted', 'recruitment-shortlisted')}
        >
          <Clock size={14} /> Shortlisted ({candidates.filter(c => c.stage === 'Shortlisted').length})
        </button>
        <button 
          className={`btn btn-sm ${currentStage === 'Hold Candidate' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('Hold Candidate', 'recruitment-hold')}
        >
          <PauseCircle size={14} /> Hold Candidate ({candidates.filter(c => c.stage === 'Hold Candidate').length})
        </button>
        <button 
          className={`btn btn-sm ${currentStage === 'Reject Candidate' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('Reject Candidate', 'recruitment-reject')}
        >
          <XCircle size={14} /> Reject Candidate ({candidates.filter(c => c.stage === 'Reject Candidate').length})
        </button>
      </div>

      {/* Stage 1: New Entry matching Image 9 (Add New Candidate) */}
      {currentStage === 'New Entry' && (
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '6px', 
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.75rem' }}>
            Add New Candidate
          </h2>

          <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem 3rem' }}>
              {/* Left Column Form Fields (Image 9) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Name</label>
                  <input 
                    type="text"
                    required
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Email</label>
                  <input 
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Gender</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="radio" name="gender" defaultChecked />
                      <span>Male</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="radio" name="gender" />
                      <span>Female</span>
                    </label>
                  </div>
                </div>

                {/* Interview Schedule Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                    Interview Schedule Date
                  </label>
                  <input 
                    type="text"
                    defaultValue="2026-09-10 11:00 AM"
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Documents Checkboxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Documents</label>
                  <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="checkbox" defaultChecked /> 10th
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="checkbox" defaultChecked /> 12th
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="checkbox" defaultChecked /> UG
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="checkbox" /> PG
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input type="checkbox" /> Certificate
                    </label>
                  </div>
                </div>

                {/* Current CTC */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Current CTC</label>
                  <input 
                    type="text"
                    value={newCandidate.currentCtc}
                    onChange={(e) => setNewCandidate({ ...newCandidate, currentCtc: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Experience (Years & Months) */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Experience</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select className="input-field" style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: 1 }}>
                      <option value="">Select (Years)</option>
                      <option value="0">0 Years (Fresher)</option>
                      <option value="1">1 Year</option>
                      <option value="2" selected>2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="4">4 Years</option>
                      <option value="5+">5+ Years</option>
                    </select>
                    <select className="input-field" style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: 1 }}>
                      <option value="">Select (Months)</option>
                      <option value="0">0 Months</option>
                      <option value="3">3 Months</option>
                      <option value="6" selected>6 Months</option>
                      <option value="9">9 Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column Form Fields (Image 9) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Profile */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Profile</label>
                  <select 
                    value={newCandidate.position}
                    onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select</option>
                    <option value="Advisory Sales Executive">Advisory Sales Executive</option>
                    <option value="Equity Research Analyst">Equity Research Analyst</option>
                    <option value="Derivatives Options Specialist">Derivatives Options Specialist</option>
                    <option value="Business Development Associate">Business Development Associate</option>
                    <option value="Telecaller Advisory">Telecaller Advisory</option>
                    <option value="HR Recruiter">HR Recruiter</option>
                  </select>
                </div>

                {/* Mobile */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Mobile</label>
                  <input 
                    type="text"
                    required
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Date of Birth */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Date of Birth</label>
                  <input 
                    type="text"
                    defaultValue="1998-05-14"
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Communication */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Communication</label>
                  <select 
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select</option>
                    <option value="Excellent">Fluent / Excellent</option>
                    <option value="Good" selected>Good</option>
                    <option value="Average">Average</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                {/* Current Company */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Current Company</label>
                  <input 
                    type="text"
                    defaultValue="Angel One Securities"
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* Expectation */}
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Expectation</label>
                  <input 
                    type="text"
                    value={newCandidate.expectedCtc}
                    onChange={(e) => setNewCandidate({ ...newCandidate, expectedCtc: e.target.value })}
                    className="input-field"
                    style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ 
                  background: '#00a8ff', 
                  borderColor: '#00a8ff', 
                  color: '#ffffff', 
                  padding: '0.55rem 2rem', 
                  fontWeight: 700,
                  borderRadius: '4px'
                }}
              >
                Submit Candidate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CANDIDATE CARDS LIST */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '380px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Search candidates by name, position, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredCandidates.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No candidates in stage: {currentStage}
          </div>
        ) : (
          filteredCandidates.map(cand => (
            <div key={cand.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {cand.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--stocketics-blue-500)', fontWeight: 600, marginTop: '0.15rem' }}>
                    {cand.position}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {cand.phone} • {cand.email}
                  </div>
                </div>

                <span className="delta-badge" style={{ 
                  background: cand.stage === 'Offered' ? 'rgba(16, 185, 129, 0.12)' : cand.stage === 'Reject Candidate' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                  color: cand.stage === 'Offered' ? '#047857' : cand.stage === 'Reject Candidate' ? '#ef4444' : '#0284c7',
                  fontWeight: 700
                }}>
                  {cand.stage}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Experience:</span> <strong>{cand.experienceYears} Years</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Expected CTC:</span> <strong style={{ color: 'var(--success)' }}>{cand.expectedCtc}</strong>
                </div>
                {cand.interviewDate && (
                  <div style={{ gridColumn: '1 / -1', color: 'var(--warning)', fontWeight: 700 }}>
                    Interview: {cand.interviewDate}
                  </div>
                )}
                {cand.offeredCtc && (
                  <div style={{ gridColumn: '1 / -1', color: 'var(--success)', fontWeight: 700 }}>
                    Offer: {cand.offeredCtc}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                "{cand.notes}"
              </div>

              {/* Quick Action Stage Buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                {cand.stage !== 'Scheduled' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleMoveStage(cand.id, 'Scheduled')}>
                    Schedule
                  </button>
                )}
                {cand.stage !== 'Shortlisted' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleMoveStage(cand.id, 'Shortlisted')}>
                    Shortlist
                  </button>
                )}
                {cand.stage !== 'Offered' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleMoveStage(cand.id, 'Offered')}>
                    Offer Letter
                  </button>
                )}
                {cand.stage !== 'Hold Candidate' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleMoveStage(cand.id, 'Hold Candidate')}>
                    Hold
                  </button>
                )}
                {cand.stage !== 'Reject Candidate' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleMoveStage(cand.id, 'Reject Candidate')}>
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
