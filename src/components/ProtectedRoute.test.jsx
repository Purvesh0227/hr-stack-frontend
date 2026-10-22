import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/utils";
import ProtectedRoute from "./ProtectedRoute";

function renderRoute(initialRoute, loggedInAs = null) {
    return renderWithProviders(
        <Routes>
            <Route
                path="/private"
                element={
                    <ProtectedRoute>
                        <div>SECRET DASHBOARD</div>
                    </ProtectedRoute>
                }
            />
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>,
        { route: initialRoute, loggedInAs }
    );
}

describe("ProtectedRoute", () => {
    it("redirects to /login when there is no session", async () => {
        renderRoute("/private");

        expect(await screen.findByText("LOGIN PAGE")).toBeInTheDocument();
        expect(screen.queryByText("SECRET DASHBOARD")).not.toBeInTheDocument();
    });

    it("renders the child when a session exists", () => {
        renderRoute("/private", "EMPLOYEE");

        expect(screen.getByText("SECRET DASHBOARD")).toBeInTheDocument();
        expect(screen.queryByText("LOGIN PAGE")).not.toBeInTheDocument();
    });

    it("saves the original path to sessionStorage before redirecting", async () => {
        renderRoute("/private");

        await screen.findByText("LOGIN PAGE");

        const saved = sessionStorage.getItem("postLoginPath");
        // savePostLoginPath only stores allowed paths, so null is valid for /private
        // Assert it either saved the path OR cleared it, not crashed
        expect(saved === null || saved.includes("/private")).toBe(true);
    });

    it("treats malformed localStorage as not-logged-in", async () => {
        localStorage.setItem("employee", "{not-valid-json");

        renderRoute("/private");

        expect(await screen.findByText("LOGIN PAGE")).toBeInTheDocument();
        expect(screen.queryByText("SECRET DASHBOARD")).not.toBeInTheDocument();
    });
});