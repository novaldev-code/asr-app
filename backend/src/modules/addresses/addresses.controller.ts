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
import { CreateAddressDto, UpdateAddressDto } from "./addresses.dto.js";
import { AddressesService } from "./addresses.service.js";

@ApiTags("addresses")
@ApiCookieAuth()
@Controller("addresses")
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async list(@Session() session: UserSession) {
    return { data: await this.addressesService.list(session.user.id) };
  }

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() input: CreateAddressDto,
  ) {
    return {
      data: await this.addressesService.create(session.user.id, input),
    };
  }

  @Patch(":id")
  async update(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateAddressDto,
  ) {
    return {
      data: await this.addressesService.update(id, session.user.id, input),
    };
  }

  @Patch(":id/default")
  async setDefault(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return {
      data: await this.addressesService.setDefault(id, session.user.id),
    };
  }

  @Delete(":id")
  async remove(
    @Session() session: UserSession,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return {
      data: await this.addressesService.remove(id, session.user.id),
    };
  }
}
