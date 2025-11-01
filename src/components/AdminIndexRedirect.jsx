import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ROLE_FEATURES } from "./SidebarMenuConfig.js";
import { useAuth } from "../contexts/AuthContext";

export default function AdminIndexRedirect() {
  const { admin } = useAuth();
  const adminRole = admin?.admin_role || admin?.role || "admin";
  const [target, setTarget] = useState(null);

  const BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";
  const builtin = useMemo(() => ["superadmin", "admin", "moderator", "support", "analyst"], []);

  useEffect(() => {
    async function resolve() {
      if (adminRole === "superadmin") {
        setTarget("dashboard");
        return;
      }
      const priority = [
        "dashboard",
        "users",
        "kyc",
        "mt5",
        "deposits",
        "withdrawals",
        "payment-gateways",
        "payment-details",
        "bulk-logs",
      ];

      let features = ROLE_FEATURES[adminRole] || [];
      if (!builtin.includes(adminRole)) {
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${BASE}/admin/roles`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          const match = Array.isArray(data?.roles)
            ? data.roles.find((r) => (r.name || "").toLowerCase() === String(adminRole).toLowerCase())
            : null;
          const feats = match?.permissions?.features;
          if (Array.isArray(feats) && feats.length) features = feats;
        } catch {}
      }

      // pick first feature in priority that exists
      const chosen = priority.find((p) => features.includes(p)) || features[0] || "dashboard";
      setTarget(chosen);
    }
    resolve();
  }, [adminRole, BASE, builtin]);

  if (!target) return null;
  return <Navigate to={`/admin/${target}`} replace />;
}


