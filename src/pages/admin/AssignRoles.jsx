import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_FEATURES } from "../../components/SidebarMenuConfig.js";
import Swal from "sweetalert2";

const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";
import { 
  Users, 
  Shield, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Eye,
  UserCheck,
  Settings,
  Database,
  BarChart3,
  FileText,
  CreditCard,
  MessageSquare,
  Bell,
  Mail,
  Calendar,
  TrendingUp,
  PieChart,
  DollarSign,
  Target,
  Award,
  Globe,
  Lock,
  Unlock
} from "lucide-react";

const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Super Admin', color: 'bg-red-100 text-red-800', description: 'Full access to all features' },
  { value: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-800', description: 'Standard admin access' },
  { value: 'moderator', label: 'Moderator', color: 'bg-green-100 text-green-800', description: 'Limited admin access' },
  { value: 'support', label: 'Support', color: 'bg-yellow-100 text-yellow-800', description: 'Customer support access' },
  { value: 'analyst', label: 'Analyst', color: 'bg-purple-100 text-purple-800', description: 'Analytics and reporting access' }
];

// Real features based on actual sidebar menu
const ADMIN_FEATURES = {
  superadmin: [
    { name: 'Dashboard', icon: BarChart3, path: 'dashboard' },
    { name: 'Manage Users', icon: Users, path: 'users' },
    { name: 'KYC Verifications', icon: Shield, path: 'kyc' },
    { name: 'MT5 Management', icon: Database, path: 'mt5' },
    { name: 'Manage Deposits', icon: CreditCard, path: 'deposits' },
    { name: 'Manage Withdrawals', icon: DollarSign, path: 'withdrawals' },
    { name: 'Payment Gateways', icon: CreditCard, path: 'payment-gateways' },
    { name: 'Bulk Operations Log', icon: FileText, path: 'bulk-logs' },
    { name: 'Assign Roles', icon: Settings, path: 'assign-roles' },
    { name: 'Admin Profile', icon: UserCheck, path: 'profile' }
  ],
  admin: [
    { name: 'Dashboard', icon: BarChart3, path: 'dashboard' },
    { name: 'Manage Users', icon: Users, path: 'users' },
    { name: 'KYC Verifications', icon: Shield, path: 'kyc' },
    { name: 'MT5 Management', icon: Database, path: 'mt5' },
    { name: 'Manage Deposits', icon: CreditCard, path: 'deposits' },
    { name: 'Manage Withdrawals', icon: DollarSign, path: 'withdrawals' },
    { name: 'Payment Gateways', icon: CreditCard, path: 'payment-gateways' },
    { name: 'Bulk Operations Log', icon: FileText, path: 'bulk-logs' }
  ],
  moderator: [
    { name: 'Dashboard', icon: BarChart3, path: 'dashboard' },
    { name: 'Manage Users', icon: Users, path: 'users' },
    { name: 'KYC Verifications', icon: Shield, path: 'kyc' },
    { name: 'Bulk Operations Log', icon: FileText, path: 'bulk-logs' }
  ],
  support: [
    { name: 'Dashboard', icon: BarChart3, path: 'dashboard' },
    { name: 'Manage Users', icon: Users, path: 'users' },
    { name: 'KYC Verifications', icon: Shield, path: 'kyc' }
  ],
  analyst: [
    { name: 'Dashboard', icon: BarChart3, path: 'dashboard' },
    { name: 'Manage Users', icon: Users, path: 'users' },
    { name: 'KYC Verifications', icon: Shield, path: 'kyc' },
    { name: 'Bulk Operations Log', icon: FileText, path: 'bulk-logs' }
  ]
};

