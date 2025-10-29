import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Headphones, Send, UserPlus, CheckCircle2, RotateCcw } from 'lucide-react';

const BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5003';

export default function SupportTicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [internal, setInternal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE}/admin/support/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data?.ok) { setTicket(data.ticket); setReplies(data.replies); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const assignToMe = async () => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE}/admin/support/tickets/${id}/assign`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok && data?.ok) { Swal.fire({ icon: 'success', title: 'Assigned', timer: 1200, showConfirmButton: false }); fetchData(); }
    else Swal.fire({ icon: 'error', title: 'Failed', text: data?.error || 'Could not assign' });
  };

  const updateStatus = async (status) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE}/admin/support/tickets/${id}/status`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const data = await res.json();
    if (res.ok && data?.ok) { Swal.fire({ icon: 'success', title: 'Updated', timer: 1000, showConfirmButton: false }); fetchData(); }
    else Swal.fire({ icon: 'error', title: 'Failed', text: data?.error || 'Could not update status' });
  };

  const sendReply = async () => {
    if (!message.trim()) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE}/admin/support/tickets/${id}/replies`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: message, is_internal: internal }) });
    const data = await res.json();
    if (res.ok && data?.ok) { setMessage(''); setInternal(false); fetchData(); }
    else Swal.fire({ icon: 'error', title: 'Failed', text: data?.error || 'Could not send reply' });
  };

  if (loading || !ticket) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Headphones className="h-6 w-6" /> {ticket.title || '(No subject)'}</h1>
          <p className="text-gray-600 text-sm">{ticket.user_name || ticket.user_email} • Created {new Date(ticket.created_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={assignToMe} className="px-3 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><UserPlus className="h-4 w-4" /> Assign to me</button>
          {String(ticket.status).toLowerCase() === 'closed' ? (
            <button onClick={() => updateStatus('open')} className="px-3 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Reopen</button>
          ) : (
            <button onClick={() => updateStatus('closed')} className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Close</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-gray-200 font-semibold">Conversation</div>
          <div className="p-4 sm:p-6 space-y-4">
            {replies.map((r, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${r.sender_type === 'admin' ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-xs text-gray-500 mb-1">{r.sender_name} • {new Date(r.created_at).toLocaleString()} {r.is_internal ? '• internal' : ''}</div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">{r.content}</div>
              </div>
            ))}
          </div>
          <div className="p-4 sm:p-6 border-t border-gray-200">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Write a reply..." />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note</label>
              <button onClick={sendReply} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"><Send className="h-4 w-4" /> Send</button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-gray-200 font-semibold">Details</div>
          <div className="p-4 sm:p-6 space-y-2 text-sm">
            <div><span className="text-gray-500">Status: </span><span className="font-medium">{ticket.status}</span></div>
            <div><span className="text-gray-500">Priority: </span><span className="font-medium">{ticket.priority || 'normal'}</span></div>
            <div><span className="text-gray-500">Assigned to: </span><span className="font-medium">{ticket.assigned_to || '-'}</span></div>
            <div><span className="text-gray-500">Account: </span><span className="font-medium">{ticket.account_number || '-'}</span></div>
            <div><span className="text-gray-500">Tags: </span><span className="font-medium">{Array.isArray(ticket.tags) ? ticket.tags.join(', ') : '-'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

