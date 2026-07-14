import type { EquipmentStatus } from "../constants/inventory";
import { apiClient } from "./apiClient";

export interface EquipmentSupplyDTO {
    id: string;
    code: string;
    name: string;
    category: string;
    unit: string;
    quantityOnHand: number;
    reorderThreshold: number;
    status: EquipmentStatus;
    itemType?: "EQUIPMENT" | "SUPPLY";
    lastUpdatedAt?: string | null;
}

export type EquipmentSupplyCreateInput = Omit<EquipmentSupplyDTO, "id" | "lastUpdatedAt">;
export type EquipmentSupplyUpdateInput = Omit<EquipmentSupplyCreateInput, "code" | "itemType">;

export interface EquipmentSupplyListParams {
    search?: string;
    category?: string;
    status?: string;
}

export const equipmentSupplyService = {
    async getAll(params: EquipmentSupplyListParams = {}): Promise<EquipmentSupplyDTO[]> {
        const { data } = await apiClient.get("/equipment-supplies", { params });
        return data;
    },

    async getById(id: string): Promise<EquipmentSupplyDTO> {
        const { data } = await apiClient.get(`/equipment-supplies/${id}`);
        return data;
    },

    async create(input: EquipmentSupplyCreateInput): Promise<EquipmentSupplyDTO> {
        const { data } = await apiClient.post("/equipment-supplies", input);
        return data;
    },

    async update(id: string, input: EquipmentSupplyUpdateInput): Promise<EquipmentSupplyDTO> {
        const { data } = await apiClient.put(`/equipment-supplies/${id}`, input);
        return data;
    },

    async updateStatus(id: string, status: EquipmentStatus): Promise<EquipmentSupplyDTO> {
        const { data } = await apiClient.patch(`/equipment-supplies/${id}/status`, { status });
        return data;
    },
};
