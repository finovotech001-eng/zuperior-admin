// src/components/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { SUPERADMIN_MENU, ADMIN_MENU, USER_MENU } from "./SidebarMenuConfig.js";
import { ChevronDown, Moon, Sun } from "lucide-react";

/* ---------- Section ---------- */
function Section({ title, items, pathname, openMap, onToggle, onNavigate, isDark }) {
  return (
    <div className="mt-6">
      <div className={`px-4 text-xs font-semibold tracking-wider ${
        isDark ? 'text-slate-300/70' : 'text-gray-500'
      }`}>
        {title}
      </div>

      <div className="mt-2 space-y-1 px-2">
        {items.map((it) => {
          const hasChildren = Array.isArray(it.children) && it.children.length > 0;
          const active =
            pathname === it.to || (it.to && it.to !== "/" && pathname.startsWith(it.to));
          const withinChild = hasChildren && it.children.some((c) => pathname.startsWith(c.to));
          const isOpen = openMap?.[it.to || it.label] ?? withinChild;

          const parentBase = isDark ? "text-slate-200 hover:bg-white/5" : "text-gray-700 hover:bg-gray-200/50";
          const parentActive = isDark ? "bg-white/10 text-white shadow-sm" : "bg-gray-300 text-gray-900 shadow-sm";
          const childBase = isDark ? "text-slate-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-200/50";
          const childActive = isDark ? "bg-white/10 text-white" : "bg-gray-300 text-gray-900";
          const dotCls = isDark ? "bg-white/60" : "bg-gray-600";

          if (hasChildren) {
            return (
              <div key={it.label}>
                <button
                  type="button"
                  onClick={() => onToggle(it.to || it.label)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 transition ${
                    isOpen || active ? parentActive : parentBase
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {it.icon ? <it.icon size={18} /> : <span className={`h-2 w-2 rounded-full ${dotCls}`} />}
                    <span className="font-medium truncate">{it.label}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ml-1 shrink-0 opacity-75 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`pl-6 pr-1 transition-all duration-600 grid ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden my-1 space-y-1">
                    {it.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-lg px-2 py-1 text-sm ${
                            isActive ? childActive : childBase
                          }`
                        }
                      >
                        <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${dotCls}`} />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `w-full flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                  active || isActive ? parentActive : parentBase
                }`
              }
            >
              {it.icon ? <it.icon size={18} /> : <span className={`h-2 w-2 rounded-full ${dotCls}`} />}
              <span className="font-medium truncate">{it.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Header ---------- */
function Header({ role, isDark, onToggleTheme }) {
  if (role === "superadmin") {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-[18px] leading-6 font-extrabold ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
              AAYAAMX TECH
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Manage Admin & reports
            </div>
          </div>
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-white/10 text-white/80 hover:text-white' 
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <img src="/nexatrader.png" alt="Nexa Trader" className="h-12 w-60 object-contain" />
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-white/10 text-white/80 hover:text-white' 
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}

/* ---------- Sidebar Root ---------- */
export default function Sidebar({
  role = "superadmin",
  pathname = "/",
  open = false,
  onClose = () => {},
  className = "",
}) {
  const MENU =
    role === "superadmin" ? SUPERADMIN_MENU : role === "admin" ? ADMIN_MENU : USER_MENU;

  // Dark mode state management
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark(!isDark);

  // auto-open section for current path
  const initialOpen = useMemo(() => {
    const map = {};
    MENU.forEach((section) =>
      section.items.forEach((it) => {
        if (it.children?.length) {
          map[it.to || it.label] = it.children.some((c) => pathname.startsWith(c.to));
        }
      })
    );
    return map;
  }, [MENU, pathname]);

  const [openMap, setOpenMap] = useState(initialOpen);
  useEffect(() => setOpenMap(initialOpen), [initialOpen]);

  const toggle = (key) => setOpenMap((m) => ({ ...m, [key]: !m[key] }));
  const handleNavigate = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) onClose();
  };

  // Theme-based styles
  const darkGradientStyle = {
    background: "linear-gradient(135deg, #000000 0%, #001a1a 25%, #000000 50%, #001a1a 75%, #000000 100%)"
  };
  
  const lightStyle = {
    background: "#f3f4f6" // gray-100
  };
  
  const backgroundStyle = isDark ? darkGradientStyle : lightStyle;
  const textTheme = isDark ? "text-white" : "text-gray-900";

  return (
    <>
      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
          style={{ ...backgroundStyle, width: "70vw", maxWidth: 380, scrollBehavior: "smooth" }}
          className={`fixed left-0 top-0 bottom-0 transform transition-transform overflow-y-auto overflow-x-hidden
                      sidebar ${textTheme} shadow-xl ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Header role={role} isDark={isDark} onToggleTheme={toggleTheme} />
          <nav className="pb-8">
            {MENU.map((section) => (
              <Section
                key={section.label}
                title={section.label}
                items={section.items}
                pathname={pathname}
                openMap={openMap}
                onToggle={toggle}
                onNavigate={handleNavigate}
                isDark={isDark}
              />
            ))}
          </nav>
        </aside>
      </div>

      {/* DESKTOP (fixed so no bottom gap) */}
      <aside
        style={{ ...backgroundStyle, scrollBehavior: "smooth" }}
        className={`hidden lg:block fixed left-0 top-0 bottom-0 w-[320px] shrink-0 overflow-y-auto overflow-x-hidden
                    sidebar ${textTheme} shadow-xl ${className}`}
      >
        <Header role={role} isDark={isDark} onToggleTheme={toggleTheme} />
        <nav className="pb-8">
          {MENU.map((section) => (
            <Section
              key={section.label}
              title={section.label}
              items={section.items}
              pathname={pathname}
              openMap={openMap}
              onToggle={toggle}
              onNavigate={() => {}}
              isDark={isDark}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
