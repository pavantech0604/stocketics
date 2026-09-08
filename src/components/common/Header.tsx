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
  Briefcase,
  User,
  ArrowRight,
  Inbox
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    role, 
    currentUser, 
    theme, 
    toggleTheme, 
    notifications, 
    markNotificationRead,
    setActiveTab 
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Filter notifications specifically tailored for the active logged-in role
  const roleNotifications = notifications.filter(
    n => !n.targetRole || n.targetRole === role
  );

  const unreadCount = roleNotifications.filter(n => !n.read).length;

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
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
          WELCOME <span className="topbar-name-pill">{role === 'manager' ? 'VINOD KUMAR K J' : currentUser.name.toUpperCase()}</span>
        </span>

        <div className="topbar-quick-actions">
          <button 
            className="topbar-quick-link" 
            onClick={() => setActiveTab('ticket')}
            title="Open Tickets"
          >
            <Ticket size={14} />
            <span>Tickets</span>
          </button>

          <button 
            className="topbar-quick-link" 
            onClick={() => setActiveTab('mail')}
            title="Open Mail Messages"
          >
            <Mail size={14} />
            <span>Mail</span>
          </button>

          <span className="topbar-date-badge" title="Current Date">
            <span>08-Sep-2026 , Tue</span>
            <Calendar size={13} />
          </span>
        </div>
      </div>

      {/* Center: Urgency Announcement Marquee */}
      <div className="topbar-center">
        <div className="topbar-alert-marquee" title="Enterprise Announcement">
          <span className="marquee-pulse-dot" />
          <span className="marquee-text-bold">22 DAYS LEFT HURRY UP.</span>
          <span className="marquee-text-sub">WELCOME TO Apex Edge Research</span>
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

              {/* Notification List */}
              <div className="notif-list-container">
                {roleNotifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <Inbox size={32} color="#94a3b8" />
                    <span>No notifications for this role</span>
                  </div>
                ) : (
                  roleNotifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.actionTab)}
                      className={`notif-item-card ${n.read ? 'read' : 'unread'}`}
                      title={n.actionTab ? `Click to navigate to ${n.actionTab}` : 'Click to mark as read'}
                    >
                      <div className="notif-item-top">
                        <span className="notif-item-title">{n.title}</span>
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
                <span>Logged in as <strong>{currentUser.name}</strong> ({role.toUpperCase()})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
