// src/layouts/Shell.jsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function Shell({ role }) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setMobileOpen(v => !v);
  const closeSidebar  = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-sky-50 relative">
      {/* Fixed sidebar (desktop) + drawer (mobile) */}
      <Sidebar
        role={role}
        pathname={pathname}
        open={mobileOpen}
        onClose={closeSidebar}
      />

      {/* Main content area – reserve sidebar width on lg+ */}
      <main className="min-h-screen lg:pl-[320px]">
        <Topbar role={role} onMenuToggle={toggleSidebar} />

        {/* Page canvas */}
        <div className="min-h-[calc(100vh-72px)]">
          <div className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
