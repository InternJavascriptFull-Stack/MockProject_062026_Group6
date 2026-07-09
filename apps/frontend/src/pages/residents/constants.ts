import type {
  CareLevel,
  CognitiveStatus,
  FallRisk,
  Gender,
  MobilityStatus,
  ResidentStatus,
} from "./types";

export const RESIDENT_STATUS_LABEL: Record<ResidentStatus, string> = {
  pending: "Pending",
  under_evaluation: "Under Evaluation",
  admitted: "Admitted",
  discharged: "Discharged",
};

export const CARE_LEVEL_LABEL: Record<CareLevel, string> = {
  independent: "Independent",
  assisted_living: "Assisted Living",
  memory_care: "Memory Care",
  skilled_nursing: "Skilled Nursing",
};

export const GENDER_LABEL: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export const MOBILITY_STATUS_LABEL: Record<MobilityStatus, string> = {
  independent: "Independent",
  walker: "Walker",
  wheelchair: "Wheelchair",
  bed_bound: "Bed Bound",
};

export const COGNITIVE_STATUS_LABEL: Record<CognitiveStatus, string> = {
  alert_oriented: "Alert & Oriented",
  mild_impairment: "Mild Impairment",
  moderate_impairment: "Moderate Impairment",
  severe_impairment: "Severe Impairment",
};

export const FALL_RISK_LABEL: Record<FallRisk, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
