import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";
import Badge from "../../components/Badge.jsx";
import Modal from "../../components/Modal.jsx";
import { Send, Users, Mail, Image, Eye, CheckCircle } from "lucide-react";

function fmtAmount(v) {
  return v ? `$${Number(v || 0).toFixed(2)}` : "-";
}

export default function SendEmails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Email composition state
  const [emailData, setEmailData] = useState({
    recipients: 'filtered', // 'filtered' or 'selected'
    subject: '',
    body: '',
    isHtml: true,
    imageUrl: '',
  });

  // Filters state
  const [filters, setFilters] = useState({
    balanceMin: '',
    balanceMax: '',
    emailVerified: 'all',
    status: 'all',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = () => {
    let stop = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      limit: '500',
      ...(filters.balanceMin ? { balanceMin: filters.balanceMin } : {}),
      ...(filters.balanceMax ? { balanceMax: filters.balanceMax } : {}),
      ...(filters.emailVerified !== 'all' ? { emailVerified: filters.emailVerified } : {}),
      ...(filters.status !== 'all' ? { status: filters.status } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    });

    const token = localStorage.getItem('adminToken');
    fetch(`/api/admin/users/filtered?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load");
        setUsers(data.users || []);
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSelectedUsers([]); // Clear selection when filters change
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.body) {
      alert('Please fill in subject and body');
      return;
    }

    const recipients = emailData.recipients === 'filtered'
      ? users.map(u => u.id)
      : selectedUsers;

    if (recipients.length === 0) {
      alert('No recipients selected');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/admin/send-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject: emailData.subject,
          body: emailData.body,
          isHtml: emailData.isHtml,
          imageUrl: emailData.imageUrl,
          filters: emailData.recipients === 'filtered' ? filters : {},
        }),
      });

      const data = await response.json();
      if (!data?.ok) throw new Error(data?.error || 'Failed to send emails');

      setSendResult({
        success: true,
        message: data.message,
        count: data.recipientsCount,
      });
      setShowPreview(false);

      // Reset form
      setEmailData({
        recipients: 'filtered',
        subject: '',
        body: '',
        isHtml: true,
        imageUrl: '',
      });
      setSelectedUsers([]);

    } catch (error) {
      setSendResult({
        success: false,
        message: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={selectedUsers.length === users.length && users.length > 0}
          onChange={handleSelectAll}
        />
      ),
      sortable: false,
      render: (v, row) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(row.id)}
          onChange={() => handleSelectUser(row.id)}
        />
      ),
    },
    { key: "email", label: "Email" },
    { key: "name", label: "Name" },
    { key: "balance", label: "Balance", render: (v) => fmtAmount(v) },
    {
      key: "emailVerified",
      label: "Verified",
      render: (v, row, Badge) => (
        <Badge tone={v ? 'green' : 'red'}>
          {v ? 'Verified' : 'Unverified'}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v, row, Badge) => (
        <Badge tone={v === 'active' ? 'green' : 'red'}>
          {v}
        </Badge>
      ),
    },
  ], [selectedUsers, users]);

  const tableFilters = useMemo(() => ({
    searchKeys: ["email", "name"],
  }), []);

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading users…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Emails</h1>
        <p className="text-gray-600 mt-1">Send emails to users with advanced filtering options</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Filter Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Balance</label>
            <input
              type="number"
              value={filters.balanceMin}
              onChange={(e) => handleFilterChange({ balanceMin: e.target.value })}
              className="w-full rounded-md border border-gray-300 h-10 px-3"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Balance</label>
            <input
              type="number"
              value={filters.balanceMax}
              onChange={(e) => handleFilterChange({ balanceMax: e.target.value })}
              className="w-full rounded-md border border-gray-300 h-10 px-3"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Status</label>
            <select
              value={filters.emailVerified}
              onChange={(e) => handleFilterChange({ emailVerified: e.target.value })}
              className="w-full rounded-md border border-gray-300 h-10 px-3"
            >
              <option value="all">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="w-full rounded-md border border-gray-300 h-10 px-3"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full rounded-md border border-gray-300 h-10 px-3"
              placeholder="Email or name"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">{users.length} users found</span>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <ProTable
        title={`Users (${users.length})`}
        rows={users}
        columns={columns}
        filters={tableFilters}
        searchPlaceholder="Search users…"
        pageSize={10}
      />

      {/* Email Composer */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Compose Email</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={16} />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>

        {/* Recipients Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="filtered"
                checked={emailData.recipients === 'filtered'}
                onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                className="mr-2"
              />
              All filtered users ({users.length})
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="selected"
                checked={emailData.recipients === 'selected'}
                onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                className="mr-2"
              />
              Selected users ({selectedUsers.length})
            </label>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full rounded-md border border-gray-300 h-10 px-3"
            placeholder="Email subject"
          />
        </div>

        {/* Email Format Toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={emailData.isHtml}
              onChange={(e) => setEmailData(prev => ({ ...prev, isHtml: e.target.checked }))}
              className="mr-2"
            />
            HTML Email (supports formatting and images)
          </label>
        </div>

        {/* Body */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message {emailData.isHtml ? '(HTML)' : '(Text)'} *
          </label>
          <textarea
            value={emailData.body}
            onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder={emailData.isHtml ? "HTML email content..." : "Text email content..."}
          />
        </div>

        {/* Image URL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            type="url"
            value={emailData.imageUrl}
            onChange={(e) => setEmailData(prev => ({ ...prev, imageUrl: e.target.value }))}
            className="w-full rounded-md border border-gray-300 h-10 px-3"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Preview Modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Email Preview">
        <div className="space-y-4">
          <div>
            <strong>Recipients:</strong> {
              emailData.recipients === 'filtered'
                ? `${users.length} filtered users`
                : `${selectedUsers.length} selected users`
            }
          </div>
          <div>
            <strong>Subject:</strong> {emailData.subject}
          </div>
          <div>
            <strong>Format:</strong> {emailData.isHtml ? 'HTML' : 'Text'}
          </div>
          {emailData.imageUrl && (
            <div>
              <strong>Image:</strong> {emailData.imageUrl}
            </div>
          )}
          <div>
            <strong>Message:</strong>
            <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
              {emailData.isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: emailData.body }} />
              ) : (
                <pre className="whitespace-pre-wrap">{emailData.body}</pre>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Send Result Modal */}
      <Modal open={!!sendResult} onClose={() => setSendResult(null)} title="Send Result">
        <div className="space-y-4">
          {sendResult?.success ? (
            <>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-semibold">Emails sent successfully!</span>
              </div>
              <p>{sendResult.message}</p>
              <p className="text-sm text-gray-600">
                {sendResult.count} users received the email.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-red-600">
                <span className="font-semibold">Failed to send emails</span>
              </div>
              <p>{sendResult?.message}</p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}