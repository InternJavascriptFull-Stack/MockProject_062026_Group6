import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { facilitiesService } from "@/services/facilities";
import type {
    FacilityBedStatus,
    FacilityClinicalCapability,
    FacilityGeneralForm,
    FacilityRoomForm,
    FacilityRoomRate,
    FacilityRoomDraft,
} from "./facilitySettings.types";
import { generalSettingsSchema } from "./facilitySettings.schema";
import { createClientId, emptyRoom, getWing, toApiStatus } from "./facilitySettings.utils";

export function useFacilitySettingsForm() {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [newRoom, setNewRoom] = useState<FacilityRoomForm>(emptyRoom());
    const [rooms, setRooms] = useState<FacilityRoomDraft[]>([]);
    const [roomRates, setRoomRates] = useState<FacilityRoomRate[]>([]);
    const [capabilities, setCapabilities] = useState<FacilityClinicalCapability[]>([]);

    const generalForm = useForm<FacilityGeneralForm>({
        resolver: zodResolver(generalSettingsSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            licenseNumber: "",
            targetState: "",
            timezone: "",
            phoneNumber: "",
        },
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ["facilitySettings"],
        queryFn: () => facilitiesService.getFacilitySettings(),
    });

    useEffect(() => {
        if (!data) {
            return;
        }

        generalForm.reset({
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
    }, [data, generalForm]);

    const generalValues = generalForm.watch();
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
    const cannotSave = !generalForm.formState.isValid || hasInvalidRoom || hasInvalidRoomRate;

    const mutation = useMutation({
        mutationFn: async () => {
            const formData = await generalForm.trigger().then((isValid) => {
                if (!isValid) {
                    throw new Error("Facility name, timezone, target state, and license number are required.");
                }

                return generalForm.getValues();
            });

            return facilitiesService.updateFacilitySettings({
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
            });
        },
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

    function updateRoom<Key extends keyof FacilityRoomForm>(index: number, key: Key, value: FacilityRoomForm[Key]) {
        setRooms((current) => current.map((room, roomIndex) => (roomIndex === index ? { ...room, [key]: value } : room)));
    }

    function updateNewRoom<Key extends keyof FacilityRoomForm>(key: Key, value: FacilityRoomForm[Key]) {
        setNewRoom((current) => ({ ...current, [key]: value }));
    }

    function openAddRoom() {
        setNewRoom(emptyRoom());
        setIsAddRoomOpen(true);
    }

    function closeAddRoom() {
        setIsAddRoomOpen(false);
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
        setRoomRates((current) => current.map((rate, rateIndex) => (rateIndex === index ? { ...rate, [key]: value } : rate)));
    }

    function updateCapability(index: number, supported: boolean) {
        setCapabilities((current) => current.map((capability, capabilityIndex) => (capabilityIndex === index ? { ...capability, supported } : capability)));
    }

    function resetFromServer() {
        queryClient.invalidateQueries({ queryKey: ["facilitySettings"] });
    }

    return {
        data,
        isLoading,
        isError,
        generalForm,
        generalValues,
        rooms,
        roomRates,
        capabilities,
        newRoom,
        message,
        errorMessage,
        isAddRoomOpen,
        roomSummary,
        cannotSave,
        isSaving: mutation.isPending,
        setErrorMessage,
        openAddRoom,
        closeAddRoom,
        confirmAddRoom,
        updateRoom,
        updateNewRoom,
        updateRoomRate,
        updateCapability,
        save: () => mutation.mutate(),
        resetFromServer,
    };
}
