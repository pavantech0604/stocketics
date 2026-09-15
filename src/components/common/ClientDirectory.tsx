import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { AddClientModal, SMSAlertModal } from './CRMActionModals';

interface ClientItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  status: 'Active' | 'Free Trial' | 'Expired' | 'KYC Pending';
  riskProfile: 'Aggressive' | 'Moderate' | 'Conservative';
  validUntil: string;
  assignedAdvisor: string;
  investmentAmount: string;
}

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: 'cli-501',
    name: 'Radhika Singhania',
    phone: '+91 98200 44102',
    email: 'radhika.s@singhaniatraders.in',
    service: 'Options Strategy',
    status: 'Active',
    riskProfile: 'Aggressive',
    validUntil: '31-Dec-2026',
    assignedAdvisor: 'Ananya Sen',
    investmentAmount: '₹35,00,000'
  },
  {
    id: 'cli-502',
    name: 'Sunil Mittal (Nivesh Capital)',
    phone: '+91 98111 20981',
    email: 'sunil@niveshcap.com',
    service: 'Hedge & PMS',
    status: 'Free Trial',
    riskProfile: 'Aggressive',
    validUntil: '14-Sep-2026',
    assignedAdvisor: 'Rohan Deshmukh',
    investmentAmount: '₹75,00,000'
  },
  {
    id: 'cli-503',
    name: 'Dr. Harshvardhan Jain',
    phone: '+91 94250 88910',
    email: 'dr.hjain@gmail.com',
    service: 'Equity Premier',
    status: 'Active',
    riskProfile: 'Moderate',
    validUntil: '28-Feb-2027',
    assignedAdvisor: 'Rohan Deshmukh',
    investmentAmount: '₹20,00,000'
  },
  {
    id: 'cli-504',
    name: 'Manish Agarwal',
    phone: '+91 99120 77312',
    email: 'manish.ag@outlook.com',
    service: 'Commodity Momentum',
    status: 'KYC Pending',
    riskProfile: 'Moderate',
    validUntil: 'Pending Approval',
    assignedAdvisor: 'Aditya Roy',
    investmentAmount: '₹15,00,000'
  },
  {
    id: 'cli-505',
    name: 'Gaurav Singhal',
    phone: '+91 97654 32189',
    email: 'gaurav.s@singhalcorp.com',
    service: 'Equity Premier',
    status: 'Expired',
    riskProfile: 'Conservative',
    validUntil: '01-Sep-2026',
    assignedAdvisor: 'Sneha Kapur',
    investmentAmount: '₹25,00,000'
  },
  {
    id: 'cli-506',
    name: 'Meera Nambiar',
    phone: '+91 98452 11980',
    email: 'meera.n@keralafinance.org',
    service: 'Options Strategy',
    status: 'Free Trial',
    riskProfile: 'Aggressive',
    validUntil: '12-Sep-2026',
    assignedAdvisor: 'Ananya Sen',
    investmentAmount: '₹18,00,000'
  }
];

export const ClientDirectory: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isSMSOpen, setIsSMSOpen] = useState(false);

  // Map activeTab to filter category
  const getInitialTab = (): string => {
    if (activeTab === 'active-clients') return 'active';
    if (activeTab === 'free-trial-clients') return 'trial';
    if (activeTab === 'expired-clients') return 'expired';
    if (activeTab === 'risk-profile-clients') return 'risk';
    return 'all';
  };

  const [currentTab, setCurrentTab] = useState<string>(getInitialTab());

  // Filter clients
  const filteredClients = INITIAL_CLIENTS.filter(cli => {
    const matchesSearch = 
      cli.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cli.phone.includes(searchTerm) ||
      cli.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cli.assignedAdvisor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = serviceFilter === 'All' || cli.service === serviceFilter;

    let matchesTab = true;
    if (currentTab === 'active') matchesTab = cli.status === 'Active';
    else if (currentTab === 'trial') matchesTab = cli.status === 'Free Trial';
    else if (currentTab === 'expired') matchesTab = cli.status === 'Expired';
    else if (currentTab === 'risk') matchesTab = cli.status === 'KYC Pending' || cli.riskProfile === 'Aggressive';

    return matchesSearch && matchesService && matchesTab;
  });

  const getStatusBadge = (status: ClientItem['status']) => {
    switch (status) {
      case 'Active':
        return <span className="delta-badge positive"><UserCheck size={12} /> Active Subscription</span>;
      case 'Free Trial':
        return <span className="delta-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}><Clock size={12} /> Free Trial</span>;
      case 'Expired':
        return <span className="delta-badge negative"><AlertCircle size={12} /> Expired</span>;
      case 'KYC Pending':
        return <span className="delta-badge" style={{ background: '#fef3c7', color: '#b45309' }}><ShieldCheck size={12} /> KYC Verification</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Client Relationship & Advisory Accounts
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            SEBI compliance-registered client portfolio, subscription validity, and risk categorization.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsAddClientOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Add New Client
        </button>
      </div>

      {/* Sub-Tabs matching Sidebar Sub-options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.25rem', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('all'); setActiveTab('view-all-clients'); }}
        >
          View All Clients ({INITIAL_CLIENTS.length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('active'); setActiveTab('active-clients'); }}
        >
          Active Clients ({INITIAL_CLIENTS.filter(c => c.status === 'Active').length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'trial' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('trial'); setActiveTab('free-trial-clients'); }}
        >
          Free Trial Clients ({INITIAL_CLIENTS.filter(c => c.status === 'Free Trial').length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'expired' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('expired'); setActiveTab('expired-clients'); }}
        >
          Expired Clients ({INITIAL_CLIENTS.filter(c => c.status === 'Expired').length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'risk' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('risk'); setActiveTab('risk-profile-clients'); }}
        >
          Risk Profile Audits
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 280px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Search by client name, mobile, email, or advisor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Segment:</span>
            <select 
              className="form-select"
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All Advisory Segments</option>
              <option value="Equity Premier">Equity Premier</option>
              <option value="Options Strategy">Options Strategy</option>
              <option value="Commodity Momentum">Commodity Momentum</option>
              <option value="Hedge & PMS">Hedge & PMS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Client Details</th>
                <th style={{ padding: '0.85rem 1rem' }}>Advisory Service</th>
                <th style={{ padding: '0.85rem 1rem' }}>Subscription Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Risk Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Valid Until</th>
                <th style={{ padding: '0.85rem 1rem' }}>Assigned Advisor</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching clients found for this criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{client.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', marginTop: '0.2rem' }}>
                        <span>{client.phone}</span>
                        <span>•</span>
                        <span>{client.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--apex-blue-600)' }}>{client.service}</span>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{client.investmentAmount}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getStatusBadge(client.status)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.74rem', 
                        fontWeight: 700,
                        background: client.riskProfile === 'Aggressive' ? 'rgba(239, 68, 68, 0.1)' : client.riskProfile === 'Moderate' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: client.riskProfile === 'Aggressive' ? '#ef4444' : client.riskProfile === 'Moderate' ? '#f59e0b' : '#10b981'
                      }}>
                        {client.riskProfile}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {client.validUntil}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {client.assignedAdvisor}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          title="Send Direct Advisory Alert"
                          onClick={() => setIsSMSOpen(true)}
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => showToast(`Opening advisory dossier for ${client.name}`, 'info')}
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} />
      <SMSAlertModal isOpen={isSMSOpen} onClose={() => setIsSMSOpen(false)} />
    </div>
  );
};
