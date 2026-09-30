import { useEffect, useRef, useState } from "react";
import {
    FiBell,
    FiCheck,
    FiCheckCircle
} from "react-icons/fi";

import {
    useNotificationCenter
} from "../../contexts/NotificationCenterContext";

import "../../styles/NotificationBell.css";

const formatNotificationTime = (timestamp) => {
    if (!timestamp) {
        return "";
    }

    const date = new Date(timestamp);
    const now = new Date();

    const difference =
        Math.floor((now - date) / 1000);

    if (difference < 60) {
        return "Just now";
    }

    if (difference < 3600) {
        return `${Math.floor(difference / 60)} min ago`;
    }

    if (difference < 86400) {
        return `${Math.floor(difference / 3600)} hr ago`;
    }

    if (difference < 604800) {
        return `${Math.floor(difference / 86400)} days ago`;
    }

    return date.toLocaleDateString();
};

function NotificationBell() {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead
    } = useNotificationCenter();

    const [open, setOpen] = useState(false);

    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleNotificationClick = async (
        notification
    ) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
    };

    return (
        <div
            className="notification-bell-wrapper"
            ref={wrapperRef}
        >
            <button
                type="button"
                className="notification-bell-button"
                onClick={() => setOpen((current) => !current)}
                aria-label="Notifications"
                aria-expanded={open}
            >
                <FiBell />

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <div>
                            <h3>Notifications</h3>

                            <span>
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : "All caught up"}
                            </span>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="mark-all-button"
                                onClick={markAllAsRead}
                            >
                                <FiCheck />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-empty">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <FiCheckCircle />

                                <strong>
                                    No notifications
                                </strong>

                                <span>
                                    You're all caught up.
                                </span>
                            </div>
                        ) : (
                            notifications.map(
                                (notification) => (
                                    <button
                                        type="button"
                                        key={notification.id}
                                        className={`notification-item ${
                                            notification.read
                                                ? "notification-read"
                                                : "notification-unread"
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                    >
                                        <span className="notification-item-icon">
                                            <FiBell />
                                        </span>

                                        <span className="notification-item-content">
                                            <span className="notification-item-top">
                                                <strong>
                                                    {notification.eventType}
                                                </strong>

                                                <small>
                                                    {formatNotificationTime(
                                                        notification.createdOn
                                                    )}
                                                </small>
                                            </span>

                                            <span className="notification-item-message">
                                                {
                                                    notification.message
                                                }
                                            </span>

                                            {!notification.read && (
                                                <span className="notification-unread-label">
                                                    <FiCheck />
                                                    Click to mark as read
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                )
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;