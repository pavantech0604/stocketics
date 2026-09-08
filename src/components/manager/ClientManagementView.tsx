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
  Save
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';

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
  clientName: string;
  mobile: string;
  kycStatus: string;
  riskProfile: string;
  assignedEmployee?: string;
}

interface ActiveClientRecord {
  id: string;
  ownerName: string;
  clientName: string;
  mobile: string;
  serviceName: string;
  startDate: string;
  endDate: string;
}

const INITIAL_REGISTER_CLIENTS: RegisterClientRecord[] = [
  { id: 'reg-1', clientName: 'Sruthi A S', mobile: '8891171239', kycStatus: 'Approved', riskProfile: 'Not Fill', assignedEmployee: 'Sirajul Fasal M' },
  { id: 'reg-2', clientName: 'M Subramanyam', mobile: '9948527886', kycStatus: 'Approved', riskProfile: 'Not Fill', assignedEmployee: 'Golla Yugendra' },
  { id: 'reg-3', clientName: 'M Subramanyam', mobile: '9948527886', kycStatus: 'Approved', riskProfile: 'Not Fill', assignedEmployee: 'Golla Yugendra' },
  { id: 'reg-4', clientName: 'BHARATH', mobile: '9952011804', kycStatus: 'Approved', riskProfile: 'Not Fill', assignedEmployee: 'Devika B' },
  { id: 'reg-5', clientName: 'Pasula Laxmi Prasanna', mobile: '9491924562', kycStatus: 'Approved', riskProfile: 'Not Fill', assignedEmployee: 'Golla Yugendra' },
  { id: 'reg-6', clientName: 'Pugazhendhi S', mobile: '8489712962', kycStatus: 'Approved', riskProfile: 'Not Fill', assignedEmployee: 'Rohan Deshmukh' },
  { id: 'reg-7', clientName: 'VIVEKANANDHAN PERUMAL', mobile: '7904005514', kycStatus: 'Approved', riskProfile: 'Not Fill', assignedEmployee: 'Ananya Sen' },
];

const INITIAL_ACTIVE_CLIENTS: ActiveClientRecord[] = [
  { id: 'act-1', ownerName: 'Sirajul Fasal M', clientName: 'Sruthi A S', mobile: '8891171239', serviceName: 'INDEX OPTION', startDate: '2026-09-05', endDate: '2026-09-21' },
  { id: 'act-2', ownerName: 'Golla Yugendra', clientName: 'M Subramanyam', mobile: '9948527886', serviceName: 'INDEX OPTION', startDate: '2026-09-05', endDate: '2026-09-21' },
  { id: 'act-3', ownerName: 'Devika B', clientName: 'BHARATH', mobile: '9952011804', serviceName: 'INDEX OPTION', startDate: '2026-09-04', endDate: '2026-09-24' },
  { id: 'act-4', ownerName: 'Golla Yugendra', clientName: 'Pasula Laxmi Prasanna', mobile: '9491924562', serviceName: 'Market Pathshala', startDate: '2026-09-04', endDate: '2027-01-01' },
];

