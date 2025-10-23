// src/pages/admin/AdminDashboard.jsx
import { useMemo, useState } from "react";
import {
  Users, Download, Upload, LineChart, ShieldAlert, Wallet,
  BarChart3, UserX, UserCheck, UserCog, TrendingUp, Clock
} from "lucide-react";

const kpiCards = [
  { id: "totalUsers",      label: "Total Users",            value: "2,348",    icon: Users,       tone: "from-cyan-400/20 to-teal-400/20", ring:"ring-cyan-400/30" },
  { id: "totalDeposits",   label: "Total Deposits",         value: "$182,000", icon: Download,    tone: "from-emerald-400/20 to-green-400/20", ring:"ring-emerald-400/30" },
  { id: "totalWithdrawals",label: "Total Withdrawals",      value: "$49,300",  icon: Upload,      tone: "from-rose-400/20 to-orange-400/20", ring:"ring-rose-400/30" },
  { id: "profit",          label: "Profit Generated",       value: "$28,750",  icon: LineChart,   tone: "from-indigo-400/20 to-fuchsia-400/20", ring:"ring-fuchsia-400/30" },

  { id: "kycPending",      label: "KYC Pending",            value: "17",       icon: ShieldAlert, tone: "from-amber-400/20 to-yellow-400/20", ring:"ring-amber-400/30" },
  { id: "ibWip",           label: "IB Withdrawals Pending", value: "6",        icon: Upload,      tone: "from-sky-400/20 to-cyan-400/20", ring:"ring-sky-400/30" },
  { id: "ibPaid",          label: "Total IB Withdrawn",     value: "$8,900",   icon: Wallet,      tone: "from-violet-400/20 to-purple-400/20", ring:"ring-violet-400/30" },
  { id: "pammPaid",        label: "PAMM Withdrawals Given", value: "$3,700",   icon: Upload,      tone: "from-pink-400/20 to-rose-400/20", ring:"ring-pink-400/30" },

  { id: "copiers",         label: "Total Copiers",          value: "29",       icon: Users,       tone: "from-teal-400/20 to-emerald-400/20", ring:"ring-teal-400/30" },
  { id: "masters",         label: "Total Masters",          value: "11",       icon: UserCog,     tone: "from-blue-400/20 to-indigo-400/20", ring:"ring-blue-400/30" },
  { id: "hft",             label: "HFT Traders",            value: "9",        icon: BarChart3,   tone: "from-cyan-400/20 to-sky-400/20", ring:"ring-cyan-400/30" },
  { id: "banned",          label: "Banned Users",           value: "3",        icon: UserX,       tone: "from-red-400/20 to-rose-400/20", ring:"ring-red-400/30" },
];

const recent = [
  { id: 1, when: "2m ago",  who: "sarah@nexatrader.io", what: "Approved KYC",      icon: UserCheck, tone:"text-emerald-600" },
  { id: 2, when: "10m ago", who: "desk@ops",      what: "Processed payout",  icon: Upload,     tone:"text-sky-600" },
  { id: 3, when: "25m ago", who: "mike@ib",       what: "New IB request",    icon: Users,      tone:"text-indigo-600" },
  { id: 4, when: "1h ago",  who: "bridge",        what: "LP fill +$32k",     icon: TrendingUp, tone:"text-cyan-600" },
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
      className="group rounded-2xl bg-white shadow-lg hover:shadow-xl transition border border-slate-200 text-left"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`h-11 w-11 grid place-items-center rounded-xl ring-1 ${item.ring} bg-gradient-to-br ${item.tone}`}>
          <Icon className="h-5 w-5 text-black" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-black/60">{item.label}</div>
          <div className="text-2xl font-bold text-black mt-0.5">{item.value}</div>
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

export default function AdminDashboard() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6 text-black">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(card => (
          <KpiCard key={card.id} item={card} onClick={() => setSelected(card)} />
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SimpleBarChart data={monthlySeries} />
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white shadow-lg border border-slate-200">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold">Recent Activity</div>
          <ul className="divide-y divide-slate-200">
            {recent.map(r => {
              const I = r.icon;
              return (
                <li key={r.id} className="p-4 flex items-start gap-3">
                  <span className={`h-9 w-9 rounded-full grid place-items-center bg-black/5 ${r.tone}`}>
                    <I className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm">{r.what}</div>
                    <div className="text-xs text-black/60 truncate">{r.who}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-black/60">
                    <Clock className="h-3.5 w-3.5" /> {r.when}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.label || "Details"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-black/5 p-4 ring-1 ring-black/10">
            <div className="text-xs text-black/60">Current Value</div>
            <div className="text-2xl font-bold mt-1">{selected?.value}</div>
          </div>
          <div className="rounded-xl bg-black/5 p-4 ring-1 ring-black/10">
            <div className="text-xs text-black/60">Trend (sample)</div>
            <div className="mt-1 flex items-center gap-2 text-emerald-700">
              <TrendingUp className="h-4 w-4" /> +4.2% this week
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-black/70">
          Drill-downs, filters and export actions can go here later. Click **Close** to return.
        </div>
      </Modal>
    </div>
  );
}
