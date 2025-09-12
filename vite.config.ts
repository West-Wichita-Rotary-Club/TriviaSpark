import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  // When building for static GitHub Pages, use "/TriviaSpark/"; otherwise use root
  base: process.env.STATIC_BUILD === "true" ? "/TriviaSpark/" : "/",
  define: {
    // Make STATIC_BUILD available to the client code
    "import.meta.env.VITE_STATIC_BUILD": JSON.stringify(
      process.env.STATIC_BUILD || "false"
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir:
      process.env.STATIC_BUILD === "true"
        ? path.resolve(import.meta.dirname, "docs")
        : path.resolve(import.meta.dirname, "TriviaSpark.Api", "wwwroot"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: false, // Disable error overlay that might cause reloads
    },
  },
});
