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
import { CreateCategoryDto, UpdateCategoryDto } from "./categories.dto.js";
import { CategoriesService } from "./categories.service.js";

@ApiTags("admin-categories")
@ApiCookieAuth()
@Roles(["admin"])
@Controller("admin/categories")
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list() {
    return { data: await this.categoriesService.list() };
  }

  @Post()
  async create(@Body() input: CreateCategoryDto) {
    return { data: await this.categoriesService.create(input) };
  }

  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateCategoryDto,
  ) {
    return { data: await this.categoriesService.update(id, input) };
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return { data: await this.categoriesService.remove(id) };
  }
}
