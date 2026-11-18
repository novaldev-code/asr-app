import { timingSafeEqual } from "node:crypto";
import { Controller, Get, Headers, UnauthorizedException } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { env } from "../../config/env.js";
import { OrdersExpiryService } from "./orders-expiry.service.js";

function matchesCronSecret(header: string | undefined): boolean {
  const secret = env.CRON_SECRET;
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const provided = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
}

@ApiExcludeController()
@Controller("internal/orders")
export class InternalOrdersController {
  constructor(private readonly ordersExpiry: OrdersExpiryService) {}

  @Get("expire")
  @AllowAnonymous()
  async expire(@Headers("authorization") authorization?: string) {
    if (!matchesCronSecret(authorization)) {
      throw new UnauthorizedException("Unauthorized.");
    }
    const expired = await this.ordersExpiry.sweep();
    return { data: { expired } };
  }
}
