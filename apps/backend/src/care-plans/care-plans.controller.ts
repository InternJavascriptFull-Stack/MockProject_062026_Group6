import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from "@nestjs/common";
import { CarePlansService } from "./care-plans.service.js";
import { AccessTokenGuard } from "../auth/guards/access-token.guard.js";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CreateCarePlanDto, UpdateCarePlanDto, DonReviewDto, ESignDto, IdtAckDto } from "./dto/care-plans.dto.js";

@ApiTags("Care Plans")
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller("api/care-plans")
export class CarePlansController {
    constructor(private readonly carePlansService: CarePlansService) {}

    @Get()
    @ApiOperation({ summary: "Lấy danh sách Care Plan" })
    async findAll() {
        const data = await this.carePlansService.findAll();
        return { success: true, data };
    }

    @Get("residents/list")
    @ApiOperation({ summary: "Danh sách Cư dân (Helper cho Form Create)" })
    async getResidents() {
        const data = await this.carePlansService.getResidents();
        return { success: true, data };
    }

    @Get(":id")
    @ApiOperation({ summary: "Xem chi tiết Care Plan theo ID" })
    async findOne(@Param("id") id: string) {
        const data = await this.carePlansService.findOne(id);
        return { success: true, data };
    }

    @Post()
    @ApiOperation({ summary: "Tạo mới Care Plan" })
    async create(@Body() body: CreateCarePlanDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.create(body, userId);
        return { success: true, data };
    }

    @Put(":id")
    @ApiOperation({ summary: "Cập nhật trạng thái Care Plan" })
    async update(@Param("id") id: string, @Body() body: UpdateCarePlanDto) {
        const data = await this.carePlansService.update(id, body);
        return { success: true, data };
    }

    @Get("loc-gate/:residentId")
    @ApiOperation({ summary: "Check whether a resident has a confirmed LOC classification" })
    async checkLocGate(@Param("residentId") residentId: string) {
        return this.carePlansService.checkLocGate(residentId);
    }

    @Post(":id/don-review")
    @ApiOperation({ summary: "DON (Giám đốc Điều dưỡng) Review" })
    async donReview(@Param("id") id: string, @Body() body: DonReviewDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.donReview(id, body, userId, req.user.role);
        return { success: true, data };
    }

    @Post(":id/esign")
    @ApiOperation({ summary: "Ký điện tử E-signature" })
    async eSign(@Param("id") id: string, @Body() body: ESignDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.eSign(id, body.password, userId, req.user.role);
        return { success: true, data };
    }

    @Post(":id/idt-ack")
    @ApiOperation({ summary: "IDT Xác nhận đã đọc Care Plan" })
    async idtAck(@Param("id") id: string, @Body() body: IdtAckDto, @Req() req: any) {
        const userId = req.user.sub;
        const data = await this.carePlansService.idtAck(id, body, userId);
        return { success: true, data };
    }
}
