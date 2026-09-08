import React, { useState, useEffect } from 'react';
import { useApp } from '../../state/store';
import { 
  Laptop, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  UserCheck, 
  RotateCcw, 
  Shield, 
  HardDrive,
  Monitor,
  Headphones,
  Printer
} from 'lucide-react';

interface AssetProduct {
  id: string;
  serialNumber: string;
  productName: string;
  category: 'Laptop' | 'Monitor' | 'Headset' | 'Biometric' | 'Accessories';
  brandModel: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: 'In Stock' | 'Alloted' | 'Damaged';
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
    status: 'Alloted',
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
    status: 'Alloted',
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
    status: 'Alloted',
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

  // Subtabs: 'add-product', 'assets-list', 'allot-product', 'alloted-list'
  const getSubTab = (): 'add' | 'list' | 'allot' | 'alloted' => {
    if (activeTab === 'assets-add-product') return 'add';
    if (activeTab === 'assets-allot-product') return 'allot';
    if (activeTab === 'assets-alloted-list') return 'alloted';
    return 'list';
  };

  const [currentTab, setCurrentTab] = useState<'add' | 'list' | 'allot' | 'alloted'>(getSubTab());
  const [assets, setAssets] = useState<AssetProduct[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');

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
    setCurrentTab(getSubTab());
  }, [activeTab]);

  const handleTabChange = (tab: 'add' | 'list' | 'allot' | 'alloted', tabId: string) => {
    setCurrentTab(tab);
    setActiveTab(tabId);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.serialNumber.trim() || !newProduct.productName.trim()) return;

    const added: AssetProduct = {
      id: `ast-${Date.now()}`,
      serialNumber: newProduct.serialNumber.toUpperCase(),
      productName: newProduct.productName,
      category: newProduct.category,
      brandModel: newProduct.brandModel || newProduct.productName,
      purchaseDate: '07-Sep-2026',
      warrantyExpiry: newProduct.warrantyExpiry,
      status: 'In Stock'
    };

    setAssets(prev => [added, ...prev]);
    showToast(`Asset product registered: ${newProduct.serialNumber}`, 'success');
    setNewProduct({
      serialNumber: '',
      productName: '',
      category: 'Laptop',
      brandModel: '',
      warrantyExpiry: '2028-09-08'
    });
    handleTabChange('list', 'assets-list');
  };

  const handleAllotProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setAssets(prev => prev.map(a => a.id === allotData.assetId ? {
      ...a,
      status: 'Alloted',
      allotedTo: allotData.employeeName,
      allotmentDate: '07-Sep-2026'
    } : a));

    showToast(`Asset successfully alloted to ${allotData.employeeName}!`, 'success');
    handleTabChange('alloted', 'assets-alloted-list');
  };

  const handleReturnAsset = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'In Stock',
      allotedTo: undefined,
      allotmentDate: undefined
    } : a));
    showToast('Asset returned to company stock inventory.', 'info');
  };

  const filteredAssets = assets.filter(a => {
    const matchSearch = 
      a.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.allotedTo && a.allotedTo.toLowerCase().includes(searchQuery.toLowerCase()));

    if (currentTab === 'alloted') return matchSearch && a.status === 'Alloted';
    return matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div className="subpage-header-strip">
        <div className="subpage-breadcrumb">
          <span className="home-link" onClick={() => setActiveTab('dashboard')}>
            <span>/ Home</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Assets</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
            {currentTab === 'add' && 'Add Product'}
            {currentTab === 'list' && 'Assets list'}
            {currentTab === 'allot' && 'Allot Product'}
            {currentTab === 'alloted' && 'Alloted list'}
          </span>
        </div>
      </div>

      {/* Header & Back Button (Image 10) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title-ref" style={{ margin: 0 }}>Assets</h1>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>

          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('dashboard')}
            style={{ 
              background: '#00a8ff', 
              borderColor: '#00a8ff', 
              color: '#ffffff', 
              fontWeight: 600, 
              padding: '0.45rem 1.25rem', 
              borderRadius: '4px',
              fontSize: '0.88rem',
              height: '36px'
            }}
          >
            &lt;&lt; Back
          </button>
        </div>
      </div>

      {/* Sub-Options Nav Tabs: Exact Names from Screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
        <button 
          className={`btn btn-sm ${currentTab === 'add' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('add', 'assets-add-product')}
        >
          <Plus size={14} /> Add Product
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('list', 'assets-list')}
        >
          <HardDrive size={14} /> Assets list ({assets.length})
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'allot' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('allot', 'assets-allot-product')}
        >
          <UserCheck size={14} /> Allot Product
        </button>
        <button 
          className={`btn btn-sm ${currentTab === 'alloted' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTabChange('alloted', 'assets-alloted-list')}
        >
          <Laptop size={14} /> Alloted list ({assets.filter(a => a.status === 'Alloted').length})
        </button>
      </div>

      {/* TAB 1: ADD PRODUCT (Exact Match to Image 10) */}
      {currentTab === 'add' && (
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '6px', 
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '0.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.75rem' }}>
            Assets
          </h2>

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', maxWidth: '650px' }}>
            {/* Product * */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                Product *
              </label>
              <input 
                type="text"
                required
                placeholder="Product name / item description"
                value={newProduct.productName}
                onChange={e => setNewProduct({ ...newProduct, productName: e.target.value })}
                className="input-field"
                style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>

            {/* Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                Quantity
              </label>
              <input 
                type="text"
                defaultValue="1"
                placeholder="Quantity"
                className="input-field"
                style={{ height: '38px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '140px', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ 
                  background: '#00a8ff', 
                  borderColor: '#00a8ff', 
                  color: '#ffffff', 
                  padding: '0.55rem 2rem', 
                  fontWeight: 700,
                  borderRadius: '4px',
                  fontSize: '0.92rem'
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ALLOT PRODUCT */}
      {currentTab === 'allot' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <UserCheck size={18} style={{ color: 'var(--stocketics-blue-500)' }} />
                <span>Allot Equipment to Employee</span>
              </div>
              <div className="card-subtitle">Issue hardware to research analysts, sales executives, and staff</div>
            </div>
          </div>

          <form onSubmit={handleAllotProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select In-Stock Asset *</label>
              <select 
                className="form-select"
                value={allotData.assetId}
                onChange={e => setAllotData({ ...allotData, assetId: e.target.value })}
              >
                {assets.filter(a => a.status === 'In Stock').map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.serialNumber}] {a.productName} ({a.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Allot to Employee *</label>
              <select 
                className="form-select"
                value={allotData.employeeName}
                onChange={e => setAllotData({ ...allotData, employeeName: e.target.value })}
              >
                <option value="Ananya Sen (Advisory Sales)">Ananya Sen (Advisory Sales)</option>
                <option value="Aditya Roy (Equity Research)">Aditya Roy (Equity Research)</option>
                <option value="Rohan Deshmukh (Advisory Sales)">Rohan Deshmukh (Advisory Sales)</option>
                <option value="Sneha Kapur (Derivatives)">Sneha Kapur (Derivatives)</option>
                <option value="Karan Mehra (HR)">Karan Mehra (HR)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Allotment Handover Notes</label>
              <textarea 
                className="form-textarea" 
                rows={2}
                value={allotData.notes}
                onChange={e => setAllotData({ ...allotData, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => handleTabChange('list', 'assets-list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Allotment & Generate Handover Slip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2 & 4: ASSETS LIST / ALLOTED LIST TABLE */}
      {(currentTab === 'list' || currentTab === 'alloted') && (
        <>
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '380px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input"
                placeholder="Search serial no, product name, staff..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                  {filteredAssets.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--stocketics-blue-500)' }}>
                        {item.serialNumber}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.productName}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="delta-badge" style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.74rem' }}>
                          {item.category}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Valid till: {item.warrantyExpiry}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {item.status === 'Alloted' ? (
                          <div>
                            <span className="delta-badge positive" style={{ fontSize: '0.72rem' }}>
                              Alloted to: {item.allotedTo}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Date: {item.allotmentDate}
                            </div>
                          </div>
                        ) : (
                          <span className="delta-badge" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem' }}>
                            In Stock Inventory
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        {item.status === 'Alloted' ? (
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleReturnAsset(item.id)}
                            title="Return to Inventory"
                          >
                            <RotateCcw size={13} /> Return
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setAllotData({ ...allotData, assetId: item.id });
                              handleTabChange('allot', 'assets-allot-product');
                            }}
                          >
                            Allot
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
