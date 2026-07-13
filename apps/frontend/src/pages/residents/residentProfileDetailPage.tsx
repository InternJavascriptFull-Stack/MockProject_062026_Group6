import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import { CARE_LEVEL_LABEL, COGNITIVE_STATUS_LABEL, FALL_RISK_LABEL, GENDER_LABEL, MOBILITY_STATUS_LABEL, RESIDENT_STATUS_LABEL } from "./constants";
import { ResidentStatusBadge } from "./components/residentStatusBadge";
import { calculateAge, residentRepository } from "./services/residentRepository";
import type { Resident, ResidentStatus } from "./types";

const residentStatuses: ResidentStatus[] = ["pending", "under_evaluation", "admitted", "discharged"];

const displayValue = (value?: string | number) => (value === undefined || value === "" ? "Not recorded" : String(value));

export function ResidentProfileDetailPage() {
    const { id } = useParams();
    const [resident, setResident] = useState<Resident | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!id) {
            setErrorMessage("Resident ID is missing.");
            setIsLoading(false);
            return;
        }

        let isActive = true;
        setIsLoading(true);

        residentRepository
            .getResident(id)
            .then((result) => {
                if (isActive) {
                    setResident(result);
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

    const handleStatusChange = async (status: ResidentStatus) => {
        if (!id || !resident || resident.status === status) {
            return;
        }

        setIsUpdatingStatus(true);
        setErrorMessage("");

        try {
            const updatedResident = await residentRepository.updateStatus(id, {
                status,
            });
            setResident(updatedResident);
        } catch {
            setErrorMessage("Unable to update resident status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (isLoading) {
        return (
            <main className="page-shell">
                <div className="empty-state">
                    <strong>Loading resident profile...</strong>
                    <span>Fetching resident details.</span>
                </div>
            </main>
        );
    }

    if (!resident) {
        return (
            <main className="page-shell">
                <div className="empty-state">
                    <strong>Resident not found</strong>
                    <span>{errorMessage || "The requested resident does not exist."}</span>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <section className="page-header">
                <div>
                    <span className="eyebrow">Resident Profile</span>
                    <h1>{resident.fullName}</h1>
                    <p>
                        {resident.residentCode} · Room {resident.roomNumber ?? "Unassigned"} · {CARE_LEVEL_LABEL[resident.careLevel]}
                    </p>
                </div>
                <div className="header-actions">
                    <Link className="secondary-action" to={APP_ROUTES.RESIDENTS}>
                        Back to List
                    </Link>
                    <Link className="primary-action" to={`${APP_ROUTES.RESIDENTS}/${resident.id}/edit`}>
                        Edit Resident
                    </Link>
                </div>
            </section>

            {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

            <section className="profile-hero">
                <div className="profile-avatar" aria-hidden="true">
                    {resident.fullName
                        .split(" ")
                        .map((name) => name[0])
                        .slice(0, 2)
                        .join("")}
                </div>
                <div>
                    <h2>{resident.fullName}</h2>
                    <p>
                        {calculateAge(resident.dateOfBirth)} years old · {GENDER_LABEL[resident.gender]} · Admitted {resident.admissionDate}
                    </p>
                </div>
                <ResidentStatusBadge status={resident.status} />
            </section>

            <section className="profile-grid">
                <article className="detail-panel">
                    <h2>Admission</h2>
                    <dl className="detail-list">
                        <div>
                            <dt>Room</dt>
                            <dd>{displayValue(resident.roomNumber)}</dd>
                        </div>
                        <div>
                            <dt>Care level</dt>
                            <dd>{CARE_LEVEL_LABEL[resident.careLevel]}</dd>
                        </div>
                        <div>
                            <dt>Assigned nurse</dt>
                            <dd>{displayValue(resident.assignedNurse)}</dd>
                        </div>
                        <div>
                            <dt>Assigned physician</dt>
                            <dd>{displayValue(resident.assignedDoctor)}</dd>
                        </div>
                    </dl>
                </article>

                <article className="detail-panel">
                    <h2>Status</h2>
                    <label className="field">
                        <span>Resident status</span>
                        <select value={resident.status} disabled={isUpdatingStatus} onChange={(event) => handleStatusChange(event.target.value as ResidentStatus)}>
                            {residentStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {RESIDENT_STATUS_LABEL[status]}
                                </option>
                            ))}
                        </select>
                    </label>
                </article>

                <article className="detail-panel">
                    <h2>Emergency Contact</h2>
                    <dl className="detail-list">
                        <div>
                            <dt>Name</dt>
                            <dd>{resident.emergencyContactName}</dd>
                        </div>
                        <div>
                            <dt>Relationship</dt>
                            <dd>{displayValue(resident.emergencyContactRelationship)}</dd>
                        </div>
                        <div>
                            <dt>Phone</dt>
                            <dd>{resident.emergencyContactPhone}</dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd>{displayValue(resident.emergencyContactEmail)}</dd>
                        </div>
                    </dl>
                </article>

                <article className="detail-panel">
                    <h2>Medical Summary</h2>
                    <dl className="detail-list">
                        <div>
                            <dt>Primary diagnosis</dt>
                            <dd>{displayValue(resident.primaryDiagnosis)}</dd>
                        </div>
                        <div>
                            <dt>Allergies</dt>
                            <dd>{displayValue(resident.allergies)}</dd>
                        </div>
                        <div>
                            <dt>Current medications</dt>
                            <dd>{displayValue(resident.currentMedications)}</dd>
                        </div>
                        <div>
                            <dt>Mobility</dt>
                            <dd>{resident.mobilityStatus ? MOBILITY_STATUS_LABEL[resident.mobilityStatus] : "Not recorded"}</dd>
                        </div>
                    </dl>
                </article>

                <article className="detail-panel detail-panel--wide">
                    <h2>Pre-admission Screening</h2>
                    <dl className="detail-list detail-list--three">
                        <div>
                            <dt>Cognitive status</dt>
                            <dd>{resident.cognitiveStatus ? COGNITIVE_STATUS_LABEL[resident.cognitiveStatus] : "Not recorded"}</dd>
                        </div>
                        <div>
                            <dt>Fall risk</dt>
                            <dd>{resident.fallRisk ? FALL_RISK_LABEL[resident.fallRisk] : "Not recorded"}</dd>
                        </div>
                        <div>
                            <dt>Pain level</dt>
                            <dd>{displayValue(resident.painLevel)}</dd>
                        </div>
                        <div>
                            <dt>Nutrition notes</dt>
                            <dd>{displayValue(resident.nutritionNotes)}</dd>
                        </div>
                        <div>
                            <dt>Clinical notes</dt>
                            <dd>{displayValue(resident.clinicalNotes)}</dd>
                        </div>
                    </dl>
                </article>
            </section>
        </main>
    );
}
