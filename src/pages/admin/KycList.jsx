// src/pages/admin/KycList.jsx
import { useEffect, useMemo, useState } from "react";
import ProTable from "../../components/ProTable.jsx";
import Modal from "../../components/Modal.jsx";
import { ShieldCheck, ShieldX } from "lucide-react";

function fmt(v){ if(!v) return "-"; const d=new Date(v); return isNaN(d)?"-":d.toLocaleString(); }

export default function KycList(){
  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");
  const [confirm,setConfirm] = useState(null); // {row,next}
  const [docFile, setDocFile] = useState(null);
  const [addrFile, setAddrFile] = useState(null);
  const [docLink, setDocLink] = useState("");
  const [addrLink, setAddrLink] = useState("");
  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  async function load(){
    setLoading(true); setErr("");
    try{
      const r = await fetch(`${BASE}/admin/kyc?limit=500`);
      const data = await r.json();
      if(!data?.ok) throw new Error(data?.error||'Failed');
      const items = data.items || [];
      setRows(items.map(k=>({
        id:k.id,
        userId:k.userId,
        name:k.User?.name||'-',
        email:k.User?.email||'-',
        country:k.User?.country||'-',
        isDocumentVerified:k.isDocumentVerified,
        isAddressVerified:k.isAddressVerified,
        verificationStatus:k.verificationStatus,
        documentReference:k.documentReference,
        addressReference:k.addressReference,
        documentSubmittedAt:k.documentSubmittedAt,
        addressSubmittedAt:k.addressSubmittedAt,
        createdAt:k.createdAt,
      })));
    }catch(e){ setErr(e.message||String(e)); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function applyChange(id, data){
    const r = await fetch(`${BASE}/admin/kyc/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
    const j = await r.json();
    if(!j?.ok) throw new Error(j?.error||'Failed');
  }

  async function onToggleStatus(row, next){
    try{
      let documentReference = undefined;
      let addressReference = undefined;
      if (next) {
        // Optional upload of proofs when verifying
        if (docFile || addrFile) {
          const fd = new FormData();
          if (docFile) fd.append('document', docFile);
          if (addrFile) fd.append('address', addrFile);
          const up = await fetch(`${BASE}/admin/uploads`, { method:'POST', body: fd });
          const uj = await up.json();
          if (uj?.ok) {
            documentReference = uj.files?.document || undefined;
            addressReference = uj.files?.address || undefined;
          }
        }
        if (!documentReference && docLink) documentReference = docLink;
        if (!addressReference && addrLink) addressReference = addrLink;
      }

      await applyChange(row.id, {
        verificationStatus: next ? 'Verified' : 'Pending',
        ...(documentReference ? { documentReference } : {}),
        ...(addressReference ? { addressReference } : {}),
      });
      setRows(list=> list.map(it=> it.id===row.id?{...it, verificationStatus: next?'Verified':'Pending', documentReference: documentReference||it.documentReference, addressReference: addressReference||it.addressReference}:it));
      setConfirm(null);
      setDocFile(null); setAddrFile(null); setDocLink(""); setAddrLink("");
    }catch(e){ console.error(e); setConfirm(null); }
  }

  async function onToggleDoc(row){
    try{ await applyChange(row.id, { isDocumentVerified: !row.isDocumentVerified });
      setRows(list=> list.map(it=> it.id===row.id?{...it, isDocumentVerified: !row.isDocumentVerified}:it));
    }catch(e){ console.error(e); }
  }
  async function onToggleAddr(row){
    try{ await applyChange(row.id, { isAddressVerified: !row.isAddressVerified });
      setRows(list=> list.map(it=> it.id===row.id?{...it, isAddressVerified: !row.isAddressVerified}:it));
    }catch(e){ console.error(e); }
  }

  const columns = useMemo(()=>[
    { key:'__index', label:'Sr No', sortable:false },
    { key:'name', label:'Name' },
    { key:'email', label:'Email' },
    { key:'country', label:'Country' },
    { key:'isDocumentVerified', label:'Doc', render:(v, row, Badge)=> (
      <button onClick={()=>onToggleDoc(row)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${v? 'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-800'}`}>{v?'Yes':'No'}</button>
    )},
    { key:'isAddressVerified', label:'Addr', render:(v, row, Badge)=> (
      <button onClick={()=>onToggleAddr(row)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${v? 'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-800'}`}>{v?'Yes':'No'}</button>
    )},
    { key:'verificationStatus', label:'Status', render:(v, row, Badge)=> (
      <Badge tone={v==='Verified'?'green': v==='Rejected'?'red':'amber'}>{v}</Badge>
    )},
    { key:'documentSubmittedAt', label:'Doc Submitted', render:(v,row)=> row.documentReference ? <a className="text-violet-700 hover:underline" href={row.documentReference} target="_blank" rel="noreferrer">{fmt(v)}</a> : fmt(v) },
    { key:'addressSubmittedAt', label:'Addr Submitted', render:(v,row)=> row.addressReference ? <a className="text-violet-700 hover:underline" href={row.addressReference} target="_blank" rel="noreferrer">{fmt(v)}</a> : fmt(v) },
    { key:'createdAt', label:'Created', render:fmt },
    { key:'actions', label:'Actions', sortable:false, render:(v,row)=> (
      <div className="flex items-center gap-2">
        <button onClick={()=>setConfirm({row, next: row.verificationStatus!=='Verified'})}
                className="h-8 px-3 rounded-md border border-violet-200 text-violet-700 hover:bg-violet-50 inline-flex items-center gap-1">
          {row.verificationStatus==='Verified' ? <ShieldX size={16}/> : <ShieldCheck size={16}/>} {row.verificationStatus==='Verified'?'Unverify':'Verify'}
        </button>
      </div>
    )},
  ],[]);

  const filters = useMemo(()=>({
    searchKeys:['name','email','country','verificationStatus'],
  }),[]);

  const verifiedRows = useMemo(() => rows.filter(r => r.verificationStatus === 'Verified'), [rows]);
  const unverifiedRows = useMemo(() => rows.filter(r => r.verificationStatus !== 'Verified'), [rows]);

  if(loading) return <div className="rounded-xl bg-white border border-gray-200 p-4">Loading KYC…</div>;
  if(err) return <div className="rounded-xl bg-white border border-rose-200 text-rose-700 p-4">{err}</div>;

  return (
    <>
      <ProTable title="Unverified KYC (Pending)" rows={unverifiedRows} columns={columns} filters={filters}
                searchPlaceholder="Search name / email / country / status…" pageSize={10} />

      {/* Verified-only table */}
      <div className="mt-8">
        <ProTable title="Verified KYC (Approved)" rows={verifiedRows} columns={columns} filters={{ searchKeys:['name','email','country'] }}
                  searchPlaceholder="Search verified name / email / country…" pageSize={10} />
      </div>

      {/* Verify Modal with optional proof uploads/links */}
      <Modal open={!!confirm} onClose={()=>{setConfirm(null); setDocFile(null); setAddrFile(null); setDocLink(""); setAddrLink("");}} title="Confirm KYC Status">
        {confirm && (
          <div className="space-y-5">
            <p>
              Do you want to {confirm.next ? 'verify' : 'unverify'} KYC for <b>{confirm.row.email}</b>?
            </p>
            {confirm.next && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Identity Proof (Document)</div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-600 truncate max-w-[60%]">{docFile ? docFile.name : 'No file selected'}</div>
                    <label htmlFor="kyc-doc" className="px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-sm cursor-pointer">Choose file</label>
                    <input id="kyc-doc" type="file" accept="image/*,application/pdf" className="hidden" onChange={e=>setDocFile(e.target.files?.[0]||null)} />
                  </div>
                  <input type="text" placeholder="or paste document link" value={docLink} onChange={e=>setDocLink(e.target.value)} className="mt-2 w-full rounded-md border border-gray-300 h-10 px-3" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Address Proof</div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-600 truncate max-w-[60%]">{addrFile ? addrFile.name : 'No file selected'}</div>
                    <label htmlFor="kyc-addr" className="px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-sm cursor-pointer">Choose file</label>
                    <input id="kyc-addr" type="file" accept="image/*,application/pdf" className="hidden" onChange={e=>setAddrFile(e.target.files?.[0]||null)} />
                  </div>
                  <input type="text" placeholder="or paste address link" value={addrLink} onChange={e=>setAddrLink(e.target.value)} className="mt-2 w-full rounded-md border border-gray-300 h-10 px-3" />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={()=>{setConfirm(null); setDocFile(null); setAddrFile(null); setDocLink(""); setAddrLink("");}} className="px-4 h-10 rounded-md border">Cancel</button>
              <button onClick={()=>onToggleStatus(confirm.row, confirm.next)} className="px-4 h-10 rounded-md bg-violet-600 text-white">Confirm</button>
            </div>
          </div>
        )}
      </Modal>

      {/* single modal only */}
    </>
  );
}
