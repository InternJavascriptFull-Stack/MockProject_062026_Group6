import { apiClient } from "./apiClient";

async function getDashboard(path: string) {
    const { data } = await apiClient.get(`/dashboard/${path}`);
    return data;
}

export const dashboardService = {
    getNurseDashboard: () => getDashboard("nurse"),
    getDonDashboard: () => getDashboard("don"),
    getCnaDashboard: () => getDashboard("cna"),
    getSummaryDashboard: () => getDashboard("summary"),
};
