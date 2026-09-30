import { createContext, useCallback, useContext, useEffect, useState } from "react";
import API from "../services/api";

const NotificationCenterContext = createContext(null);

export function NotificationCenterProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const employee = localStorage.getItem("employee");

    const fetchNotifications = useCallback(async () => {
        if (!employee) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
            setLoading(true);

            const response = await API.get("/notifications");

            setNotifications(response.data || []);
        } catch (error) {
            console.error(
                "Unable to fetch notifications:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, [employee]);

    const fetchUnreadCount = useCallback(async () => {
        if (!employee) {
            setUnreadCount(0);
            return;
        }

        try {
            const response =
                await API.get("/notifications/unread-count");

            setUnreadCount(response.data || 0);
        } catch (error) {
            console.error(
                "Unable to fetch unread notification count:",
                error
            );
        }
    }, [employee]);

    const refreshNotifications = useCallback(async () => {
        await Promise.all([
            fetchNotifications(),
            fetchUnreadCount()
        ]);
    }, [fetchNotifications, fetchUnreadCount]);

    const markAsRead = async (notificationId) => {
        try {
            await API.patch(
                `/notifications/${notificationId}/read`
            );

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? {
                              ...notification,
                              read: true
                          }
                        : notification
                )
            );

            setUnreadCount((current) =>
                Math.max(current - 1, 0)
            );
        } catch (error) {
            console.error(
                "Unable to mark notification as read:",
                error
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.patch(
                "/notifications/read-all"
            );

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    read: true
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Unable to mark all notifications as read:",
                error
            );
        }
    };

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    return (
        <NotificationCenterContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                refreshNotifications,
                markAsRead,
                markAllAsRead
            }}
        >
            {children}
        </NotificationCenterContext.Provider>
    );
}

export function useNotificationCenter() {
    const context = useContext(
        NotificationCenterContext
    );

    if (!context) {
        throw new Error(
            "useNotificationCenter must be used inside NotificationCenterProvider"
        );
    }

    return context;
}