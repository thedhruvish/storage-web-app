import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";
// import { analyzer } from "vite-bundle-analyzer";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    // analyzer(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
    cssMinify: true,
    terserOptions: {
      compress: false,
      mangle: false
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
