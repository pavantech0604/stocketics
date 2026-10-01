import React, { useState } from 'react';
import { useApp } from '../../state/store';
import { AdvisoryLead, AdvisoryService, LeadStatus } from '../../types';
import * as XLSX from 'xlsx';
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
  Layers,
  Check
} from 'lucide-react';

interface BulkLeadUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Clean campaign sample leads reflecting authentic CRM columns
const MOCK_CAMPAIGN_BATCH = [
  { name: 'Gautam Singhal', phone: '+91 98112 04510', source: 'Google Ads', response: 'Interested', city: 'Delhi NCR', description: 'Requested portfolio evaluation' },
  { name: 'Dr. Ananya Mukherjee', phone: '+91 98310 99421', source: 'Meta Inbound', response: 'Call Back', city: 'Kolkata', description: 'Busy in surgery, call after 5 PM' },
  { name: 'Naveen Jindal', phone: '+91 94480 33120', source: 'D WEB KANNADA', response: 'Interested', city: 'Bengaluru', description: 'Looking for Nifty options advisory' },
  { name: 'Sunita Agarwal', phone: '+91 98290 88102', source: 'Direct Website', response: 'New Lead', city: 'Jaipur', description: 'Registered on web portal' },
  { name: 'Tariq Mansoor', phone: '+91 97110 55209', source: 'Google Ads', response: 'Interested', city: 'Mumbai', description: 'High net-worth equity trader' },
  { name: 'Kavita Pillai', phone: '+91 98450 11982', source: 'Meta Inbound', response: 'Trial Active', city: 'Kochi', description: 'Trial activated on Monday' },
  { name: 'Harpreet Singh Bindra', phone: '+91 98140 22314', source: 'D WEB KANNADA', response: 'Call Back', city: 'Chandigarh', description: 'Call back tomorrow morning' },
  { name: 'Bhavna Kothari', phone: '+91 98220 77192', source: 'Direct Website', response: 'Interested', city: 'Pune', description: 'Wants 3-month advisory tier' },
  { name: 'Devendra Parikh', phone: '+91 98250 44910', source: 'Google Ads', response: 'New Lead', city: 'Ahmedabad', description: 'Commodities and gold trader' },
  { name: 'Sujata Venkatraman', phone: '+91 94440 66120', source: 'Meta Inbound', response: 'Interested', city: 'Chennai', description: 'Experienced derivative investor' }
];

