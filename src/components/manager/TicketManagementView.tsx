import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Inbox, 
  Tag, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Filter,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { AddTicketModal } from '../common/CRMActionModals';

interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  clientOrStaff: string;
  priority: 'Urgent' | 'High' | 'Normal';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  assignedTo: string;
  lastReply: string;
}

interface TicketCategory {
  id: string;
  name: string;
  description: string;
  slaHours: number;
  assignedDepartment: string;
  activeCount: number;
}

const INITIAL_TICKETS: TicketItem[] = [
  {
    id: 'tkt-1',
    ticketNumber: '#TKT-9041',
    subject: 'Delayed SMS signal delivery for BankNifty 51200 CE',
    category: 'Advisory Signal Delay',
    clientOrStaff: 'Radhika Singhania',
    priority: 'Urgent',
    status: 'In Progress',
    createdAt: '07-Sep-2026, 10:45 AM',
    assignedTo: 'Siddharth Rao (IT)',
    lastReply: 'Telco DLT gateway queue cleared. Resending test batch.'
  },
  {
    id: 'tkt-2',
    ticketNumber: '#TKT-9042',
    subject: 'Payment receipt invoice copy requested for GST input credit',
    category: 'Billing & Invoice Discrepancy',
    clientOrStaff: 'Dr. Harshvardhan Jain',
    priority: 'Normal',
    status: 'Open',
    createdAt: '07-Sep-2026, 09:30 AM',
    assignedTo: 'Priya Sharma (HR/Finance)',
    lastReply: 'Awaiting verified GSTIN copy from client.'
  },
  {
    id: 'tkt-3',
    ticketNumber: '#TKT-9043',
    subject: 'Commodity MCX Crude Oil contract roll-over query',
    category: 'Trade Execution & Advisory',
    clientOrStaff: 'Manish Agarwal',
    priority: 'High',
    status: 'Open',
    createdAt: '07-Sep-2026, 11:10 AM',
    assignedTo: 'Rohan Deshmukh (Advisory)',
    lastReply: 'Advisor reviewing current month contract expiry date.'
  },
  {
    id: 'tkt-4',
    ticketNumber: '#TKT-9044',
    subject: 'VPN access disconnect on Bangalore office dialer terminal',
    category: 'Internal Infrastructure & IT',
    clientOrStaff: 'Sneha Kapur (Staff)',
    priority: 'Normal',
    status: 'Resolved',
    createdAt: '06-Sep-2026, 05:20 PM',
    assignedTo: 'Vikram Patel (IT)',
    lastReply: 'VPN credentials refreshed and tunnel re-established.'
  }
];

const INITIAL_CATEGORIES: TicketCategory[] = [
  {
    id: 'cat-1',
    name: 'Advisory Signal Delay',
    description: 'Complaints regarding SMS, Telegram, or App push trade alert delays',
    slaHours: 2,
    assignedDepartment: 'IT & Infrastructure',
    activeCount: 3
  },
  {
    id: 'cat-2',
    name: 'Trade Execution & Advisory',
    description: 'Queries regarding research analyst target levels, stops, and contract roll',
    slaHours: 4,
    assignedDepartment: 'Equity & Derivatives Desk',
    activeCount: 5
  },
  {
    id: 'cat-3',
    name: 'Billing & Invoice Discrepancy',
    description: 'GST invoice generation, payment receipt, and subscription activation errors',
    slaHours: 12,
    assignedDepartment: 'Finance & Compliance',
    activeCount: 2
  },
  {
    id: 'cat-4',
    name: 'SEBI SCORES & Client Grievances',
    description: 'Mandatory compliance escalations and formal regulatory client grievances',
    slaHours: 24,
    assignedDepartment: 'Compliance Directorate',
    activeCount: 1
  },
  {
    id: 'cat-5',
    name: 'Internal Infrastructure & IT',
    description: 'CRM dialer, workstation, screen, and internet connectivity issues for sales',
    slaHours: 4,
    assignedDepartment: 'IT Support Team',
    activeCount: 4
  }
];

export const TicketManagementView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  const getSubTab = (): 'tickets' | 'categories' => {
    if (activeTab === 'tickets-category') return 'categories';
    return 'tickets';
  };

  const [currentTab, setCurrentTab] = useState<'tickets' | 'categories'>(getSubTab());
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_TICKETS);
  const [categories, setCategories] = useState<TicketCategory[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);

  useEffect(() => {
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: 'tickets' | 'categories', tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleMarkResolved = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    showToast('Ticket marked as Resolved successfully!', 'success');
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = 
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientOrStaff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Ticket</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'tickets' ? 'Tickets' : 'Tickets Category'}
          </span>
        </div>
      </div>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Support & Grievance Ticketing Desk
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Reference CRM Ticket resolution pipeline, SLA compliance, and category governance.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsAddTicketOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Raise New Ticket
        </button>
      </div>

      {/* Sub-Options Nav Tabs: Exact Names "Tickets" and "Tickets Category" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('tickets', 'tickets')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Inbox size={14} /> Tickets ({tickets.filter(t => t.status !== 'Resolved').length} Open)
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('categories', 'tickets-category')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Tag size={14} /> Tickets Category ({categories.length})
        </button>
      </div>

      {/* TAB 1: TICKETS LIST */}
      {currentTab === 'tickets' && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 280px' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Search tickets by ID, subject, client, category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</span>
                <select 
                  className="form-select"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredTickets.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No tickets matching criteria.
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--stocketics-blue-500)', fontSize: '0.9rem' }}>
                        {ticket.ticketNumber}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {ticket.subject}
                      </h4>
                      <span className="delta-badge" style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem' }}>
                        {ticket.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.74rem', 
                        fontWeight: 700, 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        background: ticket.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.12)' : ticket.priority === 'High' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: ticket.priority === 'Urgent' ? '#ef4444' : ticket.priority === 'High' ? '#f59e0b' : '#3b82f6'
                      }}>
                        {ticket.priority} Priority
                      </span>
                      <span className={`delta-badge ${ticket.status === 'Resolved' ? 'positive' : 'negative'}`} style={{ fontSize: '0.74rem' }}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                    <span>Raised by: <strong>{ticket.clientOrStaff}</strong></span>
                    <span>•</span>
                    <span>Assigned to: <strong>{ticket.assignedTo}</strong></span>
                    <span>•</span>
                    <span>Created: {ticket.createdAt}</span>
                  </div>

                  <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong>Latest Note:</strong> {ticket.lastReply}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {ticket.status !== 'Resolved' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkResolved(ticket.id)}
                      >
                        <CheckCircle2 size={13} /> Mark Resolved
                      </button>
                    )}
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Opening response console for ${ticket.ticketNumber}`, 'info')}
                    >
                      <MessageSquare size={13} /> Reply / History
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* TAB 2: TICKETS CATEGORY */}
      {currentTab === 'categories' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Ticket Categories & SLA Matrix Configuration
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Mandated resolution deadlines
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Category Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Max SLA Target</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Default Department</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Active Load</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Tag size={15} style={{ color: 'var(--stocketics-blue-500)' }} />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {cat.description}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="delta-badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
                        <Clock size={12} /> {cat.slaHours} Hours
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {cat.assignedDepartment}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="delta-badge positive" style={{ fontSize: '0.74rem' }}>
                        {cat.activeCount} In Queue
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => showToast(`Editing category SLA for ${cat.name}`, 'info')}
                      >
                        Edit SLA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddTicketModal isOpen={isAddTicketOpen} onClose={() => setIsAddTicketOpen(false)} />
    </div>
  );
};
