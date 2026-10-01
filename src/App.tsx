import React from 'react';
import { AppProvider, useApp } from './state/store';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { HRDashboard } from './components/hr/HRDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { TeamLeaderDashboard } from './components/teamlead/TeamLeaderDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientSearchAlertPopup } from './components/common/ClientSearchAlertPopup';
import { BirthdayCelebrationPopup } from './components/common/BirthdayCelebrationPopup';
import { LeadCallbackReminder } from './components/common/LeadCallbackReminder';

import { LoginPortal } from './components/auth/LoginPortal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Workspace from './crm/Workspace';

import { ConfigProvider } from './state/configContext';

const MainContent: React.FC = () => {
  const { role, isAuthenticated, activeTab } = useApp();

  // Ensure user and staff always land on the top of the dashboard and every view
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainWrapper = document.querySelector('.main-wrapper');
      if (mainWrapper) mainWrapper.scrollTop = 0;
      const pageWrapper = document.querySelector('.page-content-wrapper');
      if (pageWrapper) pageWrapper.scrollTop = 0;
    }
  }, [isAuthenticated, role, activeTab]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPortal />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content View Engine */}
      <div className="main-wrapper">
        <Header />
        
        <main className="page-content-wrapper">
          <ErrorBoundary>
            {role === 'admin' && <AdminDashboard />}
            {role === 'hr' && <HRDashboard />}
            {role === 'manager' && <ManagerDashboard />}
            {role === 'team_leader' && <TeamLeaderDashboard />}
            {role === 'employee' && <EmployeeDashboard />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Overlays */}
      <CommandPalette />
      <ToastContainer />
      <ClientSearchAlertPopup />
      <BirthdayCelebrationPopup />
      <LeadCallbackReminder />
    </div>
  );
};

export function App() {
  const showBackendWorkspace = window.location.pathname.startsWith('/backend-workspace');
  if (showBackendWorkspace) {
    return (
      <ErrorBoundary>
        <Workspace />
      </ErrorBoundary>
    );
  }

  return (
    <AppProvider>
      <ConfigProvider>
        <MainContent />
      </ConfigProvider>
    </AppProvider>
  );
}

export default App;
