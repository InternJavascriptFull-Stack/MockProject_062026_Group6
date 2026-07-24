import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, FileText, CheckCircle2 } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { incidentsService } from "../../services/incidents";
import { session } from "../../utils/session";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

const formatRemaining = (minutes: number) => (minutes < 0 ? "OVERDUE" : minutes < 60 ? `${minutes}m remaining` : `${Math.ceil(minutes / 60)}h remaining`);

export default function IncidentDetail({ forceShowModal }: { forceShowModal?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { id = "" } = useParams();
    const user = session.getUser();

    const isUnlockRoute = location.pathname.endsWith("/unlock") || forceShowModal;
    const [showUnlockModal, setShowUnlockModal] = useState(isUnlockRoute);

    useEffect(() => {
        if (isUnlockRoute) {
            setShowUnlockModal(true);
        }
    }, [isUnlockRoute]);

    const canManage = user?.roleName === "System Admin" || user?.roleName === "DON (Director of Nursing)" || user?.roleName === "Administrator";
    const query = useQuery({ queryKey: ["incident", id], queryFn: () => incidentsService.getIncidentById(id), enabled: Boolean(id), refetchInterval: 60_000 });

    const [investigation, setInvestigation] = useState({ rootCause: "", correctiveAction: "", preventiveAction: "", witnesses: "" });
    const [note, setNote] = useState("");
    const [resolution, setResolution] = useState("");
    const [followUpPlan, setFollowUpPlan] = useState("");
    const [unlockReason, setUnlockReason] = useState("Physician order clarification needed; DON approved temporary unlock for addendum entry.");
    const [unlockPassword, setUnlockPassword] = useState("••••••••");
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

    const unlockMutation = useMutation({
        mutationFn: () => incidentsService.unlockChart(id, unlockReason, unlockPassword),
        onSuccess: async () => {
            setMessage("Resident chart unlocked successfully.");
            setShowUnlockModal(false);
            if (isUnlockRoute) {
                navigate(`/incidents/${id}`);
            }
            await refresh();
        },
    });

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
    const anyError = query.error ?? unlockMutation.error ?? investigationMutation.error ?? noteMutation.error ?? reviewMutation.error ?? resolveMutation.error;
    const isNurseView = !canManage;

    const lockedTime = incident.reportedAt ? new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "09:22";
    const lockedDateStr = incident.reportedAt ? new Date(incident.reportedAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "07/03/2026";

    return (
        <WorkflowPage
            breadcrumb={`Incident & Risk  >  Incident List  >  #INC-${incident.id}`}
            title={
                <div className="flex items-center gap-3 flex-wrap">
                    <span>Incident #INC-{incident.id} — {incident.resident.fullName}</span>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                        {incident.status === "RESOLVED" ? "Resolved" : "Open"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-0.5 text-xs font-semibold text-orange-800 border border-orange-200">
                        {incident.severity.name || "Major"}
                    </span>
                </div>
            }
            description={`${incident.incidentType || "Fall"} · ${incident.location || "Room 204B"} · Reported by ${incident.reporter.name || "Anna Lee, RN"} · ${new Date(incident.reportedAt).toLocaleString()}`}
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

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                    <Panel title="Report Details (read-only)">
                        <dl className="grid gap-4 text-sm md:grid-cols-[140px_1fr]">
                            <dt className="font-semibold text-slate-500">Location</dt>
                            <dd className="text-slate-900">{incident.location || "Room 204B — bathroom"}</dd>

                            <dt className="font-semibold text-slate-500">Description</dt>
                            <dd className="text-slate-900">{incident.description || "Resident found on floor next to bed after attempting to stand unassisted."}</dd>

                            <dt className="font-semibold text-slate-500">Witnesses</dt>
                            <dd className="text-slate-900">{investigation.witnesses || "Marcus Rivera, CNA"}</dd>

                            <dt className="font-semibold text-slate-500">Immediate action</dt>
                            <dd className="text-slate-900">{incident.immediateAction || "Assisted resident back to bed, checked vitals."}</dd>
                        </dl>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Attachments (simulated)</p>
                            <div className="flex flex-wrap gap-2">
                                <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                                    incident_form_signed.pdf
                                </button>
                                <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                                    vitals_log.pdf
                                </button>
                            </div>
                        </div>
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
                                        placeholder="Identify physical or environmental contributing factors..."
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
                        <div className="space-y-4 relative pl-2">
                            <div className="relative flex gap-3.5 items-start">
                                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Chart auto-locked (BR-07)</p>
                                    <p className="text-xs text-slate-500">System · {lockedDateStr} {lockedTime}</p>
                                </div>
                            </div>
                            <div className="relative flex gap-3.5 items-start">
                                <div className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-slate-400 bg-white" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">DON notified · SLA countdown started</p>
                                    <p className="text-xs text-slate-500">System · {lockedDateStr} 09:20</p>
                                </div>
                            </div>
                            <div className="relative flex gap-3.5 items-start">
                                <div className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-slate-400 bg-white" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Incident reported</p>
                                    <p className="text-xs text-slate-500">{incident.reporter.name || "Anna Lee, RN"} · {lockedDateStr} 09:15</p>
                                </div>
                            </div>
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
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">SLA — Regulatory Reporting</p>
                        </div>
                        <p className="mt-2 text-3xl font-extrabold text-emerald-700">{formatRemaining(incident.slaRemainingMinutes ?? 840)}</p>
                        <p className="mt-1 text-xs font-medium text-emerald-900">Report by {new Date(incident.slaDeadline ?? Date.now() + 14 * 3600 * 1000).toLocaleString()}</p>
                        <p className="mt-2 text-[11px] text-emerald-700">Major 24–48h regulatory window</p>
                    </div>

                    <Panel title="Chart Status">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${incident.resident.isChartLocked ? "bg-red-100 text-red-700 border border-red-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                                <Lock className="h-3.5 w-3.5" />
                                {incident.resident.isChartLocked ? "Locked" : "Unlocked"}
                            </span>
                            {incident.resident.isChartLocked && (
                                <span className="text-xs text-slate-500">since {lockedTime}</span>
                            )}
                        </div>
                    </Panel>

                    <Panel title={canManage ? "Incident Actions" : "Clinical Actions"}>
                        <div className="space-y-3">
                            {canManage ? (
                                <>
                                    <SecondaryButton className="w-full justify-center" onClick={() => setNote("Progress note draft...")}>
                                        Add Progress Note
                                    </SecondaryButton>
                                    <SecondaryButton className="w-full justify-center" onClick={() => navigate(`/incidents/${id}/external-report`)}>
                                        Submit External Report
                                    </SecondaryButton>
                                    <button
                                        type="button"
                                        disabled={!incident.resident.isChartLocked}
                                        onClick={() => setShowUnlockModal(true)}
                                        className="w-full rounded-xl border border-red-300 bg-white py-2.5 px-4 text-center text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors shadow-xs"
                                    >
                                        Unlock Chart
                                    </button>
                                    <div className="border-t border-slate-100 pt-3">
                                        <label className={labelClassName}>
                                            Resolution Summary
                                            <textarea className={`${fieldClassName} min-h-16 text-xs`} value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Summarize findings..." />
                                        </label>
                                    </div>
                                    <PrimaryButton
                                        className="w-full justify-center"
                                        disabled={incident.resident.isChartLocked || !incident.externalReport || !resolution.trim() || resolveMutation.isPending}
                                        onClick={() => resolveMutation.mutate()}
                                    >
                                        Mark Resolved
                                    </PrimaryButton>
                                    {incident.resident.isChartLocked && <p className="text-center text-xs text-slate-400">Unlock chart to enable (UC-M7-10).</p>}
                                </>
                            ) : (
                                <>
                                    <PrimaryButton className="w-full justify-center" disabled={!note.trim() || noteMutation.isPending} onClick={() => noteMutation.mutate()}>
                                        Add Progress Note
                                    </PrimaryButton>
                                    <SecondaryButton className="w-full justify-center" disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>
                                        Request DON Review
                                    </SecondaryButton>
                                    <p className="text-xs text-amber-700">Chart unlock and incident resolution are DON-only actions.</p>
                                </>
                            )}
                        </div>
                    </Panel>
                </div>
            </div>

            {/* UNLOCK RESIDENT CHART MODAL OVERLAY */}
            {showUnlockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Unlock Resident Chart</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Restores edit access to {incident.resident.fullName}'s chart across M1 / M2 / M3 (LC-06).
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs">
                                <Lock className="h-5 w-5 text-slate-700" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">Locked since {lockedDateStr} {lockedTime}</p>
                                <p className="text-xs text-slate-500">Incident #INC-{incident.id} (BR-07)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-800">
                                    Reason for unlock <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full min-h-[90px] rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                                    value={unlockReason}
                                    onChange={(e) => setUnlockReason(e.target.value)}
                                    placeholder="Physician order clarification needed; DON approved temporary unlock for addendum entry."
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-800">
                                    Re-enter password to confirm
                                </label>
                                <input
                                    type="password"
                                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                                    value={unlockPassword}
                                    onChange={(e) => setUnlockPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="text-xs text-slate-600 space-y-0.5">
                            <p className="font-semibold text-slate-800">{user ? `${user.firstName} ${user.lastName}` : "Denise Carter"}, DON · signing this override.</p>
                            <p className="text-slate-400">Recorded immutably in the audit log (NFR-02).</p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUnlockModal(false);
                                    if (isUnlockRoute) navigate(`/incidents/${id}`);
                                }}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!unlockReason.trim() || unlockMutation.isPending}
                                onClick={() => unlockMutation.mutate()}
                                className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {unlockMutation.isPending ? "Unlocking..." : "Unlock & Sign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </WorkflowPage>
    );
}
