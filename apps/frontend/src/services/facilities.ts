import { API_ROUTES } from "@/constants/apiRoutes";
import { session } from "@/utils/session";

const getHeaders = () => {
    const token = session.getAccessToken();

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

async function parseResponse(response: Response) {
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
    }

    return response.json();
}

export interface FacilityRoom {
    roomId: string;
    bedId: string;
    wing: string;
    roomNumber: string;
    bedNumber: string;
    roomType: string;
    status: "Available" | "Occupied" | "Out of Service";
    occupantNote: string | null;
}

export type FacilityBedStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export interface FacilityRoomForm {
    roomId?: string;
    bedId?: string;
    roomNumber: string;
    bedNumber: string;
    roomType: string;
    status: FacilityBedStatus;
}

export interface FacilitySettings {
    id: string;
    facilityCode: string;
    name: string;
    licenseNumber: string;
    targetState: string;
    targetStateName: string;
    timezone: string;
    phoneNumber: string | null;
    roomSummary: string;
    rooms: FacilityRoom[];
    roomRates: FacilityRoomRate[];
    capabilities: FacilityClinicalCapability[];
}

export interface FacilityRoomRate {
        id?: string;
        roomType: string;
        dailyRate: number;
        effectiveFrom: string;
}

export interface FacilityClinicalCapability {
        id?: string;
        capability: string;
        supported: boolean;
        note?: string;
}

export interface UpdateFacilitySettingsPayload {
    name?: string;
    licenseNumber?: string;
    targetState?: string;
    timezone?: string;
    phoneNumber?: string | null;
    rooms?: FacilityRoomForm[];
    roomRates?: FacilityRoomRate[];
    capabilities?: FacilityClinicalCapability[];
}

export const facilitiesService = {
    async getFacilitySettings(): Promise<FacilitySettings> {
        const response = await fetch(API_ROUTES.FACILITY_SETTINGS, {
            headers: getHeaders(),
        });

        return parseResponse(response);
    },

    async updateFacilitySettings(
        payload: UpdateFacilitySettingsPayload,
    ): Promise<FacilitySettings> {
        const response = await fetch(API_ROUTES.FACILITY_SETTINGS, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        return parseResponse(response);
    },
};
