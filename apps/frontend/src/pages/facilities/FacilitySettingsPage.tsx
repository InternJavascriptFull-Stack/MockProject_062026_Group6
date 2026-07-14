import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { Plus, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";
import {
    facilitiesService,
    type FacilityBedStatus,
    type FacilityClinicalCapability,
    type FacilityRoomForm,
    type FacilityRoomRate,
} from "@/services/facilities";

const roomTypeOptions = ["Private", "Semi-private", "Ward"];

const bedStatusOptions: Array<{ label: string; value: FacilityBedStatus }> = [
    { label: "Available", value: "AVAILABLE" },
    { label: "Occupied", value: "OCCUPIED" },
    { label: "Out of Service", value: "MAINTENANCE" },
];

const usTimezoneOptions = [
    { label: "America/New_York (Eastern)", value: "America/New_York (Eastern)" },
    { label: "America/Chicago (Central)", value: "America/Chicago (Central)" },
    { label: "America/Denver (Mountain)", value: "America/Denver (Mountain)" },
    { label: "America/Phoenix (Arizona)", value: "America/Phoenix (Arizona)" },
    { label: "America/Los_Angeles (Pacific)", value: "America/Los_Angeles (Pacific)" },
    { label: "America/Anchorage (Alaska)", value: "America/Anchorage (Alaska)" },
    { label: "Pacific/Honolulu (Hawaii)", value: "Pacific/Honolulu (Hawaii)" },
];

function toApiStatus(status: string): FacilityBedStatus {
    if (status === "Occupied") {
        return "OCCUPIED";
    }

    if (status === "Out of Service") {
        return "MAINTENANCE";
    }

    return "AVAILABLE";
}

function getWing(roomNumber: string) {
    const numericRoom = Number.parseInt(roomNumber, 10);

    if (numericRoom >= 220) {
        return "Wing C";
    }

    if (numericRoom >= 200) {
        return "Wing B";
    }

    return "Wing A";
}

function emptyRoom(): FacilityRoomForm {
    return {
        roomNumber: "",
        bedNumber: "A",
        roomType: "Private",
        status: "AVAILABLE",
    };
}

function getStatusSelectClass(status: FacilityBedStatus) {
    const baseClass = "h-8 rounded-full border px-3 text-xs font-bold outline-none";

    if (status === "OCCUPIED") {
        return `${baseClass} border-blue-300 bg-blue-100 text-blue-600`;
    }

    if (status === "MAINTENANCE") {
        return `${baseClass} border-slate-300 bg-slate-100 text-slate-600`;
    }

    return `${baseClass} border-emerald-300 bg-emerald-100 text-emerald-600`;
}

type FacilityTab = "general" | "rooms" | "rates" | "capabilities";
type FacilityRoomDraft = FacilityRoomForm & { clientId: string };

function createClientId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function FacilitySettingsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<FacilityTab>("rooms");
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [newRoom, setNewRoom] = useState<FacilityRoomForm>(emptyRoom());
    const [formData, setFormData] = useState({
        name: "",
        licenseNumber: "",
        targetState: "",
        timezone: "",
        phoneNumber: "",
    });
    const [rooms, setRooms] = useState<FacilityRoomDraft[]>([]);
    const [roomRates, setRoomRates] = useState<FacilityRoomRate[]>([]);
    const [capabilities, setCapabilities] = useState<FacilityClinicalCapability[]>([]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["facilitySettings"],
        queryFn: () => facilitiesService.getFacilitySettings(),
    });

    useEffect(() => {
        if (!data) {
            return;
        }

        setFormData({
            name: data.name,
            licenseNumber: data.licenseNumber,
            targetState: data.targetState,
            timezone: data.timezone,
            phoneNumber: data.phoneNumber ?? "",
        });
        setRooms(
            data.rooms.map((room) => ({
                clientId: `${room.roomId}-${room.bedId}`,
                roomId: room.roomId,
                bedId: room.bedId,
                roomNumber: room.roomNumber,
                bedNumber: room.bedNumber,
                roomType: room.roomType,
                status: toApiStatus(room.status),
            })),
        );
        setRoomRates(data.roomRates);
        setCapabilities(data.capabilities);
    }, [data]);

    const mutation = useMutation({
        mutationFn: () =>
            facilitiesService.updateFacilitySettings({
                ...formData,
                rooms: rooms.map(({ clientId: _clientId, ...room }) => room),
                roomRates: roomRates.map(({ roomType, dailyRate, effectiveFrom }) => ({
                    roomType,
                    dailyRate,
                    effectiveFrom,
                })),
                capabilities: capabilities.map(({ capability, supported, note }) => ({
                    capability,
                    supported,
                    note,
                })),
            }),
        onSuccess: () => {
            setErrorMessage("");
            setMessage("Facility settings saved successfully.");
            queryClient.invalidateQueries({ queryKey: ["facilitySettings"] });
        },
        onError: (error) => {
            setMessage("");
            setErrorMessage(error instanceof Error ? error.message : "Unable to save facility settings.");
        },
    });

    const roomSummary = useMemo(() => {
        const wingCount = new Set(rooms.map((room) => getWing(room.roomNumber))).size;
        return `${rooms.length} rooms configured across ${wingCount || 0} wings`;
    }, [rooms]);

    const hasInvalidRoomRate = roomRates.some(
        (rate) => rate.roomType.trim() === "" || Number.isNaN(rate.dailyRate) || rate.dailyRate < 0 || rate.effectiveFrom.trim() === "",
    );
    const hasInvalidRoom = rooms.some(
        (room) => room.roomNumber.trim() === "" || room.bedNumber.trim() === "" || room.roomType.trim() === "",
    );
    const hasInvalidGeneral =
        formData.name.trim() === "" ||
        formData.licenseNumber.trim() === "" ||
        formData.targetState.trim() === "" ||
        formData.timezone.trim() === "";
    const cannotSave = hasInvalidGeneral || hasInvalidRoom || hasInvalidRoomRate;

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading facility settings...</div>;
    }

    if (isError || !data) {
        return <div className="p-8 text-center text-red-500">Unable to load facility settings.</div>;
    }

    return (
        <div className="mx-auto max-w-6xl pb-24 font-sans">
            <div className="mb-4">
                <div className="mb-1 text-sm font-medium text-slate-500">
                    Admin &gt; <span className="text-slate-700">Facility</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Facility Settings</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {formData.name} · facility_id {data.facilityCode} · Target state: {data.targetStateName}
                </p>
            </div>

            <div className="mb-4 flex border-b border-slate-200 text-sm font-semibold text-slate-500">
                {[
                    { id: "general", label: "General Info" },
                    { id: "rooms", label: "Rooms & Wings" },
                    { id: "rates", label: "Room Rate" },
                    { id: "capabilities", label: "Clinical Capability" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`px-4 py-2 ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
                        onClick={() => setActiveTab(tab.id as FacilityTab)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {message && <p className="mb-3 text-sm font-semibold text-emerald-600">{message}</p>}
            {errorMessage && <p className="mb-3 text-sm font-semibold text-red-600">{errorMessage}</p>}
            {cannotSave && (
                <p className="mb-3 text-sm font-semibold text-red-600">
                    Facility name, timezone, target state, license number, rooms, and non-negative room rates are required.
                </p>
            )}

            {activeTab === "general" && (
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <h2 className="mb-4 text-lg font-bold text-slate-900">General Info</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <TextField label="Facility name" value={formData.name} onChange={(value) => updateGeneral("name", value)} />
                        <TextField label="facility_id" value={`${data.facilityCode} (read-only)`} readOnly />
                        <SelectField
                            label="Timezone"
                            value={formData.timezone}
                            options={usTimezoneOptions}
                            onChange={(value) => updateGeneral("timezone", value)}
                        />
                        <TextField label="Target state" value={formData.targetState} onChange={(value) => updateGeneral("targetState", value.toUpperCase())} maxLength={2} />
                        <TextField label="License #" value={formData.licenseNumber} onChange={(value) => updateGeneral("licenseNumber", value)} />
                        <TextField label="Phone" value={formData.phoneNumber} onChange={(value) => updateGeneral("phoneNumber", value)} />
                    </div>
                </section>
            )}

            {activeTab === "rooms" && (
                <>
                    <div className="mb-5 flex items-center justify-between">
                        <p className="text-sm text-slate-500">{roomSummary}</p>
                        <Button variant="outline" className="h-9 gap-2 rounded-md" onClick={openAddRoom}>
                            <Plus className="h-4 w-4" />
                            Add Room
                        </Button>
                    </div>
                        <RoomsTable rooms={rooms} originalRooms={data.rooms} onChange={updateRoom} />
                    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <SummaryCard title="General Info" tag="Tab 1 of 4">
                            <SummaryRow label="Facility name" value={formData.name} />
                            <SummaryRow label="facility_id" value={`${data.facilityCode} (read-only)`} />
                            <SummaryRow label="Timezone" value={formData.timezone} />
                            <SummaryRow label="Target state" value={data.targetStateName} />
                            <SummaryRow label="License #" value={formData.licenseNumber} />
                        </SummaryCard>
                        <SummaryCard title="Room Rate" tag="Tab 3 of 4">
                            {roomRates.map((rate) => (
                                <SummaryRow
                                    key={rate.roomType}
                                    label={rate.roomType}
                                    value={`$${Number(rate.dailyRate).toFixed(2)} / day`}
                                />
                            ))}
                            <p className="mt-4 text-xs leading-relaxed text-slate-400">
                                Effective {roomRates[0]?.effectiveFrom ?? "-"} · feeds Care Plan Cost Panel.
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
                        {capabilities.find((capability) => capability.capability === "Bariatric care needs" && !capability.supported)?.note && (
                            <p className="mt-4 text-xs text-slate-400">
                                {capabilities.find((capability) => capability.capability === "Bariatric care needs")?.note}
                            </p>
                        )}
                    </SummaryCard>
                </>
            )}

            {activeTab === "rates" && (
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <h2 className="mb-4 text-lg font-bold text-slate-900">Room Rate</h2>
                    <div className="space-y-3">
                        {roomRates.map((rate, index) => (
                            <div key={rate.roomType} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px]">
                                <select
                                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                                    value={rate.roomType}
                                    onChange={(event) => updateRoomRate(index, "roomType", event.target.value)}
                                >
                                    {roomTypeOptions.map((roomType) => (
                                        <option key={roomType} value={roomType}>{roomType}</option>
                                    ))}
                                </select>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-2.5 text-sm font-semibold text-slate-500">$</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        className="pl-7 pr-12"
                                        value={rate.dailyRate}
                                        onChange={(event) => updateRoomRate(index, "dailyRate", Number(event.target.value))}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-slate-400">/day</span>
                                </div>
                                <Input type="date" value={rate.effectiveFrom} onChange={(event) => updateRoomRate(index, "effectiveFrom", event.target.value)} />
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-slate-400">
                        Effective room rates feed the Care Plan Cost Panel for future estimated-cost figures.
                    </p>
                </section>
            )}

            {activeTab === "capabilities" && (
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <h2 className="mb-3 text-lg font-bold text-slate-900">Facility Clinical Capability</h2>
                    <p className="mb-4 max-w-3xl text-sm text-slate-500">
                        Used by Pre-Admission Screening to check an applicant's clinical needs against what this facility can support.
                    </p>
                    <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                        {capabilities.map((capability, index) => (
                            <label key={capability.capability} className="flex items-center justify-between gap-4 text-sm text-slate-700">
                                <span>{capability.capability}</span>
                                <input
                                    type="checkbox"
                                    checked={capability.supported}
                                    onChange={(event) => updateCapability(index, event.target.checked)}
                                />
                            </label>
                        ))}
                    </div>
                    {capabilities.find((capability) => capability.capability === "Bariatric care needs" && !capability.supported)?.note && (
                        <p className="mt-4 text-xs text-slate-400">
                            {capabilities.find((capability) => capability.capability === "Bariatric care needs")?.note}
                        </p>
                    )}
                </section>
            )}

            {isAddRoomOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Add Room</h2>
                            <button type="button" className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setIsAddRoomOpen(false)}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextField label="Room" value={newRoom.roomNumber} onChange={(value) => updateNewRoom("roomNumber", value)} />
                            <TextField label="Bed" value={newRoom.bedNumber} onChange={(value) => updateNewRoom("bedNumber", value)} />
                            <SelectField
                                label="Room Type"
                                value={newRoom.roomType}
                                options={roomTypeOptions.map((roomType) => ({ label: roomType, value: roomType }))}
                                onChange={(value) => updateNewRoom("roomType", value)}
                            />
                            <SelectField
                                label="Status"
                                value={newRoom.status}
                                options={bedStatusOptions}
                                onChange={(value) => updateNewRoom("status", value as FacilityBedStatus)}
                            />
                        </div>
                        <div className="mt-5 flex justify-end gap-3">
                            <Button variant="outline" className="rounded-md" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
                            <Button className="rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={confirmAddRoom}>Add Room</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-[260px] right-0 z-10 flex justify-end gap-3 border-t border-slate-200 bg-white px-8 py-4">
                <Button variant="outline" className="h-11 w-36 rounded-md" onClick={() => queryClient.invalidateQueries({ queryKey: ["facilitySettings"] })}>
                    Cancel
                </Button>
                <Button className="h-11 w-72 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={() => mutation.mutate()} disabled={mutation.isPending || cannotSave}>
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );

    function updateGeneral(key: keyof typeof formData, value: string) {
        setFormData((current) => ({ ...current, [key]: value }));
    }

    function updateRoom<Key extends keyof FacilityRoomForm>(index: number, key: Key, value: FacilityRoomForm[Key]) {
        setRooms((current) => current.map((room, roomIndex) => roomIndex === index ? { ...room, [key]: value } : room));
    }

    function updateNewRoom<Key extends keyof FacilityRoomForm>(key: Key, value: FacilityRoomForm[Key]) {
        setNewRoom((current) => ({ ...current, [key]: value }));
    }

    function openAddRoom() {
        setNewRoom(emptyRoom());
        setIsAddRoomOpen(true);
    }

    function confirmAddRoom() {
        if (newRoom.roomNumber.trim() === "" || newRoom.bedNumber.trim() === "" || newRoom.roomType.trim() === "") {
            setErrorMessage("Room, bed, and room type are required.");
            return;
        }

        setRooms((current) => [{ ...newRoom, clientId: createClientId() }, ...current]);
        setErrorMessage("");
        setIsAddRoomOpen(false);
    }

    function updateRoomRate<Key extends keyof FacilityRoomRate>(index: number, key: Key, value: FacilityRoomRate[Key]) {
        setRoomRates((current) => current.map((rate, rateIndex) => rateIndex === index ? { ...rate, [key]: value } : rate));
    }

    function updateCapability(index: number, supported: boolean) {
        setCapabilities((current) => current.map((capability, capabilityIndex) => capabilityIndex === index ? { ...capability, supported } : capability));
    }
}

function RoomsTable({
    rooms,
    originalRooms,
    onChange,
}: {
    rooms: FacilityRoomDraft[];
    originalRooms: Array<{ bedId: string; occupantNote: string | null }>;
    onChange: <Key extends keyof FacilityRoomForm>(index: number, key: Key, value: FacilityRoomForm[Key]) => void;
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
                                        onChange={(event) => onChange(index, "roomType", event.target.value)}
                                    >
                                        {roomTypeOptions.map((roomType) => (
                                            <option key={roomType} value={roomType}>{roomType}</option>
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
                                            <option key={option.value} value={option.value}>{option.label}</option>
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

function SummaryCard({
    title,
    tag,
    children,
    className = "",
}: {
    title: string;
    tag: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`rounded-lg border border-slate-200 bg-white p-5 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">{tag}</span>
            </div>
            {children}
        </section>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="mb-3 flex items-start justify-between gap-4 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-bold text-slate-700">{value}</span>
        </div>
    );
}

function TextField({
    label,
    value,
    onChange,
    readOnly = false,
    maxLength,
}: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    maxLength?: number;
}) {
    return (
        <label className="space-y-2 text-sm">
            <span className="font-bold text-slate-600">{label}</span>
            <Input
                value={value}
                readOnly={readOnly}
                disabled={readOnly}
                maxLength={maxLength}
                onChange={(event) => onChange?.(event.target.value)}
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="space-y-2 text-sm">
            <span className="font-bold text-slate-600">{label}</span>
            <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </label>
    );
}