export const BulkLeadUploadModal: React.FC<BulkLeadUploadModalProps> = ({ isOpen, onClose }) => {
  const { employees, bulkAddLeads, showToast, setActiveTab, addBulkSourceLeads, leadSourcePools, advisoryLeads } = useApp();

  // Mode: Deposit into Lead Source Pool OR Directly Distribute to Advisors
  const [destinationMode, setDestinationMode] = useState<'pool' | 'direct'>('pool');
  const [selectedSource, setSelectedSource] = useState<string>('D WEB KANNADA');

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
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
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
    setFileName('Sample_Vendor_Campaign_Leads_10.xlsx');
    setDetectedHeaders(['Client Name', 'Mobile', 'Source', 'Response', 'City', 'Description']);
    showToast('Loaded 10 pre-validated campaign leads ready for segregation!', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        if (!buffer) return;

        // Parse Excel workbook (.xlsx, .xls, .csv, .tsv) via SheetJS engine
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          showToast('No sheets found in uploaded spreadsheet', 'error');
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        // Read raw rows
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        // Filter out completely empty rows
        const validRows = rawRows.filter(r => r && Array.isArray(r) && r.some(c => c !== undefined && c !== null && String(c).trim() !== ''));

        if (validRows.length === 0) {
          showToast('The uploaded sheet is completely empty.', 'warning');
          return;
        }

        // Header detection: check if first row contains column headers
        const row0Str = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const hasHeaderKeywords = row0Str.some(h => 
          h.includes('name') || h.includes('client') || h.includes('phone') || h.includes('mobile') ||
          h.includes('source') || h.includes('response') || h.includes('desc') || h.includes('city') ||
          h.includes('contact') || h.includes('owner') || h.includes('agent') || h.includes('email')
        );

        let headerRow: string[] = [];
        let dataStartIndex = 0;

        if (hasHeaderKeywords || validRows.length > 1) {
          headerRow = row0Str;
          dataStartIndex = 1;
        } else {
          // No recognizable header row, treat row 0 as data
          dataStartIndex = 0;
          headerRow = [];
        }

        const findColIdx = (testFn: (h: string) => boolean) => headerRow.findIndex(testFn);

        // 1. Client Name (exclude owner/agent/employee/tl/leader)
        let nameIdx = findColIdx(h => 
          h === 'client name' || h === 'customer name' || h === 'lead name' || h === 'prospect name' ||
          h === 'client' || h === 'customer' || h === 'prospect'
        );
        if (nameIdx === -1) {
          nameIdx = findColIdx(h => 
            h.includes('client') || h.includes('customer') || 
            (h.includes('name') && !h.includes('owner') && !h.includes('agent') && !h.includes('emp') && !h.includes('tl') && !h.includes('leader') && !h.includes('user'))
          );
        }

        // 2. Owner Name / Agent / Assigned Employee
        const ownerIdx = findColIdx(h => 
          h.includes('owner') || h.includes('agent') || h.includes('executive') || 
          h.includes('caller') || (h.includes('emp') && !h.includes('client')) || 
          h === 'tl' || h.includes('leader')
        );

        // 3. Phone / Mobile Number (explicitly EXCLUDE pincode/zip/area columns)
        let phoneIdx = findColIdx(h =>
          (h === 'mobile' || h === 'phone' || h === 'mobile no' || h === 'phone no' ||
           h === 'mobile number' || h === 'phone number' || h === 'contact number' ||
           h === 'cell' || h === 'telephone' || h === 'tel' || h === 'mob' ||
           h === 'contact no' || h === 'whatsapp' || h === 'ph no') &&
          !h.includes('pin') && !h.includes('zip') && !h.includes('postal') && !h.includes('area')
        );
        if (phoneIdx === -1) {
          // Broader match but still exclude pincode variants
          phoneIdx = findColIdx(h =>
            (h.includes('mobile') || h.includes('phone') || h.includes('contact') ||
             h.includes('cell') || h.includes('tel')) &&
            !h.includes('pin') && !h.includes('zip') && !h.includes('postal') && !h.includes('area code')
          );
        }
        // Note: intentionally NOT matching 'number' alone – too generic, matches pin/account/serial numbers

        // 4. Source
        const sourceIdx = findColIdx(h => 
          h.includes('source') || h.includes('campaign') || h.includes('vendor') || h.includes('channel')
        );

        // 5. Response / Status / Disposition
        const responseIdx = findColIdx(h => 
          h.includes('response') || h.includes('disposition') || h.includes('feedback') || 
          (h.includes('status') && !h.includes('dnd') && !h.includes('marital'))
        );

        // 6. Description / Remarks / Comments
        const descIdx = findColIdx(h => 
          h.includes('description') || h.includes('remark') || h.includes('comment') || 
          h.includes('note') || h.includes('details')
        );

        // 7. City / Location / State
        const cityIdx = findColIdx(h => 
          h.includes('city') || h.includes('location') || h.includes('state') || 
          h.includes('address') || h.includes('place') || h.includes('region')
        );

        // 8. Email Address
        const emailIdx = findColIdx(h => 
          h.includes('email') || h.includes('mail')
        );

        // 9. Service / Segment (optional - only if explicitly in sheet)
        const serviceIdx = findColIdx(h => 
          h.includes('service') || h.includes('segment') || h.includes('product') || h.includes('package')
        );

        // 10. Investment Bracket (optional - only if explicitly in sheet)
        const bracketIdx = findColIdx(h => 
          h.includes('bracket') || h.includes('capital') || h.includes('investment') || h.includes('budget')
        );

        // 11. Expected Revenue (optional - only if explicitly in sheet)
        const revenueIdx = findColIdx(h => 
          h.includes('revenue') || h.includes('expected') || h.includes('amount') || 
          h.includes('deal') || (h.includes('value') && !h.includes('service'))
        );

        // 12. Date
        const dateIdx = findColIdx(h =>
          h.includes('date') || h.includes('time') || h.includes('created') || h.includes('modified')
        );

        // 13. Pincode / ZIP (to explicitly avoid confusing with phone)
        const pincodeIdx = findColIdx(h =>
          h.includes('pin') || h.includes('zip') || h.includes('postal') || h === 'pincode' || h === 'pin code'
        );

        // Positional name fallback: use col 0 if no header matched
        const effectiveNameIdx = nameIdx !== -1 ? nameIdx : 0;

        // Phone fallback: scan data values to find a column that looks like mobile numbers
        // A valid Indian mobile: 10 digits starting 6-9, or starts with +91/0091/91
        const isMobileValue = (val: string) => {
          const digits = val.replace(/[\s\-().+]/g, '');
          // +91 prefixed 10-digit number, or 10-digit starting with 6-9
          return /^(91|0{0,2}91)?[6-9]\d{9}$/.test(digits) && digits.length >= 10;
        };

        let effectivePhoneIdx = phoneIdx !== -1 ? phoneIdx : -1;

        if (effectivePhoneIdx === -1 && validRows.length > dataStartIndex) {
          // Scan first few data rows to find column whose values look like phone numbers
          const sampleRows = validRows.slice(dataStartIndex, Math.min(dataStartIndex + 10, validRows.length));
          const colCount = Math.max(...sampleRows.map(r => r.length));
          for (let col = 0; col < colCount; col++) {
            if (col === effectiveNameIdx) continue; // skip name column
            if (col === pincodeIdx) continue;       // skip known pincode column
            const mobileHits = sampleRows.filter(r => {
              const v = String(r[col] ?? '').trim();
              return v.length >= 10 && isMobileValue(v);
            }).length;
            if (mobileHits >= Math.ceil(sampleRows.length * 0.4)) {
              effectivePhoneIdx = col;
              break;
            }
          }
        }
        // If still not found, do NOT fall back to col 1 (which could be pincode)
        // effectivePhoneIdx === -1 means no phone column found – leave phone blank

        // Collect detected header names for user clarity
        const foundHeaders: string[] = [];
        if (nameIdx !== -1) foundHeaders.push('Client Name');
        if (phoneIdx !== -1) foundHeaders.push('Mobile');
        if (sourceIdx !== -1) foundHeaders.push('Source');
        if (responseIdx !== -1) foundHeaders.push('Response');
        if (descIdx !== -1) foundHeaders.push('Description');
        if (ownerIdx !== -1) foundHeaders.push('Owner / Agent');
        if (cityIdx !== -1) foundHeaders.push('City');
        if (emailIdx !== -1) foundHeaders.push('Email');
        if (serviceIdx !== -1) foundHeaders.push('Service');
        if (bracketIdx !== -1) foundHeaders.push('Investment Bracket');
        if (revenueIdx !== -1) foundHeaders.push('Expected Value');
        setDetectedHeaders(foundHeaders);

        const parsed: any[] = [];
        for (let i = dataStartIndex; i < validRows.length; i++) {
          const row = validRows[i];
          if (!row || row.length === 0) continue;

          const clientName = String((effectiveNameIdx < row.length ? row[effectiveNameIdx] : '') ?? '').trim();
          // Only read phone if we found a valid column; otherwise leave blank
          const rawPhone = effectivePhoneIdx !== -1 && effectivePhoneIdx < row.length
            ? String(row[effectivePhoneIdx] ?? '').trim()
            : '';
          // Format phone: if it's a plain 10-digit Indian mobile, prefix +91
          const phone = (() => {
            if (!rawPhone) return '';
            const digits = rawPhone.replace(/[\s\-().]/g, '');
            if (/^[6-9]\d{9}$/.test(digits)) return `+91 ${digits.slice(0,5)} ${digits.slice(5)}`;
            if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits.slice(0,2)} ${digits.slice(2,7)} ${digits.slice(7)}`;
            return rawPhone; // return as-is if already formatted or unknown format
          })();
          const sourceVal = sourceIdx !== -1 && sourceIdx < row.length ? String(row[sourceIdx] ?? '').trim() : '';
          const responseVal = responseIdx !== -1 && responseIdx < row.length ? String(row[responseIdx] ?? '').trim() : '';
          const descVal = descIdx !== -1 && descIdx < row.length ? String(row[descIdx] ?? '').trim() : '';
          const ownerVal = ownerIdx !== -1 && ownerIdx < row.length ? String(row[ownerIdx] ?? '').trim() : '';
          const cityVal = cityIdx !== -1 && cityIdx < row.length ? String(row[cityIdx] ?? '').trim() : '';
          const emailVal = emailIdx !== -1 && emailIdx < row.length ? String(row[emailIdx] ?? '').trim() : '';
          const serviceVal = serviceIdx !== -1 && serviceIdx < row.length ? String(row[serviceIdx] ?? '').trim() : '';
          const bracketVal = bracketIdx !== -1 && bracketIdx < row.length ? String(row[bracketIdx] ?? '').trim() : '';
          
          let revenueVal = 0;
          if (revenueIdx !== -1 && revenueIdx < row.length) {
            const rawRev = row[revenueIdx];
            if (rawRev !== undefined && rawRev !== null && String(rawRev).trim() !== '') {
              revenueVal = parseInt(String(rawRev).replace(/[^0-9]/g, '')) || 0;
            }
          }

          const dateVal = dateIdx !== -1 && dateIdx < row.length ? String(row[dateIdx] ?? '').trim() : '';

          // Only keep valid rows that have client name, phone, or owner
          if (clientName || phone || ownerVal || descVal) {
            parsed.push({
              name: clientName,
              phone: phone,
              source: sourceVal || selectedSource,
              response: responseVal,
              description: descVal,
              ownerName: ownerVal,
              city: cityVal,
              email: emailVal,
              service: serviceVal,
              bracket: bracketVal,
              revenue: revenueVal,
              date: dateVal
            });
          }
        }

        if (parsed.length > 0) {
          setParsedLeads(parsed);
          const detectedSourceVal = parsed.find(p => p.source && p.source.trim())?.source;
          if (detectedSourceVal) {
            const normDet = detectedSourceVal.trim().replace(/\s+/g, ' ').toLowerCase();
            const matched = leadSourcePools.find(p => p.sourceName.trim().replace(/\s+/g, ' ').toLowerCase() === normDet);
            if (matched) {
              setSelectedSource(matched.sourceName);
            } else {
              setSelectedSource(detectedSourceVal.trim().replace(/\s+/g, ' '));
            }
          }
          showToast(`Successfully analyzed & extracted ${parsed.length} client leads from ${file.name}!`, 'success');
        } else {
          setParsedLeads(MOCK_CAMPAIGN_BATCH);
          showToast('Could not extract valid rows from file, loaded sample batch.', 'warning');
        }
      } catch (err: any) {
        console.error('Error parsing Excel sheet:', err);
        showToast('Error reading Excel file. Please ensure it is a valid .xlsx or .csv file.', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const headers = "Client Name,Mobile,Source,Response,Description,City\n";
    const rows = [
      "Sunil Singhal,+91 98201 11223,Google Ads,Interested,Requested callback for Equity,Mumbai",
      "Kavita Verma,+91 98110 44556,Meta Inbound,Call Back,Call back after 3 PM,Delhi",
      "Dr. Raghu Raman,+91 94440 77889,Referral,Interested,High net worth investor,Bengaluru"
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

  // Determine dynamically which columns have data in the parsed batch (do NOT display irrelevant empty columns)
  const hasClientName = parsedLeads.some(l => l.name && l.name.trim() !== '');
  const hasPhone = parsedLeads.some(l => l.phone && l.phone.trim() !== '');
  const hasSource = parsedLeads.some(l => l.source && l.source.trim() !== '' && l.source !== selectedSource);
  const hasResponse = parsedLeads.some(l => l.response && l.response.trim() !== '');
  const hasDescription = parsedLeads.some(l => l.description && l.description.trim() !== '');
  const hasOwner = parsedLeads.some(l => l.ownerName && l.ownerName.trim() !== '');
  const hasCity = parsedLeads.some(l => l.city && l.city.trim() !== '');
  const hasEmail = parsedLeads.some(l => l.email && l.email.trim() !== '');
  const hasService = parsedLeads.some(l => l.service && l.service.trim() !== '');
  const hasBracket = parsedLeads.some(l => l.bracket && l.bracket.trim() !== '');
  const hasRevenue = parsedLeads.some(l => l.revenue && l.revenue > 0);

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

    // --- DUPLICATE DETECTION ---
    const existingPhones = new Set(advisoryLeads.map(l => l.phone).filter(Boolean));
    const uniqueLeads = parsedLeads.filter(lead => !lead.phone || !existingPhones.has(lead.phone));
    
    const duplicatesSkipped = parsedLeads.length - uniqueLeads.length;
    
    if (uniqueLeads.length === 0) {
      showToast(`Upload cancelled. All ${parsedLeads.length} leads are duplicates of existing records.`, 'error');
      return;
    }

    if (destinationMode === 'pool') {
      const normSelected = selectedSource.trim().replace(/\s+/g, ' ').toLowerCase();
      const matchedPool = leadSourcePools.find(p => p.sourceName.trim().replace(/\s+/g, ' ').toLowerCase() === normSelected);
      const canonicalSource = matchedPool ? matchedPool.sourceName : selectedSource.trim().replace(/\s+/g, ' ');

      const sourceLeads: Partial<AdvisoryLead>[] = uniqueLeads.map((item, idx) => ({
        id: `lead-pool-${Date.now()}-${idx + 1}`,
        clientName: item.name || '',
        phone: item.phone || '',
        email: item.email || '',
        serviceType: (item.service as AdvisoryService) || 'Equity Premier',
        investmentBracket: item.bracket || '₹5 Lakhs - ₹10 Lakhs',
        status: (item.response ? 'In Contact' : 'New Lead') as LeadStatus,
        response: item.response || 'Fresh',
        description: item.description || '',
        expectedRevenue: item.revenue || 25000,
        city: item.city || '',
        source: canonicalSource,
        assignedToId: undefined,
        assignedToName: '',
        teamLeaderId: undefined,
        isTeamPool: false,
        lastContactDate: item.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }));

      addBulkSourceLeads(canonicalSource, sourceLeads.length, sourceLeads);
      sessionStorage.setItem('apex_crm_last_uploaded_source', canonicalSource);
      showToast(`Successfully deposited ${uniqueLeads.length} unique leads into "${canonicalSource}" pool! ${duplicatesSkipped > 0 ? `(Skipped ${duplicatesSkipped} duplicates)` : ''}`, 'success');
      setParsedLeads([]);
      setFileName('');
      onClose();
      setActiveTab('allot-leads');
      return;
    }

    if (activeAdvisors.length === 0) {
      showToast('Please select at least one employee to receive leads', 'error');
      return;
    }

    // Assign leads sequentially across selected employees
    const createdLeads: AdvisoryLead[] = uniqueLeads.map((item, idx) => {
      const assignedEmp = activeAdvisors[idx % activeAdvisors.length];
      const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return {
        id: `lead-${Date.now()}-${idx + 1}`,
        clientName: item.name || '',
        phone: item.phone || '',
        email: item.email || '',
        serviceType: (item.service as AdvisoryService) || '',
        investmentBracket: item.bracket || '',
        status: (item.response ? 'In Contact' : 'New Lead') as LeadStatus,
        response: item.response || '',
        description: item.description || '',
        assignedToId: assignedEmp.id,
        assignedToName: item.ownerName || assignedEmp.name,
        lastContactDate: item.date || todayStr,
        expectedRevenue: item.revenue || 0,
        city: item.city || '',
        source: item.source || selectedSource || 'Bulk Batch Import'
      };
    });

    bulkAddLeads(createdLeads);
    showToast(`Dispersed ${createdLeads.length} leads across ${activeAdvisors.length} advisors! ${duplicatesSkipped > 0 ? `(Skipped ${duplicatesSkipped} duplicates)` : ''}`, 'success');
    setParsedLeads([]);
    setFileName('');
    onClose();
    setActiveTab('view-all-leads');
  };

  return (
    <div className="tips-modal-backdrop" onClick={onClose}>
      <div className="tips-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '880px', width: '94vw' }}>
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
                Upload Excel / CSV vendor files. The engine automatically maps columns and stores data in their respective fields without inventing irrelevant columns.
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
                  <Sparkles size={13} /> Load 10 Sample Campaign Leads
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
                accept=".csv, .txt, .json, .xlsx, .xls" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stocketics-blue-600)' }}>
                <UploadCloud size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {fileName ? fileName : 'Click to select Excel (.xlsx, .xls) or CSV lead sheet or drag & drop'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Supports all vendor formats (Owner Name, Client Name, Mobile, Source, Response, City, Description, etc.)
                </div>
              </div>
              {parsedLeads.length > 0 && (
                <div className="delta-badge positive" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  ✓ {parsedLeads.length} Leads Analyzed & Ready for Distribution
                </div>
              )}
            </label>
          </div>

          {/* STEP 2: PREVIEW LEADS IN BATCH */}
          {parsedLeads.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Batch Preview (Showing first {Math.min(5, parsedLeads.length)} of {parsedLeads.length} leads):
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => { setParsedLeads([]); setFileName(''); setDetectedHeaders([]); }}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                >
                  Clear Batch
                </button>
              </div>

              {/* Detected Columns Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', padding: '6px 10px', background: 'var(--bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Columns in File:</span>
                {hasClientName && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Client Name</span>}
                {hasPhone && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Mobile</span>}
                {hasSource && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Source</span>}
                {hasResponse && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Response</span>}
                {hasDescription && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Description</span>}
                {hasOwner && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Owner</span>}
                {hasCity && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> City</span>}
                {hasEmail && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Email</span>}
                {hasService && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Service</span>}
                {hasBracket && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Bracket</span>}
                {hasRevenue && <span className="delta-badge positive" style={{ fontSize: '10.5px' }}><Check size={10} /> Expected Value</span>}
              </div>

              <div className="table-wrapper" style={{ maxHeight: '180px', overflowX: 'auto' }}>
                <table className="crm-table" style={{ fontSize: '0.8rem', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '36px' }}>#</th>
                      <th>Client Name</th>
                      <th>Mobile</th>
                      {hasSource && <th>Source</th>}
                      {hasResponse && <th>Response</th>}
                      {hasDescription && <th>Description</th>}
                      {hasOwner && <th>Owner / Agent</th>}
                      {hasCity && <th>City</th>}
                      {hasEmail && <th>Email</th>}
                      {hasService && <th>Service</th>}
                      {hasBracket && <th>Investment Bracket</th>}
                      {hasRevenue && <th>Expected Value</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedLeads.slice(0, 5).map((lead, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{lead.name || '-'}</td>
                        <td className="mono-cell">{lead.phone || '-'}</td>
                        {hasSource && <td>{lead.source || '-'}</td>}
                        {hasResponse && (
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8' }}>
                              {lead.response || '-'}
                            </span>
                          </td>
                        )}
                        {hasDescription && (
                          <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.description}>
                            {lead.description || '-'}
                          </td>
                        )}
                        {hasOwner && <td>{lead.ownerName || '-'}</td>}
                        {hasCity && <td>{lead.city || '-'}</td>}
                        {hasEmail && <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.email || '-'}</td>}
                        {hasService && <td>{lead.service || '-'}</td>}
                        {hasBracket && <td>{lead.bracket || '-'}</td>}
                        {hasRevenue && (
                          <td className="mono-cell" style={{ fontWeight: 700, color: 'var(--stocketics-blue-600)' }}>
                            {lead.revenue > 0 ? `₹${(lead.revenue / 1000).toFixed(0)}K` : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: DESTINATION MODE & ALLOCATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--stocketics-blue-500)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                Select Ingestion Destination & Distribution
              </div>

              {/* Destination Mode Switcher */}
              <div style={{ display: 'flex', background: 'var(--bg-surface-alt)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setDestinationMode('pool')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: destinationMode === 'pool' ? 700 : 500,
                    background: destinationMode === 'pool' ? '#0073b7' : 'transparent',
                    color: destinationMode === 'pool' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Deposit to Source Pool (CRM Workflow)
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationMode('direct')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: destinationMode === 'direct' ? 700 : 500,
                    background: destinationMode === 'direct' ? '#0073b7' : 'transparent',
                    color: destinationMode === 'direct' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Direct Round-Robin to Advisors
                </button>
              </div>
            </div>

            {destinationMode === 'pool' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0369a1', marginBottom: '6px' }}>
                    Select Target Lead Source Pool *:
                  </label>
                  <select
                    value={selectedSource}
                    onChange={e => setSelectedSource(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '5px',
                      border: '1.5px solid #0284c7',
                      background: '#ffffff',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  >
                    {leadSourcePools.map(pool => (
                      <option key={pool.sourceName} value={pool.sourceName}>
                        {pool.sourceName} ({pool.availableCount.toLocaleString()} Leads Available)
                      </option>
                    ))}
                    {!leadSourcePools.some(p => p.sourceName.trim().replace(/\s+/g, ' ').toLowerCase() === selectedSource.trim().replace(/\s+/g, ' ').toLowerCase()) && (
                      <option value={selectedSource}>{selectedSource} (New Detected Pool)</option>
                    )}
                  </select>
                </div>

                <div style={{ fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
                  ℹ️ <strong>CRM Lead Pipeline Integration:</strong> Uploading into <strong>{selectedSource}</strong> will increment this pool. The Floor Manager will see these leads in <strong>Configuration &gt; Allot Leads</strong> to distribute to Team Leaders, and Team Leaders will allot them directly to tele-calling executives.
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choose Advisors ({selectedEmpIds.length} Selected):</span>
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
              </>
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
              disabled={parsedLeads.length === 0 || (destinationMode === 'direct' && selectedEmpIds.length === 0)}
              onClick={handleExecuteSegregation}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: destinationMode === 'pool' ? '#0073b7' : undefined }}
            >
              <CheckCircle2 size={16} />
              <span>
                {destinationMode === 'pool' 
                  ? `Deposit ${parsedLeads.length > 0 ? `${parsedLeads.length} Leads` : ''} into Pool`
                  : `Disperse & Distribute ${parsedLeads.length > 0 ? `${parsedLeads.length} Leads` : ''}`
                }
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
