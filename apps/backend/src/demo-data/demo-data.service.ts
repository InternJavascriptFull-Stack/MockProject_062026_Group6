import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class DemoDataService {
  private readonly logger = new Logger(DemoDataService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to identify if a record is sample/demo data.
   * All sample records will have "sample" or similar pattern.
   * For Residents, we will use a specific flag or pattern.
   */
  private readonly SAMPLE_PREFIX = "Sample ";

  async getStatus() {
    const residentCount = await this.prisma.residents.count({
      where: { first_name: { startsWith: this.SAMPLE_PREFIX } }
    });

    const carePlanCount = await this.prisma.care_plans.count({
      where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
    });

    const incidentCount = await this.prisma.incidents.count({
      where: { description: { startsWith: "[Demo]" } }
    });

    const medicationCount = await this.prisma.medication_orders.count({
      where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
    });

    // Check if any sample data exists
    const hasData = residentCount > 0 || carePlanCount > 0 || incidentCount > 0 || medicationCount > 0;

    // Get last seeded timestamp (using last created resident as proxy)
    const lastResident = await this.prisma.residents.findFirst({
      where: { first_name: { startsWith: this.SAMPLE_PREFIX } },
      orderBy: { created_at: "desc" },
      select: { created_at: true }
    });

    return {
      seeded: hasData,
      status: hasData ? "COMPLETED" : "NOT_SEEDED",
      lastSeededAt: lastResident?.created_at ? lastResident.created_at.toISOString() : null,
      recordCounts: {
        residents: residentCount,
        carePlans: carePlanCount,
        incidents: incidentCount,
        medications: medicationCount
      }
    };
  }

  async seedAll(userId: string) {
    const status = await this.getStatus();
    if (status.seeded) {
      return { success: false, message: "Demo data already exists" };
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Ensure a default Facility exists
        let facility = await tx.facility.findFirst();
        if (!facility) {
          facility = await tx.facility.create({
            data: {
              facilityCode: "FAC001",
              name: "Default Care Facility",
              licenseNumber: "LIC123456",
              targetState: "TX"
            }
          });
        }

        // Link current user to facility if not done
        const userFacility = await tx.userFacility.findFirst({
          where: { userId, facilityId: facility.id }
        });
        if (!userFacility) {
          await tx.userFacility.create({
            data: {
              userId,
              facilityId: facility.id,
              isPrimary: true
            }
          });
        }

        // 2. Ensure rooms and beds exist
        let beds = await tx.beds.findMany({
          where: { rooms: { facility_id: facility.id } }
        });

        if (beds.length < 20) {
          // Create 10 rooms, 2 beds each
          for (let r = 1; r <= 10; r++) {
            const roomNumber = `R-${100 + r}`;
            let room = await tx.rooms.findFirst({
              where: { facility_id: facility.id, room_number: roomNumber }
            });
            if (!room) {
              room = await tx.rooms.create({
                data: {
                  facility_id: facility.id,
                  room_number: roomNumber,
                  room_type: "Semi-Private"
                }
              });
            }

            for (const bedNumber of ["A", "B"]) {
              const existingBed = await tx.beds.findFirst({
                where: { room_id: room.id, bed_number: bedNumber }
              });
              if (!existingBed) {
                await tx.beds.create({
                  data: {
                    room_id: room.id,
                    bed_number: bedNumber,
                    status: "AVAILABLE"
                  }
                });
              }
            }
          }
          // Fetch created beds
          beds = await tx.beds.findMany({
            where: { rooms: { facility_id: facility.id } }
          });
        }

        // 3. Create 20 sample Residents & Admissions
        const residentsData = Array.from({ length: 20 }).map((_, idx) => {
          const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
          const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
          
          return {
            first_name: `${this.SAMPLE_PREFIX}${firstNames[idx % firstNames.length]}`,
            last_name: lastNames[idx % lastNames.length],
            date_of_birth: new Date(1940 + (idx % 10), idx % 12, (idx % 28) + 1),
            gender: idx % 2 === 0 ? "MALE" : "FEMALE",
            status: "ACTIVE",
            bed_id: beds[idx % beds.length].id
          };
        });

        const createdResidents = [];
        for (const res of residentsData) {
          const resident = await tx.residents.create({
            data: {
              first_name: res.first_name,
              last_name: res.last_name,
              date_of_birth: res.date_of_birth,
              gender: res.gender,
              status: res.status,
              bed_id: res.bed_id,
              admissions: {
                create: {
                  facility_id: facility.id,
                  admission_date: new Date()
                }
              }
            }
          });
          createdResidents.push(resident);
        }

        // 4. Create 15 Care Plans
        const goalsList = ["Maintain mobility", "Pain management", "Improve nutrition", "Social engagement", "Skin integrity"];
        const interventionsList = ["Walk with assistance", "Administer prescribed pain relief", "Encourage high-protein diet", "Participate in daily activities", "Reposition every 2 hours"];
        
        for (let i = 0; i < 15; i++) {
          const resident = createdResidents[i];
          await tx.care_plans.create({
            data: {
              resident_id: resident.id,
              created_by: userId,
              status: i % 2 === 0 ? "Approved" : "Draft",
              significant_change_flag: false,
              care_goals: {
                create: [
                  { description: goalsList[i % goalsList.length], status: "IN_PROGRESS" }
                ]
              },
              care_interventions: {
                create: [
                  { description: interventionsList[i % interventionsList.length], assigned_role: "Nurse (RN/LPN)" }
                ]
              }
            }
          });
        }

        // 5. Ensure Incident Severities exist
        const severities = ["LOW", "MEDIUM", "HIGH"];
        const severityIds: Record<string, bigint> = {};
        for (const sev of severities) {
          let severity = await tx.incident_severities.findFirst({
            where: { level_name: sev }
          });
          if (!severity) {
            severity = await tx.incident_severities.create({
              data: {
                level_name: sev,
                chart_lock_trigger: sev === "HIGH"
              }
            });
          }
          severityIds[sev] = severity.id;
        }

        // 6. Create 8 Incidents
        const incidentTypes = ["FALL", "MEDICATION_ERROR", "BEHAVIORAL", "WOUND_ISSUE"];
        for (let i = 0; i < 8; i++) {
          const resident = createdResidents[i % createdResidents.length];
          const severityName = i % 3 === 2 ? "HIGH" : (i % 3 === 1 ? "MEDIUM" : "LOW");
          
          await tx.incidents.create({
            data: {
              incident_type: incidentTypes[i % incidentTypes.length],
              description: `[Demo] Sample incident description for ${resident.first_name}.`,
              resident_id: resident.id,
              reported_by: userId,
              severity_id: severityIds[severityName],
              sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h deadline
              status: "OPEN"
            }
          });
        }

        // 7. Create 40 Medications
        const drugs = ["Aspirin", "Metformin", "Lisinopril", "Atorvastatin", "Amlodipine", "Levothyroxine", "Gabapentin", "Omeprazole", "Furosemide", "Metoprolol"];
        const frequencies = ["Once daily", "Twice daily", "PRN (As needed)", "Every morning"];
        
        for (let i = 0; i < 40; i++) {
          const resident = createdResidents[i % createdResidents.length];
          await tx.medication_orders.create({
            data: {
              resident_id: resident.id,
              prescribed_by: userId,
              drug_name: drugs[i % drugs.length],
              dosage: `${(i % 3 + 1) * 5} mg`,
              route: "PO (Oral)",
              frequency: frequencies[i % frequencies.length],
              status: "ACTIVE"
            }
          });
        }
      });

      const stats = await this.getStatus();
      return {
        success: true,
        message: "Demo data seeded successfully",
        data: {
          usersCreated: 0,
          residentsCreated: stats.recordCounts.residents,
          staffCreated: 0,
          incidentsCreated: stats.recordCounts.incidents,
          seededAt: stats.lastSeededAt
        }
      };

    } catch (error: any) {
      this.logger.error("Failed to seed demo data: " + error.message, error.stack);
      throw error;
    }
  }

  async loadDataset(dataset: string, userId: string) {
    // Determine target entity
    // In NestJS we can also support load individual dataset if needed
    // However, since they have dependencies (Care plans -> Residents, etc.),
    // we should seed them sequentially or collectively.
    // For simplicity, we can load individual or just route it to seedAll.
    if (dataset === "residents") {
      // Just seed everything as they are related
      return this.seedAll(userId);
    }
    return this.seedAll(userId);
  }

  async clearAll() {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Clear related child entities first to avoid FK constraints
        
        // 1. Delete incident relation entities
        await tx.chart_lock_events.deleteMany({
          where: { incidents: { description: { startsWith: "[Demo]" } } }
        });
        await tx.incidents.deleteMany({
          where: { description: { startsWith: "[Demo]" } }
        });

        // 2. Delete medication relation entities
        await tx.medication_logs.deleteMany({
          where: { medication_orders: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } }
        });
        await tx.medication_schedules.deleteMany({
          where: { medication_orders: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } }
        });
        await tx.medication_orders.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });

        // 3. Delete Care Plan relation entities
        await tx.care_tasks.deleteMany({
          where: { care_interventions: { care_plans: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } } }
        });
        await tx.care_interventions.deleteMany({
          where: { care_plans: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } }
        });
        await tx.care_goals.deleteMany({
          where: { care_plans: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } }
        });
        await tx.care_plan_reviews.deleteMany({
          where: { care_plans: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } }
        });
        await tx.care_plan_signatures.deleteMany({
          where: { care_plans: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } }
        });
        await tx.idt_acknowledgments.deleteMany({
          where: { care_plans: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } } }
        });
        await tx.care_plans.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });

        // 4. Delete Admissions and Residents
        await tx.admissions.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        await tx.clinical_records.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        await tx.vital_signs.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        await tx.resident_care_level_history.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        await tx.resident_contacts.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        await tx.resident_insurance_policies.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        await tx.resident_sensitive_info.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        await tx.pre_admission_screenings.deleteMany({
          where: { residents: { first_name: { startsWith: this.SAMPLE_PREFIX } } }
        });
        
        // Remove residents
        await tx.residents.deleteMany({
          where: { first_name: { startsWith: this.SAMPLE_PREFIX } }
        });
      });

      return { success: true, message: "Demo data cleared successfully" };
    } catch (error: any) {
      this.logger.error("Failed to clear demo data: " + error.message, error.stack);
      throw error;
    }
  }

  async clearDataset(_dataset: string) {
    // If clearing specific, we will route to clearAll since they are linked.
    return this.clearAll();
  }
}
