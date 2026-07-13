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
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import { ResidentListPage } from "./pages/residents/residentListPage";
import { ResidentReceptionPage } from "./pages/residents/residentReceptionPage";
import { DoctorsSchedulePage } from "./pages/schedule/doctorsSchedulePage";
import { EmarPage } from "./pages/emar/emarPage";
import { CarePlanPage } from "./pages/carePlan/carePlanPage";
import IncidentSeverityLevels from "./pages/incidentSeverity/IncidentSeverityLevels";
import SlaConfiguration from "./pages/slaConfig/SlaConfiguration";
import EquipmentInventory from "./pages/inventory/EquipmentInventory";
import EquipmentForm from "./pages/inventory/EquipmentForm";

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
            <AdminLayout>
              <DashboardRouter />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardRouter />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/residents" element={<ProtectedRoute><AdminLayout><ResidentListPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/residents/reception" element={<ProtectedRoute><AdminLayout><ResidentReceptionPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/doctor-schedule" element={<ProtectedRoute><AdminLayout><DoctorsSchedulePage /></AdminLayout></ProtectedRoute>} />
      <Route path="/emar" element={<ProtectedRoute><AdminLayout><EmarPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/care-plan" element={<ProtectedRoute><AdminLayout><CarePlanPage /></AdminLayout></ProtectedRoute>} />

      <Route path="/admin/incident-severity" element={<ProtectedRoute><AdminLayout><IncidentSeverityLevels /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/sla-config" element={<ProtectedRoute><AdminLayout><SlaConfiguration /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/equipment" element={<ProtectedRoute><AdminLayout><EquipmentInventory /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/equipment/add" element={<ProtectedRoute><AdminLayout><EquipmentForm /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/equipment/:id/edit" element={<ProtectedRoute><AdminLayout><EquipmentForm /></AdminLayout></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
