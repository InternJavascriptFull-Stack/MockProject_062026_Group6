import { apiClient } from "./apiClient";
import { API_ROUTES } from "../constants/apiRoutes";
import type { CnaDashboardData, DonDashboardData, NurseDashboardData } from "../types/dashboard";

async function getDashboard<T>(path: string): Promise<{ success: boolean; data: T }> {
    const { data } = await apiClient.get(path);
    return data;
}

export const dashboardService = {
    getNurseDashboard: () => getDashboard<NurseDashboardData>(API_ROUTES.DASHBOARD_NURSE),
    getDonDashboard: () => getDashboard<DonDashboardData>(API_ROUTES.DASHBOARD_DON),
    getCnaDashboard: () => getDashboard<CnaDashboardData>(API_ROUTES.DASHBOARD_CNA),
    getSummaryDashboard: () => getDashboard<any>(API_ROUTES.DASHBOARD_SUMMARY),
};
