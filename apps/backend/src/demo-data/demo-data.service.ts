import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class DemoDataService {
    private readonly logger = new Logger(DemoDataService.name);

    constructor(private readonly prisma: PrismaService) {}

    private readonly SAMPLE_PREFIX = "Sample ";

    async getStatus() {
        const residentCount = await this.prisma.residents.count({
            where: { first_name: { startsWith: this.SAMPLE_PREFIX } },
        });

        const carePlanCount = await this.prisma.care_plans.count({
            where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } },
        });

        const incidentCount = await this.prisma.incidents.count({
            where: { description: { startsWith: "[Demo]" } },
        });

        const medicationCount = await this.prisma.medication_orders.count({
            where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } },
        });

        const hasData = residentCount > 0 || carePlanCount > 0 || incidentCount > 0 || medicationCount > 0;

        const lastResident = await this.prisma.residents.findFirst({
            where: { first_name: { startsWith: this.SAMPLE_PREFIX } },
            orderBy: { created_at: "desc" },
            select: { created_at: true },
        });

        return {
            seeded: hasData,
            status: hasData ? "COMPLETED" : "NOT_SEEDED",
            lastSeededAt: lastResident?.created_at ? lastResident.created_at.toISOString() : null,
            recordCounts: {
                residents: residentCount,
                carePlans: carePlanCount,
                incidents: incidentCount,
                medications: medicationCount,
            },
        };
    }

    async seedAll(userId: string) {
        try {
            await this.clearAll();
        } catch (err: any) {
            this.logger.warn("Clear before seed warning: " + err.message);
        }

        try {
            await this.prisma.$transaction(
                async (tx) => {
                // 1. Ensure Facility
                let facility = await tx.facility.findFirst();
                if (!facility) {
                    facility = await tx.facility.create({
                        data: {
                            facilityCode: "FAC-0042",
                            name: "NHMS Skilled Nursing & Assisted Living",
                            licenseNumber: "LIC-CA-998822",
                            targetState: "CA",
                        },
                    });
                }

                // Ensure UserFacility link
                const userFacility = await tx.userFacility.findFirst({
                    where: { userId, facilityId: facility.id },
                });
                if (!userFacility) {
                    await tx.userFacility.create({
                        data: {
                            userId,
                            facilityId: facility.id,
                            isPrimary: true,
                        },
                    });
                }

                // 2. Create Rooms (25 rooms x 2 beds = 50 beds)
                let beds = await tx.beds.findMany({
                    where: { rooms: { facility_id: facility.id } },
                });

                if (beds.length < 50) {
                    for (let r = 1; r <= 25; r++) {
                        const roomNum = (100 + r).toString();
                        let room = await tx.rooms.findFirst({
                            where: { facility_id: facility.id, room_number: roomNum },
                        });
                        if (!room) {
                            room = await tx.rooms.create({
                                data: {
                                    facility_id: facility.id,
                                    room_number: roomNum,
                                    room_type: r % 4 === 0 ? "Private" : "Semi-Private",
                                },
                            });
                        }

                        for (const bedLetter of ["A", "B"]) {
                            const existingBed = await tx.beds.findFirst({
                                where: { room_id: room.id, bed_number: bedLetter },
                            });
                            if (!existingBed) {
                                await tx.beds.create({
                                    data: {
                                        room_id: room.id,
                                        bed_number: bedLetter,
                                        status: "AVAILABLE",
                                    },
                                });
                            }
                        }
                    }

                    beds = await tx.beds.findMany({
                        where: { rooms: { facility_id: facility.id } },
                    });
                }

                // 3. Ensure Care Levels
                const careLevelsData = [
                    { levelCode: "INDEPENDENT_LIVING", levelName: "Tier 1 - Independent" },
                    { levelCode: "ASSISTED_LIVING", levelName: "Tier 2 - Moderate Support" },
                    { levelCode: "MEMORY_CARE", levelName: "Tier 3 - Memory Care" },
                    { levelCode: "SKILLED_NURSING", levelName: "Tier 4 - Total Care" },
                ];
                const careLevelIds: bigint[] = [];
                for (const cl of careLevelsData) {
                    let level = await tx.care_levels.findFirst({ where: { level_code: cl.levelCode } });
                    if (!level) {
                        level = await tx.care_levels.create({
                            data: { level_code: cl.levelCode, level_name: cl.levelName },
                        });
                    }
                    careLevelIds.push(level.id);
                }

                // 4. Create 50 Sample Residents & Admissions
                const firstNames = [
                    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
                    "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
                    "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
                    "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
                    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah"
                ];
                const lastNames = [
                    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
                    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
                    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
                ];

                const createdResidents: Array<{ id: string; first_name: string; last_name: string }> = [];

                for (let i = 0; i < 50; i++) {
                    const bed = beds[i % beds.length];
                    const gender = i % 2 === 0 ? "MALE" : "FEMALE";
                    const status = i < 40 ? "ACTIVE" : i < 46 ? "PENDING" : "DISCHARGED";

                    const resident = await tx.residents.create({
                        data: {
                            first_name: `${this.SAMPLE_PREFIX}${firstNames[i]}`,
                            last_name: lastNames[i],
                            date_of_birth: new Date(1935 + (i % 20), (i * 3) % 12, (i % 27) + 1),
                            gender,
                            marital_status: i % 3 === 0 ? "WIDOWED" : i % 2 === 0 ? "MARRIED" : "SINGLE",
                            religion_preference: i % 4 === 0 ? "Catholic" : i % 3 === 0 ? "Protestant" : "None",
                            status,
                            bed_id: status === "ACTIVE" ? bed.id : null,
                            admissions: {
                                create: {
                                    facility_id: facility.id,
                                    admission_date: new Date(Date.now() - (i + 1) * 15 * 24 * 60 * 60 * 1000),
                                },
                            },
                        },
                    });

                    createdResidents.push({ id: resident.id, first_name: resident.first_name, last_name: resident.last_name });
                }

                // 5. Create Vitals Signs for all Active Residents (3 entries each)
                for (const resident of createdResidents.slice(0, 40)) {
                    for (let v = 0; v < 3; v++) {
                        const systolic = 115 + (v * 7) + (Math.floor(Math.random() * 15));
                        const diastolic = 75 + (v * 4) + (Math.floor(Math.random() * 10));
                        const hr = 68 + (v * 5) + Math.floor(Math.random() * 12);
                        const temp = 97.8 + (v * 0.4) + Math.random() * 0.8;
                        const spo2 = 95 + Math.floor(Math.random() * 5);

                        await tx.vital_signs.create({
                            data: {
                                resident_id: resident.id,
                                recorded_by: userId,
                                blood_pressure_systolic: systolic,
                                blood_pressure_diastolic: diastolic,
                                heart_rate_bpm: hr,
                                respiratory_rate: 16 + (v % 4),
                                temperature_fahrenheit: Number(temp.toFixed(1)),
                                spo2_percentage: spo2,
                                pain_scale: v % 2 === 0 ? 0 : 2,
                                notes: v === 0 ? "Routine morning vitals check" : "Post-medication vitals",
                                recorded_at: new Date(Date.now() - (v * 8 * 60 * 60 * 1000)),
                            },
                        });
                    }
                }

                // 6. Create Assessments & Care Level History
                for (let i = 0; i < 35; i++) {
                    const resident = createdResidents[i];
                    const selectedCareLevelId = careLevelIds[i % careLevelIds.length];

                    await tx.assessments.create({
                        data: {
                            resident_id: resident.id,
                            assessed_by: userId,
                            suggested_care_level_id: selectedCareLevelId,
                            confirmed_care_level_id: selectedCareLevelId,
                            adl_total_score: 18 + (i % 10),
                            is_overridden: false,
                        },
                    });

                    await tx.resident_care_level_history.create({
                        data: {
                            resident_id: resident.id,
                            care_level_id: selectedCareLevelId,
                            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    });
                }

                // 7. Create 35 Care Plans, Goals, Interventions & Tasks
                const goalsList = [
                    "Maintain mobility and joint range of motion",
                    "Effective pain management during daily activities",
                    "Improve daily nutritional intake and weight control",
                    "Encourage social interaction and cognitive activities",
                    "Prevent skin integrity breakdown and pressure injury",
                    "Assist with personal hygiene and self-care tasks"
                ];

                const interventionsList = [
                    "Perform guided range-of-motion exercises twice daily",
                    "Administer prescribed pain medication 30m before physical therapy",
                    "Provide high-protein dietary supplements with meals",
                    "Escort to daily group activities in the community hall",
                    "Reposition every 2 hours while in bed; apply barrier cream",
                    "Assist with bathing, dressing, and oral care each morning"
                ];

                for (let i = 0; i < 35; i++) {
                    const resident = createdResidents[i];
                    const cpStatus = i % 3 === 0 ? "Approved" : i % 3 === 1 ? "Draft" : "Active";

                    const carePlan = await tx.care_plans.create({
                        data: {
                            resident_id: resident.id,
                            created_by: userId,
                            status: cpStatus,
                            significant_change_flag: i % 7 === 0,
                            care_goals: {
                                create: [
                                    { description: goalsList[i % goalsList.length], status: "IN_PROGRESS" },
                                    { description: goalsList[(i + 1) % goalsList.length], status: "IN_PROGRESS" },
                                ],
                            },
                            care_interventions: {
                                create: [
                                    { description: interventionsList[i % interventionsList.length], assigned_role: "Nurse (RN/LPN)" },
                                    { description: interventionsList[(i + 1) % interventionsList.length], assigned_role: "CNA" },
                                ],
                            },
                        },
                        include: { care_interventions: true },
                    });

                    // Add Care Tasks for each intervention
                    for (const intervention of carePlan.care_interventions) {
                        await tx.care_tasks.create({
                            data: {
                                care_intervention_id: intervention.id,
                                assigned_cna_id: userId,
                                task_type: "BEDSIDE_CARE",
                                scheduled_time: new Date(Date.now() + (i % 12) * 60 * 60 * 1000),
                                status: i % 2 === 0 ? "PENDING" : "COMPLETED",
                                completed_at: i % 2 === 0 ? null : new Date(),
                            },
                        });
                    }
                }

                // 8. Ensure Incident Severities
                const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
                const severityIds: Record<string, bigint> = {};
                for (const sev of severities) {
                    let severity = await tx.incident_severities.findFirst({ where: { level_name: sev } });
                    if (!severity) {
                        severity = await tx.incident_severities.create({
                            data: {
                                level_name: sev,
                                chart_lock_trigger: ["HIGH", "CRITICAL"].includes(sev),
                                description: `${sev} level severity incident`,
                            },
                        });
                    }
                    severityIds[sev] = severity.id;
                }

                // 9. Create 20 Incidents
                const incidentTypes = ["FALL", "MEDICATION_ERROR", "BEHAVIORAL", "WOUND_ISSUE", "EQUIPMENT_FAILURE"];
                for (let i = 0; i < 20; i++) {
                    const resident = createdResidents[i % createdResidents.length];
                    const severityName = severities[i % severities.length];
                    const incStatus = i % 4 === 0 ? "OPEN" : i % 4 === 1 ? "UNDER_INVESTIGATION" : i % 4 === 2 ? "PENDING_REVIEW" : "RESOLVED";

                    const incident = await tx.incidents.create({
                        data: {
                            incident_type: incidentTypes[i % incidentTypes.length],
                            description: `[Demo] ${severityName} severity incident reported for ${resident.first_name} ${resident.last_name}. Requires monitoring.`,
                            resident_id: resident.id,
                            reported_by: userId,
                            severity_id: severityIds[severityName],
                            sla_deadline: new Date(Date.now() + (24 + (i % 12)) * 60 * 60 * 1000),
                            status: incStatus,
                        },
                    });

                    // Add progress note
                    await tx.clinical_records.create({
                        data: {
                            resident_id: resident.id,
                            recorded_by: userId,
                            record_type: "INCIDENT_NOTE",
                            description: JSON.stringify({
                                incidentId: incident.id,
                                note: `Initial assessment completed for ${incident.incident_type}. Vital signs stable.`,
                                noteType: "PROGRESS",
                            }),
                        },
                    });

                    // Add Lock Event if High/Critical
                    if (["HIGH", "CRITICAL"].includes(severityName)) {
                        await tx.residents.update({
                            where: { id: resident.id },
                            data: { is_chart_locked: true },
                        });

                        await tx.chart_lock_events.create({
                            data: {
                                incident_id: incident.id,
                                locked_by_system: true,
                                lock_reason: `${severityName} severity incident automatically locked the chart`,
                            },
                        });
                    }
                }

                // 10. Create 60 Medication Orders
                const drugs = [
                    { name: "Aspirin", dose: "81 mg", route: "PO (Oral)", freq: "Once daily" },
                    { name: "Metformin", dose: "500 mg", route: "PO (Oral)", freq: "Twice daily with meals" },
                    { name: "Lisinopril", dose: "10 mg", route: "PO (Oral)", freq: "Once daily in morning" },
                    { name: "Atorvastatin", dose: "20 mg", route: "PO (Oral)", freq: "At bedtime" },
                    { name: "Amlodipine", dose: "5 mg", route: "PO (Oral)", freq: "Once daily" },
                    { name: "Levothyroxine", dose: "50 mcg", route: "PO (Oral)", freq: "Once daily before breakfast" },
                    { name: "Gabapentin", dose: "300 mg", route: "PO (Oral)", freq: "Three times daily" },
                    { name: "Omeprazole", dose: "20 mg", route: "PO (Oral)", freq: "Once daily before meals" },
                    { name: "Furosemide", dose: "40 mg", route: "PO (Oral)", freq: "Once daily in morning" },
                    { name: "Metoprolol Succinate", dose: "25 mg", route: "PO (Oral)", freq: "Once daily" },
                ];

                for (let i = 0; i < 60; i++) {
                    const resident = createdResidents[i % createdResidents.length];
                    const drug = drugs[i % drugs.length];

                    const order = await tx.medication_orders.create({
                        data: {
                            resident_id: resident.id,
                            prescribed_by: userId,
                            drug_name: drug.name,
                            dosage: drug.dose,
                            route: drug.route,
                            frequency: drug.freq,
                            is_controlled_substance: i % 10 === 0,
                            status: "ACTIVE",
                        },
                    });

                    // Add Medication Log
                    await tx.medication_logs.create({
                        data: {
                            order_id: order.id,
                            administered_by: userId,
                            status: "GIVEN",
                            is_clinically_justified: true,
                        },
                    });
                }

                // 11. Create Invoices & Line Items (20 Invoices)
                for (let i = 0; i < 20; i++) {
                    const resident = createdResidents[i];
                    const baseAmount = 4500.00 + (i * 150);
                    const medicare = baseAmount * 0.6;
                    const patientResp = baseAmount * 0.4;

                    const invoice = await tx.invoices.create({
                        data: {
                            resident_id: resident.id,
                            billing_period_start: new Date("2026-06-01"),
                            billing_period_end: new Date("2026-06-30"),
                            total_amount: baseAmount,
                            medicare_covered_amount: medicare,
                            patient_responsibility_amount: patientResp,
                            status: i % 3 === 0 ? "PAID" : i % 3 === 1 ? "ISSUED" : "DRAFT",
                            due_date: new Date("2026-07-31"),
                        },
                    });

                    await tx.invoice_line_items.createMany({
                        data: [
                            { invoice_id: invoice.id, description: "Monthly Room & Board (Semi-Private)", item_type: "ROOM_BOARD", amount: 3200.00 },
                            { invoice_id: invoice.id, description: "Skilled Nursing & ADL Care Level 2", item_type: "CARE_LEVEL", amount: 1000.00 },
                            { invoice_id: invoice.id, description: "Medication Administration & Supplies", item_type: "SUPPLIES", amount: 300.00 },
                        ],
                    });
                }
            }, { timeout: 60000 });

            const stats = await this.getStatus();
            return {
                success: true,
                message: "Demo data seeded successfully with abundant records",
                data: {
                    usersCreated: 0,
                    residentsCreated: stats.recordCounts.residents,
                    carePlansCreated: stats.recordCounts.carePlans,
                    incidentsCreated: stats.recordCounts.incidents,
                    medicationsCreated: stats.recordCounts.medications,
                    seededAt: stats.lastSeededAt,
                },
            };
        } catch (error: any) {
            this.logger.error("Failed to seed demo data: " + error.message, error.stack);
            throw error;
        }
    }

    async loadDataset(_dataset: string, userId: string) {
        return this.seedAll(userId);
    }

    async clearAll() {
        try {
            await this.prisma.$transaction(async (tx) => {
                // Delete child relations first
                await tx.invoice_line_items.deleteMany({});
                await tx.payments.deleteMany({});
                await tx.invoices.deleteMany({});

                await tx.chart_lock_events.deleteMany({});
                await tx.incidents.deleteMany({});

                await tx.medication_logs.deleteMany({});
                await tx.medication_schedules.deleteMany({});
                await tx.medication_orders.deleteMany({});

                await tx.care_tasks.deleteMany({});
                await tx.care_interventions.deleteMany({});
                await tx.care_goals.deleteMany({});
                await tx.care_plan_reviews.deleteMany({});
                await tx.care_plan_signatures.deleteMany({});
                await tx.idt_acknowledgments.deleteMany({});
                await tx.care_plans.deleteMany({});

                await tx.vital_signs.deleteMany({});
                await tx.assessment_details.deleteMany({});
                await tx.assessments.deleteMany({});

                await tx.admissions.deleteMany({});
                await tx.clinical_records.deleteMany({});
                await tx.resident_care_level_history.deleteMany({});
                await tx.resident_contacts.deleteMany({});
                await tx.resident_insurance_policies.deleteMany({});
                await tx.resident_sensitive_info.deleteMany({});
                await tx.pre_admission_screenings.deleteMany({});

                await tx.residents.deleteMany({
                    where: { first_name: { startsWith: this.SAMPLE_PREFIX } },
                });
            }, { timeout: 60000 });

            return { success: true, message: "Demo data cleared successfully" };
        } catch (error: any) {
            this.logger.error("Failed to clear demo data: " + error.message, error.stack);
            throw error;
        }
    }

    async clearDataset(_dataset: string) {
        return this.clearAll();
    }
}
