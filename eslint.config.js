import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    // Ignore build artifacts and generated files — NEVER lint these
    globalIgnores([
        "dist",
        "dev-dist",
        "coverage",
        "node_modules",
        "public",
        "src/sw.js",
        "src/test/msw/**",
        "vitest.config.js",
        "playwright.config.js"
    ]),

    {
        files: ["**/*.{js,jsx}"],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                clients: "readonly",
                self: "readonly",
                caches: "readonly",
                FetchEvent: "readonly",
                ExtendableEvent: "readonly",
                importScripts: "readonly"
            },
            parserOptions: { ecmaFeatures: { jsx: true } }
        },
        rules: {
            "no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
            ],
            "no-empty": "warn",
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/immutability": "warn",
            "react-hooks/exhaustive-deps": "warn",
            "react-refresh/only-export-components": "off"
        }
    }
]);