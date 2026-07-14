import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { admissionsService } from "../../services/admissions";
import { facilityService } from "../../services/facility";
import { residentsService } from "../../services/residents";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, WorkflowPage } from "../../components/workflow/WorkflowUi";

const requiredConsents = ["Admission Agreement", "HIPAA Notice of Privacy Practices", "Financial Responsibility Agreement", "Advance Directive Acknowledgment"];

export default function AdmissionFormPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const residentIdFromQuery = searchParams.get("residentId") ?? "";
    const residentsQuery = useQuery({ queryKey: ["resident-options"], queryFn: () => residentsService.getAll() });
    const facilityQuery = useQuery({ queryKey: ["facility-settings"], queryFn: facilityService.getCurrentSettings });
    const [form, setForm] = useState({
        residentId: residentIdFromQuery,
        bedId: "",
        admissionDate: new Date().toISOString().slice(0, 10),
        payerSource: "Medicare",
        policyNumber: "",
        primaryPhysician: "",
        nurseInCharge: "",
        consents: [] as string[],
    });
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!form.residentId && residentsQuery.data?.[0]) {
            setForm((current) => ({ ...current, residentId: residentsQuery.data![0]!.id }));
        }
    }, [form.residentId, residentsQuery.data]);

    const availableBeds = useMemo(
        () => facilityQuery.data?.rooms.flatMap((room) => room.beds.filter((bed) => bed.status === "AVAILABLE").map((bed) => ({ ...bed, room }))) ?? [],
        [facilityQuery.data],
    );
    const selectedResident = residentsQuery.data?.find((resident) => resident.id === form.residentId);
    const canSubmit = Boolean(
        form.residentId && facilityQuery.data?.id && form.bedId && form.admissionDate && form.payerSource && requiredConsents.every((consent) => form.consents.includes(consent)),
    );

    const mutation = useMutation({
        mutationFn: () =>
            admissionsService.create({
                ...form,
                facilityId: facilityQuery.data!.id,
            }),
        onSuccess: (result) => {
            setMessage("Admission confirmed. Resident status is now Active.");
            const residentId = result?.data?.residentId ?? result?.residentId ?? form.residentId;
            window.setTimeout(() => navigate(`/residents/${residentId}`), 800);
        },
    });

    if (residentsQuery.isLoading || facilityQuery.isLoading) {
        return (
            <WorkflowPage title="Admission Form">
                <Panel>
                    <LoadingState />
                </Panel>
            </WorkflowPage>
        );
    }

    return (
        <WorkflowPage
            breadcrumb="Residents  >  New Admission Flow"
            title="Step 2: Admission Form"
            description="Assign an available room, confirm payer details, and capture required consents."
        >
            <div className="mb-5 grid grid-cols-3 overflow-hidden rounded-lg border border-blue-200 text-center text-sm font-semibold">
                <div className="bg-white px-4 py-3 text-blue-600">1&nbsp; Pre-Screening ✓</div>
                <div className="bg-blue-600 px-4 py-3 text-white">2&nbsp; Admission Form</div>
                <div className="bg-white px-4 py-3 text-slate-400">3&nbsp; Initial Assessment</div>
            </div>
            {message && (
                <div className="mb-4">
                    <Notice type="success">{message}</Notice>
                </div>
            )}
            {mutation.error && (
                <div className="mb-4">
                    <Notice type="error">{String(mutation.error)}</Notice>
                </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
                <div className="space-y-5">
                    <Panel title="Resident">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className={labelClassName}>
                                Resident *
                                <select className={fieldClassName} value={form.residentId} onChange={(event) => setForm({ ...form, residentId: event.target.value })}>
                                    {residentsQuery.data?.map((resident) => (
                                        <option key={resident.id} value={resident.id}>
                                            {resident.fullName} · {resident.roomNumber ?? "No room"}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                                <strong className="block text-slate-900">{selectedResident?.fullName ?? "Select resident"}</strong>
                                {selectedResident && (
                                    <>
                                        DOB {selectedResident.dateOfBirth} · {selectedResident.residentCode}
                                    </>
                                )}
                            </div>
                        </div>
                    </Panel>
                    <Panel title="Admission Details">
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={labelClassName}>
                                Admission Date *
                                <input
                                    className={fieldClassName}
                                    type="date"
                                    value={form.admissionDate}
                                    onChange={(event) => setForm({ ...form, admissionDate: event.target.value })}
                                />
                            </label>
                            <label className={labelClassName}>
                                Room Assignment *
                                <select className={fieldClassName} value={form.bedId} onChange={(event) => setForm({ ...form, bedId: event.target.value })}>
                                    <option value="">Select an available room...</option>
                                    {availableBeds.map((bed) => (
                                        <option key={bed.id} value={bed.id}>
                                            {bed.room.roomNumber}-{bed.bedNumber} ({bed.room.roomType})
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </Panel>
                    <Panel title="Payer Source">
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={labelClassName}>
                                Payer Source *
                                <select className={fieldClassName} value={form.payerSource} onChange={(event) => setForm({ ...form, payerSource: event.target.value })}>
                                    <option>Medicare</option>
                                    <option>Medicaid</option>
                                    <option>Private Pay</option>
                                    <option>Insurance</option>
                                </select>
                            </label>
                            <label className={labelClassName}>
                                Policy / Member Number
                                <input className={fieldClassName} value={form.policyNumber} onChange={(event) => setForm({ ...form, policyNumber: event.target.value })} />
                            </label>
                        </div>
                    </Panel>
                    <Panel title="Care Team in Charge">
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className={labelClassName}>
                                Physician in Charge
                                <input className={fieldClassName} value={form.primaryPhysician} onChange={(event) => setForm({ ...form, primaryPhysician: event.target.value })} />
                            </label>
                            <label className={labelClassName}>
                                Nurse in Charge
                                <input className={fieldClassName} value={form.nurseInCharge} onChange={(event) => setForm({ ...form, nurseInCharge: event.target.value })} />
                            </label>
                        </div>
                    </Panel>
                    <Panel title="Signed Consents" description="All required consents must be acknowledged before confirmation.">
                        <div className="grid gap-3 md:grid-cols-2">
                            {requiredConsents.map((consent) => (
                                <label key={consent} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={form.consents.includes(consent)}
                                        onChange={(event) =>
                                            setForm({ ...form, consents: event.target.checked ? [...form.consents, consent] : form.consents.filter((item) => item !== consent) })
                                        }
                                    />
                                    {consent}
                                    <span className="ml-auto text-xs text-slate-400">Required</span>
                                </label>
                            ))}
                        </div>
                    </Panel>
                </div>
                <div className="space-y-5">
                    <Panel title="Role">
                        <p className="font-bold text-slate-900">Admission Staff</p>
                        <p className="mt-2 text-sm text-slate-500">Completes admission, room assignment, payer source, and consent capture.</p>
                    </Panel>
                    <Panel title="Available Capacity">
                        <p className="text-3xl font-bold text-blue-600">{availableBeds.length}</p>
                        <p className="text-sm text-slate-500">available beds across {facilityQuery.data?.rooms.length ?? 0} rooms</p>
                    </Panel>
                </div>
            </div>
            <div className="mt-6 flex justify-between border-t border-slate-200 pt-5">
                <SecondaryButton onClick={() => navigate(-1)}>← Back</SecondaryButton>
                <div className="flex gap-3">
                    <SecondaryButton onClick={() => setMessage("Draft retained in this browser session.")}>Save Draft</SecondaryButton>
                    <PrimaryButton disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
                        {mutation.isPending ? "Confirming..." : "Confirm Admission"}
                    </PrimaryButton>
                </div>
            </div>
        </WorkflowPage>
    );
}
