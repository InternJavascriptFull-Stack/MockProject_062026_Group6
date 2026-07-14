import { apiClient } from "./apiClient";

export type ResidentSummary = {
    id: string;
    residentCode: string;
    fullName: string;
    dateOfBirth: string;
    roomNumber?: string;
    status: string;
    isChartLocked?: boolean;
};

export const residentsService = {
    async getAll(search = ""): Promise<ResidentSummary[]> {
        const { data } = await apiClient.get("/residents", { params: { page: 1, limit: 100, search } });
        return data.data ?? data.items ?? [];
    },

    async getById(id: string): Promise<ResidentSummary> {
        const { data } = await apiClient.get(`/residents/${id}`);
        return data;
    },
};
