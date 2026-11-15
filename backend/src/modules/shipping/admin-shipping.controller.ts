import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@thallesp/nestjs-better-auth";
import {
  CreateShippingRateDto,
  UpdateShippingRateDto,
} from "./shipping.dto.js";
import { ShippingService } from "./shipping.service.js";

@ApiTags("admin-shipping-rates")
@ApiCookieAuth()
@Roles(["admin"])
@Controller("admin/shipping-rates")
export class AdminShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  async list() {
    return { data: await this.shippingService.list() };
  }

  @Post()
  async create(@Body() input: CreateShippingRateDto) {
    return { data: await this.shippingService.create(input) };
  }

  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateShippingRateDto,
  ) {
    return { data: await this.shippingService.update(id, input) };
  }

  @Patch(":id/default")
  async setDefault(@Param("id", ParseUUIDPipe) id: string) {
    return { data: await this.shippingService.setDefault(id) };
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return { data: await this.shippingService.remove(id) };
  }
}
