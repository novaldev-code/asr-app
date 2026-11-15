import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, count, desc, eq, ne } from "drizzle-orm";
import { DB, type Database } from "../../db/index.js";
import { addresses } from "../../db/schema/index.js";
import type { CreateAddressDto, UpdateAddressDto } from "./addresses.dto.js";

@Injectable()
export class AddressesService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async list(userId: string) {
    return this.db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }

  async getOwned(id: string, userId: string) {
    const [address] = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .limit(1);
    if (!address) throw new NotFoundException("Alamat tidak ditemukan.");
    return address;
  }

  async create(userId: string, input: CreateAddressDto) {
    return this.db.transaction(async (tx) => {
      const [totalRow] = await tx
        .select({ value: count() })
        .from(addresses)
        .where(eq(addresses.userId, userId));
      const isFirst = Number(totalRow?.value ?? 0) === 0;
      const shouldBeDefault = isFirst || input.isDefault === true;

      if (shouldBeDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(addresses.userId, userId));
      }

      const [created] = await tx
        .insert(addresses)
        .values({
          userId,
          recipientName: input.recipientName,
          phone: input.phone,
          addressLine: input.addressLine,
          city: input.city,
          province: input.province,
          postalCode: input.postalCode,
          isDefault: shouldBeDefault,
        })
        .returning();
      return created;
    });
  }

  async update(id: string, userId: string, input: UpdateAddressDto) {
    const current = await this.getOwned(id, userId);
    if (current.isDefault && input.isDefault === false) {
      throw new ConflictException(
        "Pilih alamat utama lain sebelum menonaktifkan alamat utama.",
      );
    }

    return this.db.transaction(async (tx) => {
      if (input.isDefault === true) {
        await tx
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(eq(addresses.userId, userId), ne(addresses.id, id)),
          );
      }
      const [updated] = await tx
        .update(addresses)
        .set({
          ...(input.recipientName !== undefined
            ? { recipientName: input.recipientName }
            : {}),
          ...(input.phone !== undefined ? { phone: input.phone } : {}),
          ...(input.addressLine !== undefined
            ? { addressLine: input.addressLine }
            : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.province !== undefined ? { province: input.province } : {}),
          ...(input.postalCode !== undefined
            ? { postalCode: input.postalCode }
            : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .returning();
      return updated;
    });
  }

  async setDefault(id: string, userId: string) {
    await this.getOwned(id, userId);
    return this.db.transaction(async (tx) => {
      await tx
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(addresses.userId, userId));
      const [updated] = await tx
        .update(addresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .returning();
      return updated;
    });
  }

  async remove(id: string, userId: string) {
    const current = await this.getOwned(id, userId);
    return this.db.transaction(async (tx) => {
      await tx
        .delete(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));

      if (current.isDefault) {
        const [next] = await tx
          .select({ id: addresses.id })
          .from(addresses)
          .where(eq(addresses.userId, userId))
          .orderBy(asc(addresses.createdAt))
          .limit(1);
        if (next) {
          await tx
            .update(addresses)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(addresses.id, next.id));
        }
      }
      return { deleted: true };
    });
  }
}
