import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";
import { slaConfigService, type SlaConfigDTO } from "@/services/slaConfig";

const SLA_QUERY_KEY = ["sla-configurations"];

// Deadline and regulatory body are only meaningful when an external report is
// required, so they are validated conditionally per row.
const slaRowSchema = z
    .object({
        id: z.number(),
        levelName: z.string(),
        externalReportRequired: z.boolean(),
        slaWindowHrs: z.number({ message: "Deadline must be a number" }).int("Deadline must be a whole number").min(0, "Deadline cannot be negative"),
        regulatoryBody: z.string(),
    })
    .superRefine((row, ctx) => {
        if (!row.externalReportRequired) return;
        if (row.slaWindowHrs < 1) {
            ctx.addIssue({ code: "custom", path: ["slaWindowHrs"], message: "Deadline must be at least 1 hour" });
        }
        if (!row.regulatoryBody.trim()) {
            ctx.addIssue({ code: "custom", path: ["regulatoryBody"], message: "Regulatory body is required" });
        }
    });

const slaFormSchema = z.object({ rows: z.array(slaRowSchema) });

type SlaFormValues = z.infer<typeof slaFormSchema>;

function toFormRows(configs: SlaConfigDTO[]): SlaFormValues {
    return {
        rows: configs.map((config) => ({
            id: config.id,
            levelName: config.severity.levelName,
            externalReportRequired: config.externalReportRequired,
            slaWindowHrs: config.slaWindowHrs,
            regulatoryBody: config.regulatoryBody ?? "",
        })),
    };
}

function badgeClass(levelName: string): string {
    const normalized = levelName.toLowerCase();
    if (normalized === "critical") return "bg-red-100 text-red-700 border-red-300";
    if (normalized === "major") return "bg-orange-100 text-orange-700 border-orange-300";
    if (normalized === "moderate") return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-slate-100 text-slate-600 border-slate-300";
}

export default function SlaConfiguration() {
    const queryClient = useQueryClient();
    const [successMessage, setSuccessMessage] = useState("");

    const slaQuery = useQuery({
        queryKey: SLA_QUERY_KEY,
        queryFn: () => slaConfigService.getAll(),
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, dirtyFields, isDirty },
    } = useForm<SlaFormValues>({
        resolver: zodResolver(slaFormSchema),
        defaultValues: { rows: [] },
    });

    const { fields } = useFieldArray({ control, name: "rows" });
    const watchedRows = watch("rows");

    // Sync the form whenever fresh data arrives (initial load and post-save refetch).
    useEffect(() => {
        if (slaQuery.data) reset(toFormRows(slaQuery.data));
    }, [slaQuery.data, reset]);

    const saveMutation = useMutation({
        mutationFn: (rows: SlaFormValues["rows"]) =>
            Promise.all(
                rows.map((row) =>
                    slaConfigService.update(row.id, {
                        slaWindowHrs: row.slaWindowHrs,
                        externalReportRequired: row.externalReportRequired,
                        regulatoryBody: row.regulatoryBody.trim() ? row.regulatoryBody.trim() : null,
                    }),
                ),
            ),
        onSuccess: async () => {
            setSuccessMessage("SLA configuration saved successfully.");
            await queryClient.invalidateQueries({ queryKey: SLA_QUERY_KEY });
        },
    });

    function onSubmit(values: SlaFormValues) {
        setSuccessMessage("");
        const dirtyRowFlags = dirtyFields.rows ?? [];
        const changedRows = values.rows.filter((_, index) => {
            const flags = dirtyRowFlags[index];
            return flags && Object.values(flags).some(Boolean);
        });
        if (changedRows.length === 0) {
            setSuccessMessage("No changes to save.");
            return;
        }
        saveMutation.mutate(changedRows);
    }

    const loadErrorMessage = slaQuery.error ? (slaQuery.error as Error).message : "";
    const saveErrorMessage = saveMutation.error ? (saveMutation.error as Error).message : "";

    return (
        <div className="mx-auto max-w-6xl font-sans">
            <div className="mb-6">
                <div className="mb-1 text-sm font-medium text-slate-500">Admin &gt; SLA Configuration</div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">SLA Configuration</h1>
                <p className="mt-1 text-sm text-slate-500">Regulatory reporting deadlines by incident severity.</p>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <p className="text-sm font-semibold text-blue-700">External transmission is simulated; submission receipts and audit timestamps are stored internally.</p>
            </div>

            {(loadErrorMessage || saveErrorMessage) && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadErrorMessage || saveErrorMessage}</div>
            )}
            {successMessage && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                            <tr>
                                <th className="w-40 px-6 py-3">Severity</th>
                                <th className="px-6 py-3">External Report</th>
                                <th className="px-6 py-3">Deadline (hours)</th>
                                <th className="px-6 py-3">Regulatory Body</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {slaQuery.isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                        Loading SLA configuration...
                                    </td>
                                </tr>
                            ) : (
                                fields.map((field, index) => {
                                    const isRequired = watchedRows[index]?.externalReportRequired ?? false;
                                    const rowErrors = errors.rows?.[index];
                                    return (
                                        <tr key={field.id}>
                                            <td className="px-6 py-5">
                                                <Badge className={badgeClass(field.levelName)}>{field.levelName}</Badge>
                                            </td>
                                            <td className="px-6 py-5">
                                                <label className="inline-flex items-center gap-2 text-slate-700">
                                                    <input type="checkbox" {...register(`rows.${index}.externalReportRequired`)} />
                                                    {isRequired ? "Required" : "Not required"}
                                                </label>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    disabled={!isRequired}
                                                    {...register(`rows.${index}.slaWindowHrs`, { valueAsNumber: true })}
                                                />
                                                {rowErrors?.slaWindowHrs && <p className="mt-1 text-sm text-red-600">{rowErrors.slaWindowHrs.message}</p>}
                                            </td>
                                            <td className="px-6 py-5">
                                                <Input
                                                    disabled={!isRequired}
                                                    placeholder={isRequired ? "Regulatory authority" : "Not applicable"}
                                                    {...register(`rows.${index}.regulatoryBody`)}
                                                />
                                                {rowErrors?.regulatoryBody && <p className="mt-1 text-sm text-red-600">{rowErrors.regulatoryBody.message}</p>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6 pb-10">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => reset()}
                        disabled={saveMutation.isPending || !isDirty}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending || slaQuery.isLoading}>
                        {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
