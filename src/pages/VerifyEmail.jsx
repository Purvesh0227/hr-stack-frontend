import {
    useEffect,
    useRef,
    useState
} from "react";
import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    confirmEmailVerificationLink
} from "../services/api";

import { useNotification } from "../contexts/NotificationContext";
import { getErrorMessage } from "../utils/errorUtils";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { showNotification } =
        useNotification();

    const [status, setStatus] =
        useState("ready");

    const verificationStarted =
        useRef(false);

    useEffect(() => {
        if (verificationStarted.current) {
            return;
        }

        verificationStarted.current = true;

        const token =
            searchParams.get("token");

        // Remove token immediately.
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        if (!token) {
            setStatus("invalid");
            return;
        }

        const verifyEmail = async () => {
            try {
                setStatus("verifying");

                const response =
                    await confirmEmailVerificationLink(
                        token
                    );

                const email =
                    response.data?.email;

                setStatus("success");

                showNotification(
                    "Email verified successfully.",
                    "success"
                );

                // Store only for this page flow.
                if (email) {
                    sessionStorage.setItem(
                        "hrstack-verified-email",
                        email
                    );
                }
            } catch (error) {
                const message =
                    getErrorMessage(
                        error,
                        "Unable to verify email."
                    );

                if (
                    message.toLowerCase().includes(
                        "already been used"
                    )
                ) {
                    setStatus("used");
                } else if (
                    message.toLowerCase().includes(
                        "expired"
                    )
                ) {
                    setStatus("expired");
                } else {
                    setStatus("invalid");
                }

                showNotification(
                    message,
                    "error"
                );
            }
        };

        verifyEmail();
    }, [searchParams, showNotification]);

    const continueToRegister = () => {
        const email =
            sessionStorage.getItem(
                "hrstack-verified-email"
            );

        sessionStorage.removeItem(
            "hrstack-verified-email"
        );

        navigate("/register", {
            state: {
                verifiedEmail: email || ""
            }
        });
    };

    if (status === "ready") {
        return (
            <div className="email-verification-page">
                <div className="email-verification-card">
                    <div className="email-verification-icon">
                        ✉
                    </div>

                    <h1>Confirm your email</h1>

                    <p>
                        We're ready to verify your
                        email address.
                    </p>
                </div>
            </div>
        );
    }

    if (status === "verifying") {
        return (
            <div className="email-verification-page">
                <div className="email-verification-card">
                    <div className="email-verification-spinner">
                        ...
                    </div>

                    <h1>Verifying your email</h1>

                    <p>
                        Please wait while we confirm
                        your email address.
                    </p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="email-verification-page">
                <div className="email-verification-card">
                    <div className="email-verification-success-icon">
                        ✓
                    </div>

                    <h1>Email verified</h1>

                    <p>
                        Your email address has been
                        successfully verified.
                    </p>

                    <button
                        type="button"
                        className="email-verification-primary"
                        onClick={continueToRegister}
                    >
                        Continue to Registration
                    </button>
                </div>
            </div>
        );
    }

    const title =
        status === "expired"
            ? "Link expired"
            : status === "used"
                ? "Link already used"
                : "Invalid verification link";

    const description =
        status === "expired"
            ? "This verification link has expired. Please request a new verification link."
            : status === "used"
                ? "This verification link has already been used."
                : "This verification link is invalid or is no longer valid.";

    return (
        <div className="email-verification-page">
            <div className="email-verification-card">
                <div className="email-verification-error-icon">
                    !
                </div>

                <h1>{title}</h1>

                <p>{description}</p>

                <button
                    type="button"
                    className="email-verification-primary"
                    onClick={() =>
                        navigate("/register")
                    }
                >
                    Back to Registration
                </button>
            </div>
        </div>
    );
}

export default VerifyEmail;