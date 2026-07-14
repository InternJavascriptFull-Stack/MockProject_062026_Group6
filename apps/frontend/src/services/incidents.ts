import { apiClient } from "./apiClient";

export const incidentsService = {
    async getIncidents() {
        const { data } = await apiClient.get("/incidents");
        return data;
    },

    async getIncidentById(id: string) {
        const { data } = await apiClient.get(`/incidents/${id}`);
        return data;
    },

    async create(payload: Record<string, unknown>) {
        const { data } = await apiClient.post("/incidents", payload);
        return data;
    },

    async updateInvestigation(id: string, payload: Record<string, unknown>) {
        const { data } = await apiClient.patch(`/incidents/${id}/investigation`, payload);
        return data;
    },

    async addProgressNote(id: string, note: string) {
        const { data } = await apiClient.post(`/incidents/${id}/progress-notes`, { note });
        return data;
    },

    async requestDonReview(id: string) {
        const { data } = await apiClient.post(`/incidents/${id}/request-don-review`);
        return data;
    },

    async submitExternalReport(id: string, payload: Record<string, unknown>) {
        const { data } = await apiClient.post(`/incidents/${id}/submit-external-report`, payload);
        return data;
    },

    async resolve(id: string, payload: { resolution: string; followUpPlan?: string }) {
        const { data } = await apiClient.post(`/incidents/${id}/resolve`, payload);
        return data;
    },

    async lockChart(id: string, reason: string) {
        const { data } = await apiClient.post(`/incidents/${id}/lock-chart`, { reason });
        return data;
    },

    async unlockChart(id: string, reason: string, passwordConfirm: string) {
        const { data } = await apiClient.post(`/incidents/${id}/unlock-chart`, { reason, passwordConfirm });
        return data;
    },
};
