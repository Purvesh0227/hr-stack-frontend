import { useEffect } from "react";
import "../styles/Notification.css";

function Notification({ message, type = "success", onClose }) {

    // Auto-hide after 4 seconds
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) {
        return null;
    }

    return (
        <div
            className={`notification notification-${type}`}
            role="alert"
        >
            <span>{message}</span>

            <button
                type="button"
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}

export default Notification;