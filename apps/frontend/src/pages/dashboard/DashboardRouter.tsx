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

    if (roleName.includes("NURSE")) {
        return <NurseDashboard />;
    }
    
    // We assume any CNA-related role string is caught by the constant, 
    // or if the DB strictly uses "CNA"
    if (roleName.includes("CNA")) {
        return <CnaDashboard />;
    }
    
    // Default to DON / Admin
    return <DonDashboard />;
}
