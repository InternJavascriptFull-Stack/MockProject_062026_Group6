import { apiClient } from "./apiClient";

export type CareTask = {
    id: string;
    taskType: string;
    status: string;
    abnormal: boolean;
    scheduledTime: string;
    completedAt?: string | null;
    resident: { id: string; fullName: string; roomNumber?: string | null };
    assignedCna?: { id: string; name: string } | null;
    intervention?: { id: string; description: string; assignedRole: string } | null;
};

export const careTasksService = {
    async getToday(params?: { status?: string }): Promise<CareTask[]> {
        const { data } = await apiClient.get("/care-tasks/today", { params });
        return data;
    },

    async getById(id: string): Promise<CareTask> {
        const { data } = await apiClient.get(`/care-tasks/${id}`);
        return data;
    },

    async complete(id: string, payload: { notes?: string; abnormal?: boolean }) {
        const { data } = await apiClient.patch(`/care-tasks/${id}/complete`, payload);
        return data;
    },
};
