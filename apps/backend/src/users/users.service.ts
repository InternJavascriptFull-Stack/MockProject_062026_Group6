import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { UpdateStatusDto } from "./dto/update-status.dto.js";
import { MailService } from "../mail/mail.service.js";

export const activationStore = new Map<string, { email: string; expiredAt: Date }>();

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
    ) {}

    // Helper to serialize BigInts
    private serializeBigInt(obj: any): any {
        return JSON.parse(JSON.stringify(obj, (_key, value) => (typeof value === "bigint" ? value.toString() : value)));
    }

    async findAll(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;

        const where = search
            ? {
                  OR: [
                      { email: { contains: search } },
                      { phoneNumber: { contains: search } },
                      { employeeCode: { contains: search } },
                      { firstName: { contains: search } },
                      { lastName: { contains: search } },
                  ],
              }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: { role: true, facilities: true },
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: this.serializeBigInt(users),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true, facilities: true },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return this.serializeBigInt(user);
    }

    async create(createUserDto: CreateUserDto) {
        // Generate an employee code
        const employeeCode =
            "EMP-" +
            Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, "0");

        // Check email uniqueness
        const existing = await this.prisma.user.findUnique({
            where: { email: createUserDto.email.toLowerCase() },
        });

        if (existing) {
            throw new BadRequestException("Email is already registered");
        }

        // Generate activation token
        const activationToken = crypto.randomBytes(32).toString("hex");
        const activationTokenExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store token in memory map instead of DB
        activationStore.set(activationToken, {
            email: createUserDto.email.toLowerCase(),
            expiredAt: activationTokenExpiredAt,
        });

        // Since we don't handle passwords here, we use a placeholder hash
        const placeholderHash = "$2b$10$xyz123placeholderhashthatlookslikebcrypt";

        const user = await this.prisma.user.create({
            data: {
                employeeCode,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                email: createUserDto.email.toLowerCase(),
                phoneNumber: null,
                status: "INACTIVE",
                roleId: BigInt(createUserDto.roleId),
                passwordHash: placeholderHash,
                licenseNumber: activationToken,
                ...(createUserDto.facilityId && createUserDto.facilityId !== "None"
                    ? {
                          facilities: {
                              create: {
                                  facilityId: createUserDto.facilityId,
                                  isPrimary: true,
                              },
                          },
                      }
                    : {}),
            },
            include: { role: true, facilities: true },
        });

        const fullName = `${user.firstName} ${user.lastName}`;
        try {
            await this.mailService.sendInvitation(user.email, fullName, activationToken);
        } catch (error) {
            console.error(`Failed to send invitation email to ${user.email}:`, error);
        }

        return this.serializeBigInt(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email.toLowerCase() },
            });
            if (existing) {
                throw new BadRequestException("Email is already registered");
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName,
                email: updateUserDto.email?.toLowerCase(),
                phoneNumber: updateUserDto.phoneNumber,
                status: updateUserDto.status,
                ...(updateUserDto.roleId && { roleId: BigInt(updateUserDto.roleId) }),
                ...(updateUserDto.facilityId !== undefined
                    ? {
                          facilities: {
                              deleteMany: {},
                              ...(updateUserDto.facilityId !== "None"
                                  ? {
                                        create: {
                                            facilityId: updateUserDto.facilityId,
                                            isPrimary: true,
                                        },
                                    }
                                  : {}),
                          },
                      }
                    : {}),
            },
            include: { role: true, facilities: true },
        });

        return this.serializeBigInt(updatedUser);
    }

    async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { status: updateStatusDto.status },
        });

        return this.serializeBigInt(updatedUser);
    }
}
