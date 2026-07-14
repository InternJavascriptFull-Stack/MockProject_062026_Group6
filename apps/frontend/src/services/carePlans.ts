import { apiClient } from "./apiClient";

export type CarePlanResident = {
    id: string;
    firstName: string;
    lastName: string;
    roomNumber?: string | null;
    chartLocked?: boolean;
    locConfirmed?: boolean;
    activeCareLevel?: { id: string; code: string; name: string } | null;
};

export type CarePlanSummary = {
    id: string;
    residentId: string;
    status: string;
    significantChangeFlag: boolean;
    createdAt: string;
    updatedAt: string;
    lastReviewAt?: string | null;
    nextReviewAt?: string | null;
    resident?: CarePlanResident | null;
    activeCareLevel?: { id: string; code: string; name: string } | null;
    creator?: { firstName?: string; lastName?: string } | null;
};

export type CarePlanDetail = CarePlanSummary & {
    goals: Array<{ id: string; description: string; status: string }>;
    interventions: Array<{
        id: string;
        description: string;
        assignedRole: string;
        tasks: Array<{ id: string; task_type: string; status: string; scheduled_time: string }>;
    }>;
    reviews: Array<{ id: string; status: string; notes?: string | null; reviewed_at: string; reviewer?: { firstName?: string; lastName?: string } }>;
    signatures: Array<{ id: string; signed_at: string; signer?: { firstName?: string; lastName?: string } }>;
    idtAcks: Array<{ id: string; acknowledged_at: string; notes?: string | null; user?: { firstName?: string; lastName?: string } }>;
};

export type LocGateResult = {
    success: boolean;
    blocked: boolean;
    message: string;
    resident: { id: string; name: string };
    activeCareLevel: { id: string; code: string; name: string } | null;
};

export const carePlansService = {
    async getAll(): Promise<CarePlanSummary[]> {
        const { data } = await apiClient.get("/care-plans");
        return data.data ?? [];
    },

    async getResidents(): Promise<CarePlanResident[]> {
        const { data } = await apiClient.get("/care-plans/residents/list");
        return data.data ?? [];
    },

    async getById(id: string): Promise<CarePlanDetail> {
        const { data } = await apiClient.get(`/care-plans/${id}`);
        return data.data;
    },

    async checkLocGate(residentId: string): Promise<LocGateResult> {
        const { data } = await apiClient.get(`/care-plans/loc-gate/${residentId}`);
        return data;
    },

    async create(input: {
        residentId: string;
        status?: string;
        goals: Array<{ description: string; status?: string }>;
        interventions: Array<{ description: string; assignedRole: string }>;
    }) {
        const { data } = await apiClient.post("/care-plans", input);
        return data.data;
    },

    async update(id: string, input: { status?: string; significantChangeFlag?: boolean }) {
        const { data } = await apiClient.put(`/care-plans/${id}`, input);
        return data.data;
    },

    async review(id: string, input: { status: "APPROVED" | "REJECTED"; notes?: string }) {
        const { data } = await apiClient.post(`/care-plans/${id}/don-review`, input);
        return data.data;
    },

    async eSign(id: string, password: string) {
        const { data } = await apiClient.post(`/care-plans/${id}/esign`, { password });
        return data.data;
    },

    async acknowledge(id: string, notes?: string) {
        const { data } = await apiClient.post(`/care-plans/${id}/idt-ack`, { notes });
        return data.data;
    },
};
