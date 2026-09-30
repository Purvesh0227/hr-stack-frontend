import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../services/notificationService";

const NotificationCenterContext = createContext(null);

export function NotificationCenterProvider({ children }) {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [notificationStatus, setNotificationStatus] =
        useState("UNREAD");

    const employee = localStorage.getItem("employee");

    const fetchNotifications = useCallback(async () => {

        if (!employee) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
            setLoading(true);

            const data =
                await getNotifications(notificationStatus);

            setNotifications(
                data.notifications || []
            );

            setUnreadCount(
                data.unreadCount || 0
            );

        } catch (error) {

            console.error(
                "Unable to fetch notifications:",
                error
            );

        } finally {
            setLoading(false);
        }

    }, [employee, notificationStatus]);

    const refreshNotifications = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    const changeNotificationStatus = useCallback(
        (status) => {
            setNotificationStatus(status);
        },
        []
    );

    const markAsRead = async (notificationId) => {

        try {

            await markNotificationAsRead(
                notificationId
            );

            /*
             * Re-fetch from backend so the currently
             * selected filter stays correct.
             */
            await fetchNotifications();

        } catch (error) {

            console.error(
                "Unable to mark notification as read:",
                error
            );

        }
    };

    const markAllAsRead = async () => {

        try {

            await markAllNotificationsAsRead();

            /*
             * Re-fetch from backend instead of
             * filtering notifications locally.
             */
            await fetchNotifications();

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

                notificationStatus,
                changeNotificationStatus,

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