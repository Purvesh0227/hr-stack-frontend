import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import {
    forgotPassword,
    verifyResetOtp,
    resetPassword
} from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import "../styles/global.css";
import useSubmitLock from "../hooks/useSubmitLock";

// Same rule as backend ResetPasswordRequest (max 64 because of BCrypt limit)
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!.*_-]).{8,64}$/;

// Backend sends {error: "..."} or {field: "..."} for validation
const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data && typeof data === "object") {
        return Object.values(data)[0] || fallback;
    }
    return fallback;
};

function ForgotPassword() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // "email" -> "otp" -> "password"
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, run] = useSubmitLock();
    const [cooldown, setCooldown] = useState(0);

    // reset token lives in memory only (never localStorage)
    const [resetToken, setResetToken] = useState("");

    // Resend countdown
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    // STEP 1: send OTP
    // STEP 1: send OTP
const sendOtp = () =>
    run(async () => {
        try {
            const res = await forgotPassword({ email: email.trim() });
            showNotification(res.data.message, "success");
            setOtp("");
            setStep("otp");
            setCooldown(60);
        } catch (error) {
            showNotification(
                getErrorMessage(error, "Something went wrong"),
                "error"
            );
        }
    });

const handleEmailSubmit = (e) => {
    e.preventDefault();
    sendOtp();
};

// STEP 2: verify OTP -> get reset token
const handleVerify = (e) => {
    e.preventDefault();
    run(async () => {
        try {
            const res = await verifyResetOtp({ email: email.trim(), otp });
            setResetToken(res.data.resetToken);
            setStep("password");
        } catch (error) {
            showNotification(
                getErrorMessage(error, "Invalid or expired OTP."),
                "error"
            );
        }
    });
};

// STEP 3: set new password
const handleReset = (e) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(newPassword)) {
        showNotification(
            "Password needs 8-64 chars, uppercase, lowercase, digit and special character",
            "error"
        );
        return;
    }
    if (newPassword !== confirmPassword) {
        showNotification("Passwords do not match", "error");
        return;
    }

    run(async () => {
        try {
            await resetPassword({ resetToken, newPassword });
            showNotification("Password reset successful. Please login.", "success");
            setResetToken("");
            navigate("/login");
        } catch (error) {
            showNotification(
                getErrorMessage(error, "Invalid or expired reset request."),
                "error"
            );
        }
    });
};

    const titles = {
        email: ["Forgot password?", "Enter your email, we will send you an OTP."],
        otp: ["Enter OTP", "We sent a 6-digit OTP to your email. Valid for 5 minutes."],
        password: ["New password", "Choose a strong password."]
    };

    return (
        <div className="login-page">
            <section className="login-brand-panel">
                <div className="login-brand-content">
                    <div className="login-logo">HRStack</div>
                    <div className="login-brand-copy">
                        <span className="login-brand-eyebrow">Account Recovery</span>
                        <h1>Locked out?<span> We will get you back in.</span></h1>
                    </div>
                </div>
            </section>

            <section className="login-form-panel">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-mobile-logo">HRStack</div>
                        <h2>{titles[step][0]}</h2>
                        <p>{titles[step][1]}</p>
                    </div>

                    {/* STEP 1 */}
                    {step === "email" && (
                        <form className="login-form" onSubmit={handleEmailSubmit}>
                            <div className="login-field">
                                <label htmlFor="fp-email">Email address</label>
                                <input
                                    id="fp-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    maxLength={255}
                                    required
                                />
                            </div>
                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                <span>{loading ? "Sending..." : "Send OTP"}</span>
                                <FiArrowRight size={17} />
                            </button>
                        </form>
                    )}

                    {/* STEP 2 */}
                    {step === "otp" && (
                        <form className="login-form" onSubmit={handleVerify}>
                            <div className="login-field">
                                <label htmlFor="fp-otp">6-digit OTP</label>
                                <input
                                    id="fp-otp"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    autoComplete="one-time-code"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="login-submit-btn"
                                disabled={loading || otp.length !== 6}
                            >
                                <span>{loading ? "Verifying..." : "Verify OTP"}</span>
                                <FiArrowRight size={17} />
                            </button>
                            <button
                                type="button"
                                className="login-forgot-link"
                                onClick={sendOtp}
                                disabled={loading || cooldown > 0}
                            >
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                            </button>
                        </form>
                    )}

                    {/* STEP 3 */}
                    {step === "password" && (
                        <form className="login-form" onSubmit={handleReset}>
                            <div className="login-field">
                                <label htmlFor="fp-new">New password</label>
                                <div className="login-password-wrapper">
                                    <input
                                        id="fp-new"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                        maxLength={64}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="login-password-toggle"
                                        onClick={() => setShowPassword((p) => !p)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                    </button>
                                </div>
                            </div>

                            <div className="login-field">
                                <label htmlFor="fp-confirm">Confirm password</label>
                                <input
                                    id="fp-confirm"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    maxLength={64}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                <span>{loading ? "Saving..." : "Reset password"}</span>
                                <FiArrowRight size={17} />
                            </button>
                        </form>
                    )}

                    <div className="login-register">
                        <Link to="/login">Back to login</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ForgotPassword;