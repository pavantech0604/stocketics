import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { 
  Home, 
  Tag, 
  Flag, 
  Edit3, 
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
  ArrowUpDown
} from 'lucide-react';
import { TipsModal } from '../common/TipsModal';

interface ReportCardConfig {
  id: string;
  title: string;
  subtitle: string;
  colorType: 'blue' | 'green';
  iconType: 'tag' | 'flag' | 'pencil';
  metricsSummary: { label: string; value: string }[];
  columns: string[];
  sampleData: (string | number)[][];
}

const REPORT_CONFIGS: ReportCardConfig[] = [
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
      ['08-Sep-2026', 'Rajesh K. Singhania', '9820100401', 'INDEX OPTION', 'Rohan Deshmukh', '45,000', 'Success'],
      ['08-Sep-2026', 'Dr. Harshvardhan Jain', '9425000402', 'INDEX OPTION', 'Sneha Kapur', '35,000', 'Success'],
      ['07-Sep-2026', 'Col. Vikram Rathore', '9414000405', 'INDEX OPTION', 'Neha Reddy', '60,000', 'Success'],
      ['07-Sep-2026', 'Kavita Radhakrishnan', '9847000403', 'Market Pathshala', 'Kabir Varma', '25,000', 'Success'],
      ['06-Sep-2026', 'Manish Chawla', '9912000404', 'EQUITY PREMIER', 'Rohan Deshmukh', '90,000', 'Success'],
      ['05-Sep-2026', 'Meenakshi Sundaram', '9444000407', 'FUTURE & OPTIONS', 'Ananya Sen', '1,20,000', 'Success'],
      ['04-Sep-2026', 'Vikramaditya Oberoi', '9810000409', 'HEDGE & PMS', 'Aditya Roy', '1,50,000', 'Success']
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
      { label: 'EOD Target Realization', value: '131.25%' },
      { label: 'Active Desks Today', value: '14 Advisors' }
    ],
    columns: ['Executive', 'Calls Made', 'Connects', 'Talktime (min)', 'Interested', 'Sales (₹)', 'Target %'],
    sampleData: [
      ['Rohan Deshmukh', '84', '42', '148', '6', '45,000', '112%'],
      ['Sneha Kapur', '92', '51', '162', '8', '35,000', '100%'],
      ['Neha Reddy', '78', '38', '135', '5', '60,000', '150%'],
      ['Kabir Varma', '95', '55', '180', '9', '25,000', '85%'],
      ['Ananya Sen', '81', '44', '152', '7', '0', '0%']
    ]
  },
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
      ['LD-8891', 'Siddharth Varma', 'Mumbai', 'Google Search Ads', 'Rohan Deshmukh', '09:15 AM', 'Contacted'],
      ['LD-8892', 'Pooja Hegde', 'Bangalore', 'Moneycontrol Partner', 'Sneha Kapur', '09:30 AM', 'In Progress'],
      ['LD-8893', 'Karthik Raja', 'Chennai', 'Economic Times', 'Neha Reddy', '09:45 AM', 'Interested'],
      ['LD-8894', 'Harish Chandra', 'Delhi NCR', 'Facebook Campaign', 'Kabir Varma', '10:00 AM', 'Payment Due'],
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
      { label: 'Total Research & Sales Staff', value: '18 Active' },
      { label: 'On-Duty Terminal Logins', value: '16 Online' },
      { label: 'On Approved Leave', value: '2 Staff' },
      { label: 'Average Monthly Revenue/Staff', value: '₹1,42,000' }
    ],
    columns: ['Emp ID', 'Staff Name', 'Designation', 'Desk', 'Monthly Sales (₹)', 'Lead Conversion', 'Attendance'],
    sampleData: [
      ['STK-001', 'Arjun Malhotra', 'VP & Head of Desk', 'Management', '₹12,53,100 (Team)', '28.4%', 'Present'],
      ['STK-004', 'Rohan Deshmukh', 'Senior Equity Advisor', 'Advisory', '₹3,45,000', '18.2%', 'Present'],
      ['STK-005', 'Sneha Kapur', 'Senior Equity Advisor', 'Advisory', '₹3,10,000', '16.5%', 'Present'],
      ['STK-006', 'Neha Reddy', 'Equity Advisory Specialist', 'Commodities', '₹2,95,000', '15.8%', 'Present'],
      ['STK-008', 'Kabir Varma', 'Research Associate', 'Derivatives', '₹1,85,000', '14.1%', 'Present'],
      ['STK-009', 'Ananya Sen', 'Research Associate', 'Options', '₹1,18,100', '12.4%', 'Present']
    ]
  },
  {
    id: 'call-log-report',
    title: 'Call Log',
    subtitle: 'Report',
    colorType: 'green',
    iconType: 'pencil',
    metricsSummary: [
      { label: 'Total Calls Logged Today', value: '486 Calls' },
      { label: 'Connected / Answered', value: '318 Calls' },
      { label: 'Total Talktime Logged', value: '14.2 Hours' },
      { label: 'Quality Audit Compliance', value: '98.5%' }
    ],
    columns: ['Call Time', 'Staff Name', 'Client Phone', 'Duration', 'Disposition', 'Call Recording', 'Notes'],
    sampleData: [
      ['02:45 PM', 'Rohan Deshmukh', '+91 98201 00401', '04m 18s', 'Interested - Trial', 'Available', 'Requested NIFTY option levels'],
      ['02:30 PM', 'Sneha Kapur', '+91 94250 00402', '06m 42s', 'Payment Link Sent', 'Available', 'Wants UPI payment link for 3m'],
      ['02:15 PM', 'Neha Reddy', '+91 94140 00405', '03m 10s', 'Follow-up Tomorrow', 'Available', 'In office meeting, call at 10 AM'],
      ['01:50 PM', 'Kabir Varma', '+91 98470 00403', '05m 22s', 'Subscribed', 'Available', 'Completed onboarding KYC'],
      ['01:20 PM', 'Ananya Sen', '+91 94440 00407', '02m 05s', 'RNR (Ringing No Reply)', 'Not Connected', 'Dialled twice, retry 4 PM']
    ]
  },
  {
    id: 'source-report',
    title: 'Source',
    subtitle: 'Report',
    colorType: 'blue',
    iconType: 'tag',
    metricsSummary: [
      { label: 'Primary Lead Source', value: 'Google Ads (42%)' },
      { label: 'Highest ROI Source', value: 'Moneycontrol (28%)' },
      { label: 'Cost Per Acquisition', value: '₹1,450 / Client' },
      { label: 'Organic Inflow', value: '18% Total Volume' }
    ],
    columns: ['Source Channel', 'Total Leads', 'Contacted', 'Interested', 'Paid Clients', 'Revenue (₹)', 'Conversion %'],
    sampleData: [
      ['Google Search Ads', '4,210', '3,950', '580', '142', '₹5,40,000', '3.37%'],
      ['Moneycontrol Finance Partner', '2,840', '2,710', '410', '118', '₹4,10,000', '4.15%'],
      ['Economic Times Inflow', '1,650', '1,590', '215', '54', '₹1,85,000', '3.27%'],
      ['Facebook & Instagram Ads', '1,120', '1,040', '95', '22', '₹75,000', '1.96%'],
      ['Direct Stocketics Website', '632', '620', '85', '28', '₹95,000', '4.43%']
    ]
  }
];

