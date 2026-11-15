import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiTags,
} from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { Response } from "express";
import { memoryStorage } from "multer";
import { MAX_IMAGE_BYTES } from "../uploads/uploads.service.js";
import { CancelOrderDto, CreateOrderDto, OrderQueryDto } from "./orders.dto.js";
import { OrdersService } from "./orders.service.js";

const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
};

@ApiTags("orders")
@ApiCookieAuth()
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async checkout(
    @Session() session: UserSession,
    @Body() input: CreateOrderDto,
  ) {
    return { data: await this.ordersService.checkout(session.user.id, input) };
  }

  @Get()
  async list(
    @Session() session: UserSession,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.listForUser(session.user.id, query);
  }

  @Get("by-number/:orderNumber")
  async detailByNumber(
    @Session() session: UserSession,
    @Param("orderNumber") orderNumber: string,
  ) {
    return {
      data: await this.ordersService.getForUserByNumber(
        session.user.id,
        orderNumber,
      ),
    };
  }

  @Get(":id")
  async detail(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return { data: await this.ordersService.getForUser(session.user.id, id) };
  }

  @Post(":id/cancel")
  async cancel(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: CancelOrderDto,
  ) {
    return {
      data: await this.ordersService.cancelForUser(session.user.id, id, input),
    };
  }

  @Post(":id/payment-proof")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { proof: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(FileInterceptor("proof", uploadOptions))
  async uploadProof(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      data: await this.ordersService.submitPaymentProof(
        session.user.id,
        id,
        file,
      ),
    };
  }

  @Get(":id/payment-proof")
  async getProof(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const proof = await this.ordersService.getPaymentProof(
      session.user.id,
      session.user.role === "admin",
      id,
    );
    response.setHeader("Content-Type", contentTypeFor(proof.filename));
    response.setHeader(
      "Content-Disposition",
      `inline; filename="${proof.filename}"`,
    );
    return new StreamableFile(proof.buffer);
  }
}

function contentTypeFor(filename: string): string {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
