import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { UsersUpdateInput } from "./users.dto.js";
import { UsersService } from "./users.service.js";

@ApiTags("users")
@ApiCookieAuth()
@Controller("me")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Session() session: UserSession) {
    const user = await this.usersService.getById(session.user.id);
    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Patch()
  async updateProfile(
    @Session() session: UserSession,
    @Body() input: UsersUpdateInput,
  ) {
    const user = await this.usersService.updateProfile(session.user.id, input);
    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
