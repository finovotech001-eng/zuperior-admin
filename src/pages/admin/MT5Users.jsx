// src/pages/admin/MT5Users.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import ProTable from "../../components/ProTable.jsx";
import Modal from "../../components/Modal.jsx";
import { Eye } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

// Validation function to check if account data is complete and valid
function isValidAccountData(data) {
  if (!data) return false;
  
  // Check if all critical fields have valid data (not fallback values)
  const requiredFields = {
    Name: data.Name && data.Name !== "-" && data.Name.trim() !== "",
    Group: data.Group && data.Group !== "-" && data.Group.trim() !== "",
    Balance: typeof data.Balance === 'number' && data.Balance >= 0,
    Equity: typeof data.Equity === 'number' && data.Equity >= 0,
    Leverage: data.Leverage && data.Leverage !== "-" && data.Leverage !== "",
    Credit: typeof data.Credit === 'number' && data.Credit >= 0,
    Margin: typeof data.Margin === 'number' && data.Margin >= 0,
    MarginFree: typeof data.MarginFree === 'number' && data.MarginFree >= 0,
    MarginLevel: typeof data.MarginLevel === 'number' && data.MarginLevel >= 0,
    Profit: typeof data.Profit === 'number',
    Comment: data.Comment !== undefined,
    City: data.City !== undefined,
    State: data.State !== undefined,
    ZipCode: data.ZipCode !== undefined,
    Address: data.Address !== undefined,
    Registration: data.Registration !== undefined,
    LastAccess: data.LastAccess !== undefined,
    LastIP: data.LastIP !== undefined,
    IsEnabled: typeof data.IsEnabled === 'boolean'
  };
  
  // Count how many fields are valid
  const validFields = Object.values(requiredFields).filter(Boolean).length;
  const totalFields = Object.keys(requiredFields).length;
  
  // Account is valid if at least 80% of fields are valid
  const isValid = validFields >= Math.ceil(totalFields * 0.8);
  
  console.log(`Account validation: ${validFields}/${totalFields} fields valid (${Math.round(validFields/totalFields*100)}%) - ${isValid ? 'VALID' : 'INVALID'}`);
  
  return isValid;
}

