import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const version = JSON.parse(readFileSync("./package.json", "utf-8")).version
const hash = execSync("git rev-parse --short HEAD").toString().trim()

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __GIT_HASH__: JSON.stringify(hash),
    },
    envPrefix: "VITE_", // VITE_で始まる環境変数を自動で読み込む
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    plugins: [
      tanstackRouter({
        autoCodeSplitting: true,
        generatedRouteTree: resolve(__dirname, "./src/app/routeTree.gen.ts"),
        routesDirectory: resolve(__dirname, "./src/app/routes"),
        target: "react",
      }),
      react(),
      cloudflare(),
      tailwindcss(),
      VitePWA({
        devOptions: {
          enabled: true,
          type: "module",
        },
        filename: "sw.ts",
        includeAssets: ["favicon.ico", "apple-touch-icon.png"],
        injectRegister: "auto",
        // injectManifest: {},
        manifest: {
          background_color: "#34A5A8",
          description: "MusicKitを使ったApple Musicライクなアプリケーション",
          display: "fullscreen",
          icons: [
            {
              sizes: "48x48",
              src: "/icons/icon-48x48.png",
              type: "image/png",
            },
            {
              sizes: "72x72",
              src: "/icons/icon-72x72.png",
              type: "image/png",
            },
            {
              sizes: "96x96",
              src: "/icons/icon-96x96.png",
              type: "image/png",
            },
            {
              sizes: "144x144",
              src: "/icons/icon-144x144.png",
              type: "image/png",
            },
            {
              sizes: "192x192",
              src: "/icons/icon-192x192.png",
              type: "image/png",
            },
            {
              sizes: "256x256",
              src: "/icons/icon-256x256.png",
              type: "image/png",
            },
            {
              sizes: "512x512",
              src: "/icons/icon-512x512.png",
              type: "image/png",
            },
          ],
          name: "MusicKit",
          orientation: "portrait",
          short_name: "MusicKit",
          start_url: "/",
          theme_color: "#34A5A8",
        },
        registerType: "autoUpdate",
        srcDir: "src",
        strategies: "injectManifest",
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    worker: {
      format: "es",
    },
  }
})
