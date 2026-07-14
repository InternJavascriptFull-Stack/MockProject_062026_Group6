import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { z } from "zod";
import { CARE_LEVEL_LABEL, COGNITIVE_STATUS_LABEL, FALL_RISK_LABEL, GENDER_LABEL, MOBILITY_STATUS_LABEL } from "./constants";
import { ReceptionField, TextArea, TextInput } from "./components/receptionField";
import { residentRepository } from "./services/residentRepository";
import type { CareLevel, CognitiveStatus, FallRisk, Gender, MobilityStatus, ResidentEvaluationPayload } from "./types";

type FlatReceptionForm = {
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
    cognitiveStatus: CognitiveStatus | "";
    fallRisk: FallRisk | "";
    painLevel: number;
    nutritionNotes: string;
    clinicalNotes: string;
};

type FormErrors = Partial<Record<keyof FlatReceptionForm, string>>;

const genderOptions: Gender[] = ["female", "male", "other"];
const careLevelOptions: CareLevel[] = ["independent", "assisted_living", "memory_care", "skilled_nursing"];
const mobilityOptions: MobilityStatus[] = ["independent", "walker", "wheelchair", "bed_bound"];
const cognitiveOptions: CognitiveStatus[] = ["alert_oriented", "mild_impairment", "moderate_impairment", "severe_impairment"];
const fallRiskOptions: FallRisk[] = ["low", "medium", "high"];

const formSchema = z.object({
    fullName: z.string().trim().min(2, "Full name is required."),
    dateOfBirth: z.string().min(1, "Date of birth is required."),
    gender: z.enum(["male", "female", "other"], "Gender is required."),
    phone: z.string(),
    address: z.string(),
    admissionDate: z.string().min(1, "Admission date is required."),
    roomNumber: z.string(),
    careLevel: z.enum(["independent", "assisted_living", "memory_care", "skilled_nursing"], "Care level is required."),
    assignedNurse: z.string(),
    assignedDoctor: z.string(),
    emergencyContactName: z.string().trim().min(2, "Emergency contact name is required."),
    emergencyContactRelationship: z.string(),
    emergencyContactPhone: z.string().trim().min(7, "Emergency contact phone is required."),
    emergencyContactEmail: z.string().email("Enter a valid email address.").or(z.literal("")),
    primaryDiagnosis: z.string(),
    allergies: z.string(),
    currentMedications: z.string(),
    mobilityStatus: z.enum(["independent", "walker", "wheelchair", "bed_bound"]).or(z.literal("")),
    cognitiveStatus: z.enum(["alert_oriented", "mild_impairment", "moderate_impairment", "severe_impairment"]).or(z.literal("")),
    fallRisk: z.enum(["low", "medium", "high"]).or(z.literal("")),
    painLevel: z.coerce.number().min(0).max(10),
    nutritionNotes: z.string(),
    clinicalNotes: z.string(),
});

const initialForm: FlatReceptionForm = {
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
    cognitiveStatus: "",
    fallRisk: "",
    painLevel: 0,
    nutritionNotes: "",
    clinicalNotes: "",
};

const toPayload = (form: FlatReceptionForm): ResidentEvaluationPayload => ({
    personalInfo: {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        address: form.address,
    },
    admissionInfo: {
        admissionDate: form.admissionDate,
        roomNumber: form.roomNumber,
        careLevel: form.careLevel,
        assignedNurse: form.assignedNurse,
        assignedDoctor: form.assignedDoctor,
    },
    emergencyContact: {
        name: form.emergencyContactName,
        relationship: form.emergencyContactRelationship,
        phone: form.emergencyContactPhone,
        email: form.emergencyContactEmail,
    },
    medicalSummary: {
        primaryDiagnosis: form.primaryDiagnosis,
        allergies: form.allergies,
        currentMedications: form.currentMedications,
        mobilityStatus: form.mobilityStatus,
    },
    initialEvaluation: {
        cognitiveStatus: form.cognitiveStatus,
        fallRisk: form.fallRisk,
        painLevel: form.painLevel,
        nutritionNotes: form.nutritionNotes,
        clinicalNotes: form.clinicalNotes,
    },
});

