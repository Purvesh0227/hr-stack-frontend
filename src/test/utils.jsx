import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../contexts/ThemeContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { NotificationCenterProvider } from "../contexts/NotificationCenterContext";

export function renderWithProviders(
    ui,
    { route = "/", loggedInAs = null, withProviders = true } = {}
) {
    if (loggedInAs) seedAuth(loggedInAs);

    const Wrapper = withProviders
        ? ({ children }) => (
              <MemoryRouter initialEntries={[route]}>
                  <ThemeProvider>
                      <NotificationProvider>
                          <NotificationCenterProvider>
                              {children}
                          </NotificationCenterProvider>
                      </NotificationProvider>
                  </ThemeProvider>
              </MemoryRouter>
          )
        : ({ children }) => (
              <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          );

    return { ...render(ui, { wrapper: Wrapper }) };
}

export function seedAuth(role = "EMPLOYEE", overrides = {}) {
    const employee = {
        id: "11111111-1111-1111-1111-111111111111",
        empId: "HRStack_2025_IT_001",
        firstName: role === "ADMIN" ? "Admin" : "test",
        lastName: role === "ADMIN" ? "One" : "Test",
        email: role === "ADMIN" ? "admin@example.com" : "user@example.com",
        mobile: "9999999999",
        role,
        status: "ACTIVE",
        ...overrides
    };

    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem("employee", JSON.stringify(employee));
    localStorage.setItem("email", employee.email);
    localStorage.setItem("role", role);

    return employee;
}

export function clearAuth() {
    ["token", "employee", "email", "role"].forEach((k) =>
        localStorage.removeItem(k)
    );
}