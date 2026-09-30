import {
    subscribeToNotifications,
    unsubscribeFromNotifications,
} from "../services/notificationService";

const VAPID_PUBLIC_KEY =
    import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat(
        (4 - (base64String.length % 4)) % 4
    );

    const base64 = (
        base64String + padding
    )
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((char) => char.charCodeAt(0))
    );
};

export const isPushNotificationSupported = () => {
    return (
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
};

export const enablePushNotifications = async () => {
    if (!isPushNotificationSupported()) {
        throw new Error(
            "Push notifications are not supported by this browser."
        );
    }

    if (!VAPID_PUBLIC_KEY) {
        throw new Error(
            "VAPID public key is not configured."
        );
    }

    const permission =
        await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error(
            "Notification permission was not granted."
        );
    }

    const registration =
        await navigator.serviceWorker.ready;

    let subscription =
        await registration.pushManager.getSubscription();

    if (!subscription) {
        subscription =
            await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey:
                    urlBase64ToUint8Array(
                        VAPID_PUBLIC_KEY
                    ),
            });
    }

    await subscribeToNotifications(subscription);

    return subscription;
};

export const disablePushNotifications = async () => {
    if (!isPushNotificationSupported()) {
        return;
    }

    const registration =
        await navigator.serviceWorker.ready;

    const subscription =
        await registration.pushManager.getSubscription();

    if (!subscription) {
        return;
    }

    await unsubscribeFromNotifications(subscription);

    await subscription.unsubscribe();
};