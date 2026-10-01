import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Laptop, 
  Plus, 
  Search, 
  UserCheck, 
  RotateCcw, 
  Shield, 
  HardDrive,
  Filter,
  X,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface AssetProduct {
  id: string;
  serialNumber: string;
  productName: string;
  category: 'Laptop' | 'Monitor' | 'Headset' | 'Biometric' | 'Accessories';
  brandModel: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: 'In Stock' | 'Allotted' | 'Damaged';
  allotedTo?: string;
  allotmentDate?: string;
}

const INITIAL_ASSETS: AssetProduct[] = [
  {
    id: 'ast-1',
    serialNumber: 'DELL-LT-9012',
    productName: 'Dell Latitude 5440 i7 16GB',
    category: 'Laptop',
    brandModel: 'Dell Latitude 5440',
    purchaseDate: '15-Jan-2025',
    warrantyExpiry: '15-Jan-2028',
    status: 'Allotted',
    allotedTo: 'Sneha Kapur (Derivatives)',
    allotmentDate: '20-Jan-2025'
  },
  {
    id: 'ast-2',
    serialNumber: 'HP-EL-8831',
    productName: 'HP EliteBook 840 G10 i7',
    category: 'Laptop',
    brandModel: 'HP EliteBook 840',
    purchaseDate: '10-Feb-2025',
    warrantyExpiry: '10-Feb-2028',
    status: 'Allotted',
    allotedTo: 'Rohan Deshmukh (Sales)',
    allotmentDate: '15-Feb-2025'
  },
  {
    id: 'ast-3',
    serialNumber: 'LG-MON-4410',
    productName: 'LG 27" Dual-Monitor Trading Setup',
    category: 'Monitor',
    brandModel: 'LG UltraGear 27GN750',
    purchaseDate: '01-Apr-2025',
    warrantyExpiry: '01-Apr-2028',
    status: 'Allotted',
    allotedTo: 'Aditya Roy (Analyst)',
    allotmentDate: '05-Apr-2025'
  },
  {
    id: 'ast-4',
    serialNumber: 'JAB-HSET-1102',
    productName: 'Jabra Evolve 40 Noise-Canceling Headset',
    category: 'Headset',
    brandModel: 'Jabra Evolve 40 Stereo',
    purchaseDate: '12-May-2025',
    warrantyExpiry: '12-May-2027',
    status: 'In Stock'
  },
  {
    id: 'ast-5',
    serialNumber: 'BIO-SEC-0921',
    productName: 'ZKTeco Biometric Optical Fingerprint Terminal',
    category: 'Biometric',
    brandModel: 'ZKTeco SilkID F22',
    purchaseDate: '10-Nov-2024',
    warrantyExpiry: '10-Nov-2027',
    status: 'In Stock'
  }
];

