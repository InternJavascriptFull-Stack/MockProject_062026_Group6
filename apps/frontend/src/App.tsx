import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Activation } from "./pages/auth/Activation";
import { TwoStepVerification } from "./pages/auth/TwoStepVerification";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { AppLayout } from "./layouts/appLayout";
import Patients from "./pages/Patients/page";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import RoleMatrix from "./pages/roles/RoleMatrix";

// Care Plan pages
import { CarePlanListPage } from "./pages/carePlan/carePlanListPage";
import { CreateCarePlanPage } from "./pages/carePlan/createCarePlanPage";
import { CarePlanPage } from "./pages/carePlan/carePlanPage";
import { DonReviewPage } from "./pages/carePlan/donReviewPage";
import { IdtAcknowledgmentPage } from "./pages/carePlan/idtAcknowledgmentPage";

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
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Patients />} />
        <Route path="/dashboard/admin" element={<Patients />} />
        
        {/* Care Plan Routes */}
        <Route path="/care-plans" element={<CarePlanListPage />} />
        <Route path="/care-plans/new" element={<CreateCarePlanPage />} />
        <Route path="/care-plans/:id" element={<CarePlanPage />} />
        <Route path="/care-plans/:id/review" element={<DonReviewPage />} />
        <Route path="/care-plans/:id/acknowledge" element={<IdtAcknowledgmentPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
