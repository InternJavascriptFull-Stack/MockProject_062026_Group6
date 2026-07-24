import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { UsersService } from "./users/users.service.js";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    console.log("Creating user...");
    try {
        const result = await usersService.create({
            firstName: "John",
            lastName: "Doe",
            email: "testinvite_" + Date.now() + "@nhms.io",
            roleId: "1", // Use a valid roleId from seed
            facilityId: "None",
        });
        console.log("User created successfully:", result);
    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        await app.close();
    }
}

bootstrap();