export default function MT5Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError("");
    const token = localStorage.getItem('adminToken');
    
    fetch(`${BASE}/admin/mt5/users?limit=500`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load");
        const items = Array.isArray(data.items) ? data.items : [];
        setRows(items.map(u => ({
          id: u.id,
          name: u.name || "-",
          email: u.email,
          phone: u.phone || "-",
          country: u.country || "-",
          totalBalance: u.totalBalance || 0,
          createdAt: u.createdAt,
          MT5Account: u.MT5Account || [],
        })));
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE]);

  const handleView = useCallback(async (row) => {
    setViewModal({ user: row, accounts: [] });
    setAccountsLoading(true);
    setAccountsError("");
    setLoadingProgress({ current: 0, total: row.MT5Account?.length || 0 });
    
    try {
      // Check if user has MT5 accounts
      if (!row.MT5Account || row.MT5Account.length === 0) {
        setAccountsError("No MT5 accounts found for this user");
        setAccountsLoading(false);
        return;
      }

      console.log(`🚀 Starting to fetch ${row.MT5Account.length} MT5 accounts with STRICT validation...`);
      
      const validAccounts = [];
      const invalidAccounts = [];
      
      // Process accounts sequentially to ensure proper validation
      for (let i = 0; i < row.MT5Account.length; i++) {
        const account = row.MT5Account[i];
        setLoadingProgress({ current: i + 1, total: row.MT5Account.length });
        
        try {
          console.log(`📡 [${i + 1}/${row.MT5Account.length}] Fetching account ${account.accountId}...`);
          
          const token = localStorage.getItem('adminToken');
          const response = await axios.get(`${BASE}/admin/mt5/proxy/${account.accountId}/getClientProfile`, {
            timeout: 20000, // Increased timeout
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data?.ok && response.data?.data) {
            const mt5Response = response.data.data;
            
            if (mt5Response.Success && mt5Response.Data) {
              const data = mt5Response.Data;
              
              console.log(`📊 [${i + 1}/${row.MT5Account.length}] Raw MT5 data for ${account.accountId}:`, {
                Name: data.Name,
                Group: data.Group,
                Balance: data.Balance,
                Equity: data.Equity,
                Leverage: data.Leverage,
                IsEnabled: data.IsEnabled
              });
              
              // Validate the account data
              if (isValidAccountData(data)) {
                const accountData = {
                  accountId: account.accountId,
                  name: data.Name || "-",
                  group: data.Group || "-",
                  balance: data.Balance || 0,
                  equity: data.Equity || 0,
                  leverage: data.Leverage || "-",
                  credit: data.Credit || 0,
                  margin: data.Margin || 0,
                  marginFree: data.MarginFree || 0,
                  marginLevel: data.MarginLevel || 0,
                  profit: data.Profit || 0,
                  comment: data.Comment || "-",
                  city: data.City || "-",
                  state: data.State || "-",
                  zipCode: data.ZipCode || "-",
                  address: data.Address || "-",
                  registration: data.Registration ? new Date(data.Registration).toLocaleString() : "-",
                  lastAccess: data.LastAccess ? new Date(data.LastAccess).toLocaleString() : "-",
                  lastIP: data.LastIP || "-",
                  currency: "USD",
                  isEnabled: data.IsEnabled
                };
                
                validAccounts.push(accountData);
                console.log(`✅ [${i + 1}/${row.MT5Account.length}] Account ${account.accountId} VALIDATED and added`);
              } else {
                invalidAccounts.push({
                  accountId: account.accountId,
                  reason: "Incomplete or invalid data from MT5 API"
                });
                console.log(`❌ [${i + 1}/${row.MT5Account.length}] Account ${account.accountId} REJECTED - Invalid data`);
              }
            } else {
              invalidAccounts.push({
                accountId: account.accountId,
                reason: `MT5 API Error: ${mt5Response.Message || mt5Response.Error || 'Unknown error'}`
              });
              console.log(`❌ [${i + 1}/${row.MT5Account.length}] Account ${account.accountId} REJECTED - MT5 API failure`);
            }
          } else {
            invalidAccounts.push({
              accountId: account.accountId,
              reason: `Proxy Error: ${response.data?.error || 'No data received from proxy'}`
            });
            console.log(`❌ [${i + 1}/${row.MT5Account.length}] Account ${account.accountId} REJECTED - Proxy error`);
          }
        } catch (error) {
          invalidAccounts.push({
            accountId: account.accountId,
            reason: `Network Error: ${error.message}`
          });
          console.log(`❌ [${i + 1}/${row.MT5Account.length}] Account ${account.accountId} REJECTED - Network error: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`🎯 Fetch completed: ${validAccounts.length} valid accounts, ${invalidAccounts.length} rejected accounts`);
      
      // Only show modal if we have valid accounts
      if (validAccounts.length > 0) {
        setViewModal({ user: row, accounts: validAccounts });
        
        // Show success message with details
        const message = invalidAccounts.length > 0 
          ? `Loaded ${validAccounts.length} valid account(s). ${invalidAccounts.length} account(s) skipped due to incomplete data.`
          : `Loaded all ${validAccounts.length} account(s) successfully!`;
          
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: message,
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        setAccountsError(`No valid accounts found. All ${row.MT5Account.length} accounts were rejected due to incomplete data.`);
        
        Swal.fire({
          icon: 'warning',
          title: 'No Valid Data',
          text: `All ${row.MT5Account.length} accounts were rejected due to incomplete or invalid data from MT5 server.`,
          confirmButtonText: 'OK'
        });
      }
      
    } catch (e) {
      const errorMessage = e.message || String(e);
      setAccountsError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to fetch MT5 account details: ${errorMessage}`,
        confirmButtonText: 'OK'
      });
    } finally {
      setAccountsLoading(false);
      setLoadingProgress({ current: 0, total: 0 });
    }
  }, [BASE]);

  const columns = useMemo(() => [
    { key: "__index", label: "Sr No", sortable: false },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "totalBalance", label: "Total Balance", render: (v) => `$${v.toFixed(2)}` },
    { key: "country", label: "Country" },
    { key: "createdAt", label: "Joined", render: (v) => fmtDate(v) },
    { key: "actions", label: "Action", sortable: false, render: (v, row) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleView(row)}
          className="h-8 w-8 grid place-items-center rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50"
          title="View MT5 Accounts"
        >
          <Eye size={16} />
        </button>
      </div>
    ) },
  ], [handleView]);

  const filters = useMemo(() => ({
    searchKeys: ["name", "email", "phone", "country"],
  }), []);

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading users…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <>
      <ProTable
        title="MT5 Users"
        rows={rows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search name / email / phone / country…"
        pageSize={10}
      />

      {/* View Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={`MT5 Accounts for ${viewModal?.user?.name || 'User'}`}>
        {viewModal && (
          <div className="space-y-4">
            {accountsLoading && (
              <div className="text-center py-8">
                <div className="text-lg font-medium text-gray-700">Loading MT5 account details...</div>
                <div className="text-sm text-gray-500 mt-2">
                  Fetching and validating all accounts from MT5 server
                  {loadingProgress.total > 0 && (
                    <span className="ml-2">({loadingProgress.current}/{loadingProgress.total})</span>
                  )}
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: loadingProgress.total > 0 
                          ? `${(loadingProgress.current / loadingProgress.total) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Only accounts with complete data will be displayed
                </div>
              </div>
            )}
            {accountsError && (
              <div className="text-center py-8">
                <div className="text-lg font-medium text-red-700">Error Loading Accounts</div>
                <div className="text-sm text-red-600 mt-2">{accountsError}</div>
              </div>
            )}
            {!accountsLoading && !accountsError && viewModal.accounts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Account ID</th>
                      <th className="border border-gray-300 px-4 py-2">Account Name</th>
                      <th className="border border-gray-300 px-4 py-2">Group</th>
                      <th className="border border-gray-300 px-4 py-2">Balance</th>
                      <th className="border border-gray-300 px-4 py-2">Equity</th>
                      <th className="border border-gray-300 px-4 py-2">Leverage</th>
                      <th className="border border-gray-300 px-4 py-2">Credit</th>
                      <th className="border border-gray-300 px-4 py-2">Margin</th>
                      <th className="border border-gray-300 px-4 py-2">Margin Free</th>
                      <th className="border border-gray-300 px-4 py-2">Margin Level</th>
                      <th className="border border-gray-300 px-4 py-2">Profit</th>
                      <th className="border border-gray-300 px-4 py-2">Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewModal.accounts.map((account, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono">{account.accountId}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.group}</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">${account.balance.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">${account.equity.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.leverage}</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">${account.credit.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">${account.margin.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">${account.marginFree.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 font-mono">{account.marginLevel.toFixed(2)}%</td>
                        <td className={`border border-gray-300 px-4 py-2 font-mono ${
                          account.profit > 0 ? 'text-green-600' : account.profit < 0 ? 'text-red-600' : ''
                        }`}>
                          ${account.profit.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{account.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!accountsLoading && !accountsError && viewModal.accounts.length === 0 && (
              <div className="text-center py-8">
                <div className="text-lg font-medium text-gray-700">No Valid Accounts Found</div>
                <div className="text-sm text-gray-500 mt-2">
                  All accounts were rejected due to incomplete or invalid data from MT5 server.
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setViewModal(null)} className="px-4 h-10 rounded-md border">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}