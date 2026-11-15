import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  ne,
  type SQL,
} from "drizzle-orm";
import { buildUniqueSlug } from "../../common/slug.js";
import { paginationMeta } from "../../common/pagination.js";
import { DB, type Database } from "../../db/index.js";
import { categories, products } from "../../db/schema/index.js";
import { UploadsService } from "../uploads/uploads.service.js";
import type {
  AdminProductQueryDto,
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from "./products.dto.js";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly uploads: UploadsService,
  ) {}

  async list(query: ProductQueryDto, includeInactive = false) {
    const conditions: SQL[] = [];
    if (!includeInactive) conditions.push(eq(products.isActive, true));
    if (query.q) {
      conditions.push(
        ilike(products.name, `%${query.q}%`),
      );
    }
    if (query.category) {
      conditions.push(eq(categories.slug, query.category));
    }
    if (query.featured !== undefined) {
      conditions.push(eq(products.featured, query.featured));
    }
    if (query instanceof Object && "isActive" in query) {
      const adminQuery = query as AdminProductQueryDto;
      if (adminQuery.isActive !== undefined) {
        conditions.push(eq(products.isActive, adminQuery.isActive));
      }
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const page = query.page;
    const limit = query.limit;
    const orderBy =
      query.sort === "price_asc"
        ? [asc(products.price), asc(products.name)]
        : query.sort === "price_desc"
          ? [desc(products.price), asc(products.name)]
          : query.sort === "name_asc"
            ? [asc(products.name)]
            : [desc(products.createdAt)];

    const rows = await this.db
      .select({
        product: products,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalRow] = await this.db
      .select({ value: count() })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where);

    return {
      data: rows.map((row) => ({
        ...row.product,
        category: categoryRef(row.category),
      })),
      meta: paginationMeta(page, limit, Number(totalRow?.value ?? 0)),
    };
  }

  async getPublicBySlug(slug: string) {
    const [row] = await this.db
      .select({
        product: products,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);
    if (!row) throw new NotFoundException("Produk tidak ditemukan.");
    return { ...row.product, category: categoryRef(row.category) };
  }

  async getById(id: string) {
    const [row] = await this.db
      .select({
        product: products,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1);
    if (!row) throw new NotFoundException("Produk tidak ditemukan.");
    return { ...row.product, category: categoryRef(row.category) };
  }

  async create(input: CreateProductDto, file?: Express.Multer.File) {
    await this.assertCategory(input.categoryId);
    const slug = await this.resolveSlug(input.slug ?? input.name);
    const imageUrl = file
      ? await this.uploads.saveProductImage(file)
      : input.imageUrl || null;

    const [created] = await this.db
      .insert(products)
      .values({
        name: input.name,
        slug,
        categoryId: input.categoryId,
        price: input.price,
        stock: input.stock,
        description: input.description,
        imageUrl,
        isActive: input.isActive ?? true,
        featured: input.featured ?? false,
      })
      .returning();
    return created;
  }

  async update(id: string, input: UpdateProductDto, file?: Express.Multer.File) {
    await this.getById(id);
    if (input.categoryId) await this.assertCategory(input.categoryId);

    let slug: string | undefined;
    if (input.slug !== undefined || input.name !== undefined) {
      slug = await this.resolveSlug(input.slug ?? input.name ?? "", id);
    }

    const imageUrl = file
      ? await this.uploads.saveProductImage(file)
      : input.imageUrl !== undefined
        ? input.imageUrl || null
        : undefined;

    const [updated] = await this.db
      .update(products)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.featured !== undefined ? { featured: input.featured } : {}),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async remove(id: string) {
    await this.getById(id);
    const [updated] = await this.db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  private async assertCategory(categoryId: string): Promise<void> {
    const [category] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    if (!category) throw new BadRequestException("Kategori tidak ditemukan.");
  }

  private async resolveSlug(base: string, excludeId?: string): Promise<string> {
    const rows = await this.db
      .select({ slug: products.slug })
      .from(products)
      .where(excludeId ? ne(products.id, excludeId) : undefined);
    return buildUniqueSlug(base, rows.map((row) => row.slug));
  }
}

function categoryRef(
  category: { id: string | null; name: string | null; slug: string | null } | null,
): { id: string; name: string; slug: string } | null {
  if (!category?.id || !category.name || !category.slug) return null;
  return { id: category.id, name: category.name, slug: category.slug };
}
