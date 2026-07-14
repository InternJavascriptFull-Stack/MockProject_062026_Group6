import { apiClient } from "./apiClient";

export type AdmissionPayload = {
    residentId: string;
    facilityId: string;
    bedId?: string;
    admissionDate: string;
    payerSource: string;
    policyNumber?: string;
    primaryPhysician?: string;
    nurseInCharge?: string;
    consents: string[];
};

export const admissionsService = {
    async create(payload: AdmissionPayload) {
        const { data } = await apiClient.post("/admissions", payload);
        return data;
    },

    async getResidentAdmissions(residentId: string) {
        const { data } = await apiClient.get(`/admissions/resident/${residentId}`);
        return data;
    },
};
