import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { assessmentsService } from "../../services/assessments";
import { carePlansService } from "../../services/carePlans";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

const metrics = ["Bed Mobility", "Transfer", "Locomotion", "Dressing", "Eating", "Toilet Use", "Personal Hygiene", "Bathing"];

export default function ReassessmentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plansQuery = useQuery({ queryKey: ["care-plans-all"], queryFn: carePlansService.getAll });
    const [carePlanId, setCarePlanId] = useState(searchParams.get("carePlanId") ?? "");
    const [reason, setReason] = useState("");
    const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(metrics.map((metric) => [metric, 0])));
    const [clinicalNotes, setClinicalNotes] = useState("");
    const [goalsText, setGoalsText] = useState("");
    const [interventionsText, setInterventionsText] = useState("");
    useEffect(() => {
        if (!carePlanId && plansQuery.data?.[0]) setCarePlanId(plansQuery.data[0].id);
    }, [carePlanId, plansQuery.data]);
    const selectedPlan = plansQuery.data?.find((plan) => plan.id === carePlanId);
    const total = useMemo(() => Object.values(scores).reduce((sum, value) => sum + value, 0), [scores]);
    const mutation = useMutation({
        mutationFn: () => {
            if (!selectedPlan) throw new Error("Select a care plan.");
            return assessmentsService.createReassessment({
                residentId: selectedPlan.residentId,
                carePlanId,
                reason,
                clinicalNotes,
                metrics: metrics.map((metricName) => ({ category: "ADL", metricName, score: scores[metricName] ?? 0 })),
                goals: goalsText
                    .split("\n")
                    .filter(Boolean)
                    .map((description) => ({ description, status: "IN_PROGRESS" })),
                interventions: interventionsText
                    .split("\n")
                    .filter(Boolean)
                    .map((description) => ({ description, assignedRole: "Nurse (RN/LPN)" })),
            });
        },
        onSuccess: (result) => navigate(`/care-plans/${result.carePlan.id}/review`),
    });
    if (plansQuery.isLoading)
        return (
            <WorkflowPage title="Reassessment">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    return (
        <WorkflowPage
            breadcrumb="Care Planning  >  Reassessment"
            title="Care Plan Reassessment"
            description="Document a scheduled review or significant change and generate a new Pending Review care-plan version."
        >
            {mutation.error && (
                <div className="mb-4">
                    <Notice type="error">{String(mutation.error)}</Notice>
                </div>
            )}
            <div className="space-y-5">
                <Panel title="Reassessment Context">
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className={labelClassName}>
                            Current Care Plan *
                            <select className={fieldClassName} value={carePlanId} onChange={(event) => setCarePlanId(event.target.value)}>
                                {plansQuery.data?.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.resident?.firstName} {plan.resident?.lastName} · {plan.status}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={labelClassName}>
                            Reason for Reassessment *
                            <select className={fieldClassName} value={reason} onChange={(event) => setReason(event.target.value)}>
                                <option value="">Select reason...</option>
                                <option>Quarterly review due</option>
                                <option>Significant change in condition</option>
                                <option>Hospital return</option>
                                <option>Care team request</option>
                            </select>
                        </label>
                    </div>
                </Panel>
                <Panel title="Updated ADL Assessment" actions={<strong className="text-lg">Total: {total} / 32</strong>}>
                    <div className="grid gap-4 md:grid-cols-2">
                        {metrics.map((metric) => (
                            <label key={metric} className={labelClassName}>
                                {metric}
                                <select className={fieldClassName} value={scores[metric]} onChange={(event) => setScores({ ...scores, [metric]: Number(event.target.value) })}>
                                    {[0, 1, 2, 3, 4].map((score) => (
                                        <option key={score} value={score}>
                                            {score} — {["Independent", "Supervision", "Limited", "Extensive", "Total"][score]}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                </Panel>
                <div className="grid gap-5 lg:grid-cols-2">
                    <Panel title="Updated Goals" description="Enter one goal per line.">
                        <textarea
                            className={`${fieldClassName} min-h-36`}
                            value={goalsText}
                            onChange={(event) => setGoalsText(event.target.value)}
                            placeholder="Maintain safe transfer with one-person assist"
                        />
                    </Panel>
                    <Panel title="Updated Interventions" description="Enter one intervention per line.">
                        <textarea
                            className={`${fieldClassName} min-h-36`}
                            value={interventionsText}
                            onChange={(event) => setInterventionsText(event.target.value)}
                            placeholder="Assist with transfers using gait belt"
                        />
                    </Panel>
                </div>
                <Panel title="Clinical Notes">
                    <textarea className={`${fieldClassName} min-h-28`} value={clinicalNotes} onChange={(event) => setClinicalNotes(event.target.value)} />
                </Panel>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                <SecondaryButton onClick={() => navigate(-1)}>Cancel</SecondaryButton>
                <PrimaryButton disabled={!carePlanId || !reason || mutation.isPending} onClick={() => mutation.mutate()}>
                    {mutation.isPending ? "Submitting..." : "Submit for DON Review"}
                </PrimaryButton>
            </div>
        </WorkflowPage>
    );
}
