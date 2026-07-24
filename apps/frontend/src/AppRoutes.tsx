import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { AppLayout } from "./layouts/appLayout";
import DemoSeeder from "./pages/admin/DemoSeeder";
import AdmissionFormPage from "./pages/admissions/AdmissionFormPage";
import AssessmentHistoryPage from "./pages/assessments/AssessmentHistoryPage";
import InitialAssessmentPage from "./pages/assessments/InitialAssessmentPage";
import LocClassificationPage from "./pages/assessments/LocClassificationPage";
import LocHistoryPage from "./pages/assessments/LocHistoryPage";
import ReassessmentPage from "./pages/assessments/ReassessmentPage";
import { Activation } from "./pages/auth/Activation";
import { Login } from "./pages/auth/Login";
import { TwoStepVerification } from "./pages/auth/TwoStepVerification";
import CostBillingPanelPage from "./pages/billing/CostBillingPanelPage";
import LocRateTablePage from "./pages/careLevels/LocRateTablePage";
import { CarePlanListPage } from "./pages/carePlan/carePlanListPage";
import { CarePlanPage } from "./pages/carePlan/carePlanPage";
import { CreateCarePlanPage } from "./pages/carePlan/createCarePlanPage";
import { DonReviewPage } from "./pages/carePlan/donReviewPage";
import { IdtAcknowledgmentPage } from "./pages/carePlan/idtAcknowledgmentPage";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import { EmarPage } from "./pages/emar/emarPage";
import FacilitySettingsPage from "./pages/facilities/FacilitySettingsPage";
import IncidentSeverityLevels from "./pages/incidentSeverity/IncidentSeverityLevels";
import EquipmentForm from "./pages/inventory/EquipmentForm";
import EquipmentInventory from "./pages/inventory/EquipmentInventory";
import ChartLockConfirmation from "./pages/residents/ChartLockConfirmation";
import ChartUnlockPage from "./pages/residents/ChartUnlockPage";
import ExternalReportPage from "./pages/residents/ExternalReportPage";
import IncidentDetail from "./pages/residents/IncidentDetail";
import IncidentList from "./pages/residents/IncidentList";
import ReportIncidentPage from "./pages/residents/ReportIncidentPage";
import { ResidentFormPage } from "./pages/residents/residentFormPage";
import { ResidentListPage } from "./pages/residents/residentListPage";
import { ResidentProfileDetailPage } from "./pages/residents/residentProfileDetailPage";
import { ResidentReceptionPage } from "./pages/residents/residentReceptionPage";
import RoleMatrix from "./pages/roles/RoleMatrix";
import { DoctorsSchedulePage } from "./pages/schedule/doctorsSchedulePage";
import SlaConfiguration from "./pages/slaConfig/SlaConfiguration";
import StaffingRatioPage from "./pages/staffingRatios/StaffingRatioPage";
import BedsideVitalsPage from "./pages/tasks/BedsideVitalsPage";
import DailyTaskListPage from "./pages/tasks/DailyTaskListPage";
import UserForm from "./pages/users/UserForm";
import UserList from "./pages/users/UserList";

function AdminPage({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["Administrator", "System Admin"]}>
            <AdminLayout>{children}</AdminLayout>
        </ProtectedRoute>
    );
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/activate" element={<Activation />} />
            <Route path="/verify-otp" element={<TwoStepVerification />} />

            <Route
                path="/admin/users"
                element={
                    <AdminPage>
                        <UserList />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/users/create"
                element={
                    <AdminPage>
                        <UserForm />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/users/:id/edit"
                element={
                    <AdminPage>
                        <UserForm />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/roles"
                element={
                    <AdminPage>
                        <RoleMatrix />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/data"
                element={
                    <AdminPage>
                        <DemoSeeder />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/facility"
                element={
                    <AdminPage>
                        <FacilitySettingsPage />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/loc-rates"
                element={
                    <AdminPage>
                        <LocRateTablePage />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/staffing"
                element={
                    <AdminPage>
                        <StaffingRatioPage />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/incident-severity"
                element={
                    <AdminPage>
                        <IncidentSeverityLevels />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/sla-config"
                element={
                    <AdminPage>
                        <SlaConfiguration />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/equipment"
                element={
                    <AdminPage>
                        <EquipmentInventory />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/equipment/add"
                element={
                    <AdminPage>
                        <EquipmentForm />
                    </AdminPage>
                }
            />
            <Route
                path="/admin/equipment/:id/edit"
                element={
                    <AdminPage>
                        <EquipmentForm />
                    </AdminPage>
                }
            />

            <Route path="/dashboard/admin" element={<Navigate to="/admin/users" replace />} />

            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/residents" element={<ResidentListPage />} />
                <Route
                    path="/residents/create"
                    element={
                        <ProtectedRoute allowedRoles={["Admission", "Admin"]}>
                            <ResidentFormPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/residents/reception" element={<ResidentReceptionPage />} />
                <Route path="/residents/:id" element={<ResidentProfileDetailPage />} />
                <Route
                    path="/residents/:id/edit"
                    element={
                        <ProtectedRoute allowedRoles={["Admission", "Admin"]}>
                            <ResidentFormPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/residents/:residentId/loc-classification" element={<LocClassificationPage />} />
                <Route path="/residents/:residentId/loc-history" element={<LocHistoryPage />} />

                <Route path="/admissions/pre-screening" element={<ResidentReceptionPage />} />
                <Route
                    path="/admissions/new"
                    element={
                        <ProtectedRoute allowedRoles={["Admission", "Admin"]}>
                            <AdmissionFormPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/assessments/new" element={<InitialAssessmentPage />} />
                <Route path="/assessments/history" element={<AssessmentHistoryPage />} />
                <Route path="/reassessments/new" element={<ReassessmentPage />} />

                <Route path="/care-plans" element={<CarePlanListPage />} />
                <Route path="/care-plans/new" element={<CreateCarePlanPage />} />
                <Route path="/care-plans/:id/edit" element={<CreateCarePlanPage />} />
                <Route path="/care-plans/:id" element={<CarePlanPage />} />
                <Route
                    path="/care-plans/:id/review"
                    element={
                        <ProtectedRoute allowedRoles={["DON", "Admin"]}>
                            <DonReviewPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/care-plans/:id/acknowledge" element={<IdtAcknowledgmentPage />} />

                <Route path="/care-tasks/today" element={<DailyTaskListPage />} />
                <Route path="/care-tasks/:taskId/vitals" element={<BedsideVitalsPage />} />
                <Route path="/billing/cost-panel" element={<CostBillingPanelPage />} />

                <Route path="/incidents/report" element={<ReportIncidentPage />} />
                <Route path="/incidents" element={<IncidentList />} />
                <Route path="/incidents/:id" element={<IncidentDetail />} />
                <Route path="/incidents/:id/lock-confirm" element={<ChartLockConfirmation />} />
                <Route
                    path="/incidents/:id/external-report"
                    element={
                        <ProtectedRoute allowedRoles={["DON", "Admin"]}>
                            <ExternalReportPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/incidents/:id/unlock"
                    element={
                        <ProtectedRoute allowedRoles={["DON", "Admin"]}>
                            <ChartUnlockPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/doctor-schedule" element={<DoctorsSchedulePage />} />
                <Route path="/emar" element={<EmarPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
