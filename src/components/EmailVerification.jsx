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

    const [verificationMethod, setVerificationMethod] = useState("OTP");

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

    // useEffect(() => {
    //     if (!linkSent || !linkStartedAt || verified) {
    //         return;
    //     }

    //     let stopped = false;

    //     const poll = async () => {
    //         if (stopped || document.hidden) {
    //             return;
    //         }

    //         const elapsed =
    //             Date.now() - linkStartedAt;

    //         if (elapsed >= LINK_WAIT_MS) {
    //             stopped = true;
    //             return;
    //         }

    //         const isVerified =
    //             await checkVerificationStatus();

    //         if (isVerified) {
    //             stopped = true;
    //         }
    //     };

    //     const interval = setInterval(
    //         poll,
    //         STATUS_INTERVAL_MS
    //     );

    //     return () => {
    //         stopped = true;
    //         clearInterval(interval);
    //     };
    // }, [
    //     linkSent,
    //     linkStartedAt,
    //     verified,
    //     current
    // ]);

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
        <div className="email-verify-compact">
            <span className="email-verify-label">
                Email needs verification via
            </span>

            <div
                className="email-verify-toggle"
                role="group"
                aria-label="Email verification method"
            >
                <button
                    type="button"
                    className={
                        verificationMethod === "OTP"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setVerificationMethod("OTP")
                    }
                >
                    OTP
                </button>

                <button
                    type="button"
                    className={
                        verificationMethod === "LINK"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setVerificationMethod("LINK")
                    }
                >
                    Link
                </button>
            </div>

            <button
                type="button"
                className="email-verify-send-btn"
                onClick={
                    verificationMethod === "OTP"
                        ? sendOtp
                        : sendVerificationLink
                }
                disabled={sending || sendingLink}
            >
                {verificationMethod === "OTP"
                    ? sending
                        ? "..."
                        : "Send OTP"
                    : sendingLink
                        ? "..."
                        : "Send Link"}
            </button>
        </div>
    );
}

if (linkSent && !otpSent) {
    return (
        <div className="email-verify-compact email-verify-sent">
            <span className="email-verify-status">
                Verification link sent
            </span>

            <span className="email-verify-subtext">
                Check your email and click Verify Email
            </span>

            <button
                type="button"
                className="email-verify-small-action"
                onClick={sendVerificationLink}
                disabled={sendingLink || cooldown > 0}
            >
                {cooldown > 0
                    ? `${cooldown}s`
                    : "Resend"}
            </button>
        </div>
    );
}

    return (
         <div className="email-verify-compact email-verify-otp">
        <span className="email-verify-status">
            OTP sent
        </span>

        <input
            type="text"
            inputMode="numeric"
            placeholder="6-digit OTP"
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
            className="email-verify-small-action primary"
            onClick={verifyOtp}
            disabled={
                verifying ||
                otp.length !== 6
            }
        >
            {verifying ? "..." : "Verify"}
        </button>

        <button
            type="button"
            className="email-verify-resend-small"
            onClick={sendOtp}
            disabled={sending || cooldown > 0}
        >
            {cooldown > 0
                ? `${cooldown}s`
                : "Resend"}
        </button>
    </div>
    );
}

export default EmailVerification;