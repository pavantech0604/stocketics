import React, { useState, useMemo } from 'react';
import { useApp } from '../../state/store';
import { 
  Tag, 
  Flag, 
  Edit3, 
  PenTool,
  Printer, 
  Calendar, 
  Search,
  ArrowLeft,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  PhoneCall,
  Share2,
  RotateCcw
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
  // Format: [dateOffsetDays, ...cells]
  rows: {
    offsetDays: number; // 0 = today, 1 = yesterday, etc.
    cells: (string | number)[];
  }[];
}

const formatDateWithOffset = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
};

const getReportConfigs = (): ReportCardConfig[] => {
  const today = formatDateWithOffset(0);
  const yesterday = formatDateWithOffset(1);
  const day2 = formatDateWithOffset(2);
  const day3 = formatDateWithOffset(3);
  const day5 = formatDateWithOffset(5);
  const day12 = formatDateWithOffset(12);

  return [
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
      rows: [
        { offsetDays: 0, cells: [today, 'Rajesh K. Singhania', '9820100401', 'INDEX OPTION', 'Rohan Deshmukh', '45,000', 'Success'] },
        { offsetDays: 0, cells: [today, 'Dr. Harshvardhan Jain', '9425000402', 'INDEX OPTION', 'Sneha Kapur', '35,000', 'Success'] },
        { offsetDays: 1, cells: [yesterday, 'Col. Vikram Rathore', '9414000405', 'INDEX OPTION', 'Neha Reddy', '60,000', 'Success'] },
        { offsetDays: 1, cells: [yesterday, 'Kavita Radhakrishnan', '9847000403', 'Market Pathshala', 'Kabir Varma', '25,000', 'Success'] },
        { offsetDays: 3, cells: [day3, 'Manish Chawla', '9912000404', 'EQUITY PREMIER', 'Rohan Deshmukh', '90,000', 'Success'] },
        { offsetDays: 5, cells: [day5, 'Meenakshi Sundaram', '9444000407', 'FUTURE & OPTIONS', 'Ananya Sen', '1,20,000', 'Success'] },
        { offsetDays: 12, cells: [day12, 'Arvind Kejriwal', '9811000408', 'INDEX OPTION', 'Aditya Roy', '30,000', 'Success'] }
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
      rows: [
        { offsetDays: 0, cells: ['TXN-9011', 'Rajesh K. Singhania', 'NEFT', 'HDFC Bank - 0021', 'HDFCN26090881', '45,000', 'Reconciled'] },
        { offsetDays: 0, cells: ['TXN-9012', 'Dr. Harshvardhan Jain', 'UPI / QR', 'ICICI Bank - 4410', 'UPI-260908129', '35,000', 'Reconciled'] },
        { offsetDays: 1, cells: ['TXN-9013', 'Col. Vikram Rathore', 'NetBanking', 'HDFC Bank - 0021', 'HDFCN26090714', '60,000', 'Reconciled'] },
        { offsetDays: 2, cells: ['TXN-9014', 'Kavita Radhakrishnan', 'Credit Card', 'Razorpay Route', 'RZP-881923019', '25,000', 'Verified'] },
        { offsetDays: 5, cells: ['TXN-9015', 'Manish Chawla', 'RTGS', 'Axis Bank - 9912', 'AXISRTGS260906', '90,000', 'Reconciled'] }
      ]
    },
    {
      id: 'cr-compliance',
      title: 'CR',
      subtitle: 'Compliance',
      colorType: 'olive',
      iconType: 'quill',
      metricsSummary: [
        { label: 'Advisory Compliance Score', value: '99.4%' },
        { label: 'Risk Profiling Complete', value: '100%' },
        { label: 'KYC Document Vaulted', value: '48 / 48' },
        { label: 'Agreement Consent Signed', value: '100%' }
      ],
      columns: ['Client Name', 'PAN Number', 'Risk Category', 'Aadhaar e-Sign', 'Mandate Date', 'Reg ID', 'Audit Clearance'],
      rows: [
        { offsetDays: 0, cells: ['Rajesh K. Singhania', 'AAACS1024K', 'High Growth', 'Verified', today, 'INA000012345', 'Compliant'] },
        { offsetDays: 0, cells: ['Dr. Harshvardhan Jain', 'BKMPM3412E', 'Moderate Aggressive', 'Verified', today, 'INA000012345', 'Compliant'] },
        { offsetDays: 1, cells: ['Col. Vikram Rathore', 'ALOPR7741F', 'High Growth', 'Verified', yesterday, 'INA000012345', 'Compliant'] },
        { offsetDays: 2, cells: ['Kavita Radhakrishnan', 'BFFPR4419M', 'Conservative', 'Verified', day2, 'INA000012345', 'Compliant'] },
        { offsetDays: 5, cells: ['Manish Chawla', 'AVBPD5521H', 'High Growth', 'Verified', day5, 'INA000012345', 'Compliant'] }
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
      rows: [
        { offsetDays: 0, cells: ['Rohan Deshmukh', '84', '42', '148', '6', '45,000', '112%'] },
        { offsetDays: 0, cells: ['Sneha Kapur', '92', '51', '162', '8', '35,000', '100%'] },
        { offsetDays: 0, cells: ['Neha Reddy', '78', '38', '135', '5', '60,000', '150%'] },
        { offsetDays: 1, cells: ['Kabir Varma', '95', '55', '180', '9', '25,000', '85%'] },
        { offsetDays: 1, cells: ['Ananya Sen', '81', '44', '152', '7', '0', '0%'] }
      ]
    },
    {
      id: 'alloted-lead-report',
      title: 'Allotted Lead',
      subtitle: 'Report',
      colorType: 'green',
      iconType: 'pencil',
      metricsSummary: [
        { label: 'Fresh Leads Allotted Today', value: '250 Leads' },
        { label: 'Claimed By Executives', value: '242 Leads' },
        { label: 'Uncontacted In Queue', value: '8 Leads' },
        { label: 'Average First-Dial SLA', value: '8.4 Minutes' }
      ],
      columns: ['Lead ID', 'Client Name', 'City', 'Source', 'Allotted To', 'Allotted Time', 'Status'],
      rows: [
        { offsetDays: 0, cells: ['LD-8891', 'Siddharth Varma', 'Mumbai', 'Google Search Ads', 'Rohan Deshmukh', '09:15 AM', 'Contacted'] },
        { offsetDays: 0, cells: ['LD-8892', 'Pooja Hegde', 'Bangalore', 'Moneycontrol Partner', 'Sneha Kapur', '09:30 AM', 'In Progress'] },
        { offsetDays: 1, cells: ['LD-8893', 'Karthik Raja', 'Chennai', 'Economic Times', 'Neha Reddy', '09:45 AM', 'Interested'] },
        { offsetDays: 1, cells: ['LD-8894', 'Harish Chandra', 'Delhi NCR', 'Facebook Campaign', 'Kabir Varma', '10:00 AM', 'Payment Due'] },
        { offsetDays: 3, cells: ['LD-8895', 'Gaurav Sethi', 'Pune', 'Organic Search', 'Ananya Sen', '11:15 AM', 'Contacted'] }
      ]
    },
    {
      id: 'employee-report',
      title: 'Employee',
      subtitle: 'Report',
      colorType: 'blue',
      iconType: 'tag',
      metricsSummary: [
        { label: 'Total Active Staff', value: '28 Staff' },
        { label: 'Advisory Sales Reps', value: '16 Execs' },
        { label: 'Research & Analysts', value: '6 Team' },
        { label: 'Average Performance Score', value: '92.4%' }
      ],
      columns: ['Employee ID', 'Name', 'Department', 'Role', 'Monthly Target', 'MTD Booking', 'Attendance Rate'],
      rows: [
        { offsetDays: 0, cells: ['EMP-014', 'Rohan Deshmukh', 'Advisory Sales', 'Senior Advisory Specialist', '₹3,00,000', '₹3,35,000', '98%'] },
        { offsetDays: 0, cells: ['EMP-018', 'Sneha Kapur', 'Derivatives Desk', 'Options Research Strategist', '₹2,50,000', '₹2,65,000', '100%'] },
        { offsetDays: 1, cells: ['EMP-021', 'Neha Reddy', 'Advisory Sales', 'Relationship Manager', '₹2,50,000', '₹2,90,000', '96%'] },
        { offsetDays: 2, cells: ['EMP-025', 'Kabir Varma', 'Advisory Sales', 'Equity Advisor', '₹2,00,000', '₹1,75,000', '92%'] },
        { offsetDays: 5, cells: ['EMP-029', 'Ananya Sen', 'Institutional Sales', 'Associate Specialist', '₹1,80,000', '₹1,40,000', '95%'] }
      ]
    },
    {
      id: 'call-log-report',
      title: 'Call Log',
      subtitle: 'Report',
      colorType: 'olive',
      iconType: 'quill',
      metricsSummary: [
        { label: 'Total Calls Logged', value: '1,420 Calls' },
        { label: 'Connected Calls', value: '980 Connected' },
        { label: 'Total Calling Talktime', value: '3,840 Mins' },
        { label: 'Conversion Connect Ratio', value: '69.01%' }
      ],
      columns: ['Call ID', 'Executive', 'Client Name', 'Phone', 'Duration', 'Disposition', 'Recorded Audio'],
      rows: [
        { offsetDays: 0, cells: ['CAL-9912', 'Rohan Deshmukh', 'Rajesh K. Singhania', '9820100401', '4m 12s', 'Sale Closed', 'Available'] },
        { offsetDays: 0, cells: ['CAL-9913', 'Sneha Kapur', 'Dr. Harshvardhan Jain', '9425000402', '5m 45s', 'Payment Link Sent', 'Available'] },
        { offsetDays: 1, cells: ['CAL-9914', 'Neha Reddy', 'Col. Vikram Rathore', '9414000405', '3m 20s', 'Follow-up Scheduled', 'Available'] },
        { offsetDays: 1, cells: ['CAL-9915', 'Kabir Varma', 'Kavita Radhakrishnan', '9847000403', '6m 10s', 'Sale Closed', 'Available'] },
        { offsetDays: 4, cells: ['CAL-9916', 'Ananya Sen', 'Manish Chawla', '9912000404', '2m 15s', 'Ringing / No Answer', 'None'] }
      ]
    },
    {
      id: 'source-report',
      title: 'Source',
      subtitle: 'Report',
      colorType: 'green',
      iconType: 'pencil',
      metricsSummary: [
        { label: 'Top Inflow Channel', value: 'Google Search Ads' },
        { label: 'Overall Source ROI', value: '4.8x Return' },
        { label: 'Total Paid Clicks', value: '3,050 Inflows' },
        { label: 'Average Cost Per Lead', value: '₹145 / Lead' }
      ],
      columns: ['Lead Source Channel', 'Total Inflows', 'Connects', 'Interested', 'Conversions', 'Conv. Rate', 'Revenue Generated'],
      rows: [
        { offsetDays: 0, cells: ['Google Search Ads', '1,420', '1,380', '280', '24', '1.74%', '₹5,80,000'] },
        { offsetDays: 0, cells: ['Moneycontrol Sponsored', '850', '820', '160', '14', '1.70%', '₹3,25,000'] },
        { offsetDays: 1, cells: ['Economic Times Inflow', '480', '460', '95', '6', '1.30%', '₹1,90,000'] },
        { offsetDays: 2, cells: ['Organic Web Portal', '420', '410', '88', '3', '0.73%', '₹95,000'] },
        { offsetDays: 5, cells: ['Referral & Direct', '280', '275', '62', '5', '1.81%', '₹1,25,000'] }
      ]
    }
  ];
};

export const HRReportView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('month');

  const reportConfigs = useMemo(() => getReportConfigs(), []);
  const activeReport = useMemo(() => 
    reportConfigs.find(r => r.id === selectedReportId) || null,
    [reportConfigs, selectedReportId]
  );

  const todayStr = useMemo(() => formatDateWithOffset(0), []);
  const yesterdayStr = useMemo(() => formatDateWithOffset(1), []);
  const currentMonthStr = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, []);

  const renderIcon = (type: ReportCardConfig['iconType']) => {
    switch (type) {
      case 'tag':
        return <Tag size={24} color="#ffffff" strokeWidth={2.2} />;
      case 'flag':
        return <Flag size={24} color="#ffffff" strokeWidth={2.2} />;
      case 'quill':
        return <PenTool size={24} color="#ffffff" strokeWidth={2.2} />;
      case 'pencil':
      default:
        return <Edit3 size={24} color="#ffffff" strokeWidth={2.2} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Real filtered rows calculation based on actual period & search!
  const filteredRows = useMemo(() => {
    if (!activeReport) return [];

    return activeReport.rows.filter(item => {
      // Period filter
      if (periodFilter === 'today' && item.offsetDays !== 0) return false;
      if (periodFilter === 'yesterday' && item.offsetDays !== 1) return false;
      if (periodFilter === 'week' && item.offsetDays > 7) return false;
      if (periodFilter === 'month' && item.offsetDays > 30) return false;

      // Text search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches = item.cells.some(cell => String(cell).toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [activeReport, periodFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb Strip */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span 
            style={{ color: activeReport ? 'var(--text-secondary)' : 'var(--stocketics-blue-500)', cursor: activeReport ? 'pointer' : 'default', fontWeight: activeReport ? 500 : 700 }}
            onClick={() => setSelectedReportId(null)}
          >
            Reports
          </span>
          {activeReport && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
                {activeReport.title} {activeReport.subtitle}
              </span>
            </>
          )}
        </div>
      </div>

      {/* OVERVIEW MODE: 8 Two-Tone Cards Grid */}
      {!activeReport && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title-ref" style={{ margin: 0 }}>Reports</h1>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Operational intelligence, sales EOD audits, compliance rosters, and channel analytics.
              </p>
            </div>
          </div>

          <div className="report-two-tone-grid">
            {reportConfigs.map(report => (
              <div 
                key={report.id}
                className="report-two-tone-card"
                onClick={() => setSelectedReportId(report.id)}
                title={`Open focused workspace for ${report.title} ${report.subtitle}`}
                style={{ cursor: 'pointer' }}
              >
                {/* Left Colored Icon Block */}
                <div className={`report-card-icon-box report-icon-${report.colorType}`}>
                  {renderIcon(report.iconType)}
                </div>

                {/* Right Content Block */}
                <div className="report-card-text-box">
                  <div className="report-card-title">{report.title}</div>
                  <div className="report-card-subtitle">{report.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FOCUSED REPORT WORKSPACE MODE (Replaces entire viewport area with clean Report Workspace!) */}
      {activeReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Focused Header with Back navigation & Quick Report Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedReportId(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', height: '36px', borderRadius: '6px' }}
              >
                <ArrowLeft size={15} />
                <span>All Reports</span>
              </button>

              <div>
                <h1 className="page-title-ref" style={{ margin: 0, fontSize: '1.4rem' }}>
                  {activeReport.title} {activeReport.subtitle}
                </h1>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Institutional audit ledger and operational analytics
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handlePrint}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '36px' }}
              >
                <Printer size={15} />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Quick Report Switcher Pill Bar */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {reportConfigs.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedReportId(r.id)}
                className={`btn btn-sm ${r.id === activeReport.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  borderRadius: '20px', 
                  fontSize: '0.78rem', 
                  padding: '0.3rem 0.85rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {r.title} {r.subtitle}
              </button>
            ))}
          </div>

          {/* Metrics Summary Ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {activeReport.metricsSummary.map((m, idx) => (
              <div 
                key={idx}
                className="card"
                style={{ padding: '0.85rem 1.15rem' }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Real Filter Toolbar */}
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder={`Search within ${activeReport.title} records...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', height: '36px', fontSize: '0.84rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                  <select 
                    className="form-select" 
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value as any)}
                    style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
                  >
                    <option value="today">Today ({todayStr})</option>
                    <option value="yesterday">Yesterday ({yesterdayStr})</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">This Month ({currentMonthStr})</option>
                    <option value="all">All Available Records</option>
                  </select>
                </div>

                {(searchQuery !== '' || periodFilter !== 'month') && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setSearchQuery(''); setPeriodFilter('month'); }}
                    style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredRows.length}</strong> matching rows
              </div>
            </div>
          </div>

          {/* Interactive Data Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {activeReport.columns.map((col, idx) => (
                      <th key={idx} style={{ padding: '0.85rem 1rem' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={activeReport.columns.length} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No records match the selected date interval ({periodFilter}) or search keywords.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((rowItem, rIdx) => (
                      <tr 
                        key={rIdx} 
                        style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                      >
                        {rowItem.cells.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>
                            {cell === 'Success' || cell === 'Reconciled' || cell === 'Compliant' || cell === 'Active' || cell === 'Verified' ? (
                              <span className="delta-badge positive" style={{ fontSize: '0.72rem' }}>
                                {cell}
                              </span>
                            ) : cell === 'In Progress' || cell === 'Payment Due' ? (
                              <span className="delta-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', fontSize: '0.72rem' }}>
                                {cell}
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Authentic, Honest Footer Metadata */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Showing <strong>{filteredRows.length}</strong> audited records for period: <strong>{periodFilter}</strong></span>
              <span>Stocketics Internal Analytics Ledger • Generated on {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Tips Modal */}
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
};
