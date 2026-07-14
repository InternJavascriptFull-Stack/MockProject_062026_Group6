import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { careTasksService } from "../../services/careTasks";
import { residentsService } from "../../services/residents";
import { vitalsService } from "../../services/vitals";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

const initialVitals = {
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRateBpm: 72,
    respiratoryRate: 16,
    temperatureFahrenheit: 98.6,
    spo2Percentage: 98,
    painScale: 0,
    notes: "",
};

export default function BedsideVitalsPage() {
    const navigate = useNavigate();
    const { taskId } = useParams();
    const [searchParams] = useSearchParams();
    const residentIdFromQuery = searchParams.get("residentId") ?? "";
    const taskQuery = useQuery({ queryKey: ["care-task", taskId], queryFn: () => careTasksService.getById(taskId!), enabled: Boolean(taskId) });
    const residentId = residentIdFromQuery || taskQuery.data?.resident?.id || "";
    const residentsQuery = useQuery({ queryKey: ["resident-options"], queryFn: () => residentsService.getAll(), enabled: !residentId });
    const [manualResidentId, setManualResidentId] = useState("");
    const selectedResidentId = residentId || manualResidentId || residentsQuery.data?.[0]?.id || "";
    const [form, setForm] = useState(initialVitals);
    const [acknowledgeAbnormal, setAcknowledgeAbnormal] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const abnormalReasons = useMemo(() => {
        const reasons: string[] = [];
        if (form.bloodPressureSystolic < 90 || form.bloodPressureSystolic > 160 || form.bloodPressureDiastolic < 60 || form.bloodPressureDiastolic > 100)
            reasons.push("Blood pressure outside expected range");
        if (form.heartRateBpm < 50 || form.heartRateBpm > 110) reasons.push("Heart rate outside expected range");
        if (form.respiratoryRate < 10 || form.respiratoryRate > 24) reasons.push("Respiratory rate outside expected range");
        if (form.temperatureFahrenheit < 95 || form.temperatureFahrenheit > 100.4) reasons.push("Temperature outside expected range");
        if (form.spo2Percentage < 92) reasons.push("Low oxygen saturation");
        if (form.painScale >= 7) reasons.push("High pain score");
        return reasons;
    }, [form]);
    const mutation = useMutation({
        mutationFn: () => vitalsService.create({ residentId: selectedResidentId, taskId, ...form, acknowledgeAbnormal }),
        onSuccess: (result) => {
            setMessage(result.abnormal ? `Vitals saved with warnings: ${result.abnormalReasons.join(", ")}` : "Vitals saved successfully and the task was completed.");
        },
    });
    if (taskId && taskQuery.isLoading)
        return (
            <WorkflowPage title="Bedside Vitals">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    return (
        <WorkflowPage breadcrumb="Care Planning  >  Bedside Vitals" title="Bedside Vitals" description="Record required vital signs with abnormal-range safety confirmation.">
            {message && (
                <div className="mb-4">
                    <Notice type={abnormalReasons.length ? "warning" : "success"}>{message}</Notice>
                </div>
            )}
            {mutation.error && (
                <div className="mb-4">
                    <Notice type="error">{String(mutation.error)}</Notice>
                </div>
            )}
            {abnormalReasons.length > 0 && (
                <div className="mb-4">
                    <Notice type="warning">
                        <strong>Abnormal value warning:</strong> {abnormalReasons.join("; ")}. Confirm review before saving.
                    </Notice>
                </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <Panel title="Vital Sign Entry">
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(form)
                            .filter(([field]) => field !== "notes")
                            .map(([field, value]) => (
                                <label key={field} className={labelClassName}>
                                    {field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())} *
                                    <input
                                        className={fieldClassName}
                                        type="number"
                                        step={field === "temperatureFahrenheit" ? "0.1" : "1"}
                                        value={value}
                                        onChange={(event) => setForm({ ...form, [field]: Number(event.target.value) })}
                                    />
                                </label>
                            ))}
                        <label className={`${labelClassName} md:col-span-2 lg:col-span-4`}>
                            Clinical Notes
                            <textarea className={`${fieldClassName} min-h-24`} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                        </label>
                    </div>
                </Panel>
                <div className="space-y-5">
                    <Panel title="Resident">
                        <p className="font-bold text-slate-900">{taskQuery.data?.resident?.fullName ?? "Manual Entry"}</p>
                        <p className="text-sm text-slate-500">Room {taskQuery.data?.resident?.roomNumber ?? "—"}</p>
                        {!residentId && (
                            <select className={fieldClassName} value={selectedResidentId} onChange={(event) => setManualResidentId(event.target.value)}>
                                {residentsQuery.data?.map((resident) => (
                                    <option key={resident.id} value={resident.id}>
                                        {resident.fullName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </Panel>
                    {abnormalReasons.length > 0 && (
                        <Panel title="Safety Check">
                            <label className="flex items-start gap-3 text-sm text-slate-700">
                                <input className="mt-1" type="checkbox" checked={acknowledgeAbnormal} onChange={(event) => setAcknowledgeAbnormal(event.target.checked)} />I
                                reviewed the abnormal values and will escalate according to clinical policy.
                            </label>
                        </Panel>
                    )}
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                <SecondaryButton onClick={() => navigate(-1)}>Cancel</SecondaryButton>
                <PrimaryButton disabled={!selectedResidentId || mutation.isPending || (abnormalReasons.length > 0 && !acknowledgeAbnormal)} onClick={() => mutation.mutate()}>
                    {mutation.isPending ? "Saving..." : "Save Vitals"}
                </PrimaryButton>
            </div>
        </WorkflowPage>
    );
}
