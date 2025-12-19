import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/Inventory-QR/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Inventory QR Scanner",
        short_name: "Inventory",
        description: "Offline-first inventory scanning with QR codes.",
        start_url: "/Inventory-QR/",
        scope: "/Inventory-QR/",
        display: "standalone",
        background_color: "#0b1220",
        theme_color: "#0b1220",
        icons: [
          { src: "/Inventory-QR/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/Inventory-QR/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Cache everything needed after first load.
        // For an intranet “one-time load” scenario, this keeps the app usable offline.
        navigateFallback: "/Inventory-QR/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: "CacheFirst",
            options: {
              cacheName: "app-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
});
