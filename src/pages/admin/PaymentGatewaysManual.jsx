import { useState, useEffect } from "react";
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
    is_active: true
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('${BASE}/admin/manual-gateways', {
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
      
      if (formData.icon) {
        formDataToSend.append('icon', formData.icon);
      }
      if (formData.qr_code) {
        formDataToSend.append('qr_code', formData.qr_code);
      }

      const url = editingGateway 
        ? `${BASE}/admin/manual-gateways/${editingGateway.id}`
        : '${BASE}/admin/manual-gateways';
      
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
          is_active: true
        });
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save gateway');
      }
    } catch (err) {
      setError('Failed to save gateway');
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
      is_active: gateway.is_active
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
      } else {
        setError('Failed to delete gateway');
      }
    } catch (err) {
      setError('Failed to delete gateway');
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Details *
                </label>
                <input
                  type="text"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., RAM ENTERPRISE, Wallet Address"
                  required
                />
              </div>

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
                      is_active: true
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

        {/* Gateways Table */}
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
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gateways.map((gateway, index) => {
                    const typeInfo = getTypeInfo(gateway.type);
                    const statusInfo = getStatusInfo(gateway.is_active);
                    return (
                      <tr key={gateway.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <typeInfo.icon className="h-4 w-4 text-gray-500" />
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{gateway.name}</div>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          {gateway.icon_url ? (
                            <img 
                              src={gateway.icon_url} 
                              alt="Gateway icon" 
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          {gateway.qr_code_url ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={gateway.qr_code_url} 
                                alt="QR Code" 
                                className="h-8 w-8 rounded object-cover"
                              />
                              <button
                                onClick={() => toggleQRVisibility(gateway.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showQR[gateway.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No QR</span>
                          )}
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {gateway.details}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(gateway)}
                              className="p-1.5 sm:p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit Gateway"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(gateway.id)}
                              className="p-1.5 sm:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Gateway"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
