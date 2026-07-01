import { Navigate, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "./constants/appRoutes";
import { AppLayout } from "./layouts/appLayout";
import AuthLayout from "./layouts/authLayout";
import { DashboardPage } from "./pages/dashboardPage";
import { LandingPage } from "./pages/landingPage";
import { CarePlanPage } from "./pages/carePlan/carePlanPage";
import { EmarPage } from "./pages/emar/emarPage";
import EnterNewPass from "./pages/login/enterNewPass";
import ForgotPass from "./pages/login/forgotPass";
import Login from "./pages/login/login";
import Register from "./pages/login/register";
import { ModulePlaceholderPage } from "./pages/modulePlaceholderPage";
import { ResidentListPage } from "./pages/residents/residentListPage";
import { ResidentReceptionPage } from "./pages/residents/residentReceptionPage";
import { DoctorsSchedulePage } from "./pages/schedule/doctorsSchedulePage";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";

export function App() {
    return (
        <Routes>
            <Route index element={<LandingPage />} />

            <Route element={<AppLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="residents" element={<ResidentListPage />} />
                <Route path="residents/reception" element={<ResidentReceptionPage />} />
                <Route path="intake-assessment" element={<ResidentReceptionPage />} />
                <Route path="doctor-schedule" element={<DoctorsSchedulePage />} />
                <Route path="staff-schedule" element={<DoctorsSchedulePage />} />
                <Route path="emar" element={<EmarPage />} />
                <Route path="medication" element={<EmarPage />} />
                <Route path="care-plan" element={<CarePlanPage />} />
                <Route
                    path="meal-diet"
                    element={
                        <ModulePlaceholderPage title="Meal & Diet" description="Plan resident meals, dietary restrictions, nutrition notes, and daily serving coordination." />
                    }
                />
                <Route
                    path="billing"
                    element={<ModulePlaceholderPage title="Billing" description="Track invoices, payment status, resident billing cycles, and finance handoff tasks." />}
                />
                <Route
                    path="incident-report"
                    element={<ModulePlaceholderPage title="Incident Report" description="Document incidents, follow-up actions, severity, and compliance review status." />}
                />
                <Route
                    path="family-portal"
                    element={
                        <ModulePlaceholderPage title="Family Portal" description="Provide family members with resident updates, contact points, visits, and shared care notices." />
                    }
                />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="login/register" element={<Register />} />
            <Route path="login/forgot-password" element={<ForgotPass />} />
            <Route path="login/enter-new-password" element={<EnterNewPass />} />

            <Route element={<AuthLayout />}>
                <Route path="sign-in" element={<SignIn />} />
                <Route path="sign-up" element={<SignUp />} />
            </Route>

            <Route path="*" element={<Navigate to={APP_ROUTES.LANDING} replace />} />
        </Routes>
    );
}
