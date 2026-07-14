import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage, fieldClassName, labelClassName } from "../../components/workflow/WorkflowUi";
import { carePlansService, type CarePlanDetail } from "../../services/carePlans";

export function IdtAcknowledgmentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [carePlan, setCarePlan] = useState<CarePlanDetail | null>(null);
    const [notes, setNotes] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        void carePlansService
            .getById(id)
            .then(setCarePlan)
            .catch((loadError) => setError((loadError as Error).message));
    }, [id]);

    async function acknowledge() {
        if (!id || !confirmed) {
            setError("Confirm that you reviewed the care plan before signing.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await carePlansService.acknowledge(id, notes.trim() || undefined);
            navigate(`/care-plans/${id}`);
        } catch (submitError) {
            setError((submitError as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (error && !carePlan)
        return (
            <WorkflowPage title="IDT Acknowledgment">
                <Notice type="error">{error}</Notice>
            </WorkflowPage>
        );
    if (!carePlan)
        return (
            <WorkflowPage title="IDT Acknowledgment">
                <LoadingState label="Loading clinical overview..." />
            </WorkflowPage>
        );

    return (
        <WorkflowPage
            breadcrumb="Care Planning > IDT Acknowledgment"
            title={`IDT Acknowledgment — ${carePlan.resident?.firstName ?? ""} ${carePlan.resident?.lastName ?? ""}`}
            description="Review the read-only clinical overview and record your immutable acknowledgment timestamp."
        >
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <div className="space-y-5">
                    {error && <Notice type="error">{error}</Notice>}
                    <Panel title="Clinical Overview">
                        <dl className="grid gap-4 text-sm md:grid-cols-2">
                            <div>
                                <dt className="font-semibold text-slate-500">Confirmed LOC</dt>
                                <dd className="mt-1 text-slate-900">{carePlan.activeCareLevel?.name ?? "Not confirmed"}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-slate-500">Plan Status</dt>
                                <dd className="mt-1 text-slate-900">{carePlan.status}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-slate-500">Room</dt>
                                <dd className="mt-1 text-slate-900">{carePlan.resident?.roomNumber ?? "Unassigned"}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-slate-500">Signatures</dt>
                                <dd className="mt-1 text-slate-900">{carePlan.signatures.length}</dd>
                            </div>
                        </dl>
                    </Panel>
                    <Panel title="Goals and Interventions">
                        <div className="space-y-5 text-sm text-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900">Care Goals</h3>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    {carePlan.goals.map((goal) => (
                                        <li key={goal.id}>{goal.description}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Interventions</h3>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    {carePlan.interventions.map((item) => (
                                        <li key={item.id}>
                                            {item.description} — {item.assignedRole}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Panel>
                </div>

                <Panel title="Your Acknowledgment" description="The acknowledgment is recorded once for each team member.">
                    <label className={labelClassName}>
                        Notes
                        <textarea className={`${fieldClassName} min-h-28`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional IDT notes" />
                    </label>
                    <label className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />I reviewed the resident's LOC, care
                        goals, interventions, and assigned tasks and acknowledge this care plan.
                    </label>
                    <div className="mt-5 space-y-3">
                        <PrimaryButton className="w-full" type="button" disabled={isSubmitting} onClick={() => void acknowledge()}>
                            {isSubmitting ? "Recording..." : "Acknowledge and e-Sign"}
                        </PrimaryButton>
                        <SecondaryButton className="w-full" type="button" onClick={() => navigate(`/care-plans/${carePlan.id}`)}>
                            Cancel
                        </SecondaryButton>
                    </div>
                </Panel>
            </div>
        </WorkflowPage>
    );
}
