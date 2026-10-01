import React, { useState, useEffect } from 'react';
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
  X,
  TrendingUp,
  Activity,
  Briefcase,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Clock,
  ArrowUpRight
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
    activeTab,
    setActiveTab,
    showToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all-teams' | 'create-team' | 'assign-members'>('all-teams');

  useEffect(() => {
    if (activeTab === 'create-team') {
      setActiveSubTab('create-team');
    } else if (activeTab === 'assign-members') {
      setActiveSubTab('assign-members');
    } else if (activeTab === 'all-teams' || activeTab === 'teams' || activeTab === 'teams-hierarchy') {
      setActiveSubTab('all-teams');
    }
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Create Team Form State
  const [teamName, setTeamName] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [department, setDepartment] = useState<Department>('Advisory Sales');
  const [specialization, setSpecialization] = useState('NIFTY & BANKNIFTY Options');

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

  const specializationOptions = [
    'NIFTY & BANKNIFTY Options',
    'Stock Futures & Intraday Momentum',
    '₹25L+ HNI Wealth & Portfolio Desk',
    'Midcap Breakout & Fundamental Research',
    'SEBI Mandate & Risk Profiling Audit',
    'Algorithmic Execution & Kite OMS Terminals'
  ];

  // Candidates for team leader (employees)
  const potentialLeaders = employees.filter(e => e.status === 'Active');

  // Helper for domain-tailored badges
  const getDeskDetails = (teamNameStr: string, dept: Department) => {
    const name = teamNameStr.toLowerCase();
    if (name.includes('derivatives') || name.includes('option') || name.includes('alpha')) {
      return {
        tag: 'INDEX & STOCK OPTIONS',
        sub: 'NIFTY, BANKNIFTY & Hero-Zero Intraday',
        color: '#0284c7',
        bg: 'rgba(2, 132, 199, 0.08)',
        border: 'rgba(2, 132, 199, 0.25)',
        targetVolume: '₹35L Monthly'
      };
    }
    if (name.includes('research') || name.includes('institutional') || dept === 'Equity Research') {
      return {
        tag: 'EQUITY RESEARCH & RA',
        sub: 'Swing Trades, Technical Breakouts & Delivery',
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.08)',
        border: 'rgba(139, 92, 246, 0.25)',
        targetVolume: '₹50L Monthly'
      };
    }
    if (name.includes('wealth') || name.includes('hni') || name.includes('portfolio')) {
      return {
        tag: 'HNI WEALTH & PORTFOLIO',
        sub: '₹25L+ High-Net-Worth Advisory & PMS',
        color: '#d97706',
        bg: 'rgba(217, 119, 6, 0.08)',
        border: 'rgba(217, 119, 6, 0.25)',
        targetVolume: '₹45L Monthly'
      };
    }
    if (name.includes('fintech') || name.includes('oms') || dept === 'IT') {
      return {
        tag: 'TRADING TERMINALS & OMS',
        sub: 'Zerodha Kite Connect & Low-Latency Engines',
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.08)',
        border: 'rgba(5, 150, 105, 0.25)',
        targetVolume: '99.98% Execution SLA'
      };
    }
    if (name.includes('compliance') || name.includes('sebi') || dept === 'HR') {
      return {
        tag: 'SEBI COMPLIANCE & RISK',
        sub: 'Risk Mandate Adherence, KYC Verification',
        color: '#c5996a',
        bg: 'rgba(197, 153, 106, 0.12)',
        border: 'rgba(197, 153, 106, 0.3)',
        targetVolume: '100% SEBI Compliant'
      };
    }
    return {
      tag: `${dept.toUpperCase()} DESK`,
      sub: 'Client Relationship & Advisory Execution',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)',
      border: 'rgba(2, 132, 199, 0.25)',
      targetVolume: '₹20L Monthly'
    };
  };

  const getLeaderCredential = (leaderRole?: string) => {
    if (!leaderRole) return 'Desk Lead';
    if (leaderRole.includes('VP') || leaderRole.includes('Director')) return 'SEBI RA Head • Master NISM Series XV';
    if (leaderRole.includes('Analyst') || leaderRole.includes('Quant')) return 'NISM-Series-XV Research Analyst';
    if (leaderRole.includes('Lead') || leaderRole.includes('Advisor')) return 'Senior NISM-Series-VIII Equity Advisor';
    return 'Certified Advisory Lead';
  };

  // Handlers
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !leaderId) {
      showToast('Please enter an advisory desk name and appoint a Desk Leader.', 'warning');
      return;
    }

    addTeam({
      name: teamName.trim(),
      leaderId,
      department,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      status: 'Active'
    });

    confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    showToast(`Advisory Squad "${teamName}" deployed on Stocketics Trading Floor!`, 'success');
    setTeamName('');
    setLeaderId('');
    setActiveSubTab('all-teams');
  };

  const handleToggleStatus = (team: Team) => {
    const nextStatus = team.status === 'Active' ? 'Inactive' : 'Active';
    updateTeam(team.id, { status: nextStatus });
    showToast(`Desk ${team.name} marked as ${nextStatus === 'Active' ? 'Market Live' : 'Paused / Standby'}.`, 'info');
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
      (employees.find(e => e.id === t.leaderId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      getDeskDetails(t.name, t.department).tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || t.department === selectedDept;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="crm-view-container" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumbs */}
      <div className="crm-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit' }}
        >
          <Home size={14} /> Home
        </button>
        <span>/</span>
        <span>HR Operations</span>
        <span>/</span>
        <span style={{ color: 'var(--stocketics-blue-500, #0284c7)', fontWeight: 700 }}>Stocketics Trading Desks & Squads</span>
      </div>

      {/* Header Banner - Rich & Unique to Stocketics Stock Advisory Platform */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        flexWrap: 'wrap', 
        gap: '16px',
        padding: '20px 24px',
        background: 'var(--card-bg, #ffffff)',
        border: '1.5px solid var(--border-strong, #cbd5e1)',
        borderRadius: '14px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '23px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #0284c7 0%, #0a1128 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(2, 132, 199, 0.35)'
              }}>
                <Briefcase size={20} />
              </div>
              Stocketics Advisory Squads & Trading Desks
            </h1>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              padding: '3px 10px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: 700, 
              background: 'rgba(16, 185, 129, 0.12)', 
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              SEBI RA #INH000008921
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'var(--bg-surface-alt, #f1f5f9)',
              color: 'var(--text-secondary, #475569)',
              border: '1px solid var(--border-subtle, #e2e8f0)'
            }}>
              <Clock size={12} /> NSE/BSE: 09:15 - 15:30 IST
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Govern multi-asset advisory desks (NIFTY & BANKNIFTY Options, Equity Cash, HNI Wealth), designate NISM-certified Team Leaders, and allocate research analysts across active market desks.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('all-teams')}
            className={`crm-btn action-btn-interactive ${activeSubTab === 'all-teams' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '7px', 
              padding: '9px 16px', 
              borderRadius: '8px', 
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSubTab === 'all-teams' ? 'none' : '1.5px solid var(--border-strong, #cbd5e1)'
            }}
          >
            <Layers size={15} /> 
            <span>Trading Desks ({teams.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('create-team')}
            className={`crm-btn action-btn-interactive ${activeSubTab === 'create-team' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '7px', 
              padding: '9px 16px', 
              borderRadius: '8px', 
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSubTab === 'create-team' ? 'none' : '1.5px solid var(--border-strong, #cbd5e1)'
            }}
          >
            <Plus size={15} /> 
            <span>Establish New Desk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('assign-members')}
            className={`crm-btn action-btn-interactive ${activeSubTab === 'assign-members' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '7px', 
              padding: '9px 16px', 
              borderRadius: '8px', 
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSubTab === 'assign-members' ? 'none' : '1.5px solid var(--border-strong, #cbd5e1)'
            }}
          >
            <UserCheck size={15} /> 
            <span>Analyst & Advisor Allocation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row - HIGH DEFINITION VISIBLE BORDERS WITH DOMAIN-SPECIFIC CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Active Advisory Desks */}
        <div 
          className="action-btn-interactive"
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            border: '1.5px solid var(--border-strong, #cbd5e1)', 
            borderTop: '4px solid var(--stocketics-blue-500, #0284c7)', 
            borderRadius: '12px', 
            padding: '18px 20px', 
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Advisory Desks
            </span>
            <span style={{ 
              padding: '6px', 
              borderRadius: '8px', 
              background: 'rgba(2, 132, 199, 0.12)', 
              color: '#0284c7' 
            }}>
              <Layers size={18} />
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {totalTeams}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#0284c7', fontWeight: 600 }}>● Active Roster:</span>
            <span>Derivatives, HNI, Equity</span>
          </div>
        </div>

        {/* Card 2: Market Operational Desks */}
        <div 
          className="action-btn-interactive"
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            border: '1.5px solid var(--border-strong, #cbd5e1)', 
            borderTop: '4px solid #10b981', 
            borderRadius: '12px', 
            padding: '18px 20px', 
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Market Operational
            </span>
            <span style={{ 
              padding: '6px', 
              borderRadius: '8px', 
              background: 'rgba(16, 185, 129, 0.12)', 
              color: '#10b981' 
            }}>
              <Activity size={18} />
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
            {activeTeams} <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>/ {totalTeams}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle2 size={13} />
            <span>NISM Certified Squad Leads</span>
          </div>
        </div>

        {/* Card 3: Assigned Floor Strength */}
        <div 
          className="action-btn-interactive"
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            border: '1.5px solid var(--border-strong, #cbd5e1)', 
            borderTop: '4px solid #f59e0b', 
            borderRadius: '12px', 
            padding: '18px 20px', 
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Deployed Floor Advisors
            </span>
            <span style={{ 
              padding: '6px', 
              borderRadius: '8px', 
              background: 'rgba(245, 158, 11, 0.12)', 
              color: '#d97706' 
            }}>
              <Users size={18} />
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {assignedCount} <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>Advisors</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#d97706', fontWeight: 600 }}>● Active Desks:</span>
            <span>Covering Advisory Calls</span>
          </div>
        </div>

        {/* Card 4: Unassigned Pool */}
        <div 
          className="action-btn-interactive"
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            border: '1.5px solid var(--border-strong, #cbd5e1)', 
            borderTop: unassignedEmployees.length > 0 ? '4px solid #6366f1' : '4px solid #10b981', 
            borderRadius: '12px', 
            padding: '18px 20px', 
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Unallocated Staff Pool
            </span>
            <span style={{ 
              padding: '6px', 
              borderRadius: '8px', 
              background: unassignedEmployees.length > 0 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)', 
              color: unassignedEmployees.length > 0 ? '#6366f1' : '#10b981' 
            }}>
              <UserPlus size={18} />
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: unassignedEmployees.length > 0 ? '#4f46e5' : '#059669', lineHeight: 1.1 }}>
            {unassignedEmployees.length}
          </div>
          <div style={{ fontSize: '12px', color: unassignedEmployees.length > 0 ? '#4f46e5' : '#059669', marginTop: '8px', fontWeight: 600 }}>
            {unassignedEmployees.length > 0 ? 'Ready for trading desk allotment' : '100% Floor staff allocated'}
          </div>
        </div>

      </div>

      {/* Sub-tab 1: ALL TEAMS VIEW */}
      {activeSubTab === 'all-teams' && (
        <>
          {/* Filters Bar with High Contrast Border */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '12px', 
            padding: '14px 18px', 
            background: 'var(--card-bg, #ffffff)', 
            border: '1.5px solid var(--border-strong, #cbd5e1)', 
            borderRadius: '12px', 
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search desk, lead analyst, or segment (Options, HNI)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px 8px 36px', 
                    borderRadius: '8px', 
                    border: '1.5px solid var(--border-strong, #cbd5e1)', 
                    background: 'var(--bg-main, #f8fafc)', 
                    color: 'var(--text-primary)', 
                    fontSize: '13px' 
                  }}
                />
              </div>

              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  border: '1.5px solid var(--border-strong, #cbd5e1)', 
                  background: 'var(--bg-main, #f8fafc)', 
                  color: 'var(--text-primary)', 
                  fontSize: '13px' 
                }}
              >
                <option value="all">All Functional Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  border: '1.5px solid var(--border-strong, #cbd5e1)', 
                  background: 'var(--bg-main, #f8fafc)', 
                  color: 'var(--text-primary)', 
                  fontSize: '13px' 
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Market Live Only</option>
                <option value="Inactive">Paused / Standby</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('create-team')}
              className="crm-btn crm-btn-primary action-btn-interactive"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '9px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: '13px' 
              }}
            >
              <Plus size={15} /> Establish New Desk
            </button>
          </div>

          {/* Teams Table Container with Crisp Visible Border */}
          <div style={{ 
            background: 'var(--card-bg, #ffffff)', 
            border: '1.5px solid var(--border-strong, #cbd5e1)', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.06)' 
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt, #f1f5f9)', borderBottom: '1.5px solid var(--border-strong, #cbd5e1)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '14px 20px' }}>STOCKETICS TRADING DESK</th>
                    <th style={{ padding: '14px 16px' }}>SEBI / NISM DESK LEADER</th>
                    <th style={{ padding: '14px 16px' }}>SPECIALIZATION</th>
                    <th style={{ padding: '14px 16px' }}>FLOOR STRENGTH</th>
                    <th style={{ padding: '14px 16px' }}>DESK STATUS</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map(team => {
                    const leader = employees.find(e => e.id === team.leaderId);
                    const members = teamMembers.filter(tm => tm.teamId === team.id);
                    const deskDetails = getDeskDetails(team.name, team.department);

                    return (
                      <tr key={team.id} style={{ borderBottom: '1px solid var(--border-strong, #e2e8f0)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                            {team.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Dept: <strong>{team.department}</strong></span>
                            <span>•</span>
                            <span>Deployed {team.createdAt}</span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {leader ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={leader.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                                alt={leader.name}
                                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                                  {leader.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                                  {getLeaderCredential(leader.title || leader.role)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            background: deskDetails.bg, 
                            color: deskDetails.color, 
                            border: `1px solid ${deskDetails.border}`,
                            fontWeight: 700, 
                            fontSize: '11.5px',
                            display: 'inline-block'
                          }}>
                            {deskDetails.tag}
                          </span>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                            {deskDetails.sub}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedTeamForMembers(team)}
                            className="action-btn-interactive"
                            style={{
                              background: 'rgba(2, 132, 199, 0.08)',
                              border: '1.5px solid rgba(2, 132, 199, 0.25)',
                              color: '#0284c7',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Users size={14} /> 
                            <span>{members.length} Advisors Deployed</span>
                          </button>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              background: team.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                              color: team.status === 'Active' ? '#059669' : '#dc2626',
                              border: team.status === 'Active' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: team.status === 'Active' ? '#10b981' : '#ef4444' }} />
                            {team.status === 'Active' ? 'Market Live' : 'Paused'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedTeamForMembers(team)}
                              className="crm-btn crm-btn-secondary action-btn-interactive"
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                border: '1.5px solid var(--border-strong, #cbd5e1)',
                                fontWeight: 600
                              }}
                              title="Manage Desk Roster"
                            >
                              <Users size={13} /> Roster
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(team)}
                              className="action-btn-interactive"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                border: '1.5px solid var(--border-strong, #cbd5e1)',
                                background: 'var(--card-bg, #ffffff)',
                                color: team.status === 'Active' ? 'var(--text-muted)' : '#059669',
                                fontWeight: 600
                              }}
                              title={team.status === 'Active' ? 'Pause Desk Operations' : 'Activate Trading Desk'}
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
            </div>

            {filteredTeams.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No Stocketics advisory desks found matching your search filter.
              </div>
            )}
          </div>
        </>
      )}

      {/* Sub-tab 2: CREATE TEAM FORM WITH VISIBLE BORDERS */}
      {activeSubTab === 'create-team' && (
        <div style={{ 
          maxWidth: '680px', 
          background: 'var(--card-bg, #ffffff)', 
          border: '1.5px solid var(--border-strong, #cbd5e1)', 
          borderRadius: '14px', 
          padding: '28px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)' 
        }}>
          <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} style={{ color: 'var(--stocketics-blue-500, #0284c7)' }} />
            Establish Stocketics Advisory Squad / Trading Desk
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Configure a specialized market trading desk, designate market segment focus, and appoint an active NISM/SEBI accredited Team Leader.
          </p>

          <form onSubmit={handleCreateTeam}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Squad / Desk Name *
              </label>
              <input
                type="text"
                placeholder="e.g. BankNifty Hero-Zero Squad, Delta Momentum Desk"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: '1.5px solid var(--border-strong, #cbd5e1)', 
                  background: 'var(--bg-main, #f8fafc)', 
                  color: 'var(--text-primary)', 
                  fontSize: '14px' 
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Functional Department *
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as Department)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1.5px solid var(--border-strong, #cbd5e1)', 
                    background: 'var(--bg-main, #f8fafc)', 
                    color: 'var(--text-primary)', 
                    fontSize: '14px' 
                  }}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Market Specialization *
                </label>
                <select
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1.5px solid var(--border-strong, #cbd5e1)', 
                    background: 'var(--bg-main, #f8fafc)', 
                    color: 'var(--text-primary)', 
                    fontSize: '14px' 
                  }}
                >
                  {specializationOptions.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Appoint Desk Leader (NISM / RA Certified) *
              </label>
              <select
                value={leaderId}
                onChange={e => setLeaderId(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: '1.5px solid var(--border-strong, #cbd5e1)', 
                  background: 'var(--bg-main, #f8fafc)', 
                  color: 'var(--text-primary)', 
                  fontSize: '14px' 
                }}
              >
                <option value="">-- Choose Team Leader --</option>
                {potentialLeaders.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.role} ({emp.department})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Appointed Desk Leader will oversee client advisory dispatches, lead assignment queues, daily standups, and advisory targets.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="crm-btn crm-btn-primary action-btn-interactive"
                style={{ padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                Deploy Desk to Floor
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('all-teams')}
                className="crm-btn crm-btn-secondary action-btn-interactive"
                style={{ padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', border: '1.5px solid var(--border-strong, #cbd5e1)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-tab 3: MEMBER ALLOCATION BOARD WITH VISIBLE BORDERS */}
      {activeSubTab === 'assign-members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: '18px 22px', 
            borderRadius: '12px', 
            border: '1.5px solid var(--border-strong, #cbd5e1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Stocketics Cross-Desk Member Allocation Matrix
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Allocate advisory sales consultants, research analysts, and technical personnel to their designated trading desks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {/* Unassigned employees card */}
            <div style={{ 
              background: 'var(--card-bg, #ffffff)', 
              border: '1.5px solid var(--border-strong, #cbd5e1)', 
              borderRadius: '12px', 
              padding: '18px', 
              boxShadow: '0 3px 10px rgba(0,0,0,0.04)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={16} style={{ color: '#6366f1' }} />
                  Unassigned Staff Pool ({unassignedEmployees.length})
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Awaiting Assignment
                </span>
              </div>

              {unassignedEmployees.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
                  <CheckCircle2 size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                  All personnel are actively deployed on trading desks!
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
                        border: '1.5px solid var(--border-strong, #cbd5e1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={emp.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.department} • {emp.role}</div>
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
                        style={{ 
                          padding: '5px 8px', 
                          borderRadius: '6px', 
                          border: '1.5px solid var(--border-strong, #cbd5e1)', 
                          fontSize: '12px', 
                          background: 'var(--card-bg, #ffffff)',
                          fontWeight: 600,
                          cursor: 'pointer' 
                        }}
                      >
                        <option value="" disabled>Assign to desk...</option>
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
              const deskDetails = getDeskDetails(team.name, team.department);

              return (
                <div
                  key={team.id}
                  style={{
                    background: 'var(--card-bg, #ffffff)',
                    border: '1.5px solid var(--border-strong, #cbd5e1)',
                    borderRadius: '12px',
                    padding: '18px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>{team.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Lead: <strong>{leader?.name || 'Unassigned'}</strong> • {team.department}
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      background: deskDetails.bg, 
                      color: deskDetails.color,
                      border: `1px solid ${deskDetails.border}`
                    }}>
                      {members.length} Advisors
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
                            border: '1px solid var(--border-strong, #cbd5e1)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={emp.name}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{emp.role}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeTeamMember(team.id, emp.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Remove advisor from desk"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      );
                    })}

                    {members.length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No advisors assigned to this desk yet.
                      </div>
                    )}
                  </div>

                  {/* Add member button */}
                  <button
                    type="button"
                    onClick={() => setSelectedTeamForMembers(team)}
                    className="crm-btn crm-btn-secondary action-btn-interactive"
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      fontSize: '12px', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      border: '1.5px solid var(--border-strong, #cbd5e1)',
                      fontWeight: 600
                    }}
                  >
                    <UserPlus size={13} /> Add Advisors to Desk
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Member Management Modal With Crisp Visible Borders */}
      {selectedTeamForMembers && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedTeamForMembers(null)}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '560px',
              border: '1.5px solid var(--border-strong, #cbd5e1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1.5px solid var(--border-strong, #cbd5e1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Manage Roster — {selectedTeamForMembers.name}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Functional Desk: {selectedTeamForMembers.department}
                </div>
              </div>
              <button
                type="button"
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
                  style={{ 
                    flex: 1, 
                    padding: '9px 12px', 
                    borderRadius: '8px', 
                    border: '1.5px solid var(--border-strong, #cbd5e1)', 
                    background: 'var(--bg-main, #f8fafc)', 
                    color: 'var(--text-primary)', 
                    fontSize: '13px' 
                  }}
                >
                  <option value="">-- Select personnel to deploy --</option>
                  {employees
                    .filter(e => !teamMembers.some(tm => tm.teamId === selectedTeamForMembers.id && tm.employeeId === e.id))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department} - {emp.role})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAddMemberToTeam(selectedTeamForMembers.id, memberToAdd)}
                  disabled={!memberToAdd}
                  className="crm-btn crm-btn-primary action-btn-interactive"
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    cursor: memberToAdd ? 'pointer' : 'not-allowed', 
                    fontWeight: 700, 
                    opacity: memberToAdd ? 1 : 0.6 
                  }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>

              {/* Current Members List */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Assigned Desk Advisors ({teamMembers.filter(tm => tm.teamId === selectedTeamForMembers.id).length})
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
                          border: '1.5px solid var(--border-strong, #cbd5e1)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={emp.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{emp.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.role} • {emp.email}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeTeamMember(selectedTeamForMembers.id, emp.id)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
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
                  type="button"
                  onClick={() => setSelectedTeamForMembers(null)}
                  className="crm-btn crm-btn-secondary action-btn-interactive"
                  style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', border: '1.5px solid var(--border-strong, #cbd5e1)', fontWeight: 600 }}
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
