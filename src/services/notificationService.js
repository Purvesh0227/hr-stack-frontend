import API from "./api";

export const getNotifications = async (status = "UNREAD") => {
    const response = await API.get("/notifications", {
        params: {
            status
        }
    });

    return response.data;
};

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

export const markNotificationAsRead = async (notificationId) => {
    await API.patch(
        `/notifications/${notificationId}/read`
    );
};

export const markAllNotificationsAsRead = async () => {
    await API.patch(
        "/notifications/read-all"
    );
};