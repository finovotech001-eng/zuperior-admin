import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CreditCard,
  Upload,
  QrCode,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Smartphone,
  Banknote,
  Building2
} from "lucide-react";
import ProTable from "../../components/ProTable.jsx";

const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

const GATEWAY_TYPES = [
  { value: 'crypto', label: 'Cryptocurrency', icon: DollarSign, color: 'bg-orange-100 text-orange-800' },
  { value: 'wire', label: 'Wire Transfer', icon: Building2, color: 'bg-blue-100 text-blue-800' },
  { value: 'upi', label: 'UPI', icon: Smartphone, color: 'bg-green-100 text-green-800' },
  { value: 'local', label: 'Local Depositor', icon: Banknote, color: 'bg-purple-100 text-purple-800' }
];

export default function PaymentGatewaysManual() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [showQR, setShowQR] = useState({});
  const [formData, setFormData] = useState({
    type: "upi",
    name: "",
    details: "",
    icon: null,
    qr_code: null,
    is_active: true,
    // UPI / Crypto
    vpa_address: "",
    crypto_address: "",
    // Bank
    bank_name: "",
    account_name: "",
    account_number: "",
    ifsc_code: "",
    swift_code: "",
    account_type: "",
    country_code: ""
  });
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchGateways();
    // load countries for bank gateway eligibility
    (async () => {
      try {
        const r = await fetch(`${BASE}/admin/countries`);
        const j = await r.json();
        const items = Array.isArray(j?.countries) ? j.countries : (Array.isArray(j) ? j : []);
        setCountries(items);
      } catch {}
    })();
  }, []);

  const fetchGateways = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE}/admin/manual-gateways`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGateways(data.gateways || []);
      } else {
        setError('Failed to fetch manual gateways');
      }
    } catch (err) {
      setError('Failed to fetch manual gateways');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('details', formData.details);
      formDataToSend.append('is_active', formData.is_active);
      // method-specific fields
      formDataToSend.append('vpa_address', formData.vpa_address || '');
      formDataToSend.append('crypto_address', formData.crypto_address || '');
      formDataToSend.append('bank_name', formData.bank_name || '');
      formDataToSend.append('account_name', formData.account_name || '');
      formDataToSend.append('account_number', formData.account_number || '');
      formDataToSend.append('ifsc_code', formData.ifsc_code || '');
      formDataToSend.append('swift_code', formData.swift_code || '');
      formDataToSend.append('account_type', formData.account_type || '');
      formDataToSend.append('country_code', formData.country_code || '');
      
      if (formData.icon) {
        formDataToSend.append('icon', formData.icon);
      }
      if (formData.qr_code) {
        formDataToSend.append('qr_code', formData.qr_code);
      }

      const url = editingGateway 
        ? `${BASE}/admin/manual-gateways/${editingGateway.id}`
        : `${BASE}/admin/manual-gateways`;
      
      const method = editingGateway ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });
      
      if (response.ok) {
        const data = await response.json();
        if (editingGateway) {
          setGateways(gateways.map(g => g.id === editingGateway.id ? data.gateway : g));
        } else {
          setGateways([...gateways, data.gateway]);
        }
        setShowForm(false);
        setEditingGateway(null);
        setFormData({
          type: "upi",
          name: "",
          details: "",
          icon: null,
          qr_code: null,
          is_active: true,
          vpa_address: "",
          crypto_address: "",
          bank_name: "",
          account_name: "",
          account_number: "",
          ifsc_code: "",
          swift_code: "",
          account_type: "",
          country_code: ""
        });
        setError("");
        Swal.fire({ icon: 'success', title: editingGateway ? 'Gateway updated' : 'Gateway saved', timer: 1400, showConfirmButton: false });
      } else {
        const data = await response.json();
        const msg = data.error || 'Failed to save gateway';
        setError(msg);
        Swal.fire({ icon: 'error', title: 'Save failed', text: msg });
      }
    } catch (err) {
      setError('Failed to save gateway');
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message || String(err) });
    }
  };

  const handleEdit = (gateway) => {
    setEditingGateway(gateway);
    setFormData({
      type: gateway.type,
      name: gateway.name,
      details: gateway.details,
      icon: null,
      qr_code: null,
      is_active: gateway.is_active,
      vpa_address: gateway.vpa_address || '',
      crypto_address: gateway.crypto_address || '',
      bank_name: gateway.bank_name || '',
      account_name: gateway.account_name || '',
      account_number: gateway.account_number || '',
      ifsc_code: gateway.ifsc_code || '',
      swift_code: gateway.swift_code || '',
      account_type: gateway.account_type || '',
      country_code: gateway.country_code || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this gateway?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE}/admin/manual-gateways/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setGateways(gateways.filter(g => g.id !== id));
        setError("");
        Swal.fire({ icon: 'success', title: 'Gateway deleted', timer: 1200, showConfirmButton: false });
      } else {
        const msg = 'Failed to delete gateway';
        setError(msg);
        Swal.fire({ icon: 'error', title: 'Delete failed', text: msg });
      }
    } catch (err) {
      setError('Failed to delete gateway');
      Swal.fire({ icon: 'error', title: 'Delete failed', text: err.message || String(err) });
    }
  };

  const toggleQRVisibility = (id) => {
    setShowQR(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getTypeInfo = (type) => {
    return GATEWAY_TYPES.find(t => t.value === type) || GATEWAY_TYPES[0];
  };

  const getStatusInfo = (isActive) => {
    return isActive 
      ? { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      : { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: AlertCircle };
  };

  // Resolve file URLs coming from backend (which may be relative like /kyc_proofs/xxx)
  const fileUrl = (u) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    // Ensure no double slashes when BASE already ends with '/'
    const base = BASE.replace(/\/$/, '');
    const path = String(u).startsWith('/') ? u : `/${u}`;
    return `${base}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manual Payment Gateways</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage manual payment methods and QR codes</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add Manual Gateway</span>
              <span className="sm:hidden">Add Gateway</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {editingGateway ? 'Edit Manual Gateway' : 'Add Manual Gateway'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingGateway(null);
                  setFormData({
                    type: "upi",
                    name: "",
                    details: "",
                    icon: null,
                    qr_code: null,
                    is_active: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {GATEWAY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Name / Label *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., UPI PAYMENT, USDT TRC20"
                    required
                  />
                </div>
              </div>

              {/* Method-specific fields */}
              {(['upi','crypto','local'].includes(formData.type)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      {formData.type==='upi' ? 'UPI VPA Address *' : formData.type==='crypto' ? 'Crypto Address *' : 'Details *'}
                    </label>
                    <input
                      type="text"
                      value={formData.type==='upi' ? formData.vpa_address : formData.type==='crypto' ? formData.crypto_address : formData.details}
                      onChange={(e) => setFormData({...formData, [formData.type==='upi'?'vpa_address':formData.type==='crypto'?'crypto_address':'details']: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={formData.type==='upi' ? 'e.g., username@bank' : formData.type==='crypto' ? 'e.g., USDT TRC20 address' : 'Local depositor details'}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type==='wire' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bank Name *</label>
                    <input type="text" value={formData.bank_name} onChange={e=>setFormData({...formData, bank_name:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Account Name *</label>
                    <input type="text" value={formData.account_name} onChange={e=>setFormData({...formData, account_name:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Account Number *</label>
                    <input type="text" value={formData.account_number} onChange={e=>setFormData({...formData, account_number:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">IFSC / SWIFT Code *</label>
                    <input type="text" value={formData.ifsc_code || formData.swift_code} onChange={e=>setFormData({...formData, ifsc_code:e.target.value, swift_code:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Account Type</label>
                    <input type="text" value={formData.account_type} onChange={e=>setFormData({...formData, account_type:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Savings / Current" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Eligible Country *</label>
                    <select value={formData.country_code} onChange={e=>setFormData({...formData, country_code:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                      <option value="">Select Country</option>
                      {countries.map(c => (
                        <option key={c.code || c.country_code || c.id} value={(c.code||'').toUpperCase()}>{c.country || c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Icon
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, icon: e.target.files[0]})}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label
                      htmlFor="icon-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Choose file</span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.icon ? formData.icon.name : 'No file chosen'}
                    </span>
                  </div>
                </div>

                {(['upi','crypto'].includes(formData.type)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      QR Code
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, qr_code: e.target.files[0]})}
                        className="hidden"
                        id="qr-upload"
                      />
                      <label
                        htmlFor="qr-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <QrCode className="h-4 w-4" />
                        <span className="text-sm">Choose file</span>
                      </label>
                      <span className="text-sm text-gray-500">
                        {formData.qr_code ? formData.qr_code.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>
                )}
                {formData.type!=='upi' && formData.type!=='crypto' && (
                  <div className="text-xs text-gray-500 md:col-span-2">QR is typically not used for bank transfer; you may leave it blank.</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active Gateway
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGateway(null);
                  setFormData({
                    type: "upi",
                    name: "",
                    details: "",
                    icon: null,
                    qr_code: null,
                    is_active: true,
                    vpa_address: "",
                    crypto_address: "",
                    bank_name: "",
                    account_name: "",
                    account_number: "",
                    ifsc_code: "",
                    swift_code: "",
                    account_type: "",
                    country_code: ""
                  });
                }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingGateway ? 'Update Gateway' : 'Save Gateway'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gateways Table (ProTable) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Manual Gateways</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your manual payment gateway configurations</p>
          </div>
          
          {gateways.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Manual Gateways Found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first manual payment gateway</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Gateway
              </button>
            </div>
          ) : (
            <div className="p-4">
              <ProTable
                title={null}
                rows={gateways.map((g, i) => ({
                  __index: i+1,
                  type: g.type,
                  name: g.name,
                  icon: g.icon_url,
                  qr: g.qr_code_url,
                  details: g, // pass full gateway for render
                  status: g.is_active ? 'Active' : 'Inactive',
                  actions: g,
                }))}
                columns={[
                  { key: '__index', label: '#', sortable: false },
                  { key: 'type', label: 'Type', render: (v) => {
                      const info = getTypeInfo(v);
                      const Icon = info.icon;
                      return (
                        <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full ${info.color}`}>
                          <Icon className="h-3 w-3" /> {info.label}
                        </span>
                      );
                    }
                  },
                  { key: 'name', label: 'Name' },
                  { key: 'icon', label: 'Icon', render: (v) => (
                      v ? <img src={fileUrl(v)} alt="icon" className="h-8 w-8 rounded-full object-cover mx-auto" />
                        : <div className="h-8 w-8 rounded-full bg-gray-100 grid place-items-center mx-auto"><CreditCard className="h-4 w-4 text-gray-400" /></div>
                    )
                  },
                  { key: 'qr', label: 'QR', render: (v, row) => (
                      v ? (
                        <div className="flex items-center justify-center gap-2">
                          <img src={fileUrl(v)} alt="QR" className="h-8 w-8 rounded object-cover" />
                          <button onClick={() => toggleQRVisibility(row.actions.id)} className="text-gray-400 hover:text-gray-600">
                            {showQR[row.actions.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      ) : <span className="text-gray-400 text-sm">No QR</span>
                    )
                  },
                  { key: 'details', label: 'Details', render: (_v, row) => {
                      const g = row.details;
                      if (g.type === 'upi') {
                        return <div className="text-xs text-gray-700"><b>VPA:</b> {g.vpa_address || '-'}</div>;
                      }
                      if (g.type === 'crypto') {
                        return <div className="text-xs text-gray-700"><b>Address:</b> {g.crypto_address || '-'}</div>;
                      }
                      if (g.type === 'wire') {
                        return (
                          <div className="text-xs text-gray-700 text-left">
                            <div><b>Bank:</b> {g.bank_name || '-'}</div>
                            <div><b>Account:</b> {g.account_name || '-'}</div>
                            <div><b>Number:</b> {g.account_number || '-'}</div>
                            <div><b>IFSC/SWIFT:</b> {g.ifsc_code || g.swift_code || '-'}</div>
                            <div><b>Type:</b> {g.account_type || '-'}</div>
                            <div><b>Country:</b> {g.country_code || '-'}</div>
                          </div>
                        );
                      }
                      return <div className="text-xs text-gray-700">{g.details || '-'}</div>;
                    }
                  },
                  { key: 'status', label: 'Status', render: (v) => {
                      const info = getStatusInfo(v === 'Active');
                      const Icon = info.icon;
                      return <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${info.color}`}><Icon className="h-3 w-3" /> {info.label}</span>;
                    }
                  },
                  { key: 'actions', label: 'Actions', sortable: false, render: (_v, row) => (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(row.actions)} className="p-1.5 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg" title="Edit Gateway">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(row.actions.id)} className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg" title="Delete Gateway">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  },
                ]}
                filters={{ searchKeys: ['name','type','country_code','vpa_address','crypto_address','bank_name','account_name','account_number'] }}
                pageSize={10}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
