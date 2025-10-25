// src/layouts/Shell.jsx
import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { ADMIN_MENU, SUPERADMIN_MENU, USER_MENU } from "../components/SidebarMenuConfig.js";
import { LayoutDashboard, Users as UsersIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Shell() {
  const { admin } = useAuth();
  
  // Determine role based on admin's role
  const role = admin?.role === 'superadmin' ? 'superadmin' : 'admin';
  console.log('Shell - admin:', admin, 'role:', role);
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setMobileOpen(v => !v);
  const closeSidebar  = () => setMobileOpen(false);

  const menu = useMemo(() => (
    role === 'superadmin' ? SUPERADMIN_MENU : role === 'admin' ? ADMIN_MENU : USER_MENU
  ), [role]);

  const breadcrumbs = useMemo(() => {
    const list = [];
    // Root
    const rootTo = role === 'superadmin' ? '/sa/dashboard' : role === 'admin' ? '/admin/dashboard' : '/u/dashboard';
    const rootLabel = role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User';
    list.push({ label: rootLabel, to: rootTo, icon: LayoutDashboard });

    let matched = null;
    let parent = null;
    menu.forEach(section => {
      section.items.forEach(item => {
        if (item.children?.length) {
          const found = item.children.find(c => c.to === pathname);
          if (found) { matched = found; parent = item; }
        } else if (item.to === pathname) { matched = item; parent = null; }
      });
    });

    if (parent) list.push({ label: parent.label, to: parent.to, icon: parent.icon });
    if (matched) list.push({ label: matched.label, to: matched.to, icon: parent?.icon });

    // Fallback for dynamic pages e.g., /admin/users/:id
    if (!matched) {
      if (pathname.startsWith('/admin/users/')) {
        const sec = menu.find(s => s.label.toLowerCase().includes('clients')) || menu[0];
        const manage = sec?.items?.find(i => i.label.toLowerCase().includes('manage users'));
        const all = manage?.children?.find(c => c.label.toLowerCase().includes('all users'));
        if (manage) list.push({ label: manage.label, to: `/admin/${manage.to}`, icon: manage.icon || UsersIcon });
        if (all) list.push({ label: all.label, to: `/admin/${all.to}`, icon: manage?.icon || UsersIcon });
        list.push({ label: 'User Details' });
      }
    }
    return list;
  }, [menu, pathname, role]);

  return (
    <div className="min-h-screen bg-sky-50 relative">
      {/* Fixed sidebar (desktop) + drawer (mobile) */}
      <Sidebar
        role={role}
        adminRole={admin?.role || 'admin'}
        pathname={pathname}
        open={mobileOpen}
        onClose={closeSidebar}
      />

      {/* Main content area – reserve sidebar width on lg+ */}
      <main className="min-h-screen lg:pl-[320px]">
        <Topbar role={role} onMenuToggle={toggleSidebar} breadcrumbs={breadcrumbs} />

        {/* Page canvas */}
        <div className="min-h-[calc(100vh-72px)]">
          {/* Full-width responsive container with consistent paddings */}
          <div className="w-full py-4 md:py-6 lg:py-8" style={{ paddingInline: 'var(--app-x)' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
