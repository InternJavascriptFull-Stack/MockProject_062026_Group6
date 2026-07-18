import type {
    FacilityBedStatus,
    FacilityClinicalCapability,
    FacilityRoomForm,
    FacilityRoomRate,
} from "@/services/facilities";

export type FacilityTab = "general" | "rooms" | "rates" | "capabilities";

export type FacilityRoomDraft = FacilityRoomForm & { clientId: string };

export type FacilityGeneralForm = {
    name: string;
    licenseNumber: string;
    targetState: string;
    timezone: string;
    phoneNumber: string;
};

export type RoomChangeHandler = <Key extends keyof FacilityRoomForm>(
    index: number,
    key: Key,
    value: FacilityRoomForm[Key],
) => void;

export type RoomRateChangeHandler = <Key extends keyof FacilityRoomRate>(
    index: number,
    key: Key,
    value: FacilityRoomRate[Key],
) => void;

export type NewRoomChangeHandler = <Key extends keyof FacilityRoomForm>(
    key: Key,
    value: FacilityRoomForm[Key],
) => void;

export type CapabilityChangeHandler = (index: number, supported: boolean) => void;

export type {
    FacilityBedStatus,
    FacilityClinicalCapability,
    FacilityRoomForm,
    FacilityRoomRate,
};
