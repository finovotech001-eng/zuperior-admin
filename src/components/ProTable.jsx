import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
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
export default function ProTable({ title, kpis=[], rows=[], columns=[], filters, pageSize=10, searchPlaceholder="Search..." }) {
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

  const baseIndex = (page-1)*pageSize;

  return (
    <div className="space-y-4">
      {title && (
        <div className="px-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      {/* KPI cards */}
      {!!kpis.length && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 md:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 w-full lg:w-auto">
            <input
              value={q}
              onChange={e=>{setQ(e.target.value); setPage(1);}}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border-gray-300 bg-white px-4 py-3 h-[44px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap gap-3">
            {(filters?.selects||[]).map((s,i)=>(
              <select key={i}
                value={selects[s.key]}
                onChange={e=>{ setSelects(v=>({...v,[s.key]:e.target.value})); setPage(1); }}
                className="rounded-lg border-gray-300 bg-white px-4 py-3 h-[44px] min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">{s.label}</option>
                {s.options.map(opt=> <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ))}

            {/* Date Inputs */}
            <div className="flex gap-2">
              <input type="date" value={from} onChange={e=>{setFrom(e.target.value); setPage(1);}}
                     className="rounded-lg border-gray-300 bg-white px-4 py-3 h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
              <input type="date" value={to}   onChange={e=>{setTo(e.target.value); setPage(1);}}
                     className="rounded-lg border-gray-300 bg-white px-4 py-3 h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={clearDates}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 h-[44px] hover:bg-gray-50 transition-all font-medium">
              Clear Dates
            </button>
            <button onClick={resetAll}
              className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 h-[44px] shadow-md hover:shadow-lg transition-all font-medium">
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-[1]">
              <tr>
                {columns.map(col=>(
                  <th key={col.key}
                      onClick={()=>{
                        if (col.key==='__index' || col.sortable===false) return;
                        setSortBy(s=> s?.key===col.key
                          ? {key:col.key, dir: s.dir==="asc"?"desc":"asc"}
                          : {key:col.key, dir:"asc"});
                      }}
                      className={`px-6 py-4 font-semibold text-gray-800 select-none whitespace-nowrap text-center border-r border-gray-200 last:border-r-0 ${col.key==='__index' || col.sortable===false ? '' : 'cursor-pointer hover:bg-gray-200 transition-colors'}`}>
                    {col.label}{sortBy?.key===col.key ? (sortBy.dir==="asc"?" ▲":" ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {slice.map((r,i)=>(
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {columns.map(c=>{
                    const content = c.key==='__index'
                      ? (baseIndex + i + 1)
                      : (c.render ? c.render(r[c.key], r, Badge, baseIndex + i) : r[c.key]);
                    return (
                      <td key={c.key} className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-100 last:border-r-0">
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!slice.length && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Inbox size={18} />
                      <span>No data found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="text-sm text-gray-700 font-medium">
            Showing {(page-1)*pageSize+1}-{Math.min(page*pageSize,total)} of {total}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setPage(1)} disabled={page===1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              « First
            </button>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              ‹ Prev
            </button>
            <span className="rounded-lg border border-gray-300 bg-purple-600 text-white px-4 py-2 text-sm font-medium">
              {page}
            </span>
            <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Next ›
            </button>
            <button onClick={()=>setPage(pages)} disabled={page===pages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Last »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
