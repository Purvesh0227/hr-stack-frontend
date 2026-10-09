import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    loginEmployee,
    verifyLoginOtp,
    resendLoginOtp
} from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import "../styles/global.css";
import useSubmitLock from "../hooks/useSubmitLock";

// Backend sends {error: "..."} or {field: "..."} for validation
const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data && typeof data === "object") {
        return Object.values(data)[0] || fallback;
    }
    return fallback;
};

function Login() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // "credentials" -> "otp"
    const [step, setStep] = useState("credentials");

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    // OTP step state. mfaToken lives in memory only (never localStorage)
    const [mfaToken, setMfaToken] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const [loading, run] = useSubmitLock();

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    // Resend countdown
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    // Back to the email+password form and forget everything about the OTP
    const resetToCredentials = () => {
        setStep("credentials");
        setMfaToken("");
        setMaskedEmail("");
        setOtp("");
        setCooldown(0);
        setLoginData((prev) => ({ ...prev, password: "" }));
    };

    // Backend says "...Please log in again." when the login attempt is dead
    const handleOtpError = (error, fallback) => {
        const message = getErrorMessage(error, fallback);
        showNotification(message, "error");
        if (/log in again/i.test(message)) {
            resetToCredentials();
        }
    };

    // Save the real session (used after OTP, or when 2FA is switched off)
    const completeLogin = (data) => {
        const { token, employee } = data;

        localStorage.setItem("token", token);
        localStorage.setItem("employee", JSON.stringify(employee));
        localStorage.setItem("email", employee.email);
        localStorage.setItem("role", employee.role);

        showNotification("Login Successful", "success");
        navigate("/");
    };

    // STEP 1: email + password
    const handleLogin = (e) => {
        e.preventDefault();
        run(async () => {
            try {
                const response = await loginEmployee(loginData);
                const data = response.data;

                if (data.mfaRequired) {
                    setMfaToken(data.mfaToken);
                    setMaskedEmail(data.maskedEmail);
                    setCooldown(data.resendAvailableInSeconds ?? 60);
                    setOtp("");
                    setLoginData((prev) => ({ ...prev, password: "" }));
                    setStep("otp");
                    showNotification("OTP sent to your email", "success");
                } else {
                    // 2FA is off on the server
                    completeLogin(data);
                }
            } catch (error) {
                showNotification(
                    getErrorMessage(error, "Invalid Credentials"),
                    "error"
                );
            }
        });
    };

    // STEP 2: verify OTP
    const handleVerify = (e) => {
        e.preventDefault();
        run(async () => {
            try {
                const response = await verifyLoginOtp({ mfaToken, otp });
                completeLogin(response.data);
            } catch (error) {
                setOtp("");
                handleOtpError(error, "Invalid or expired OTP.");
            }
        });
    };

    // Resend OTP
    const handleResend = () =>
        run(async () => {
            try {
                const response = await resendLoginOtp({ mfaToken });
                setCooldown(response.data.resendAvailableInSeconds ?? 60);
                setOtp("");
                showNotification("New OTP sent to your email", "success");
            } catch (error) {
                handleOtpError(error, "Could not resend OTP.");
            }
        });

    return (
        <div className="login-page">

            {/* =========================================
                LEFT BRANDING PANEL
            ========================================= */}

            <section className="login-brand-panel">

                <div className="login-brand-content">

                    <div className="login-logo">
                        HRStack
                    </div>

                    <div className="login-brand-copy">
                        <span className="login-brand-eyebrow">
                            Employee Management Platform
                        </span>

                        <h1>
                            Everything your team
                            <span> needs, in one place.</span>
                        </h1>

                        <p>
                            Manage employees, attendance, documents,
                            and payroll information from a single
                            secure workspace.
                        </p>
                    </div>
                </div>

            </section>


            {/* =========================================
                RIGHT LOGIN PANEL
            ========================================= */}

            <section className="login-form-panel">

                <div className="login-card">

                    <div className="login-header">

                        <div className="login-mobile-logo">
                            HRStack
                        </div>

                        {step === "credentials" ? (
                            <>
                                <h2>Welcome back</h2>
                                <p>Sign in to continue to your account.</p>
                            </>
                        ) : (
                            <>
                                <h2>Check your email</h2>
                                <p>
                                    We sent a 6-digit OTP to {maskedEmail}.
                                    Valid for 5 minutes.
                                </p>
                            </>
                        )}

                    </div>


                    {/* =====================
                        STEP 1: CREDENTIALS
                    ===================== */}

                    {step === "credentials" && (
                        <form
                            className="login-form"
                            onSubmit={handleLogin}
                        >

                            {/* EMAIL */}

                            <div className="login-field">

                                <label htmlFor="login-email">
                                    Email address
                                </label>

                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={loginData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="login-field">

                                <div className="login-label-row">

                                    <label htmlFor="login-password">Password</label>
                                    <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>

                                </div>

                                <div className="login-password-wrapper">

                                    <input
                                        id="login-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        value={loginData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="login-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <FiEyeOff size={17} />
                                        ) : (
                                            <FiEye size={17} />
                                        )}
                                    </button>

                                </div>

                            </div>


                            {/* LOGIN BUTTON */}

                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                <span>{loading ? "Signing in..." : "Sign in"}</span>
                                <FiArrowRight size={17} />
                            </button>

                        </form>
                    )}


                    {/* =====================
                        STEP 2: OTP
                    ===================== */}

                    {step === "otp" && (
                        <form
                            className="login-form"
                            onSubmit={handleVerify}
                        >

                            <div className="login-field">
                                <label htmlFor="login-otp">6-digit OTP</label>
                                <input
                                    id="login-otp"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    autoComplete="one-time-code"
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="login-submit-btn"
                                disabled={loading || otp.length !== 6}
                            >
                                <span>{loading ? "Verifying..." : "Verify & Sign in"}</span>
                                <FiArrowRight size={17} />
                            </button>

                            <button
                                type="button"
                                className="login-forgot-link"
                                onClick={handleResend}
                                disabled={loading || cooldown > 0}
                            >
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                            </button>

                        </form>
                    )}


                    {/* FOOTER LINK */}

                    <div className="login-register">

                        {step === "credentials" ? (
                            <>
                                <span>
                                    Don't have an account?
                                </span>

                                <Link to="/register">
                                    Create an account
                                </Link>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="login-forgot-link"
                                onClick={resetToCredentials}
                            >
                                Back to login
                            </button>
                        )}

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Login;