export default function AssignRoles() {
  const { admin } = useAuth();
  
  // Add custom styles for dropdown
  const dropdownStyles = `
    .role-dropdown {
      position: relative;
      z-index: 50;
    }
    
    .role-dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 50;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      margin-top: 0.25rem;
    }
    
    .role-dropdown-option {
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
    }
    
    .role-dropdown-option:hover {
      background-color: #f3f4f6;
    }
    
    .role-dropdown-option:first-child {
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }
    
    .role-dropdown-option:last-child {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }
    
    /* Enhanced backdrop blur for modals */
    .backdrop-blur-enhanced {
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      background-color: rgba(0, 0, 0, 0.4) !important;
    }
  `;

  const [roles, setRoles] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    features: []
  });
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    admin_role: "admin",
    features: []
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE}/admin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      } else {
        setError('Failed to fetch admins');
      }
    } catch (err) {
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      // First, check if email exists in USER table
      const token = localStorage.getItem('adminToken');
      const checkUserResponse = await fetch(`${BASE}/admin/users/check-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newAdmin.email })
      });
      
      if (checkUserResponse.ok) {
        const checkData = await checkUserResponse.json();
        if (checkData.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Email Already Exists!',
            text: 'This email is already registered as a client user. Please use a different email address.',
            confirmButtonText: 'OK'
          });
          return;
        }
      }
      
      // If email doesn't exist in USER table, proceed with admin creation
      const response = await fetch(`${BASE}/admin/admins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdmin)
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmins([...admins, data.admin]);
        setShowCreateModal(false);
        setNewAdmin({
          username: "",
          email: "",
          password: "",
          admin_role: "admin",
          features: []
        });
        setError("");
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Admin account created successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Failed to create admin';
        
        // Check if it's an email already exists error
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already')) {
          Swal.fire({
            icon: 'error',
            title: 'Email Already Exists!',
            text: 'This email is already registered in the system. Please use a different email address.',
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: errorMessage,
            confirmButtonText: 'OK'
          });
        }
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Failed to create admin';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUpdateRole = async (adminId, newRole) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE}/admin/admins/${adminId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_role: newRole })
      });
      
      if (response.ok) {
        setAdmins(admins.map(admin => 
          admin.id === adminId ? { ...admin, admin_role: newRole } : admin
        ));
        setError("");
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Admin role updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Failed to update role';
        setError(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to update role';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleFeatureSelection = (adminUser) => {
    setSelectedAdmin(adminUser);
    setSelectedFeatures(adminUser.features || []);
    setShowFeatureModal(true);
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const handleSaveFeatures = () => {
    // Here you would save the custom features to the backend
    console.log('Saving features for admin:', selectedAdmin, 'Features:', selectedFeatures);
    setShowFeatureModal(false);
    setSelectedAdmin(null);
    setSelectedFeatures([]);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Passwords do not match',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Password must be at least 6 characters',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE}/admin/admins/${selectedAdmin.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newPassword: passwordForm.newPassword 
        })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setSelectedAdmin(null);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        setError("");
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Password updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Failed to update password';
        setError(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to update password';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    
    if (!newRole.name.trim()) {
      setError('Role name is required');
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Role name is required',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (newRole.features.length === 0) {
      setError('Please select at least one feature for the role');
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Please select at least one feature for the role',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE}/admin/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRole.name,
          description: newRole.description,
          features: newRole.features
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add the new role to ROLE_OPTIONS
        const newRoleOption = {
          value: data.role.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.role.name,
          color: 'bg-indigo-100 text-indigo-800',
          description: data.role.description
        };
        
        // Update the role options (you might want to store this in state)
        setShowCreateRoleModal(false);
        setNewRole({
          name: "",
          description: "",
          features: []
        });
        setError("");
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Role created successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Refresh the page to show the new role
        window.location.reload();
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Failed to create role';
        setError(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Failed to create role',
          text: 'Unable to create new role. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to create role';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Failed to create role',
        text: 'Unable to create new role. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleRoleDropdownToggle = (adminId) => {
    setShowRoleDropdown(showRoleDropdown === adminId ? null : adminId);
  };

  const handleRoleSelect = async (adminId, newRole) => {
    await handleUpdateRole(adminId, newRole);
    setShowRoleDropdown(null);
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.role-dropdown')) {
      setShowRoleDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getFeaturesForRole = (role) => {
    return ADMIN_FEATURES[role] || [];
  };

  const getStatusInfo = (isActive) => {
    return isActive 
      ? { label: 'Active', color: 'bg-green-100 text-green-800', icon: '✓' }
      : { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: '✗' };
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
      <style>{dropdownStyles}</style>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Role Assignment</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage admin roles and permissions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowCreateRoleModal(true)}
                className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Create Role</span>
                <span className="sm:hidden">Role</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Create Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <X className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
          {ROLE_OPTIONS.map((role) => (
            <div key={role.value} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                  {role.label}
                </div>
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{role.label}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-medium text-gray-700">Features:</div>
                <div className="flex flex-wrap gap-1">
                  {getFeaturesForRole(role.value).slice(0, window.innerWidth < 640 ? 2 : 3).map((feature, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      <feature.icon className="h-3 w-3" />
                      {feature.name}
                    </span>
                  ))}
                  {getFeaturesForRole(role.value).length > (window.innerWidth < 640 ? 2 : 3) && (
                    <span className="text-xs text-gray-500">+{getFeaturesForRole(role.value).length - (window.innerWidth < 640 ? 2 : 3)} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Admin Users</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage admin accounts and their roles</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((adminUser) => {
                  const role = ROLE_OPTIONS.find(r => r.value === adminUser.admin_role);
                  const statusInfo = getStatusInfo(adminUser.is_active);
                  return (
                    <tr key={adminUser.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-2 sm:ml-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{adminUser.username}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{adminUser.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="role-dropdown">
                          <button
                            onClick={() => handleRoleDropdownToggle(adminUser.id)}
                            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
                          >
                            <span className={`px-2 py-1 rounded-full text-xs ${role?.color || 'bg-gray-100 text-gray-800'}`}>
                              {role?.label || adminUser.admin_role}
                            </span>
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          
                          {showRoleDropdown === adminUser.id && (
                            <div className="role-dropdown-menu">
                              {ROLE_OPTIONS.filter(role => role.value !== 'superadmin').map((roleOption) => (
                                <div
                                  key={roleOption.value}
                                  onClick={() => handleRoleSelect(adminUser.id, roleOption.value)}
                                  className="role-dropdown-option flex items-center gap-2"
                                >
                                  <span className={`px-2 py-1 rounded-full text-xs ${roleOption.color}`}>
                                    {roleOption.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getFeaturesForRole(adminUser.admin_role).slice(0, 2).map((feature, index) => (
                            <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              <feature.icon className="h-3 w-3" />
                              {feature.name}
                            </span>
                          ))}
                          {getFeaturesForRole(adminUser.admin_role).length > 2 && (
                            <span className="text-xs text-gray-500">+{getFeaturesForRole(adminUser.admin_role).length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                          <span>{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {adminUser.last_login ? new Date(adminUser.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {adminUser.admin_role === 'superadmin' ? (
                            <span className="text-xs text-gray-500">Super Admin</span>
                          ) : (
                            <button
                              onClick={() => setEditingAdmin(adminUser.id)}
                              className="p-1.5 sm:p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit Role"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleFeatureSelection(adminUser)}
                            className="p-1.5 sm:p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Customize Features"
                          >
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button 
                            className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAdmin(adminUser);
                              setShowPasswordModal(true);
                            }}
                            className="p-1.5 sm:p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Change Password"
                          >
                            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm backdrop-blur-enhanced flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Create New Admin</h3>
              </div>
              <form onSubmit={handleCreateAdmin} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter username"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        value={newAdmin.admin_role}
                        onChange={(e) => setNewAdmin({...newAdmin, admin_role: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        {ROLE_OPTIONS.filter(role => role.value !== 'superadmin').map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column - Feature Assignment */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Feature Assignment</h4>
                    
                    <div className="space-y-3">
                      {Object.entries(ADMIN_FEATURES).map(([roleType, features]) => (
                        <div key={roleType} className="border border-gray-200 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">{roleType} Features</h5>
                          <div className="grid grid-cols-1 gap-2">
                            {features.map((feature, index) => (
                              <label key={index} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={newAdmin.features.includes(feature.path)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewAdmin({
                                        ...newAdmin,
                                        features: [...newAdmin.features, feature.path]
                                      });
                                    } else {
                                      setNewAdmin({
                                        ...newAdmin,
                                        features: newAdmin.features.filter(f => f !== feature.path)
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <feature.icon className="h-4 w-4 text-gray-500" />
                                <span>{feature.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewAdmin({
                        username: "",
                        email: "",
                        password: "",
                        admin_role: "admin",
                        features: []
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
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Feature Selection Modal */}
        {showFeatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-enhanced flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select which features this admin can access</h3>
                  <button
                    onClick={() => {
                      setShowFeatureModal(false);
                      setSelectedAdmin(null);
                      setSelectedFeatures([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ADMIN_FEATURES).map(([roleType, features]) => (
                    <div key={roleType} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{roleType} Features</h4>
                      <div className="space-y-2">
                        {features.map((feature, index) => (
                          <label key={index} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFeatures.includes(feature.path)}
                              onChange={() => handleFeatureToggle(feature.path)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <feature.icon className="h-4 w-4 text-gray-500" />
                            <span>{feature.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowFeatureModal(false);
                      setSelectedAdmin(null);
                      setSelectedFeatures([]);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFeatures}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Features
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-enhanced flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password for {selectedAdmin?.username}
                  </h3>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedAdmin(null);
                      setPasswordForm({ newPassword: '', confirmPassword: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedAdmin(null);
                      setPasswordForm({ newPassword: '', confirmPassword: '' });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Role Modal */}
        {showCreateRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-enhanced flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Create New Role
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateRoleModal(false);
                      setNewRole({
                        name: "",
                        description: "",
                        features: []
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateRole} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={newRole.name}
                        onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Manager, Supervisor, Coordinator"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newRole.description}
                        onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Brief description of this role"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Features for this Role *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(ADMIN_FEATURES).map(([roleType, features]) => (
                        <div key={roleType} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{roleType} Features</h4>
                          <div className="space-y-2">
                            {features.map((feature, index) => (
                              <label key={index} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newRole.features.includes(feature.path)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewRole({
                                        ...newRole,
                                        features: [...newRole.features, feature.path]
                                      });
                                    } else {
                                      setNewRole({
                                        ...newRole,
                                        features: newRole.features.filter(f => f !== feature.path)
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <feature.icon className="h-4 w-4 text-gray-500" />
                                <span>{feature.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateRoleModal(false);
                        setNewRole({
                          name: "",
                          description: "",
                          features: []
                        });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Create Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
