import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { incidentsService } from "../../services/incidents";
import { session } from "../../utils/session";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";

const formatRemaining = (minutes: number) => (minutes < 0 ? "OVERDUE" : minutes < 60 ? `${minutes}m remaining` : `${Math.ceil(minutes / 60)}h remaining`);

export default function IncidentDetail() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id = "" } = useParams();
    const user = session.getUser();
    const canManage = user?.roleName === "System Admin" || user?.roleName === "DON (Director of Nursing)";
    const query = useQuery({ queryKey: ["incident", id], queryFn: () => incidentsService.getIncidentById(id), enabled: Boolean(id), refetchInterval: 60_000 });
    const [investigation, setInvestigation] = useState({ rootCause: "", correctiveAction: "", preventiveAction: "", witnesses: "" });
    const [note, setNote] = useState("");
    const [resolution, setResolution] = useState("");
    const [followUpPlan, setFollowUpPlan] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    useEffect(() => {
        if (query.data?.investigation)
            setInvestigation({
                rootCause: query.data.investigation.rootCause ?? "",
                correctiveAction: query.data.investigation.correctiveAction ?? "",
                preventiveAction: query.data.investigation.preventiveAction ?? "",
                witnesses: (query.data.investigation.witnesses ?? []).join(", "),
            });
    }, [query.data]);
    const refresh = async () => {
        await queryClient.invalidateQueries({ queryKey: ["incident", id] });
        await queryClient.invalidateQueries({ queryKey: ["incidents"] });
    };
    const investigationMutation = useMutation({
        mutationFn: () =>
            incidentsService.updateInvestigation(id, {
                ...investigation,
                witnesses: investigation.witnesses
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                status: "UNDER_INVESTIGATION",
            }),
        onSuccess: async () => {
            setMessage("Root cause analysis and corrective actions saved.");
            await refresh();
        },
    });
    const noteMutation = useMutation({
        mutationFn: () => incidentsService.addProgressNote(id, note),
        onSuccess: async () => {
            setNote("");
            setMessage("Progress note added to the incident timeline.");
            await refresh();
        },
    });
    const reviewMutation = useMutation({
        mutationFn: () => incidentsService.requestDonReview(id),
        onSuccess: async () => {
            setMessage("Incident sent to the DON review queue.");
            await refresh();
        },
    });
    const resolveMutation = useMutation({
        mutationFn: () => incidentsService.resolve(id, { resolution, followUpPlan }),
        onSuccess: async () => {
            setMessage("Incident marked resolved.");
            await refresh();
        },
    });
    if (query.isLoading || !query.data)
        return (
            <WorkflowPage title="Incident Detail">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    const incident = query.data;
    const anyError = query.error ?? investigationMutation.error ?? noteMutation.error ?? reviewMutation.error ?? resolveMutation.error;
    const isNurseView = !canManage;
    const checklist = [
        { label: "Progress Notes logged", complete: incident.timeline?.some((item: any) => item.type === "INCIDENT_NOTE") },
        { label: "Chart Status", complete: !incident.resident.isChartLocked },
        { label: "External Report", complete: Boolean(incident.externalReport) },
    ];
    return (
        <WorkflowPage
            breadcrumb={`Incident & Risk  >  Incident List  >  #${incident.id}`}
            title={`Incident #${incident.id} — ${incident.resident.fullName}`}
            description={`${incident.incidentType} · ${incident.location} · Reported by ${incident.reporter.name} · ${new Date(incident.reportedAt).toLocaleString()}`}
        >
            {isNurseView && (
                <div className="mb-4">
                    <Notice type="info">Role: Nurse / CNA (documentation only). Chart unlock and incident resolution are DON-only actions.</Notice>
                </div>
            )}
            {message && (
                <div className="mb-4">
                    <Notice type="success">{message}</Notice>
                </div>
            )}
            {anyError && (
                <div className="mb-4">
                    <Notice type="error">{String(anyError)}</Notice>
                </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
                <div className="space-y-5">
                    <Panel title="Report Details (read-only)">
                        <dl className="grid gap-4 text-sm md:grid-cols-[160px_1fr]">
                            <dt className="font-semibold text-slate-500">Severity</dt>
                            <dd>
                                <StatusBadge tone={incident.severity.name.toLowerCase().includes("critical") ? "danger" : "warning"}>{incident.severity.name}</StatusBadge>
                            </dd>
                            <dt className="font-semibold text-slate-500">Location</dt>
                            <dd>{incident.location}</dd>
                            <dt className="font-semibold text-slate-500">Description</dt>
                            <dd>{incident.description}</dd>
                            <dt className="font-semibold text-slate-500">Immediate action</dt>
                            <dd>{incident.immediateAction || "Not documented"}</dd>
                            <dt className="font-semibold text-slate-500">Status</dt>
                            <dd>
                                <StatusBadge tone={incident.status === "RESOLVED" ? "success" : "info"}>{incident.status.replaceAll("_", " ")}</StatusBadge>
                            </dd>
                        </dl>
                    </Panel>
                    {canManage && (
                        <Panel title="Root Cause Analysis & Corrective Action" description="Editable only by authorized DON/Admin roles.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className={`${labelClassName} md:col-span-2`}>
                                    Root Cause
                                    <textarea
                                        className={`${fieldClassName} min-h-24`}
                                        value={investigation.rootCause}
                                        onChange={(event) => setInvestigation({ ...investigation, rootCause: event.target.value })}
                                    />
                                </label>
                                <label className={labelClassName}>
                                    Corrective Action
                                    <textarea
                                        className={`${fieldClassName} min-h-24`}
                                        value={investigation.correctiveAction}
                                        onChange={(event) => setInvestigation({ ...investigation, correctiveAction: event.target.value })}
                                    />
                                </label>
                                <label className={labelClassName}>
                                    Preventive Action
                                    <textarea
                                        className={`${fieldClassName} min-h-24`}
                                        value={investigation.preventiveAction}
                                        onChange={(event) => setInvestigation({ ...investigation, preventiveAction: event.target.value })}
                                    />
                                </label>
                                <label className={`${labelClassName} md:col-span-2`}>
                                    Witnesses (comma separated)
                                    <input
                                        className={fieldClassName}
                                        value={investigation.witnesses}
                                        onChange={(event) => setInvestigation({ ...investigation, witnesses: event.target.value })}
                                    />
                                </label>
                            </div>
                            <div className="mt-4 text-right">
                                <PrimaryButton disabled={investigationMutation.isPending} onClick={() => investigationMutation.mutate()}>
                                    Save Investigation
                                </PrimaryButton>
                            </div>
                        </Panel>
                    )}
                    <Panel title="Timeline">
                        <div className="space-y-0">
                            {incident.timeline?.map((event: any, index: number) => (
                                <div key={event.id} className="relative flex gap-4 pb-6">
                                    <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-blue-600 bg-white" />
                                    {index < incident.timeline.length - 1 && <div className="absolute top-4 left-[5px] h-full w-px bg-slate-200" />}
                                    <div>
                                        <p className="font-semibold text-slate-900">{event.description}</p>
                                        <p className="text-xs text-slate-500">
                                            {event.user} · {new Date(event.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Add Progress Note">
                        <textarea
                            className={`${fieldClassName} min-h-24`}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Document additional clinical observations or follow-up."
                        />
                        <div className="mt-4 text-right">
                            <PrimaryButton disabled={!note.trim() || noteMutation.isPending} onClick={() => noteMutation.mutate()}>
                                Add Progress Note
                            </PrimaryButton>
                        </div>
                    </Panel>
                </div>
                <div className="space-y-5">
                    <Panel title="SLA — Regulatory Reporting">
                        <p className={`text-2xl font-bold ${incident.isSlaOverdue ? "text-red-600" : "text-emerald-600"}`}>{formatRemaining(incident.slaRemainingMinutes)}</p>
                        <p className="mt-2 text-sm text-slate-500">Deadline: {new Date(incident.slaDeadline).toLocaleString()}</p>
                    </Panel>
                    <Panel title="Chart Status">
                        <StatusBadge tone={incident.resident.isChartLocked ? "danger" : "success"}>{incident.resident.isChartLocked ? "Locked" : "Unlocked"}</StatusBadge>
                    </Panel>
                    {!incident.resident.isChartLocked && canManage && (
                        <Panel title="Resolution Checklist">
                            <div className="space-y-3">
                                {checklist.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between text-sm">
                                        <span>{item.label}</span>
                                        <StatusBadge tone={item.complete ? "success" : "warning"}>{item.complete ? "Complete" : "Pending"}</StatusBadge>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    )}
                    <Panel title={canManage ? "DON Actions" : "Clinical Actions"}>
                        <div className="space-y-3">
                            {canManage ? (
                                <>
                                    <SecondaryButton className="w-full" onClick={() => navigate(`/incidents/${id}/external-report`)}>
                                        Submit External Report
                                    </SecondaryButton>
                                    <SecondaryButton
                                        className="w-full border-red-300 text-red-600"
                                        disabled={!incident.resident.isChartLocked}
                                        onClick={() => navigate(`/incidents/${id}/unlock`)}
                                    >
                                        Unlock Chart
                                    </SecondaryButton>
                                    <label className={labelClassName}>
                                        Resolution Summary
                                        <textarea className={`${fieldClassName} min-h-20`} value={resolution} onChange={(event) => setResolution(event.target.value)} />
                                    </label>
                                    <label className={labelClassName}>
                                        Follow-up Plan
                                        <textarea className={`${fieldClassName} min-h-20`} value={followUpPlan} onChange={(event) => setFollowUpPlan(event.target.value)} />
                                    </label>
                                    <PrimaryButton
                                        className="w-full"
                                        disabled={incident.resident.isChartLocked || !incident.externalReport || !resolution.trim() || resolveMutation.isPending}
                                        onClick={() => resolveMutation.mutate()}
                                    >
                                        Mark Resolved
                                    </PrimaryButton>
                                    {incident.resident.isChartLocked && <p className="text-xs text-slate-500">Unlock chart to enable resolution.</p>}
                                </>
                            ) : (
                                <>
                                    <PrimaryButton className="w-full" disabled={!note.trim() || noteMutation.isPending} onClick={() => noteMutation.mutate()}>
                                        Add Progress Note
                                    </PrimaryButton>
                                    <SecondaryButton className="w-full" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>
                                        Request DON Review
                                    </SecondaryButton>
                                    <p className="text-xs text-amber-700">Chart unlock and incident resolution are DON-only actions.</p>
                                </>
                            )}
                        </div>
                    </Panel>
                </div>
            </div>
        </WorkflowPage>
    );
}
