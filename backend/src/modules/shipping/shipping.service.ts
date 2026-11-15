import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, eq, ilike, ne } from "drizzle-orm";
import { DB, type Database } from "../../db/index.js";
import { shippingRates } from "../../db/schema/index.js";
import type {
  CreateShippingRateDto,
  UpdateShippingRateDto,
} from "./shipping.dto.js";

export const DEFAULT_SHIPPING_COST = 25_000;

@Injectable()
export class ShippingService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async list() {
    return this.db
      .select()
      .from(shippingRates)
      .orderBy(asc(shippingRates.province));
  }

  async quote(province: string, executor: any = this.db) {
    const normalized = province.trim();
    const [exact] = await executor
      .select()
      .from(shippingRates)
      .where(ilike(shippingRates.province, normalized))
      .limit(1);
    if (exact) {
      return {
        province: exact.province,
        cost: exact.cost,
        isDefault: false,
      };
    }
    const [fallback] = await executor
      .select()
      .from(shippingRates)
      .where(eq(shippingRates.isDefault, true))
      .limit(1);
    return {
      province: normalized,
      cost: fallback?.cost ?? DEFAULT_SHIPPING_COST,
      isDefault: true,
    };
  }

  async create(input: CreateShippingRateDto) {
    await this.assertProvinceAvailable(input.province);
    return this.db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx
          .update(shippingRates)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(shippingRates.isDefault, true));
      }
      const [created] = await tx
        .insert(shippingRates)
        .values({
          province: input.province.trim(),
          cost: input.cost,
          isDefault: input.isDefault ?? false,
        })
        .returning();
      return created;
    });
  }

  async update(id: string, input: UpdateShippingRateDto) {
    const current = await this.getById(id);
    if (input.province !== undefined) {
      await this.assertProvinceAvailable(input.province, id);
    }
    if (current.isDefault && input.isDefault === false) {
      throw new ConflictException(
        "Pilih tarif default lain sebelum menonaktifkan tarif default.",
      );
    }

    return this.db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx
          .update(shippingRates)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(eq(shippingRates.isDefault, true), ne(shippingRates.id, id)));
      }
      const [updated] = await tx
        .update(shippingRates)
        .set({
          ...(input.province !== undefined
            ? { province: input.province.trim() }
            : {}),
          ...(input.cost !== undefined ? { cost: input.cost } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
          updatedAt: new Date(),
        })
        .where(eq(shippingRates.id, id))
        .returning();
      return updated;
    });
  }

  async setDefault(id: string) {
    await this.getById(id);
    return this.db.transaction(async (tx) => {
      await tx
        .update(shippingRates)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(shippingRates.isDefault, true));
      const [updated] = await tx
        .update(shippingRates)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(shippingRates.id, id))
        .returning();
      return updated;
    });
  }

  async remove(id: string) {
    const current = await this.getById(id);
    if (current.isDefault) {
      throw new ConflictException(
        "Tarif default tidak dapat dihapus. Pilih tarif default lain terlebih dahulu.",
      );
    }
    await this.db.delete(shippingRates).where(eq(shippingRates.id, id));
    return { deleted: true };
  }

  private async getById(id: string) {
    const [rate] = await this.db
      .select()
      .from(shippingRates)
      .where(eq(shippingRates.id, id))
      .limit(1);
    if (!rate) throw new NotFoundException("Tarif ongkir tidak ditemukan.");
    return rate;
  }

  private async assertProvinceAvailable(province: string, excludeId?: string) {
    const [existing] = await this.db
      .select({ id: shippingRates.id })
      .from(shippingRates)
      .where(
        excludeId
          ? and(
              ilike(shippingRates.province, province.trim()),
              ne(shippingRates.id, excludeId),
            )
          : ilike(shippingRates.province, province.trim()),
      )
      .limit(1);
    if (existing) {
      throw new ConflictException("Provinsi sudah memiliki tarif ongkir.");
    }
  }
}
