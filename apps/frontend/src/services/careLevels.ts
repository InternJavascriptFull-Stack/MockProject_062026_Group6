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

export interface CareLevel {
    id: string;
    levelCode: string;
    levelName: string;
    scoreMin: number;
    scoreMax: number;
    dailyRate: number;
    effectiveFrom: string;
    lastUpdatedBy: string;
}

export const careLevelsService = {
    async getAll(): Promise<CareLevel[]> {
        return this.getCareLevels();
    },

    async getCareLevels(): Promise<CareLevel[]> {
        const response = await fetch(API_ROUTES.CARE_LEVELS, {
            headers: getHeaders(),
        });

        return parseResponse(response);
    },

    async updateCareLevel(
        id: string,
        payload: Pick<CareLevel, "dailyRate" | "effectiveFrom">,
    ): Promise<CareLevel[]> {
        const response = await fetch(`${API_ROUTES.CARE_LEVELS}/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        return parseResponse(response);
    },
};
