import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "StoreOne cloud",
        short_name: "storeone",
        description: "Control Your Data. Own Your Choices.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // cleanupOutdatedCaches: true,
        // clientsClaim: true,
        // skipWaiting: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,

        // globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        // runtimeCaching: [
        //   // ✅ HTML pages (only visited page is fetched)
        //   {
        //     urlPattern: ({ request }) => request.mode === "navigate",
        //     handler: "NetworkFirst",
        //     options: {
        //       cacheName: "pages-cache",
        //       expiration: {
        //         maxEntries: 20,
        //         maxAgeSeconds: 60 * 60 * 24, // 1 day
        //       },
        //     },
        //   },
        //   {
        //     urlPattern: ({ request }) =>
        //       request.destination === "script" ||
        //       request.destination === "style",
        //     handler: "CacheFirst",
        //     options: {
        //       cacheName: "assets-cache",
        //       expiration: {
        //         maxEntries: 100,
        //         maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        //       },
        //     },
        //   },

        //   {
        //     urlPattern: ({ request }) => request.destination === "font",
        //     handler: "CacheFirst",
        //     options: {
        //       cacheName: "media-cache",
        //       expiration: {
        //         maxEntries: 100,
        //         maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
        //       },
        //     },
        //   },
        // ],
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
    cssMinify: true,
    terserOptions: {
      compress: false,
      mangle: false,
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
