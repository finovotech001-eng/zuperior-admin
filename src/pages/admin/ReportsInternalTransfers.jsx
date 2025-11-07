import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

// Admin > Reports > Internal Transfer
export default function ReportsInternalTransfers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE = import.meta.env.VITE_BACKEND_API_URL
    || import.meta.env.VITE_API_BASE_URL
    || "http://localhost:5003";

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError("");
    const token = localStorage.getItem('adminToken');
    fetch(`${BASE}/admin/internal-transfers?limit=500`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async r => {
        if (r.status === 404) {
          const msg = 'Internal transfer API endpoint not available';
          return { ok: false, error: msg };
        }
        return r.json();
      })
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load internal transfers");
        const items = Array.isArray(data.items) ? data.items : [];
        setRows(items.map(t => ({
          id: t.id,
          fromAccount: t.fromAccount || t.from || '-',
          toAccount: t.toAccount || t.to || '-',
          amount: t.amount,
          currency: t.currency || 'USD',
          status: t.status || 'completed',
          note: t.note || t.description || '-',
          createdAt: t.createdAt,
        })));
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE]);

  const columns = useMemo(() => ([
    { key: "__index", label: "Sr No", sortable: false },
    { key: "createdAt", label: "Date", render: v => fmtDate(v) },
    { key: "fromAccount", label: "From MT5" },
    { key: "toAccount", label: "To MT5" },
    { key: "amount", label: "Amount", render: v => `$${Number(v||0).toFixed(2)}` },
    { key: "currency", label: "Currency" },
    { key: "status", label: "Status", render: (v, _row, Badge) => (
      <Badge tone={v === 'completed' ? 'green' : v === 'failed' ? 'red' : 'amber'}>{v}</Badge>
    ) },
    { key: "note", label: "Note" },
  ]), []);

  const filters = useMemo(() => ({
    searchKeys: ["fromAccount","toAccount","status","currency","note"],
    dateKey: "createdAt",
  }), []);

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading internal transfers…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <ProTable
      title="Internal Transfer"
      rows={rows}
      columns={columns}
      filters={filters}
      pageSize={10}
      searchPlaceholder="Search MT5 / status / note"
    />
  );
}