export const ClientManagementView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  const getSubTab = (): ClientSubTab => {
    if (activeTab === 'register-clients' || activeTab === 'add-client') return 'register';
    if (activeTab === 'active-clients' || activeTab === 'client') return 'active';
    if (activeTab === 'expire-clients') return 'expire';
    if (activeTab === 'expired-clients') return 'expired';
    if (activeTab === 'hold-clients') return 'hold';
    if (activeTab === 'hold-expire') return 'hold-expire';
    if (activeTab === 'payment-reminder') return 'reminder';
    return 'register';
  };

  const [currentTab, setCurrentTab] = useState<ClientSubTab>(getSubTab());
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Register Clients state
  const [registerClients, setRegisterClients] = useState<RegisterClientRecord[]>(INITIAL_REGISTER_CLIENTS);
  const [regSelectedEmployee, setRegSelectedEmployee] = useState('');
  const [regMobileQuery, setRegMobileQuery] = useState('');

  // Active Clients state
  const [activeClients, setActiveClients] = useState<ActiveClientRecord[]>(INITIAL_ACTIVE_CLIENTS);
  const [actSelectedEmployee, setActSelectedEmployee] = useState('');
  const [actMobileQuery, setActMobileQuery] = useState('');
  const [actFromDate, setActFromDate] = useState('');

  // Edit Active Client Modal
  const [editingClient, setEditingClient] = useState<ActiveClientRecord | null>(null);

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  // Handle Search for Register Clients
  const filteredRegisterClients = registerClients.filter(client => {
    const matchEmp = !regSelectedEmployee || client.assignedEmployee === regSelectedEmployee;
    const matchMobile = !regMobileQuery || client.mobile.includes(regMobileQuery) || client.clientName.toLowerCase().includes(regMobileQuery.toLowerCase());
    return matchEmp && matchMobile;
  });

  // Handle Search for Active Clients
  const filteredActiveClients = activeClients.filter(client => {
    const matchEmp = !actSelectedEmployee || client.ownerName === actSelectedEmployee;
    const matchMobile = !actMobileQuery || client.mobile.includes(actMobileQuery) || client.clientName.toLowerCase().includes(actMobileQuery.toLowerCase());
    const matchDate = !actFromDate || client.startDate >= actFromDate;
    return matchEmp && matchMobile && matchDate;
  });

  const handleSaveEditedClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setActiveClients(prev => prev.map(item => item.id === editingClient.id ? editingClient : item));
    showToast(`Updated subscription details for ${editingClient.clientName}!`, 'success');
    setEditingClient(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={15} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Dashboard</span>
          </span>
        </div>
      </div>

      {/* VIEW 1: ALL REGISTER CLIENT (Matching Reference Image 4) */}
      {currentTab === 'register' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="page-title-ref">All Register Client</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setCurrentTab('active');
                  setActiveTab('active-clients');
                }}
              >
                View Active Clients &gt;&gt;
              </button>
            </div>
          </div>

          <div className="client-panel-card">
            {/* Filter Bar (Matching Reference Image 4) */}
            <div className="client-filter-bar">
              <select 
                className="client-filter-select"
                value={regSelectedEmployee}
                onChange={(e) => setRegSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                <option value="Sirajul Fasal M">Sirajul Fasal M</option>
                <option value="Golla Yugendra">Golla Yugendra</option>
                <option value="Devika B">Devika B</option>
                <option value="Rohan Deshmukh">Rohan Deshmukh</option>
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
                onClick={() => showToast(`Filtered ${filteredRegisterClients.length} registered clients`, 'info')}
              >
                search
              </button>
            </div>

            {/* Total Records Green Badge */}
            <div className="total-records-strip">
              <span className="total-records-pill">
                Total Records ({filteredRegisterClients.length})
              </span>
            </div>

            {/* Register Clients Table */}
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
                  {filteredRegisterClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Record Not Available
                      </td>
                    </tr>
                  ) : (
                    filteredRegisterClients.map((client, idx) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL ACTIVE CLIENT (Matching Reference Image 5) */}
      {(currentTab === 'active' || currentTab === 'expire' || currentTab === 'expired' || currentTab === 'hold' || currentTab === 'hold-expire' || currentTab === 'reminder') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header with << Back Button (Matching Image 5) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="page-title-ref">All Active Client</h1>
            <button 
              type="button"
              className="client-back-btn"
              onClick={() => {
                setCurrentTab('register');
                setActiveTab('register-clients');
              }}
              title="Return to Registered Clients"
            >
              &lt;&lt; Back
            </button>
          </div>

          <div className="client-panel-card">
            {/* Filter Bar with Date (Matching Reference Image 5) */}
            <div className="client-filter-bar">
              <select 
                className="client-filter-select"
                value={actSelectedEmployee}
                onChange={(e) => setActSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                <option value="Sirajul Fasal M">Sirajul Fasal M</option>
                <option value="Golla Yugendra">Golla Yugendra</option>
                <option value="Devika B">Devika B</option>
              </select>

              <input 
                type="text"
                placeholder="Mobile"
                className="client-filter-input"
                value={actMobileQuery}
                onChange={(e) => setActMobileQuery(e.target.value)}
              />

              <input 
                type="date"
                placeholder="From Date"
                className="client-filter-input"
                value={actFromDate}
                onChange={(e) => setActFromDate(e.target.value)}
                style={{ color: actFromDate ? 'var(--text-primary)' : 'var(--text-muted)' }}
              />

              <button 
                type="button"
                className="client-search-btn-orange"
                onClick={() => showToast(`Filtered ${filteredActiveClients.length} active client subscriptions`, 'info')}
              >
                Search
              </button>
            </div>

            {/* Total Records Green Badge */}
            <div className="total-records-strip">
              <span className="total-records-pill">
                Total Records ({filteredActiveClients.length})
              </span>
            </div>

            {/* Active Clients Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="client-ref-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}>#</th>
                    <th>Owner Name</th>
                    <th>Client Name</th>
                    <th>Mobile</th>
                    <th>Service Name</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th style={{ textAlign: 'center', width: '70px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveClients.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Record Not Available
                      </td>
                    </tr>
                  ) : (
                    filteredActiveClients.map((client, idx) => (
                      <tr key={client.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{client.ownerName}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{client.clientName}</td>
                        <td style={{ color: '#0284c7', fontFamily: 'monospace' }}>{client.mobile}</td>
                        <td>
                          <span className="segment-badge">
                            {client.serviceName}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{client.startDate}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{client.endDate}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            type="button"
                            className="client-edit-btn"
                            onClick={() => setEditingClient(client)}
                            title="Edit Client Subscription"
                          >
                            <Edit size={14} color="#ffffff" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Active Client Modal */}
      {editingClient && (
        <div className="tips-modal-backdrop" onClick={() => setEditingClient(null)}>
          <div className="tips-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="tips-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="tip-icon-wrap" style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0284c7' }}>
                  <Edit size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Edit Client Subscription</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modify package, service validity, or desk advisor</p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingClient(null)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedClient} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Client Name
                </label>
                <input 
                  type="text"
                  value={editingClient.clientName}
                  onChange={(e) => setEditingClient({ ...editingClient, clientName: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Desk Owner Advisor
                </label>
                <select 
                  value={editingClient.ownerName}
                  onChange={(e) => setEditingClient({ ...editingClient, ownerName: e.target.value })}
                  className="form-select"
                >
                  <option value="Sirajul Fasal M">Sirajul Fasal M</option>
                  <option value="Golla Yugendra">Golla Yugendra</option>
                  <option value="Devika B">Devika B</option>
                  <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                  <option value="Ananya Sen">Ananya Sen</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Advisory Service Package
                </label>
                <select 
                  value={editingClient.serviceName}
                  onChange={(e) => setEditingClient({ ...editingClient, serviceName: e.target.value })}
                  className="form-select"
                >
                  <option value="INDEX OPTION">INDEX OPTION</option>
                  <option value="Market Pathshala">Market Pathshala</option>
                  <option value="FUTURE & OPTIONS">FUTURE & OPTIONS</option>
                  <option value="EQUITY PREMIER">EQUITY PREMIER</option>
                  <option value="HEDGE & PMS">HEDGE & PMS</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Start Date
                  </label>
                  <input 
                    type="date"
                    value={editingClient.startDate}
                    onChange={(e) => setEditingClient({ ...editingClient, startDate: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    End Date
                  </label>
                  <input 
                    type="date"
                    value={editingClient.endDate}
                    onChange={(e) => setEditingClient({ ...editingClient, endDate: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingClient(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guidance Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
