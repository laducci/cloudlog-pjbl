import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // necessário para o matcher toPassAsync() do ArchUnitTS
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
  },
});
