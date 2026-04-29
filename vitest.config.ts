import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["apps/api/src/**/*.test.{ts,tsx}"],
    setupFiles: ["./apps/api/src/test/setup.ts"],
  },
});
