import "../styles/Notification.css";

function Notification({ message, type = "success", onClose }) {
    if (!message) {
        return null;
    }

    return (
        <div className={`notification notification-${type}`}>
            <span>{message}</span>

            <button
                type="button"
                onClick={onClose}
            >
                ×
            </button>
        </div>
    );
}

export default Notification;