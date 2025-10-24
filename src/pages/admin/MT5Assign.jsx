// src/pages/admin/MT5Assign.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function MT5Assign() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [accountInfo, setAccountInfo] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const [formData, setFormData] = useState({
    userId: "",
    accountId: "",
    password: "",
  });

  const BASE = import.meta.env.VITE_BACKEND_API_URL
    || import.meta.env.VITE_API_BASE_URL
    || "http://localhost:5003";

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError("");
    fetch(`${BASE}/admin/users/all?limit=500`)
      .then(r => r.json())
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load");
        const items = Array.isArray(data.items) ? data.items : [];
        setUsers(items);
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fetchError) setFetchError("");
    if (assignError) setAssignError("");
    if (assignSuccess) setAssignSuccess("");
  }

  async function handleFetchInfo() {
    if (!formData.accountId) {
      setFetchError("Please enter MT5 ID");
      return;
    }
    setFetchError("");
    setAccountInfo(null);
    try {
      const response = await axios.get(`${BASE}/admin/mt5/account/${formData.accountId}`, {
        timeout: 5000,
      });
      if (response.data?.ok) {
        setAccountInfo(response.data.data);
      } else {
        setFetchError("Failed to fetch account info from MT5.");
      }
    } catch (error) {
      setFetchError("Failed to fetch account info from MT5.");
    }
  }

  async function handleAssign() {
    if (!formData.userId || !formData.accountId) {
      setAssignError("Please select user and enter MT5 ID");
      return;
    }
    setAssignLoading(true);
    setAssignError("");
    setAssignSuccess("");
    try {
      const response = await axios.post(`${BASE}/admin/mt5/assign`, {
        userId: formData.userId,
        accountId: formData.accountId,
        password: formData.password || undefined,
      });
      if (response.data?.ok) {
        setAssignSuccess("MT5 account assigned successfully!");
        setFormData({ userId: "", accountId: "", password: "" });
        setAccountInfo(null);
      } else {
        setAssignError(response.data?.error || "Failed to assign account");
      }
    } catch (error) {
      setAssignError("Failed to assign account");
    } finally {
      setAssignLoading(false);
    }
  }

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading users…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assign Existing MT5 Account</h2>
        <p className="text-gray-600">Map an existing MT5 ID to a user account and save it to the database.</p>
      </div>

      {fetchError && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-md">
          {fetchError}
        </div>
      )}

      {assignError && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-md">
          {assignError}
        </div>
      )}

      {assignSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {assignSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select User Email</label>
          <input
            type="text"
            placeholder="Search users by email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 h-10 px-3 mb-2"
          />
          <select
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 h-10 px-3"
          >
            <option value="">Select User</option>
            {filteredUsers.map(user => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter MT5 ID</label>
          <input
            type="text"
            name="accountId"
            value={formData.accountId}
            onChange={handleInputChange}
            placeholder="Enter MT5 Account ID"
            className="w-full rounded-md border border-gray-300 h-10 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password (optional)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Set new password"
            className="w-full rounded-md border border-gray-300 h-10 px-3"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={handleFetchInfo}
          className="px-4 h-10 rounded-md bg-purple-600 text-white hover:bg-purple-700"
        >
          Fetch Info
        </button>
        <button
          onClick={handleAssign}
          disabled={assignLoading || !formData.userId || !formData.accountId}
          className="px-4 h-10 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400"
        >
          {assignLoading ? "Assigning..." : "Assign Account"}
        </button>
      </div>

      {accountInfo && (
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Login</label>
              <div className="text-sm font-medium">{accountInfo.Login}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Name</label>
              <div className="text-sm font-medium">{accountInfo.Name || "-"}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Group</label>
              <div className="text-sm font-medium">{accountInfo.Group || "-"}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Balance</label>
              <div className="text-sm font-medium">${accountInfo.Balance || 0}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Equity</label>
              <div className="text-sm font-medium">${accountInfo.Equity || 0}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Leverage</label>
              <div className="text-sm font-medium">{accountInfo.Leverage || "-"}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Status</label>
              <div className="text-sm font-medium">{accountInfo.IsEnabled ? "Enabled" : "Disabled"}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Comment</label>
              <div className="text-sm font-medium">{accountInfo.Comment || "-"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}