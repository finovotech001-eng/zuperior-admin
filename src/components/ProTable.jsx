import { useMemo, useState } from "react";
import Badge from "./Badge.jsx";

/**
 * rows: [{...}], columns: [{key,label,render?}]
 * filters: {
 *  searchKeys: ["symbol","source","status","side"],
 *  selects: [
 *    {key:"symbol", label:"All Symbols", options:["BTCUSD","ETHUSD",...]}
 *    {key:"side", label:"All Sides", options:["Buy","Sell"]}
 *    {key:"source", label:"All Sources", options:["MT5","Bridge","FIX"]}
 *    {key:"status", label:"All Statuses", options:["Filled","Rejected","Cancelled"]}
 *  ]
 *  dateKey: "executedAt" (Date ISO)
 * }
 */
export default function ProTable({ title, kpis=[], rows, columns, filters, pageSize=10 }) {
  const [q, setQ] = useState("");
  const [selects, setSelects] = useState(
    Object.fromEntries((filters?.selects||[]).map(s=>[s.key,""]))
  );
  const [from, setFrom]   = useState("");
  const [to,   setTo]     = useState("");
  const [sortBy, setSortBy] = useState(null); // {key,dir}
  const [page, setPage] = useState(1);

  function resetAll() {
    setQ(""); setSelects(Object.fromEntries((filters?.selects||[]).map(s=>[s.key,""])));
    setFrom(""); setTo(""); setSortBy(null); setPage(1);
  }
  function clearDates(){ setFrom(""); setTo(""); setPage(1); }

  const filtered = useMemo(() => {
    let out = [...rows];

    // text search across keys
    if (q) {
      const lower = q.toLowerCase();
      out = out.filter(r => (filters?.searchKeys||Object.keys(r))
        .some(k => String(r[k]??"").toLowerCase().includes(lower)));
    }

    // selects
    for (const [k,v] of Object.entries(selects)) {
      if (v) out = out.filter(r => String(r[k])===v);
    }

    // date range
    if (filters?.dateKey && (from || to)) {
      const fk = Date.parse(from || "1970-01-01");
      const tk = Date.parse(to   || "2999-12-31");
      out = out.filter(r => {
        const t = Date.parse(r[filters.dateKey]);
        return t>=fk && t<=tk;
      });
    }

    // sort
    if (sortBy) {
      const {key,dir} = sortBy;
      out.sort((a,b)=>{
        const av=a[key], bv=b[key];
        if (typeof av==="number" && typeof bv==="number") return dir==="asc"? av-bv : bv-av;
        return dir==="asc"
          ? String(av).localeCompare(String(bv),undefined,{numeric:true})
          : String(bv).localeCompare(String(av),undefined,{numeric:true});
      });
    }
    return out;
  }, [rows,q,selects,from,to,sortBy,filters]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total/pageSize));
  const slice = filtered.slice((page-1)*pageSize, (page-1)*pageSize+pageSize);

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      {!!kpis.length && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl bg-white p-3 md:p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            value={q}
            onChange={e=>{setQ(e.target.value); setPage(1);}}
            placeholder="Search symbol / source / status / side…"
            className="md:col-span-3 rounded-lg border-gray-300 bg-white px-3 py-2 outline-none"
          />

          {(filters?.selects||[]).map((s,i)=>(
            <select key={i}
              value={selects[s.key]}
              onChange={e=>{ setSelects(v=>({...v,[s.key]:e.target.value})); setPage(1); }}
              className="md:col-span-2 rounded-lg border-gray-300 bg-white px-3 py-2">
              <option value="">{s.label}</option>
              {s.options.map(opt=> <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ))}

          {/* dates */}
          <input type="date" value={from} onChange={e=>{setFrom(e.target.value); setPage(1);}}
                 className="md:col-span-1 rounded-lg border-gray-300 bg-white px-3 py-2" />
          <input type="date" value={to}   onChange={e=>{setTo(e.target.value); setPage(1);}}
                 className="md:col-span-1 rounded-lg border-gray-300 bg-white px-3 py-2" />

          <div className="md:col-span-3 flex gap-2">
            <button onClick={clearDates}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2">Clear Dates</button>
            <button onClick={resetAll}
              className="rounded-lg bg-gray-900 text-white px-4 py-2 shadow">Reset All</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-[1]">
              <tr>
                {columns.map(col=>(
                  <th key={col.key}
                      onClick={()=>{
                        setSortBy(s=> s?.key===col.key
                          ? {key:col.key, dir: s.dir==="asc"?"desc":"asc"}
                          : {key:col.key, dir:"asc"});
                      }}
                      className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none whitespace-nowrap">
                    {col.label}{sortBy?.key===col.key ? (sortBy.dir==="asc"?" ▲":" ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slice.map((r,i)=>(
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map(c=>(
                    <td key={c.key} className="px-4 py-3 whitespace-nowrap">
                      {c.render ? c.render(r[c.key], r, Badge) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {!slice.length && (
                <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div className="text-xs text-gray-600">
            Showing {(page-1)*pageSize+1}-{Math.min(page*pageSize,total)} of {total}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setPage(1)} disabled={page===1}
              className="rounded-md border px-3 py-1.5 disabled:opacity-50">« First</button>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="rounded-md border px-3 py-1.5 disabled:opacity-50">‹ Prev</button>
            <span className="rounded-md border px-3 py-1.5 bg-white">{page}</span>
            <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
              className="rounded-md border px-3 py-1.5 disabled:opacity-50">Next ›</button>
            <button onClick={()=>setPage(pages)} disabled={page===pages}
              className="rounded-md border px-3 py-1.5 disabled:opacity-50">Last »</button>
          </div>
        </div>
      </div>
    </div>
  );
}
