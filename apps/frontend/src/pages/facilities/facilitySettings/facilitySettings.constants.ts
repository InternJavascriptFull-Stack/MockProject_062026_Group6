import type { FacilityBedStatus } from "./facilitySettings.types";

export const roomTypeOptions = ["Private", "Semi-private", "Ward"];

export const bedStatusOptions: Array<{ label: string; value: FacilityBedStatus }> = [
    { label: "Available", value: "AVAILABLE" },
    { label: "Occupied", value: "OCCUPIED" },
    { label: "Out of Service", value: "MAINTENANCE" },
];

export const usTimezoneOptions = [
    { label: "America/New_York (Eastern)", value: "America/New_York (Eastern)" },
    { label: "America/Chicago (Central)", value: "America/Chicago (Central)" },
    { label: "America/Denver (Mountain)", value: "America/Denver (Mountain)" },
    { label: "America/Phoenix (Arizona)", value: "America/Phoenix (Arizona)" },
    { label: "America/Los_Angeles (Pacific)", value: "America/Los_Angeles (Pacific)" },
    { label: "America/Anchorage (Alaska)", value: "America/Anchorage (Alaska)" },
    { label: "Pacific/Honolulu (Hawaii)", value: "Pacific/Honolulu (Hawaii)" },
];
