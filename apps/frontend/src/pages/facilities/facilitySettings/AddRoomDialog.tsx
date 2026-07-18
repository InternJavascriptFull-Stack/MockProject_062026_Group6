import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bedStatusOptions, roomTypeOptions } from "./facilitySettings.constants";
import type { FacilityBedStatus, FacilityRoomForm, NewRoomChangeHandler } from "./facilitySettings.types";
import { SelectField, TextField } from "./Fields";

export function AddRoomDialog({
    isOpen,
    room,
    onClose,
    onConfirm,
    onRoomChange,
}: {
    isOpen: boolean;
    room: FacilityRoomForm;
    onClose: () => void;
    onConfirm: () => void;
    onRoomChange: NewRoomChangeHandler;
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/40 px-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Add Room</h2>
                    <button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField label="Room" value={room.roomNumber} onChange={(value) => onRoomChange("roomNumber", value)} />
                    <TextField label="Bed" value={room.bedNumber} onChange={(value) => onRoomChange("bedNumber", value)} />
                    <SelectField
                        label="Room Type"
                        value={room.roomType}
                        options={roomTypeOptions.map((roomType) => ({ label: roomType, value: roomType }))}
                        onChange={(value) => onRoomChange("roomType", value)}
                    />
                    <SelectField
                        label="Status"
                        value={room.status}
                        options={bedStatusOptions}
                        onChange={(value) => onRoomChange("status", value as FacilityBedStatus)}
                    />
                </div>
                <div className="mt-5 flex justify-end gap-3">
                    <Button variant="outline" className="rounded-md" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={onConfirm}>
                        Add Room
                    </Button>
                </div>
            </div>
        </div>
    );
}
