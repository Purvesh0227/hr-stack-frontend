import { useEffect, useRef, useState } from "react";
import { FiBell, FiCheck, FiCheckCircle } from "react-icons/fi";
import { useNotificationCenter } from "../../contexts/NotificationCenterContext";
import "../../styles/NotificationBell.css";

const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const diff = Math.floor((new Date() - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
};

function NotificationBell() {
    const {
        notifications, unreadCount, loading, notificationStatus,
        changeNotificationStatus, markAsRead, markAllAsRead
    } = useNotificationCenter();

    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (n) => {
        if (!n.read) await markAsRead(n.id);
    };

    const handleStatusChange = (status) => {
        if (status !== notificationStatus) changeNotificationStatus(status);
    };

    return (
        <div className="notification-bell-wrapper" ref={wrapperRef}>
            <button
                type="button"
                className="notification-bell-button"
                onClick={() => setOpen((c) => !c)}
                aria-label="Notifications"
                aria-expanded={open}
            >
                <FiBell />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <div>
                            <h3>Notifications</h3>
                            <span>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</span>
                        </div>
                        {unreadCount > 0 && (
                            <button type="button" className="mark-all-button" onClick={markAllAsRead}>
                                <FiCheck /> Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-filter">
                        {["UNREAD", "ALL", "READ"].map((status) => (
                            <button
                                key={status}
                                type="button"
                                className={notificationStatus === status ? "notification-filter-active" : ""}
                                onClick={() => handleStatusChange(status)}
                            >
                                {status === "UNREAD"
                                    ? "Unread"
                                    : status === "READ"
                                        ? "Read"
                                        : "All"}
                            </button>
                        ))}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-empty">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <FiCheckCircle />
                                <strong>No notifications</strong>
                                <span>
                                    {notificationStatus === "UNREAD"
                                        ? "No unread notifications."
                                        : "You're all caught up."}
                                </span>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    type="button"
                                    key={n.id}
                                    className={`notification-item ${n.read ? "notification-read" : "notification-unread"}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <span className="notification-item-icon"><FiBell /></span>
                                    <span className="notification-item-content">
                                        <span className="notification-item-top">
                                            <strong>{n.eventType}</strong>
                                            <small>{formatNotificationTime(n.createdOn)}</small>
                                        </span>
                                        <span className="notification-item-message">{n.message}</span>
                                        {!n.read && (
                                            <span className="notification-unread-label">
                                                <FiCheck /> Click to mark as read
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;