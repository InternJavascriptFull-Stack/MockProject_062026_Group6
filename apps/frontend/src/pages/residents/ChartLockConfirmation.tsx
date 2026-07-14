import { useMutation, useQuery } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { incidentsService } from "../../services/incidents";
import { LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

export default function ChartLockConfirmation() {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const query = useQuery({ queryKey: ["incident", id], queryFn: () => incidentsService.getIncidentById(id), enabled: Boolean(id) });
    const mutation = useMutation({ mutationFn: () => incidentsService.lockChart(id, "Incident investigation requires chart integrity"), onSuccess: () => query.refetch() });
    if (query.isLoading || !query.data)
        return (
            <WorkflowPage title="Chart Lock Confirmation">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    const incident = query.data;
    return (
        <WorkflowPage breadcrumb="Incident & Risk  >  Chart Lock" title="Chart Lock Confirmation" description={`Incident #${incident.id}`}>
            {(query.error || mutation.error) && (
                <div className="mb-4">
                    <Notice type="error">{String(query.error ?? mutation.error)}</Notice>
                </div>
            )}
            <div className="mx-auto max-w-3xl">
                <Panel>
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="mb-5 rounded-full bg-red-100 p-5 text-red-600">
                            <LockKeyhole className="h-12 w-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{incident.resident.isChartLocked ? "Resident chart locked successfully" : "Chart lock is required"}</h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                            The chart for <strong>{incident.resident.fullName}</strong> is {incident.resident.isChartLocked ? "locked" : "not yet locked"}. While locked, profile
                            edits, daily care logs, and clinical documentation are frozen until DON/Admin unlocks the chart.
                        </p>
                        <div className="mt-6 grid w-full gap-3 rounded-lg bg-slate-50 p-5 text-left text-sm sm:grid-cols-2">
                            <div>
                                <span className="text-slate-500">Incident ID</span>
                                <strong className="block text-slate-900">{incident.id}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500">System Timestamp</span>
                                <strong className="block text-slate-900">{new Date(incident.reportedAt).toLocaleString()}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Severity</span>
                                <strong className="block text-slate-900">{incident.severity.name}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Chart Status</span>
                                <strong className="block text-red-600">{incident.resident.isChartLocked ? "LOCKED" : "UNLOCKED"}</strong>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            {!incident.resident.isChartLocked && (
                                <PrimaryButton disabled={mutation.isPending} onClick={() => mutation.mutate()}>
                                    {mutation.isPending ? "Locking..." : "Confirm Lock"}
                                </PrimaryButton>
                            )}
                            <SecondaryButton onClick={() => navigate(`/incidents/${id}`)}>Open Incident Detail</SecondaryButton>
                        </div>
                    </div>
                </Panel>
            </div>
        </WorkflowPage>
    );
}
