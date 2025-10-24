// src/pages/admin/AdminDashboard.jsx
import { useMemo, useState, useEffect } from "react";
import {
  Users, Download, Upload, LineChart, ShieldAlert, Wallet,
  BarChart3, UserX, UserCheck, UserCog, TrendingUp, Clock,
  DollarSign, Activity, AlertTriangle, CheckCircle, XCircle,
  Eye, Zap, Target, Award, Bell, RefreshCw
} from "lucide-react";
import ProTable from "../../components/ProTable.jsx";
import Badge from "../../components/Badge.jsx";

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function fmtAmount(v) {
  return v ? `$${Number(v || 0).toFixed(2)}` : "-";
}

const getKpiCards = (data) => [
  { id: "totalUsers",      label: "Total Users",            value: data.users.total.toLocaleString(),    icon: Users,       tone: "from-cyan-400/20 to-teal-400/20", ring:"ring-cyan-400/30" },
  { id: "totalDeposits",   label: "Total Deposits",         value: `$${data.deposits.total.toFixed(2)}`, icon: Download,    tone: "from-emerald-400/20 to-green-400/20", ring:"ring-emerald-400/30" },
  { id: "totalWithdrawals",label: "Total Withdrawals",      value: `$${data.withdrawals.total.toFixed(2)}`,  icon: Upload,      tone: "from-rose-400/20 to-orange-400/20", ring:"ring-rose-400/30" },

  { id: "kycPending",      label: "KYC Pending",            value: data.kyc.pending.toString(),       icon: ShieldAlert, tone: "from-amber-400/20 to-yellow-400/20", ring:"ring-amber-400/30" },
  { id: "kycApproved",     label: "KYC Approved",           value: data.kyc.verified.toString(),      icon: UserCheck,   tone: "from-emerald-400/20 to-green-400/20", ring:"ring-emerald-400/30" },
  { id: "activeUsers",     label: "Active Users",           value: data.users.active.toString(),      icon: Activity,    tone: "from-blue-400/20 to-indigo-400/20", ring:"ring-blue-400/30" },
  { id: "banned",          label: "Banned Users",           value: data.users.banned.toString(),     icon: UserX,       tone: "from-red-400/20 to-rose-400/20", ring:"ring-red-400/30" },

  // Top depositor
  { id: "topDepositor",    label: "Top Depositor",          value: data.topDepositors?.[0]?.name || "N/A",   icon: Award,       tone: "from-yellow-400/20 to-amber-400/20", ring:"ring-yellow-400/30" },
];

const recent = [
  { id: 1, when: "2m ago",  who: "sarah@zuperior.io", what: "Approved KYC",      icon: UserCheck, tone:"text-emerald-600" },
  { id: 2, when: "10m ago", who: "desk@ops",      what: "Processed payout",  icon: Upload,     tone:"text-sky-600" },
  { id: 3, when: "25m ago", who: "mike@ib",       what: "New IB request",    icon: Users,      tone:"text-indigo-600" },
  { id: 4, when: "1h ago",  who: "bridge",        what: "LP fill +$32k",     icon: TrendingUp, tone:"text-cyan-600" },
];


const recentTransactions = [
  { id: 1, type: "Deposit", user: "Alex M.", amount: "$5,000", status: "Approved", time: "5m ago" },
  { id: 2, type: "Withdrawal", user: "Sarah K.", amount: "$2,500", status: "Pending", time: "12m ago" },
  { id: 3, type: "Deposit", user: "Mike R.", amount: "$1,200", status: "Approved", time: "18m ago" },
  { id: 4, type: "Withdrawal", user: "Emma L.", amount: "$3,800", status: "Rejected", time: "25m ago" },
  { id: 5, type: "Deposit", user: "John D.", amount: "$4,500", status: "Approved", time: "32m ago" },
];

const kycStatus = [
  { status: "Verified", count: 1847, percentage: 78.7, color: "text-emerald-600" },
  { status: "Pending", count: 342, percentage: 14.6, color: "text-amber-600" },
  { status: "Rejected", count: 159, percentage: 6.7, color: "text-red-600" },
];

const alerts = [
  { id: 1, type: "warning", message: "High withdrawal volume detected", time: "1h ago" },
  { id: 2, type: "info", message: "New KYC submissions: 5 pending", time: "2h ago" },
  { id: 3, type: "error", message: "MT5 API connection unstable", time: "3h ago" },
  { id: 4, type: "success", message: "Daily backup completed", time: "5h ago" },
];

