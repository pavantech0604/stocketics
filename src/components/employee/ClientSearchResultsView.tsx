import React, { useState } from 'react';
import { ActiveClientRecordDetailed, ClientEmployeeNote } from '../../types';
import { useApp } from '../../state/store';
import { 
  Home, 
  Search, 
  PhoneCall, 
  Edit, 
  Clock, 
  User, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  Plus
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';
import { C2CDialerModal } from './ClientActionModals';

interface ClientSearchResultsViewProps {
  clients: ActiveClientRecordDetailed[];
  onEditClient: (client: ActiveClientRecordDetailed) => void;
  onUpdateClient: (client: ActiveClientRecordDetailed) => void;
}

export const ClientSearchResultsView: React.FC<ClientSearchResultsViewProps> = ({
  clients,
  onEditClient,
  onUpdateClient
}) => {
  const {
    currentUser,
    setActiveTab,
    showToast,
    triggerClientSearchAlert,
    simulateCrossSearchAlert,
    clientSearchQuery,
    setClientSearchQuery
  } = useApp();
  const [activeTab, setActiveFilterTab] = useState<'leads' | 'clients' | 'unallotted' | 'disposed' | 'deleted'>('clients');
  const [searchQuery, setSearchQuery] = useState(clientSearchQuery || '');
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [c2cTargetClient, setC2cTargetClient] = useState<ActiveClientRecordDetailed | null>(null);

  // Synchronize with global clientSearchQuery from sidebar search
  React.useEffect(() => {
    if (clientSearchQuery && clientSearchQuery.trim()) {
      const q = clientSearchQuery.trim();
      setSearchQuery(q);

      const cleanQ = q.replace(/\D/g, '');
      const lowerQ = q.toLowerCase();
      const matched = clients.find(c => {
        const cMobile = c.mobile.replace(/\D/g, '');
        const cAlt = c.alternateMobile ? c.alternateMobile.replace(/\D/g, '') : '';
        const matchPhone = cleanQ.length >= 3 && (cMobile.includes(cleanQ) || cAlt.includes(cleanQ));
        const matchName = c.clientName.toLowerCase().includes(lowerQ);
        const matchCode = c.clientCode.toLowerCase().includes(lowerQ);
        return matchPhone || matchName || matchCode;
      });

      if (matched && matched.tabCategory) {
        setActiveFilterTab(matched.tabCategory);
      }
    }
  }, [clientSearchQuery, clients]);

  // Cross-employee search tracking effect
  React.useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => {
        const q = searchQuery.toLowerCase();
        const otherOwned = clients.find(c => {
          const match = c.clientName.toLowerCase().includes(q) || c.mobile.includes(q) || c.clientCode.toLowerCase().includes(q);
          const isOther = c.ownerName && c.ownerName.toLowerCase() !== currentUser.name.toLowerCase() && c.ownerName.toLowerCase() !== 'unassigned';
          return match && isOther;
        });

        if (otherOwned) {
          triggerClientSearchAlert({
            clientId: otherOwned.id,
            clientCode: otherOwned.clientCode,
            clientName: otherOwned.clientName,
            clientMobile: otherOwned.mobile,
            targetType: 'client',
            ownerName: otherOwned.ownerName,
            searchedById: currentUser.id,
            searchedByName: currentUser.name,
            searchedByRole: currentUser.title || currentUser.role,
            searchedByAvatar: currentUser.avatar,
            searchQuery: searchQuery.trim(),
            searchLocation: 'Active Clients Search Bar'
          });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, clients, currentUser.name]);

  const handleEditClick = (c: ActiveClientRecordDetailed) => {
    if (c.ownerName && c.ownerName.toLowerCase() !== currentUser.name.toLowerCase() && c.ownerName.toLowerCase() !== 'unassigned') {
      triggerClientSearchAlert({
        clientId: c.id,
        clientCode: c.clientCode,
        clientName: c.clientName,
        clientMobile: c.mobile,
        targetType: 'client',
        ownerName: c.ownerName,
        searchedById: currentUser.id,
        searchedByName: currentUser.name,
        searchedByRole: currentUser.title || currentUser.role,
        searchedByAvatar: currentUser.avatar,
        searchQuery: searchQuery || 'Client Edit Access',
        searchLocation: 'Client Edit View'
      });
    }
    onEditClient(c);
  };

  const handleC2cClick = (c: ActiveClientRecordDetailed) => {
    if (c.ownerName && c.ownerName.toLowerCase() !== currentUser.name.toLowerCase() && c.ownerName.toLowerCase() !== 'unassigned') {
      triggerClientSearchAlert({
        clientId: c.id,
        clientCode: c.clientCode,
        clientName: c.clientName,
        clientMobile: c.mobile,
        targetType: 'client',
        ownerName: c.ownerName,
        searchedById: currentUser.id,
        searchedByName: currentUser.name,
        searchedByRole: currentUser.title || currentUser.role,
        searchedByAvatar: currentUser.avatar,
        searchQuery: searchQuery || 'Click-to-Call Access',
        searchLocation: 'C2C Call Dialer'
      });
    }
    setC2cTargetClient(c);
  };

  // Tab counts
  const countLeads = clients.filter(c => c.tabCategory === 'leads').length;
  const countClients = clients.filter(c => c.tabCategory === 'clients').length;
  const countUnallotted = clients.filter(c => c.tabCategory === 'unallotted').length;
  const countDisposed = clients.filter(c => c.tabCategory === 'disposed').length;
  const countDeleted = clients.filter(c => c.tabCategory === 'deleted').length;

  // Filter clients by tab and search
  const filteredClients = clients.filter(c => {
    if (c.tabCategory !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanQ = searchQuery.replace(/\D/g, '');
      const cMobile = c.mobile.replace(/\D/g, '');
      const cAlt = c.alternateMobile ? c.alternateMobile.replace(/\D/g, '') : '';
      const match = 
        c.clientName.toLowerCase().includes(q) ||
        (cleanQ.length >= 3 && (cMobile.includes(cleanQ) || cAlt.includes(cleanQ))) ||
        c.mobile.includes(q) ||
        c.clientCode.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Subpage Breadcrumb Strip matching Image 1: / Dashboard with Tips on top right */}
      <div 
        className="subpage-header-strip-ref"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <span 
            onClick={() => setActiveTab('dashboard')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#ea580c', fontWeight: 600 }}
          >
            <Home size={15} style={{ marginRight: '4px' }} />
            / Dashboard
          </span>
        </div>

        {/* Tips Button matching Image 1 */}
        <button
          onClick={() => setIsTipsOpen(true)}
          style={{
            background: '#0a192f',
            color: '#ffffff',
            border: 'none',
            padding: '0.35rem 1.25rem',
            borderRadius: '2px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.5px'
          }}
        >
          Tips
        </button>
      </div>

      {/* Title matching Image 1 */}
      <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', margin: '0.25rem 0' }}>
        Search Results
      </h1>

      {/* Tabs Container matching Image 1:
          Leads ( 0 ) | Clients ( 1 ) | Un-allotted ( 0 ) | Disposed ( 0 ) | Deleted ( 0 )
          Dark background with active tab in crisp white
      */}
      <div 
        className="search-results-tab-bar"
        style={{
          background: '#0b192e',
          borderRadius: '4px 4px 0 0',
          padding: '6px 6px 0 6px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          overflowX: 'auto'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilterTab('leads')}
          className={`search-results-tab ${activeTab === 'leads' ? 'active' : ''}`}
          style={{
            background: activeTab === 'leads' ? '#ffffff' : 'transparent',
            color: activeTab === 'leads' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            padding: '0.65rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Leads ( {countLeads} )
        </button>

        <button
          type="button"
          onClick={() => setActiveFilterTab('clients')}
          className={`search-results-tab ${activeTab === 'clients' ? 'active' : ''}`}
          style={{
            background: activeTab === 'clients' ? '#ffffff' : 'transparent',
            color: activeTab === 'clients' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            padding: '0.65rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Clients ( {countClients} )
        </button>

        <button
          type="button"
          onClick={() => setActiveFilterTab('unallotted')}
          className={`search-results-tab ${activeTab === 'unallotted' ? 'active' : ''}`}
          style={{
            background: activeTab === 'unallotted' ? '#ffffff' : 'transparent',
            color: activeTab === 'unallotted' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            padding: '0.65rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Un-allotted ( {countUnallotted} )
        </button>

        <button
          type="button"
          onClick={() => setActiveFilterTab('disposed')}
          className={`search-results-tab ${activeTab === 'disposed' ? 'active' : ''}`}
          style={{
            background: activeTab === 'disposed' ? '#ffffff' : 'transparent',
            color: activeTab === 'disposed' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            padding: '0.65rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Disposed ( {countDisposed} )
        </button>

        <button
          type="button"
          onClick={() => setActiveFilterTab('deleted')}
          className={`search-results-tab ${activeTab === 'deleted' ? 'active' : ''}`}
          style={{
            background: activeTab === 'deleted' ? '#ffffff' : 'transparent',
            color: activeTab === 'deleted' ? '#0f172a' : '#cbd5e1',
            border: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            padding: '0.65rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Deleted ( {countDeleted} )
        </button>
      </div>

      {/* Main Table Container */}
      <div 
        className="search-results-table-card"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Quick Search bar */}
        <div 
          className="search-results-quickbar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #f1f5f9',
            background: '#ffffff'
          }}
        >
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name, mobile, or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setClientSearchQuery(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem 0.4rem 2rem',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
                background: '#ffffff',
                color: '#1e293b'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={simulateCrossSearchAlert}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(0, 180, 216, 0.08)',
                color: '#0284c7',
                border: '1px solid rgba(0, 180, 216, 0.35)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Test the real-time popup that owners receive when someone searches their client"
            >
              <Sparkles size={13} color="#00b4d8" /> Test Cross-Search Pop-up
            </button>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing <strong>{filteredClients.length}</strong> records
            </div>
          </div>
        </div>

        {/* Table matching Image 1:
            # | Owner Name | Client Code | Client Name | Mobile | Response | Description | Action
        */}
        <div style={{ overflowX: 'auto' }}>
          <table className="search-results-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem', width: '40px' }}>#</th>
                <th style={{ padding: '0.75rem 1rem' }}>Owner Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Client Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Client Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Mobile</th>
                <th style={{ padding: '0.75rem 1rem' }}>Response</th>
                <th style={{ padding: '0.75rem 1rem', minWidth: '240px' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '140px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    No records found in this category
                  </td>
                </tr>
              ) : (
                filteredClients.map((c, idx) => (
                  <tr 
                    key={c.id}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#334155' }}>
                      {c.ownerName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>{c.clientCode}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1e293b' }}>{c.clientName}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#0284c7', fontFamily: 'monospace', fontWeight: 600 }}>{c.mobile}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155', fontSize: '0.82rem' }}>{c.response}</td>
                    
                    {/* Description styled in signature bright blue rounded badge matching Image 1 */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div 
                        className="desc-bubble-ref"
                        title={`Logged notes (${c.notesHistory.length} updates). Click Edit to view full audit history.`}
                        style={{
                          background: '#38bdf8',
                          color: '#ffffff',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '4px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          lineHeight: 1.35,
                          maxWidth: '320px',
                          boxShadow: '0 1px 3px rgba(56, 189, 248, 0.25)',
                          wordBreak: 'break-word'
                        }}
                      >
                        {c.description || (c.notesHistory[0]?.text) || 'No call description recorded'}
                      </div>
                    </td>

                    {/* Action matching Image 1: C2C button (Cyan) + Edit pencil icon button (Cyan) */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleC2cClick(c)}
                          title="Click to Call"
                          style={{
                            background: '#38bdf8',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.35rem 0.85rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 2px rgba(56, 189, 248, 0.25)'
                          }}
                        >
                          C2C
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditClick(c)}
                          title="Edit Client Details & KYC"
                          style={{
                            background: '#38bdf8',
                            color: '#ffffff',
                            border: 'none',
                            width: '30px',
                            height: '28px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 2px rgba(56, 189, 248, 0.25)'
                          }}
                        >
                          <Edit size={14} />
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

      {/* Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />

      {/* C2C Modal */}
      {c2cTargetClient && (
        <C2CDialerModal
          isOpen={!!c2cTargetClient}
          onClose={() => setC2cTargetClient(null)}
          client={c2cTargetClient}
          currentEmployeeName={currentUser.name}
          onSaveCallNote={(note) => {
            const updated = {
              ...c2cTargetClient,
              description: note.text,
              response: note.response,
              notesHistory: [note, ...c2cTargetClient.notesHistory]
            };
            onUpdateClient(updated);
            showToast(`Call logged for ${updated.clientName}! Note added to description history.`, 'success');
            setC2cTargetClient(null);
          }}
        />
      )}
    </div>
  );
};
