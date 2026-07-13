export type ResidentStatus = "pending" | "under_evaluation" | "admitted" | "discharged";

export type CareLevel = "independent" | "assisted_living" | "memory_care" | "skilled_nursing";

export type Gender = "male" | "female" | "other";

export type MobilityStatus = "independent" | "walker" | "wheelchair" | "bed_bound";

export type CognitiveStatus = "alert_oriented" | "mild_impairment" | "moderate_impairment" | "severe_impairment";

export type FallRisk = "low" | "medium" | "high";

export type Resident = {
    id: string;
    residentCode: string;
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    phone?: string;
    address?: string;
    roomNumber?: string;
    admissionDate: string;
    careLevel: CareLevel;
    status: ResidentStatus;
    assignedNurse?: string;
    assignedDoctor?: string;
    primaryDiagnosis?: string;
    allergies?: string;
    currentMedications?: string;
    mobilityStatus?: MobilityStatus;
    cognitiveStatus?: CognitiveStatus;
    fallRisk?: FallRisk;
    painLevel?: number;
    nutritionNotes?: string;
    clinicalNotes?: string;
    emergencyContactName: string;
    emergencyContactRelationship?: string;
    emergencyContactPhone: string;
    emergencyContactEmail?: string;
};

export type ResidentFormPayload = {
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    phone?: string;
    address?: string;
    admissionDate: string;
    roomNumber: string;
    careLevel: CareLevel;
    assignedNurse?: string;
    assignedDoctor?: string;
    emergencyContactName: string;
    emergencyContactRelationship?: string;
    emergencyContactPhone: string;
    emergencyContactEmail?: string;
    primaryDiagnosis?: string;
    allergies?: string;
    currentMedications?: string;
    mobilityStatus?: MobilityStatus | "";
};

export type ResidentEvaluationPayload = {
    personalInfo: {
        fullName: string;
        dateOfBirth: string;
        gender: Gender | "";
        phone: string;
        address: string;
    };
    admissionInfo: {
        admissionDate: string;
        roomNumber: string;
        careLevel: CareLevel | "";
        assignedNurse: string;
        assignedDoctor: string;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
        email: string;
    };
    medicalSummary: {
        primaryDiagnosis: string;
        allergies: string;
        currentMedications: string;
        mobilityStatus: MobilityStatus | "";
    };
    initialEvaluation: {
        cognitiveStatus: CognitiveStatus | "";
        fallRisk: FallRisk | "";
        painLevel: number;
        nutritionNotes: string;
        clinicalNotes: string;
    };
};

export type ResidentListQuery = {
    search: string;
    status: ResidentStatus | "all";
    careLevel: CareLevel | "all";
    page: number;
    pageSize: number;
};

export type ResidentListResult = {
    items: Resident[];
    total: number;
};

export type StatusUpdatePayload = {
    status: ResidentStatus;
};
