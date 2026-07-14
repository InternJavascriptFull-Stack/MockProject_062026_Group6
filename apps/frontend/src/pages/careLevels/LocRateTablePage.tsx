import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";
import {
    careLevelsService,
    type CareLevel,
} from "@/services/careLevels";

type CareLevelForm = Record<string, Pick<CareLevel, "dailyRate" | "effectiveFrom">>;

export default function LocRateTablePage() {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CareLevelForm>({});
    const [message, setMessage] = useState("");
    const [validationError, setValidationError] = useState("");

    const { data = [], isLoading, isError } = useQuery({
        queryKey: ["careLevels"],
        queryFn: () => careLevelsService.getCareLevels(),
    });

    useEffect(() => {
        const nextFormData = data.reduce<CareLevelForm>((result, careLevel) => {
            result[careLevel.id] = {
                dailyRate: careLevel.dailyRate,
                effectiveFrom: careLevel.effectiveFrom,
            };

            return result;
        }, {});

        setFormData(nextFormData);
    }, [data]);

    const mutation = useMutation({
        mutationFn: async () => {
            const invalidRate = Object.values(formData).some(
                (row) => Number.isNaN(row.dailyRate) || row.dailyRate < 0,
            );

            if (invalidRate) {
                throw new Error("LOC rate must be greater than or equal to 0.");
            }

            const changedRows = data.filter((careLevel) => {
                const current = formData[careLevel.id];

                return current && (
                    current.dailyRate !== careLevel.dailyRate ||
                    current.effectiveFrom !== careLevel.effectiveFrom
                );
            });

            return Promise.all(
                changedRows.map((careLevel) =>
                    careLevelsService.updateCareLevel(careLevel.id, formData[careLevel.id]),
                ),
            );
        },
        onSuccess: () => {
            setValidationError("");
            setMessage("LOC rates saved successfully.");
            setEditingId(null);
            queryClient.invalidateQueries({ queryKey: ["careLevels"] });
        },
        onError: (error) => {
            setMessage("");
            setValidationError(error instanceof Error ? error.message : "Unable to save LOC rates.");
        },
    });

    const hasInvalidRate = Object.values(formData).some(
        (row) => Number.isNaN(row.dailyRate) || row.dailyRate < 0,
    );

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading LOC rates...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Unable to load LOC rates.</div>;
    }

    return (
        <div className="mx-auto max-w-6xl pb-24 font-sans">
            <div className="mb-4">
                <div className="mb-1 text-sm font-medium text-slate-500">
                    Admin &gt; <span className="text-slate-700">LOC Rates</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">LOC Rate Table</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Daily rate per Level of Care tier — score ranges are fixed by the clinical scoring model (§5E)
                </p>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-md border border-blue-300 bg-blue-100 px-4 py-3 text-sm font-bold text-blue-600">
                <Info className="h-5 w-5 flex-shrink-0" />
                <span>
                    4 tiers are fixed by the scoring model and cannot be added or removed. Only Daily Rate and Effective Date are editable.
                </span>
            </div>

            <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Level</th>
                            <th className="px-4 py-3">Score Range</th>
                            <th className="px-4 py-3">Daily Rate</th>
                            <th className="px-4 py-3">Effective Date</th>
                            <th className="px-4 py-3">Last Updated By</th>
                            <th className="px-4 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((careLevel) => {
                            const isEditing = editingId === careLevel.id;
                            const rowForm = formData[careLevel.id] ?? {
                                dailyRate: careLevel.dailyRate,
                                effectiveFrom: careLevel.effectiveFrom,
                            };

                            return (
                                <tr key={careLevel.id} className="text-slate-700">
                                    <td className="px-4 py-4">
                                        <Badge className="border-blue-300 bg-blue-100 text-blue-600">
                                            {careLevel.levelName}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">
                                        {careLevel.scoreMin} - {careLevel.scoreMax}
                                    </td>
                                    <td className="px-4 py-4 font-bold text-slate-900">
                                        {isEditing ? (
                                            <div className="relative w-36">
                                                <span className="pointer-events-none absolute left-3 top-2.5 text-sm font-semibold text-slate-500">$</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="pl-7"
                                                    value={rowForm.dailyRate}
                                                    onChange={(event) => updateRow(careLevel.id, "dailyRate", Number(event.target.value))}
                                                />
                                            </div>
                                        ) : (
                                            `$${rowForm.dailyRate.toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {isEditing ? (
                                            <Input
                                                type="date"
                                                className="w-40"
                                                value={rowForm.effectiveFrom}
                                                onChange={(event) => updateRow(careLevel.id, "effectiveFrom", event.target.value)}
                                            />
                                        ) : (
                                            rowForm.effectiveFrom
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">{careLevel.lastUpdatedBy}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                            onClick={() => setEditingId(isEditing ? null : careLevel.id)}
                                        >
                                            {isEditing ? "Done" : "Edit Rate"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs text-slate-400">
                Levels cannot be added or deleted here — score-range thresholds are defined by the ADL/IADL scoring model (Master Plan §5E) and match M1-US-08 LOC Classification.
            </p>
            {validationError && (
                <p className="mt-3 text-sm font-semibold text-red-600">{validationError}</p>
            )}
            {message && (
                <p className="mt-3 text-sm font-semibold text-emerald-600">{message}</p>
            )}

            <div className="fixed bottom-0 left-[260px] right-0 z-10 flex justify-end gap-3 border-t border-slate-200 bg-white px-8 py-4">
                <Button
                    variant="outline"
                    className="h-11 w-36 rounded-md"
                    onClick={() => {
                        setEditingId(null);
                        setFormData(
                            data.reduce<CareLevelForm>((result, careLevel) => {
                                result[careLevel.id] = {
                                    dailyRate: careLevel.dailyRate,
                                    effectiveFrom: careLevel.effectiveFrom,
                                };

                                return result;
                            }, {}),
                        );
                    }}
                >
                    Cancel
                </Button>
                <Button
                    className="h-11 w-72 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending || hasInvalidRate}
                >
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );

    function updateRow<Key extends keyof CareLevelForm[string]>(
        id: string,
        key: Key,
        value: CareLevelForm[string][Key],
    ) {
        if (key === "dailyRate" && typeof value === "number" && value < 0) {
            setValidationError("LOC rate must be greater than or equal to 0.");
        } else {
            setValidationError("");
        }

        setFormData((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [key]: value,
            },
        }));
    }
}
