import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NotificationCenterProvider } from "./contexts/NotificationCenterContext";
import AppRoutes from "./routes";

function renderApp(initialRoute = "/login") {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <ThemeProvider>
                <NotificationProvider>
                    <NotificationCenterProvider>
                        <AppRoutes />
                    </NotificationCenterProvider>
                </NotificationProvider>
            </ThemeProvider>
        </MemoryRouter>
    );
}

describe("App smoke test", () => {
    it("renders the login page when no session exists", async () => {
        renderApp("/login");

        expect(
            await screen.findByRole("heading", { name: /welcome back/i })
        ).toBeInTheDocument();
    });

    it("redirects to /login when accessing a protected route without a session", async () => {
        renderApp("/");

        expect(
            await screen.findByRole("heading", { name: /welcome back/i })
        ).toBeInTheDocument();
    });

    it("renders the dashboard home when the session exists", async () => {
        localStorage.setItem("token", "fake-jwt-token");
        localStorage.setItem(
            "employee",
            JSON.stringify({
                id: "1",
                empId: "HRStack_2025_IT_001",
                firstName: "test",
                lastName: "Test",
                email: "user@example.com",
                role: "EMPLOYEE",
                status: "ACTIVE"
            })
        );
        localStorage.setItem("email", "user@example.com");
        localStorage.setItem("role", "EMPLOYEE");

        renderApp("/");

        expect(
            await screen.findByRole("heading", { name: /welcome,\s*test/i })
        ).toBeInTheDocument();
    });
});