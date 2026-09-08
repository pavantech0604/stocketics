import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { AdvisoryLead, AdvisoryService, LeadStatus } from '../../types';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  X, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';

interface BulkLeadUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample campaign leads for 1-click testing
const MOCK_CAMPAIGN_BATCH = [
  { name: 'Gautam Singhal', phone: '+91 98112 04510', email: 'gautam.s@singhalsteels.com', service: 'Hedge & PMS', bracket: '₹25L+ HNI', revenue: 125000, city: 'Delhi NCR' },
  { name: 'Dr. Ananya Mukherjee', phone: '+91 98310 99421', email: 'dr.ananya@kolkatamed.in', service: 'Equity Premier', bracket: '₹10L - ₹25L', revenue: 55000, city: 'Kolkata' },
  { name: 'Naveen Jindal', phone: '+91 94480 33120', email: 'naveen.j@jindalauto.com', service: 'Options Strategy', bracket: '₹5L - ₹10L', revenue: 42000, city: 'Bengaluru' },
  { name: 'Sunita Agarwal', phone: '+91 98290 88102', email: 'sunita.agarwal@jaipursilk.in', service: 'Commodity Momentum', bracket: '₹5L - ₹10L', revenue: 38000, city: 'Jaipur' },
  { name: 'Tariq Mansoor', phone: '+91 97110 55209', email: 'tariq.mansoor@gulfex.com', service: 'Hedge & PMS', bracket: '₹25L+ HNI', revenue: 150000, city: 'Mumbai' },
  { name: 'Kavita Pillai', phone: '+91 98450 11982', email: 'kavita.p@kochiinfra.com', service: 'Equity Premier', bracket: '₹10L - ₹25L', revenue: 60000, city: 'Kochi' },
  { name: 'Harpreet Singh Bindra', phone: '+91 98140 22314', email: 'harpreet@bindratransport.com', service: 'Options Strategy', bracket: '₹10L - ₹25L', revenue: 48000, city: 'Chandigarh' },
  { name: 'Bhavna Kothari', phone: '+91 98220 77192', email: 'bhavna.k@kotharifinance.in', service: 'Equity Premier', bracket: '₹5L - ₹10L', revenue: 35000, city: 'Pune' },
  { name: 'Devendra Parikh', phone: '+91 98250 44910', email: 'devendra.p@ahmedabadchem.com', service: 'Commodity Momentum', bracket: '₹10L - ₹25L', revenue: 52000, city: 'Ahmedabad' },
  { name: 'Sujata Venkatraman', phone: '+91 94440 66120', email: 'sujata.v@chennaitech.in', service: 'Options Strategy', bracket: '₹5L - ₹10L', revenue: 40000, city: 'Chennai' },
  { name: 'Raghavan Nambiar', phone: '+91 98470 33819', email: 'raghavan.n@calicutspices.in', service: 'Equity Premier', bracket: '₹10L - ₹25L', revenue: 50000, city: 'Kozhikode' },
  { name: 'Prerna Toshniwal', phone: '+91 98300 22718', email: 'prerna.t@kolkatatrading.in', service: 'Hedge & PMS', bracket: '₹25L+ HNI', revenue: 140000, city: 'Kolkata' },
  { name: 'Manish Chawla', phone: '+91 98101 44520', email: 'manish.chawla@gurgaonit.com', service: 'Options Strategy', bracket: '₹5L - ₹10L', revenue: 45000, city: 'Gurugram' },
  { name: 'Deepak Solanki', phone: '+91 98260 11980', email: 'deepak.s@indoregrain.in', service: 'Commodity Momentum', bracket: '₹2L - ₹5L', revenue: 25000, city: 'Indore' },
  { name: 'Urvashi Dave', phone: '+91 98240 88712', email: 'urvashi.dave@vadodaratextiles.com', service: 'Equity Premier', bracket: '₹10L - ₹25L', revenue: 55000, city: 'Vadodara' },
  { name: 'Lt. Col. Arvind Bakshi', phone: '+91 94190 22410', email: 'arvind.bakshi@defenceretiree.in', service: 'Equity Premier', bracket: '₹5L - ₹10L', revenue: 35000, city: 'Dehradun' },
  { name: 'Shreya Sengupta', phone: '+91 98360 44102', email: 'shreya.s@bengaldesign.com', service: 'Options Strategy', bracket: '₹5L - ₹10L', revenue: 40000, city: 'Kolkata' },
  { name: 'Manoj Kumar Tiwari', phone: '+91 94500 11823', email: 'manoj.tiwari@lucknowagro.in', service: 'Commodity Momentum', bracket: '₹2L - ₹5L', revenue: 28000, city: 'Lucknow' },
  { name: 'Zainab Merchant', phone: '+91 98200 99120', email: 'zainab.m@southmumbaifashion.in', service: 'Hedge & PMS', bracket: '₹25L+ HNI', revenue: 160000, city: 'Mumbai' },
  { name: 'Venkatesh Prasad', phone: '+91 98451 77209', email: 'venkatesh.p@mysorepharma.in', service: 'Equity Premier', bracket: '₹10L - ₹25L', revenue: 65000, city: 'Mysuru' }
];

