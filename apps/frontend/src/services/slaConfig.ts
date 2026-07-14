import { apiClient } from "./apiClient";

export interface SlaConfigDTO {
    id: number;
    severity: {
        id: number;
        levelName: string;
    };
    slaWindowHrs: number;
    externalReportRequired: boolean;
    regulatoryBody: string | null;
}

export interface SlaConfigUpdateInput {
    slaWindowHrs: number;
    externalReportRequired?: boolean;
    regulatoryBody?: string | null;
}

export const slaConfigService = {
    async getAll(): Promise<SlaConfigDTO[]> {
        const { data } = await apiClient.get("/sla-configurations");
        return data.data ?? [];
    },

    async update(id: number, input: SlaConfigUpdateInput): Promise<SlaConfigDTO> {
        const { data } = await apiClient.put(`/sla-configurations/${id}`, input);
        return data.data;
    },
};
