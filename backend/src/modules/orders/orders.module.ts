import { Module } from "@nestjs/common";
import { CartModule } from "../cart/cart.module.js";
import { ShippingModule } from "../shipping/shipping.module.js";
import { UploadsModule } from "../uploads/uploads.module.js";
import { AdminDashboardController } from "./admin-dashboard.controller.js";
import { AdminOrdersController } from "./admin-orders.controller.js";
import { InternalOrdersController } from "./internal-orders.controller.js";
import { OrdersExpiryService } from "./orders-expiry.service.js";
import { OrdersController } from "./orders.controller.js";
import { OrdersService } from "./orders.service.js";

@Module({
  imports: [CartModule, ShippingModule, UploadsModule],
  controllers: [
    OrdersController,
    AdminOrdersController,
    AdminDashboardController,
    InternalOrdersController,
  ],
  providers: [OrdersService, OrdersExpiryService],
  exports: [OrdersService],
})
export class OrdersModule {}
