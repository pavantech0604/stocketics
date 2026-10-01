import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { ConfirmedPaymentRecord, InvoiceData } from '../../types';
import { INITIAL_CONFIRMED_PAYMENTS_LIST } from '../../data/initialData';
import { ViewInvoiceModal } from '../common/ViewInvoiceModal';
import { CreateInvoiceModal } from '../common/CreateInvoiceModal';
import { TipsModal } from '../common/TipsModal';
import { LeadKYCOnboardingModal } from '../common/LeadKYCOnboardingModal';
import { Home, ShieldCheck } from 'lucide-react';

interface AllConfirmedPaymentsViewProps {
  embedded?: boolean;
}

export const AllConfirmedPaymentsView: React.FC<AllConfirmedPaymentsViewProps> = ({ embedded = false }) => {
  const { 
    setActiveTab, 
    showToast, 
    theme, 
    advisoryLeads, 
    kycCases, 
    getKYCCaseForLead,
    confirmedPayments,
    approveConfirmedPayment,
    rejectConfirmedPayment,
    role
  } = useApp();
  const isDark = theme === 'dark';
  const [kycLead, setKycLead] = useState<any | null>(null);
  const paymentsList = confirmedPayments;
  
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
  const [selectedScreenshotRecord, setSelectedScreenshotRecord] = useState<ConfirmedPaymentRecord | null>(null);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  const handleCreateInvoice = (record: ConfirmedPaymentRecord) => {
    setCreateInvoiceRecord(record);
    setIsCreateInvoiceOpen(true);
  };

  const handleInvoiceCreated = (paymentId: string, invoiceData: InvoiceData) => {
    approveConfirmedPayment(paymentId, invoiceData.paymentDetail, invoiceData.itemDescription);
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
      <div className="payments-filter-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.25rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
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
                background: '#ffffff'
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
                background: '#ffffff'
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
        </div>
      </div>

      {/* Confirmed Payment Table Card (matching Image 2) */}
      <div className="payments-table-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="payments-table" style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead><tr>
              <th style={{width:'4%'}}>#</th><th style={{width:'20%'}}>Client / Mobile</th>
              <th style={{width:'14%'}}>Owner</th><th style={{width:'14%'}}>Payment / Bank</th>
              <th style={{width:'13%'}}>Status / Date</th><th style={{width:'19%'}}>Details</th>
              <th style={{width:'16%'}}>Actions</th>
            </tr></thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((record, index) => (
                  <tr 
                    key={record.id} 
                    style={{ 
                      background: index % 2 === 0 ? '#ffffff' : '#fafafa',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <td>{index + 1}</td>
                    <td><strong>{record.clientName}</strong><small>{record.mobile}</small></td>
                    <td>{record.ownerName}</td>
                    <td><strong>₹{record.amount?.toLocaleString('en-IN') || record.amount}</strong><small>{record.bank}</small></td>
                    <td><strong>{record.status}</strong><small>{record.date}</small></td>
                    <td><span>{record.clientStatus}</span><small>{record.reason}</small><details><summary>Service details</summary>{record.description}</details></td>
                    <td><details className="payment-row-actions"><summary>Actions</summary>
                      {record.screenshotUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedScreenshotRecord(record)}
                          style={{
                            background: '#8b5cf6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.4rem 0.65rem',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'background 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginRight: '6px'
                          }}
                          title="View Client Payment Screenshot"
                        >
                          <span>🖼️ Receipt</span>
                        </button>
                      )}

                      {/* Complete KYC Action for Closed Payment Lead */}
                      {(() => {
                        const phone = record.mobile.replace(/\D/g, '').slice(-10);
                        const matchedLead = advisoryLeads.find(l => record.leadId ? l.id === record.leadId : phone.length === 10 && l.phone.replace(/\D/g, '').slice(-10) === phone);
                        const kCase = matchedLead ? getKYCCaseForLead(matchedLead.id) : kycCases.find(c => c.leadPhone.includes(record.mobile) || c.leadName.toLowerCase() === record.clientName.toLowerCase());
                        const isApproved = kCase?.status === 'Approved';
                        const isPending = kCase?.status === 'Pending Approval' || kCase?.status === 'In Review';
                        const isNeedsReupload = kCase?.status === 'Needs Reupload';

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (!matchedLead) {
                                showToast('This payment has no linked lead. Open the correct client from All Leads to complete onboarding.', 'error');
                                return;
                              }
                              setKycLead(matchedLead);
                            }}
                            style={{
                              background: isApproved ? '#16a34a' : isPending ? '#f59e0b' : isNeedsReupload ? '#ef4444' : '#0a192f',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.4rem 0.65rem',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginRight: '6px',
                              transition: 'all 0.12s ease'
                            }}
                            title={kCase ? `KYC Status: ${kCase.status}` : 'Complete KYC Verification for this Closed Client'}
                          >
                            <ShieldCheck size={13} color="#38bdf8" />
                            <span>{isApproved ? 'KYC ✓' : isPending ? 'KYC In Review' : isNeedsReupload ? 'KYC Fix' : 'Complete KYC'}</span>
                          </button>
                        );
                      })()}

                      {/* Approve & Convert Action for Pending Payments (Manager / Finance Role) */}
                      {record.status === 'Pending' && (role === 'manager' || role === 'hr') && (
                        <button
                          type="button"
                          onClick={() => {
                            const utr = prompt(`Enter UTR / Bank Reference for ${record.clientName}:`, record.utrNumber || `UTR-${Date.now().toString().slice(-8)}`);
                            if (utr !== null) {
                              approveConfirmedPayment(record.id, utr.trim() || undefined);
                            }
                          }}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.4rem 0.65rem',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginRight: '6px'
                          }}
                          title="Verify Bank Credit, Auto-Issue 18% GST Tax Invoice, and Convert to Client Master"
                        >
                          <span>✓ Approve</span>
                        </button>
                      )}

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
                    </details>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
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

      {/* KYC Onboarding Modal for Closed Lead */}
      {kycLead && (
        <LeadKYCOnboardingModal
          lead={kycLead}
          isOpen={!!kycLead}
          onClose={() => setKycLead(null)}
        />
      )}

      {/* Client Payment Screenshot Viewer Modal */}
      {selectedScreenshotRecord && (
        <div 
          className="market-modal-backdrop" 
          onClick={() => setSelectedScreenshotRecord(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(10, 17, 40, 0.75)' : 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Client Payment Screenshot Proof</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedScreenshotRecord.clientName} ({selectedScreenshotRecord.mobile}) • ₹{selectedScreenshotRecord.amount.toLocaleString('en-IN')}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedScreenshotRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', fontSize: '16px', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1.25rem', textAlign: 'center', background: '#f8fafc' }}>
              <img 
                src={selectedScreenshotRecord.screenshotUrl} 
                alt="Client Payment Screenshot"
                style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}
              />
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569' }}>
                Bank: <strong>{selectedScreenshotRecord.bank}</strong> • Date: <strong>{selectedScreenshotRecord.date}</strong>
                {selectedScreenshotRecord.scriptName && (
                  <div>Advisory Script: <strong>{selectedScreenshotRecord.scriptName}</strong></div>
                )}
              </div>
            </div>
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setSelectedScreenshotRecord(null)}
                style={{ background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '0.45rem 1rem', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
