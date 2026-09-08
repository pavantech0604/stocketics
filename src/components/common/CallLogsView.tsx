import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../state/store';
import { CallLogRecord, CallSentiment, CallDirection } from '../../types';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  MessageSquare,
  Clock,
  User,
  Users,
  Search,
  Plus,
  X,
  TrendingUp,
  Award,
  Sparkles,
  Copy,
  Check,
  Headphones,
  Sliders,
  Send,
  Zap,
  MapPin,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TipsModal } from './TipsModal';

export const CallLogsView: React.FC = () => {
  const { role, currentUser, employees, callLogs, addCallLog, updateCallLogScore, showToast, setActiveTab } = useApp();

  // Selected Advisor filter for Manager/HR
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dispositionFilter, setDispositionFilter] = useState<string>('All');
  const [sentimentFilter, setSentimentFilter] = useState<string>('All');
  const [directionFilter, setDirectionFilter] = useState<string>('All');
  const [recordingOnlyFilter, setRecordingOnlyFilter] = useState(false);

  // Modals
  const [activeRecordingCall, setActiveRecordingCall] = useState<CallLogRecord | null>(null);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Player State (Simulated Interactive Waveform Player)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [evaluatingScore, setEvaluatingScore] = useState<number>(5);
  const [evaluatingNote, setEvaluatingNote] = useState<string>('');

  // When active recording changes, reset player
  useEffect(() => {
    if (activeRecordingCall) {
      setIsPlaying(false);
      setPlaybackProgress(0);
      setEvaluatingScore(activeRecordingCall.managerScore || 5);
      setEvaluatingNote(activeRecordingCall.managerNote || '');
    }
  }, [activeRecordingCall]);

  // Simulated audio progress timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(100, prev + 1.2 * playbackSpeed);
        });
      }, 300);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Base list depending on role:
  // If role is employee -> ONLY currentUser calls!
  // If role is manager/hr -> ALL employees' calls!
  const baseLogs = useMemo(() => {
    if (role === 'employee') {
      return callLogs.filter(c => c.employeeId === currentUser.id);
    }
    return callLogs;
  }, [callLogs, role, currentUser.id]);

  // Unique Advisors for Manager's filter dropdown
  const advisorOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar: string; count: number }>();
    callLogs.forEach(c => {
      if (!map.has(c.employeeId)) {
        map.set(c.employeeId, {
          id: c.employeeId,
          name: c.employeeName,
          avatar: c.employeeAvatar,
          count: 0
        });
      }
      map.get(c.employeeId)!.count++;
    });
    return Array.from(map.values());
  }, [callLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return baseLogs.filter(call => {
      // Manager advisor filter
      if (role !== 'employee' && selectedAdvisorId !== 'all' && call.employeeId !== selectedAdvisorId) {
        return false;
      }

      // Disposition filter
      if (dispositionFilter !== 'All' && call.disposition !== dispositionFilter) {
        return false;
      }

      // Sentiment filter
      if (sentimentFilter !== 'All' && call.sentiment !== sentimentFilter) {
        return false;
      }

      // Direction filter
      if (directionFilter !== 'All' && call.callDirection !== directionFilter) {
        return false;
      }

      // Recording filter
      if (recordingOnlyFilter && !call.hasRecording) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          call.clientName.toLowerCase().includes(q) ||
          call.clientPhone.includes(q) ||
          call.clientCity.toLowerCase().includes(q) ||
          call.callNotes.toLowerCase().includes(q) ||
          call.employeeName.toLowerCase().includes(q) ||
          (call.keyTopics && call.keyTopics.some(t => t.toLowerCase().includes(q)));
        if (!match) return false;
      }

      return true;
    });
  }, [baseLogs, role, selectedAdvisorId, dispositionFilter, sentimentFilter, directionFilter, recordingOnlyFilter, searchQuery]);

  // Metrics calculation
  const totalCalls = filteredLogs.length;
  const totalDurationSeconds = filteredLogs.reduce((acc, c) => acc + c.durationSeconds, 0);
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  const convertedCount = filteredLogs.filter(
    c => c.disposition.includes('Converted') || c.disposition.includes('Payment Link')
  ).length;

  const avgQualityScore = useMemo(() => {
    const scored = filteredLogs.filter(c => c.managerScore);
    if (scored.length === 0) return 4.8;
    const sum = scored.reduce((acc, c) => acc + (c.managerScore || 0), 0);
    return (sum / scored.length).toFixed(1);
  }, [filteredLogs]);

  // Top Performer for Manager
  const topPerformer = useMemo(() => {
    if (role === 'employee') return null;
    const counts: Record<string, { name: string; count: number; conversions: number }> = {};
    callLogs.forEach(c => {
      if (!counts[c.employeeName]) {
        counts[c.employeeName] = { name: c.employeeName, count: 0, conversions: 0 };
      }
      counts[c.employeeName].count++;
      if (c.disposition.includes('Converted') || c.disposition.includes('Payment Link')) {
        counts[c.employeeName].conversions++;
      }
    });
    const sorted = Object.values(counts).sort((a, b) => b.conversions - a.conversions || b.count - a.count);
    return sorted[0] || { name: 'Aditya Roy', count: 3, conversions: 2 };
  }, [callLogs, role]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied to clipboard!', 'info');
  };

  const handleSaveScore = () => {
    if (!activeRecordingCall) return;
    updateCallLogScore(activeRecordingCall.id, evaluatingScore, evaluatingNote);
    setActiveRecordingCall(prev => prev ? { ...prev, managerScore: evaluatingScore, managerNote: evaluatingNote } : null);
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* 1. Subpage Breadcrumb Strip */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: '#ffffff', 
          padding: '0.45rem 0.85rem', 
          borderRadius: '4px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px' }}>
          <span 
            onClick={() => setActiveTab('dashboard')} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ea580c', cursor: 'pointer', fontWeight: 600 }}
          >
            <Home size={15} color="#ea580c" />
            <span>/ Dashboard</span>
          </span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#475569', fontWeight: 500 }}>Advisory Telephony</span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#0073b7', fontWeight: 700 }}>Call Logs & Voice Intelligence</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setIsLogCallOpen(true)}
            style={{
              background: '#0073b7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '3px',
              padding: '0.35rem 0.85rem',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Plus size={14} /> Log New Call
          </button>

          <button 
            onClick={() => setIsTipsOpen(true)}
            style={{ 
              background: '#0a192f', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '3px', 
              padding: '0.35rem 0.9rem', 
              fontSize: '12.5px', 
              fontWeight: 700, 
              cursor: 'pointer'
            }}
          >
            Tips
          </button>
        </div>
      </div>

      {/* 2. Light, Clean CRM Header Title Card */}
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '6px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '0.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                background: role === 'employee' ? '#e0f2fe' : '#fef3c7',
                color: role === 'employee' ? '#0369a1' : '#b45309',
                border: `1px solid ${role === 'employee' ? '#bae6fd' : '#fde68a'}`,
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {role === 'employee' ? <User size={12} /> : <Users size={12} />}
              {role === 'employee' ? 'Personal Advisor View' : 'Manager Master Feed'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>• Realtime Telephony Outreach</span>
          </div>

          <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#161e47', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneCall size={22} color="#0073b7" />
            {role === 'employee' ? 'My Advisory Call Logs & Talk Time' : 'All Employees Call Logs & Quality Audit'}
          </h2>
          <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '12.5px' }}>
            {role === 'employee' 
              ? `Review your dialer outreach, client conversations, audio recordings, and manager ratings.`
              : `Consolidated call recordings, conversational intelligence, audio waveforms, and coaching audits across all advisors.`}
          </p>
        </div>

        <button
          onClick={() => setIsLogCallOpen(true)}
          style={{
            background: '#0073b7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0, 115, 183, 0.25)'
          }}
        >
          <Plus size={15} /> Log New Call
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Card 1: Total Calls */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                {role === 'employee' ? 'My Calls Today' : 'Total Calls Logged'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                {totalCalls}
                {role === 'employee' && (
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>
                    / 35 Target
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Phone size={20} />
            </div>
          </div>
          {role === 'employee' ? (
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                <span>Daily Outreach Progress</span>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{Math.round((totalCalls / 35) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(100, Math.round((totalCalls / 35) * 100))}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                    borderRadius: '3px'
                  }} 
                />
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <TrendingUp size={14} />
              <span>+18% dial volume vs yesterday</span>
            </div>
          )}
        </div>

        {/* Card 2: Talk Time */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                {role === 'employee' ? 'My Talk Time' : 'Total Desk Talk Time'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                {totalHours}h {totalMinutes}m
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            Avg Duration: <strong style={{ color: '#0f172a' }}>{totalCalls > 0 ? formatTime(Math.round(totalDurationSeconds / totalCalls)) : '00:00'}</strong> per call
          </div>
        </div>

        {/* Card 3: High-Conviction / Conversions */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                {role === 'employee' ? 'Converted / Payment Sent' : 'Closing Pipeline'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a' }}>
                {convertedCount}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            Conversion Ratio: <strong style={{ color: '#16a34a' }}>{totalCalls > 0 ? ((convertedCount / totalCalls) * 100).toFixed(1) : 0}%</strong>
          </div>
        </div>

        {/* Card 4: Quality Score / Top Performer */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                {role === 'employee' ? 'Quality Rating' : 'Top Performer of Day'}
              </div>
              <div style={{ fontSize: role === 'employee' ? '28px' : '20px', fontWeight: 800, color: '#0f172a' }}>
                {role === 'employee' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {avgQualityScore}
                    <Star size={20} color="#f59e0b" fill="#f59e0b" />
                  </span>
                ) : (
                  topPerformer?.name
                )}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#faf5ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Award size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            {role === 'employee' ? (
              <span style={{ color: '#10b981', fontWeight: 600 }}>Consistent pitch compliance ⭐</span>
            ) : (
              <span>{topPerformer?.conversions || 0} conversions • {topPerformer?.count || 0} total calls</span>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid var(--border-color, #e2e8f0)',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-input, #f8fafc)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              padding: '8px 12px',
              gap: '8px',
              minWidth: '240px',
              flex: 1
            }}
          >
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by client, phone, notes, or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: 'var(--text-main, #0f172a)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Manager: Advisor Filter Dropdown */}
          {role !== 'employee' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Advisor:</span>
              <select
                value={selectedAdvisorId}
                onChange={e => setSelectedAdvisorId(e.target.value)}
                style={{
                  background: 'var(--bg-input, #f8fafc)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main, #0f172a)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">👥 All Advisors ({callLogs.length})</option>
                {advisorOptions.map(adv => (
                  <option key={adv.id} value={adv.id}>
                    {adv.name} ({adv.count} calls)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Disposition Filter */}
          <select
            value={dispositionFilter}
            onChange={e => setDispositionFilter(e.target.value)}
            style={{
              background: 'var(--bg-input, #f8fafc)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: 'var(--text-main, #0f172a)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">All Dispositions</option>
            <option value="Payment Link Sent">Payment Link Sent</option>
            <option value="Converted to Client">Converted to Client</option>
            <option value="Interested - Options HNI">Interested - Options HNI</option>
            <option value="Follow-up Scheduled">Follow-up Scheduled</option>
            <option value="KYC Verification Needed">KYC Verification Needed</option>
            <option value="Not Interested / Price Constraint">Price Constraint / Declined</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={e => setSentimentFilter(e.target.value)}
            style={{
              background: 'var(--bg-input, #f8fafc)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: 'var(--text-main, #0f172a)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">All Sentiments</option>
            <option value="Positive">🟢 Positive Intent</option>
            <option value="Neutral">🟡 Neutral Dialogue</option>
            <option value="Challenging">🔴 Challenging Objection</option>
          </select>

          {/* Direction Filter */}
          <select
            value={directionFilter}
            onChange={e => setDirectionFilter(e.target.value)}
            style={{
              background: 'var(--bg-input, #f8fafc)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: 'var(--text-main, #0f172a)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">All Directions</option>
            <option value="Outbound">↗️ Outbound Call</option>
            <option value="Inbound">↙️ Inbound Call</option>
          </select>
        </div>

        {/* Audio Recording Toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#475569',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <input
            type="checkbox"
            checked={recordingOnlyFilter}
            onChange={e => setRecordingOnlyFilter(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: '#2563eb' }}
          />
          <Headphones size={15} color="#2563eb" />
          <span>With Audio Recording Only</span>
        </label>
      </div>

      {/* Main Call Logs Table */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '14px',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {role !== 'employee' && (
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Advisory Executive
                  </th>
                )}
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Client Details
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Type & Time
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Duration
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Disposition & Insights
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Sentiment
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Quality Score
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                  Audio & Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={role !== 'employee' ? 8 : 7} style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'inline-flex', padding: '16px', background: '#f1f5f9', borderRadius: '50%', marginBottom: '12px' }}>
                      <PhoneCall size={32} color="#94a3b8" />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>No Call Logs Found</div>
                    <p style={{ fontSize: '13px', margin: '6px 0 16px 0' }}>
                      Try relaxing your filter criteria or log a new call entry.
                    </p>
                    <button
                      onClick={() => setIsLogCallOpen(true)}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      + Log Call Entry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(call => {
                  const isPositive = call.sentiment === 'Positive';
                  const isChallenging = call.sentiment === 'Challenging';

                  return (
                    <tr
                      key={call.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Advisor Column (Manager View) */}
                      {role !== 'employee' && (
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={call.employeeAvatar}
                              alt={call.employeeName}
                              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                {call.employeeName}
                              </div>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: '#64748b',
                                  background: '#f1f5f9',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                {call.employeeId}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Client Info */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {call.clientName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            <span>{call.clientPhone}</span>
                            <button
                              onClick={() => copyToClipboard(call.clientPhone, call.id)}
                              title="Copy Phone Number"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                            >
                              {copiedId === call.id ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                            </button>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#475569' }}>
                              <MapPin size={11} /> {call.clientCity}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Call Type & Timestamp */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          {call.callDirection === 'Outbound' ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#16a34a',
                                background: '#f0fdf4',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              <PhoneOutgoing size={11} /> Outbound
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#2563eb',
                                background: '#eff6ff',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              <PhoneIncoming size={11} /> Inbound
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{call.timestamp}</div>
                      </td>

                      {/* Duration */}
                      <td style={{ padding: '14px 18px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#0f172a',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          <Clock size={12} color="#64748b" />
                          {formatTime(call.durationSeconds)}
                        </div>
                      </td>

                      {/* Disposition & Key Notes */}
                      <td style={{ padding: '14px 18px', maxWidth: '320px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              borderRadius: '6px',
                              padding: '2px 8px',
                              background: call.disposition.includes('Converted')
                                ? '#dcfce7'
                                : call.disposition.includes('Payment Link')
                                ? '#dbeafe'
                                : call.disposition.includes('HNI')
                                ? '#fae8ff'
                                : '#f1f5f9',
                              color: call.disposition.includes('Converted')
                                ? '#15803d'
                                : call.disposition.includes('Payment Link')
                                ? '#1e40af'
                                : call.disposition.includes('HNI')
                                ? '#86198f'
                                : '#475569'
                            }}
                          >
                            {call.disposition}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#475569',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '300px'
                          }}
                          title={call.callNotes}
                        >
                          {call.callNotes}
                        </p>
                        {call.keyTopics && call.keyTopics.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                            {call.keyTopics.slice(0, 2).map((topic, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '10px',
                                  color: '#64748b',
                                  background: '#f1f5f9',
                                  padding: '1px 5px',
                                  borderRadius: '3px'
                                }}
                              >
                                #{topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Sentiment */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: isPositive ? '#f0fdf4' : isChallenging ? '#fef2f2' : '#fefce8',
                            color: isPositive ? '#15803d' : isChallenging ? '#b91c1c' : '#854d0e',
                            border: `1px solid ${isPositive ? '#bbf7d0' : isChallenging ? '#fecaca' : '#fef08a'}`
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isPositive ? '#16a34a' : isChallenging ? '#dc2626' : '#ca8a04'
                            }}
                          />
                          {call.sentiment}
                        </span>
                      </td>

                      {/* Quality Score & Feedback */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={14}
                              color="#f59e0b"
                              fill={(call.managerScore || 0) >= star ? '#f59e0b' : 'none'}
                            />
                          ))}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginLeft: '4px' }}>
                            {call.managerScore ? `${call.managerScore}/5` : 'Unrated'}
                          </span>
                        </div>
                        {call.managerNote && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#6366f1',
                              marginTop: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontStyle: 'italic'
                            }}
                            title={call.managerNote}
                          >
                            <MessageSquare size={10} />
                            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              "{call.managerNote}"
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Audio & Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {call.hasRecording ? (
                            <button
                              onClick={() => setActiveRecordingCall(call)}
                              style={{
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.3)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                              <Play size={12} fill="#ffffff" />
                              <span>Play {call.recordingDuration}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No Audio</span>
                          )}

                          {role !== 'employee' && (
                            <button
                              onClick={() => setActiveRecordingCall(call)}
                              title="Audit & Coach Advisor"
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '6px 8px',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')}
                              onMouseOut={e => (e.currentTarget.style.background = '#f1f5f9')}
                            >
                              <Sliders size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. INTERACTIVE AUDIO WAVEFORM PLAYER & AUDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {activeRecordingCall && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setActiveRecordingCall(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #cbd5e1'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#161e47' }}>
                    Call Audio Intelligence & Audit
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Interactive recording with voice activity waveform & AI summary
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRecordingCall(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Call Meta Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={activeRecordingCall.employeeAvatar}
                    alt={activeRecordingCall.employeeName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      {activeRecordingCall.clientName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Advisor: <strong>{activeRecordingCall.employeeName}</strong> • {activeRecordingCall.clientPhone}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#dbeafe',
                      color: '#1e40af'
                    }}
                  >
                    {activeRecordingCall.disposition}
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                    {activeRecordingCall.timestamp}
                  </div>
                </div>
              </div>

              {/* Animated Waveform Visualizer (Clean Light Modern Card) */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '18px',
                  border: '1.5px solid #cbd5e1'
                }}
              >
                {/* 36 Dynamic Audio Bars */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '60px',
                    marginBottom: '16px',
                    gap: '4px'
                  }}
                >
                  {Array.from({ length: 36 }).map((_, idx) => {
                    const barPercent = (idx / 36) * 100;
                    const isPassed = barPercent <= playbackProgress;
                    // Compute pseudo audio height based on index & playing state
                    const baseHeight = [
                      15, 30, 55, 40, 75, 90, 60, 35, 80, 100, 70, 45,
                      30, 65, 85, 95, 50, 40, 70, 90, 60, 40, 85, 75,
                      35, 55, 90, 65, 45, 80, 60, 40, 50, 35, 25, 15
                    ][idx % 36];
                    
                    const dynamicScale = isPlaying ? (Math.sin((idx + playbackProgress) * 0.5) * 20 + 80) / 100 : 0.85;
                    const computedHeight = Math.max(12, Math.min(58, baseHeight * dynamicScale));

                    return (
                      <div
                        key={idx}
                        onClick={() => setPlaybackProgress(barPercent)}
                        style={{
                          flex: 1,
                          height: `${computedHeight}px`,
                          borderRadius: '3px',
                          background: isPassed
                            ? 'linear-gradient(180deg, #0284c7 0%, #0073b7 100%)'
                            : '#cbd5e1',
                          cursor: 'pointer',
                          transition: 'height 0.2s ease, background 0.15s ease'
                        }}
                      />
                    );
                  })}
                </div>

                {/* Progress Bar & Scrubber */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={playbackProgress}
                  onChange={e => setPlaybackProgress(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '4px',
                    accentColor: '#0073b7',
                    cursor: 'pointer',
                    marginBottom: '14px'
                  }}
                />

                {/* Playback Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#161e47' }}>
                  <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#0073b7', fontWeight: 700 }}>
                    {formatTime(Math.round((activeRecordingCall.durationSeconds * playbackProgress) / 100))} / {activeRecordingCall.recordingDuration}
                  </div>

                  {/* Central Play/Pause button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      onClick={() => setIsPlaying(prev => !prev)}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0073b7 100%)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0, 115, 183, 0.35)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {isPlaying ? <Pause size={20} fill="#ffffff" /> : <Play size={20} fill="#ffffff" style={{ marginLeft: '2px' }} />}
                    </button>
                  </div>

                  {/* Speed Selector & Mute */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => {
                        const speeds = [1.0, 1.25, 1.5, 2.0];
                        const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                        setPlaybackSpeed(speeds[nextIndex]);
                      }}
                      style={{
                        background: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Toggle Playback Speed"
                    >
                      {playbackSpeed}x
                    </button>

                    <button
                      onClick={() => setIsMuted(prev => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}
                      title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      {isMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Call Notes & AI Summary */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#2563eb" />
                  <span>Call Summary & Transcript Notes</span>
                </div>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: '#334155',
                    lineHeight: '1.5',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {activeRecordingCall.callNotes}
                </div>
              </div>

              {/* Key Topics Tagged */}
              {activeRecordingCall.keyTopics && activeRecordingCall.keyTopics.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    Discussion Highlights
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activeRecordingCall.keyTopics.map((topic, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        ✓ {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Manager Coaching & Quality Evaluation Section (Visible to all, editable by Manager/HR) */}
              <div
                style={{
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={15} color="#d97706" />
                    Manager Quality Audit & Coaching Notes
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        disabled={role === 'employee'}
                        onClick={() => setEvaluatingScore(star)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: role === 'employee' ? 'default' : 'pointer',
                          padding: '2px'
                        }}
                      >
                        <Star
                          size={18}
                          color="#f59e0b"
                          fill={evaluatingScore >= star ? '#f59e0b' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {role !== 'employee' ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Add coaching feedback (e.g., strong risk pitch, work on closing timeline)..."
                      value={evaluatingNote}
                      onChange={e => setEvaluatingNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        marginBottom: '10px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleSaveScore}
                        style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Send size={13} />
                        Save Score & Coaching Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                    {activeRecordingCall.managerNote
                      ? `Supervisor Feedback: "${activeRecordingCall.managerNote}"`
                      : 'Not yet audited by supervisor.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. LOG NEW CALL MODAL */}
      {/* ------------------------------------------------------------- */}
      {isLogCallOpen && (
        <LogCallModal
          isOpen={isLogCallOpen}
          onClose={() => setIsLogCallOpen(false)}
          onAdd={addCallLog}
          currentUser={currentUser}
          employees={employees}
          role={role}
        />
      )}

      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};

// Subcomponent: Log New Call Modal
interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (call: Omit<CallLogRecord, 'id'>) => void;
  currentUser: any;
  employees: any[];
  role: string;
}

const LogCallModal: React.FC<LogCallModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  currentUser,
  employees,
  role
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [direction, setDirection] = useState<CallDirection>('Outbound');
  const [durationMins, setDurationMins] = useState('5');
  const [durationSecs, setDurationSecs] = useState('30');
  const [disposition, setDisposition] = useState('Interested - Options HNI');
  const [sentiment, setSentiment] = useState<CallSentiment>('Positive');
  const [notes, setNotes] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState(currentUser.id);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Please provide client name and phone number');
      return;
    }

    const assignedEmp = employees.find(e => e.id === selectedEmpId) || currentUser;
    const totalSecs = (parseInt(durationMins) || 0) * 60 + (parseInt(durationSecs) || 0);
    const formattedDuration = `${durationMins.padStart(2, '0')}:${durationSecs.padStart(2, '0')}`;

    onAdd({
      employeeId: assignedEmp.id,
      employeeName: assignedEmp.name,
      employeeAvatar: assignedEmp.avatar,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientCity: clientCity.trim() || 'Mumbai, MH',
      callDirection: direction,
      durationSeconds: totalSecs,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disposition,
      callNotes: notes.trim() || 'Logged call summary with client regarding market advisory and service tiers.',
      sentiment,
      recordingDuration: formattedDuration,
      hasRecording: true,
      managerScore: 5,
      keyTopics: ['Market Advisory', 'Portfolio Allocation']
    });

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0073b7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#161e47' }}>
                Log Telephony Call Record
              </h3>
              <p style={{ margin: '1px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                Record discussion details, call outcome, and duration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {role !== 'employee' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Advisory Executive
              </label>
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Client Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Singhania"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98201 XXXXX"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Client City
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, MH"
                value={clientCity}
                onChange={e => setClientCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Call Direction
              </label>
              <select
                value={direction}
                onChange={e => setDirection(e.target.value as CallDirection)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="Outbound">↗️ Outbound Call</option>
                <option value="Inbound">↙️ Inbound Call</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Duration (Mins : Secs)
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={durationMins}
                  onChange={e => setDurationMins(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationSecs}
                  onChange={e => setDurationSecs(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Sec"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Customer Sentiment
              </label>
              <select
                value={sentiment}
                onChange={e => setSentiment(e.target.value as CallSentiment)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="Positive">🟢 Positive Intent</option>
                <option value="Neutral">🟡 Neutral Discussion</option>
                <option value="Challenging">🔴 Challenging / Objection</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Call Disposition
            </label>
            <select
              value={disposition}
              onChange={e => setDisposition(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="Payment Link Sent">Payment Link Sent</option>
              <option value="Converted to Client">Converted to Client</option>
              <option value="Interested - Options HNI">Interested - Options HNI</option>
              <option value="Follow-up Scheduled">Follow-up Scheduled</option>
              <option value="KYC Verification Needed">KYC Verification Needed</option>
              <option value="Not Interested / Price Constraint">Not Interested / Price Constraint</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Call Discussion Notes
            </label>
            <textarea
              rows={3}
              placeholder="Outline discussion points, client portfolio inquiries, or objections handled..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: '#0073b7',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 18px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Save Call Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
