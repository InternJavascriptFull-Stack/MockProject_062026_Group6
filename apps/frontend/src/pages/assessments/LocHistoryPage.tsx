import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import { EmptyState, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";
import { assessmentsService, type LocHistoryItem } from "../../services/assessments";
import { residentsService } from "../../services/residents";

function escapeCsv(value: unknown): string {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(items: LocHistoryItem[], residentName: string) {
    const header = ["Level of Care", "Code", "Daily Rate", "Start Date", "End Date", "Authorized By", "Authorized At", "Override", "Override Reason"];
    const rows = items.map((item) => [
        item.careLevel.name,
        item.careLevel.code,
        item.dailyRate ?? "",
        item.startDate,
        item.endDate ?? "Current",
        item.authorizedBy ?? "",
        item.authorizedAt ?? "",
        item.isOverride ? "Yes" : "No",
        item.overrideReason ?? "",
    ]);
    const content = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${residentName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-loc-history.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
}

export default function LocHistoryPage() {
    const { residentId = "" } = useParams();
    const residentQuery = useQuery({
        queryKey: ["resident", residentId],
        queryFn: () => residentsService.getById(residentId),
        enabled: Boolean(residentId),
    });
    const query = useQuery({
        queryKey: ["loc-history", residentId],
        queryFn: () => assessmentsService.getLocHistory(residentId),
        enabled: Boolean(residentId),
    });
    const residentName = residentQuery.data?.fullName ?? "resident";

    return (
        <WorkflowPage
            breadcrumb="Residents  >  LOC History"
            title="Level of Care History"
            description={`${residentName} · Effective-dated LOC assignments from intake and reassessments.`}
        >
            {query.error && (
                <div className="mb-4">
                    <Notice type="error">{String(query.error)}</Notice>
                </div>
            )}
            <Panel
                actions={
                    <div className="flex gap-2">
                        <SecondaryButton onClick={() => window.print()} disabled={!query.data?.length}>
                            <Printer className="h-4 w-4" /> Print
                        </SecondaryButton>
                        <PrimaryButton onClick={() => downloadCsv(query.data ?? [], residentName)} disabled={!query.data?.length}>
                            <Download className="h-4 w-4" /> Export CSV
                        </PrimaryButton>
                    </div>
                }
            >
                {query.isLoading ? (
                    <LoadingState />
                ) : !query.data?.length ? (
                    <EmptyState label="No confirmed LOC history exists for this resident." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[960px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Level of Care</th>
                                    <th className="px-4 py-3">Daily Rate</th>
                                    <th className="px-4 py-3">Start Date</th>
                                    <th className="px-4 py-3">End Date</th>
                                    <th className="px-4 py-3">Authorized By</th>
                                    <th className="px-4 py-3">Override</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {query.data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4 font-semibold">
                                            {item.careLevel.name}
                                            <span className="ml-2 text-xs font-normal text-slate-400">{item.careLevel.code}</span>
                                        </td>
                                        <td className="px-4 py-4">{item.dailyRate == null ? "—" : `$${item.dailyRate.toFixed(2)}`}</td>
                                        <td className="px-4 py-4">{item.startDate}</td>
                                        <td className="px-4 py-4">{item.endDate ?? "Current"}</td>
                                        <td className="px-4 py-4">
                                            {item.authorizedBy ?? "Legacy record"}
                                            {item.authorizedAt && <span className="block text-xs text-slate-400">{new Date(item.authorizedAt).toLocaleString()}</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            {item.isOverride ? (
                                                <details>
                                                    <summary className="cursor-pointer font-semibold text-amber-700">Overridden</summary>
                                                    <p className="mt-2 max-w-xs text-xs text-slate-600">{item.overrideReason}</p>
                                                </details>
                                            ) : (
                                                "No"
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge tone={item.active ? "success" : "neutral"}>{item.active ? "Active" : "Historical"}</StatusBadge>
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