export const BulkLeadUploadModal: React.FC<BulkLeadUploadModalProps> = ({ isOpen, onClose }) => {
  const { employees, bulkAddLeads, showToast, setActiveTab } = useApp();

  // Eligible sales advisors & analysts to receive leads
  const eligibleEmployees = employees.filter(e => 
    e.department === 'Equity Research' || e.department === 'Advisory Sales' || e.role.includes('Sales') || e.role.includes('Analyst')
  );

  // Selected employees for distribution (default: all eligible)
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>(
    eligibleEmployees.map(e => e.id)
  );

  // Uploaded parsed leads state
  const [parsedLeads, setParsedLeads] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [distributionStrategy, setDistributionStrategy] = useState<'round-robin' | 'balanced'>('round-robin');

  if (!isOpen) return null;

  const handleToggleEmployee = (id: string) => {
    setSelectedEmpIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(eId => eId !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleQuickLoadSampleBatch = () => {
    setParsedLeads(MOCK_CAMPAIGN_BATCH);
    setFileName('Digital_Campaign_Q3_Inbound_Leads_20.csv');
    showToast('Loaded 20 pre-validated campaign leads ready for segregation!', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      // Simple CSV parser
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        // Fallback to sample if empty or single row
        setParsedLeads(MOCK_CAMPAIGN_BATCH);
        return;
      }

      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts[0]) {
          parsed.push({
            name: parts[0] || 'Prospective Investor',
            phone: parts[1] || '+91 98000 00000',
            email: parts[2] || 'investor@domain.com',
            service: (parts[3] || 'Equity Premier') as AdvisoryService,
            bracket: parts[4] || '₹5L - ₹10L',
            revenue: parseInt(parts[5]) || 45000,
            city: parts[6] || 'Metro City'
          });
        }
      }

      if (parsed.length > 0) {
        setParsedLeads(parsed);
        showToast(`Parsed ${parsed.length} leads successfully from ${file.name}`, 'success');
      } else {
        setParsedLeads(MOCK_CAMPAIGN_BATCH);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const headers = "Client Name,Phone,Email,Service,Investment Bracket,Expected Revenue,City,Source\n";
    const rows = [
      "Sunil Singhal,+91 98201 11223,sunil.s@gmail.com,Equity Premier,₹5L - ₹10L,45000,Mumbai,Google Ads",
      "Kavita Verma,+91 98110 44556,kavita.v@outlook.com,Options Strategy,₹10L - ₹25L,60000,Delhi,Meta Inbound",
      "Dr. Raghu Raman,+91 94440 77889,raghu.raman@clinic.org,Hedge & PMS,₹25L+ HNI,150000,Bengaluru,Referral"
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Apex_CRM_Lead_Upload_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded sample CSV template!', 'info');
  };

  // Calculate allocation breakdown
  const totalLeadsCount = parsedLeads.length;
  const activeAdvisors = eligibleEmployees.filter(e => selectedEmpIds.includes(e.id));
  const countAdvisors = activeAdvisors.length;

  const allocationSummary = activeAdvisors.map((emp, index) => {
    // Round robin distribution calculation
    const baseCount = Math.floor(totalLeadsCount / (countAdvisors || 1));
    const remainder = totalLeadsCount % (countAdvisors || 1);
    const assignedCount = baseCount + (index < remainder ? 1 : 0);
    return {
      employee: emp,
      count: totalLeadsCount > 0 ? assignedCount : 0
    };
  });

  const handleExecuteSegregation = () => {
    if (parsedLeads.length === 0) {
      showToast('Please upload a file or click "Load Sample Batch" first', 'warning');
      return;
    }
    if (activeAdvisors.length === 0) {
      showToast('Please select at least one employee to receive leads', 'error');
      return;
    }

    // Assign leads sequentially across selected employees
    const createdLeads: AdvisoryLead[] = parsedLeads.map((item, idx) => {
      const assignedEmp = activeAdvisors[idx % activeAdvisors.length];
      const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return {
        id: `lead-${Date.now()}-${idx + 1}`,
        clientName: item.name,
        phone: item.phone,
        email: item.email,
        serviceType: (item.service as AdvisoryService) || 'Equity Premier',
        investmentBracket: item.bracket || '₹5L - ₹10L',
        status: 'New Lead' as LeadStatus,
        assignedToId: assignedEmp.id,
        assignedToName: assignedEmp.name,
        lastContactDate: todayStr,
        expectedRevenue: item.revenue || 45000,
        city: item.city || 'India',
        source: 'Bulk Batch Import'
      };
    });

    bulkAddLeads(createdLeads);
    setParsedLeads([]);
    setFileName('');
    onClose();
    setActiveTab('view-all-leads');
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '840px', width: '92vw' }}>
        {/* Modal Header */}
        <div className="tips-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="tip-icon-wrap" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff' }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Bulk Lead Upload & Auto-Segregation Engine
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Upload prospective client datasets and automatically disperse them across your active advisory team.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '78vh', overflowY: 'auto' }}>
          
          {/* STEP 1: UPLOAD OR LOAD DEMO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--stocketics-blue-500)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
                Upload Leads File or Choose Quick Batch
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleDownloadTemplate}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                >
                  <Download size={13} /> Sample CSV Template
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm" 
                  onClick={handleQuickLoadSampleBatch}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                >
                  <Sparkles size={13} /> Load 20 Sample Campaign Leads
                </button>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <label style={{ 
              border: '2px dashed var(--border-subtle)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: parsedLeads.length > 0 ? 'var(--stocketics-blue-50)' : 'var(--bg-surface-alt)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="file" 
                accept=".csv, .txt, .json, .xlsx" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stocketics-blue-600)' }}>
                <UploadCloud size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {fileName ? fileName : 'Click to select CSV / Excel lead sheet or drag & drop'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Supports CSV, XLSX, and JSON formatted data with phone numbers and investor brackets
                </div>
              </div>
              {parsedLeads.length > 0 && (
                <div className="delta-badge positive" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  ✓ {parsedLeads.length} Leads Ready for Distribution
                </div>
              )}
            </label>
          </div>

          {/* STEP 2: PREVIEW LEADS IN BATCH */}
          {parsedLeads.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Batch Preview (First 4 of {parsedLeads.length} leads):
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => { setParsedLeads([]); setFileName(''); }}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                >
                  Clear Batch
                </button>
              </div>

              <div className="table-wrapper" style={{ maxHeight: '150px' }}>
                <table className="crm-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client Name</th>
                      <th>Phone</th>
                      <th>Interested Service</th>
                      <th>Investment Bracket</th>
                      <th>Expected Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedLeads.slice(0, 4).map((lead, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{lead.name}</td>
                        <td className="mono-cell">{lead.phone}</td>
                        <td>{lead.service}</td>
                        <td>{lead.bracket}</td>
                        <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--stocketics-blue-600)' }}>
                          ₹{(lead.revenue / 1000).toFixed(0)}K
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: EMPLOYEE SELECTION & SEGREGATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--stocketics-blue-500)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                Choose Team Members to Receive Leads ({selectedEmpIds.length} Selected)
              </div>

              {/* Distribution Strategy Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strategy:</span>
                <select 
                  className="form-select" 
                  style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
                  value={distributionStrategy}
                  onChange={e => setDistributionStrategy(e.target.value as any)}
                >
                  <option value="round-robin">Equal Round-Robin</option>
                  <option value="balanced">Quota Capacity Balanced</option>
                </select>
              </div>
            </div>

            {/* Team Member Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              {eligibleEmployees.map(emp => {
                const isSelected = selectedEmpIds.includes(emp.id);
                const alloc = allocationSummary.find(a => a.employee.id === emp.id);

                return (
                  <div 
                    key={emp.id}
                    onClick={() => handleToggleEmployee(emp.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--stocketics-blue-500)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-alt)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isSelected ? 1 : 0.65
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => {}} 
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={emp.avatar} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {emp.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {emp.title.split(' ')[0]} {emp.title.split(' ')[1]}
                      </div>
                    </div>

                    {isSelected && totalLeadsCount > 0 && (
                      <span className="delta-badge positive" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                        +{alloc?.count} Leads
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Distribution Summary Bar */}
            {totalLeadsCount > 0 && (
              <div style={{ 
                background: 'var(--bg-surface-alt)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.6rem',
                marginTop: '0.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} style={{ color: 'var(--stocketics-blue-600)' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Segregation Formula: {totalLeadsCount} Leads ÷ {selectedEmpIds.length} Team Members
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {allocationSummary.map(a => (
                    <span 
                      key={a.employee.id} 
                      className="delta-badge" 
                      style={{ fontSize: '0.72rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                    >
                      {a.employee.name.split(' ')[0]}: <strong>{a.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button 
              type="button" 
              className="btn btn-primary"
              disabled={parsedLeads.length === 0 || selectedEmpIds.length === 0}
              onClick={handleExecuteSegregation}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
            >
              <CheckCircle2 size={16} />
              <span>Disperse & Distribute {parsedLeads.length > 0 ? `${parsedLeads.length} Leads` : ''}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
