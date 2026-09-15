import React, { useEffect } from 'react';
import { useApp, isBirthdayToday } from '../../state/store';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Flowing background balloons and festive decoration elements
 * Animated gently with CSS keyframes to create a premium, celebratory atmosphere.
 */
const FlowingBirthdayDecorations: React.FC = () => {
  return (
    <div className="bday-flow-bg" aria-hidden="true">
      {/* Balloon 1: Soft Cyan floating top-left */}
      <div className="bday-balloon-flow-1">
        <svg width="84" height="110" viewBox="0 0 84 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="cyanB" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
          </defs>
          <ellipse cx="42" cy="46" rx="36" ry="42" fill="url(#cyanB)" fillOpacity="0.45" />
          <polygon points="42,88 38,94 46,94" fill="#0891b2" fillOpacity="0.6" />
          <path d="M42 94C40 99 46 104 42 110" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Balloon 2: Soft Warm Gold floating top-right */}
      <div className="bday-balloon-flow-2">
        <svg width="90" height="116" viewBox="0 0 90 116" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="goldB" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
          <ellipse cx="45" cy="48" rx="38" ry="45" fill="url(#goldB)" fillOpacity="0.4" />
          <polygon points="45,93 41,99 49,99" fill="#f59e0b" fillOpacity="0.5" />
          <path d="M45 99C43 104 47 110 44 116" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Balloon 3: Rose Pink floating bottom-left */}
      <div className="bday-balloon-flow-3">
        <svg width="76" height="100" viewBox="0 0 76 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="roseB" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="60%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </radialGradient>
          </defs>
          <ellipse cx="38" cy="42" rx="32" ry="38" fill="url(#roseB)" fillOpacity="0.35" />
          <polygon points="38,80 34,86 42,86" fill="#e11d48" fillOpacity="0.5" />
          <path d="M38 86C36 90 40 96 37 100" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Balloon 4: Royal Blue floating bottom-right */}
      <div className="bday-balloon-flow-4">
        <svg width="86" height="112" viewBox="0 0 86 112" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="blueB" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
          </defs>
          <ellipse cx="43" cy="46" rx="36" ry="43" fill="url(#blueB)" fillOpacity="0.35" />
          <polygon points="43,89 39,95 47,95" fill="#0369a1" fillOpacity="0.5" />
          <path d="M43 95C41 100 45 106 42 112" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Sparkles / Festive stars drifting softly */}
      <div className="bday-sparkle-1">
        <Sparkles size={16} color="#fbbf24" fill="#fbbf24" fillOpacity={0.6} />
      </div>
      <div className="bday-sparkle-2">
        <Sparkles size={14} color="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
      </div>
      <div className="bday-sparkle-3">
        <Sparkles size={15} color="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
      </div>
      <div className="bday-sparkle-4">
        <Sparkles size={17} color="#10b981" fill="#10b981" fillOpacity={0.5} />
      </div>
    </div>
  );
};

/**
 * Shoot flying cut paper confetti cannons
 */
const fireCuttingPapers = () => {
  try {
    const palette = [
      '#0073b7',
      '#00b4d8',
      '#f59e0b',
      '#fbbf24',
      '#10b981',
      '#ec4899',
      '#8b5cf6',
      '#06b6d4',
      '#3b82f6'
    ];

    // Left cannon shooting cut paper strips
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 68,
      origin: { x: 0.08, y: 0.72 },
      colors: palette,
      shapes: ['square'],
      scalar: 1.25,
      ticks: 240,
      zIndex: 100010
    });

    // Right cannon shooting cut paper strips
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 68,
      origin: { x: 0.92, y: 0.72 },
      colors: palette,
      shapes: ['square'],
      scalar: 1.25,
      ticks: 240,
      zIndex: 100010
    });

    // Center celebratory flutter cascade
    confetti({
      particleCount: 60,
      spread: 90,
      origin: { x: 0.5, y: 0.28 },
      colors: palette,
      shapes: ['square'],
      scalar: 1.15,
      ticks: 280,
      gravity: 0.8,
      zIndex: 100010
    });
  } catch (_) { }
};

