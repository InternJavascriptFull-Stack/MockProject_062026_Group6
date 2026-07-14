import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { RolesService } from "./roles.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

describe("RolesService", () => {
    let service: RolesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RolesService, { provide: PrismaService, useValue: {} }],
        }).compile();

        service = module.get<RolesService>(RolesService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
