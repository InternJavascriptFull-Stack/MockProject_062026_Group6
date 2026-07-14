import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { EmptyState, fieldClassName, labelClassName, LoadingState, Notice, Panel, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";
import { assessmentsService, type Assessment } from "../../services/assessments";
import { residentsService } from "../../services/residents";

export default function AssessmentHistoryPage() {
    const [searchParams] = useSearchParams();
    const residentsQuery = useQuery({ queryKey: ["resident-options"], queryFn: () => residentsService.getAll() });
    const [residentId, setResidentId] = useState(searchParams.get("residentId") ?? "");
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const selectedId = residentId || residentsQuery.data?.[0]?.id || "";
    const historyQuery = useQuery({
        queryKey: ["assessment-history", selectedId],
        queryFn: () => assessmentsService.getHistory(selectedId),
        enabled: Boolean(selectedId),
    });

    return (
        <WorkflowPage breadcrumb="Residents  >  Assessment History" title="Assessment History" description="Review chronological clinical assessments and LOC outcomes.">
            <Panel title="Resident Filter">
                <label className={labelClassName}>
                    Resident
                    <select
                        className={fieldClassName}
                        value={selectedId}
                        onChange={(event) => {
                            setResidentId(event.target.value);
                            setSelectedAssessment(null);
                        }}
                    >
                        {residentsQuery.data?.map((resident) => (
                            <option key={resident.id} value={resident.id}>
                                {resident.fullName}
                            </option>
                        ))}
                    </select>
                </label>
            </Panel>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
                <div>
                    {historyQuery.error && (
                        <div className="mb-4">
                            <Notice type="error">{String(historyQuery.error)}</Notice>
                        </div>
                    )}
                    <Panel>
                        {historyQuery.isLoading ? (
                            <LoadingState />
                        ) : !historyQuery.data?.length ? (
                            <EmptyState label="No previous assessments found." />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Assessment Date</th>
                                            <th className="px-4 py-3">ADL Total</th>
                                            <th className="px-4 py-3">Suggested LOC</th>
                                            <th className="px-4 py-3">Confirmed LOC</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {historyQuery.data.map((assessment) => (
                                            <tr key={assessment.id} className="cursor-pointer hover:bg-blue-50" onClick={() => setSelectedAssessment(assessment)}>
                                                <td className="px-4 py-4 font-medium">{new Date(assessment.createdAt).toLocaleString()}</td>
                                                <td className="px-4 py-4">{assessment.adlTotalScore}</td>
                                                <td className="px-4 py-4">{assessment.suggestedCareLevel?.name ?? "—"}</td>
                                                <td className="px-4 py-4">{assessment.confirmedCareLevel?.name ?? "Pending"}</td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge tone={assessment.isConfirmed ? "success" : "warning"}>
                                                        {assessment.isConfirmed ? "Confirmed" : "Suggested"}
                                                    </StatusBadge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="px-4 pt-3 text-xs text-slate-500">Select a record to open its read-only clinical details.</p>
                            </div>
                        )}
                    </Panel>
                </div>

                <Panel title="Assessment Details" description="Read-only assessment record">
                    {!selectedAssessment ? (
                        <EmptyState label="Select an assessment record to review ADL scores, assessor, and notes." />
                    ) : (
                        <div className="space-y-4 text-sm">
                            <dl className="grid grid-cols-[130px_1fr] gap-2">
                                <dt className="font-semibold text-slate-500">Assessed</dt>
                                <dd>{new Date(selectedAssessment.createdAt).toLocaleString()}</dd>
                                <dt className="font-semibold text-slate-500">Assessor</dt>
                                <dd>{selectedAssessment.assessor?.name ?? "Clinical staff"}</dd>
                                <dt className="font-semibold text-slate-500">ADL Total</dt>
                                <dd>{selectedAssessment.adlTotalScore}</dd>
                                <dt className="font-semibold text-slate-500">Suggested LOC</dt>
                                <dd>{selectedAssessment.suggestedCareLevel?.name ?? "—"}</dd>
                                <dt className="font-semibold text-slate-500">Confirmed LOC</dt>
                                <dd>{selectedAssessment.confirmedCareLevel?.name ?? "Pending"}</dd>
                            </dl>
                            <div>
                                <h3 className="mb-2 font-bold text-slate-800">ADL Scores</h3>
                                <div className="space-y-2">
                                    {(selectedAssessment.details ?? selectedAssessment.metrics ?? []).map((detail) => (
                                        <div key={detail.id ?? detail.metricName} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                                            <span>{detail.metricName}</span>
                                            <strong>{detail.score}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Panel>
            </div>
        </WorkflowPage>
    );
}
