import { apiClient } from "./apiClient";

export interface IncidentSeverityDTO {
    id: number;
    levelName: string;
    description: string | null;
    chartLockTrigger: boolean;
}

export type IncidentSeverityUpdateInput = Partial<Omit<IncidentSeverityDTO, "id">>;

export const incidentSeverityService = {
    async getAll(): Promise<IncidentSeverityDTO[]> {
        const { data } = await apiClient.get("/incident-severities");
        return data.data ?? [];
    },

    async update(id: number, input: IncidentSeverityUpdateInput): Promise<IncidentSeverityDTO> {
        const { data } = await apiClient.put(`/incident-severities/${id}`, input);
        return data.data;
    },
};
