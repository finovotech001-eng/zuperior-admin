import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";
import Modal from "../../components/Modal.jsx";
import { CheckCircle, XCircle, Eye } from "lucide-react";

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
  const [confirmReject, setConfirmReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
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
          bankDetails: d.bankDetails,
          cryptoAddress: d.cryptoAddress,
          depositAddress: d.depositAddress,
          status: d.status,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })));
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE]);

  // Bank details are now provided by backend joined with manual_gateway per user country

  const columns = useMemo(() => [
    { key: "__index", label: "Sr No", sortable: false },
    { key: "userEmail", label: "User Email" },
    { key: "userName", label: "User Name" },
    { key: "mt5AccountId", label: "MT5 Account ID" },
    { key: "amount", label: "Amount", render: (v) => fmtAmount(v) },
    { key: "currency", label: "Currency" },
    // Combine payment method and bank details compactly under "Payment Method"
    { key: "payment", label: "Payment Method", render: (_v, row) => {
      const method = row.bankDetails ? 'Bank Transfer' : (row.paymentMethod || row.method || '-');
      const raw = row.bankDetails || '';
      // Split bank details by " | " and render 2 items per visual row using a grid
      const parts = raw ? String(raw).split(' | ').map(s => s.trim()).filter(Boolean) : [];
      const pairs = [];
      for (let i = 0; i < parts.length; i += 2) {
        pairs.push([parts[i], parts[i + 1] || '']);
      }
      return (
        <div className="leading-tight">
          <div className="text-gray-900 text-sm font-medium">{method}</div>
          {parts.length ? (
            <div className="text-xs text-gray-600 max-w-[520px]">
              {pairs.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-1/2 pr-2 truncate" title={p[0]}>{p[0]}</span>
                  <span className="w-1/2 truncate" title={p[1]}>{p[1]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400">-</div>
          )}
        </div>
      );
    } },
    { key: "status", label: "Status", render: (v, row, Badge) => (
      <Badge tone="amber">{v}</Badge>
    ) },
    { key: "createdAt", label: "Created", render: (v) => fmtDate(v) },
    { key: "actions", label: "Actions", sortable: false, render: (v, row) => (
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={() => setConfirmApprove(row)}
          disabled={approving || rejecting}
          className="h-8 w-8 grid place-items-center rounded-md border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
          title="Approve Deposit"
        >
          <CheckCircle size={16} />
        </button>
        <button
          onClick={() => { setConfirmReject(row); setRejectReason(""); }}
          disabled={approving || rejecting}
          className="h-8 w-8 grid place-items-center rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
          title="Reject Deposit"
        >
          <XCircle size={16} />
        </button>
      </div>
    ) },
  ], []);

  const filters = useMemo(() => ({
    searchKeys: ["userEmail", "userName", "mt5AccountId", "paymentMethod"],
  }), []);

  async function onApprove(row) {
    setApproving(true);
    try {
      // Approve the deposit (this will handle MT5 balance addition internally)
      const r = await fetch(`${BASE}/admin/deposits/${row.id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || 'Failed to approve');
      
      setRows(list => list.filter(it => it.id !== row.id));
      setConfirmApprove(null);
      setSuccessMessage(data.message || 'Deposit approved successfully.');
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setApproving(false);
    }
  }

  async function onReject(row) {
    setRejecting(true);
    try {
      const r = await fetch(`${BASE}/admin/deposits/${row.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || 'Failed to reject');
      setRows(list => list.filter(it => it.id !== row.id));
      setConfirmReject(null);
      setRejectReason("");
      setSuccessMessage(data.message || 'Deposit rejected successfully.');
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setRejecting(false);
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

      {/* Reject Confirm */}
      <Modal open={!!confirmReject} onClose={() => { if (!rejecting) setConfirmReject(null); }} title="Reject Deposit">
        {confirmReject && (
          <div className="space-y-4">
            <p>Provide a reason and confirm rejection of <b>{fmtAmount(confirmReject.amount)}</b> for <b>{confirmReject.userEmail}</b>.</p>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Rejection Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Reason for rejection"
                disabled={rejecting}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmReject(null)} disabled={rejecting} className="px-4 h-10 rounded-md border disabled:opacity-50">Cancel</button>
              <button
                onClick={() => onReject(confirmReject)}
                disabled={rejecting}
                className="px-4 h-10 rounded-md bg-red-600 text-white disabled:bg-gray-400"
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
