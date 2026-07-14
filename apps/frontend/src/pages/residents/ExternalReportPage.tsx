import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { incidentsService } from "../../services/incidents";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

export default function ExternalReportPage() {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const query = useQuery({ queryKey: ["incident", id], queryFn: () => incidentsService.getIncidentById(id), enabled: Boolean(id) });
    const [form, setForm] = useState({
        agency: "State Department of Public Health",
        referenceNumber: "",
        submittedAt: new Date().toISOString().slice(0, 16),
        passwordConfirm: "",
        notes: "",
    });
    const mutation = useMutation({ mutationFn: () => incidentsService.submitExternalReport(id, form), onSuccess: () => navigate(`/incidents/${id}`) });
    if (query.isLoading || !query.data)
        return (
            <WorkflowPage title="Submit External Report">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    const incident = query.data;
    return (
        <WorkflowPage
            breadcrumb={`Incident & Risk  >  #${id}  >  External Report`}
            title="Submit External Regulatory Report"
            description="Review the complete incident file and authorize transmission with your account credentials."
        >
            {(query.error || mutation.error) && (
                <div className="mb-4">
                    <Notice type="error">{String(query.error ?? mutation.error)}</Notice>
                </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-5">
                    <Panel title="Incident File Preview">
                        <dl className="grid gap-4 text-sm md:grid-cols-[170px_1fr]">
                            <dt className="font-semibold text-slate-500">Resident</dt>
                            <dd>{incident.resident.fullName}</dd>
                            <dt className="font-semibold text-slate-500">Incident</dt>
                            <dd>
                                {incident.incidentType} · {incident.severity.name}
                            </dd>
                            <dt className="font-semibold text-slate-500">Reported</dt>
                            <dd>
                                {new Date(incident.reportedAt).toLocaleString()} by {incident.reporter.name}
                            </dd>
                            <dt className="font-semibold text-slate-500">Description</dt>
                            <dd>{incident.description}</dd>
                            <dt className="font-semibold text-slate-500">Root Cause</dt>
                            <dd>{incident.investigation.rootCause || "Not documented"}</dd>
                            <dt className="font-semibold text-slate-500">Corrective Action</dt>
                            <dd>{incident.investigation.correctiveAction || "Not documented"}</dd>
                        </dl>
                    </Panel>
                    <Panel title="Timeline Summary">
                        <ul className="space-y-3 text-sm">
                            {incident.timeline.map((item: any) => (
                                <li key={item.id} className="rounded-lg bg-slate-50 p-3">
                                    <strong>{item.description}</strong>
                                    <span className="block text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </div>
                <Panel title="Authorization & Transmission">
                    <div className="space-y-4">
                        <label className={labelClassName}>
                            Regulatory Agency *<input className={fieldClassName} value={form.agency} onChange={(event) => setForm({ ...form, agency: event.target.value })} />
                        </label>
                        <label className={labelClassName}>
                            Reference Number
                            <input
                                className={fieldClassName}
                                value={form.referenceNumber}
                                onChange={(event) => setForm({ ...form, referenceNumber: event.target.value })}
                                placeholder="Auto-generated when blank"
                            />
                        </label>
                        <label className={labelClassName}>
                            Submission Date / Time *
                            <input
                                className={fieldClassName}
                                type="datetime-local"
                                value={form.submittedAt}
                                onChange={(event) => setForm({ ...form, submittedAt: event.target.value })}
                            />
                        </label>
                        <label className={labelClassName}>
                            Notes
                            <textarea className={`${fieldClassName} min-h-20`} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                        </label>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <label className={labelClassName}>
                                E-sign Password *
                                <input
                                    className={fieldClassName}
                                    type="password"
                                    value={form.passwordConfirm}
                                    onChange={(event) => setForm({ ...form, passwordConfirm: event.target.value })}
                                    autoComplete="current-password"
                                />
                            </label>
                            <p className="mt-2 text-xs text-amber-700">Your password authorizes the submission and creates an immutable audit entry.</p>
                        </div>
                        <PrimaryButton className="w-full" disabled={!form.agency.trim() || !form.passwordConfirm || mutation.isPending} onClick={() => mutation.mutate()}>
                            {mutation.isPending ? "Submitting..." : "Authorize & Submit Report"}
                        </PrimaryButton>
                        <SecondaryButton className="w-full" onClick={() => navigate(-1)}>
                            Cancel
                        </SecondaryButton>
                    </div>
                </Panel>
            </div>
        </WorkflowPage>
    );
}
