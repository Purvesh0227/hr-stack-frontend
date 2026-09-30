import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "/hr-stack-frontend/",

    plugins: [
        react(),

        VitePWA({
            registerType: "autoUpdate",

            injectRegister: "auto",

            devOptions: {
                enabled: true,
            },

            includeAssets: [
                "favicon.ico",
                "robots.txt",
            ],

            manifest: {
                id: "/hr-stack-frontend/",
                name: "HR-Stack",
                short_name: "HR-Stack",
                description:
                    "HR-Stack Employee Management Application",

                start_url: "/hr-stack-frontend/",
                scope: "/hr-stack-frontend/",
                display: "standalone",

                theme_color: "#0f172a",
                background_color: "#ffffff",
                orientation: "any",

                icons: [
                    {
                        src: "/hr-stack-frontend/icons/icon-192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/hr-stack-frontend/icons/icon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/hr-stack-frontend/icons/icon-512-maskable.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },

            workbox: {
                navigateFallback:
                    "/hr-stack-frontend/offline.html",

                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,webp,woff,woff2}",
                ],

                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
            },
        }),
    ],
});