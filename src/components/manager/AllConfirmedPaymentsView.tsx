import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { ConfirmedPaymentRecord, InvoiceData } from '../../types';
import { INITIAL_CONFIRMED_PAYMENTS_LIST } from '../../data/initialData';
import { ViewInvoiceModal } from '../common/ViewInvoiceModal';
import { CreateInvoiceModal } from '../common/CreateInvoiceModal';
import { TipsModal } from '../common/TipsModal';
import { Home } from 'lucide-react';

interface AllConfirmedPaymentsViewProps {
  embedded?: boolean;
}

export const AllConfirmedPaymentsView: React.FC<AllConfirmedPaymentsViewProps> = ({ embedded = false }) => {
  const { setActiveTab, showToast } = useApp();
  const [paymentsList, setPaymentsList] = useState<ConfirmedPaymentRecord[]>(() => {
    const saved = localStorage.getItem('apex_crm_confirmed_payments');
    return saved ? JSON.parse(saved) : INITIAL_CONFIRMED_PAYMENTS_LIST;
  });

  useEffect(() => {
    localStorage.setItem('apex_crm_confirmed_payments', JSON.stringify(paymentsList));
  }, [paymentsList]);
  
  // Filter Inputs matching Image 2
  const [clientNameInput, setClientNameInput] = useState('');
  const [clientMobileInput, setClientMobileInput] = useState('');
  const [fromDateInput, setFromDateInput] = useState('');
  const [toDateInput, setToDateInput] = useState('');
  const [statusSelect, setStatusSelect] = useState('All');

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    mobile: '',
    fromDate: '',
    toDate: '',
    status: 'All'
  });

  // Modal states
  const [selectedInvoiceRecord, setSelectedInvoiceRecord] = useState<ConfirmedPaymentRecord | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [createInvoiceRecord, setCreateInvoiceRecord] = useState<ConfirmedPaymentRecord | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  const handleCreateInvoice = (record: ConfirmedPaymentRecord) => {
    setCreateInvoiceRecord(record);
    setIsCreateInvoiceOpen(true);
  };

  const handleInvoiceCreated = (paymentId: string, invoiceData: InvoiceData) => {
    setPaymentsList(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          invoiceCreated: true,
          invoiceData
        };
      }
      return p;
    }));
    showToast(`Invoice ${invoiceData.invoiceNo} created after bank credit verification!`, 'success');
  };

  const handleSearch = () => {
    setAppliedFilters({
      name: clientNameInput.trim().toLowerCase(),
      mobile: clientMobileInput.trim(),
      fromDate: fromDateInput,
      toDate: toDateInput,
      status: statusSelect
    });
    showToast('Filtered confirmed payment records.', 'info');
  };

  const handleExport = () => {
    const headers = "S no.,Owner Name,Client Name,Mobile,Bank,Amount,Status,Reason,Description,Client status,Date\n";
    const rows = filteredPayments.map((p, idx) => 
      `${idx + 1},"${p.ownerName}","${p.clientName}",${p.mobile},"${p.bank}",${p.amount},"${p.status}","${p.reason}","${p.description}","${p.clientStatus}",${p.date}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Confirmed_Payments_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported confirmed payments to CSV.', 'success');
  };

  const handleViewInvoice = (record: ConfirmedPaymentRecord) => {
    setSelectedInvoiceRecord(record);
    setIsInvoiceOpen(true);
  };

  // Filter logic
  const filteredPayments = paymentsList.filter(item => {
    if (appliedFilters.name && !item.clientName.toLowerCase().includes(appliedFilters.name)) {
      return false;
    }
    if (appliedFilters.mobile && !item.mobile.includes(appliedFilters.mobile)) {
      return false;
    }
    if (appliedFilters.status !== 'All' && item.status !== appliedFilters.status) {
      return false;
    }
    if (appliedFilters.fromDate && item.date < appliedFilters.fromDate) {
      return false;
    }
    if (appliedFilters.toDate && item.date > appliedFilters.toDate) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Top Header Strip with Home / Dashboard and Tips button (Image 2) */}
      {!embedded && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '13px' }}>
            <span 
              onClick={() => setActiveTab('dashboard')} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ea580c', cursor: 'pointer', fontWeight: 600 }}
            >
              <Home size={15} color="#ea580c" />
              <span>/ Dashboard</span>
            </span>
          </div>

          {/* Tips Dark Navy Button matching Image 2 */}
          <button 
            onClick={() => setIsTipsOpen(true)}
            style={{ 
              background: '#0a192f', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '3px', 
              padding: '0.25rem 1rem', 
              fontSize: '13px', 
              fontWeight: 700, 
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            Tips
          </button>
        </div>
      )}

      {/* Title: All Confirmed Payment (matching Image 2) */}
      {!embedded && (
        <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0 0 0', letterSpacing: '-0.3px' }}>
          All Confirmed Payment
        </h2>
      )}

      {/* Filter Row Box (matching Image 2) */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.25rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          
          {/* Client Name */}
          <div style={{ minWidth: '150px', flex: '1 1 140px' }}>
            <input 
              type="text"
              placeholder="Client Name"
              value={clientNameInput}
              onChange={e => setClientNameInput(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 0.75rem',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          {/* Client Mobile */}
          <div style={{ minWidth: '150px', flex: '1 1 140px' }}>
            <input 
              type="text"
              placeholder="Client Mobile"
              value={clientMobileInput}
              onChange={e => setClientMobileInput(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 0.75rem',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          {/* From Date */}
          <div style={{ minWidth: '140px', flex: '1 1 130px' }}>
            <input 
              type="text"
              placeholder="From Date"
              value={fromDateInput}
              onFocus={e => (e.target.type = 'date')}
              onBlur={e => { if (!e.target.value) e.target.type = 'text'; }}
              onChange={e => setFromDateInput(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 0.75rem',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>

          {/* To Date */}
          <div style={{ minWidth: '140px', flex: '1 1 130px' }}>
            <input 
              type="text"
              placeholder="To Date"
              value={toDateInput}
              onFocus={e => (e.target.type = 'date')}
              onBlur={e => { if (!e.target.value) e.target.type = 'text'; }}
              onChange={e => setToDateInput(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 0.75rem',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>

          {/* Select: All */}
          <div style={{ minWidth: '120px', flex: '1 1 110px' }}>
            <select
              value={statusSelect}
              onChange={e => setStatusSelect(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 0.75rem',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Search Button (Amber/Orange matching Image 2) */}
          <button 
            type="button" 
            onClick={handleSearch}
            style={{ 
              background: '#f59e0b', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '0 1.25rem', 
              height: '36px',
              fontSize: '13px', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            Search
          </button>

          {/* export Button (Amber/Orange matching Image 2) */}
          <button 
            type="button" 
            onClick={handleExport}
            style={{ 
              background: '#f59e0b', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '0 1.1rem', 
              height: '36px',
              fontSize: '13px', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            export
          </button>
        </div>
      </div>

      {/* Confirmed Payment Table Card (matching Image 2) */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px', color: '#1e293b' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #e2e8f0', background: '#ffffff' }}>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>S no.</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Owner Name</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Client Name</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Mobile</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Bank</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Amount</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Staus</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Reason</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Description</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Client status</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Date</th>
                <th style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((record, index) => (
                  <tr 
                    key={record.id} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      background: index % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>{index + 1}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#1e293b', fontWeight: 500 }}>{record.ownerName}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#1e293b', fontWeight: 600 }}>{record.clientName}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>{record.mobile}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#1e293b' }}>{record.bank}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#1e293b', fontWeight: 600 }}>{record.amount}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#16a34a', fontWeight: 600 }}>{record.status}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>{record.reason}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>{record.description}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>{record.clientStatus}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569', whiteSpace: 'nowrap' }}>{record.date}</td>
                    <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>
                      {record.invoiceCreated ? (
                        /* Vibrant Green View Invoice Button */
                        <button 
                          type="button" 
                          onClick={() => handleViewInvoice(record)}
                          style={{ 
                            background: '#84cc16', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '0.4rem 0.8rem', 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          View Invoice
                        </button>
                      ) : (
                        /* Cyan / Sky Blue Create New Invoice Button */
                        <button 
                          type="button" 
                          onClick={() => handleCreateInvoice(record)}
                          style={{ 
                            background: '#46b8da', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '0.4rem 0.8rem', 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          Create New Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                    No confirmed payments found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Showing Count at bottom left matching Image 2 */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', background: '#ffffff', fontSize: '13px', color: '#334155', fontWeight: 500 }}>
          Showing : {filteredPayments.length}
        </div>
      </div>

      {/* View Invoice Modal */}
      <ViewInvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        invoiceData={selectedInvoiceRecord?.invoiceData || null} 
      />

      {/* Create New Invoice Modal (Confirm Bank Receipt) */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        paymentRecord={createInvoiceRecord}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />

    </div>
  );
};
