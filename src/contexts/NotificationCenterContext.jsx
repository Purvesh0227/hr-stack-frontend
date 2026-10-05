import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../services/notificationService";
import { readStorageJson } from "../utils/storage";

const NotificationCenterContext = createContext(null);

// After a failed fetch, wait before trying again
const FAILURE_COOLDOWN_MS = 10_000;

export function NotificationCenterProvider({ children }) {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [notificationStatus, setNotificationStatus] = useState("UNREAD");

    // Boolean = stable value. Object from readStorageJson = new every render (caused the loop)
    const isLoggedIn = Boolean(
        readStorageJson("employee") && localStorage.getItem("token")
    );

    const statusRef = useRef(notificationStatus);
    const failedAt = useRef(0);
    const latestRequest = useRef(0);

    useEffect(() => {
        statusRef.current = notificationStatus;
    }, [notificationStatus]);

    const fetchNotifications = useCallback(async (force = false) => {

        if (!isLoggedIn) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // recent failure -> do not retry (safety net against request storms)
        if (!force && Date.now() - failedAt.current < FAILURE_COOLDOWN_MS) {
            return;
        }

        const requestId = ++latestRequest.current;

        try {
            setLoading(true);

            const data = await getNotifications(statusRef.current);

            // ignore an old response that finished after a newer request
            if (requestId !== latestRequest.current) return;

            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);

        } catch (error) {
            failedAt.current = Date.now();
        } finally {
            if (requestId === latestRequest.current) {
                setLoading(false);
            }
        }

    }, [isLoggedIn]);

    const refreshNotifications = useCallback(
        () => fetchNotifications(true),
        [fetchNotifications]
    );

    const changeNotificationStatus = useCallback((status) => {
        setNotificationStatus(status);
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            await fetchNotifications(true);
        } catch (error) {
            // keep current list
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            await fetchNotifications(true);
        } catch (error) {
            // keep current list
        }
    };

    // Runs on login/logout and when the filter (UNREAD / READ / ALL) changes
    useEffect(() => {
        fetchNotifications(true);
    }, [fetchNotifications, notificationStatus]);

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

    const context = useContext(NotificationCenterContext);

    if (!context) {
        throw new Error(
            "useNotificationCenter must be used inside NotificationCenterProvider"
        );
    }

    return context;
}