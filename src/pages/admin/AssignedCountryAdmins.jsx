import { useEffect, useState, useMemo } from "react";

const FEATURE_LABELS = {
  'dashboard': 'Dashboard',
  'users/add': 'Add User',
  'users/all': 'All Users',
  'users/active': 'Active Users',
  'users/banned': 'Banned Users',
  'users/email-unverified': 'Email Unverified',
  'users/with-balance': 'With Balance',
  'kyc': 'KYC Verifications',
  'mt5': 'MT5 Management',
  'mt5/users': 'MT5 Users List',
  'mt5/assign': 'Assign MT5 to Email',
  'support/open': 'Opened Tickets',
  'support/pending': 'Pending Tickets',
  'support/closed': 'Closed Tickets',
  'deposits/pending': 'Pending Deposits',
  'deposits/approved': 'Approved Deposits',
  'deposits/rejected': 'Rejected Deposits',
  'deposits/all': 'All Deposits',
  'withdrawals/pending': 'Pending Withdrawals',
  'withdrawals/approved': 'Approved Withdrawals',
  'withdrawals/rejected': 'Rejected Withdrawals',
  'withdrawals/all': 'All Withdrawals',
  'payment-gateways/automatic': 'Deposit Gateway',
  'payment-gateways/manual': 'Manual Gateways',
  'payment-details': 'Payment Details',
  'bulk-logs': 'Bulk Operations Log',
  'assign-roles': 'Assign Roles',
  'profile': 'Admin Profile',
  'assigned-country-admins': 'Assigned Country Admins',
  'assign-country-partner': 'Assign Country Partner',
  'logout': 'Logout',
};

function prettyFeatureLabel(slug) {
  return FEATURE_LABELS[slug] ||
    slug // fallback: try splitting
      .replace(/^\//, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
}

export default function AssignedCountryAdmins() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${BASE}/admin/country-admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if(Array.isArray(data)) setRows(data);
      else if(Array.isArray(data.admins)) setRows(data.admins);
      else setRows([]);
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full px-2 md:px-8 py-6 md:py-10 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Assigned Country Admins</h2>
      {loading ? (
        <div className="bg-white shadow-xl w-full p-8 text-lg font-medium text-center">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="bg-white shadow-xl w-full p-8 text-lg font-medium text-center">No country admins found.</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left bg-white shadow-xl rounded-2xl border-separate border-spacing-y-0.5">
            <thead className="bg-gray-50">
              <tr className="text-md">
                <th className="py-3 px-4 font-semibold">Sr No.</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="px-4 font-semibold">Email</th>
                <th className="px-4 font-semibold">Status</th>
                <th className="px-4 font-semibold">Country</th>
                <th className="px-4 font-semibold">Features</th>
                <th className="px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className={idx%2===1 ? "bg-gray-50 hover:bg-purple-50" : "hover:bg-purple-50"}>
                  <td className="py-3 px-4 text-gray-700 font-semibold">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-sm md:text-base">{row.name}</td>
                  <td className="px-4 text-sm md:text-base">{row.email}</td>
                  <td className="px-4 text-xs capitalize">{row.status}</td>
                  <td className="px-4 text-sm uppercase">{row.country}</td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-1 max-w-xl">
                      {(row.features && row.features.length)
                        ? row.features.map((slug, i) => (
                            <span key={slug||i} className="inline-block rounded-lg px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold whitespace-nowrap">
                              {prettyFeatureLabel(slug)}
                            </span>
                          ))
                        : <span className="text-gray-400 text-xs">None</span>}
                    </div>
                  </td>
                  <td className="px-4">
                    <button className="text-blue-700 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
