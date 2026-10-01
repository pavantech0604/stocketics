import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Check, AlertCircle } from 'lucide-react';

export interface DataTableColumn {
  key: string;
  header: string;
  width?: string;
  minWidth?: string;
  sortable?: boolean;
  hideable?: boolean;
  sticky?: boolean;
  render: (row: any, index: number) => React.ReactNode;
}

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  disabled?: (row: any) => boolean;
  danger?: boolean;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  rowKey: (row: any) => string;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  rowActions?: RowAction[];
  pageSize?: number;
  pageSizeOptions?: number[];
  stickyHeader?: boolean;
  maxHeight?: string;
  onRowClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
  topBarExtra?: React.ReactNode;
}

const SkeletonCell: React.FC<{ width?: string }> = ({ width = '70%' }) => (
  <div style={{ height: 14, borderRadius: 4, background: '#e2e8f0', width, animation: 'dtShimmer 1.4s ease infinite' }} />
);

export const DataTable: React.FC<DataTableProps> = ({
  columns, data, rowKey, loading = false, error = null,
  emptyTitle = 'No records found', emptyMessage = 'Try adjusting your filters.',
  searchable = true, searchPlaceholder = 'Search...', onSearch,
  selectable = false, selectedIds, onSelectionChange,
  rowActions = [], pageSize: initPageSize = 20, pageSizeOptions = [10, 20, 50, 100],
  stickyHeader = true, maxHeight, onRowClick, rowClassName, topBarExtra
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initPageSize);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [showColPanel, setShowColPanel] = useState(false);
  const [activeActionRow, setActiveActionRow] = useState<string | null>(null);

  const visibleColumns = useMemo(() => columns.filter(c => !hiddenCols.has(c.key)), [columns, hiddenCols]);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => sortedData.slice((page - 1) * pageSize, page * pageSize), [sortedData, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleSearch = (q: string) => { setLocalSearch(q); setPage(1); onSearch?.(q); };

  const allPageSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds?.has(rowKey(r)));
  const someSelected = paginatedData.some(r => selectedIds?.has(rowKey(r)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const ids = paginatedData.map(rowKey);
    const next = new Set(selectedIds);
    if (allPageSelected) ids.forEach(id => next.delete(id));
    else ids.forEach(id => next.add(id));
    onSelectionChange(next);
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectionChange(next);
  };

  const hideableCols = columns.filter(c => c.hideable !== false);
  const totalCols = visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0);

  return (
    <>
      <style>{`
        @keyframes dtShimmer { 0%,100%{opacity:1}50%{opacity:.4} }
        .dt-row:hover { background: var(--table-row-hover) !important; }
        .dt-page-btn:hover:not(:disabled) { background: var(--bg-surface-alt) !important; }
      `}</style>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        {searchable && (
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 400 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input value={localSearch} onChange={e => handleSearch(e.target.value)} placeholder={searchPlaceholder}
              style={{ width: '100%', height: 34, paddingLeft: 32, paddingRight: 12, fontSize: 13, border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')} onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')} />
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {topBarExtra}
          {hideableCols.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowColPanel(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 34, padding: '0 12px', fontSize: 12.5, fontWeight: 600, border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Eye size={13} /> Columns
              </button>
              {showColPanel && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 50, background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 8, minWidth: 200 }}>
                  {hideableCols.map(col => (
                    <button key={col.key}
                      onClick={() => { const n = new Set(hiddenCols); n.has(col.key) ? n.delete(col.key) : n.add(col.key); setHiddenCols(n); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 8px', fontSize: 13, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--border-strong)', background: hiddenCols.has(col.key) ? 'transparent' : 'var(--stocketics-blue-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {!hiddenCols.has(col.key) && <Check size={10} color='#fff' />}
                      </span>
                      {col.header}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', overflowY: maxHeight ? 'auto' : undefined, maxHeight }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: stickyHeader ? 'sticky' : 'relative', top: 0, zIndex: 10 }}>
            <tr style={{ background: 'var(--table-header-bg)' }}>
              {selectable && (
                <th style={{ width: 44, padding: '0 16px', borderBottom: '1.5px solid var(--border-subtle)' }}>
                  <input type='checkbox' checked={allPageSelected} onChange={handleSelectAll}
                    ref={el => { if (el) el.indeterminate = someSelected && !allPageSelected; }}
                    style={{ cursor: 'pointer', accentColor: 'var(--stocketics-blue-500)' }} />
                </th>
              )}
              {visibleColumns.map(col => (
                <th key={col.key} onClick={() => col.sortable && handleSort(col.key)}
                  style={{ width: col.width, minWidth: col.minWidth || 80, padding: '10px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid var(--border-subtle)', cursor: col.sortable ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none', background: 'var(--table-header-bg)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.header}
                    {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
              {rowActions.length > 0 && <th style={{ width: 52, padding: '10px 16px', borderBottom: '1.5px solid var(--border-subtle)' }} />}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {selectable && <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}><SkeletonCell width='16px' /></td>}
                {visibleColumns.map((col, ci) => <td key={ci} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}><SkeletonCell /></td>)}
                {rowActions.length > 0 && <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}><SkeletonCell width='28px' /></td>}
              </tr>
            ))}
            {!loading && error && (
              <tr><td colSpan={totalCols} style={{ padding: '48px 24px', textAlign: 'center' }}>
                <AlertCircle size={32} color='var(--danger)' style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</p>
              </td></tr>
            )}
            {!loading && !error && paginatedData.length === 0 && (
              <tr><td colSpan={totalCols} style={{ padding: '56px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{emptyTitle}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{emptyMessage}</p>
              </td></tr>
            )}
            {!loading && !error && paginatedData.map((row, idx) => {
              const id = rowKey(row);
              const isSel = selectedIds?.has(id);
              return (
                <tr key={id} className='dt-row'
                  onClick={() => onRowClick?.(row)}
                  style={{ background: isSel ? 'rgba(2,132,199,0.05)' : 'var(--bg-surface)', cursor: onRowClick ? 'pointer' : 'default', borderBottom: '1px solid var(--border-subtle)', transition: 'background 80ms ease' }}>
                  {selectable && (
                    <td style={{ padding: '10px 16px' }} onClick={e => e.stopPropagation()}>
                      <input type='checkbox' checked={!!isSel} onChange={() => handleSelectRow(id)} style={{ cursor: 'pointer', accentColor: 'var(--stocketics-blue-500)' }} />
                    </td>
                  )}
                  {visibleColumns.map(col => (
                    <td key={col.key} style={{ padding: '10px 16px', fontSize: 13.5, color: 'var(--text-primary)', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {col.render(row, idx)}
                    </td>
                  ))}
                  {rowActions.length > 0 && (
                    <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setActiveActionRow(activeActionRow === id ? null : id)}
                          style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <MoreHorizontal size={15} />
                        </button>
                        {activeActionRow === id && (
                          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 2, zIndex: 40, background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 4, minWidth: 160 }}>
                            {rowActions.map((action, ai) => (
                              <button key={ai} disabled={action.disabled?.(row)} onClick={() => { action.onClick(row); setActiveActionRow(null); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', fontSize: 13, border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: action.disabled?.(row) ? 'not-allowed' : 'pointer', color: action.danger ? 'var(--danger)' : 'var(--text-primary)', opacity: action.disabled?.(row) ? 0.5 : 1, textAlign: 'left' }}>
                                {action.icon}{action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}><strong>{sortedData.length}</strong> records</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ fontSize: 12.5, border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '2px 6px', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}>
              {pageSizeOptions.map(s => <option key={s} value={s}>{s} per page</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className='dt-page-btn'
              style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              return (
                <button key={p} onClick={() => setPage(p)} className='dt-page-btn'
                  style={{ width: 30, height: 30, borderRadius: 6, fontSize: 12.5, fontWeight: 600, border: page === p ? '1.5px solid var(--stocketics-blue-500)' : '1px solid var(--border-subtle)', background: page === p ? 'var(--stocketics-blue-500)' : 'var(--bg-surface)', color: page === p ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className='dt-page-btn'
              style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;