export function ResidentReceptionPage() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const completionScore = useMemo(() => {
        const requiredFields: Array<keyof FlatReceptionForm> = ["fullName", "dateOfBirth", "gender", "admissionDate", "careLevel", "emergencyContactName", "emergencyContactPhone"];
        const completedFields = requiredFields.filter((field) => String(form[field]).trim());

        return Math.round((completedFields.length / requiredFields.length) * 100);
    }, [form]);

    const updateField = <Key extends keyof FlatReceptionForm>(field: Key, value: FlatReceptionForm[Key]) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
        setErrors((currentErrors) => ({
            ...currentErrors,
            [field]: undefined,
        }));
        setSuccessMessage("");
    };

    const validateForm = () => {
        const result = formSchema.safeParse(form);

        if (result.success) {
            setErrors({});
            return true;
        }

        const nextErrors: FormErrors = {};

        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof FlatReceptionForm;
            nextErrors[field] = issue.message;
        }

        setErrors(nextErrors);
        return false;
    };

    const handleSubmit = async (mode: "draft" | "submit") => {
        if (mode === "submit" && !validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const resident = await residentRepository.createPreScreening(toPayload(form));
            setSuccessMessage(mode === "draft" ? `Draft saved for ${resident.fullName}.` : `${resident.fullName} is ready for clinical review.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-shell">
            <section className="page-header">
                <div>
                    <span className="eyebrow">Reception & Evaluation</span>
                    <h1>Pre-admission Screening</h1>
                    <p>Capture admission details, emergency contact, medical background, and the initial nursing evaluation.</p>
                </div>
                <Link className="secondary-action" to={APP_ROUTES.RESIDENTS}>
                    Back to List
                </Link>
            </section>

            <section className="intake-summary">
                <div>
                    <strong>{completionScore}% complete</strong>
                    <span>Required intake information</span>
                </div>
                <div className="progress-track">
                    <div style={{ width: `${completionScore}%` }} />
                </div>
            </section>

            {successMessage ? <div className="success-banner">{successMessage}</div> : null}

            <form className="intake-form">
                <section className="form-card">
                    <div className="form-card__header">
                        <span>01</span>
                        <div>
                            <h2>Personal Information</h2>
                            <p>Basic demographic and contact details.</p>
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
                        <TextArea label="Home address" value={form.address} onChange={(event) => updateField("address", event.target.value)} />
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <span>02</span>
                        <div>
                            <h2>Admission Information</h2>
                            <p>Assign the resident to the right care workflow.</p>
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
                        <TextInput label="Room number" placeholder="A-104" value={form.roomNumber} onChange={(event) => updateField("roomNumber", event.target.value)} />
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
                        <TextInput
                            label="Assigned nurse"
                            placeholder="Sarah Johnson, RN"
                            value={form.assignedNurse}
                            onChange={(event) => updateField("assignedNurse", event.target.value)}
                        />
                        <TextInput
                            label="Assigned physician"
                            placeholder="Dr. Michael Brown"
                            value={form.assignedDoctor}
                            onChange={(event) => updateField("assignedDoctor", event.target.value)}
                        />
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <span>03</span>
                        <div>
                            <h2>Emergency Contact</h2>
                            <p>Primary contact for consent and urgent communication.</p>
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
                            placeholder="Daughter"
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
                            <h2>Medical Summary</h2>
                            <p>Clinical background for the receiving care team.</p>
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
                        <TextArea label="Known allergies" value={form.allergies} onChange={(event) => updateField("allergies", event.target.value)} />
                        <TextArea label="Current medications" value={form.currentMedications} onChange={(event) => updateField("currentMedications", event.target.value)} />
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <span>05</span>
                        <div>
                            <h2>Initial Evaluation</h2>
                            <p>Risk screening and nursing notes at admission.</p>
                        </div>
                    </div>
                    <div className="form-grid">
                        <ReceptionField label="Cognitive status">
                            <select value={form.cognitiveStatus} onChange={(event) => updateField("cognitiveStatus", event.target.value as CognitiveStatus | "")}>
                                <option value="">Select cognitive status</option>
                                {cognitiveOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {COGNITIVE_STATUS_LABEL[status]}
                                    </option>
                                ))}
                            </select>
                        </ReceptionField>
                        <ReceptionField label="Fall risk">
                            <select value={form.fallRisk} onChange={(event) => updateField("fallRisk", event.target.value as FallRisk | "")}>
                                <option value="">Select fall risk</option>
                                {fallRiskOptions.map((risk) => (
                                    <option key={risk} value={risk}>
                                        {FALL_RISK_LABEL[risk]}
                                    </option>
                                ))}
                            </select>
                        </ReceptionField>
                        <TextInput
                            label="Pain level (0-10)"
                            type="number"
                            min={0}
                            max={10}
                            value={form.painLevel}
                            onChange={(event) => updateField("painLevel", Number(event.target.value))}
                        />
                        <TextArea label="Nutrition notes" value={form.nutritionNotes} onChange={(event) => updateField("nutritionNotes", event.target.value)} />
                        <TextArea label="Clinical notes" value={form.clinicalNotes} onChange={(event) => updateField("clinicalNotes", event.target.value)} />
                    </div>
                </section>
            </form>

            <footer className="sticky-actions">
                <button className="secondary-action" type="button" disabled={isSubmitting} onClick={() => handleSubmit("draft")}>
                    Save Draft
                </button>
                <button className="primary-action" type="button" disabled={isSubmitting} onClick={() => handleSubmit("submit")}>
                    {isSubmitting ? "Saving..." : "Submit Evaluation"}
                </button>
            </footer>
        </main>
    );
}
