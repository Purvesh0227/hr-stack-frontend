// src/contexts/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { readStorageItem, writeStorageValue } from "../utils/storage";

const ThemeContext = createContext(null);
const STORAGE_KEY = "hrstack-theme";

function getInitialTheme() {
    const stored = readStorageItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "light";
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        writeStorageValue(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}