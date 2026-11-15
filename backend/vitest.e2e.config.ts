import "dotenv/config";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? "";

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.e2e-spec.ts"],
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 60_000,
    globalSetup: ["./test/global-setup.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: testDatabaseUrl,
      MAIL_TRANSPORT: "console",
    },
  },
});
