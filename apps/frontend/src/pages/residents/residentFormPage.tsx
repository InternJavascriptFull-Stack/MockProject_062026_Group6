import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { APP_ROUTES } from "../../constants/appRoutes";
import { CARE_LEVEL_LABEL, GENDER_LABEL, MOBILITY_STATUS_LABEL } from "./constants";
import { ReceptionField, TextArea, TextInput } from "./components/receptionField";
import { residentRepository } from "./services/residentRepository";
import type { CareLevel, Gender, MobilityStatus, Resident, ResidentFormPayload } from "./types";

type ResidentFormState = {
    fullName: string;
    dateOfBirth: string;
    gender: Gender | "";
    phone: string;
    address: string;
    admissionDate: string;
    roomNumber: string;
    careLevel: CareLevel | "";
    assignedNurse: string;
    assignedDoctor: string;
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    emergencyContactEmail: string;
    primaryDiagnosis: string;
    allergies: string;
    currentMedications: string;
    mobilityStatus: MobilityStatus | "";
};

type FormErrors = Partial<Record<keyof ResidentFormState, string>>;

const genderOptions: Gender[] = ["female", "male", "other"];
const careLevelOptions: CareLevel[] = ["independent", "assisted_living", "memory_care", "skilled_nursing"];
const mobilityOptions: MobilityStatus[] = ["independent", "walker", "wheelchair", "bed_bound"];

const residentFormSchema = z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
    dateOfBirth: z.string().min(1, "Date of birth is required."),
    gender: z.enum(["male", "female", "other"], "Gender is required."),
    phone: z.string(),
    address: z.string(),
    admissionDate: z.string().min(1, "Admission date is required."),
    roomNumber: z.string().trim().min(1, "Room is required."),
    careLevel: z.enum(["independent", "assisted_living", "memory_care", "skilled_nursing"], "Care level is required."),
    assignedNurse: z.string(),
    assignedDoctor: z.string(),
    emergencyContactName: z.string().trim().min(2, "Emergency contact name is required."),
    emergencyContactRelationship: z.string(),
    emergencyContactPhone: z.string().trim().min(7, "Emergency contact phone is required."),
    emergencyContactEmail: z.string().email("Enter a valid emergency contact email.").or(z.literal("")),
    primaryDiagnosis: z.string(),
    allergies: z.string(),
    currentMedications: z.string(),
    mobilityStatus: z.enum(["independent", "walker", "wheelchair", "bed_bound"]).or(z.literal("")),
});

const initialForm: ResidentFormState = {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    admissionDate: new Date().toISOString().slice(0, 10),
    roomNumber: "",
    careLevel: "",
    assignedNurse: "",
    assignedDoctor: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    primaryDiagnosis: "",
    allergies: "",
    currentMedications: "",
    mobilityStatus: "",
};

const mapResidentToForm = (resident: Resident): ResidentFormState => ({
    fullName: resident.fullName,
    dateOfBirth: resident.dateOfBirth,
    gender: resident.gender,
    phone: resident.phone ?? "",
    address: resident.address ?? "",
    admissionDate: resident.admissionDate,
    roomNumber: resident.roomNumber ?? "",
    careLevel: resident.careLevel,
    assignedNurse: resident.assignedNurse ?? "",
    assignedDoctor: resident.assignedDoctor ?? "",
    emergencyContactName: resident.emergencyContactName,
    emergencyContactRelationship: resident.emergencyContactRelationship ?? "",
    emergencyContactPhone: resident.emergencyContactPhone,
    emergencyContactEmail: resident.emergencyContactEmail ?? "",
    primaryDiagnosis: resident.primaryDiagnosis ?? "",
    allergies: resident.allergies ?? "",
    currentMedications: resident.currentMedications ?? "",
    mobilityStatus: resident.mobilityStatus ?? "",
});

