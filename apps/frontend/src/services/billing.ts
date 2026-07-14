import { apiClient } from "./apiClient";

export const billingService = {
    async getResidentCost(residentId: string) {
        const { data } = await apiClient.get(`/residents/${residentId}/billing-cost`);
        return data;
    },

    async updateRate(residentId: string, careLevelId: string, payload: { dailyRate: number; effectiveFrom: string; facilityId?: string }) {
        const { data } = await apiClient.put(`/residents/${residentId}/billing-cost/rates/${careLevelId}`, payload);
        return data;
    },
};