export const ManagerReportView: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [activeReportModal, setActiveReportModal] = useState<ReportCardConfig | null>(null);
  const [dateFilter, setDateFilter] = useState('This Month');
  const [searchTerm, setSearchTerm] = useState('');

  const renderIcon = (type: 'tag' | 'flag' | 'pencil') => {
    switch (type) {
      case 'tag':
        return <Tag size={28} color="#ffffff" strokeWidth={2} />;
      case 'flag':
        return <Flag size={28} color="#ffffff" strokeWidth={2} />;
      case 'pencil':
        return <Edit3 size={28} color="#ffffff" strokeWidth={2} />;
    }
  };

  const handleExportCSV = (report: ReportCardConfig) => {
    const csvRows = [
      report.columns.join(','),
      ...report.sampleData.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Exported ${report.title} ${report.subtitle} to CSV successfully!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb Strip (Matching Reference Image 2) */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <Home size={15} />
            <span style={{ color: '#ea580c', fontWeight: 600 }}>/ Report</span>
          </span>
        </div>
      </div>

      {/* Page Title */}
      <h1 className="page-title-ref">Report</h1>

      {/* 6 Two-Tone Report Cards Grid (Exact match to Reference Image 2) */}
      <div className="report-two-tone-grid">
        {REPORT_CONFIGS.map(card => {
          const isBlue = card.colorType === 'blue';
          const iconBgColor = isBlue ? '#0099ff' : '#4caf50';

          return (
            <div 
              key={card.id}
              className="report-two-tone-card"
              onClick={() => setActiveReportModal(card)}
              title={`Click to open full interactive ${card.title} ${card.subtitle}`}
            >
              {/* Left Solid Color Icon Block */}
              <div 
                className="report-card-icon-box"
                style={{ backgroundColor: iconBgColor }}
              >
                {renderIcon(card.iconType)}
              </div>

              {/* Right White Content Block */}
              <div className="report-card-text-box">
                <div className="report-card-title">{card.title}</div>
                <div className="report-card-subtitle">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />

      {/* Interactive Report Viewer Modal */}
      {activeReportModal && (
        <div className="tips-modal-backdrop" onClick={() => setActiveReportModal(null)}>
          <div 
            className="tips-modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '980px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div className="tips-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div 
                  style={{ 
                    width: 42, 
                    height: 42, 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: activeReportModal.colorType === 'blue' ? '#0099ff' : '#4caf50' 
                  }}
                >
                  {renderIcon(activeReportModal.iconType)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {activeReportModal.title} {activeReportModal.subtitle}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    Stocketics Institutional Advisory Analytics • Real-Time Database Snapshot
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleExportCSV(activeReportModal)}
                  title="Download as CSV"
                >
                  <Download size={14} />
                  <span>CSV</span>
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrint}
                  title="Print Report"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setActiveReportModal(null)}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Summary KPIs Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                {activeReportModal.metricsSummary.map((m, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '0.85rem 1rem', 
                      background: 'var(--bg-surface-alt)', 
                      borderRadius: 8, 
                      border: '1px solid var(--border-subtle)' 
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} color="var(--text-muted)" />
                  <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="form-select"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                  >
                    <option value="Today">Today (08-Sep-2026)</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="This Month">This Month (September 2026)</option>
                    <option value="Previous Month">Previous Month (August 2026)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '320px' }}>
                  <div className="sidebar-search-box" style={{ width: '100%', margin: 0 }}>
                    <input 
                      type="text"
                      placeholder="Filter records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)' }}>
                      {activeReportModal.columns.map((col, idx) => (
                        <th key={idx} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeReportModal.sampleData
                      .filter(row => row.some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase())))
                      .map((row, rIdx) => (
                        <tr 
                          key={rIdx} 
                          style={{ 
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background 0.12s ease'
                          }}
                          className="table-row-hover"
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                              {String(cell) === 'Success' ? (
                                <span style={{ padding: '2px 8px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}>
                                  Success
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

              {/* Footer Close */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveReportModal(null)}>
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
