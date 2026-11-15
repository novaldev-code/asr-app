import { Module } from "@nestjs/common";
import { AdminCategoriesController } from "./admin-categories.controller.js";
import { CategoriesService } from "./categories.service.js";
import { PublicCategoriesController } from "./public-categories.controller.js";

@Module({
  controllers: [PublicCategoriesController, AdminCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
