import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboard";
import type { CnaDashboardData, DonDashboardData, NurseDashboardData } from "../../types/dashboard";

type DashboardRole = "nurse" | "don" | "cna";

export function useDashboardQuery(role: "nurse"): UseQueryResult<{ success: boolean; data: NurseDashboardData }, Error>;
export function useDashboardQuery(role: "don"): UseQueryResult<{ success: boolean; data: DonDashboardData }, Error>;
export function useDashboardQuery(role: "cna"): UseQueryResult<{ success: boolean; data: CnaDashboardData }, Error>;
export function useDashboardQuery(role: DashboardRole) {
    return useQuery({
        queryKey: ["dashboard", role],
        queryFn: async () => {
            switch (role) {
                case "nurse":
                    return await dashboardService.getNurseDashboard();
                case "don":
                    return await dashboardService.getDonDashboard();
                case "cna":
                    return await dashboardService.getCnaDashboard();
                default:
                    throw new Error("Invalid dashboard role");
            }
        },
        retry: 1,
        refetchOnWindowFocus: false,
    });
}
