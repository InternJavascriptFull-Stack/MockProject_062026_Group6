import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";
import { carePlansService, type CarePlanDetail } from "../../services/carePlans";

export function CarePlanPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [carePlan, setCarePlan] = useState<CarePlanDetail | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        void carePlansService
            .getById(id)
            .then(setCarePlan)
            .catch((loadError) => setError((loadError as Error).message));
    }, [id]);

    if (error)
        return (
            <WorkflowPage title="Care Plan">
                <Notice type="error">{error}</Notice>
            </WorkflowPage>
        );
    if (!carePlan)
        return (
            <WorkflowPage title="Care Plan">
                <LoadingState label="Loading care plan..." />
            </WorkflowPage>
        );

    const residentName = carePlan.resident ? `${carePlan.resident.firstName} ${carePlan.resident.lastName}` : "Unknown Resident";

    return (
        <WorkflowPage
            breadcrumb="Care Planning > Detail"
            title={`Care Plan — ${residentName}`}
            description={`Room ${carePlan.resident?.roomNumber ?? "Unassigned"} · LOC ${carePlan.activeCareLevel?.name ?? "Not confirmed"}`}
            actions={
                <StatusBadge tone={carePlan.status.toLowerCase().includes("reject") ? "danger" : carePlan.status.toLowerCase().includes("active") ? "success" : "warning"}>
                    {carePlan.status}
                </StatusBadge>
            }
        >
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                    <Panel title="Care Goals">
                        <ul className="space-y-3">
                            {carePlan.goals.map((goal) => (
                                <li key={goal.id} className="rounded-lg border border-slate-200 p-3">
                                    <p className="font-semibold text-slate-800">{goal.description}</p>
                                    <p className="mt-1 text-xs text-slate-500">{goal.status}</p>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title="Interventions and Assigned Tasks">
                        <div className="space-y-4">
                            {carePlan.interventions.map((intervention) => (
                                <div key={intervention.id} className="rounded-lg border border-slate-200 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-semibold text-slate-900">{intervention.description}</p>
                                        <StatusBadge tone="info">{intervention.assignedRole}</StatusBadge>
                                    </div>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                        {intervention.tasks.length ? (
                                            intervention.tasks.map((task) => (
                                                <p key={task.id}>
                                                    {task.task_type} · {task.status} · {new Date(task.scheduled_time).toLocaleString()}
                                                </p>
                                            ))
                                        ) : (
                                            <p>No tasks generated until the plan is approved and signed.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>

                <div className="space-y-5">
                    <Panel title="Workflow Actions">
                        <div className="space-y-3">
                            <PrimaryButton className="w-full" onClick={() => navigate(`/care-plans/${carePlan.id}/review`)}>
                                DON Review
                            </PrimaryButton>
                            <SecondaryButton className="w-full" onClick={() => navigate(`/care-plans/${carePlan.id}/acknowledge`)}>
                                IDT Acknowledgment
                            </SecondaryButton>
                            <SecondaryButton className="w-full" onClick={() => navigate("/care-plans")}>
                                Back to List
                            </SecondaryButton>
                        </div>
                    </Panel>
                    <Panel title="Review History">
                        <div className="space-y-3 text-sm text-slate-600">
                            {carePlan.reviews.length ? (
                                carePlan.reviews.map((review) => (
                                    <div key={review.id}>
                                        <p className="font-semibold text-slate-800">{review.status}</p>
                                        <p>{review.notes || "No notes"}</p>
                                        <p className="text-xs">{new Date(review.reviewed_at).toLocaleString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No reviews recorded.</p>
                            )}
                        </div>
                    </Panel>
                    <Panel title="IDT Sign-off">
                        <div className="space-y-2 text-sm text-slate-600">
                            {carePlan.idtAcks.length ? (
                                carePlan.idtAcks.map((ack) => (
                                    <p key={ack.id}>
                                        {ack.user?.firstName} {ack.user?.lastName} · {new Date(ack.acknowledged_at).toLocaleString()}
                                    </p>
                                ))
                            ) : (
                                <p>Pending acknowledgments.</p>
                            )}
                        </div>
                    </Panel>
                </div>
            </div>
        </WorkflowPage>
    );
}
