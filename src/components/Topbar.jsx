// src/components/Topbar.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Shield, Bell, Search, ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { SUPERADMIN_MENU, ADMIN_MENU, USER_MENU } from "./SidebarMenuConfig.js";

/**
 * Props
 * - onMenuToggle?: () => void
 * - role?: "superadmin" | "admin" | "user"
 * - title?: string
 * - breadcrumbs?: {label:string,to?:string}[]
 */
export default function Topbar({
  onMenuToggle = () => {},
  role = "superadmin",
  title = "Dashboard",
  breadcrumbs = [],
}) {
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  // Light theme: use plain white background (no gradient)

  // Get menu items based on role
  const getMenuItems = () => {
    switch (role) {
      case "superadmin": return SUPERADMIN_MENU;
      case "admin": return ADMIN_MENU;
      case "user": return USER_MENU;
      default: return [];
    }
  };

  // Flatten menu items for search - only sidebar features
  const getAllMenuItems = () => {
    const menuItems = getMenuItems();
    const items = [];
    
    menuItems.forEach(section => {
      section.items.forEach(item => {
        // Only add main menu items (not logout)
        if (item.to !== '/logout') {
          items.push({
            label: item.label,
            to: item.to,
            section: section.label,
            icon: item.icon
          });
          
          // Add children if they exist
          if (item.children) {
            item.children.forEach(child => {
              items.push({
                label: child.label,
                to: child.to,
                section: section.label,
                parent: item.label,
                icon: item.icon
              });
            });
          }
        }
      });
    });
    
    return items;
  };

  // Get current page name based on pathname
  const getCurrentPageName = () => {
    const allItems = getAllMenuItems();
    const currentItem = allItems.find(item => item.to === location.pathname);
    return currentItem ? currentItem.label : title;
  };

  // Search functionality - only sidebar features
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const allItems = getAllMenuItems();
    const filtered = allItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.section.toLowerCase().includes(query.toLowerCase()) ||
      (item.parent && item.parent.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 6); // Limit to 6 results for better UX

    setSearchResults(filtered);
  };

  // Navigate to selected item
  const handleNavigate = (to) => {
    navigate(to);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const profileHref =
    role === "user" ? "/u/settings/profile" : role === "admin" ? "/admin/profile" : "/sa/profile";
  const logoutHref = role === "user" ? "/u/logout" : "/logout";

  return (
    <>
      {/* Fixed bar aligned to content width with full responsiveness */}
        <header className="pointer-events-none fixed z-40 top-2 left-0 right-0 lg:left-[320px]">
        <div
          style={{ marginInline: 'var(--app-x)' }}
          className="pointer-events-auto w-[calc(100%-var(--app-x)*2)] rounded-2xl bg-white border border-gray-200 text-gray-800 shadow-md">
          <div className="h-14 px-2 sm:px-4 md:px-6 flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Title / Breadcrumbs */}
            <div className="flex-1 min-w-0">
              <div className="hidden md:flex items-center gap-2 text-xs">
                {breadcrumbs.length ? (
                  breadcrumbs.map((bc, i) => (
                    <span key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="opacity-40">/</span>}
                      {bc.to ? (
                        <a href={bc.to} className="hover:underline text-gray-600 inline-flex items-center gap-1.5">
                          {bc.icon ? <bc.icon className="h-3.5 w-3.5" /> : null}
                          <span>{bc.label}</span>
                        </a>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 text-gray-900 ${
                            i === breadcrumbs.length - 1 ? "font-semibold" : ""
                          }`}
                        >
                          {bc.icon ? <bc.icon className="h-3.5 w-3.5" /> : null}
                          <span>{bc.label}</span>
                        </span>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="font-semibold text-gray-900">{getCurrentPageName()}</span>
                )}
              </div>
              <div className="md:hidden font-semibold truncate">{getCurrentPageName()}</div>
            </div>

            {/* Mobile Search Button (xs only) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Search (sm+) */}
            <div className="hidden sm:flex relative" ref={searchRef}>
              <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 border border-gray-200 min-w-[260px] max-w-md w-full">
                <Search className="h-4 w-4 opacity-80" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search sidebar features..."
                  className="w-full bg-transparent placeholder:text-gray-500 text-gray-800 outline-none"
                />
              </div>

              {/* Search Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl z-50">
                  <div className="p-2">
                    {searchResults.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleNavigate(item.to)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <item.icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-900 font-medium text-sm truncate">{item.label}</div>
                            <div className="text-gray-500 text-xs">
                              {item.parent ? `${item.section} > ${item.parent}` : item.section}
                            </div>
                          </div>
                          <div className="text-gray-500 group-hover:text-gray-700 transition-colors flex-shrink-0">
                            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {isSearchOpen && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl z-50">
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>

            {/* Balance Display */}
            {/* <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl bg-gray-100 border border-gray-200">
              <div className="text-right">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Balance</div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-600">$25,040.22</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
              <div className="text-right">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Equity</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-600">$24,890.15</div>
              </div>
            </div> */}

            {/* Role chip */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Shield className="h-3.5 w-3.5" />
              {role === "superadmin" ? "SUPER ADMIN" : role.toUpperCase()}
            </span>

            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex items-center gap-2 rounded-xl hover:bg-gray-100 px-1.5 py-1.5 border border-gray-200"
              >
                <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <ChevronDown className="h-4 w-4 opacity-80" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-2xl">
                  <div className="px-3 py-2 text-xs text-gray-500">
                    Signed in as <span className="text-gray-700">{admin?.email || 'admin@zuperior.io'}</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <a href={profileHref} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100">
                      <User className="h-4 w-4 opacity-80" /> Profile
                    </a>
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-rose-600 w-full text-left"
                    >
                      <LogOut className="h-4 w-4 opacity-80" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so content never hides under the fixed bar */}
      <div className="h-[72px]" />
    </>
  );
}
