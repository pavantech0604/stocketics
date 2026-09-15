import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Bell, 
  Moon, 
  Sun, 
  CheckCheck,
  Calendar,
  Ticket,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  User,
  ArrowRight,
  Inbox,
  Sparkles,
  ExternalLink,
  Cake,
  PartyPopper,
  Clock,
  Target,
  TrendingUp,
  Flame,
  X,
  CheckCircle2
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    role, 
    currentUser, 
    theme, 
    toggleTheme, 
    notifications, 
    markNotificationRead,
    setActiveTab,
    clientSearchAlerts,
    acknowledgeSearchAlert,
    dismissAllSearchAlerts,
    simulateCrossSearchAlert,
    openBirthdayCelebration,
    todayBirthdays,
    simulateBirthdayCelebration,
    showToast
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchAlertsOpen, setIsSearchAlertsOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchAlertsRef = useRef<HTMLDivElement>(null);

  // Live real-time clock updating every second for day-to-day dynamic time
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format dynamic day-to-day date: e.g. "15-Sep-2026, Tue"
  const formattedDateStr = React.useMemo(() => {
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    const month = currentDateTime.toLocaleString('en-US', { month: 'short' });
    const year = currentDateTime.getFullYear();
    const weekday = currentDateTime.toLocaleString('en-US', { weekday: 'short' });
    return `${day}-${month}-${year}, ${weekday}`;
  }, [currentDateTime]);

  // Format live ticking time: "12:05:42 PM"
  const formattedTimeStr = React.useMemo(() => {
    return currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, [currentDateTime]);

  // Dynamic day-to-day countdown calculation for month-end target cycle
  const countdownData = React.useMemo(() => {
    const now = currentDateTime;
    const year = now.getFullYear();
    const month = now.getMonth();
    const dayOfMonth = now.getDate();

    // End of active month
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const totalDaysInMonth = endOfMonth.getDate();
    const daysLeft = Math.max(0, totalDaysInMonth - dayOfMonth);

    const msDiff = Math.max(0, endOfMonth.getTime() - now.getTime());
    const totalSecs = Math.floor(msDiff / 1000);
    const seconds = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const minutes = totalMins % 60;
    const hours = Math.floor(totalMins / 60) % 24;

    const monthProgress = Math.min(100, Math.round((dayOfMonth / totalDaysInMonth) * 100));
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    const shortMonth = now.toLocaleString('en-US', { month: 'short' });

    // Target metrics
    const monthlyTarget = 450000;
    const achievedMTD = Math.round(monthlyTarget * (monthProgress / 100) * 0.92);
    const gap = Math.max(0, monthlyTarget - achievedMTD);
    const dailyRunRate = daysLeft > 0 ? Math.round(gap / daysLeft) : gap;

    return {
      dayOfMonth,
      totalDaysInMonth,
      daysLeft,
      hours,
      minutes,
      seconds,
      monthProgress,
      monthName,
      shortMonth,
      monthlyTarget,
      achievedMTD,
      gap,
      dailyRunRate
    };
  }, [currentDateTime]);

  // Filter client search alerts for current user
  const mySearchAlerts = clientSearchAlerts.filter(
    a => a.ownerName.toLowerCase() === currentUser.name.toLowerCase() || (a.ownerId && a.ownerId === currentUser.id)
  );
  const unreadSearchAlertsCount = mySearchAlerts.filter(a => !a.read).length;

  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'lead_access'>('all');

  // Filter notifications specifically tailored for the active logged-in role
  const roleNotifications = notifications.filter(n => {
    if (n.type === 'lead_access') {
      if (n.targetUserId && n.targetUserId !== currentUser.id && currentUser.role !== 'manager' && currentUser.role !== 'admin') {
        return false;
      }
      return true;
    }
    return !n.targetRole || n.targetRole === role;
  });

  const displayNotifications = roleNotifications.filter(n => {
    if (notifFilter === 'unread') return !n.read;
    if (notifFilter === 'lead_access') return n.type === 'lead_access';
    return true;
  });

  const unreadCount = roleNotifications.filter(n => !n.read).length;

  // Close notifications and search alerts on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchAlertsRef.current && !searchAlertsRef.current.contains(e.target as Node)) {
        setIsSearchAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, actionTab?: string) => {
    markNotificationRead(id);
    if (actionTab) {
      setActiveTab(actionTab);
      setIsNotifOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    roleNotifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const getRoleHeaderInfo = () => {
    switch (role) {
      case 'hr':
        return {
          badge: 'HR Operations',
          icon: <ShieldCheck size={13} />,
          color: '#0073b7',
          bgColor: '#e0f2fe'
        };
      case 'manager':
        return {
          badge: 'Manager Pipeline',
          icon: <Briefcase size={13} />,
          color: '#0284c7',
          bgColor: '#e0f2fe'
        };
      case 'employee':
      default:
        return {
          badge: 'Employee Desk',
          icon: <User size={13} />,
          color: '#10b981',
          bgColor: '#ecfdf5'
        };
    }
  };

  const roleInfo = getRoleHeaderInfo();

  return (
    <header className="topbar">
      {/* Left: Welcome Title & Quick Actions */}
      <div className="topbar-left">
        <span className="topbar-welcome-title">
          WELCOME TO <span className="topbar-name-pill">STOCKETICS</span>
        </span>

        <div className="topbar-quick-actions">
          <button 
            className="topbar-quick-link" 
            onClick={() => setActiveTab('ticket')}
            title="Open Tickets"
          >
            <Ticket size={14} />
            <span className="quick-link-text">Tickets</span>
          </button>

          <button 
            className="topbar-quick-link" 
            onClick={() => setActiveTab('mail')}
            title="Open Mail Messages"
          >
            <Mail size={14} />
            <span className="quick-link-text">Mail</span>
          </button>

          {/* Static Live Date Display Badge */}
          <div 
            className="topbar-date-badge static" 
            title={`Current Date: ${formattedDateStr}`}
          >
            <Calendar size={13} className="topbar-date-icon" />
            <span>{formattedDateStr}</span>
          </div>
        </div>
      </div>

      {/* Center: Urgency Announcement Marquee */}
      <div className="topbar-center">
        <div className="topbar-urgency-wrapper">
          <div 
            className="topbar-alert-marquee static"
            title={`${countdownData.daysLeft} days remaining in ${countdownData.monthName} fiscal sprint`}
          >
            <span className="marquee-pulse-dot" />
            <span className="marquee-text-bold">
              {countdownData.daysLeft} {countdownData.daysLeft === 1 ? 'DAY' : 'DAYS'} LEFT HURRY UP!
            </span>
            <span className="marquee-sep">•</span>
            <span className="marquee-sprint-tag">
              <span className="marquee-sub-full">
                {countdownData.monthName.toUpperCase()} SPRINT
              </span>
              <span className="marquee-sub-short">
                {countdownData.shortMonth.toUpperCase()} SPRINT
              </span>
              <Flame size={12} className="marquee-flame-icon" />
            </span>
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle & Role-Specific Interactive Notifications (Role Switcher Buttons Removed) */}
      <div className="topbar-right">
        {/* Theme Toggle */}
        <button 
          className="topbar-action-icon" 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Interactive Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className={`topbar-action-icon notif-trigger ${isNotifOpen ? 'active' : ''}`}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title={`Notifications (${unreadCount} unread for ${role.toUpperCase()})`}
            aria-label="Open Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown-popover" role="dialog" aria-label="Notifications">
              {/* Popover Header */}
              <div className="notif-header">
                <div className="notif-title-wrap">
                  <span className="notif-main-title">Notifications</span>
                  <span 
                    className="notif-role-badge" 
                    style={{ color: roleInfo.color, background: roleInfo.bgColor }}
                  >
                    {roleInfo.icon}
                    <span>{roleInfo.badge}</span>
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button 
                    className="notif-mark-all-btn" 
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-alt)' }}>
                <button
                  onClick={() => setNotifFilter('all')}
                  style={{
                    background: notifFilter === 'all' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: notifFilter === 'all' ? '#3b82f6' : 'var(--text-muted)',
                    border: notifFilter === 'all' ? '1px solid #3b82f6' : '1px solid transparent',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  All ({roleNotifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  style={{
                    background: notifFilter === 'unread' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: notifFilter === 'unread' ? '#ef4444' : 'var(--text-muted)',
                    border: notifFilter === 'unread' ? '1px solid #ef4444' : '1px solid transparent',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setNotifFilter('lead_access')}
                  style={{
                    background: notifFilter === 'lead_access' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: notifFilter === 'lead_access' ? '#10b981' : 'var(--text-muted)',
                    border: notifFilter === 'lead_access' ? '1px solid #10b981' : '1px solid transparent',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Lead Access ({roleNotifications.filter(n => n.type === 'lead_access').length})
                </button>
              </div>

              {/* Notification List */}
              <div className="notif-list-container">
                {displayNotifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <Inbox size={32} color="#94a3b8" />
                    <span>No notifications matching selected filter</span>
                  </div>
                ) : (
                  displayNotifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.actionTab)}
                      className={`notif-item-card ${n.read ? 'read' : 'unread'}`}
                      style={{
                        borderLeft: n.type === 'lead_access' ? '3px solid #f59e0b' : undefined,
                        background: !n.read && n.type === 'lead_access' ? 'rgba(245, 158, 11, 0.05)' : undefined
                      }}
                      title={n.actionTab ? `Click to navigate to ${n.actionTab}` : 'Click to mark as read'}
                    >
                      <div className="notif-item-top">
                        <span className="notif-item-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {n.type === 'lead_access' && <ShieldAlert size={14} color="#f59e0b" />}
                          {n.title}
                        </span>
                        {!n.read && <span className="notif-unread-dot" />}
                      </div>
                      <p className="notif-item-message">{n.message}</p>
                      <div className="notif-item-footer">
                        <span className="notif-item-time">{n.time}</span>
                        {n.actionTab && (
                          <span className="notif-item-action-tag">
                            <span>Open {n.actionTab}</span>
                            <ArrowRight size={11} />
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Footer */}
              <div className="notif-footer-bar">
                <span>Active Session: <strong>{role.toUpperCase()} PORTAL</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Company Birthday Celebration Widget */}
        <button 
          className="topbar-action-icon notif-trigger"
          onClick={openBirthdayCelebration}
          title={`Today's Company Birthdays (${todayBirthdays.length} Celebrants) — Click to view official wishes!`}
          aria-label="Open Birthday Celebration"
          style={{
            color: '#f59e0b',
            position: 'relative'
          }}
        >
          <Cake size={18} />
          {todayBirthdays.length > 0 && (
            <span 
              className="notification-dot" 
              style={{ 
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
              }}
            >
              {todayBirthdays.length}
            </span>
          )}
        </button>

        {/* Client Access Security & Search Alerts Popover (Only for roles dealing with clients; HR does not deal with clients) */}
        {role !== 'hr' && (
          <div style={{ position: 'relative' }} ref={searchAlertsRef} className="topbar-security-wrapper">
            <button 
              className={`topbar-action-icon notif-trigger topbar-security-btn ${unreadSearchAlertsCount > 0 ? 'has-alerts' : 'secure'} ${isSearchAlertsOpen ? 'active' : ''}`}
              onClick={() => setIsSearchAlertsOpen(!isSearchAlertsOpen)}
              title={unreadSearchAlertsCount > 0 
                ? `Client Access Audit: ${unreadSearchAlertsCount} unread search alert${unreadSearchAlertsCount > 1 ? 's' : ''}` 
                : "Client Lookup Security & Audit Log (Protected)"
              }
              aria-label="Open Client Search Alerts"
            >
              {unreadSearchAlertsCount > 0 ? (
                <ShieldAlert size={17} className="security-icon alert-pulse" />
              ) : (
                <ShieldCheck size={17} className="security-icon verified" />
              )}
              {unreadSearchAlertsCount > 0 && (
                <span className="notification-dot security-badge">
                  {unreadSearchAlertsCount > 9 ? '9+' : unreadSearchAlertsCount}
                </span>
              )}
            </button>

            {isSearchAlertsOpen && (
              <div className="notif-dropdown-popover" role="dialog" aria-label="Client Search Alerts" style={{ width: '360px' }}>
                {/* Popover Header */}
                <div className="notif-header" style={{ borderBottom: '1px solid rgba(0, 180, 216, 0.2)' }}>
                  <div className="notif-title-wrap">
                    <span className="notif-main-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0073b7' }}>
                      <ShieldAlert size={16} color="#00b4d8" /> Client Lookups
                    </span>
                    <span 
                      className="notif-role-badge" 
                      style={{ color: '#0284c7', background: 'rgba(0, 180, 216, 0.12)', fontWeight: 600 }}
                    >
                      {mySearchAlerts.length} Total Logs
                    </span>
                  </div>

                  <button 
                    className="notif-mark-all-btn" 
                    onClick={dismissAllSearchAlerts}
                    title="Acknowledge all"
                  >
                    <CheckCheck size={14} />
                    <span>Dismiss all</span>
                  </button>
                </div>

                {/* Notification List */}
                <div className="notif-list-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {mySearchAlerts.length === 0 ? (
                    <div className="notif-empty-state" style={{ padding: '24px 16px', textAlign: 'center' }}>
                      <ShieldAlert size={28} style={{ margin: '0 auto 8px', color: 'var(--text-muted)', opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                        No other employee has queried your clients yet.
                      </p>
                    </div>
                  ) : (
                    mySearchAlerts.map(a => (
                      <div 
                        key={a.id}
                        className={`notif-item ${!a.acknowledged ? 'unread' : 'read'}`}
                        style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid var(--border-color)',
                          background: !a.acknowledged ? 'rgba(0, 180, 216, 0.05)' : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          acknowledgeSearchAlert(a.id);
                          setActiveTab('active-clients');
                          setIsSearchAlertsOpen(false);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <img 
                            src={a.searchedByAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                            alt={a.searchedByName}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {a.searchedByName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#0284c7', marginLeft: 'auto' }}>
                            {a.timestamp}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          Searched for your client: <strong style={{ color: '#0073b7' }}>{a.clientName}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span>Source: {a.searchLocation}</span>
                          <span style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            View client <ExternalLink size={11} />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Simulation Action in Footer */}
                <div className="notif-footer-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Audited for compliance</span>
                  <button
                    onClick={() => {
                      simulateCrossSearchAlert();
                      setIsSearchAlertsOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={12} color="#00b4d8" /> Test Live Pop-up
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
