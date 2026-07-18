import { useState } from "react";
import { AddRoomDialog } from "./facilitySettings/AddRoomDialog";
import { CapabilitiesTab } from "./facilitySettings/CapabilitiesTab";
import { FacilityActions } from "./facilitySettings/FacilityActions";
import { GeneralSettingsTab } from "./facilitySettings/GeneralSettingsTab";
import { RatesTab } from "./facilitySettings/RatesTab";
import { RoomsTab } from "./facilitySettings/RoomsTab";
import type { FacilityTab } from "./facilitySettings/facilitySettings.types";
import { useFacilitySettingsForm } from "./facilitySettings/useFacilitySettingsForm";

const tabs: Array<{ id: FacilityTab; label: string }> = [
    { id: "general", label: "General Info" },
    { id: "rooms", label: "Rooms & Wings" },
    { id: "rates", label: "Room Rate" },
    { id: "capabilities", label: "Clinical Capability" },
];

export default function FacilitySettingsPage() {
    const [activeTab, setActiveTab] = useState<FacilityTab>("rooms");
    const settings = useFacilitySettingsForm();

    if (settings.isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading facility settings...</div>;
    }

    if (settings.isError || !settings.data) {
        return <div className="p-8 text-center text-red-500">Unable to load facility settings.</div>;
    }

    return (
        <div className="mx-auto max-w-6xl pb-24 font-sans">
            <header className="mb-4">
                <div className="mb-1 text-sm font-medium text-slate-500">
                    Admin &gt; <span className="text-slate-700">Facility</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Facility Settings</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {settings.generalValues.name} - facility_id {settings.data.facilityCode} - Target state: {settings.data.targetStateName}
                </p>
            </header>

            <nav className="mb-4 flex border-b border-slate-200 text-sm font-semibold text-slate-500">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`px-4 py-2 ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {settings.message && <p className="mb-3 text-sm font-semibold text-emerald-600">{settings.message}</p>}
            {settings.errorMessage && <p className="mb-3 text-sm font-semibold text-red-600">{settings.errorMessage}</p>}
            {settings.cannotSave && (
                <p className="mb-3 text-sm font-semibold text-red-600">
                    Facility name, timezone, target state, license number, rooms, and non-negative room rates are required.
                </p>
            )}

            {activeTab === "general" && (
                <GeneralSettingsTab form={settings.generalForm} facilityCode={settings.data.facilityCode} />
            )}

            {activeTab === "rooms" && (
                <RoomsTab
                    roomSummary={settings.roomSummary}
                    rooms={settings.rooms}
                    originalRooms={settings.data.rooms}
                    facilityCode={settings.data.facilityCode}
                    generalValues={settings.generalValues}
                    targetStateName={settings.data.targetStateName}
                    roomRates={settings.roomRates}
                    capabilities={settings.capabilities}
                    onAddRoom={settings.openAddRoom}
                    onRoomChange={settings.updateRoom}
                />
            )}

            {activeTab === "rates" && (
                <RatesTab roomRates={settings.roomRates} onRoomRateChange={settings.updateRoomRate} />
            )}

            {activeTab === "capabilities" && (
                <CapabilitiesTab capabilities={settings.capabilities} onCapabilityChange={settings.updateCapability} />
            )}

            <AddRoomDialog
                isOpen={settings.isAddRoomOpen}
                room={settings.newRoom}
                onClose={settings.closeAddRoom}
                onConfirm={settings.confirmAddRoom}
                onRoomChange={settings.updateNewRoom}
            />

            <FacilityActions
                isSaving={settings.isSaving}
                cannotSave={settings.cannotSave}
                onCancel={settings.resetFromServer}
                onSave={settings.save}
            />
        </div>
    );
}
