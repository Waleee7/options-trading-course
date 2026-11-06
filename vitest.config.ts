import { defineConfig } from "vitest/config";
import path from "node:path";

// a US timezone, so tests catch code that counts days in UTC by accident (CI itself runs in UTC)
process.env.TZ = "America/New_York";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
