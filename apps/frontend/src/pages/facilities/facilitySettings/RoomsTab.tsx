import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FacilityClinicalCapability, FacilityRoomRate, FacilityRoomDraft, RoomChangeHandler } from "./facilitySettings.types";
import { RoomsTable } from "./RoomsTable";
import { SummaryCard, SummaryRow } from "./SummaryCard";

export function RoomsTab({
    roomSummary,
    rooms,
    originalRooms,
    facilityCode,
    generalValues,
    targetStateName,
    roomRates,
    capabilities,
    onAddRoom,
    onRoomChange,
}: {
    roomSummary: string;
    rooms: FacilityRoomDraft[];
    originalRooms: Array<{ bedId: string; occupantNote: string | null }>;
    facilityCode: string;
    generalValues: {
        name: string;
        timezone: string;
        licenseNumber: string;
    };
    targetStateName: string;
    roomRates: FacilityRoomRate[];
    capabilities: FacilityClinicalCapability[];
    onAddRoom: () => void;
    onRoomChange: RoomChangeHandler;
}) {
    const bariatricNote = capabilities.find((capability) => capability.capability === "Bariatric care needs" && !capability.supported)?.note;

    return (
        <>
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-slate-500">{roomSummary}</p>
                <Button variant="outline" className="h-9 gap-2 rounded-md" onClick={onAddRoom}>
                    <Plus className="h-4 w-4" />
                    Add Room
                </Button>
            </div>
            <RoomsTable rooms={rooms} originalRooms={originalRooms} onChange={onRoomChange} />
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <SummaryCard title="General Info" tag="Tab 1 of 4">
                    <SummaryRow label="Facility name" value={generalValues.name} />
                    <SummaryRow label="facility_id" value={`${facilityCode} (read-only)`} />
                    <SummaryRow label="Timezone" value={generalValues.timezone} />
                    <SummaryRow label="Target state" value={targetStateName} />
                    <SummaryRow label="License #" value={generalValues.licenseNumber} />
                </SummaryCard>
                <SummaryCard title="Room Rate" tag="Tab 3 of 4">
                    {roomRates.map((rate) => (
                        <SummaryRow key={rate.roomType} label={rate.roomType} value={`$${Number(rate.dailyRate).toFixed(2)} / day`} />
                    ))}
                    <p className="mt-4 text-xs leading-relaxed text-slate-400">
                        Effective {roomRates[0]?.effectiveFrom ?? "-"} - feeds Care Plan Cost Panel.
                    </p>
                </SummaryCard>
            </div>
            <SummaryCard title="Facility Clinical Capability" tag="Tab 4 of 4" className="mt-5">
                <p className="mb-4 max-w-3xl text-sm text-slate-500">
                    Used by Pre-Admission Screening to check an applicant's clinical needs against what this facility can support.
                </p>
                <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                    {capabilities.map((capability) => (
                        <div key={capability.capability} className="flex items-center justify-between gap-4 text-sm text-slate-700">
                            <span>{capability.capability}</span>
                            <Badge variant={capability.supported ? "priority" : "muted"}>
                                {capability.supported ? "Supported" : "Not Supported"}
                            </Badge>
                        </div>
                    ))}
                </div>
                {bariatricNote && <p className="mt-4 text-xs text-slate-400">{bariatricNote}</p>}
            </SummaryCard>
        </>
    );
}