const mt5Stats = [
  { label: "Total MT5 Accounts", value: "1,847", icon: Users, tone: "from-blue-400/20 to-cyan-400/20" },
  { label: "Active MT5 Traders", value: "1,234", icon: Activity, tone: "from-green-400/20 to-emerald-400/20" },
  { label: "Total MT5 Balance", value: "$2.4M", icon: DollarSign, tone: "from-purple-400/20 to-indigo-400/20" },
  { label: "MT5 Trades Today", value: "5,678", icon: BarChart3, tone: "from-orange-400/20 to-red-400/20" },
];

const monthlySeries = [
  { m: "Jan", v: 120 }, { m: "Feb", v: 150 }, { m: "Mar", v: 170 }, { m: "Apr", v: 200 },
  { m: "May", v: 235 }, { m: "Jun", v: 270 }, { m: "Jul", v: 300 }, { m: "Aug", v: 345 },
];

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white text-black shadow-2xl transition-transform duration-[500ms] ease-out translate-y-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="text-lg font-semibold">{title}</div>
            <button onClick={onClose} className="rounded-lg px-3 py-1.5 bg-black/5 hover:bg-black/10">Close</button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ item, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className="group rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 border border-slate-200 text-left h-full w-full"
    >
      <div className="p-4 flex items-center gap-3 h-full">
        <div className={`h-10 w-10 grid place-items-center rounded-lg ring-1 ${item.ring} bg-gradient-to-br ${item.tone} flex-shrink-0`}>
          <Icon className="h-5 w-5 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-black/60 font-medium">{item.label}</div>
          <div className="text-xl font-bold text-black mt-0.5">{item.value}</div>
        </div>
      </div>
    </button>
  );
}

