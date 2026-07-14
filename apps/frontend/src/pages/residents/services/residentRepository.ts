import { apiClient } from "../../../services/apiClient";
import type { Resident, ResidentEvaluationPayload, ResidentFormPayload, ResidentListQuery, ResidentListResult, StatusUpdatePayload } from "../types";

export type ResidentRepository = {
    listResidents: (query: ResidentListQuery) => Promise<ResidentListResult>;
    getResident: (id: string) => Promise<Resident>;
    createResident: (payload: ResidentFormPayload) => Promise<Resident>;
    updateResident: (id: string, payload: ResidentFormPayload) => Promise<Resident>;
    updateStatus: (id: string, payload: StatusUpdatePayload) => Promise<Resident>;
    createPreScreening: (payload: ResidentEvaluationPayload) => Promise<Resident>;
};

export const residentRepository: ResidentRepository = {
    async listResidents(query) {
        const { data } = await apiClient.get("/residents", {
            params: {
                page: query.page,
                limit: query.pageSize,
                search: query.search.trim() || undefined,
                status: query.status === "all" ? undefined : query.status,
                careLevel: query.careLevel === "all" ? undefined : query.careLevel,
            },
        });
        return {
            items: data.data ?? data.items ?? [],
            total: data.meta?.total ?? data.total ?? 0,
        };
    },

    async getResident(id) {
        const { data } = await apiClient.get(`/residents/${id}`);
        return data;
    },

    async createResident(payload) {
        const { data } = await apiClient.post("/residents", payload);
        return data;
    },

    async updateResident(id, payload) {
        const { data } = await apiClient.put(`/residents/${id}`, payload);
        return data;
    },

    async updateStatus(id, payload) {
        const { data } = await apiClient.patch(`/residents/${id}/status`, payload);
        return data;
    },

    async createPreScreening(payload) {
        const { data } = await apiClient.post("/admissions/pre-screening", payload);
        return data as Resident;
    },
};

export function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDelta = today.getMonth() - birthDate.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }
    return age;
}
