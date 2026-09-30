import { useEffect, useState } from "react";
import {
    FiBell,
    FiBellOff,
    FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";

import {
    enablePushNotifications,
    disablePushNotifications,
    isPushNotificationSupported
} from "../../utils/pushNotifications";

import "../../styles/NotificationSettings.css";

function NotificationSettings() {

    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {

        const checkSubscription = async () => {

            if (!isPushNotificationSupported()) {
                return;
            }

            try {
                const registration =
                    await navigator.serviceWorker.ready;

                const subscription =
                    await registration.pushManager
                        .getSubscription();

                setEnabled(Boolean(subscription));

            } catch (error) {
                console.error(
                    "Unable to check notification subscription:",
                    error
                );
            }
        };

        checkSubscription();

    }, []);

    const handleEnable = async () => {

        setLoading(true);
        setMessage("");
        setError("");

        try {

            await enablePushNotifications();

            setEnabled(true);

            setMessage(
                "Notifications enabled successfully."
            );

        } catch (error) {

            console.error(
                "Notification subscription failed:",
                error
            );

            setError(
                error.message ||
                "Unable to enable notifications."
            );

        } finally {

            setLoading(false);
        }
    };

    const handleDisable = async () => {

        setLoading(true);
        setMessage("");
        setError("");

        try {

            await disablePushNotifications();

            setEnabled(false);

            setMessage(
                "Notifications disabled successfully."
            );

        } catch (error) {

            console.error(
                "Notification unsubscribe failed:",
                error
            );

            setError(
                error.message ||
                "Unable to disable notifications."
            );

        } finally {

            setLoading(false);
        }
    };

    if (!isPushNotificationSupported()) {
        return (
            <div className="notification-settings">
                <div className="notification-settings-icon">
                    <FiAlertCircle />
                </div>

                <div>
                    <h3>Notifications</h3>
                    <p>
                        Push notifications are not supported
                        by this browser.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-settings">

            <div className="notification-settings-header">

                <div className="notification-settings-icon">
                    <FiBell />
                </div>

                <div>
                    <h3>Notifications</h3>

                    <p>
                        Receive important HR-Stack
                        notifications on this device.
                    </p>
                </div>

            </div>

            <div className="notification-settings-status">

                <div className="notification-status-text">

                    {enabled ? (
                        <>
                            <FiCheckCircle />
                            <span>
                                Notifications are enabled
                            </span>
                        </>
                    ) : (
                        <>
                            <FiBellOff />
                            <span>
                                Notifications are disabled
                            </span>
                        </>
                    )}

                </div>

                {enabled ? (
                    <button
                        type="button"
                        onClick={handleDisable}
                        disabled={loading}
                    >
                        {loading
                            ? "Disabling..."
                            : "Disable"}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleEnable}
                        disabled={loading}
                    >
                        {loading
                            ? "Enabling..."
                            : "Enable Notifications"}
                    </button>
                )}

            </div>

            {message && (
                <p className="notification-success">
                    {message}
                </p>
            )}

            {error && (
                <p className="notification-error">
                    {error}
                </p>
            )}

        </div>
    );
}

export default NotificationSettings;