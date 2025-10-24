// src/pages/admin/AddUser.jsx
import { useState } from 'react';

export default function AddUser(){
  const [state, setState] = useState({ name:'', email:'', phone:'', country:'', password:'', role:'user', status:'active', emailVerified:false });
  const [submitting,setSubmitting] = useState(false);
  const [msg,setMsg] = useState('');
  const BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5003';

  async function onSubmit(e){
    e.preventDefault(); setSubmitting(true); setMsg('');
    try{
      const r = await fetch(`${BASE}/admin/users`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(state) });
      const data = await r.json();
      if(!data?.ok) throw new Error(data?.error||'Failed');
      setMsg(`User created: ${data.user.email}`);
      setState({ name:'', email:'', phone:'', country:'', password:'', role:'user', status:'active', emailVerified:false });
    }catch(e){ setMsg(e.message||String(e)); }
    finally{ setSubmitting(false); }
  }

  return (
    <div className="max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Add User</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-600">Name</label>
          <input value={state.name} onChange={e=>setState({...state,name:e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Email</label>
          <input required type="email" value={state.email} onChange={e=>setState({...state,email:e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Phone</label>
          <input value={state.phone} onChange={e=>setState({...state,phone:e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Country</label>
          <input value={state.country} onChange={e=>setState({...state,country:e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Password</label>
          <input required type="password" value={state.password} onChange={e=>setState({...state,password:e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Role</label>
          <select value={state.role} onChange={e=>setState({...state,role:e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600">Status</label>
          <select value={state.status} onChange={e=>setState({...state,status:e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 h-10 px-3">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="banned">banned</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <input id="ev" type="checkbox" checked={state.emailVerified} onChange={e=>setState({...state,emailVerified:e.target.checked})} />
          <label htmlFor="ev" className="text-sm">Email Verified</label>
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button type="submit" disabled={submitting} className="px-4 h-10 rounded-md bg-violet-600 text-white disabled:opacity-60">{submitting? 'Creating...' : 'Create User'}</button>
        </div>
        {msg && <div className="md:col-span-2 text-sm text-gray-700">{msg}</div>}
      </form>
    </div>
  );
}

