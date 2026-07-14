import { apiClient } from "./apiClient";

export type FacilityCapability = {
    code: string;
    label: string;
    supported: boolean;
    note?: string;
};

export type FacilitySettings = {
    id: string;
    facilityCode: string;
    name: string;
    licenseNumber: string;
    targetState: string;
    phoneNumber?: string | null;
    timezone: string;
    address: {
        id?: string;
        streetLine1: string;
        streetLine2?: string | null;
        city: string;
        state: string;
        zipCode: string;
    } | null;
    rooms: Array<{
        id: string;
        wing: string;
        roomNumber: string;
        roomType: string;
        beds: Array<{
            id: string;
            bedNumber: string;
            status: string;
            occupant?: string | null;
        }>;
    }>;
    capabilities: FacilityCapability[];
    updatedAt: string;
};

export const facilityService = {
    async getFacilities() {
        const { data } = await apiClient.get("/facilities");
        return data;
    },

    async getCurrentSettings(): Promise<FacilitySettings> {
        const { data } = await apiClient.get("/facilities/settings/current");
        return data;
    },

    async updateSettings(id: string, payload: Omit<FacilitySettings, "id" | "facilityCode" | "rooms" | "updatedAt">) {
        const { data } = await apiClient.put(`/facilities/${id}/settings`, payload);
        return data as FacilitySettings;
    },

    async addRoom(id: string, payload: { roomNumber: string; roomType: string; bedCount: number }) {
        const { data } = await apiClient.post(`/facilities/${id}/rooms`, payload);
        return data;
    },
};
