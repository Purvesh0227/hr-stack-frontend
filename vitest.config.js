import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    esbuild: {
        jsx: "automatic",
    },

    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.js"],
        css: false,
        clearMocks: true,
        restoreMocks: true,

        // MSW + jsdom sometimes leave handles open; don't hang the run
        testTimeout: 10000,
        hookTimeout: 10000,

        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.{js,jsx}"],
            exclude: [
                "src/main.jsx",
                "src/sw.js",
                "src/**/*.test.{js,jsx}",
                "src/test/**"
            ]
        }
    }
});