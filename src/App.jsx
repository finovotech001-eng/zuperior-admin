// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./layouts/Shell.jsx";
import adminRoutes from "./routes/adminRoutes.jsx";


export default function App() {
  return (
    <Routes>
     

      {/* Admin */}
      <Route element={<Shell role="admin" />}>
        {adminRoutes.map((r) => (
          <Route key={`ad-${r.path}`} path={`/${r.path}`} element={r.element} />
        ))}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

    

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
  );
}
