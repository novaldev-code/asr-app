import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { CategoriesService } from "./categories.service.js";

@ApiTags("categories")
@AllowAnonymous()
@Controller("categories")
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list() {
    return { data: await this.categoriesService.list() };
  }
}
