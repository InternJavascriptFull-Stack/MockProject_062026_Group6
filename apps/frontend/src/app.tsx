import { Navigate, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "./constants/appRoutes";
import { AppLayout } from "./layouts/appLayout";
import AuthLayout from "./layouts/authLayout";
import { DashboardPage } from "./pages/dashboardPage";
import { LandingPage } from "./pages/landingPage";
import { CarePlanListPage } from "./pages/carePlan/carePlanListPage";
import { CreateCarePlanPage } from "./pages/carePlan/createCarePlanPage";
import { CarePlanPage } from "./pages/carePlan/carePlanPage";
import { DonReviewPage } from "./pages/carePlan/donReviewPage";
import { IdtAcknowledgmentPage } from "./pages/carePlan/idtAcknowledgmentPage";
import { EmarPage } from "./pages/emar/emarPage";
import EnterNewPass from "./pages/login/enterNewPass";
import ForgotPass from "./pages/login/forgotPass";
import Login from "./pages/login/login";
import Register from "./pages/login/register";
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
                <Route path="doctor-schedule" element={<DoctorsSchedulePage />} />
                <Route path="emar" element={<EmarPage />} />
                <Route path="care-plans" element={<CarePlanListPage />} />
                <Route path="care-plans/new" element={<CreateCarePlanPage />} />
                <Route path="care-plans/:id" element={<CarePlanPage />} />
                <Route path="care-plans/:id/review" element={<DonReviewPage />} />
                <Route path="care-plans/:id/acknowledge" element={<IdtAcknowledgmentPage />} />
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
