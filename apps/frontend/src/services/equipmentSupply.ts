import type { InventoryStatus, ItemType } from "../constants/inventory";
import { apiClient } from "./apiClient";

export interface EquipmentSupplyDTO {
    id: string;
    code: string;
    name: string;
    category: string;
    unit: string;
    quantityOnHand: number;
    reorderThreshold: number;
    status: InventoryStatus;
    itemType: ItemType;
    lastUpdatedAt?: string | null;
}

// POST body — equipment needs an asset tag (code); supplies need stock fields.
export interface EquipmentSupplyCreateInput {
    itemType: ItemType;
    name: string;
    category: string;
    status: InventoryStatus;
    code?: string;
    unit?: string;
    quantityOnHand?: number;
    reorderThreshold?: number;
    unitValue?: number;
}

// PUT body — code and itemType are immutable after creation.
export interface EquipmentSupplyUpdateInput {
    name: string;
    category: string;
    status: InventoryStatus;
    quantityOnHand?: number;
    reorderThreshold?: number;
}

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

    async updateStatus(id: string, status: InventoryStatus): Promise<EquipmentSupplyDTO> {
        const { data } = await apiClient.patch(`/equipment-supplies/${id}/status`, { status });
        return data;
    },
};
