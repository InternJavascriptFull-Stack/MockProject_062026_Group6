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

  // ── Users for all roles ───────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Password123!", BCRYPT_ROUNDS);

  // 1. System Admin
  await prisma.user.upsert({
    where: { email: "admin@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP001",
      email: "admin@facility.org",
      passwordHash: hashedPassword,
      firstName: "John",
      lastName: "Admin",
      phoneNumber: "+15550001234",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["System Admin"].id,
    },
  });

  // Wuan Admin
  const wuanHashedPassword = await bcrypt.hash("123123", BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: "wuan1604@gmail.com" },
    update: { passwordHash: wuanHashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP_WUAN",
      email: "wuan1604@gmail.com",
      passwordHash: wuanHashedPassword,
      firstName: "Wuan",
      lastName: "Admin",
      phoneNumber: "+15559998888",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["System Admin"].id,
    },
  });

  // 2. DON (Director of Nursing)
  await prisma.user.upsert({
    where: { email: "don@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP_DON",
      email: "don@facility.org",
      passwordHash: hashedPassword,
      firstName: "Sarah",
      lastName: "Director",
      phoneNumber: "+15550002222",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["DON (Director of Nursing)"].id,
    },
  });

  // 3. Nurse (RN/LPN)
  await prisma.user.upsert({
    where: { email: "j.rivera@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP002",
      email: "j.rivera@facility.org",
      passwordHash: hashedPassword,
      firstName: "Julia",
      middleName: "Marie",
      lastName: "Rivera",
      phoneNumber: "+15550005678",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["Nurse (RN/LPN)"].id,
    },
  });

  await prisma.user.upsert({
    where: { email: "nurse@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP_NURSE",
      email: "nurse@facility.org",
      passwordHash: hashedPassword,
      firstName: "Anna",
      lastName: "Lee",
      phoneNumber: "+15550003333",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["Nurse (RN/LPN)"].id,
    },
  });

  // 4. CNA (Certified Nursing Assistant)
  await prisma.user.upsert({
    where: { email: "cna@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP_CNA",
      email: "cna@facility.org",
      passwordHash: hashedPassword,
      firstName: "Carlos",
      lastName: "Assistant",
      phoneNumber: "+15550004444",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["CNA"].id,
    },
  });

  // 5. Admission Staff
  await prisma.user.upsert({
    where: { email: "admission@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP_ADM",
      email: "admission@facility.org",
      passwordHash: hashedPassword,
      firstName: "Alice",
      lastName: "Admission",
      phoneNumber: "+15550005555",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["Admission Staff"].id,
    },
  });

  // 6. Physician
  await prisma.user.upsert({
    where: { email: "physician@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP_DOC",
      email: "physician@facility.org",
      passwordHash: hashedPassword,
      firstName: "Dr. Robert",
      lastName: "Chen",
      phoneNumber: "+15550006666",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["Physician"].id,
    },
  });

  // 7. Dietary
  await prisma.user.upsert({
    where: { email: "dietary@facility.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVE" },
    create: {
      employeeCode: "EMP_DIET",
      email: "dietary@facility.org",
      passwordHash: hashedPassword,
      firstName: "David",
      lastName: "Dietary",
      phoneNumber: "+15550007777",
      status: "ACTIVE",
      mfaEnabled: false,
      roleId: dbRoles["Dietary"].id,
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

  // ── Holidays Seeding ────────────────────────────────────────────────────────
  const federalHolidaysSeed = [
    { name: "New Year's Day", dateType: "FIXED", month: 1, day: 1, floatingRule: null },
    { name: "Martin Luther King Jr. Day", dateType: "FLOATING", month: 1, day: null, floatingRule: "3rd Monday in January" },
    { name: "Washington's Birthday", dateType: "FLOATING", month: 2, day: null, floatingRule: "3rd Monday in February" },
    { name: "Memorial Day", dateType: "FLOATING", month: 5, day: null, floatingRule: "Last Monday in May" },
    { name: "Juneteenth National Independence Day", dateType: "FIXED", month: 6, day: 19, floatingRule: null },
    { name: "Independence Day", dateType: "FIXED", month: 7, day: 4, floatingRule: null },
    { name: "Labor Day", dateType: "FLOATING", month: 9, day: null, floatingRule: "1st Monday in September" },
    { name: "Columbus Day", dateType: "FLOATING", month: 10, day: null, floatingRule: "2nd Monday in October" },
    { name: "Veterans Day", dateType: "FIXED", month: 11, day: 11, floatingRule: null },
    { name: "Thanksgiving Day", dateType: "FLOATING", month: 11, day: null, floatingRule: "4th Thursday in November" },
    { name: "Christmas Day", dateType: "FIXED", month: 12, day: 25, floatingRule: null },
  ];

  for (const h of federalHolidaysSeed) {
    const existing = await prisma.holidays.findFirst({
      where: { name: h.name, is_federal_read_only: true },
    });
    if (!existing) {
      await prisma.holidays.create({
        data: {
          name: h.name,
          date_type: h.dateType,
          month: h.month,
          day: h.day,
          floating_rule: h.floatingRule,
          repeats_annually: true,
          is_active: true,
          is_federal_read_only: true,
        },
      });
    }
  }

  const caStateHolidaysSeed = [
    { name: "New Year's Day (CA)", dateType: "FIXED", month: 1, day: 1, floatingRule: null },
    { name: "Martin Luther King Jr. Day (CA)", dateType: "FLOATING", month: 1, day: null, floatingRule: "3rd Monday in January" },
    { name: "Lincoln's Birthday", dateType: "FIXED", month: 2, day: 12, floatingRule: null },
    { name: "César Chávez Day", dateType: "FIXED", month: 3, day: 31, floatingRule: null },
    { name: "Memorial Day (CA)", dateType: "FLOATING", month: 5, day: null, floatingRule: "Last Monday in May" },
    { name: "Juneteenth (CA)", dateType: "FIXED", month: 6, day: 19, floatingRule: null },
    { name: "Independence Day (CA)", dateType: "FIXED", month: 7, day: 4, floatingRule: null },
    { name: "Labor Day (CA)", dateType: "FLOATING", month: 9, day: null, floatingRule: "1st Monday in September" },
    { name: "Native American Day", dateType: "FLOATING", month: 9, day: null, floatingRule: "4th Friday in September" },
    { name: "Veterans Day (CA)", dateType: "FIXED", month: 11, day: 11, floatingRule: null },
    { name: "Thanksgiving Day (CA)", dateType: "FLOATING", month: 11, day: null, floatingRule: "4th Thursday in November" },
    { name: "Day After Thanksgiving", dateType: "FLOATING", month: 11, day: null, floatingRule: "4th Friday in November" },
    { name: "Christmas Day (CA)", dateType: "FIXED", month: 12, day: 25, floatingRule: null },
  ];

  for (const h of caStateHolidaysSeed) {
    const existing = await prisma.holidays.findFirst({
      where: { facility_id: facility.id, name: h.name },
    });
    if (!existing) {
      await prisma.holidays.create({
        data: {
          facility_id: facility.id,
          name: h.name,
          date_type: h.dateType,
          month: h.month,
          day: h.day,
          floating_rule: h.floatingRule,
          repeats_annually: true,
          is_active: true,
          is_federal_read_only: false,
        },
      });
    }
  }

  console.log("[Seed] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
