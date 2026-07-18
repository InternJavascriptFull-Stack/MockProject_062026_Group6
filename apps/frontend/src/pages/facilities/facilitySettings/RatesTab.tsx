import { Input } from "@/components/authUi/input";
import { roomTypeOptions } from "./facilitySettings.constants";
import type { FacilityRoomRate, RoomRateChangeHandler } from "./facilitySettings.types";

export function RatesTab({
    roomRates,
    onRoomRateChange,
}: {
    roomRates: FacilityRoomRate[];
    onRoomRateChange: RoomRateChangeHandler;
}) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Room Rate</h2>
            <div className="space-y-3">
                {roomRates.map((rate, index) => (
                    <div key={rate.roomType} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px]">
                        <select
                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            value={rate.roomType}
                            onChange={(event) => onRoomRateChange(index, "roomType", event.target.value)}
                        >
                            {roomTypeOptions.map((roomType) => (
                                <option key={roomType} value={roomType}>
                                    {roomType}
                                </option>
                            ))}
                        </select>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-2.5 text-sm font-semibold text-slate-500">$</span>
                            <Input
                                type="number"
                                min="0"
                                className="pl-7 pr-12"
                                value={rate.dailyRate}
                                onChange={(event) => onRoomRateChange(index, "dailyRate", Number(event.target.value))}
                            />
                            <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-slate-400">/day</span>
                        </div>
                        <Input type="date" value={rate.effectiveFrom} onChange={(event) => onRoomRateChange(index, "effectiveFrom", event.target.value)} />
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
                Effective room rates feed the Care Plan Cost Panel for future estimated-cost figures.
            </p>
        </section>
    );
}
