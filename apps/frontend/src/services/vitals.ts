import { apiClient } from "./apiClient";

export type VitalInput = {
    residentId: string;
    taskId?: string;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRateBpm?: number;
    respiratoryRate?: number;
    temperatureFahrenheit?: number;
    spo2Percentage?: number;
    painScale?: number;
    notes?: string;
    acknowledgeAbnormal?: boolean;
};

export const vitalsService = {
    async create(payload: VitalInput) {
        const { data } = await apiClient.post("/vitals", payload);
        return data;
    },

    async getResidentHistory(residentId: string) {
        const { data } = await apiClient.get(`/vitals/resident/${residentId}`);
        return data;
    },
};
