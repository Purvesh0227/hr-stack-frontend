import { useEffect, useState } from "react";
import {
    sendEmailVerificationOtp,
    verifyEmailOtp,
    sendEmailVerificationLink,
    getEmailVerificationStatus
} from "../services/api";
import useSubmitLock from "../hooks/useSubmitLock";
import { useNotification } from "../contexts/NotificationContext";
import { getErrorMessage } from "../utils/errorUtils";

const normalize = (email) =>
    email.trim().toLowerCase();

const LINK_WAIT_MS = 15 * 60 * 1000;
const STATUS_INTERVAL_MS = 5000;

function EmailVerification({
    email,
    emailValid,
    verified,
    onVerified
}) {
    const { showNotification } = useNotification();

    const [sending, runSend] = useSubmitLock();
    const [verifying, runVerify] = useSubmitLock();
    const [sendingLink, runSendLink] = useSubmitLock();
    const [checking, runCheck] = useSubmitLock();

    const [sentTo, setSentTo] = useState("");
    const [otp, setOtp] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const [linkSentTo, setLinkSentTo] = useState("");
    const [linkStartedAt, setLinkStartedAt] = useState(null);

    const current = normalize(email);

    const otpSent = sentTo === current;
    const linkSent = linkSentTo === current;

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setTimeout(
            () => setCooldown((value) => value - 1),
            1000
        );

        return () => clearTimeout(timer);
    }, [cooldown]);

    const checkVerificationStatus = async () => {
        if (!current || document.hidden) {
            return;
        }

        try {
            const response =
                await getEmailVerificationStatus({
                    email: current
                });

            if (response.data?.verified) {
                onVerified(current);

                showNotification(
                    "Email verified successfully.",
                    "success"
                );

                return true;
            }
        } catch (error) {
            // Background polling should not spam the user.
            console.error(
                "Email verification status check failed:",
                error
            );
        }

        return false;
    };

    useEffect(() => {
        if (!linkSent || !linkStartedAt || verified) {
            return;
        }

        let stopped = false;

        const poll = async () => {
            if (stopped || document.hidden) {
                return;
            }

            const elapsed =
                Date.now() - linkStartedAt;

            if (elapsed >= LINK_WAIT_MS) {
                stopped = true;
                return;
            }

            const isVerified =
                await checkVerificationStatus();

            if (isVerified) {
                stopped = true;
            }
        };

        const interval = setInterval(
            poll,
            STATUS_INTERVAL_MS
        );

        return () => {
            stopped = true;
            clearInterval(interval);
        };
    }, [
        linkSent,
        linkStartedAt,
        verified,
        current
    ]);

    const sendOtp = () =>
        runSend(async () => {
            try {
                await sendEmailVerificationOtp({
                    email: current
                });

                setSentTo(current);
                setLinkSentTo("");
                setOtp("");
                setCooldown(60);

                showNotification(
                    "OTP sent to your email.",
                    "success"
                );
            } catch (error) {
                showNotification(
                    getErrorMessage(
                        error,
                        "Unable to send OTP"
                    ),
                    "error"
                );
            }
        });

    const sendVerificationLink = () =>
        runSendLink(async () => {
            try {
                await sendEmailVerificationLink({
                    email: current
                });

                setLinkSentTo(current);
                setLinkStartedAt(Date.now());
                setSentTo("");
                setCooldown(60);

                showNotification(
                    "Verification link sent to your email.",
                    "success"
                );
            } catch (error) {
                showNotification(
                    getErrorMessage(
                        error,
                        "Unable to send verification link"
                    ),
                    "error"
                );
            }
        });

    const verifyOtp = () =>
        runVerify(async () => {
            try {
                await verifyEmailOtp({
                    email: current,
                    otp
                });

                onVerified(current);

                showNotification(
                    "Email verified successfully.",
                    "success"
                );
            } catch (error) {
                showNotification(
                    getErrorMessage(
                        error,
                        "Unable to verify OTP"
                    ),
                    "error"
                );
            }
        });

    const manuallyCheckVerification = () =>
        runCheck(async () => {
            const verifiedNow =
                await checkVerificationStatus();

            if (!verifiedNow) {
                showNotification(
                    "Email is not verified yet. Please click the link in your email first.",
                    "error"
                );
            }
        });

    if (!emailValid) {
        return null;
    }

    if (verified) {
        return (
            <p className="email-verify-success">
                ✓ Email verified
            </p>
        );
    }

    if (!otpSent && !linkSent) {
        return (
            <div className="email-verify-box">
                <p className="email-verify-hint">
                    Verify your email before creating your account.
                </p>

                <div className="email-verify-row">
                    <button
                        type="button"
                        className="email-verify-btn"
                        onClick={sendOtp}
                        disabled={sending || sendingLink}
                    >
                        {sending
                            ? "Sending OTP..."
                            : "Verify with OTP"}
                    </button>

                    <button
                        type="button"
                        className="email-verify-btn"
                        onClick={sendVerificationLink}
                        disabled={sendingLink || sending}
                    >
                        {sendingLink
                            ? "Sending Link..."
                            : "Verify with Link"}
                    </button>
                </div>
            </div>
        );
    }

    if (linkSent && !otpSent) {
        return (
            <div className="email-verify-box">
                <p className="email-verify-hint">
                    Verification link sent to:
                </p>

                <strong className="email-verify-email">
                    {current}
                </strong>

                <p className="email-verify-hint">
                    Open the email and click
                    <strong> Verify Email</strong>.
                </p>

                <p className="email-verify-hint">
                    This page will automatically detect
                    the verification.
                </p>

                {/* <button
                    type="button"
                    className="email-verify-btn"
                    onClick={manuallyCheckVerification}
                    disabled={checking}
                >
                    {checking
                        ? "Checking..."
                        : "I've Verified My Email"}
                </button> */}

                <button
                    type="button"
                    className="email-verify-resend"
                    onClick={sendVerificationLink}
                    disabled={
                        sendingLink ||
                        cooldown > 0
                    }
                >
                    {cooldown > 0
                        ? `Resend Link in ${cooldown}s`
                        : "Resend Verification Link"}
                </button>
            </div>
        );
    }

    return (
        <div className="email-verify-box">
            <p className="email-verify-hint">
                Enter the 6-digit OTP sent to {current}
            </p>

            <div className="email-verify-row">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) =>
                        setOtp(
                            e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6)
                        )
                    }
                    autoComplete="one-time-code"
                    aria-label="Email verification OTP"
                />

                <button
                    type="button"
                    className="email-verify-btn"
                    onClick={verifyOtp}
                    disabled={
                        verifying ||
                        otp.length !== 6
                    }
                >
                    {verifying
                        ? "Verifying..."
                        : "Verify OTP"}
                </button>
            </div>

            <button
                type="button"
                className="email-verify-resend"
                onClick={sendOtp}
                disabled={
                    sending ||
                    cooldown > 0
                }
            >
                {cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : "Resend OTP"}
            </button>
        </div>
    );
}

export default EmailVerification;