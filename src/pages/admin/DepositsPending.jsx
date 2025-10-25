import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";
import Modal from "../../components/Modal.jsx";
import { CheckCircle, Eye } from "lucide-react";

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function fmtAmount(v) {
  return `$${Number(v || 0).toFixed(2)}`;
}

export default function DepositsPending() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [approving, setApproving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError("");
    const token = localStorage.getItem('adminToken');
    fetch(`${BASE}/admin/deposits?status=pending&limit=500`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
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
      <Badge tone="amber">{v}</Badge>
    ) },
    { key: "createdAt", label: "Created", render: (v) => fmtDate(v) },
    { key: "actions", label: "Actions", sortable: false, render: (v, row) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setConfirmApprove(row)}
          className="h-8 w-8 grid place-items-center rounded-md border border-green-200 text-green-700 hover:bg-green-50"
          title="Approve Deposit"
        >
          <CheckCircle size={16} />
        </button>
      </div>
    ) },
  ], []);

  const filters = useMemo(() => ({
    searchKeys: ["userEmail", "userName", "mt5AccountId", "method", "paymentMethod"],
  }), []);

  async function onApprove(row) {
    setApproving(true);
    try {
      // First, add balance to MT5 account
      if (row.mt5AccountId && row.mt5AccountId !== "-") {
        const mt5Response = await fetch(`${BASE}/admin/mt5/balance/add/${row.mt5AccountId}`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            balance: parseFloat(row.amount),
            comment: `Deposit approval - Transaction ID: ${row.id}`
          })
        });
        
        const mt5Data = await mt5Response.json();
        if (!mt5Data.Success) {
          throw new Error(mt5Data.Error || 'Failed to add balance to MT5 account');
        }
      }

      // Then approve the deposit in the system
      const r = await fetch(`${BASE}/admin/deposits/${row.id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || 'Failed to approve');
      
      setRows(list => list.filter(it => it.id !== row.id));
      setConfirmApprove(null);
      setSuccessMessage(data.message || 'Deposit approved and MT5 balance updated successfully.');
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setApproving(false);
    }
  }

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading deposits…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <>
      <ProTable
        title="Pending Deposits"
        rows={rows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search user email, name, MT5 ID, method…"
        pageSize={10}
      />

      {/* Approve Confirm */}
      <Modal open={!!confirmApprove} onClose={() => setConfirmApprove(null)} title="Approve Deposit">
        {confirmApprove && (
          <div className="space-y-4">
            <p>Do you want to approve the deposit of <b>{fmtAmount(confirmApprove.amount)}</b> for <b>{confirmApprove.userEmail}</b>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmApprove(null)} className="px-4 h-10 rounded-md border">Cancel</button>
              <button
                onClick={() => onApprove(confirmApprove)}
                disabled={approving}
                className="px-4 h-10 rounded-md bg-green-600 text-white disabled:bg-gray-400"
              >
                {approving ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
    </>
  );
}