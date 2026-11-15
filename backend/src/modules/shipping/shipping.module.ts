import { Module } from "@nestjs/common";
import { AdminShippingController } from "./admin-shipping.controller.js";
import { PublicShippingController } from "./public-shipping.controller.js";
import { ShippingService } from "./shipping.service.js";

@Module({
  controllers: [PublicShippingController, AdminShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
