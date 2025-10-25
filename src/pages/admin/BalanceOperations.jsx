import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  CreditCard, 
  User, 
  DollarSign, 
  History, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import ProTable from '../../components/ProTable.jsx';

const BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5003';

export default function BalanceOperations() {
  const [searchLogin, setSearchLogin] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operationHistory, setOperationHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Operation form states
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [operationType, setOperationType] = useState('deposit');
  const [operationAmount, setOperationAmount] = useState('');
  const [operationDescription, setOperationDescription] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  // Search for MT5 account
  const handleSearch = async () => {
    if (!searchLogin.trim()) {
      setError('Please enter an MT5 login ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE}/admin/mt5/account/${searchLogin}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle different response formats
        if (data.account) {
          setAccountInfo(data.account);
        } else if (data.data) {
          // Convert MT5 API format to our expected format
          const accountInfo = {
            login: data.data.Login,
            name: data.data.Name,
            balance: data.data.Balance,
            credit: data.data.Credit,
            equity: data.data.Equity,
            margin: data.data.Margin,
            free_margin: data.data.MarginFree,
            margin_level: data.data.MarginLevel,
            currency: 'USD',
            leverage: data.data.Leverage,
            group: data.data.Group,
            status: data.data.IsEnabled ? 'active' : 'inactive'
          };
          setAccountInfo(accountInfo);
        } else {
          setError('Invalid account data received');
          setAccountInfo(null);
        }
        
        // Also fetch operation history for this account
        fetchOperationHistory(searchLogin);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Account not found');
        setAccountInfo(null);
      }
    } catch (err) {
      setError('Failed to fetch account information');
      setAccountInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch operation history
  const fetchOperationHistory = async (login = null) => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (login) params.append('login', login);
      params.append('limit', '100');
      
      const response = await fetch(`${BASE}/admin/mt5/balance-history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOperationHistory(data.operations || []);
      }
    } catch (err) {
      console.error('Failed to fetch operation history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle balance operation
  const handleOperation = async (type = null) => {
    if (!accountInfo) {
      setError('Please search for an account first');
      return;
    }

    // If type is provided, set it and show modal
    if (type) {
      setOperationType(type);
      setShowOperationModal(true);
      return;
    }

    // If no type provided, this is from the modal
    if (!operationAmount) {
      setError('Please enter amount');
      return;
    }

    if (parseFloat(operationAmount) <= 0) {
      setError('Amount must be positive');
      return;
    }

    setOperationLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = operationType === 'deposit' ? 'deposit' : 
                     operationType === 'withdraw' ? 'withdraw' : 'credit';
      
      const response = await fetch(`${BASE}/admin/mt5/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: accountInfo.login,
          amount: operationAmount,
          description: operationDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show appropriate success message based on operation type
        let successMessage;
        if (operationType === 'deposit') {
          successMessage = 'Deposit successful! You will see the deposit in your MT5 account in 2-5 minutes.';
        } else if (operationType === 'withdraw') {
          successMessage = 'Withdrawal successful! You will see the withdrawal in your MT5 account in 2-5 minutes.';
        } else {
          successMessage = 'Credit added successfully! You will see the credit in your MT5 account in 2-5 minutes.';
        }
        
        alert(successMessage);
        setShowOperationModal(false);
        setOperationAmount('');
        setOperationDescription('');
        // Refresh account info and history
        handleSearch();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Operation failed');
      }
    } catch (err) {
      setError('Operation failed');
    } finally {
      setOperationLoading(false);
    }
  };

  // Load operation history on component mount
  useEffect(() => {
    fetchOperationHistory();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOperationIcon = (type) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdraw': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'credit': return <CreditCard className="h-4 w-4 text-blue-500" />;
      default: return <Wallet className="h-4 w-4 text-gray-500" />;
    }
  };

  const historyColumns = [
    {
      key: 'id',
      title: 'ID',
      render: (row) => `#${row.id}`
    },
    {
      key: 'mt5_login',
      title: 'MT5 Login',
      render: (row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-mono">{row.mt5_login}</span>
        </div>
      )
    },
    {
      key: 'operation_type',
      title: 'Operation',
      render: (row) => (
        <div className="flex items-center gap-2">
          {getOperationIcon(row.operation_type)}
          <span className="capitalize">{row.operation_type}</span>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (row) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="font-semibold">${parseFloat(row.amount).toFixed(2)}</span>
          <span className="text-sm text-gray-500">{row.currency}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.status)}
          <Badge 
            tone={row.status === 'completed' ? 'green' : 
                  row.status === 'failed' ? 'red' : 'amber'}
          >
            {row.status}
          </Badge>
        </div>
      )
    },
    {
      key: 'admin',
      title: 'Admin',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.admin?.username}</div>
          <div className="text-gray-500">{row.admin?.email}</div>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Date & Time',
      render: (row) => (
        <div className="text-sm">
          <div>{new Date(row.created_at).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(row.created_at).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (row) => (
        <div className="max-w-xs truncate" title={row.description}>
          {row.description || 'No description'}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-sm p-3 sm:p-4 md:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Balance Operations</h1>
            <p className="text-gray-600 mt-1">Manage MT5 account balances and credits</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search MT5 Account
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter MT5 Login ID (e.g., 12345)"
                    value={searchLogin}
                    onChange={(e) => setSearchLogin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Account Info */}
        {accountInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                <p className="text-gray-600">MT5 Login: {accountInfo.login}</p>
              </div>
              <button
                onClick={() => setShowOperationModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Perform Operation
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Balance</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  ${parseFloat(accountInfo.balance || 0).toFixed(2)}
                </div>
                <div className="text-xs text-blue-700 mt-1">Available Balance</div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Credit</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ${parseFloat(accountInfo.credit || 0).toFixed(2)}
                </div>
                <div className="text-xs text-green-700 mt-1">Credit Line</div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Equity</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  ${parseFloat(accountInfo.equity || 0).toFixed(2)}
                </div>
                <div className="text-xs text-purple-700 mt-1">Account Equity</div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Leverage</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  1:{accountInfo.leverage || 0}
                </div>
                <div className="text-xs text-orange-700 mt-1">Trading Leverage</div>
              </div>
            </div>

            {/* Additional Account Details */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Account Name</div>
                <div className="text-lg font-semibold text-gray-900">{accountInfo.name || `Account ${accountInfo.login}`}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Group</div>
                <div className="text-lg font-semibold text-gray-900">{accountInfo.group || 'demo'}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${accountInfo.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-lg font-semibold text-gray-900 capitalize">{accountInfo.status || 'active'}</span>
                </div>
              </div>
            </div>

            {/* Quick Operation Buttons */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Operations</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleOperation('deposit')}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Add Balance</span>
                </button>
                <button
                  onClick={() => handleOperation('withdraw')}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Minus className="h-5 w-5" />
                  <span className="font-semibold">Deduct Balance</span>
                </button>
                <button
                  onClick={() => handleOperation('credit')}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-semibold">Add Credit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Operation History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Operation History</h2>
            </div>
            <button
              onClick={() => fetchOperationHistory()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <ProTable
              rows={operationHistory}
              columns={historyColumns}
              loading={historyLoading}
              emptyMessage="No operation history found"
            />
          )}
        </div>

        {/* Operation Modal */}
        {showOperationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl max-w-md w-full p-6 border border-white/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Perform Operation</h3>
                <button
                  onClick={() => setShowOperationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="deposit">Deposit Balance</option>
                    <option value="withdraw">Withdraw Balance</option>
                    <option value="credit">Add Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={operationAmount}
                    onChange={(e) => setOperationAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={operationDescription}
                    onChange={(e) => setOperationDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                    className="w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowOperationModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOperation}
                    disabled={operationLoading || !operationAmount}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {operationLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {operationType === 'deposit' ? <Plus className="h-4 w-4" /> : 
                         operationType === 'withdraw' ? <Minus className="h-4 w-4" /> : 
                         <CreditCard className="h-4 w-4" />}
                        {operationType === 'deposit' ? 'Deposit' : 
                         operationType === 'withdraw' ? 'Withdraw' : 'Add Credit'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
