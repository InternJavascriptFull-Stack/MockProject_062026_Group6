import { residentMockData } from "../mockData";
import type {
  Resident,
  ResidentEvaluationPayload,
  ResidentListQuery,
  ResidentListResult,
} from "../types";

const NETWORK_DELAY_IN_MS = 250;

const wait = async () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, NETWORK_DELAY_IN_MS);
  });

export type ResidentRepository = {
  listResidents: (query: ResidentListQuery) => Promise<ResidentListResult>;
  createReceptionEvaluation: (
    payload: ResidentEvaluationPayload,
  ) => Promise<Resident>;
};

const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

export const residentRepository: ResidentRepository = {
  async listResidents(query) {
    await wait();

    const normalizedSearch = query.search.trim().toLowerCase();
    const filteredResidents = residentMockData.filter((resident) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        resident.fullName.toLowerCase().includes(normalizedSearch) ||
        resident.residentCode.toLowerCase().includes(normalizedSearch) ||
        resident.roomNumber?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        query.status === "all" || resident.status === query.status;

      const matchesCareLevel =
        query.careLevel === "all" || resident.careLevel === query.careLevel;

      return matchesSearch && matchesStatus && matchesCareLevel;
    });

    const startIndex = (query.page - 1) * query.pageSize;

    return {
      items: filteredResidents.slice(startIndex, startIndex + query.pageSize),
      total: filteredResidents.length,
    };
  },

  async createReceptionEvaluation(payload) {
    await wait();

    return {
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
      emergencyContactName: payload.emergencyContact.name,
      emergencyContactPhone: payload.emergencyContact.phone,
    };
  },
};

export { calculateAge };
