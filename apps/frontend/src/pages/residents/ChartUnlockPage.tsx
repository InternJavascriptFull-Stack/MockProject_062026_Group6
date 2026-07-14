import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UnlockKeyhole } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { incidentsService } from "../../services/incidents";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

export default function ChartUnlockPage() {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const query = useQuery({ queryKey: ["incident", id], queryFn: () => incidentsService.getIncidentById(id), enabled: Boolean(id) });
    const [reason, setReason] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const mutation = useMutation({ mutationFn: () => incidentsService.unlockChart(id, reason, passwordConfirm), onSuccess: () => navigate(`/incidents/${id}`) });
    if (query.isLoading || !query.data)
        return (
            <WorkflowPage title="Chart Unlock">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    return (
        <WorkflowPage
            breadcrumb={`Incident & Risk  >  #${id}  >  Chart Unlock`}
            title="Unlock Resident Chart"
            description="DON/Admin only. Document the reason and verify your account password."
        >
            {(query.error || mutation.error) && (
                <div className="mb-4">
                    <Notice type="error">{String(query.error ?? mutation.error)}</Notice>
                </div>
            )}
            <div className="mx-auto max-w-2xl">
                <Panel>
                    <div className="mb-6 flex items-start gap-4 rounded-lg bg-emerald-50 p-4">
                        <UnlockKeyhole className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h2 className="font-bold text-slate-900">{query.data.resident.fullName}</h2>
                            <p className="text-sm text-slate-600">
                                Incident {query.data.id} · Current chart status: {query.data.resident.isChartLocked ? "Locked" : "Already unlocked"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <label className={labelClassName}>
                            Reason for unlock *
                            <textarea
                                className={`${fieldClassName} min-h-28`}
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                placeholder="Investigation completed and documentation reviewed..."
                            />
                        </label>
                        <label className={labelClassName}>
                            Password Confirmation *
                            <input
                                className={fieldClassName}
                                type="password"
                                value={passwordConfirm}
                                onChange={(event) => setPasswordConfirm(event.target.value)}
                                autoComplete="current-password"
                            />
                        </label>
                        <Notice type="warning">Unlocking restores editing access and creates a permanent audit log entry. It does not automatically resolve the incident.</Notice>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => navigate(-1)}>Cancel</SecondaryButton>
                            <PrimaryButton
                                disabled={!query.data.resident.isChartLocked || !reason.trim() || !passwordConfirm || mutation.isPending}
                                onClick={() => mutation.mutate()}
                            >
                                {mutation.isPending ? "Unlocking..." : "Unlock Chart"}
                            </PrimaryButton>
                        </div>
                    </div>
                </Panel>
            </div>
        </WorkflowPage>
    );
}
