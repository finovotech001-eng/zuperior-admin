// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Shell from "./layouts/Shell.jsx";
import Login from "./pages/Login.jsx";
import Setup from "./pages/Setup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import adminRoutes from "./routes/adminRoutes.jsx";
import AdminIndexRedirect from "./components/AdminIndexRedirect.jsx";
import FeatureGuard from "./components/FeatureGuard.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Setup Route */}
        <Route path="/setup" element={<Setup />} />
        
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Shell />
            </ProtectedRoute>
          }
        >
          {adminRoutes.map((r) => {
            const topFeature = (r.path || '').split('/')[0];
            return (
              <Route
                key={`ad-${r.path}`}
                path={r.path}
                element={<FeatureGuard feature={topFeature}>{r.element}</FeatureGuard>}
              />
            );
          })}
          <Route path="" element={<AdminIndexRedirect />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen grid place-items-center bg-white text-black">
              <h1 className="text-3xl font-semibold">Not found</h1>
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
