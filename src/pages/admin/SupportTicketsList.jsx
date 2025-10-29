import { useEffect, useState } from 'react';
import { Headphones, Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5003';

export default function SupportTicketsList({ status }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [counts, setCounts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE}/admin/support/tickets?status=${status}&q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data?.ok) {
      setItems(data.items || []);
      setCounts(data.counts || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [status]);

  const titleMap = {
    opened: 'Opened Tickets',
    pending: 'Pending Tickets',
    closed: 'Closed Tickets',
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Headphones className="h-6 w-6" /> {titleMap[status]}
        </h1>
        <p className="text-gray-600">Manage and respond to customer support tickets</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            placeholder="Search ticket subject, description, or email"
            className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button onClick={fetchData} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Search</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td className="px-6 py-6 text-center text-gray-500" colSpan={6}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-6 py-6 text-center text-gray-500" colSpan={6}>No tickets</td></tr>
              ) : (
                items.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3">
                      <div className="text-sm font-medium text-gray-900">{t.title || '(No subject)'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[280px]">{t.description}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <div className="text-sm font-medium text-gray-900">{t.user_name || t.user_email || t.parent_id}</div>
                      <div className="text-xs text-gray-500">{t.user_email}</div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${ (t.priority||'normal').toLowerCase()==='urgent' ? 'bg-red-100 text-red-800' : (t.priority||'normal').toLowerCase()==='high' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800' }`}>
                        {t.priority || 'normal'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 text-sm text-gray-800">{t.assigned_to || '-'}</td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-gray-800">{t.updated_at ? new Date(t.updated_at).toLocaleString() : new Date(t.created_at).toLocaleString()}</td>
                    <td className="px-3 sm:px-6 py-3 text-sm">
                      <Link to={`/admin/support/tickets/${t.id}`} className="flex flex-col items-center text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                        <small className="text-[10px] leading-3 mt-1">View</small>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

