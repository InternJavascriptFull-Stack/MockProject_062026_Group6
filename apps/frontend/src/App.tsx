import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Activation } from "./pages/auth/Activation";
import { TwoStepVerification } from "./pages/auth/TwoStepVerification";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Patients from "./pages/Patients/page";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public auth routes ──────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<Activation />} />
        <Route path="/verify-otp" element={<TwoStepVerification />} />

        {/* ── Protected routes (AC4: deny access without OTP-verified session) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          }
        />

        {/* Root → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Wildcard → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
