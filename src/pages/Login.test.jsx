import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import { renderWithProviders } from "../test/utils";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./Login";

const API = "http://localhost:8080/employee";

// Login.jsx needs GoogleOAuthProvider even when Google login is disabled
function renderLogin() {
    return renderWithProviders(
        <GoogleOAuthProvider clientId="test-client-id">
            <Login />
        </GoogleOAuthProvider>,
        { route: "/login" }
    );
}

describe("Login page", () => {
    it("renders the credentials step with email and password inputs", () => {
        renderLogin();

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /sign in/i })
        ).toBeInTheDocument();
    });

    it("does not call the API when required fields are empty (native HTML5 validation)", async () => {
        const user = userEvent.setup();
        let called = false;

        server.use(
            http.post(`${API}/login`, () => {
                called = true;
                return HttpResponse.json({});
            })
        );

        renderLogin();

        await user.click(screen.getByRole("button", { name: /sign in/i }));

        // The browser blocks submit because inputs are required
        await new Promise((r) => setTimeout(r, 100));
        expect(called).toBe(false);
    });

    it("shows an error toast on wrong credentials and does not store a token", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.type(
            screen.getByLabelText(/email address/i),
            "wrong@example.com"
        );
        await user.type(screen.getByLabelText(/^password$/i), "wrong-password");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        // Toast from NotificationProvider
        expect(await screen.findByRole("alert")).toHaveTextContent(
            /invalid email or password/i
        );
        expect(localStorage.getItem("token")).toBeNull();
    });

    it("logs in successfully when 2FA is disabled (token stored, navigate called)", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.type(
            screen.getByLabelText(/email address/i),
            "admin@example.com"
        );
        await user.type(screen.getByLabelText(/^password$/i), "Test@1234");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(localStorage.getItem("token")).toBe("fake-jwt-token");
            expect(localStorage.getItem("role")).toBe("ADMIN");
        });
    });

    it("switches to the OTP step when the backend returns mfaRequired", async () => {
        server.use(
            http.post(`${API}/login`, () =>
                HttpResponse.json({
                    mfaRequired: true,
                    mfaToken: "mfa-abc",
                    maskedEmail: "u***@example.com",
                    resendAvailableInSeconds: 60
                })
            )
        );

        const user = userEvent.setup();
        renderLogin();

        await user.type(
            screen.getByLabelText(/email address/i),
            "user@example.com"
        );
        await user.type(screen.getByLabelText(/^password$/i), "Test@1234");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        // OTP step heading + masked email
        expect(
            await screen.findByRole("heading", { name: /check your email/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/u\*\*\*@example\.com/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/6-digit otp/i)).toBeInTheDocument();
    });

    it("shows an error and stays on the OTP step when the OTP is wrong", async () => {
        // First: 2FA on
        server.use(
            http.post(`${API}/login`, () =>
                HttpResponse.json({
                    mfaRequired: true,
                    mfaToken: "mfa-abc",
                    maskedEmail: "u***@example.com",
                    resendAvailableInSeconds: 60
                })
            ),
            http.post(`${API}/login/verify-otp`, () =>
                HttpResponse.json(
                    { error: "Invalid OTP. 4 attempt(s) left." },
                    { status: 400 }
                )
            )
        );

        const user = userEvent.setup();
        renderLogin();

        await user.type(
            screen.getByLabelText(/email address/i),
            "user@example.com"
        );
        await user.type(screen.getByLabelText(/^password$/i), "Test@1234");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await user.type(await screen.findByLabelText(/6-digit otp/i), "000000");
        await user.click(
            screen.getByRole("button", { name: /verify & sign in/i })
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /invalid otp/i
        );
        // Still on OTP step
        expect(screen.getByLabelText(/6-digit otp/i)).toBeInTheDocument();
        expect(localStorage.getItem("token")).toBeNull();
    });

    it("completes the 2FA login when the OTP is correct", async () => {
        server.use(
            http.post(`${API}/login`, () =>
                HttpResponse.json({
                    mfaRequired: true,
                    mfaToken: "mfa-abc",
                    maskedEmail: "u***@example.com",
                    resendAvailableInSeconds: 60
                })
            ),
            http.post(`${API}/login/verify-otp`, () =>
                HttpResponse.json({
                    token: "fake-jwt-after-otp",
                    employee: {
                        id: "1",
                        firstName: "test",
                        lastName: "Test",
                        email: "user@example.com",
                        role: "EMPLOYEE"
                    }
                })
            )
        );

        const user = userEvent.setup();
        renderLogin();

        await user.type(
            screen.getByLabelText(/email address/i),
            "user@example.com"
        );
        await user.type(screen.getByLabelText(/^password$/i), "Test@1234");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await user.type(await screen.findByLabelText(/6-digit otp/i), "123456");
        await user.click(
            screen.getByRole("button", { name: /verify & sign in/i })
        );

        await waitFor(() => {
            expect(localStorage.getItem("token")).toBe("fake-jwt-after-otp");
        });
    });

    it("returns to the credentials step from the OTP step", async () => {
        server.use(
            http.post(`${API}/login`, () =>
                HttpResponse.json({
                    mfaRequired: true,
                    mfaToken: "mfa-abc",
                    maskedEmail: "u***@example.com",
                    resendAvailableInSeconds: 60
                })
            )
        );

        const user = userEvent.setup();
        renderLogin();

        await user.type(
            screen.getByLabelText(/email address/i),
            "user@example.com"
        );
        await user.type(screen.getByLabelText(/^password$/i), "Test@1234");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        // Back to login button on the OTP step footer
        const back = await screen.findByRole("button", {
            name: /back to login/i
        });
        await user.click(back);

        expect(
            screen.getByRole("heading", { name: /welcome back/i })
        ).toBeInTheDocument();
    });
});