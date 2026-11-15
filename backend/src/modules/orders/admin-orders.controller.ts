import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import {
  AdminOrderQueryDto,
  UpdateOrderStatusDto,
  VerifyPaymentDto,
} from "./orders.dto.js";
import { OrdersService } from "./orders.service.js";

@ApiTags("admin-orders")
@ApiCookieAuth()
@Roles(["admin"])
@Controller("admin/orders")
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async list(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.listForAdmin(query);
  }

  @Get("by-number/:orderNumber")
  async detailByNumber(@Param("orderNumber") orderNumber: string) {
    return {
      data: await this.ordersService.getForAdminByNumber(orderNumber),
    };
  }

  @Get(":id")
  async detail(@Param("id", ParseUUIDPipe) id: string) {
    return { data: await this.ordersService.getForAdmin(id) };
  }

  @Patch(":id/status")
  async updateStatus(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateOrderStatusDto,
  ) {
    return {
      data: await this.ordersService.transition(id, input, session.user.id),
    };
  }

  @Patch(":id/payment")
  async verifyPayment(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: VerifyPaymentDto,
  ) {
    return {
      data: await this.ordersService.verifyPayment(id, input, session.user.id),
    };
  }
}
