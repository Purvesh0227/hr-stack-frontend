import API from "./api";

export const subscribeToNotifications = async (subscription) => {
    const json = subscription.toJSON();

    await API.post("/notifications/subscribe", {
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
    });
};

export const unsubscribeFromNotifications = async (subscription) => {
    const json = subscription.toJSON();

    await API.delete("/notifications/unsubscribe", {
        data: {
            endpoint: json.endpoint,
        },
    });
};