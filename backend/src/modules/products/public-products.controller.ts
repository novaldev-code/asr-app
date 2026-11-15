import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ProductQueryDto } from "./products.dto.js";
import { ProductsService } from "./products.service.js";

@ApiTags("products")
@AllowAnonymous()
@Controller("products")
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(@Query() query: ProductQueryDto) {
    return this.productsService.list(query);
  }

  @Get(":slug")
  async detail(@Param("slug") slug: string) {
    return { data: await this.productsService.getPublicBySlug(slug) };
  }
}
