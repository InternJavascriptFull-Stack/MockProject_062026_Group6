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
    const dbRoles = {};
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
    console.log("[Seed] Done.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
