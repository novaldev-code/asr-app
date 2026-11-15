import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, eq, ne } from "drizzle-orm";
import { DB, type Database } from "../../db/index.js";
import { categories, products } from "../../db/schema/index.js";
import { buildUniqueSlug } from "../../common/slug.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./categories.dto.js";

@Injectable()
export class CategoriesService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async list() {
    return this.db.select().from(categories).orderBy(asc(categories.name));
  }

  async getById(id: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!category) throw new NotFoundException("Kategori tidak ditemukan.");
    return category;
  }

  async create(input: CreateCategoryDto) {
    const existing = await this.db
      .select({ slug: categories.slug })
      .from(categories);
    const slug = buildUniqueSlug(
      input.name,
      existing.map((item) => item.slug),
    );
    const [created] = await this.db
      .insert(categories)
      .values({
        name: input.name,
        slug,
        description: input.description ?? "",
      })
      .returning();
    return created;
  }

  async update(id: string, input: UpdateCategoryDto) {
    await this.getById(id);
    const existing = await this.db
      .select({ slug: categories.slug })
      .from(categories)
      .where(ne(categories.id, id));
    const slug =
      input.name !== undefined
        ? buildUniqueSlug(
            input.name,
            existing.map((item) => item.slug),
          )
        : undefined;

    const [updated] = await this.db
      .update(categories)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async remove(id: string) {
    await this.getById(id);
    const [used] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.categoryId, id), eq(products.isActive, true)))
      .limit(1);
    if (used) {
      throw new ConflictException(
        "Kategori masih dipakai produk aktif. Nonaktifkan produk terlebih dahulu.",
      );
    }
    await this.db.delete(categories).where(eq(categories.id, id));
    return { deleted: true };
  }
}
