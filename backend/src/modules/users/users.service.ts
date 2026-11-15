import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB } from "../../db/index.js";
import type { Database } from "../../db/index.js";
import { users } from "../../db/schema/index.js";
import type { UsersUpdateInput } from "./users.dto.js";

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async getById(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user) throw new NotFoundException("Pengguna tidak ditemukan.");
    return user;
  }

  async updateProfile(id: string, input: UsersUpdateInput) {
    const [updated] = await this.db
      .update(users)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Pengguna tidak ditemukan.");
    return updated;
  }
}
