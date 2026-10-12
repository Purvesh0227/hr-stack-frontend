
import { useEffect, useState } from "react";
import {
    forgotPassword,
    verifyResetOtp,
    resetPassword
} from "../../services/api";
import { useNotification } from "../../contexts/NotificationContext";
import useSubmitLock from "../../hooks/useSubmitLock";

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!.*_-]).{8,64}$/;

const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;

    if (data?.error) return data.error;

    if (data && typeof data === "object") {
        return Object.values(data)[0] || fallback;
    }

    return fallback;
};

function ChangePassword({ email }) {
    const { showNotification } = useNotification();

    const [step, setStep] = useState("closed");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [loading, run] = useSubmitLock();

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setTimeout(
            () => setCooldown((current) => current - 1),
            1000
        );

        return () => clearTimeout(timer);
    }, [cooldown]);

    const sendOtp = () =>
        run(async () => {
            if (!email?.trim()) {
                showNotification(
                    "Your registered email could not be found.",
                    "error"
                );
                return;
            }

            try {
                const response = await forgotPassword({
                    email: email.trim()
                });

                showNotification(
                    response.data.message || "OTP request submitted.",
                    "success"
                );

                setOtp("");
                setStep("otp");
                setCooldown(60);
            } catch (error) {
                showNotification(
                    getErrorMessage(error, "Unable to send OTP."),
                    "error"
                );
            }
        });

    const handleVerifyOtp = (event) => {
        event.preventDefault();

        run(async () => {
            try {
                const response = await verifyResetOtp({
                    email: email.trim(),
                    otp
                });

                setResetToken(response.data.resetToken);
                setStep("password");
            } catch (error) {
                showNotification(
                    getErrorMessage(error, "Invalid or expired OTP."),
                    "error"
                );
            }
        });
    };

    const handleChangePassword = (event) => {
        event.preventDefault();

        if (!PASSWORD_REGEX.test(newPassword)) {
            showNotification(
                "Use 8–64 characters with uppercase, lowercase, a number and a special character.",
                "error"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification("Passwords do not match.", "error");
            return;
        }

        run(async () => {
            try {
                await resetPassword({
                    resetToken,
                    newPassword
                });

                showNotification(
                    "Password changed successfully.",
                    "success"
                );

                setStep("closed");
                setOtp("");
                setResetToken("");
                setNewPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setCooldown(0);
            } catch (error) {
                showNotification(
                    getErrorMessage(
                        error,
                        "Unable to change password."
                    ),
                    "error"
                );
            }
        });
    };

    const cancelChange = () => {
        setStep("closed");
        setOtp("");
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPassword(false);
    };

    return (
        <section className="change-password-section">
            <div className="change-password-header">
                <div>
                    <h3>Change Password</h3>
                    <p>
                        Verify your registered email before choosing a
                        new password.
                    </p>
                </div>

                {step === "closed" && (
                    <button
                        type="button"
                        onClick={sendOtp}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Change Password"}
                    </button>
                )}
            </div>

            {step === "otp" && (
                <form onSubmit={handleVerifyOtp}>
                    <p>
                        Enter the six-digit OTP sent to your registered
                        email.
                    </p>

                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(event) =>
                            setOtp(
                                event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6)
                            )
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                        type="button"
                        onClick={sendOtp}
                        disabled={loading || cooldown > 0}
                    >
                        {cooldown > 0
                            ? `Resend OTP in ${cooldown}s`
                            : "Resend OTP"}
                    </button>

                    <button type="button" onClick={cancelChange}>
                        Cancel
                    </button>
                </form>
            )}

            {step === "password" && (
                <form onSubmit={handleChangePassword}>
                    <p>Choose a strong new password.</p>

                    <label htmlFor="change-new-password">
                        New Password
                    </label>
                    <input
                        id="change-new-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        maxLength={64}
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(event.target.value)
                        }
                        required
                    />

                    <label htmlFor="change-confirm-password">
                        Confirm New Password
                    </label>
                    <input
                        id="change-confirm-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        maxLength={64}
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        required
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(event) =>
                                setShowPassword(event.target.checked)
                            }
                        />
                        Show passwords
                    </label>

                    <button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Update Password"}
                    </button>

                    <button type="button" onClick={cancelChange}>
                        Cancel
                    </button>
                </form>
            )}
        </section>
    );
}

export default ChangePassword;