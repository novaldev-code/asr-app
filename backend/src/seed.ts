import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { auth } from "./auth/auth.js";
import { db, pool } from "./db/database.js";
import { categories, products, shippingRates, users } from "./db/schema/index.js";

interface CatalogSeed {
  categories: { name: string; slug: string; description: string }[];
  products: {
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    isActive: boolean;
    featured: boolean;
  }[];
  shippingRates: { province: string; cost: number; isDefault: boolean }[];
}

const CATEGORY_SLUGS: Record<string, string> = {
  c1: "biji-kopi",
  c2: "kopi-bubuk",
  c3: "drip-bag",
  c4: "alat-seduh",
  c5: "merchandise",
  c6: "paket-hadiah",
};

const DEMO_PASSWORD = "Password123!";
const DEMO_USERS = [
  { name: "Bagas Admin", email: "admin@app.test", role: "admin" as const },
  { name: "Nadia Pelanggan", email: "customer@app.test", role: "customer" as const },
];

async function seedUsers(): Promise<void> {
  for (const account of DEMO_USERS) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    if (!existing) {
      await auth.api.signUpEmail({
        body: {
          name: account.name,
          email: account.email,
          password: DEMO_PASSWORD,
        },
      });
    }

    await db
      .update(users)
      .set({ role: account.role, emailVerified: true, updatedAt: new Date() })
      .where(eq(users.email, account.email));
  }
}

async function seedCatalog(): Promise<void> {
  const catalog = JSON.parse(
    readFileSync(new URL("./seed/catalog.json", import.meta.url), "utf8"),
  ) as CatalogSeed;

  await db
    .insert(categories)
    .values(catalog.categories)
    .onConflictDoNothing({ target: categories.slug });

  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

  const productRows = catalog.products.map((product) => {
    const slug = CATEGORY_SLUGS[product.categoryId];
    return {
      categoryId: slug ? (categoryIds.get(slug) ?? null) : null,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      featured: product.featured,
    };
  });

  await db
    .insert(products)
    .values(productRows)
    .onConflictDoNothing({ target: products.slug });

  await db
    .insert(shippingRates)
    .values(catalog.shippingRates)
    .onConflictDoNothing({ target: shippingRates.province });
}

async function main(): Promise<void> {
  await seedUsers();
  await seedCatalog();
  console.log("Seed selesai.");
  console.log(`Admin    : ${DEMO_USERS[0].email} / ${DEMO_PASSWORD}`);
  console.log(`Pelanggan: ${DEMO_USERS[1].email} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
