import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  AUTH_COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  CRON_SECRET: z.string().min(1).optional(),
  BLOB_PRODUCTS_READ_WRITE_TOKEN: z.string().min(1).optional(),
  BLOB_PROOFS_READ_WRITE_TOKEN: z.string().min(1).optional(),
  MAIL_TRANSPORT: z.enum(["console", "smtp"]).default("console"),
  MAIL_FROM: z.string().default("Mocha & Co. <no-reply@mocha.test>"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  ORDER_EXPIRY_HOURS: z.coerce.number().int().positive().default(24),
  LOW_STOCK_THRESHOLD: z.coerce.number().int().nonnegative().default(5),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env: Env = parsed.data;
