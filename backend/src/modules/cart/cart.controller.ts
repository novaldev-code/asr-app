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
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { AddCartItemDto, MergeCartDto, UpdateCartItemDto } from "./cart.dto.js";
import { CartService } from "./cart.service.js";

@ApiTags("cart")
@ApiCookieAuth()
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async get(@Session() session: UserSession) {
    return { data: await this.cartService.get(session.user.id) };
  }

  @Post("items")
  async addItem(
    @Session() session: UserSession,
    @Body() input: AddCartItemDto,
  ) {
    return { data: await this.cartService.addItem(session.user.id, input) };
  }

  @Post("merge")
  async merge(@Session() session: UserSession, @Body() input: MergeCartDto) {
    return this.cartService.merge(session.user.id, input);
  }

  @Patch("items/:id")
  async updateItem(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateCartItemDto,
  ) {
    return {
      data: await this.cartService.updateItem(session.user.id, id, input),
    };
  }

  @Delete("items/:id")
  async removeItem(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return { data: await this.cartService.removeItem(session.user.id, id) };
  }

  @Delete()
  async clear(@Session() session: UserSession) {
    return { data: await this.cartService.clear(session.user.id) };
  }
}
