import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Edit, 
  X, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  User, 
  ShieldCheck, 
  AlertCircle,
  Save,
  Plus
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';
import { ActiveClientRecordDetailed } from '../../types';
import { INITIAL_DETAILED_CLIENTS } from '../../data/clientDatabase';
import { ClientSearchResultsView } from '../employee/ClientSearchResultsView';
import { ClientEditView } from '../employee/ClientEditView';

export type ClientSubTab = 
  | 'register' 
  | 'active' 
  | 'expire' 
  | 'expired' 
  | 'hold' 
  | 'hold-expire' 
  | 'reminder';

interface RegisterClientRecord {
  id: string;
  clientCode?: string;
  clientName: string;
  mobile: string;
  kycStatus: string;
  riskProfile: string;
  assignedEmployee?: string;
}

const INITIAL_REGISTER_CLIENTS: RegisterClientRecord[] = [
  { id: 'reg-1', clientName: 'Rajesh K. Singhania', mobile: '9820100401', kycStatus: 'Approved', riskProfile: 'Aggressive', assignedEmployee: 'Rohan Deshmukh' },
  { id: 'reg-2', clientName: 'Dr. Harshvardhan Jain', mobile: '9425000402', kycStatus: 'Approved', riskProfile: 'Moderate', assignedEmployee: 'Sneha Kapur' },
  { id: 'reg-3', clientName: 'Kavita Radhakrishnan', mobile: '9847000403', kycStatus: 'Approved', riskProfile: 'Moderate', assignedEmployee: 'Kabir Varma' },
  { id: 'reg-4', clientName: 'Col. Vikram Rathore', mobile: '9414000405', kycStatus: 'Approved', riskProfile: 'Conservative', assignedEmployee: 'Neha Reddy' },
  { id: 'reg-5', clientName: 'Pooja Kulkarni', mobile: '9922000406', kycStatus: 'Approved', riskProfile: 'Moderate', assignedEmployee: 'Sneha Kapur' },
  { id: 'reg-6', clientName: 'Manish Chawla', mobile: '9912000404', kycStatus: 'Approved', riskProfile: 'Aggressive', assignedEmployee: 'Rohan Deshmukh' },
  { id: 'reg-7', clientName: 'Meenakshi Sundaram', mobile: '9444000407', kycStatus: 'Approved', riskProfile: 'Moderate', assignedEmployee: 'Ananya Sen' },
];

