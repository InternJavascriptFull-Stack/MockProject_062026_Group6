import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage, fieldClassName, labelClassName } from "../../components/workflow/WorkflowUi";
import { APP_ROUTES } from "../../constants/appRoutes";
import { carePlansService, type CarePlanResident, type LocGateResult } from "../../services/carePlans";

type GoalInput = { id: string; description: string };
type InterventionInput = { id: string; description: string; assignedRole: string };

export function CreateCarePlanPage() {
    const navigate = useNavigate();
    const [residents, setResidents] = useState<CarePlanResident[]>([]);
    const [residentId, setResidentId] = useState("");
    const [locGate, setLocGate] = useState<LocGateResult | null>(null);
    const [goals, setGoals] = useState<GoalInput[]>([{ id: crypto.randomUUID(), description: "" }]);
    const [interventions, setInterventions] = useState<InterventionInput[]>([{ id: crypto.randomUUID(), description: "", assignedRole: "CNA" }]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        void (async () => {
            setIsLoading(true);
            try {
                const data = await carePlansService.getResidents();
                setResidents(data);
                if (data[0]) setResidentId(data[0].id);
            } catch (loadError) {
                setError((loadError as Error).message);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!residentId) {
            setLocGate(null);
            return;
        }
        void carePlansService
            .checkLocGate(residentId)
            .then(setLocGate)
            .catch((loadError) => setError((loadError as Error).message));
    }, [residentId]);

    const selectedResident = useMemo(() => residents.find((resident) => resident.id === residentId), [residentId, residents]);

    function updateGoal(id: string, description: string) {
        setGoals((current) => current.map((goal) => (goal.id === id ? { ...goal, description } : goal)));
    }

    function updateIntervention(id: string, patch: Partial<InterventionInput>) {
        setInterventions((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }

    async function submit(status: "Draft" | "Pending Review") {
        setError("");
        const validGoals = goals.map((goal) => goal.description.trim()).filter(Boolean);
        const validInterventions = interventions.filter((item) => item.description.trim());
        if (!residentId || !validGoals.length || !validInterventions.length) {
            setError("Select a resident and provide at least one goal and one intervention.");
            return;
        }
        if (locGate?.blocked) {
            setError(locGate.message);
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await carePlansService.create({
                residentId,
                status,
                goals: validGoals.map((description) => ({ description })),
                interventions: validInterventions.map((item) => ({
                    description: item.description.trim(),
                    assignedRole: item.assignedRole,
                })),
            });
            navigate(`/care-plans/${created.id}`);
        } catch (submitError) {
            setError((submitError as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <WorkflowPage
            breadcrumb="Care Planning > New Care Plan"
            title="Create Care Plan"
            description="Create resident-specific goals and interventions after the Level of Care has been confirmed."
        >
            <div className="space-y-5">
                {error && <Notice type="error">{error}</Notice>}
                {locGate && <Notice type={locGate.blocked ? "warning" : "success"}>{locGate.message}</Notice>}

                <Panel title="Resident and LOC Gate">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className={labelClassName}>
                            Resident
                            <select className={fieldClassName} value={residentId} onChange={(event) => setResidentId(event.target.value)} disabled={isLoading}>
                                <option value="">Select resident</option>
                                {residents.map((resident) => (
                                    <option key={resident.id} value={resident.id}>
                                        {resident.firstName} {resident.lastName} · Room {resident.roomNumber ?? "Unassigned"}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                            <p className="font-semibold">Current LOC</p>
                            <p className="mt-1">{locGate?.activeCareLevel?.name ?? "Not confirmed"}</p>
                            {selectedResident?.chartLocked && <p className="mt-2 font-semibold text-red-600">Resident chart is locked.</p>}
                        </div>
                    </div>
                    {locGate?.blocked && residentId && (
                        <PrimaryButton className="mt-4" type="button" onClick={() => navigate(`/residents/${residentId}/loc-classification`)}>
                            Go to LOC Classification
                        </PrimaryButton>
                    )}
                </Panel>

                <Panel title="Care Goals" description="Define measurable care goals for the resident.">
                    <div className="space-y-3">
                        {goals.map((goal, index) => (
                            <div key={goal.id} className="flex gap-3">
                                <input
                                    className={fieldClassName}
                                    value={goal.description}
                                    onChange={(event) => updateGoal(goal.id, event.target.value)}
                                    placeholder={`Goal ${index + 1}`}
                                />
                                <SecondaryButton type="button" onClick={() => setGoals((current) => current.filter((item) => item.id !== goal.id))} disabled={goals.length === 1}>
                                    Remove
                                </SecondaryButton>
                            </div>
                        ))}
                        <SecondaryButton type="button" onClick={() => setGoals((current) => [...current, { id: crypto.randomUUID(), description: "" }])}>
                            Add Goal
                        </SecondaryButton>
                    </div>
                </Panel>

                <Panel title="Interventions and Daily Tasks" description="Each approved intervention generates a daily task after DON e-signature.">
                    <div className="space-y-3">
                        {interventions.map((item, index) => (
                            <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                                <input
                                    className={fieldClassName}
                                    value={item.description}
                                    onChange={(event) => updateIntervention(item.id, { description: event.target.value })}
                                    placeholder={`Intervention ${index + 1}`}
                                />
                                <select
                                    className={fieldClassName}
                                    value={item.assignedRole}
                                    onChange={(event) => updateIntervention(item.id, { assignedRole: event.target.value })}
                                >
                                    <option value="CNA">CNA</option>
                                    <option value="NURSE">Nurse</option>
                                    <option value="DIETITIAN">Dietitian</option>
                                    <option value="PHYSICAL_THERAPIST">Physical Therapist</option>
                                </select>
                                <SecondaryButton
                                    type="button"
                                    onClick={() => setInterventions((current) => current.filter((entry) => entry.id !== item.id))}
                                    disabled={interventions.length === 1}
                                >
                                    Remove
                                </SecondaryButton>
                            </div>
                        ))}
                        <SecondaryButton
                            type="button"
                            onClick={() => setInterventions((current) => [...current, { id: crypto.randomUUID(), description: "", assignedRole: "CNA" }])}
                        >
                            Add Intervention
                        </SecondaryButton>
                    </div>
                </Panel>

                <div className="flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={() => navigate(APP_ROUTES.CARE_PLANS)}>
                        Cancel
                    </SecondaryButton>
                    <SecondaryButton type="button" disabled={isSubmitting || Boolean(locGate?.blocked)} onClick={() => void submit("Draft")}>
                        Save Draft
                    </SecondaryButton>
                    <PrimaryButton type="button" disabled={isSubmitting || Boolean(locGate?.blocked)} onClick={() => void submit("Pending Review")}>
                        {isSubmitting ? "Saving..." : "Submit for DON Review"}
                    </PrimaryButton>
                </div>
            </div>
        </WorkflowPage>
    );
}
