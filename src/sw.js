import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { clientsClaim } from "workbox-core";
import { NetworkFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    new NavigationRoute(
        createHandlerBoundToURL("/hr-stack-frontend/index.html")
    )
);


//    API CACHING (Offline Mode)


const isApiMatch = (url, path, pageZeroOnly = false) => {
    const hasPath = url.href.includes(path);
    if (!hasPath) return false;
    if (pageZeroOnly) return url.href.includes("page=0");
    return true;
};

// 1. Cache First Page of Employees
registerRoute(
    ({ url }) => isApiMatch(url, "/employee/allEmployees", true),
    new NetworkFirst({
        cacheName: "hrstack-employees",
        plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 86400 })],
    })
);

// 2. Cache First Page of Admins
registerRoute(
    ({ url }) => isApiMatch(url, "/employee/allAdmins", true),
    new NetworkFirst({
        cacheName: "hrstack-admins",
        plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 86400 })],
    })
);

// 3. Cache First Page of Announcements
registerRoute(
    ({ url }) => isApiMatch(url, "/employee/announcements", true),
    new NetworkFirst({
        cacheName: "hrstack-announcements",
        plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 86400 })],
    })
);

// 4. Cache Support Tickets
registerRoute(
    ({ url }) => isApiMatch(url, "/employee/support"),
    new NetworkFirst({
        cacheName: "hrstack-support",
        plugins: [new ExpirationPlugin({ maxEntries: 2, maxAgeSeconds: 86400 })],
    })
);

// 5. Cache Notifications
registerRoute(
    ({ url }) => isApiMatch(url, "/employee/notifications"),
    new NetworkFirst({
        cacheName: "hrstack-notifications",
        plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 86400 })],
    })
);

// 6. Cache App Releases (Public & Admin)
registerRoute(
    ({ url }) => isApiMatch(url, "/employee/app-releases"),
    new NetworkFirst({
        cacheName: "hrstack-app-releases",
        plugins: [new ExpirationPlugin({ maxEntries: 2, maxAgeSeconds: 86400 })],
    })
);

// 7. NEVER Cache Finance/Salary
registerRoute(
    ({ url }) => isApiMatch(url, "/employee/salary"),
    new NetworkOnly()
);


//    PUSH NOTIFICATION


self.addEventListener("push", (event) => {
    if (!event.data) {
        return;
    }

    let data;

    try {
        data = event.data.json();
    } catch {
        data = {
            message: event.data.text(),
        };
    }

    const title = "HR-Stack";

    const options = {
        body:
            data.message ||
            "You have a new notification.",
        icon: "/hr-stack-frontend/icons/icon-192.png",
        badge: "/hr-stack-frontend/icons/icon-192.png",
        data: {
            eventType: data.eventType || "",
            url:
                data.url ||
                "/hr-stack-frontend/",
        },
        tag:
            data.eventType ||
            "hr-stack-notification",
        renotify: true,
    };

    event.waitUntil(
        self.registration.showNotification(
            title,
            options
        )
    );
});


//    NOTIFICATION CLICK

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
                return clients.openWindow(
                    notificationUrl
                );
            }

            return undefined;
        })
    );
});