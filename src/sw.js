import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);


/* =========================================================
   PUSH NOTIFICATION
   ========================================================= */

self.addEventListener("push", (event) => {
    if (!event.data) {
        return;
    }

    let data;

    try {
        data = event.data.json();
    } catch {
        data = {
            title: "HR-Stack",
            body: event.data.text(),
        };
    }

    const title = data.title || "HR-Stack";

    const options = {
        body: data.body || "You have a new notification.",
        icon: "/hr-stack-frontend/icons/icon-192.png",
        badge: "/hr-stack-frontend/icons/icon-192.png",
        data: {
            url: data.url || "/hr-stack-frontend/",
        },
        tag: data.tag || "hr-stack-notification",
        renotify: true,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});


/* =========================================================
   NOTIFICATION CLICK
   ========================================================= */

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const notificationUrl =
        event.notification?.data?.url ||
        "/hr-stack-frontend/";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true,
        }).then((clientList) => {

            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(notificationUrl);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(notificationUrl);
            }

            return undefined;
        })
    );
});