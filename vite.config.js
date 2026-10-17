import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const DEPLOY_VERSION = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VITE_APP_VERSION || ("v" + Date.now());

function versionPlugin() {
  return {
    name: "physix-version-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/version.json")) {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          res.end(JSON.stringify({ version: DEPLOY_VERSION, buildTime: Date.now() }));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version: DEPLOY_VERSION, buildTime: Date.now() }, null, 2)
      });
    }
  };
}

export default defineConfig({
  define: {
    __PHYSIX_VERSION__: JSON.stringify(DEPLOY_VERSION)
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    versionPlugin(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "icons.svg", "cursor.png"],
      manifest: false, // Use custom manifest.webmanifest in public/
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2,webmanifest}"],
        swSrc: "public/sw.js",
        swDest: "sw.js"
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/version\.json/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            urlPattern: /\/version\.json$/i,
            handler: "NetworkOnly"
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});