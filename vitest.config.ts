import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["./app/**/*.test.ts", "./app/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
    },
  },
});
