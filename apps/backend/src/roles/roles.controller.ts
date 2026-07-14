import { Controller, Get, Param, Put, Body } from "@nestjs/common";
import { RolesService } from "./roles.service.js";
import { UpdateRolePermissionsDto } from "./dto/update-role-permissions.dto.js";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("roles")
@Controller("api")
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get("roles")
    @ApiOperation({ summary: "Get a list of all roles" })
    findAllRoles() {
        return this.rolesService.findAllRoles();
    }

    @Get("permissions")
    @ApiOperation({ summary: "Get a list of all permissions (action codes)" })
    findAllPermissions() {
        return this.rolesService.findAllPermissions();
    }

    @Get("roles/:id/permissions")
    @ApiOperation({ summary: "Get assigned permissions for a role" })
    getRolePermissions(@Param("id") id: string) {
        return this.rolesService.getRolePermissions(id);
    }

    @Put("roles/:id/permissions")
    @ApiOperation({ summary: "Update assigned permissions for a role" })
    updateRolePermissions(@Param("id") id: string, @Body() updateRolePermissionsDto: UpdateRolePermissionsDto) {
        return this.rolesService.updateRolePermissions(id, updateRolePermissionsDto);
    }
}
