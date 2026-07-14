import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage, fieldClassName, labelClassName } from "../../components/workflow/WorkflowUi";
import { carePlansService, type CarePlanDetail } from "../../services/carePlans";

export function DonReviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [carePlan, setCarePlan] = useState<CarePlanDetail | null>(null);
    const [notes, setNotes] = useState("");
    const [password, setPassword] = useState("");
    const [showSignature, setShowSignature] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        void carePlansService
            .getById(id)
            .then(setCarePlan)
            .catch((loadError) => setError((loadError as Error).message));
    }, [id]);

    async function rejectPlan() {
        if (!id || !notes.trim()) {
            setError("Rejection notes are required.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await carePlansService.review(id, { status: "REJECTED", notes: notes.trim() });
            navigate(`/care-plans/${id}`);
        } catch (submitError) {
            setError((submitError as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function approvePlan() {
        if (!id) return;
        setIsSubmitting(true);
        setError("");
        try {
            await carePlansService.review(id, { status: "APPROVED", notes: notes.trim() || undefined });
            setShowSignature(true);
            setMessage("Clinical approval recorded. Complete the electronic signature to activate the plan.");
        } catch (submitError) {
            setError((submitError as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function signPlan() {
        if (!id || !password) {
            setError("Enter your password to provide an electronic signature.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            await carePlansService.eSign(id, password);
            navigate(`/care-plans/${id}`);
        } catch (submitError) {
            setError((submitError as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (error && !carePlan)
        return (
            <WorkflowPage title="DON Review">
                <Notice type="error">{error}</Notice>
            </WorkflowPage>
        );
    if (!carePlan)
        return (
            <WorkflowPage title="DON Review">
                <LoadingState label="Loading care plan for review..." />
            </WorkflowPage>
        );

    return (
        <WorkflowPage
            breadcrumb="Care Planning > DON Review"
            title={`DON Review — ${carePlan.resident?.firstName ?? ""} ${carePlan.resident?.lastName ?? ""}`}
            description="Review clinical goals and interventions, then approve with an electronic signature or return the plan for correction."
        >
            <div className="space-y-5">
                {error && <Notice type="error">{error}</Notice>}
                {message && <Notice type="success">{message}</Notice>}

                <div className="grid gap-5 lg:grid-cols-2">
                    <Panel title="Care Goals">
                        <ul className="space-y-3 text-sm text-slate-700">
                            {carePlan.goals.map((goal) => (
                                <li key={goal.id} className="rounded-lg border border-slate-200 p-3">
                                    {goal.description}
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title="Interventions">
                        <ul className="space-y-3 text-sm text-slate-700">
                            {carePlan.interventions.map((item) => (
                                <li key={item.id} className="rounded-lg border border-slate-200 p-3">
                                    <p className="font-semibold">{item.description}</p>
                                    <p className="mt-1 text-xs text-slate-500">Assigned role: {item.assignedRole}</p>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </div>

                <Panel title="Review Decision">
                    <label className={labelClassName}>
                        Clinical review notes
                        <textarea
                            className={`${fieldClassName} min-h-28`}
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Document clinical reasoning, corrections, or approval notes."
                        />
                    </label>
                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => navigate(`/care-plans/${carePlan.id}`)}>
                            Cancel
                        </SecondaryButton>
                        <SecondaryButton type="button" disabled={isSubmitting} onClick={() => void rejectPlan()}>
                            Reject and Return
                        </SecondaryButton>
                        <PrimaryButton type="button" disabled={isSubmitting} onClick={() => void approvePlan()}>
                            Approve Plan
                        </PrimaryButton>
                    </div>
                </Panel>

                {showSignature && (
                    <Panel title="Electronic Signature" description="Re-enter your password. The system stores a traceable signature token and immutable timestamp.">
                        <label className={labelClassName}>
                            Password
                            <input type="password" className={fieldClassName} value={password} onChange={(event) => setPassword(event.target.value)} />
                        </label>
                        <div className="mt-5 flex justify-end">
                            <PrimaryButton type="button" disabled={isSubmitting} onClick={() => void signPlan()}>
                                {isSubmitting ? "Signing..." : "Sign and Activate Care Plan"}
                            </PrimaryButton>
                        </div>
                    </Panel>
                )}
            </div>
        </WorkflowPage>
    );
}
