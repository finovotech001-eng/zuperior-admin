import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";

const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

export default function PaymentDetails() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [q, setQ] = useState("");

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

  const Table = ({ title, rows, actions }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-500">{rows.length} item{rows.length === 1 ? '' : 's'}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.user?.name || r.user?.email || r.userId}</div>
                  <div className="text-xs text-gray-500">{r.user?.email}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 text-sm text-gray-800 break-all">{r.address}</td>
                <td className="px-3 sm:px-6 py-3 text-sm">{r.currency}</td>
                <td className="px-3 sm:px-6 py-3 text-sm">{r.network}</td>
                <td className="px-3 sm:px-6 py-3 text-sm">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</td>
                <td className="px-3 sm:px-6 py-3 text-sm">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 text-sm">
                  {actions(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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

      <Table
        title="Pending Payment Methods"
        rows={pending}
        actions={(r) => (
          <div className="flex items-end gap-6">
            <button onClick={() => approve(r.id)} className="flex flex-col items-center text-green-600 hover:text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <small className="text-[10px] leading-3 mt-1">Approve</small>
            </button>
            <button onClick={() => reject(r.id)} className="flex flex-col items-center text-red-600 hover:text-red-700">
              <XCircle className="h-4 w-4" />
              <small className="text-[10px] leading-3 mt-1">Reject</small>
            </button>
          </div>
        )}
      />

      <Table
        title="Approved Payment Methods"
        rows={approved}
        actions={(r) => (
          <div className="text-xs text-gray-500">
            Approved {r.approvedAt ? new Date(r.approvedAt).toLocaleString() : ''}
          </div>
        )}
      />
    </div>
  );
}

