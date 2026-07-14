import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";
import { slaConfigService, type SlaConfigDTO } from "@/services/slaConfig";

function badgeClass(levelName: string): string {
    const normalized = levelName.toLowerCase();
    if (normalized === "critical") return "bg-red-100 text-red-700 border-red-300";
    if (normalized === "major") return "bg-orange-100 text-orange-700 border-orange-300";
    if (normalized === "moderate") return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-slate-100 text-slate-600 border-slate-300";
}

export default function SlaConfiguration() {
    const [rows, setRows] = useState<SlaConfigDTO[]>([]);
    const [originalRows, setOriginalRows] = useState<SlaConfigDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        void loadRows();
    }, []);

    async function loadRows() {
        setIsLoading(true);
        setError("");
        try {
            const data = await slaConfigService.getAll();
            setRows(data);
            setOriginalRows(data);
        } catch (loadError) {
            setError((loadError as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    function updateRow(id: number, patch: Partial<SlaConfigDTO>) {
        setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }

    async function saveChanges() {
        setIsSaving(true);
        setMessage("");
        setError("");
        try {
            const changedRows = rows.filter((row) => {
                const original = originalRows.find((item) => item.id === row.id);
                return JSON.stringify(original) !== JSON.stringify(row);
            });
            await Promise.all(
                changedRows.map((row) =>
                    slaConfigService.update(row.id, {
                        slaWindowHrs: row.slaWindowHrs,
                        externalReportRequired: row.externalReportRequired,
                        regulatoryBody: row.regulatoryBody,
                    }),
                ),
            );
            setOriginalRows(rows);
            setMessage("SLA configuration saved successfully.");
        } catch (saveError) {
            setError((saveError as Error).message);
        } finally {
            setIsSaving(false);
        }
    }

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

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

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
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                    Loading SLA configuration...
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-6 py-5">
                                        <Badge className={badgeClass(row.severity.levelName)}>{row.severity.levelName}</Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <label className="inline-flex items-center gap-2 text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={row.externalReportRequired}
                                                onChange={(event) => updateRow(row.id, { externalReportRequired: event.target.checked })}
                                            />
                                            {row.externalReportRequired ? "Required" : "Not required"}
                                        </label>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Input
                                            type="number"
                                            min={0}
                                            disabled={!row.externalReportRequired}
                                            value={row.slaWindowHrs}
                                            onChange={(event) => updateRow(row.id, { slaWindowHrs: Number(event.target.value) })}
                                        />
                                    </td>
                                    <td className="px-6 py-5">
                                        <Input
                                            disabled={!row.externalReportRequired}
                                            value={row.regulatoryBody ?? ""}
                                            onChange={(event) => updateRow(row.id, { regulatoryBody: event.target.value })}
                                            placeholder={row.externalReportRequired ? "Regulatory authority" : "Not applicable"}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6 pb-10">
                <Button type="button" variant="outline" onClick={() => setRows(originalRows)} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="button" onClick={() => void saveChanges()} disabled={isSaving || isLoading}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
