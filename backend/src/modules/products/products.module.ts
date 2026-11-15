import { Module } from "@nestjs/common";
import { UploadsModule } from "../uploads/uploads.module.js";
import { AdminProductsController } from "./admin-products.controller.js";
import { ProductsService } from "./products.service.js";
import { PublicProductsController } from "./public-products.controller.js";

@Module({
  imports: [UploadsModule],
  controllers: [PublicProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
