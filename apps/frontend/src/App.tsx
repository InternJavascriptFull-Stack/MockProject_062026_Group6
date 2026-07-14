import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Activation } from "./pages/auth/Activation";
import { TwoStepVerification } from "./pages/auth/TwoStepVerification";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { AppLayout } from "./layouts/appLayout";

import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import RoleMatrix from "./pages/roles/RoleMatrix";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import DemoSeeder from "./pages/admin/DemoSeeder";
import IncidentDetail from "./pages/residents/IncidentDetail";
import IncidentList from "./pages/residents/IncidentList";
import ChartLockConfirmation from "./pages/residents/ChartLockConfirmation";
import { DoctorsSchedulePage } from "./pages/schedule/doctorsSchedulePage";
import { EmarPage } from "./pages/emar/emarPage";
import { CarePlanPage } from "./pages/carePlan/carePlanPage";
import IncidentSeverityLevels from "./pages/incidentSeverity/IncidentSeverityLevels";
import SlaConfiguration from "./pages/slaConfig/SlaConfiguration";
import EquipmentInventory from "./pages/inventory/EquipmentInventory";
import EquipmentForm from "./pages/inventory/EquipmentForm";
import FacilitySettingsPage from "./pages/facilities/FacilitySettingsPage";
import LocRateTablePage from "./pages/careLevels/LocRateTablePage";
import StaffingRatioPage from "./pages/staffingRatios/StaffingRatioPage";
import { ResidentListPage } from "./pages/residents/residentListPage";
import { ResidentFormPage } from "./pages/residents/residentFormPage";
import { ResidentProfileDetailPage } from "./pages/residents/residentProfileDetailPage";
import { ResidentReceptionPage } from "./pages/residents/residentReceptionPage";
import { CarePlanListPage } from "./pages/carePlan/carePlanListPage";
import { CreateCarePlanPage } from "./pages/carePlan/createCarePlanPage";
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
                path="/admin/data"
                element={
                    <ProtectedRoute>
                        <AdminLayout>
                            <DemoSeeder />
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
                path="/admin/facility"
                element={
                    <ProtectedRoute allowedRoles={["System Admin"]}>
                        <AdminLayout>
                            <FacilitySettingsPage />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/loc-rates"
                element={
                    <ProtectedRoute allowedRoles={["System Admin"]}>
                        <AdminLayout>
                            <LocRateTablePage />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/staffing"
                element={
                    <ProtectedRoute allowedRoles={["System Admin"]}>
                        <AdminLayout>
                            <StaffingRatioPage />
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

            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/residents" element={<ResidentListPage />} />
                <Route path="/residents/create" element={<ResidentFormPage />} />
                <Route path="/residents/:id" element={<ResidentProfileDetailPage />} />
                <Route path="/residents/:id/edit" element={<ResidentFormPage />} />
                <Route path="/admissions/pre-screening" element={<ResidentReceptionPage />} />
                <Route path="/residents/reception" element={<ResidentReceptionPage />} />
                <Route path="/doctor-schedule" element={<DoctorsSchedulePage />} />
                <Route path="/emar" element={<EmarPage />} />
                <Route path="/care-plans" element={<CarePlanListPage />} />
                <Route path="/care-plans/new" element={<CreateCarePlanPage />} />
                <Route path="/care-plans/:id" element={<CarePlanPage />} />
                <Route path="/care-plans/:id/review" element={<DonReviewPage />} />
                <Route path="/care-plans/:id/acknowledge" element={<IdtAcknowledgmentPage />} />
                <Route path="/incidents" element={<IncidentList />} />
                <Route path="/incidents/:id" element={<IncidentDetail />} />
                <Route path="/incidents/:id/lock-confirm" element={<ChartLockConfirmation />} />
            </Route>

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
