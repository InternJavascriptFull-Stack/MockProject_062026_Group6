import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../utils/session";
import { USER_ROLE } from "../../constants/userRole";
import { NurseDashboard } from "./NurseDashboard";
import { DonDashboard } from "./DonDashboard";
import { CnaDashboard } from "./CnaDashboard";

export default function DashboardRouter() {
    const user = useAuthStore((state) => state.user);

    if (!user) return <Navigate to="/login" replace />;

    const roleName = user.roleName?.toUpperCase() || "";

    if (roleName.includes("SYSTEM ADMIN") || roleName.includes("ADMINISTRATOR")) {
        return <Navigate to="/admin/users" replace />;
    }

    if (roleName.includes("DON") || roleName.includes("DIRECTOR")) {
        return <DonDashboard />;
    }

    if (roleName.includes("CNA")) {
        return <CnaDashboard />;
    }

    // Default for Nurses, Admission Staff, Physicians, etc.
    return <NurseDashboard />;
}
