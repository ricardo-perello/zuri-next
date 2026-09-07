import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Zuri Next",
        short_name: "Zuri",
        description: "Glanceable live nearby Zurich departures",
        theme_color: "#0b0f14",
        background_color: "#0b0f14",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [],
      },
    }),
  ],
  server: {
    proxy: {
      "/transport": {
        target: "https://transport.opendata.ch",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/transport/, ""),
      },
    },
  },
  optimizeDeps: {
    include: ["@zuri-next/core"],
  },
});
