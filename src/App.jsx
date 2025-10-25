// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Shell from "./layouts/Shell.jsx";
import Login from "./pages/Login.jsx";
import Setup from "./pages/Setup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import adminRoutes from "./routes/adminRoutes.jsx";

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
          {adminRoutes.map((r) => (
            <Route key={`ad-${r.path}`} path={r.path} element={r.element} />
          ))}
          <Route path="" element={<Navigate to="dashboard" replace />} />
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
