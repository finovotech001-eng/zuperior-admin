// src/pages/admin/UsersView.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Wallet, Download, Upload, ShieldCheck, CreditCard } from "lucide-react";
import ProTable from "../../components/ProTable.jsx";
import Modal from "../../components/Modal.jsx";
import Badge from "../../components/Badge.jsx";
import Swal from "sweetalert2";

function Stat({ icon:Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <span className={`h-10 w-10 grid place-items-center rounded-xl ${tone}`}> 
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function fmt(v){ if(!v) return "-"; const d=new Date(v); return isNaN(d)?"-":d.toLocaleString(); }

export default function UsersView(){
  const { id } = useParams();
  const [data,setData] = useState(null);
  const [err,setErr] = useState("");
  const [logins, setLogins] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [actionModal, setActionModal] = useState(null); // { type, accountId, amount, comment }
  const [mt5Map, setMt5Map] = useState({}); // accountId -> {balance, equity}
  const [submitting, setSubmitting] = useState(false);
  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  // Bonus actions
  async function handleAddBonus(accountId){
    try {
      const { value: amountStr } = await Swal.fire({
        title: 'Add Bonus',
        input: 'number',
        inputLabel: 'Amount (USD)',
        inputAttributes: { min: 0, step: 0.01 },
        inputPlaceholder: 'Enter bonus amount',
        showCancelButton: true,
        confirmButtonText: 'Continue',
      });
      if (amountStr === undefined) return; // cancelled
      const amount = Number(amountStr);
      if (!amount || amount <= 0) {
        await Swal.fire({ icon:'error', title:'Enter a valid amount' });
        return;
      }

      const { value: comment } = await Swal.fire({
        title: 'Add Comment',
        input: 'text',
        inputLabel: 'Optional',
        inputPlaceholder: 'Reason / note (optional)',
        showCancelButton: true,
        confirmButtonText: 'Submit',
      });
      if (comment === undefined) return; // cancelled

      const url = `http://18.175.242.21:5003/api/Users/${encodeURIComponent(accountId)}/AddClientCredit`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: amount, comment: comment || '' })
      });
      let ok = res.ok;
      let msg = 'Bonus added successfully';
      try {
        const j = await res.json();
        if (j?.Success === false || j?.ok === false) {
          ok = false;
          msg = j?.Message || j?.error || msg;
        }
      } catch { /* ignore non-JSON */ }
      if (!ok) throw new Error(msg);

      await Swal.fire({ icon:'success', title:'Bonus credited', timer:1500, showConfirmButton:false });
      // Refresh MT5 balances if available
      fetchUser();
      // Log admin transaction
      try {
        const token = localStorage.getItem('adminToken');
        await fetch(`${BASE}/admin/admin-transactions`, {
          method:'POST',
          headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ operation_type:'bonus_add', mt5_login: accountId, amount, currency:'USD', status:'completed', comment })
        });
      } catch(_) {}
    } catch (e) {
      await Swal.fire({ icon:'error', title:'Bonus credit failed', text: e.message || String(e) });
    }
  }

  async function handleWithdrawBonus(accountId){
    try {
      const { value: amountStr } = await Swal.fire({
        title: 'Withdraw Bonus',
        input: 'number',
        inputLabel: 'Amount (USD)',
        inputAttributes: { min: 0, step: 0.01 },
        inputPlaceholder: 'Enter bonus amount to deduct',
        showCancelButton: true,
        confirmButtonText: 'Continue',
      });
      if (amountStr === undefined) return; // cancelled
      const amount = Number(amountStr);
      if (!amount || amount <= 0) {
        await Swal.fire({ icon:'error', title:'Enter a valid amount' });
        return;
      }

      const { value: comment } = await Swal.fire({
        title: 'Add Comment',
        input: 'text',
        inputLabel: 'Optional',
        inputPlaceholder: 'Reason / note (optional)',
        showCancelButton: true,
        confirmButtonText: 'Submit',
      });
      if (comment === undefined) return; // cancelled

      const url = `http://18.175.242.21:5003/api/Users/${encodeURIComponent(accountId)}/DeductClientCredit`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: amount, comment: comment || '' })
      });
      let ok = res.ok;
      let msg = 'Bonus deducted successfully';
      try {
        const j = await res.json();
        if (j?.Success === false || j?.ok === false) {
          ok = false;
          msg = j?.Message || j?.error || msg;
        }
      } catch { /* ignore non-JSON */ }
      if (!ok) throw new Error(msg);

      await Swal.fire({ icon:'success', title:'Bonus deducted', timer:1500, showConfirmButton:false });
      // Refresh MT5 balances if available
      fetchUser();
      // Log admin transaction
      try {
        const token = localStorage.getItem('adminToken');
        await fetch(`${BASE}/admin/admin-transactions`, {
          method:'POST',
          headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ operation_type:'bonus_deduct', mt5_login: accountId, amount, currency:'USD', status:'completed', comment })
        });
      } catch(_) {}
    } catch (e) {
      await Swal.fire({ icon:'error', title:'Bonus deduction failed', text: e.message || String(e) });
    }
  }

  const totalMt5Balance = useMemo(() => {
    try {
      return Object.values(mt5Map).reduce((sum, v) => sum + (Number(v?.balance) || 0), 0);
    } catch {
      return 0;
    }
  }, [mt5Map]);

  const totalMt5Equity = useMemo(() => {
    try {
      return Object.values(mt5Map).reduce((sum, v) => sum + (Number(v?.equity) || 0), 0);
    } catch {
      return 0;
    }
  }, [mt5Map]);

  // Real vs Demo split by group name
  const { realBalance, demoBalance, realEquity, demoEquity } = useMemo(() => {
    let rb=0, db=0, re=0, de=0;
    Object.values(mt5Map).forEach(v => {
      const isDemo = String(v?.group||'').toLowerCase().includes('demo');
      if (isDemo) {
        db += Number(v?.balance||0);
        de += Number(v?.equity||0);
      } else {
        rb += Number(v?.balance||0);
        re += Number(v?.equity||0);
      }
    });
    return { realBalance: rb, demoBalance: db, realEquity: re, demoEquity: de };
  }, [mt5Map]);

  const fetchUser = useCallback(()=>{
    let stop=false;
    fetch(`${BASE}/admin/users/${id}`)
      .then(r=>r.json())
      .then(d=>{ if(stop) return; if(!d?.ok) throw new Error(d?.error||'Failed'); setData(d); })
      .catch(e=>setErr(e.message||String(e)));
    return ()=>{stop=true};
  },[BASE,id]);

  useEffect(()=>{
    const cancel = fetchUser();
    return cancel;
  },[fetchUser]);

  useEffect(()=>{
    const token = localStorage.getItem('adminToken');
    let cancel = false;
    fetch(`${BASE}/admin/users/${id}/logins`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r=>r.json())
      .then(j => { if (cancel) return; setLogins(Array.isArray(j.items) ? j.items : []); })
      .catch(()=>{});
    return () => { cancel = true; };
  }, [BASE, id]);

  // Fetch payment methods for this user
  useEffect(()=>{
    const token = localStorage.getItem('adminToken');
    let cancel = false;
    fetch(`${BASE}/admin/users/${id}/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r=>r.json())
      .then(j => { if (cancel) return; setPaymentMethods(Array.isArray(j.paymentMethods) ? j.paymentMethods : []); })
      .catch(()=>{});
    return () => { cancel = true; };
  }, [BASE, id]);

  // Fetch MT5 balances/equity for each account id on page load
  useEffect(()=>{
    const token = localStorage.getItem('adminToken');
    if (!data?.user?.MT5Account?.length) return;
    let stop = false;
    (async () => {
      const entries = await Promise.all(
        data.user.MT5Account.map(async a => {
          try {
            const res = await fetch(`${BASE}/admin/mt5/proxy/${a.accountId}/getClientProfile`, { headers: { 'Authorization': `Bearer ${token}` } });
            const j = await res.json();
            const d = j?.data?.Data || j?.data || {};
            const levRaw = d.LeverageInCents ? Number(d.LeverageInCents)/100 : (d.Leverage || null);
            return [a.accountId, { balance: Number(d.Balance||0), equity: Number(d.Equity||0), group: d.Group || d.GroupName || '-', leverage: levRaw }];
          } catch {
            return [a.accountId, { balance: 0, equity: 0, group: '-', leverage: null }];
          }
        })
      );
      if (!stop) setMt5Map(Object.fromEntries(entries));
    })();
    return () => { stop = true; };
  }, [BASE, data?.user?.MT5Account]);

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
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Stat icon={Wallet} label="Real Balance" value={`$${realBalance.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`} tone="bg-violet-100 text-violet-700" />
        <Stat icon={Wallet} label="Demo Balance" value={`$${demoBalance.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`} tone="bg-fuchsia-100 text-fuchsia-700" />
        <Stat icon={Wallet} label="Real Equity" value={`$${realEquity.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`} tone="bg-blue-100 text-blue-700" />
        <Stat icon={Wallet} label="Demo Equity" value={`$${demoEquity.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`} tone="bg-cyan-100 text-cyan-700" />
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

      {/* MT5 Accounts full width using ProTable */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">MT5 Accounts</div>
        <div className="p-4">
          <ProTable
            rows={(u.MT5Account||[]).map((a, idx) => ({
              __index: idx+1,
              accountId: a.accountId,
              group: mt5Map[a.accountId]?.group || '-',
              leverage: mt5Map[a.accountId]?.leverage ? `1:${Number(mt5Map[a.accountId]?.leverage).toFixed(0)}` : '-',
              balance: `$${(mt5Map[a.accountId]?.balance || 0).toFixed(2)}`,
              equity: `$${(mt5Map[a.accountId]?.equity || 0).toFixed(2)}`,
              createdAt: fmt(a.createdAt),
              _raw: a,
            }))}
            columns={[
              { key: '__index', label: 'Sr No', sortable: false },
              { key: 'accountId', label: 'Account ID' },
              { key: 'group', label: 'Group', render: (v) => {
                const groupName = v || '-';
                const isDemo = String(groupName).toLowerCase().includes('demo');
                return <Badge tone={isDemo ? 'green' : 'blue'}>{groupName}</Badge>;
              }},
              { key: 'leverage', label: 'Leverage' },
              { key: 'balance', label: 'Balance' },
              { key: 'equity', label: 'Equity' },
              { key: 'createdAt', label: 'Created' },
              { key: 'actions', label: 'Actions', sortable: false, render: (v, row) => (
                <div className="flex items-center gap-2">
                  <button onClick={()=> setActionModal({ type:'deposit', accountId: row.accountId, amount:'', comment:'Admin deposit' })}
                          className="px-2 py-1 rounded-full bg-emerald-600 text-white text-xs hover:bg-emerald-700 shadow-sm">Deposit</button>
                  <button onClick={()=> setActionModal({ type:'withdraw', accountId: row.accountId, amount:'', comment:'Admin withdrawal' })}
                          className="px-2 py-1 rounded-full bg-rose-600 text-white text-xs hover:bg-rose-700 shadow-sm">Withdraw</button>
                </div>
              ) },
              { key: 'bonus', label: 'Bonus Actions', sortable: false, render: (v, row) => (
                <div className="flex items-center gap-2">
                  <button onClick={()=> handleAddBonus(row.accountId)}
                          className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs hover:bg-purple-700 shadow-sm">Add Bonus</button>
                  <button onClick={()=> handleWithdrawBonus(row.accountId)}
                          className="px-2 py-1 rounded-full bg-gray-700 text-white text-xs hover:bg-gray-800 shadow-sm">Withdraw Bonus</button>
                </div>
              ) },
            ]}
            pageSize={5}
            searchPlaceholder="Search by account, group…"
            filters={{ searchKeys: ['accountId','group'] }}
          />
          <div className="px-4 pb-4 text-xs text-gray-600 flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Badge tone="green">Demo</Badge>
              <span>accounts are marked as demo</span>
            </span>
            <span className="flex items-center gap-2">
              <Badge tone="blue">Real</Badge>
              <span>accounts are marked as real</span>
            </span>
          </div>
        </div>
      </div>

      {/* Approved Payment Methods */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Approved Payment Methods
        </div>
        <div className="p-4">
          {paymentMethods.length === 0 ? (
            <div className="text-sm text-gray-600 py-4">No approved payment methods found.</div>
          ) : (
            <ProTable
              rows={paymentMethods.map((pm, idx) => ({
                __index: idx+1,
                address: pm.address || '-',
                currency: pm.currency || '-',
                network: pm.network || '-',
                submittedAt: fmt(pm.submittedAt),
                approvedAt: fmt(pm.approvedAt),
                status: pm.status || 'approved',
              }))}
              columns={[
                { key: '__index', label: 'Sr No', sortable: false },
                { key: 'address', label: 'Address' },
                { key: 'currency', label: 'Currency' },
                { key: 'network', label: 'Network' },
                { key: 'submittedAt', label: 'Submitted' },
                { key: 'approvedAt', label: 'Approved' },
                { key: 'status', label: 'Status', render: (v) => (
                  <Badge tone={v === 'approved' ? 'green' : v === 'rejected' ? 'red' : 'amber'}>
                    {v || 'pending'}
                  </Badge>
                )},
              ]}
              pageSize={5}
              searchPlaceholder="Search by address, currency, network…"
              filters={{ searchKeys: ['address','currency','network'] }}
            />
          )}
        </div>
      </div>

      {/* Login Activity */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">Login Activity</div>
        <div className="p-4">
          <ProTable
            title={null}
            rows={(logins||[]).map((r, idx) => ({
              __index: idx+1,
              time: r.createdAt || r.createdat || r.created_at,
              device: r.device || '-',
              browser: r.browser || '-',
              user_agent: r.user_agent || '-',
              success: r.success ? 'Yes' : 'No',
              failure_reason: r.failure_reason || '-',
            }))}
            columns={[
              { key: '__index', label: 'Sr No', sortable: false },
              { key: 'time', label: 'Time' },
              { key: 'device', label: 'Device' },
              { key: 'browser', label: 'Browser' },
              { key: 'user_agent', label: 'User Agent' },
              { key: 'success', label: 'Success' },
              { key: 'failure_reason', label: 'Failure Reason' },
            ]}
            filters={{ searchKeys: ['device','browser','user_agent','failure_reason'] }}
            pageSize={10}
          />
        </div>
      </div>

      {/* Deposit/Withdraw Modal for MT5 accounts */}
      <Modal open={!!actionModal} onClose={()=>setActionModal(null)} title={actionModal ? (actionModal.type==='deposit' ? 'Add Balance' : 'Deduct Balance') : ''}>
        {actionModal && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <input type="number" min="0" step="0.01" value={actionModal.amount}
                     onChange={e=>setActionModal({ ...actionModal, amount: e.target.value })}
                     disabled={submitting}
                     className="w-full rounded-md border border-gray-300 h-10 px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <input type="text" value={actionModal.comment}
                     onChange={e=>setActionModal({ ...actionModal, comment: e.target.value })}
                     disabled={submitting}
                     className="w-full rounded-md border border-gray-300 h-10 px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setActionModal(null)} disabled={submitting} className="px-4 h-10 rounded-md border disabled:opacity-60">Cancel</button>
              <button onClick={async ()=>{
                const amt = Number(actionModal.amount);
                if (!amt || amt<=0) { Swal.fire({ icon:'error', title:'Enter amount' }); return; }
                try {
                  setSubmitting(true);
                  const token = localStorage.getItem('adminToken');
                  const url = actionModal.type==='deposit' ? `${BASE}/admin/mt5/deposit` : `${BASE}/admin/mt5/withdraw`;
                  const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` }, body: JSON.stringify({ login: actionModal.accountId, amount: amt, description: actionModal.comment }) });
                  const j = await r.json();
                  if (!j?.ok) throw new Error(j?.error||'Failed');
                  setActionModal(null);
                  Swal.fire({ icon:'success', title: actionModal.type==='deposit' ? 'Deposit successful' : 'Withdrawal successful', timer:1500, showConfirmButton:false });
                  fetchUser();
                  // Log in admin_transactions for reporting
                  try {
                    await fetch(`${BASE}/admin/admin-transactions`, {
                      method: 'POST',
                      headers: { 'Content-Type':'application/json','Authorization':`Bearer ${token}` },
                      body: JSON.stringify({
                        operation_type: actionModal.type === 'deposit' ? 'deposit' : 'withdraw',
                        mt5_login: actionModal.accountId,
                        amount: amt,
                        currency: 'USD',
                        status: 'completed',
                        comment: actionModal.comment || ''
                      })
                    });
                  } catch(_) {}
                } catch(e) {
                  Swal.fire({ icon:'error', title: actionModal.type==='deposit' ? 'Deposit failed' : 'Withdrawal failed', text:e.message||String(e) });
                } finally {
                  setSubmitting(false);
                }
              }} disabled={submitting} className={`px-4 h-10 rounded-md text-white disabled:opacity-70 ${actionModal.type==='deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  actionModal.type==='deposit' ? 'Deposit' : 'Withdraw'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
