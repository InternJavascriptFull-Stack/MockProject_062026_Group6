import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";
import { staffingRatiosService, type StaffingRatio } from "@/services/staffingRatios";

type ShiftForm = {
    shiftName: string;
    startTime: string;
    endTime: string;
    requiredCnaHours: string;
    requiredNurseHours: string;
};

function toShiftForm(data: StaffingRatio): ShiftForm[] {
    return data.shifts.map((shift) => ({
        shiftName: shift.shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
        requiredCnaHours: shift.requiredCnaHours.toString(),
        requiredNurseHours: shift.requiredNurseHours.toString(),
    }));
}

function parseDecimalInput(value: string) {
    return Number(value.replace(",", "."));
}

export default function StaffingRatioPage() {
    const [minHrsPerResidentDay, setMinHrsPerResidentDay] = useState("3.5");
    const [shifts, setShifts] = useState<ShiftForm[]>([]);
    const [message, setMessage] = useState("");
    const [validationError, setValidationError] = useState("");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["staffingRatios"],
        queryFn: () => staffingRatiosService.getStaffingRatios(),
    });

    useEffect(() => {
        if (!data) {
            return;
        }

        setMinHrsPerResidentDay(data.minHrsPerResidentDay.toString());
        setShifts(toShiftForm(data));
    }, [data]);

    const minHoursValue = parseDecimalInput(minHrsPerResidentDay);
    const shiftRows = useMemo(
        () =>
            shifts.map((shift) => {
                const cnaHours = Number(shift.requiredCnaHours);
                const nurseHours = Number(shift.requiredNurseHours);

                return {
                    ...shift,
                    cnaHours,
                    nurseHours,
                    subtotal: cnaHours + nurseHours,
                };
            }),
        [shifts],
    );
    const shiftTotal = shiftRows.reduce((total, shift) => total + shift.subtotal, 0);
    const hasInvalidShift = shifts.some(
        (shift) =>
            shift.requiredCnaHours.trim() === "" ||
            shift.requiredNurseHours.trim() === "" ||
            Number.isNaN(Number(shift.requiredCnaHours)) ||
            Number.isNaN(Number(shift.requiredNurseHours)) ||
            Number(shift.requiredCnaHours) < 0 ||
            Number(shift.requiredNurseHours) < 0,
    );
    const hasInvalidRatio =
        minHrsPerResidentDay.trim() === "" ||
        Number.isNaN(minHoursValue) ||
        minHoursValue < 0 ||
        hasInvalidShift;

    const scheduledPerResident = shiftTotal;
    const scheduledDirectCareHours = data ? scheduledPerResident * data.census : 0;
    const isCompliant = !hasInvalidRatio && scheduledPerResident >= minHoursValue;

    const mutation = useMutation({
        mutationFn: () => {
            if (!data) {
                throw new Error("Staffing ratio is not loaded.");
            }

            if (hasInvalidRatio) {
                throw new Error("Minimum direct care hours and shift hours are required and cannot be negative.");
            }

            return staffingRatiosService.updateStaffingRatio(data.id, {
                minHrsPerResidentDay: minHoursValue,
                shifts: shifts.map((shift) => ({
                    shiftName: shift.shiftName,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    requiredCnaHours: Number(shift.requiredCnaHours),
                    requiredNurseHours: Number(shift.requiredNurseHours),
                })),
            });
        },
        onSuccess: () => {
            setValidationError("");
            setMessage("Staffing ratio settings saved successfully.");
        },
        onError: (error) => {
            setMessage("");
            setValidationError(error instanceof Error ? error.message : "Unable to save staffing ratio.");
        },
    });

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading staffing ratio...</div>;
    }

    if (isError || !data) {
        return <div className="p-8 text-center text-red-500">Unable to load staffing ratio.</div>;
    }

    return (
        <div className="mx-auto max-w-6xl pb-24 font-sans">
            <div className="mb-5">
                <div className="mb-1 text-sm font-medium text-slate-500">
                    Admin &gt; <span className="text-slate-700">Staffing</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staffing Ratio Configuration</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {data.targetStateName} SNF minimum: {minHrsPerResidentDay || "--"} direct care hours per resident per day ({data.regulationReference})
                </p>
            </div>

            <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Minimum Requirement</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <label className="space-y-2">
                        <span className="text-sm font-bold text-slate-600">Target State</span>
                        <Input value={data.targetStateName} disabled />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-bold text-slate-600">Minimum Direct Care Hours</span>
                        <div className="relative">
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={minHrsPerResidentDay}
                                onChange={(event) => setMinHrsPerResidentDay(event.target.value)}
                            />
                            <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-400">
                                hrs/resident/day
                            </span>
                        </div>
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-bold text-slate-600">Regulation Reference</span>
                        <Input value={data.regulationReference} disabled />
                    </label>
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-lg font-bold text-slate-900">Shift Breakdown</h2>
                <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Shift</th>
                                <th className="px-4 py-3">Required CNA hrs</th>
                                <th className="px-4 py-3">Required Nurse hrs</th>
                                <th className="px-4 py-3">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {shiftRows.map((shift, index) => (
                                <tr key={shift.shiftName}>
                                    <td className="px-4 py-4 text-slate-700">
                                        {shift.shiftName} ({shift.startTime}-{shift.endTime})
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">
                                        <div className="relative w-32">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                className="pr-10"
                                                value={shift.requiredCnaHours}
                                                onChange={(event) => updateShift(index, "requiredCnaHours", event.target.value)}
                                            />
                                            <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-400">hrs</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">
                                        <div className="relative w-32">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                className="pr-10"
                                                value={shift.requiredNurseHours}
                                                onChange={(event) => updateShift(index, "requiredNurseHours", event.target.value)}
                                            />
                                            <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-400">hrs</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold text-slate-900">
                                        {Number.isNaN(shift.subtotal) ? "--" : shift.subtotal.toFixed(1)} hrs
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 grid grid-cols-[180px_1fr] text-sm font-bold text-slate-900">
                    <span>Sum of shifts</span>
                    <span>{Number.isNaN(shiftTotal) ? "--" : shiftTotal.toFixed(1)} hrs/resident/day</span>
                </div>
            </section>

            <section
                className={`mt-7 rounded-lg border p-5 text-sm ${
                    isCompliant
                        ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                        : "border-red-300 bg-red-50 text-red-700"
                }`}
            >
                <h2 className="mb-3 text-lg font-bold">Current Compliance (simulated)</h2>
                <p>
                    Census: {data.census} residents · Scheduled direct care hours: {scheduledDirectCareHours.toFixed(1)} hrs/day
                </p>
                <p className="mt-1 font-bold">
                    = {scheduledPerResident.toFixed(1)} hrs/resident/day → {isCompliant ? "Compliant" : "Not compliant"} (≥ {hasInvalidRatio ? "--" : minHrsPerResidentDay} minimum, BR-01)
                </p>
                <p className="mt-4 font-bold">Used by:</p>
                <p>{data.usedBy}</p>
            </section>
            {(validationError || hasInvalidRatio) && (
                <p className="mt-3 text-sm font-semibold text-red-600">
                    {validationError || "Minimum direct care hours and shift hours are required and cannot be negative."}
                </p>
            )}
            {message && (
                <p className="mt-3 text-sm font-semibold text-emerald-600">{message}</p>
            )}

            <div className="fixed bottom-0 left-[260px] right-0 z-10 flex justify-end gap-3 border-t border-slate-200 bg-white px-8 py-4">
                <Button
                    variant="outline"
                    className="h-11 w-36 rounded-md"
                    onClick={() => {
                        setMinHrsPerResidentDay(data.minHrsPerResidentDay.toString());
                        setShifts(toShiftForm(data));
                    }}
                >
                    Cancel
                </Button>
                <Button
                    className="h-11 w-72 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending || hasInvalidRatio}
                >
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );

    function updateShift<Key extends keyof ShiftForm>(index: number, key: Key, value: ShiftForm[Key]) {
        setShifts((current) => current.map((shift, shiftIndex) => shiftIndex === index ? { ...shift, [key]: value } : shift));
    }
}
