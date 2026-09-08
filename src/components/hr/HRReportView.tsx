import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Tag, 
  Flag, 
  Edit3, 
  PenTool,
  X, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  FileSpreadsheet,
  Users,
  Search,
  ArrowUpDown,
  ShieldCheck
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';

interface ReportCardConfig {
  id: string;
  title: string;
  subtitle: string;
  colorType: 'blue' | 'green' | 'olive';
  iconType: 'tag' | 'flag' | 'pencil' | 'quill';
  metricsSummary: { label: string; value: string }[];
  columns: string[];
  sampleData: (string | number)[][];
}

const HR_REPORT_CONFIGS: ReportCardConfig[] = [
  // Row 1
  {
    id: 'sales-report',
    title: 'Sales',
    subtitle: 'Report',
    colorType: 'blue',
    iconType: 'tag',
    metricsSummary: [
      { label: 'Total Sales Booking', value: '₹12,53,100' },
      { label: 'Deals Closed This Month', value: '48 Deals' },
      { label: 'Average Ticket Size', value: '₹26,106' },
      { label: 'Top Segment', value: 'INDEX OPTION' }
    ],
    columns: ['Date', 'Client Name', 'Mobile', 'Segment', 'Executive', 'Amount (₹)', 'Status'],
    sampleData: [
      ['08-Sep-2026', 'Sruthi A S', '8891171239', 'INDEX OPTION', 'Sirajul Fasal M', '45,000', 'Success'],
      ['08-Sep-2026', 'M Subramanyam', '9948527886', 'INDEX OPTION', 'Golla Yugendra', '35,000', 'Success'],
      ['07-Sep-2026', 'BHARATH', '9952011804', 'INDEX OPTION', 'Devika B', '60,000', 'Success'],
      ['07-Sep-2026', 'Pasula Laxmi Prasanna', '9491924562', 'Market Pathshala', 'Golla Yugendra', '25,000', 'Success'],
      ['06-Sep-2026', 'Pugazhendhi S', '8489712962', 'EQUITY PREMIER', 'Rohan Deshmukh', '90,000', 'Success'],
      ['05-Sep-2026', 'VIVEKANANDHAN PERUMAL', '7904005514', 'FUTURE & OPTIONS', 'Ananya Sen', '1,20,000', 'Success']
    ]
  },
  {
    id: 'account-report',
    title: 'Account',
    subtitle: 'Report',
    colorType: 'green',
    iconType: 'pencil',
    metricsSummary: [
      { label: 'Ledger Inflow', value: '₹18,40,000' },
      { label: 'Pending Invoices', value: '6 Pending' },
      { label: 'Direct Bank Deposits', value: '₹14,25,000' },
      { label: 'Gateway Settlement', value: '₹4,15,000' }
    ],
    columns: ['Txn ID', 'Client Name', 'Payment Mode', 'Bank Account', 'UTR / Ref No', 'Amount (₹)', 'Audit Status'],
    sampleData: [
      ['TXN-9011', 'Sruthi A S', 'NEFT', 'HDFC Bank - 0021', 'HDFCN26090881', '45,000', 'Reconciled'],
      ['TXN-9012', 'M Subramanyam', 'UPI / QR', 'ICICI Bank - 4410', 'UPI-260908129', '35,000', 'Reconciled'],
      ['TXN-9013', 'BHARATH', 'NetBanking', 'HDFC Bank - 0021', 'HDFCN26090714', '60,000', 'Reconciled'],
      ['TXN-9014', 'Pasula Laxmi', 'Credit Card', 'Razorpay Route', 'RZP-881923019', '25,000', 'Verified'],
      ['TXN-9015', 'Pugazhendhi S', 'RTGS', 'Axis Bank - 9912', 'AXISRTGS260906', '90,000', 'Reconciled']
    ]
  },
  {
    id: 'cr-compliance',
    title: 'CR',
    subtitle: 'Compliance',
    colorType: 'olive',
    iconType: 'quill',
    metricsSummary: [
      { label: 'SEBI Compliance Score', value: '99.4%' },
      { label: 'Risk Profiling Complete', value: '100%' },
      { label: 'KYC Document Vaulted', value: '48 / 48' },
      { label: 'Agreement Consent Signed', value: '100%' }
    ],
    columns: ['Client Name', 'PAN Number', 'Risk Category', 'Aadhaar e-Sign', 'Mandate Date', 'SEBI Reg', 'Audit Clearance'],
    sampleData: [
      ['Sruthi A S', 'BNVPS8821K', 'High Growth', 'Verified', '08-Sep-2026', 'INA000012345', 'Compliant'],
      ['M Subramanyam', 'CRKPM9941L', 'Moderate Aggressive', 'Verified', '08-Sep-2026', 'INA000012345', 'Compliant'],
      ['BHARATH', 'AGLPB1104D', 'High Growth', 'Verified', '07-Sep-2026', 'INA000012345', 'Compliant'],
      ['Pasula Laxmi', 'DJWPL4562E', 'Conservative', 'Verified', '07-Sep-2026', 'INA000012345', 'Compliant'],
      ['Pugazhendhi S', 'ALXPS2962Q', 'High Growth', 'Verified', '06-Sep-2026', 'INA000012345', 'Compliant']
    ]
  },
  {
    id: 'sales-eod-report',
    title: 'Sales',
    subtitle: 'EOD Report',
    colorType: 'blue',
    iconType: 'flag',
    metricsSummary: [
      { label: "Today's Target", value: '₹80,000' },
      { label: "Today's Achieved", value: '₹1,05,000' },
      { label: 'EOD Realization', value: '131.25%' },
      { label: 'Active Desks Today', value: '14 Desks' }
    ],
    columns: ['Executive', 'Calls Made', 'Connects', 'Talktime (min)', 'Interested', 'Sales (₹)', 'Target %'],
    sampleData: [
      ['Sirajul Fasal M', '84', '42', '148', '6', '45,000', '112%'],
      ['Golla Yugendra', '92', '51', '162', '8', '35,000', '100%'],
      ['Devika B', '78', '38', '135', '5', '60,000', '150%'],
      ['Rohan Deshmukh', '95', '55', '180', '9', '25,000', '85%'],
      ['Ananya Sen', '81', '44', '152', '7', '0', '0%']
    ]
  },

  // Row 2
  {
    id: 'alloted-lead-report',
    title: 'Alloted Lead',
    subtitle: 'Report',
    colorType: 'green',
    iconType: 'pencil',
    metricsSummary: [
      { label: 'Fresh Leads Alloted Today', value: '250 Leads' },
      { label: 'Claimed By Executives', value: '242 Leads' },
      { label: 'Uncontacted In Queue', value: '8 Leads' },
      { label: 'Average First-Dial SLA', value: '8.4 Minutes' }
    ],
    columns: ['Lead ID', 'Client Name', 'City', 'Source', 'Alloted To', 'Alloted Time', 'Status'],
    sampleData: [
      ['LD-8891', 'Naveen Jindal', 'Mumbai', 'Google Search Ads', 'Sirajul Fasal M', '09:15 AM', 'Contacted'],
      ['LD-8892', 'Pooja Hegde', 'Bangalore', 'Moneycontrol Partner', 'Golla Yugendra', '09:30 AM', 'In Progress'],
      ['LD-8893', 'Karthik Raja', 'Chennai', 'Economic Times', 'Devika B', '09:45 AM', 'Interested'],
      ['LD-8894', 'Harish Chandra', 'Delhi NCR', 'Facebook Campaign', 'Rohan Deshmukh', '10:00 AM', 'Payment Due'],
      ['LD-8895', 'Meenakshi Iyer', 'Hyderabad', 'Direct Portal Inflow', 'Ananya Sen', '10:15 AM', 'Contacted']
    ]
  },
  {
    id: 'employee-report',
    title: 'Employee',
    subtitle: 'Report',
    colorType: 'green',
    iconType: 'pencil',
    metricsSummary: [
      { label: 'Active Employees on Roster', value: '24 Staff' },
      { label: 'Present Today', value: '23 / 24' },
      { label: 'On Approved Leave', value: '1 Staff' },
      { label: 'Average Monthly Sales / Head', value: '₹52,212' }
    ],
    columns: ['Emp ID', 'Name', 'Department', 'Designation', 'Present Days', 'Monthly Sales', 'Status'],
    sampleData: [
      ['EMP-001', 'Sindhu H S', 'HR', 'Head of People & HR Operations', '22', '-', 'Active'],
      ['EMP-004', 'Vinod Kumar K J', 'Equity Research', 'VP, Equity Advisory & Markets', '22', '₹12,53,100', 'Active'],
      ['EMP-008', 'Aditya Roy', 'Equity Research', 'Senior Research Analyst', '21', '₹4,50,000', 'Active'],
      ['EMP-012', 'Sirajul Fasal M', 'Advisory Sales', 'Senior Advisory Executive', '22', '₹3,40,000', 'Active'],
      ['EMP-015', 'Golla Yugendra', 'Advisory Sales', 'Business Development Lead', '21', '₹2,85,000', 'Active']
    ]
  },
  {
    id: 'call-log-report',
    title: 'Call Log',
    subtitle: 'Report',
    colorType: 'green',
    iconType: 'pencil',
    metricsSummary: [
      { label: 'Total Calls Logged Today', value: '1,248 Dials' },
      { label: 'Connected Calls', value: '682 Connects' },
      { label: 'Total Talktime Recorded', value: '3,840 Minutes' },
      { label: 'Conversion Rate', value: '18.4%' }
    ],
    columns: ['Timestamp', 'Executive', 'Client Mobile', 'Direction', 'Duration (sec)', 'Disposition', 'Recording'],
    sampleData: [
      ['08-Sep 10:45 AM', 'Sirajul Fasal M', '8891171239', 'Outbound', '245s', 'Payment Done', 'Audio Available'],
      ['08-Sep 10:32 AM', 'Golla Yugendra', '9948527886', 'Outbound', '180s', 'Follow-up Set', 'Audio Available'],
      ['08-Sep 10:15 AM', 'Devika B', '9952011804', 'Inbound', '310s', 'Package Upgrade', 'Audio Available'],
      ['08-Sep 09:55 AM', 'Rohan Deshmukh', '9491924562', 'Outbound', '125s', 'Interested', 'Audio Available'],
      ['08-Sep 09:40 AM', 'Ananya Sen', '7904005514', 'Outbound', '90s', 'RNR', 'No Answer']
    ]
  },
  {
    id: 'source-report',
    title: 'Source',
    subtitle: 'Report',
    colorType: 'blue',
    iconType: 'tag',
    metricsSummary: [
      { label: 'Top Converting Source', value: 'Google Ads (34%)' },
      { label: 'Total Inflow Leads', value: '3,450 Leads' },
      { label: 'Cost Per Acquisition', value: '₹1,240' },
      { label: 'Total Campaign RoI', value: '4.8x' }
    ],
    columns: ['Source Channel', 'Total Inflow', 'Contacted', 'Interested', 'Sales Closed', 'Conversion %', 'Total Revenue'],
    sampleData: [
      ['Google Search Ads', '1,420', '1,380', '280', '24', '1.74%', '₹5,80,000'],
      ['Moneycontrol Sponsored', '850', '820', '160', '14', '1.70%', '₹3,25,000'],
      ['Economic Times Inflow', '480', '460', '95', '6', '1.30%', '₹1,90,000'],
      ['Organic Web Portal', '420', '410', '88', '3', '0.73%', '₹95,000'],
      ['Referral & Direct', '280', '275', '62', '5', '1.81%', '₹1,25,000']
    ]
  }
];