const toPayload = (form: ResidentFormState): ResidentFormPayload => ({
    fullName: form.fullName,
    dateOfBirth: form.dateOfBirth,
    gender: form.gender as Gender,
    phone: form.phone,
    address: form.address,
    admissionDate: form.admissionDate,
    roomNumber: form.roomNumber,
    careLevel: form.careLevel as CareLevel,
    assignedNurse: form.assignedNurse,
    assignedDoctor: form.assignedDoctor,
    emergencyContactName: form.emergencyContactName,
    emergencyContactRelationship: form.emergencyContactRelationship,
    emergencyContactPhone: form.emergencyContactPhone,
    emergencyContactEmail: form.emergencyContactEmail,
    primaryDiagnosis: form.primaryDiagnosis,
    allergies: form.allergies,
    currentMedications: form.currentMedications,
    mobilityStatus: form.mobilityStatus,
});

export function ResidentFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(Boolean(id));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isEditMode = Boolean(id);

    useEffect(() => {
        if (!id) {
            return;
        }

        let isActive = true;
        setIsLoading(true);

        residentRepository
            .getResident(id)
            .then((resident) => {
                if (isActive) {
                    setForm(mapResidentToForm(resident));
                }
            })
            .catch(() => {
                if (isActive) {
                    setErrorMessage("Unable to load resident profile.");
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [id]);

    const completionScore = useMemo(() => {
        const requiredFields: Array<keyof ResidentFormState> = [
            "fullName",
            "dateOfBirth",
            "gender",
            "roomNumber",
            "admissionDate",
            "careLevel",
            "emergencyContactName",
            "emergencyContactPhone",
        ];
        const completedFields = requiredFields.filter((field) => String(form[field]).trim());

        return Math.round((completedFields.length / requiredFields.length) * 100);
    }, [form]);

    const updateField = <Key extends keyof ResidentFormState>(field: Key, value: ResidentFormState[Key]) => {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
        setErrorMessage("");
    };

    const validateForm = () => {
        const result = residentFormSchema.safeParse(form);

        if (result.success) {
            setErrors({});
            return true;
        }

        const nextErrors: FormErrors = {};

        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof ResidentFormState;
            nextErrors[field] = issue.message;
        }

        setErrors(nextErrors);
        return false;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const savedResident = isEditMode && id ? await residentRepository.updateResident(id, toPayload(form)) : await residentRepository.createResident(toPayload(form));

            navigate(`${APP_ROUTES.RESIDENTS}/${savedResident.id}`);
        } catch {
            setErrorMessage("Unable to save resident. Please review the form.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="page-shell">
                <div className="empty-state">
                    <strong>Loading resident form...</strong>
                    <span>Preparing resident information.</span>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <section className="page-header">
                <div>
                    <span className="eyebrow">Resident Management</span>
                    <h1>{isEditMode ? "Edit Resident" : "Create Resident"}</h1>
                    <p>Maintain demographic, admission, care assignment, and emergency contact details for the resident profile.</p>
                </div>
                <Link className="secondary-action" to={APP_ROUTES.RESIDENTS}>
                    Back to List
                </Link>
            </section>

            <section className="intake-summary">
                <div>
                    <strong>{completionScore}% complete</strong>
                    <span>Required resident profile fields</span>
                </div>
                <div className="progress-track">
                    <div style={{ width: `${completionScore}%` }} />
                </div>
            </section>

            {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

            <form className="intake-form">
                <section className="form-card">
                    <div className="form-card__header">
                        <span>01</span>
                        <div>
                            <h2>Personal Information</h2>
                            <p>Demographics and direct contact information.</p>
                        </div>
                    </div>
                    <div className="form-grid">
                        <TextInput label="Full name" value={form.fullName} error={errors.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
                        <TextInput
                            label="Date of birth"
                            type="date"
                            value={form.dateOfBirth}
                            error={errors.dateOfBirth}
                            onChange={(event) => updateField("dateOfBirth", event.target.value)}
                        />
                        <ReceptionField label="Gender" error={errors.gender}>
                            <select value={form.gender} onChange={(event) => updateField("gender", event.target.value as Gender | "")}>
                                <option value="">Select gender</option>
                                {genderOptions.map((gender) => (
                                    <option key={gender} value={gender}>
                                        {GENDER_LABEL[gender]}
                                    </option>
                                ))}
                            </select>
                        </ReceptionField>
                        <TextInput label="Phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
                        <TextArea label="Address" value={form.address} onChange={(event) => updateField("address", event.target.value)} />
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <span>02</span>
                        <div>
                            <h2>Admission</h2>
                            <p>Room, admission date, care level, and assigned clinicians.</p>
                        </div>
                    </div>
                    <div className="form-grid">
                        <TextInput
                            label="Admission date"
                            type="date"
                            value={form.admissionDate}
                            error={errors.admissionDate}
                            onChange={(event) => updateField("admissionDate", event.target.value)}
                        />
                        <TextInput label="Room" value={form.roomNumber} error={errors.roomNumber} onChange={(event) => updateField("roomNumber", event.target.value)} />
                        <ReceptionField label="Care level" error={errors.careLevel}>
                            <select value={form.careLevel} onChange={(event) => updateField("careLevel", event.target.value as CareLevel | "")}>
                                <option value="">Select care level</option>
                                {careLevelOptions.map((level) => (
                                    <option key={level} value={level}>
                                        {CARE_LEVEL_LABEL[level]}
                                    </option>
                                ))}
                            </select>
                        </ReceptionField>
                        <TextInput label="Assigned nurse" value={form.assignedNurse} onChange={(event) => updateField("assignedNurse", event.target.value)} />
                        <TextInput label="Assigned physician" value={form.assignedDoctor} onChange={(event) => updateField("assignedDoctor", event.target.value)} />
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <span>03</span>
                        <div>
                            <h2>Emergency Contact</h2>
                            <p>Primary contact for urgent communication and consent.</p>
                        </div>
                    </div>
                    <div className="form-grid">
                        <TextInput
                            label="Contact name"
                            value={form.emergencyContactName}
                            error={errors.emergencyContactName}
                            onChange={(event) => updateField("emergencyContactName", event.target.value)}
                        />
                        <TextInput
                            label="Relationship"
                            value={form.emergencyContactRelationship}
                            onChange={(event) => updateField("emergencyContactRelationship", event.target.value)}
                        />
                        <TextInput
                            label="Phone"
                            value={form.emergencyContactPhone}
                            error={errors.emergencyContactPhone}
                            onChange={(event) => updateField("emergencyContactPhone", event.target.value)}
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={form.emergencyContactEmail}
                            error={errors.emergencyContactEmail}
                            onChange={(event) => updateField("emergencyContactEmail", event.target.value)}
                        />
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <span>04</span>
                        <div>
                            <h2>Clinical Summary</h2>
                            <p>Care notes visible from the resident profile.</p>
                        </div>
                    </div>
                    <div className="form-grid">
                        <TextInput label="Primary diagnosis" value={form.primaryDiagnosis} onChange={(event) => updateField("primaryDiagnosis", event.target.value)} />
                        <ReceptionField label="Mobility status">
                            <select value={form.mobilityStatus} onChange={(event) => updateField("mobilityStatus", event.target.value as MobilityStatus | "")}>
                                <option value="">Select mobility status</option>
                                {mobilityOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {MOBILITY_STATUS_LABEL[status]}
                                    </option>
                                ))}
                            </select>
                        </ReceptionField>
                        <TextArea label="Allergies" value={form.allergies} onChange={(event) => updateField("allergies", event.target.value)} />
                        <TextArea label="Current medications" value={form.currentMedications} onChange={(event) => updateField("currentMedications", event.target.value)} />
                    </div>
                </section>
            </form>

            <footer className="sticky-actions">
                <Link className="secondary-action" to={APP_ROUTES.RESIDENTS}>
                    Cancel
                </Link>
                <button className="primary-action" type="button" disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Resident"}
                </button>
            </footer>
        </main>
    );
}
