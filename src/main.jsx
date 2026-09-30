import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";

import "./styles/theme.css";
import "./index.css";
import "./App.css";

const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
        console.warn("Service Worker is not supported.");
        return;
    }

    const isProduction = import.meta.env.PROD;

    const swUrl = isProduction
        ? "/hr-stack-frontend/sw.js"
        : "/hr-stack-frontend/dev-sw.js?dev-sw";

    try {
        const registration = await navigator.serviceWorker.register(
            swUrl,
            {
                scope: "/hr-stack-frontend/",
                type: isProduction ? "classic" : "module",
            }
        );

        console.log(
            "HR-Stack Service Worker registered successfully:",
            registration
        );
    } catch (error) {
        console.error(
            "HR-Stack Service Worker registration failed:",
            error
        );
    }
};

registerServiceWorker();

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <BrowserRouter basename="/hr-stack-frontend">
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </BrowserRouter>
);