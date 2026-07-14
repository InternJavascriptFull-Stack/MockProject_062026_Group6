/**
 * Prisma seed script.
 * Run with:  npx prisma db seed
 * Configure in package.json:
 *   "prisma": { "seed": "ts-node prisma/seed.ts" }
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;
const DEFAULT_FACILITY_CODE = "FAC-0042";

const careLevelSeed = [
  {
    levelCode: "INDEPENDENT_LIVING",
    levelName: "Tier 1 - Low",
    dailyRate: 165,
  },
  {
    levelCode: "ASSISTED_LIVING",
    levelName: "Tier 2 - Moderate",
    dailyRate: 205,
  },
  {
    levelCode: "MEMORY_CARE",
    levelName: "Tier 3 - High",
    dailyRate: 248,
  },
  {
    levelCode: "SKILLED_NURSING",
    levelName: "Tier 4 - Total",
    dailyRate: 310,
  },
] as const;

const roomSeed = [
  { roomNumber: "101", roomType: "Private", bedNumber: "A", status: "AVAILABLE" },
  { roomNumber: "106", roomType: "Semi-private", bedNumber: "A", status: "OCCUPIED" },
  { roomNumber: "114", roomType: "Semi-private", bedNumber: "B", status: "OCCUPIED" },
  { roomNumber: "118", roomType: "Semi-private", bedNumber: "A", status: "OCCUPIED" },
  { roomNumber: "204", roomType: "Semi-private", bedNumber: "B", status: "OCCUPIED" },
  { roomNumber: "210", roomType: "Semi-private", bedNumber: "B", status: "OCCUPIED" },
  { roomNumber: "215", roomType: "Private", bedNumber: "A", status: "MAINTENANCE" },
  { roomNumber: "222", roomType: "Semi-private", bedNumber: "A", status: "OCCUPIED" },
] as const;

const roomRateSeed = [
  { roomType: "Private", dailyRate: 220, effectiveFrom: "2026-01-01" },
  { roomType: "Semi-private", dailyRate: 185, effectiveFrom: "2026-01-01" },
  { roomType: "Ward", dailyRate: 150, effectiveFrom: "2026-01-01" },
] as const;

const clinicalCapabilitySeed = [
  { capability: "Wound care / pressure ulcer management", supported: true },
  { capability: "Physical / Occupational / Speech therapy", supported: true },
  { capability: "Dementia or behavioral health management", supported: true },
  {
    capability: "Bariatric care needs",
    supported: false,
    note: "Facility-wide bed weight limit: 300 lb (no bariatric-rated equipment on site).",
  },
  { capability: "IV therapy or complex medication administration", supported: true },
  { capability: "Ventilator or respiratory support", supported: true },
  { capability: "Hospice or palliative care coordination", supported: true },
  { capability: "Isolation precautions (MRSA, C. diff, etc.)", supported: true },
] as const;

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  const rolesData = [
    { roleName: "Admission Staff", description: "Manages resident intake: pre-admission screening, admission forms, and profile creation. Full access to M1 registration." },
    { roleName: "Nurse (RN/LPN)", description: "Performs clinical assessments, drafts and manages care plans, records bedside vitals. Cannot approve care plans (DON)." },
    { roleName: "CNA", description: "Executes daily assigned tasks and records bedside vitals for assigned residents. Mobile-first view (NFR-04)." },
    { roleName: "DON (Director of Nursing)", description: "Reviews/approves care plans, oversees incidents with SLA tracking, monitors staffing ratio + census/billing snapshot." },
    { roleName: "System Admin", description: "Configures facility settings, rates, staffing thresholds, user accounts, and equipment inventory. No clinical access." },
    { roleName: "Physician", description: "Limited-access external signer. Reviews care plans for residents under their care; e-signs M2-US-10 only." },
    { roleName: "Dietary", description: "Limited-access external signer. Reviews nutrition-related care plan sections; e-signs M2-US-10 only." }
  ];

  const dbRoles: Record<string, any> = {};
  for (const r of rolesData) {
    dbRoles[r.roleName] = await prisma.role.upsert({
      where: { roleName: r.roleName },
      update: { description: r.description },
      create: r,
    });
  }

  // ── Permissions ────────────────────────────────────────────────────────────
  const modules = [
    'ADMIN_CONFIG',
    'RESIDENT_LIST',
    'PROFILE_DETAIL',
    'INITIAL_ASSESSMENT',
    'CARE_PLAN_LIST',
    'DON_REVIEW',
    'BEDSIDE_VITALS',
    'REPORT_INCIDENT',
    'INCIDENT_LIST',
    'IDT_ACKNOWLEDGMENT'
  ];

  for (const mod of modules) {
    await prisma.permission.upsert({
      where: { actionCode: `${mod}_VIEW` },
      update: {},
      create: { actionCode: `${mod}_VIEW` }
    });
    await prisma.permission.upsert({
      where: { actionCode: `${mod}_MANAGE` },
      update: {},
      create: { actionCode: `${mod}_MANAGE` }
    });
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Password123!", BCRYPT_ROUNDS);

  // Active admin
  await prisma.user.upsert({
    where: { email: "admin@facility.org" },
    update: {},
    create: {
      employeeCode: "EMP001",
      email: "admin@facility.org",
      passwordHash: hashedPassword,
      firstName: "John",
      lastName: "Admin",
      phoneNumber: "+15550001234",
      status: "ACTIVE",
      mfaEnabled: true,
      roleId: dbRoles["System Admin"].id,
    },
  });

  // Wuan admin
  const wuanHashedPassword = await bcrypt.hash("123123", BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: "wuan1604@gmail.com" },
    update: {},
    create: {
      employeeCode: "EMP_WUAN",
      email: "wuan1604@gmail.com",
      passwordHash: wuanHashedPassword,
      firstName: "Wuan",
      lastName: "Admin",
      phoneNumber: "+15559998888",
      status: "ACTIVE",
      mfaEnabled: true,
      roleId: dbRoles["System Admin"].id,
    },
  });

  // Active nurse
  await prisma.user.upsert({
    where: { email: "j.rivera@facility.org" },
    update: {},
    create: {
      employeeCode: "EMP002",
      email: "j.rivera@facility.org",
      passwordHash: hashedPassword,
      firstName: "Julia",
      middleName: "Marie",
      lastName: "Rivera",
      phoneNumber: "+15550005678",
      status: "ACTIVE",
      mfaEnabled: true,
      roleId: dbRoles["Nurse (RN/LPN)"].id,
    },
  });

  // Invited (pending activation) nurse
  await prisma.user.upsert({
    where: { email: "new.nurse@facility.org" },
    update: {},
    create: {
      employeeCode: "EMP003",
      email: "new.nurse@facility.org",
      passwordHash: "",
      firstName: "New",
      lastName: "Nurse",
      status: "INACTIVE",
      mfaEnabled: false,
      licenseNumber: "ACT123", // one-time activation code
      roleId: dbRoles["Nurse (RN/LPN)"].id,
    },
  });

  const facility = await prisma.facility.upsert({
    where: { facilityCode: DEFAULT_FACILITY_CODE },
    update: {
      name: "NHMS Demo Skilled Nursing Facility",
      licenseNumber: "CA-SNF-004821",
      targetState: "CA",
      timezone: "America/Los_Angeles (Pacific)",
      phoneNumber: "+14155550142",
      isDeleted: false,
    },
    create: {
      facilityCode: DEFAULT_FACILITY_CODE,
      name: "NHMS Demo Skilled Nursing Facility",
      licenseNumber: "CA-SNF-004821",
      targetState: "CA",
      timezone: "America/Los_Angeles (Pacific)",
      phoneNumber: "+14155550142",
    },
  });

  for (const item of roomSeed) {
    const room = await prisma.rooms.upsert({
      where: {
        facility_id_room_number: {
          facility_id: facility.id,
          room_number: item.roomNumber,
        },
      },
      update: {
        room_type: item.roomType,
        is_deleted: false,
      },
      create: {
        room_number: item.roomNumber,
        room_type: item.roomType,
        facility_id: facility.id,
      },
    });

    await prisma.beds.upsert({
      where: {
        room_id_bed_number: {
          room_id: room.id,
          bed_number: item.bedNumber,
        },
      },
      update: { status: item.status },
      create: {
        bed_number: item.bedNumber,
        status: item.status,
        room_id: room.id,
      },
    });
  }

  for (const item of careLevelSeed) {
    const careLevel = await prisma.care_levels.upsert({
      where: { level_code: item.levelCode },
      update: {
        level_name: item.levelName,
        is_deleted: false,
      },
      create: {
        level_code: item.levelCode,
        level_name: item.levelName,
      },
    });

    const currentRate = await prisma.care_level_rates.findFirst({
      where: {
        care_level_id: careLevel.id,
        facility_id: facility.id,
        effective_to: null,
      },
    });

    if (currentRate) {
      await prisma.care_level_rates.update({
        where: { id: currentRate.id },
        data: {
          daily_rate: item.dailyRate,
          effective_from: toDate("2026-01-01"),
        },
      });
    } else {
      await prisma.care_level_rates.create({
        data: {
          care_level_id: careLevel.id,
          facility_id: facility.id,
          daily_rate: item.dailyRate,
          effective_from: toDate("2026-01-01"),
        },
      });
    }
  }

  for (const item of roomRateSeed) {
    await prisma.facility_room_rates.upsert({
      where: {
        facility_id_room_type: {
          facility_id: facility.id,
          room_type: item.roomType,
        },
      },
      update: {
        daily_rate: item.dailyRate,
        effective_from: toDate(item.effectiveFrom),
      },
      create: {
        facility_id: facility.id,
        room_type: item.roomType,
        daily_rate: item.dailyRate,
        effective_from: toDate(item.effectiveFrom),
      },
    });
  }

  for (const item of clinicalCapabilitySeed) {
    await prisma.facility_clinical_capabilities.upsert({
      where: {
        facility_id_capability: {
          facility_id: facility.id,
          capability: item.capability,
        },
      },
      update: {
        supported: item.supported,
        note: "note" in item ? item.note : null,
      },
      create: {
        facility_id: facility.id,
        capability: item.capability,
        supported: item.supported,
        note: "note" in item ? item.note : null,
      },
    });
  }

  const staffingConfig = await prisma.staffing_configs.findFirst({
    where: { facility_id: facility.id },
  });
  const shiftBreakdownJson = JSON.stringify([
    {
      shiftName: "Day",
      startTime: "07:00",
      endTime: "15:00",
      requiredCnaHours: 1.5,
      requiredNurseHours: 0.9,
    },
    {
      shiftName: "Evening",
      startTime: "15:00",
      endTime: "23:00",
      requiredCnaHours: 0.7,
      requiredNurseHours: 0.5,
    },
    {
      shiftName: "Night",
      startTime: "23:00",
      endTime: "07:00",
      requiredCnaHours: 0.5,
      requiredNurseHours: 0.3,
    },
  ]);

  if (staffingConfig) {
    await prisma.staffing_configs.update({
      where: { id: staffingConfig.id },
      data: {
        min_hrs_per_resident_day: 3.5,
        warn_below_percentage: 90,
        shift_breakdown_json: shiftBreakdownJson,
      },
    });
  } else {
    await prisma.staffing_configs.create({
      data: {
        facility_id: facility.id,
        min_hrs_per_resident_day: 3.5,
        warn_below_percentage: 90,
        shift_breakdown_json: shiftBreakdownJson,
      },
    });
  }

  console.log("[Seed] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
