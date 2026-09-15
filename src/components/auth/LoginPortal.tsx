import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { UserRole } from '../../types';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound, 
  X 
} from 'lucide-react';
import stocketicsLogo from '../../assets/logo.jpg';

export const LoginPortal: React.FC = () => {
  const { roleCredentials, updateRoleCredential, login, showToast } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('hr');
  const [email, setEmail] = useState<string>(roleCredentials.hr.email);
  const [password, setPassword] = useState<string>(roleCredentials.hr.password);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCredentialEditorOpen, setIsCredentialEditorOpen] = useState<boolean>(false);

  // Editable credentials state
  const [editRole, setEditRole] = useState<UserRole>('hr');
  const [editEmail, setEditEmail] = useState<string>(roleCredentials.hr.email);
  const [editPassword, setEditPassword] = useState<string>(roleCredentials.hr.password);

  const handleRoleTabChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setEmail(roleCredentials[newRole].email);
    setPassword(roleCredentials[newRole].password);
    setErrorMsg(null);
  };

  const handleAutoFill = () => {
    setEmail(roleCredentials[selectedRole].email);
    setPassword(roleCredentials[selectedRole].password);
    setErrorMsg(null);
    showToast(`Autofilled credentials for ${selectedRole.toUpperCase()}`, 'info');
  };

  const handleDirectLogin = (targetRole: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      const res = login(targetRole);
      setIsLoading(false);
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const res = login(selectedRole, email, password);
      setIsLoading(false);
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    }, 400);
  };

  const handleSaveCustomCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmail.trim() || !editPassword.trim()) {
      showToast('Email and password cannot be empty', 'error');
      return;
    }
    updateRoleCredential(editRole, {
      email: editEmail.trim(),
      password: editPassword.trim()
    });
    if (selectedRole === editRole) {
      setEmail(editEmail.trim());
      setPassword(editPassword.trim());
    }
    setIsCredentialEditorOpen(false);
    showToast(`Saved new credentials for ${editRole.toUpperCase()}`, 'success');
  };

  const currentRoleInfo = roleCredentials[selectedRole];

  return (
    <div className="login-portal-root">
      {/* Centered White Login Card matching classic CRM reference (Rpanel) */}
      <div className="login-card">
        {/* Bold Logo Display Container */}
        <div className="login-logo-box">
          <img 
            src={stocketicsLogo} 
            alt="Stocketics - Where Stock Meets Intelligence" 
            className="login-logo-img" 
          />
        </div>

        {/* Compact Role Switcher Tabs */}
        <div className="login-role-tabs">
          <button 
            type="button"
            className={`login-role-tab ${selectedRole === 'hr' ? 'active' : ''}`}
            onClick={() => handleRoleTabChange('hr')}
          >
            <span>HR Admin</span>
          </button>
          <button 
            type="button"
            className={`login-role-tab ${selectedRole === 'manager' ? 'active' : ''}`}
            onClick={() => handleRoleTabChange('manager')}
          >
            <span>Manager</span>
          </button>
          <button 
            type="button"
            className={`login-role-tab ${selectedRole === 'team_leader' ? 'active' : ''}`}
            onClick={() => handleRoleTabChange('team_leader')}
          >
            <span>Team Leader</span>
          </button>
          <button 
            type="button"
            className={`login-role-tab ${selectedRole === 'employee' ? 'active' : ''}`}
            onClick={() => handleRoleTabChange('employee')}
          >
            <span>Employee</span>
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field-group">
            <div className="login-input-wrap">
              <input 
                type="text"
                className="login-input"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field-group">
            <div className="login-input-wrap">
              <input 
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="login-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '-0.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: '#475569' }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#0073b7' }}
              />
              <span>Remember Me</span>
            </label>
            <button 
              type="button" 
              className="login-btn-link"
              onClick={handleAutoFill}
            >
              Fill {selectedRole.toUpperCase()}
            </button>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="login-spinner" /> Authenticating...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Subtle Quick Credentials & 1-Click Login */}
        <div className="login-cred-callout">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>
              Credentials ({selectedRole.toUpperCase()}):
            </span>
            <button 
              type="button"
              className="login-btn-link"
              onClick={() => {
                setEditRole(selectedRole);
                setEditEmail(roleCredentials[selectedRole].email);
                setEditPassword(roleCredentials[selectedRole].password);
                setIsCredentialEditorOpen(true);
              }}
            >
              Edit Creds
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <div style={{ color: '#161e47' }}>
              <span style={{ color: '#64748b' }}>User: </span>
              <strong>{currentRoleInfo.email}</strong>
              <span style={{ color: '#64748b', margin: '0 0.35rem' }}>•</span>
              <span style={{ color: '#64748b' }}>Pass: </span>
              <strong style={{ fontFamily: 'monospace' }}>{currentRoleInfo.password}</strong>
            </div>
            <button 
              type="button" 
              className="login-instant-btn"
              onClick={() => handleDirectLogin(selectedRole)}
              disabled={isLoading}
              title="Instant 1-Click Login for testing"
            >
              1-Click
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="login-footer-info">
        <span>© 2026 Stocketics • Where Stock Meets Intelligence</span>
      </div>

      {/* Custom Credentials Editor Modal */}
      {isCredentialEditorOpen && (
        <div className="tips-modal-backdrop" onClick={() => setIsCredentialEditorOpen(false)}>
          <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', background: '#ffffff', border: '1px solid #d2d6de', borderRadius: '4px' }}>
            <div className="tips-modal-header" style={{ borderBottom: '1px solid #eef2f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="tip-icon-wrap" style={{ width: '34px', height: '34px', background: 'rgba(0, 115, 183, 0.1)', color: '#0073b7' }}>
                  <KeyRound size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#161e47' }}>Custom Credentials</h3>
                  <p style={{ fontSize: '0.74rem', color: '#64748b' }}>Set custom email/password for any role</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsCredentialEditorOpen(false)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomCredentials} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Select Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                  {(['hr', 'manager', 'team_leader', 'employee'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`btn btn-sm ${editRole === r ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setEditRole(r);
                        setEditEmail(roleCredentials[r].email);
                        setEditPassword(roleCredentials[r].password);
                      }}
                      style={{ textTransform: 'capitalize', fontSize: '0.72rem' }}
                    >
                      {r === 'team_leader' ? 'TL' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Username / Email
                </label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #d2d6de',
                    background: '#ffffff',
                    color: '#161e47',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Security Password
                </label>
                <input 
                  type="text" 
                  value={editPassword} 
                  onChange={(e) => setEditPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #d2d6de',
                    background: '#ffffff',
                    color: '#161e47',
                    fontSize: '0.86rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCredentialEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
