import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

type HostingTarget = "cloudflare_pages" | "github_pages";
type BuildTarget = HostingTarget | "default";

function resolveBuildTarget(raw: string | undefined): BuildTarget {
  if (raw === "cloudflare_pages") return "cloudflare_pages";
  if (raw === "github_pages") return "github_pages";
  return "default";
}

function resolveBase(target: BuildTarget): string {
  // default：本機 / 一般靜態部署 → 用根目錄
  // cloudflare_pages：根目錄
  // github_pages：repo 子路徑
  if (target === "github_pages") return "/Inventory-QR/";
  return "/";
}

export default defineConfig(({ mode: buildTargetRaw }) => {
  const buildTarget = resolveBuildTarget(buildTargetRaw);
  const BASE = resolveBase(buildTarget);

  return {
    base: BASE,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["apple-touch-icon.png"],
        manifest: {
          name: "Inventory QR Scanner",
          short_name: "Inventory",
          description: "Offline-first inventory scanning with QR codes.",
          start_url: BASE,
          scope: BASE,
          display: "standalone",
          background_color: "#0b1220",
          theme_color: "#0b1220",
          icons: [
            { src: `${BASE}icons/icon-192.png`, sizes: "192x192", type: "image/png" },
            { src: `${BASE}icons/icon-512.png`, sizes: "512x512", type: "image/png" },
          ],
        },
        workbox: {
          navigateFallback: `${BASE}index.html`,
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
    server: { host: true },
  };
});
