import React, { useState } from 'react';
import { useApp } from '../../state/store';

interface AllotLeadsViewProps {
  forcedMode?: 'manager_to_tl' | 'tl_to_employee';
}

export const AllotLeadsView: React.FC<AllotLeadsViewProps> = ({ forcedMode }) => {
  const { 
    role, 
    currentUser, 
    employees, 
    teams,
    advisoryLeads, 
    leadSourcePools, 
    assignmentHistory,
    allotLeadsBySourceToTeamLeader, 
    allotLeadsFromTeamPoolToEmployee,
    setActiveTab
  } = useApp();

  const isTeamLeader = forcedMode === 'tl_to_employee' || role === 'team_leader';

  // For Team Leader: get their team & team pool leads
  const myTeam = teams.find(t => t.leaderId === currentUser.id);
  const myTeamPoolLeads = advisoryLeads.filter(
    l => l.teamLeaderId === currentUser.id && l.isTeamPool === true
  );

  // Available sources list
  // For Manager: from global leadSourcePools
  // For Team Leader: computed from myTeamPoolLeads or default sources
  const managerSources = leadSourcePools;
  
  // Compute TL team pool sources
  const tlSourcesMap: Record<string, number> = {};
  myTeamPoolLeads.forEach(l => {
    const s = l.source || 'General Pool';
    tlSourcesMap[s] = (tlSourcesMap[s] || 0) + 1;
  });

  const [selectedSource, setSelectedSource] = useState<string>(
    isTeamLeader 
      ? Object.keys(tlSourcesMap)[0] || 'D WEB KANNADA' 
      : (managerSources[0]?.sourceName || 'D WEB KANNADA')
  );

  // Available count for the selected source
  const availableCount = isTeamLeader
    ? (tlSourcesMap[selectedSource] || 0)
    : (managerSources.find(s => s.sourceName === selectedSource)?.availableCount || 0);

  // Recipient selection
  // Manager: Team Leaders (or all active sales employees)
  // Team Leader: Members of their squad
  const teamLeaders = employees.filter(e => 
    e.role === 'Team Leader' || e.id === 'emp-011' || teams.some(t => t.leaderId === e.id)
  );

  const teamMembers = isTeamLeader && myTeam
    ? employees.filter(e => {
        // Find if in team
        const mySquad = teams.find(t => t.leaderId === currentUser.id);
        return mySquad && e.id !== currentUser.id;
      })
    : employees.filter(e => e.department === 'Advisory Sales' || e.department === 'Equity Research');

  // Candidate recipients based on role
  const [recipientType, setRecipientType] = useState<'team_leader' | 'employee'>(
    isTeamLeader ? 'employee' : 'team_leader'
  );

  const candidateList = isTeamLeader
    ? teamMembers
    : (recipientType === 'team_leader' ? (teamLeaders.length > 0 ? teamLeaders : employees) : employees);

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [numberOfLeads, setNumberOfLeads] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeSubView, setActiveSubView] = useState<'allot' | 'history'>('allot');

  // Submission handler
  const handleAllot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const count = parseInt(numberOfLeads, 10);
    if (isNaN(count) || count <= 0) {
      setErrorMsg('Please enter a valid positive number of leads.');
      return;
    }

    if (!selectedRecipientId) {
      setErrorMsg('Please select a recipient (Employee / Team Leader).');
      return;
    }

    if (availableCount > 0 && count > availableCount) {
      setErrorMsg(`Cannot allot ${count} leads. Only ${availableCount} available in "${selectedSource}".`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (isTeamLeader) {
        // TL allotting from pool to employee
        const res = allotLeadsFromTeamPoolToEmployee(currentUser.id, selectedSource, selectedRecipientId, count);
        if (res.success) {
          setSuccessBanner(`${count} Lead Alloted Successfully`);
          setNumberOfLeads('');
        } else {
          setErrorMsg(res.message);
        }
      } else {
        // Manager allotting by source to Team Leader
        const res = allotLeadsBySourceToTeamLeader(selectedSource, selectedRecipientId, count);
        if (res.success) {
          setSuccessBanner(`${count} Lead Alloted Successfully`);
          setNumberOfLeads('');
        } else {
          setErrorMsg(res.message);
        }
      }
      setIsSubmitting(false);
    }, 300);
  };

  const handleQuickPreset = (amount: number) => {
    setNumberOfLeads(String(amount));
  };

  return (
    <div style={{ padding: '20px 24px', background: '#f8fafc', minHeight: '100%', fontFamily: 'inherit' }}>
      
      {/* ── Breadcrumb & Top Bar matching Screenshot 1 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0284c7' }} onClick={() => setActiveTab('dashboard')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dashboard
          </span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Allot Leads</span>
        </div>

        {/* Action Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveSubView('allot')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: activeSubView === 'allot' ? '#ffffff' : 'transparent',
              color: activeSubView === 'allot' ? '#0f172a' : '#64748b',
              boxShadow: activeSubView === 'allot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Allot Leads Form
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('history')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: activeSubView === 'history' ? '#ffffff' : 'transparent',
              color: activeSubView === 'history' ? '#0f172a' : '#64748b',
              boxShadow: activeSubView === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Assignment Audit ({assignmentHistory.length})
          </button>
        </div>
      </div>

      {/* ── Main Allot View ── */}
      {activeSubView === 'allot' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header Title Bar */}
          <div style={{ background: '#dbeafe', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', padding: '12px 20px', borderBottom: '1px solid #bfdbfe' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e3a8a' }}>
              {isTeamLeader ? 'Allot Team Leads' : 'Allot Leads'}
            </h2>
          </div>

          {/* Success Banner matching Reference Screenshot 1 & 3 */}
          {successBanner && (
            <div style={{
              background: '#d1e7dd',
              color: '#0f5132',
              border: '1px solid #badbcc',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{successBanner}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSuccessBanner(null)}
                style={{ background: 'none', border: 'none', color: '#0f5132', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>⚠️ {errorMsg}</span>
              <button 
                type="button" 
                onClick={() => setErrorMsg(null)}
                style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '16px' }}
              >
                ×
              </button>
            </div>
          )}

          {/* Allot Leads Form Card (Matching Screenshot Form Exactly) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            
            <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#334155' }}>
              Allot Leads
            </h3>

            <form onSubmit={handleAllot}>
              
              {/* Field 1: Lead Source * */}
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
                <label style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  Lead Source <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
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
                            {src} ({cnt})
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
                          {sp.sourceName} ({sp.availableCount})
                        </option>
                      ))
                    )}
                  </select>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Available in pool: <strong style={{ color: availableCount > 0 ? '#0284c7' : '#ef4444' }}>{availableCount} leads</strong>
                  </div>
                </div>
              </div>

              {/* Mode switch for Manager: Assign to Team Leader vs Direct to Employee */}
              {!isTeamLeader && (
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
                  <label style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                    Target Role
                  </label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="recipientType" 
                        checked={recipientType === 'team_leader'} 
                        onChange={() => { setRecipientType('team_leader'); setSelectedRecipientId(''); }} 
                      />
                      <span><strong>Team Leaders</strong> (Squad Pool Allocation)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="recipientType" 
                        checked={recipientType === 'employee'} 
                        onChange={() => { setRecipientType('employee'); setSelectedRecipientId(''); }} 
                      />
                      <span><strong>Individual Employees</strong> (Direct)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Field 2: Employee * / Team Leader * (Dropdown matching Screenshot 1) */}
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
                <label style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  {isTeamLeader ? 'Employee' : (recipientType === 'team_leader' ? 'Team Leader' : 'Employee')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div>
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      outline: 'none',
                      background: '#ffffff',
                      color: selectedRecipientId ? '#0f172a' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select</option>
                    {candidateList.map(cand => {
                      const existingCount = advisoryLeads.filter(l => l.assignedToId === cand.id).length;
                      return (
                        <option key={cand.id} value={cand.id}>
                          {cand.name} {cand.role ? `— ${cand.role}` : ''} ({existingCount} leads active)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Field 3: Number Of Lead * (Input matching Screenshot 1 & 3) */}
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                <label style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  Number Of Lead <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div>
                  <input
                    type="number"
                    min="1"
                    max={availableCount > 0 ? availableCount : undefined}
                    placeholder="Number Of Lead"
                    value={numberOfLeads}
                    onChange={(e) => setNumberOfLeads(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                  {/* Quick Presets */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Quick amount:</span>
                    {[50, 100, 200, 500].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickPreset(amt)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          background: '#f1f5f9',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                      >
                        +{amt}
                      </button>
                    ))}
                    {availableCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleQuickPreset(Math.min(availableCount, 1000))}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          border: '1px solid #bae6fd',
                          borderRadius: '4px',
                          background: '#e0f2fe',
                          cursor: 'pointer',
                          color: '#0284c7',
                          fontWeight: 600
                        }}
                      >
                        All Available ({availableCount})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button (Matching Cyan/Teal "Allot" button in screenshot) */}
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px' }}>
                <div />
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: '#06b6d4',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 28px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(6, 182, 212, 0.25)',
                      transition: 'background 0.15s ease',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#0891b2'; }}
                    onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#06b6d4'; }}
                  >
                    {isSubmitting ? 'Allotting...' : 'Allot'}
                  </button>
                </div>
              </div>

            </form>

          </div>

          {/* Live Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
            <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total Available Pool</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>
                {leadSourcePools.reduce((acc, p) => acc + p.availableCount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Across {leadSourcePools.length} Regional Sources</div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Active Team Pool Leads</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#7c3aed', marginTop: '4px' }}>
                {advisoryLeads.filter(l => l.isTeamPool).length}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Awaiting advisor assignment</div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Advisor Active Pipeline</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                {advisoryLeads.filter(l => !l.isTeamPool && l.assignedToId).length}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Assigned to sales reps</div>
            </div>
          </div>

        </div>
      )}

      {/* ── Assignment Audit SubView ── */}
      {activeSubView === 'history' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                Lead Assignment Audit Log
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Transparent history of all vendor uploads, manager allotments, and team leader distributions.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Source</th>
                  <th style={{ padding: '10px 14px' }}>From</th>
                  <th style={{ padding: '10px 14px' }}>To (Recipient)</th>
                  <th style={{ padding: '10px 14px' }}>Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Leads Allotted</th>
                </tr>
              </thead>
              <tbody>
                {assignmentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                      No assignment records yet. Use the Allot Leads form to allot leads.
                    </td>
                  </tr>
                ) : (
                  assignmentHistory.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px' }}>{item.assignedAt}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0284c7' }}>{item.source}</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>{item.fromName || 'System'}</td>
                      <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 500 }}>{item.toName}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: item.assignmentType === 'manager_to_team' ? '#e0f2fe' : item.assignmentType === 'team_to_employee' ? '#dcfce7' : '#f3e8ff',
                          color: item.assignmentType === 'manager_to_team' ? '#0369a1' : item.assignmentType === 'team_to_employee' ? '#15803d' : '#7e22ce'
                        }}>
                          {item.assignmentType === 'manager_to_team' ? 'Manager → Team' : item.assignmentType === 'team_to_employee' ? 'TL → Employee' : 'Reassignment'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
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