export const HRReportView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportCardConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');

  const renderIcon = (type: ReportCardConfig['iconType']) => {
    switch (type) {
      case 'tag':
        return <Tag size={28} strokeWidth={2.2} />;
      case 'flag':
        return <Flag size={28} strokeWidth={2.2} />;
      case 'quill':
        return <PenTool size={28} strokeWidth={2.2} />;
      case 'pencil':
      default:
        return <Edit3 size={28} strokeWidth={2.2} />;
    }
  };

  const handleDownloadCSV = (report: ReportCardConfig) => {
    const csvContent = [
      report.columns.join(','),
      ...report.sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`${report.title} ${report.subtitle} exported successfully!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Subpage Breadcrumb Strip (Direct Match to Reference Image 2) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={16} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Report</span>
          </span>
        </div>
      </div>

      {/* Page Title */}
      <h1 className="page-title-ref">Report</h1>

      {/* 8 Two-Tone Report Cards (Exact 4x2 Grid Matching Image 2) */}
      <div className="report-two-tone-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {HR_REPORT_CONFIGS.map(report => (
          <div 
            key={report.id}
            className="report-two-tone-card"
            onClick={() => setActiveReport(report)}
            title={`Click to open ${report.title} ${report.subtitle}`}
          >
            {/* Left Colored Icon Block */}
            <div className={`report-card-icon-box report-icon-${report.colorType}`}>
              {renderIcon(report.iconType)}
            </div>

            {/* Right White Content Block */}
            <div className="report-card-content-box">
              <span className="report-card-title">{report.title}</span>
              <span className="report-card-subtitle">{report.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Report Generator Modal */}
      {activeReport && (
        <div className="modal-overlay" onClick={() => setActiveReport(null)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '950px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={`report-card-icon-box report-icon-${activeReport.colorType}`} style={{ width: '42px', height: '42px', borderRadius: '8px' }}>
                  {renderIcon(activeReport.iconType)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                    {activeReport.title} {activeReport.subtitle}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Enterprise Audit & Performance Report • Live Database Sync
                  </span>
                </div>
              </div>

              <button 
                className="btn-icon" 
                onClick={() => setActiveReport(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', margin: '1.2rem 0' }}>
              {activeReport.metricsSummary.map((m, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-soft, #f8fafc)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', background: 'var(--bg-surface)', padding: '0.6rem 0.8rem', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder="Filter records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '32px', height: '34px', fontSize: '0.85rem', width: '220px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                  <select 
                    className="input-field" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ height: '34px', fontSize: '0.85rem' }}
                  >
                    <option value="Today">Today (08-Sep-2026)</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="This Month">This Month (September 2026)</option>
                    <option value="Last Month">Last Month (August 2026)</option>
                    <option value="Custom">Custom Date Range</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrint}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '34px' }}
                >
                  <Printer size={15} />
                  <span>Print</span>
                </button>

                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownloadCSV(activeReport)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '34px' }}
                >
                  <Download size={15} />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#051d33', color: '#ffffff' }}>
                    {activeReport.columns.map((col, idx) => (
                      <th key={idx} style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700 }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeReport.sampleData
                    .filter(row => 
                      searchQuery === '' || 
                      row.some(cell => String(cell).toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((row, rIdx) => (
                      <tr 
                        key={rIdx} 
                        style={{ 
                          borderBottom: '1px solid var(--border-subtle)',
                          background: rIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-soft, rgba(0,0,0,0.01))'
                        }}
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '0.65rem 0.85rem', fontSize: '0.83rem', color: 'var(--text-primary)' }}>
                            {cell === 'Success' || cell === 'Reconciled' || cell === 'Compliant' || cell === 'Active' || cell === 'Verified' ? (
                              <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                                {cell}
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Showing all <strong>{activeReport.sampleData.length}</strong> audited rows for this interval</span>
              <span>SEBI Master Circular Compliance Confirmed • Certified Sign-off</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
