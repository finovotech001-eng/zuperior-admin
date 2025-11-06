import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSuperAdminFeatures } from "./SidebarMenuConfig.js";
import { useAuth } from "../contexts/AuthContext";
import AdminIndexRedirect from "./AdminIndexRedirect.jsx";

export default function FeatureGuard({ feature, children }) {
  const { admin } = useAuth();
  const adminRole = admin?.admin_role || admin?.role || "admin";
  const [allowed, setAllowed] = useState(null); // null=loading, true/false=decision
  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  const isBuiltin = useMemo(() => ["superadmin", "admin", "moderator", "support", "analyst"].includes(adminRole), [adminRole]);

  useEffect(() => {
    async function check() {
      if (adminRole === "superadmin") {
        setAllowed(true);
        return;
      }
      // For custom roles, fetch from DB
      let features = [];
      if (!isBuiltin) {
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${BASE}/admin/roles`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          const match = Array.isArray(data?.roles) ? data.roles.find(r => (r.name || '').toLowerCase() === String(adminRole).toLowerCase()) : null;
          const feats = match?.permissions?.features;
          if (Array.isArray(feats)) features = feats;
        } catch {}
      }
      const top = (feature || '').split('/')[0];
      setAllowed(features.includes(top));
    }
    check();
  }, [adminRole, feature, isBuiltin, BASE]);

  if (allowed === null) return null;
  if (allowed) return children;
  // Not allowed -> send to first permitted route
  return <AdminIndexRedirect />;
}


