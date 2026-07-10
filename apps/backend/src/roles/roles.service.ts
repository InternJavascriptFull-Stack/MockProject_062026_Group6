import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeBigInt(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async findAllRoles() {
    const roles = await this.prisma.role.findMany({
      orderBy: { id: 'asc' },
    });
    return this.serializeBigInt(roles);
  }

  async findAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { actionCode: 'asc' },
    });
    return this.serializeBigInt(permissions);
  }

  async getRolePermissions(roleId: string) {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: BigInt(roleId) },
      include: { permission: true },
    });

    return rolePermissions.map((rp: any) => rp.permission.actionCode);
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: BigInt(roleId) },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Find permission IDs for the requested action codes
    const permissions = await this.prisma.permission.findMany({
      where: { actionCode: { in: dto.permissions } },
    });

    const permissionIds = permissions.map((p: any) => p.id);

    // Run transaction: delete all existing, then insert new ones
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId: BigInt(roleId) },
      }),
      this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId: any) => ({
          roleId: BigInt(roleId),
          permissionId,
        })),
      }),
    ]);

    return { message: 'Permissions updated successfully' };
  }
}
