import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";
import Badge from "../../components/Badge.jsx";

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function fmtAmount(v) {
  return v ? `$${Number(v || 0).toFixed(2)}` : "-";
}

export default function BulkLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    from: "",
    to: "",
    search: "",
  });

  const BASE = import.meta.env.VITE_BACKEND_API_URL
    || import.meta.env.VITE_API_BASE_URL
    || "http://localhost:5003";

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      limit: '500',
      ...(filters.type !== 'all' ? { type: filters.type } : {}),
      ...(filters.status !== 'all' ? { status: filters.status } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    });

    fetch(`${BASE}/admin/activity-logs?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load");
        const items = Array.isArray(data.items) ? data.items : [];
        setRows(items.map((item, index) => ({
          ...item,
          __index: index + 1,
        })));

        // Extract recent activities for cards
        const deposits = items.filter(i => i.type === 'Deposit').slice(0, 5);
        const withdrawals = items.filter(i => i.type === 'Withdrawal').slice(0, 5);
        const accounts = items.filter(i => i.type === 'Account').slice(0, 5);

        setRecentDeposits(deposits);
        setRecentWithdrawals(withdrawals);
        setRecentAccounts(accounts);
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE, filters]);

  const columns = useMemo(() => [
    { key: "__index", label: "Sr No", sortable: false },
    { key: "time", label: "Time", render: (v) => fmtDate(v) },
    { key: "type", label: "Type" },
    { key: "user", label: "User" },
    { key: "mts", label: "MTS" },
    { key: "amount", label: "Amount", render: (v) => fmtAmount(v) },
    { key: "status", label: "Status", render: (v, row, Badge) => {
      let tone = 'gray';
      if (v === 'Approved' || v === 'Opened') tone = 'green';
      else if (v === 'Rejected') tone = 'red';
      else if (v === 'Pending') tone = 'amber';
      return <Badge tone={tone}>{v}</Badge>;
    } },
    { key: "details", label: "Details" },
  ], []);

  const tableFilters = useMemo(() => ({
    searchKeys: ["user", "userName", "mts", "details", "status"],
  }), []);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading logs…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Operation Logs</h1>
        <p className="text-gray-600 mt-1">Monitor all CRM activities and operations</p>
      </div>

      {/* Cards for Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Recent Deposits */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Deposits</h3>
          </div>
          <div className="space-y-4">
            {recentDeposits.length > 0 ? recentDeposits.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString()} • MTS: {item.mts}
                    </div>
                    {item.details && item.details !== '-' && (
                      <div className="text-xs text-gray-400 mt-1">Txn: {item.details}</div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900">{fmtAmount(item.amount)}</div>
                    <Badge tone={item.status === 'Approved' ? 'green' : item.status === 'Pending' ? 'amber' : 'red'}>
                      {item.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No recent deposits</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Showing last 5 results</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all</button>
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Withdrawals</h3>
          </div>
          <div className="space-y-4">
            {recentWithdrawals.length > 0 ? recentWithdrawals.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString()} • MTS: {item.mts}
                    </div>
                    {item.details && item.details !== '-' && (
                      <div className="text-xs text-gray-400 mt-1">Txn: {item.details}</div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900">{fmtAmount(item.amount)}</div>
                    <Badge tone={item.status === 'Approved' ? 'green' : item.status === 'Pending' ? 'amber' : 'red'}>
                      {item.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No recent withdrawals</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Showing last 5 results</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all</button>
          </div>
        </div>

        {/* Recent Accounts Opened */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Accounts Opened</h3>
          </div>
          <div className="space-y-4">
            {recentAccounts.length > 0 ? recentAccounts.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">MTS: {item.mts}</div>
                  </div>
                  <div className="text-right ml-4">
                    <Badge tone="green">Opened</Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No recent accounts</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Showing last 5 results</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange({ type: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="account">Account</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="opened">Opened</option>
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange({ from: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange({ to: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
            placeholder="To"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
            placeholder="Search email / MTS / txn"
          />
        </div>
      </div>

      {/* Table */}
      <ProTable
        title="Activity Logs"
        rows={rows}
        columns={columns}
        filters={tableFilters}
        searchPlaceholder="Search user, MTS, details…"
        pageSize={10}
      />
    </div>
  );
}