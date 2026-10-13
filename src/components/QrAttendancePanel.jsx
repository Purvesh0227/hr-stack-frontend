import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import {
    createQrSession,
    getQrSessionStatus,
    revokeQrSession
} from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { formatDateTime } from "../utils/dateUtils";

import "../styles/QrAttendance.css";

const POLL_INTERVAL_MS = 10000;

const formatClock = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
    )}`;
};

function QrAttendancePanel({ department }) {
    const { showNotification } = useNotification();

    // { sessionId, token, department, createdOn, expiresOn }
    const [session, setSession] = useState(null);

    // serverNow - Date.now(): countdown follows server clock, not phone/PC clock
    const [clockOffset, setClockOffset] = useState(0);
    const [remaining, setRemaining] = useState(0);

    const [scanCount, setScanCount] = useState(0);
    const [serverState, setServerState] = useState("ACTIVE"); // ACTIVE | EXPIRED | REVOKED
    const [busy, setBusy] = useState(false);

    const isActive =
        session !== null && serverState === "ACTIVE" && remaining > 0;

    /* =========================================
       COUNTDOWN
       ========================================= */

    useEffect(() => {
        if (!session) {
            setRemaining(0);
            return;
        }

        const tick = () => {
            const msLeft = session.expiresOn - (Date.now() + clockOffset);
            setRemaining(Math.max(0, Math.floor(msLeft / 1000)));
        };

        tick();

        const timer = setInterval(tick, 1000);

        return () => clearInterval(timer);
    }, [session, clockOffset]);

    /* =========================================
       POLLING
       ========================================= */
    useEffect(() => {
        if (!session || serverState !== "ACTIVE") {
            return;
        }

        const controller = new AbortController();

        const poll = async () => {
            try {
                const { data } = await getQrSessionStatus(
                    session.sessionId,
                    controller.signal
                );

                setScanCount(data.scanCount);
                setServerState(data.status);
            } catch {
                
            }
        };

        const timer = setInterval(poll, POLL_INTERVAL_MS);

        return () => {
            clearInterval(timer);
            controller.abort();
        };
    }, [session, serverState]);

    /* =========================================
       ACTIONS
       ========================================= */

    const handleGenerate = async () => {
        if (busy) return;

        try {
            setBusy(true);

            const { data } = await createQrSession(department);

            setSession(data);
            setClockOffset(data.serverNow - Date.now());
            setScanCount(0);
            setServerState("ACTIVE");

            showNotification("QR code generated.", "success");
        } catch (error) {
            showNotification(
                error.response?.data?.error ||
                    "Failed to generate QR code.",
                "error"
            );
        } finally {
            setBusy(false);
        }
    };

    const handleRevoke = async () => {
        if (busy || !session) return;

        try {
            setBusy(true);

            await revokeQrSession(session.sessionId);

            setServerState("REVOKED");

            showNotification("QR code revoked.", "success");
        } catch (error) {
            showNotification(
                error.response?.data?.error || "Failed to revoke QR code.",
                "error"
            );
        } finally {
            setBusy(false);
        }
    };


    const scanUrl = useMemo(() => {
        if (!session) return "";

        return (
            `${window.location.origin}${import.meta.env.BASE_URL}` +
            `attendance/scan#t=${session.token}`
        );
    }, [session]);



    if (!session) {
        return (
            <div className="qr-panel">
                <p className="qr-hint">
                    Creates a QR code valid for 5 minutes. Employees scan it
                    with their phone camera, sign in if needed, and confirm.
                </p>

                <button
                    className="attendance-generate-btn"
                    onClick={handleGenerate}
                    disabled={busy}
                >
                    {busy ? "Generating..." : "Generate QR Code"}
                </button>
            </div>
        );
    }

    return (
        <div className="qr-panel">
            {isActive ? (
                <div className="qr-box">
                    <div className="qr-tile">
                        <QRCodeSVG
                            value={scanUrl}
                            size={232}
                            level="M"
                            marginSize={2}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            title="Attendance QR code"
                        />
                    </div>

                    <div className="qr-countdown-label">QR expires in</div>

                    <div
                        className={`qr-countdown ${
                            remaining <= 30 ? "qr-countdown-low" : ""
                        }`}
                    >
                        {formatClock(remaining)}
                    </div>

                    <div className="qr-meta-row">
                        <div>
                            <span>Valid Till</span>
                            <strong>{formatDateTime(session.expiresOn)}</strong>
                        </div>

                        <div>
                            <span>Scanned</span>
                            <strong>{scanCount}</strong>
                        </div>
                    </div>

                    <button
                        className="qr-revoke-btn"
                        onClick={handleRevoke}
                        disabled={busy}
                    >
                        {busy ? "Revoking..." : "Revoke QR"}
                    </button>
                </div>
            ) : (
                <div className="qr-box qr-box-ended">
                    <div className="qr-ended-title">
                        {serverState === "REVOKED"
                            ? "QR Revoked"
                            : "QR Expired"}
                    </div>

                    <p className="qr-hint">
                        {scanCount} scanned for {session.department}.
                        Generate a new QR code to continue.
                    </p>

                    <button
                        className="attendance-generate-btn"
                        onClick={handleGenerate}
                        disabled={busy}
                    >
                        {busy ? "Generating..." : "Generate New QR Code"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default QrAttendancePanel;