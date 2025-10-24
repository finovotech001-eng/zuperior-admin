import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function fmtAmount(v) {
  return `$${Number(v || 0).toFixed(2)}`;
}

export default function DepositsRejected() {
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
    fetch(`${BASE}/admin/deposits?status=rejected&limit=500`)
      .then(r => r.json())
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load");
        const items = Array.isArray(data.items) ? data.items : [];
        setRows(items.map(d => ({
          id: d.id,
          userId: d.userId,
          userEmail: d.User?.email || "-",
          userName: d.User?.name || "-",
          mt5AccountId: d.MT5Account?.accountId || "-",
          amount: d.amount,
          currency: d.currency,
          method: d.method,
          paymentMethod: d.paymentMethod,
          status: d.status,
          rejectionReason: d.rejectionReason,
          rejectedAt: d.rejectedAt,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })));
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE]);

  const columns = useMemo(() => [
    { key: "__index", label: "Sr No", sortable: false },
    { key: "userEmail", label: "User Email" },
    { key: "userName", label: "User Name" },
    { key: "mt5AccountId", label: "MT5 Account ID" },
    { key: "amount", label: "Amount", render: (v) => fmtAmount(v) },
    { key: "currency", label: "Currency" },
    { key: "method", label: "Method" },
    { key: "paymentMethod", label: "Payment Method" },
    { key: "status", label: "Status", render: (v, row, Badge) => (
      <Badge tone="red">{v}</Badge>
    ) },
    { key: "rejectionReason", label: "Rejection Reason" },
    { key: "rejectedAt", label: "Rejected At", render: (v) => fmtDate(v) },
    { key: "createdAt", label: "Created", render: (v) => fmtDate(v) },
  ], []);

  const filters = useMemo(() => ({
    searchKeys: ["userEmail", "userName", "mt5AccountId", "method", "paymentMethod", "rejectionReason"],
  }), []);

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading deposits…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <ProTable
      title="Rejected Deposits"
      rows={rows}
      columns={columns}
      filters={filters}
      searchPlaceholder="Search user email, name, MT5 ID, method…"
      pageSize={10}
    />
  );
}