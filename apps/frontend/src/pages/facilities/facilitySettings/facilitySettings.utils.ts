import type { FacilityBedStatus, FacilityRoomForm } from "./facilitySettings.types";

export function toApiStatus(status: string): FacilityBedStatus {
    if (status === "Occupied") {
        return "OCCUPIED";
    }

    if (status === "Out of Service") {
        return "MAINTENANCE";
    }

    return "AVAILABLE";
}

export function getWing(roomNumber: string) {
    const numericRoom = Number.parseInt(roomNumber, 10);

    if (numericRoom >= 220) {
        return "Wing C";
    }

    if (numericRoom >= 200) {
        return "Wing B";
    }

    return "Wing A";
}

export function emptyRoom(): FacilityRoomForm {
    return {
        roomNumber: "",
        bedNumber: "A",
        roomType: "Private",
        status: "AVAILABLE",
    };
}

export function createClientId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getStatusSelectClass(status: FacilityBedStatus) {
    const baseClass = "h-8 rounded-full border px-3 text-xs font-bold outline-none";

    if (status === "OCCUPIED") {
        return `${baseClass} border-blue-300 bg-blue-100 text-blue-600`;
    }

    if (status === "MAINTENANCE") {
        return `${baseClass} border-slate-300 bg-slate-100 text-slate-600`;
    }

    return `${baseClass} border-emerald-300 bg-emerald-100 text-emerald-600`;
}
