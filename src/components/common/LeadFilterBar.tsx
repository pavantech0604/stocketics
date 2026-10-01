import React, { useState, useMemo } from 'react';
import { Search, X, Filter, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { AdvisoryLead } from '../../types';

export interface LeadFilterState {
  search: string;
  source: string;
  stage: string;
  response: string;
  city: string;
  serviceType: string;
  dateRange: string;
}

const INITIAL_FILTERS: LeadFilterState = {
  search: '',
  source: '',
  stage: '',
  response: '',
  city: '',
  serviceType: '',
  dateRange: '',
};

const STAGE_OPTIONS = ['New Lead', 'In Contact', 'Trial Active', 'Converted', 'Lost'];
const RESPONSE_OPTIONS = ['Fresh', 'Interested', 'Not Interested', 'Call Back', 'Busy', 'Payment', 'DND', 'No Response', 'Ringing'];
const DATE_RANGE_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

interface LeadFilterBarProps {
  leads: AdvisoryLead[];
  onFilteredLeads: (filtered: AdvisoryLead[]) => void;
  filters: LeadFilterState;
  onFiltersChange: (filters: LeadFilterState) => void;
}

export const LeadFilterBar: React.FC<LeadFilterBarProps> = ({ leads, onFilteredLeads, filters, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values for dynamic filter options
  const uniqueSources = useMemo(() => [...new Set(leads.map(l => l.source).filter(Boolean))].sort(), [leads]);
  const uniqueCities = useMemo(() => [...new Set(leads.map(l => l.city).filter(Boolean))].sort(), [leads]);
  const uniqueServices = useMemo(() => [...new Set(leads.map(l => l.serviceType).filter(Boolean))].sort(), [leads]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.source) count++;
    if (filters.stage) count++;
    if (filters.response) count++;
    if (filters.city) count++;
    if (filters.serviceType) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  const setFilter = (key: keyof LeadFilterState, value: string) => {
    const next = { ...filters, [key]: value };
    onFiltersChange(next);
    applyFilters(next);
  };

  const clearFilters = () => {
    onFiltersChange(INITIAL_FILTERS);
    applyFilters(INITIAL_FILTERS);
  };

  const removeChip = (key: keyof LeadFilterState) => {
    setFilter(key, '');
  };

  const applyFilters = (f: LeadFilterState) => {
    let result = [...leads];
    const q = f.search.toLowerCase().trim();

    if (q) {
      result = result.filter(l =>
        l.clientName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q))
      );
    }

    if (f.source) result = result.filter(l => l.source === f.source);
    if (f.stage) result = result.filter(l => l.status === f.stage);
    if (f.response) result = result.filter(l => l.response === f.response);
    if (f.city) result = result.filter(l => l.city === f.city);
    if (f.serviceType) result = result.filter(l => l.serviceType === f.serviceType);

    // Date filtering would need real date parsing - using a simple heuristic for demo
    if (f.dateRange) {
      // For demo purposes, all leads pass date filter
      // In production, would parse lastContactDate
    }

    onFilteredLeads(result);
  };

  // Apply filters on mount and when leads change
  React.useEffect(() => {
    applyFilters(filters);
  }, [leads]);

  return (
    <div className="lead-filter-bar">
      {/* Main search row */}
      <div className="lead-filter-row">
        <div className="lead-filter-search-wrap">
          <Search size={16} className="lead-filter-search-icon" />
          <input
            type="text"
            placeholder="Search leads by name, phone, email, city..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="input lead-filter-search-input"
          />
          {filters.search && (
            <button className="lead-filter-clear-btn" onClick={() => setFilter('search', '')}>
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className={`btn btn-sm lead-filter-toggle ${isExpanded ? 'active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="lead-filter-count-badge">{activeFilterCount}</span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button className="btn btn-sm btn-secondary lead-filter-reset" onClick={clearFilters}>
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="lead-filter-chips">
          {filters.source && (
            <span className="lead-filter-chip" style={{ '--chip-color': '#3b82f6' } as React.CSSProperties}>
              Source: {filters.source}
              <button onClick={() => removeChip('source')}><X size={12} /></button>
            </span>
          )}
          {filters.stage && (
            <span className="lead-filter-chip" style={{ '--chip-color': '#8b5cf6' } as React.CSSProperties}>
              Stage: {filters.stage}
              <button onClick={() => removeChip('stage')}><X size={12} /></button>
            </span>
          )}
          {filters.response && (
            <span className="lead-filter-chip" style={{ '--chip-color': '#f59e0b' } as React.CSSProperties}>
              Response: {filters.response}
              <button onClick={() => removeChip('response')}><X size={12} /></button>
            </span>
          )}
          {filters.city && (
            <span className="lead-filter-chip" style={{ '--chip-color': '#10b981' } as React.CSSProperties}>
              City: {filters.city}
              <button onClick={() => removeChip('city')}><X size={12} /></button>
            </span>
          )}
          {filters.serviceType && (
            <span className="lead-filter-chip" style={{ '--chip-color': '#0ea5e9' } as React.CSSProperties}>
              Service: {filters.serviceType}
              <button onClick={() => removeChip('serviceType')}><X size={12} /></button>
            </span>
          )}
          {filters.dateRange && (
            <span className="lead-filter-chip" style={{ '--chip-color': '#6366f1' } as React.CSSProperties}>
              Period: {DATE_RANGE_OPTIONS.find(d => d.value === filters.dateRange)?.label || filters.dateRange}
              <button onClick={() => removeChip('dateRange')}><X size={12} /></button>
            </span>
          )}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="lead-filter-expanded">
          <div className="lead-filter-grid">
            <div className="lead-filter-field">
              <label>Lead Source</label>
              <select className="input" value={filters.source} onChange={e => setFilter('source', e.target.value)}>
                <option value="">All Sources</option>
                {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="lead-filter-field">
              <label>Stage</label>
              <select className="input" value={filters.stage} onChange={e => setFilter('stage', e.target.value)}>
                <option value="">All Stages</option>
                {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="lead-filter-field">
              <label>Response</label>
              <select className="input" value={filters.response} onChange={e => setFilter('response', e.target.value)}>
                <option value="">All Responses</option>
                {RESPONSE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="lead-filter-field">
              <label>City</label>
              <select className="input" value={filters.city} onChange={e => setFilter('city', e.target.value)}>
                <option value="">All Cities</option>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="lead-filter-field">
              <label>Service Type</label>
              <select className="input" value={filters.serviceType} onChange={e => setFilter('serviceType', e.target.value)}>
                <option value="">All Services</option>
                {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="lead-filter-field">
              <label>Date Range</label>
              <select className="input" value={filters.dateRange} onChange={e => setFilter('dateRange', e.target.value)}>
                {DATE_RANGE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { INITIAL_FILTERS };
