// src/pages/admin/UsersAll.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProTable from "../../components/ProTable.jsx";
import Modal from "../../components/Modal.jsx";
import { Pencil, Trash2, MailCheck, MailX, Eye, UserX, UserCheck } from "lucide-react";
import Swal from "sweetalert2";

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function UsersAll({ initialTitle = 'All Users', queryParams = {} }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // row
  const [confirmDel, setConfirmDel] = useState(null); // row
  const [confirmVerify, setConfirmVerify] = useState(null); // {row,next}
  const [confirmBan, setConfirmBan] = useState(null); // {row,next}
  const navigate = useNavigate();

  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError("");
    const search = new URLSearchParams({ limit: '500', ...Object.fromEntries(Object.entries(queryParams).map(([k,v])=>[k,String(v)])) });
    const token = localStorage.getItem('adminToken');
    fetch(`${BASE}/admin/users/all?${search.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load");
        const items = Array.isArray(data.items) ? data.items : [];
        setRows(items.map(u => ({
          id: u.id,
          clientId: u.clientId,
          name: u.name || "-",
          email: u.email,
          phone: u.phone || "-",
          country: u.country || "-",
          role: u.role,
          status: u.status,
          emailVerified: u.emailVerified ? "Yes" : "No",
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
        })));
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE, JSON.stringify(queryParams)]);

  const columns = useMemo(() => [
    { key: "__index", label: "Sr No", sortable: false },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "country", label: "Country" },
    { key: "status", label: "Status", render: (v, row, Badge) => (
      <Badge tone={v === 'active' ? 'green' : 'red'}>{v}</Badge>
    ) },
    { key: "emailVerified", label: "Email Verified", render: (v, row, Badge) => (
      <Badge tone={v === 'Yes' ? 'green' : 'amber'}>{v}</Badge>
    ) },
    { key: "createdAt", label: "Created", render: (v) => fmtDate(v) },
    { key: "lastLoginAt", label: "Last Login", render: (v) => fmtDate(v) },
    { key: "actions", label: "Actions", sortable: false, render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => navigate(`/admin/users/${row.id}`)}
            className="h-8 w-8 grid place-items-center rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <span className="text-xs text-gray-500">View</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setEditing(row)}
            className="h-8 w-8 grid place-items-center rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <span className="text-xs text-gray-500">Edit</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setConfirmBan({ row, next: row.status === 'banned' ? 'active' : 'banned' })}
            className="h-8 w-8 grid place-items-center rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50"
            title={row.status === 'banned' ? 'Unban User' : 'Ban User'}
          >
            {row.status === 'banned' ? <UserCheck size={16} /> : <UserX size={16} />}
          </button>
          <span className="text-xs text-gray-500">{row.status === 'banned' ? 'Unban' : 'Ban'}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setConfirmVerify({ row, next: row.emailVerified !== 'Yes' })}
            className="h-8 w-8 grid place-items-center rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50"
            title={row.emailVerified === 'Yes' ? 'Unverify Email' : 'Verify Email'}
          >
            {row.emailVerified === 'Yes' ? <MailX size={16} /> : <MailCheck size={16} />}
          </button>
          <span className="text-xs text-gray-500">{row.emailVerified === 'Yes' ? 'Unverify' : 'Verify'}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setConfirmDel(row)}
            className="h-8 w-8 grid place-items-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <span className="text-xs text-gray-500">Delete</span>
        </div>
      </div>
    ) },
  ], []);

  const filters = useMemo(() => ({
    searchKeys: ["name","email","phone","country","status"],
  }), []);

  async function onToggleVerify(row) {
    try {
      const next = row.emailVerified !== 'Yes';
      const token = localStorage.getItem('adminToken');
      const r = await fetch(`${BASE}/admin/users/${row.id}/email-verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ verified: next })
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || 'Failed');
      setRows(list => list.map(it => it.id===row.id ? { ...it, emailVerified: next ? 'Yes' : 'No' } : it));
      setConfirmVerify(null);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Email ${next ? 'verified' : 'unverified'} successfully`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: e.message || String(e)
      });
    }
  }

  async function onDelete(row) {
    try {
      const token = localStorage.getItem('adminToken');
      const r = await fetch(`${BASE}/admin/users/${row.id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Check if response is ok
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${r.status} ${r.statusText}`);
      }
      
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || 'Delete failed');
      
      setRows(list => list.filter(it => it.id!==row.id));
      setConfirmDel(null);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data.message || 'User deleted successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      console.error('Delete user error:', e);
      setConfirmDel(null);
      
      // Show error message with more details
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed!',
        text: e.message || 'Failed to delete user. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  }

  async function onEditSubmit(state) {
    try {
      const token = localStorage.getItem('adminToken');
      const r = await fetch(`${BASE}/admin/users/${state.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: state.name, phone: state.phone, country: state.country, status: state.status })
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || 'Failed');
      setRows(list => list.map(it => it.id===state.id ? { ...it, name: state.name, phone: state.phone, country: state.country, status: state.status } : it));
      setEditing(null);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User updated successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: e.message || String(e)
      });
    }
  }

  async function onToggleBan(row, nextStatus) {
    try {
      const next = nextStatus || (row.status === 'banned' ? 'active' : 'banned');
      const token = localStorage.getItem('adminToken');
      const r = await fetch(`${BASE}/admin/users/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: next })
      });
      const data = await r.json();
      if (!data?.ok) throw new Error(data?.error || 'Failed');
      setRows(list => {
        const updated = list.map(it => it.id === row.id ? { ...it, status: next } : it);
        // If this page is filtered by status and the row no longer matches, drop it
        if (queryParams && queryParams.status) {
          return updated.filter(u => String(u.status) === String(queryParams.status));
        }
        return updated;
      });
      setConfirmBan(null);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `User ${next === 'banned' ? 'banned' : 'unbanned'} successfully`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: e.message || String(e)
      });
    }
  }

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading users…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <>
      <ProTable
        title={initialTitle}
        rows={rows}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search name / email / phone / country / status…"
        pageSize={10}
      />

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Edit User">
        {editing && (
          <UserEditForm
            user={editing}
            onCancel={()=>setEditing(null)}
            onSubmit={onEditSubmit}
          />
        )}
      </Modal>

      {/* Verify Confirm */}
      <Modal open={!!confirmVerify} onClose={()=>setConfirmVerify(null)} title="Confirm Email Verification">
        {confirmVerify && (
          <div className="space-y-4">
            <p>Do you want to {confirmVerify.next ? 'verify' : 'unverify'} email for <b>{confirmVerify.row.email}</b>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setConfirmVerify(null)} className="px-4 h-10 rounded-md border">Cancel</button>
              <button onClick={()=>onToggleVerify(confirmVerify.row)} className="px-4 h-10 rounded-md bg-violet-600 text-white">Confirm</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Ban/Unban Confirm */}
      <Modal open={!!confirmBan} onClose={()=>setConfirmBan(null)} title={confirmBan?.next==='banned'? 'Ban User' : 'Unban User'}>
        {confirmBan && (
          <div className="space-y-4">
            <p>
              Do you want to {confirmBan.next === 'banned' ? 'ban' : 'unban'} user <b>{confirmBan.row.email}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setConfirmBan(null)} className="px-4 h-10 rounded-md border">Cancel</button>
              <button onClick={()=>onToggleBan(confirmBan.row, confirmBan.next)} className={`px-4 h-10 rounded-md ${confirmBan.next==='banned' ? 'bg-rose-600' : 'bg-emerald-600'} text-white`}>
                Confirm
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDel} onClose={()=>setConfirmDel(null)} title="Delete User">
        {confirmDel && (
          <div className="space-y-4">
            <p>Are you sure you want to delete <b>{confirmDel.email}</b>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setConfirmDel(null)} className="px-4 h-10 rounded-md border">Cancel</button>
              <button onClick={()=>onDelete(confirmDel)} className="px-4 h-10 rounded-md bg-rose-600 text-white">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function UserEditForm({ user, onCancel, onSubmit }) {
  const [state, setState] = useState({
    id: user.id,
    name: user.name || "",
    phone: user.phone || "",
    country: user.country || "",
    status: user.status || "active",
  });
  return (
    <form onSubmit={e=>{e.preventDefault(); onSubmit(state);}} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-600">Name</label>
          <input value={state.name} onChange={e=>setState({...state,name:e.target.value})}
                 className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Email</label>
          <input value={user.email} disabled className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Phone</label>
          <input value={state.phone} onChange={e=>setState({...state,phone:e.target.value})}
                 className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Country</label>
          <input value={state.country} onChange={e=>setState({...state,country:e.target.value})}
                 className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Status</label>
          <select value={state.status} onChange={e=>setState({...state,status:e.target.value})}
                  className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="banned">banned</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 h-10 rounded-md border">Cancel</button>
        <button type="submit" className="px-4 h-10 rounded-md bg-violet-600 text-white">Save Changes</button>
      </div>
    </form>
  );
}
