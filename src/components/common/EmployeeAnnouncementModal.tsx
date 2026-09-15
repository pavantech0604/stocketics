import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import {
  Megaphone,
  Sparkles,
  Trophy,
  Bell,
  Sun,
  X,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EmployeeAnnouncementModal: React.FC = () => {
  const {
    currentUser,
    announcements,
    markAnnouncementRead,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  const [dismissedModalIds, setDismissedModalIds] = useState<string[]>([]);

  // Find active announcements for current user's role that are unread
  const unreadAnnouncements = announcements.filter(a => {
    if (!a.isActive) return false;
    if (dismissedModalIds.includes(a.id)) return false;

    // Audience targeting
    if (a.targetAudience === 'Employees' && currentUser.role !== 'employee') return false;
    if (a.targetAudience === 'TeamLeads' && currentUser.role !== 'team_leader') return false;
    if (a.targetAudience === 'Managers' && currentUser.role !== 'manager') return false;

    // Read check
    const isRead = a.readByEmployeeIds.includes(currentUser.id);
    return !isRead;
  });

  const activeAnnouncement = unreadAnnouncements[0];

  useEffect(() => {
    if (activeAnnouncement && (activeAnnouncement.type === 'Celebration' || activeAnnouncement.type === 'Milestone' || activeAnnouncement.type === 'MorningGreeting')) {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [activeAnnouncement?.id]);

  if (!activeAnnouncement) return null;

  const handleAcknowledge = () => {
    markAnnouncementRead(activeAnnouncement.id, currentUser.id);
    setDismissedModalIds(prev => [...prev, activeAnnouncement.id]);
  };

  const handleDismissTemporary = () => {
    setDismissedModalIds(prev => [...prev, activeAnnouncement.id]);
  };

  const getIcon = () => {
    switch (activeAnnouncement.type) {
      case 'MorningGreeting':
        return <Sun size={28} color="#f59e0b" />;
      case 'Celebration':
      case 'Milestone':
        return <Trophy size={28} color="#eab308" />;
      case 'Urgent':
        return <Megaphone size={28} color="#ef4444" />;
      default:
        return <Bell size={28} color="#3b82f6" />;
    }
  };

  const getGradient = () => {
    switch (activeAnnouncement.type) {
      case 'MorningGreeting':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.05))';
      case 'Celebration':
      case 'Milestone':
        return 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(161, 98, 7, 0.05))';
      case 'Urgent':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(185, 28, 28, 0.05))';
      default:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(29, 78, 216, 0.05))';
    }
  };

  const getBorderColor = () => {
    switch (activeAnnouncement.type) {
      case 'MorningGreeting':
        return '#f59e0b';
      case 'Celebration':
      case 'Milestone':
        return '#eab308';
      case 'Urgent':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark ? 'rgba(10, 17, 40, 0.78)' : 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        zIndex: 99997,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: isDark ? '#0f172a' : '#ffffff',
          border: `1.5px solid ${getBorderColor()}`,
          boxShadow: isDark 
            ? `0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px ${getBorderColor()}33` 
            : `0 20px 45px rgba(0, 0, 0, 0.1), 0 0 20px ${getBorderColor()}20`,
          borderRadius: 20,
          padding: 28,
          color: isDark ? '#f8fafc' : '#0f172a',
          position: 'relative',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Background glow banner */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            background: getGradient(),
            pointerEvents: 'none'
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleDismissTemporary}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
            border: 'none',
            color: isDark ? '#94a3b8' : '#64748b',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
          title="Dismiss for this session"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 1, marginBottom: 16 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc',
              border: `1px solid ${getBorderColor()}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isDark ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            {getIcon()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: `${getBorderColor()}25`,
                  color: getBorderColor(),
                  border: `1px solid ${getBorderColor()}55`
                }}
              >
                {activeAnnouncement.type}
              </span>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                {activeAnnouncement.createdAt}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', lineHeight: 1.3 }}>
              {activeAnnouncement.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: 18,
            marginBottom: 20,
            fontSize: '0.92rem',
            lineHeight: 1.6,
            color: isDark ? '#cbd5e1' : '#334155',
            whiteSpace: 'pre-line'
          }}
        >
          {activeAnnouncement.content}
        </div>

        {/* Footer Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
            borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
            paddingTop: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            <User size={14} />
            <span>Posted by: <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{activeAnnouncement.createdByName}</strong></span>
          </div>

          <button
            onClick={handleAcknowledge}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
            }}
          >
            <CheckCircle2 size={16} />
            I Have Read & Understood
          </button>
        </div>
      </div>
    </div>
  );
};

// Compact top-bar announcement banner for dashboard headers
export const AnnouncementBannerStrip: React.FC = () => {
  const { announcements, currentUser } = useApp();

  const active = announcements.find(a => {
    if (!a.isActive) return false;
    if (a.targetAudience === 'Employees' && currentUser.role !== 'employee') return false;
    if (a.targetAudience === 'TeamLeads' && currentUser.role !== 'team_leader') return false;
    if (a.targetAudience === 'Managers' && currentUser.role !== 'manager') return false;
    return true;
  });

  if (!active) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.12), rgba(147, 51, 234, 0.12))',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 10,
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        fontSize: '0.82rem',
        color: 'var(--text-primary, #e2e8f0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
        <span
          style={{
            background: '#3b82f6',
            color: '#fff',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          ANNOUNCEMENT
        </span>
        <span style={{ fontWeight: 700, color: '#60a5fa' }}>{active.title}:</span>
        <span style={{ color: 'var(--text-secondary, #cbd5e1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {(active.content || active.message || '').split('\n')[0]}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
        <span>By {active.createdByName || active.createdBy}</span>
      </div>
    </div>
  );
};
