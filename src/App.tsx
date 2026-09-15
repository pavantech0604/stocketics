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
import { ClientSearchAlertPopup } from './components/common/ClientSearchAlertPopup';
import { BirthdayCelebrationPopup } from './components/common/BirthdayCelebrationPopup';

import { LoginPortal } from './components/auth/LoginPortal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContent: React.FC = () => {
  const { role, isAuthenticated } = useApp();

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
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
