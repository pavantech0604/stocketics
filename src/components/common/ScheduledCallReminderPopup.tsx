import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import {
  PhoneCall,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  PhoneOff,
  User,
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScheduledCallReminderPopup: React.FC = () => {
  const {
    currentUser,
    callReminders,
    resolveCallReminder,
    scheduleCallReminder,
    setActiveTab,
    showToast,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter due reminders:
  // 1. Belong to current user or unassigned/admin
  // 2. Status is 'Pending' or 'Snoozed' (where snooze has expired)
  // 3. Not dismissed in current session
  const now = new Date();

  const dueReminders = callReminders.filter(r => {
    if (dismissedReminderIds.includes(r.id)) return false;
    
    // Role check: employees see their own; managers/team leads see all or theirs
    const isOwner = (r as any).employeeId === currentUser.id ||
      r.assignedToId === currentUser.id ||
      (r.assignedToName && r.assignedToName.toLowerCase() === currentUser.name.toLowerCase()) ||
      ((r as any).employeeName && (r as any).employeeName.toLowerCase() === currentUser.name.toLowerCase()) ||
      currentUser.role === 'manager' ||
      currentUser.role === 'admin';
    if (!isOwner) return false;

    if (r.status === 'Completed' || (r.status as any) === 'Cancelled') return false;

    if (r.status === 'Snoozed' && r.snoozedUntil) {
      return new Date(r.snoozedUntil) <= now;
    }

    // Pending: if scheduledTime is within 15 minutes or past due
    const schedDate = new Date(r.scheduledTime);
    // 15 mins window into future, or anytime in the past
    return schedDate.getTime() - now.getTime() <= 15 * 60 * 1000;
  });

  // Audio chime when alert triggers
  useEffect(() => {
    if (dueReminders.length > 0) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {
        // audio context autoplay restrictions
      }
    }
  }, [dueReminders.length]);

  if (dueReminders.length === 0) return null;

  const currentReminder = dueReminders[currentIndex] || dueReminders[0];
  if (!currentReminder) return null;

  const handleCallDone = () => {
    resolveCallReminder(currentReminder.id, 'Completed', undefined, callNotes || 'Call completed successfully.');
    setCallNotes('');
  };

  const handleNotReachable = () => {
    resolveCallReminder(currentReminder.id, 'Not Reachable', undefined, callNotes || 'Client was not reachable.');
    setCallNotes('');
  };

  const handleSnooze = (minutes: number) => {
    const snoozeDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    resolveCallReminder(currentReminder.id, 'Snoozed', snoozeDate, `Snoozed for ${minutes} minutes.`);
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleDate || !rescheduleTime) {
      showToast('Please select both date and time to reschedule.', 'warning');
      return;
    }
    const fullDate = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
    resolveCallReminder(currentReminder.id, 'Rescheduled', fullDate, callNotes || 'Rescheduled per client request.');
    setRescheduleModalOpen(false);
    setRescheduleDate('');
    setRescheduleTime('');
    setCallNotes('');
  };

  const handleDismiss = () => {
    setDismissedReminderIds(prev => [...prev, currentReminder.id]);
  };

  const copyPhone = () => {
    const ph = currentReminder.clientPhone || currentReminder.phone;
    navigator.clipboard.writeText(ph);
    showToast(`Phone number ${ph} copied to clipboard!`, 'info');
  };

  const priorityColor = {
    Urgent: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444' },
    High: { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: '#f97316' },
    Medium: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '#3b82f6' },
    Low: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280', border: '#6b7280' }
  }[(currentReminder.priority as 'Urgent' | 'High' | 'Medium' | 'Low') || 'High'] || { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: '#f97316' };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99998,
        maxWidth: 460,
        width: 'calc(100vw - 48px)',
        background: isDark ? '#0f172a' : '#ffffff',
        border: isDark ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid #ef4444',
        boxShadow: isDark 
          ? '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(239, 68, 68, 0.25)' 
          : '0 20px 45px rgba(0, 0, 0, 0.12), 0 0 20px rgba(239, 68, 68, 0.15)',
        borderRadius: 16,
        padding: 20,
        color: isDark ? '#f8fafc' : '#0f172a',
        animation: 'slideUpBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            <PhoneCall size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                Scheduled Call Reminder
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: priorityColor.bg,
                  color: priorityColor.text,
                  border: `1px solid ${priorityColor.border}`
                }}
              >
                {(currentReminder.priority || 'High').toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b' }}>
              Scheduled for {new Date(currentReminder.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {dueReminders.length > 1 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b', marginRight: 4 }}>
              {currentIndex + 1} of {dueReminders.length}
            </span>
          )}
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Dismiss popup for now"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Client Detail Card */}
      <div
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} color={isDark ? '#38bdf8' : '#0284c7'} />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: isDark ? '#fff' : '#0f172a' }}>
              {currentReminder.clientName}
            </span>
          </div>
          <button
            onClick={copyPhone}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 6,
              background: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.1)',
              color: isDark ? '#38bdf8' : '#0284c7',
              border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.25)'}`,
              cursor: 'pointer'
            }}
          >
            <Copy size={12} />
            {currentReminder.clientPhone || currentReminder.phone}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: isDark ? 'var(--text-secondary, #cbd5e1)' : '#475569', marginBottom: 6 }}>
          <Clock size={14} color="#f59e0b" />
          <span>Purpose: <strong style={{ color: isDark ? '#fff' : '#0f172a' }}>{currentReminder.purpose || currentReminder.leadStatus || 'Follow-up Call'}</strong></span>
        </div>

        {currentReminder.notes && (
          <div style={{ fontSize: '0.75rem', color: isDark ? 'var(--text-secondary, #94a3b8)' : '#475569', background: isDark ? 'rgba(0,0,0,0.2)' : '#f1f5f9', padding: '6px 10px', borderRadius: 8 }}>
            <em>"{currentReminder.notes}"</em>
          </div>
        )}
      </div>

      {/* Call notes input toggle */}
      {showNotesInput && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            placeholder="Add quick call notes / discussion outcome..."
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: isDark ? 'rgba(0,0,0,0.3)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
              borderRadius: 8,
              padding: 8,
              color: isDark ? '#fff' : '#0f172a',
              fontSize: '0.8rem',
              resize: 'none',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Action Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, marginBottom: 8 }}>
        <button
          onClick={handleCallDone}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          <CheckCircle2 size={16} />
          Call Done
        </button>

        <button
          onClick={handleNotReachable}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <PhoneOff size={15} />
          Not Reachable
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <button
          onClick={() => handleSnooze(15)}
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
            color: isDark ? 'var(--text-secondary, #cbd5e1)' : '#475569',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1'}`,
            borderRadius: 7,
            padding: '7px 4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer'
          }}
        >
          <Clock size={13} />
          Snooze 15m
        </button>

        <button
          onClick={() => setRescheduleModalOpen(true)}
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(2, 132, 199, 0.1)',
            color: isDark ? '#60a5fa' : '#0284c7',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(2, 132, 199, 0.25)'}`,
            borderRadius: 7,
            padding: '7px 4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer'
          }}
        >
          <Calendar size={13} />
          Reschedule
        </button>

        <button
          onClick={() => setShowNotesInput(prev => !prev)}
          style={{
            background: showNotesInput 
              ? (isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0') 
              : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'),
            color: isDark ? 'var(--text-secondary, #cbd5e1)' : '#475569',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1'}`,
            borderRadius: 7,
            padding: '7px 4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {showNotesInput ? 'Hide Note' : '+ Add Note'}
        </button>
      </div>

      {/* Multiple alerts navigation */}
      {dueReminders.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}>
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentIndex === 0 ? (isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1') : (isDark ? '#38bdf8' : '#0284c7'),
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span style={{ fontSize: '0.7rem', color: isDark ? 'var(--text-secondary, #94a3b8)' : '#64748b' }}>
            Switch between due calls
          </span>
          <button
            disabled={currentIndex === dueReminders.length - 1}
            onClick={() => setCurrentIndex(prev => Math.min(dueReminders.length - 1, prev + 1))}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentIndex === dueReminders.length - 1 ? (isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1') : (isDark ? '#38bdf8' : '#0284c7'),
              cursor: currentIndex === dueReminders.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Reschedule Date/Time Picker Modal Sub-panel */}
      {rescheduleModalOpen && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark ? '#0f172a' : '#ffffff',
            border: isDark ? 'none' : '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 10
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#fff' : '#0f172a' }}>Reschedule Follow-up Call</span>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: 4 }}>Select New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: 4 }}>Select New Time</label>
              <input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: 4 }}>Reason for Reschedule</label>
              <input
                type="text"
                placeholder="e.g. Client requested evening callback"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              onClick={() => setRescheduleModalOpen(false)}
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                color: isDark ? '#fff' : '#475569',
                border: `1px solid ${isDark ? 'transparent' : '#cbd5e1'}`,
                borderRadius: 8,
                padding: '10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRescheduleSubmit}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
