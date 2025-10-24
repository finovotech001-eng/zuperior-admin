// src/pages/admin/UsersView.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Wallet, Download, Upload, ShieldCheck } from "lucide-react";

function Stat({ icon:Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 flex items-center gap-3">
      <span className={`h-10 w-10 grid place-items-center rounded-xl ${tone}`}> 
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function fmt(v){ if(!v) return "-"; const d=new Date(v); return isNaN(d)?"-":d.toLocaleString(); }

export default function UsersView(){
  const { id } = useParams();
  const [data,setData] = useState(null);
  const [err,setErr] = useState("");
  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  useEffect(()=>{
    let stop=false;
    fetch(`${BASE}/admin/users/${id}`)
      .then(r=>r.json())
      .then(d=>{ if(stop) return; if(!d?.ok) throw new Error(d?.error||'Failed'); setData(d); })
      .catch(e=>setErr(e.message||String(e)));
    return ()=>{stop=true};
  },[BASE,id]);

  if(err) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{err}</div>;
  if(!data) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading…</div>;

  const u = data.user; const t = data.totals;

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xl font-bold">{u.name || u.email}</div>
            <div className="text-sm text-gray-600">{u.email}</div>
            <div className="text-xs text-gray-500 mt-1">Created {fmt(u.createdAt)} • Last login {fmt(u.lastLoginAt)}</div>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/users/all" className="px-4 h-10 rounded-md border">Back to All Users</Link>
            <a href={`mailto:${u.email}`} className="px-4 h-10 rounded-md bg-violet-600 text-white">Contact</a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Wallet} label="Account Balance" value={`$${t.accountBalance.toLocaleString()}`} tone="bg-violet-100 text-violet-700" />
        <Stat icon={Download} label="Total Deposits" value={`$${t.deposits.amount.toLocaleString()} (${t.deposits.count})`} tone="bg-emerald-100 text-emerald-700" />
        <Stat icon={Upload} label="Total Withdrawals" value={`$${t.withdrawals.amount.toLocaleString()} (${t.withdrawals.count})`} tone="bg-rose-100 text-rose-700" />
        <Stat icon={ShieldCheck} label="Email Verified" value={u.emailVerified ? 'Yes' : 'No'} tone={u.emailVerified?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-800'} />
      </div>

      {/* KYC */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">KYC Status</div>
        <div className="p-5 grid gap-4 md:grid-cols-3">
          {u.KYC ? (
            <>
              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-semibold">{u.KYC.verificationStatus}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Document Verified</div>
                <div className="font-semibold">{u.KYC.isDocumentVerified ? 'Yes' : 'No'}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Address Verified</div>
                <div className="font-semibold">{u.KYC.isAddressVerified ? 'Yes' : 'No'}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-600">No KYC submitted.</div>
          )}
        </div>
      </div>

      {/* Accounts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4"/> Wallet Accounts</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Balance</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr></thead>
              <tbody className="divide-y">
                {u.Account?.length ? u.Account.map(a=> (
                  <tr key={a.id}><td className="px-4 py-2">{a.accountType}</td><td className="px-4 py-2">${a.balance?.toLocaleString?.()||a.balance}</td><td className="px-4 py-2">{fmt(a.createdAt)}</td></tr>
                )) : <tr><td className="px-4 py-4" colSpan={3}>No accounts</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold">MT5 Accounts</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="px-4 py-2 text-left">Account ID</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr></thead>
              <tbody className="divide-y">
                {u.MT5Account?.length ? u.MT5Account.map(a=> (
                  <tr key={a.id}><td className="px-4 py-2">{a.accountId}</td><td className="px-4 py-2">{fmt(a.createdAt)}</td></tr>
                )) : <tr><td className="px-4 py-4" colSpan={2}>No MT5 accounts</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

