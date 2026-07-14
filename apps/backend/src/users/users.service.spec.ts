import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { UsersService } from "./users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

describe("UsersService", () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService, { provide: PrismaService, useValue: {} }],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
