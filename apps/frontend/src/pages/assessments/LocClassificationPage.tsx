import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { assessmentsService } from "../../services/assessments";
import { careLevelsService } from "../../services/careLevels";
import { residentsService } from "../../services/residents";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";

export default function LocClassificationPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { residentId = "" } = useParams();
    const [searchParams] = useSearchParams();
    const assessmentIdHint = searchParams.get("assessmentId");
    const classificationQuery = useQuery({
        queryKey: ["latest-loc", residentId],
        queryFn: () => assessmentsService.getLatestClassification(residentId),
        enabled: Boolean(residentId),
    });
    const levelsQuery = useQuery({ queryKey: ["care-level-rates"], queryFn: careLevelsService.getAll });
    const residentQuery = useQuery({ queryKey: ["resident", residentId], queryFn: () => residentsService.getById(residentId), enabled: Boolean(residentId) });
    const [careLevelId, setCareLevelId] = useState("");
    const [isOverride, setIsOverride] = useState(false);
    const [overrideReason, setOverrideReason] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    useEffect(() => {
        if (classificationQuery.data) setCareLevelId(classificationQuery.data.activeCareLevel?.id ?? classificationQuery.data.suggestedCareLevel.id);
    }, [classificationQuery.data]);
    const mutation = useMutation({
        mutationFn: () =>
            assessmentsService.confirmLoc(assessmentIdHint ?? classificationQuery.data!.id, { careLevelId, isOverride, overrideReason: isOverride ? overrideReason : undefined }),
        onSuccess: async () => {
            setMessage("Level of Care was confirmed successfully.");
            await queryClient.invalidateQueries({ queryKey: ["latest-loc", residentId] });
        },
    });
    if (classificationQuery.isLoading || levelsQuery.isLoading)
        return (
            <WorkflowPage title="LOC Classification">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    const assessment = classificationQuery.data;
    return (
        <WorkflowPage
            breadcrumb="Residents  >  LOC Classification"
            title="Level of Care Classification"
            description={`${residentQuery.data?.fullName ?? "Resident"} · Review the calculated suggestion and confirm or override.`}
        >
            {message && (
                <div className="mb-4">
                    <Notice type="success">{message}</Notice>
                </div>
            )}
            {(classificationQuery.error || mutation.error) && (
                <div className="mb-4">
                    <Notice type="error">{String(classificationQuery.error ?? mutation.error)}</Notice>
                </div>
            )}
            {assessment && (
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-5">
                        <Panel title="Calculated Result">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase">ADL Total</span>
                                    <p className="mt-1 text-3xl font-bold text-slate-900">{assessment.adlTotalScore}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase">Suggested LOC</span>
                                    <p className="mt-2">
                                        <StatusBadge tone="warning">{assessment.suggestedCareLevel.name}</StatusBadge>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase">Current Status</span>
                                    <p className="mt-2">
                                        <StatusBadge tone={assessment.isConfirmed ? "success" : "warning"}>{assessment.isConfirmed ? "Confirmed" : "Suggested only"}</StatusBadge>
                                    </p>
                                </div>
                            </div>
                        </Panel>
                        <Panel title="Score Breakdown">
                            <div className="grid gap-3 md:grid-cols-2">
                                {assessment.details?.map((detail) => (
                                    <div key={detail.metricName} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
                                        <span>{detail.metricName}</span>
                                        <strong>{detail.score}</strong>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                    <Panel title="Confirm Level of Care">
                        <label className={labelClassName}>
                            Selected LOC *
                            <select
                                className={fieldClassName}
                                value={careLevelId}
                                onChange={(event) => {
                                    setCareLevelId(event.target.value);
                                    setIsOverride(event.target.value !== assessment.suggestedCareLevel.id);
                                }}
                            >
                                {levelsQuery.data?.map((level) => (
                                    <option key={level.id} value={level.id}>
                                        {level.levelName} · ${level.dailyRate.toFixed(2)}/day
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={isOverride} onChange={(event) => setIsOverride(event.target.checked)} />
                            Override system suggestion
                        </label>
                        {isOverride && (
                            <label className={`${labelClassName} mt-4 block`}>
                                Override Reason *
                                <textarea className={`${fieldClassName} min-h-24`} value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} />
                                <span className="mt-1 block text-xs text-slate-500">Minimum 20 characters ({overrideReason.trim().length}/20).</span>
                            </label>
                        )}
                        <div className="mt-6 space-y-3">
                            <PrimaryButton
                                className="w-full"
                                disabled={!careLevelId || (isOverride && overrideReason.trim().length < 20) || mutation.isPending}
                                onClick={() => mutation.mutate()}
                            >
                                {mutation.isPending ? "Confirming..." : "Confirm LOC Classification"}
                            </PrimaryButton>
                            <SecondaryButton className="w-full" onClick={() => navigate(`/residents/${residentId}/loc-history`)}>
                                View LOC History
                            </SecondaryButton>
                        </div>
                    </Panel>
                </div>
            )}
        </WorkflowPage>
    );
}
