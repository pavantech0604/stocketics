import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { Clock, Play, Square, Coffee, CheckCircle, Wifi } from 'lucide-react';

export const PunchClockWidget: React.FC = () => {
  const { 
    isClockedIn, 
    clockInTime, 
    isOnBreak, 
    breakType, 
    elapsedWorkSeconds, 
    handlePunchToggle, 
    handleBreakToggle 
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: true }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const targetShiftSeconds = 8 * 3600;
  const progressPercent = Math.min(100, Math.round((elapsedWorkSeconds / targetShiftSeconds) * 100));

  return (
    <div className="punch-clock-card">
      <div className="clock-display-row">
        <div>
          <div className="live-date-label">{currentDate}</div>
          <div className="live-time-ticker">{currentTime}</div>
        </div>

        <div>
          {isClockedIn ? (
            <span className="badge badge-active" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
              <span className="badge-dot" style={{ animation: 'pulseGlow 2s infinite' }} />
              {isOnBreak ? `On Break (${breakType})` : 'Active on Shift'}
            </span>
          ) : (
            <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
              <span className="badge-dot" />
              Clocked Out
            </span>
          )}
        </div>
      </div>

      {/* Elapsed Progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Logged: <strong className="mono-cell" style={{ color: 'var(--text-primary)' }}>{formatElapsed(elapsedWorkSeconds)}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Shift Target: <strong>08:00:00 ({progressPercent}%)</strong>
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="punch-actions-row">
        <button
          className={`btn ${isClockedIn ? 'btn-danger' : 'btn-primary'} btn-lg`}
          style={{ flex: 1 }}
          onClick={handlePunchToggle}
        >
          {isClockedIn ? (
            <>
              <Square size={18} />
              <span>Punch Out</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>Punch In to Shift</span>
            </>
          )}
        </button>

        {isClockedIn && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${isOnBreak && breakType === 'Lunch' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleBreakToggle('Lunch')}
              title="Take Lunch Break (30 mins)"
            >
              <Coffee size={16} />
              <span>{isOnBreak && breakType === 'Lunch' ? 'Resume from Lunch' : 'Lunch Break'}</span>
            </button>
            <button
              className={`btn ${isOnBreak && breakType === 'Tea' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleBreakToggle('Tea')}
              title="Quick Tea / Coffee Break"
            >
              <Coffee size={16} />
              <span>{isOnBreak && breakType === 'Tea' ? 'Resume from Tea' : 'Tea Break'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Network Verification Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Wifi size={13} style={{ color: 'var(--success)' }} />
          <span>Connected: <strong>106.51.67.248</strong> (Bangalore HQ Gateway)</span>
        </div>
        <div>Clock In: <strong>{clockInTime || '--'}</strong></div>
      </div>
    </div>
  );
};
