import { useState, useEffect } from "react";
import { FiWifiOff } from "react-icons/fi";

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "#dc2626", // Red color
            color: "white",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "600",
            zIndex: 9999,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
        }}>
            <FiWifiOff size={16} />
            You are offline. Showing cached data.
        </div>
    );
}