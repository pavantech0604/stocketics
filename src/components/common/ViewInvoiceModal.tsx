import React from 'react';
import { InvoiceData } from '../../types';
import { X, Printer } from 'lucide-react';
import stocketicsLogo from '../../assets/logo.jpg';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="invoice-modal-backdrop" 
      onClick={onClose} 
      style={{ 
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999, 
        overflowY: 'auto', 
        padding: '24px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}
    >
      <div 
        className="invoice-modal-card" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '740px', 
          width: '100%', 
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          overflow: 'hidden',
          margin: 'auto 0'
        }}
      >
        {/* Top Sticky Control Bar */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: '#f8fafc', 
            padding: '0.65rem 1.25rem', 
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              View Tax Invoice • {invoiceData.invoiceNo}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button" 
              onClick={handlePrint}
              style={{ 
                background: '#0284c7', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '0.35rem 0.85rem', 
                fontSize: '12px', 
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Printer size={13} /> Print / PDF
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* INVOICE PAPER SHEET CONTAINER (Smooth Scrollable Area) */}
        <div 
          id="printable-invoice" 
          style={{ 
            flex: 1,
            overflowY: 'auto', 
            padding: '1.75rem 2rem 1.5rem 2rem', 
            fontSize: '12px', 
            lineHeight: 1.45, 
            color: '#1f2937',
            background: '#ffffff' 
          }}
        >
          
          {/* Header Row: Company Details Left, Invoice Metadata Right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            
            {/* Left: Official Brand Logo & Company Address */}
            <div style={{ maxWidth: '370px' }}>
              {/* Official Brand Logo - Merged seamlessly with background, zero border */}
              <div style={{ marginBottom: '0.65rem' }}>
                <img 
                  src={stocketicsLogo} 
                  alt="STOCKETICS" 
                  style={{ 
                    width: '180px', 
                    height: 'auto', 
                    maxHeight: '82px',
                    objectFit: 'contain',
                    display: 'block',
                    mixBlendMode: 'multiply',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }} 
                />
              </div>

              <div style={{ fontSize: '11.5px', color: '#374151' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
                  STOCKETICS RESEARCH AND ADVISORY SERVICES PVT LTD
                </div>
                <div style={{ marginTop: '0.25rem', lineHeight: 1.4, color: '#475569' }}>
                  #No. 311/301/58/1. Singasandra, Begur Hobli, Begur, Bangalore South,<br />
                  Bangalore 560068
                </div>
                <div style={{ marginTop: '0.25rem', color: '#475569' }}>
                  <strong>SEBI Reg. No.:</strong> INH000016357 &nbsp;|&nbsp; <strong>GSTIN:</strong> 29AALCG0354K1ZB
                </div>
              </div>
            </div>

            {/* Right: Invoice Header & Meta */}
            <div style={{ textAlign: 'left', minWidth: '190px' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                Invoice
              </div>
              <div style={{ fontSize: '11.5px', color: '#374151', lineHeight: 1.5 }}>
                <div><strong>Date:</strong> {invoiceData.invoiceDate}</div>
                <div><strong>Due Date:</strong> {invoiceData.dueDate}</div>
                <div><strong>Invoice No.:</strong> {invoiceData.invoiceNo}</div>
              </div>
            </div>
          </div>

          {/* BILL TO Banner */}
          <div style={{ 
            background: '#134e7c', 
            color: '#ffffff', 
            fontWeight: 800, 
            padding: '0.3rem 0.6rem', 
            fontSize: '13px', 
            letterSpacing: '0.5px',
            marginBottom: '0.6rem' 
          }}>
            BILL TO
          </div>

          {/* Customer Details Grid */}
          <div style={{ fontSize: '11.5px', color: '#374151', lineHeight: 1.45, marginBottom: '1.2rem' }}>
            <div><strong>Name:</strong> {invoiceData.clientName}</div>
            <div><strong>Fathers Name:</strong> {invoiceData.fathersName || ''}</div>
            <div><strong>DOB:</strong> {invoiceData.dob || '1990-07-22'}</div>
            <div><strong>Email:</strong> {invoiceData.email}</div>
            <div><strong>Street Address:</strong> {invoiceData.streetAddress}</div>
            <div><strong>City:</strong> {invoiceData.city}</div>
            <div><strong>Phone:</strong> {invoiceData.phone}</div>
            <div><strong>Pancard:</strong> {invoiceData.pancard}</div>
          </div>

          {/* Itemized Table */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            border: '1px solid #6b7280', 
            fontSize: '11.5px',
            marginBottom: '1rem' 
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #6b7280', background: '#fafafa' }}>
                <th style={{ borderRight: '1px solid #6b7280', padding: '0.4rem 0.6rem', textAlign: 'left', width: '50px' }}>S.No.</th>
                <th style={{ borderRight: '1px solid #6b7280', padding: '0.4rem 0.6rem', textAlign: 'left' }}>Description</th>
                <th style={{ borderRight: '1px solid #6b7280', padding: '0.4rem 0.6rem', textAlign: 'left', width: '100px' }}>From Date</th>
                <th style={{ borderRight: '1px solid #6b7280', padding: '0.4rem 0.6rem', textAlign: 'left', width: '100px' }}>To Date</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', width: '110px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ borderRight: '1px solid #6b7280', padding: '0.6rem', verticalAlign: 'top' }}>1</td>
                <td style={{ borderRight: '1px solid #6b7280', padding: '0.6rem', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 800, color: '#111827' }}>{invoiceData.itemDescription}</div>
                  <div style={{ fontSize: '10.5px', color: '#4b5563' }}>{invoiceData.subType || 'NORMAL'}</div>
                </td>
                <td style={{ borderRight: '1px solid #6b7280', padding: '0.6rem', verticalAlign: 'top' }}>
                  {invoiceData.fromDate}
                </td>
                <td style={{ borderRight: '1px solid #6b7280', padding: '0.6rem', verticalAlign: 'top' }}>
                  {invoiceData.toDate}
                </td>
                <td style={{ padding: '0.6rem', verticalAlign: 'top', fontWeight: 600 }}>
                  Rs {invoiceData.totalGross.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Terms & Financials Split */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            {/* Left: Terms & Conditions Box & Payment Info */}
            <div style={{ flex: 1, maxWidth: '340px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '0.35rem', color: '#111827' }}>
                Terms & Conditions:
              </div>
              <div style={{ 
                border: '1px solid #9ca3af', 
                padding: '0.45rem 0.6rem', 
                fontSize: '10.5px', 
                lineHeight: 1.35, 
                color: '#4b5563',
                background: '#ffffff',
                marginBottom: '0.75rem'
              }}>
                <div>1. Making payment is proving you are agreeing all T&C,and all other terms.</div>
                <div>2. Please note our services are non refundable.</div>
                <div>3. please read and understand all legal formalites.</div>
                <div>4. its mandatory to complete risk profit & KYC.</div>
                <div>5. Investment is subject to market risk.</div>
              </div>

              {/* Payment Info */}
              <div style={{ fontSize: '11px', color: '#374151', lineHeight: 1.45 }}>
                <div><strong>Payment mode</strong> : {invoiceData.paymentMode}</div>
                <div><strong>Bank</strong> : {invoiceData.bankName}</div>
                <div><strong>Detail</strong> : {invoiceData.paymentDetail || '.'}</div>
              </div>
            </div>

            {/* Right: Financial Totals Breakdown */}
            <div style={{ minWidth: '190px', fontSize: '11.5px', color: '#1f2937', lineHeight: 1.5 }}>
              <div><strong>Net Total :</strong> {invoiceData.totalGross}</div>
              <div><strong>Discount :</strong> {invoiceData.discount}</div>
              <div><strong>Adjustment :</strong> {invoiceData.adjustment}</div>
              <div><strong>Net Amount :</strong> {invoiceData.netAmount}/-</div>
              <div><strong>GST :</strong> {invoiceData.gstAmount}</div>
              <div style={{ marginTop: '0.15rem' }}><strong>Paid Amount :</strong> {invoiceData.paidAmount}</div>
              <div><strong>Due Amount :</strong> {invoiceData.dueAmount}/-</div>
            </div>
          </div>

          {/* Footer Notice & Signoff */}
          <div style={{ textAlign: 'center', margin: '1rem 0 0.5rem 0', color: '#6b7280', fontSize: '11px', fontStyle: 'italic' }}>
            <div>its auto generated invoice hence does not requires any signature or stamp</div>
            <div style={{ fontWeight: 800, marginTop: '0.35rem', color: '#1f2937', fontStyle: 'italic', fontSize: '12px' }}>
              Thank You For Your Buisness !
            </div>
          </div>

          {/* Bottom Left: Print Button */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
            <button 
              type="button" 
              onClick={handlePrint}
              style={{ 
                background: '#ffffff', 
                border: '1px solid #9ca3af', 
                borderRadius: '3px', 
                padding: '0.3rem 0.9rem', 
                fontSize: '11.5px', 
                color: '#1f2937',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 600
              }}
            >
              <Printer size={13} /> Print
            </button>
          </div>

        </div>
      </div>

      {/* Print stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }
          .invoice-modal-backdrop {
            background: none !important;
            padding: 0 !important;
          }
          .invoice-modal-card {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
