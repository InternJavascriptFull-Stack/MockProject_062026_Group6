import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common";
import { CreateHolidayDto, UpdateHolidayDto } from "./dto/holiday.dto.js";
import { HolidaysService } from "./holidays.service.js";

@Controller("facilities/:facilityId/holidays")
export class HolidaysController {
    constructor(private readonly holidaysService: HolidaysService) {}

    @Get()
    async getHolidays(@Param("facilityId") facilityId: string) {
        return this.holidaysService.getHolidays(facilityId);
    }

    @Post()
    async createStateHoliday(
        @Param("facilityId") facilityId: string,
        @Body() dto: CreateHolidayDto,
    ) {
        return this.holidaysService.createStateHoliday(facilityId, dto);
    }

    @Put(":id")
    async updateStateHoliday(
        @Param("facilityId") facilityId: string,
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdateHolidayDto,
    ) {
        return this.holidaysService.updateStateHoliday(facilityId, id, dto);
    }

    @Patch(":id/toggle")
    async toggleStatus(
        @Param("facilityId") facilityId: string,
        @Param("id", ParseIntPipe) id: number,
    ) {
        return this.holidaysService.toggleStatus(facilityId, id);
    }
}
