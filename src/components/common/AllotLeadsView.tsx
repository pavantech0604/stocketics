import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Users, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Search, 
  Check, 
  ExternalLink,
  ChevronRight,
  Building2,
  Clock,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AllotLeadsViewProps {
  forcedMode?: 'manager_to_tl' | 'tl_to_employee';
}

export const AllotLeadsView: React.FC<AllotLeadsViewProps> = ({ forcedMode }) => {
  const { 
    role, 
    currentUser, 
    employees, 
    teams,
    getTeamMemberIds,
    advisoryLeads, 
    leadSourcePools, 
    assignmentHistory,
    allotLeadsBySourceToTeamLeader, 
    allotLeadsFromTeamPoolToEmployee,
    addBulkSourceLeads,
    setActiveTab
  } = useApp();

  const isTeamLeader = forcedMode === 'tl_to_employee' || role === 'team_leader';

  // Helper for whitespace-collapsed, case-insensitive source normalization
  const normalizeSource = (s?: string) => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();

  // For Team Leader: get their team & team pool leads
  const myTeam = teams.find(t => t.leaderId === currentUser.id);
  const myTeamPoolLeads = advisoryLeads.filter(
    l => l.teamLeaderId === currentUser.id && l.isTeamPool === true
  );

  // Available sources list
  // For Manager: from global leadSourcePools, accurately taking the maximum of real unassigned records and pool.availableCount
  const managerSources = leadSourcePools.map(pool => {
    const normPool = normalizeSource(pool.sourceName);
    const realCount = advisoryLeads.filter(l => 
      normalizeSource(l.source) === normPool && 
      !l.teamLeaderId && 
      !l.assignedToId && 
      l.status !== 'Converted' && 
      l.status !== 'Lost'
    ).length;
    return {
      ...pool,
      availableCount: Math.max(pool.availableCount, realCount)
    };
  });
  
  // Compute TL team pool sources
  const tlSourcesMap: Record<string, number> = {};
  myTeamPoolLeads.forEach(l => {
    const norm = normalizeSource(l.source);
    const matchedPool = leadSourcePools.find(p => normalizeSource(p.sourceName) === norm);
    const s = matchedPool ? matchedPool.sourceName : (l.source || 'General Pool');
    tlSourcesMap[s] = (tlSourcesMap[s] || 0) + 1;
  });

  const [selectedSource, setSelectedSource] = useState<string>(() => {
    if (isTeamLeader) {
      return Object.keys(tlSourcesMap)[0] || 'D WEB KANNADA';
    }
    const lastUploaded = sessionStorage.getItem('apex_crm_last_uploaded_source');
    if (lastUploaded) {
      const match = managerSources.find(s => normalizeSource(s.sourceName) === normalizeSource(lastUploaded));
      if (match) return match.sourceName;
    }
    return managerSources[0]?.sourceName || 'D WEB KANNADA';
  });

  // Available count for the selected source
  const availableCount = isTeamLeader
    ? (tlSourcesMap[selectedSource] || 0)
    : (managerSources.find(s => normalizeSource(s.sourceName) === normalizeSource(selectedSource))?.availableCount || 0);

  // Recipient selection
  // Genuine frontline Team Leaders & Squad Leaders, strictly EXCLUDING the currently logged-in user (e.g. Manager Arjun)
  const teamLeaders = employees.filter(e => {
    // 1. NEVER show the currently logged-in user allocating leads
    if (e.id === currentUser.id || e.name === currentUser.name) return false;
    
    // 2. Exclude top-level directors or VPs unless they are an active frontline squad leader who is NOT the current user
    if ((e.role?.includes('Director') || e.title?.includes('Director') || e.title?.includes('VP')) && !teams.some(t => t.leaderId === e.id)) {
      return false;
    }
    
    // 3. Match valid Team Leaders
    const isExplicitLeader = e.role === 'Team Leader' || e.role === 'Advisory Lead' || e.role?.toLowerCase().includes('leader');
    const leadsAnActiveTeam = teams.some(t => t.leaderId === e.id && t.status === 'Active');
    const isKnownTL = e.id === 'emp-011' || e.id === 'emp-006' || e.id === 'emp-012';

    return (isExplicitLeader || leadsAnActiveTeam || isKnownTL) && ['Active', 'Remote'].includes(e.status);
  });

  const teamMembers = (isTeamLeader && myTeam
    ? employees.filter(e => getTeamMemberIds(currentUser.id).includes(e.id) && ['Active', 'Remote'].includes(e.status))
    : employees.filter(e => (e.department === 'Advisory Sales' || e.department === 'Equity Research') && ['Active', 'Remote'].includes(e.status) && !e.title?.includes('VP') && !e.title?.includes('Director'))
  ).filter(e => e.id !== currentUser.id && e.name !== currentUser.name);

  // Candidate recipients based on role
  const [recipientType, setRecipientType] = useState<'team_leader' | 'employee'>(
    isTeamLeader ? 'employee' : 'team_leader'
  );

  const candidateList = isTeamLeader
    ? teamMembers
    : (recipientType === 'team_leader' ? teamLeaders : teamMembers);

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(() => {
    const initialList = isTeamLeader ? teamMembers : teamLeaders;
    return initialList[0]?.id || '';
  });

  // Keep selectedRecipientId in sync if candidateList updates or switches mode
  useEffect(() => {
    if (!selectedRecipientId || !candidateList.some(c => c.id === selectedRecipientId)) {
      if (candidateList.length > 0) {
        setSelectedRecipientId(candidateList[0].id);
      } else {
        setSelectedRecipientId('');
      }
    }
  }, [candidateList, selectedRecipientId]);

  // Keep selectedSource in sync if a new pool was just uploaded
  useEffect(() => {
    if (!isTeamLeader) {
      const lastUploaded = sessionStorage.getItem('apex_crm_last_uploaded_source');
      if (lastUploaded && managerSources.some(s => normalizeSource(s.sourceName) === normalizeSource(lastUploaded))) {
        setSelectedSource(lastUploaded);
        sessionStorage.removeItem('apex_crm_last_uploaded_source');
      } else if (!managerSources.some(s => normalizeSource(s.sourceName) === normalizeSource(selectedSource))) {
        if (managerSources.length > 0) setSelectedSource(managerSources[0].sourceName);
      }
    }
  }, [managerSources, isTeamLeader, selectedSource]);
  const [numberOfLeads, setNumberOfLeads] = useState<string>('500');
  const [successBanner, setSuccessBanner] = useState<{ count: number; recipientName: string; source: string; time: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeSubView, setActiveSubView] = useState<'allot' | 'history'>('allot');
  const [historySearch, setHistorySearch] = useState<string>('');

  const selectedCandidate = candidateList.find(c => c.id === selectedRecipientId);
  const candidateSquad = selectedCandidate ? teams.find(t => t.leaderId === selectedCandidate.id || t.id === selectedCandidate.department) : null;
  const currentLeadsOnHand = selectedCandidate ? advisoryLeads.filter(l => l.assignedToId === selectedCandidate.id || (selectedCandidate.role?.includes('Leader') && l.teamLeaderId === selectedCandidate.id && l.isTeamPool)).length : 0;

  // Submission handler with smart auto-provisioning fallback
  const handleExecuteAllotment = (countToAllot: number, autoProvision: boolean = false) => {
    setErrorMsg(null);

    if (!Number.isInteger(countToAllot) || countToAllot <= 0) {
      setErrorMsg('Please enter a valid positive number of leads.');
      return;
    }

    if (!selectedRecipientId) {
      setErrorMsg('Please select a recipient (Team Leader / Employee).');
      return;
    }

    if (!autoProvision && countToAllot > availableCount) {
      setErrorMsg(`Cannot allot ${countToAllot} leads. Only ${availableCount} available in "${selectedSource}".`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        if (autoProvision && countToAllot > availableCount) {
          const shortage = countToAllot - availableCount;
          addBulkSourceLeads(selectedSource, shortage);
        }

        if (isTeamLeader) {
          const res = allotLeadsFromTeamPoolToEmployee(currentUser.id, selectedSource, selectedRecipientId, countToAllot);
          if (res.success) {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            setSuccessBanner({
              count: countToAllot,
              recipientName: selectedCandidate?.name || 'Employee',
              source: selectedSource,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setNumberOfLeads('');
          } else {
            setErrorMsg(res.message);
          }
        } else {
          const res = allotLeadsBySourceToTeamLeader(selectedSource, selectedRecipientId, countToAllot);
          if (res.success) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            setSuccessBanner({
              count: countToAllot,
              recipientName: selectedCandidate?.name || 'Team Leader',
              source: selectedSource,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setNumberOfLeads('');
          } else {
            setErrorMsg(res.message);
          }
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to complete lead allotment.');
      } finally {
        setIsSubmitting(false);
      }
    }, 250);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(numberOfLeads);
    handleExecuteAllotment(count, false);
  };

  const filteredHistory = assignmentHistory.filter(item => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      (item.source && item.source.toLowerCase().includes(q)) ||
      (item.toName && item.toName.toLowerCase().includes(q)) ||
      (item.fromName && item.fromName.toLowerCase().includes(q)) ||
      (item.assignedByName && item.assignedByName.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: '24px 28px', background: '#f8fafc', minHeight: '100%', fontFamily: 'inherit' }}>
      
      {/* ── Top Bar & Breadcrumb Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#64748b' }}>
          <span 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#0284c7', fontWeight: 600 }} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </span>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{isTeamLeader ? 'Team Pool Lead Allotment' : 'Executive Lead Allotment Engine'}</span>
        </div>

        {/* View Switcher Pills */}
        <div style={{ display: 'flex', gap: '6px', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveSubView('allot')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              background: activeSubView === 'allot' ? '#ffffff' : 'transparent',
              color: activeSubView === 'allot' ? '#0f172a' : '#64748b',
              boxShadow: activeSubView === 'allot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={14} color={activeSubView === 'allot' ? '#0284c7' : '#64748b'} />
            Allot Leads Form
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '7px',
              cursor: 'pointer',
              background: activeSubView === 'history' ? '#ffffff' : 'transparent',
              color: activeSubView === 'history' ? '#0f172a' : '#64748b',
              boxShadow: activeSubView === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={14} color={activeSubView === 'history' ? '#0284c7' : '#64748b'} />
            Assignment Audit ({assignmentHistory.length})
          </button>
        </div>
      </div>

      {/* ── Main Allot View ── */}
      {activeSubView === 'allot' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Allocator Persona & Scope Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'} 
                  alt={currentUser.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }}
                />
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0f172a' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>{currentUser.name}</span>
                  <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    {isTeamLeader ? 'Team Leader' : 'Floor Authority / Manager'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {isTeamLeader 
                    ? `Distributing team pool leads to your reporting squad executives` 
                    : `Distributing master campaign pools downward to Team Leaders · Self-assignment is excluded`
                  }
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ShieldCheck size={16} color="#38bdf8" />
              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>
                {isTeamLeader ? `${candidateList.length} Reporting Advisors Available` : `${teamLeaders.length} Team Leaders Eligible to Receive Leads`}
              </span>
            </div>
          </div>
          
          {/* Quick Source Pool Chips (Interactive Carousel) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                Select Active Campaign Pool:
              </span>
              <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 600 }}>
                {managerSources.reduce((acc, s) => acc + s.availableCount, 0).toLocaleString()} Total Leads Available Across All Sources
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {(isTeamLeader ? Object.keys(tlSourcesMap) : managerSources.map(s => s.sourceName)).map(srcName => {
                const isSelected = normalizeSource(selectedSource) === normalizeSource(srcName);
                const poolItem = managerSources.find(s => normalizeSource(s.sourceName) === normalizeSource(srcName));
                const poolCount = isTeamLeader ? (tlSourcesMap[srcName] || 0) : (poolItem?.availableCount || 0);

                return (
                  <button
                    key={srcName}
                    type="button"
                    onClick={() => setSelectedSource(srcName)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      minWidth: '150px',
                      flexShrink: 0,
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0369a1' : '#1e293b' }}>
                        {srcName}
                      </span>
                      {isSelected && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0284c7' }} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: poolCount > 0 ? '#166534' : '#dc2626' }}>
                        {poolCount.toLocaleString()} leads
                      </span>
                      {poolItem?.language && (
                        <span style={{ fontSize: '10px', background: '#e2e8f0', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                          {poolItem.language}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Banner matching Reference */}
          {successBanner && (
            <div style={{
              background: '#f0fdf4',
              color: '#166534',
              border: '1.5px solid #86efac',
              borderRadius: '10px',
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} color="#16a34a" strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>
                    {successBanner.count} Leads Allotted Successfully!
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#15803d', marginTop: '2px' }}>
                    Assigned from <strong>{successBanner.source}</strong> to <strong>{successBanner.recipientName}</strong> at {successBanner.time}.
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View in Pipeline <ArrowRight size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setSuccessBanner(null)}
                  style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Interactive Error / Provision Warning */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              color: '#991b1b',
              border: '1.5px solid #fecaca',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
                  <AlertCircle size={18} color="#b91c1c" />
                  <span>{errorMsg}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setErrorMsg(null)}
                  style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '18px' }}
                >
                  ×
                </button>
              </div>

              {Number(numberOfLeads) > availableCount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px', borderTop: '1px solid #fee2e2' }}>
                  <span style={{ fontSize: '12px', color: '#7f1d1d' }}>Quick Resolutions:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNumberOfLeads(String(availableCount));
                      handleExecuteAllotment(availableCount, false);
                    }}
                    disabled={availableCount <= 0}
                    style={{
                      padding: '5px 12px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '5px',
                      cursor: availableCount > 0 ? 'pointer' : 'not-allowed',
                      color: '#0f172a'
                    }}
                  >
                    Allot Maximum Available ({availableCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteAllotment(Number(numberOfLeads), true)}
                    style={{
                      padding: '5px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: '#b91c1c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Auto-Provision & Allot All {numberOfLeads} Leads
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Allot Leads Interactive Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.06)' }}>
            
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffffff' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.02em' }}>
                  {isTeamLeader ? 'Team Pool Lead Allocation Form' : 'Executive Lead Allotment Form'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#e0f2fe' }}>
                  Select source pool, recipient, and amount to transfer lead ownership immediately.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '6px' }}>
                <Layers size={16} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Pool: {availableCount.toLocaleString()} Leads</span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: '28px 32px' }}>
              
              {/* Field 1: Lead Source Dropdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center', marginBottom: '22px', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 700, display: 'block' }}>
                    Lead Source <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Originating campaign or vendor pool</span>
                </div>
                <div>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      padding: '10px 14px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    {isTeamLeader ? (
                      Object.keys(tlSourcesMap).length > 0 ? (
                        Object.entries(tlSourcesMap).map(([src, cnt]) => (
                          <option key={src} value={src}>
                            {src} ({cnt} available in team pool)
                          </option>
                        ))
                      ) : (
                        managerSources.map(sp => (
                          <option key={sp.sourceName} value={sp.sourceName}>
                            {sp.sourceName} (Team Pool: 0 available)
                          </option>
                        ))
                      )
                    ) : (
                      managerSources.map(sp => (
                        <option key={sp.sourceName} value={sp.sourceName}>
                          {sp.sourceName} ({sp.availableCount.toLocaleString()} leads available)
                        </option>
                      ))
                    )}
                  </select>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                    Inventory in pool: <strong style={{ color: availableCount > 0 ? '#166534' : '#ef4444' }}>{availableCount.toLocaleString()} leads ready to assign</strong>
                  </div>
                </div>
              </div>

              {/* Mode switch for Manager: Assign to Team Leader vs Direct to Employee */}
              {!isTeamLeader && (
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center', marginBottom: '22px', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 700, display: 'block' }}>
                      Target Role <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Squad allocation or direct advisor</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', background: recipientType === 'team_leader' ? '#f0f9ff' : '#ffffff', border: recipientType === 'team_leader' ? '1.5px solid #0284c7' : '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '6px' }}>
                      <input 
                        type="radio" 
                        name="recipientType" 
                        checked={recipientType === 'team_leader'} 
                        onChange={() => { setRecipientType('team_leader'); setSelectedRecipientId(''); }} 
                      />
                      <span><strong>Team Leaders</strong> (Squad Pool Distribution)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', background: recipientType === 'employee' ? '#f0f9ff' : '#ffffff', border: recipientType === 'employee' ? '1.5px solid #0284c7' : '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '6px' }}>
                      <input 
                        type="radio" 
                        name="recipientType" 
                        checked={recipientType === 'employee'} 
                        onChange={() => { setRecipientType('employee'); setSelectedRecipientId(''); }} 
                      />
                      <span><strong>Direct Reps</strong> (Direct Employee Allotment)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Field 2: Recipient Selection with Rich Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'flex-start', marginBottom: '22px', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 700, display: 'block' }}>
                    {isTeamLeader ? 'Select Employee' : (recipientType === 'team_leader' ? 'Select Team Leader' : 'Select Employee')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {isTeamLeader ? 'Squad advisor receiving lead' : 'Team Leader receiving squad allotment'}
                  </span>
                </div>
                <div>
                  {/* Interactive Quick-Pick Visual Cards for Recipients */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px', marginBottom: '14px', maxWidth: '640px' }}>
                    {candidateList.map(cand => {
                      const isSelected = cand.id === selectedRecipientId;
                      const squad = teams.find(t => t.leaderId === cand.id);
                      const count = advisoryLeads.filter(l => l.assignedToId === cand.id || (cand.role?.includes('Leader') && l.teamLeaderId === cand.id && l.isTeamPool)).length;
                      
                      return (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedRecipientId(cand.id)}
                          style={{
                            border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                            background: isSelected ? '#f0f9ff' : '#ffffff',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none',
                            position: 'relative'
                          }}
                        >
                          <div style={{ position: 'relative' }}>
                            <img
                              src={cand.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                              alt={cand.name}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1' }}
                            />
                            {isSelected && (
                              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#0284c7', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff' }}>
                                <Check size={10} color="#fff" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#0369a1' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cand.name}
                              </span>
                              <span style={{ fontSize: '11px', background: isSelected ? '#0284c7' : '#f1f5f9', color: isSelected ? '#ffffff' : '#475569', padding: '1px 6px', borderRadius: '10px', fontWeight: 700, flexShrink: 0 }}>
                                {count} on hand
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                              {squad ? squad.name : (cand.title || cand.role)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Standard Form Dropdown Selector */}
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '640px',
                      padding: '10px 14px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#ffffff',
                      color: selectedRecipientId ? '#0f172a' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Choose Recipient ({candidateList.length} Eligible) --</option>
                    {candidateList.map(cand => {
                      const squad = teams.find(t => t.leaderId === cand.id);
                      const count = advisoryLeads.filter(l => l.assignedToId === cand.id || (cand.role?.includes('Leader') && l.teamLeaderId === cand.id && l.isTeamPool)).length;
                      return (
                        <option key={cand.id} value={cand.id}>
                          {cand.name} · {squad ? squad.name : (cand.title || cand.role)} — ({count} leads on hand)
                        </option>
                      );
                    })}
                  </select>

                  {/* Recipient Snapshot Card with Real-time Balance */}
                  {selectedCandidate && (
                    <div style={{ marginTop: '12px', maxWidth: '640px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={selectedCandidate.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
                            alt={selectedCandidate.name} 
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }} 
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{selectedCandidate.name}</span>
                              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                {selectedCandidate.role}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {candidateSquad ? candidateSquad.name : (selectedCandidate.title || selectedCandidate.department)}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Current Workload</div>
                          <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 800 }}>
                            {currentLeadsOnHand} Active Leads
                          </span>
                        </div>
                      </div>

                      {/* Live Allocation Projection Bar */}
                      <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#475569' }}>
                          After transferring <strong>{Number(numberOfLeads) || 0} leads</strong> from <em>{selectedSource}</em>:
                        </span>
                        <span style={{ fontWeight: 800, color: '#166534' }}>
                          Squad will hold {currentLeadsOnHand + (Number(numberOfLeads) || 0)} leads
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Field 3: Number Of Leads & Presets */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'flex-start', marginBottom: '26px', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 700, display: 'block' }}>
                    Number Of Leads <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Batch size to transfer</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter lead count (e.g. 500)"
                    value={numberOfLeads}
                    onChange={(e) => setNumberOfLeads(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />

                  {/* Preset Pills */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Quick Presets:</span>
                    {[50, 100, 250, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setNumberOfLeads(String(amt))}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          border: Number(numberOfLeads) === amt ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                          borderRadius: '5px',
                          background: Number(numberOfLeads) === amt ? '#e0f2fe' : '#ffffff',
                          cursor: 'pointer',
                          color: Number(numberOfLeads) === amt ? '#0369a1' : '#334155'
                        }}
                      >
                        +{amt}
                      </button>
                    ))}
                    {availableCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setNumberOfLeads(String(availableCount))}
                        style={{
                          padding: '4px 12px',
                          fontSize: '11.5px',
                          border: '1px solid #bae6fd',
                          borderRadius: '5px',
                          background: '#f0f9ff',
                          cursor: 'pointer',
                          color: '#0284c7',
                          fontWeight: 800
                        }}
                      >
                        All Available ({availableCount.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <div />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '11px 32px',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                      transition: 'all 0.15s ease',
                      opacity: isSubmitting ? 0.7 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sparkles size={16} />
                    {isSubmitting ? 'Allotting Leads...' : `Confirm & Allot ${numberOfLeads || 0} Leads`}
                  </button>

                  {selectedCandidate && (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Transferring to <strong>{selectedCandidate.name}</strong>
                    </span>
                  )}
                </div>
              </div>

            </form>

          </div>

          {/* Live System Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Available Campaign Pool</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                {managerSources.reduce((acc, p) => acc + p.availableCount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>Across {leadSourcePools.length} Active Regional Channels</div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Team Pool Squad Leads</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                {advisoryLeads.filter(l => l.isTeamPool).length.toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>Allotted to Team Leaders awaiting rep assignment</div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Calling Pipeline</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {advisoryLeads.filter(l => !l.isTeamPool && l.assignedToId).length.toLocaleString()}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>Active with advisory sales reps</div>
            </div>
          </div>

        </div>
      )}

      {/* ── Assignment Audit SubView ── */}
      {activeSubView === 'history' && (
        <div style={{ maxWidth: '1080px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Lead Assignment Audit Trail
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Complete verifiable log of every manager allotment and team leader delegation.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px' }}>
                <Search size={14} color="#64748b" />
                <input 
                  type="text"
                  placeholder="Filter history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '180px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Source Pool</th>
                  <th style={{ padding: '10px 14px' }}>Assigned By</th>
                  <th style={{ padding: '10px 14px' }}>Recipient</th>
                  <th style={{ padding: '10px 14px' }}>Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Leads Allotted</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      No allotment history matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>{item.assignedAt}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0284c7' }}>{item.source}</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>{item.assignedByName || item.fromName || 'Floor Manager'}</td>
                      <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 600 }}>{item.toName}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: item.assignmentType === 'manager_to_team' ? '#e0f2fe' : item.assignmentType === 'team_to_employee' ? '#dcfce7' : '#f3e8ff',
                          color: item.assignmentType === 'manager_to_team' ? '#0369a1' : item.assignmentType === 'team_to_employee' ? '#15803d' : '#7e22ce'
                        }}>
                          {item.assignmentType === 'manager_to_team' ? 'Manager → Team' : item.assignmentType === 'team_to_employee' ? 'TL → Rep' : 'Reassignment'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        {item.leadCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllotLeadsView;
