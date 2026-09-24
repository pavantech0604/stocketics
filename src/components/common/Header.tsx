import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Inbox,
  Clock,
  X,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  CalendarDays,
  Flame
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Header: React.FC = () => {
  const { 
    role, 
    currentUser, 
    theme, 
    toggleTheme, 
    notifications, 
    markNotificationRead,
    activeTab,
    setActiveTab,
    login,
    showToast
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [urgencyMetric, setUrgencyMetric] = useState<'revenue' | 'calls' | 'leads'>('revenue');

  // Real-time ticking date & clock engine
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calendar interactive navigation & selection state
  const [calMonth, setCalMonth] = useState<number>(now.getMonth());
  const [calYear, setCalYear] = useState<number>(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const notifRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const urgencyRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setIsCalendarOpen(false);
      }
      if (urgencyRef.current && !urgencyRef.current.contains(target)) {
        setIsUrgencyOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsCalendarOpen(false);
        setIsUrgencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter notifications specifically tailored for the active logged-in role
  const roleNotifications = notifications.filter(
    n => !n.targetRole || n.targetRole === role
  );

  const unreadCount = roleNotifications.filter(n => !n.read).length;

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
          badge: 'HR Admin',
          icon: <ShieldCheck size={13} />,
          color: '#0073b7',
          bgColor: '#e0f2fe'
        };
      case 'manager':
        return {
          badge: 'Sales Manager',
          icon: <Briefcase size={13} />,
          color: '#0284c7',
          bgColor: '#e0f2fe'
        };
      case 'team_leader':
        return {
          badge: 'Team Leader',
          icon: <Target size={13} />,
          color: '#7c3aed',
          bgColor: '#f5f3ff'
        };
      case 'employee':
      default:
        return {
          badge: 'Equity Advisor',
          icon: <User size={13} />,
          color: '#10b981',
          bgColor: '#ecfdf5'
        };
    }
  };

  const roleInfo = getRoleHeaderInfo();
  const isTicketActive = activeTab === 'ticket' || activeTab === 'tickets' || activeTab === 'tickets-category';
  const isMailActive = activeTab === 'mail';

  // Dynamic Date calculations based on actual current day (e.g. 22-Sep-2026)
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Total days in current month & exact days remaining
  const daysInCurrentMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const daysLeftInMonth = Math.max(0, daysInCurrentMonth - currentDay);

  // Topbar date display string (e.g. "22-Sep-2026 , Tue")
  const topDateStr = useMemo(() => {
    const dStr = String(currentDay).padStart(2, '0');
    const mStr = MONTH_SHORT[currentMonth];
    const yStr = currentYear;
    const dayName = DAY_NAMES[now.getDay()];
    return `${dStr}-${mStr}-${yStr} , ${dayName}`;
  }, [currentDay, currentMonth, currentYear, now]);

  // Live IST Digital Clock string (e.g. "07:15:32 PM IST")
  const liveClockStr = useMemo(() => {
    return now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' IST';
  }, [now]);

  // Live Market Session calculation
  const marketSession = useMemo(() => {
    const day = now.getDay();
    if (day === 0 || day === 6) {
      return { label: 'Closed (Weekend)', isOpen: false, color: '#f43f5e', dot: '#f43f5e' };
    }
    const hours = now.getHours();
    const mins = now.getMinutes();
    const totalMins = hours * 60 + mins;

    if (totalMins >= 9 * 60 && totalMins < 9 * 60 + 15) {
      return { label: 'Pre-Market (09:00 - 09:15)', isOpen: true, color: '#f59e0b', dot: '#f59e0b' };
    } else if (totalMins >= 9 * 60 + 15 && totalMins < 15 * 60 + 30) {
      return { label: 'Live Active (NSE/BSE Open)', isOpen: true, color: '#10b981', dot: '#10b981' };
    } else if (totalMins >= 15 * 60 + 30 && totalMins < 16 * 60) {
      return { label: 'Post-Market Session', isOpen: false, color: '#0284c7', dot: '#0284c7' };
    } else {
      return { label: 'Closed (NSE/BSE)', isOpen: false, color: '#64748b', dot: '#94a3b8' };
    }
  }, [now]);

  // Live Month-End Countdown for Urgency Popover
  const monthEndCountdown = useMemo(() => {
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const diff = Math.max(0, endOfMonth.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return { days, hours, mins, secs };
  }, [now, currentYear, currentMonth]);

  // Month-end progress percentage
  const monthProgressPct = Math.round((currentDay / daysInCurrentMonth) * 100);

  // Calendar view calculations for browsing months
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfCalMonth = new Date(calYear, calMonth, 1).getDay();
  // Monday-first offset
  const calStartOffset = (firstDayOfCalMonth + 6) % 7;

  // Calendar navigation handlers
  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    showToast(`Calendar centered to Today (${now.getDate()}-${MONTH_SHORT[now.getMonth()]}-${now.getFullYear()})`, 'info');
  };

  const handleSelectDay = (day: number) => {
    const newSel = new Date(calYear, calMonth, day);
    setSelectedDate(newSel);
    const dayStr = `${String(day).padStart(2, '0')}-${MONTH_SHORT[calMonth]}-${calYear}`;
    showToast(`Date selected: ${dayStr}. Schedule and operations updated.`, 'info');
  };

  const isTodaySelected = 
    selectedDate.getDate() === now.getDate() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear();

  return (
    <header className="topbar">
      {/* Left: Welcome Title & Interactive Quick Actions */}
      <div className="topbar-left">
        <span className="topbar-welcome-title">
          WELCOME{' '}
          <span 
            className="topbar-name-pill"
            onClick={() => {
              setActiveTab('dashboard');
              showToast(`Navigated to Main Dashboard for ${currentUser.name}`, 'info');
            }}
            title="Click to jump to Main Dashboard"
            style={{ cursor: 'pointer' }}
          >
            {currentUser.name.toUpperCase()}
          </span>
        </span>

        <div className="topbar-quick-actions">
          {/* Tickets Quick Action Button */}
          <button 
            type="button"
            className={`topbar-quick-link ${isTicketActive ? 'active' : ''}`} 
            onClick={() => {
              const nextTab = isTicketActive ? 'dashboard' : 'ticket';
              setActiveTab(nextTab);
              showToast(isTicketActive ? 'Returning to Dashboard' : 'Opening Support & Grievance Tickets Desk', 'info');
            }}
            title="Interactive Support & Grievance Tickets Desk"
            style={{
              background: isTicketActive ? '#0073b7' : undefined,
              color: isTicketActive ? '#ffffff' : undefined,
              borderColor: isTicketActive ? '#0073b7' : undefined
            }}
          >
            <Ticket size={13} />
            <span className="quick-link-text">Tickets</span>
            <span 
              style={{
                fontSize: '10px',
                fontWeight: 800,
                background: isTicketActive ? 'rgba(255,255,255,0.25)' : '#0073b7',
                color: '#ffffff',
                padding: '1px 5px',
                borderRadius: '8px',
                marginLeft: '2px'
              }}
            >
              4
            </span>
          </button>

          {/* Mail Quick Action Button */}
          <button 
            type="button"
            className={`topbar-quick-link ${isMailActive ? 'active' : ''}`} 
            onClick={() => {
              const nextTab = isMailActive ? 'dashboard' : 'mail';
              setActiveTab(nextTab);
              showToast(isMailActive ? 'Returning to Dashboard' : 'Opening Internal Mail & Communications', 'info');
            }}
            title="Interactive Internal Mail & Communications"
            style={{
              background: isMailActive ? '#059669' : undefined,
              color: isMailActive ? '#ffffff' : undefined,
              borderColor: isMailActive ? '#059669' : undefined
            }}
          >
            <Mail size={13} />
            <span className="quick-link-text">Mail</span>
            <span 
              style={{
                fontSize: '10px',
                fontWeight: 800,
                background: isMailActive ? 'rgba(255,255,255,0.25)' : '#10b981',
                color: '#ffffff',
                padding: '1px 5px',
                borderRadius: '8px',
                marginLeft: '2px'
              }}
            >
              2
            </span>
          </button>

          {/* Interactive Date Badge & Live Calendar Popover */}
          <div style={{ position: 'relative' }} ref={calendarRef}>
            <button 
              type="button"
              className={`topbar-date-badge interactive ${isCalendarOpen ? 'active' : ''}`}
              onClick={() => {
                setIsCalendarOpen(!isCalendarOpen);
                setIsUrgencyOpen(false);
                setIsNotifOpen(false);
              }}
              title="Click to open Interactive Calendar, Live Market Session & IST Clock"
            >
              <span>{topDateStr}</span>
              <Calendar size={13} className="topbar-date-icon" />
            </button>

            {isCalendarOpen && (
              <div className="topbar-calendar-popover" role="dialog" aria-label="Interactive Enterprise Calendar">
                {/* Popover Header with Month Nav & Live Clock */}
                <div className="topbar-cal-header">
                  <div className="topbar-cal-title-wrap">
                    <button 
                      type="button" 
                      className="topbar-cal-nav-btn"
                      onClick={handlePrevMonth}
                      title="Previous Month"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="topbar-cal-month-title">
                      {MONTH_NAMES[calMonth]} {calYear}
                    </span>
                    <button 
                      type="button" 
                      className="topbar-cal-nav-btn"
                      onClick={handleNextMonth}
                      title="Next Month"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      type="button"
                      className="topbar-cal-today-btn"
                      onClick={handleResetToToday}
                      title="Jump to Today's date"
                    >
                      Today
                    </button>
                  </div>
                </div>

                {/* Live IST Clock & Market Banner */}
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px', 
                    padding: '5px 8px', 
                    fontSize: '11px', 
                    marginBottom: '8px' 
                  }}
                >
                  <div className="topbar-cal-live-clock" style={{ margin: 0, padding: '1px 6px' }}>
                    <span className="live-clock-dot" />
                    <span>{liveClockStr}</span>
                  </div>
                  <span style={{ color: marketSession.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: marketSession.dot }} />
                    {marketSession.label}
                  </span>
                </div>

                {/* Weekdays */}
                <div className="topbar-cal-weekdays">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <span key={i} className="topbar-cal-weekday" style={{ color: i >= 5 ? '#f43f5e' : '#64748b' }}>
                      {day}
                    </span>
                  ))}
                </div>

                {/* Interactive Days Grid */}
                <div className="topbar-cal-days-grid">
                  {/* Empty Offset Cells */}
                  {Array.from({ length: calStartOffset }, (_, i) => (
                    <span key={`empty-${i}`} className="topbar-cal-day-cell empty" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInCalMonth }, (_, i) => i + 1).map(day => {
                    const isCurrentToday = 
                      calYear === now.getFullYear() && 
                      calMonth === now.getMonth() && 
                      day === now.getDate();

                    const isSelected = 
                      selectedDate.getFullYear() === calYear && 
                      selectedDate.getMonth() === calMonth && 
                      selectedDate.getDate() === day;

                    const isPast = 
                      calYear < now.getFullYear() || 
                      (calYear === now.getFullYear() && calMonth < now.getMonth()) ||
                      (calYear === now.getFullYear() && calMonth === now.getMonth() && day < now.getDate());

                    const dayOfWeek = (calStartOffset + day - 1) % 7;
                    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`topbar-cal-day-cell ${isCurrentToday ? 'today' : ''} ${isSelected && !isCurrentToday ? 'selected' : ''} ${isPast && !isCurrentToday ? 'past' : ''}`}
                        style={{
                          color: isCurrentToday || isSelected ? '#ffffff' : isWeekend ? '#f43f5e' : undefined,
                          fontWeight: isCurrentToday || isSelected ? 800 : isWeekend ? 600 : 500,
                          cursor: 'pointer'
                        }}
                        title={
                          isCurrentToday 
                            ? `Today (${String(day).padStart(2, '0')}-${MONTH_SHORT[calMonth]}-${calYear}) • ${daysLeftInMonth} days left in month` 
                            : `${String(day).padStart(2, '0')}-${MONTH_SHORT[calMonth]}-${calYear}`
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Dynamic Information Card */}
                <div className="topbar-cal-selected-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                      {isTodaySelected ? 'Today' : 'Selected'}: {String(selectedDate.getDate()).padStart(2, '0')} {MONTH_SHORT[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </span>
                    <span style={{ fontSize: '10px', color: isTodaySelected ? '#0284c7' : '#64748b', fontWeight: 700 }}>
                      {isTodaySelected ? `${daysLeftInMonth} Days Left in Month` : DAY_NAMES[selectedDate.getDay()]}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>
                    {isTodaySelected
                      ? 'Live CRM trading session active. 8 days remain until September target closing.'
                      : `Selected date viewing schedule, call schedules, and leave approvals.`}
                  </p>
                </div>

                {/* Interactive Navigation Shortcuts */}
                <div className="topbar-cal-actions" style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('leave');
                      setIsCalendarOpen(false);
                      showToast('Navigated to Attendance & Leaves Portal', 'info');
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: '#f0f7ff',
                      color: '#0073b7',
                      border: '1px solid #bae6fd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Clock size={12} />
                    <span>Attendance & Leaves</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('market');
                      setIsCalendarOpen(false);
                      showToast('Navigated to Live Market Terminal', 'info');
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid #a7f3d0',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <TrendingUp size={12} />
                    <span>Live Market</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Dynamic Interactive Urgency Marquee & Month-End Sprint */}
      <div className="topbar-center" ref={urgencyRef}>
        <button
          type="button"
          className={`topbar-alert-marquee interactive ${isUrgencyOpen ? 'active' : ''}`}
          onClick={() => {
            setIsUrgencyOpen(!isUrgencyOpen);
            setIsCalendarOpen(false);
            setIsNotifOpen(false);
          }}
          title={`Click to view Month-End Target Sprint (${daysLeftInMonth} Days Left in September)`}
        >
          <span className="marquee-pulse-dot" />
          <span className="marquee-text-bold">
            {daysLeftInMonth} DAYS LEFT HURRY UP.
          </span>
          <span className="marquee-text-sub">
            WELCOME TO Apex Edge Research
          </span>
        </button>

        {isUrgencyOpen && (
          <div className="topbar-urgency-popover" role="dialog" aria-label="Month-End Revenue Sprint">
            <div className="topbar-urgency-header">
              <div className="urgency-title-row">
                <div className="urgency-icon-badge">
                  <Flame size={18} color="#ea580c" />
                </div>
                <div>
                  <h4 className="urgency-main-title">
                    September Month-End Sprint
                  </h4>
                  <p className="urgency-subtitle">
                    Apex Edge Research • {daysLeftInMonth} Days Left to Closing
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="urgency-close-btn"
                onClick={() => setIsUrgencyOpen(false)}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Real-time Ticking Countdown Grid */}
            <div className="urgency-countdown-grid">
              <div className="countdown-unit-card">
                <span className="countdown-unit-val">{monthEndCountdown.days}</span>
                <span className="countdown-unit-lbl">Days</span>
              </div>
              <div className="countdown-unit-card">
                <span className="countdown-unit-val">{String(monthEndCountdown.hours).padStart(2, '0')}</span>
                <span className="countdown-unit-lbl">Hours</span>
              </div>
              <div className="countdown-unit-card">
                <span className="countdown-unit-val">{String(monthEndCountdown.mins).padStart(2, '0')}</span>
                <span className="countdown-unit-lbl">Mins</span>
              </div>
              <div className="countdown-unit-card">
                <span className="countdown-unit-val">{String(monthEndCountdown.secs).padStart(2, '0')}</span>
                <span className="countdown-unit-lbl">Secs</span>
              </div>
            </div>

            {/* Interactive Metric Switcher */}
            <div style={{ display: 'flex', gap: '4px', margin: '10px 0 6px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setUrgencyMetric('revenue')}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  fontWeight: urgencyMetric === 'revenue' ? 700 : 500,
                  border: 'none',
                  background: urgencyMetric === 'revenue' ? '#ffffff' : 'transparent',
                  color: urgencyMetric === 'revenue' ? '#0073b7' : '#64748b',
                  borderRadius: '4px',
                  padding: '4px',
                  cursor: 'pointer',
                  boxShadow: urgencyMetric === 'revenue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Revenue Target
              </button>
              <button
                type="button"
                onClick={() => setUrgencyMetric('calls')}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  fontWeight: urgencyMetric === 'calls' ? 700 : 500,
                  border: 'none',
                  background: urgencyMetric === 'calls' ? '#ffffff' : 'transparent',
                  color: urgencyMetric === 'calls' ? '#0073b7' : '#64748b',
                  borderRadius: '4px',
                  padding: '4px',
                  cursor: 'pointer',
                  boxShadow: urgencyMetric === 'calls' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Call Volume
              </button>
              <button
                type="button"
                onClick={() => setUrgencyMetric('leads')}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  fontWeight: urgencyMetric === 'leads' ? 700 : 500,
                  border: 'none',
                  background: urgencyMetric === 'leads' ? '#ffffff' : 'transparent',
                  color: urgencyMetric === 'leads' ? '#0073b7' : '#64748b',
                  borderRadius: '4px',
                  padding: '4px',
                  cursor: 'pointer',
                  boxShadow: urgencyMetric === 'leads' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Conversion
              </button>
            </div>

            {/* Dynamic Metric Progress Bar */}
            <div style={{ margin: '6px 0 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>
                  {urgencyMetric === 'revenue' && 'September Revenue Target:'}
                  {urgencyMetric === 'calls' && 'Advisory Calls Completed:'}
                  {urgencyMetric === 'leads' && 'Leads Converted to Clients:'}
                </span>
                <span style={{ color: '#166534', fontWeight: 800 }}>
                  {urgencyMetric === 'revenue' && '₹38.5L / ₹50.0L (77%)'}
                  {urgencyMetric === 'calls' && '1,240 / 1,500 Calls (82%)'}
                  {urgencyMetric === 'leads' && '142 / 180 Leads (79%)'}
                </span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: urgencyMetric === 'revenue' ? '77%' : urgencyMetric === 'calls' ? '82%' : '79%', 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
                <span>Month Progress: {monthProgressPct}% elapsed</span>
                <span style={{ color: '#ea580c', fontWeight: 700 }}>{daysLeftInMonth} days remaining</span>
              </div>
            </div>

            {/* Quick Interactive Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('team-targets');
                  setIsUrgencyOpen(false);
                  showToast('Navigating to Team Targets & Gap Prevention', 'info');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#0073b7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <TrendingUp size={13} />
                <span>Team Targets</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('leads');
                  setIsUrgencyOpen(false);
                  showToast('Opening Advisory Pipeline to close pending leads', 'info');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '7px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Briefcase size={13} />
                <span>Advisory Leads</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Theme Toggle & Role-Specific Interactive Notifications */}
      <div className="topbar-right">
        {/* Active Role Indicator Pill */}
        <span 
          className="notif-role-badge" 
          style={{ 
            color: roleInfo.color, 
            background: roleInfo.bgColor,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700
          }}
          title={`Logged in as ${currentUser.name} (${roleInfo.badge})`}
        >
          {roleInfo.icon}
          <span className="role-badge-text">{roleInfo.badge}</span>
        </span>

        {/* Theme Toggle */}
        <button 
          type="button"
          className="topbar-action-icon" 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Interactive Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            type="button"
            className={`topbar-action-icon notif-trigger ${isNotifOpen ? 'active' : ''}`}
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsCalendarOpen(false);
              setIsUrgencyOpen(false);
            }}
            title={`Notifications (${unreadCount} unread for ${role.toUpperCase()})`}
            aria-label="Open Notifications"
          >
            <Bell size={16} />
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
                    type="button"
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
