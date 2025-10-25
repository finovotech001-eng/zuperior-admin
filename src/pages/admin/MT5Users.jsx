// src/pages/admin/MT5Users.jsx
import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";
import Modal from "../../components/Modal.jsx";
import { Eye } from "lucide-react";
import axios from "axios";

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function MT5Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewModal, setViewModal] = useState(null); // { user, accounts }
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState("");

  const BASE = import.meta.env.VITE_BACKEND_API_URL
    || import.meta.env.VITE_API_BASE_URL
    || "http://localhost:5003";

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
  ], []);

  const filters = useMemo(() => ({
    searchKeys: ["name", "email", "phone", "country"],
  }), []);

  async function handleView(row) {
    setViewModal({ user: row, accounts: [] });
    setAccountsLoading(true);
    setAccountsError("");
    try {
      const accounts = await Promise.all(
        row.MT5Account.map(async (account) => {
          try {
            const response = await axios.get(`${BASE}/admin/mt5/account/${account.accountId}`, {
              timeout: 5000,
            });
            if (response.data?.ok) {
              const data = response.data.data;
              return {
                accountId: data.Login || account.accountId,
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
                registration: data.Registration || "-",
                lastAccess: data.LastAccess || "-",
                lastIP: data.LastIP || "-",
              };
            } else {
              throw new Error('Failed to fetch');
            }
          } catch (error) {
            console.warn(`Failed to fetch details for account ${account.accountId}:`, error.message);
            return {
              accountId: account.accountId,
              name: "-",
              group: "-",
              balance: 0,
              equity: 0,
              leverage: "-",
              credit: 0,
              margin: 0,
              marginFree: 0,
              marginLevel: 0,
              profit: 0,
              comment: "-",
              city: "-",
              state: "-",
              zipCode: "-",
              address: "-",
              registration: "-",
              lastAccess: "-",
              lastIP: "-",
            };
          }
        })
      );
      setViewModal({ user: row, accounts });
    } catch (e) {
      setAccountsError(e.message || String(e));
    } finally {
      setAccountsLoading(false);
    }
  }

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
            {accountsLoading && <div>Loading account details...</div>}
            {accountsError && <div className="text-rose-700">{accountsError}</div>}
            {!accountsLoading && !accountsError && (
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
                      <th className="border border-gray-300 px-4 py-2">Comment</th>
                      <th className="border border-gray-300 px-4 py-2">City</th>
                      <th className="border border-gray-300 px-4 py-2">State</th>
                      <th className="border border-gray-300 px-4 py-2">Address</th>
                      <th className="border border-gray-300 px-4 py-2">Registration</th>
                      <th className="border border-gray-300 px-4 py-2">Last Access</th>
                      <th className="border border-gray-300 px-4 py-2">Last IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewModal.accounts.map((account, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{account.accountId}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.group}</td>
                        <td className="border border-gray-300 px-4 py-2">${account.balance.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">${account.equity.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.leverage}</td>
                        <td className="border border-gray-300 px-4 py-2">${account.credit.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">${account.margin.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">${account.marginFree.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.marginLevel.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">${account.profit.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.comment}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.city}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.state}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.address}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.registration}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.lastAccess}</td>
                        <td className="border border-gray-300 px-4 py-2">{account.lastIP}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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