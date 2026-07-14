import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { incidentsService } from "../../services/incidents";
import { EmptyState, LoadingState, Notice, Panel, PrimaryButton, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";

const formatRemaining = (minutes: number) => {
    if (minutes < 0) return "OVERDUE";
    if (minutes < 60) return `${minutes}m left`;
    return `${Math.ceil(minutes / 60)}h left`;
};
const severityTone = (name: string) =>
    name.toLowerCase().includes("critical") ? "danger" : name.toLowerCase().includes("major") ? "warning" : name.toLowerCase().includes("moderate") ? "warning" : "neutral";

export default function IncidentList() {
    const navigate = useNavigate();
    const query = useQuery({ queryKey: ["incidents"], queryFn: incidentsService.getIncidents, refetchInterval: 60_000 });
    const [status, setStatus] = useState("ALL");
    const [search, setSearch] = useState("");
    const rows = useMemo(
        () =>
            (query.data ?? []).filter(
                (incident: any) =>
                    (status === "ALL" || incident.status === status) &&
                    (!search.trim() ||
                        incident.resident.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        incident.incidentType.toLowerCase().includes(search.toLowerCase())),
            ),
        [query.data, status, search],
    );
    return (
        <WorkflowPage
            breadcrumb="Incident & Risk"
            title="Incident List"
            description="Monitor active and historical incidents, chart status, and regulatory reporting deadlines."
            actions={<PrimaryButton onClick={() => navigate("/incidents/report")}>Report Incident</PrimaryButton>}
        >
            {query.error && (
                <div className="mb-4">
                    <Notice type="error">{String(query.error)}</Notice>
                </div>
            )}
            <Panel
                title="Incident Work Queue"
                actions={
                    <div className="flex flex-wrap gap-2">
                        <input
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Search resident or type"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option>ALL</option>
                            <option>OPEN</option>
                            <option>UNDER_INVESTIGATION</option>
                            <option>PENDING_REVIEW</option>
                            <option>RESOLVED</option>
                        </select>
                    </div>
                }
            >
                {query.isLoading ? (
                    <LoadingState />
                ) : !rows.length ? (
                    <EmptyState label="No incidents match the current filters." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Resident</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Severity</th>
                                    <th className="px-4 py-3">Reported</th>
                                    <th className="px-4 py-3">SLA Countdown</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Chart</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((incident: any) => (
                                    <tr key={incident.id}>
                                        <td className="px-4 py-4 font-semibold">
                                            {incident.resident.fullName}
                                            <span className="block text-xs font-normal text-slate-500">Room {incident.resident.roomNumber ?? "—"}</span>
                                        </td>
                                        <td className="px-4 py-4">{incident.incidentType}</td>
                                        <td className="px-4 py-4">
                                            <StatusBadge tone={severityTone(incident.severity.name) as any}>{incident.severity.name}</StatusBadge>
                                        </td>
                                        <td className="px-4 py-4">{new Date(incident.reportedAt).toLocaleString()}</td>
                                        <td
                                            className={`px-4 py-4 font-bold ${incident.isSlaOverdue ? "text-red-600" : incident.slaRemainingMinutes <= 24 * 60 ? "text-amber-700" : "text-emerald-700"}`}
                                        >
                                            {formatRemaining(incident.slaRemainingMinutes)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge tone={incident.status === "RESOLVED" ? "success" : "info"}>{incident.status.replaceAll("_", " ")}</StatusBadge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge tone={incident.resident.isChartLocked ? "danger" : "success"}>
                                                {incident.resident.isChartLocked ? "Locked" : "Unlocked"}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button className="font-semibold text-blue-600 hover:underline" onClick={() => navigate(`/incidents/${incident.id}`)}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>
        </WorkflowPage>
    );
}
