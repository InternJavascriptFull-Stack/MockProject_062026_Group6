import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Activation } from "./pages/auth/Activation";
import { TwoStepVerification } from "./pages/auth/TwoStepVerification";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import Patients from "./pages/Patients/page";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import RoleMatrix from "./pages/roles/RoleMatrix";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activation />} />
      <Route path="/verify-otp" element={<TwoStepVerification />} />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <UserList />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <RoleMatrix />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <UserForm />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id/edit"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <UserForm />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

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

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