export const HRAssetsView: React.FC = () => {
  const { activeTab, setActiveTab, showToast } = useApp();

  const [currentTab, setCurrentTab] = useState<'all' | 'allotted' | 'instock'>('all');
  const [assets, setAssets] = useState<AssetProduct[]>(INITIAL_ASSETS);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllotModal, setShowAllotModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    serialNumber: '',
    productName: '',
    category: 'Laptop' as AssetProduct['category'],
    brandModel: '',
    warrantyExpiry: '2028-09-08'
  });

  // Allot Product Form
  const [allotData, setAllotData] = useState({
    assetId: 'ast-4',
    employeeName: 'Ananya Sen (Advisory Sales)',
    notes: 'Allocated for dialer and institutional CRM'
  });

  useEffect(() => {
    if (activeTab === 'assets-add-product') {
      setShowAddModal(true);
    } else if (activeTab === 'assets-allot-product') {
      setShowAllotModal(true);
    } else if (activeTab === 'assets-alloted-list') {
      setCurrentTab('allotted');
    } else {
      setCurrentTab('all');
    }
  }, [activeTab]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.serialNumber.trim() || !newProduct.productName.trim()) return;

    const added: AssetProduct = {
      id: `ast-${Date.now()}`,
      serialNumber: newProduct.serialNumber.toUpperCase(),
      productName: newProduct.productName,
      category: newProduct.category,
      brandModel: newProduct.brandModel || newProduct.productName,
      purchaseDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      warrantyExpiry: newProduct.warrantyExpiry,
      status: 'In Stock'
    };

    setAssets(prev => [added, ...prev]);
    showToast(`Asset "${newProduct.productName}" added to inventory!`, 'success');
    setShowAddModal(false);
    setNewProduct({
      serialNumber: '',
      productName: '',
      category: 'Laptop',
      brandModel: '',
      warrantyExpiry: '2028-09-08'
    });
  };

  const handleAllotProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    setAssets(prev => prev.map(a => a.id === allotData.assetId ? {
      ...a,
      status: 'Allotted',
      allotedTo: allotData.employeeName,
      allotmentDate: today
    } : a));

    showToast(`Asset successfully allotted to ${allotData.employeeName}!`, 'success');
    setShowAllotModal(false);
  };

  const handleReturnAsset = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'In Stock',
      allotedTo: undefined,
      allotmentDate: undefined
    } : a));
    showToast('Asset marked as returned to inventory.', 'info');
  };

  // Metrics
  const totalAssets = assets.length;
  const allottedCount = assets.filter(a => a.status === 'Allotted').length;
  const inStockCount = assets.filter(a => a.status === 'In Stock').length;
  const laptopCount = assets.filter(a => a.category === 'Laptop').length;

  const filteredAssets = assets.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.productName.toLowerCase().includes(q) ||
      item.serialNumber.toLowerCase().includes(q) ||
      (item.allotedTo && item.allotedTo.toLowerCase().includes(q)) ||
      item.brandModel.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    if (currentTab === 'allotted') {
      return matchesSearch && matchesCategory && item.status === 'Allotted';
    }
    if (currentTab === 'instock') {
      return matchesSearch && matchesCategory && item.status === 'In Stock';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedStatus !== 'all';
  const availableForAllotment = assets.filter(a => a.status === 'In Stock');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <span>Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Administration</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'allotted' ? 'Allotted Assets' : currentTab === 'instock' ? 'In-Stock Inventory' : 'Assets'}
          </span>
        </div>
      </div>

      {/* Standard Page Header & Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-ref" style={{ margin: 0 }}>Assets</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hardware serials, terminals, trading peripherals, and staff allotments.
          </p>
        </div>

        {/* Separated Action Commands */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="btn btn-secondary action-btn-interactive"
            onClick={() => setShowAllotModal(true)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              fontSize: '0.86rem', 
              fontWeight: 600,
              height: '38px', 
              borderRadius: '8px',
              padding: '0 0.95rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <UserCheck size={15} style={{ color: 'var(--stocketics-blue-500)' }} />
            <span>Allot Product</span>
          </button>

          <button 
            type="button"
            className="btn btn-primary action-btn-interactive"
            onClick={() => setShowAddModal(true)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              fontSize: '0.86rem', 
              fontWeight: 600,
              height: '38px', 
              borderRadius: '8px',
              padding: '0 1rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Add Asset Product</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--stocketics-blue-500)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Asset Units
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {totalAssets}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Including {laptopCount} Laptops & Workstations
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Currently Allotted
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {allottedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Assigned to team members
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            In Stock Inventory
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {inStockCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Ready for deployment
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Warranty Active
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            100%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Shield size={12} /> Verified OEM cover
          </div>
        </div>
      </div>

      {/* Navigation View Tabs (Pure navigation, clean record counts) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.4rem', overflowX: 'auto' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('all'); setActiveTab('assets-list'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <HardDrive size={14} /> 
          <span>All Assets</span>
          <span style={{ 
            background: currentTab === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {assets.length}
          </span>
        </button>

        <button 
          className={`btn btn-sm ${currentTab === 'allotted' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('allotted'); setActiveTab('assets-alloted-list'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Laptop size={14} /> 
          <span>Allotted List</span>
          <span style={{ 
            background: currentTab === 'allotted' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {allottedCount}
          </span>
        </button>

        <button 
          className={`btn btn-sm ${currentTab === 'instock' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setCurrentTab('instock'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Shield size={14} /> 
          <span>In Stock Inventory</span>
          <span style={{ 
            background: currentTab === 'instock' ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-alt)', 
            padding: '1px 6px', 
            borderRadius: 10, 
            fontSize: '0.72rem' 
          }}>
            {inStockCount}
          </span>
        </button>
      </div>

      {/* Shared Filter Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search serial no, product name, staff..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.84rem' }}
              />
            </div>

            <select 
              className="form-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="all">All Categories</option>
              <option value="Laptop">Laptop</option>
              <option value="Monitor">Monitor</option>
              <option value="Headset">Headset</option>
              <option value="Biometric">Biometric</option>
              <option value="Accessories">Accessories</option>
            </select>

            {currentTab === 'all' && (
              <select 
                className="form-select"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ height: '36px', fontSize: '0.82rem', width: 'auto' }}
              >
                <option value="all">All Statuses</option>
                <option value="Allotted">Allotted</option>
                <option value="In Stock">In Stock</option>
                <option value="Damaged">Damaged</option>
              </select>
            )}

            {hasActiveFilters && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={clearFilters}
                style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredAssets.length}</strong> items
          </div>
        </div>
      </div>

      {/* Assets Table with Responsive Wrapper */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper responsive-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Asset Tag / Serial</th>
                <th style={{ padding: '0.85rem 1rem' }}>Product Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Warranty Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Allotment Info</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No assets found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
                      {item.serialNumber}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{item.brandModel}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="delta-badge" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#0284c7', fontSize: '0.74rem' }}>
                        {item.category}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Valid till: {item.warrantyExpiry}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      {item.status === 'Allotted' ? (
                        <div>
                          <span className="delta-badge positive" style={{ fontSize: '0.72rem' }}>
                            Allotted to: {item.allotedTo}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Since: {item.allotmentDate}
                          </div>
                        </div>
                      ) : (
                        <span className="delta-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', fontSize: '0.72rem' }}>
                          In Stock Inventory
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      {item.status === 'Allotted' ? (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleReturnAsset(item.id)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                        >
                          Return Stock
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setAllotData({ ...allotData, assetId: item.id });
                            setShowAllotModal(true);
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                        >
                          Allot Asset
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD ASSET PRODUCT */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Add Asset to Inventory</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Register new hardware serial and specifications</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Asset Product Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude 5440 i7 16GB"
                  value={newProduct.productName}
                  onChange={e => setNewProduct({ ...newProduct, productName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Asset Tag / Serial Number *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. DELL-LT-9015"
                    value={newProduct.serialNumber}
                    onChange={e => setNewProduct({ ...newProduct, serialNumber: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value as any })}
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Headset">Headset</option>
                    <option value="Biometric">Biometric</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Brand / Model Detail</label>
                  <input 
                    type="text"
                    placeholder="e.g. Latitude 5440"
                    value={newProduct.brandModel}
                    onChange={e => setNewProduct({ ...newProduct, brandModel: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty Expiry Date</label>
                  <input 
                    type="date"
                    value={newProduct.warrantyExpiry}
                    onChange={e => setNewProduct({ ...newProduct, warrantyExpiry: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ALLOT PRODUCT */}
      {showAllotModal && (
        <div className="modal-overlay" onClick={() => setShowAllotModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Allot Product to Staff</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate formal equipment handover assignment</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAllotModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAllotProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select In-Stock Asset *</label>
                <select 
                  className="form-select"
                  value={allotData.assetId}
                  onChange={e => setAllotData({ ...allotData, assetId: e.target.value })}
                >
                  {availableForAllotment.length === 0 ? (
                    <option value="">No assets currently in stock</option>
                  ) : (
                    availableForAllotment.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.serialNumber}] {a.productName} ({a.category})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Employee / Desk Allocation *</label>
                <select 
                  className="form-select"
                  value={allotData.employeeName}
                  onChange={e => setAllotData({ ...allotData, employeeName: e.target.value })}
                >
                  <option value="Ananya Sen (Advisory Sales)">Ananya Sen (Advisory Sales)</option>
                  <option value="Rohan Deshmukh (Sales)">Rohan Deshmukh (Sales)</option>
                  <option value="Sneha Kapur (Derivatives)">Sneha Kapur (Derivatives)</option>
                  <option value="Aditya Roy (Analyst)">Aditya Roy (Analyst)</option>
                  <option value="Karan Mehra (HR)">Karan Mehra (HR)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Allotment Handover Notes</label>
                <textarea 
                  className="form-textarea" 
                  rows={2}
                  placeholder="Asset condition, serial barcode verified, charger provided..."
                  value={allotData.notes}
                  onChange={e => setAllotData({ ...allotData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAllotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={availableForAllotment.length === 0}>
                  Confirm Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
