import type { CapabilityChangeHandler, FacilityClinicalCapability } from "./facilitySettings.types";

export function CapabilitiesTab({
    capabilities,
    onCapabilityChange,
}: {
    capabilities: FacilityClinicalCapability[];
    onCapabilityChange: CapabilityChangeHandler;
}) {
    const bariatricNote = capabilities.find((capability) => capability.capability === "Bariatric care needs" && !capability.supported)?.note;

    return (
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
                            onChange={(event) => onCapabilityChange(index, event.target.checked)}
                        />
                    </label>
                ))}
            </div>
            {bariatricNote && <p className="mt-4 text-xs text-slate-400">{bariatricNote}</p>}
        </section>
    );
}
