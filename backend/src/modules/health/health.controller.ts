import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @AllowAnonymous()
  getHealth() {
    return {
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    };
  }
}
