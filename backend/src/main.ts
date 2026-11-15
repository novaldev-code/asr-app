import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { createApplication } from "./app.setup.js";
import { env } from "./config/env.js";

async function bootstrap(): Promise<void> {
  const app = await createApplication();
  await app.listen(env.PORT);
  Logger.log(`API listening on ${env.BETTER_AUTH_URL}`, "Bootstrap");
  Logger.log(`Swagger available at ${env.BETTER_AUTH_URL}/docs`, "Bootstrap");
}

void bootstrap();
