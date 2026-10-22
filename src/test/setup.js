import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";

import { server } from "./msw/server";



// Used by: ThemeContext (indirect), PwaInstallPrompt (module level)
if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
    });
}

// Used by: Register.jsx, Profile.jsx (photo preview)
if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => "blob:mock-url";
}
if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
}


if (!window.HTMLCanvasElement.prototype.toDataURL) {
    window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,mock";
}



beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
    server.resetHandlers();
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
});
afterAll(() => server.close());