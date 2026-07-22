import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

Object.defineProperty(BigInt.prototype, "toJSON", {
    configurable: true,
    value() {
        return this.toString();
    },
});

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = Number(process.env.PORT ?? 3000);
    const allowedOrigins = (process.env.CORS_CLIENT_ORIGIN ?? "http://localhost:3001")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const config = new DocumentBuilder().setTitle("NHMS API").setDescription("Nursing Home Management System API").setVersion("1.0").addBearerAuth().build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    await app.listen(port);

    console.log(`[NHMS] Running on: http://localhost:${port}`);
    console.log(`[NHMS] Swagger Docs: http://localhost:${port}/api/docs`);
}

void bootstrap();
