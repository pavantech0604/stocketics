import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  User,
  Clock,
  ExternalLink,
  MessageSquare,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  FileText,
  Radio,
  Lock
} from 'lucide-react';

export const ClientSearchAlertPopup: React.FC = () => {
  const {
    role,
    currentUser,
    clientSearchAlerts,
    acknowledgeSearchAlert,
    dismissAllSearchAlerts,
    setActiveTab,
    showToast,
    theme
  } = useApp();
  const isDark = theme === 'dark';

  // HR personnel do not deal with clients, so bypass client lookup popups completely
  if (role === 'hr') return null;

  // Find all unacknowledged alerts for the currently logged-in user
  const myAlerts = clientSearchAlerts.filter(a => {
    const isOwner = a.ownerName.toLowerCase() === currentUser.name.toLowerCase() ||
                    (a.ownerId && a.ownerId === currentUser.id);
    return isOwner && !a.acknowledged;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Play subtle chime when a new alert arrives
  useEffect(() => {
    if (myAlerts.length > 0) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (_) {}
    }
  }, [myAlerts.length]);

  if (myAlerts.length === 0) return null;

  // Bound index safely
  const activeAlert = myAlerts[Math.min(currentIndex, myAlerts.length - 1)];
  if (!activeAlert) return null;

  const handleAcknowledge = () => {
    acknowledgeSearchAlert(activeAlert.id);
    if (currentIndex >= myAlerts.length - 1) {
      setCurrentIndex(Math.max(0, myAlerts.length - 2));
    }
  };

  const handleViewClient = () => {
    acknowledgeSearchAlert(activeAlert.id);
    setActiveTab('active-clients');
    showToast(`Navigated to client ${activeAlert.clientName}.`, 'info');
  };

  const handleMessageSearcher = () => {
    acknowledgeSearchAlert(activeAlert.id);
    setActiveTab('messenger');
    showToast(`Direct message channel opened with ${activeAlert.searchedByName}.`, 'info');
  };

  return (
    <div
      className="client-search-alert-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark ? 'rgba(10, 17, 40, 0.76)' : 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="client-search-alert-modal"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid var(--stocketics-blue-400, #00b4d8)',
          boxShadow: isDark 
            ? '0 24px 60px rgba(10, 17, 40, 0.5), 0 0 35px rgba(0, 180, 216, 0.25)' 
            : '0 20px 50px rgba(0, 0, 0, 0.12), 0 0 20px rgba(0, 180, 216, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Top Header Banner: Stocketics Royal Navy & Electric Cyan Gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0a1128 0%, #111c44 50%, #0073b7 100%)',
            color: '#ffffff',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 210, 255, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.3) 0%, rgba(2, 132, 199, 0.5) 100%)',
                border: '1px solid rgba(0, 210, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0, 210, 255, 0.45)'
              }}
            >
              <ShieldAlert size={22} color="#00d2ff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Client Sentinel Notice
                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '12px', background: 'rgba(0, 210, 255, 0.2)', color: '#00d2ff', border: '1px solid rgba(0, 210, 255, 0.4)', fontWeight: 700 }}>
                  LIVE AUDIT
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                A colleague queried your allotted client profile
              </div>
            </div>
          </div>

          <button
            onClick={handleAcknowledge}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            title="Dismiss alert"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px 24px' }}>
          {/* Multi-alert Pager Indicator */}
          {myAlerts.length > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 180, 216, 0.08)',
                border: '1px solid rgba(0, 180, 216, 0.25)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0284c7'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={14} className="text-cyan-500 animate-pulse" />
                Alert {currentIndex + 1} of {myAlerts.length}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: currentIndex === 0 ? 'default' : 'pointer',
                    opacity: currentIndex === 0 ? 0.35 : 1,
                    color: 'inherit',
                    padding: '2px'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(myAlerts.length - 1, prev + 1))}
                  disabled={currentIndex === myAlerts.length - 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: currentIndex === myAlerts.length - 1 ? 'default' : 'pointer',
                    opacity: currentIndex === myAlerts.length - 1 ? 0.35 : 1,
                    color: 'inherit',
                    padding: '2px'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Searched By Employee Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'var(--bg-main, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              marginBottom: '16px'
            }}
          >
            <img
              src={activeAlert.searchedByAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={activeAlert.searchedByName}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #00b4d8',
                boxShadow: '0 0 10px rgba(0, 180, 216, 0.3)'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Queried By Colleague
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeAlert.searchedByName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--stocketics-blue-600, #0073b7)', fontWeight: 600 }}>
                {activeAlert.searchedByRole}
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Clock size={12} />
                {activeAlert.timestamp}
              </div>
              <div style={{ marginTop: '2px', fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                {activeAlert.searchLocation}
              </div>
            </div>
          </div>

          {/* Target Client Details Card: Stocketics Azure Left Accent */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 180, 216, 0.25)',
              borderLeft: '4px solid #00b4d8',
              background: 'rgba(0, 115, 183, 0.04)',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} className="text-cyan-600" style={{ color: '#00b4d8' }} />
              Allotted Client Account
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeAlert.clientName}
              </div>
              {activeAlert.clientCode && (
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid rgba(0, 180, 216, 0.3)', color: '#0073b7' }}>
                  {activeAlert.clientCode}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {activeAlert.clientMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={13} style={{ color: '#0284c7' }} />
                  <span>{activeAlert.clientMobile}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Search size={13} style={{ color: '#00b4d8' }} />
                <span>Search Query: <strong style={{ color: 'var(--text-primary)' }}>"{activeAlert.searchQuery}"</strong></span>
              </div>
            </div>
          </div>

          {/* Compliance Info Banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '22px' }}>
            <ShieldCheck size={16} style={{ color: '#00b4d8', flexShrink: 0, marginTop: '2px' }} />
            <span>
              Stocketics Client Privacy Protocol: Prospects and active client data are proprietary to the assigned advisor. Cross-desk lookups are recorded in real-time.
            </span>
          </div>

          {/* Action Buttons: Stocketics Royal Blue & Cyan Styling */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleViewClient}
              className="crm-btn crm-btn-primary"
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '11px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0073b7 0%, #0284c7 100%)',
                boxShadow: '0 4px 14px rgba(0, 115, 183, 0.35)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ExternalLink size={15} /> View Client Details
            </button>

            <button
              onClick={handleMessageSearcher}
              className="crm-btn crm-btn-secondary"
              style={{
                padding: '11px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(0, 180, 216, 0.08)',
                color: '#0284c7',
                border: '1px solid rgba(0, 180, 216, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={15} /> Chat with {activeAlert.searchedByName.split(' ')[0]}
            </button>

            <button
              onClick={handleAcknowledge}
              style={{
                padding: '11px 14px',
                borderRadius: '8px',
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Check size={14} /> Dismiss
            </button>
          </div>

          {myAlerts.length > 1 && (
            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                onClick={dismissAllSearchAlerts}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Dismiss All Alerts ({myAlerts.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
