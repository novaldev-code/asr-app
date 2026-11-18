import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { env } from "../config/env.js";
import { db } from "../db/database.js";
import * as schema from "../db/schema/index.js";
import { mailer } from "../mail/mailer.service.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.FRONTEND_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      await mailer.sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set(
        "callbackURL",
        `${env.FRONTEND_URL}/login?verified=1`,
      );
      await mailer.sendVerificationEmail(
        user.email,
        verificationUrl.toString(),
      );
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["customer", "admin"],
        required: false,
        defaultValue: "customer",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: env.AUTH_COOKIE_SAMESITE,
      secure: env.NODE_ENV === "production",
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/forget-password": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
});
