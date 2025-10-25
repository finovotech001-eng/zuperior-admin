// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on app start
    const token = localStorage.getItem("adminToken");
    const adminInfo = localStorage.getItem("adminInfo");

    if (token && adminInfo) {
      try {
        setAdmin(JSON.parse(adminInfo));
      } catch (err) {
        // Invalid admin info, clear storage
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
      }
    }
    setLoading(false);
  }, []);

  const login = (adminData, token) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminInfo", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    // Clear ALL localStorage and cache
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    setAdmin(null);
  };

  const isAuthenticated = () => {
    return !!admin && !!localStorage.getItem("adminToken");
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
