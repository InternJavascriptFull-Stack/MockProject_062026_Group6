import { apiClient } from "./apiClient";

export type AssessmentMetricInput = {
    category: string;
    metricName: string;
    score: number;
    notes?: string;
};

export type Assessment = {
    id: string;
    residentId: string;
    assessedBy: string;
    adlTotalScore: number;
    isOverridden: boolean;
    createdAt: string;
    isConfirmed?: boolean;
    suggestedCareLevel: { id: string; code: string; name: string };
    confirmedCareLevel: { id: string; code: string; name: string } | null;
    activeCareLevel?: { id: string; code: string; name: string } | null;
    details?: Array<{ id?: string; category: string; metricName: string; score: number; notes?: string | null }>;
    metrics?: Array<{ id?: string; category: string; metricName: string; score: number; notes?: string | null }>;
    assessor?: { id: string; name: string } | null;
};

export type LocHistoryItem = {
    id: string;
    residentId: string;
    careLevel: { id: string; code: string; name: string };
    dailyRate: number | null;
    startDate: string;
    endDate: string | null;
    active: boolean;
    isOverride: boolean;
    overrideReason: string | null;
    authorizedAt: string | null;
    authorizedBy: string | null;
};

export const assessmentsService = {
    async create(payload: { residentId: string; metrics: AssessmentMetricInput[]; clinicalNotes?: string }): Promise<Assessment> {
        const { data } = await apiClient.post("/assessments", payload);
        return data;
    },

    async getHistory(residentId: string): Promise<Assessment[]> {
        const { data } = await apiClient.get(`/assessments/resident/${residentId}`);
        return data;
    },

    async getLatestClassification(residentId: string): Promise<Assessment> {
        const { data } = await apiClient.get(`/assessments/resident/${residentId}/latest-classification`);
        return data;
    },

    async confirmLoc(assessmentId: string, payload: { careLevelId: string; isOverride?: boolean; overrideReason?: string }) {
        const { data } = await apiClient.post(`/assessments/${assessmentId}/confirm-loc`, payload);
        return data;
    },

    async getLocHistory(residentId: string): Promise<LocHistoryItem[]> {
        const { data } = await apiClient.get(`/residents/${residentId}/loc-history`);
        return data;
    },

    async createReassessment(payload: {
        residentId: string;
        carePlanId: string;
        reason: string;
        metrics: AssessmentMetricInput[];
        clinicalNotes?: string;
        goals?: Array<{ description: string; status?: string }>;
        interventions?: Array<{ description: string; assignedRole: string }>;
    }) {
        const { data } = await apiClient.post("/reassessments", payload);
        return data;
    },
};