export const ClientManagementView: React.FC = () => {
  const { activeTab, setActiveTab, showToast, currentUser, triggerClientSearchAlert } = useApp();

  const getSubTab = (): ClientSubTab => {
    if (activeTab === 'register-clients' || activeTab === 'add-client') return 'register';
    if (activeTab === 'active-clients' || activeTab === 'client') return 'active';
    if (activeTab === 'expire-clients') return 'expire';
    if (activeTab === 'expired-clients') return 'expired';
    if (activeTab === 'hold-clients') return 'hold';
    if (activeTab === 'hold-expire') return 'hold-expire';
    if (activeTab === 'payment-reminder') return 'reminder';
    return 'active'; // Default to active matching reference workflows
  };

  const [currentTab, setCurrentTab] = useState<ClientSubTab>(getSubTab());
  const [detailedClients, setDetailedClients] = useState<ActiveClientRecordDetailed[]>(INITIAL_DETAILED_CLIENTS);
  const [editingDetailedClient, setEditingDetailedClient] = useState<ActiveClientRecordDetailed | null>(null);

  // Register Clients state
  const [registerClients, setRegisterClients] = useState<RegisterClientRecord[]>(INITIAL_REGISTER_CLIENTS);
  const [regSelectedEmployee, setRegSelectedEmployee] = useState('');
  const [regMobileQuery, setRegMobileQuery] = useState('');

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  // Handle Search for Register Clients
  const filteredRegisterClients = registerClients.filter(client => {
    const matchEmp = !regSelectedEmployee || client.assignedEmployee === regSelectedEmployee;
    const matchMobile = !regMobileQuery || client.mobile.includes(regMobileQuery) || client.clientName.toLowerCase().includes(regMobileQuery.toLowerCase());
    return matchEmp && matchMobile;
  });

  // Client Navigation for Edit screen (<< and >>)
  const handlePrevClient = () => {
    if (!editingDetailedClient) return;
    const currentIdx = detailedClients.findIndex(c => c.id === editingDetailedClient.id);
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : detailedClients.length - 1;
    setEditingDetailedClient(detailedClients[prevIdx]);
  };

  const handleNextClient = () => {
    if (!editingDetailedClient) return;
    const currentIdx = detailedClients.findIndex(c => c.id === editingDetailedClient.id);
    const nextIdx = currentIdx < detailedClients.length - 1 ? currentIdx + 1 : 0;
    setEditingDetailedClient(detailedClients[nextIdx]);
  };

  // Update client record in master state
  const handleUpdateClient = (updated: ActiveClientRecordDetailed) => {
    setDetailedClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (editingDetailedClient?.id === updated.id) {
      setEditingDetailedClient(updated);
    }
  };

  const handleSaveAndNext = (updated: ActiveClientRecordDetailed) => {
    handleUpdateClient(updated);
    const currentIdx = detailedClients.findIndex(c => c.id === updated.id);
    const nextIdx = currentIdx < detailedClients.length - 1 ? currentIdx + 1 : 0;
    setEditingDetailedClient(detailedClients[nextIdx]);
  };

  // IF AN ACTIVE CLIENT IS BEING EDITED: Render Edit Page matching Image 2
  if (editingDetailedClient) {
    return (
      <ClientEditView
        client={editingDetailedClient}
        onBack={() => setEditingDetailedClient(null)}
        onSave={(updated) => handleUpdateClient(updated)}
        onSaveAndNext={handleSaveAndNext}
        onPrevClient={handlePrevClient}
        onNextClient={handleNextClient}
      />
    );
  }

  // IF REGISTER CLIENTS TAB:
  if (currentTab === 'register') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Subpage Breadcrumb Strip */}
        <div className="subpage-header-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div className="subpage-breadcrumb">
            <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
              <Home size={15} />
              <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
            </span>
          </div>
        </div>

        {/* VIEW 1: ALL REGISTER CLIENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="page-title-ref">All Register Client</h1>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setCurrentTab('active');
                setActiveTab('active-clients');
              }}
            >
              View Search Results & Active Clients &gt;&gt;
            </button>
          </div>

          <div className="client-panel-card">
            <div className="client-filter-bar">
              <select 
                className="client-filter-select"
                value={regSelectedEmployee}
                onChange={(e) => setRegSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                <option value="Sneha Kapur">Sneha Kapur</option>
                <option value="Kabir Varma">Kabir Varma</option>
                <option value="Neha Reddy">Neha Reddy</option>
                <option value="Ananya Sen">Ananya Sen</option>
              </select>

              <input 
                type="text" 
                placeholder="Mobile" 
                className="client-filter-input"
                value={regMobileQuery}
                onChange={(e) => setRegMobileQuery(e.target.value)}
              />

              <button 
                type="button" 
                className="client-search-btn-blue"
                onClick={() => {
                  if (regSelectedEmployee && regSelectedEmployee.toLowerCase() !== currentUser.name.toLowerCase()) {
                    const match = filteredRegisterClients[0];
                    triggerClientSearchAlert({
                      clientId: match?.id || `reg-${Date.now()}`,
                      clientCode: match?.clientCode || 'REG',
                      clientName: match?.clientName || `Registered Clients (${regSelectedEmployee})`,
                      clientMobile: match?.mobile || '',
                      targetType: 'client',
                      ownerName: regSelectedEmployee,
                      searchedById: currentUser.id,
                      searchedByName: currentUser.name,
                      searchedByRole: currentUser.title || currentUser.role,
                      searchedByAvatar: currentUser.avatar,
                      searchQuery: regMobileQuery || `Filtered by ${regSelectedEmployee}`,
                      searchLocation: 'Register Clients Directory'
                    });
                  }
                  showToast(`Filtered ${filteredRegisterClients.length} registered clients`, 'info');
                }}
              >
                search
              </button>
            </div>

            <div className="total-records-strip">
              <span className="total-records-pill">
                Total Records ({filteredRegisterClients.length})
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="client-ref-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Client Name</th>
                    <th>Mobile</th>
                    <th>Kyc</th>
                    <th>Risk Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegisterClients.map((client, idx) => (
                    <tr key={client.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{client.clientName}</td>
                      <td style={{ color: '#0284c7', fontFamily: 'monospace' }}>{client.mobile}</td>
                      <td>
                        <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                          {client.kycStatus}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#c62828', fontWeight: 500 }}>
                          {client.riskProfile}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: SEARCH RESULTS & ACTIVE CLIENTS (Exact Reference Image 1)
  return (
    <ClientSearchResultsView 
      clients={detailedClients}
      onEditClient={(client) => setEditingDetailedClient(client)}
      onUpdateClient={handleUpdateClient}
    />
  );
};
