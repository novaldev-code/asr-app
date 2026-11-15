import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ShippingQuoteQueryDto } from "./shipping.dto.js";
import { ShippingService } from "./shipping.service.js";

@ApiTags("shipping")
@AllowAnonymous()
@Controller("shipping")
export class PublicShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get("quote")
  async quote(@Query() query: ShippingQuoteQueryDto) {
    return { data: await this.shippingService.quote(query.province) };
  }
}
