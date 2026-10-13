import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { markQrAttendance } from "../services/api";
import { readStorageJson } from "../utils/storage";
import { formatDateTime } from "../utils/dateUtils";
import {
    savePostLoginPath,
    clearPostLoginPath
} from "../utils/postLoginRedirect";

import "../styles/QrAttendance.css";

// Token is 43 chars (32 bytes base64url). Allow some slack.
const TOKEN_PATTERN = /^#t=([A-Za-z0-9_-]{20,100})$/;

const readTokenFromHash = () => {
    const match = TOKEN_PATTERN.exec(window.location.hash);
    return match ? match[1] : null;
};

// Fallback text by backend error code
const MESSAGES = {
    QR_INVALID: "This QR code is not valid. Scan the QR code shown by your admin.",
    QR_EXPIRED: "This QR code has expired. Ask your admin for a new one.",
    QR_REVOKED: "This QR code is no longer active. Ask your admin for a new one.",
    ALREADY_MARKED: "Your attendance is already marked for today.",
    NOT_ELIGIBLE: "Your account is not eligible to mark attendance."
};


function QrScanPage() {
    const navigate = useNavigate();
    const employee = readStorageJson("employee");

    // Read once. Hash is wiped from the address bar below.
    const [token] = useState(readTokenFromHash);

    // idle | submitting | success | error
    const [phase, setPhase] = useState(token ? "idle" : "error");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(
        token ? null : { code: "QR_INVALID", message: MESSAGES.QR_INVALID }
    );

    useEffect(() => {
        if (!token) return;

        // If the API answers 401 (session expired), api.js sends the user to
        // login. Keep the link so login can bring them back.
        savePostLoginPath(`/attendance/scan#t=${token}`);

        // Remove token from address bar / history. Keep router's history state.
        window.history.replaceState(
            window.history.state,
            "",
            window.location.pathname + window.location.search
        );
    }, [token]);

    const handleConfirm = async () => {
        if (phase === "submitting" || !token) return;

        setPhase("submitting");

        try {
            const { data } = await markQrAttendance(token);

            clearPostLoginPath();
            setResult(data);
            setPhase("success");
        } catch (err) {
            // 401: api.js already clears session and redirects to login
            if (err.response?.status === 401) return;

            // No response = network problem. Token still good: allow retry.
            if (!err.response) {
                setError({
                    code: "NETWORK",
                    message: "Network error. Check your connection and try again."
                });
                setPhase("idle");
                return;
            }

            clearPostLoginPath();

            const code = err.response.data?.code;

            setError({
                code,
                message:
                    err.response.data?.error ||
                    MESSAGES[code] ||
                    "Unable to mark attendance."
            });
            setPhase("error");
        }
    };

    const goToAttendance = () => navigate("/attendance", { replace: true });

    const fullName =
        [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
        "your account";

    return (
        <div className="qr-scan-page">
            <div className="qr-scan-card">
                <h1 className="qr-scan-title">Mark Attendance</h1>

                {phase === "success" && (
                    <>
                        <div className="qr-scan-icon qr-scan-icon-ok" aria-hidden="true">
                            ✓
                        </div>

                        <p className="qr-scan-lead" role="status">
                            Attendance marked
                        </p>

                        <p className="qr-scan-sub">
                            {fullName} · {formatDateTime(result?.markedOn)}
                        </p>

                        <button
                            className="attendance-generate-btn"
                            onClick={goToAttendance}
                        >
                            View Attendance
                        </button>
                    </>
                )}

                {phase === "error" && (
                    <>
                        <div className="qr-scan-icon qr-scan-icon-bad" aria-hidden="true">
                            !
                        </div>

                        <p className="qr-scan-lead" role="alert">
                            Could not mark attendance
                        </p>

                        <p className="qr-scan-sub">{error?.message}</p>

                        <button
                            className="attendance-generate-btn"
                            onClick={goToAttendance}
                        >
                            Go to Attendance
                        </button>
                    </>
                )}

                {(phase === "idle" || phase === "submitting") && (
                    <>
                        <p className="qr-scan-sub">
                            Marking attendance for {fullName} today.
                        </p>

                        {error?.code === "NETWORK" && (
                            <p className="qr-scan-warn" role="alert">
                                {error.message}
                            </p>
                        )}

                        <button
                            className="attendance-generate-btn"
                            onClick={handleConfirm}
                            disabled={phase === "submitting"}
                        >
                            {phase === "submitting"
                                ? "Marking..."
                                : "Confirm Attendance"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default QrScanPage;