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

export interface StaffingRatio {
    id: string;
    facilityId: string;
    targetState: string;
    targetStateName: string;
    minHrsPerResidentDay: number;
    warnBelowPercentage: number;
    regulationReference: string;
    shifts: Array<{
        shiftName: string;
        startTime: string;
        endTime: string;
        requiredCnaHours: number;
        requiredNurseHours: number;
        subtotal: number;
    }>;
    shiftTotal: number;
    census: number;
    scheduledDirectCareHours: number;
    scheduledPerResident: number;
    isCompliant: boolean;
    usedBy: string;
}

export type StaffingShiftPayload = Pick<
    StaffingRatio["shifts"][number],
    "shiftName" | "startTime" | "endTime" | "requiredCnaHours" | "requiredNurseHours"
>;

export const staffingRatiosService = {
    async getStaffingRatios(): Promise<StaffingRatio> {
        const response = await fetch(API_ROUTES.STAFFING_RATIOS, {
            headers: getHeaders(),
        });

        return parseResponse(response);
    },

    async createStaffingRatio(
        payload: Pick<StaffingRatio, "minHrsPerResidentDay"> & {
            warnBelowPercentage?: number;
            shifts?: StaffingShiftPayload[];
        },
    ) {
        const response = await fetch(API_ROUTES.STAFFING_RATIOS, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        return parseResponse(response);
    },

    async updateStaffingRatio(
        id: string,
        payload: Pick<StaffingRatio, "minHrsPerResidentDay"> & {
            warnBelowPercentage?: number;
            shifts?: StaffingShiftPayload[];
        },
    ): Promise<StaffingRatio> {
        const response = await fetch(`${API_ROUTES.STAFFING_RATIOS}/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        return parseResponse(response);
    },
};
