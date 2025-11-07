import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

export default function ReportsAdminTransactions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE = import.meta.env.VITE_BACKEND_API_URL
    || import.meta.env.VITE_API_BASE_URL
    || "http://localhost:5003";

  useEffect(() => {
    let stop = false;
    setLoading(true); setError("");
    const token = localStorage.getItem('adminToken');
    const params = new URLSearchParams({ limit: '500' }).toString();
    fetch(`${BASE}/admin/admin-transactions?${params}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async r => {
        try {
          if (!r.ok) return { ok: true, items: [], total: 0 };
          const ct = r.headers.get('content-type') || '';
          if (!ct.includes('application/json')) return { ok: true, items: [], total: 0 };
          return await r.json();
        } catch { return { ok: true, items: [], total: 0 }; }
      })
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || 'Failed to load');
        const items = Array.isArray(data.items) ? data.items : [];
        setRows(items.map(t => ({
          createdAt: t.created_at,
          operation: t.operation_type,
          mt5Login: t.mt5_login,
          amount: t.amount,
          currency: t.currency || 'USD',
          status: t.status,
          admin: t.admin_email ? `${t.admin_email} (${t.admin_role || 'admin'})` : t.admin_id,
          userEmail: t.user_email || '-',
          userName: t.user_name || '-',
          externalId: t.external_transaction_id || '-',
          comment: t.comment || '-',
        })));
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE]);

  const columns = useMemo(() => ([
    { key: "__index", label: "Sr No", sortable: false },
    { key: "createdAt", label: "Date", render: v => fmtDate(v) },
    { key: "operation", label: "Operation" },
    { key: "mt5Login", label: "MT5 Login" },
    { key: "amount", label: "Amount", render: v => `$${Number(v||0).toFixed(2)}` },
    { key: "currency", label: "Currency" },
    { key: "status", label: "Status", render: (v, _r, Badge) => (
      <Badge tone={v === 'completed' ? 'green' : v === 'pending' ? 'amber' : 'red'}>{v}</Badge>
    ) },
    { key: "admin", label: "Performed By" },
    { key: "userEmail", label: "User Email" },
    { key: "userName", label: "User Name" },
    { key: "externalId", label: "Transaction ID" },
    { key: "comment", label: "Comment" },
  ]), []);

  const filters = useMemo(() => ({
    searchKeys: ["operation","mt5Login","status","admin","userEmail","userName","externalId","comment"],
    selects: [
      { key: "operation", label: "All Ops", options: ["deposit","withdraw","bonus_add","bonus_deduct"] },
      { key: "status", label: "All Status", options: ["completed","pending","failed"] },
    ],
    dateKey: "createdAt",
  }), []);

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading admin transactions…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <ProTable
      title="Admin Transactions"
      rows={rows}
      columns={columns}
      filters={filters}
      pageSize={10}
      searchPlaceholder="Search op/login/admin/user/tx"
    />
  );
}
