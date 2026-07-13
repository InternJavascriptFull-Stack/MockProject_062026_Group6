import { residentMockData } from "../mockData";
import type { Resident, ResidentEvaluationPayload, ResidentFormPayload, ResidentListQuery, ResidentListResult, StatusUpdatePayload } from "../types";

const NETWORK_DELAY_IN_MS = 250;
const RESIDENTS_URL = "/api/residents";
const PRE_SCREENING_URL = "/api/admissions/pre-screening";
const residentStore = [...residentMockData];

const wait = async () =>
    new Promise((resolve) => {
        window.setTimeout(resolve, NETWORK_DELAY_IN_MS);
    });

export type ResidentRepository = {
    listResidents: (query: ResidentListQuery) => Promise<ResidentListResult>;
    getResident: (id: string) => Promise<Resident>;
    createResident: (payload: ResidentFormPayload) => Promise<Resident>;
    updateResident: (id: string, payload: ResidentFormPayload) => Promise<Resident>;
    updateStatus: (id: string, payload: StatusUpdatePayload) => Promise<Resident>;
    createPreScreening: (payload: ResidentEvaluationPayload) => Promise<Resident>;
};

const requestJson = async <Response>(url: string, options?: RequestInit): Promise<Response> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
    }

    return response.json() as Promise<Response>;
};

const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDelta = today.getMonth() - birthDate.getMonth();

    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }

    return age;
};

export const residentRepository: ResidentRepository = {
    async listResidents(query) {
        const params = new URLSearchParams({
            page: String(query.page),
            limit: String(query.pageSize),
        });

        if (query.search.trim()) {
            params.set("search", query.search.trim());
        }

        if (query.status !== "all") {
            params.set("status", query.status);
        }

        if (query.careLevel !== "all") {
            params.set("careLevel", query.careLevel);
        }

        try {
            const response = await requestJson<{
                data?: Resident[];
                items?: Resident[];
                meta?: { total: number };
                total?: number;
            }>(`${RESIDENTS_URL}?${params.toString()}`);

            return {
                items: response.data ?? response.items ?? [],
                total: response.meta?.total ?? response.total ?? 0,
            };
        } catch {
            await wait();
        }

        const normalizedSearch = query.search.trim().toLowerCase();
        const filteredResidents = residentStore.filter((resident) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                resident.fullName.toLowerCase().includes(normalizedSearch) ||
                resident.residentCode.toLowerCase().includes(normalizedSearch) ||
                resident.roomNumber?.toLowerCase().includes(normalizedSearch);

            const matchesStatus = query.status === "all" || resident.status === query.status;

            const matchesCareLevel = query.careLevel === "all" || resident.careLevel === query.careLevel;

            return matchesSearch && matchesStatus && matchesCareLevel;
        });

        const startIndex = (query.page - 1) * query.pageSize;

        return {
            items: filteredResidents.slice(startIndex, startIndex + query.pageSize),
            total: filteredResidents.length,
        };
    },

    async getResident(id) {
        try {
            return await requestJson<Resident>(`${RESIDENTS_URL}/${id}`);
        } catch {
            await wait();

            const resident = residentStore.find((item) => item.id === id);

            if (!resident) {
                throw new Error("Resident not found");
            }

            return resident;
        }
    },

    async createResident(payload) {
        try {
            return await requestJson<Resident>(RESIDENTS_URL, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        } catch {
            await wait();

            const resident: Resident = {
                id: crypto.randomUUID(),
                residentCode: `NH-${new Date().getFullYear()}-DRAFT`,
                ...payload,
                roomNumber: payload.roomNumber || undefined,
                status: "pending",
                mobilityStatus: payload.mobilityStatus || undefined,
            };

            residentStore.unshift(resident);
            return resident;
        }
    },

    async updateResident(id, payload) {
        try {
            return await requestJson<Resident>(`${RESIDENTS_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
        } catch {
            await wait();

            const currentResident = residentStore.find((item) => item.id === id);

            if (!currentResident) {
                throw new Error("Resident not found");
            }

            const updatedResident: Resident = {
                ...currentResident,
                ...payload,
                mobilityStatus: payload.mobilityStatus || undefined,
            };

            const index = residentStore.findIndex((item) => item.id === id);
            residentStore[index] = updatedResident;

            return updatedResident;
        }
    },

    async updateStatus(id, payload) {
        try {
            return await requestJson<Resident>(`${RESIDENTS_URL}/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        } catch {
            await wait();

            const currentResident = residentStore.find((item) => item.id === id);

            if (!currentResident) {
                throw new Error("Resident not found");
            }

            const updatedResident: Resident = {
                ...currentResident,
                status: payload.status,
            };

            const index = residentStore.findIndex((item) => item.id === id);
            residentStore[index] = updatedResident;

            return updatedResident;
        }
    },

    async createPreScreening(payload) {
        try {
            return await requestJson<Resident>(PRE_SCREENING_URL, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        } catch {
            await wait();
        }

        const resident: Resident = {
            id: crypto.randomUUID(),
            residentCode: `NH-${new Date().getFullYear()}-DRAFT`,
            fullName: payload.personalInfo.fullName,
            dateOfBirth: payload.personalInfo.dateOfBirth,
            gender: payload.personalInfo.gender || "other",
            roomNumber: payload.admissionInfo.roomNumber || undefined,
            admissionDate: payload.admissionInfo.admissionDate,
            careLevel: payload.admissionInfo.careLevel || "assisted_living",
            status: "under_evaluation",
            assignedNurse: payload.admissionInfo.assignedNurse || undefined,
            assignedDoctor: payload.admissionInfo.assignedDoctor || undefined,
            primaryDiagnosis: payload.medicalSummary.primaryDiagnosis || undefined,
            allergies: payload.medicalSummary.allergies || undefined,
            currentMedications: payload.medicalSummary.currentMedications || undefined,
            mobilityStatus: payload.medicalSummary.mobilityStatus || undefined,
            cognitiveStatus: payload.initialEvaluation.cognitiveStatus || undefined,
            fallRisk: payload.initialEvaluation.fallRisk || undefined,
            painLevel: payload.initialEvaluation.painLevel,
            nutritionNotes: payload.initialEvaluation.nutritionNotes || undefined,
            clinicalNotes: payload.initialEvaluation.clinicalNotes || undefined,
            emergencyContactName: payload.emergencyContact.name,
            emergencyContactRelationship: payload.emergencyContact.relationship || undefined,
            emergencyContactPhone: payload.emergencyContact.phone,
            emergencyContactEmail: payload.emergencyContact.email || undefined,
        };

        residentStore.unshift(resident);
        return resident;
    },
};

export { calculateAge };