/**
 * Company Birthday Celebration Modal
 * - Profile placeholder removed completely
 * - Heartfelt company greeting to the employees
 * - Employee names listed one by one below it, bold
 * - Expanded, spacious, premium popup card size
 * - Background flowing balloons and festive decoration animations
 * - Flying cut papers confetti cannons shooting upon popup trigger
 */
export const BirthdayCelebrationPopup: React.FC = () => {
  const {
    isBirthdayCelebrationOpen,
    closeBirthdayCelebration,
    todayBirthdays,
    currentUser,
    role
  } = useApp();

  const isAdmin = role === 'hr';
  const isMyBirthday = isBirthdayToday(currentUser?.dob);

  // For Admin (HR), display all company celebrants whose DOB matches today.
  // For regular users, prioritize the celebrating user on their birthday.
  const celebrants = isAdmin
    ? todayBirthdays
    : isMyBirthday
      ? [
        currentUser,
        ...todayBirthdays.filter(e => e.id !== currentUser.id && e.name.toLowerCase() !== currentUser.name.toLowerCase())
      ]
      : todayBirthdays;

  // Shoot flying cut papers whenever the popup opens
  useEffect(() => {
    if (!isBirthdayCelebrationOpen) return;

    // Initial burst
    fireCuttingPapers();

    // Gentle follow-up flutter
    const timer = setTimeout(() => {
      try {
        confetti({
          particleCount: 40,
          spread: 80,
          origin: { x: 0.5, y: 0.22 },
          colors: ['#0073b7', '#00b4d8', '#f59e0b', '#fbbf24', '#10b981'],
          shapes: ['square'],
          scalar: 1.1,
          ticks: 220,
          gravity: 0.85,
          zIndex: 100010
        });
      } catch (_) { }
    }, 380);

    return () => clearTimeout(timer);
  }, [isBirthdayCelebrationOpen]);

  // Support closing via Escape key
  useEffect(() => {
    if (!isBirthdayCelebrationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeBirthdayCelebration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBirthdayCelebrationOpen, closeBirthdayCelebration]);

  if (!isBirthdayCelebrationOpen || celebrants.length === 0) {
    return null;
  }

  return (
    <div
      className="bday-simple-backdrop"
      onClick={closeBirthdayCelebration}
      role="dialog"
      aria-modal="true"
      aria-label="Birthday greeting"
    >
      <div
        className="bday-simple-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Background Flowing Balloons & Festive Animations */}
        <FlowingBirthdayDecorations />

        {/* Accessible Close Button (44px touch target) */}
        <button
          type="button"
          className="bday-close-btn"
          onClick={closeBirthdayCelebration}
          aria-label="Close birthday greeting"
          title="Close birthday greeting"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Company Celebration Badge */}
        <div
          className="bday-company-badge"
          onClick={fireCuttingPapers}
          style={{ cursor: 'pointer' }}
          title="Click for celebration cheer!"
        >
          <Sparkles size={12} color="#f59e0b" />
          Stocketics Honors
        </div>

        {/* Main Birthday Greeting Header - No individual employee name to support multiple celebrants on the same day */}
        <h2 className="bday-greeting-title">
          {celebrants.length > 1 ? "Today's Birthday Celebrations! 🎂" : "Happy Birthday! 🎂"}
        </h2>

        {/* Company Greeting to All Celebrants */}
        <p className="bday-company-message">
          Warmest birthday wishes from the entire Stocketics family to our valued team members celebrating today! We celebrate your dedication and thank you for being an indispensable part of our journey. Wishing you all an outstanding year ahead filled with happiness, good health, and tremendous success!
        </p>

        {/* Employee Names Listed One by One, Bold */}
        <div className="bday-celebrants-section">
          <div className="bday-celebrants-label">
            {celebrants.length === 1 ? "Today's Celebrant" : "Today's Celebrants"}
          </div>
          <div className="bday-celebrants-list">
            {celebrants.map(emp => (
              <div
                key={emp.id}
                className="bday-celebrant-item"
                onClick={fireCuttingPapers}
                style={{ cursor: 'pointer' }}
                title={`Celebrate ${emp.name}!`}
              >
                <div className="bday-celebrant-item-left">
                  <span className="bday-celebrant-icon" role="img" aria-label="Celebration Cake">
                    🎂
                  </span>
                  <span className="bday-celebrant-name">{emp.name}</span>
                </div>
                <Sparkles size={16} color="#f59e0b" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
