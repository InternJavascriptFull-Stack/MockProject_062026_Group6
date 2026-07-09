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
  // ── Roles ──────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { roleName: "Administrator" },
    update: {},
    create: { roleName: "Administrator", description: "Full system access" },
  });

  const nurseRole = await prisma.role.upsert({
    where: { roleName: "Nurse" },
    update: {},
    create: { roleName: "Nurse", description: "Patient care and monitoring" },
  });

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
      roleId: adminRole.id,
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
      roleId: nurseRole.id,
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
      roleId: nurseRole.id,
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
