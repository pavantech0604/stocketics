import React, { useState } from 'react';
import { useApp } from '../../state/store';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Shield,
  UserPlus,
  UserMinus,
  Trash2,
  Edit2,
  Home,
  UserCheck,
  Award,
  Layers,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Department, Team } from '../../types';

export const HRTeamsManagementView: React.FC = () => {
  const {
    teams,
    teamMembers,
    employees,
    addTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    setActiveTab,
    showToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all-teams' | 'create-team' | 'assign-members'>('all-teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Create Team Form State
  const [teamName, setTeamName] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [department, setDepartment] = useState<Department>('Advisory Sales');

  // Selected Team for Member Management Modal
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);
  const [memberToAdd, setMemberToAdd] = useState('');

  const departments: Department[] = [
    'Advisory Sales',
    'Equity Research',
    'HR',
    'IT',
    'Operations',
    'Finance'
  ];

  // Candidates for team leader (employees)
  const potentialLeaders = employees.filter(e => e.status === 'Active');

  // Handlers
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !leaderId) {
      showToast('Please enter a team name and select a Team Leader.', 'warning');
      return;
    }

    addTeam({
      name: teamName.trim(),
      leaderId,
      department,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Squad "${teamName}" created successfully!`, 'success');
    setTeamName('');
    setLeaderId('');
    setActiveSubTab('all-teams');
  };

  const handleToggleStatus = (team: Team) => {
    const nextStatus = team.status === 'Active' ? 'Inactive' : 'Active';
    updateTeam(team.id, { status: nextStatus });
    showToast(`Team ${team.name} marked as ${nextStatus}.`, 'info');
  };

  const handleAddMemberToTeam = (teamId: string, employeeId: string) => {
    if (!employeeId) return;
    addTeamMember(teamId, employeeId);
    setMemberToAdd('');
  };

  // KPIs
  const totalTeams = teams.length;
  const activeTeams = teams.filter(t => t.status === 'Active').length;
  const allAssignedEmployeeIds = new Set(teamMembers.map(tm => tm.employeeId));
  const assignedCount = allAssignedEmployeeIds.size;
  const unassignedEmployees = employees.filter(e => !allAssignedEmployeeIds.has(e.id));

  // Filtered teams
  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employees.find(e => e.id === t.leaderId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || t.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="crm-view-container" style={{ padding: '24px 28px' }}>
      {/* Breadcrumbs */}
      <div className="crm-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit' }}>
          <Home size={14} /> Home
        </button>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Teams Management</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users className="text-amber-500" size={26} />
            HR Teams & Squads Architecture
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
            Establish organizational teams, designate Team Leaders, and govern employee assignments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('all-teams')}
            className={`crm-btn ${activeSubTab === 'all-teams' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Layers size={15} /> All Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveSubTab('create-team')}
            className={`crm-btn ${activeSubTab === 'create-team' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Plus size={15} /> Create Team
          </button>
          <button
            onClick={() => setActiveSubTab('assign-members')}
            className={`crm-btn ${activeSubTab === 'assign-members' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <UserCheck size={15} /> Member Allocation
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Teams</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Layers size={18} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{totalTeams}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Across all departments</div>
        </div>

        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Active Squads</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle2 size={18} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{activeTeams}</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Operational squads</div>
        </div>

        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Assigned Members</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Users size={18} /></span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{assignedCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Active in designated squads</div>
        </div>

        <div className="kpi-card-ref" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Unassigned Pool</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: unassignedEmployees.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: unassignedEmployees.length > 0 ? '#ef4444' : '#10b981' }}>
              <UserPlus size={18} />
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: unassignedEmployees.length > 0 ? '#ef4444' : '#10b981' }}>
            {unassignedEmployees.length}
          </div>
          <div style={{ fontSize: '12px', color: unassignedEmployees.length > 0 ? '#ef4444' : '#10b981', marginTop: '4px' }}>
            {unassignedEmployees.length > 0 ? 'Ready for team assignment' : 'All members assigned'}
          </div>
        </div>
      </div>

      {/* Sub-tab 1: ALL TEAMS VIEW */}
      {activeSubTab === 'all-teams' && (
        <>
          {/* Filters Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search team or leader..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px' }}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveSubTab('create-team')}
              className="crm-btn crm-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}
            >
              <Plus size={15} /> Add New Squad
            </button>
          </div>

          {/* Teams Table */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main, #f8fafc)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '14px 18px' }}>TEAM / SQUAD</th>
                  <th style={{ padding: '14px 18px' }}>DEPARTMENT</th>
                  <th style={{ padding: '14px 18px' }}>TEAM LEADER</th>
                  <th style={{ padding: '14px 18px' }}>MEMBERS</th>
                  <th style={{ padding: '14px 18px' }}>STATUS</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map(team => {
                  const leader = employees.find(e => e.id === team.leaderId);
                  const members = teamMembers.filter(tm => tm.teamId === team.id);

                  return (
                    <tr key={team.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{team.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created {team.createdAt}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', fontWeight: 500, fontSize: '12px' }}>
                          {team.department}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {leader ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={leader.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                              alt={leader.name}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{leader.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{leader.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => setSelectedTeamForMembers(team)}
                          style={{
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.25)',
                            color: '#d97706',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Users size={13} /> {members.length} Members
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: team.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: team.status === 'Active' ? '#10b981' : '#ef4444'
                          }}
                        >
                          {team.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedTeamForMembers(team)}
                            className="crm-btn crm-btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Manage Members"
                          >
                            <Users size={14} /> Manage
                          </button>
                          <button
                            onClick={() => handleToggleStatus(team)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: '1px solid var(--border-color)',
                              background: 'var(--card-bg)',
                              color: 'var(--text-muted)'
                            }}
                            title={team.status === 'Active' ? 'Deactivate Team' : 'Activate Team'}
                          >
                            {team.status === 'Active' ? 'Pause' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTeams.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No squads found matching your criteria.
              </div>
            )}
          </div>
        </>
      )}

      {/* Sub-tab 2: CREATE TEAM FORM */}
      {activeSubTab === 'create-team' && (
        <div style={{ maxWidth: '640px', background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} className="text-amber-500" />
            Establish New Team / Squad
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Specify the team name, functional department, and appoint an active employee as Team Leader.
          </p>

          <form onSubmit={handleCreateTeam}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Squad / Team Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Alpha Advisory Squad, Momentum Desk"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Department *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as Department)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '14px' }}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Appoint Team Leader *
              </label>
              <select
                value={leaderId}
                onChange={e => setLeaderId(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '14px' }}
              >
                <option value="">-- Choose Team Leader --</option>
                {potentialLeaders.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.role} ({emp.department})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Note: Team Leader will gain access to the dedicated Team Leaderboard, Coaching Hub, SMS Broadcast, and Standup tracker for their assigned members.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="crm-btn crm-btn-primary"
                style={{ padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}
              >
                Save & Create Team
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('all-teams')}
                className="crm-btn crm-btn-secondary"
                style={{ padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-tab 3: MEMBER ALLOCATION BOARD */}
      {activeSubTab === 'assign-members' && (
        <div>
          <div style={{ marginBottom: '20px', background: 'var(--card-bg, #fff)', padding: '18px 22px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Cross-Team Member Allocation Matrix
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Quickly allocate unassigned employees to their respective functional squads.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {/* Unassigned employees card */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={16} className="text-amber-500" />
                  Unassigned Employees ({unassignedEmployees.length})
                </span>
              </div>

              {unassignedEmployees.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  All employees are actively assigned to a team!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                  {unassignedEmployees.map(emp => (
                    <div
                      key={emp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'var(--bg-main, #f8fafc)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={emp.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.department}</div>
                        </div>
                      </div>

                      {/* Quick Assign Dropdown */}
                      <select
                        defaultValue=""
                        onChange={e => {
                          if (e.target.value) {
                            addTeamMember(e.target.value, emp.id);
                          }
                        }}
                        style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', background: 'var(--card-bg)' }}
                      >
                        <option value="" disabled>+ Assign to...</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Roster Cards */}
            {teams.map(team => {
              const members = teamMembers.filter(tm => tm.teamId === team.id);
              const leader = employees.find(e => e.id === team.leaderId);

              return (
                <div
                  key={team.id}
                  style={{
                    background: 'var(--card-bg, #fff)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{team.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Lead: {leader?.name || 'Unassigned'} • {team.department}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                      {members.length} Members
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto', marginBottom: '12px' }}>
                    {members.map(tm => {
                      const emp = employees.find(e => e.id === tm.employeeId);
                      if (!emp) return null;

                      return (
                        <div
                          key={tm.employeeId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: 'var(--bg-main, #f8fafc)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={emp.name}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{emp.name}</span>
                          </div>

                          <button
                            onClick={() => removeTeamMember(team.id, emp.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Remove from team"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      );
                    })}

                    {members.length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No members assigned yet.
                      </div>
                    )}
                  </div>

                  {/* Add member button */}
                  <button
                    onClick={() => setSelectedTeamForMembers(team)}
                    className="crm-btn crm-btn-secondary"
                    style={{ width: '100%', padding: '7px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <UserPlus size={13} /> Add Members to Squad
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Member Management Modal */}
      {selectedTeamForMembers && (
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
              maxWidth: '560px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Manage Members — {selectedTeamForMembers.name}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Department: {selectedTeamForMembers.department}
                </div>
              </div>
              <button
                onClick={() => setSelectedTeamForMembers(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px' }}>
              {/* Add member selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <select
                  value={memberToAdd}
                  onChange={e => setMemberToAdd(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main, #f8fafc)', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  <option value="">-- Select employee to add --</option>
                  {employees
                    .filter(e => !teamMembers.some(tm => tm.teamId === selectedTeamForMembers.id && tm.employeeId === e.id))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department} - {emp.role})
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => handleAddMemberToTeam(selectedTeamForMembers.id, memberToAdd)}
                  disabled={!memberToAdd}
                  className="crm-btn crm-btn-primary"
                  style={{ padding: '8px 16px', borderRadius: '8px', cursor: memberToAdd ? 'pointer' : 'not-allowed', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, opacity: memberToAdd ? 1 : 0.6 }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>

              {/* Current Members List */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Assigned Team Members ({teamMembers.filter(tm => tm.teamId === selectedTeamForMembers.id).length})
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teamMembers
                  .filter(tm => tm.teamId === selectedTeamForMembers.id)
                  .map(tm => {
                    const emp = employees.find(e => e.id === tm.employeeId);
                    if (!emp) return null;

                    return (
                      <div
                        key={tm.employeeId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'var(--bg-main, #f8fafc)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={emp.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{emp.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.role} • {emp.email}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeTeamMember(selectedTeamForMembers.id, emp.id)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserMinus size={13} /> Remove
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Close Button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedTeamForMembers(null)}
                  className="crm-btn crm-btn-secondary"
                  style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