function SimpleBarChart({ data }) {
  const max = useMemo(() => Math.max(...data.map(d => d.v)), [data]);
  const W = 640, H = 260, padX = 28, padY = 24;
  const innerW = W - padX * 2, innerH = H - padY * 2;
  const barW = innerW / data.length - 14;

  return (
    <div className="rounded-2xl bg-white shadow-lg border border-slate-200">
      <div className="px-5 pt-4 pb-2 text-sm font-semibold text-black">
        Total Users Joined Per Month
      </div>
      <div className="px-4 pb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64">
          <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="currentColor" className="text-slate-300" />
          <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="currentColor" className="text-slate-300" />
          {data.map((d, i) => {
            const h = (d.v / max) * (innerH - 6);
            const x = padX + i * (innerW / data.length) + 7;
            const y = H - padY - h;
            return (
              <g key={d.m}>
                <rect x={x} y={y} width={barW} height={h} rx="6"
                       className="fill-indigo-500 hover:fill-indigo-600 transition-all duration-200">
                  <title>{`${d.m}: ${d.v}`}</title>
                </rect>
                <text x={x + barW / 2} y={H - padY + 16} textAnchor="middle"
                      className="fill-black/60 text-[10px]">{d.m}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function TopTraders({ traders }) {
  return (
    <div className="rounded-xl bg-white shadow-md border border-slate-200 h-full">
      <div className="px-5 pt-4 pb-3 text-base font-semibold text-black">
        Top Depositors
      </div>
      <div className="px-5 pb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-black/60 border-b border-slate-200">
                <th className="pb-2 font-medium">Rank</th>
                <th className="pb-2 font-medium">Depositor</th>
                <th className="pb-2 font-medium">Total Deposited</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(traders && traders.length > 0) ? traders.map(trader => (
                <tr key={trader.rank} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-sm font-bold text-indigo-600">#{trader.rank}</td>
                  <td className="py-3">
                    <div className="text-sm font-semibold text-black">{trader.name}</div>
                    <div className="text-xs text-black/60">{trader.email}</div>
                  </td>
                  <td className="py-3 text-sm font-bold text-emerald-600">{trader.amount}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {trader.trades}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-6 text-sm text-black/60 text-center">No depositors data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecentTransactions({ transactions }) {
  return (
    <div className="rounded-xl bg-white shadow-md border border-slate-200 h-full">
      <div className="px-5 pt-4 pb-3 text-base font-semibold text-black">
        Recent Transactions
      </div>
      <div className="px-5 pb-4">
        <div className="space-y-3">
          {(transactions && transactions.length > 0) ? transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full grid place-items-center flex-shrink-0 ${
                  tx.type === 'Deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {tx.type === 'Deposit' ? <Download className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-black">{tx.type}</div>
                  <div className="text-xs text-black/60 truncate">{tx.user}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-bold ${
                  tx.status === 'approved' ? 'text-emerald-600' :
                  tx.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {tx.amount}
                </div>
                <div className="text-xs text-black/60">{tx.time}</div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-black/60 text-center py-6">No recent transactions</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentKyc({ kycData }) {
  return (
    <div className="rounded-xl bg-white shadow-md border border-slate-200 h-full">
      <div className="px-5 pt-4 pb-3 text-base font-semibold text-black">
        Recent KYC Submissions
      </div>
      <div className="px-5 pb-4">
        {(kycData && kycData.length > 0) ? (
          <div className="space-y-3">
            {kycData.map(kyc => (
              <div key={kyc.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`h-10 w-10 rounded-full grid place-items-center flex-shrink-0 ${
                  kyc.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                  kyc.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {kyc.verificationStatus === 'verified' ? <CheckCircle className="h-5 w-5" /> :
                   kyc.verificationStatus === 'pending' ? <Clock className="h-5 w-5" /> :
                   <XCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-black">{kyc.User?.name || 'Unknown User'}</div>
                  <div className="text-xs text-black/60">{kyc.User?.email || 'No email'}</div>
                  <div className="text-xs text-black/60">{new Date(kyc.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    kyc.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                    kyc.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kyc.verificationStatus.charAt(0).toUpperCase() + kyc.verificationStatus.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-sm text-black/60">No recent KYC submissions</div>
            <div className="text-xs text-black/40 mt-1">KYC submissions will appear here</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Alerts({ alerts }) {
  return (
    <div className="rounded-xl bg-white shadow-md border border-slate-200 h-full">
      <div className="px-5 pt-4 pb-3 text-base font-semibold text-black">
        System Alerts
      </div>
      <div className="px-5 pb-4">
        <div className="space-y-3">
          {(alerts && alerts.length > 0) ? alerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className={`h-8 w-8 rounded-full grid place-items-center flex-shrink-0 ${
                alert.type === 'error' ? 'bg-red-100 text-red-600' :
                alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                alert.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {alert.type === 'error' ? <XCircle className="h-4 w-4" /> :
                 alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                 alert.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                 <Bell className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black">{alert.message}</div>
                <div className="text-xs text-black/60 mt-1">{alert.time}</div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-black/60 text-center py-6">No alerts</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MT5Stats({ stats }) {
  return (
    <div className="rounded-xl bg-white shadow-md border border-slate-200 h-full">
      <div className="px-5 pt-4 pb-3 text-base font-semibold text-black">
        MT5 Platform Statistics
      </div>
      <div className="px-5 pb-4">
        <div className="grid gap-3 grid-cols-1">
          {(stats && stats.length > 0) ? stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br ${stat.tone} ring-1 ${stat.tone.replace('/20', '/30')} flex-shrink-0`}>
                  <Icon className="h-5 w-5 text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-black/60 font-medium">{stat.label}</div>
                  <div className="text-lg font-bold text-black mt-0.5">{stat.value}</div>
                </div>
              </div>
            );
          }) : (
            <div className="text-sm text-black/60 text-center py-6">No MT5 data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserRegistrationChart({ data, filter, onFilterChange }) {
  const chartData = data[filter] || [];

  const max = Math.max(...chartData.map(d => d.count), 1);
  const W = 1000, H = 350, padX = 50, padY = 50;
  const innerW = W - padX * 2, innerH = H - padY * 2;

  const formatLabel = (item) => {
    if (filter === 'daily') {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (filter === 'weekly') {
      return `Week ${item.week.split('-W')[1]}`;
    } else {
      const [year, month] = item.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-md border border-slate-200 w-full">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="text-base font-semibold text-black">
          User Registrations
        </div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(period => (
            <button
              key={period}
              onClick={() => onFilterChange(period)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5">
        {chartData.length > 0 ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64">
            <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="currentColor" className="text-slate-300" />
            <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="currentColor" className="text-slate-300" />

            {/* Grid lines */}
            {[...Array(5)].map((_, i) => {
              const y = padY + (i * innerH) / 4;
              const value = max - (i * max) / 4;
              return (
                <g key={i}>
                  <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="currentColor" className="text-slate-200" strokeWidth="0.5" />
                  <text x={padX - 8} y={y + 3} textAnchor="end" className="fill-black/60 text-xs">
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {chartData.map((d, i) => {
              const barW = innerW / chartData.length - 6;
              const h = (d.count / max) * innerH;
              const x = padX + i * (innerW / chartData.length) + 3;
              const y = H - padY - h;

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx="3"
                    className="fill-indigo-500 hover:fill-indigo-600 transition-all duration-200 cursor-pointer"
                  >
                    <title>{`${formatLabel(d)}: ${d.count} users`}</title>
                  </rect>
                  <text
                    x={x + barW / 2}
                    y={H - padY + 14}
                    textAnchor="middle"
                    className="fill-black/60 text-xs"
                  >
                    {formatLabel(d)}
                  </text>
                </g>
              );
            })}

            <text x={W - padX} y={H - padY + 18} textAnchor="end" className="fill-black/60 text-xs">
              {filter === 'daily' ? 'Date' : filter === 'weekly' ? 'Week' : 'Month'}
            </text>
            <text x={padX} y={padY - 8} textAnchor="start" className="fill-black/60 text-xs">
              Users Registered
            </text>
          </svg>
        ) : (
          <div className="text-center py-12 text-black/60">
            <div className="text-base">No registration data available</div>
            <div className="text-sm mt-1">User registration data will appear here once available</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [selected, setSelected] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, banned: 0 },
    deposits: { total: 0, pending: 0, approved: 0, rejected: 0 },
    withdrawals: { total: 0, pending: 0, approved: 0, rejected: 0 },
    kyc: { verified: 0, pending: 0, rejected: 0 },
    mt5: { accounts: 0, active: 0, balance: 0, trades: 0 },
    profit: 0,
    topTraders: [],
    recentTransactions: [],
    recentActivity: [],
    alerts: [],
    userRegistrations: { daily: [], weekly: [], monthly: [] }
  });
  const [chartFilter, setChartFilter] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    from: "",
    to: "",
    search: "",
  });

  const BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5003";

  const columns = useMemo(() => [
    { key: "__index", label: "Sr No", sortable: false },
    { key: "time", label: "Time", render: (v) => fmtDate(v) },
    { key: "type", label: "Type" },
    { key: "user", label: "User" },
    { key: "mts", label: "MTS" },
    { key: "amount", label: "Amount", render: (v) => fmtAmount(v) },
    { key: "status", label: "Status", render: (v, row, Badge) => {
      let tone = 'gray';
      if (v === 'Approved' || v === 'Opened') tone = 'green';
      else if (v === 'Rejected') tone = 'red';
      else if (v === 'Pending') tone = 'amber';
      return <Badge tone={tone}>{v}</Badge>;
    } },
    { key: "details", label: "Details" },
  ], []);

  const tableFilters = useMemo(() => ({
    searchKeys: ["user", "userName", "mts", "details", "status"],
  }), []);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let stop = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      limit: '500',
      ...(filters.type !== 'all' ? { type: filters.type } : {}),
      ...(filters.status !== 'all' ? { status: filters.status } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    });

    fetch(`${BASE}/admin/activity-logs?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (stop) return;
        if (!data?.ok) throw new Error(data?.error || "Failed to load");
        const items = Array.isArray(data.items) ? data.items : [];
        setRows(items.map((item, index) => ({
          ...item,
          __index: index + 1,
        })));

        // Extract recent activities for cards
        const deposits = items.filter(i => i.type === 'Deposit').slice(0, 5);
        const withdrawals = items.filter(i => i.type === 'Withdrawal').slice(0, 5);
        const accounts = items.filter(i => i.type === 'Account').slice(0, 5);

        setRecentDeposits(deposits);
        setRecentWithdrawals(withdrawals);
        setRecentAccounts(accounts);
      })
      .catch(e => setError(e.message || String(e)))
      .finally(() => !stop && setLoading(false));
    return () => { stop = true; };
  }, [BASE, filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all data in parallel
      const [
        usersRes,
        depositsRes,
        withdrawalsRes,
        kycRes,
        mt5Res,
        activityRes
      ] = await Promise.all([
        fetch('/api/admin/users/all?limit=1').then(r => r.json()).catch(() => ({ ok: false })),
        fetch('/api/admin/deposits').then(r => r.json()).catch(() => ({ ok: false })),
        fetch('/api/admin/withdrawals').then(r => r.json()).catch(() => ({ ok: false })),
        fetch('/api/admin/kyc?limit=1').then(r => r.json()).catch(() => ({ ok: false })),
        fetch('/api/admin/mt5/users?limit=1').then(r => r.json()).catch(() => ({ ok: false })),
        fetch('/api/admin/activity-logs?limit=10').then(r => r.json()).catch(() => ({ ok: false }))
      ]);

      // Process users data
      const users = usersRes.ok ? usersRes : { total: 0, items: [] };
      const totalUsers = users.total || 0;
      const activeUsers = users.items.filter(u => u.status === 'active').length;
      const bannedUsers = users.items.filter(u => u.status === 'banned').length;

      // Process user registrations by time periods
      const now = new Date();
      const daily = {};
      const weekly = {};
      const monthly = {};

      users.items.forEach(user => {
        const createdAt = new Date(user.createdAt);
        const dayKey = createdAt.toISOString().split('T')[0];
        const weekKey = `${createdAt.getFullYear()}-W${Math.ceil((createdAt.getDate() - createdAt.getDay() + 1) / 7)}`;
        const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;

        daily[dayKey] = (daily[dayKey] || 0) + 1;
        weekly[weekKey] = (weekly[weekKey] || 0) + 1;
        monthly[monthKey] = (monthly[monthKey] || 0) + 1;
      });

      // Convert to arrays and sort
      const dailyData = Object.entries(daily)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days

      const weeklyData = Object.entries(weekly)
        .map(([week, count]) => ({ week, count }))
        .sort((a, b) => a.week.localeCompare(b.week))
        .slice(-12); // Last 12 weeks

      const monthlyData = Object.entries(monthly)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12); // Last 12 months

      // Process deposits data
      const deposits = depositsRes.ok ? depositsRes : { total: 0, totalSum: 0, items: [] };
      const totalDeposits = deposits.totalSum || 0;
      const pendingDeposits = deposits.items.filter(d => d.status === 'pending').length;
      const approvedDeposits = deposits.items.filter(d => d.status === 'approved').length;
      const rejectedDeposits = deposits.items.filter(d => d.status === 'rejected').length;

      // Process withdrawals data
      const withdrawals = withdrawalsRes.ok ? withdrawalsRes : { total: 0, items: [] };
      const totalWithdrawals = withdrawals.items.reduce((sum, w) => sum + (w.amount || 0), 0);
      const pendingWithdrawals = withdrawals.items.filter(w => w.status === 'pending').length;
      const approvedWithdrawals = withdrawals.items.filter(w => w.status === 'approved').length;
      const rejectedWithdrawals = withdrawals.items.filter(w => w.status === 'rejected').length;

      // Process KYC data
      const kyc = kycRes.ok ? kycRes : { total: 0, items: [] };
      const verifiedKyc = kyc.items.filter(k => k.verificationStatus === 'verified').length;
      const pendingKyc = kyc.items.filter(k => k.verificationStatus === 'pending').length;
      const rejectedKyc = kyc.items.filter(k => k.verificationStatus === 'rejected').length;

      // Get recent KYC submissions (last 5)
      const recentKyc = kyc.items
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Process MT5 data
      const mt5 = mt5Res.ok ? mt5Res : { total: 0, items: [] };
      const totalMt5Accounts = mt5.total || mt5.items.length; // Fallback to items length if total not provided
      const activeMt5Traders = mt5.items.length;
      const totalMt5Balance = mt5.items.reduce((sum, u) => sum + (u.totalBalance || 0), 0);
      const totalMt5Trades = mt5.items.reduce((sum, u) => sum + (u.MT5Account?.length || 0), 0);

      // Process activity data
      const activity = activityRes.ok ? activityRes : { total: 0, items: [] };
      const recentActivity = activity.items.slice(0, 4).map(a => ({
        id: a.id,
        when: new Date(a.time).toLocaleTimeString(),
        who: a.user || 'System',
        what: `${a.type} - ${a.status}`,
        icon: a.type === 'Deposit' ? Download : a.type === 'Withdrawal' ? Upload : Activity,
        tone: a.status === 'approved' ? 'text-emerald-600' : a.status === 'pending' ? 'text-amber-600' : 'text-red-600'
      }));

      // Calculate profit (approved deposits - approved withdrawals)
      const profit = totalDeposits - totalWithdrawals;

      // Top depositors (users with highest total deposits)
      const topDepositors = deposits.items
        .filter(d => d.status === 'approved')
        .reduce((acc, d) => {
          const userId = d.userId;
          if (!acc[userId]) {
            acc[userId] = {
              userId,
              name: d.User?.name || 'Unknown',
              email: d.User?.email || 'No email',
              totalDeposited: 0
            };
          }
          acc[userId].totalDeposited += parseFloat(d.amount || 0);
          return acc;
        }, {});

      const topDepositorsList = Object.values(topDepositors)
        .sort((a, b) => b.totalDeposited - a.totalDeposited)
        .slice(0, 5)
        .map((u, i) => ({
          rank: i + 1,
          name: u.name,
          email: u.email,
          amount: `$${u.totalDeposited.toFixed(2)}`,
          trades: u.totalDeposited > 0 ? 'Active' : 'Inactive'
        }));

      // Recent transactions
      const recentTransactions = [
        ...deposits.items.slice(0, 3).map(d => ({
          id: d.id,
          type: 'Deposit',
          user: d.User?.name || 'Unknown',
          amount: `$${d.amount}`,
          status: d.status,
          time: new Date(d.createdAt).toLocaleTimeString()
        })),
        ...withdrawals.items.slice(0, 2).map(w => ({
          id: w.id,
          type: 'Withdrawal',
          user: w.User?.name || 'Unknown',
          amount: `$${w.amount}`,
          status: w.status,
          time: new Date(w.createdAt).toLocaleTimeString()
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      // KYC status for pie chart (keeping for backward compatibility)
      const kycStatus = [
        { status: 'Verified', count: verifiedKyc, percentage: totalUsers > 0 ? (verifiedKyc / totalUsers * 100).toFixed(1) : 0 },
        { status: 'Pending', count: pendingKyc, percentage: totalUsers > 0 ? (pendingKyc / totalUsers * 100).toFixed(1) : 0 },
        { status: 'Rejected', count: rejectedKyc, percentage: totalUsers > 0 ? (rejectedKyc / totalUsers * 100).toFixed(1) : 0 }
      ];

      // MT5 stats (only 2 as requested)
      const mt5Stats = [
        { label: "Total MT5 Accounts", value: totalMt5Accounts.toLocaleString(), icon: Users, tone: "from-blue-400/20 to-cyan-400/20" },
        { label: "Total MT5 Balance", value: `$${totalMt5Balance.toFixed(2)}`, icon: DollarSign, tone: "from-purple-400/20 to-indigo-400/20" },
      ];

      // Alerts (placeholder)
      const alerts = [
        { id: 1, type: "info", message: `New users today: ${activeUsers}`, time: "1h ago" },
        { id: 2, type: "warning", message: `Pending KYC: ${pendingKyc}`, time: "2h ago" },
        { id: 3, type: "success", message: `Approved deposits: $${approvedDeposits}`, time: "3h ago" },
      ];

      setDashboardData({
        users: { total: totalUsers, active: activeUsers, banned: bannedUsers },
        deposits: { total: totalDeposits, pending: pendingDeposits, approved: approvedDeposits, rejected: rejectedDeposits },
        withdrawals: { total: totalWithdrawals, pending: pendingWithdrawals, approved: approvedWithdrawals, rejected: rejectedWithdrawals },
        kyc: { verified: verifiedKyc, pending: pendingKyc, rejected: rejectedKyc },
        mt5: { accounts: totalMt5Accounts, active: activeMt5Traders, balance: totalMt5Balance, trades: totalMt5Trades },
        profit: profit,
        topDepositors: topDepositorsList,
        recentTransactions,
        recentActivity,
        alerts,
        kycStatus,
        mt5Stats,
        userRegistrations: { daily: dailyData, weekly: weeklyData, monthly: monthlyData },
        recentKyc
      });

    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
      // Set fallback data
      setDashboardData({
        users: { total: 0, active: 0, banned: 0 },
        deposits: { total: 0, pending: 0, approved: 0, rejected: 0 },
        withdrawals: { total: 0, pending: 0, approved: 0, rejected: 0 },
        kyc: { verified: 0, pending: 0, rejected: 0 },
        mt5: { accounts: 0, active: 0, balance: 0, trades: 0 },
        profit: 0,
        topDepositors: [],
        recentTransactions: [],
        recentActivity: [],
        alerts: [{ id: 1, type: "error", message: "Database connection failed", time: "now" }],
        kycStatus: [],
        mt5Stats: [],
        userRegistrations: { daily: [], weekly: [], monthly: [] },
        recentKyc: []
      });
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = getKpiCards(dashboardData);

  if (loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading logs…</div>;
  if (error) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor all CRM activities and operations</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {kpiCards.map(card => (
          <KpiCard key={card.id} item={card} onClick={() => setSelected(card)} />
        ))}
      </div>

      {/* Top Depositors + Recent KYC */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopTraders traders={dashboardData.topDepositors} />
        </div>
        <div>
          <RecentKyc kycData={dashboardData.recentKyc} />
        </div>
      </div>

      {/* Transactions + MT5 Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={dashboardData.recentTransactions} />
        </div>
        <div>
          <MT5Stats stats={dashboardData.mt5Stats} />
        </div>
      </div>

      {/* Full Width User Registration Chart */}
      <div className="w-full">
        <UserRegistrationChart
          data={dashboardData.userRegistrations}
          filter={chartFilter}
          onFilterChange={setChartFilter}
        />
      </div>

      {/* Recent Activity + Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-white shadow-lg border border-slate-200">
          <div className="px-5 pt-4 pb-3 text-lg font-semibold text-black">Recent Activity</div>
          <div className="px-5 pb-4">
            <ul className="divide-y divide-slate-200">
              {(dashboardData.recentActivity && dashboardData.recentActivity.length > 0) ? dashboardData.recentActivity.map(r => {
                const I = r.icon;
                return (
                  <li key={r.id} className="py-3 flex items-start gap-3">
                    <span className={`h-8 w-8 rounded-full grid place-items-center bg-black/5 ${r.tone} flex-shrink-0`}>
                      <I className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-black">{r.what}</div>
                      <div className="text-xs text-black/60 truncate">{r.who}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-black/60 flex-shrink-0">
                      <Clock className="h-3 w-3" /> {r.when}
                    </div>
                  </li>
                );
              }) : (
                <li className="py-6 text-sm text-black/60 text-center">No recent activity</li>
              )}
            </ul>
          </div>
        </div>

        {/* Alerts */}
        <div>
          <Alerts alerts={dashboardData.alerts} />
        </div>
      </div>

      {/* Operation Logs Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Operation Logs</h2>
      </div>

      {/* Cards for Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Recent Deposits */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Deposits</h3>
          </div>
          <div className="space-y-4">
            {recentDeposits.length > 0 ? recentDeposits.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString()} • MTS: {item.mts}
                    </div>
                    {item.details && item.details !== '-' && (
                      <div className="text-xs text-gray-400 mt-1">Txn: {item.details}</div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900">{fmtAmount(item.amount)}</div>
                    <Badge tone={item.status === 'Approved' ? 'green' : item.status === 'Pending' ? 'amber' : 'red'}>
                      {item.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No recent deposits</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Showing last 5 results</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all</button>
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Withdrawals</h3>
          </div>
          <div className="space-y-4">
            {recentWithdrawals.length > 0 ? recentWithdrawals.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString()} • MTS: {item.mts}
                    </div>
                    {item.details && item.details !== '-' && (
                      <div className="text-xs text-gray-400 mt-1">Txn: {item.details}</div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900">{fmtAmount(item.amount)}</div>
                    <Badge tone={item.status === 'Approved' ? 'green' : item.status === 'Pending' ? 'amber' : 'red'}>
                      {item.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No recent withdrawals</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Showing last 5 results</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all</button>
          </div>
        </div>

        {/* Recent Accounts Opened */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Accounts Opened</h3>
          </div>
          <div className="space-y-4">
            {recentAccounts.length > 0 ? recentAccounts.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">MTS: {item.mts}</div>
                  </div>
                  <div className="text-right ml-4">
                    <Badge tone="green">Opened</Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No recent accounts</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Showing last 5 results</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange({ type: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="account">Account</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="opened">Opened</option>
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange({ from: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange({ to: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
            placeholder="To"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="rounded-md border border-gray-300 h-10 px-3"
            placeholder="Search email / MTS / txn"
          />
        </div>
      </div>

      {/* Table */}
      <ProTable
        title="Activity Logs"
        rows={rows}
        columns={columns}
        filters={tableFilters}
        searchPlaceholder="Search user, MTS, details…"
        pageSize={10}
      />
    </div>
  );
}
