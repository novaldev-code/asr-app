import { Controller, Get } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@thallesp/nestjs-better-auth";
import { OrdersService } from "./orders.service.js";

@ApiTags("admin-dashboard")
@ApiCookieAuth()
@Roles(["admin"])
@Controller("admin/dashboard")
export class AdminDashboardController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async dashboard() {
    return this.ordersService.dashboard();
  }
}
