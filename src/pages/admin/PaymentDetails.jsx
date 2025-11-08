import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";
import ProTable from "../../components/ProTable.jsx";

const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

export default function PaymentDetails() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [q, setQ] = useState("");
  const [admins, setAdmins] = useState({});

  const fmt = (v) => (v ? new Date(v).toLocaleString() : "-");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BASE}/admin/payment-methods?q=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.ok) {
        setPending(data.pending || []);
        setApproved(data.approved || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Load admins to map approvedBy ids to readable name + email
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${BASE}/admin/admins`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data?.ok && Array.isArray(data.admins)) {
          const map = {};
          for (const a of data.admins) map[String(a.id)] = a;
          setAdmins(map);
        }
      } catch {}
    })();
  }, []);

  const approve = async (id) => {
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Approve payment method?',
      showCancelButton: true,
      confirmButtonText: 'Approve'
    });
    if (!confirm.isConfirmed) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE}/admin/payment-methods/${id}/approve`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok && data?.ok) {
      Swal.fire({ icon: 'success', title: 'Approved', timer: 1200, showConfirmButton: false });
      fetchData();
    } else {
      Swal.fire({ icon: 'error', title: 'Failed', text: data?.error || 'Unable to approve' });
    }
  };

  const reject = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Reject payment method?',
      input: 'text',
      inputLabel: 'Reason (optional)',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Reject'
    });
    if (!result.isConfirmed) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE}/admin/payment-methods/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: result.value || '' })
    });
    const data = await res.json();
    if (res.ok && data?.ok) {
      Swal.fire({ icon: 'success', title: 'Rejected', timer: 1200, showConfirmButton: false });
      fetchData();
    } else {
      Swal.fire({ icon: 'error', title: 'Failed', text: data?.error || 'Unable to reject' });
    }
  };

  const Header = () => (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <CreditCard className="h-6 w-6" /> Payment Details
      </h1>
      <p className="text-gray-600">Approve or reject submitted payment methods</p>
    </div>
  );

  const columns = useMemo(() => ([
    { key: "__index", label: "#", sortable: false },
    { key: "user", label: "User", render: (v, r) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{r.user?.name || r.user?.email || r.userId}</div>
        <div className="text-xs text-gray-500">{r.user?.email || '-'}</div>
      </div>
    ) },
    { key: "createdAt", label: "Created", render: (v) => fmt(v) },
    { key: "updatedAt", label: "Updated", render: (v) => fmt(v) },
    { key: "methodType", label: "Method Type" },
    { key: "details", label: "Bank Details", render: (_v, row) => {
      const isBank = (row.methodType === 'bank') || !!(row.bankName || row.accountNumber || row.ifscSwiftCode);
      if (isBank) {
        return (
          <div className="text-xs text-gray-700 whitespace-normal break-words max-w-[520px] leading-tight">
            <div><b>Bank:</b> {row.bankName || '-'}</div>
            <div><b>Account:</b> {row.accountName || '-'} <span className="ml-2"><b>#</b> {row.accountNumber || '-'}</span></div>
            <div><b>IFSC/SWIFT:</b> {row.ifscSwiftCode || '-'}</div>
            <div><b>Type:</b> {row.accountType || '-'}</div>
          </div>
        );
      }
      // Non-bank methods compact details
      return (
        <div className="text-xs text-gray-700 whitespace-normal break-words max-w-[520px] leading-tight">
          <div><b>Address:</b> {row.address || '-'}</div>
          <div><b>Network:</b> {row.network || '-'} <span className="ml-2"><b>Currency:</b> {row.currency || '-'}</span></div>
        </div>
      );
    } },
    { key: "status", label: "Status", render: (v, _r, Badge) => (
      <Badge tone={v === 'approved' ? 'green' : v === 'rejected' ? 'red' : 'amber'}>{v}</Badge>
    ) },
    { key: "approvedAt", label: "Approved At", render: (v) => fmt(v) },
    { key: "approvedBy", label: "Approved By", render: (v) => {
      if (!v) return '-';
      const a = admins[String(v)];
      if (!a) return String(v);
      const name = a.username || a.name || a.email || String(v);
      return `${name} (${a.email})`;
    } },
    { key: "rejectionReason", label: "Rejection Reason", render: (v) => v || '-' },
    { key: "actions", label: "Actions", sortable: false },
  ]), [admins]);

  const pendingColumns = useMemo(() => (
    columns.map(c => (
      c.key === 'actions'
        ? { ...c, render: (_v, row) => (
            <div className="flex items-center gap-4">
              <button onClick={() => approve(row.actions.id)} className="flex items-center gap-1 text-green-600 hover:text-green-700"><CheckCircle2 className="h-4 w-4" /> Approve</button>
              <button onClick={() => reject(row.actions.id)} className="flex items-center gap-1 text-red-600 hover:text-red-700"><XCircle className="h-4 w-4" /> Reject</button>
            </div>
          ) }
        : c
    ))
  ), [columns]);

  const approvedColumns = useMemo(() => (
    columns.map(c => (
      c.key === 'actions'
        ? { ...c, render: (_v, row) => (
            <div className="text-xs text-gray-500">Approved {row.actions.approvedAt ? new Date(row.actions.approvedAt).toLocaleString() : ''}</div>
          ) }
        : c
    ))
  ), [columns]);

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      <Header />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pending Payment Methods</h2>
          <div className="text-sm text-gray-500">{pending.length} items</div>
        </div>
        <div className="p-4">
          <ProTable
            title={null}
            rows={pending.map((r, i) => ({ ...r, __index: i+1, actions: r }))}
            columns={pendingColumns}
            filters={{
              searchKeys: [
                'address','currency','network','status','approvedBy','rejectionReason',
                'methodType','bankName','accountName','accountNumber','ifscSwiftCode','accountType',
                'user.email','user.name'
              ],
              dateKey: 'submittedAt'
            }}
            pageSize={10}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Approved Payment Methods</h2>
          <div className="text-sm text-gray-500">{approved.length} items</div>
        </div>
        <div className="p-4">
          <ProTable
            title={null}
            rows={approved.map((r, i) => ({ ...r, __index: i+1, actions: r }))}
            columns={approvedColumns}
            filters={{
              searchKeys: [
                'address','currency','network','status','approvedBy','rejectionReason',
                'methodType','bankName','accountName','accountNumber','ifscSwiftCode','accountType',
                'user.email','user.name'
              ],
              dateKey: 'submittedAt'
            }}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
