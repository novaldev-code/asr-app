import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/all-exceptions.filter.js";
import { env } from "./config/env.js";

export async function createApplication(): Promise<NestExpressApplication> {
  mkdirSync(join(process.cwd(), env.UPLOAD_DIR, "products"), { recursive: true });
  mkdirSync(join(process.cwd(), env.UPLOAD_DIR, "proofs"), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useStaticAssets(join(process.cwd(), env.UPLOAD_DIR, "products"), {
    prefix: "/uploads/products",
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Mocha & Co. API")
    .setDescription("REST API untuk katalog, keranjang, pesanan, dan admin.")
    .setVersion("1.0")
    .addCookieAuth("better-auth.session_token")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  return app;
}
