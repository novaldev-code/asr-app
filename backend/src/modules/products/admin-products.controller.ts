import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@thallesp/nestjs-better-auth";
import { memoryStorage } from "multer";
import { MAX_IMAGE_BYTES } from "../uploads/uploads.service.js";
import {
  AdminProductQueryDto,
  CreateProductDto,
  UpdateProductDto,
} from "./products.dto.js";
import { ProductsService } from "./products.service.js";

const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
};

@ApiTags("admin-products")
@ApiCookieAuth()
@Roles(["admin"])
@Controller("admin/products")
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(@Query() query: AdminProductQueryDto) {
    return this.productsService.list(query, true);
  }

  @Get(":id")
  async detail(@Param("id", ParseUUIDPipe) id: string) {
    return { data: await this.productsService.getById(id) };
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateProductDto })
  @UseInterceptors(FileInterceptor("image", uploadOptions))
  async create(
    @Body() input: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return { data: await this.productsService.create(input, file) };
  }

  @Patch(":id")
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UpdateProductDto })
  @UseInterceptors(FileInterceptor("image", uploadOptions))
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return { data: await this.productsService.update(id, input, file) };
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return { data: await this.productsService.remove(id) };
  }
}
