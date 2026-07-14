import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";
import { incidentSeverityService, type IncidentSeverityDTO } from "@/services/incidentSeverity";

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
    Minor: "Low-risk event with no injury or clinical intervention required.",
    Moderate: "Injury requiring minor treatment without hospitalization.",
    Major: "Significant injury requiring clinical treatment or hospitalization.",
    Critical: "Life-threatening event requiring emergency intervention.",
};

function badgeClass(levelName: string): string {
    const normalized = levelName.toLowerCase();
    if (normalized === "critical") return "bg-red-100 text-red-700 border-red-300";
    if (normalized === "major") return "bg-orange-100 text-orange-700 border-orange-300";
    if (normalized === "moderate") return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-slate-100 text-slate-600 border-slate-300";
}

export default function IncidentSeverityLevels() {
    const [levels, setLevels] = useState<IncidentSeverityDTO[]>([]);
    const [originalLevels, setOriginalLevels] = useState<IncidentSeverityDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        void loadLevels();
    }, []);

    async function loadLevels() {
        setIsLoading(true);
        setError("");
        try {
            const data = await incidentSeverityService.getAll();
            const normalized = data.map((level) => ({
                ...level,
                description: level.description ?? DEFAULT_DESCRIPTIONS[level.levelName] ?? "",
            }));
            setLevels(normalized);
            setOriginalLevels(normalized);
        } catch (loadError) {
            setError((loadError as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    function updateDescription(id: number, description: string) {
        setLevels((current) => current.map((level) => (level.id === id ? { ...level, description } : level)));
    }

    async function saveChanges() {
        setIsSaving(true);
        setMessage("");
        setError("");
        try {
            const changedLevels = levels.filter((level) => {
                const original = originalLevels.find((item) => item.id === level.id);
                return original?.description !== level.description;
            });
            await Promise.all(
                changedLevels.map((level) =>
                    incidentSeverityService.update(level.id, {
                        description: level.description,
                    }),
                ),
            );
            setOriginalLevels(levels);
            setMessage("Incident severity descriptions saved successfully.");
        } catch (saveError) {
            setError((saveError as Error).message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-6xl font-sans">
            <div className="mb-6">
                <div className="mb-1 text-sm font-medium text-slate-500">Admin &gt; Incident Severity</div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Incident Severity Levels</h1>
                <p className="mt-1 text-sm text-slate-500">Fixed four-level taxonomy used by the incident workflow.</p>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <p className="text-sm font-semibold text-blue-700">Only descriptions are editable. Lock behavior remains controlled by the configured severity tier.</p>
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                        <tr>
                            <th className="w-40 px-6 py-3">Level</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="w-40 px-6 py-3">Chart Lock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                                    Loading severity configuration...
                                </td>
                            </tr>
                        ) : (
                            levels.map((level) => (
                                <tr key={level.id}>
                                    <td className="px-6 py-5">
                                        <Badge className={badgeClass(level.levelName)}>{level.levelName}</Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Input value={level.description ?? ""} onChange={(event) => updateDescription(level.id, event.target.value)} />
                                    </td>
                                    <td className="px-6 py-5 font-medium text-slate-700">{level.chartLockTrigger ? "Triggered" : "Not triggered"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6 pb-10">
                <Button type="button" variant="outline" onClick={() => setLevels(originalLevels)} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="button" onClick={() => void saveChanges()} disabled={isSaving || isLoading}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
