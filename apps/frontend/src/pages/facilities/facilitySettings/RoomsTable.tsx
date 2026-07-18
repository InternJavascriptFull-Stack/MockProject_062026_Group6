import { Input } from "@/components/authUi/input";
import { bedStatusOptions, roomTypeOptions } from "./facilitySettings.constants";
import type { FacilityBedStatus, FacilityRoomForm, FacilityRoomDraft, RoomChangeHandler } from "./facilitySettings.types";
import { getStatusSelectClass, getWing } from "./facilitySettings.utils";

export function RoomsTable({
    rooms,
    originalRooms,
    onChange,
}: {
    rooms: FacilityRoomDraft[];
    originalRooms: Array<{ bedId: string; occupantNote: string | null }>;
    onChange: RoomChangeHandler;
}) {
    const occupantNotes = new Map(originalRooms.map((room) => [room.bedId, room.occupantNote]));

    return (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Wing</th>
                        <th className="px-4 py-3">Room</th>
                        <th className="px-4 py-3">Bed</th>
                        <th className="px-4 py-3">Room Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Occupant / Note</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rooms.map((room, index) => (
                        <tr key={room.clientId} className="text-slate-700">
                            <td className="px-4 py-3">{getWing(room.roomNumber)}</td>
                            <td className="px-4 py-3">
                                <Input className="h-9 w-24 font-bold text-slate-900" value={room.roomNumber} onChange={(event) => onChange(index, "roomNumber", event.target.value)} />
                            </td>
                            <td className="px-4 py-3">
                                <Input className="h-9 w-20" value={room.bedNumber} onChange={(event) => onChange(index, "bedNumber", event.target.value)} />
                            </td>
                            <td className="px-4 py-3">
                                <select
                                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                                    value={room.roomType}
                                    onChange={(event) => onChange(index, "roomType", event.target.value as FacilityRoomForm["roomType"])}
                                >
                                    {roomTypeOptions.map((roomType) => (
                                        <option key={roomType} value={roomType}>
                                            {roomType}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-4 py-3">
                                <select
                                    className={getStatusSelectClass(room.status)}
                                    value={room.status}
                                    onChange={(event) => onChange(index, "status", event.target.value as FacilityBedStatus)}
                                >
                                    {bedStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-4 py-3">{room.bedId ? occupantNotes.get(room.bedId) ?? "-" : "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
