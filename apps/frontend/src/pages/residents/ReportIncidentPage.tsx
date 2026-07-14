import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { incidentSeverityService } from "../../services/incidentSeverity";
import { incidentsService } from "../../services/incidents";
import { residentsService } from "../../services/residents";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

const incidentTypes = ["Fall", "Medication Error", "Elopement", "Abuse Allegation", "Injury", "Behavioral Event", "Other"];

export default function ReportIncidentPage() {
    const navigate = useNavigate();
    const residentsQuery = useQuery({ queryKey: ["resident-options"], queryFn: () => residentsService.getAll() });
    const severityQuery = useQuery({ queryKey: ["incident-severities"], queryFn: incidentSeverityService.getAll });
    const [form, setForm] = useState({
        residentId: "",
        incidentType: "Fall",
        severityId: "",
        occurredAt: new Date().toISOString().slice(0, 16),
        location: "",
        description: "",
        witnesses: "",
        immediateAction: "",
    });
    const selectedResidentId = form.residentId || residentsQuery.data?.[0]?.id || "";
    const selectedSeverityId = form.severityId || String(severityQuery.data?.[0]?.id ?? "");
    const requiredComplete = Boolean(
        selectedResidentId && selectedSeverityId && form.incidentType && form.occurredAt && form.location.trim() && form.description.trim() && form.immediateAction.trim(),
    );
    const mutation = useMutation({
        mutationFn: () => incidentsService.create({ ...form, residentId: selectedResidentId, severityId: Number(selectedSeverityId), notifyDon: true }),
        onSuccess: (result) => {
            const incident = result.data;
            navigate(incident.resident.isChartLocked ? `/incidents/${incident.id}/lock-confirm` : `/incidents/${incident.id}`);
        },
    });
    if (residentsQuery.isLoading || severityQuery.isLoading)
        return (
            <WorkflowPage title="Report New Incident">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    return (
        <WorkflowPage
            breadcrumb="Incident & Risk  >  Report Incident"
            title="Report New Incident"
            description="Complete all required fields. Severity configuration determines the SLA and chart-lock workflow."
        >
            {mutation.error && (
                <div className="mb-4">
                    <Notice type="error">{String(mutation.error)}</Notice>
                </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
                <Panel title="Incident Details">
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className={labelClassName}>
                            Resident *
                            <select className={fieldClassName} value={selectedResidentId} onChange={(event) => setForm({ ...form, residentId: event.target.value })}>
                                {residentsQuery.data?.map((resident) => (
                                    <option key={resident.id} value={resident.id}>
                                        {resident.fullName} · Room {resident.roomNumber ?? "—"}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={labelClassName}>
                            Incident Type *
                            <select className={fieldClassName} value={form.incidentType} onChange={(event) => setForm({ ...form, incidentType: event.target.value })}>
                                {incidentTypes.map((type) => (
                                    <option key={type}>{type}</option>
                                ))}
                            </select>
                        </label>
                        <label className={labelClassName}>
                            Severity *
                            <select className={fieldClassName} value={selectedSeverityId} onChange={(event) => setForm({ ...form, severityId: event.target.value })}>
                                {severityQuery.data?.map((severity: any) => (
                                    <option key={severity.id} value={severity.id}>
                                        {severity.levelName}
                                        {severity.chartLockTrigger ? " · chart lock" : ""}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={labelClassName}>
                            Date / Time of Incident *
                            <input
                                className={fieldClassName}
                                type="datetime-local"
                                value={form.occurredAt}
                                onChange={(event) => setForm({ ...form, occurredAt: event.target.value })}
                            />
                        </label>
                        <label className={`${labelClassName} md:col-span-2`}>
                            Location *
                            <input
                                className={fieldClassName}
                                value={form.location}
                                onChange={(event) => setForm({ ...form, location: event.target.value })}
                                placeholder="Room 204B — bathroom"
                            />
                        </label>
                        <label className={`${labelClassName} md:col-span-2`}>
                            Description *
                            <textarea
                                className={`${fieldClassName} min-h-28`}
                                value={form.description}
                                onChange={(event) => setForm({ ...form, description: event.target.value })}
                            />
                        </label>
                        <label className={`${labelClassName} md:col-span-2`}>
                            Witnesses (optional)
                            <input className={fieldClassName} value={form.witnesses} onChange={(event) => setForm({ ...form, witnesses: event.target.value })} />
                        </label>
                        <label className={`${labelClassName} md:col-span-2`}>
                            Immediate Action Taken *
                            <textarea
                                className={`${fieldClassName} min-h-24`}
                                value={form.immediateAction}
                                onChange={(event) => setForm({ ...form, immediateAction: event.target.value })}
                            />
                        </label>
                    </div>
                </Panel>
                <div className="space-y-5">
                    <Panel title="Reporting Party">
                        <p className="font-bold text-slate-900">Captured from current login</p>
                        <p className="mt-2 text-sm text-slate-500">Immutable report timestamp: {new Date().toLocaleString()}</p>
                    </Panel>
                    <Panel title="What happens next">
                        <ol className="space-y-2 text-sm text-slate-600">
                            <li>1. Severity and SLA policy are evaluated.</li>
                            <li>2. DON/Admin is notified.</li>
                            <li>3. Critical chart-lock policy is applied.</li>
                            <li>4. Incident enters the review queue.</li>
                        </ol>
                    </Panel>
                    <Notice type="warning">High-severity incidents can automatically lock the resident chart until DON review is complete.</Notice>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                <SecondaryButton onClick={() => navigate(-1)}>Cancel</SecondaryButton>
                <PrimaryButton disabled={!requiredComplete || mutation.isPending} onClick={() => mutation.mutate()}>
                    {mutation.isPending ? "Reporting..." : "Report Incident"}
                </PrimaryButton>
            </div>
        </WorkflowPage>
    );
}
