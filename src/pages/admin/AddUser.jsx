// src/pages/admin/AddUser.jsx
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function AddUser(){
  const [state, setState] = useState({ name:'', email:'', phone:'', country:'', password:'', role:'user', status:'active', emailVerified:false });
  const [submitting,setSubmitting] = useState(false);
  const [msg,setMsg] = useState('');
  const BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5003';
  const navigate = useNavigate(); // <-- for redirect

  async function onSubmit(e){
    e.preventDefault(); setSubmitting(true); setMsg('');
    try{
      const token = localStorage.getItem('adminToken');
      // Create user first as before
      const r = await fetch(`${BASE}/admin/users`, { 
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(state) 
      });
      const data = await r.json();
      if(!data?.ok) throw new Error(data?.error||'Failed');
      setMsg(`User created: ${data.user.email}`);
      // Call the welcome mail API
      const res = await fetch('https://zuperior-crm-api.onrender.com/api/emails/send-welcome', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: state.email,
          name: state.name || 'User'
        })
      });
      const respJson = await res.json();
      if (!res.ok || respJson?.error || respJson?.message?.toLowerCase().includes('exist')) {
        // Check for duplicate, error or message containing 'exist'
        await Swal.fire({
          icon: 'error',
          title: 'Email Already Exists',
          text: respJson?.message || respJson?.error || 'That email address has already been used.'
        });
        setSubmitting(false);
        return;
      }
      await Swal.fire({
        icon: 'success',
        title: 'User Added & Mail Sent',
        text: `User added successfully and welcome email sent to ${state.email}.`,
      });
      setState({ name:'', email:'', phone:'', country:'', password:'', role:'user', status:'active', emailVerified:false });
      navigate('/admin/users/all');
    }catch(e){ 
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.message||String(e)
      });
      setMsg(e.message||String(e)); 
    }
    finally{ setSubmitting(false); }
  }

  return (
    <div className="w-full min-h-screen p-3 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Add New User</h1>
        <p className="text-sm sm:text-base text-gray-600">Create a new user account with custom settings and permissions.</p>
      </div>

      {/* Main Form Card */}
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Information</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Fill in the details to create a new user account</p>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6">
            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name *</label>
                    <input 
                      value={state.name} 
                      onChange={e=>setState({...state,name:e.target.value})} 
                      className="w-full rounded-lg border border-gray-300 h-11 px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address *</label>
                    <input 
                      required 
                      type="email" 
                      value={state.email} 
                      onChange={e=>setState({...state,email:e.target.value})} 
                      className="w-full rounded-lg border border-gray-300 h-11 px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input 
                      value={state.phone} 
                      onChange={e=>setState({...state,phone:e.target.value})} 
                      className="w-full rounded-lg border border-gray-300 h-11 px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <input 
                      value={state.country} 
                      onChange={e=>setState({...state,country:e.target.value})} 
                      className="w-full rounded-lg border border-gray-300 h-11 px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                      placeholder="United States"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password *</label>
                    <input 
                      required 
                      type="password" 
                      value={state.password} 
                      onChange={e=>setState({...state,password:e.target.value})} 
                      className="w-full rounded-lg border border-gray-300 h-11 px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                      placeholder="Enter secure password"
                    />
                  </div>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Account Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Status</label>
                    <select 
                      value={state.status} 
                      onChange={e=>setState({...state,status:e.target.value})} 
                      className="w-full rounded-lg border border-gray-300 h-11 px-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Verification</label>
                    <div className="flex items-center space-x-3 pt-2">
                      <input 
                        id="ev" 
                        type="checkbox" 
                        checked={state.emailVerified} 
                        onChange={e=>setState({...state,emailVerified:e.target.checked})} 
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="ev" className="text-sm text-gray-700">Mark email as verified</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                {msg && (
                  <div className={`p-3 sm:p-4 rounded-lg text-sm ${
                    msg.includes('created') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {msg}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button 
                    type="button" 
                    onClick={() => setState({ name:'', email:'', phone:'', country:'', password:'', role:'user', status:'active', emailVerified:false })}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm sm:text-base"
                  >
                    Reset Form
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating User...
                      </span>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

