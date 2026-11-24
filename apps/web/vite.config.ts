import path from "node:path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    {
      name: "isolate-middleware-dependency-cache",
      config(config) {
        // Verification servers must not invalidate the live dev server's bundles.
        if (config.server?.middlewareMode && !config.cacheDir) {
          return {
            cacheDir: path.join(
              tmpdir(),
              "crossposthub-vite-checks",
              randomUUID(),
            ),
          };
        }
      },
    },
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    entries: ["index.html", "src/**/*.{ts,tsx}"],
    include: ["@base-ui/react/menu"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
